import { RefObject } from "react";
import { MAX_CHARS } from "../constants";
import {
  ChatMessage,
  ChatState,
  CurrentSoundRef,
  HumanoidRef,
  MainStateDispatch,
  SettingsType,
} from "../types";

const CHAT_MESSAGES_URL = "/api/chat";
const OPENAI_TIMEOUT_MILLISECONDS = 10_000;
export type ChatServerResponse =
  | string
  | {
      error: string;
    };

const validateMessageLength = (
  newMessage: ChatMessage,
  mainStateDispatch: MainStateDispatch
): boolean => {
  if (newMessage.content.length > MAX_CHARS) {
    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: {
        errorMessage: `Please enter a message with ${MAX_CHARS} characters or less.`,
      },
    });
    return false;
  }
  return true;
};

export const sendChatMessage = (
  textAreaRef: RefObject<HTMLTextAreaElement>,
  mainStateDispatch: MainStateDispatch,
  currentSoundRef: CurrentSoundRef,
  humanoidRef: HumanoidRef,
  chatState: ChatState,
  settings: SettingsType
) => {
  if (chatState.isLoadingMessage) {
    return;
  }

  const newMessage: ChatMessage = {
    content: textAreaRef?.current?.value || "",
    role: "user",
  };

  if (textAreaRef?.current && newMessage.content) {
    if (!validateMessageLength(newMessage, mainStateDispatch)) return;

    // TODO (maybe?): Only clear the text area if user is using a custom prompt (e.g. has manually modified a prompt).
    textAreaRef.current.value = "";
    textAreaRef.current.focus();

    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: { newMessage },
    });

    // Currently only send 2 messages to the backend: the previous message and the new message.
    const messagesToSendToBackend = [...chatState.messages.slice(-1), newMessage];

    // Sends a POST request to the backend.
    sendPostRequestWithMultipleMessages(
      messagesToSendToBackend,
      mainStateDispatch,
      currentSoundRef,
      humanoidRef,
      chatState,
      settings
    );
  }
};

const handleLLMResponse = async (
  response: Response,
  mainStateDispatch: MainStateDispatch,
  currentSoundRef: CurrentSoundRef,
  humanoidRef: HumanoidRef
) => {
  if (!response.body) {
    throw new Error("Response body is undefined.");
  }

  const jsonResponse = await response.json();

  /*
  // Streaming solution:
  const reader = response.body.getReader();
  let responseChunks = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    // Convert Uint8Array to string and append to completeResponse
    let chunk = new TextDecoder().decode(value);
    responseChunks += chunk;

    // Append each chunk from the server to the chat.
    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: {
        newMessage: { content: responseChunks, role: "assistant" },
      },
    });
  }

  */

  // Response has 2 parts: text and audio.
  // 1. Here, we append the text to the chat's scroll view.
  mainStateDispatch({
    type: "UPDATE_CHAT_STATE",
    payload: {
      newMessage: { content: jsonResponse.text, role: "assistant" },
    },
  });

  // 2. And here, we play the audio.
  const audioContent = jsonResponse.audio;
  const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);

  mainStateDispatch({
    type: "HANDLE_SOUND",
    payload: { audio, currentSoundRef, humanoidRef },
  });
};

export const sendPostRequestWithMultipleMessages = async (
  messagesToSendToBackend: ChatMessage[],
  mainStateDispatch: MainStateDispatch,
  currentSoundRef: CurrentSoundRef,
  humanoidRef: HumanoidRef,
  chatState: ChatState,
  settings: SettingsType
) => {
  let errorMessage = "";

  if (chatState.isLoadingMessage && chatState.abortController) {
    console.log("Aborting previous request.");
    chatState.abortController.abort("New request sent - aborting previous.");
  }

  try {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Request took too long. Aborting.");
      abortController.abort("Request took too long. Aborting.");
    }, OPENAI_TIMEOUT_MILLISECONDS);

    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: {
        isLoadingMessage: true,
        abortController: abortController,
      },
    });

    const response = await fetch(CHAT_MESSAGES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messagesToSendToBackend.map((message) => {
          return { content: message.content, role: message.role };
        }),
        voice: settings.voice,
        prompt: settings.prompt,
        // keys: [settings.openAIAPIKey],
      }),
      signal: abortController.signal,
    });

    // We have a response! Maybe it's an error, but not worries. We'll handle it below.
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Response not okay. Will attempt to parse body.", response);

      let result = { error: "Response not okay" };
      try {
        result = await response.json();
      } catch (_) {
        throw new Error(
          "Error parsing response body. " + response.status + " - " + response.statusText
        );
      }

      throw new Error(result.error);
    }

    await handleLLMResponse(response, mainStateDispatch, currentSoundRef, humanoidRef);
  } catch (error) {
    errorMessage = "Error: something went wrong.";

    if (error instanceof Error) {
      if (error.message.includes("abort")) {
        errorMessage =
          "Request aborted due to timeout. This could be due to an incorrect OpenAI API key or internet connectivity issues.";
      } else {
        errorMessage = error.message;
      }
    }
  }

  mainStateDispatch({
    type: "UPDATE_CHAT_STATE",
    payload: {
      errorMessage,
      isLoadingMessage: false,
    },
  });
};
