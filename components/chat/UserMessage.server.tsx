import { ChatMessage } from "@/lib/types";
import { Text } from "../Text";
import {
  EmptySpace,
  MessageContainer,
  MessageSenderOrReceiver,
  UserMessageWrapper,
} from "./MessageComponents";

type UserMessageProps = {
  message: ChatMessage;
  messageIndex: number;
};

export const UserMessage = ({ message, messageIndex }: UserMessageProps) => {
  const lines = message.content.split("\n");

  return (
    <MessageContainer>
      <EmptySpace />
      <UserMessageWrapper>
        <MessageSenderOrReceiver>User:</MessageSenderOrReceiver>

        {lines.map((line, lineIndex) => {
          return <Text key={lineIndex}>{line === "" ? <br /> : line}</Text>;
        })}
      </UserMessageWrapper>
    </MessageContainer>
  );
};
