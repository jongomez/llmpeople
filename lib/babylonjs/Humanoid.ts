import {
  AbstractMesh,
  AnimationGroup,
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
import { getMorphTargetIndex, playMorphTargetAnim } from "./utils";
// Enable GLTF/GLB loader (side-effects)
import "@babylonjs/loaders/glTF";
import "babylonjs-loaders";
import { ModelConfig } from "../types";

type MyMesh = AbstractMesh | Mesh;

export class Humanoid {
  name: string = "";
  skeleton: Skeleton | null = null;
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
  currentAnimGroup: AnimationGroup | null = null;
  currentAnimName: string = "";
  animationGroups: AnimationGroup[] = [];
  blinkTimeoutId: number | null = null;

  constructor(
    private modelName: any,
    public scene: Scene,
    private modelConfig: ModelConfig,
    private callback: () => void,
    private activate = true,
    private DEBUG = false
  ) {
    this.intervalId = window.setInterval(this.afterImport.bind(this), 300);

    // SceneLoader.ImportMeshAsync("", "/", modelDataURL, this.scene, null).then((res) => {

    SceneLoader.ImportMesh(
      "",
      "/",
      this.modelName + ".glb",
      scene,
      (meshes, particleSystems, skeletons, animationGroups) => {
        this.skeleton = skeletons[0];
        this.meshes = meshes;
        this.mainMesh = meshes[0];
        this.setFaceMesh();
        this.animationGroups = animationGroups;

        for (const mesh of meshes) {
          mesh.position.addInPlace(this.modelConfig.positionOffset);
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

        this.setAnim(this.modelConfig.initialAnimation);

        // Rotate the character, so the z axis is pointing forward.
        this.mainMesh.rotation.y = Math.PI;

        if (!this.activate) this.mainMesh.setEnabled(false);

        // Handle mesh shadows, backface culling, etc.
        // this.childMeshes = childMeshes
        // this.processChildMeshes()

        if (this.DEBUG) this.DEBUGSTUFF();
      },
      undefined,
      (scene, errorMessage, errorObj) => {
        console.error("Error loading mesh:", errorMessage, "\nerrorObj:", errorObj);
      },
      ".glb"
    );
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

      // NOTE: The following enableBlending is for regular bone animations, not animation groups.
      // XXX: WARNING: Without this, you'll get the t-poses in between anim change.
      // https://www.html5gamedevs.com/topic/32712-animation-interpolation-and-blendingspeed/
      // this.skeleton.enableBlending(0.1);

      this.callback();

      this.blinkTimeoutId = window.setTimeout(() => this.blink(), 2000);

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

  // XXX: NOTE: When a .glb file is loaded, an animation group starts automatically.
  // Probably the first one on the list of animation groups.
  stopAllAnimationGroups() {
    for (const animationGroup of this.animationGroups) {
      animationGroup.stop();
    }
  }

  setAnim(animName: string, startPaused = false, onAnimationEnd?: () => void) {
    if (!this.skeleton) {
      return;
    }

    const startSpeedRatio = 1.0;

    // Don't remember why I added this here :shrug:
    //this.disableSkeletonBlending();

    // This getAnimationRanges works for animation ranges - but not for animation groups.
    // And .glb files have animation groups.
    // console.log("skeleton animation names:", this.skeleton.getAnimationRanges());

    const animationGroup = this.scene.getAnimationGroupByName(animName);

    if (!animationGroup) {
      console.error("animationGroup is null :(");
      return;
    }

    this.stopAllAnimationGroups();

    // If there is a onAnimationEnd callback, then we DO NOT want to loop the current anim.
    animationGroup.start(!onAnimationEnd, startSpeedRatio);

    // XXX: This onAnimationEnd logic was not tested.
    // (I also don't think it's being used anywhere)
    if (onAnimationEnd) {
      animationGroup.onAnimationEndObservable.addOnce(() => {
        if (onAnimationEnd) onAnimationEnd();
      });
    }

    if (startPaused) {
      animationGroup.pause();
    }

    this.currentAnimName = animName;
    this.currentAnimGroup = animationGroup;

    // The following enables blending when not using animation groups.
    // this.skeleton.enableBlending(0.05);
  }

  disableSkeletonBlending() {
    this.skeleton?.bones.forEach(function (bone) {
      bone.animations.forEach(function (animation) {
        animation.enableBlending = false;
      });
    });
  }

  getMorphTargetByName(morphTargetName: string | undefined): MorphTarget | null {
    if (!morphTargetName) {
      return null;
    }

    const morphTargetManager = this.faceMesh?.morphTargetManager;

    if (!morphTargetManager) {
      console.log("faceMesh is null or does not have a morphTargetManager :(");
      return null;
    }

    const morphTargetIndex = getMorphTargetIndex(morphTargetManager, morphTargetName);

    if (morphTargetIndex === -1) {
      console.error("morphTargetIndex is -1 :(");
      return null;
    }

    return morphTargetManager.getTarget(morphTargetIndex);
  }

  setFaceMesh() {
    const faceMeshArray = this.meshes.filter((mesh) => {
      return mesh.name === this.modelConfig.faceMeshName;
    });

    const faceMesh = faceMeshArray[0] as Mesh;

    if (!faceMesh) {
      console.warn("Couldn't find face mesh :( no face morph targets will be available.");
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
      this.modelConfig.morphTargets.leftEyeClose
    );
    const rightEyeCloseTarget = this.getMorphTargetByName(
      this.modelConfig.morphTargets.rightEyeClose
    );

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

      this.blinkTimeoutId = window.setTimeout(() => this.blink(), random(2000, 8000));
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

  getRandomIdleAnim(): string {
    // NOTE: idle1 also exists, but it's not very good.
    const idleAnims: string[] = ["idle3_hand_hips", "idle2"];

    // NOTE: The | "idle3_hand_hips" is there only to make TypeScript happy.
    return sample(idleAnims) || "idle3_hand_hips";
  }

  getRandomTalkingAnim(): string {
    //const talkingAnims: Anims[] = ["talking1", "talking3"];
    const talkingAnims: string[] = ["talking1", "talking2_head_shake", "talking3"];

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

    const mouthOpenTarget = this.getMorphTargetByName(this.modelConfig.morphTargets.mouthMovement);

    if (!mouthOpenTarget) {
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
        mouthOpenTarget,
        vowelAnimEnd,
        this.scene
      );
    };

    playMorphTargetAnim(
      "aSoundAnim",
      [0, random(minTime, maxTime), random(minTime, maxTime)],
      [0, 1, 0],
      mouthOpenTarget,
      vowelAnimEnd,
      this.scene
    );

    this.isTalking = true;

    //
    ////
    ////// Play talking body animation.

    // this.setAnim(sample(talkingAnims) || "talking3");
    const alternateBetweenAnims = (currentAnim: string, nextAnim: string) => {
      // console.log("alternateBetweenAnims - this.isTalking", this.isTalking);
      if (!this.isTalking) {
        return;
      }

      this.setAnim(currentAnim, false, () => {
        alternateBetweenAnims(nextAnim, currentAnim);
      });
    };

    alternateBetweenAnims(this.getRandomTalkingAnim(), this.currentAnimName || "idle3_hand_hips");
  }

  dispose() {
    this.scene.stopAllAnimations();

    // Remove all animation groups:
    // https://forum.babylonjs.com/t/proper-way-to-disconnect-and-reconnect-an-animation-group-in-scene/38878/9
    this.scene.animationGroups = [];

    if (this.blinkTimeoutId !== null) {
      window.clearTimeout(this.blinkTimeoutId);
    }

    this.mainMesh?.dispose();
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
