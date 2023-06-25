import { AboutDialog, Chat, Loading, PrivacyPolicy, Volume } from "@my/ui/src";
import { useGameContext } from "@my/ui/src/GameContextProvider";
import { WebGLNotSupported } from "components/WebGLErrors";
import { Humanoid } from "lib/babylonjs/Humanoid";
import { initBabylon } from "lib/babylonjs/init";
import { isBabylonInspectorShowing } from "lib/utils";
import React, { useEffect, useRef, useState } from "react";

let didInit = false;

// XXX: Setting the following to "false" helps when developing UI stuff. Because the canvas is not rendered, the UI is much faster to develop.
const showCanvas = true;

export interface CanvasThatDoesNotReRenderProps {
  setInitErrorMessage: (initErrorMessage: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  humanoidRef: React.MutableRefObject<Humanoid | null>;
}

const CanvasThatDoesNotReRender = React.memo(function CanvasThatDoesNotReRender({
  setInitErrorMessage,
  setIsLoading,
  humanoidRef,
}: CanvasThatDoesNotReRenderProps) {
  useEffect(() => {
    if (didInit) {
      // If we"re here, then strict mode is on - reactStrictMode is true on the next.config.js
      console.warn("Warning - tried to initialize twice. Will skip 2nd initialization.");
      return;
    }

    const errorMessage = initBabylon(setIsLoading, humanoidRef);

    if (errorMessage) {
      setInitErrorMessage(errorMessage);
    }

    didInit = true;
  }, [setInitErrorMessage, setIsLoading, humanoidRef]);

  return (
    <canvas
      id="renderCanvas"
      style={{
        height: "100%",
        width: "100%",
      }}
    />
  );
});

export default function Game() {
  const [initErrorMessage, setInitErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(showCanvas);
  const humanoidRef = useRef<Humanoid | null>(null);
  const { soundController, acceptPrivacyPolicy, hasAcceptedPrivacyPolicy } = useGameContext();
  const aboutDialogTriggerRef = useRef<HTMLButtonElement>(null);

  if (initErrorMessage.includes("WebGL not supported")) {
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
      <Loading isLoading={isLoading} />

      <div
        id="canvasParent"
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
        }}
      >
        {!isLoading && (
          <>
            <AboutDialog aboutDialogTriggerRef={aboutDialogTriggerRef} />
            <Volume soundController={soundController} />
            <PrivacyPolicy
              acceptPrivacyPolicy={acceptPrivacyPolicy}
              hasAcceptedPrivacyPolicy={hasAcceptedPrivacyPolicy}
              onAnchorPress={() => {
                aboutDialogTriggerRef.current?.click();
              }}
            />
          </>
        )}
        {showCanvas && (
          <CanvasThatDoesNotReRender
            setIsLoading={setIsLoading}
            setInitErrorMessage={setInitErrorMessage}
            humanoidRef={humanoidRef}
          />
        )}
        <Chat
          display={isLoading ? "none" : "flex"}
          right={isBabylonInspectorShowing() ? "300px" : "0px"}
          audioReceivedCallback={(newAudio: HTMLAudioElement | null) => {
            soundController.humanoidSound.current?.pause();
            humanoidRef.current?.talkAnimationEnd("Received new audio");

            if (!newAudio) {
              return;
            }

            if (!soundController.isVolumeOn) {
              newAudio.volume = 0;
            }

            const onAudioEnd = () => {
              humanoidRef.current?.talkAnimationEnd("onAudioEnd");
            };

            // XXX: pause event is emitted after the pause() method is called or BEFORE an ended or seeking event
            // newAudio.addEventListener("pause", onAudioEnd);
            newAudio.addEventListener("ended", onAudioEnd);

            newAudio.play();

            soundController.humanoidSound.current = newAudio;

            humanoidRef.current?.talkAnimationStart();
          }}
        />
      </div>
    </div>
  );
}
