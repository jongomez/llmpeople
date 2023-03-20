import { Chat, Loading } from "@my/ui/src";
import { WebGLNotSupported } from "components/WebGLErrors";
import { initBabylon } from "lib/babylonjs/init";
import { isBabylonInspectorShowing } from "lib/utils";
import React, { useEffect, useState } from "react";

let didInit = false;

interface CanvasThatDoesNotReRenderProps {
  setInitErrorMessage: (initErrorMessage: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const CanvasThatDoesNotReRender = React.memo(function CanvasThatDoesNotReRender({
  setInitErrorMessage,
  setIsLoading,
}: CanvasThatDoesNotReRenderProps) {
  useEffect(() => {
    if (didInit) {
      // If we"re here, then strict mode is on - reactStrictMode is true on the next.config.js
      console.warn("Warning - tried to initialize twice. Will skip 2nd initialization.");
      return;
    }

    const errorMessage = initBabylon(setIsLoading);

    if (errorMessage) {
      setInitErrorMessage(errorMessage);
    }

    didInit = true;
  }, [setInitErrorMessage, setIsLoading]);

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
  const [isLoading, setIsLoading] = useState(true);
  const chatInputWidth = 300;
  const chatInputHeight = 80;

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
        <CanvasThatDoesNotReRender
          setIsLoading={setIsLoading}
          setInitErrorMessage={setInitErrorMessage}
        />
        <Chat
          display={isLoading ? "none" : "flex"}
          right={isBabylonInspectorShowing() ? "300px" : "0px"}
        />
      </div>
    </div>
  );
}
