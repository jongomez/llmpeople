import { Voice } from "./types";

export const voices = {
  "en-US-Neural2-A": { gender: "MALE", provider: "Google Cloud" },
  "en-US-Neural2-C": { gender: "FEMALE", provider: "Google Cloud" },
  "en-US-Neural2-D": { gender: "MALE", provider: "Google Cloud" },
  "en-US-Neural2-E": { gender: "FEMALE", provider: "Google Cloud" },
  "en-US-Neural2-F": { gender: "FEMALE", provider: "Google Cloud" },
  "en-US-Neural2-G": { gender: "FEMALE", provider: "Google Cloud" },
  "en-US-Neural2-H": { gender: "FEMALE", provider: "Google Cloud" },
  "en-US-Neural2-I": { gender: "MALE", provider: "Google Cloud" },
  "en-US-Neural2-J": { gender: "MALE", provider: "Google Cloud" },
  alloy: { gender: "FEMALE", provider: "OpenAI" },
  echo: { gender: "MALE", provider: "OpenAI" },
  fable: { gender: "MALE", provider: "OpenAI" },
  onyx: { gender: "MALE", provider: "OpenAI" },
  nova: { gender: "FEMALE", provider: "OpenAI" },
  shimmer: { gender: "FEMALE", provider: "OpenAI" },
} as const;

export const voiceNames: Voice[] = Object.keys(voices) as Voice[];

export const isVoiceValid = (voice: string | null): boolean => {
  if (!voice) {
    return false;
  }

  if (!Object.keys(voices).includes(voice)) {
    return false;
  }

  return true;
};

export const isGoogleVoice = (voice: string): boolean => {
  if (!Object.keys(voices).find((v) => v === voice)) {
    const errorMessage = `Voice ${voice} not found in voices object.`;
    throw new Error(errorMessage);
  }

  const voiceInfo = voices[voice as Voice];

  return voiceInfo.provider === "Google Cloud";
};
