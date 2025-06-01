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

import { UIComponentsFactory } from "./UIComponentsFactory";
import { AssetManagerService } from "../AssetManagerService";

// export const DEFAULT_BUTTON_COLOR = "rgba(100, 100, 100, 0.8)";
export interface MeshItem {
  id: string;
  modelId?: string;
  type: string;
  label: string;
  color: string;
  imageUrl?: string;
  // assetPath?: string; // TO IMPLEMENT
}

// Represents the node Trie structure for models sidebar
interface ModelTrieNode {
  children: Map<string, ModelTrieNode>; // Key is the name part (ex Slope, Tile, ...)
  // Models whose fully qualified name ends at this node in the Trie.
  models: { meshItem: MeshItem; nameParts: string[] }[];
}

// in px
const INDENT_PER_LEVEL = 5;
const CATEGORY_HEADER_HEIGHT = 30;
const MODEL_ITEM_IMAGE_SIZE = 35;
const MODEL_ITEM_PADDING = 5;
const PANEL_COLLAPSED_HEIGHT = "40px";
const PANEL_EXPANDED_HEIGHT = "150px";
const SIDEBAR_COLLAPSED_WIDTH = "50px";
const SIDEBAR_EXPANDED_WIDTH = "250px";

export interface UIEvents {
  onGridToggle: (enabled: boolean) => void;
  onSaveScene: () => Promise<void>;
  onLoadScene: () => Promise<void>;
  onBackToMenu: () => void;
  onModelSelected: (modelId: string) => void;
  onTestLevel: () => Promise<void>;
  detachCameraControlForXSeconds: (seconds: number) => void;
}

export class LevelCreatorUI {
  public editorUI: AdvancedDynamicTexture;
  private loadingScreen!: Rectangle;
  private loadingText!: TextBlock;

  private modelSidebar!: Rectangle;
  private sidebarExpanded: boolean = true;
  private saveLoadPanel: Rectangle | null = null;
  private snapToggleBtn: Checkbox | null = null;

  private scene: Scene;
  private ground: Mesh;
  private gridMesh: LinesMesh | null;
  private assetManager: AssetManagerService;
  private highlightLayer: any;

  // Event handlers
  private events: UIEvents;

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
    this.editorUI = AdvancedDynamicTexture.CreateFullscreenUI(
      "editorUI",
      true,
      scene
    );

    // init loading screen (hidden by default)
    this.createLoadingScreen();

    this.setupUI();
  }

  // Create a loading screen that can be shown when needed
  private createLoadingScreen(): void {
    // container for loading screen
    this.loadingScreen = new Rectangle("loadingScreen");
    this.loadingScreen.width = "100%";
    this.loadingScreen.height = "100%";
    this.loadingScreen.background = "rgba(0, 0, 0, 0.7)";
    this.loadingScreen.isVisible = false;
    this.editorUI.addControl(this.loadingScreen);

    // loading text
    this.loadingText = new TextBlock("loadingText", "Loading...");
    this.loadingText.color = "white";
    this.loadingText.fontSize = 24;
    this.loadingText.fontWeight = "bold";
    this.loadingScreen.addControl(this.loadingText);
  }

  public getEditorUI(): AdvancedDynamicTexture {
    return this.editorUI;
  }

  // Show loading screen
  public displayLoadingUI(message: string = "Loading..."): void {
    if (this.loadingScreen) {
      this.loadingText.text = message;
      this.loadingScreen.isVisible = true;
    }
  }

  // Hide loading screen
  public hideLoadingUI(): void {
    if (this.loadingScreen) {
      this.loadingScreen.isVisible = false;
    }
  }

  private setupUI(): void {
    this.createBackButton();
    this.createEditorTitle();
    this.createSnapToGridToggle();
    this.createSaveLoadPanel();
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
    backButton.hoverCursor = "pointer";
    backButton.onPointerClickObservable.add(() => {
      console.log("Back to Menu clicked");
      this.events.onBackToMenu();
    });

    this.editorUI.addControl(backButton);
  }

  private createEditorTitle(): void {
    const editorTitle = new TextBlock("editorTitle", "Fuzzelton Level Creator");
    editorTitle.color = "white";
    editorTitle.fontSize = 22;
    editorTitle.height = "30px";
    editorTitle.fontWeight = "bold";
    editorTitle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    editorTitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    // editorTitle.top = "5px";
    this.editorUI.addControl(editorTitle);
  }

  private createSnapToGridToggle(): void {
    // Container for the grid toggle
    const gridContainer = new Rectangle("gridToggleContainer");
    gridContainer.width = "180px";
    gridContainer.height = "40px";
    gridContainer.background = UIComponentsFactory.BG_PANEL_COLOR;
    gridContainer.cornerRadius = UIComponentsFactory.DEFAULT_CORNER_RADIUS;
    gridContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    gridContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    gridContainer.top = "-20px";
    gridContainer.left = "-20px";
    this.editorUI.addControl(gridContainer);

    // Create the checkbox
    this.snapToggleBtn = new Checkbox("snapToGridToggle");
    this.snapToggleBtn.width = "20px";
    this.snapToggleBtn.height = "20px";
    this.snapToggleBtn.color = "orange";
    this.snapToggleBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.snapToggleBtn.left = "10px";
    this.snapToggleBtn.zIndex = 100;
    gridContainer.addControl(this.snapToggleBtn);

    // Label for checkbox
    const toggleLabel = new TextBlock("gridToggleLabel", "Snap to Grid");
    toggleLabel.color = "white";
    toggleLabel.fontSize = 16;
    toggleLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    toggleLabel.left = "10px";
    gridContainer.addControl(toggleLabel);

    // event to toggle grid visibility and snapping
    this.snapToggleBtn.onIsCheckedChangedObservable.add((isChecked) => {
      // console.log("DEBUG toggle changed to ", isChecked);
      this.events.onGridToggle(isChecked);
    });
  }

  private createSaveLoadPanel(): void {
    // We create container for save/test/load buttons
    const sceneManagmentPanel = new Rectangle("saveLoadPanel");
    sceneManagmentPanel.width = "250px";
    sceneManagmentPanel.height = PANEL_COLLAPSED_HEIGHT; // Start collapsed
    sceneManagmentPanel.background = UIComponentsFactory.BG_PANEL_COLOR;
    sceneManagmentPanel.cornerRadius =
      UIComponentsFactory.DEFAULT_CORNER_RADIUS;
    sceneManagmentPanel.horizontalAlignment =
      Control.HORIZONTAL_ALIGNMENT_CENTER;
    sceneManagmentPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    sceneManagmentPanel.top = "-20px";
    this.editorUI.addControl(sceneManagmentPanel);
    this.saveLoadPanel = sceneManagmentPanel;

    // Create header container for title and toggle button
    const headerContainer = new Rectangle("headerContainer");
    headerContainer.width = "100%";
    headerContainer.height = "30px";
    headerContainer.thickness = 0;
    headerContainer.background = "transparent";
    headerContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    headerContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    sceneManagmentPanel.addControl(headerContainer);

    // Title
    const title = new TextBlock("saveLoadTitle", "Scene Management");
    title.color = "white";
    title.fontSize = 18;
    title.fontWeight = "bold";
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    headerContainer.addControl(title);

    // Toggle button
    const toggleButton = new TextBlock("togglePanelButton", "▼");
    toggleButton.color = "white";
    toggleButton.fontSize = 16;
    toggleButton.width = "30px";
    toggleButton.height = "30px";
    toggleButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    toggleButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    toggleButton.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    toggleButton.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    toggleButton.hoverCursor = "pointer";
    headerContainer.addControl(toggleButton);

    // Create content container (initially hidden)
    const contentContainer = new StackPanel("contentContainer");
    contentContainer.width = "100%";
    contentContainer.top = "30px";
    contentContainer.background = "transparent";
    contentContainer.isVisible = false; // Start collapsed
    contentContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    sceneManagmentPanel.addControl(contentContainer);

    // Stack panel for buttons inside content container
    const stackPanel = new StackPanel("saveLoadStack");
    stackPanel.width = "100%";
    stackPanel.paddingTop = "5px";
    contentContainer.addControl(stackPanel);

    // Save button
    const saveButton = UIComponentsFactory.createButton(
      "saveButton",
      "Save Scene",
      {
        width: "200px",
        height: "30px",
        color: "white",
        background: "green",
      }
    );
    saveButton.onPointerClickObservable.add(() => this.events.onSaveScene());
    stackPanel.addControl(saveButton);

    // Spacing
    stackPanel.addControl(UIComponentsFactory.createSpacing(5));

    // Load button
    const loadButton = UIComponentsFactory.createButton(
      "loadButton",
      "Load Scene",
      {
        width: "200px",
        height: "30px",
        color: "white",
        background: "blue",
      }
    );
    loadButton.onPointerClickObservable.add(() => this.events.onLoadScene());
    stackPanel.addControl(loadButton);

    // Spacing
    stackPanel.addControl(UIComponentsFactory.createSpacing(5));

    // Test levle button
    const testButton = UIComponentsFactory.createButton(
      "testButton",
      "Test Level",
      {
        width: "200px",
        height: "30px",
        color: "white",
        background: "orange",
      }
    );
    testButton.onPointerClickObservable.add(async () => {
      await this.events.onTestLevel();
    });
    stackPanel.addControl(testButton);

    // Add toggle functionality
    let isPanelExpanded = false;
    headerContainer.onPointerClickObservable.add(() => {
      isPanelExpanded = !isPanelExpanded;

      // Update visuals
      if (isPanelExpanded) {
        sceneManagmentPanel.height = PANEL_EXPANDED_HEIGHT;
        contentContainer.isVisible = true;
        toggleButton.text = "▲";
      } else {
        sceneManagmentPanel.height = PANEL_COLLAPSED_HEIGHT;
        contentContainer.isVisible = false;
        toggleButton.text = "▼";
      }
    });
  }

  public createModelSidebar(modelFiles: string[]): void {
    // Create the sidebar container
    const sidebar = UIComponentsFactory.createSidebar("modelSidebar", {
      alignment: Control.HORIZONTAL_ALIGNMENT_LEFT,
      width: SIDEBAR_EXPANDED_WIDTH,
    });
    this.editorUI.addControl(sidebar);
    this.modelSidebar = sidebar;
    this.sidebarExpanded = true;

    // Create header container at the top of sidebar
    const headerContainer = new Rectangle("sidebarHeaderContainer");
    headerContainer.width = "100%";
    headerContainer.height = "30px";
    headerContainer.thickness = 0;
    headerContainer.background = "transparent";
    headerContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    headerContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    headerContainer.zIndex = 101;
    sidebar.addControl(headerContainer);

    // Title in the center of header
    const title = new TextBlock("modelSidebarHeaderTitle", "Models");
    title.color = "white";
    title.fontSize = 20;
    title.fontWeight = "bold";
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    headerContainer.addControl(title);

    // Toggle button text inside the container
    const toggleButtonText = new TextBlock("sidebarToggleButtonText", "◀");
    toggleButtonText.color = "white";
    toggleButtonText.fontSize = 16;
    toggleButtonText.left = "-5px";
    toggleButtonText.textHorizontalAlignment =
      Control.HORIZONTAL_ALIGNMENT_RIGHT;
    toggleButtonText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    headerContainer.addControl(toggleButtonText);

    // we create a scroll viewer
    const scrollViewer = UIComponentsFactory.createScrollViewer("modelScroll", {
      onScroll: () => {
        // detach the camera control when scrolling to avoid zooming in/out
        this.events.detachCameraControlForXSeconds(0.5);
      },
    });
    sidebar.addControl(scrollViewer);

    // rootPanel that will hold the tree structure
    const rootTreePanel = new StackPanel("modelTreeRootPanel");
    rootTreePanel.width = "100%";
    rootTreePanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    rootTreePanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT; // Changed to LEFT
    scrollViewer.addControl(rootTreePanel);

    const spacer = UIComponentsFactory.createSpacing(15);
    rootTreePanel.addControl(spacer);

    // const sidebarTitle = new TextBlock("modelSidebarTitle", "Models");
    // sidebarTitle.color = "white";
    // sidebarTitle.fontSize = 20;
    // sidebarTitle.height = "40px";
    // sidebarTitle.fontWeight = "bold";
    // sidebarTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    // // sidebarTitle.paddingTop = "10px";
    // // sidebarTitle.paddingBottom = "10px";
    // rootTreePanel.addControl(sidebarTitle); // Add title to the root panel

    // Add the toggle functionality to the container
    headerContainer.onPointerClickObservable.add(() => {
      this.sidebarExpanded = !this.sidebarExpanded;

      if (this.sidebarExpanded) {
        // Expand sidebar
        sidebar.width = SIDEBAR_EXPANDED_WIDTH;
        toggleButtonText.text = "◀";
        scrollViewer.isVisible = true;
        title.isVisible = true;
      } else {
        // Collapse sidebar
        sidebar.width = SIDEBAR_COLLAPSED_WIDTH;
        toggleButtonText.text = "▶";
        scrollViewer.isVisible = false;
        title.isVisible = false;
      }
    });

    // build the Trie Data Structure
    const modelTrieRoot: ModelTrieNode = { children: new Map(), models: [] };

    for (const filename of modelFiles) {
      const modelId = this.assetManager.getModelIdFromFilename(filename);
      if (!modelId) {
        console.warn(`Model ID not found for file: ${filename}`);
        continue; // Skip if modelId is not found in loaded models
      } else {
        try {
          const formattedFullName = this.formatModelName(modelId);
          const nameParts = formattedFullName
            .split(" ")
            .filter((p) => p.length > 0);

          let color = "gray";
          // if (modelId.toLowerCase().includes("blue")) color = "blue";
          // else if (modelId.toLowerCase().includes("red")) color = "red";
          // else if (modelId.toLowerCase().includes("yellow")) color = "yellow";
          // else if (modelId.toLowerCase().includes("green")) color = "green";
          // else if (modelId.toLowerCase().includes("purple")) color = "purple";
          // else if (modelId.toLowerCase().includes("orange")) color = "orange";

          const meshItem: MeshItem = {
            id: `model-${modelId}`, // Unique UI ID
            modelId,
            type: "model",
            label: formattedFullName, // Store full formatted name
            color,
            imageUrl: this.assetManager.getAssetImageUrl(modelId) || "", // Get image URL from asset manager
          };

          let currentNode = modelTrieRoot;
          for (let i = 0; i < nameParts.length; i++) {
            const part = nameParts[i];
            if (!currentNode.children.has(part)) {
              currentNode.children.set(part, {
                children: new Map(),
                models: [],
              });
            }
            currentNode = currentNode.children.get(part)!;
            if (i === nameParts.length - 1) {
              // Last part of the name
              currentNode.models.push({ meshItem, nameParts });
            }
          }
        } catch (error) {
          console.error(
            `Sidebard creation error processing model file ${filename}: ${error}`
          );
        }
        continue;
      }
    }

    // now taht Trie is build we populate the UI from it
    this.addTrieNodeElementsToPanel(modelTrieRoot, rootTreePanel, 0, "root");
  }

  private addTrieNodeElementsToPanel(
    trieNode: ModelTrieNode,
    uiParentPanel: StackPanel,
    level: number,
    parentPathKey: string
  ): void {
    // Recursive function to add elements from the Trie to the UI panel

    trieNode.models.forEach((modelData, index) => {
      const displayLabel =
        modelData.nameParts.length > 0
          ? modelData.nameParts[modelData.nameParts.length - 1]
          : modelData.meshItem.modelId!;
      const modelEntryUI = this.createModelEntryDisplay(
        modelData.meshItem,
        displayLabel,
        level, // Models at this node are at the current level
        `${parentPathKey}_model${index}`
      );
      uiParentPanel.addControl(modelEntryUI);
      uiParentPanel.addControl(UIComponentsFactory.createSpacing(20)); // Spacing as per original
    });

    const sortedCategoryKeys = Array.from(trieNode.children.keys()).sort();

    sortedCategoryKeys.forEach((namePart, index) => {
      const childTrieNode = trieNode.children.get(namePart)!;
      const categoryPathKey = `${parentPathKey}_cat${index}_${namePart.replace(
        /\s/g,
        ""
      )}`;

      // Here we check for flattening if the child node is a leaf and has only one model then will be displayed
      if (
        childTrieNode.children.size === 0 &&
        childTrieNode.models.length === 1
      ) {
        // This child node is a leaf category with only one model --> we  Flatten it
        const modelData = childTrieNode.models[0];
        const displayLabel =
          modelData.nameParts.length > 0
            ? modelData.nameParts[modelData.nameParts.length - 1]
            : modelData.meshItem.modelId!;

        // Create and add the model entry directly to the current uiParentPanel
        // It will be indented at the same 'level' as a category header would have been
        const modelEntryUI = this.createModelEntryDisplay(
          modelData.meshItem,
          displayLabel,
          level, // Indent at the current level, effectively replacing the category header
          `${categoryPathKey}_flat_model`
        );
        uiParentPanel.addControl(modelEntryUI);
        uiParentPanel.addControl(UIComponentsFactory.createSpacing(5));
      } else {
        // Default logic : Create a collapsible category
        const categoryContainer = new StackPanel(
          `container_${categoryPathKey}`
        );
        categoryContainer.width = "100%";
        // Indentation for the category header and its content block
        categoryContainer.paddingLeft = `${level * INDENT_PER_LEVEL}px`;
        categoryContainer.adaptHeightToChildren = true;
        categoryContainer.horizontalAlignment =
          Control.HORIZONTAL_ALIGNMENT_LEFT;
        uiParentPanel.addControl(categoryContainer);

        const headerRect = new Rectangle(`header_${categoryPathKey}`);
        headerRect.width = "100%";
        headerRect.height = CATEGORY_HEADER_HEIGHT + "px";
        headerRect.thickness = 0;
        headerRect.isPointerBlocker = true;
        headerRect.hoverCursor = "pointer";
        categoryContainer.addControl(headerRect);

        const headerText = new TextBlock(
          `label_${categoryPathKey}`,
          `▶ ${namePart}`
        );
        headerText.color = "white";
        headerText.fontSize = 14;
        headerText.fontWeight = "bold";
        headerText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        headerText.paddingLeft = `${MODEL_ITEM_PADDING}px`;
        headerRect.addControl(headerText);

        const contentPanel = new StackPanel(`content_${categoryPathKey}`);
        contentPanel.width = "100%";
        contentPanel.paddingTop = "2px";
        // contentPanel.height = "50px"; //should adapt to children auto
        contentPanel.isVisible = false;
        contentPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        // contentPanel.adaptHeightToChildren = true; // this is useless and creates perfs issues
        categoryContainer.addControl(contentPanel);

        let isExpanded = false;
        headerRect.onPointerClickObservable.add(() => {
          isExpanded = !isExpanded;
          contentPanel.isVisible = isExpanded;
          headerText.text = `${isExpanded ? "▼" : "▶"} ${namePart}`;
        });

        // Populate the content panel recursively
        //  Items inside will be at 'level + 1'.
        this.addTrieNodeElementsToPanel(
          childTrieNode,
          contentPanel,
          level + 1, // Children are one level deeper
          categoryPathKey
        );
      }
    });
  }

  private createModelEntryDisplay(
    meshItem: MeshItem,
    displayLabel: string,
    level: number, // Hierarchical depth for indentation
    idSuffix: string
  ): Rectangle {
    const itemContainer = new Rectangle(`${meshItem.id}_${idSuffix}_entry`);
    itemContainer.width = "100%";
    itemContainer.height = "40px";
    // itemContainer.adaptHeightToChildren = true; Useless and lead to perfs issues
    itemContainer.thickness = 1;
    itemContainer.color = "gray";
    itemContainer.background = "rgba(50, 50, 50, 0.85)";
    itemContainer.cornerRadius = UIComponentsFactory.DEFAULT_CORNER_RADIUS - 2;
    itemContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

    itemContainer.paddingLeft = `${level * INDENT_PER_LEVEL}px`; // apply indentation based on level

    itemContainer.isPointerBlocker = true; // block pointer events in order to make it clickable
    itemContainer.hoverCursor = "grab";

    const innerStack = new StackPanel(`${meshItem.id}_${idSuffix}_innerstack`);
    innerStack.isVertical = false; // horizontal for image + text
    // innerStack.adaptHeightToChildren = true; // Useless and lead to perfs issues
    innerStack.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    innerStack.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    innerStack.paddingLeft = `${MODEL_ITEM_PADDING}px`;
    itemContainer.addControl(innerStack);

    const preview = UIComponentsFactory.createImagePreview(
      `${meshItem.id}_${idSuffix}_preview`,
      meshItem.imageUrl || "",
      {
        width: `${MODEL_ITEM_IMAGE_SIZE}px`,
        height: `${MODEL_ITEM_IMAGE_SIZE}px`,
        fallbackColor: meshItem.color,
      }
    );
    preview.paddingRight = `${MODEL_ITEM_PADDING}px`; // space btw image and text
    innerStack.addControl(preview);

    const modelTextLabel = new TextBlock(
      `${meshItem.id}_${idSuffix}_txtlabel`,
      displayLabel
    );
    modelTextLabel.color = "white";
    modelTextLabel.fontSize = 12;
    modelTextLabel.textWrapping = true;
    modelTextLabel.resizeToFit = true;
    modelTextLabel.width = "100%";
    modelTextLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    innerStack.addControl(modelTextLabel);

    itemContainer.onPointerDownObservable.add(() => {
      if (meshItem.modelId) {
        this.events.onModelSelected(meshItem.modelId);
      }
    });

    return itemContainer;
  }

  private formatModelName(modelId: string): string {
    return (
      modelId
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space between camelCase
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\//g, " ") // Replace slashes with spaces
        // .replace(/team/i, "Team ") // Add space after "team"
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  }

  // private addModelItemToSidebar(parent: Container, item: MeshItem): void {
  //   const itemContainer = new Rectangle(`${item.id}-container`);
  //   itemContainer.width = "100%";
  //   itemContainer.height = "70px";
  //   itemContainer.thickness = 1;
  //   itemContainer.color = "lightgray";
  //   itemContainer.background = "rgba(70, 70, 70, 0.9)";
  //   itemContainer.cornerRadius = UIComponentsFactory.DEFAULT_CORNER_RADIUS;
  //   itemContainer.paddingBottom = "5px";
  //   itemContainer.paddingLeft = "10px";
  //   itemContainer.paddingRight = "10px";
  //   itemContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  //   itemContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  //   itemContainer.isPointerBlocker = true;
  //   itemContainer.hoverCursor = "grab";
  //   parent.addControl(itemContainer);

  //   const alignmentImg = 10;
  //   const imgSize = 40;
  //   // Create the image preview with fallback
  //   const preview = UIComponentsFactory.createImagePreview(
  //     `${item.id}-preview`,
  //     item.imageUrl || "",
  //     {
  //       width: imgSize + "px",
  //       height: imgSize + "px",
  //       left: 10 + "px",
  //       fallbackColor: item.color,
  //     }
  //   );
  //   itemContainer.addControl(preview);

  //   // Label for the model
  //   const modelLabel = new TextBlock(`${item.id}-label`, item.label);
  //   modelLabel.color = "white";
  //   modelLabel.fontSize = 12;
  //   modelLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  //   modelLabel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  //   modelLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  //   // modelLabel.top = "5px";
  //   modelLabel.left = imgSize + alignmentImg * 2 + "px";
  //   itemContainer.addControl(modelLabel);

  //   // Make the item draggable
  //   itemContainer.onPointerDownObservable.add(() => {
  //     if (item.type === "model" && item.modelId) {
  //       this.events.onModelSelected(item.modelId);
  //     }
  //   });
  // }

  public getSceneName(): string {
    return this.sceneName;
  }

  public setSceneName(name: string): void {
    this.sceneName = name;
  }

  public promptForSceneName(): string | null {
    return prompt("Enter a name for your scene:", this.sceneName);
  }

  public dispose(): void {
    // dispose of the editor UI
    if (this.editorUI) {
      this.editorUI.dispose();
    }

    // dispose of the loading screen
    if (this.loadingScreen) {
      this.loadingScreen.dispose();
    }

    // Dispose of the model sidebar
    if (this.modelSidebar) {
      this.modelSidebar.dispose();
    }

    // Clear event handlers
    this.events = {} as UIEvents;

    // Clear references to avoid memory leaks
    this.scene = null as any;
    this.ground = null as any;
    this.gridMesh = null;
  }
}
