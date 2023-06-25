import { useRef, useState } from "react";
import { ChatMessage } from "./Chat";

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

dummyMessages = [{ role: "assistant", content: "Hey, how's it going?" }];

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
