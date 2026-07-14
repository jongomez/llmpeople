import { DEFAULT_MODEL } from "@/lib/constants";
import { MainStateDispatch, Model, SettingsType, SpeechRecognitionLanguageCode, Voice } from "@/lib/types";
import { isModelValid, isSpeechLangCodeValid } from "@/lib/utils";
import { isVoiceValid } from "@/lib/voices";
import { useEffect } from "react";

export const useGetInitialSettings = (
  mainStateDispatch: MainStateDispatch,
  settings: SettingsType
) => {
  useEffect(() => {
    // Read settings from URL params
    const params = new URLSearchParams(window.location.search);
    const paramsModel = params.get("model");
    const paramsVoice = params.get("voice");
    const paramsPrompt = params.get("prompt");
    const paramsSpeechLang = params.get("speechLang");

    const initialSettings: SettingsType = {
      model: isModelValid(paramsModel) ? (paramsModel as Model) : DEFAULT_MODEL,
      voice: isVoiceValid(paramsVoice) ? (paramsVoice as Voice) : settings.voice,
      prompt: paramsPrompt || settings.prompt,
      initialMessage: params.get("initialMessage") || settings.initialMessage,
      speechRecognitionLanguageCode: isSpeechLangCodeValid(paramsSpeechLang) ? (paramsSpeechLang as SpeechRecognitionLanguageCode) : settings.speechRecognitionLanguageCode,
    };

    mainStateDispatch({
      type: "SET_SETTINGS",
      payload: initialSettings,
    });
  }, []);
};

export const useInitialChatMessage = (
  mainStateDispatch: MainStateDispatch,
  settings: SettingsType
) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialMessage: string = params.get("initialMessage") || settings.initialMessage;

    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: { newMessage: { content: initialMessage, role: "assistant" } },
    });
  }, []);
};
