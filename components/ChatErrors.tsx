import { MAX_CHARS } from "@/lib/constants";
import { Text } from "./Text";

type ChatErrorTextComponentProps = {
  children: React.ReactNode;
};

const ChatErrorTextComponent = ({ children }: ChatErrorTextComponentProps) => {
  return (
    <Text
      style={{
        color: "red",
        marginTop: "15px",
        marginBottom: "5px",
        textAlign: "center",
      }}
    >
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
