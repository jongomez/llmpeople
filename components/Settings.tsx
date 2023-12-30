import {
  CORNER_ICON_SIZE,
  DEFAULT_INITIAL_MESSAGE,
  DEFAULT_MODEL,
  DEFAULT_PROMPT,
  DEFAULT_SPEECH_RECOGNITION_LANGUAGE_CODE,
  DEFAULT_VOICE,
  models
} from "@/lib/constants";
import { speechRecognitionLanguages } from "@/lib/speechRecognitionLanguages";
import { MainStateDispatch, Model, SettingsType, SpeechRecognitionLanguageCode, Voice } from "@/lib/types";
import { isGoogleVoice, voiceNames, voices } from "@/lib/voices";
import { Settings } from "lucide-react";
import { FC } from "react";
import styled from "styled-components";
import { IconContainer } from "./IconContainer";
import { Modal } from "./Modal";

type SettingsModalContentProps = {
  mainStateDispatch: MainStateDispatch;
  settings: SettingsType;
  hasGoogleApiKey: boolean;
};

const SettingsModalContent: FC<SettingsModalContentProps> = ({
  mainStateDispatch,
  settings,
  hasGoogleApiKey,
}) => {
  const currentModel = settings.model;
  const currentVoice = settings.voice;
  const currentPrompt = settings.prompt;
  const currentInitialMessage = settings.initialMessage;
  const currentSpeechRecognitionLanguageCode = settings.speechRecognitionLanguageCode;

  const handleSettingsChange = (settings: SettingsType) => {
    mainStateDispatch({
      type: "SET_SETTINGS",
      payload: settings,
    });
  };

  // Function to get the current URL with updated settings as query parameters
  const getShareableURL = () => {
    const params = new URLSearchParams();

    if (settings.model !== DEFAULT_MODEL) {
      // TODO: Find a way to remove these "as Model" assertions.
      params.set("model", settings.model as Model);
    }
    if (settings.voice !== DEFAULT_VOICE) {
      params.set("voice", settings.voice);
    }
    if (settings.prompt !== DEFAULT_PROMPT) {
      params.set("prompt", settings.prompt);
    }
    if (settings.initialMessage !== DEFAULT_INITIAL_MESSAGE) {
      params.set("initialMessage", settings.initialMessage);
    }
    if (settings.speechRecognitionLanguageCode !== DEFAULT_SPEECH_RECOGNITION_LANGUAGE_CODE) {
      params.set("speechLang", settings.speechRecognitionLanguageCode);
    }

    const paramsString = params.toString();
    const url = `${window.location.origin}${window.location.pathname}`;

    return paramsString ? `${url}?${params.toString()}` : url;
  };

  return (
    <SettingsContainer>
      {/* Model */}
      <SettingRow>
        <label style={{ margin: "auto 0" }}>Model:</label>
        <SettingsSelect
          value={currentModel as Model}
          onChange={(e) => handleSettingsChange({ ...settings, model: e.target.value as Model })}
        // onBlur={handleSettingsChange}
        >
          {Object.keys(models).map((modelName) => (
            <option key={modelName} value={modelName}>
              {modelName}
            </option>
          ))}
        </SettingsSelect>
      </SettingRow>

      {/* Voice */}
      <SettingRow>
        <label style={{ margin: "auto 0" }}>Voice:</label>
        <SettingsSelect
          value={currentVoice}
          onChange={(e) => handleSettingsChange({ ...settings, voice: e.target.value as Voice })}
        >
          {voiceNames.map((voiceName) => (
            <option key={voiceName} value={voiceName}>
              {voices[voiceName].gender}: {voiceName} ({voices[voiceName].provider})
            </option>
          ))}
        </SettingsSelect>
      </SettingRow>
      {!hasGoogleApiKey && isGoogleVoice(currentVoice) && (
        <SettingRow style={{ color: "red" }}>
          <label></label>
          Warning: no Google Cloud key detected. Please select another voice.
        </SettingRow>
      )}
      {/* <SettingRow style={{ justifyContent: "center" }}> */}
      <SettingRow>
        <label></label>
        <a
          href="https://cloud.google.com/text-to-speech/docs/voices"
          target="_blank"
          rel="noreferrer"
        >
          Google Cloud text to speech voices
        </a>
      </SettingRow>
      <SettingRow>
        <label></label>
        <a
          href="https://platform.openai.com/docs/guides/text-to-speech"
          target="_blank"
          rel="noreferrer"
        >
          OpenAI text to speech voices
        </a>
      </SettingRow>

      {/* Prompt */}
      <SettingRow>
        <label>Prompt:</label>
        <SettingsTextArea
          value={currentPrompt}
          onChange={(e) => handleSettingsChange({ ...settings, prompt: e.target.value })}
          rows={5}
          style={{ width: "100%" }}
        ></SettingsTextArea>
      </SettingRow>

      {/* Initial Message */}
      <SettingRow>
        <label>Initial Message:</label>
        <SettingsTextArea
          value={currentInitialMessage}
          onChange={(e) => handleSettingsChange({ ...settings, initialMessage: e.target.value })}
          rows={5}
          style={{ width: "100%" }}
        ></SettingsTextArea>
      </SettingRow>

      {/* Speech Recognition Language */}
      <SettingRow>
        <label style={{ margin: "auto 0" }}>Speech Recog. Language:</label>
        <SettingsSelect
          value={currentSpeechRecognitionLanguageCode}
          onChange={(e) => handleSettingsChange({ ...settings, speechRecognitionLanguageCode: e.target.value as SpeechRecognitionLanguageCode })}
        >
          {Object.keys(speechRecognitionLanguages).map((languageCode) => (
            <option key={languageCode} value={languageCode}>
              {speechRecognitionLanguages[languageCode as SpeechRecognitionLanguageCode]}
            </option>
          ))}
        </SettingsSelect>
      </SettingRow>
      <SettingRow>
        <label></label>
        <a
          href="https://github.com/JamesBrill/react-speech-recognition/blob/master/docs/API.md#language-string"
          target="_blank"
          rel="noreferrer"
        >
          All available speech recognition languages
        </a>
      </SettingRow>


      {/* Shareable URL */}
      <SettingRow>
        <label>Shareable URL:</label>
        <SettingsTextArea
          readOnly
          value={getShareableURL()}
          onClick={(e) => e.currentTarget.select()}
          rows={5}
          style={{ width: "100%" }}
        ></SettingsTextArea>
      </SettingRow>
    </SettingsContainer>
  );
};

type SettingsModalProps = SettingsModalContentProps & {
  isOpen: boolean;
};

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  settings,
  mainStateDispatch,
  hasGoogleApiKey,
}) => {
  return (
    <>
      <IconContainer onClick={() => mainStateDispatch({ type: "TOGGLE_SETTINGS_MODAL" })}>
        <Settings size={CORNER_ICON_SIZE} />
      </IconContainer>
      {isOpen && (
        <Modal onClose={() => mainStateDispatch({ type: "TOGGLE_SETTINGS_MODAL" })}>
          <SettingsModalContent
            mainStateDispatch={mainStateDispatch}
            settings={settings}
            hasGoogleApiKey={hasGoogleApiKey}
          />
        </Modal>
      )}
    </>
  );
};

const SettingsContainer = styled.div`
  padding-top: 30px;
  width: 600px;
  max-width: 100%;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  max-width: 100%;

  & label {
    width: 80px; // Set fixed width for labels
    flex-shrink: 0; // Ensure the label doesn't shrink below 200px
    margin-bottom: auto;
  }

  & select,
  & textarea {
    flex-grow: 1; // Allow the input and textarea to take up the remaining space
    width: calc(100% - 200px); // Subtract the width of the label
  }
`;

const SettingsTextArea = styled.textarea`
  border: 1px solid #ccc;
`;

const SettingsSelect = styled.select`
  border: 1px solid #ccc;
  padding: 4px;
`;
