import { ChatState } from "../types";

export const getMostRecentUserMessage = (chatState: ChatState): string => {
  // Iterate over messages array in reverse order
  for (let i = chatState.messages.length - 1; i >= 0; i--) {
    const message = chatState.messages[i];
    if (message.role === "user") {
      return message.content; // Return the content of the most recent user message
    }
  }

  // Return an empty string if no user message is found
  return "";
};
