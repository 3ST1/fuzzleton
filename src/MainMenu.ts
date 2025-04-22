import {
  ArcRotateCamera,
  HemisphericLight,
  Scene,
  Vector3,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Button,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";

class MainMenu {
  engine: any;
  menuScene: any;
  menuUI!: AdvancedDynamicTexture;

  // Callback functions to communicate with App
  private startLevelCreator: (() => void) | null = null;
  private startGame: (() => void) | null = null;
  canvas: any;

  constructor(canvas, engine, startGame, startLevelCreator) {
    this.engine = engine;
    this.canvas = canvas;
    this.startGame = startGame;
    this.startLevelCreator = startLevelCreator;

    this.init();
  }

  init() {
    console.log("Main Menu Initialized");

    // basic scene for the menu
    const menuScene = new Scene(this.engine);
    this.menuScene = menuScene;

    // basic camera for the menu
    const camera = new ArcRotateCamera(
      "menuCamera",
      Math.PI / 2,
      Math.PI / 2,
      10,
      Vector3.Zero(),
      menuScene
    );
    camera.attachControl(this.canvas, true);

    // Add some basic lighting
    const light = new HemisphericLight(
      "menuLight",
      new Vector3(0, 1, 0),
      menuScene
    );

    // Create the main menu
    this.createMainMenu();
  }

  private createMainMenu(): void {
    if (!this.menuScene) return;

    console.log("Creating main menu...");

    // fullscreen UI
    this.menuUI = AdvancedDynamicTexture.CreateFullscreenUI("menuUI");

    // Create background
    // const background = new Rectangle("menuBackground");
    // background.width = 1;
    // background.height = 1;
    // background.thickness = 0;
    // background.background = "transparent";
    // background.zIndex = -1;
    // this.menuUI.addControl(background);

    // Create title
    const title = new TextBlock("title", "Fuzzelton");
    title.color = "#5f4c5a";
    title.fontSize = 128;
    title.height = "300px";
    title.fontWeight = "bold";
    title.fontFamily = "'Parisienne', cursive";
    title.top = "-200px";
    title.outlineWidth = 5;
    title.outlineColor = "lightsmoke";
    this.menuUI.addControl(title);

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

    // Add hover effect
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
