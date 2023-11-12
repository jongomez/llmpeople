import { MAX_CHARS } from "@/lib/constants";
import { ReactNode } from "react";

type ChatErrorTextComponentProps = {
  children: ReactNode;
};

const ChatErrorTextComponent = ({ children }: ChatErrorTextComponentProps) => {
  return (
    <div style={{ color: "red", marginTop: "16px", marginBottom: "4px", textAlign: "center" }}>
      {children}
    </div>
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
