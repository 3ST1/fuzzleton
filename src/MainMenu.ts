import {
  ArcRotateCamera,
  HemisphericLight,
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Mesh,
  Color4,
  Texture,
  SpotLight,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Button,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";

// import earcut and make it globally available for TextMeshBuilder
import * as earcutLib from "earcut";
(window as any).earcut = earcutLib.default || earcutLib;

class MainMenu {
  public engine: any;
  public menuScene: any;
  private menuUI!: AdvancedDynamicTexture;

  // Callback functions to communicate with App
  private startLevelCreator: (() => void) | null = null;
  private startGame: (() => void) | null = null;
  canvas: any;

  constructor(canvas, engine, startGame, startLevelCreator) {
    this.engine = engine;
    this.canvas = canvas;
    this.startGame = startGame;
    this.startLevelCreator = startLevelCreator;

    // this.initMenu();
  }

  async initMenu() {
    console.log("Main Menu Initialized");

    // basic scene for the menu
    const menuScene = new Scene(this.engine);
    this.menuScene = menuScene;

    // Set the scene background color (light blue-gray)
    menuScene.clearColor = new Color4(0.8, 0.85, 0.9, 1.0);

    // basic camera for the menu - adjust position for better 3D text view
    const camera = new ArcRotateCamera(
      "menuCamera",
      Math.PI / 2,
      Math.PI / 2,
      -100,
      new Vector3(0, 8, 0),
      menuScene
    );

    // Disable camera controls to prevent movement
    camera.inputs.clear();
    // Fix camera position - do not attach control to canvas
    // camera.attachControl(this.canvas, true);

    // Add some basic lighting
    const light = new HemisphericLight(
      "menuLight",
      new Vector3(0, 1, 0),
      menuScene
    );

    // Add spotlight targeting the text
    const spotlight = new SpotLight(
      "spotlight",
      new Vector3(0, 30, -20),
      new Vector3(0, -0.3, 0.7),
      Math.PI / 4,
      10,
      menuScene
    );
    spotlight.diffuse = new Color3(1, 0.8, 0.5);
    spotlight.intensity = 0.7;

    // Add 3D text for title
    try {
      const fontData = await (
        await fetch("./fonts/Marck_Script_Regular.json")
      ).json();
      const titleText = MeshBuilder.CreateText(
        "elegantText",
        "Fuzzelton",
        fontData,
        {
          size: 20,
          resolution: 64,
          depth: 5,
          sideOrientation: Mesh.DOUBLESIDE,
        },
        menuScene
      );

      if (!titleText) {
        throw new Error("failed to create 3D text mesh");
      }
      // Position the 3D text
      titleText.position = new Vector3(0, 15, 0);

      // Create material for the 3D text
      const titleMaterial = new StandardMaterial("titleMaterial", menuScene);

      // https://mycould.tristan-patout.fr/api/fuzzelton/assets/textures/bluePinkFur.jpg
      // '/api/assets/' is proxied to the api in the vite.config.ts
      const texture = new Texture(
        "/api/assets/textures/bluePinkFur.jpg",
        menuScene
      );

      titleMaterial.diffuseTexture = texture;
      titleMaterial.specularColor = new Color3(0.1, 0.1, 0.1);

      // if (titleMaterial.diffuseTexture) {
      //   titleMaterial.diffuseTexture.uScale = 1;
      //   titleMaterial.diffuseTexture.vScale = 1;
      // }

      titleText.material = titleMaterial;
    } catch (error) {
      console.error("Failed to load 3D font:", error);
    }

    // Create the main menu
    this.createMainMenu();
  }

  private createMainMenu(): void {
    if (!this.menuScene) return;

    console.log("Creating main menu...");

    this.menuUI = AdvancedDynamicTexture.CreateFullscreenUI("menuUI");

    // Create container for buttons
    const buttonPanel = new StackPanel();
    buttonPanel.width = "400px";
    buttonPanel.height = "500px";
    buttonPanel.top = "200px";
    buttonPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

    this.menuUI.addControl(buttonPanel);

    const spacing = new Rectangle("spacing");
    spacing.height = "30px";
    spacing.thickness = 0;
    buttonPanel.addControl(spacing);

    // Play Game button
    const playButton = Button.CreateSimpleButton("playButton", "Play Game");
    this.styleMenuButton(playButton);
    playButton.onPointerClickObservable.add(() => {
      if (this.startGame) {
        this.startGame();
        this.dispose();
      } else {
        console.error("Start Game callback is not set.");
      }
    });
    buttonPanel.addControl(playButton);
    buttonPanel.addControl(spacing.clone());
    // Level Creator button
    const creatorButton = Button.CreateSimpleButton(
      "creatorButton",
      "Level Creator"
    );
    this.styleMenuButton(creatorButton);
    creatorButton.onPointerClickObservable.add(() => {
      if (this.startLevelCreator) {
        this.startLevelCreator();
        this.dispose();
      } else {
        console.error("Level Creator callback is not set.");
      }
    });
    buttonPanel.addControl(creatorButton);
  }

  private styleMenuButton(button: Button): void {
    button.width = "300px";
    button.height = "60px";
    button.color = "white";
    button.fontSize = 24;
    button.background = "orange";
    button.cornerRadius = 10;
    button.thickness = 2;
    button.shadowColor = "black";
    button.shadowBlur = 5;
    button.shadowOffsetX = 2;
    button.shadowOffsetY = 2;

    button.pointerEnterAnimation = () => {
      button.hoverCursor = "pointer";
      button.background = "#ff8c00";
      button.scaleX = 1.05;
      button.scaleY = 1.05;
    };

    button.pointerOutAnimation = () => {
      button.background = "orange";
      button.scaleX = 1;
      button.scaleY = 1;
    };
  }

  dispose() {
    console.log("Disposing main menu...");
    if (this.menuScene) {
      this.menuScene.dispose();
    }
    if (this.menuUI) {
      this.menuUI.dispose();
    }
  }

  render() {
    console.log("Rendering main menu...");
    this.engine.runRenderLoop(() => {
      this.menuScene.render();
    });
  }
}

export default MainMenu;
