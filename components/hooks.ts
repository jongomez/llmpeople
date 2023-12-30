import { DEFAULT_INITIAL_MESSAGE, DEFAULT_MODEL } from "@/lib/constants";
import { ChatMessage, MainStateDispatch, Model, SettingsType, SpeechRecognitionLanguageCode, Voice } from "@/lib/types";
import { isModelValid, isSpeechLangCodeValid } from "@/lib/utils";
import { isVoiceValid } from "@/lib/voices";
import { useEffect, useRef, useState } from "react";

type MessagesContainerRef = HTMLElement & {
  scrollToEnd(options?: { animated?: boolean }): void;
};

// TODO: Get the real TextInput type from react native, and remove the need for this type.
type ReactNativeTextInput = {
  clear: () => void;
  focus: () => void;
  value: string;
} | null;

let dummyMessages: ChatMessage[] = [];

dummyMessages = [{ role: "assistant", content: DEFAULT_INITIAL_MESSAGE }];

export type ChatHookState = {
  messages: ChatMessage[];
  isLoadingMessage: boolean;
  errorMessage: string;
  charCount: number;
};

export type ChatHookReturnType = {
  chatState: ChatHookState;
  setChatState: React.Dispatch<React.SetStateAction<ChatHookState>>;
  textAreaRef: React.RefObject<ReactNativeTextInput>;
  messagesContainerRef: React.RefObject<MessagesContainerRef>;
  appendBotMessage: (botMessage: ChatMessage) => void;
  appendUserMessage: (userMessage: string) => ChatMessage[];
};

export const useChat = (): ChatHookReturnType => {
  const textAreaRef = useRef<ReactNativeTextInput>(null);
  const messagesContainerRef = useRef<MessagesContainerRef>(null);
  const [chatState, setChatState] = useState<ChatHookState>({
    charCount: 0,
    errorMessage: "",
    messages: dummyMessages,
    isLoadingMessage: false,
  });

  // Appends message from the bot to the messages state array. This will update the chat's text area.
  // If the message already exists, it updates the existing message.
  const appendBotMessage = (botMessage: ChatMessage) => {
    setChatState((currentState) => {
      if (currentState.messages.length === 0) {
        const errorMessage =
          "Unknown error: messages array is empty. There should be at least 1 user message.";
        console.error(errorMessage);
        return { ...currentState, errorMessage };
      }

      const lastMessageRole = currentState.messages.at(-1)?.role;

      if (lastMessageRole === "assistant") {
        // Update existing message.
        const updatedMessages = [...currentState.messages];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          content: botMessage.content,
        };

        return { ...currentState, messages: updatedMessages };
      } else if (lastMessageRole === "user") {
        // Create new message.
        const messagesWithNewBotMessage: ChatMessage[] = [...currentState.messages, botMessage];

        // NOTE: Besides creating a new message, also clear any error messages.
        return { ...currentState, errorMessage: "", messages: messagesWithNewBotMessage };
      } else {
        const errorMessage = "Unknown error: last message is neither from the user nor the bot.";
        console.error(errorMessage);
        return { ...currentState, errorMessage };
      }
    });
  };

  // Appends message from the user to the messages array. This will update the chat's scroll view.
  const appendUserMessage = (userMessage: string): ChatMessage[] => {
    // NOTE: status is always "complete" for user messages.
    const newMessage: ChatMessage = {
      role: "user",
      content: userMessage,
    };

    const allMessages: ChatMessage[] = [...chatState.messages, newMessage];

    setChatState((currentState) => ({
      ...currentState,
      messages: allMessages,
    }));

    return allMessages;
  };

  return {
    chatState,
    setChatState,
    textAreaRef,
    messagesContainerRef,
    appendBotMessage,
    appendUserMessage,
  };
};

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
