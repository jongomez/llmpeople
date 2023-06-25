import { ChatMessage } from "@my/ui/types/Chat";
import { OpenAI, OpenAIPayload, synthesizeSpeech } from "lib/backendUtils";
import { dummyBotMessages } from "lib/dummyResponses";

const MAX_REQUEST_BODY_LENGTH = 1200;
const MAX_WORD_SUGGESTION = 60;
const prompt = `Prompt - You are an AI language model, and you will be chatting as a fun, upbeat, and friendly female character. Make sure not to mention your role as an AI or the character you are portraying. Keep your responses concise, no longer than ${MAX_WORD_SUGGESTION} words per response. Engage in a lively and positive conversation with the user.`;

const initialBotMessage: ChatMessage = {
  role: "assistant",
  content: prompt,
};

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
    const errorMessage = "No messages found in the request.";
    console.error(errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
    });
  }

  // Prepend the initial bot message containing the prompt.
  messages.unshift(initialBotMessage);

  if (process.env.NODE_ENV === "development") {
    console.log("Input messages (with initial bot message):", messages);
  }

  const payload: OpenAIPayload = {
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    n: 1,
  };

  if (USE_DUMMY_MESSAGES) {
    const message = dummyBotMessages[0];
    return new Response(message);
  }

  let aiResponse = "";
  let audioContent = "";

  try {
    const response = await OpenAI(payload);
    aiResponse = response.choices[0]?.message.content;
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error processing OpenAI response." }), {
      status: 500,
    });
  }

  try {
    // Convert aiResponse to audio
    audioContent = await synthesizeSpeech(aiResponse);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error fetching audio :(" }), {
      status: 500,
    });
  }

  // Create a JSON response containing both text and audio
  const jsonResponse = {
    text: aiResponse,
    audio: audioContent,
  };

  // Create a new Response object with the JSON response and appropriate headers
  return new Response(JSON.stringify(jsonResponse), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export default handler;
