import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import type { NextApiRequest, NextApiResponse } from "next";

const MAX_REQUEST_BODY_LENGTH = 1000;

interface TextToSpeechResponse {
  audioContent: string;
}

export async function textToSpeech(message: string): Promise<TextToSpeechResponse> {
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("GOOGLE_PRIVATE_KEY not found in the environment");
  }

  const client = new TextToSpeechClient({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
  });

  const request = {
    input: { text: message },
    voice: { languageCode: "en-US", name: "en-US-Neural2-H" },
    audioConfig: { audioEncoding: "MP3" },
  } as const;

  const [response] = await client.synthesizeSpeech(request);

  if (!response.audioContent) {
    throw new Error("Audio content not found in the response");
  }

  const audioContent = Buffer.from(response.audioContent).toString("base64");

  return {
    audioContent: audioContent,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const { message } = req.body;

  if (message.length > MAX_REQUEST_BODY_LENGTH) {
    console.error(`Request body exceeds ${MAX_REQUEST_BODY_LENGTH} characters.`);
    res.status(400).send(`Request body exceeds ${MAX_REQUEST_BODY_LENGTH} characters.`);
  }

  try {
    const response = await textToSpeech(message);
    const audioContent = response.audioContent;

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "attachment; filename=hello-world.mp3");
    res.status(200).send(Buffer.from(audioContent, "base64"));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
}
