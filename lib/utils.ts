import { models } from "./constants";
import { speechRecognitionLanguages } from "./speechRecognitionLanguages";

export function isBabylonInspectorShowing() {
  return (
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    document.getElementById("sceneExplorer")
  );
}

export const isModelValid = (model: string | null): boolean => {
  if (!model) {
    return false;
  }

  if (!Object.keys(models).includes(model)) {
    return false;
  }

  return true;
};

export const isSpeechLangCodeValid = (languageCode: string | null): boolean => {
  if (!languageCode) {
    return false;
  }

  if (!Object.keys(speechRecognitionLanguages).includes(languageCode)) {
    return false;
  }

  return true;
}
