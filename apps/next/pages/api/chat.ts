import { ChatMessage } from "@my/ui/types/Chat";
import { OpenAIStream, OpenAIStreamPayload } from "lib/backendUtils";

const MAX_REQUEST_BODY_LENGTH = 1200;
const MAX_WORD_SUGGESTION = 80;
const prompt = `. Answer as a fun, upbeat female character. Responses have to be short. The maxiumum response length is ${MAX_WORD_SUGGESTION} words.`;

// Pretty much a copy paste of: https://github.com/Nutlope/twitterbio/

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

// For debugging purposes.
let dummyReturnMessage: any = null;

/*

dummyReturnMessage = {
  role: 'assistant',
  content: '!\n' +
    '\n' +
    "As an AI language model, I don't have the physical appearance, existence of feelings or emotions. However, I'm happy to assist you with anything related to text generation, translation, summarization, and more. How can I assist you today?"
}

dummyReturnMessage = {
  role: "assistant",
  content:
    "Sure, here are three possible reasons why people may bite their own tongue:\n" +
    "\n" +
    "1. Accidental biting: People may accidentally bite their own tongue while eating or while talking, especially if they speak with their mouth full or when their mouth is dry.\n" +
    "\n" +
    "2. Stress and anxiety: Some people may bite their tongue unconsciously when they are feeling stressed or anxious. This may be due to nervousness or tension that can manifest itself in different physical ways.\n" +
    "\n" +
    "3. Sleep disorders: Some sleep disorders such as sleep apnea or bruxism (setting teeth) can cause people to bite their own tongue during sleep. If someone bites their tongue frequently during sleep, it may be best to see a doctor or a sleep specialist for further evaluation.",
};

*/

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

  if (dummyReturnMessage) {
    return new Response(JSON.stringify(dummyReturnMessage));
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
