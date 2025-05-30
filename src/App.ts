import * as BABYLON from "@babylonjs/core"; // Seems like we need that for BABYLON.HavokPlugin
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
// import HavokPhysics from "@babylonjs/havok";
import HavokPlugin from "@babylonjs/havok";
import { GameEnvironment } from "./GameEnvironnement";
import {
  AdvancedDynamicTexture,
  Button,
  TextBlock,
  Control,
} from "@babylonjs/gui";
import PlayerController from "./player/thirdPersonController";
import { Level } from "./level/Level";
import MainMenu from "./MainMenu";
import LevelCreator from "./levelCreator/levelCreator";
import { initializeAssetsManager } from "./basicAssetManager";
import {
  SceneSerializer,
  SerializedScene,
} from "./levelCreator/SceneSerializer";
import { AssetManagerService } from "./AssetManagerService";

// FOR MULTIPLAYER
import { io, Socket } from "socket.io-client";

export enum GameState {
  MENU = 0,
  PLAY = 1,
  LEVEL_CREATOR = 2,
  TEST_LEVEL = 3,
  //
  MULTIPLAYER_LOBBY = 4,
  MULTIPLAYER_CREATING = 5,
  MULTIPLAYER_TESTING_SETUP = 6, // Optional intermediate state
  MULTIPLAYER_TESTING = 7,
}

export const GRAVITY = 9.81;

class App {
  private canvas!: HTMLCanvasElement;
  private engine!: BABYLON.Engine;
  private scene: BABYLON.Scene | null = null;
  public gameState: GameState = GameState.MENU;
  // private assetsManager!: BABYLON.AssetsManager;

  // For multiplayer
  private socket: Socket | null = null;
  private playerId: string | null = null;
  private currentRoomId: string | null = null;
  private currentRoomData: any = null; // To store room state from server
  //

  private currentLevelTestData: string | null = null;
  public appInstance!: App; // To pass App instance to LevelCreator

  havokPlugin: any;
  physicsPlugin: any;
  physicsViewer: any;
  char: any = null;
  // assetManagerService!: AssetManagerService;
  mainMenu!: MainMenu;

  constructor(canvasId: string) {
    this.appInstance = this;
    this.initialize(canvasId);
    // Handle window resizing
    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // 'I' or 'i' to show/hide inspector
      if (ev.key === "i" || ev.key === "I") {
        if (this.scene?.debugLayer.isVisible()) {
          this.scene.debugLayer.hide();
        } else {
          this.scene?.debugLayer.show();
        }
      }
    });

    // Connect to the socket server
    // this.connectToSocketServer();
  }

  // private connectToSocketServer(): void {
  //   this.socket = io("http://localhost:3000"); // Your server address

  //   this.socket.on("connect", () => {
  //     console.log("Connected to socket server with ID:", this.socket?.id);
  //     this.playerId = this.socket?.id || null;
  //   });

  //   this.socket.on("disconnect", () => {
  //     console.log("Disconnected from socket server");
  //     // Handle disconnection, maybe return to main menu
  //   });

  //   this.socket.on("roomUpdate", (roomData: any) => {
  //     console.log("Room update received:", roomData);
  //     this.currentRoomData = roomData;
  //     // Update UI based on roomData (e.g., player list, game state)
  //     this.handleRoomStateChange(roomData.state, roomData);
  //   });

  //   this.socket.on("startCreationPhase", ({ duration }) => {
  //     console.log(
  //       `Server started creation phase for ${duration / 1000} seconds.`
  //     );
  //     this.gameState = GameState.MULTIPLAYER_CREATING;
  //     // TODO: Start LevelCreator, show timer
  //     // You might need a dedicated method in App.ts to start LevelCreator for multiplayer
  //     this.startMultiplayerLevelCreator(duration);
  //   });

  //   this.socket.on("startTestingPhase", ({ levelToTest, testDuration }) => {
  //     console.log("Server started testing phase. Level to test:", levelToTest);
  //     this.gameState = GameState.MULTIPLAYER_TESTING;
  //     // The `levelToTest` will be the SerializedScene string
  //     this.currentLevelTestData = levelToTest; // Or a new property for multiplayer level
  //     this.startMultiplayerTest(testDuration);
  //   });

  //   this.socket.on("error", (error) => {
  //     console.error("Socket error:", error);
  //     // Handle errors, e.g., display a message to the user
  //   });
  // }

  // public createMultiplayerRoom(): void {
  //   this.socket?.emit(
  //     "createRoom",
  //     (response: { roomId: string; players: any[] }) => {
  //       if (response.roomId) {
  //         this.currentRoomId = response.roomId;
  //         this.gameState = GameState.MULTIPLAYER_LOBBY;
  //         console.log(`Created and joined room: ${this.currentRoomId}`);
  //         // Transition to a lobby UI screen
  //       } else {
  //         console.error("Failed to create room");
  //       }
  //     }
  //   );
  // }

  // public joinMultiplayerRoom(roomIdToJoin: string, playerName: string): void {
  //   if (!roomIdToJoin) {
  //     alert("Please enter a room ID.");
  //     return;
  //   }
  //   this.socket?.emit(
  //     "joinRoom",
  //     { roomId: roomIdToJoin.toUpperCase(), playerName },
  //     (response: { success: boolean; room?: any; message?: string }) => {
  //       if (response.success && response.room) {
  //         this.currentRoomId = response.room.id;
  //         this.currentRoomData = response.room;
  //         this.gameState = GameState.MULTIPLAYER_LOBBY;
  //         console.log(`Joined room: ${this.currentRoomId}`);
  //         // Transition to lobby UI
  //       } else {
  //         alert(`Failed to join room: ${response.message || "Unknown error"}`);
  //         console.error("Failed to join room:", response.message);
  //       }
  //     }
  //   );
  // }

  private async loadHavokPlugin(): Promise<void> {
    console.log("Loading Havok Plugin...");
    try {
      this.havokPlugin = await HavokPlugin();
      this.physicsPlugin = new BABYLON.HavokPlugin(true, this.havokPlugin);

      // Ensure the physics plugin is initialized before creating the physics viewer
      await new Promise<void>((resolve) => {
        if (this.physicsPlugin) resolve();
      });

      this.physicsViewer = new BABYLON.PhysicsViewer();
    } catch (error) {
      console.error("Failed to load Havok Plugin:", error);
    }
  }

  private async initialize(canvasId: string) {
    // await this.loadHavokPlugin(); // loading havok before anything else

    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);
    // const nullScene = new BABYLON.Scene(this.engine); // just so we can start loading assets in background
    // this.assetManagerService = AssetManagerService.setInstance(nullScene);
    // this.assetManagerService = new AssetManagerService(nullScene);

    // Display the main menu
    await this.displayMainMenu();
  }

  private async displayMainMenu(): Promise<void> {
    this.gameState = GameState.MENU; // Explicitly set menu state
    this.currentLevelTestData = null; // Clear test data
    this.mainMenu = new MainMenu(
      this.canvas,
      this.engine,
      async () => {
        await this.startGame();
      },
      async () => {
        await this.startLevelCreator();
      }
    );

    await this.mainMenu.initMenu();
    this.mainMenu.render();
  }

  private async startGame(isTesting: boolean = false): Promise<void> {
    // Set game state
    this.gameState = isTesting ? GameState.TEST_LEVEL : GameState.PLAY;

    // Reset the scene
    if (this.scene) {
      this.scene.dispose();
      this.scene = null; // Clear the scene reference
    }

    // Create the game scene
    this.scene = await this.createGameScene();

    // Set up render loop for the game scene

    this.engine.runRenderLoop(() => {
      if (
        this.scene &&
        // this.scene.isReady() &&
        this.engine &&
        this.physicsPlugin
      ) {
        this.scene.render();
      }
    });
  }

  private async startLevelCreator(): Promise<void> {
    if (this.scene) this.scene.dispose();

    const scene = new BABYLON.Scene(this.engine);
    if (scene) {
      await this._setupPhysics(scene); // Ensure physics is set up for the new scene
    }

    // Create new level creator only if we don't have a saved instance

    const lvlCreator = new LevelCreator(
      this.canvas,
      this.engine,
      scene,
      this,
      this.currentLevelTestData
    );

    // Render the level creator
    lvlCreator.render();

    // Set game state
    this.gameState = GameState.LEVEL_CREATOR;
  }

  public async startTestLevel(levelDataJSON: string): Promise<void> {
    // Store current level data
    this.currentLevelTestData = levelDataJSON;

    await this.startGame(true);
  }

  // private async createGameScene(): Promise<BABYLON.Scene> {
  //   const scene = new BABYLON.Scene(this.engine);

  //   // initialize the AssetsManager
  //   this.assetsManager = initializeAssetsManager(scene, this.engine);

  //   this._setupPhysics(scene);

  //   // Set up environment using the Environment class
  //   const environment = new GameEnvironment(scene, this.canvas);

  //   const thridPers = true; // false for first person, true for third person
  //   environment.setupGameEnvironment(thridPers);

  //   // environment.objectsToAddPhysics.forEach((obj) => {
  //   //   addPhysicsAggregate(
  //   //     scene,
  //   //     obj.mesh,
  //   //     obj.physicsShapeType,
  //   //     obj.mass,
  //   //     obj.friction,
  //   //     obj.restitution
  //   //   );
  //   // });

  //   // Create the player
  //   const char = new PlayerController(scene, environment, thridPers);
  //   this.char = char;

  //   const level = new Level(scene, environment, this.assetsManager, char);

  //   this.createButton(environment, char, level);
  //   await level.initLevel(this.assetsManager);
  //   console.log("assetsManager after level creation : ", this.assetsManager);

  //   this.canvas.style.opacity = "1";

  //   scene.onBeforeRenderObservable.add(() => {
  //     environment.updateFps(this.engine.getFps());
  //     if (this.scene) {
  //       char.updatePlayer(this.scene.deltaTime);
  //     }
  //   });
  //   scene.onBeforeAnimationsObservable.add(() => {
  //     char.onBeforeAnimations();
  //   });

  //   return scene;
  // }

  private async createGameScene(): Promise<BABYLON.Scene> {
    const scene = new BABYLON.Scene(this.engine);
    // this.assetsManager = initializeAssetsManager(scene, this.engine); old BASIC AssetManager
    await this._setupPhysics(scene);

    console.log("DEBUG physics : ", scene.getPhysicsEngine());

    // Initialize the AssetManagerService
    const assetManagerService = new AssetManagerService(scene);

    const environment = new GameEnvironment(scene, this.canvas);
    const thirdPers = true;
    environment.setupGameEnvironment(thirdPers);

    const char = new PlayerController(scene, environment, thirdPers);
    this.char = char;

    let levelDataForLoading: SerializedScene | null = null;
    if (this.gameState === GameState.TEST_LEVEL && this.currentLevelTestData) {
      try {
        levelDataForLoading = await SceneSerializer.parseSerializedScene(
          this.currentLevelTestData
        );
        console.log("Loading test level data:", levelDataForLoading);
      } catch (e) {
        console.error("Error parsing test level data:", e);
        // Fallback or error handling
      }
    }

    const level = new Level(
      scene,
      environment,
      // this.assetManagerService,
      assetManagerService,
      char,
      levelDataForLoading // Pass parsed data
    );

    this.createButton(environment, char, level); // Pass level here if needed
    await level.initLevel(assetManagerService);

    this.canvas.style.opacity = "1";

    scene.onBeforeRenderObservable.add(() => {
      environment.updateFps(this.engine.getFps());
      if (this.scene) {
        char.updatePlayer(this.scene.deltaTime);
      }
    });
    scene.onBeforeAnimationsObservable.add(() => {
      char.onBeforeAnimations();
    });

    // this.assetManagerService.changeScene(scene);
    return scene;
  }

  // @ts-ignore
  createButton(env: GameEnvironment, char: PlayerController, level: Level) {
    // Added level
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GameUI");

    // "Play (press P)" button - conditional visibility or different behavior in test mode
    const playButton = Button.CreateSimpleButton("btn", "Play (press P)");
    playButton.width = "150px";
    playButton.height = "40px";
    playButton.color = "white";
    playButton.background = "orange";
    playButton.cornerRadius = 5;
    playButton.fontSize = 16;
    playButton.isVisible = true; // Always show the button, even in test mode

    // Back button
    let backButtonText = "Menu";
    let backButtonAction = () => {
      console.log("Back to main menu from game");
      // if (this.scene) this.scene.dispose();
      // this.displayMainMenu(); // Go to main menu
      this.backToMenu(); // Use the backToMenu method to handle all game states
    };

    if (this.gameState === GameState.TEST_LEVEL) {
      backButtonText = "Back to Creator";
      // backButtonAction = async () => {
      //   console.log("Back to level creator from test mode");
      //   if (this.scene) this.scene.dispose();
      //   await this.startLevelCreator();
      // };
    }

    const backBtn = Button.CreateSimpleButton("backBtn", backButtonText);
    backBtn.width = "150px";
    backBtn.height = "40px";
    backBtn.color = "white";
    backBtn.background = "orange";
    backBtn.cornerRadius = 5;
    backBtn.fontSize = 16;
    backBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    backBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    backBtn.left = "20px";
    backBtn.top = "20px";
    backBtn.onPointerClickObservable.add(backButtonAction);
    advancedTexture.addControl(backBtn);

    let pKeyListener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "p") {
        // Allow P key in all modes
        console.log("P pressed");
        window.removeEventListener("keydown", pKeyListener);
        playButton.isVisible = false;
        char.wakeUpPlayer();
        level.generateRandomObjects(100);
      }
    };
    window.addEventListener("keydown", pKeyListener);

    playButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    playButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

    playButton.onPointerClickObservable.add(() => {
      window.removeEventListener("keydown", pKeyListener);
      playButton.isVisible = false;
      console.log("Button clicked -> wakingup the player!");
      if (char) {
        char.wakeUpPlayer();
        level.generateRandomObjects(100);
      }
    });
    advancedTexture.addControl(playButton);

    // Test mode will use the same button/key functionality as normal game
  }

  //////////// PHYSICS ////////////
  private async _setupPhysics(
    scene: BABYLON.Scene
  ): Promise<BABYLON.PhysicsEngine | null> {
    // to be sure we reload havok plugin
    if (this.physicsPlugin) {
      this.physicsPlugin.dispose();
      this.physicsPlugin = null;
    }
    console.log("Setting up physics");
    // Reload the Havok plugin
    await this.loadHavokPlugin();

    if (!this.physicsPlugin) {
      console.error("Physics plugin not initialized...");
      throw new Error("Physics plugin not initialized...");
    } else {
      console.warn("Physics plugin initialized: ", this.physicsPlugin);
      scene.enablePhysics(
        new BABYLON.Vector3(0, -GRAVITY, 0),
        this.physicsPlugin
      );
      const physicsEngine = scene.getPhysicsEngine();
      if (physicsEngine) {
        physicsEngine.setTimeStep(1 / 60);
      }

      console.log("Physics enabled to scene: ");

      return scene.getPhysicsEngine() as BABYLON.PhysicsEngine | null;
    }
  }

  public backToMenu() {
    if (this.scene) {
      this.scene.dispose();
      this.scene = null; // Clear the scene reference
      console.log("Scene disposed and cleared.");
    }
    if (this.gameState === GameState.LEVEL_CREATOR) {
      this.displayMainMenu();
      // this.initialize(this.canvas.id); // Reinitialize the app to reset everything
    } else if (this.gameState === GameState.TEST_LEVEL) {
      this.startLevelCreator(); // Go back to level creator from the test
    } else {
      // this.initialize(this.canvas.id); // Reinitialize the app to reset everything
      this.displayMainMenu(); // Go to main menu
    }
  }
}

function getLinearDamping(mass: number, friction: number): number {
  return Math.min(1, friction / 10 + mass / 100000); // TODO: improve this and add it back to addPhysicsAggregate
}

export function addPhysicsAggregate(
  scene: BABYLON.Scene,
  meshe: BABYLON.TransformNode,
  shape: BABYLON.PhysicsShapeType,
  mass: number = 0,
  friction: number = 0.5,
  restitution: number = 0
): BABYLON.PhysicsAggregate {
  const physicsAggregate = new BABYLON.PhysicsAggregate(
    meshe,
    shape,
    { mass: mass, friction: friction, restitution: restitution },
    scene
  );

  // Set linear damping based on mass and friction
  // physicsAggregate.body.setLinearDamping(getLinearDamping(mass, friction));

  // Store it inside the mesh for later use (accessible through metadata)
  meshe.metadata = { physicsAggregate };

  return physicsAggregate;
}

export default App;
