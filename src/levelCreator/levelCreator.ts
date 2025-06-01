import {
  ArcRotateCamera,
  Color3,
  Engine,
  HighlightLayer,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  Scene,
  StandardMaterial,
  Vector3,
  LinesMesh,
  KeyboardEventTypes,
  AbstractMesh,
  HemisphericLight,
  TransformNode,
  Quaternion,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { LevelCreatorUI, UIEvents } from "./UI";
import { AssetManagerService } from "../AssetManagerService";
import { MeshUtils } from "./MeshUtils";
import { ObjectController } from "./ObjectController";
import { ModelManager } from "./ModelManager";
import { SceneSerializer } from "./SceneSerializer";
import { BASE_URL, modelFiles } from "./assetsLinks";
import App, { GameState } from "../App";
// import { SceneSerializer } from "../levelCreator/SceneSerializer";
class LevelCreator {
  // Core properties
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  public lvlCreatorScene: Scene;

  private lvlCreatorCamera!: ArcRotateCamera;
  private light!: HemisphericLight;

  // Scene objects
  private ground!: Mesh;
  private materials: { [key: string]: StandardMaterial } = {};
  private placedMeshes: Mesh[] = [];
  private winMesh: Mesh | null = null; // Mesh to indicate level completion when user touches it
  private highlightLayer: HighlightLayer | null = null;
  private gridMesh: LinesMesh | null = null;

  // Drag and drop state
  private isDragging: boolean = false;
  private currentDragMeshType: string = "";
  private previewMesh: Mesh | null | undefined = null;

  // Controls
  private objectController!: ObjectController;
  private gridSize: number = 2;
  private snapToGrid: boolean = false;

  // Asset management
  private assetManager: AssetManagerService;
  private modelManager: ModelManager | null = null;
  private sceneName: string = "MyLevel";

  // UI
  private ui: LevelCreatorUI;
  modelFiles: string[];

  app: App;

  constructor(
    canvas: HTMLCanvasElement,
    engine: Engine,
    scene: Scene,
    app: App, // App instance
    sceneData: any | null = null // Serialized scene data
  ) {
    this.canvas = canvas;
    this.engine = engine;
    this.app = app;

    // Initialize model files from imported hosted in my own vps cloud storage
    this.modelFiles = modelFiles;

    // Initialize scene
    this.lvlCreatorScene = this.createScene(scene);

    // set the passed asset manager and set the scene to it
    this.assetManager = new AssetManagerService(this.lvlCreatorScene);
    // this.assetManager = app.assetManagerService;
    // this.assetManager.changeScene(this.lvlCreatorScene);

    // Initialize services
    this.modelManager = new ModelManager(
      this.lvlCreatorScene,
      this.assetManager,
      this.gridSize,
      this.snapToGrid
    );

    // Setup UI
    this.ui = this.createUI();

    // create the object controller
    this.objectController = this.createObjectController(
      this.lvlCreatorScene,
      this.ui,
      this.highlightLayer!,
      this.assetManager
    );

    // Load assets and setup UI when ready
    this._loadAssets().then(() => {
      console.log("Assets loaded successfully in Level Creator");

      // If serialized scene is provided load it
      if (sceneData) {
        console.log("Loading serialized scene in Level Creator");

        // Parse scene data if it's a string
        let parsedSceneData = sceneData;
        if (typeof sceneData === "string") {
          try {
            parsedSceneData = JSON.parse(sceneData);
            console.log("Successfully parsed scene data in constructor");
          } catch (error) {
            console.error("Error parsing scene data in constructor:", error);
            parsedSceneData = null;
          }
        }

        if (parsedSceneData) {
          this.loadSceneMeshes(parsedSceneData);
          this.sceneName = parsedSceneData.name || "MyLevel";
          this.ui.setSceneName(this.sceneName);
        } else {
          console.error(
            "Failed to load serialized scene - invalid data format"
          );
        }
      } else {
        console.log("No serialized scene provided, starting with empty scene");
      }
    });
  }

  // INIT
  private createScene(scene: Scene): Scene {
    // const scene = new Scene(this.engine);

    // debug
    window.addEventListener("keydown", (ev) => {
      if (ev.key === "i" || ev.key === "I") {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // Setup camera
    this.lvlCreatorCamera = this.createCamera(scene);

    // Setup lighting
    this.light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

    // Create ground
    this.ground = MeshUtils.createGround(scene);

    // Create highlight layer
    this.highlightLayer = new HighlightLayer("highlightLayer", scene);

    // Create grid (initially hidden)
    this.gridMesh = MeshUtils.createGridMesh(scene, this.gridSize);

    // Setup interaction handlers
    this.setupInteractionHandlers(scene);

    // Setup keyboard controls
    this.setupKeyboardControls(scene);

    return scene;
  }

  private createUI(): LevelCreatorUI {
    // UI event handlers
    const uiEvents: UIEvents = {
      onGridToggle: (enabled) => this.toggleGrid(enabled),
      onSaveScene: () => this.saveScene(),
      onLoadScene: () => this.loadScene(),
      onBackToMenu: () => this.handleBackToMenu(),
      onModelSelected: (modelId) => this.startDraggingModel(modelId),
      onTestLevel: () => this.handleTestLevel(),
      detachCameraControlForXSeconds: (seconds) =>
        this.detachCameraControlForXSeconds(seconds),
    };

    // Create UI
    const ui = new LevelCreatorUI(
      this.lvlCreatorScene,
      this.ground,
      this.gridMesh,
      this.assetManager,
      this.highlightLayer,
      uiEvents
    );

    return ui;
  }

  private createObjectController(
    scene: Scene,
    ui: LevelCreatorUI,
    higlightLyr: HighlightLayer,
    assetMngr: AssetManagerService
  ): ObjectController {
    // Create object controller
    // const editorUI = ui.getEditorUI();
    const objectController = new ObjectController(
      scene,
      ui,
      higlightLyr,
      assetMngr,
      this.gridSize,
      this.snapToGrid,
      (mesh) => this.handleMeshDeletion(mesh),
      this.detachCameraControlForXSeconds
    );

    return objectController;
  }

  private createCamera(scene: Scene): ArcRotateCamera {
    const camera = new ArcRotateCamera(
      "Camera",
      0,
      0,
      10,
      new Vector3(0, 0, 0),
      scene
    );
    camera.setPosition(new Vector3(20, 200, 100));

    // prevent camera from going below ground
    camera.lowerBetaLimit = 0.1;

    // min radius to prevent getting too close to ground
    camera.minZ = 0.1;
    camera.lowerRadiusLimit = 5;

    // restricting vertical movement to noot go under ground
    camera.upperBetaLimit = Math.PI / 2 - 0.1;

    // ensure camera does not go and see below ground
    scene.onBeforeRenderObservable.add(() => {
      const groundHeight = 0;
      const minHeightAboveGround = 3;
      if (camera.position.y < groundHeight + minHeightAboveGround) {
        camera.position.y = groundHeight + minHeightAboveGround;
      }
      if (camera.target.y < groundHeight) {
        camera.target.y = groundHeight;
      }
    });

    camera.attachControl(this.canvas, true);
    return camera;
  }

  /// MESH MANAGEMENT

  public handleGroundClick(): void {
    console.log("Clicking on ground/grid - removing all highlights");
    this.objectController.deselectControlPoint();
    // Get currently selected mesh and remove its highlights directly
    const selectedMesh = this.objectController.getSelectedMesh();
    if (selectedMesh && this.highlightLayer) {
      // console.log(
      //   "Removing highlight from previously selected mesh:",
      //   selectedMesh.name
      // );
      this.highlightLayer.removeMesh(selectedMesh as Mesh);

      // Also remove highlights from all child meshes
      selectedMesh.getChildMeshes().forEach((childMesh) => {
        // console.log("Removing highlight from child mesh:", childMesh.name);
        this.highlightLayer?.removeMesh(childMesh as Mesh);
      });
    }

    this.objectController.deselectMesh();
  }

  private handleMeshDeletion(mesh: Mesh): void {
    if (!mesh) return;
    if (!this.modelManager) {
      console.error("ModelManager not initialized.");
      return;
    }
    if (!this.objectController) {
      console.error("ObjectController not initialized.");
      return;
    }

    console.log(
      `Trying to delete the mesh ${mesh.name} from level creator scene`
    );

    try {
      // Remove from model manager
      this.modelManager.deleteMesh(mesh);

      // Remove from placed meshes array
      const index = this.placedMeshes.findIndex(
        (m) => m === mesh || m.id === mesh.id
      );

      if (index !== -1) {
        console.log("index of mesh to delete in placedMeshes : ", index);
        this.placedMeshes.splice(index, 1);
      } else {
        console.warn(`Mesh ${mesh.name} not found in placedMeshes array`);
      }

      // Deselect if currently selected
      if (this.objectController.getSelectedMesh() === mesh) {
        this.objectController.deselectMesh();
      }
    } catch (error) {
      console.error(`Error during mesh deletion cleanup: ${error}`);
    }
  }

  private async _loadAssets(): Promise<void> {
    // Load model assets through the proxy in development or direct in production
    this.assetManager.addModelsToAssetManager(BASE_URL, this.modelFiles);

    // Setup callback for when assets are loaded
    // this.assetManager.loadAssets(() => {
    // });

    // await this.assetManager.loadAssetsAsync(this.lvlCreatorScene);
    await this.assetManager.loadAssetsAsync();
    this.ui.createModelSidebar(this.modelFiles);
  }

  private handleBackToMenu(): void {
    if (
      !confirm(
        "Are you sure you want to exit the level creator? All unsaved changes will be lost."
      )
    ) {
      console.log("User canceled back to menu action");
      return; // User canceled we do not exit level creator
    }
    console.log("Back to menu clicked - cleaning up scene");
    // Clean up all movement paths and rotations before scene disposal
    // Make sure all objects are cleaned up
    this.placedMeshes.forEach((mesh) => {
      if (mesh && !mesh.isDisposed()) {
        // Remove any rotation animations
        this.objectController.removeRotationAnimation(mesh);
        // Let ObjectController handle the visualization cleanup
        this.objectController.deselectMesh();
      }
    });

    this.lvlCreatorScene.dispose();
    this.app.backToMenu();
  }

  private toggleGrid(visible: boolean): void {
    console.log(`Toggling grid visibility: ${visible}`);
    if (this.gridMesh) {
      this.gridMesh.isVisible = visible;
    }
    this.snapToGrid = visible;

    // Update object controller with new grid settings
    this.objectController.setGridSettings(visible, this.gridSize);

    // Update model manager with new grid settings
    this.modelManager?.setGridSnapping(visible, this.gridSize);
  }

  private startDraggingModel(modelId: string): void {
    console.log(`Model item clicked: ${modelId}`);

    try {
      this.isDragging = true;
      this.currentDragMeshType = `model:${modelId}`;

      // Get asset path info for the current model
      const assetPath = this.assetManager.getAssetPathFromId(modelId);
      console.log(`Model ${modelId} asset path:`, assetPath);

      // Create preview
      this.createModelPreview(modelId);

      // We set cursor to grabbing hand
      this.canvas.style.cursor = "grabbing";

      // If preview creation failed, reset dragging state
      if (!this.previewMesh) {
        console.error(
          `Failed to create preview for ${modelId}, resetting drag state`
        );
        this.isDragging = false;
        this.currentDragMeshType = "";
      }
    } catch (error) {
      console.error(`Error setting up drag for ${modelId}:`, error);
      this.isDragging = false;
      this.currentDragMeshType = "";
    }
  }

  private createModelPreview(modelId: string): void {
    // Get the currently selected mesh before deselecting
    const selectedMesh = this.objectController.getSelectedMesh();

    // Explicitly remove highlights if a mesh is currently selected
    if (selectedMesh) {
      this.objectController.removeHighlightFromMesh(selectedMesh as Mesh);
    }

    this.objectController.deselectMesh();

    if (this.previewMesh) {
      this.previewMesh.dispose();
      this.previewMesh = null;
    }

    console.log(`Creating model preview for model: ${modelId}`);

    try {
      // Create the preview mesh
      this.previewMesh = this.modelManager?.createModelPreview(modelId);
      if (this.previewMesh) {
        // Add highlight to the preview mesh
        this.objectController.applyHighlightToMesh(this.previewMesh as Mesh);
      } else {
        console.error(`Failed to create preview mesh for ${modelId}`);
      }
    } catch (error) {
      console.error("Error creating model preview:", error);
    }
  }

  private setupInteractionHandlers(scene: Scene): void {
    let startingPoint: Vector3 | null = null;
    let currentMesh: Mesh | null = null;

    const getGroundPosition = (): Vector3 | null => {
      const pickinfo = scene.pick(
        scene.pointerX,
        scene.pointerY,
        (mesh) => mesh === this.ground
      );

      if (pickinfo.hit) {
        return pickinfo.pickedPoint;
      }
      return null;
    };

    const pointerDown = (mesh: AbstractMesh) => {
      // set cursor to grab hand
      this.canvas.style.cursor = "grab";

      // Only interact with non-ground, non-grid meshes
      if (mesh === this.ground || (this.gridMesh && mesh === this.gridMesh)) {
        this.handleGroundClick();
        return;
      }
      // If mesh marked as not draggable, do nothing
      if (mesh.metadata && mesh.metadata.isDraggable === false) {
        console.log(
          `Mesh ${mesh.name} is not draggable, ignoring pointer down`
        );
        return;
      }
      this.objectController.deselectControlPoint();

      // Find the topmost parent mesh
      let rootMesh = this.getTopmostParentMesh(mesh as Mesh);
      currentMesh = rootMesh;
      startingPoint = getGroundPosition();

      if (rootMesh !== this.previewMesh) {
        this.objectController.selectMesh(rootMesh, this.ground, this.gridMesh);
      }

      if (startingPoint) {
        setTimeout(() => {
          this.lvlCreatorCamera.detachControl();
        }, 0);
      }
    };

    const pointerUp = () => {
      startingPoint = null;
      currentMesh = null;

      // Reset cursor to crosshair
      this.canvas.style.cursor = "crosshair";

      // Always reattach camera control on pointer up
      // console.log("Pointer up detected - reattaching camera control");
      this.lvlCreatorCamera.attachControl(this.canvas, true);

      if (this.previewMesh && this.isDragging) {
        this.placeMeshAtPreviewPosition();
      }
    };

    const pointerMove = () => {
      if (!currentMesh && !this.isDragging) {
        this.canvas.style.cursor = "crosshair";
      }

      if (!startingPoint) return;

      // we ensure that the currentMesh is not null and its metadata doesn't mark it as not draggable
      if (
        currentMesh &&
        currentMesh?.metadata &&
        currentMesh.metadata.isDraggable === false
      ) {
        return;
      }

      const current = getGroundPosition();
      if (!current) return;

      this.handleMeshMovement(currentMesh, startingPoint, current);

      // Update starting point
      startingPoint = current;
    };

    // Register pointer observable for the scene
    scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          if (
            pointerInfo?.pickInfo &&
            pointerInfo.pickInfo.hit &&
            pointerInfo.pickInfo.pickedMesh
          ) {
            pointerDown(pointerInfo.pickInfo.pickedMesh);
          }
          break;
        case PointerEventTypes.POINTERUP:
          // console.log("Pointer up detected");
          // Always reattach camera control
          this.lvlCreatorCamera.attachControl(this.canvas, true);

          pointerUp();
          break;
        case PointerEventTypes.POINTERMOVE:
          pointerMove();

          // Update preview mesh position if dragging
          if (this.isDragging && this.previewMesh) {
            this.canvas.style.cursor = "grabbing"; // Always use grabbing when moving preview
            this.updatePreviewMeshPosition(getGroundPosition());
          }
          break;
      }
    });
  }

  public detachCameraControlForXSeconds(seconds: number = 1): void {
    console.log(`Detaching camera control for ${seconds} seconds `);
    this.lvlCreatorCamera.detachControl();
    setTimeout(() => {
      console.log("Reattaching camera control after timeout");
      this.lvlCreatorCamera.attachControl(this.canvas, true);
    }, seconds * 1000);
  }

  private getTopmostParentMesh(mesh: Mesh): Mesh {
    let rootMesh = mesh;
    while (rootMesh.parent && rootMesh.parent !== null) {
      if (
        rootMesh.parent instanceof AbstractMesh ||
        rootMesh.parent instanceof TransformNode
      ) {
        rootMesh = rootMesh.parent as Mesh;
      } else {
        break;
      }
    }
    return rootMesh;
  }

  private handleMeshMovement(
    mesh: Mesh | null,
    startingPoint: Vector3,
    current: Vector3
  ): void {
    if (!mesh) return;

    // set cursor to grabbing hand
    this.canvas.style.cursor = "grabbing";

    // Calculate difference
    const diff = current.subtract(startingPoint);

    // Apply grid snapping if enabled
    if (this.snapToGrid && mesh !== this.ground) {
      const newX =
        Math.round((mesh.position.x + diff.x) / this.gridSize) * this.gridSize;
      const newZ =
        Math.round((mesh.position.z + diff.z) / this.gridSize) * this.gridSize;
      mesh.position.x = newX;
      mesh.position.z = newZ;
    } else {
      // Normal movement
      mesh.position.addInPlace(diff);
    }

    // Update movement paths for objects with movement enabled
    this.updateMovementPath(mesh);
  }

  private updateMovementPath(mesh: Mesh): void {
    if (
      !mesh ||
      !mesh.metadata ||
      !mesh.metadata.moving ||
      !mesh.metadata.endPos
    ) {
      return;
    }

    // Get the updated start position (current object position)
    const startPos = mesh.position.clone();

    // Keep the same end position
    const endPos = mesh.metadata.endPos;

    // Update path visualization if this is the selected mesh
    if (
      this.objectController &&
      this.objectController.getSelectedMesh() === mesh
    ) {
      this.objectController.updatePathVisualization(startPos, endPos);
    }
  }

  private updatePreviewMeshPosition(groundPos: Vector3 | null): void {
    if (!this.isDragging || !this.previewMesh || !groundPos) {
      return;
    }

    // console.log(`Updating preview position to:`, groundPos);

    if (this.snapToGrid) {
      const snappedX = Math.round(groundPos.x / this.gridSize) * this.gridSize;
      const snappedZ = Math.round(groundPos.z / this.gridSize) * this.gridSize;
      this.previewMesh.position = new Vector3(snappedX, 0, snappedZ); // preview y position set to 0 here
    } else {
      this.previewMesh.position = new Vector3(groundPos.x, 0, groundPos.z);
    }
  }

  private placeMeshAtPreviewPosition(): void {
    // console.log("Attempting to place mesh at:", this.previewMesh?.position);

    try {
      if (!this.previewMesh || !this.previewMesh.position) {
        throw new Error("Preview mesh is not properly initialized");
      }

      let newMesh: Mesh | null | undefined = null;

      // Create the actual mesh at the preview position
      if (this.currentDragMeshType.startsWith("model:")) {
        newMesh = this.createPermanentModelMesh();
      } else {
        console.error(
          "Unsupported mesh type for placement must be model:",
          this.currentDragMeshType
        );
        throw new Error("Unsupported mesh type for placement");
      }

      if (!newMesh) {
        throw new Error("Failed to create permanent mesh");
      }

      // Apply highlight and select the new mesh
      this.objectController.applyHighlightToMesh(newMesh);
      this.objectController.selectMesh(
        newMesh,
        this.ground,
        this.gridMesh || null
      );

      // Clean up preview mesh
      this.cleanupPreview();
    } catch (error) {
      console.error("Error placing mesh:", error);
      this.cleanupPreview();

      // Optionally show an error message to the user
      alert(
        `Failed to place object: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private createPermanentModelMesh(): Mesh | null | undefined {
    const modelId = this.currentDragMeshType.replace("model:", "");
    console.log(`Creating permanent model: ${modelId}`);

    // Check if modelId is valid before proceeding
    if (!modelId || modelId.trim() === "") {
      console.error("Invalid model ID encountered");
      throw new Error("Invalid model ID");
    }

    // Check if model exists in the asset manager
    if (!this.assetManager.modelExists(modelId)) {
      console.error(`Model "${modelId}" does not exist in the model manager`);
      throw new Error(`Model "${modelId}" not found`);
    }

    // Get position from preview mesh and ensure it's grid-aligned if snapping is enabled
    let finalPosition = this.previewMesh!.position.clone();

    // TEST to re-apply grid snapping to ensure position is correctly aligned ?
    if (this.snapToGrid) {
      finalPosition.x =
        Math.round(finalPosition.x / this.gridSize) * this.gridSize;
      finalPosition.z =
        Math.round(finalPosition.z / this.gridSize) * this.gridSize;
      console.log(
        `Snapping final position to grid: ${finalPosition.x}, ${finalPosition.y}, ${finalPosition.z}`
      );
    }

    const newMesh = this.modelManager?.createModelAtPosition(
      modelId,
      finalPosition
    );

    if (newMesh) {
      // console.log("Successfully placed model mesh:", newMesh);
      this.placedMeshes.push(newMesh);
      return newMesh;
    }

    console.error("Failed to create permanent model mesh");
    return null;
  }

  private cleanupPreview(): void {
    // Clear any highlights from the preview mesh before disposing
    if (this.previewMesh) {
      this.objectController.removeHighlightFromMesh(this.previewMesh);
    }

    // Dispose of the preview mesh
    if (this.previewMesh) {
      this.previewMesh.dispose();
      this.previewMesh = null;
    }

    // Reset dragging state
    this.isDragging = false;
    this.currentDragMeshType = "";
  }

  private setupKeyboardControls(scene: Scene): void {
    scene.onKeyboardObservable.add((kbInfo) => {
      if (
        kbInfo.type === KeyboardEventTypes.KEYDOWN &&
        this.objectController.getSelectedMesh()
      ) {
        this.handleKeyboardInput(kbInfo.event.key);
      }
    });
  }

  private handleKeyboardInput(key: string): void {
    switch (key) {
      case "ArrowUp":
        this.objectController.moveMeshUp();
        break;
      case "ArrowDown":
        this.objectController.moveMeshDown();
        break;
      case "ArrowLeft":
        this.objectController.moveMeshLeft();
        break;
      case "ArrowRight":
        this.objectController.moveMeshRight();
        break;
      case "w": // Forward (negative Z)
        this.objectController.moveMeshForward();
        break;
      case "s": // Backward (positive Z)
        this.objectController.moveMeshBackward();
        break;
    }
  }

  private async saveScene(): Promise<void> {
    try {
      // Show prompt for scene name
      const name = this.ui.promptForSceneName();
      if (!name) return; // User cancelled

      this.ui.setSceneName(name);
      this.sceneName = name;

      console.log("About to serialize meshes:", this.placedMeshes);

      // // Ensure all meshes have required metadata
      // this.placedMeshes.forEach(this.ensureMeshHasMetadata.bind(this));

      // Serialize all placed meshes
      const serializedScene = await SceneSerializer.serializeScene(
        this.placedMeshes,
        name,
        this.assetManager
      );

      // Save to file
      SceneSerializer.saveToFile(
        serializedScene,
        `${name.replace(/\s+/g, "_")}.json`
      );

      // Show confirmation
      alert(`Scene "${name}" saved successfully!`);
    } catch (error) {
      console.error("Error saving scene:", error);
      alert(`Failed to save scene: ${error}`);
    }
  }

  // private ensureMeshHasMetadata(mesh: Mesh): void {
  //   if (!mesh.metadata) {
  //     console.warn(`Mesh ${mesh.name} has no metadata, adding basic metadata`);
  //     mesh.metadata = {};
  //   }

  //   // For basic shapes that might not have proper type set
  //   if (!mesh.metadata.type) {
  //     if (mesh.name.startsWith("model:")) {
  //       mesh.metadata.type = "model";
  //       mesh.metadata.modelId = mesh.name.replace("model:", "");
  //     } else if (mesh.name.includes("sphere")) {
  //       mesh.metadata.type = "sphere";
  //     } else if (mesh.name.includes("box")) {
  //       mesh.metadata.type = mesh.name.includes("green")
  //         ? "box-green"
  //         : "box-blue";
  //     } else if (mesh.name.includes("torus")) {
  //       mesh.metadata.type = "torus";
  //     }
  //   }
  // }

  private async loadScene(): Promise<void> {
    try {
      if (
        !confirm(
          "Are you sure you want to load a new scene? All unsaved changes will be lost."
        )
      ) {
        console.log("User canceled load scene action");
        return; // canceled we do not load a new scene
      }

      // Read file from user's file system
      const fileContent = await SceneSerializer.readFromFile();

      // Parse the scene data
      const sceneData = await SceneSerializer.parseSerializedScene(fileContent);
      if (!sceneData || !sceneData.meshes || sceneData.meshes.length === 0) {
        throw new Error("No valid scene data found in the file.");
      }
      console.log("Loaded scene data:", sceneData);

      // Update scene name
      this.sceneName = sceneData.name;
      this.ui.setSceneName(sceneData.name);

      // Clear current scene
      this.clearScene();

      // Wait for all assets to be loaded
      // await this.assetManager.loadAssetsAsync(this.lvlCreatorScene);
      await this.assetManager.loadAssetsAsync();

      console.log("LOAD FINISH DEBUG");

      // Load meshes from scene data
      await this.loadSceneMeshes(sceneData);

      // Show confirmation
      alert(`Scene "${sceneData.name}" loaded successfully!`);
    } catch (error) {
      console.error("Error loading scene:", error);
      alert(`Failed to load scene: ${error}`);
    }
  }

  private clearScene(): void {
    // Get reference to currently selected mesh
    const selectedMesh = this.objectController.getSelectedMesh();

    // Remove highlights if a mesh is selected
    if (selectedMesh) {
      this.objectController.removeHighlightFromMesh(selectedMesh as Mesh);
    }

    // Deselect current mesh
    this.objectController.dispose();

    // Dispose all placed meshes
    this.placedMeshes.forEach((mesh) => {
      mesh.dispose();
    });

    // Clear the placedMeshes array
    this.placedMeshes = [];
  }

  private async loadSceneMeshes(parsedData: any): Promise<void> {
    console.log("Starting to load meshes from scene data... : ", parsedData);

    // Make sure we have valid data
    if (
      !parsedData ||
      !parsedData.meshes ||
      !Array.isArray(parsedData.meshes) ||
      parsedData.meshes.length === 0
    ) {
      console.warn("No meshes found in scene data to load.");
      return;
    }

    const promises = parsedData.meshes.map(async (meshData: any) => {
      try {
        return this.loadSingleMesh(meshData);
      } catch (error) {
        console.error(`Error loading mesh: ${meshData.id}`, error);
        return null;
      }
    });

    // Wait for all meshes to be created and filter out nulls
    const results = await Promise.all(promises);
    const successfulLoads = results.filter(Boolean).length;

    console.log(
      `Loaded ${successfulLoads} meshes out of ${parsedData.meshes.length}`
    );

    if (successfulLoads < parsedData.meshes.length) {
      alert(
        `Note: Only ${successfulLoads} out of ${parsedData.meshes.length} objects were loaded successfully.`
      );
    }
  }

  private async loadSingleMesh(meshData: any): Promise<Mesh | null> {
    console.log(`Loading mesh: ${meshData.id}, type: ${meshData.type}`);
    let newMesh: Mesh | null | undefined = null;

    if (meshData.type === "model" && meshData.modelId) {
      newMesh = await this.loadModelMesh(meshData);
    } else {
      console.error(
        "Unsupported mesh type or missing modelId for ",
        meshData.id
      );
    }

    if (!newMesh) {
      return null;
    }

    // Apply properties
    this.objectController.applyMeshProperties(newMesh, meshData);

    // Add to placedMeshes array
    this.placedMeshes.push(newMesh);
    return newMesh;
  }

  private async loadModelMesh(meshData: any): Promise<Mesh | null | undefined> {
    console.log(`Creating model mesh with ID: ${meshData.modelId}`);
    // Check if model exists or find alternative
    const modelId = this.assetManager.checkIfModelIdExist(meshData.modelId);
    if (modelId) {
      console.log(
        `Found a similar modelId in asset manager: ${modelId} for modelId ${meshData.modelId}`
      );
      meshData.modelId = modelId;
    } else {
      console.error(`No similar model found for ${meshData.modelId}`);
      return null;
    }

    // Load model mesh with explicit position
    return this.modelManager?.createModelAtPosition(
      meshData.modelId,
      new Vector3(
        meshData.position.x,
        meshData.position.y || 0,
        meshData.position.z
      )
    );
  }

  private async handleTestLevel(): Promise<void> {
    try {
      console.log("Testing current level...");
      this.ui.displayLoadingUI(); // Show loading screen

      // Ensure all meshes have metadata (more particullarly the created ones)
      // this.placedMeshes.forEach(this.ensureMeshHasMetadata.bind(this));

      const serializedScene = await SceneSerializer.serializeScene(
        this.placedMeshes,
        this.sceneName,
        this.assetManager
      );
      if (!serializedScene) {
        throw new Error("Failed to serialize scene data.");
      }

      console.log("Serialized level for testing:", serializedScene);

      // Clean up creator scene resources BEFORE switching
      // const currentSelected = this.objectController.getSelectedMesh();
      // if (currentSelected) {
      //   // this.removeHighlightFromMesh(currentSelected as Mesh);
      //   this.objectController.deselectMesh();
      // }
      this.clearScene(); // Clear current scene meshes

      // Dispose of the current level creator scene
      this.lvlCreatorScene.dispose();
      this.ui.dispose(); // Dispose of the UI

      // Pass the serialized data
      this.app.startTestLevel(serializedScene);
    } catch (error) {
      console.error("Error starting test level:", error);
      alert(`Failed to start test: ${error}`);
      this.ui.hideLoadingUI();
    }
    // lvlCreatorScene will be disposed by App.ts when it creates the game scene
  }

  public render(): void {
    console.log("Starting render loop for Level Creator");
    if (!this.lvlCreatorScene || !this.engine) {
      console.error(
        "LEVEL CREATOR Scene or engine not initialized for rendering."
      );
      return;
    }
    this.engine.runRenderLoop(() => {
      this.lvlCreatorScene.render();
    });
  }
}

export default LevelCreator;
