import { AboutModal } from "@/components/About";
import { useGameContext } from "@/components/GameContextProvider";
import { Loading } from "@/components/Loading";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { SettingsModal } from "@/components/Settings";
import { Volume } from "@/components/Volume";
import { WebGLNotSupported } from "@/components/WebGLErrors";
import { Chat } from "@/components/chat/Chat.client";
import { useGetInitialSettings } from "@/components/hooks";
import { initBabylon } from "@/lib/babylonjs/init";
import { setHumanoid } from "@/lib/babylonjs/setHumanoid";
import { updateCamera } from "@/lib/babylonjs/utils";
import { defaultState, mainStateReducer } from "@/lib/mainStateUtils";
import { MainState, MainStateAction, MainStateDispatch, Model } from "@/lib/types";
import React, { useEffect } from "react";
import styled from "styled-components";
import { useImmerReducer } from "use-immer";

let didInit = false;

// XXX: Setting the following to "false" helps when developing UI stuff. Because the canvas is not rendered, the UI is much faster to develop.
const showCanvas = true;

export interface CanvasThatDoesNotReRenderProps {
  mainStateDispatch: MainStateDispatch;
  modelName: Model | null;
}

const CanvasThatDoesNotReRender = React.memo(function CanvasThatDoesNotReRender({
  mainStateDispatch,
  modelName,
}: CanvasThatDoesNotReRenderProps) {
  const { humanoidRef } = useGameContext();

  useEffect(() => {
    // This use effect is called when the model changes. If there is an existing model, it
    // first removes the existing model from the scene, then adds the new model to the scene.
    if (humanoidRef.current && modelName) {
      const scene = humanoidRef.current.scene;

      humanoidRef.current.dispose();
      setHumanoid(humanoidRef, modelName, scene);
      updateCamera(modelName, scene);
    }
  }, [modelName, humanoidRef]);

  useEffect(() => {
    if (!modelName) {
      // If modelName is not set, then we probably haven't loaded the settings from the URL yet.
      return;
    }

    if (didInit) {
      // If we"re here, then strict mode is on - reactStrictMode is true on the next.config.js
      console.warn("Warning - tried to initialize twice. Will skip 2nd initialization.");
      return;
    }

    try {
      const setIsLoading = (isLoading: boolean) => {
        mainStateDispatch({ type: "SET_IS_LOADING", payload: isLoading });
      };

      const scene = initBabylon(setIsLoading, modelName);

      setHumanoid(humanoidRef, modelName, scene);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        mainStateDispatch({ type: "SET_INIT_ERROR_MESSAGE", payload: error.message });
      }
    }

    didInit = true;
  }, [mainStateDispatch, humanoidRef, modelName]);

  return (
    <canvas
      id="renderCanvas"
      style={{
        position: "absolute",
        height: "100vh",
        width: "100vw",
      }}
    />
  );
});

type GameProps = {
  hasGoogleApiKey: boolean;
};

const Game: React.FC<GameProps> = ({ hasGoogleApiKey }) => {
  const [mainState, mainStateDispatch] = useImmerReducer<MainState, MainStateAction>(
    mainStateReducer,
    defaultState
  );

  useGetInitialSettings(mainStateDispatch, mainState.settings);

  if (mainState.initErrorMessage.includes("WebGL not supported")) {
    return <WebGLNotSupported />;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Loading is wrapped in a div because of this: https://stackoverflow.com/questions/54880669/react-domexception-failed-to-execute-removechild-on-node-the-node-to-be-re  */}
      {/* The reason is babylonJS adds a sneaky parent div to the canvas */}
      <Loading isLoading={mainState.isLoading} />

      <div
        id="canvasParent"
        style={{
          height: "100vh",
          width: "100vw",
          position: "relative",
        }}
      >
        {/* {!mainState.isLoading && (
          <> */}

        <TopCornerButtons>
          <SettingsModal
            isOpen={mainState.settingsModalIsOpen}
            mainStateDispatch={mainStateDispatch}
            settings={mainState.settings}
            hasGoogleApiKey={hasGoogleApiKey}
          />

          <AboutModal isOpen={mainState.aboutModalIsOpen} mainStateDispatch={mainStateDispatch} />

          <Volume
            mainStateDispatch={mainStateDispatch}
            isVolumeOn={mainState.soundController.isVolumeOn}
          />
        </TopCornerButtons>
        <PrivacyPolicy
          mainStateDispatch={mainStateDispatch}
          hasAcceptedPrivacyPolicy={mainState.hasAcceptedPrivacyPolicy}
        />

        <Chat
          mainStateDispatch={mainStateDispatch}
          chatState={mainState.chatState}
          settings={mainState.settings}
        />

        {/* </>
        )} */}

        {showCanvas && (
          <CanvasThatDoesNotReRender
            mainStateDispatch={mainStateDispatch}
            modelName={mainState.settings.model}
          />
        )}
      </div>
    </div>
  );
};

const TopCornerButtons = styled.div`
  position: fixed;
  top: 12px;
  left: 15px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  z-index: 100000;
`;

export default Game;

export async function getStaticProps() {
  const hasGoogleApiKey = Boolean(process.env.GOOGLE_API_KEY);

  return {
    props: {
      hasGoogleApiKey,
    },
    // revalidate: 10,
  };
}
