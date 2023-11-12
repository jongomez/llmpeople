import {
  ArcRotateCamera,
  Color3,
  Engine,
  EnvironmentHelper,
  HemisphericLight,
  MeshBuilder,
  Nullable,
  Scene,
} from "babylonjs";
import { models } from "../constants";
import { handleError } from "../error";
import { CameraConfig, Model } from "../types";
import { isBabylonInspectorShowing } from "../utils";
import { createCamera } from "./objects";
import { v3 } from "./utils";

const loadBackground = (scene: Scene): Nullable<EnvironmentHelper> => {
  var options = {
    groundColor: Color3.White(),
    groundSize: 4,
  };

  const environmentHelper = scene.createDefaultEnvironment(options);

  return environmentHelper;
};

const enableCollisions = (scene: Scene, camera: ArcRotateCamera) => {
  const invisibleGround = MeshBuilder.CreateGround(
    "Invisibleground",
    { width: 50, height: 50 },
    scene
  );

  invisibleGround.isVisible = false;
  invisibleGround.checkCollisions = true;

  camera.checkCollisions = true;

  scene.collisionsEnabled = true;
};

let isLoading = true;

export const initBabylon = (
  setIsLoading: (isLoading: boolean) => void,
  modelName: Model
): Scene => {
  console.log("Initializing scene...");

  // Get the canvas DOM element
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

  // Simulate WebGL not supported error:
  //canvas.getContext = () => {};

  if (canvas === null) {
    handleError(new Error("Could not get canvas with getElementById :("));
  }

  // Load the 3D engine
  let engine: Engine;

  engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });

  // function customLoadingScreen() {
  //   console.log("customLoadingScreen creation");
  // }
  // customLoadingScreen.prototype.displayLoadingUI = function () {};
  // customLoadingScreen.prototype.hideLoadingUI = function () {};
  // var loadingScreen = new customLoadingScreen();
  // engine.loadingScreen = loadingScreen;

  // XXX: NOTE: This is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
  BABYLON.Animation.AllowMatricesInterpolation = true;

  var scene = createScene(engine, models[modelName].cameraConfig, canvas);

  // Handle animation group blending and loop animations by default.
  scene.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
  scene.animationPropertiesOverride.enableBlending = true;
  scene.animationPropertiesOverride.blendingSpeed = 0.05;
  scene.animationPropertiesOverride.loopMode = 1;

  engine.runRenderLoop(function () {
    // NOTE: The following executeWhenReady makes sure we only show stuff when everything is:
    // - Done loading
    // - Done rendering (including shaders and stuff)

    scene.executeWhenReady(() => {
      if (isLoading) {
        setIsLoading(false);
        isLoading = false;
      }
      scene.render();
    });
  });

  // the canvas/window resize event handler
  window.addEventListener("resize", function () {
    engine.resize();
  });

  return scene;
};

// CreateScene function that creates and return the scene
const createScene = function (
  engine: Engine,
  cameraConfig: CameraConfig,
  canvas: HTMLCanvasElement
) {
  // Create a basic BJS Scene object
  const scene = new Scene(engine);
  // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
  // const camera = new ArcRotateCamera("Steve", Math.PI / 2, 0, 4, v3(), scene);

  // const camera = createCameraWithAxesInCorner(scene);
  const camera = createCamera(scene, cameraConfig);

  // Attach the camera to the canvas
  camera.attachControl(canvas, true);
  // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
  const light = new HemisphericLight("light1", v3(0, 1, 0), scene);

  // const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);

  const environmentHelper = loadBackground(scene);

  enableCollisions(scene, camera);

  if (!isBabylonInspectorShowing() && process.env.NEXT_PUBLIC_SHOW_BABYLON_INSPECTOR === "true") {
    import("babylonjs-inspector");
    // overlay: true does not create a parent div for the canvas. It just adds the inspector elements as siblings.
    scene.debugLayer.show({ overlay: true });
  }

  // Return the created scene
  return scene;
};
