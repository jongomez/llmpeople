import { Voice } from "./types";

// OpenAI's built-in text-to-speech voices for the gpt-4o-mini-tts model.
// https://platform.openai.com/docs/guides/text-to-speech#voice-options
// OpenAI recommends `marin` and `cedar` for best quality, so they're listed first.
export const voices = {
  marin: { gender: "FEMALE", recommended: true },
  cedar: { gender: "MALE", recommended: true },
  alloy: { gender: "FEMALE", recommended: false },
  ash: { gender: "MALE", recommended: false },
  ballad: { gender: "MALE", recommended: false },
  coral: { gender: "FEMALE", recommended: false },
  echo: { gender: "MALE", recommended: false },
  fable: { gender: "MALE", recommended: false },
  nova: { gender: "FEMALE", recommended: false },
  onyx: { gender: "MALE", recommended: false },
  sage: { gender: "FEMALE", recommended: false },
  shimmer: { gender: "FEMALE", recommended: false },
  verse: { gender: "MALE", recommended: false },
} as const;

export const voiceNames: Voice[] = Object.keys(voices) as Voice[];

export const isVoiceValid = (voice: string | null): boolean => {
  if (!voice) {
    return false;
  }

  return Object.keys(voices).includes(voice);
};
