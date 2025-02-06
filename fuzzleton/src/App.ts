import * as BABYLON from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
// import HavokPhysics from "@babylonjs/havok";
import HavokPlugin from "@babylonjs/havok";
import {
  Environment as GameEnvironment,
  MyEnvObjsToAddPhysics,
} from "./Environnement";
import {
  AdvancedDynamicTexture,
  StackPanel,
  Button,
  TextBlock,
} from "@babylonjs/gui";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";
import PlayerController from "./thirdPersonController";
import { Level } from "./Level";
import { hideLoading } from ".";

// Define game states
// enum State {
//   START = 0,
//   GAME = 1,
//   LOSE = 2,
//   CUTSCENE = 3,
// }

export const GRAVITY = 9.81;

class App {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene | null = null;
  // private state: State = State.START;
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
          this.scene.debugLayer.show();
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
    await this.loadHavokPlugin(); // Ensure physics plugin is loaded before anything else
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);

    // this.changeState(State.START);
    this.createGameScene().then((scene) => {
      this.scene = scene;
      this.engine.runRenderLoop(() => {
        scene.render();
      });
    });
  }

  private async createGameScene(): Promise<BABYLON.Scene> {
    const scene = new BABYLON.Scene(this.engine);
    this._setupPhysics(scene);

    // Set up environment using the Environment class
    const environment = new GameEnvironment(scene, this.canvas);

    const thridPers = true; // false for first person, true for third person
    environment.setupGameEnvironment(thridPers);
    environment.objectsToAddPhysics.forEach((obj) => {
      addPhysicsAggregate(
        scene,
        obj.mesh,
        obj.physicsShapeType,
        obj.mass,
        obj.friction,
        obj.restitution
      );
    });

    // Create the player
    const char = new PlayerController(scene, environment, thridPers);

    this.createButton(environment, char);

    // char.setPlayerToSleep();
    console.log("Will create btn ");

    const level = new Level(scene, environment);
    await level.initLevel();

    this.canvas.style.opacity = "1";
    // hideLoading();

    // console.log("DEBUG: ");
    // // Render loop
    // scene.onBeforeRenderObservable.add(() => {
    //   // console.log("Rendering game scene...");
    //   // Update player movement and physics
    //   // player.update(this.keyMap, deltaTime);
    // });

    // Create and initialize the player
    // const character = new Character(scene);

    // scene.onBeforeRenderObservable.add(() => {
    //   character.move(inputMap);
    //   character.update();
    // });

    // Load the player
    // this.loadPlayer(scene, environment);

    scene.onBeforeRenderObservable.add(() => {
      environment.updateFps(this.engine.getFps());
      char.updatePlayer(this.scene.deltaTime);
    });
    scene.onBeforeAnimationsObservable.add(() => {
      char.onBeforeAnimations();
      // console.log("Before Animations");
    });

    return scene;
  }

  createButton(env: GameEnvironment, char: PlayerController) {
    // console.log("CREATING BTN ");
    // Create an advanced dynamic texture (UI Layer)
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Create a button
    const button = Button.CreateSimpleButton("btn", "Play (press P)");
    button.width = "200px"; // Set width
    button.height = "50px"; // Set height
    button.color = "white"; // Text color
    button.background = "orange"; // Button background color
    button.cornerRadius = 10; // Rounded corners
    button.fontSize = 20; // Text size

    let pKeyListener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "p") {
        console.log("P pressed");
        window.removeEventListener("keydown", pKeyListener);
        button.isVisible = false;
        char.wakeUpPlayer();
        env.generateRandomObjects(100);
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
        env.generateRandomObjects(100);
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
      scene.getPhysicsEngine().setTimeStep(1 / 60);

      console.log("Physics enabled to scene: ");

      return scene.getPhysicsEngine();
    }
  }

  ////////////////////////
}

function getLinearDamping(mass: number, friction: number): number {
  return Math.min(1, friction / 10 + mass / 100000); // Adjust as needed
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
