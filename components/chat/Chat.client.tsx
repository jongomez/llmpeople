"use client";

import { sendChatMessage } from "@/lib/chat/messageHandlingUtils";
import media from "@/lib/styleUtils";
import { ChatMessage, ChatState, MainStateDispatch, SettingsType, SpeechRecognitionLanguageCode } from "@/lib/types";
import { memo, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import styled from "styled-components";
import { useGameContext } from "../GameContextProvider";
import { useInitialChatMessage } from "../hooks";
import { ChatButtonIcon } from "./ChatButtonIcon.client";
import { ChatErrors } from "./ChatErrors.server";
import { LLMMessage } from "./LLMMessage.client";
import { UserMessage } from "./UserMessage.server";
type ChatMessagesProps = {
  messages: ChatMessage[];
};

const ChatMessages = memo(function ChatMessages({ messages }: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  return (
    <>
      {messages.map((message, index) => {
        if (message.role === "assistant") {
          return <LLMMessage message={message} messageIndex={index} key={index} />;
        } else {
          return <UserMessage message={message} messageIndex={index} key={index} />;
        }
      })}
      <div ref={endRef} /> {/* Invisible div for auto scrolling purposes */}
    </>
  );
});

const listen = async (language: SpeechRecognitionLanguageCode): Promise<void> => {
  await SpeechRecognition.startListening({
    continuous: false,
    language,
  });
};

type ChatTextAreProps = {
  mainStateDispatch: MainStateDispatch;
  chatState: ChatState;
  settings: SettingsType;
};

export const ChatTextArea = ({ mainStateDispatch, chatState, settings }: ChatTextAreProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { currentSoundRef, humanoidRef } = useGameContext();
  const { transcript, listening, resetTranscript, isMicrophoneAvailable, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const { isLoadingMessage } = chatState;
  const hasText = textAreaRef.current ? textAreaRef.current.value.length > 0 : false;

  // The following useEffect is used to scroll to the bottom of the text area.
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [textAreaRef]);

  // The following useEffect updates the text area value when the speech recognition transcript is updated.
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = transcript;
      mainStateDispatch({
        type: "UPDATE_CHAT_STATE",
        payload: { textAreaValue: transcript },
      });
    }
  }, [transcript]);

  return (
    <TextareaWrapper>
      <Textarea
        ref={textAreaRef}
        placeholder={isLoadingMessage ? "Loading message..." : "Type message here"}
        disabled={isLoadingMessage}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage(
              textAreaRef,
              mainStateDispatch,
              currentSoundRef,
              humanoidRef,
              chatState,
              settings
            );
          }
        }}
        onChange={(e) => {
          mainStateDispatch({
            type: "UPDATE_CHAT_STATE",
            payload: { textAreaValue: e.target.value },
          });
        }}
      />
      <ChatButtonWrapper>
        <ChatButton
          disabled={isLoadingMessage || listening}
          onClick={() => {
            if (hasText) {
              sendChatMessage(
                textAreaRef,
                mainStateDispatch,
                currentSoundRef,
                humanoidRef,
                chatState,
                settings
              )
            } else if (!isMicrophoneAvailable) {
              window.alert("Microphone is not available :(");
            } else if (!browserSupportsSpeechRecognition) {
              window.alert("Speech Recognition API is not supported in your browser :(");
            } else {
              listen(settings.speechRecognitionLanguageCode);
            }
          }
          }
        >
          <ChatButtonIcon isLoadingMessage={isLoadingMessage} hasText={hasText} />
        </ChatButton>
      </ChatButtonWrapper>
    </TextareaWrapper>
  );
};

type ChatProps = {
  mainStateDispatch: MainStateDispatch;
  chatState: ChatState;
  settings: SettingsType;
};

export const Chat = ({ mainStateDispatch, chatState, settings }: ChatProps) => {
  useInitialChatMessage(mainStateDispatch, settings);

  return (
    <ChatWrapper>
      <ChatMessagesWrapper>
        <ChatMessages messages={chatState.messages} />
      </ChatMessagesWrapper>

      <ChatTextArea
        mainStateDispatch={mainStateDispatch}
        chatState={chatState}
        settings={settings}
      />

      <ChatErrors errorMessage={chatState.errorMessage} charCount={chatState.charCount} />
    </ChatWrapper>
  );
};

const ChatWrapper = styled.div`
  box-sizing: border-box;

  position: absolute;
  bottom: 0;
  right: 0;

  width: 300px;

  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  overflow: auto;
  justify-content: flex-end;

  max-height: 100vh;

  // background-color: rgba(255, 255, 255, 0.8);

  z-index: 1000;

  ${media.small`
    width: 100%;
  `}
`;

const ChatMessagesWrapper = styled.div`
  margin-bottom: 0.5rem;
  overflow: auto;

  padding: 5px 10px;
  border-radius: 12px;

  background-color: rgba(0, 0, 0, 0.1);

  ${media.small`
    max-height: 25vh;
  `}
`;

const TextareaWrapper = styled.div`
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const Textarea = styled.textarea`
  box-sizing: border-box;
  resize: none;
  height: 75px;
  width: 100%;
  outline: none;
  background-color: white;
  padding: 10px 50px 10px 10px;

  border-radius: 12px;

  ${media.small`
    height: 60px;
  `}
`;

const ChatButtonWrapper = styled.div`
  position: absolute;
  right: 18px;
`;


const ChatButton = styled.button<{ disabled: boolean }>`
  cursor: pointer;
  border: none;

  background-color: #3b82f6;
  // background-color: ${(props) => (props.disabled ? "gray" : "#3b82f6")};

  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  color: #ffffff;
  border-radius: 6px;

  height: 33px;
  width: 33px;
`;
