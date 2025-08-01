import {
  AbstractMesh,
  ActionManager,
  AnimationGroup,
  ArcRotateCamera,
  Bone,
  Color3,
  Color4,
  CreateBox,
  ExecuteCodeAction,
  IPhysicsCollisionEvent,
  Mesh,
  MeshBuilder,
  Nullable,
  PhysicsAggregate,
  PhysicsEngine,
  PhysicsEventType,
  PhysicsMotionType,
  PhysicsRaycastResult,
  PhysicsShapeType,
  Quaternion,
  Ray,
  RayHelper,
  Scalar,
  Scene,
  SceneLoader,
  Skeleton,
  Sound,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { GRAVITY } from "../App";
import { getFurMaterial } from "../utils";
import { AnimationKey, InputMap, PlayerKeys, PlayerDirection } from "./types";
import { GameEnvironment as GameEnvironment } from "../GameEnvironnement";

class PlayerController {
  debug: boolean = true;

  public player!: Mesh;
  private playerPhysicsAggregate!: PhysicsAggregate;

  private scene!: Scene;
  private camera!: ArcRotateCamera;
  environment: GameEnvironment;
  thirdPerson: boolean;
  private physicsEngine: Nullable<PhysicsEngine>;

  private inputMap: InputMap = {};

  private playerDirection = -1;

  private moveDirection = new Vector3(0, 0, 0);
  private velocity = new Vector3(0, 0, 0);

  private readonly baseImpulseStrength = GRAVITY * 10;
  private impulseStrength = this.baseImpulseStrength;
  private readonly jumpImpulse = GRAVITY * 250;
  private readonly stepImpulse = GRAVITY * 400;

  readonly maxNbJumps = 3; // max number of jumps
  readonly maxJumpHeight = 3; // default max jump height limit
  readonly jumpRegenInterval = 750; // in  ms - 0.75s btw each jump regeneration ticks

  private playerState = {
    isMoving: false, // if the player moves
    isInSleep: false, // if the player is in sleep mode
    isWakingUp: false, // if the player is waking up
    isRunning: false, // is the player running
    isOnGround: false, // is the player on the ground
    step: {
      stepTask: false, // is there a task to go up a step
      stepHeight: 0, // height of the step
    },
    jump: {
      airState: {
        startHeight: 0, // starting height of the jump
        limit: this.maxJumpHeight, // maximum height of the jump
        jump: false, // if the player is jumping (currently in the air)
        fall: false, // if the player is falling (currently in the air)
        jumpTask: false, // Is there is a task to jump (a jump press has been detected)
      },
      stamina: {
        current: this.maxNbJumps, // current nb jumps available
        regenTimer: 0, // timer for regeneration
        canJump: true, // to indicate if player can jump
      },
    },
  };

  // rays used to detect a small step in front of the player
  private stepRays: [Ray, RayHelper | null, PhysicsRaycastResult][] = [];
  // rays used to detect the ground under the player
  private groundRays: [Ray, RayHelper | null, PhysicsRaycastResult][] = [];

  // player hitbox dimensions
  private hitBoxHeight = 3.6;
  private hitBoxRadius = 0.5;

  // box helper for dir
  private boxHelper!: Mesh;

  // player mesh loaded from the glb file
  private playerSkeletons!: Skeleton[];
  private playerHeroMeshes!: AbstractMesh[];
  private playerAnimationGroups!: AnimationGroup[];

  // player sounds
  public sounds!: { walking: Sound };

  // player keys
  public playerKeys: PlayerKeys = {
    up: "KeyW",
    down: "KeyS",
    left: "KeyA",
    right: "KeyD",
    jumping: "Space",
    running: "ShiftLeft",
    grab: "KeyG",
    push: "KeyP",
    rightHand: "KeyR",
    leftHand: "KeyL",
  };

  // base speed of the player multiplied to delta time and impulse strength
  private readonly playerSpeed: number = 1;
  // player mass
  private readonly playerMass = 55; // Player mass

  // win meshes when player collides with them it triggers a win condition // TO DO: TO IMPROVE
  public winMeshes: any;
  private triggeredWinMeshes: Set<any> = new Set(); // to keep track of already triggered win meshes

  // --- ADDED PROPERTIES FOR GRABBING ---
  private grabbedObject: Nullable<PhysicsAggregate> = null;
  private readonly grabDistance = 2; // Max distance to grab an object
  private readonly throwStrength = 150; // Impulse strength for throwing
  private frontGrabAttachmentPoint!: TransformNode; // An invisible node to hold the object
  releasedTime: number | null = null; // Time when the object was released

  private rightHandBone: Nullable<Bone> = null;
  private leftHandBone: Nullable<Bone> = null;
  // private handAttachmentNode: Nullable<TransformNode> = null;
  private rightHandObj: Mesh | null = null;
  private leftHandObj: Mesh | null = null;
  private rightHandObjAggregate: Nullable<PhysicsAggregate> = null;
  private leftHandObjAggregate: Nullable<PhysicsAggregate> = null;

  constructor(
    scene: Scene,
    environnement: GameEnvironment,
    thirdPers: boolean = true
  ) {
    this.scene = scene;
    this.environment = environnement;
    this.camera = environnement.camera;
    this.thirdPerson = thirdPers; // to use the third person view (true) or first person view (false) // for the moment 1st not working
    this.physicsEngine = this.scene.getPhysicsEngine() as PhysicsEngine; // get havok physics engine
    this.winMeshes = [];
    this.init();
  }

  async init() {
    this.player = await this._loadPlayer(this.scene);
    // set the camera target to the player
    this.camera?.setTarget(this.player);
    // this.setPlayerPhysics();

    this.setupHandAttachment();
    this.testAttachObjectToHand();

    // set the movement keys and the keys observer
    this.setKeysObserver();

    // set player sounds
    this.setPlayerSounds();

    // --- START: ADDED GRAB ATTACHMENT POINT INITIALIZATION ---
    // Create an invisible transform node and parent it to the player.
    // This will act as the point where a grabbed object is held.
    this.frontGrabAttachmentPoint = new TransformNode(
      "attachmentPoint",
      this.scene
    );
    this.frontGrabAttachmentPoint.parent = this.player;
    // Position the attachment point in front of and slightly above the player capsule's center
    this.frontGrabAttachmentPoint.position = new Vector3(
      0,
      0.5,
      this.hitBoxRadius + 1.2
    );

    // show the attachment point in debug mode
    if (this.debug) {
      const attachmentPointMesh = MeshBuilder.CreateSphere(
        "attachmentPointSphere",
        { diameter: 0.2 },
        this.scene
      );
      attachmentPointMesh.position = this.frontGrabAttachmentPoint.position;
      attachmentPointMesh.material = new StandardMaterial(
        "attachmentPointMaterial",
        this.scene
      );
      (attachmentPointMesh.material as StandardMaterial).emissiveColor =
        Color3.Green();
      attachmentPointMesh.parent = this.frontGrabAttachmentPoint; // Attach to the attachment point
    }
    // --- END: ADDED GRAB ATTACHMENT POINT INITIALIZATION ---

    this.player.position = new Vector3(49, 12, 58);
    this.setPlayerToSleep();

    this.scene.onBeforeRenderObservable.add(() => {
      this.updateGrabbedObject();
      this.updateHandObjects();
    });
  }

  private async _loadPlayer(
    scene: Scene,
    mesheNames: string = "",
    rootUrl: string = "/api/assets/models/",
    sceneFilename: string = "bearCharacter.glb" // https://mycould.tristan-patout.fr/api/fuzzelton/assets/models/bearCharacter.glb
  ): Promise<Mesh> {
    // Load player meshes async
    const {
      meshes: heroMeshes,
      skeletons,
      animationGroups,
    } = await SceneLoader.ImportMeshAsync(
      mesheNames,
      rootUrl,
      sceneFilename,
      scene
    );

    var hero = heroMeshes[0];
    // var skeleton = skeletons[0];

    // Setting the bear fur material
    const fur = getFurMaterial(this.scene);
    heroMeshes.forEach((mesh) => {
      // if mesh name does not contain the word eye, mouth, nose
      if (
        !mesh.name.toLowerCase().includes("eye") &&
        !mesh.name.toLowerCase().includes("mouth") &&
        !mesh.name.toLowerCase().includes("nose")
      ) {
        mesh.material = fur;
      }
    });

    // Set the priority of the animations to idle
    animationGroups.forEach((item, index) => {
      // console.log("anim", item.name);
      item.play(true);
      if (index === AnimationKey.Idle) {
        item.setWeightForAllAnimatables(1);
      } else {
        item.setWeightForAllAnimatables(0);
      }
    });

    // box helper used for dir
    this.boxHelper = MeshBuilder.CreateBox(
      "characterControllerBoxHelper",
      { height: 3.2, width: 1.2 },
      this.scene
    );

    this.boxHelper.position.y = 3;

    // Create the player as a Capsule and attach the hero mesh to it as a child
    // this is done to compute the physics of the player on this capsule and the hero meshes will follow
    const player = MeshBuilder.CreateCapsule(
      "playerCapsule",
      { height: this.hitBoxHeight, radius: this.hitBoxRadius },
      this.scene
    );
    if (this.debug) {
      this.boxHelper.visibility = 0.7;
      player.visibility = 0.7;
    } else {
      this.boxHelper.visibility = 0;
      player.visibility = 0;
    }

    // Align the meshes to the player (capsule)
    hero.scaling = new Vector3(0.75, 0.95, 0.75);
    // hero.scaling = new Vector3(2, 2, 2);
    hero.position.y = -1.8;

    // Attach the hero mesh to the player
    player.addChild(hero);

    this.playerHeroMeshes = heroMeshes;
    this.playerSkeletons = skeletons;
    this.playerAnimationGroups = animationGroups;

    // Add shadows
    heroMeshes.forEach((mesh) => {
      this.environment.addShadowsToMesh(mesh as Mesh);
    });

    return player;
  }

  public async setPlayerPhysics() {
    // const mesheRoot: AbstractMesh = this.playerHeroMeshes[0];
    const player: Mesh = this.player;
    player.checkCollisions = true;

    // physics aggregate for the player
    const aggregate = new PhysicsAggregate(
      player, // The mesh to apply the physics to
      PhysicsShapeType.CAPSULE, // Use capsule shape for physics
      {
        mass: this.playerMass,
        friction: 1,
        restitution: 0,
      },
      this.scene
    );

    // Set player collision masks
    // Player belongs to group 1
    const playerShape = aggregate.shape;
    playerShape.filterMembershipMask = 1;
    // Player collides with everything (15) EXCEPT held objects (6)
    playerShape.filterCollideMask = 15 & ~6;

    // motion type dynamic ( player can move under physics)
    aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);

    // Disable pre-step calculations for performance improvement
    aggregate.body.disablePreStep = false;

    // Set the mass properties for the physics body with no inertia
    aggregate.body.setMassProperties({
      inertia: new Vector3(0, 0, 0),
    });

    // linear damping to prevent excessive sliding and momentum buildup
    aggregate.body.setLinearDamping(4.9);
    aggregate.body.setAngularDamping(1.9);

    // Enable collision callback (we will use that for when the player collides with other objects)
    // then set up a collision observer to trigger a callback when a collision occurs
    aggregate.body.setCollisionCallbackEnabled(true);
    const collisionObservable = aggregate.body.getCollisionObservable();
    collisionObservable.add(this.onCollision);

    this.playerPhysicsAggregate = aggregate;

    // setup the rays to detect the ground and steps for the player
    this.setPlayerRays();
  }

  private setPlayerRays() {
    this.setupStepRays();
    this.setupGroundRays();
  }

  private setupStepRays() {
    // Create and attach 4 rays for step up detection
    const stepRays = [
      new Vector3(0, -this.hitBoxHeight / 2 + 0.6, this.hitBoxRadius + 0.1),
      new Vector3(0, -this.hitBoxHeight / 2 + 0.6, -this.hitBoxRadius - 0.1),
      new Vector3(-this.hitBoxRadius - 0.1, -this.hitBoxHeight / 2 + 0.6, 0),
      new Vector3(this.hitBoxRadius + 0.1, -this.hitBoxHeight / 2 + 0.6, 0),
    ];

    for (let i = 0; i < stepRays.length; i++) {
      const ray = new Ray(
        Vector3.Zero(),
        Vector3.Up(),
        this.hitBoxHeight / 2 // length of the ray
      );
      const rayHelper = new RayHelper(ray);

      rayHelper.attachToMesh(
        this.player,
        new Vector3(0, -1, 0),
        stepRays[i],
        0.599 // we don't want to detect the ground but the step so must be less than 0.6 as set to +0.6
      );

      this.stepRays.push([ray, rayHelper, new PhysicsRaycastResult()]);
    }
  }

  private setupGroundRays() {
    // Create multiple ground rays at different positions for detecting the ground beneath the player
    const groundRays = [
      new Vector3(0, 0, 0), // Center
      new Vector3(this.hitBoxRadius * 0.7, 0, 0), // Right
      new Vector3(-this.hitBoxRadius * 0.7, 0, 0), // Left
      new Vector3(0, 0, this.hitBoxRadius * 0.7), // Front
      new Vector3(0, 0, -this.hitBoxRadius * 0.7), // Back
    ];

    for (let i = 0; i < groundRays.length; i++) {
      const ray = new Ray(Vector3.Zero(), Vector3.Down());
      const rayHelper = new RayHelper(ray);

      rayHelper.attachToMesh(
        this.player,
        new Vector3(0, -1, 0),
        new Vector3(
          groundRays[i].x,
          -this.hitBoxHeight / 2 + 0.5,
          groundRays[i].z
        ),
        1
      );

      this.groundRays.push([ray, rayHelper, new PhysicsRaycastResult()]);
    }
  }

  private setPlayerSounds() {
    this.sounds = {
      walking: new Sound(
        "walking_sound",
        "/sounds/walking.wav",
        this.scene,
        null,
        {
          volume: 0.5,
          loop: true,
        }
      ),
    };
  }

  private setKeysObserver() {
    this.scene.actionManager = new ActionManager();

    // For key down events
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.code] = true;

        // Handle grabbing on first G press
        if (
          evt.sourceEvent.code === this.playerKeys.grab &&
          !this.grabbedObject
        ) {
          this.tryGrabObject();
        }
      })
    );

    // For key up events
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.code] = false;

        // Handle throwing when G is released while holding an object
        if (
          evt.sourceEvent.code === this.playerKeys.grab &&
          this.grabbedObject
        ) {
          this.releaseObject();
        }

        this.inputKeyUp();
      })
    );
  }

  private inputKeyUp() {
    if (this.playerState.isInSleep || this.playerState.isWakingUp) return;
    // if none of the movement keys are pressed
    // console.log("inputKeyUp ", this.inputMap);
    if (
      !this.inputMap[this.playerKeys.up] &&
      !this.inputMap[this.playerKeys.down] &&
      !this.inputMap[this.playerKeys.left] &&
      !this.inputMap[this.playerKeys.right]
    ) {
      // console.log(
      //   "Not moving, in the air ? ->" +
      //     this.playerState.jump.airState.jumpTask +
      //     " on step ? ->" +
      //     this.playerState.isOnStep
      // );
      this.playerState.isMoving = false;
      this.sounds.walking.pause(); // stop walking sound maybe put somewhere else

      // if not in the air => play the idle animation
      if (!this.playerState.jump.airState.jumpTask) {
        // console.log("Not in this air and not moving ");
        this.onAnimWeight(AnimationKey.Idle);
      } else {
        // check if ground raycast detects the ground
        if (this.playerState.isOnGround) {
          // console.log("touching ground but in the air... ");
          this.playerState.jump.airState.jumpTask = false;
          this.playerState.jump.airState.jump = false;
          this.playerState.jump.airState.fall = false;
          // this.velocity.y = -GRAVITY;
          this.playerState.isMoving = true; // to see if this unbloc the player (apparently yes we are not stuck under objects anymore)
          this.onAnimWeight(AnimationKey.Idle);
        }
      }

      // if on the steps and not moving => clear the task
      if (this.playerState.step.stepTask) {
        // console.log("Not on step and not moving ...");
        this.playerState.step.stepTask = false;
      }
    }

    if (!this.inputMap[this.playerKeys.running]) {
      this.playerState.isRunning = false;
    }
  }

  public onBeforeAnimations() {
    // smooth transition between the current and previous animations

    // if the current anim is AnimationKey.StandingUp we should way for it to finish before playing the other animation
    if (this.curAnimParam.anim === AnimationKey.StandingUp) {
      if (this.playerAnimationGroups[this.curAnimParam.anim].isPlaying) {
        console.log("Waiting for standing up animation to finish...");
        return;
      } else {
        console.log("Standing up animation finished.");
        this.playerState.isWakingUp = false;
        this.onAnimWeight(AnimationKey.Idle);
      }
    }
    // If current animation's weight < 1 (not fully playing yet)
    if (this.curAnimParam.weight < 1) {
      // increase current animation's weight gradually by 0.05 (ensure it stays between 0 and 1)
      this.curAnimParam.weight = Scalar.Clamp(
        this.curAnimParam.weight + 0.05,
        0,
        1
      );

      // Get the current animation from the animationGroups array using the index from curAnimParam
      const anim = this.playerAnimationGroups[this.curAnimParam.anim];

      // Set the weight of the current animation using the updated weight value
      anim.setWeightForAllAnimatables(this.curAnimParam.weight);
    }

    // If the previous animation's weight is greater than 0 (it's still active)
    if (this.oldAnimParam.weight > 0) {
      // Gradually decrease the previous animation's weight by 0.05
      this.oldAnimParam.weight = Scalar.Clamp(
        this.oldAnimParam.weight - 0.05,
        0,
        1
      );

      // Get the previous animation from the animationGroups array using the index from oldAnimParam
      const anim = this.playerAnimationGroups[this.oldAnimParam.anim];

      // Set the weight of the previous animation using the updated weight value
      anim.setWeightForAllAnimatables(this.oldAnimParam.weight);
    }

    // ensures all other animations are paused
    this.playerAnimationGroups?.forEach((ani, key) => {
      if (key !== this.oldAnimParam.anim && key !== this.curAnimParam.anim) {
        ani.setWeightForAllAnimatables(0);
      }
    });
  }

  private onCollision = async (event: IPhysicsCollisionEvent) => {
    // ...
    // Show the edges of the collided mesh for debugging
    // if (this.debug) {
    //   // Get the collided mesh from the physics body
    //   const collidedMesh = event?.collidedAgainst?.transformNode as Mesh;

    //   if (collidedMesh) {
    //     // console.log("Collision with", collidedMesh.name);

    //     // Create an EdgesRenderer on the collided mesh
    //     const edgesRenderer = collidedMesh.enableEdgesRendering();

    //     edgesRenderer.edgesColor = new Color4(1, 0, 0, 1);
    //     collidedMesh.edgesWidth = 4.0;

    //     // disable edges after 1 second
    //     setTimeout(() => {
    //       collidedMesh.disableEdgesRendering();
    //     }, 1000);
    //   }
    // }

    // console.log("collision - player position", this.player.position);
    // console.log("collision point", event?.point);
    if (
      event.type === PhysicsEventType.COLLISION_STARTED && // collision started
      this.playerState.jump.airState.jumpTask &&
      (event?.point?._y || event?.point?.y || 0) >
        this.player.position.y + this.hitBoxHeight / 2.4 // collision point is above the player (we should do /2 but /2.3 so we take a little margin precaution to be sure)
    ) {
      // console.log("hit the head");
      // end jump since landed or hit something
      this.playerState.jump.airState.jumpTask = false;
      this.playerState.jump.airState.jump = false;
      this.playerState.jump.airState.fall = true; // now falling
    }

    // Check if the player has hit a win mesh
    if (
      event.type === PhysicsEventType.COLLISION_STARTED && // collision started
      this.winMeshes &&
      this.winMeshes.length > 0
    ) {
      try {
        const collidedMesh = event.collidedAgainst.transformNode as Mesh;

        // Check if the collided mesh is one of the win meshes
        for (let i = 0; i < this.winMeshes.length; i++) {
          const [winMesh, onWin] = this.winMeshes[i];

          // skip if this win mesh has already been triggered
          if (this.triggeredWinMeshes.has(winMesh)) {
            console.log("win mesh already triggered skipping :", winMesh.name);
            continue;
          }

          if (collidedMesh === winMesh) {
            console.log("Player collided with win mesh:", winMesh.name);

            // mwe mark this win mesh as triggered
            this.triggeredWinMeshes.add(winMesh);

            // Stop player movement
            this.stopPlayerMovement();

            // Call the onWin callback and wait for it to finish
            await onWin();
            return;
          }
        }
      } catch (error) {
        console.error("Error handling win mesh collision:", error);
      }
    }
  };

  private stopPlayerMovement(): void {
    Object.keys(this.inputMap).forEach((key) => {
      this.inputMap[key] = false;
    });

    this.playerState.isMoving = false;
    this.playerState.jump.airState.jump = false;
    this.playerState.jump.airState.fall = false;
    this.playerState.jump.airState.jumpTask = false;
    this.playerState.step.stepTask = false;

    this.velocity.setAll(0);
    this.moveDirection.setAll(0);

    if (this.player?.physicsBody) {
      this.player.physicsBody.setLinearVelocity(Vector3.Zero());
      this.player.physicsBody.setAngularVelocity(Vector3.Zero());
    }

    if (this.sounds?.walking.isPlaying) {
      this.sounds.walking.stop();
    }

    this.onAnimWeight(AnimationKey.Idle);

    this.playerState.jump.stamina.current = this.maxNbJumps;
    this.playerState.jump.stamina.canJump = true;
    this.playerState.jump.stamina.regenTimer = 0;
    this.playerState.jump.airState.limit = this.maxJumpHeight;
  }

  public resetWinConditions(): void {
    this.triggeredWinMeshes.clear();
  }

  public setWinCollisionMesh(winMesh, onWin: () => void): void {
    if (winMesh) {
      console.log("Setting win collision mesh:", winMesh.name);
      this.winMeshes.push([winMesh, onWin]);
    } else {
      console.warn("Attempted to set undefined mesh as win condition");
    }
  }

  private isOnGround(): boolean {
    for (let i = 0; i < this.groundRays.length; i++) {
      if (this.groundRays[i][2].hasHit) {
        return true;
      }
    }

    return false;
  }

  private checkStepCollision(): [
    Ray,
    RayHelper | null,
    PhysicsRaycastResult
  ][] {
    let hasHit: [Ray, RayHelper | null, PhysicsRaycastResult][] = [];
    for (let i = 0; i < this.stepRays.length; i++) {
      const [ray, rayHelper, res] = this.stepRays[i];
      if (res.hasHit) {
        hasHit.push([ray, rayHelper, res]);
      }
    }
    return hasHit;
  }

  // private checkGroundCollision(): [
  //   Ray,
  //   RayHelper | null,
  //   PhysicsRaycastResult
  // ][] {
  //   let hasHit: [Ray, RayHelper | null, PhysicsRaycastResult][] = [];
  //   for (let i = 0; i < this.groundRays.length; i++) {
  //     const [ray, rayHelper, res] = this.groundRays[i];
  //     if (res.hasHit) {
  //       hasHit.push([ray, rayHelper, res]);
  //     }
  //   }
  //   return hasHit;
  // }

  private movePlayer(delta: number) {
    if (
      this.playerState.step.stepTask &&
      !this.playerState.jump.airState.jump &&
      !this.playerState.jump.airState.fall &&
      this.player.position.y - this.hitBoxHeight / 2 <
        this.playerState.step.stepHeight &&
      this.playerState.isMoving
    ) {
      this.moveDirection.y = this.stepImpulse;
    }

    if (
      this.playerState.step.stepTask &&
      !(this.checkStepCollision().length > 0) &&
      this.player.position.y - this.hitBoxHeight / 2 >=
        this.playerState.step.stepHeight &&
      !this.playerState.jump.airState.jump
    ) {
      this.playerState.step.stepTask = false;
    }

    if (!this.playerState.jump.airState.jump && !this.isOnGround()) {
      this.moveDirection.y = -this.jumpImpulse / 1.25;
    }

    if (this.playerState.jump.airState.jump) {
      this.playerState.jump.airState.jumpTask = true;
      this.moveDirection.y = this.jumpImpulse;
    }

    if (
      !this.playerState.isOnGround &&
      this.player.position.y >
        this.playerState.jump.airState.startHeight +
          this.playerState.jump.airState.limit &&
      this.playerState.jump.airState.jump
    ) {
      this.playerState.jump.airState.jump = false;
      this.playerState.jump.airState.fall = true;
      this.moveDirection.y = -this.jumpImpulse / 1.25;
    }

    if (
      !this.playerState.isOnGround &&
      this.playerState.jump.airState.fall &&
      !this.playerState.jump.airState.jump
    ) {
      this.moveDirection.y = -this.jumpImpulse / 1.25;
    }

    if (this.playerState.isMoving) {
      const dir = this.lookAtBox();
      let moveX = dir.x * this.impulseStrength * delta * this.playerSpeed;
      let moveZ = dir.z * this.impulseStrength * delta * this.playerSpeed;

      if (
        this.playerState.jump.airState.jump ||
        this.playerState.jump.airState.fall
      ) {
        moveX *= 0.8;
        moveZ *= 0.8;
      }

      this.moveDirection.x = moveX;
      this.moveDirection.z = moveZ;

      if (!this.sounds.walking.isPlaying) {
        this.sounds.walking.play();
      }
    } else {
      this.moveDirection.x = 0;
      this.moveDirection.z = 0;
    }

    if (this.player?.physicsBody) {
      this.player.physicsBody.applyImpulse(
        this.moveDirection,
        this.player.getAbsolutePosition()
      );
    }

    if (this.velocity.y) {
      this.player?.physicsBody?.setLinearVelocity(this.velocity);
    }

    this.moveDirection.setAll(0);
  }

  updatePlayer(deltaTime: number): void {
    if (!this.scene || !this.player) return;

    // if the player is in sleep mode we don't update the player
    if (this.playerState.isInSleep && !this.playerState.isWakingUp) {
      this.onAnimWeight(AnimationKey.Laying);
      return;
    }

    // if the player is waking up we set the animation
    // (and once finished isWakingUp should be set to false in onBeforeAnimations )
    if (this.playerState.isWakingUp) {
      this.onAnimWeight(AnimationKey.StandingUp);
      this.playerState.isWakingUp = false; // WE FORCE TO CORRECT IN ORDER FOR THE STANDING UP ANIM TO BE PLAYED PROPERLY      return;
    }

    // update the rays to check for ground and steps
    this.updateRays();

    // set the step task if the player is on a step
    const hitStepRays = this.checkStepCollision();
    if (hitStepRays.length > 0) {
      this.playerState.step.stepTask = true;
      this.playerState.step.stepHeight = hitStepRays[0][2].hitPointWorld.y;
    }

    // set the player isOnGround state
    this.playerState.isOnGround = this.isOnGround();
    // const hitGroundRays= this.checkGroundCollision()

    // update the player jump stamina base on the time passed
    this.updateJumpStamina(deltaTime);

    // update the player direction based on the input movements keys
    this.updatePlayerDirection();

    if (
      this.inputMap[this.playerKeys.up] ||
      this.inputMap[this.playerKeys.down] ||
      this.inputMap[this.playerKeys.left] ||
      this.inputMap[this.playerKeys.right]
    ) {
      this.playerState.isMoving = true;

      if (this.inputMap[this.playerKeys.running]) {
        this.playerState.isRunning = true;
        this.impulseStrength = this.baseImpulseStrength * 1.5;
      } else {
        this.playerState.isRunning = false;
        this.impulseStrength = this.baseImpulseStrength;
      }

      if (!this.playerState.jump.airState.jump && this.playerState.isOnGround) {
        this.onAnimWeight(AnimationKey.Running);
      }
    } else {
      this.playerState.isMoving = false;
      this.impulseStrength = this.baseImpulseStrength;
      this.sounds.walking.pause();
    }

    if (
      this.inputMap[this.playerKeys.jumping] &&
      !this.playerState.jump.airState.jump &&
      !this.playerState.jump.airState.jumpTask &&
      this.playerState.isOnGround &&
      this.playerState.jump.stamina.current > 0
    ) {
      const jumpHeightPercentage =
        this.playerState.jump.stamina.current / this.maxNbJumps;
      this.playerState.jump.airState.limit =
        this.maxJumpHeight * jumpHeightPercentage;

      this.playerState.jump.stamina.current--; // decrement the jump stamina of 1

      if (this.playerState.jump.stamina.current <= 0) {
        this.playerState.jump.stamina.canJump = false;
      }

      this.playerState.jump.airState.jump = true;
      this.playerState.jump.airState.startHeight = this.player.position.y;
      this.onAnimWeight(AnimationKey.Falling);
    } else if (
      this.inputMap[this.playerKeys.jumping] &&
      !this.playerState.jump.airState.jump &&
      !this.playerState.jump.airState.jumpTask &&
      this.playerState.isOnGround &&
      this.playerState.jump.stamina.current <= 0
    ) {
    }

    if (
      this.playerState.isOnGround &&
      this.playerState.jump.airState.fall &&
      !this.playerState.jump.airState.jump
    ) {
      this.playerState.jump.airState.fall = false;
      this.playerState.jump.airState.jumpTask = false;
      this.playerState.step.stepTask = false;
      if (this.playerState.isMoving) {
        this.onAnimWeight(AnimationKey.Running);
      } else {
        this.onAnimWeight(AnimationKey.Idle);
      }
    }

    if (
      this.inputMap[this.playerKeys.jumping] !== undefined &&
      !this.inputMap[this.playerKeys.jumping] &&
      this.playerState.isOnGround &&
      this.playerState.jump.airState.jumpTask
    ) {
      this.playerState.jump.airState.jumpTask = false;
    }

    if (!this.playerState.jump.airState.jump && !this.playerState.isOnGround) {
      this.playerState.jump.airState.fall = true;
      this.playerState.jump.airState.jump = false;
      this.onAnimWeight(AnimationKey.Falling);
    }

    if (
      !this.playerState.jump.airState.jump &&
      !this.playerState.jump.airState.jumpTask &&
      this.playerState.isOnGround &&
      this.curAnimParam.anim !== AnimationKey.Idle &&
      !this.playerState.isMoving
    ) {
      if (this.playerState.isMoving) {
        this.onAnimWeight(AnimationKey.Running);
      } else {
        this.onAnimWeight(AnimationKey.Idle);
      }
    }

    // Check for throw on G key release (safety check)
    // if (this.grabbedObject && !this.inputMap[this.playerKeys.grab]) {
    //   this.throwObject();
    // }

    this.movePlayer(deltaTime);
  }

  private updateJumpStamina(deltaTime: number): void {
    if (!this.playerState.isOnGround) {
      return;
    }

    if (this.playerState.jump.stamina.current >= this.maxNbJumps) {
      this.playerState.jump.stamina.current = this.maxNbJumps;
      this.playerState.jump.stamina.canJump = true;
      this.playerState.jump.stamina.regenTimer = 0;
      return;
    }

    this.playerState.jump.stamina.regenTimer += deltaTime;

    if (this.playerState.jump.stamina.regenTimer >= this.jumpRegenInterval) {
      // console.log("DEBUG timer : ", this.jumpStamina.regenTimer);
      this.playerState.jump.stamina.current++; // increment the jump stamina by 1
      this.playerState.jump.stamina.regenTimer = 0; // reset the timer

      // if the stamina is greater than 0 we can jump
      if (this.playerState.jump.stamina.current > 0) {
        this.playerState.jump.stamina.canJump = true;
      }
    }
  }

  private updateRays() {
    // raycast the ground rays
    for (let i = 0; i < this.groundRays.length; i++) {
      const [ray, rayHelper, res] = this.groundRays[i];
      const start = ray.origin.clone();
      const end = start.add(ray.direction.scale(ray.length));
      this.physicsEngine?.raycastToRef(start, end, res);
    }

    // raycast the step rays
    for (let i = 0; i < this.stepRays.length; i++) {
      const [ray, rayHelper, res] = this.stepRays[i];
      const start = ray.origin.clone();
      const end = start.add(ray.direction.scale(ray.length));
      this.physicsEngine?.raycastToRef(start, end, res);
    }

    // Color the rays based on whether they hit the ground or a step if in debug mode
    if (this.debug) {
      // if (this.debug && this.isOnGround()) {
      // color the ground rays based on whether they hit the ground
      for (let i = 0; i < this.groundRays.length; i++) {
        const [ray, rayHelper, res] = this.groundRays[i];
        if (res.hasHit && rayHelper) {
          rayHelper.show(this.scene, new Color3(1, 0.5, 0)); // orange color when on ground
        } else if (rayHelper) {
          // rayHelper.hide();
          rayHelper.show(this.scene, new Color3(0, 1, 0.5)); // green color when not on ground
        }
      }

      // color the step rays based on whether they hit a step
      for (let i = 0; i < this.stepRays.length; i++) {
        const [ray, rayHelper, res] = this.stepRays[i];
        if (res.hasHit && rayHelper) {
          rayHelper.show(this.scene, new Color3(1, 0, 0)); // red color when on step
        } else if (rayHelper) {
          // rayHelper.hide();
          rayHelper.show(this.scene, new Color3(0, 0, 1)); // blue color when not on step
        }
      }
    } else {
      // see if we keep as the rays are not shown in the first place when not in debug mode
      if (!this.debug) {
        // Hide the ray helpers when not in debug mode
        this.groundRays.forEach((ray) => {
          if (ray[1]) ray[1].hide();
        });
        this.stepRays.forEach((ray) => {
          if (ray[1]) ray[1].hide();
        });
      }
    }
  }

  private curAnimParam = {
    weight: 1,
    anim: AnimationKey.Idle,
  };
  private oldAnimParam = {
    weight: 0,
    anim: AnimationKey.Running,
  };

  private onAnimWeight(animKey: number) {
    if (animKey === this.curAnimParam.anim) return;
    this.oldAnimParam.weight = 1;
    this.oldAnimParam.anim = this.curAnimParam.anim;
    this.curAnimParam.weight = 0;
    this.curAnimParam.anim = animKey;
  }

  private lookAtBox() {
    const mesh = this.boxHelper;
    const cameraDirection = this.camera?.getForwardRay().direction;
    if (!cameraDirection) return Vector3.Zero();
    const d = new Vector3(cameraDirection.x, 0, cameraDirection.z);

    switch (this.playerDirection) {
      case PlayerDirection.Forward:
        mesh.lookAt(mesh.position.add(d), 0, 0, 0);
        break;
      case PlayerDirection.Backward:
        mesh.lookAt(
          mesh.position.add(
            new Vector3(-cameraDirection.x, 0, -cameraDirection.z)
          ),
          0,
          0,
          0
        );
        break;
      case PlayerDirection.Right:
        mesh.lookAt(mesh.position.add(d), Math.PI / 2);
        break;
      case PlayerDirection.Left:
        mesh.lookAt(mesh.position.add(d), -Math.PI / 2);
        break;
      case PlayerDirection.RightForward:
        mesh.lookAt(mesh.position.add(d), Math.PI / 4);
        break;
      case PlayerDirection.LeftForward:
        mesh.lookAt(mesh.position.add(d), -Math.PI / 4);
        break;
      case PlayerDirection.RightBackward:
        mesh.lookAt(mesh.position.add(d), Math.PI / 2 + Math.PI / 4);
        break;
      case PlayerDirection.LeftBackward:
        mesh.lookAt(mesh.position.add(d), -Math.PI + Math.PI / 4);
        break;
    }

    const dir = this.getBoxDirection();
    const rot = Quaternion.FromLookDirectionRH(dir, Vector3.Up());
    const [mesheRoot] = this.player.getChildMeshes();
    mesheRoot.rotationQuaternion =
      mesheRoot.rotationQuaternion || Quaternion.Identity();
    Quaternion.SlerpToRef(
      mesheRoot.rotationQuaternion,
      rot,
      0.1,
      mesheRoot.rotationQuaternion
    );

    // Update the attachment point to match player's facing direction
    if (this.frontGrabAttachmentPoint) {
      // Get the player's current forward direction
      const playerDirection = this.getBoxDirection().normalize();

      // Position the attachment point in world space in front of the player
      // First get the player's world position
      const playerWorldPosition = this.player.position.clone();

      // Calculate the desired attachment point position in world space
      const attachmentWorldPosition = playerWorldPosition.add(
        playerDirection
          .scale(this.hitBoxRadius + 1.2) // Use player's forward direction
          .add(new Vector3(0, 0.5, 0)) // Add vertical offset
      );

      // Update the attachment point's world position
      this.frontGrabAttachmentPoint.setAbsolutePosition(
        attachmentWorldPosition
      );

      // Make attachment point look in the same direction as player
      if (!this.frontGrabAttachmentPoint.rotationQuaternion) {
        this.frontGrabAttachmentPoint.rotationQuaternion =
          Quaternion.Identity();
      }
      const attachmentRotation = Quaternion.FromLookDirectionRH(
        playerDirection,
        Vector3.Up()
      );

      // Use SlerpToRef for smooth rotation at the same speed as the player
      Quaternion.SlerpToRef(
        this.frontGrabAttachmentPoint.rotationQuaternion,
        attachmentRotation,
        0.1, // same interpolation factor used for the player
        this.frontGrabAttachmentPoint.rotationQuaternion
      );
    }
    return dir;
  }

  private getBoxDirection() {
    const forward = Vector3.TransformCoordinates(
      new Vector3(0, 0, 1),
      this.boxHelper.computeWorldMatrix(true)
    );
    const direction = forward.subtract(this.boxHelper.position);
    return direction;
  }

  /**
   * Attempts to grab a physics-enabled object in the vicinity in front of the player.
   * Objects will move with the player until the grab key is released.
   */
  private tryGrabObject(): void {
    if (this.grabbedObject) {
      return; // Already holding an object
    }

    const playerPosition = this.player.position.clone();
    const playerDirection = this.getBoxDirection().normalize();

    // Get all physics bodies in the scene
    const physicsEngine = this.scene.getPhysicsEngine();
    if (!physicsEngine) {
      console.warn("Physics engine is not initialized.");
      return;
    }

    // Keep track of the closest valid object
    let closestObject: {
      distance: number;
      mesh: Mesh;
      body: any;
      aggregate: PhysicsAggregate | null;
    } | null = null;

    // Get all meshes in the scene with physics
    const physicsMeshes = this.scene.meshes.filter(
      (mesh) =>
        mesh.physicsBody &&
        mesh !== this.player &&
        mesh.physicsBody.getMotionType() === PhysicsMotionType.DYNAMIC
    );

    // Debug visualization sphere
    let grabSphere: Mesh | null = null;
    if (this.debug) {
      grabSphere = MeshBuilder.CreateSphere(
        "grabZone",
        {
          diameter: this.grabDistance * 2,
        },
        this.scene
      );
      grabSphere.position = playerPosition.clone();
      grabSphere.material = new StandardMaterial("grabSphereMat", this.scene);
      grabSphere.material.alpha = 0.2;
      (grabSphere.material as StandardMaterial).diffuseColor = new Color3(
        0.2,
        0.6,
        1
      );
      setTimeout(() => grabSphere?.dispose(), 1000);
    }

    for (const mesh of physicsMeshes) {
      // Skip non meshes and the player itself
      if (
        !(mesh instanceof Mesh) ||
        mesh === this.player ||
        mesh === grabSphere
      )
        continue;

      // Get mesh center position and size
      const meshBoundingBox = mesh.getBoundingInfo().boundingBox;
      const meshPosition = meshBoundingBox.centerWorld;
      const meshExtents = meshBoundingBox.extendSize;
      const meshRadius = Math.max(meshExtents.x, meshExtents.y, meshExtents.z);

      // Calculate distance from player to object center
      const distanceVector = meshPosition.subtract(playerPosition);
      const distance = distanceVector.length();

      // Check if any part of the object is within grab distance
      if (distance - meshRadius > this.grabDistance) continue;

      // Check if object is in front of the player
      const normalizedDirection = distanceVector.normalize();
      const dotProduct = Vector3.Dot(playerDirection, normalizedDirection);

      // We want objects primarily in front of the player (within ~120 degree arc) / TO DO CHECK THIS
      if (dotProduct < 0.5) continue; // cos(60°) ≈ 0.5

      // Get the physics body
      const body = mesh.physicsBody;
      if (!body) continue;

      // Check if object has appropriate mass
      const massProps = body.getMassProperties();
      if (
        !massProps ||
        typeof massProps.mass !== "number" ||
        massProps.mass <= 0 ||
        massProps.mass >= this.playerMass
      ) {
        continue;
      }

      // Update closest object if this one is closer
      if (!closestObject || distance < closestObject.distance) {
        // Try to find or create a physics aggregate
        let physicsAggregate: PhysicsAggregate | null = null;

        try {
          if ((this.scene as any).physicsAggregateMap) {
            physicsAggregate = (this.scene as any).physicsAggregateMap.get(
              mesh
            );
          } else {
            physicsAggregate = {
              body: body,
              transformNode: mesh,
            } as unknown as PhysicsAggregate;
          }
        } catch (error) {
          if (this.debug) {
            console.error("Error finding physics aggregate:", error);
          }
        }

        closestObject = {
          distance,
          mesh,
          body,
          aggregate: physicsAggregate,
        };
      }
    }

    // If we found a valid object to grab we grab it
    if (closestObject && closestObject.aggregate) {
      console.log(
        `Grabbing ${
          closestObject.mesh.name
        } at distance ${closestObject.distance.toFixed(2)}`
      );

      this.grabbedObject = closestObject.aggregate;

      // 1. Store original properties BEFORE changing them
      const body = this.grabbedObject.body;
      const massProps = body.getMassProperties();
      // const material = body.getMaterial();
      (this.grabbedObject as any)._initialPhysicsProperties = {
        mass: massProps.mass,
        // friction: material ? material.getFriction() : 0.5,
        // restitution: material ? material.getRestitution() : 0.5,
        linearDamping: body.getLinearDamping(),
        angularDamping: body.getAngularDamping(),
        // Store the original gravity setting
        gravityFactor: body.getGravityFactor(),
      };

      // 2. Set the body to KINEMATIC
      // body.setMotionType(PhysicsMotionType.DYNAMIC);

      // Store original collision masks
      const shape = this.grabbedObject.shape;
      (shape as any)._originalMembershipMask = shape.filterMembershipMask;
      (shape as any)._originalCollideMask = shape.filterCollideMask;

      // Put it in the "HELD" collision group (6)
      shape.filterMembershipMask = 6;
      // A held item should ONLY collide with scenery, NOT the player
      shape.filterCollideMask = 15 & ~1; // Collide with everything except player

      // 3. Disable gravity on the object while holding it
      body.setMotionType(PhysicsMotionType.ANIMATED);
      body.setGravityFactor(0);
      body.setLinearDamping(0.1);
      body.setAngularDamping(0.1);

      // 4. We DO NOT parent the mesh. The physics engine will now control its position.

      // Visual feedback for debugging
      if (this.debug) {
        const highlightExtents =
          closestObject.mesh.getBoundingInfo().boundingBox.extendSize;
        const highlightMesh = MeshBuilder.CreateBox(
          "grabbed_highlight",
          {
            width: highlightExtents.x * 2.1,
            height: highlightExtents.y * 2.1,
            depth: highlightExtents.z * 2.1,
          },
          this.scene
        );
        highlightMesh.position = closestObject.mesh.getAbsolutePosition();
        highlightMesh.material = new StandardMaterial(
          "grabHighlight",
          this.scene
        );
        (highlightMesh.material as StandardMaterial).emissiveColor = new Color3(
          0,
          1,
          0
        );
        highlightMesh.material.alpha = 0.3;
        setTimeout(() => highlightMesh.dispose(), 1000);
      }
    } else if (this.debug) {
      console.log("No valid grabbable object found in front of player");
    }
  }

  /**
   * Must be called every frame to update the position of the held object.
   * The best place to call this is from a scene.onBeforeRenderObservable.
   */
  private updateGrabbedObject(): void {
    if (!this.grabbedObject) {
      return;
    }

    // Get the target position and rotation in world space from your attachment point
    const targetPosition = this.frontGrabAttachmentPoint.getAbsolutePosition();
    const targetRotation =
      this.frontGrabAttachmentPoint.absoluteRotationQuaternion;

    // if targetPosition is further than the grab distance, we stop updating the grabbed object
    const distanceToTarget = Vector3.Distance(
      this.grabbedObject.transformNode.getAbsolutePosition(),
      targetPosition
    );
    if (distanceToTarget > this.grabDistance) {
      this.releaseObject();
      return;
    }

    // Tell the kinematic body to move to the target transform.
    // The physics engine will calculate the velocity needed to get there
    // in the next time step, ensuring smooth movement and collisions.
    this.grabbedObject.body.setTargetTransform(targetPosition, targetRotation);
  }

  /**
   * Sets up the hand bone attachment for grabbing objects in one hand
   */
  private setupHandAttachment(): void {
    if (
      !this.playerSkeletons ||
      this.playerSkeletons.length === 0 ||
      !this.playerHeroMeshes[0]
    ) {
      console.error(
        "Cannot set up hand attachment: Missing skeleton or root mesh."
      );
      return;
    }

    const skeleton = this.playerSkeletons[0];
    // there is a fallback in case not found but should set the appropriate bones names
    const rightHandBoneName = "mixamorig:RightHand";
    const leftHandBoneName = "mixamorig:LeftHand";

    this.rightHandBone =
      skeleton.bones.find((bone) => bone.name === rightHandBoneName) || null;
    this.leftHandBone =
      skeleton.bones.find((bone) => bone.name === leftHandBoneName) || null;

    // Fallback that search for right then hand in bones
    if (!this.rightHandBone) {
      // Find all bones whose name includes "right"
      const rightBones = skeleton.bones.filter((bone) =>
        bone.name.toLowerCase().includes("right")
      );
      // From those find the first that also contains "hand"
      const rightHandBones = rightBones.filter((bone) =>
        bone.name.toLowerCase().includes("hand")
      );
      if (rightHandBones.length > 0) {
        this.rightHandBone = rightHandBones[0];
      }
    }

    // Fallback that search for left then hand in bones
    if (!this.leftHandBone) {
      // Find all bones whose name includes "left"
      const leftBones = skeleton.bones.filter((bone) =>
        bone.name.toLowerCase().includes("left")
      );
      // From those find the first that also contains "hand"
      const leftHandBones = leftBones.filter((bone) =>
        bone.name.toLowerCase().includes("hand")
      );
      if (leftHandBones.length > 0) {
        this.leftHandBone = leftHandBones[0];
      }
    }

    if (!this.rightHandBone) {
      console.error(
        `Right hand bone "${rightHandBoneName}" not found in skeleton.`
      );
      return;
    }
    if (!this.leftHandBone) {
      console.error(
        `Left hand bone "${leftHandBoneName}" not found in skeleton.`
      );
      return;
    }

    if (this.debug) {
      const rightHandMarker = MeshBuilder.CreateSphere(
        "rightHandMarker",
        { diameter: 0.8 },
        this.scene
      );
      rightHandMarker.material = new StandardMaterial(
        "rightHandMarkerMat",
        this.scene
      );
      (rightHandMarker.material as StandardMaterial).emissiveColor = new Color3(
        1,
        0,
        0
      );
      rightHandMarker.scaling = new Vector3(100, 100, 100);
      rightHandMarker.parent = this.rightHandBone.getTransformNode();

      const leftHandMarker = MeshBuilder.CreateSphere(
        "leftHandMarker",
        { diameter: 0.8 },
        this.scene
      );
      leftHandMarker.material = new StandardMaterial(
        "leftHandMarkerMat",
        this.scene
      );
      (leftHandMarker.material as StandardMaterial).emissiveColor = new Color3(
        0,
        0,
        1
      );
      leftHandMarker.scaling = new Vector3(100, 100, 100);
      leftHandMarker.parent = this.leftHandBone.getTransformNode();
    }
  }

  private testAttachObjectToHand(): void {
    console.log("Testing object attachment to hand...");
    // --- STEP 1: Get the target destination FIRST ---
    if (!this.rightHandBone || !this.rightHandBone.getTransformNode()) {
      console.error("Cannot test attach: Right hand bone not ready.");
      return;
    }
    const handTransformNode = this.rightHandBone.getTransformNode()!;
    const targetPosition = handTransformNode.getAbsolutePosition();
    const targetRotation = handTransformNode.absoluteRotationQuaternion;

    // --- STEP 2: Create the test object AT the target destination ---
    const testObject = MeshBuilder.CreateBox(
      "testObject",
      { size: 2 },
      this.scene
    );
    testObject.position = targetPosition; // Pre-position the mesh
    if (targetRotation) {
      testObject.rotationQuaternion = targetRotation.clone(); // Pre-rotate the mesh
    }
    // TO DO : to work with physics
    const aggregate = new PhysicsAggregate(
      testObject,
      PhysicsShapeType.BOX,
      {
        mass: 1,
        friction: 0.5,
        restitution: 0.5,
      },
      this.scene
    );
    aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
    // const aggregate = null;

    // Attach the object to the right hand
    this.attachObjectToHand(testObject, aggregate, "right");
  }

  private attachObjectToHand(
    object: Mesh,
    aggregate: PhysicsAggregate | null = null,
    hand: "right" | "left" = "right"
  ): void {
    let handBone: Bone | null = null;
    if (hand === "right") {
      handBone = this.rightHandBone;
    }
    if (hand === "left") {
      handBone = this.leftHandBone;
    }
    if (!handBone) {
      console.error(`Cannot attach object: ${hand} hand bone not found.`);
      return;
    }

    // Attach the object to the hand bone
    object.scaling = new Vector3(1, 1, 1); // Reset scaling

    if (hand === "right") {
      this.rightHandObj = object;
      this.rightHandObjAggregate = aggregate;
    } else {
      this.leftHandObj = object;
      this.leftHandObjAggregate = aggregate;
    }

    if (aggregate) {
      // Disable gravity while being controlled
      // aggregate.body.setGravityFactor(0);
      aggregate.body.setLinearDamping(0.1);
      aggregate.body.setAngularDamping(0.1);
      // object.scaling = new Vector3(10, 10, 10);
      // object.parent = handBone.getTransformNode();
      aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);

      // const shape = aggregate.shape; // <-- GET THE SHAPE

      // // Store original filter masks to restore on release
      // (shape as any)._originalMembershipMask = shape.filterMembershipMask;
      // (shape as any)._originalCollideMask = shape.filterCollideMask;

      // // Put it in the "HELD" collision group
      // shape.filterMembershipMask = 6;

      // // A held item should ONLY collide with scenery (15), NOT the player (1)
      // shape.filterCollideMask = 15 & ~1;
    } else {
      object.parent = handBone.getTransformNode();
      // object.scaling = new Vector3(100, 100, 100);
    }

    // object.position = Vector3.Zero(); // Reset position relative to the hand
    // object.rotationQuaternion = Quaternion.Identity(); // Reset rotation relative to the hand
    if (this.debug) {
      console.log(`Attached ${object.name} to ${hand} hand.`);
    }
  }

  private updateHandObjects(): void {
    // TO DO !!!!!!!!!!!!!!
    if (!this.rightHandObj || !this.rightHandBone) {
      console.warn("Right hand object or bone not set up.");
      return;
    }
    // update the aggregate position to match the hand bone
    const rightHandTransformNode = this.rightHandBone?.getTransformNode();
    if (!rightHandTransformNode) {
      console.warn("Right hand transform node not defined");
      return;
    }
    const rightHandPos = rightHandTransformNode.getAbsolutePosition();
    if (!rightHandPos) {
      console.warn("right hand position not defined");
      return;
    }

    // IMPORTANT: Use only the transform node's position, not the bone's position
    const targetPosition = rightHandTransformNode.getAbsolutePosition();
    const targetRotation =
      rightHandTransformNode.absoluteRotationQuaternion ||
      Quaternion.Identity();

    console.log(`Player position: ${this.player.position}`);
    console.log(
      `Updated hand position (from TransformNode): ${targetPosition}`
    );

    // Tell the kinematic body to move to the target transform.
    // The physics engine will calculate the velocity needed to get there
    // in the next time step, ensuring smooth movement and collisions.
    if (this.rightHandObjAggregate) {
      this.rightHandObjAggregate.body.setTargetTransform(
        targetPosition,
        targetRotation
      );
      console.log(`Updated right hand object position to ${targetPosition}`);
    }
  }

  /**
   * Releases the currently held object
   */
  private releaseObject(): void {
    if (!this.grabbedObject) {
      return;
    }

    const releasedMesh = this.grabbedObject.transformNode as Mesh;
    const initialProps = (this.grabbedObject as any)._initialPhysicsProperties;
    if (this.debug)
      console.log(`Releasing ${releasedMesh.name} from Kinematic to Dynamic.`);

    // 1. Restore original physics properties
    if (initialProps) {
      // Restore gravity so it falls again
      this.grabbedObject.body.setGravityFactor(initialProps.gravityFactor ?? 1);
      this.grabbedObject.body.setLinearDamping(
        0.1
        // initialProps.linearDamping || 0.1
      );
      this.grabbedObject.body.setAngularDamping(
        0.1
        // initialProps.angularDamping || 0.1
      );
    }

    // IMPORTANT: Restore original collision masks
    const shape = this.grabbedObject.shape;
    try {
      if ((shape as any)._originalMembershipMask !== undefined) {
        shape.filterMembershipMask = (shape as any)._originalMembershipMask;
      }
      if ((shape as any)._originalCollideMask !== undefined) {
        shape.filterCollideMask = (shape as any)._originalCollideMask;
      }
    } catch (error) {
      console.error("Error restoring collision masks:", error);
    }

    // just in case but useless since we did not changed it
    this.grabbedObject.body.setMotionType(PhysicsMotionType.DYNAMIC);

    // 3. Apply the player's velocity for a natural "throw"
    // The body is already at the correct position, so we just need to set its new velocity.
    const playerBody = this.player.physicsBody;
    if (playerBody) {
      const playerLinearVelocity = playerBody.getLinearVelocity();
      // We might want to add some extra force in the direction the player is looking
      // For now, just inheriting the player's velocity is a great start.
      this.grabbedObject.body.setLinearVelocity(playerLinearVelocity);
    } else {
      // If no player body, ensure velocity is zero.
      this.grabbedObject.body.setLinearVelocity(Vector3.Zero());
    }

    // 4. Clean up
    this.grabbedObject = null;
  }

  /**
   * Throws the currently held object.
   */
  // private throwObject(): void {
  //   if (!this.grabbedObject) {
  //     return;
  //   }

  //   const thrownMesh = this.grabbedObject.transformNode as Mesh;
  //   if (this.debug) console.log(`Throwing ${thrownMesh.name}`);

  //   // Unparent the mesh from the attachment point
  //   thrownMesh.setParent(null);

  //   // Get the player's current velocity as a basis for the throw
  //   let playerVelocity = Vector3.Zero();
  //   if (this.player.physicsBody) {
  //     playerVelocity =
  //       this.player.physicsBody.getLinearVelocity() || Vector3.Zero();
  //   }

  //   // Restore the object to be dynamic
  //   this.grabbedObject.body.setMotionType(PhysicsMotionType.DYNAMIC);

  //   // Apply a forward impulse to throw it in the direction the player is facing
  //   // Add some of the player's velocity to make throws feel more natural when moving
  //   const throwDirection = this.getBoxDirection().normalize();
  //   const throwVelocity = throwDirection
  //     .scale(this.throwStrength)
  //     .add(playerVelocity);

  //   this.grabbedObject.body.applyImpulse(
  //     throwVelocity,
  //     thrownMesh.getAbsolutePosition()
  //   );

  //   // Clear the reference to the grabbed object
  //   this.grabbedObject = null;
  // }

  // --- END: ADDED GRAB AND THROW METHODS ---

  public setPlayerToSleep() {
    this.playerState.isInSleep = true;
    this.player.position.z = 2;
    this.player.position.x = -6;
    this.player.position.y = 2;
  }

  public wakeUpPlayer() {
    // set the player physics
    this.setPlayerPhysics();
    this.playerState.isInSleep = false;
    this.player.position.y = 3;
    this.playerState.isWakingUp = true;
  }

  updatePlayerDirection() {
    if (this.inputMap[this.playerKeys.up])
      this.playerDirection = PlayerDirection.Forward;
    if (this.inputMap[this.playerKeys.down])
      this.playerDirection = PlayerDirection.Backward;
    if (this.inputMap[this.playerKeys.right])
      this.playerDirection = PlayerDirection.Right;
    if (this.inputMap[this.playerKeys.left])
      this.playerDirection = PlayerDirection.Left;

    if (
      this.inputMap[this.playerKeys.up] &&
      this.inputMap[this.playerKeys.right]
    )
      this.playerDirection = PlayerDirection.RightForward;
    if (
      this.inputMap[this.playerKeys.up] &&
      this.inputMap[this.playerKeys.left]
    )
      this.playerDirection = PlayerDirection.LeftForward;
    if (
      this.inputMap[this.playerKeys.down] &&
      this.inputMap[this.playerKeys.right]
    )
      this.playerDirection = PlayerDirection.RightBackward;
    if (
      this.inputMap[this.playerKeys.down] &&
      this.inputMap[this.playerKeys.left]
    )
      this.playerDirection = PlayerDirection.LeftBackward;
  }
}

export default PlayerController;
