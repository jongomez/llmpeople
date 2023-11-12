import { Scene } from "babylonjs";
import { models } from "../constants";
import { HumanoidRef, Model } from "../types";
import { Humanoid } from "./Humanoid";

export const setHumanoid = (humanoidRef: HumanoidRef, modelName: Model, scene: Scene) => {
  const modelConfig = models[modelName];

  humanoidRef.current = new Humanoid(modelName, scene, modelConfig, () => {
    // console.log("After import callback called!");
  });

  // XXX: For debugging purposes:
  // @ts-ignore
  window.humanoid = humanoidRef.current;
};
