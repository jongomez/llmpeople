import type { ChatGPTMessage } from "@my/ui/src/Chat";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

/*

export const cleanOpenAIMessage = (message?: string): string => {
  if (!message) {
    return "";
  }

  console.log("Cleaning message:", message);

  // Removes newlines from the start and ending of the string.
  const trimmedMessage = message.trim();

  // Removes ponctuation from the start of the string.
  const messageWithoutPonctuation = trimmedMessage.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()]/, "");

  // Removes newlines from the start and ending of the string. Again.
  const secondTrimmedMessage = messageWithoutPonctuation.trim();

  console.log("Cleaned message:", secondTrimmedMessage);

  return secondTrimmedMessage;
};

*/

export type OpenAIStreamPayload = {
  model: string;
  messages: ChatGPTMessage[];
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
