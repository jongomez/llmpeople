"use client";

import { ChatMessage } from "@/lib/types";
import { Text } from "../Text";
import {
  EmptySpace,
  LLMMessageWrapper,
  MessageContainer,
  MessageSenderOrReceiver,
} from "./MessageComponents";

type LLMMessageProps = {
  message: ChatMessage;
  messageIndex: number;
};

export const LLMMessage = ({ message, messageIndex }: LLMMessageProps) => {
  return (
    <MessageContainer>
      <LLMMessageWrapper>
        <MessageSenderOrReceiver>Bot:</MessageSenderOrReceiver>
        <Text>{message.content}</Text>
      </LLMMessageWrapper>
      <EmptySpace />
    </MessageContainer>
  );
};
