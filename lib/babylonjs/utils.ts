import {
  Animation,
  ArcRotateCamera,
  IAnimationKey,
  MorphTarget,
  MorphTargetManager,
  Scene,
  Vector3,
} from "babylonjs";
import { MAIN_CAMERA_NAME, models } from "../constants";
import { Model } from "../types";

export const v3 = (x: number = 0, y: number = 0, z: number = 0): Vector3 => {
  return new Vector3(x, y, z);
};

export const getMorphTargetNames = (morphTargetManager: MorphTargetManager): string[] => {
  const morphTargetNames: string[] = [];

  for (let i = 0; i < morphTargetManager.numTargets; i++) {
    morphTargetNames.push(morphTargetManager.getTarget(i).name);
  }

  return morphTargetNames;
};

export const playMorphTargetAnim = (
  name: string,
  durationsSeconds: number[],
  values: number[],
  morphTarget: MorphTarget,
  endCallback: () => void,
  scene: Scene
) => {
  const keyFrames: IAnimationKey[] = [];
  const framesPerSecond = 60;

  let previousFrame = 0;
  for (let i = 0; i < values.length; i++) {
    const currentFrame = previousFrame + durationsSeconds[i] * framesPerSecond;

    keyFrames.push({
      frame: currentFrame,
      value: values[i],
    });

    previousFrame = currentFrame;
  }

  const lastFrame = keyFrames.at(-1);

  var morphAnimation = new Animation(
    name,
    "influence",
    framesPerSecond,
    Animation.ANIMATIONTYPE_FLOAT
  );
  morphAnimation.setKeys(keyFrames);

  morphTarget.animations = [morphAnimation];

  if (!lastFrame) {
    throw new Error("lastFrame is undefined");
  }

  scene.beginAnimation(morphTarget, 0, lastFrame.frame, false, 1, endCallback);
};

// TODO: FIXME: I don't think this is working when models switch.
export const updateCamera = (modelName: Model, scene: Scene) => {
  const modelConfig = models[modelName];

  const modelCameraConfig = modelConfig.cameraConfig;

  // Get camera by name:
  scene.cameras.forEach((camera) => {
    if (camera.name === MAIN_CAMERA_NAME) {
      (camera as ArcRotateCamera).alpha = modelCameraConfig.alpha;
      (camera as ArcRotateCamera).beta = modelCameraConfig.beta;
      (camera as ArcRotateCamera).radius = modelCameraConfig.radius;
      (camera as ArcRotateCamera).target = modelCameraConfig.target;

      // Collisions may override the values we set. Disable collisions just to compute the world matrix.
      (camera as ArcRotateCamera).checkCollisions = false;
      (camera as ArcRotateCamera).computeWorldMatrix();
      (camera as ArcRotateCamera).checkCollisions = true;

      // XXX: For debugging purposes:
      // @ts-ignore
      window.camera = camera;
    }
  });
};

export const getMorphTargetIndex = (
  morphTargetManager: MorphTargetManager,
  targetName: string
): number => {
  for (let i = 0; i < morphTargetManager.numTargets; i++) {
    const target = morphTargetManager.getTarget(i);

    if (target.name == targetName) {
      return i;
    }
  }

  return -1;
};
