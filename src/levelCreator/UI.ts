import {
  Scene,
  Mesh,
  Color3,
  Vector3,
  AbstractMesh,
  LinesMesh,
} from "@babylonjs/core";

import {
  AdvancedDynamicTexture,
  Button,
  Container,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
  Checkbox,
  ScrollViewer,
  InputText,
} from "@babylonjs/gui";

import { UIComponentsFactory } from "./UIComponents";
import { AssetManagerService } from "./AssetManager";
import { ObjectController } from "./ObjectController";
import { SceneSerializer } from "./SceneSerializer";

export interface MeshItem {
  id: string;
  modelId?: string;
  type: string;
  label: string;
  color: string;
  imageUrl?: string;
}

export interface UIEvents {
  onGridToggle: (enabled: boolean) => void;
  onSaveScene: () => Promise<void>;
  onLoadScene: () => Promise<void>;
  onBackToMenu: () => void;
  onModelSelected: (modelId: string) => void;
}

export class LevelCreatorUI {
  // UI properties
  editorUI: AdvancedDynamicTexture;
  private modelSidebar!: Rectangle;
  private saveLoadPanel: Rectangle | null = null;
  private snapToggleBtn: Checkbox | null = null;

  // Dependencies
  private scene: Scene;
  private ground: Mesh;
  private gridMesh: LinesMesh | null;
  private assetManager: AssetManagerService;
  private highlightLayer: any;

  // Event handlers
  private events: UIEvents;

  // State
  private sceneName: string = "MyLevel";

  constructor(
    scene: Scene,
    ground: Mesh,
    gridMesh: LinesMesh | null,
    assetManager: AssetManagerService,
    highlightLayer: any,
    events: UIEvents
  ) {
    this.scene = scene;
    this.ground = ground;
    this.gridMesh = gridMesh;
    this.assetManager = assetManager;
    this.highlightLayer = highlightLayer;
    this.events = events;

    // Create fullscreen UI
    this.editorUI = AdvancedDynamicTexture.CreateFullscreenUI("editorUI");

    // Initialize UI components
    this.setupUI();
  }

  private setupUI(): void {
    // Create back button
    this.createBackButton();

    // Create editor title
    this.createEditorTitle();

    // Create grid toggle
    this.createSnapToGridToggle();

    // Create save/load panel
    this.createSaveLoadPanel();
  }

  // Method to initialize and get the editor UI
  public getEditorUI(): AdvancedDynamicTexture {
    return this.editorUI;
  }

  private createBackButton(): void {
    const backButton = UIComponentsFactory.createButton(
      "backButton",
      "Back to Menu"
    );
    backButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    backButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    backButton.left = "20px";
    backButton.top = "20px";
    backButton.zIndex = 100;

    backButton.onPointerClickObservable.add(() => {
      console.log("Back to Menu clicked");
      this.events.onBackToMenu();
    });

    this.editorUI.addControl(backButton);
  }

  private createEditorTitle(): void {
    const editorTitle = new TextBlock("editorTitle", "Level Creator");
    editorTitle.color = "white";
    editorTitle.fontSize = 36;
    editorTitle.height = "40px";
    editorTitle.fontWeight = "bold";
    editorTitle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    editorTitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    editorTitle.top = "20px";
    this.editorUI.addControl(editorTitle);
  }

  private createSnapToGridToggle(): void {
    // Container for the grid toggle
    const gridContainer = new Rectangle("gridToggleContainer");
    gridContainer.width = "180px";
    gridContainer.height = "40px";
    gridContainer.background = "rgba(50, 50, 50, 0.7)";
    gridContainer.cornerRadius = 5;
    gridContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    gridContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    gridContainer.top = "-20px";
    gridContainer.left = "-20px";
    this.editorUI.addControl(gridContainer);

    // Create checkbox
    this.snapToggleBtn = new Checkbox("snapToGridToggle");
    this.snapToggleBtn.width = "20px";
    this.snapToggleBtn.height = "20px";
    this.snapToggleBtn.color = "white";
    this.snapToggleBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.snapToggleBtn.left = "10px";
    gridContainer.addControl(this.snapToggleBtn);

    // Add label for checkbox
    const toggleLabel = new TextBlock("gridToggleLabel", "Snap to Grid");
    toggleLabel.color = "white";
    toggleLabel.fontSize = 16;
    toggleLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    toggleLabel.left = "40px";
    gridContainer.addControl(toggleLabel);

    // Add event to toggle grid visibility and snapping
    this.snapToggleBtn.onIsCheckedChangedObservable.add((isChecked) => {
      this.events.onGridToggle(isChecked);
    });
  }

  private createSaveLoadPanel(): void {
    // Create container for save/load buttons
    const saveLoadPanel = new Rectangle("saveLoadPanel");
    saveLoadPanel.width = "250px";
    saveLoadPanel.height = "100px";
    saveLoadPanel.background = "rgba(50, 50, 50, 0.7)";
    saveLoadPanel.cornerRadius = 5;
    saveLoadPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    saveLoadPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    saveLoadPanel.top = "-20px";
    this.editorUI.addControl(saveLoadPanel);
    this.saveLoadPanel = saveLoadPanel;

    // Stack panel for buttons
    const stackPanel = new StackPanel("saveLoadStack");
    stackPanel.width = "100%";
    saveLoadPanel.addControl(stackPanel);

    // Title
    const title = new TextBlock("saveLoadTitle", "Scene Management");
    title.color = "white";
    title.fontSize = 18;
    title.height = "30px";
    title.fontWeight = "bold";
    stackPanel.addControl(title);

    // Save button
    const saveButton = Button.CreateSimpleButton("saveButton", "Save Scene");
    saveButton.width = "200px";
    saveButton.height = "30px";
    saveButton.color = "white";
    saveButton.cornerRadius = 5;
    saveButton.background = "green";
    saveButton.onPointerClickObservable.add(() => this.events.onSaveScene());
    stackPanel.addControl(saveButton);

    // Spacing
    stackPanel.addControl(UIComponentsFactory.createSpacing(5));

    // Load button
    const loadButton = Button.CreateSimpleButton("loadButton", "Load Scene");
    loadButton.width = "200px";
    loadButton.height = "30px";
    loadButton.color = "white";
    loadButton.cornerRadius = 5;
    loadButton.background = "blue";
    loadButton.onPointerClickObservable.add(() => this.events.onLoadScene());
    stackPanel.addControl(loadButton);
  }

  public createModelSidebar(modelFiles: string[]): void {
    // Create sidebar panel
    const sidebar = UIComponentsFactory.createSidebar("modelSidebar", {
      alignment: Control.HORIZONTAL_ALIGNMENT_LEFT,
    });
    this.editorUI.addControl(sidebar);
    this.modelSidebar = sidebar;

    // Create scrollable panel for models
    const scrollViewer = UIComponentsFactory.createScrollViewer("modelScroll");
    sidebar.addControl(scrollViewer);

    // Create stack panel for model items
    const stackPanel = new StackPanel("modelPanel");
    stackPanel.width = "100%";
    stackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    scrollViewer.addControl(stackPanel);

    // Title for the sidebar
    const sidebarTitle = new TextBlock("modelSidebarTitle", "Available Models");
    sidebarTitle.color = "white";
    sidebarTitle.fontSize = 20;
    sidebarTitle.height = "40px";
    sidebarTitle.fontWeight = "bold";
    sidebarTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    sidebarTitle.paddingTop = "10px";
    sidebarTitle.paddingBottom = "10px";
    stackPanel.addControl(sidebarTitle);

    // Add each model to the sidebar
    for (const filename of modelFiles) {
      const modelId =
        this.assetManager.getModelIdFromFilename(filename) || filename;

      // Determine color based on model name
      let color = "gray";
      if (modelId.includes("Blue")) color = "blue";
      else if (modelId.includes("Red")) color = "red";
      else if (modelId.includes("Yellow")) color = "yellow";

      // Get preview image URL
      const fileInfo = modelFiles.find((file) =>
        file.toLowerCase().includes(modelId.toLowerCase())
      );

      let previewImageUrl = "";
      if (fileInfo) {
        const baseFilename = fileInfo.split(".")[0];
        previewImageUrl = `/kaykit/previews/ImageToStl.com_${baseFilename}.gltf.png`;
      }

      const modelItem: MeshItem = {
        id: `model-${modelId}`,
        modelId,
        type: "model",
        label: this.formatModelName(modelId),
        color,
        imageUrl: previewImageUrl,
      };

      this.addModelItemToSidebar(stackPanel, modelItem);
      stackPanel.addControl(UIComponentsFactory.createSpacing(10));
    }
  }

  private formatModelName(modelId: string): string {
    // Convert camelCase to Title Case with spaces
    return modelId
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space between camelCase
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/team/i, "Team ") // Add space after "team"
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private addModelItemToSidebar(parent: Container, item: MeshItem): void {
    // Container for the model item
    const itemContainer = new Rectangle(`${item.id}-container`);
    itemContainer.width = "220px";
    itemContainer.height = "70px";
    itemContainer.thickness = 1;
    itemContainer.color = "lightgray";
    itemContainer.background = "rgba(70, 70, 70, 0.9)";
    itemContainer.cornerRadius = 5;
    itemContainer.paddingBottom = "10px";
    itemContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    itemContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    itemContainer.isPointerBlocker = true;
    parent.addControl(itemContainer);

    // Label for the model
    const modelLabel = new TextBlock(`${item.id}-label`, item.label);
    modelLabel.color = "white";
    modelLabel.fontSize = 14;
    modelLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    modelLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    modelLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    modelLabel.top = "5px";
    itemContainer.addControl(modelLabel);

    // Create the image preview with fallback
    const preview = UIComponentsFactory.createImagePreview(
      `${item.id}-preview`,
      item.imageUrl || "",
      {
        width: "40px",
        height: "40px",
        verticalAlignment: Control.VERTICAL_ALIGNMENT_BOTTOM,
        top: "-10px",
        fallbackColor: item.color,
      }
    );
    itemContainer.addControl(preview);

    // Make the item draggable
    itemContainer.onPointerDownObservable.add(() => {
      if (item.type === "model" && item.modelId) {
        this.events.onModelSelected(item.modelId);
      }
    });
  }

  public displayMeshInfo(mesh: Mesh): void {
    if (!mesh) return;

    const info = this.getModelInfoFromMesh(mesh);
    let infoText = `Selected: ${mesh.name}\n`;

    if (info.type === "model") {
      infoText += `Model ID: ${info.modelId || "Unknown"}\n`;
      infoText += `File: ${info.rootFolder || ""}${
        info.fileName || "Unknown"
      }\n`;
    } else {
      infoText += `Type: ${info.type || "Basic Shape"}\n`;
    }

    console.log(infoText);
    // You could also display this info in a UI panel if desired
  }

  private getModelInfoFromMesh(mesh: Mesh): {
    modelId?: string;
    type?: string;
    rootFolder?: string;
    fileName?: string;
  } {
    if (!mesh || !mesh.metadata) {
      return {};
    }

    const info = {
      modelId: mesh.metadata.modelId,
      type: mesh.metadata.type,
      rootFolder: mesh.metadata.rootFolder,
      fileName: mesh.metadata.fileName,
    };

    // If mesh has no modelId but name starts with "model:", extract it from the name
    if (!info.modelId && mesh.name.startsWith("model:")) {
      info.modelId = mesh.name.replace("model:", "");
    }

    return info;
  }

  public getSceneName(): string {
    return this.sceneName;
  }

  public setSceneName(name: string): void {
    this.sceneName = name;
  }

  public promptForSceneName(): string | null {
    return prompt("Enter a name for your scene:", this.sceneName);
  }
}
