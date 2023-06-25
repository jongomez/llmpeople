import { ChatMessage } from "@my/ui/types/Chat";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

export type OpenAIStreamPayload = {
  model: string;
  messages: ChatMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
};

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}

//
////
////// For testing purposes.

export function recursiveStreamEnqueue(
  controller: ReadableStreamDefaultController<any>,
  messageTokens: string[],
  index: number,
  timeBetweenTokens = 100
) {
  if (index >= messageTokens.length) {
    controller.close();
    return;
  }

  setTimeout(function () {
    console.log(messageTokens[index]);
    var enc = new TextEncoder();
    controller.enqueue(enc.encode(messageTokens[index] + " "));
    recursiveStreamEnqueue(controller, messageTokens, ++index);
  }, timeBetweenTokens);
}

export function streamMock(messageTokens: string[]): ReadableStream {
  return new ReadableStream({
    start(controller) {
      recursiveStreamEnqueue(controller, messageTokens, 0);
    },
  });
}

export async function synthesizeSpeech(text: string): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY not found in the environment");
  }

  if (typeof text !== "string") {
    throw new Error(`Invalid input type: ${typeof text}. Type has to be text or SSML.`);
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const apiURL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const requestBody = {
    input: {
      text,
    },
    voice: { languageCode: "en-US", name: "en-US-Neural2-H" },
    audioConfig: {
      audioEncoding: "MP3",
    },
  };

  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Google Cloud TTS API Error: ${errorData.error.message}`);
  }

  const responseData = await response.json();
  const audioContent = responseData.audioContent;

  return audioContent;
}

export type OpenAIPayload = {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  n: number;
};

export type OpenAIResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
};

export const OpenAI = async (payload: OpenAIPayload): Promise<OpenAIResponse> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API Error: ${errorData.error.message}`);
  }

  return await response.json();
};
