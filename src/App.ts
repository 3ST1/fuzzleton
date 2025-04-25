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

enum GameState {
  MENU = 0,
  PLAY = 1,
  LEVEL_CREATOR = 2,
}

export const GRAVITY = 9.81;

class App {
  private canvas!: HTMLCanvasElement;
  private engine!: BABYLON.Engine;
  private scene: BABYLON.Scene | null = null;
  private gameState: GameState = GameState.MENU;
  private assetsManager!: BABYLON.AssetsManager;

  havokPlugin: any;
  physicsPlugin: any;
  physicsViewer: any;
  char: any = null;

  constructor(canvasId: string) {
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
  }

  private async loadHavokPlugin(): Promise<void> {
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
    await this.loadHavokPlugin(); // loading havok before anything else

    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);

    // Display the main menu
    this.displayMainMenu();
  }

  private displayMainMenu(): void {
    const mainMenu = new MainMenu(
      this.canvas,
      this.engine,
      async () => {
        await this.startGame();
      },
      async () => {
        await this.startLevelCreator();
      }
    );

    mainMenu.render();
  }

  private async startGame(): Promise<void> {
    // Set game state
    this.gameState = GameState.PLAY;

    // Reset the scene
    if (this.scene) {
      this.scene.dispose();
    }

    // Create the game scene
    this.scene = await this.createGameScene();

    // Set up render loop for the game scene
    this.engine.runRenderLoop(() => {
      if (this.scene) {
        this.scene.render();
      }
    });
  }

  private async startLevelCreator(): Promise<void> {
    if (this.scene) this.scene.dispose();

    // Set game state
    this.gameState = GameState.LEVEL_CREATOR;

    const lvlCreator = new LevelCreator(this.canvas, this.engine, async () => {
      await this.initialize(this.canvas.id);
    });

    lvlCreator.render();
  }

  private async createGameScene(): Promise<BABYLON.Scene> {
    const scene = new BABYLON.Scene(this.engine);

    // initialize the AssetsManager
    this.assetsManager = initializeAssetsManager(scene, this.engine);

    this._setupPhysics(scene);

    // Set up environment using the Environment class
    const environment = new GameEnvironment(scene, this.canvas);

    const thridPers = true; // false for first person, true for third person
    environment.setupGameEnvironment(thridPers);

    // environment.objectsToAddPhysics.forEach((obj) => {
    //   addPhysicsAggregate(
    //     scene,
    //     obj.mesh,
    //     obj.physicsShapeType,
    //     obj.mass,
    //     obj.friction,
    //     obj.restitution
    //   );
    // });

    // Create the player
    const char = new PlayerController(scene, environment, thridPers);
    this.char = char;

    const level = new Level(scene, environment, this.assetsManager, char);

    this.createButton(environment, char, level);
    await level.initLevel(this.assetsManager);
    console.log("assetsManager after level creation : ", this.assetsManager);

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

    return scene;
  }

  // @ts-ignore
  createButton(env: GameEnvironment, char: PlayerController, level: Level) {
    // Create an advanced dynamic texture (UI Layer)
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GameUI");

    // Create a button
    const button = Button.CreateSimpleButton("btn", "Play (press P)");
    button.width = "200px"; // Set width
    button.height = "50px"; // Set height
    button.color = "white"; // Text color
    button.background = "orange"; // Button background color
    button.cornerRadius = 10; // Rounded corners
    button.fontSize = 20; // Text size

    // Add "Back to Menu" button
    const menuButton = Button.CreateSimpleButton("menuBtn", "Menu");
    menuButton.width = "100px";
    menuButton.height = "40px";
    menuButton.color = "white";
    menuButton.background = "orange";
    menuButton.cornerRadius = 5;
    menuButton.fontSize = 16;
    menuButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    menuButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    menuButton.left = "20px";
    menuButton.top = "20px";

    menuButton.onPointerClickObservable.add(() => {
      if (this.scene) {
        this.scene.dispose();
      }
      this.initialize(this.canvas.id);
    });

    advancedTexture.addControl(menuButton);

    let pKeyListener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "p") {
        console.log("P pressed");
        window.removeEventListener("keydown", pKeyListener);
        button.isVisible = false;
        char.wakeUpPlayer();
        level.generateRandomObjects(100);
      }
    };
    window.addEventListener("keydown", pKeyListener);

    // Set button position
    button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

    // Add button click event
    button.onPointerClickObservable.add(() => {
      window.removeEventListener("keydown", pKeyListener);
      button.isVisible = false;
      console.log("Button clicked -> wakingup the player!");

      if (char) {
        char.wakeUpPlayer();
        level.generateRandomObjects(100);
      }
    });

    // Add button to UI
    advancedTexture.addControl(button);
  }

  //////////// PHYSICS ////////////
  private _setupPhysics(scene: BABYLON.Scene) {
    if (!this.physicsPlugin) {
      console.error("Physics plugin not initialized...");
      throw new Error("Physics plugin not initialized...");
    } else {
      console.log("Physics plugin initialized: ", this.physicsPlugin);
      scene.enablePhysics(
        new BABYLON.Vector3(0, -GRAVITY, 0),
        this.physicsPlugin
      );
      const physicsEngine = scene.getPhysicsEngine();
      if (physicsEngine) {
        physicsEngine.setTimeStep(1 / 60);
      }

      console.log("Physics enabled to scene: ");

      return scene.getPhysicsEngine();
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
