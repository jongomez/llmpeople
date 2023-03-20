import { Send } from "@tamagui/lucide-icons";
import { MutableRefObject, useRef, useState } from "react";
import { Button, ScrollView, StackPropsBase, Text, TextArea, XStack, YStack } from "tamagui";

type ChatProps = StackPropsBase;

// TODO: Get the real TextInput type from react native, and remove the below @ts-expect-error
type ReactNativeTextInput = {
  clear: () => void;
  focus: () => void;
  value: string;
} | null;

type Message = {
  sender: "user" | "bot";
  text: string;
};

const send = (textAreaRef: MutableRefObject<ReactNativeTextInput>) => {
  if (textAreaRef?.current && textAreaRef.current.value) {
    console.log("\n\nSending:", textAreaRef.current.value);

    textAreaRef.current.clear();
    textAreaRef.current.focus();
  }
};

const dummyMessages: Message[] = [
  { sender: "user", text: "hellooooo" },
  { sender: "bot", text: "hahahahhahah" },
  { sender: "user", text: "yisssss" },
];

export const Chat = ({ ...stackProps }: ChatProps) => {
  // https://www.npmjs.com/package/@tanstack/react-query
  const textAreaRef = useRef<ReactNativeTextInput>(null);
  const [messages, setMessages] = useState<Message[]>(dummyMessages);

  const messagesBoxHeight = 200;
  const width = 300;
  const textAreaHeight = 60;
  const buttonMarginLeft = 8;
  const buttonSize = 50;

  return (
    <YStack
      ai="center"
      jc="flex-end"
      position="absolute"
      bottom="0"
      right="0"
      m={20}
      w={width}
      {...stackProps}
    >
      <ScrollView
        h={messagesBoxHeight}
        backgroundColor="rgba(255,255,255,0.6)"
        mb={8}
        p={10}
        br={8}
      >
        {messages.map((message, index) => {
          const isBot = message.sender === "bot";
          return (
            <Text key={index} color={isBot ? "$blue10" : "$gray10Dark"} mb={8}>
              {isBot ? "Her" : "You"}: {message.text}
            </Text>
          );
        })}
      </ScrollView>
      <XStack ai="center">
        {/* DOCS: https://necolas.github.io/react-native-web/docs/text-input/ */}
        <TextArea
          // @ts-expect-error
          ref={textAreaRef}
          h={textAreaHeight}
          w={width - buttonSize - buttonMarginLeft}
          placeholder="Type message here"
          returnKeyType="send"
          multiline={false}
          blurOnSubmit={false}
          onSubmitEditing={() => send(textAreaRef)}
        />
        <Button
          size={buttonSize}
          ml={buttonMarginLeft}
          icon={<Send size="$1" />}
          br="100%"
          onPress={() => send(textAreaRef)}
        />
      </XStack>
    </YStack>
  );
};
