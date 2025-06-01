import type { IPhysicsEngine } from "@babylonjs/core/Physics/IPhysicsEngine";
import { GameEnvironment as GameEnvironment } from "../GameEnvironnement";
import {
  AbstractEngine,
  AbstractMesh,
  ActionManager,
  AnimationGroup,
  ArcRotateCamera,
  AssetContainer,
  Color3,
  Color4,
  ExecuteCodeAction,
  HighlightLayer,
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
  Texture,
  Vector3,
} from "@babylonjs/core";
import { GRAVITY } from "../App";
import { getFurMaterial } from "../utils";

class PlayerController {
  debug: boolean = false;

  public player!: Mesh;
  private aggregatePlayer!: PhysicsAggregate;
  private scene!: Scene;
  private camera!: ArcRotateCamera;
  environment: GameEnvironment;
  thirdPerson: boolean;
  private physicsEngine: Nullable<PhysicsEngine>;
  // private engine!: AbstractEngine;

  private playerDirection = -1;
  // private highlightLayer?: HighlightLayer;
  // private velocity = new Vector3(0, -9.8, 0);

  private moveDirection = new Vector3(0, 0, 0);
  private velocity = new Vector3(0, 0, 0);

  private readonly baseImpulseStrength = GRAVITY * 10;
  private impulseStrength = this.baseImpulseStrength;
  private readonly jumpImpulse = GRAVITY * 250; // Adjust this value to match your desired jump height
  private readonly stepImpulse = GRAVITY * 400;

  private isMoving = false;
  private inputMap: InputMap = {};
  public meshContent!: AssetContainer;

  // private momentum = new Vector3(0, 0, 0);

  hitBoxHeight = 3.6;
  hitBoxRadius = 0.5;

  private onGroundRaycast = new PhysicsRaycastResult();
  // to check if the player is on the air
  private inAirState = {
    startHeight: 0, // starting height of the jump
    limit: 3, // maximum height of the jump
    defaultLimit: 3, // default max height limit of a jump
    jump: false,
    fall: false,
    hasTask: false, // Is there is a task to jump
    // startedAtTime: 0, // time when the jump started (for limit)
  };

  // jump stamina system
  private jumpStamina = {
    current: 3, // current nb jumps available
    max: 3, // max nb jumps
    regenTimer: 0, // timer for regeneration
    regenInterval: 750, //in  ms - 0.75s btw eac regeneration ticks
    canJump: true, // to indicate if player can jump
  };

  private runningState = {
    isRunning: false,
  };
  // to climb a step in front of the player
  // private stepRay!: Ray;
  // private onStepRaycast = new PhysicsRaycastResult();
  stepRays: [Ray, RayHelper | null, PhysicsRaycastResult][] = [];
  private onStepState = {
    height: 0, // The height of the step
    task: false, // is there a task to go up the step
  };

  // loaded from the glb file
  skeletons!: Skeleton[];
  heroMeshes!: AbstractMesh[];
  animationGroups!: AnimationGroup[];

  sounds!: { walking: Sound };
  boxHelper!: Mesh;
  playerKeys: any;
  speed: number = 1;
  // onStepRayHelper: RayHelper;
  floorRay: any;
  floorRayHelper!: RayHelper;
  // Add array for multiple ground rays
  groundRays: [Ray, RayHelper | null, PhysicsRaycastResult][] = [];
  isInSleep: boolean = false;
  isWakingUp: boolean = false;
  winMeshes: any;

  private triggeredWinMeshes: Set<any> = new Set();

  constructor(
    scene: Scene,
    environnement: GameEnvironment,
    thirdPers: boolean = true
  ) {
    this.scene = scene;
    this.environment = environnement;
    this.camera = environnement.camera;
    this.thirdPerson = thirdPers; // to use the third person view (true) or first person view (false)
    this.physicsEngine = this.scene.getPhysicsEngine() as PhysicsEngine; // get havok physics engine
    this.winMeshes = [];
    this.init();
  }

  async init() {
    this.player = await this._loadPlayer(this.scene);
    // set the camera target to the player
    this.camera?.setTarget(this.player);
    // this.setPlayerPhysics();
    this.setKeysObserver(); // set the movement leys and the keys observer
    this.setPlayerSounds();

    this.player.position = new Vector3(49, 12, 58);
    this.setPlayerToSleep();
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
    //////////////////////////

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

    // box helper used for
    this.boxHelper = MeshBuilder.CreateBox(
      "lbl", // put a better name
      { height: 3.2 },
      this.scene
    );
    if (this.debug) {
      this.boxHelper.visibility = 0.7;
    } else {
      this.boxHelper.visibility = 0;
    }
    this.boxHelper.position.y = 3;

    // Create the player as a Capsule and attach the hero mesh to it as a child
    // this is done to compute the physics of the player on this capsule and the hero meshes will follow
    const player = MeshBuilder.CreateCapsule(
      "playerCapsule",
      { height: this.hitBoxHeight, radius: this.hitBoxRadius },
      this.scene
    );
    if (this.debug) {
      player.visibility = 0.7;
    } else {
      player.visibility = 0;
    }

    // Align the meshes to the player (capsule)
    hero.scaling = new Vector3(0.75, 0.95, 0.75);
    // hero.scaling = new Vector3(2, 2, 2);
    hero.position.y = -1.8;

    // Attach the hero mesh to the player
    player.addChild(hero);

    this.heroMeshes = heroMeshes;
    this.skeletons = skeletons;
    this.animationGroups = animationGroups;

    // Add shadows
    heroMeshes.forEach((mesh) => {
      this.environment.addShadowsToMesh(mesh as Mesh);
    });

    return player;
  }

  public async setPlayerPhysics() {
    const mesheRoot: AbstractMesh = this.heroMeshes[0];
    const player: Mesh = this.player;
    player.checkCollisions = true;

    // physics aggregate for the player
    const aggregate = new PhysicsAggregate(
      player, // The mesh to apply the physics to
      PhysicsShapeType.CAPSULE, // Use capsule shape for physics
      {
        mass: 55, // player weights 15kg
        friction: 1,
        restitution: 0,
      },
      this.scene
    );

    // Set motion type to dynamic (the player can move under physics influence)
    aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);

    // Disable pre-step calculations for performance improvement (optional)
    aggregate.body.disablePreStep = false;

    // Set the mass properties for the physics body (inertia is set to zero)
    aggregate.body.setMassProperties({
      inertia: new Vector3(0, 0, 0),
    });

    // Add linear damping to prevent excessive sliding and momentum buildup
    // aggregate.body.setLinearDamping(3.9);
    aggregate.body.setLinearDamping(4.9);
    aggregate.body.setAngularDamping(1.9);

    // Enable collision callback (for when the player collides with other objects)
    aggregate.body.setCollisionCallbackEnabled(true);

    // Set up a collision observer to trigger a callback when a collision occurs
    const collisionObservable = aggregate.body.getCollisionObservable();
    collisionObservable.add(this.onCollision);

    this.aggregatePlayer = aggregate;

    // Create and attach 4 rays for step up detection
    const vectors = [
      new Vector3(0, -this.hitBoxHeight / 2 + 0.6, this.hitBoxRadius + 0.1),
      new Vector3(0, -this.hitBoxHeight / 2 + 1.6, -this.hitBoxRadius - 0.1),
      new Vector3(-this.hitBoxRadius - 0.1, -this.hitBoxHeight / 2 + 0.6, 0),
      new Vector3(this.hitBoxRadius + 0.1, -this.hitBoxHeight / 2 + 0.6, 0),
    ];

    for (let i = 0; i < 4; i++) {
      this.stepRays[i] = [
        new Ray(Vector3.Zero(), Vector3.Up()),
        null,
        new PhysicsRaycastResult(),
      ];

      this.stepRays[i][1] = new RayHelper(this.stepRays[i][0]);
      this.stepRays[i][1]?.attachToMesh(
        this.player,
        new Vector3(0, -1, 0),
        vectors[i],
        0.59 // we don't want to detect the ground but the step so must be less than 0.6
      );
    }

    // this.stepRay = new Ray(
    //   Vector3.Zero(),
    //   Vector3.Up()
    // ); // Create the ray
    // const stepRayHelper = new RayHelper(this.stepRay); // Helper to visualize the ray

    // Attach the ray to the player mesh with the specified direction and origin offsets
    // stepRayHelper.attachToMesh(
    //   this.player, // Mesh to attach the ray to
    //   new Vector3(0, -1, 0), // Ray direction offset
    //   new Vector3(
    //     this.hitBoxRadius + 0.35,
    //     -this.hitBoxHeight / 2 + 0.5,
    //     0
    //   ), // Ray origin offset
    //   0.49 // Ray length
    // );

    // // show the ray
    // stepRayHelper.show(this.scene, new Color3(1, 0, 0));
    // this.onStepRayHelper = stepRayHelper;

    // Create a ray for detecting the ground beneath the player
    this.floorRay = new Ray(Vector3.Zero(), Vector3.Down());

    const floorRayHelper = new RayHelper(this.floorRay);
    floorRayHelper.attachToMesh(
      this.player,
      new Vector3(0, -1, 0),
      new Vector3(0, -this.hitBoxHeight / 2 + 0.5, 0),
      1
    );

    // show the ray
    floorRayHelper.show(this.scene, new Color3(0, 1, 0));
    this.floorRayHelper = floorRayHelper;

    // Create multiple ground rays at different positions
    const groundRayOffsets = [
      new Vector3(0, 0, 0), // Center
      new Vector3(this.hitBoxRadius * 0.7, 0, 0), // Right
      new Vector3(-this.hitBoxRadius * 0.7, 0, 0), // Left
      new Vector3(0, 0, this.hitBoxRadius * 0.7), // Front
      new Vector3(0, 0, -this.hitBoxRadius * 0.7), // Back
    ];

    for (let i = 0; i < groundRayOffsets.length; i++) {
      const ray = new Ray(Vector3.Zero(), Vector3.Down());
      const rayHelper = new RayHelper(ray);

      rayHelper.attachToMesh(
        this.player,
        new Vector3(0, -1, 0),
        new Vector3(
          groundRayOffsets[i].x,
          -this.hitBoxHeight / 2 + 0.5,
          groundRayOffsets[i].z
        ),
        1
      );

      if (this.debug) {
        rayHelper.show(this.scene, new Color3(0, 0.5, 1));
      }

      this.groundRays.push([ray, rayHelper, new PhysicsRaycastResult()]);
    }
  }

  private setPlayerSounds() {
    this.sounds = {
      walking: new Sound(
        "wallking_sound",
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
    this.playerKeys = {
      up: "KeyW",
      down: "KeyS",
      left: "KeyA",
      right: "KeyD",
      jumping: "Space",
      running: "ShiftLeft",
    };

    this.scene.actionManager = new ActionManager();
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.code] = true;
        // console.log("key down", evt.sourceEvent.code);
      })
    );
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.code] = false;
        // console.log("key up", evt.sourceEvent.code);
        this.inputKeyUp();
      })
    );
  }

  private inputKeyUp() {
    if (this.isInSleep || this.isWakingUp) return;
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
      //     this.inAirState.hasTask +
      //     " on step ? ->" +
      //     this.onStepState.task
      // );
      this.isMoving = false;
      this.sounds.walking.pause(); // stop walking sound maybe put somewhere else

      // if not in the air => play the idle animation
      if (!this.inAirState.hasTask) {
        // console.log("Not in this air and not moving ");
        this.onAnimWeight(AnimationKey.Idle);
        // this.velocity.y = -GRAVITY; // apply gravity
      } else {
        // check if ground raycast detects the ground
        if (this.onGroundRaycast.hasHit) {
          // console.log("touching ground but in the air... ");
          this.inAirState.hasTask = false;
          this.inAirState.jump = false;
          this.inAirState.fall = false;
          // this.velocity.y = -GRAVITY;
          this.isMoving = true; // to see if this unbloc the player (apparently yes we are not stuck under objects anymore)
          this.onAnimWeight(AnimationKey.Idle);
        }
      }

      // if on the steps and not moving => clear the task
      if (this.onStepState.task) {
        // console.log("Not on step and not moving ...");
        this.onStepState.task = false;
        // this.speed = 1;
        // this.velocity.y = -GRAVITY; // apply gravity
      }
      // this.velocity.x = 0;
      // this.velocity.z = 0;
    }

    if (!this.inputMap[this.playerKeys.running]) {
      this.runningState.isRunning = false;
    }
  }

  public onBeforeAnimations() {
    // smooth transition between the current and previous animations

    // if the current anim is AnimationKey.StandingUp we should way for it to finish before playing the other animation
    if (this.curAnimParam.anim === AnimationKey.StandingUp) {
      if (this.animationGroups[this.curAnimParam.anim].isPlaying) {
        return;
      } else {
        this.isWakingUp = false;
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
      const anim = this.animationGroups[this.curAnimParam.anim];

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
      const anim = this.animationGroups[this.oldAnimParam.anim];

      // Set the weight of the previous animation using the updated weight value
      anim.setWeightForAllAnimatables(this.oldAnimParam.weight);
    }

    // ensures all other animations are paused
    this.animationGroups?.forEach((ani, key) => {
      if (key !== this.oldAnimParam.anim && key !== this.curAnimParam.anim) {
        ani.setWeightForAllAnimatables(0);
      }
    });
  }

  private onCollision = async (event: IPhysicsCollisionEvent) => {
    // console.log("onCollision", event);

    // if (this.debug) {
    //   // Get the collided mesh from the physics body
    //   const collidedMesh = event?.collidedAgainst?.transformNode as Mesh;

    //   if (collidedMesh) {
    //     console.log("Collision with", collidedMesh.name);

    //     // Create a highlight layer if it doesn't exist
    //     if (!this.highlightLayer) {
    //       this.highlightLayer = new HighlightLayer(
    //         "highlightLayer",
    //         this.scene
    //       );
    //     }

    //     // Add the mesh to the highlight layer (red overlay)
    //     this.highlightLayer.addMesh(collidedMesh, Color3.Red());

    //     // Remove the highlight effect after 1 second
    //     setTimeout(() => {
    //       this.highlightLayer?.removeMesh(collidedMesh);
    //     }, 1000);
    //   }
    // }

    // Show the edges of the collided mesh for debugging
    if (this.debug) {
      // Get the collided mesh from the physics body
      const collidedMesh = event?.collidedAgainst?.transformNode as Mesh;

      if (collidedMesh) {
        // console.log("Collision with", collidedMesh.name);

        // Create an EdgesRenderer on the collided mesh
        const edgesRenderer = collidedMesh.enableEdgesRendering();

        edgesRenderer.edgesColor = new Color4(1, 0, 0, 1);
        collidedMesh.edgesWidth = 4.0;

        // disable edges after 1 second
        setTimeout(() => {
          collidedMesh.disableEdgesRendering();
        }, 1000);
      }
    }

    // console.log("collision - player position", this.player.position);
    // console.log("collision point", event?.point);
    if (
      event.type === PhysicsEventType.COLLISION_STARTED && // collision started
      this.inAirState.hasTask && // player is jumping
      (event?.point?._y || event?.point?.y || 0) >
        this.player.position.y + this.hitBoxHeight / 2.4 // collision point is above the player (we should do /2 but /2.3 so we take a little margin precaution to be sure)
    ) {
      // console.log("hit the head");
      // end jump since landed or hit something
      this.inAirState.hasTask = false;
      this.inAirState.jump = false;
      this.inAirState.fall = true; // now falling
      // this.velocity.y = -GRAVITY; // reset the velocity to gravity

      // if doesn't touch the ground make impulse down
      // if (!this.isOnGround()) {
      //   this.moveDirection.y = -this.jumpImpulse * 2; // to ensure the player falls down
      // }
    }

    // if the player lands on an object => stop falling
    // if (
    //   event.type === PhysicsEventType.COLLISION_STARTED && // collision started
    //   this.inAirState.fall //&& // player is falling
    //   // (event?.point?._y || event?.point?.y || 0) <
    //   //   this.player.position.y - this.hitBoxHeight / 2 // collision point is below the player
    // ) {
    //   console.log("landed on an object");
    //   this.inAirState.fall = false;
    //   this.inAirState.hasTask = false;
    //   this.inAirState.jump = false;
    //   // this.velocity.y = 0; // stop falling
    // }

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

  // Stops all player movement by clearing inputs and velocity
  private stopPlayerMovement(): void {
    // Clear all input states
    Object.keys(this.inputMap).forEach((key) => {
      this.inputMap[key] = false;
    });

    // Reset movement flags
    this.isMoving = false;
    this.inAirState.jump = false;
    this.inAirState.fall = false;
    this.inAirState.hasTask = false;
    this.onStepState.task = false;

    // Reset velocity and movement
    this.velocity.setAll(0);
    this.moveDirection.setAll(0);

    // Apply zero velocity to physics body for immediate stop
    if (this.player?.physicsBody) {
      this.player.physicsBody.setLinearVelocity(Vector3.Zero());
      this.player.physicsBody.setAngularVelocity(Vector3.Zero());
    }

    // Stop walking sound
    if (this.sounds?.walking.isPlaying) {
      this.sounds.walking.stop();
    }

    // Switch to idle animation
    this.onAnimWeight(AnimationKey.Idle);

    // reset jump stamina
    this.jumpStamina.current = this.jumpStamina.max;
    this.jumpStamina.canJump = true;
    this.jumpStamina.regenTimer = 0;
    this.inAirState.limit = this.inAirState.defaultLimit; // Reset jump limit
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

  // Checks if any ground ray detects ground
  private isOnGround(): boolean {
    if (this.onGroundRaycast.hasHit) {
      return true;
    }

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

  private movePlayer(delta: number) {
    // Reset movement direction each frame

    // Check if the player is on a staircase and not jumping, and if the player is below the staircase height
    if (
      this.onStepState.task && // supposed near a step
      !this.inAirState.jump && // not jumping
      !this.inAirState.fall && // not falling
      this.player.position.y - this.hitBoxHeight / 2 <
        this.onStepState.height &&
      this.isMoving
    ) {
      // this.velocity.y = GRAVITY; // apply upward force in order to climb the step
      // this.moveDirection.y = this.gravityImpulse;
      this.moveDirection.y = this.stepImpulse;
    }

    // If the player has reached the top of the step=>stop the upward motion
    if (
      // this.velocity.y && // moving upward
      this.onStepState.task && // on the step
      !(this.checkStepCollision().length > 0) && // no step collision detected from the raycast
      this.player.position.y - this.hitBoxHeight / 2 >=
        this.onStepState.height && // passed the step
      !this.inAirState.jump // Not already jumping (to avoid conflict with jump new adjustment)
    ) {
      // this.velocity.y = 0;
      this.onStepState.task = false; // no longer on a step
    }

    if (!this.inAirState.jump && !this.isOnGround()) {
      this.moveDirection.y = -this.jumpImpulse / 1.25;
    }

    // // if raycast detects the ground and jump is active => stop the jump
    // if (this.onGroundRaycast.hasHit && this.inAirState.jump) {
    //   console.log("on the ground and jump active => stop the jump");
    //   this.inAirState.jump = false;
    //   this.inAirState.hasTask = false;
    //   // this.velocity.y = -GRAVITY; // Apply gravity
    //   this.moveDirection.y = -this.jumpImpulse; // Apply gravity
    // }

    // Check if the player is jumping but isn't off the ground yet
    // Check if the player is jumping
    if (
      this.inAirState.jump //&& //jumping
      // !this.inAirState.hasTask && // no jump task yet
      // this.onGroundRaycast.hasHit // if foot raycast detects that the player is on a ground
    ) {
      // console.log(
      //   "player is jumping but not off the ground yet : starting jump by applying upward force"
      // );
      // console.log(this.inAirState);
      this.inAirState.hasTask = true; // flag started to jump
      // this.inAirState.startedAtTime = Date.now(); // record the time the jump started
      // this.velocity.y = GRAVITY; // Apply upward force
      this.moveDirection.y = this.jumpImpulse; //* 10; // Apply upward jump impulse force
      // console.log(this.moveDirection, "after jump impulse");
    }

    // If the player is not on the ground and has exceeded the jump height limit => start falling
    if (
      !this.onGroundRaycast.hasHit && // If foot raycast doesn't detect any ground beneath
      this.player.position.y >
        this.inAirState.startHeight + this.inAirState.limit && // if player has exceeded jump height limit
      this.inAirState.jump // player still jumping
    ) {
      // console.log("jump limit reache => start falling");
      this.inAirState.jump = false; // end the jump
      this.inAirState.fall = true; // mark as falling
      // this.velocity.y = -GRAVITY; // Apply gravity to fall
      this.moveDirection.y = -this.jumpImpulse / 1.25; /// 2; // "to fall faster than gravity"
    }

    // if the player is falling and the foot raycast doesn't detect any ground => apply gravity
    if (
      !this.onGroundRaycast.hasHit &&
      this.inAirState.fall &&
      !this.inAirState.jump
    ) {
      // console.log("falling and no ground detected => apply gravity");
      // this.velocity.y = -GRAVITY; // Apply gravity to fall
      // console.log("falling and no ground detected");
      this.moveDirection.y = -this.jumpImpulse / 1.25; /// 2; // "To fall faster than gravity"
    }

    // check if the player is on the ground or on an object and stop the velocity // THIS BREAK EVERYTHING WHAN ON A SLOPE DOESN4T
    // if (
    //   this.onGroundRaycast.hasHit &&
    //   // (!hitStepRays || hitStepRays.length === 0) && // not on a step
    //   !this.inAirState.jump &&
    //   !this.inAirState.fall &&
    //   !this.onStepState.task
    // ) {
    //   this.velocity.y = 0; // Stop downward movement since the player is on smtg
    // }

    //if is moving and is not jumping
    // if (this.isMoving && !this.inAirState.jump) {
    //if is moving
    if (this.isMoving) {
      const dir = this.lookAtBox(); // get direction player is facing
      // adjust movment based on dir and delta time
      // let dd_x = dir.x * delta * this.speed;
      // let dd_z = dir.z * delta * this.speed;
      let moveX = dir.x * this.impulseStrength * delta * this.speed;
      let moveZ = dir.z * this.impulseStrength * delta * this.speed;

      // Reduce movement during jumps and falls
      if (this.inAirState.jump || this.inAirState.fall) {
        moveX *= 0.8; // moves 20% slower in the air
        moveZ *= 0.8;
      }

      // NO need to adjust because the player
      // // if moving in diagonal => adjust the speed by sqrt(2)
      // if (
      //   (this.playerDirection === PlayerDirection.LeftForward ||
      //     this.playerDirection === PlayerDirection.RightForward ||
      //     this.playerDirection === PlayerDirection.RightBackward ||
      //     this.playerDirection === PlayerDirection.LeftBackward) &&
      //   this.isMoving
      // ) {
      //   dd_x /= Math.sqrt(2);
      //   dd_z /= Math.sqrt(2);
      // }

      // apply the movement to the player
      // this.velocity.x = dd_x;
      // this.velocity.z = dd_z;
      this.moveDirection.x = moveX;
      this.moveDirection.z = moveZ;

      // if the walking sound is not playing => play it
      if (!this.sounds.walking.isPlaying) {
        this.sounds.walking.play();
      }
    } else {
      // probably not doing anything => stop moving
      // this.velocity.x = 0;
      // this.velocity.z = 0;
      this.moveDirection.x = 0;
      this.moveDirection.z = 0;

      // TO REMOVE ?
      // if (
      //   this.onGroundRaycast.hasHit &&
      //   !this.inAirState.jump &&
      //   !this.inAirState.fall &&
      //   !this.onStepState.task
      // ) {
      //   if (this.aggregatePlayer?.body) {
      //     const currentVelocity = this.aggregatePlayer.body.getLinearVelocity();
      //     // Keep vertical velocity but zero out horizontal
      //     this.aggregatePlayer.body.setLinearVelocity(
      //       new Vector3(0, currentVelocity.y, 0)
      //     );
      //   }
      // }
    }

    // move the player based on the velocity
    // this.player?.physicsBody?.setLinearVelocity(this.velocity);
    // Apply impulses instead of directly setting velocity
    // console.log("moveDirection", this.moveDirection);
    if (this.player?.physicsBody) {
      this.player.physicsBody.applyImpulse(
        this.moveDirection,
        this.player.getAbsolutePosition()
      );
    }

    if (this.velocity.y) {
      // console.log("velocity", this.velocity);

      // Apply the velocity to the player
      this.player?.physicsBody?.setLinearVelocity(this.velocity);
    }

    this.moveDirection.setAll(0);
  }

  updatePlayer(deltaTime: number): void {
    // Ensure that the scene and player are available
    if (!this.scene || !this.player) return;

    // update jump stamina regen
    this.updateJumpStamina(deltaTime);

    // ensure laying anim is playing if the player is sleeping
    if (this.isInSleep && !this.isWakingUp) {
      this.onAnimWeight(AnimationKey.Laying);
      return;
    }

    // if the player is waking up => play the standing up animation
    if (this.isWakingUp) {
      this.onAnimWeight(AnimationKey.StandingUp);
      this.isWakingUp = false;
      return;
    }

    // Cast a ray to check if the player is on the ground
    const start = this.floorRay.origin.clone();
    const end = start.add(this.floorRay.direction.scale(this.floorRay.length));
    this.physicsEngine?.raycastToRef(start, end, this.onGroundRaycast);

    // Cast rays for all ground rays
    for (let i = 0; i < this.groundRays.length; i++) {
      const [ray, rayHelper, res] = this.groundRays[i];
      const g_start = ray.origin.clone();
      const g_end = g_start.add(ray.direction.scale(ray.length));
      this.physicsEngine?.raycastToRef(g_start, g_end, res);
    }

    // Raycast for steps
    for (let i = 0; i < this.stepRays.length; i++) {
      const [ray, rayHelper, res] = this.stepRays[i];
      const s_start = ray.origin.clone();
      const s_end = s_start.add(ray.direction.scale(ray.length));
      this.physicsEngine?.raycastToRef(s_start, s_end, res);
    }
    // const s_start = this.stepRay.origin.clone();
    // const s_end = s_start.add(
    //   this.stepRay.direction.scale(this.stepRay.length)
    // );
    // this.physicsEngine.raycastToRef(s_start, s_end, this.onStepRaycast);

    const hitStepRays = this.checkStepCollision();

    // for debugging
    // show the floor ray (if the player is on the ground)
    if (this.debug && this.isOnGround()) {
      this.floorRayHelper.show(this.scene, new Color3(0, 1, 0));

      // Highlight any ground ray that hit something
      for (let i = 0; i < this.groundRays.length; i++) {
        const [ray, rayHelper, res] = this.groundRays[i];
        if (res.hasHit && rayHelper) {
          rayHelper.show(this.scene, new Color3(0, 1, 0.5));
        } else if (rayHelper) {
          rayHelper.hide();
        }
      }
    } else {
      this.floorRayHelper.hide();
      if (!this.debug) {
        this.groundRays.forEach((ray) => {
          if (ray[1]) ray[1].hide();
        });
      }
    }

    // check if player is moving based on inputMap and update playerDirection
    this.checkMovementKeys();

    // If any movement keys are pressed => set the moving state and play the running animation
    if (
      this.inputMap[this.playerKeys.up] ||
      this.inputMap[this.playerKeys.down] ||
      this.inputMap[this.playerKeys.left] ||
      this.inputMap[this.playerKeys.right]
    ) {
      this.isMoving = true;

      //if running pressed
      if (this.inputMap[this.playerKeys.running]) {
        this.runningState.isRunning = true;
        this.impulseStrength = this.baseImpulseStrength * 1.5;
      } else {
        this.runningState.isRunning = false;
        this.impulseStrength = this.baseImpulseStrength;
      }

      // If not jumping and on the ground => play the running animation
      if (!this.inAirState.jump && this.isOnGround()) {
        this.onAnimWeight(AnimationKey.Running);
      }

      // If on the steps and moving => set the task to go up the step
      if (hitStepRays.length > 0) {
        this.onStepState.task = true;
        this.onStepState.height = hitStepRays[0][2].hitPointWorld.y; // normally there should only be one (else we still take the first one)
      }
    } else {
      // If no movement keys are pressed, stop the player

      this.isMoving = false;

      this.impulseStrength = this.baseImpulseStrength;
      // decrease the velocity by half
      // decrease the velocity by half
      // this.velocity.x /= 2;
      // this.velocity.z /= 2;
      // this.velocity.x = 0;
      // this.velocity.z = 0;
      this.sounds.walking.pause();
    }

    // Handle jumping when the Space key is pressed
    if (
      this.inputMap[this.playerKeys.jumping] &&
      !this.inAirState.jump && // not already jumping
      !this.inAirState.hasTask && // no jump task
      this.isOnGround() && // Use new method instead of onGroundRaycast.hasHit
      this.jumpStamina.current > 0 // Check if player has jump stamina
    ) {
      // Calculate jump height based on stamina
      // Full stamina = full height, less stamina = less height
      const jumpHeightPercentage =
        this.jumpStamina.current / this.jumpStamina.max;
      this.inAirState.limit =
        this.inAirState.defaultLimit * jumpHeightPercentage;

      // console.log(
      //   `DEBUG jump height set to: ${this.inAirState.limit.toFixed(2)} (${(
      //     jumpHeightPercentage * 100
      //   ).toFixed(0)}% of max)`
      // );

      // decrease jump stamina
      this.jumpStamina.current--;

      // console.log(
      //   `DEBUG jump stamina REDUCED: ${this.jumpStamina.current}/${this.jumpStamina.max}`
      // );

      // if out of jumps mark as unable to jump
      if (this.jumpStamina.current <= 0) {
        this.jumpStamina.canJump = false;

        // console.warn("DEBUG player out of jump stamina");
      }

      // console.log("jump");
      this.inAirState.jump = true;
      this.inAirState.startHeight = this.player.position.y; // record the height from which the jump starts (for limit)
      // this.velocity.y = GRAVITY; // Apply upward force
      this.onAnimWeight(AnimationKey.Falling); // Start the jump animation (to change to Jumping we will se but for the moment the anim is not right )
      // see if we keep the anim here
    } else if (
      this.inputMap[this.playerKeys.jumping] &&
      !this.inAirState.jump &&
      !this.inAirState.hasTask &&
      this.isOnGround() &&
      this.jumpStamina.current <= 0
    ) {
      // console.log("DEBUG attempted jump but no stamina left");
      // maybe we could add an anim tired here ? TO DO ?
    }

    // Handle end of falling when the player hits the ground
    if (this.isOnGround() && this.inAirState.fall && !this.inAirState.jump) {
      // console.log("just landed");
      this.inAirState.fall = false;
      this.inAirState.hasTask = false; // Reset jump task
      this.onStepState.task = false; // Reset step task TO TRY????????????????????????????????????????????????????????????????????????????????????,
      // this.velocity.y = -GRAVITY; // Apply gravity
      if (this.isMoving) {
        this.onAnimWeight(AnimationKey.Running);
      } else {
        this.onAnimWeight(AnimationKey.Idle);
      }
    }

    // Handle the state after releasing the space key
    if (
      this.inputMap[this.playerKeys.jumping] !== undefined &&
      !this.inputMap[this.playerKeys.jumping] &&
      this.isOnGround() &&
      this.inAirState.hasTask
    ) {
      // console.log("space key released & not in air anymore");
      this.inAirState.hasTask = false; // clear the jump task
      // this.velocity.y = -GRAVITY; // Apply gravity
    }

    // if the player is not jumping and is falling (no ground detected)
    if (!this.inAirState.jump && !this.isOnGround()) {
      // console.log("free fall");
      this.inAirState.fall = true; // mark as falling
      this.inAirState.jump = false; // end jump
      // this.velocity.y = -GRAVITY; // Apply gravity
      // this.onAnimWeight(AnimationKey.Idle);
      this.onAnimWeight(AnimationKey.Falling);
    }

    // Handle landing from falling to idle or running
    if (
      !this.inAirState.jump &&
      !this.inAirState.hasTask &&
      this.isOnGround() &&
      this.curAnimParam.anim !== AnimationKey.Idle &&
      !this.isMoving
    ) {
      if (this.isMoving) {
        this.onAnimWeight(AnimationKey.Running);
      } else {
        this.onAnimWeight(AnimationKey.Idle);
      }
    }

    // if player is climbing a step
    // if (this.onStepState.task) {
    //   // this.onAnimWeight(AnimationKey.Climbing);
    //   console.log("climbing");
    //   this.speed = Math.max(0.1, this.speed - 0.01);
    // }

    // if (!this.onStepState.task && this.onStepRaycast.hasHit) {
    //   this.speed = 1;
    // }

    // update player
    this.movePlayer(deltaTime);
  }

  // Add a method to update jump stamina over time
  private updateJumpStamina(deltaTime: number): void {
    // Only regenerate stamina when on the ground
    if (!this.isOnGround()) {
      return;
    }

    // If already at max stamina nothing to do
    if (this.jumpStamina.current >= this.jumpStamina.max) {
      this.jumpStamina.current = this.jumpStamina.max;
      this.jumpStamina.canJump = true;
      this.jumpStamina.regenTimer = 0;
      return;
    }

    // Increment the regeneration timer
    this.jumpStamina.regenTimer += deltaTime;

    // If enough time has passed
    if (this.jumpStamina.regenTimer >= this.jumpStamina.regenInterval) {
      console.log("DEBUG timer : ", this.jumpStamina.regenTimer);

      // Add one jump stamina point
      this.jumpStamina.current++;

      // Reset timer
      this.jumpStamina.regenTimer = 0;

      // if we have at least one jump available, player can jump
      if (this.jumpStamina.current > 0) {
        this.jumpStamina.canJump = true;
      }

      // console.warn(
      //   `DEBUG jump stamina regenerated: ${this.jumpStamina.current}/${this.jumpStamina.max}`
      // );
    }
  }

  // Animation state tracking
  private curAnimParam = {
    weight: 1,
    anim: AnimationKey.Idle,
  };
  private oldAnimParam = {
    weight: 0,
    anim: AnimationKey.Running,
  };

  // Handle animation weight transitions
  private onAnimWeight(animKey: number) {
    if (animKey === this.curAnimParam.anim) return; // Skip if the current animation is already set
    this.oldAnimParam.weight = 1; // set previous animation weight to full
    this.oldAnimParam.anim = this.curAnimParam.anim; // set previous animation from current
    this.curAnimParam.weight = 0; // reset current animation weight to zero
    this.curAnimParam.anim = animKey; // set new animation
  }

  // Handle player movement and camera direction based on movement keys pressed
  private lookAtBox() {
    const mesh = this.boxHelper;
    const cameraDirection = this.camera?.getForwardRay().direction;
    if (!cameraDirection) return Vector3.Zero();
    const d = new Vector3(cameraDirection.x, 0, cameraDirection.z); // no y bc only horizontal movement are taken into account

    // adjust player mesh orientation based on the player's movement direction
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

    // Return the direction the player box helper is facing
    const dir = this.getBoxDirection();
    const rot = Quaternion.FromLookDirectionRH(dir, Vector3.Up());
    // rotate the player mesh to the new direction
    // smooth rotation using Slerp (Spherical Linear Interpolation) through Quaternion rotation
    const [mesheRoot] = this.player.getChildMeshes();
    mesheRoot.rotationQuaternion =
      mesheRoot.rotationQuaternion || Quaternion.Identity();
    Quaternion.SlerpToRef(
      mesheRoot.rotationQuaternion,
      rot,
      0.1,
      mesheRoot.rotationQuaternion
    );
    return dir;
  }

  // get the direction the player helper box is facing based on its current rotation
  private getBoxDirection() {
    const forward = Vector3.TransformCoordinates(
      new Vector3(0, 0, 1),
      this.boxHelper.computeWorldMatrix(true)
    );
    const direction = forward.subtract(this.boxHelper.position);
    return direction;
  }

  ///////////////////////////////

  public setPlayerToSleep() {
    // console.log("SETTING TO SLEEP");
    // Animation Laying
    // this.onAnimWeight(AnimationKey.Laying);
    this.isInSleep = true;
    this.player.position.z = 2;
    this.player.position.x = -6;
    this.player.position.y = 2;
    // rotate
    // this.player.rotate(new Vector3(0, 1, 0), Math.PI);
  }

  public wakeUpPlayer() {
    // set physics before waking up
    this.setPlayerPhysics();
    // console.log("In waking up ");
    this.isInSleep = false;
    this.player.position.y = 3;
    this.isWakingUp = true;

    // Reset jump stamina and jump limit
    this.jumpStamina.current = this.jumpStamina.max;
    this.jumpStamina.canJump = true;
    this.jumpStamina.regenTimer = 0;
    this.inAirState.limit = this.inAirState.defaultLimit; // Reset jump limit

    // this.player.rotate(new Vector3(0, 1, 0), Math.PI);
    // Play the StandingUp animation
    // this.onAnimWeight(AnimationKey.StandingUp);

    //   // // Start the animation
    //   // standingUpAnim.start(true); // true = loop, false = play once
    //   this.onAnimWeight(AnimationKey.Idle);
    // } else {
    //   console.warn("StandingUp animation not found.");
    // }
  }

  checkMovementKeys() {
    // Check movement direction based on key inputs
    if (this.inputMap[this.playerKeys.up])
      this.playerDirection = PlayerDirection.Forward;
    if (this.inputMap[this.playerKeys.down])
      this.playerDirection = PlayerDirection.Backward;
    if (this.inputMap[this.playerKeys.right])
      this.playerDirection = PlayerDirection.Right;
    if (this.inputMap[this.playerKeys.left])
      this.playerDirection = PlayerDirection.Left;

    // Handle diagonal movement
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

export enum PlayerState {
  Idle,
  Jump,
  Running,
  RunJump,
  Falling,
  Climbing,
}

export enum PlayerDirection {
  Forward,
  RightForward,
  Right,
  RightBackward,
  Backward,
  LeftBackward,
  Left,
  LeftForward,
}

export enum AnimationKey {
  Ascending,
  Falling,
  Idle,
  Jumping,
  Laying,
  Running,
  StandingUp,
}

export interface InputMap {
  [key: string]: boolean;
}

export default PlayerController;
