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
import { AssetManagerService } from "./AssetManager";
import { UIComponentsFactory } from "./UIComponents";
import { MeshUtils } from "./MeshUtils";
import { ObjectController } from "./ObjectController";
import { ModelManager } from "./ModelManager";
import { SceneSerializer } from "./SceneSerializer";

class LevelCreator {
  // Core properties
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private lvlCreatorScene: Scene;
  private backToMenu: () => void;
  private lvlCreatorCamera!: ArcRotateCamera;
  private light!: HemisphericLight;

  // Scene objects
  private ground!: Mesh;
  private materials: { [key: string]: StandardMaterial } = {};
  private placedMeshes: Mesh[] = [];
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

  // Model files to load
  private modelFiles: string[] = [
    "arrow_teamBlue.gltf.glb",
    "arrow_teamRed.gltf.glb",
    "arrow_teamYellow.gltf.glb",
    "ball.gltf.glb",
    "ball_teamBlue.gltf.glb",
    "ball_teamRed.gltf.glb",
    "ball_teamYellow.gltf.glb",
    "barrierFloor.gltf.glb",
    "barrierLadder.gltf.glb",
    "barrierLarge.gltf.glb",
    "barrierMedium.gltf.glb",
    "barrierSmall.gltf.glb",
    "barrierStrut.gltf.glb",
    "blaster_teamBlue.gltf.glb",
    "blaster_teamRed.gltf.glb",
    "blaster_teamYellow.gltf.glb",
    "bomb_teamBlue.gltf.glb",
    "bomb_teamRed.gltf.glb",
    "bomb_teamYellow.gltf.glb",
    "bow_teamBlue.gltf.glb",
    "bow_teamRed.gltf.glb",
    "bow_teamYellow.gltf.glb",
    "button_teamBlue.gltf.glb",
    "button_teamRed.gltf.glb",
    "button_teamYellow.gltf.glb",
    "characer_duck.gltf.glb",
    "character_bear.gltf.glb",
    "character_dog.gltf.glb",
    "detail_desert.gltf.glb",
    "detail_forest.gltf.glb",
    "diamond_teamBlue.gltf.glb",
    "diamond_teamRed.gltf.glb",
    "diamond_teamYellow.gltf.glb",
    "flag_teamBlue.gltf.glb",
    "flag_teamRed.gltf.glb",
    "flag_teamYellow.gltf.glb",
    "gateLargeWide_teamBlue.gltf.glb",
    "gateLargeWide_teamRed.gltf.glb",
    "gateLargeWide_teamYellow.gltf.glb",
    "gateLarge_teamBlue.gltf.glb",
    "gateLarge_teamRed.gltf.glb",
    "gateLarge_teamYellow.gltf.glb",
    "gateSmallWide_teamBlue.gltf.glb",
    "gateSmallWide_teamRed.gltf.glb",
    "gateSmallWide_teamYellow.gltf.glb",
    "gateSmall_teamBlue.gltf.glb",
    "gateSmall_teamRed.gltf.glb",
    "gateSmall_teamYellow.gltf.glb",
    "heart_teamBlue.gltf.glb",
    "heart_teamRed.gltf.glb",
    "heart_teamYellow.gltf.glb",
    "hoop_teamBlue.gltf.glb",
    "hoop_teamRed.gltf.glb",
    "hoop_teamYellow.gltf.glb",
    "lightning.gltf.glb",
    "plantA_desert.gltf.glb",
    "plantA_forest.gltf.glb",
    "plantB_desert.gltf.glb",
    "plantB_forest.gltf.glb",
    "powerupBlock_teamBlue.gltf.glb",
    "powerupBlock_teamRed.gltf.glb",
    "powerupBlock_teamYellow.gltf.glb",
    "powerupBomb.gltf.glb",
    "ring_teamBlue.gltf.glb",
    "ring_teamRed.gltf.glb",
    "ring_teamYellow.gltf.glb",
    "rocksA_desert.gltf.glb",
    "rocksA_forest.gltf.glb",
    "rocksB_desert.gltf.glb",
    "rocksB_forest.gltf.glb",
    "slingshot_teamBlue.gltf.glb",
    "slingshot_teamRed.gltf.glb",
    "slingshot_teamYellow.gltf.glb",
    "spikeRoller.gltf.glb",
    "star.gltf.glb",
    "swiperDouble_teamBlue.gltf.glb",
    "swiperDouble_teamRed.gltf.glb",
    "swiperDouble_teamYellow.gltf.glb",
    "swiperLong_teamBlue.gltf.glb",
    "swiperLong_teamRed.gltf.glb",
    "swiperLong_teamYellow.gltf.glb",
    "swiper_teamBlue.gltf.glb",
    "swiper_teamRed.gltf.glb",
    "swiper_teamYellow.gltf.glb",
    "sword_teamBlue.gltf.glb",
    "sword_teamRed.gltf.glb",
    "sword_teamYellow.gltf.glb",
    "target.gltf.glb",
    "targetStand.gltf.glb",
    "tileHigh_desert.gltf.glb",
    "tileHigh_forest.gltf.glb",
    "tileHigh_teamBlue.gltf.glb",
    "tileHigh_teamRed.gltf.glb",
    "tileHigh_teamYellow.gltf.glb",
    "tileLarge_desert.gltf.glb",
    "tileLarge_forest.gltf.glb",
    "tileLarge_teamBlue.gltf.glb",
    "tileLarge_teamRed.gltf.glb",
    "tileLarge_teamYellow.gltf.glb",
    "tileLow_desert.gltf.glb",
    "tileLow_forest.gltf.glb",
    "tileLow_teamBlue.gltf.glb",
    "tileLow_teamRed.gltf.glb",
    "tileLow_teamYellow.gltf.glb",
    "tileMedium_desert.gltf.glb",
    "tileMedium_forest.gltf.glb",
    "tileMedium_teamBlue.gltf.glb",
    "tileMedium_teamRed.gltf.glb",
    "tileMedium_teamYellow.gltf.glb",
    "tileSlopeLowHigh_desert.gltf.glb",
    "tileSlopeLowHigh_forest.gltf.glb",
    "tileSlopeLowHigh_teamBlue.gltf.glb",
    "tileSlopeLowHigh_teamRed.gltf.glb",
    "tileSlopeLowHigh_teamYellow.gltf.glb",
    "tileSlopeLowMedium_teamRed.gltf.glb",
    "tileSlopeLowMedium_desert.gltf.glb",
    "tileSlopeLowMedium_forest.gltf.glb",
    "tileSlopeLowMedium_teamBlue.gltf.glb",
    "tileSlopeLowMedium_teamYellow.gltf.glb",
    "tileSlopeMediumHigh_desert.gltf.glb",
    "tileSlopeMediumHigh_forest.gltf.glb",
    "tileSlopeMediumHigh_teamBlue.gltf.glb",
    "tileSlopeMediumHigh_teamRed.gltf.glb",
    "tileSlopeMediumHigh_teamYellow.gltf.glb",
    "tileSmall_desert.gltf.glb",
    "tileSmall_forest.gltf.glb",
    "tileSmall_teamBlue.gltf.glb",
    "tileSmall_teamRed.gltf.glb",
    "tileSmall_teamYellow.gltf.glb",
    "tree_desert.gltf.glb",
    "tree_forest.gltf.glb",
  ];

  constructor(
    canvas: HTMLCanvasElement,
    engine: Engine,
    backToMenu: () => void
  ) {
    this.canvas = canvas;
    this.engine = engine;
    this.backToMenu = backToMenu;

    // Initialize scene
    this.lvlCreatorScene = this.createScene();

    // Initialize services
    this.assetManager = new AssetManagerService(this.lvlCreatorScene);
    this.modelManager = new ModelManager(
      this.lvlCreatorScene,
      this.assetManager
    );

    // Setup UI
    this.ui = this.createUI();

    // ocreate the object controller
    this.objectController = this.createObjectController(
      this.lvlCreatorScene,
      this.ui,
      this.highlightLayer!,
      this.assetManager
    );

    // Load assets and setup UI when ready
    this.loadAssets();
  }

  // INIT
  private createScene(): Scene {
    const scene = new Scene(this.engine);

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
      (mesh) => this.handleMeshDeletion(mesh)
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
    camera.attachControl(this.canvas, true);
    return camera;
  }

  /// MESH MANAGEMENT

  // public selectMesh(mesh: Mesh): void {
  //   console.log("Selecting mesh:", mesh.name);

  //   // Make sure any previous highlight is cleared first
  //   this.objectController.deselectMesh();

  //   // Apply highlight directly in addition to using the controller
  //   if (this.highlightLayer) {
  //     console.log("Applying highlight to selected mesh");
  //     this.highlightLayer.addMesh(mesh, Color3.Yellow());

  //     // Also highlight all child meshes
  //     mesh.getChildMeshes().forEach((childMesh) => {
  //       console.log("Highlighting child mesh:", childMesh.name);
  //       this.highlightLayer?.addMesh(childMesh as Mesh, Color3.Yellow());
  //     });
  //   }

  //   // Display mesh info in UI or console
  //   this.displayMeshInfo(mesh);

  //   // Then use the object controller to handle selection
  //   this.objectController.selectMesh(mesh, this.ground, this.gridMesh || null);
  // }

  public handleGroundClick(): void {
    console.log("Clicking on ground/grid - removing all highlights");

    // Get currently selected mesh and remove its highlights directly
    const selectedMesh = this.objectController.getSelectedMesh();
    if (selectedMesh && this.highlightLayer) {
      console.log(
        "Removing highlight from previously selected mesh:",
        selectedMesh.name
      );
      this.highlightLayer.removeMesh(selectedMesh as Mesh);

      // Also remove highlights from all child meshes
      selectedMesh.getChildMeshes().forEach((childMesh) => {
        console.log("Removing highlight from child mesh:", childMesh.name);
        this.highlightLayer?.removeMesh(childMesh as Mesh);
      });
    }

    this.objectController.deselectMesh();
  }

  public applyHighlightToMesh(mesh: Mesh): void {
    if (!this.highlightLayer) return;

    console.log("Applying highlight to newly placed mesh");
    this.highlightLayer.addMesh(mesh, Color3.Yellow());

    // Also highlight all child meshes
    mesh.getChildMeshes().forEach((childMesh) => {
      console.log("Highlighting child mesh:", childMesh.name);
      this.highlightLayer?.addMesh(childMesh as Mesh, Color3.Yellow());
    });
  }

  public removeHighlightFromMesh(mesh: Mesh): void {
    if (!this.highlightLayer || !mesh) return;

    this.highlightLayer.removeMesh(mesh);
    mesh.getChildMeshes().forEach((childMesh) => {
      this.highlightLayer?.removeMesh(childMesh as Mesh);
    });
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

  private loadAssets(): void {
    // Load model assets
    this.assetManager.addModelsToAssetManager("/kaykit/", this.modelFiles);

    // Setup callback for when assets are loaded
    this.assetManager.loadAssets(() => {
      this.ui.createModelSidebar(this.modelFiles);
    });
  }

  private handleBackToMenu(): void {
    // Clean up all movement paths and rotations before scene disposal
    if (this.objectController) {
      // Make sure all objects are cleaned up
      this.placedMeshes.forEach((mesh) => {
        if (mesh && !mesh.isDisposed()) {
          // Remove any rotation animations
          this.objectController.removeRotationAnimation(mesh);
          // Let ObjectController handle the visualization cleanup
          this.objectController.deselectMesh();
        }
      });
    }

    this.lvlCreatorScene.dispose();
    this.backToMenu();
  }

  private toggleGrid(visible: boolean): void {
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
      this.removeHighlightFromMesh(selectedMesh as Mesh);
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
        this.applyHighlightToMesh(this.previewMesh as Mesh);
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
      // Only interact with non-ground, non-grid meshes
      if (mesh === this.ground || (this.gridMesh && mesh === this.gridMesh)) {
        this.handleGroundClick();
        return;
      }

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
      if (startingPoint) {
        this.lvlCreatorCamera.attachControl(this.canvas, true);
        startingPoint = null;
        currentMesh = null;
      }

      if (this.previewMesh && this.isDragging) {
        this.placeMeshAtPreviewPosition();
      }
    };

    const pointerMove = () => {
      if (!startingPoint) return;

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
          console.log("Pointer up detected");
          pointerUp();
          break;
        case PointerEventTypes.POINTERMOVE:
          pointerMove();

          // Update preview mesh position if dragging
          this.updatePreviewMeshPosition(getGroundPosition());
          break;
      }
    });
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

    console.log(`Updating preview position to:`, groundPos);

    if (this.snapToGrid) {
      const snappedX = Math.round(groundPos.x / this.gridSize) * this.gridSize;
      const snappedZ = Math.round(groundPos.z / this.gridSize) * this.gridSize;
      this.previewMesh.position = new Vector3(snappedX, 0, snappedZ); // preview y position set to 0 here
    } else {
      this.previewMesh.position = new Vector3(groundPos.x, 0, groundPos.z);
    }
  }

  private placeMeshAtPreviewPosition(): void {
    console.log("Attempting to place mesh at:", this.previewMesh?.position);

    try {
      if (!this.previewMesh || !this.previewMesh.position) {
        throw new Error("Preview mesh is not properly initialized");
      }

      let newMesh: Mesh | null | undefined = null;

      // Create the actual mesh at the preview position
      if (this.currentDragMeshType.startsWith("model:")) {
        newMesh = this.createPermanentModelMesh();
      } else {
        newMesh = this.createPermanentBasicShapeMesh();
      }

      if (!newMesh) {
        throw new Error("Failed to create permanent mesh");
      }

      // Apply highlight and select the new mesh
      this.applyHighlightToMesh(newMesh);
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

    const newMesh = this.modelManager?.createModelAtPosition(
      modelId,
      this.previewMesh!.position
    );

    if (newMesh) {
      console.log("Successfully placed model mesh:", newMesh);
      this.placedMeshes.push(newMesh);
      return newMesh;
    }

    console.error("Failed to create permanent model mesh");
    return null;
  }

  private createPermanentBasicShapeMesh(): Mesh | null | undefined {
    console.log(`Creating permanent basic shape: ${this.currentDragMeshType}`);

    const newMesh = this.modelManager?.createBasicShapeAtPosition(
      this.currentDragMeshType,
      this.previewMesh!.position,
      this.materials
    );

    if (newMesh) {
      console.log("Successfully placed basic shape mesh:", newMesh);
      this.placedMeshes.push(newMesh);
      return newMesh;
    }

    console.error("Failed to create permanent basic shape mesh");
    return null;
  }

  private cleanupPreview(): void {
    // Clear any highlights from the preview mesh before disposing
    if (this.previewMesh) {
      this.removeHighlightFromMesh(this.previewMesh);
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

      // Ensure all meshes have required metadata
      this.placedMeshes.forEach(this.ensureMeshHasMetadata.bind(this));

      // Serialize all placed meshes
      const serializedScene = SceneSerializer.serializeScene(
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

  private ensureMeshHasMetadata(mesh: Mesh): void {
    if (!mesh.metadata) {
      console.warn(`Mesh ${mesh.name} has no metadata, adding basic metadata`);
      mesh.metadata = {};
    }

    // For basic shapes that might not have proper type set
    if (!mesh.metadata.type) {
      if (mesh.name.startsWith("model:")) {
        mesh.metadata.type = "model";
        mesh.metadata.modelId = mesh.name.replace("model:", "");
      } else if (mesh.name.includes("sphere")) {
        mesh.metadata.type = "sphere";
      } else if (mesh.name.includes("box")) {
        mesh.metadata.type = mesh.name.includes("green")
          ? "box-green"
          : "box-blue";
      } else if (mesh.name.includes("torus")) {
        mesh.metadata.type = "torus";
      }
    }
  }

  private async loadScene(): Promise<void> {
    try {
      // Read file from user's file system
      const fileContent = await SceneSerializer.readFromFile();

      // Parse the scene data
      const sceneData = SceneSerializer.parseSerializedScene(fileContent);

      console.log("Loaded scene data:", sceneData);

      // Update scene name
      this.sceneName = sceneData.name;
      this.ui.setSceneName(sceneData.name);

      // Clear current scene
      this.clearScene();

      // Wait for all assets to be loaded
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
      this.removeHighlightFromMesh(selectedMesh as Mesh);
    }

    // Deselect current mesh
    this.objectController.deselectMesh();

    // Dispose all placed meshes
    this.placedMeshes.forEach((mesh) => {
      mesh.dispose();
    });

    // Clear the placedMeshes array
    this.placedMeshes = [];
  }

  private async loadSceneMeshes(sceneData: any): Promise<void> {
    console.log("Starting to load meshes from scene data...");

    const promises = sceneData.meshes.map(async (meshData: any) => {
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
      `Successfully loaded ${successfulLoads} meshes out of ${sceneData.meshes.length}`
    );

    if (successfulLoads < sceneData.meshes.length) {
      alert(
        `Note: Only ${successfulLoads} out of ${sceneData.meshes.length} objects were loaded successfully.`
      );
    }
  }

  private async loadSingleMesh(meshData: any): Promise<Mesh | null> {
    console.log(`Loading mesh: ${meshData.id}, type: ${meshData.type}`);
    let newMesh: Mesh | null | undefined = null;

    if (meshData.type === "model" && meshData.modelId) {
      newMesh = await this.loadModelMesh(meshData);
    } else {
      newMesh = this.loadBasicShapeMesh(meshData);
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

  private loadBasicShapeMesh(meshData: any): Mesh | null | undefined {
    console.log(`Creating basic shape: ${meshData.type}`);
    // Load basic shape with explicit position
    return this.modelManager?.createBasicShapeAtPosition(
      meshData.type,
      new Vector3(
        meshData.position.x,
        meshData.position.y || 0,
        meshData.position.z
      ),
      this.materials
    );
  }

  public render(): void {
    this.engine.runRenderLoop(() => {
      this.lvlCreatorScene.render();
    });
  }
}

export default LevelCreator;
