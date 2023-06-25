import { Send } from "@tamagui/lucide-icons";
import { memo } from "react";
import {
  Button,
  ScrollView,
  Spinner,
  StackPropsBase,
  Text,
  TextArea,
  XStack,
  YStack,
  useMedia,
} from "tamagui";
import { ChatErrors } from "./ChatErrors";
import { ChatHookReturnType, useChat } from "./hooks";

const OPENAI_TIMEOUT_MILLISECONDS = 5_000;
const CHAT_MESSAGES_URL = "/api/chat";
const alpha = "0.9";
const scrollViewBackgroundColor = `rgba(255, 255, 255,${alpha})`;
export const MAX_CHARS = 300;

export type ChatMessage = {
  role: "user" | "system" | "assistant";
  content: string;
};

export type ChatServerResponse =
  | string
  | {
      error: string;
    };

type ChatProps = StackPropsBase & {
  audioReceivedCallback: (audio: HTMLAudioElement | null) => void;
};

// This function is called when a user wants to send a message to the backend. It does the following:
// 1. Appends the user's message to the existing messages array. This shows the message in the chat's scroll view.
// 2. Sends a POST request to the backend and waits for the server side events.
const send = (
  textAreaRef: ChatHookReturnType["textAreaRef"],
  setChatState: ChatHookReturnType["setChatState"],
  appendBotMessage: ChatHookReturnType["appendBotMessage"],
  appendUserMessage: ChatHookReturnType["appendUserMessage"],
  audioReceivedCallback: ChatProps["audioReceivedCallback"],
  isLoadingMessage: boolean
) => {
  if (isLoadingMessage) {
    return;
  }

  const textInput = textAreaRef?.current?.value;

  if (textAreaRef?.current && textInput) {
    if (textInput.length > MAX_CHARS) {
      setChatState((currentState) => {
        return {
          ...currentState,
          errorMessage: `Please enter a message with ${MAX_CHARS} characters or less.`,
        };
      });
      return;
    }

    textAreaRef.current.clear();
    textAreaRef.current.focus();

    // Gets the last 2 messages to send to the backend.
    const allMessages = appendUserMessage(textInput);
    const messagesToSendToBackend = allMessages.slice(-2);

    // Sends a POST request to the backend.
    sendMessages(messagesToSendToBackend, setChatState, appendBotMessage, audioReceivedCallback);
  }
};

const sendMessages = async (
  messagesToSendToBackend: ChatMessage[],
  setChatState: ChatHookReturnType["setChatState"],
  appendBotMessage: ChatHookReturnType["appendBotMessage"],
  audioReceivedCallback: ChatProps["audioReceivedCallback"]
) => {
  let errorMessage = "";

  setChatState((currentState) => ({
    ...currentState,
    isLoadingMessage: true,
  }));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("CLEARING TIMEOUT");
      controller.abort();
    }, OPENAI_TIMEOUT_MILLISECONDS);

    const response = await fetch(CHAT_MESSAGES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        messagesToSendToBackend.map((message) => {
          return { content: message.content, role: message.role };
        })
      ),
      signal: controller.signal,
    });

    // We have a response! Maybe it's an error, but not worries. We'll handle it below.
    clearTimeout(timeoutId);

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error);
    }

    const jsonResponse = await response.json();

    // Response has 2 parts: text and audio.
    // 1. Here, we append the text to the chat's scroll view.
    appendBotMessage({ content: jsonResponse.text, role: "assistant" });

    // 2. And here, we play the audio.
    const audioContent = jsonResponse.audio;
    const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
    audioReceivedCallback(audio);
  } catch (error) {
    errorMessage = error.message || "Error: something went wrong.";
  }

  setChatState((currentState) => ({
    ...currentState,
    errorMessage,
    isLoadingMessage: false,
  }));
};

// This component takes care of showing the messages in the chat's scroll view.
const PrintMessages = memo(({ messages }: { messages: ChatMessage[] }) => {
  return (
    <>
      {messages.map((message, index) => {
        const isBot = message.role === "assistant";
        const contentLines = message.content.split(/\n+/);

        return contentLines.map((line, lineIndex) => (
          <Text
            backgroundColor={isBot ? `rgba(230, 230, 230,${alpha})` : undefined}
            py={8}
            px={10}
            key={`${index}-${lineIndex}`}
            lineHeight="1.4"
          >
            <Text
              fontWeight="600"
              // color={isBot ? "$blue4Dark" : undefined}
            >
              {" "}
              {lineIndex === 0 && (isBot ? "Bot:" : "You:")}
            </Text>{" "}
            {line}
          </Text>
        ));
      })}
    </>
  );
});

// Main chat component.
export const Chat = ({ audioReceivedCallback, ...stackProps }: ChatProps) => {
  const {
    chatState,
    setChatState,
    textAreaRef,
    messagesContainerRef,
    appendBotMessage,
    appendUserMessage,
  } = useChat();
  const media = useMedia();

  const { isLoadingMessage } = chatState;

  // Constant numbers:
  const regularMessagesBoxHeight = 300;
  const smallMessagesBoxHeight = 170;
  const width = 300;
  const textAreaHeight = 60;
  const buttonMarginLeft = 8;
  const buttonSize = 50;

  const isSmall = media.xs;

  return (
    <YStack
      ai="center"
      jc="flex-end"
      position="absolute"
      bottom="0"
      right="0"
      m={20}
      w={width}
      maxWidth="90vw"
      {...stackProps}
    >
      <ScrollView
        ref={messagesContainerRef}
        maxHeight={isSmall ? smallMessagesBoxHeight : regularMessagesBoxHeight}
        backgroundColor={scrollViewBackgroundColor}
        mb={8}
        br={8}
        width="100%"
        onContentSizeChange={() => messagesContainerRef.current?.scrollToEnd({ animated: true })}
      >
        <PrintMessages messages={chatState.messages} />
      </ScrollView>
      <XStack ai="center" width="100%">
        {/* DOCS: https://necolas.github.io/react-native-web/docs/text-input/ */}
        <TextArea
          // TODO: Get the real TextInput type from react native, and remove the below @ts-expect-error
          // @ts-expect-error
          ref={textAreaRef}
          h={textAreaHeight}
          // w={width - buttonSize - buttonMarginLeft}
          placeholder={chatState.isLoadingMessage ? "Loading message..." : "Type message here"}
          disabled={chatState.isLoadingMessage}
          returnKeyType="send"
          multiline
          blurOnSubmit={false}
          onKeyPress={(e) => {
            // Handle browser submit.
            if (e.nativeEvent.key === "Enter" && "shiftKey" in e && !e.shiftKey) {
              e.preventDefault(); // Prevent a new line from being added
              send(
                textAreaRef,
                setChatState,
                appendBotMessage,
                appendUserMessage,
                audioReceivedCallback,
                isLoadingMessage
              );
            }
          }}
          onSubmitEditing={() =>
            // Handle Android and iOS submit.
            send(
              textAreaRef,
              setChatState,
              appendBotMessage,
              appendUserMessage,
              audioReceivedCallback,
              isLoadingMessage
            )
          }
          maxLength={MAX_CHARS}
          onChangeText={(text: string) => setChatState({ ...chatState, charCount: text.length })}
        />

        {isLoadingMessage ? (
          <Spinner
            height={buttonSize}
            width={buttonSize}
            size="small"
            jc="center"
            ai="center"
            color="$gray10"
            ml={buttonMarginLeft}
            backgroundColor="#F3F3F3"
            br="100%"
          />
        ) : (
          <Button
            size={buttonSize}
            ml={buttonMarginLeft}
            icon={<Send size="$1" />}
            br="100%"
            onPress={() =>
              send(
                textAreaRef,
                setChatState,
                appendBotMessage,
                appendUserMessage,
                audioReceivedCallback,
                isLoadingMessage
              )
            }
          />
        )}
      </XStack>
      <ChatErrors errorMessage={chatState.errorMessage} charCount={chatState.charCount} />
    </YStack>
  );
};
