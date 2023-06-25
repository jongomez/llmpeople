import {
  Animation,
  IAnimationKey,
  MorphTarget,
  MorphTargetManager,
  Scene,
  Vector3,
} from "babylonjs";

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

export const getInfluence = (
  startTimeMilliseconds: number,
  durationMilliseconds: number,
  influenceFrom: number,
  influenceTo: number
) => {
  const timeElapsedMilliseconds = Date.now() - startTimeMilliseconds;
  const timeElapsedPercentage = timeElapsedMilliseconds / durationMilliseconds;

  if (timeElapsedPercentage >= 1) {
    return influenceTo;
  }

  const influenceInterval = influenceTo - influenceFrom;
  const influenceOffset = influenceInterval * timeElapsedPercentage;

  return influenceFrom + influenceOffset;
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
