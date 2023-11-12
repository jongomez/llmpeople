import {
  OpenAI,
  OpenAIPayload,
  synthesizeSpeechGoogle,
  synthesizeSpeechOpenAi,
  validateRequest,
} from "@/lib/backendUtils";
import { dummyBotAudio, dummyBotMessages } from "@/lib/dummyResponses";
import { ChatMessage } from "@/lib/types";
import { isGoogleVoice } from "@/lib/voices";

const MAX_REQUEST_BODY_LENGTH = 1200;

export type APIRequestBodyType = {
  messages: ChatMessage[];
  prompt: string;
  voice: string;
};

const USE_DUMMY_MESSAGES = false;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const devMode = process.env.NODE_ENV === "development";
  const requestBody = await req.text();

  if (requestBody.length > MAX_REQUEST_BODY_LENGTH) {
    console.error(`Request body exceeds ${MAX_REQUEST_BODY_LENGTH} characters.`);
    return new Response(
      JSON.stringify({ error: `Request body exceeds ${MAX_REQUEST_BODY_LENGTH} characters.` }),
      { status: 400 }
    );
  }

  const parsedBody: APIRequestBodyType = JSON.parse(requestBody);

  const validationResult = validateRequest(parsedBody);
  if (!validationResult.valid) {
    console.error(validationResult.error);
    return new Response(JSON.stringify({ error: validationResult.error }), { status: 400 });
  }

  const { messages, prompt, voice } = parsedBody;

  const initialBotMessage: ChatMessage = {
    role: "assistant",
    content: prompt,
  };

  // Prepend the initial bot message containing the prompt.
  messages.unshift(initialBotMessage);

  if (devMode) {
    console.log("Voice:", voice);
    console.log("Prompt:", prompt);
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
    await delay(2000);
    const dummyResponse = { text: dummyBotMessages[0], audio: dummyBotAudio[0] };
    return new Response(JSON.stringify(dummyResponse));
  }

  let aiResponse = "";
  let audioContent: string | Blob = "";

  try {
    if (devMode) console.log("Sending payload to OpenAI.");
    const response = await OpenAI(payload);
    aiResponse = response.choices[0]?.message.content;
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error processing OpenAI response." }), {
      status: 500,
    });
  }

  if (devMode) console.log("Received response from OpenAi:", aiResponse);

  try {
    if (devMode) console.log("Converting aiResponse to audio.");
    if (isGoogleVoice(voice)) {
      audioContent = await synthesizeSpeechGoogle(aiResponse, voice);
    } else {
      audioContent = await synthesizeSpeechOpenAi(aiResponse, voice);
    }
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
