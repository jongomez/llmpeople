import { Vector3 } from "babylonjs";
import { Dispatch } from "react";
import { Humanoid } from "./babylonjs/Humanoid";
import { models } from "./constants";
import { speechRecognitionLanguages } from "./speechRecognitionLanguages";
import { voices } from "./voices";

type SoundController = {
  isVolumeOn: boolean;
};

export type Gender = "MALE" | "FEMALE";

export type VoiceProvider = "Google Cloud" | "OpenAI";
export type VoiceInfo = {
  provider: VoiceProvider;
  gender: Gender;
};

export type Voice = keyof typeof voices;
export type SpeechRecognitionLanguageName = typeof speechRecognitionLanguages[keyof typeof speechRecognitionLanguages];
export type SpeechRecognitionLanguageCode = keyof typeof speechRecognitionLanguages;

export type CameraConfig = {
  alpha: number;
  beta: number;
  radius: number;
  target: Vector3;
};

export type ModelConfig = {
  voice: Voice;
  initialAnimation: string;
  cameraConfig: CameraConfig;
  faceMeshName: string;
  morphTargets: {
    mouthMovement: string;
    leftEyeClose?: string;
    rightEyeClose?: string;
  };
  idleAnimations: string[];
  talkingBodyAnimations: string[];
  positionOffset: Vector3;
};
export type Model = keyof typeof models;

export type SettingsType = {
  model: Model | null;
  voice: Voice;
  prompt: string;
  initialMessage: string;
  speechRecognitionLanguageCode: SpeechRecognitionLanguageCode;
};

export type HumanoidRef = React.MutableRefObject<Humanoid | null>;
export type CurrentSoundRef = React.MutableRefObject<HTMLAudioElement | null>;

export type MainState = {
  initErrorMessage: string;
  isLoading: boolean;
  aboutModalIsOpen: boolean;
  settingsModalIsOpen: boolean;
  hasAcceptedPrivacyPolicy: boolean;
  lastLLMResponse: string;
  chatState: ChatState;
  soundController: SoundController;
  settings: SettingsType;
};

export type MainStateAction =
  | { type: "TOGGLE_VOLUME" }
  | { type: "SET_ACCEPTED_PRIVACY_POLICY"; payload: boolean }
  | { type: "SET_INIT_ERROR_MESSAGE"; payload: string }
  | { type: "SET_IS_LOADING"; payload: boolean }
  | { type: "SET_LAST_LLM_RESPONSE"; payload: string }
  | { type: "SET_CHAT_STATE"; payload: ChatState }
  | { type: "TOGGLE_ABOUT_MODAL" }
  | { type: "TOGGLE_SETTINGS_MODAL" }
  | { type: "SET_SETTINGS"; payload: SettingsType }
  | {
    type: "HANDLE_SOUND";
    payload: {
      audio: HTMLAudioElement;
      currentSoundRef: CurrentSoundRef;
      humanoidRef: HumanoidRef;
    };
  }
  | {
    type: "UPDATE_CHAT_STATE";
    payload: {
      newMessage?: ChatMessage;
      isLoadingMessage?: boolean;
      abortController?: AbortController;
      errorMessage?: string;
      textAreaValue?: string;
    };
  };

export type MainStateDispatch = Dispatch<MainStateAction>;

export type MainStateReducer = (state: MainState, action: MainStateAction) => MainState;

export type ChatMessage = {
  role: "user" | "system" | "assistant";
  content: string;
};

export type ChatState = {
  messages: ChatMessage[];
  isLoadingMessage: boolean;
  errorMessage: string;
  charCount: number;
  abortController?: AbortController;
};
