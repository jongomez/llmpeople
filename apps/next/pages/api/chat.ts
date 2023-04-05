import { ChatMessage } from "@my/ui/types/Chat";
import { OpenAIStream, OpenAIStreamPayload, streamMock } from "lib/backendUtils";
import { dummyBotMessages } from "lib/dummyResponses";

const MAX_REQUEST_BODY_LENGTH = 1200;
const MAX_WORD_SUGGESTION = 80;
const prompt = `. Answer as a fun, upbeat female character. Responses have to be short. The maxiumum response length is ${MAX_WORD_SUGGESTION} words.`;

// Pretty much a copy paste of: https://github.com/Nutlope/twitterbio/

const USE_DUMMY_MESSAGES = false;

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const requestBody = await req.text();

  if (requestBody.length > MAX_REQUEST_BODY_LENGTH) {
    console.error(`Request body exceeds ${MAX_REQUEST_BODY_LENGTH} characters.`);
    return new Response(
      JSON.stringify({ error: `Request body exceeds ${MAX_REQUEST_BODY_LENGTH} characters.` }),
      { status: 400 }
    );
  }

  const messages = JSON.parse(requestBody) as ChatMessage[];

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages found in the request." }), {
      status: 400,
    });
  }

  // Append the prompt to the last message.
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role === "user") {
    lastMessage.content += prompt;
  }

  console.log("Input messages (with promp attached):", messages);

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  if (USE_DUMMY_MESSAGES) {
    const STREAM = true;
    const message = dummyBotMessages[1];

    if (STREAM) {
      const readable = streamMock(message.split(" "));

      return new Response(readable);
    } else {
      return new Response(message);
    }
  }

  try {
    const stream = await OpenAIStream(payload);

    return new Response(stream);
  } catch (e) {
    return new Response(JSON.stringify({ error: "Error streaming OpenAI response." }), {
      status: 500,
    });
  }
};

export default handler;
