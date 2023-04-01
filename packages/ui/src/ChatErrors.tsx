import { Text } from "tamagui";
import { MAX_CHARS } from "./Chat";

type ChatErrorTextComponentProps = {
  children: React.ReactNode;
};

const ChatErrorTextComponent = ({ children }: ChatErrorTextComponentProps) => {
  return (
    <Text color="$red10" mt={15} mb={5} textAlign="center">
      {children}
    </Text>
  );
};

type ChatErrorsProps = {
  errorMessage: string;
  charCount: number;
};

export const ChatErrors = ({ errorMessage, charCount }: ChatErrorsProps) => {
  if (errorMessage) {
    return <ChatErrorTextComponent>{errorMessage}</ChatErrorTextComponent>;
  }

  if (charCount > MAX_CHARS) {
    return (
      <ChatErrorTextComponent>
        {`Please enter a message with ${MAX_CHARS} characters or less.`}
      </ChatErrorTextComponent>
    );
  }

  return null;
};
