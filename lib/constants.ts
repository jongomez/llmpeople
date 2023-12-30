import { v3 } from "./babylonjs/utils";
import { CameraConfig, Model, ModelConfig } from "./types";

export const MAX_WORD_SUGGESTION = 60;

export const OPENAI_TIMEOUT_MILLISECONDS = 5_000;
export const CHAT_MESSAGES_URL = "/api/chat";
export const MAX_CHARS = 300;
export const CORNER_ICON_SIZE = 24;

export const MAIN_CAMERA_NAME = "MainCamera";

export const DEFAULT_INITIAL_MESSAGE = "Hey, how's it going?";
export const DEFAULT_PROMPT = `Prompt - You are an AI language model,
and you will be chatting as a fun, upbeat, and friendly character. 
Make sure not to mention your role as an AI or the character you are portraying. 
Keep your responses concise, no longer than ${MAX_WORD_SUGGESTION} words per response. 
Engage in a lively and positive conversation with the user.`;
export const DEFAULT_SPEECH_RECOGNITION_LANGUAGE_CODE = "en-US";

export const DEFAULT_VOICE = "en-US-Neural2-H";

export const DEFAULT_MODEL: Model = "vroid_girl1";

export const defaultCameraConfig: CameraConfig = {
  alpha: Math.PI / 2,
  beta: Math.PI / 2.5,
  radius: 2.5,
  target: v3(0, 0.7, 0),
};

const defaultConfig: ModelConfig = {
  cameraConfig: defaultCameraConfig,
  voice: "en-US-Neural2-H",
  initialAnimation: "idle3_hand_hips",
  faceMeshName: "Face",
  morphTargets: {
    mouthMovement: "Face.M_F00_000_00_Fcl_MTH_A",
    leftEyeClose: "Face.M_F00_000_00_Fcl_EYE_Close_L",
    rightEyeClose: "Face.M_F00_000_00_Fcl_EYE_Close_R",
  },
  idleAnimations: ["idle1", "idle2", "idle3_hand_hips"],
  talkingBodyAnimations: ["talking1", "talking2_head_shake", "talking3"],
  positionOffset: v3(0, 0.015, 0),
};

export const models = {
  vroid_girl1: defaultConfig,
  vest_dude: {
    ...defaultConfig,
    morphTargets: {
      mouthMovement: "mouth_open",
    },
    faceMeshName: "rp_eric_rigged_001_geo",
    cameraConfig: {
      alpha: Math.PI / 2,
      beta: Math.PI / 2.5,
      radius: 3,
      target: v3(0, 0.9, 0),
    },
    positionOffset: v3(0, 0.03, 0),
  },
} as const;
