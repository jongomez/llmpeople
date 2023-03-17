import {
  AbstractMesh,
  Bone,
  Color3,
  Debug,
  Mesh,
  MorphTarget,
  Scene,
  SceneLoader,
  Skeleton,
  Vector3,
} from "babylonjs";
import { random } from "lodash";
import { playMorphTargetAnim } from "./utils";

type MyMesh = AbstractMesh | Mesh;
export default class Humanoid {
  name: string = "";
  skeleton: Skeleton = null;
  morphTargetNames: string[] = [
    "Face.M_F00_000_00_Fcl_ALL_Neutral",
    "Face.M_F00_000_00_Fcl_ALL_Angry",
    "Face.M_F00_000_00_Fcl_ALL_Fun",
    "Face.M_F00_000_00_Fcl_ALL_Joy",
    "Face.M_F00_000_00_Fcl_ALL_Sorrow",
    "Face.M_F00_000_00_Fcl_ALL_Surprised",
    "Face.M_F00_000_00_Fcl_BRW_Angry",
    "Face.M_F00_000_00_Fcl_BRW_Fun",
    "Face.M_F00_000_00_Fcl_BRW_Joy",
    "Face.M_F00_000_00_Fcl_BRW_Sorrow",
    "Face.M_F00_000_00_Fcl_BRW_Surprised",
    "Face.M_F00_000_00_Fcl_EYE_Natural",
    "Face.M_F00_000_00_Fcl_EYE_Angry",
    "Face.M_F00_000_00_Fcl_EYE_Close",
    "Face.M_F00_000_00_Fcl_EYE_Close_R",
    "Face.M_F00_000_00_Fcl_EYE_Close_L",
    "Face.M_F00_000_00_Fcl_Eye_Fun",
    "Face.M_F00_000_00_Fcl_EYE_Joy",
    "Face.M_F00_000_00_Fcl_EYE_Joy_R",
    "Face.M_F00_000_00_Fcl_EYE_Joy_L",
    "Face.M_F00_000_00_Fcl_EYE_Sorrow",
    "Face.M_F00_000_00_Fcl_EYE_Surprised",
    "Face.M_F00_000_00_Fcl_EYE_Spread",
    "Face.M_F00_000_00_Fcl_EYE_Iris_Hide",
    "Face.M_F00_000_00_Fcl_EYE_Highlight_Hide",
    "Face.M_F00_000_00_Fcl_EYE_Extra",
    "Face.M_F00_000_00_Fcl_MTH_Up",
    "Face.M_F00_000_00_Fcl_MTH_Down",
    "Face.M_F00_000_00_Fcl_MTH_Angry",
    "Face.M_F00_000_00_Fcl_MTH_Neutral",
    "Face.M_F00_000_00_Fcl_MTH_Fun",
    "Face.M_F00_000_00_Fcl_MTH_Joy",
    "Face.M_F00_000_00_Fcl_MTH_Sorrow",
    "Face.M_F00_000_00_Fcl_MTH_Surprised",
    "Face.M_F00_000_00_Fcl_MTH_SkinFung",
    "Face.M_F00_000_00_Fcl_MTH_SkinFung_R",
    "Face.M_F00_000_00_Fcl_MTH_SkinFung_L",
    "Face.M_F00_000_00_Fcl_MTH_A",
    "Face.M_F00_000_00_Fcl_MTH_I",
    "Face.M_F00_000_00_Fcl_MTH_U",
    "Face.M_F00_000_00_Fcl_MTH_E",
    "Face.M_F00_000_00_Fcl_MTH_O",
    "Face.M_F00_000_00_Fcl_HA_Hide",
    "Face.M_F00_000_00_Fcl_HA_Fung1",
    "Face.M_F00_000_00_Fcl_HA_Fung1_Low",
    "Face.M_F00_000_00_Fcl_HA_Fung1_Up",
    "Face.M_F00_000_00_Fcl_HA_Fung2",
    "Face.M_F00_000_00_Fcl_HA_Fung2_Low",
    "Face.M_F00_000_00_Fcl_HA_Fung2_Up",
    "Face.M_F00_000_00_Fcl_HA_Fung3",
    "Face.M_F00_000_00_Fcl_HA_Fung3_Up",
    "Face.M_F00_000_00_Fcl_HA_Fung3_Low",
    "Face.M_F00_000_00_Fcl_HA_Short",
    "Face.M_F00_000_00_Fcl_HA_Short_Up",
    "Face.M_F00_000_00_Fcl_HA_Short_Low",
    "EyeExtra_01.M_F00_000_00_EyeExtra_On",
  ];
  intervalId: number = 0;
  mainMesh: AbstractMesh | Mesh = null;
  meshes: MyMesh[] = [];
  trackingBone: Bone = null;
  ellipsoid = null; // FOR DEBUGGING: show the ellipsoid used for the cc.
  loaded = false;
  currentAnimationName: string = "";
  skeletonViewer: any = {};
  faceMesh: Mesh = null;
  blinkingInfluence: number = 0;
  isBlinkingLeftEye = false;
  isBlinkingRightEye = false;
  isTalking = false;
  yOffset = 0.1;

  constructor(
    private meshFileName: string,
    private modelName: any,
    private scene: Scene,
    private startAnim: string,
    private callback: () => void,
    private activate = true,
    private DEBUG = false
  ) {
    this.name = this.meshFileName.split(".")[0];
    this.intervalId = window.setInterval(this.afterImport.bind(this), 300);

    // (childMeshes, particleSystems, skeletons) => {
    SceneLoader.ImportMeshAsync(
      "",
      "models/Model3_9.babylon",
      "",
      this.scene,
      null
    ).then((res) => {
      this.skeleton = res.skeletons[0];
      this.meshes = res.meshes;
      this.mainMesh = res.meshes[0];
      this.setFaceMesh();

      for (const mesh of res.meshes) {
        mesh.position.y += this.yOffset;
        mesh.alwaysSelectAsActiveMesh = true;

        // Only show when all meshes are rendered. This is an alternative to scene.executeWhenReady
        // HACK! Way of hiding the mesh that actually renders the mesh (doing .isVisible = false will not render the mesh)
        // mesh.position.z = 1000;
        // (mesh as Mesh).onAfterRenderObservable.addOnce((renderedMesh) => {
        //   this.renderedMeshes.add(renderedMesh.name);
        // });
      }

      this.mainMesh.skeleton = this.skeleton;

      // Improves performance when we're picking stuff with rays. Also, this doesn't work (meshes deformed with rigs are on GPU, picking is done with CPU).
      // In order to pick the mesh, we'll use the this.colliders boxes.
      this.mainMesh.isPickable = false;
      // XXX: If this is false, how come cc collides the mesh with the ground??? BECAUSE it sets an ellipsoid, and calls moveWithCollision().
      // ... so no need for checkCollisions to be true.
      this.mainMesh.checkCollisions = false;

      this.mainMesh.receiveShadows = false;

      this.setAnim(this.startAnim);

      // Rotate the character, so the z axis is pointing forward.
      this.mainMesh.rotation.y = Math.PI;

      if (!this.activate) this.mainMesh.setEnabled(false);

      // Handle mesh shadows, backface culling, etc.
      // this.childMeshes = childMeshes
      // this.processChildMeshes()

      if (this.DEBUG) this.DEBUGSTUFF();
    });
  }

  hide() {
    this.mainMesh.setEnabled(false);
  }

  show() {
    this.mainMesh.setEnabled(true);
  }

  // XXX: This is probably not necessary... but okay.
  playAnimation(animationName, loop) {
    // let animationRange = this.skeleton.getAnimationRange(animationName);
    // this.scene.beginAnimation(this.skeleton, from, to, loop, 1);

    this.skeleton.beginAnimation(animationName, loop);
  }

  // Call this function OUTSIDE of the ImportMesh callback. Otherwise console errors will just say "error on ImportMesh".
  afterImport() {
    if (
      this.skeleton != null
      //this.renderedMeshes.size === this.meshes.length
    ) {
      window.clearInterval(this.intervalId);

      //this.meshes.map((mesh) => (mesh.position.z = 0));

      // This removes the specular thing from THE SKIN MATERIALS
      /*
      if ("subMaterials" in this.mainMesh && this.mainMesh.subMaterials !== undefined) {
        for (let m of this.mainMesh.subMaterials) {
          this.processMaterial(m);
        }
      } else {
        this.processMaterial(this.mainMesh.material);
      }
      */

      this.loaded = true;

      // XXX: WARNING: Without this... you'll get the t-poses in between anim change.
      // https://www.html5gamedevs.com/topic/32712-animation-interpolation-and-blendingspeed/
      this.skeleton.enableBlending(0.1);

      this.callback();

      window.setTimeout(() => this.blink(), 2000);

      this.talk();
    }
  }

  processMaterial(material) {
    material.specularIntensity = 0;
    material.metallicF0Factor = 0;
    // 0.4 is a truly magical value. It removes the weird black shapes in the characters.
    material.roughness = 0.4;

    material.backFaceCulling = false;
  }

  setDefaultEllipsoid() {
    this.updateEllipsoid(new Vector3(0.15, 1, 0.15), new Vector3(0, 1, 0.1));
  }

  updateEllipsoid(diameter, offset) {
    this.mainMesh.ellipsoid = diameter;
    this.mainMesh.ellipsoidOffset = offset;
    //this.mainMesh.refreshBoundingInfo();
  }

  copyPropsToOtherHumanoid(otherHumanoid) {
    otherHumanoid.mainMesh.position = this.mainMesh.position.clone();
  }

  // Can be a pose, or anim, or a frame. (a pose is an anim with only 1 frame I guess)
  // Why use animName, if we could just pass in the frame??? Because skeleton.beginAnimation uses the animName to begin. IT'S EASIER.
  setAnim(animName, poseFrame = -1, starPaused = false) {
    const startSpeedRatio = 1;

    // Don't remember why I added this here :shrug:
    //this.disableSkeletonBlending();

    let animatable = this.skeleton.beginAnimation(
      animName,
      true,
      startSpeedRatio
    );
    let animRange = this.skeleton.getAnimationRange(animName);

    if (poseFrame == -1) poseFrame = animRange.from;

    animatable.goToFrame(poseFrame);

    if (starPaused) {
      animatable.pause();
    }

    this.skeleton.enableBlending(1);
  }

  disableSkeletonBlending() {
    this.skeleton.bones.forEach(function (bone) {
      bone.animations.forEach(function (animation) {
        animation.enableBlending = false;
      });
    });
  }

  getMorphTargetByName(morphTargetName: string): MorphTarget | null {
    const morphTargetIndex = this.morphTargetNames.indexOf(morphTargetName);

    if (morphTargetIndex === -1) {
      console.error("morphTargetIndex is -1 :(");
      return null;
    }

    return this.faceMesh.morphTargetManager.getTarget(morphTargetIndex);
  }

  setFaceMesh() {
    const faceMeshArray = this.meshes.filter((mesh) => {
      return mesh.name === "Face";
    });
    const faceMesh = faceMeshArray[0] as Mesh;

    if (!faceMesh) {
      console.error("Error - couldn't find face mesh :(");
      return;
    }

    this.faceMesh = faceMesh;
  }

  blink() {
    if (this.isBlinkingLeftEye || this.isBlinkingRightEye) {
      return;
    }

    const blinkOpenTimeSeconds = 0.15;
    const blinkCloseTimeSeconds = 0.2;

    const leftEyeCloseTarget = this.getMorphTargetByName(
      "Face.M_F00_000_00_Fcl_EYE_Close_L"
    );
    const rightEyeCloseTarget = this.getMorphTargetByName(
      "Face.M_F00_000_00_Fcl_EYE_Close_R"
    );

    this.isBlinkingRightEye = true;
    this.isBlinkingLeftEye = true;

    const blinkEndCallback = (isLeftEye: boolean) => {
      if (isLeftEye) {
        this.isBlinkingLeftEye = false;
      } else {
        this.isBlinkingRightEye = false;
      }

      if (this.isBlinkingLeftEye || this.isBlinkingRightEye) {
        return;
      }

      window.setTimeout(() => this.blink(), random(2000, 8000));
    };

    playMorphTargetAnim(
      "leftEyeBlink",
      [0, blinkCloseTimeSeconds, blinkOpenTimeSeconds],
      [0, 1, 0],
      leftEyeCloseTarget,
      () => blinkEndCallback(true),
      this.scene
    );
    playMorphTargetAnim(
      "rightEyeBlink",
      [0, blinkCloseTimeSeconds, blinkOpenTimeSeconds],
      [0, 1, 0],
      rightEyeCloseTarget,
      () => blinkEndCallback(false),
      this.scene
    );
  }

  talk() {
    if (this.isTalking) {
      return;
    }

    const maxTime = 0.5;
    const minTime = 0.2;

    const aTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_A");
    // const eTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_E");
    // const iTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_I");
    // const oTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_O");
    // const uTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_U");

    //const allVowelTargets = [aTarget, eTarget, iTarget, oTarget, uTarget];

    const vowelAnimEnd = () => {
      playMorphTargetAnim(
        "aSoundAnim",
        [0, random(minTime, maxTime), random(minTime, maxTime)],
        [0, 1, 0],
        aTarget,
        vowelAnimEnd,
        this.scene
      );
    };

    this.isTalking = true;
    playMorphTargetAnim(
      "aSoundAnim",
      [0, random(minTime, maxTime), random(minTime, maxTime)],
      [0, 1, 0],
      aTarget,
      vowelAnimEnd,
      this.scene
    );
  }

  DEBUGSTUFF() {
    if (this.skeletonViewer == null) {
      // 1st call:

      // DEBUG
      this.scene.registerAfterRender(() => {
        this.DEBUGSTUFF();
      });

      // var dummyBox = new MeshBuilder.CreateBox("dummyBox", { size: 0.05 }, this.scene)
      // var CoTAxis = localAxes(1, 0); CoTAxis.parent = dummyBox

      //var LBreastAxesViewer = new Debug.BoneAxesViewer(scene, LBreastBoneTipObject, mainMesh);
      //var RBreastAxesViewer = new Debug.BoneAxesViewer(scene, RBreastBone, mainMesh);

      this.skeletonViewer = new Debug.SkeletonViewer(
        this.skeleton,
        this.mainMesh,
        this.scene
      );
      this.skeletonViewer.isEnabled = true;
      this.skeletonViewer.color = Color3.White();
    } else {
      // SUBSEQUENT CALLS:
      this.skeletonViewer.update();

      //this.updateEllipsoidMesh();

      // let dragMesh = this.scene.getMeshByName(this.skeleton.name + "_dragMesh");
      // this.trackingBone = this.skeleton.bones[this.skeleton.getBoneIndexByName("Hips")];

      // if (this.trackingBone != null && dragMesh != null) {
      //     //dragMesh.position = this.trackingBone.getAbsolutePosition(this.mainMesh);
      // } else if (this.trackingBone != null && dragMesh == null) {
      //     this.draggable();
      // }
    }
  }
}
