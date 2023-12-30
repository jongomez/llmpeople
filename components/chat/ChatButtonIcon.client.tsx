import { Loader2, Mic, SendIcon } from "lucide-react";
import styled from "styled-components";

type ChatButtonIconProps = {
  isLoadingMessage: boolean;
  hasText: boolean;
}

export const ChatButtonIcon = ({ isLoadingMessage, hasText }: ChatButtonIconProps) => {
  const iconSize = 22;

  if (isLoadingMessage) {
    return (<LoaderWrapper>
      <Loader2 size={iconSize} />
    </LoaderWrapper>);
  } else if (hasText) {
    return <CustomSendIcon size={iconSize} />;
  } else {
    return <CustomMicIcon size={iconSize} />;
  }
}

const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const CustomSendIcon = styled(SendIcon)`
  position: relative;
  top: 2px;
  right: 1px;
`;

const CustomMicIcon = styled(Mic)`
  position: relative;
  top: 2px;
`;