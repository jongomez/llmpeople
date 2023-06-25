import {
  AbstractMesh,
  Bone,
  Color3,
  Debug,
  Mesh,
  MorphTarget,
  PBRMaterial,
  Scene,
  SceneLoader,
  Skeleton,
  Vector3,
} from "babylonjs";
import { random, sample } from "lodash";
import myModel from "../models/Model3_11.json";
import { playMorphTargetAnim } from "./utils";

type MyMesh = AbstractMesh | Mesh;

type Anims =
  | "idle1"
  | "idle2"
  | "idle3_hand_hips"
  | "talking1"
  | "talking2_head_shake"
  | "talking3";
export class Humanoid {
  name: string = "";
  skeleton: Skeleton | null = null;
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
  mainMesh: AbstractMesh | Mesh | null = null;
  meshes: MyMesh[] = [];
  trackingBone: Bone | null = null;
  ellipsoid = null; // FOR DEBUGGING: show the ellipsoid used for the cc.
  loaded = false;
  currentAnimationName: string = "";
  skeletonViewer: any = {};
  faceMesh: Mesh | null = null;
  blinkingInfluence: number = 0;
  isBlinkingLeftEye = false;
  isBlinkingRightEye = false;
  isTalking = false;
  yOffset = 0.1;
  currentAnimName: Anims | "" = "";
  previousAnimName: Anims | "" = "";

  constructor(
    private meshFileName: string,
    private modelName: any,
    private scene: Scene,
    private startAnim: Anims,
    private callback: () => void,
    private activate = true,
    private DEBUG = false
  ) {
    this.name = this.meshFileName.split(".")[0];
    this.intervalId = window.setInterval(this.afterImport.bind(this), 300);

    const modelDataString = JSON.stringify(myModel);
    const modelDataBase64 = btoa(modelDataString);
    const modelDataURL = `data:application/json;base64,${modelDataBase64}`;

    SceneLoader.ImportMeshAsync("", "/", modelDataURL, this.scene, null).then((res) => {
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
    this.mainMesh?.setEnabled(false);
  }

  show() {
    this.mainMesh?.setEnabled(true);
  }

  // XXX: This is probably not necessary... but okay.
  playAnimation(animationName: string, loop: boolean) {
    // let animationRange = this.skeleton.getAnimationRange(animationName);
    // this.scene.beginAnimation(this.skeleton, from, to, loop, 1);

    this.skeleton?.beginAnimation(animationName, loop);
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

      // Debug the talking animations.
      // this.talkAnimationStart();
    }
  }

  processMaterial(material: PBRMaterial) {
    material.specularIntensity = 0;
    material.metallicF0Factor = 0;
    // 0.4 is a truly magical value. It removes the weird black shapes in the characters.
    material.roughness = 0.4;

    material.backFaceCulling = false;
  }

  setDefaultEllipsoid() {
    this.updateEllipsoid(new Vector3(0.15, 1, 0.15), new Vector3(0, 1, 0.1));
  }

  updateEllipsoid(diameter: Vector3, offset: Vector3) {
    if (this.mainMesh) {
      this.mainMesh.ellipsoid = diameter;
      this.mainMesh.ellipsoidOffset = offset;
      //this.mainMesh.refreshBoundingInfo();
    }
  }

  copyPropsToOtherHumanoid(otherHumanoid: Humanoid) {
    if (otherHumanoid.mainMesh && this.mainMesh) {
      otherHumanoid.mainMesh.position = this.mainMesh.position.clone();
    }
  }

  // Can be a pose, or anim, or a frame. (a pose is an anim with only 1 frame I guess)
  // Why use animName, if we could just pass in the frame??? Because skeleton.beginAnimation uses the animName to begin. IT'S EASIER.
  setAnim(animName: Anims, poseFrame = -1, startPaused = false, onAnimationEnd?: () => void) {
    if (!this.skeleton) {
      return;
    }

    const startSpeedRatio = 1;

    // Don't remember why I added this here :shrug:
    //this.disableSkeletonBlending();

    // console.log("skeleton animation names:", this.skeleton.getAnimationRanges());

    // If there is a onAnimationEnd callback, then we DO NOT want to loop the current anim.
    let animatable = this.skeleton.beginAnimation(
      animName,
      !onAnimationEnd,
      startSpeedRatio,
      onAnimationEnd
    );

    let animRange = this.skeleton.getAnimationRange(animName);

    if (!animRange) {
      console.error("animRange is null :(");
      return;
    }

    if (!animatable) {
      console.error("animatable is null :(");
      return;
    }

    // If no poseFrame was passed in (-1 is the default value), use the first frame of the anim.
    if (poseFrame == -1) poseFrame = animRange.from;

    // animatable.goToFrame(poseFrame);

    if (startPaused) {
      animatable.pause();
    }

    // NOTE: previousAnimName and currentAnimName are not currently used.
    this.previousAnimName = this.currentAnimName;
    this.currentAnimName = animName;

    this.skeleton.enableBlending(0.05);
  }

  disableSkeletonBlending() {
    this.skeleton?.bones.forEach(function (bone) {
      bone.animations.forEach(function (animation) {
        animation.enableBlending = false;
      });
    });
  }

  getMorphTargetByName(morphTargetName: string): MorphTarget | null {
    if (!this.faceMesh?.morphTargetManager) {
      console.error("faceMesh is null or does not have a morphTargetManager :(");
      return null;
    }

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

    const leftEyeCloseTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_EYE_Close_L");
    const rightEyeCloseTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_EYE_Close_R");

    if (!leftEyeCloseTarget || !rightEyeCloseTarget) {
      return;
    }

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

  getRandomIdleAnim(): Anims {
    // NOTE: idle1 also exists, but it's not very good.
    const idleAnims: Anims[] = ["idle3_hand_hips", "idle2"];

    // NOTE: The | "idle3_hand_hips" is there only to make TypeScript happy.
    return sample(idleAnims) || "idle3_hand_hips";
  }

  getRandomTalkingAnim(): Anims {
    //const talkingAnims: Anims[] = ["talking1", "talking3"];
    const talkingAnims: Anims[] = ["talking1", "talking2_head_shake", "talking3"];

    // NOTE: The | "talking3" is there only to make TypeScript happy.
    return sample(talkingAnims) || "talking3";
  }

  talkAnimationEnd(info: string, playRandomIdleAnim = true) {
    // console.log("talkAnimationEnd - this.isTalking", this.isTalking, info);

    if (!this.isTalking) {
      return;
    }

    this.isTalking = false;

    if (playRandomIdleAnim) {
      this.setAnim(this.getRandomIdleAnim());
    }
  }

  talkAnimationStart() {
    // console.log("talkAnimationStart - this.isTalking", this.isTalking);

    if (this.isTalking) {
      return;
    }

    //
    ////
    ////// Play talking facial animation.

    const maxTime = 0.5;
    const minTime = 0.2;

    const aTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_A");
    // const eTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_E");
    // const iTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_I");
    // const oTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_O");
    // const uTarget = this.getMorphTargetByName("Face.M_F00_000_00_Fcl_MTH_U");

    if (!aTarget) {
      return;
    }

    //const allVowelTargets = [aTarget, eTarget, iTarget, oTarget, uTarget];

    // Recursive thingy - when the animation ends, it calls itself again.
    const vowelAnimEnd = () => {
      // console.log("vowelAnimEnd - this.isTalking", this.isTalking);

      // XXX: This value probably comes from a closure, so it's probably not up to date???
      // Although if this is an object, it should be a reference, so it should be up to date?
      if (!this.isTalking) {
        return;
      }

      playMorphTargetAnim(
        "aSoundAnim",
        [0, random(minTime, maxTime), random(minTime, maxTime)],
        [0, 1, 0],
        aTarget,
        vowelAnimEnd,
        this.scene
      );
    };

    playMorphTargetAnim(
      "aSoundAnim",
      [0, random(minTime, maxTime), random(minTime, maxTime)],
      [0, 1, 0],
      aTarget,
      vowelAnimEnd,
      this.scene
    );

    this.isTalking = true;

    //
    ////
    ////// Play talking body animation.

    // this.setAnim(sample(talkingAnims) || "talking3");
    const alternateBetweenAnims = (currentAnim: Anims, nextAnim: Anims) => {
      // console.log("alternateBetweenAnims - this.isTalking", this.isTalking);
      if (!this.isTalking) {
        return;
      }

      this.setAnim(currentAnim, -1, false, () => {
        alternateBetweenAnims(nextAnim, currentAnim);
      });
    };

    alternateBetweenAnims(this.getRandomTalkingAnim(), this.currentAnimName || "idle3_hand_hips");
  }

  DEBUGSTUFF() {
    if (this.skeletonViewer == null) {
      if (this.skeleton == null) {
        console.error("skeleton is null :(");
        return;
      }

      if (this.mainMesh == null) {
        console.error("mainMesh is null :(");
        return;
      }

      // 1st call:

      // DEBUG
      this.scene.registerAfterRender(() => {
        this.DEBUGSTUFF();
      });

      // var dummyBox = new MeshBuilder.CreateBox("dummyBox", { size: 0.05 }, this.scene)
      // var CoTAxis = localAxes(1, 0); CoTAxis.parent = dummyBox

      //var LBreastAxesViewer = new Debug.BoneAxesViewer(scene, LBreastBoneTipObject, mainMesh);
      //var RBreastAxesViewer = new Debug.BoneAxesViewer(scene, RBreastBone, mainMesh);

      this.skeletonViewer = new Debug.SkeletonViewer(this.skeleton, this.mainMesh, this.scene);
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
