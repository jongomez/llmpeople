import { DEFAULT_INITIAL_MESSAGE, DEFAULT_PROMPT, DEFAULT_SPEECH_RECOGNITION_LANGUAGE_CODE, DEFAULT_VOICE } from "./constants";
import { MainState, MainStateAction } from "./types";

// Defining the localStorage key globally
export const PRIVACY_POLICY_ACCEPTED_KEY = "hasAcceptedPrivacyPolicy";

export const defaultState: MainState = {
  soundController: {
    isVolumeOn: true,
  },
  hasAcceptedPrivacyPolicy: true,
  initErrorMessage: "",
  isLoading: true,
  lastLLMResponse: "",
  chatState: {
    messages: [],
    isLoadingMessage: false,
    errorMessage: "",
    charCount: 0,
  },
  aboutModalIsOpen: false,
  settingsModalIsOpen: false,
  settings: {
    voice: DEFAULT_VOICE,
    prompt: DEFAULT_PROMPT,
    initialMessage: DEFAULT_INITIAL_MESSAGE,
    speechRecognitionLanguageCode: DEFAULT_SPEECH_RECOGNITION_LANGUAGE_CODE,
    // XXX: model is null at the beginning. Because we will first check the URL for a model.
    // If we loaded a model here different from the URL model, we'd need to load 2 models at startup.
    model: null,
  },
};

export const mainStateReducer = (draft: MainState, action: MainStateAction): MainState => {
  switch (action.type) {
    case "TOGGLE_VOLUME": {
      draft.soundController.isVolumeOn = !draft.soundController.isVolumeOn;
      return draft;
    }

    case "SET_ACCEPTED_PRIVACY_POLICY": {
      const hasAccepted = action.payload;

      draft.hasAcceptedPrivacyPolicy = hasAccepted;

      // Set the value in localStorage when action is triggered
      localStorage.setItem(PRIVACY_POLICY_ACCEPTED_KEY, hasAccepted ? "true" : "false");

      return draft;
    }

    case "SET_INIT_ERROR_MESSAGE": {
      draft.initErrorMessage = action.payload;
      return draft;
    }

    case "SET_IS_LOADING": {
      draft.isLoading = action.payload;
      return draft;
    }

    case "SET_LAST_LLM_RESPONSE": {
      draft.lastLLMResponse = action.payload;
      return draft;
    }

    case "TOGGLE_ABOUT_MODAL": {
      draft.aboutModalIsOpen = !draft.aboutModalIsOpen;
      return draft;
    }

    case "TOGGLE_SETTINGS_MODAL": {
      draft.settingsModalIsOpen = !draft.settingsModalIsOpen;
      return draft;
    }

    case "SET_CHAT_STATE": {
      draft.chatState = action.payload;
      return draft;
    }

    case "UPDATE_CHAT_STATE": {
      const { newMessage, isLoadingMessage, errorMessage, textAreaValue, abortController } =
        action.payload;

      if (textAreaValue !== undefined) {
        draft.chatState.charCount = textAreaValue.length;
      }

      const lastMessageRole = draft.chatState.messages?.at(-1)?.role;

      if (lastMessageRole === "assistant" && newMessage?.role === "assistant") {
        if (newMessage !== undefined) {
          draft.chatState.messages[draft.chatState.messages.length - 1] = newMessage;

          // If a server message is done loading, set lastLLMResponse.
          if (!isLoadingMessage && !errorMessage) {
            draft.lastLLMResponse = newMessage.content;
          }
        }
      } else if (newMessage !== undefined) {
        draft.chatState.errorMessage = "";
        draft.chatState.messages.push(newMessage);
      }

      if (isLoadingMessage !== undefined) {
        draft.chatState.isLoadingMessage = isLoadingMessage;
      }

      if (errorMessage !== undefined) {
        draft.chatState.errorMessage = errorMessage;
      }

      if (abortController !== undefined) {
        draft.chatState.abortController = abortController;
      }

      return draft;
    }

    case "HANDLE_SOUND": {
      const { audio, currentSoundRef, humanoidRef } = action.payload;

      currentSoundRef.current?.pause();

      humanoidRef.current?.talkAnimationEnd("Received new audio");

      if (!audio) {
        return draft;
      }

      if (!draft.soundController.isVolumeOn) {
        audio.volume = 0;
      }

      const onAudioEnd = () => {
        humanoidRef.current?.talkAnimationEnd("onAudioEnd");
      };

      // XXX: pause event is emitted after the pause() method is called or BEFORE an ended or seeking event
      // newAudio.addEventListener("pause", onAudioEnd);
      audio.addEventListener("ended", onAudioEnd);

      audio.play();

      currentSoundRef.current = audio;
      humanoidRef.current?.talkAnimationStart();

      return draft;
    }

    case "SET_SETTINGS": {
      const settings = action.payload;

      if (settings.initialMessage !== draft.settings.initialMessage) {
        // If a new initial message is set, update the chat history.
        // Replace first message with the new initial message.
        draft.chatState.messages[0].content = settings.initialMessage;
      }

      draft.settings = settings;

      return draft;
    }

    // Add other actions as needed...

    default:
      // Can throw an error or handle unexpected action type
      return draft;
  }
};
