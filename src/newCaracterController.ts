import { GameEnvironment as GameEnvironment } from "./GameEnvironnement";
import {
  AbstractMesh,
  ActionManager,
  AnimationGroup,
  ArcRotateCamera,
  AssetContainer,
  Color3,
  ExecuteCodeAction,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsCharacterController,
  PhysicsShapeType,
  Quaternion,
  Scene,
  SceneLoader,
  Skeleton,
  Sound,
  Texture,
  Vector3,
  CharacterSupportedState,
} from "@babylonjs/core";
import { FurMaterial } from "@babylonjs/materials";

class PlayerController {
  // Core properties
  private scene!: Scene;
  private camera!: ArcRotateCamera;
  environment: GameEnvironment;
  private player!: Mesh;
  private characterController!: PhysicsCharacterController;
  private displayMesh!: Mesh;
  private boxHelper!: Mesh;

  // Movement properties
  private inputDirection = new Vector3(0, 0, 0);
  private characterOrientation = Quaternion.Identity();
  private characterGravity = new Vector3(0, -18, 0);
  private inAirSpeed = 8.0;
  private onGroundSpeed = 10.0;
  private jumpHeight = 1.5;
  private isMoving = false;
  private inputMap: InputMap = {};
  private playerKeys: any;

  // State management
  private state: string = "IN_AIR";
  private wantJump: boolean = false;
  private isInSleep: boolean = false;
  private isWakingUp: boolean = false;

  // Animation properties
  skeletons!: Skeleton[];
  heroMeshes!: AbstractMesh[];
  animationGroups!: AnimationGroup[];
  sounds!: { walking: Sound };

  // Animation state tracking
  private curAnimParam = {
    weight: 1,
    anim: AnimationKey.Idle,
  };
  private oldAnimParam = {
    weight: 0,
    anim: AnimationKey.Running,
  };

  constructor(
    scene: Scene,
    environnement: GameEnvironment,
    _thirdPers: boolean = true
  ) {
    this.scene = scene;
    this.environment = environnement;
    this.camera = environnement.camera;
    this.init();
  }

  async init() {
    // Load player model
    this.player = await this._loadPlayer(this.scene);

    // Setup character controller
    await this.setupCharacterController();

    // Set up input and sounds
    this.setKeysObserver();
    this.setPlayerSounds();

    // Set initial position
    this.setPlayerToSleep();
  }

  private async setupCharacterController() {
    // Create a character controller with proper dimensions
    const capsuleHeight = 3.6;
    const capsuleRadius = 0.5;

    // Create physics character controller at the player position
    this.characterController = new PhysicsCharacterController(
      this.player.position,
      { capsuleHeight, capsuleRadius },
      this.scene
    );

    // Create display helper if needed
    this.boxHelper = MeshBuilder.CreateBox(
      "directionHelper",
      { height: 3.2 },
      this.scene
    );
    this.boxHelper.visibility = 0;
  }

  private async _loadPlayer(
    scene: Scene,
    mesheNames: string = "",
    rootUrl: string = "/models/",
    sceneFilename: string = "bearCharacter.glb"
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

    // Set up fur material
    var fur = new FurMaterial("furT", scene);
    fur.highLevelFur = false;
    fur.furLength = 0.2;
    fur.furAngle = Math.PI / 6;
    fur.furColor = new Color3(1, 1, 1);
    fur.furTexture = FurMaterial.GenerateTexture("furTexture", scene);
    fur.diffuseTexture = new Texture("./textures/bluePinkFur.jpg", scene);

    // Apply fur to character meshes except for eyes, mouth, nose
    heroMeshes.forEach((mesh) => {
      if (
        !mesh.name.toLowerCase().includes("eye") &&
        !mesh.name.toLowerCase().includes("mouth") &&
        !mesh.name.toLowerCase().includes("nose")
      ) {
        mesh.material = fur;
      }
    });

    // Set up animations
    animationGroups.forEach((item, index) => {
      item.play(true);
      if (index === AnimationKey.Idle) {
        item.setWeightForAllAnimatables(1);
      } else {
        item.setWeightForAllAnimatables(0);
      }
    });

    // Create player container
    const player = MeshBuilder.CreateCapsule(
      "playerCapsule",
      { height: 3.6, radius: 0.5 },
      this.scene
    );
    player.visibility = 0;

    // Set up player mesh
    hero.scaling = new Vector3(0.75, 0.95, 0.75);
    hero.position.y = -1.8;
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
    this.playerKeys = {
      up: "KeyW",
      down: "KeyS",
      left: "KeyA",
      right: "KeyD",
      jumping: "Space",
    };

    this.scene.actionManager = new ActionManager();
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.code] = true;
        this.handleInputChange();
      })
    );
    this.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.code] = false;
        this.handleInputChange();
      })
    );
  }

  private handleInputChange() {
    if (this.isInSleep) return;

    // Reset input direction
    this.inputDirection.set(0, 0, 0);

    // Handle WASD/arrow keys
    if (this.inputMap[this.playerKeys.up]) this.inputDirection.z = 1;
    if (this.inputMap[this.playerKeys.down]) this.inputDirection.z = -1;
    if (this.inputMap[this.playerKeys.left]) this.inputDirection.x = -1;
    if (this.inputMap[this.playerKeys.right]) this.inputDirection.x = 1;

    // Handle jump
    this.wantJump = !!this.inputMap[this.playerKeys.jumping];

    // Update moving state
    const isMovingNow =
      this.inputDirection.x !== 0 || this.inputDirection.z !== 0;

    // Handle sound and animation changes
    if (isMovingNow !== this.isMoving) {
      this.isMoving = isMovingNow;
      if (isMovingNow && this.state === "ON_GROUND") {
        this.onAnimWeight(AnimationKey.Running);
        if (!this.sounds.walking.isPlaying) {
          this.sounds.walking.play();
        }
      } else if (!isMovingNow) {
        this.sounds.walking.pause();
        if (this.state === "ON_GROUND") {
          this.onAnimWeight(AnimationKey.Idle);
        }
      }
    }
  }

  public onBeforeAnimations() {
    // Handle StandingUp animation completion
    if (this.curAnimParam.anim === AnimationKey.StandingUp) {
      if (!this.animationGroups[this.curAnimParam.anim].isPlaying) {
        this.isWakingUp = false;
        this.onAnimWeight(AnimationKey.Idle);
        return;
      }
    }

    // Update current animation weight
    if (this.curAnimParam.weight < 1) {
      this.curAnimParam.weight += 0.05;
      if (this.curAnimParam.weight > 1) this.curAnimParam.weight = 1;

      const anim = this.animationGroups[this.curAnimParam.anim];
      anim.setWeightForAllAnimatables(this.curAnimParam.weight);
    }

    // Update old animation weight
    if (this.oldAnimParam.weight > 0) {
      this.oldAnimParam.weight -= 0.05;
      if (this.oldAnimParam.weight < 0) this.oldAnimParam.weight = 0;

      const anim = this.animationGroups[this.oldAnimParam.anim];
      anim.setWeightForAllAnimatables(this.oldAnimParam.weight);
    }

    // Reset all other animations
    this.animationGroups?.forEach((ani, key) => {
      if (key !== this.oldAnimParam.anim && key !== this.curAnimParam.anim) {
        ani.setWeightForAllAnimatables(0);
      }
    });
  }

  private onAnimWeight(animKey: number) {
    if (animKey === this.curAnimParam.anim) return;
    this.oldAnimParam.weight = 1;
    this.oldAnimParam.anim = this.curAnimParam.anim;
    this.curAnimParam.weight = 0;
    this.curAnimParam.anim = animKey;
  }

  // Get next state based on support and input
  private getNextState(supportInfo: any): string {
    if (this.state === "IN_AIR") {
      if (supportInfo.supportedState === CharacterSupportedState.SUPPORTED) {
        return "ON_GROUND";
      }
      return "IN_AIR";
    } else if (this.state === "ON_GROUND") {
      if (supportInfo.supportedState !== CharacterSupportedState.SUPPORTED) {
        return "IN_AIR";
      }
      if (this.wantJump) {
        return "START_JUMP";
      }
      return "ON_GROUND";
    } else if (this.state === "START_JUMP") {
      return "IN_AIR";
    }
    return this.state;
  }

  // Calculate desired velocity based on state and inputs
  private getDesiredVelocity(
    deltaTime: number,
    supportInfo: any,
    currentVelocity: Vector3
  ): Vector3 {
    const nextState = this.getNextState(supportInfo);

    // Handle state transitions and animations
    if (nextState !== this.state) {
      // State changed
      const prevState = this.state;
      this.state = nextState;

      // Update animations based on state changes
      if (this.state === "ON_GROUND" && prevState === "IN_AIR") {
        // Just landed
        if (this.isMoving) {
          this.onAnimWeight(AnimationKey.Running);
        } else {
          this.onAnimWeight(AnimationKey.Idle);
        }
      } else if (this.state === "IN_AIR" && prevState === "ON_GROUND") {
        // Just started falling
        this.onAnimWeight(AnimationKey.Falling);
        this.sounds.walking.pause();
      } else if (this.state === "IN_AIR" && prevState === "START_JUMP") {
        // Just started jumping
        this.onAnimWeight(AnimationKey.Falling); // Using falling animation for now
      }
    }

    // Calculate facing direction from camera
    Quaternion.FromEulerAnglesToRef(
      0,
      this.camera.rotation.y,
      0,
      this.characterOrientation
    );
    const upWorld = this.characterGravity.scale(-1).normalize();
    const forwardWorld = new Vector3(0, 0, 1).applyRotationQuaternion(
      this.characterOrientation
    );

    // Calculate velocity based on state
    if (this.state === "IN_AIR") {
      const desiredVel = this.inputDirection
        .scale(this.inAirSpeed)
        .applyRotationQuaternion(this.characterOrientation);
      const outputVelocity = this.characterController.calculateMovement(
        deltaTime,
        forwardWorld,
        upWorld,
        currentVelocity,
        Vector3.Zero(),
        desiredVel,
        upWorld
      );

      // Restore vertical component and add gravity
      outputVelocity.subtractInPlace(
        upWorld.scale(outputVelocity.dot(upWorld))
      );
      outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
      outputVelocity.addInPlace(this.characterGravity.scale(deltaTime));
      return outputVelocity;
    } else if (this.state === "ON_GROUND") {
      const desiredVel = this.inputDirection
        .scale(this.onGroundSpeed)
        .applyRotationQuaternion(this.characterOrientation);
      return this.characterController.calculateMovement(
        deltaTime,
        forwardWorld,
        supportInfo.averageSurfaceNormal,
        currentVelocity,
        supportInfo.averageSurfaceVelocity,
        desiredVel,
        upWorld
      );
    } else if (this.state === "START_JUMP") {
      const jumpVelocity = Math.sqrt(
        2 * this.characterGravity.length() * this.jumpHeight
      );
      const currentUpVel = currentVelocity.dot(upWorld);
      return currentVelocity.add(upWorld.scale(jumpVelocity - currentUpVel));
    }

    return Vector3.Zero();
  }

  updatePlayer(deltaTime: number): void {
    if (!this.scene || !this.characterController) return;

    // Handle sleeping state
    if (this.isInSleep) {
      this.onAnimWeight(AnimationKey.Laying);
      return;
    }

    // Handle waking up state
    if (this.isWakingUp) {
      this.onAnimWeight(AnimationKey.StandingUp);
      return;
    }

    const dt = deltaTime / 1000.0; // Convert to seconds

    // Check if character is supported
    const downDirection = new Vector3(0, -1, 0);
    const support = this.characterController.checkSupport(dt, downDirection);

    // Update velocity based on input and state
    const currentVelocity = this.characterController.getVelocity();
    const desiredVelocity = this.getDesiredVelocity(
      dt,
      support,
      currentVelocity
    );

    // Apply velocity to character controller
    this.characterController.setVelocity(desiredVelocity);

    // Update player position based on character controller
    this.characterController.integrate(dt, support, this.characterGravity);
    this.player.position.copyFrom(this.characterController.getPosition());

    // Update camera target to follow player
    this.camera.setTarget(this.player.position);

    // Update player orientation based on movement
    if (this.isMoving) {
      this.updatePlayerOrientation();
    }
  }

  private updatePlayerOrientation() {
    // Update boxHelper based on camera and input direction
    const cameraDir = this.camera.getForwardRay().direction;
    const horizontalDir = new Vector3(cameraDir.x, 0, cameraDir.z);

    // Calculate facing direction
    let targetDir;
    if (this.inputDirection.z > 0) {
      // Forward
      targetDir = horizontalDir;
    } else if (this.inputDirection.z < 0) {
      // Backward
      targetDir = horizontalDir.scale(-1);
    } else if (this.inputDirection.x > 0) {
      // Right
      const rightDir = Vector3.Cross(Vector3.Up(), horizontalDir).normalize();
      targetDir = rightDir;
    } else if (this.inputDirection.x < 0) {
      // Left
      const leftDir = Vector3.Cross(horizontalDir, Vector3.Up()).normalize();
      targetDir = leftDir;
    }

    if (targetDir) {
      // Get mesh root for rotation
      const [meshRoot] = this.player.getChildMeshes();
      meshRoot.rotationQuaternion =
        meshRoot.rotationQuaternion || Quaternion.Identity();

      // Calculate target rotation
      const targetRotation = Quaternion.FromLookDirectionRH(
        targetDir,
        Vector3.Up()
      );

      // Apply smooth rotation
      Quaternion.SlerpToRef(
        meshRoot.rotationQuaternion,
        targetRotation,
        0.1,
        meshRoot.rotationQuaternion
      );
    }
  }

  public setPlayerToSleep() {
    console.log("SETTING TO SLEEP");
    this.isInSleep = true;
    this.player.position.set(-6, 2, 2);
    this.onAnimWeight(AnimationKey.Laying);
  }

  public wakeUpPlayer() {
    this.isInSleep = false;
    this.player.position.y = 3;
    this.isWakingUp = true;

    // Create character controller if not already created
    if (!this.characterController) {
      this.setupCharacterController();
    }

    this.onAnimWeight(AnimationKey.StandingUp);
  }
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
