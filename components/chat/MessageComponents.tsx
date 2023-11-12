import styled from "styled-components";

export const MessageSenderOrReceiver = styled.div`
  display: inline;
  font-weight: bold;
  margin-right: 4px;
`;

export const MessageWrapper = styled.div`
  width: fit-content;
  margin: 6px 0;

  border-radius: 12px;
  padding: 10px;

  p:first-of-type {
    display: inline;
  }

  p {
    word-break: break-word;
  }
`;

export const LLMMessageWrapper = styled(MessageWrapper)`
  background-color: white;
`;

export const UserMessageWrapper = styled(MessageWrapper)`
  background-color: white;
  margin-left: auto;
`;

export const EmptySpace = styled.div`
  width: 25px;
`;

export const MessageContainer = styled.div`
  display: flex;
`;
