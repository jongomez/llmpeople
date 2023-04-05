import { ArcRotateCamera, AxesViewer, Scene, Vector3 } from "babylonjs";
import { v3 } from "./utils";

const setAxisViewer = (camera: ArcRotateCamera, position: Vector3, axesViewer: AxesViewer) => {
  axesViewer.update(
    position,
    camera.getDirection(v3(1, 0, 0)),
    camera.getDirection(v3(0, 1, 0)),
    camera.getDirection(v3(0, 0, 1))
  );
};

type AxesViewerAndAxesCamera = {
  axesViewer: AxesViewer;
  axesCamera: ArcRotateCamera;
};

const createAxesViewerAndAxesCamera = (scene: Scene): AxesViewerAndAxesCamera => {
  const axesViewer = new AxesViewer(scene, 2);
  var axesCamera = new ArcRotateCamera("AxesCamera", Math.PI / 2, 0, 8, v3(), scene);

  const axesCameraViewportSize = 0.15;
  axesCamera.viewport = new BABYLON.Viewport(
    1 - axesCameraViewportSize,
    0,
    axesCameraViewportSize,
    axesCameraViewportSize
  );

  axesViewer.xAxis.getChildMeshes().forEach((mesh) => {
    mesh.layerMask = 0x10000000;
  });
  axesViewer.yAxis.getChildMeshes().forEach((mesh) => {
    mesh.layerMask = 0x10000000;
  });
  axesViewer.zAxis.getChildMeshes().forEach((mesh) => {
    mesh.layerMask = 0x10000000;
  });

  // Restricts the camera to viewing objects with the same layerMask.
  axesCamera.layerMask = 0x10000000;

  return { axesCamera, axesViewer };
};

export const createCamera = (scene: Scene): ArcRotateCamera => {
  const camera = new ArcRotateCamera(
    "MainCamera",
    -Math.PI / 2,
    Math.PI / 2.5,
    2.5,
    v3(0, 0.7, 0),
    scene
  );
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 7;
  camera.upperBetaLimit = Math.PI / 1.5;

  camera.wheelPrecision = 20;

  return camera;
};

export const createCameraWithAxesInCorner = (scene: Scene): ArcRotateCamera => {
  const camera = createCamera(scene);

  // This is to hide the axes viewer. The axes viewer should only be visible by the axes camera, not this camera.
  camera.layerMask = 0x0fffffff;
  //camera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1.0);

  const { axesViewer, axesCamera } = createAxesViewerAndAxesCamera(scene);

  //setAxisViewer(camera, v3(), axesViewer);

  camera.onViewMatrixChangedObservable.add(() => {
    setAxisViewer(camera, v3(), axesViewer);
  });

  if (!scene.activeCameras) {
    console.error("No active camera found :(");
    return camera;
  }

  scene.activeCameras.push(camera);
  scene.activeCameras.push(axesCamera);

  return camera;

  /*

TODO: 
- Use the following approach, instead of the above one.

export const createCameraWithAxesInCorner = (scene: Scene): ArcRotateCamera => {
  const camera = new ArcRotateCamera("Steve", Math.PI / 2, 0, 4, v3(), scene);
  const axesViewer = new AxesViewer(scene, 0.5);
  const axesViewerParent = new TransformNode("axesViewerParent");
  axesViewerParent.parent = camera;

  axesViewer.xAxis.parent = axesViewerParent;
  axesViewer.yAxis.parent = axesViewerParent;
  axesViewer.zAxis.parent = axesViewerParent;

  axesViewerParent.position = v3(1, 0, 2);

  scene.registerBeforeRender(function () {
    if (!scene.activeCamera) {
      console.error("No active camera found :(");
      return;
    }

    axesViewerParent.rotationQuaternion = scene.activeCamera.absoluteRotation;
  });

  return camera;
};

*/
};
