import { APIRequestBodyType } from "@/pages/api/chat";

// OpenAI text to speech API:
// https://platform.openai.com/docs/api-reference/audio/createSpeech
export async function synthesizeSpeechOpenAi(text: string, voice: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not found in the environment");
  }

  if (typeof text !== "string") {
    throw new Error(`Invalid input type: ${typeof text}. Type has to be 'string'.`);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const apiURL = `https://api.openai.com/v1/audio/speech`;

  // gpt-4o-mini-tts is OpenAI's newest TTS model and the only one that supports
  // the recommended `marin` and `cedar` voices. Output defaults to MP3.
  const requestBody = {
    model: "gpt-4o-mini-tts",
    input: text,
    voice: voice,
  };

  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI TTS API Error: ${errorData.error.message}`);
  }

  // const blob = await response.blob();
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert to base64:
  let binary = "";
  for (let byte of uint8Array) {
    binary += String.fromCharCode(byte);
  }
  // NextJS edge runtime does not support Buffer - so, btoa it is.
  const base64Audio = btoa(binary);

  return base64Audio;
}

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

type ValidationResult = { valid: boolean; error: string | null };

export const validateRequest = (parsedBody: APIRequestBodyType): ValidationResult => {
  if (!parsedBody.messages || !parsedBody.messages.length) {
    return {
      valid: false,
      error: "No messages found in the request.",
    };
  }

  if (!parsedBody.voice) {
    return {
      valid: false,
      error: "No voice specified in the request.",
    };
  }

  if (!parsedBody.prompt) {
    return {
      valid: false,
      error: "No prompt specified in the request.",
    };
  }

  return { valid: true, error: null };
};
