import { Scene, Mesh, Vector3 } from "@babylonjs/core";

import {
  Button,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
  Checkbox,
  ScrollViewer,
  InputText,
} from "@babylonjs/gui";

import { UIComponentsFactory } from "./UIComponentsFactory";
import { ObjectController } from "./ObjectController";
import { LevelCreatorUI } from "./UI";

export class selectedMeshUI {
  levelCreatorUI: LevelCreatorUI;
  objectController: ObjectController;
  scene: Scene;

  // Selected object
  private objectControlsPanel: Rectangle | null = null;
  private objectControlsVisible: boolean = false;

  // timer for continuous actions (when btn held down)
  private actionTimers: Map<string, number> = new Map();

  private detachCameraControlForXSeconds: (seconds: number) => void;

  constructor(
    scene: Scene,
    levelCreatorUI: LevelCreatorUI,
    objectController: ObjectController,
    detachCameraControlForXSeconds: (seconds: number) => void
  ) {
    this.levelCreatorUI = levelCreatorUI;
    this.objectController = objectController;
    this.scene = scene;
    this.detachCameraControlForXSeconds = detachCameraControlForXSeconds;
  }

  //////////////////// MESH MODIFICATION SIDE BAR //////////////////////////////
  // Create UI controls for the selected object
  createObjectControls(selectedMesh: Mesh) {
    // console.log("in createObjectControls : selectedMesh :  ", selectedMesh);
    // Remove existing panel if there is one
    if (this.objectControlsPanel) {
      this.objectControlsPanel.dispose();
      this.objectControlsPanel = null;
    }

    // Create controls panel
    const controlsPanel = UIComponentsFactory.createControlPanel(
      "objectControlsPanel",
      {
        top: "0px",
        left: "20px",
        // height: "100px",
        // width: "200px",
        verticalAlignment: Control.VERTICAL_ALIGNMENT_TOP,
        horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT,
      }
    );

    // adding controlsPanel to the main editor UI
    this.levelCreatorUI.editorUI.addControl(controlsPanel);
    this.objectControlsPanel = controlsPanel;

    // Create a scroll viewer to make controls scrollable
    const scrollViewer = UIComponentsFactory.createScrollViewer(
      "controlsScrollViewer",
      {
        onScroll: () => {
          // Detach camera controls when scrolling to avoid zoming in/out
          this.detachCameraControlForXSeconds(0.5);
        },
      }
    );
    controlsPanel.addControl(scrollViewer);

    // Create a stack panel for organizing the buttons
    const stackPanel = new StackPanel("controlsStack");
    stackPanel.width = "100%";
    // No fixed height to allow content to extend for scrolling
    // Add padding to the bottom to ensure space after the last control
    stackPanel.paddingBottom = "20px";
    scrollViewer.addControl(stackPanel);

    // Add title
    const titleBlock = new TextBlock("controlsTitle", "Object Controls");
    titleBlock.color = "white";
    titleBlock.fontSize = 18;
    titleBlock.fontWeight = "bold";
    titleBlock.height = "30px";
    titleBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    titleBlock.paddingBottom = "5px";
    stackPanel.addControl(titleBlock);

    this.addPositionRotationDisplay(stackPanel, selectedMesh);
    this.addDirectionControls(stackPanel, selectedMesh);
    this.addRotationControls(stackPanel, selectedMesh);
    this.addScalingControls(stackPanel, selectedMesh);
    this.addMovementControls(stackPanel, selectedMesh);
    this.addPhysicsControls(stackPanel, selectedMesh);
    this.addWinConditionControls(stackPanel, selectedMesh);

    const spacer = UIComponentsFactory.createSpacing(10);
    stackPanel.addControl(spacer);

    // Delete button
    const deleteBtn = UIComponentsFactory.createButton(
      "deleteBtn",
      "Delete Object",
      {
        width: "150px",
        height: "35px",
        color: "white",
        background: "red",
        cornerRadius: 5,
        fontSize: 16,
      }
    );
    deleteBtn.onPointerClickObservable.add(() => {
      if (selectedMesh) {
        // We store the btn ref to avoid null issue during delete process
        const meshToDelete = selectedMesh;
        // First hide controls to avoid reference errors
        this.hideObjectControls();
        // Then delete the mesh
        this.objectController.deleteMesh(meshToDelete as Mesh);
      }
    });
    stackPanel.addControl(deleteBtn);

    // Add bottom padding
    const bottomSpacer = UIComponentsFactory.createSpacing(15);
    stackPanel.addControl(bottomSpacer);

    this.objectControlsVisible = true;

    // console.log(
    //   "end of createObjectControls : this.objectControlsVisible: ",
    //   this.objectControlsVisible,
    //   " this.objectControlsPanel: ",
    //   this.objectControlsPanel
    // );
  }

  hideObjectControls() {
    console.log("Hiding Object Control debug");
    if (this.objectControlsPanel) {
      // Clear any active timers before disposing the panel
      this.clearAllActionTimers();
      this.objectControlsPanel.dispose();
      this.objectControlsPanel = null;
      this.objectControlsVisible = false;
    }
  }

  // Helper method to start a continuous action
  private startContinuousAction(actionName: string, action: () => void): void {
    // Clear any existing timer for this action
    this.clearActionTimer(actionName);

    // Execute action immediately
    action();

    // Start interval timer for continuous action
    const timerId = window.setInterval(() => {
      action();
    }, 100); // 100ms btw each action interval when btn is held

    // Store timer id for later cleanup
    this.actionTimers.set(actionName, timerId);

    console.log(`Started continuous action: ${actionName}`);
  }

  // Helper method to stop a continuous action
  private clearActionTimer(actionName: string): void {
    if (this.actionTimers.has(actionName)) {
      window.clearInterval(this.actionTimers.get(actionName));
      this.actionTimers.delete(actionName);
      console.log(`Stopped continuous action: ${actionName}`);
    }
  }

  // Clear all action timers
  public clearAllActionTimers(): void {
    this.actionTimers.forEach((timerId, actionName) => {
      window.clearInterval(timerId);
      console.log(`Stopped continuous action: ${actionName}`);
    });
    this.actionTimers.clear();
  }

  // Position and rotation display
  private addPositionRotationDisplay(
    stackPanel: StackPanel,
    selectedMesh: Mesh
  ) {
    const positionText = new TextBlock("positionText", "");
    positionText.color = "white";
    positionText.fontSize = 12;
    positionText.height = "30px";
    positionText.paddingBottom = "5px";
    positionText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stackPanel.addControl(positionText);

    const rotaText = new TextBlock("rotationText", "");
    rotaText.color = "white";
    rotaText.fontSize = 12;
    rotaText.height = "30px";
    rotaText.paddingBottom = "5px";
    rotaText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stackPanel.addControl(rotaText);

    // Update position info
    const updatePositionText = () => {
      if (selectedMesh) {
        const pos = selectedMesh.position;
        const rot = selectedMesh.rotationQuaternion;

        // Convert rotation from radians to degrees for display
        const rotDegrees = {
          x: rot ? ((rot.x * 180) / Math.PI).toFixed(1) : "0.0",
          y: rot ? ((rot.y * 180) / Math.PI).toFixed(1) : "0.0",
          z: rot ? ((rot.z * 180) / Math.PI).toFixed(1) : "0.0",
        };

        positionText.text = `Position: X:${pos.x.toFixed(1)}, Y:${pos.y.toFixed(
          1
        )}, Z:${pos.z.toFixed(1)}`;
        rotaText.text = `Rotation: X:${rotDegrees.x}°, Y:${rotDegrees.y}°, Z:${rotDegrees.z}°`;
      }
    };
    updatePositionText();

    // Register an observer to update position text
    this.scene.registerBeforeRender(() => {
      if (selectedMesh && !selectedMesh.isDisposed()) {
        updatePositionText();
      }
    });
  }

  // Updated to create buttons with continuous actions
  private createActionButton(
    name: string,
    text: string,
    action: () => void,
    color: string = "blue"
  ): Button {
    const button = UIComponentsFactory.createButton(name, text, {
      width: "40px",
      height: "40px",
      color: "white",
      background: color,
      fontSize: 16,
    });
    // Add pointerdown event to start continuous action
    button.onPointerDownObservable.add(() => {
      this.startContinuousAction(name, action);
    });

    // Add pointerup/pointerout events to stop continuous action
    button.onPointerUpObservable.add(() => {
      this.clearActionTimer(name);
    });

    button.onPointerOutObservable.add(() => {
      this.clearActionTimer(name);
    });

    return button;
  }

  private addDirectionControls(stackPanel: StackPanel, selectedMesh: Mesh) {
    const spacer = UIComponentsFactory.createSpacing(10);
    stackPanel.addControl(spacer);
    const directionControls = new StackPanel("directionControls");
    directionControls.isVertical = true;
    directionControls.background = "transparent";
    stackPanel.addControl(directionControls);

    // X-Axis controls (Left/Right)
    const xAxisLabel = new TextBlock("xAxisLabel", "X-Axis (Left/Right)");
    xAxisLabel.color = "white";
    xAxisLabel.fontSize = 14;
    xAxisLabel.height = "20px";
    xAxisLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    directionControls.addControl(xAxisLabel);

    const xControlsPanel = new StackPanel("xControlsPanel");
    xControlsPanel.isVertical = false;
    xControlsPanel.height = "40px";
    directionControls.addControl(xControlsPanel);

    // Left button
    const leftBtn = this.createActionButton(
      "leftBtn",
      "←",
      () => this.objectController.moveMeshLeft(),
      "green"
    );
    xControlsPanel.addControl(leftBtn);

    // X position input
    const xPosInput = new InputText("xPosInput", "");
    xPosInput.width = "60px";
    xPosInput.height = "30px";
    xPosInput.color = "white";
    xPosInput.background = "black";
    xPosInput.fontSize = 12;
    xPosInput.thickness = 1;
    xPosInput.paddingLeft = "5px";
    xPosInput.paddingRight = "5px";
    xPosInput.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

    // Set initial value
    if (selectedMesh) {
      xPosInput.text = selectedMesh.position.x.toFixed(1);
    }

    // Track if input is being edited
    let isEditingX = false;

    xPosInput.onFocusObservable.add(() => {
      isEditingX = true;
      console.log("X position input focused - editing mode ON");
    });

    xPosInput.onBlurObservable.add(() => {
      isEditingX = false;
      applyXPositionFromInput();
      console.log("X position input blurred - editing mode OFF");
    });

    const applyXPositionFromInput = () => {
      if (!selectedMesh) return;

      const newX = parseFloat(xPosInput.text);

      // Validate input
      if (isNaN(newX)) {
        xPosInput.text = selectedMesh.position.x.toFixed(1);
        return;
      }

      // Apply the new position
      selectedMesh.position.x = newX;
    };

    xPosInput.onKeyboardEventProcessedObservable.add((eventData) => {
      if (eventData.code === "Enter") {
        applyXPositionFromInput();
        xPosInput.blur();
      }
    });

    xControlsPanel.addControl(xPosInput);

    // Right button
    const rightBtn = this.createActionButton(
      "rightBtn",
      "→",
      () => this.objectController.moveMeshRight(),
      "green"
    );
    xControlsPanel.addControl(rightBtn);

    // Update input display when position changes
    this.scene.registerBeforeRender(() => {
      if (selectedMesh && !selectedMesh.isDisposed() && xPosInput) {
        if (!isEditingX) {
          xPosInput.text = selectedMesh.position.x.toFixed(1);
        }
      }
    });

    // Add spacing between axis controls
    directionControls.addControl(UIComponentsFactory.createSpacing(10));

    // Y-Axis controls (Up/Down)
    const yAxisLabel = new TextBlock("yAxisLabel", "Y-Axis (Up/Down)");
    yAxisLabel.color = "white";
    yAxisLabel.fontSize = 14;
    yAxisLabel.height = "20px";
    yAxisLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    directionControls.addControl(yAxisLabel);

    const yControlsPanel = new StackPanel("yControlsPanel");
    yControlsPanel.isVertical = false;
    yControlsPanel.height = "40px";
    directionControls.addControl(yControlsPanel);

    // Up button
    const upBtn = this.createActionButton(
      "upBtn",
      "↑",
      () => this.objectController.moveMeshUp(),
      "blue"
    );
    yControlsPanel.addControl(upBtn);

    // Y position input
    const yPosInput = new InputText("yPosInput", "");
    yPosInput.width = "60px";
    yPosInput.height = "30px";
    yPosInput.color = "white";
    yPosInput.background = "black";
    yPosInput.fontSize = 12;
    yPosInput.thickness = 1;
    yPosInput.paddingLeft = "5px";
    yPosInput.paddingRight = "5px";
    yPosInput.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

    // Set initial value
    if (selectedMesh) {
      yPosInput.text = selectedMesh.position.y.toFixed(1);
    }

    // Track if input is being edited
    let isEditingY = false;

    yPosInput.onFocusObservable.add(() => {
      isEditingY = true;
      console.log("Y position input focused - editing mode ON");
    });

    yPosInput.onBlurObservable.add(() => {
      isEditingY = false;
      applyYPositionFromInput();
      console.log("Y position input blurred - editing mode OFF");
    });

    const applyYPositionFromInput = () => {
      if (!selectedMesh) return;

      let newY = parseFloat(yPosInput.text);

      // Validate input
      if (isNaN(newY)) {
        yPosInput.text = selectedMesh.position.y.toFixed(1);
        return;
      }

      // Apply limit - Y can't be below 0
      if (newY < 0) {
        newY = 0;
        yPosInput.text = "0.0";
      }

      // Apply the new position
      selectedMesh.position.y = newY;
    };

    yPosInput.onKeyboardEventProcessedObservable.add((eventData) => {
      if (eventData.code === "Enter") {
        applyYPositionFromInput();
        yPosInput.blur();
      }
    });

    yControlsPanel.addControl(yPosInput);

    // Down button
    const downBtn = this.createActionButton(
      "downBtn",
      "↓",
      () => this.objectController.moveMeshDown(),
      "blue"
    );
    yControlsPanel.addControl(downBtn);

    // Update input display when position changes
    this.scene.registerBeforeRender(() => {
      if (selectedMesh && !selectedMesh.isDisposed() && yPosInput) {
        if (!isEditingY) {
          yPosInput.text = selectedMesh.position.y.toFixed(1);
        }
      }
    });

    // Add spacing between axis controls
    directionControls.addControl(UIComponentsFactory.createSpacing(10));

    // Z-Axis controls (Forward/Backward)
    const zAxisLabel = new TextBlock("zAxisLabel", "Z-Axis (Forward/Backward)");
    zAxisLabel.color = "white";
    zAxisLabel.fontSize = 14;
    zAxisLabel.height = "20px";
    zAxisLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    directionControls.addControl(zAxisLabel);

    const zControlsPanel = new StackPanel("zControlsPanel");
    zControlsPanel.isVertical = false;
    zControlsPanel.height = "40px";
    directionControls.addControl(zControlsPanel);

    // Forward button
    const forwardBtn = this.createActionButton(
      "forwardBtn",
      "F",
      () => this.objectController.moveMeshForward(),
      "purple"
    );
    zControlsPanel.addControl(forwardBtn);

    // Z position input
    const zPosInput = new InputText("zPosInput", "");
    zPosInput.width = "60px";
    zPosInput.height = "30px";
    zPosInput.color = "white";
    zPosInput.background = "black";
    zPosInput.fontSize = 12;
    zPosInput.thickness = 1;
    zPosInput.paddingLeft = "5px";
    zPosInput.paddingRight = "5px";
    zPosInput.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

    // Set initial value
    if (selectedMesh) {
      zPosInput.text = selectedMesh.position.z.toFixed(1);
    }

    // Track if input is being edited
    let isEditingZ = false;

    zPosInput.onFocusObservable.add(() => {
      isEditingZ = true;
      console.log("Z position input focused - editing mode ON");
    });

    zPosInput.onBlurObservable.add(() => {
      isEditingZ = false;
      applyZPositionFromInput();
      console.log("Z position input blurred - editing mode OFF");
    });

    const applyZPositionFromInput = () => {
      if (!selectedMesh) return;

      const newZ = parseFloat(zPosInput.text);

      // Validate input
      if (isNaN(newZ)) {
        zPosInput.text = selectedMesh.position.z.toFixed(1);
        return;
      }

      // Apply the new position
      selectedMesh.position.z = newZ;
    };

    zPosInput.onKeyboardEventProcessedObservable.add((eventData) => {
      if (eventData.code === "Enter") {
        applyZPositionFromInput();
        zPosInput.blur();
      }
    });

    zControlsPanel.addControl(zPosInput);

    // Backward button
    const backwardBtn = this.createActionButton(
      "backwardBtn",
      "B",
      () => this.objectController.moveMeshBackward(),
      "purple"
    );
    zControlsPanel.addControl(backwardBtn);

    // Update input display when position changes
    this.scene.registerBeforeRender(() => {
      if (selectedMesh && !selectedMesh.isDisposed() && zPosInput) {
        if (!isEditingZ) {
          zPosInput.text = selectedMesh.position.z.toFixed(1);
        }
      }
    });
  }

  private addRotationControls(stackPanel: StackPanel, selectedMesh: Mesh) {
    const spacer = UIComponentsFactory.createSpacing(10);
    stackPanel.addControl(spacer);
    const rotationLabel = new TextBlock("rotationLabel", "Rotation");
    rotationLabel.color = "white";
    rotationLabel.fontSize = 14;
    rotationLabel.height = "20px";
    rotationLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stackPanel.addControl(rotationLabel);
    // rotationLabel.paddingTop = "10px";

    const rotationPanel = new StackPanel("rotationPanel");
    rotationPanel.isVertical = true;
    // rotationPanel.height = "100px";
    stackPanel.addControl(rotationPanel);

    // X-axis rotation (around X)
    const xRotationPanel = new StackPanel("xRotationPanel");
    xRotationPanel.isVertical = false;
    xRotationPanel.height = "40px";
    rotationPanel.addControl(xRotationPanel);

    const xRotLabel = new TextBlock("xRotLabel", "X:");
    xRotLabel.width = "20px";
    xRotLabel.color = "white";
    xRotLabel.fontSize = 12;
    xRotationPanel.addControl(xRotLabel);

    // Rotate X left button
    const rotateXLeftBtn = this.createActionButton(
      "rotateXLeftBtn",
      "⟲",
      () => this.objectController.rotateMeshX(-15),
      "darkred"
    );
    xRotationPanel.addControl(rotateXLeftBtn);

    // X rotation input
    const xRotInput = new InputText("xRotInput", "");
    xRotInput.width = "60px";
    xRotInput.height = "30px";
    xRotInput.color = "white";
    xRotInput.background = "black";
    xRotInput.fontSize = 12;
    xRotInput.thickness = 1;
    xRotInput.paddingLeft = "5px";
    xRotInput.paddingRight = "5px";
    xRotInput.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

    // Set initial value based on rotation quaternion
    if (selectedMesh && selectedMesh.rotationQuaternion) {
      const radians = selectedMesh.rotationQuaternion.x;
      const degrees = ((radians * 180) / Math.PI).toFixed(1);
      xRotInput.text = degrees;
    } else {
      xRotInput.text = "0.0";
    }

    // Track if input is being edited
    let isEditingXRot = false;

    xRotInput.onFocusObservable.add(() => {
      isEditingXRot = true;
      console.log("X rotation input focused - editing mode ON");
    });

    xRotInput.onBlurObservable.add(() => {
      isEditingXRot = false;
      applyXRotationFromInput();
      console.log("X rotation input blurred - editing mode OFF");
    });

    const applyXRotationFromInput = () => {
      if (!selectedMesh) return;

      const degrees = parseFloat(xRotInput.text);

      // Validate input
      if (isNaN(degrees)) {
        // Reset to current value
        const currentDegrees = selectedMesh.rotationQuaternion
          ? ((selectedMesh.rotationQuaternion.x * 180) / Math.PI).toFixed(1)
          : "0.0";
        xRotInput.text = currentDegrees;
        return;
      }

      // Normalize degrees to range -180 to 180
      const normalizedDegrees = ((degrees + 180) % 360) - 180;
      xRotInput.text = normalizedDegrees.toFixed(1);

      // Convert to radians and apply rotation
      const radians = (normalizedDegrees * Math.PI) / 180;
      selectedMesh.rotation = new Vector3(
        radians,
        selectedMesh.rotation ? selectedMesh.rotation.y : 0,
        selectedMesh.rotation ? selectedMesh.rotation.z : 0
      );
    };

    xRotInput.onKeyboardEventProcessedObservable.add((eventData) => {
      if (eventData.code === "Enter") {
        applyXRotationFromInput();
        xRotInput.blur();
      }
    });

    xRotationPanel.addControl(xRotInput);

    // Rotate X right button
    const rotateXRightBtn = this.createActionButton(
      "rotateXRightBtn",
      "⟳",
      () => this.objectController.rotateMeshX(15),
      "darkred"
    );
    xRotationPanel.addControl(rotateXRightBtn);

    // Y-axis rotation (around Y)
    const yRotationPanel = new StackPanel("yRotationPanel");
    yRotationPanel.isVertical = false;
    yRotationPanel.height = "40px";
    rotationPanel.addControl(yRotationPanel);

    const yRotLabel = new TextBlock("yRotLabel", "Y:");
    yRotLabel.width = "20px";
    yRotLabel.color = "white";
    yRotLabel.fontSize = 12;
    yRotationPanel.addControl(yRotLabel);

    // Rotate Y left button
    const rotateYLeftBtn = this.createActionButton(
      "rotateYLeftBtn",
      "⟲",
      () => this.objectController.rotateMeshY(-15),
      "darkgreen"
    );
    yRotationPanel.addControl(rotateYLeftBtn);

    // Y rotation input
    const yRotInput = new InputText("yRotInput", "");
    yRotInput.width = "60px";
    yRotInput.height = "30px";
    yRotInput.color = "white";
    yRotInput.background = "black";
    yRotInput.fontSize = 12;
    yRotInput.thickness = 1;
    yRotInput.paddingLeft = "5px";
    yRotInput.paddingRight = "5px";
    yRotInput.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

    // Set initial value based on rotation quaternion
    if (selectedMesh && selectedMesh.rotationQuaternion) {
      const radians = selectedMesh.rotationQuaternion.y;
      const degrees = ((radians * 180) / Math.PI).toFixed(1);
      yRotInput.text = degrees;
    } else {
      yRotInput.text = "0.0";
    }

    // Track if input is being edited
    let isEditingYRot = false;

    yRotInput.onFocusObservable.add(() => {
      isEditingYRot = true;
      console.log("Y rotation input focused - editing mode ON");
    });

    yRotInput.onBlurObservable.add(() => {
      isEditingYRot = false;
      applyYRotationFromInput();
      console.log("Y rotation input blurred - editing mode OFF");
    });

    const applyYRotationFromInput = () => {
      if (!selectedMesh) return;

      const degrees = parseFloat(yRotInput.text);

      // Validate input
      if (isNaN(degrees)) {
        // Reset to current value
        const currentDegrees = selectedMesh.rotationQuaternion
          ? ((selectedMesh.rotationQuaternion.y * 180) / Math.PI).toFixed(1)
          : "0.0";
        yRotInput.text = currentDegrees;
        return;
      }

      // Normalize degrees to range -180 to 180
      const normalizedDegrees = ((degrees + 180) % 360) - 180;
      yRotInput.text = normalizedDegrees.toFixed(1);

      // Convert to radians and apply rotation
      const radians = (normalizedDegrees * Math.PI) / 180;
      selectedMesh.rotation = new Vector3(
        selectedMesh.rotation ? selectedMesh.rotation.x : 0,
        radians,
        selectedMesh.rotation ? selectedMesh.rotation.z : 0
      );
    };

    yRotInput.onKeyboardEventProcessedObservable.add((eventData) => {
      if (eventData.code === "Enter") {
        applyYRotationFromInput();
        yRotInput.blur();
      }
    });

    yRotationPanel.addControl(yRotInput);

    // Rotate Y right button
    const rotateYRightBtn = this.createActionButton(
      "rotateYRightBtn",
      "⟳",
      () => this.objectController.rotateMeshY(15),
      "darkgreen"
    );
    yRotationPanel.addControl(rotateYRightBtn);

    // Z-axis rotation (around Z)
    const zRotationPanel = new StackPanel("zRotationPanel");
    zRotationPanel.isVertical = false;
    zRotationPanel.height = "40px";
    rotationPanel.addControl(zRotationPanel);

    const zRotLabel = new TextBlock("zRotLabel", "Z:");
    zRotLabel.width = "20px";
    zRotLabel.color = "white";
    zRotLabel.fontSize = 12;
    zRotationPanel.addControl(zRotLabel);

    // Rotate Z left button
    const rotateZLeftBtn = this.createActionButton(
      "rotateZLeftBtn",
      "⟲",
      () => this.objectController.rotateMeshZ(-15),
      "darkblue"
    );
    zRotationPanel.addControl(rotateZLeftBtn);

    // Z rotation input
    const zRotInput = new InputText("zRotInput", "");
    zRotInput.width = "60px";
    zRotInput.height = "30px";
    zRotInput.color = "white";
    zRotInput.background = "black";
    zRotInput.fontSize = 12;
    zRotInput.thickness = 1;
    zRotInput.paddingLeft = "5px";
    zRotInput.paddingRight = "5px";
    zRotInput.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

    // Set initial value based on rotation quaternion
    if (selectedMesh && selectedMesh.rotationQuaternion) {
      const radians = selectedMesh.rotationQuaternion.z;
      const degrees = ((radians * 180) / Math.PI).toFixed(1);
      zRotInput.text = degrees;
    } else {
      zRotInput.text = "0.0";
    }

    // Track if input is being edited
    let isEditingZRot = false;

    zRotInput.onFocusObservable.add(() => {
      isEditingZRot = true;
      console.log("Z rotation input focused - editing mode ON");
    });

    zRotInput.onBlurObservable.add(() => {
      isEditingZRot = false;
      applyZRotationFromInput();
      console.log("Z rotation input blurred - editing mode OFF");
    });

    const applyZRotationFromInput = () => {
      if (!selectedMesh) return;

      const degrees = parseFloat(zRotInput.text);

      // Validate input
      if (isNaN(degrees)) {
        // Reset to current value
        const currentDegrees = selectedMesh.rotationQuaternion
          ? ((selectedMesh.rotationQuaternion.z * 180) / Math.PI).toFixed(1)
          : "0.0";
        zRotInput.text = currentDegrees;
        return;
      }

      // Normalize degrees to range -180 to 180
      const normalizedDegrees = ((degrees + 180) % 360) - 180;
      zRotInput.text = normalizedDegrees.toFixed(1);

      // Convert to radians and apply rotation
      const radians = (normalizedDegrees * Math.PI) / 180;
      selectedMesh.rotation = new Vector3(
        selectedMesh.rotation ? selectedMesh.rotation.x : 0,
        selectedMesh.rotation ? selectedMesh.rotation.y : 0,
        radians
      );
    };

    zRotInput.onKeyboardEventProcessedObservable.add((eventData) => {
      if (eventData.code === "Enter") {
        applyZRotationFromInput();
        zRotInput.blur();
      }
    });

    zRotationPanel.addControl(zRotInput);

    // Rotate Z right button
    const rotateZRightBtn = this.createActionButton(
      "rotateZRightBtn",
      "⟳",
      () => this.objectController.rotateMeshZ(15),
      "darkblue"
    );
    zRotationPanel.addControl(rotateZRightBtn);

    // Update rotation inputs when mesh rotation changes
    this.scene.registerBeforeRender(() => {
      if (selectedMesh && !selectedMesh.isDisposed()) {
        // Only update if not being edited
        if (!isEditingXRot && xRotInput) {
          const x = selectedMesh.rotationQuaternion
            ? ((selectedMesh.rotationQuaternion.x * 180) / Math.PI).toFixed(1)
            : selectedMesh.rotation
            ? ((selectedMesh.rotation.x * 180) / Math.PI).toFixed(1)
            : "0.0";
          xRotInput.text = x;
        }
        if (!isEditingYRot && yRotInput) {
          const y = selectedMesh.rotationQuaternion
            ? ((selectedMesh.rotationQuaternion.y * 180) / Math.PI).toFixed(1)
            : selectedMesh.rotation
            ? ((selectedMesh.rotation.y * 180) / Math.PI).toFixed(1)
            : "0.0";
          yRotInput.text = y;
        }
        if (!isEditingZRot && zRotInput) {
          const z = selectedMesh.rotationQuaternion
            ? ((selectedMesh.rotationQuaternion.z * 180) / Math.PI).toFixed(1)
            : selectedMesh.rotation
            ? ((selectedMesh.rotation.z * 180) / Math.PI).toFixed(1)
            : "0.0";
          zRotInput.text = z;
        }
      }
    });
  }

  private addScalingControls(stackPanel: StackPanel, selectedMesh: Mesh) {
    const spacer = UIComponentsFactory.createSpacing(10);
    stackPanel.addControl(spacer);
    const scalingLabel = new TextBlock("scalingLabel", "Scale");
    scalingLabel.color = "white";
    scalingLabel.fontSize = 14;
    scalingLabel.height = "20px";
    scalingLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    stackPanel.addControl(scalingLabel);

    // Add scale limits text
    const scaleLimitsText = new TextBlock(
      "scaleLimitsText",
      `Limits: ${this.objectController.minScale}x - ${this.objectController.maxScale}x`
    );
    scaleLimitsText.color = "lightgray";
    scaleLimitsText.fontSize = 10;
    scaleLimitsText.height = "15px";
    scaleLimitsText.textHorizontalAlignment =
      Control.HORIZONTAL_ALIGNMENT_CENTER;
    stackPanel.addControl(scaleLimitsText);

    const scalingPanel = new StackPanel("scalingPanel");
    scalingPanel.isVertical = false;
    scalingPanel.height = "60px";
    stackPanel.addControl(scalingPanel);

    const scaleDownBtn = this.createActionButton(
      "scaleDownBtn",
      "-",
      () => this.objectController.scaleMesh(0.9),
      "purple"
    );
    scalingPanel.addControl(scaleDownBtn);

    const scaleInput = new InputText("scaleInput", "");
    scaleInput.width = "60px";
    scaleInput.height = "30px";
    scaleInput.color = "white";
    scaleInput.background = "black";
    scaleInput.fontSize = 12;
    scaleInput.paddingLeft = "5px";
    scaleInput.paddingRight = "5px";
    scaleInput.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    scaleInput.thickness = 1;

    // Track if the input is being edited to prevent auto-updates
    let isEditing = false;

    // Set the initial text value
    if (selectedMesh) {
      scaleInput.text = selectedMesh.scaling.x.toFixed(1);
    }

    // When focusing, mark as editing and select all text
    scaleInput.onFocusObservable.add(() => {
      isEditing = true;
      console.log("Scale input focused - editing mode ON");
      // Select all text to make it easier to replace
      setTimeout(() => {
        if (scaleInput) {
          scaleInput.focus();
        }
      }, 10);
    });

    // When losing focus, apply the value and mark as not editing
    scaleInput.onBlurObservable.add(() => {
      console.log("Scale input blurred - editing mode OFF");
      applyScaleFromInput();
      isEditing = false;
    });

    // Apply scale when Enter is pressed or input loses focus
    const applyScaleFromInput = () => {
      if (!selectedMesh) return;

      // Get the current input value
      let newScale = parseFloat(scaleInput.text);
      const currentScale = selectedMesh.scaling.x;

      console.log(
        `Attempting to change scale from ${currentScale} to ${newScale}`
      );

      // Validate input
      if (isNaN(newScale)) {
        console.log("Invalid scale value - resetting");
        scaleInput.text = currentScale.toFixed(1);
        return;
      }

      // Enforce limits
      if (newScale < this.objectController.minScale) {
        console.log(
          `Scale below minimum (${this.objectController.minScale}) - clamping`
        );
        newScale = this.objectController.minScale;
        scaleInput.text = this.objectController.minScale.toString();
      } else if (newScale > this.objectController.maxScale) {
        console.log(
          `Scale above maximum (${this.objectController.maxScale}) - clamping`
        );
        newScale = this.objectController.maxScale;
        scaleInput.text = this.objectController.maxScale.toString();
      }

      // Only apply if actually changed
      if (Math.abs(newScale - currentScale) > 0.001) {
        // Use small epsilon for float comparison
        console.log(`Applying new scale: ${newScale}`);
        // Calculate scale factor needed to reach the target scale
        const scaleFactor = newScale / currentScale;
        this.objectController.scaleMesh(scaleFactor);
      }
    };

    // Handle Enter key press
    scaleInput.onKeyboardEventProcessedObservable.add((eventData) => {
      if (eventData.code === "Enter") {
        applyScaleFromInput();
        isEditing = false;
        // Remove focus after Enter is pressed
        scaleInput.blur();
      }
    });

    scalingPanel.addControl(scaleInput);
    const spacer2 = UIComponentsFactory.createSpacing(10);
    scalingPanel.addControl(spacer2);

    const scaleUpBtn = this.createActionButton(
      "scaleUpBtn",
      "+",
      () => this.objectController.scaleMesh(1.1),
      "purple"
    );
    scalingPanel.addControl(scaleUpBtn);

    // Update scale input display when scale changes - but only when not editing
    this.scene.registerBeforeRender(() => {
      if (selectedMesh && !selectedMesh.isDisposed() && scaleInput) {
        // Only update the input text if the user isn't currently editing
        if (!isEditing) {
          const scale = selectedMesh.scaling.x.toFixed(1); // Assuming uniform scaling
          scaleInput.text = scale;
        }

        // Update button states based on scale limits
        scaleDownBtn.isEnabled =
          selectedMesh.scaling.x > this.objectController.minScale;
        scaleUpBtn.isEnabled =
          selectedMesh.scaling.x < this.objectController.maxScale;

        // Visual feedback
        scaleDownBtn.color = scaleDownBtn.isEnabled ? "white" : "gray";
        scaleUpBtn.color = scaleUpBtn.isEnabled ? "white" : "gray";
      }
    });
  }

  // Modified to prevent resetting existing control points when toggling movement
  private addMovementControls(stackPanel: StackPanel, selectedMesh: Mesh) {
    // Create a container for movement controls
    const movementContainer = new StackPanel("movementContainer");
    // const movementContainer = new Rectangle("movementContainer");
    // movementContainer.height = "380px"; // Increased height for more rows
    // movementContainer.thickness = 1;
    movementContainer.color = "orange";
    movementContainer.background = "rgba(30, 30, 30, 0.5)";
    // movementContainer.cornerRadius = 5;
    // movementContainer.paddingBottom = "10px"; // Add padding for better appearance
    stackPanel.addControl(movementContainer);

    // Create stack panel for controls
    const movementStack = new StackPanel("movementStack");
    movementStack.width = "100%";
    // movementStack.height = "100%";
    movementContainer.addControl(movementStack);

    // Title for the section
    const movementTitle = new TextBlock("movementTitle", "Movement Settings");
    movementTitle.color = "white";
    movementTitle.fontSize = 14;
    movementTitle.height = "24px";
    movementTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    movementTitle.paddingTop = "5px";
    movementStack.addControl(movementTitle);

    // Add a checkbox to enable/disable movement
    const movingCheckRow = new StackPanel("movingCheckRow");
    movingCheckRow.height = "30px";
    movingCheckRow.isVertical = false;
    movingCheckRow.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    movingCheckRow.paddingLeft = "10px";
    movingCheckRow.paddingRight = "10px";
    movementStack.addControl(movingCheckRow);

    const movingCheck = new Checkbox("movingCheck");
    movingCheck.width = "20px";
    movingCheck.height = "20px";
    movingCheck.color = "orange";
    movingCheck.isChecked = false;
    movingCheckRow.addControl(movingCheck);

    const movingLabel = new TextBlock("movingLabel", "Enable Movement");
    movingLabel.color = "white";
    movingLabel.fontSize = 14;
    movingLabel.paddingLeft = "10px";
    movingLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    movingLabel.width = "150px";
    movingCheckRow.addControl(movingLabel);

    // Container for movement parameters (only visible when movement is enabled)
    const parametersContainer = new StackPanel("parametersContainer");
    // parametersContainer.thickness = 0;
    parametersContainer.background = "transparent";
    // parametersContainer.height = "370px"; /
    parametersContainer.isVisible = false;
    parametersContainer.paddingTop = "10px";
    parametersContainer.paddingBottom = "10px";
    movementStack.addControl(parametersContainer);

    const paramsStack = new StackPanel("paramsStack");
    paramsStack.width = "100%";
    parametersContainer.addControl(paramsStack);

    // Current position as starting position
    const startPosRow = new StackPanel("startPosRow");
    startPosRow.isVertical = false;
    startPosRow.height = "30px";
    startPosRow.paddingLeft = "10px";
    startPosRow.paddingRight = "10px";
    paramsStack.addControl(startPosRow);

    const startPosLabel = new TextBlock("startPosLabel", "Start Position:");
    startPosLabel.color = "white";
    startPosLabel.fontSize = 12;
    startPosLabel.width = "100px";
    startPosLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    startPosRow.addControl(startPosLabel);

    const startPosText = new TextBlock("startPosText", "Current");
    startPosText.color = "lightgreen";
    startPosText.fontSize = 12;
    startPosText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    startPosRow.addControl(startPosText);

    // End position header text
    const endPosHeaderRow = new StackPanel("endPosHeaderRow");
    endPosHeaderRow.isVertical = false;
    endPosHeaderRow.height = "25px";
    endPosHeaderRow.paddingLeft = "10px";
    endPosHeaderRow.paddingRight = "10px";
    endPosHeaderRow.paddingTop = "5px";
    paramsStack.addControl(endPosHeaderRow);

    const endPosHeader = new TextBlock("endPosHeader", "End Position:");
    endPosHeader.color = "white";
    endPosHeader.fontSize = 12;
    endPosHeader.fontWeight = "bold";
    endPosHeader.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    endPosHeaderRow.addControl(endPosHeader);

    // End position X control
    const endPosXRow = new StackPanel("endPosXRow");
    endPosXRow.isVertical = false;
    endPosXRow.height = "30px";
    endPosXRow.paddingLeft = "20px"; // Indented
    endPosXRow.paddingRight = "10px";
    paramsStack.addControl(endPosXRow);

    const endPosXLabel = new TextBlock("endPosXLabel", "X:");
    endPosXLabel.color = "white";
    endPosXLabel.fontSize = 12;
    endPosXLabel.width = "20px";
    endPosXLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    endPosXRow.addControl(endPosXLabel);

    const endPosX = new InputText("endPosX", "0.0");
    endPosX.width = "80px";
    endPosX.height = "24px";
    endPosX.color = "white";
    endPosX.background = "black";
    endPosX.fontSize = 12;
    endPosX.thickness = 1;
    endPosX.paddingLeft = "5px";
    endPosX.paddingRight = "5px";
    endPosXRow.addControl(endPosX);

    // End position Y control
    const endPosYRow = new StackPanel("endPosYRow");
    endPosYRow.isVertical = false;
    endPosYRow.height = "30px";
    endPosYRow.paddingLeft = "20px"; // Indented
    endPosYRow.paddingRight = "10px";
    paramsStack.addControl(endPosYRow);

    const endPosYLabel = new TextBlock("endPosYLabel", "Y:");
    endPosYLabel.color = "white";
    endPosYLabel.fontSize = 12;
    endPosYLabel.width = "20px";
    endPosYLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    endPosYRow.addControl(endPosYLabel);

    const endPosY = new InputText("endPosY", "0.0");
    endPosY.width = "80px";
    endPosY.height = "24px";
    endPosY.color = "white";
    endPosY.background = "black";
    endPosY.fontSize = 12;
    endPosY.thickness = 1;
    endPosY.paddingLeft = "5px";
    endPosY.paddingRight = "5px";
    endPosYRow.addControl(endPosY);

    // End position Z control
    const endPosZRow = new StackPanel("endPosZRow");
    endPosZRow.isVertical = false;
    endPosZRow.height = "30px";
    endPosZRow.paddingLeft = "20px"; // Indented
    endPosZRow.paddingRight = "10px";
    paramsStack.addControl(endPosZRow);

    const endPosZLabel = new TextBlock("endPosZLabel", "Z:");
    endPosZLabel.color = "white";
    endPosZLabel.fontSize = 12;
    endPosZLabel.width = "20px";
    endPosZLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    endPosZRow.addControl(endPosZLabel);

    const endPosZ = new InputText("endPosZ", "0.0");
    endPosZ.width = "80px";
    endPosZ.height = "24px";
    endPosZ.color = "white";
    endPosZ.background = "black";
    endPosZ.fontSize = 12;
    endPosZ.thickness = 1;
    endPosZ.paddingLeft = "5px";
    endPosZ.paddingRight = "5px";
    endPosZRow.addControl(endPosZ);

    // Speed control
    const speedRow = new StackPanel("speedRow");
    speedRow.isVertical = false;
    speedRow.height = "30px";
    speedRow.paddingLeft = "10px";
    speedRow.paddingRight = "10px";
    paramsStack.addControl(speedRow);

    const speedLabel = new TextBlock("speedLabel", "Speed:");
    speedLabel.color = "white";
    speedLabel.fontSize = 12;
    speedLabel.width = "100px";
    speedLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    speedRow.addControl(speedLabel);

    const speedInput = new InputText("speedInput", "2.0");
    speedInput.width = "60px";
    speedInput.height = "24px";
    speedInput.color = "white";
    speedInput.background = "black";
    speedInput.fontSize = 12;
    speedInput.thickness = 1;
    speedInput.paddingLeft = "5px";
    speedInput.paddingRight = "5px";
    speedRow.addControl(speedInput);

    // initialize values from mesh if available
    if (selectedMesh) {
      // Check if the mesh has movement metadata
      if (selectedMesh.metadata && selectedMesh.metadata.moving) {
        movingCheck.isChecked = true;
        parametersContainer.isVisible = true;

        // Set end position input values
        if (selectedMesh.metadata.endPos) {
          endPosX.text = selectedMesh.metadata.endPos.x.toFixed(1);
          endPosY.text = selectedMesh.metadata.endPos.y.toFixed(1);
          endPosZ.text = selectedMesh.metadata.endPos.z.toFixed(1);

          // Create path visualization
          this.objectController.createPathVisualization(
            selectedMesh.position.clone(),
            selectedMesh.metadata.endPos.clone()
          );
        }

        // Set speed input value
        if (selectedMesh.metadata.speed) {
          speedInput.text = selectedMesh.metadata.speed.toFixed(1);
        }
      }
    }

    // Function to update the path visualization with current values
    const updateVisualization = () => {
      if (
        !selectedMesh ||
        !selectedMesh.metadata ||
        !selectedMesh.metadata.moving
      ) {
        // Don't remove path visualization
        return;
      }

      const endPos = selectedMesh.metadata.endPos;
      if (!endPos) return;

      this.objectController.updatePathVisualization(
        selectedMesh.position.clone(),
        endPos,
        selectedMesh
      );
    };

    // Toggle visibility of parameters when checkbox changes
    movingCheck.onIsCheckedChangedObservable.add((isChecked) => {
      parametersContainer.isVisible = isChecked;

      if (selectedMesh) {
        // Initialize metadata if needed
        if (!selectedMesh.metadata) {
          selectedMesh.metadata = {};
        }

        // Update moving status
        selectedMesh.metadata.moving = isChecked;
        const meshId = selectedMesh.uniqueId.toString();

        // Initialize end position if not set
        if (isChecked && !selectedMesh.metadata.endPos) {
          // Default end position 10 units above current position
          const currentPos = selectedMesh.position.clone();
          const defaultEndPos = new Vector3(
            currentPos.x,
            currentPos.y + 10,
            currentPos.z
          );

          selectedMesh.metadata.endPos = defaultEndPos;
          endPosX.text = defaultEndPos.x.toFixed(1);
          endPosY.text = defaultEndPos.y.toFixed(1);
          endPosZ.text = defaultEndPos.z.toFixed(1);
        }

        // Initialize speed if not set
        if (isChecked && !selectedMesh.metadata.speed) {
          selectedMesh.metadata.speed = 2.0;
          speedInput.text = "2.0";
        }

        // Update visualization
        if (isChecked) {
          // Check if we already have control points for this mesh
          const existingControlPoints =
            this.objectController.objectControlPoints.get(meshId);
          const existingPath =
            this.objectController.objectMovementPaths.get(meshId);

          if (
            existingPath &&
            !existingPath.isDisposed() &&
            existingControlPoints
          ) {
            // Just make sure the path is visible - no need to recreate
            console.log("Path already exists - ensuring visibility");
            existingPath.isVisible = true;

            // Make sure control points are also visible
            const controlPointMeshes =
              this.objectController.controlPointMeshes.get(meshId);
            if (controlPointMeshes) {
              controlPointMeshes.forEach((mesh) => {
                if (!mesh.isDisposed()) {
                  mesh.isVisible = true;
                }
              });
            }
          } else {
            // Create new visualization
            console.log("Creating new path visualization");
            updateVisualization();
          }
        } else {
          //  Remove path visualization, movements, control points and preview
          console.log(`Disabling movement for mesh ${meshId}`);
          selectedMesh.metadata.moving = false;
          selectedMesh.metadata.endPos = null;
          selectedMesh.metadata.speed = null;

          // Remove path visualization
          this.objectController.cleanupMeshVisualization(meshId);
        }
      }
    });

    // Handle end position input changes
    const updateEndPosition = () => {
      if (!selectedMesh || !selectedMesh.metadata) return;

      const x = parseFloat(endPosX.text);
      const y = parseFloat(endPosY.text);
      const z = parseFloat(endPosZ.text);

      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        selectedMesh.metadata.endPos = new Vector3(x, y, z);

        // Update visualization
        updateVisualization();
      }
    };

    endPosX.onBlurObservable.add(updateEndPosition);
    endPosY.onBlurObservable.add(updateEndPosition);
    endPosZ.onBlurObservable.add(updateEndPosition);

    // Handle speed input changes
    speedInput.onBlurObservable.add(() => {
      if (!selectedMesh || !selectedMesh.metadata) return;

      let speed = parseFloat(speedInput.text);

      if (isNaN(speed)) {
        speed = 2.0;
        speedInput.text = "2.0";
      }

      // Clamp speed between min and max
      speed = Math.max(
        this.objectController.minSpeed,
        Math.min(speed, this.objectController.maxSpeed)
      );
      speedInput.text = speed.toFixed(1);

      selectedMesh.metadata.speed = speed;

      // Update animation speed
      updateVisualization();
    });

    // Add keypress handling for inputs
    const handleEnterKey = (input: InputText, action: () => void) => {
      input.onKeyboardEventProcessedObservable.add((eventData) => {
        if (eventData.code === "Enter") {
          action();
          input.blur();
        }
      });
    };

    handleEnterKey(endPosX, updateEndPosition);
    handleEnterKey(endPosY, updateEndPosition);
    handleEnterKey(endPosZ, updateEndPosition);
    handleEnterKey(speedInput, () => {
      if (!selectedMesh || !selectedMesh.metadata) return;

      let speed = parseFloat(speedInput.text);

      if (isNaN(speed)) {
        speed = 2.0;
        speedInput.text = "2.0";
      }

      // Clamp speed between min and max
      speed = Math.max(
        this.objectController.minSpeed,
        Math.min(speed, this.objectController.maxSpeed)
      );
      speedInput.text = speed.toFixed(1);

      selectedMesh.metadata.speed = speed;

      // Update animation speed
      updateVisualization();
    });

    // Update the UI with current position info and path visualization
    this.scene.registerBeforeRender(() => {
      if (selectedMesh) {
        const pos = selectedMesh.position;

        // Update start position display
        startPosText.text = `X:${pos.x.toFixed(1)}, Y:${pos.y.toFixed(
          1
        )}, Z:${pos.z.toFixed(1)}`;

        // Update path visualization if this object has movement enabled
        if (
          selectedMesh.metadata &&
          selectedMesh.metadata.moving &&
          selectedMesh.metadata.endPos &&
          this.objectController.pathVisualization
        ) {
          // Update the path to start from current position
          this.objectController.updatePathVisualization(
            selectedMesh.position.clone(),
            selectedMesh.metadata.endPos
          );
        }
      }
    });

    // Add a button to add control points to the path
    const addControlPointBtn = Button.CreateSimpleButton(
      "addControlPointBtn",
      "Add Control Point"
    );
    addControlPointBtn.width = "180px";
    addControlPointBtn.height = "30px";
    addControlPointBtn.color = "white";
    addControlPointBtn.background = "green";
    addControlPointBtn.cornerRadius = 5;
    addControlPointBtn.fontSize = 14;
    addControlPointBtn.hoverCursor = "pointer";
    addControlPointBtn.onPointerClickObservable.add(() => {
      if (
        selectedMesh &&
        selectedMesh.metadata &&
        selectedMesh.metadata.moving
      ) {
        const meshId = selectedMesh.uniqueId.toString();
        console.log(`Adding control point for mesh ${meshId}`);

        // Get control points
        let controlPoints =
          this.objectController.objectControlPoints.get(meshId);
        if (!controlPoints) {
          // Create default if none exist
          const startPos = selectedMesh.position.clone();
          const endPos = selectedMesh.metadata.endPos.clone();
          controlPoints = [startPos, endPos];
          this.objectController.objectControlPoints.set(meshId, controlPoints);
          console.log("Created initial control points array");
        }

        // Calculate position for new control point
        // If there are only 2 points, add in the middle
        if (controlPoints.length === 2) {
          const midPoint = Vector3.Lerp(
            controlPoints[0],
            controlPoints[1],
            0.5
          );
          // Add a Y offset to make it visible
          // midPoint.y += 5;
          this.objectController.addControlPoint(meshId, midPoint);
        } else {
          // Find the longest segment and add a point there
          let maxDist = 0;
          let insertIndex = 1;

          for (let i = 0; i < controlPoints.length - 1; i++) {
            const dist = Vector3.Distance(
              controlPoints[i],
              controlPoints[i + 1]
            );
            if (dist > maxDist) {
              maxDist = dist;
              insertIndex = i + 1;
            }
          }

          // Create new point between the two points of the longest segment
          const prevPoint = controlPoints[insertIndex - 1];
          const nextPoint = controlPoints[insertIndex];
          const newPos = Vector3.Lerp(prevPoint, nextPoint, 0.5);
          // Add a Y offset to make it visible
          // newPos.y += 3;

          // Add new point at calculated position
          this.objectController.addControlPoint(meshId, newPos, insertIndex);
        }
      }
    });

    // Also add a button to remove control points
    const removeControlPointBtn = Button.CreateSimpleButton(
      "removeControlPointBtn",
      "Remove Control Point"
    );
    removeControlPointBtn.width = "180px";
    removeControlPointBtn.height = "30px";
    removeControlPointBtn.color = "white";
    removeControlPointBtn.background = "darkred";
    removeControlPointBtn.cornerRadius = 5;
    removeControlPointBtn.fontSize = 14;
    // removeControlPointBtn.top = "5px";
    removeControlPointBtn.hoverCursor = "pointer";
    removeControlPointBtn.onPointerClickObservable.add(() => {
      if (
        this.objectController.selectedControlPoint &&
        this.objectController.selectedControlPoint.metadata &&
        !this.objectController.selectedControlPoint.metadata.isEndPoint
      ) {
        console.log("Removing selected control point");
        this.objectController.deleteControlPoint(
          this.objectController.selectedControlPoint
        );
      } else {
        console.log("No middle control point selected to remove");
      }
    });

    // Add the buttons to the parameters container
    paramsStack.addControl(addControlPointBtn);
    const spacer = UIComponentsFactory.createSpacing(10);
    paramsStack.addControl(spacer);
    paramsStack.addControl(removeControlPointBtn);

    // Add rotation animation controls after the regular movement controls
    stackPanel.addControl(UIComponentsFactory.createSpacing(10));
    this.addRotationAnimationControls(stackPanel, selectedMesh);
  }

  // Add a new method to the movement controls section
  public addRotationAnimationControls(
    stackPanel: StackPanel,
    selectedMesh: Mesh
  ) {
    // Create a container for rotation animation controls
    const rotationAnimContainer = new StackPanel("rotationAnimContainer");
    // rotationAnimContainer.height = "250px"; // Adjust based on content
    // rotationAnimContainer.thickness = 1;
    rotationAnimContainer.color = "orange";
    rotationAnimContainer.background = "rgba(30, 30, 30, 0.5)";
    // rotationAnimContainer.cornerRadius = 5;
    rotationAnimContainer.paddingBottom = "10px";
    stackPanel.addControl(rotationAnimContainer);

    // Create stack panel for controls
    const rotationStack = new StackPanel("rotationAnimStack");
    rotationStack.width = "100%";
    rotationAnimContainer.addControl(rotationStack);

    // Title for the section
    const rotationTitle = new TextBlock(
      "rotationAnimTitle",
      "Continuous Rotation"
    );
    rotationTitle.color = "white";
    rotationTitle.fontSize = 14;
    rotationTitle.height = "24px";
    rotationTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    rotationTitle.paddingTop = "5px";
    rotationStack.addControl(rotationTitle);

    // Add a checkbox to enable/disable continuous rotation
    const rotatingCheckRow = new StackPanel("rotatingCheckRow");
    rotatingCheckRow.height = "30px";
    rotatingCheckRow.isVertical = false;
    rotatingCheckRow.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    rotatingCheckRow.paddingLeft = "10px";
    rotatingCheckRow.paddingRight = "10px";
    rotationStack.addControl(rotatingCheckRow);

    const rotatingCheck = new Checkbox("rotatingCheck");
    rotatingCheck.width = "20px";
    rotatingCheck.height = "20px";
    rotatingCheck.color = "orange";
    rotatingCheck.isChecked = false;
    rotatingCheckRow.addControl(rotatingCheck);

    const rotatingLabel = new TextBlock("rotatingLabel", "Enable Rotation");
    rotatingLabel.color = "white";
    rotatingLabel.fontSize = 14;
    rotatingLabel.paddingLeft = "10px";
    rotatingLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    rotatingLabel.width = "150px";
    rotatingCheckRow.addControl(rotatingLabel);

    // Container for rotation parameters (only visible when rotation is enabled)
    const rotationParamsContainer = new StackPanel("rotationParamsContainer");
    // rotationParamsContainer.thickness = 0;
    rotationParamsContainer.background = "transparent";
    // rotationParamsContainer.height = "200px";
    rotationParamsContainer.isVisible = false;
    rotationStack.addControl(rotationParamsContainer);

    const paramsStack = new StackPanel("rotationParamsStack");
    paramsStack.width = "100%";
    rotationParamsContainer.addControl(paramsStack);

    // Add axis selection (radio buttons)
    const axisLabelRow = new StackPanel("axisLabelRow");
    axisLabelRow.isVertical = false;
    axisLabelRow.height = "30px";
    axisLabelRow.paddingLeft = "10px";
    axisLabelRow.paddingRight = "10px";
    paramsStack.addControl(axisLabelRow);

    const axisLabel = new TextBlock("axisLabel", "Rotation Axis:");
    axisLabel.color = "white";
    axisLabel.fontSize = 12;
    axisLabel.width = "100px";
    axisLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    axisLabelRow.addControl(axisLabel);

    // X-axis radio button row
    const xAxisRow = new StackPanel("xAxisRow");
    xAxisRow.isVertical = false;
    xAxisRow.height = "30px";
    xAxisRow.paddingLeft = "20px";
    xAxisRow.paddingRight = "10px";
    paramsStack.addControl(xAxisRow);

    const xAxisRadio = new Checkbox("xAxisRadio");
    xAxisRadio.width = "20px";
    xAxisRadio.height = "20px";
    xAxisRadio.color = "white";
    xAxisRadio.isChecked = false;
    xAxisRadio.thickness = 3;
    xAxisRow.addControl(xAxisRadio);

    const xAxisText = new TextBlock("xAxisText", "X-Axis");
    xAxisText.color = "white";
    xAxisText.fontSize = 12;
    xAxisText.paddingLeft = "10px";
    xAxisText.width = "120px";
    xAxisText.height = "20px";
    xAxisText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    xAxisText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER; // Ensure vertical centering
    xAxisRow.addControl(xAxisText);

    // Y-axis radio button row
    const yAxisRow = new StackPanel("yAxisRow");
    yAxisRow.isVertical = false;
    yAxisRow.height = "30px";
    yAxisRow.paddingLeft = "20px";
    yAxisRow.paddingRight = "10px";
    paramsStack.addControl(yAxisRow);

    const yAxisRadio = new Checkbox("yAxisRadio");
    yAxisRadio.width = "20px";
    yAxisRadio.height = "20px";
    yAxisRadio.color = "white";
    yAxisRadio.isChecked = true; // Default to Y-axis
    yAxisRadio.thickness = 3;
    yAxisRow.addControl(yAxisRadio);

    const yAxisText = new TextBlock("yAxisText", "Y-Axis");
    yAxisText.color = "white";
    yAxisText.fontSize = 12;
    yAxisText.paddingLeft = "10px";
    yAxisText.width = "120px";
    yAxisText.height = "20px";
    yAxisText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    yAxisText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER; // Ensure vertical centering
    yAxisRow.addControl(yAxisText);

    // Z-axis radio button row
    const zAxisRow = new StackPanel("zAxisRow");
    zAxisRow.isVertical = false;
    zAxisRow.height = "30px";
    zAxisRow.paddingLeft = "20px";
    zAxisRow.paddingRight = "10px";
    paramsStack.addControl(zAxisRow);

    const zAxisRadio = new Checkbox("zAxisRadio");
    zAxisRadio.width = "20px";
    zAxisRadio.height = "20px";
    zAxisRadio.color = "white";
    zAxisRadio.isChecked = false;
    zAxisRadio.thickness = 3;
    zAxisRow.addControl(zAxisRadio);

    const zAxisText = new TextBlock("zAxisText", "Z-Axis");
    zAxisText.color = "white";
    zAxisText.fontSize = 12;
    zAxisText.paddingLeft = "10px";
    zAxisText.width = "120px";
    zAxisText.height = "20px";
    zAxisText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    zAxisText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER; // Ensure vertical centering
    zAxisRow.addControl(zAxisText);

    // Make radio buttons act like radio buttons (only one can be selected)
    const radioButtons = [xAxisRadio, yAxisRadio, zAxisRadio];

    const updateRadioButtons = (selectedIndex: number) => {
      radioButtons.forEach((radio, index) => {
        if (index === selectedIndex) {
          radio.isChecked = true;
        } else {
          radio.isChecked = false;
        }
      });
    };

    xAxisRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (isChecked) updateRadioButtons(0);
    });

    yAxisRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (isChecked) updateRadioButtons(1);
    });

    zAxisRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (isChecked) updateRadioButtons(2);
    });

    // Speed control
    const speedRow = new StackPanel("rotationSpeedRow");
    speedRow.isVertical = false;
    speedRow.height = "30px";
    speedRow.paddingLeft = "10px";
    speedRow.paddingRight = "10px";
    speedRow.paddingTop = "10px";
    paramsStack.addControl(speedRow);

    const speedLabel = new TextBlock("rotationSpeedLabel", "Speed:");
    speedLabel.color = "white";
    speedLabel.fontSize = 12;
    speedLabel.width = "50px";
    speedLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    speedRow.addControl(speedLabel);

    const speedInput = new InputText("rotationSpeedInput", "0.01");
    speedInput.width = "70px";
    speedInput.height = "24px";
    speedInput.color = "white";
    speedInput.background = "black";
    speedInput.fontSize = 12;
    speedInput.thickness = 1;
    speedInput.paddingLeft = "5px";
    speedInput.paddingRight = "5px";
    speedRow.addControl(speedInput);

    // Direction row for clockwise/counter-clockwise
    const directionRow = new StackPanel("directionRow");
    directionRow.isVertical = false;
    directionRow.height = "40px";
    directionRow.paddingLeft = "10px";
    directionRow.paddingRight = "10px";
    directionRow.paddingTop = "10px";
    paramsStack.addControl(directionRow);

    const directionLabel = new TextBlock("directionLabel", "Direction:");
    directionLabel.color = "white";
    directionLabel.fontSize = 12;
    directionLabel.width = "70px";
    directionLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    directionRow.addControl(directionLabel);

    // Clockwise radio button
    const cwRadio = new Checkbox("cwRadio");
    cwRadio.width = "20px";
    cwRadio.height = "20px";
    cwRadio.color = "white";
    cwRadio.isChecked = true; // Default to clockwise
    cwRadio.thickness = 3;
    directionRow.addControl(cwRadio);

    const cwLabel = new TextBlock("cwLabel", "CW");
    cwLabel.color = "white";
    cwLabel.fontSize = 12;
    cwLabel.paddingLeft = "5px";
    cwLabel.paddingRight = "15px";
    cwLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    directionRow.addControl(cwLabel);

    // Counter-clockwise radio button
    const ccwRadio = new Checkbox("ccwRadio");
    ccwRadio.width = "20px";
    ccwRadio.height = "20px";
    ccwRadio.color = "white";
    ccwRadio.isChecked = false;
    ccwRadio.thickness = 3;
    directionRow.addControl(ccwRadio);

    const ccwLabel = new TextBlock("ccwLabel", "CCW");
    ccwLabel.color = "white";
    ccwLabel.fontSize = 12;
    ccwLabel.paddingLeft = "5px";
    ccwLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    directionRow.addControl(ccwLabel);

    // Make direction radio buttons mutually exclusive
    cwRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (isChecked) ccwRadio.isChecked = false;
    });

    ccwRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (isChecked) cwRadio.isChecked = false;
    });

    // Initialize values from mesh if available
    if (selectedMesh) {
      // Check if the mesh has rotation metadata
      if (selectedMesh.metadata && selectedMesh.metadata.rotating) {
        rotatingCheck.isChecked = true;
        rotationParamsContainer.isVisible = true;

        // Set axis radio button
        if (selectedMesh.metadata.rotationAxis) {
          const axis = selectedMesh.metadata.rotationAxis;
          if (axis.x === 1) updateRadioButtons(0);
          else if (axis.y === 1) updateRadioButtons(1);
          else if (axis.z === 1) updateRadioButtons(2);
        }

        // Set speed input value
        if (selectedMesh.metadata.rotationSpeed !== undefined) {
          speedInput.text = Math.abs(
            selectedMesh.metadata.rotationSpeed
          ).toFixed(4);

          // Set direction radio button
          const speed = selectedMesh.metadata.rotationSpeed;
          cwRadio.isChecked = speed > 0;
          ccwRadio.isChecked = speed < 0;
        }
      }
    }

    // Toggle visibility of parameters when checkbox changes
    rotatingCheck.onIsCheckedChangedObservable.add((isChecked) => {
      rotationParamsContainer.isVisible = isChecked;

      if (selectedMesh) {
        // Initialize metadata if needed
        if (!selectedMesh.metadata) {
          selectedMesh.metadata = {};
        }

        // Update rotation status
        selectedMesh.metadata.rotating = isChecked;

        if (isChecked) {
          // Get the selected axis
          let axis = new Vector3(0, 1, 0); // Default to Y-axis
          if (xAxisRadio.isChecked) axis = new Vector3(1, 0, 0);
          else if (zAxisRadio.isChecked) axis = new Vector3(0, 0, 1);

          // Get the speed value
          let speed = parseFloat(speedInput.text);
          if (isNaN(speed)) {
            speed = 0.01; // Default value
            speedInput.text = "0.01";
          }

          // Apply direction
          if (ccwRadio.isChecked) speed = -speed;

          // First clean up any existing rotation state
          this.objectController.removeRotationAnimation(selectedMesh);

          // Store in metadata
          selectedMesh.metadata.rotationAxis = {
            x: axis.x,
            y: axis.y,
            z: axis.z,
          };
          selectedMesh.metadata.rotationSpeed = speed;

          // Register the beforeRender observer for this mesh
          this.objectController.setupRotationAnimation(selectedMesh);
        } else {
          // Remove the rotation animation
          this.objectController.removeRotationAnimation(selectedMesh);
        }
      }
    });

    // Handle axis selection changes with proper state resetting
    xAxisRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (isChecked && selectedMesh && selectedMesh.metadata) {
        // First remove existing animation before changing axis
        this.objectController.removeRotationAnimation(selectedMesh);

        selectedMesh.metadata.rotationAxis = { x: 1, y: 0, z: 0 };

        if (selectedMesh.metadata.rotating) {
          this.objectController.setupRotationAnimation(selectedMesh);
        }
      }
    });

    yAxisRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (isChecked && selectedMesh && selectedMesh.metadata) {
        // First remove existing animation before changing axis
        this.objectController.removeRotationAnimation(selectedMesh);

        selectedMesh.metadata.rotationAxis = { x: 0, y: 1, z: 0 };

        if (selectedMesh.metadata.rotating) {
          this.objectController.setupRotationAnimation(selectedMesh);
        }
      }
    });

    zAxisRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (isChecked && selectedMesh && selectedMesh.metadata) {
        // First remove existing animation before changing axis
        this.objectController.removeRotationAnimation(selectedMesh);

        selectedMesh.metadata.rotationAxis = { x: 0, y: 0, z: 1 };

        if (selectedMesh.metadata.rotating) {
          this.objectController.setupRotationAnimation(selectedMesh);
        }
      }
    });

    // Handle speed input changes with proper state resetting
    speedInput.onBlurObservable.add(() => {
      if (!selectedMesh || !selectedMesh.metadata) return;

      let speed = parseFloat(speedInput.text);

      // Validate and clamp speed
      if (isNaN(speed)) {
        speed = 0.01;
        speedInput.text = "0.01";
      }

      // Clamp speed between min and max
      speed = Math.max(
        this.objectController.minRotationSpeed,
        Math.min(speed, this.objectController.maxRotationSpeed)
      );
      speedInput.text = speed.toFixed(4);

      // Apply direction
      if (ccwRadio.isChecked) speed = -speed;

      // First remove existing animation before changing speed
      this.objectController.removeRotationAnimation(selectedMesh);

      // Update metadata
      selectedMesh.metadata.rotationSpeed = speed;

      // Update animation
      if (selectedMesh.metadata.rotating) {
        this.objectController.setupRotationAnimation(selectedMesh);
      }
    });

    // Handle direction changes with proper state resetting
    cwRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (
        isChecked &&
        selectedMesh &&
        selectedMesh.metadata &&
        selectedMesh.metadata.rotationSpeed !== undefined
      ) {
        // First remove existing animation before changing direction
        this.objectController.removeRotationAnimation(selectedMesh);

        // Make speed positive for clockwise rotation
        selectedMesh.metadata.rotationSpeed = Math.abs(
          selectedMesh.metadata.rotationSpeed
        );

        if (selectedMesh.metadata.rotating) {
          this.objectController.setupRotationAnimation(selectedMesh);
        }
      }
    });

    ccwRadio.onIsCheckedChangedObservable.add((isChecked) => {
      if (
        isChecked &&
        selectedMesh &&
        selectedMesh.metadata &&
        selectedMesh.metadata.rotationSpeed !== undefined
      ) {
        // First remove existing animation before changing direction
        this.objectController.removeRotationAnimation(selectedMesh);

        // Make speed negative for counter-clockwise rotation
        selectedMesh.metadata.rotationSpeed = -Math.abs(
          selectedMesh.metadata.rotationSpeed
        );

        if (selectedMesh.metadata.rotating) {
          this.objectController.setupRotationAnimation(selectedMesh);
        }
      }
    });

    // Add keypress handling for speed input
    speedInput.onKeyboardEventProcessedObservable.add((eventData) => {
      if (eventData.code === "Enter") {
        // Validate and apply speed value
        if (!selectedMesh || !selectedMesh.metadata) return;

        let speed = parseFloat(speedInput.text);

        if (isNaN(speed)) {
          speed = 0.01;
          speedInput.text = "0.01";
        }

        // Clamp speed
        speed = Math.max(
          this.objectController.minRotationSpeed,
          Math.min(speed, this.objectController.maxRotationSpeed)
        );
        speedInput.text = speed.toFixed(4);

        // Apply direction
        if (ccwRadio.isChecked) speed = -speed;

        // Update metadata
        selectedMesh.metadata.rotationSpeed = speed;

        // Update animation
        if (selectedMesh.metadata.rotating) {
          this.objectController.setupRotationAnimation(selectedMesh);
        }

        speedInput.blur();
      }
    });
  }

  // Add a new method for physics properties controls
  private addPhysicsControls(stackPanel: StackPanel, selectedMesh: Mesh) {
    // Add spacing before physics controls
    // stackPanel.addControl(UIComponentsFactory.createSpacing(10));

    // Create a container for physics controls
    const physicsContainer = new StackPanel("physicsContainer");
    // physicsContainer.height = "190px"; // Height for all physics controls
    // physicsContainer.thickness = 1;
    physicsContainer.color = "orange";
    physicsContainer.background = "rgba(30, 30, 30, 0.5)";
    // physicsContainer.cornerRadius = 5;
    physicsContainer.paddingBottom = "10px";
    stackPanel.addControl(physicsContainer);

    // Create stack panel for controls
    const physicsStack = new StackPanel("physicsStack");
    physicsStack.width = "100%";
    physicsContainer.addControl(physicsStack);

    // Title for the section
    const physicsTitle = new TextBlock("physicsTitle", "Physics Properties");
    physicsTitle.color = "white";
    physicsTitle.fontSize = 14;
    physicsTitle.height = "24px";
    physicsTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    physicsTitle.paddingTop = "5px";
    physicsStack.addControl(physicsTitle);

    // Add a checkbox to enable/disable physics
    const physicsCheckRow = new StackPanel("physicsCheckRow");
    physicsCheckRow.height = "30px";
    physicsCheckRow.isVertical = false;
    physicsCheckRow.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    physicsCheckRow.paddingLeft = "10px";
    physicsCheckRow.paddingRight = "10px";
    physicsStack.addControl(physicsCheckRow);

    const physicsCheck = new Checkbox("physicsCheck");
    physicsCheck.width = "20px";
    physicsCheck.height = "20px";
    physicsCheck.color = "orange";
    physicsCheck.isChecked = selectedMesh?.metadata?.physics?.enabled || false;
    physicsCheckRow.addControl(physicsCheck);

    const physicsLabel = new TextBlock("physicsLabel", "Enable Physics");
    physicsLabel.color = "white";
    physicsLabel.fontSize = 14;
    physicsLabel.paddingLeft = "10px";
    physicsLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    physicsLabel.width = "150px";
    physicsCheckRow.addControl(physicsLabel);

    // Container for physics parameters (only visible when physics is enabled)
    const physicsParamsContainer = new StackPanel("physicsParamsContainer");
    // physicsParamsContainer.thickness = 0;
    physicsParamsContainer.background = "transparent";
    physicsParamsContainer.height = "140px";
    physicsParamsContainer.isVisible = physicsCheck.isChecked;
    physicsStack.addControl(physicsParamsContainer);

    const paramsStack = new StackPanel("physicsParamsStack");
    paramsStack.width = "100%";
    physicsParamsContainer.addControl(paramsStack);

    // Mass control
    const massRow = this.createPhysicsPropertyControl(
      selectedMesh,
      "mass",
      "Mass:",
      selectedMesh?.metadata?.physics?.mass || 0,
      this.objectController.minMass,
      this.objectController.maxMass
    );
    paramsStack.addControl(massRow);

    // Friction control
    const frictionRow = this.createPhysicsPropertyControl(
      selectedMesh,
      "friction",
      "Friction:",
      selectedMesh?.metadata?.physics?.friction || 0.2,
      this.objectController.minFriction,
      this.objectController.maxFriction
    );
    paramsStack.addControl(frictionRow);

    // Restitution control
    const restitutionRow = this.createPhysicsPropertyControl(
      selectedMesh,
      "restitution",
      "Restitution:",
      selectedMesh?.metadata?.physics?.restitution || 0.2,
      this.objectController.minRestitution,
      this.objectController.maxRestitution
    );
    paramsStack.addControl(restitutionRow);

    // Toggle visibility of parameters when checkbox changes
    physicsCheck.onIsCheckedChangedObservable.add((isChecked) => {
      physicsParamsContainer.isVisible = isChecked;

      if (selectedMesh) {
        // Initialize metadata if needed
        if (!selectedMesh.metadata) {
          selectedMesh.metadata = {};
        }

        // Initialize physics metadata if needed
        if (!selectedMesh.metadata.physics) {
          selectedMesh.metadata.physics = {
            enabled: isChecked,
            mass: 0,
            friction: 0.2,
            restitution: 0.2,
          };
        } else {
          selectedMesh.metadata.physics.enabled = isChecked;
        }
      }
    });

    // Only initially show physics controls if physics is enabled
    if (selectedMesh?.metadata?.physics?.enabled) {
      physicsParamsContainer.isVisible = true;
    }
  }

  private createPhysicsPropertyControl(
    selectedMesh: Mesh,
    property: string,
    label: string,
    initialValue: number,
    minValue: number,
    maxValue: number
  ): StackPanel {
    const row = new StackPanel(`${property}Row`);
    row.isVertical = false;
    row.height = "40px";
    row.paddingLeft = "10px";
    row.paddingRight = "10px";
    row.paddingTop = "5px";

    const nameLabel = new TextBlock(`${property}Label`, label);
    nameLabel.color = "white";
    nameLabel.fontSize = 12;
    nameLabel.width = "80px";
    nameLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(nameLabel);

    // Create input container with both slider and text input
    const inputContainer = new StackPanel(`${property}InputContainer`);
    inputContainer.isVertical = false;
    inputContainer.width = "130px";
    row.addControl(inputContainer);

    // Add input text
    const input = new InputText(`${property}Input`, initialValue.toString());
    input.width = "50px";
    input.height = "24px";
    input.color = "white";
    input.background = "black";
    input.fontSize = 12;
    input.thickness = 1;
    input.paddingLeft = "5px";
    input.paddingRight = "5px";
    inputContainer.addControl(input);

    // Track if input is being edited
    let isEditing = false;

    input.onFocusObservable.add(() => {
      isEditing = true;
    });

    input.onBlurObservable.add(() => {
      isEditing = false;
      applyValueFromInput();
    });

    // Handle enter key press
    input.onKeyboardEventProcessedObservable.add((eventData) => {
      if (eventData.code === "Enter") {
        applyValueFromInput();
        input.blur();
      }
    });

    const applyValueFromInput = () => {
      if (!selectedMesh || !selectedMesh.metadata) return;

      let value = parseFloat(input.text);

      // Validate and clamp value
      if (isNaN(value)) {
        value = initialValue;
        input.text = initialValue.toString();
      }

      // Clamp between min and max
      value = Math.max(minValue, Math.min(value, maxValue));
      input.text = value.toFixed(2);

      // Initialize physics object if not exists
      if (!selectedMesh.metadata.physics) {
        selectedMesh.metadata.physics = {
          enabled: true,
          mass: 0,
          friction: 0.2,
          restitution: 0.2,
        };
      }

      // Update the property
      selectedMesh.metadata.physics[property] = value;
    };

    return row;
  }

  private addWinConditionControls(stackPanel: StackPanel, selectedMesh: Mesh) {
    const spacer = UIComponentsFactory.createSpacing(10);
    stackPanel.addControl(spacer);

    // Create a container for win condition controls
    const winConditionContainer = new StackPanel("winConditionContainer");
    winConditionContainer.color = "orange";
    winConditionContainer.background = "rgba(30, 30, 30, 0.5)";
    winConditionContainer.paddingBottom = "10px";
    stackPanel.addControl(winConditionContainer);

    // Create stack panel for controls
    const winStack = new StackPanel("winStack");
    winStack.width = "100%";
    winConditionContainer.addControl(winStack);

    // Title for the section
    const winTitle = new TextBlock("winTitle", "Win Condition");
    winTitle.color = "white";
    winTitle.fontSize = 14;
    winTitle.height = "24px";
    winTitle.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    winTitle.paddingTop = "5px";
    winStack.addControl(winTitle);

    // Add a checkbox to enable/disable win condition
    const winCheckRow = new StackPanel("winCheckRow");
    winCheckRow.height = "30px";
    winCheckRow.isVertical = false;
    winCheckRow.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    winCheckRow.paddingLeft = "10px";
    winCheckRow.paddingRight = "10px";
    winStack.addControl(winCheckRow);

    // Debug logging to help diagnose the issue
    console.log("Selected mesh metadata:", selectedMesh?.metadata);
    console.log("Is win condition?", selectedMesh?.metadata?.isWinCondition);
    const winCheck = new Checkbox("winCheck");
    winCheck.width = "20px";
    winCheck.height = "20px";
    winCheck.color = "orange";
    winCheck.isChecked = selectedMesh?.metadata?.isWinMesh === true; // set initial state based on metadata
    winCheckRow.addControl(winCheck);

    const winLabel = new TextBlock("winLabel", "Set as win condition");
    winLabel.color = "white";
    winLabel.fontSize = 14;
    winLabel.paddingLeft = "10px";
    winLabel.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    winLabel.width = "150px";
    winLabel.height = "20px";
    winCheckRow.addControl(winLabel);

    // Win condition description
    const winDescRow = new StackPanel("winDescRow");
    winDescRow.height = "40px";
    winDescRow.paddingLeft = "10px";
    winDescRow.paddingRight = "10px";
    winStack.addControl(winDescRow);

    const winDescription = new TextBlock(
      "winDescription",
      "When player touches this object, the level is completed."
    );
    winDescription.color = "lightgray";
    winDescription.fontSize = 12;
    winDescription.textWrapping = true;
    winDescription.height = "40px";
    winDescription.width = "80%";
    winDescription.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    winDescRow.addControl(winDescription);

    // Toggle win condition when checkbox changes
    winCheck.onIsCheckedChangedObservable.add((isChecked) => {
      if (!selectedMesh) return;

      // Initialize metadata if needed
      if (!selectedMesh.metadata) {
        selectedMesh.metadata = {};
      }

      // Update the metadata to match the checkbox state
      selectedMesh.metadata.isWinCondition = isChecked;

      if (isChecked) {
        // Set this mesh as win condition
        this.objectController.setWinMesh(selectedMesh);
      } else {
        // Remove this mesh as win condition
        this.objectController.removeWinMesh();
      }
    });
  }
}
