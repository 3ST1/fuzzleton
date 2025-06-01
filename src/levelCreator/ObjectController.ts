import {
  AbstractMesh,
  Color3,
  HighlightLayer,
  Mesh,
  Scene,
  TransformNode,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  AnimationGroup,
  Animation,
  LinesMesh,
  Tools,
  UtilityLayerRenderer,
  PositionGizmo,
  GizmoManager,
  Curve3,
  ActionManager,
  ExecuteCodeAction,
  Quaternion,
} from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Button,
  Checkbox,
  Control,
  InputText,
  Rectangle,
  ScrollViewer,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";
import { AssetManagerService } from "../AssetManagerService";
import { selectedMeshUI } from "./selectedMeshUI";
import { LevelCreatorUI } from "./UI";

export class ObjectController {
  private scene: Scene;
  private highlightLayer: HighlightLayer;
  private selectedMesh: Mesh | AbstractMesh | TransformNode | null = null;

  private gridSize!: number;
  private snapToGrid!: boolean;
  private yAxisStep: number = 1; // moves of ones if grid size not activated
  private xzAxisStep: number = 1; // moves of ones if grid size not activated
  private onMeshDeleted: (mesh: Mesh) => void;
  private detachCameraControlForXSeconds: (seconds: number) => void;

  public minScale: number = 0.5; // Minimum scaling factor (50% of original size)
  public maxScale: number = 100; // Maximum scaling factor (100x original size)

  public minSpeed: number = 0.1;
  public maxSpeed: number = 50;

  public pathVisualization: LinesMesh | null = null;

  // Keep track of object movements
  public objectMovementPaths: Map<string, LinesMesh> = new Map();
  private objectPreviewMeshes: Map<string, Mesh> = new Map();
  private objectAnimations: Map<string, AnimationGroup> = new Map();

  // Path control points
  public objectControlPoints: Map<string, Vector3[]> = new Map();
  public controlPointMeshes: Map<string, Mesh[]> = new Map();
  public selectedControlPoint: Mesh | null = null;
  private gizmoManager: GizmoManager | null = null;

  // Rotation settings
  public minRotationSpeed: number = 0.001;
  public maxRotationSpeed: number = 0.1;
  private rotationObservers: Map<string, any> = new Map();

  // Physics settings
  public minMass: number = 0;
  public maxMass: number = 1000;
  public minFriction: number = 0;
  public maxFriction: number = 10;
  public minRestitution: number = 0;
  public maxRestitution: number = 10;

  //
  selectedMeshUI: selectedMeshUI;

  assetManager: AssetManagerService;

  // Mesh that indicate level completion when user touches it
  private winMesh: Mesh | AbstractMesh | TransformNode | null = null;

  constructor(
    scene: Scene,
    levelCreatorUI: LevelCreatorUI,
    highlightLayer: HighlightLayer,
    assetManager: AssetManagerService,
    gridSize: number,
    snapToGrid: boolean,
    onMeshDeleted: (mesh: Mesh) => void,
    detachCameraControlForXSeconds: (seconds: number) => void
  ) {
    this.scene = scene;
    this.highlightLayer = highlightLayer;
    this.assetManager = assetManager;
    this.setGridSettings(snapToGrid, gridSize);
    this.onMeshDeleted = onMeshDeleted;
    this.detachCameraControlForXSeconds = detachCameraControlForXSeconds;
    this.selectedMeshUI = new selectedMeshUI(
      scene,
      levelCreatorUI,
      this,
      detachCameraControlForXSeconds
    );

    // Initialize gizmo manager for control points
    this.gizmoManager = new GizmoManager(scene);
    this.gizmoManager.positionGizmoEnabled = true;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;
    this.gizmoManager.attachableMeshes = [];
    this.gizmoManager.usePointerToAttachGizmos = false;
  }

  // can be changed only by this method
  public setGridSettings(snapToGrid: boolean, gridSize: number) {
    this.snapToGrid = snapToGrid;
    this.gridSize = gridSize;
  }

  // MESH SELECTION OR DESELECTION

  selectMesh(
    mesh: AbstractMesh | TransformNode,
    ground: Mesh,
    gridMesh: Mesh | null
  ) {
    // Don't select ground or grid meshes
    if (mesh === ground || (gridMesh && mesh === gridMesh)) {
      return;
    }

    // Deselect any selected control point first
    if (this.selectedControlPoint) {
      console.log("Deselecting control point before selecting new mesh");
      this.gizmoManager?.attachToMesh(null);
      this.selectedControlPoint = null;
    }

    // Deselect existing mesh if necessary
    // if (this.selectedMesh && this.selectedMesh !== mesh) {
    this.deselectMesh();
    // }

    // Set as selected mesh
    this.selectedMesh = mesh;

    // Add highlight to the selected mesh or its children TO DO : DIRECTLY USE THE METHOD OF LEVELCREATOR.TS
    if (mesh) {
      // Apply highlight directly in addition to using the controller
      if (this.highlightLayer) {
        this.highlightLayer.addMesh(mesh as Mesh, Color3.Yellow());

        // Also highlight all child meshes
        mesh.getChildMeshes().forEach((childMesh) => {
          this.highlightLayer?.addMesh(childMesh as Mesh, Color3.Yellow());
        });
      }

      console.log(`Selected object here: ${mesh.name}`);
      this.selectedMeshUI.createObjectControls(this.selectedMesh as Mesh);

      // Restore path visualization and control points if this object has movement data
      if (mesh.metadata && mesh.metadata.moving && mesh.metadata.endPos) {
        const meshId = mesh.uniqueId.toString();

        // Check if path visualization already exists
        const existingPath = this.objectMovementPaths.get(meshId);

        // Only create new visualization if one doesn't exist
        if (!existingPath || existingPath.isDisposed()) {
          console.log("Restoring path visualization for selected mesh");
          this.createPathVisualization(
            mesh.position.clone(),
            mesh.metadata.endPos.clone(),
            mesh
          );
        }
      }
    }
  }

  deselectMesh(resetAllHighlights = true) {
    this.selectedMeshUI.clearAllActionTimers();
    if (resetAllHighlights) {
      this.highlightLayer.removeAllMeshes();
    }
    if (this.selectedMesh) {
      if (this.selectedMesh instanceof AbstractMesh) {
        this.highlightLayer.removeMesh(this.selectedMesh as Mesh);
      } else if (this.selectedMesh instanceof TransformNode) {
        const childMeshes = this.selectedMesh.getChildMeshes();
        childMeshes.forEach((childMesh) => {
          this.highlightLayer.removeMesh(childMesh as Mesh);
        });
      }

      // console.log(`deselected object: ${this.selectedMesh.name}`);

      // we don't remove the path visualization when deselecting
      // We want them to remain visible but we just detach gizmo from control points
      if (this.selectedControlPoint) {
        this.gizmoManager?.attachToMesh(null);
        this.selectedControlPoint = null;
      }

      this.selectedMesh = null;
      this.selectedMeshUI.hideObjectControls();
    }
  }

  public applyHighlightToMesh(
    mesh: Mesh,
    removePrevious: boolean = true
  ): void {
    if (!this.highlightLayer) return;

    try {
      // console.log("applying highlight to mesh");
      this.highlightLayer.addMesh(mesh, Color3.Yellow());

      // Also highlight all child meshes
      mesh.getChildMeshes().forEach((childMesh) => {
        // console.log("highlighting child mesh:", childMesh.name);
        this.highlightLayer?.addMesh(childMesh as Mesh, Color3.Yellow());
      });
    } catch (error) {
      console.error("Error applying highlight to mesh:", error);
    } finally {
      // if removePrevious is true remove highlight from previously selected mesh
      if (removePrevious) {
        const selectedMesh = this.getSelectedMesh();
        if (selectedMesh && selectedMesh !== mesh) {
          this.removeHighlightFromMesh(selectedMesh as Mesh);
        }
      }
    }
  }

  public removeHighlightFromMesh(mesh: Mesh): void {
    if (!this.highlightLayer || !mesh) return;

    this.highlightLayer.removeMesh(mesh);
    mesh.getChildMeshes().forEach((childMesh) => {
      this.highlightLayer?.removeMesh(childMesh as Mesh);
    });
  }

  getSelectedMesh(): Mesh | AbstractMesh | TransformNode | null {
    return this.selectedMesh;
  }

  // MESH DELETION
  deleteMesh(mesh: Mesh) {
    this.selectedMeshUI.clearAllActionTimers();
    if (!mesh || mesh.isDisposed()) return;

    // Get mesh ID for cleaning up associated visualizations
    const meshId = mesh.uniqueId.toString();

    // Clean up all movement paths, previews, animations and control points
    this.cleanupMeshVisualization(meshId);

    // if is win mesh, remove it
    if (this.winMesh && this.winMesh.uniqueId === mesh.uniqueId) {
      this.removeWinMesh();
    }

    // Check if this is a root node of a model
    const isModelRoot =
      mesh.name.includes("placed-") && mesh.name.includes("-root");

    if (isModelRoot) {
      // If it's a model root, dispose all its children too
      const childrenToDispose = [...mesh.getChildMeshes()];
      childrenToDispose.forEach((child) => {
        this.highlightLayer.removeMesh(child as Mesh);
        child.dispose();
      });
    }

    // Remove highlight
    this.highlightLayer.removeMesh(mesh);

    // Clear selected mesh reference
    if (mesh === this.selectedMesh) {
      this.selectedMesh = null;
    }

    // Call the deletion callback so the main class can update its placedMeshes array
    this.onMeshDeleted(mesh);

    // Dispose the mesh
    mesh.dispose();
    console.log(`Deleted mesh: ${mesh.name}`);
  }

  // MESH MOVEMENTS methods
  moveMeshUp() {
    if (this.selectedMesh) {
      if (this.snapToGrid) {
        const currentGridPos = Math.floor(
          this.selectedMesh.position.y / this.gridSize
        );
        const nextGridPos = currentGridPos + 1;
        this.selectedMesh.position.y = nextGridPos * this.gridSize;
      } else {
        this.selectedMesh.position.y += this.yAxisStep;
      }
    }
  }

  moveMeshDown() {
    if (this.selectedMesh) {
      if (this.snapToGrid) {
        const currentGridPos = Math.ceil(
          this.selectedMesh.position.y / this.gridSize
        );
        const nextGridPos = currentGridPos - 1;
        this.selectedMesh.position.y = Math.max(0, nextGridPos * this.gridSize);
      } else {
        this.selectedMesh.position.y = Math.max(
          0,
          this.selectedMesh.position.y - this.yAxisStep
        );
      }
    }
  }

  moveMeshLeft() {
    if (this.selectedMesh) {
      if (this.snapToGrid) {
        const currentGridPos = Math.ceil(
          this.selectedMesh.position.x / this.gridSize
        );
        const nextGridPos = currentGridPos - 1;
        this.selectedMesh.position.x = nextGridPos * this.gridSize;
      } else {
        this.selectedMesh.position.x -= this.xzAxisStep;
      }
    }
  }

  moveMeshRight() {
    if (this.selectedMesh) {
      if (this.snapToGrid) {
        const currentGridPos = Math.floor(
          this.selectedMesh.position.x / this.gridSize
        );
        const nextGridPos = currentGridPos + 1;
        this.selectedMesh.position.x = nextGridPos * this.gridSize;
      } else {
        this.selectedMesh.position.x += this.xzAxisStep;
      }
    }
  }

  moveMeshForward() {
    if (this.selectedMesh) {
      if (this.snapToGrid) {
        const currentGridPos = Math.ceil(
          this.selectedMesh.position.z / this.gridSize
        );
        const nextGridPos = currentGridPos - 1;
        this.selectedMesh.position.z = nextGridPos * this.gridSize;
      } else {
        this.selectedMesh.position.z -= this.xzAxisStep;
      }
    }
  }

  moveMeshBackward() {
    if (this.selectedMesh) {
      if (this.snapToGrid) {
        const currentGridPos = Math.floor(
          this.selectedMesh.position.z / this.gridSize
        );
        const nextGridPos = currentGridPos + 1;
        this.selectedMesh.position.z = nextGridPos * this.gridSize;
      } else {
        this.selectedMesh.position.z += this.xzAxisStep;
      }
    }
  }

  // MESH Rotation methods
  rotateMeshX(degrees: number) {
    if (this.selectedMesh) {
      const radians = (degrees * Math.PI) / 180;
      this.selectedMesh.rotate(new Vector3(1, 0, 0), radians);
    }
  }

  rotateMeshY(degrees: number) {
    if (this.selectedMesh) {
      const radians = (degrees * Math.PI) / 180;
      this.selectedMesh.rotate(new Vector3(0, 1, 0), radians);
    }
  }

  rotateMeshZ(degrees: number) {
    if (this.selectedMesh) {
      const radians = (degrees * Math.PI) / 180;
      this.selectedMesh.rotate(new Vector3(0, 0, 1), radians);
    }
  }

  // MESH Scaling methods
  scaleMesh(factor: number) {
    if (this.selectedMesh) {
      // Calculate what the new scale would be
      const currentScale = this.selectedMesh.scaling.x;
      const newScale = currentScale * factor;

      // Check if the new scale would be within limits
      if (newScale < this.minScale) {
        console.log(`Can't scale below minimum scale: ${this.minScale}`);
        // Set to minimum scale if attempting to go below
        this.selectedMesh.scaling = new Vector3(
          this.minScale,
          this.minScale,
          this.minScale
        );
        return;
      }

      if (newScale > this.maxScale) {
        console.log(`Can't scale above maximum scale: ${this.maxScale}`);
        // Set to maximum scale if attempting to go above
        this.selectedMesh.scaling = new Vector3(
          this.maxScale,
          this.maxScale,
          this.maxScale
        );
        return;
      }

      // Apply scaling if within limits
      this.selectedMesh.scaling.scaleInPlace(factor);
    }
  }

  // Improved method to add a control point at a specific position and index
  public addControlPoint(
    meshId: string,
    position: Vector3,
    insertIndex?: number
  ) {
    console.log(
      `Adding control point for mesh ${meshId} at position (${position.x}, ${position.y}, ${position.z})`
    );

    // Get existing control points
    let controlPoints = this.objectControlPoints.get(meshId);

    if (!controlPoints) {
      console.warn(`No control points array for mesh ${meshId}`);
      return;
    }

    // If insertIndex is provided, add at that index, otherwise add before the end
    if (
      insertIndex !== undefined &&
      insertIndex >= 1 &&
      insertIndex < controlPoints.length
    ) {
      // Insert at specified index
      controlPoints.splice(insertIndex, 0, position.clone());
      console.log(`Added control point at index ${insertIndex}`);
    } else if (controlPoints.length >= 2) {
      // Insert before the end point
      const insertBeforeEnd = controlPoints.length - 1;
      controlPoints.splice(insertBeforeEnd, 0, position.clone());
      console.log(`Added control point at index ${insertBeforeEnd}`);
    } else {
      console.warn("Cannot add control point - insufficient existing points");
      return;
    }

    // Find the corresponding mesh
    const targetMesh = this.findMeshById(meshId);
    if (targetMesh && targetMesh.metadata) {
      // Update the metadata to include the new control point
      targetMesh.metadata.controlPoints = controlPoints.map((p) => ({
        x: p.x,
        y: p.y,
        z: p.z,
      }));
    }

    // Recreate the control point meshes
    if (this.removeControlPointMeshes) {
      this.removeControlPointMeshes(meshId);
    }
    this.createControlPointMeshes(meshId, controlPoints);

    // Update the path
    this.updatePathFromControlPoints(meshId);
  }

  // Add method to create a visual path between start and end positions for any mesh
  public createPathVisualization(
    startPos: Vector3,
    endPos: Vector3,
    mesh?: AbstractMesh | TransformNode
  ) {
    console.log(
      `Creating path visualization from (${startPos.x}, ${startPos.y}, ${startPos.z}) to (${endPos.x}, ${endPos.y}, ${endPos.z})`
    );
    // Use the provided mesh or fall back to the selected mesh
    const targetMesh = mesh || this.selectedMesh;

    if (!targetMesh) {
      console.log("No target mesh for path visualization");
      return null;
    }

    // Generate a unique ID for this mesh's path
    const meshId = targetMesh.uniqueId.toString();
    console.log(`creating path visualization for mesh ${meshId}`);

    // Check if we already have a path for this mesh
    const existingPath = this.objectMovementPaths.get(meshId);
    const existingControlPoints = this.objectControlPoints.get(meshId);

    // If we already have a path and control points, update them instead of recreating
    if (existingPath && !existingPath.isDisposed() && existingControlPoints) {
      console.log("path viz already exists -> updating existing path");

      // Update the start and end positions in the existing control points
      existingControlPoints[0] = startPos.clone();
      if (existingControlPoints.length > 1) {
        existingControlPoints[existingControlPoints.length - 1] =
          endPos.clone();
      }

      // Update the path based on the modified control points
      this.updatePathFromControlPoints(meshId);
      return existingPath;
    }

    // Otherwise, create a new path visualization (clean slate)
    // Remove any remains of existing visualization
    this.removePathVisualization(targetMesh); // should not be necessary but just in case

    // Initialize control points
    this.objectControlPoints.set(meshId, [startPos.clone(), endPos.clone()]);
    console.log(
      "Created initial control points array with start and end points"
    );

    // Create Bezier curve or a straight line
    const controlPoints = this.objectControlPoints.get(meshId)!;
    let pathPoints = [startPos.clone(), endPos.clone()]; // Simple straight line btw the two points

    // Create the visible path
    const pathLine = MeshBuilder.CreateLines(
      `movementPath_${meshId}`,
      { points: pathPoints, updatable: true },
      this.scene
    );
    const pathMaterial = new StandardMaterial(`pathMat_${meshId}`, this.scene);
    pathMaterial.emissiveColor = Color3.Red();
    pathMaterial.alpha = 1.0;
    pathMaterial.wireframe = false;

    pathLine.material = pathMaterial;
    pathLine.isPickable = false;
    pathLine.isVisible = true;
    pathLine.renderingGroupId = 1; // Ensure it renders above other objects

    // Store the path for this mesh
    this.objectMovementPaths.set(meshId, pathLine);

    // Create control point meshes
    this.createControlPointMeshes(meshId, controlPoints);

    // Create preview mesh based on the target object
    try {
      let previewMesh: Mesh | null = null;

      // Try to create a preview based on the model ID if available
      if (targetMesh.metadata?.modelId) {
        previewMesh = this.assetManager.createModelPreview(
          targetMesh.metadata.modelId
          // this.scene
        ) as Mesh;
      }

      // If model preview creation failed, try cloning the mesh
      if (!previewMesh && targetMesh instanceof AbstractMesh) {
        previewMesh = (targetMesh as Mesh).clone(
          `movementPreview_${meshId}`,
          null
        ) as Mesh;
      }

      // If both approaches failed, create a simple box
      if (!previewMesh) {
        previewMesh = MeshBuilder.CreateBox(
          `movementPreview_${meshId}`,
          { size: 1 },
          this.scene
        );

        // Try to match the target's scaling
        if (targetMesh.scaling) {
          try {
            previewMesh.scaling = targetMesh.scaling.clone();
          } catch (error) {
            console.error("Error cloning scaling:", error);
            previewMesh.scaling = new Vector3(1, 1, 1);
          }
        }
      }

      // Apply semi-transparent appearance
      this.applyPreviewMaterial(previewMesh);

      previewMesh.position = startPos.clone();
      previewMesh.isPickable = false;
      if (!previewMesh.metadata) previewMesh.metadata = {};
      previewMesh.metadata.isDraggable = false; // Not draggable
      previewMesh.getChildMeshes().forEach((child) => {
        if (!child.metadata) child.metadata = {};
        else child.metadata = { ...child.metadata }; // we create a new object to avoid modifying the original metata (pb with clone ? )
        child.metadata.isDraggable = false;
        child.metadata.isPreviewMesh = true;
      });

      // Make the preview slightly smaller
      if (previewMesh.scaling) {
        previewMesh.scaling.scaleInPlace(0.8);
      }

      // Store the preview mesh
      this.objectPreviewMeshes.set(meshId, previewMesh);

      // Create animation for this mesh
      this.startMovementAnimation(
        pathPoints,
        targetMesh.metadata?.speed || 2.0,
        meshId,
        previewMesh
      );

      return pathLine;
    } catch (error) {
      console.error("Error creating preview mesh:", error);
      return null;
    }
  }

  // To apply semi-transparent materials to preview meshes
  private applyPreviewMaterial(mesh: Mesh) {
    if (mesh instanceof AbstractMesh) {
      // Check if it already has a material
      if (mesh.material) {
        mesh.material.alpha = 0.4;
      } else {
        const material = new StandardMaterial("previewMaterial", this.scene);
        material.diffuseColor = new Color3(0.4, 0.8, 1.0); // Light blue
        material.alpha = 0.4;
        mesh.material = material;
      }

      // Apply to child meshes as well
      mesh.getChildMeshes().forEach((child) => {
        if (child.material) {
          child.material.alpha = 0.4;
        } else {
          const childMaterial = new StandardMaterial(
            "childPreviewMaterial",
            this.scene
          );
          childMaterial.diffuseColor = new Color3(0.4, 0.8, 1.0);
          childMaterial.alpha = 0.4;
          child.material = childMaterial;
        }
      });
    }
  }

  // Create visible control points for path editing
  private createControlPointMeshes(meshId: string, controlPoints: Vector3[]) {
    // Initialize array to store control point meshes
    const pointMeshes: Mesh[] = [];

    // Create a sphere for each control point
    controlPoints.forEach((point, index) => {
      const isEndPoint = index === controlPoints.length - 1;
      const isStartPoint = index === 0;

      // Create sphere at point position
      const sphere = MeshBuilder.CreateSphere(
        `controlPoint_${meshId}_${index}`,
        {
          // end point larger and start point very small (as moving the mesh is supposed to be better )
          diameter: isStartPoint ? 0.2 : isEndPoint ? 1 : 0.8,
        },
        this.scene
      );

      // Position sphere
      sphere.position = point.clone();

      // Apply material based on point type
      const material = new StandardMaterial(
        `controlPointMat_${index}`,
        this.scene
      );
      if (index === 0) {
        // Start point - green
        material.diffuseColor = new Color3(0, 1, 0);
      } else if (index === controlPoints.length - 1) {
        // End point - red
        material.diffuseColor = new Color3(1, 0, 0);
      } else {
        // Middle control point - yellow
        material.diffuseColor = new Color3(1, 1, 0);
      }

      material.alpha = 0.9;
      sphere.material = material;

      // Store mesh data for interaction
      sphere.metadata = {
        isControlPoint: true,
        isDraggable: false, // ARE NOT DRAGGABLE WWE CAN MOVE THEM ONLY THROUGH THE GIZMO
        pointIndex: index,
        meshId: meshId,
        isEndPoint: isEndPoint,
      };

      // Make pickable only for middle points
      // sphere.isPickable = !isEndPoint; // Only middle points are directly movable
      sphere.isPickable = true; // Only middle points are directly movable

      // Add to the array
      pointMeshes.push(sphere);

      // Set up event handler for control point dragging
      sphere.actionManager = new ActionManager(this.scene);
      sphere.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
          this.selectControlPoint(sphere);
        })
      );
    });

    // Store the control point meshes
    this.controlPointMeshes.set(meshId, pointMeshes);

    return pointMeshes;
  }

  // Handle control point selection
  private selectControlPoint(pointMesh: Mesh) {
    console.log(`Selecting control point: ${pointMesh.name}`);

    // Remove gizmo from previous selection
    if (this.selectedControlPoint) {
      console.log("Detaching gizmo from previous control point");
      this.gizmoManager?.attachToMesh(null);
    }

    // Set as current selection
    this.selectedControlPoint = pointMesh;

    // Attach gizmo to this control point
    if (this.gizmoManager) {
      console.log("Attaching gizmo to new control point");
      this.gizmoManager.attachToMesh(pointMesh);
    } else {
      console.error("Gizmo manager is not initialized");
    }

    // Set up position change handlers - both for drag and for continuous updates
    if (this.gizmoManager?.gizmos.positionGizmo) {
      // Clear previous observers to avoid duplicates
      this.gizmoManager.gizmos.positionGizmo.onDragStartObservable.clear();
      this.gizmoManager.gizmos.positionGizmo.onDragObservable.clear();
      this.gizmoManager.gizmos.positionGizmo.onDragEndObservable.clear();

      // Update on drag start
      this.gizmoManager.gizmos.positionGizmo.onDragStartObservable.add(() => {
        console.log("Starting control point drag");
      });

      // Continuously update during drag for real-time feedback
      this.gizmoManager.gizmos.positionGizmo.onDragObservable.add(() => {
        const metadata = pointMesh.metadata;
        if (metadata && metadata.isControlPoint) {
          // Update the control point position in our data structure
          const controlPoints = this.objectControlPoints.get(metadata.meshId);
          if (controlPoints && metadata.pointIndex < controlPoints.length) {
            controlPoints[metadata.pointIndex] = pointMesh.position.clone();

            // Get the actual mesh that's being controlled
            const targetMesh = this.findMeshById(metadata.meshId);

            // If this is the start point (index 0), update the actual object position
            if (metadata.pointIndex === 0 && targetMesh) {
              targetMesh.position = pointMesh.position.clone();
            }

            // If this is the end point (last index), update the object's endPos in metadata
            if (
              metadata.pointIndex === controlPoints.length - 1 &&
              targetMesh &&
              targetMesh.metadata
            ) {
              targetMesh.metadata.endPos = pointMesh.position.clone();
            }

            // Update the path visualization in real-time during drag
            this.updatePathFromControlPoints(metadata.meshId);
          }
        }
      });

      // Also update when drag ends with the same logic
      this.gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(() => {
        console.log("Control point drag ended");
        const metadata = pointMesh.metadata;
        if (metadata && metadata.isControlPoint) {
          // Final update of control point position
          const controlPoints = this.objectControlPoints.get(metadata.meshId);
          if (controlPoints && metadata.pointIndex < controlPoints.length) {
            controlPoints[metadata.pointIndex] = pointMesh.position.clone();

            // Get the actual mesh that's being controlled
            const targetMesh = this.findMeshById(metadata.meshId);

            // If this is the start point (index 0), update the actual object position
            if (metadata.pointIndex === 0 && targetMesh) {
              targetMesh.position = pointMesh.position.clone();
            }

            // If this is the end point (last index), update the object's endPos in metadata
            if (
              metadata.pointIndex === controlPoints.length - 1 &&
              targetMesh &&
              targetMesh.metadata
            ) {
              targetMesh.metadata.endPos = pointMesh.position.clone();
            }

            this.updatePathFromControlPoints(metadata.meshId);
          }
        }
      });
    } else {
      console.error("Position gizmo is not available");
    }
  }

  // Add a method to deselect control points (call this from your pointerDown event handler)
  public deselectControlPoint() {
    if (this.selectedControlPoint) {
      console.log("Deselecting control point");
      this.gizmoManager?.attachToMesh(null);
      this.selectedControlPoint = null;
    }
  }

  private findMeshById(meshId: string): AbstractMesh | TransformNode | null {
    const allMeshes = this.scene.meshes;
    return (
      allMeshes.find((mesh) => mesh.uniqueId.toString() === meshId) || null
    );
  }

  // Update the path when control points change
  private updatePathFromControlPoints(meshId: string) {
    // Get target mesh using meshId
    const targetMesh = this.findMeshById(meshId);
    if (!targetMesh) {
      console.error(`Cannot find mesh with ID ${meshId} for path update`);
      return;
    }

    // Get control points
    const controlPoints = this.objectControlPoints.get(meshId);
    if (!controlPoints || controlPoints.length < 2) {
      console.error(`Insufficient control points for mesh ${meshId}`);
      return;
    }

    console.log(
      `Updating path for mesh ${meshId} with ${controlPoints.length} points:`,
      controlPoints.map(
        (p) => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`
      )
    );

    // Get current path
    let currentPath = this.objectMovementPaths.get(meshId);

    // Create new curve based on control points
    let pathPoints: Vector3[];
    if (controlPoints.length > 2) {
      // Create a smooth Bezier curve through all control points
      try {
        // see https://doc.babylonjs.com/features/featuresDeepDive/mesh/drawCurves/
        const bezierPath = Curve3.CreateCatmullRomSpline(
          controlPoints,
          60, // Increase point count for a smoother curve
          false // closed path?
        );
        pathPoints = bezierPath.getPoints();
        console.log(`Created Bezier path with ${pathPoints.length} points`);
      } catch (error) {
        console.error("Error creating Bezier curve:", error);
        // Fallback to simple point-to-point path
        pathPoints = [...controlPoints];
      }
    } else {
      // Simple straight line
      pathPoints = [controlPoints[0].clone(), controlPoints[1].clone()];
      console.log("Created simple line path with 2 points");
    }

    // Update the path visualization
    try {
      // If the current path exists, dispose it to avoid potential issues
      if (currentPath && !currentPath.isDisposed()) {
        console.log("Disposing existing path before creating a new one");
        currentPath.dispose();
      }

      // Create a completely new path line instead of updating the instance
      const pathMaterial = new StandardMaterial(
        `pathMat_${meshId}`,
        this.scene
      );
      pathMaterial.emissiveColor = Color3.Red();
      pathMaterial.alpha = 1.0; // Full opacity for better visibility
      pathMaterial.wireframe = false;

      // Create a new lines mesh
      const newPath = MeshBuilder.CreateLines(
        `movementPath_${meshId}`,
        { points: pathPoints, updatable: true },
        this.scene
      );

      // Apply material settings
      newPath.material = pathMaterial;
      newPath.isPickable = false;
      newPath.isVisible = true;
      newPath.renderingGroupId = 1; // Ensure it renders above other objects

      // Store the new path
      this.objectMovementPaths.set(meshId, newPath);

      // console.log("New path created successfully:", newPath.name);

      // Add extra visibility logging
      console.log(
        `Path visibility: ${newPath.isVisible}, alpha: ${pathMaterial.alpha}`
      );
      console.log(`Path has ${pathPoints.length} points`);
    } catch (error) {
      console.error("Error updating path:", error);
    }

    // Update the animation
    const previewMesh = this.objectPreviewMeshes.get(meshId);
    if (previewMesh && !previewMesh.isDisposed()) {
      this.startMovementAnimation(
        pathPoints,
        targetMesh.metadata?.speed || 2.0,
        meshId,
        previewMesh
      );
    } else {
      // Call our new helper method to create the preview mesh and animation
      this.createAnimatedPreviewMesh(meshId, pathPoints, targetMesh);
    }

    // Update metadata for the object to store control points
    if (targetMesh.metadata) {
      targetMesh.metadata.controlPoints = controlPoints.map((p) => ({
        x: p.x,
        y: p.y,
        z: p.z,
      }));
      console.log("Updated metadata with control points");
    }
  }

  // Method to update the path visualization with Bezier support
  public updatePathVisualization(
    startPos: Vector3,
    endPos: Vector3,
    mesh?: AbstractMesh | TransformNode
  ) {
    const targetMesh = mesh || this.selectedMesh;
    if (!targetMesh) return;

    const meshId = targetMesh.uniqueId.toString();

    // Get the control points
    let controlPoints = this.objectControlPoints.get(meshId);

    if (controlPoints) {
      // Update start and end positions in existing control points
      controlPoints[0] = startPos.clone();
      controlPoints[controlPoints.length - 1] = endPos.clone();

      // Update control point meshes positions
      const pointMeshes = this.controlPointMeshes.get(meshId);
      if (pointMeshes) {
        pointMeshes[0].position = startPos.clone();
        pointMeshes[pointMeshes.length - 1].position = endPos.clone();
      }

      // Update the path based on new control points
      this.updatePathFromControlPoints(meshId);
    } else {
      // Create new visualization if none exists
      this.createPathVisualization(startPos, endPos, targetMesh);
    }
  }

  // Modified to support animation along Bezier paths
  private startMovementAnimation(
    pathPoints: Vector3[],
    speed: number,
    meshId: string,
    previewMesh: Mesh
  ) {
    // Stop any existing animation for this mesh
    if (this.objectAnimations.has(meshId)) {
      this.objectAnimations.get(meshId)?.stop();
      this.objectAnimations.delete(meshId);
    }

    if (!previewMesh || pathPoints.length < 2) return;

    // Calculate total path length to determine duration
    let totalDistance = 0;
    for (let i = 1; i < pathPoints.length; i++) {
      totalDistance += Vector3.Distance(pathPoints[i - 1], pathPoints[i]);
    }
    const duration = totalDistance / speed;

    // Create animation
    const animationGroup = new AnimationGroup(
      `previewMotion_${meshId}`,
      this.scene
    );

    // Position animation
    const positionAnim = new Animation(
      `previewPositionAnim_${meshId}`,
      "position",
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Create keyframes for movement along the path
    const keyframes: { frame: number; value: Vector3 }[] = [];
    const segmentLength = 1 / (pathPoints.length - 1);

    // Forward movement
    for (let i = 0; i < pathPoints.length; i++) {
      keyframes.push({
        frame: i * (30 * duration * segmentLength),
        value: pathPoints[i].clone(),
      });
    }

    // Backwards movement
    for (let i = pathPoints.length - 1; i >= 0; i--) {
      keyframes.push({
        frame:
          30 * duration +
          (pathPoints.length - 1 - i) * (30 * duration * segmentLength),
        value: pathPoints[i].clone(),
      });
    }

    positionAnim.setKeys(keyframes);

    // Add animation to mesh and animation group
    animationGroup.addTargetedAnimation(positionAnim, previewMesh);

    // Start playing the animation
    animationGroup.play(true); // true = loop

    // Store the animation
    this.objectAnimations.set(meshId, animationGroup);
  }

  // Delete a control point
  public deleteControlPoint(pointMesh: Mesh) {
    if (!pointMesh.metadata || !pointMesh.metadata.isControlPoint) return;

    const metadata = pointMesh.metadata;
    const meshId = metadata.meshId;
    const pointIndex = metadata.pointIndex;

    // Can't delete start or end point
    if (metadata.isEndPoint) return;

    // Get control points
    const controlPoints = this.objectControlPoints.get(meshId);
    if (!controlPoints) return;

    // Remove this point
    controlPoints.splice(pointIndex, 1);

    // Recreate the control point meshes and update the path
    this.removeControlPointMeshes(meshId);
    this.createControlPointMeshes(meshId, controlPoints);
    this.updatePathFromControlPoints(meshId);
  }

  // Remove control point meshes for a specific path
  private removeControlPointMeshes(meshId: string) {
    const pointMeshes = this.controlPointMeshes.get(meshId);
    if (pointMeshes) {
      // Detach gizmo if needed
      if (
        this.selectedControlPoint &&
        pointMeshes.includes(this.selectedControlPoint)
      ) {
        this.selectedControlPoint = null;
        this.gizmoManager?.attachToMesh(null);
      }

      // Dispose each point mesh
      pointMeshes.forEach((mesh) => {
        if (mesh && !mesh.isDisposed()) {
          mesh.dispose();
        }
      });

      // Remove from map
      this.controlPointMeshes.delete(meshId);
    }
  }

  // Clean up visualization components for a mesh
  public cleanupMeshVisualization(meshId: string) {
    // Stop animation
    if (this.objectAnimations.has(meshId)) {
      this.objectAnimations.get(meshId)?.stop();
      this.objectAnimations.delete(meshId);
    }

    // Dispose path
    if (this.objectMovementPaths.has(meshId)) {
      this.objectMovementPaths.get(meshId)?.dispose();
      this.objectMovementPaths.delete(meshId);
    }

    // Dispose preview mesh
    if (this.objectPreviewMeshes.has(meshId)) {
      this.objectPreviewMeshes.get(meshId)?.dispose();
      this.objectPreviewMeshes.delete(meshId);
    }

    // Remove control points data
    this.objectControlPoints.delete(meshId);

    // Remove control point meshes
    this.removeControlPointMeshes(meshId);

    // Clean up rotation animation
    const mesh = this.findMeshById(meshId);
    if (mesh) {
      this.removeRotationAnimation(mesh);
    }
  }

  // Clean up all visualizations
  private removeAllPathVisualizations() {
    // Clear all animations
    this.objectAnimations.forEach((animation) => {
      animation.stop();
    });
    this.objectAnimations.clear();

    // Dispose all paths
    this.objectMovementPaths.forEach((path) => {
      path.dispose();
    });
    this.objectMovementPaths.clear();

    // Dispose all preview meshes
    this.objectPreviewMeshes.forEach((mesh) => {
      mesh.dispose();
    });
    this.objectPreviewMeshes.clear();
  }

  // Remove path visualization for a specific mesh
  private removePathVisualization(mesh?: AbstractMesh | TransformNode) {
    if (!mesh) {
      // If no mesh provided, clean up the currently selected mesh's visualization
      if (this.selectedMesh) {
        const selectedId = this.selectedMesh.uniqueId.toString();
        this.cleanupMeshVisualization(selectedId);
      }
      return;
    }

    // Clean up the specified mesh's visualization
    const meshId = mesh.uniqueId.toString();
    this.cleanupMeshVisualization(meshId);
  }

  // to create path visualization for a loaded mesh
  public createPathVisualizationForMesh(mesh: AbstractMesh | TransformNode) {
    if (!mesh || !mesh.metadata) {
      console.warn(
        "Cannot create path visualization: mesh or metadata is missing"
      );
      return;
    }

    // Check if mesh has movement data
    if (!mesh.metadata.moving || !mesh.metadata.endPos) {
      console.warn(
        "Cannot create path visualization: mesh is not configured for movement"
      );
      return;
    }

    const meshId = mesh.uniqueId.toString();

    // Get start and end positions
    const startPos = mesh.position.clone();
    const endPos = new Vector3(
      mesh.metadata.endPos.x,
      mesh.metadata.endPos.y,
      mesh.metadata.endPos.z
    );

    console.log(
      `Creating path visualization for loaded mesh ${mesh.name} with ID ${meshId}`
    );

    // Clean up any existing path visualizations for this mesh
    this.cleanupMeshVisualization(meshId);

    // If we have control points, use them
    if (
      mesh.metadata.controlPoints &&
      mesh.metadata.controlPoints.length >= 2
    ) {
      // Convert control points to Vector3 objects
      const controlPoints = mesh.metadata.controlPoints.map(
        (point: any) => new Vector3(point.x, point.y, point.z)
      );

      // Store the control points
      this.objectControlPoints.set(meshId, controlPoints);

      console.log(
        `Restored ${controlPoints.length} control points for mesh ${meshId}`
      );

      // Create the path visualization with all control points
      this.updatePathFromControlPoints(meshId);

      // Make sure to create the control point meshes if they don't exist
      if (
        !this.controlPointMeshes.has(meshId) ||
        this.controlPointMeshes.get(meshId)?.length !== controlPoints.length
      ) {
        console.log(
          `Creating ${controlPoints.length} control point meshes for mesh ${meshId}`
        );
        this.removeControlPointMeshes(meshId);
        this.createControlPointMeshes(meshId, controlPoints);
      }

      // Ensure the preview mesh is showing the proper animation along the path
      const previewMesh = this.objectPreviewMeshes.get(meshId);
      if (!previewMesh || previewMesh.isDisposed()) {
        console.log(`Recreating preview mesh for animation for mesh ${meshId}`);
        // Get path points for proper animation
        let pathPoints: Vector3[];
        if (controlPoints.length > 2) {
          try {
            const curvedPath = Curve3.CreateCatmullRomSpline(
              controlPoints,
              60,
              false
            );
            pathPoints = curvedPath.getPoints();
          } catch (error) {
            console.error("Error creating Bezier curve:", error);
            pathPoints = [...controlPoints];
          }
        } else {
          pathPoints = [startPos.clone(), endPos.clone()];
        }

        // Force recreation of preview mesh and animation
        this.createAnimatedPreviewMesh(meshId, pathPoints, mesh);
      }
    } else {
      // Create a basic path with just start and end points
      console.log(
        `Creating basic path with only start/end points for mesh ${meshId}`
      );
      this.createPathVisualization(startPos, endPos, mesh);
    }

    // If this mesh has rotation animation enabled, setup the animation
    if (mesh.metadata && mesh.metadata.rotating === true) {
      this.setupRotationAnimation(mesh);
    }
  }

  // to create a preview mesh and animation
  private createAnimatedPreviewMesh(
    meshId: string,
    pathPoints: Vector3[],
    targetMesh: AbstractMesh | TransformNode
  ) {
    // Create a new preview mesh since one doesn't exist
    let newPreviewMesh: Mesh | null = null;

    try {
      // Try to create a preview based on the model ID if available
      if (targetMesh.metadata?.modelId) {
        console.log(
          `Creating preview from modelId: ${targetMesh.metadata.modelId}`
        );
        newPreviewMesh = this.assetManager.createModelPreview(
          targetMesh.metadata.modelId
          // this.scene
        ) as Mesh;
      }

      // If model preview creation failed, try cloning the mesh
      if (!newPreviewMesh && targetMesh instanceof AbstractMesh) {
        console.log("Creating preview by cloning target mesh");
        newPreviewMesh = (targetMesh as Mesh).clone(
          `movementPreview_${meshId}`,
          null
        ) as Mesh;
      }

      // If both approaches failed create a simple box
      if (!newPreviewMesh) {
        console.log("Creating simple box preview mesh");
        newPreviewMesh = MeshBuilder.CreateBox(
          `movementPreview_${meshId}`,
          { size: 1 },
          this.scene
        );

        // Try to match the target's scaling
        if (targetMesh.scaling) {
          try {
            newPreviewMesh.scaling = targetMesh.scaling.clone();
          } catch (error) {
            console.error("Error cloning scaling:", error);
            newPreviewMesh.scaling = new Vector3(1, 1, 1);
          }
        }
      }

      // Apply semi-transparent appearance
      this.applyPreviewMaterial(newPreviewMesh);

      // Position at the start of the path
      newPreviewMesh.position = pathPoints[0].clone();
      newPreviewMesh.isPickable = false;

      // set preview as not draggable
      if (!newPreviewMesh.metadata) newPreviewMesh.metadata = {};
      newPreviewMesh.metadata.isDraggable = false; // Not draggable
      newPreviewMesh.getChildMeshes().forEach((child) => {
        if (!child.metadata) child.metadata = {};
        else child.metadata = { ...child.metadata }; // we create a new object to avoid modifying the original metata (pb with clone ? )
        child.metadata.isDraggable = false;
        child.metadata.isPreviewMesh = true;
      });

      // Make the preview slightly smaller
      // if (newPreviewMesh.scaling) {
      //   newPreviewMesh.scaling.scaleInPlace(0.8);
      // }

      // Store the new preview mesh
      this.objectPreviewMeshes.set(meshId, newPreviewMesh);

      // Start the animation with the new preview mesh
      this.startMovementAnimation(
        pathPoints,
        targetMesh.metadata?.speed || 2.0,
        meshId,
        newPreviewMesh
      );

      return newPreviewMesh;
    } catch (error) {
      console.error(`Failed to create preview mesh for ${meshId}:`, error);
      return null;
    }
  }

  // methods for rotation animation management
  public setupRotationAnimation(mesh: AbstractMesh | TransformNode): void {
    if (!mesh || !mesh.metadata || !mesh.metadata.rotating) return;

    // First remove any existing animation to avoid duplicates
    this.removeRotationAnimation(mesh);

    const meshId = mesh.uniqueId.toString();

    // Get rotation parameters from metadata
    const axis = new Vector3(
      mesh.metadata.rotationAxis.x,
      mesh.metadata.rotationAxis.y,
      mesh.metadata.rotationAxis.z
    );
    const speed = mesh.metadata.rotationSpeed;

    // Create the rotation observer
    const observer = this.scene.onBeforeRenderObservable.add(() => {
      if (mesh && !mesh.isDisposed()) {
        mesh.rotate(axis, speed);
      } else {
        // If mesh was disposed, remove this observer
        this.removeRotationAnimation(mesh);
      }
    });

    // Store the observer reference for later removal
    this.rotationObservers.set(meshId, observer);

    console.log(
      `Set up rotation animation for mesh ${meshId} with speed ${speed} on axis (${axis.x}, ${axis.y}, ${axis.z})`
    );
  }

  public removeRotationAnimation(mesh: AbstractMesh | TransformNode): void {
    if (!mesh) return;

    const meshId = mesh.uniqueId.toString();

    if (this.rotationObservers.has(meshId)) {
      const observer = this.rotationObservers.get(meshId);
      if (observer !== undefined) {
        // Remove the observer directly
        this.scene.onBeforeRenderObservable.remove(observer);
        this.rotationObservers.delete(meshId);
        console.log(`Removed rotation animation for mesh ${meshId}`);
      }
    }
  }

  private updateRotationAnimation(mesh: AbstractMesh | TransformNode): void {
    if (!mesh || !mesh.metadata || !mesh.metadata.rotating) return;
    // Simply re-setup the animation - this will remove any existing one first
    this.setupRotationAnimation(mesh);
  }

  public applyMeshProperties(mesh: Mesh, meshData: any): void {
    // console.log(`Successfully created mesh: ${mesh.name}`);

    // Set properties from saved data
    mesh.scaling = new Vector3(
      meshData.scaling.x,
      meshData.scaling.y,
      meshData.scaling.z
    );

    // Set rotation if available
    if (meshData.rotation) {
      mesh.rotationQuaternion = new Quaternion(
        meshData.rotation.x,
        meshData.rotation.y,
        meshData.rotation.z,
        meshData.rotation.w
      );
    }

    // Initialize metadata if needed
    if (!mesh.metadata) {
      mesh.metadata = {};
    }

    // Apply movement data if available
    this.applyMovementData(mesh, meshData);

    // Apply rotation animation data if available
    this.applyRotationAnimationData(mesh, meshData);

    // Apply physics properties if available
    this.applyPhysicsData(mesh, meshData);

    // Apply if is a win mesh
    if (meshData.isWinMesh) {
      this.setWinMesh(mesh);
    }

    // Apply additional metadata from the saved data
    if (meshData.metadata) {
      // Preserve existing metadata and add any missing properties
      Object.keys(meshData.metadata).forEach((key) => {
        if (key !== "type" && key !== "modelId") {
          // Skip these as they're already set
          mesh.metadata[key] = meshData.metadata[key];
        }
      });
    }
  }

  private applyMovementData(mesh: Mesh, meshData: any): void {
    if (!meshData.movement || !meshData.movement.enabled) {
      return;
    }

    mesh.metadata.moving = true;
    mesh.metadata.speed = meshData.movement.speed || 2.0;

    // Create the end position Vector3
    mesh.metadata.endPos = new Vector3(
      meshData.movement.endPosition.x,
      meshData.movement.endPosition.y,
      meshData.movement.endPosition.z
    );

    // If control points are provided, add them to the metadata
    if (
      meshData.movement.controlPoints &&
      meshData.movement.controlPoints.length > 0
    ) {
      mesh.metadata.controlPoints = meshData.movement.controlPoints.map(
        (point: any) => ({
          x: point.x,
          y: point.y,
          z: point.z,
        })
      );

      console.log(
        `Loaded ${mesh.metadata.controlPoints.length} control points for mesh ${mesh.name}`
      );
    }

    // Create the path visualization when loading the scene
    setTimeout(() => {
      if (mesh) {
        // Ensure path visualization is created
        this.createPathVisualizationForMesh(mesh);
      }
    }, 500); // Small delay to ensure mesh is fully initialized
  }

  private applyRotationAnimationData(mesh: Mesh, meshData: any): void {
    if (!meshData.rotation_animation || !meshData.rotation_animation.enabled) {
      return;
    }

    // Reset any existing rotation animation first
    this.removeRotationAnimation(mesh);

    mesh.metadata.rotating = true;

    // Create the rotation axis Vector3
    mesh.metadata.rotationAxis = {
      x: meshData.rotation_animation.axis.x,
      y: meshData.rotation_animation.axis.y,
      z: meshData.rotation_animation.axis.z,
    };

    // Set rotation speed
    mesh.metadata.rotationSpeed = meshData.rotation_animation.speed || 0.01;

    console.log(`Loaded rotation animation data for mesh ${mesh.name}`);

    // Setup the rotation animation (with a small delay to ensure mesh is ready)
    setTimeout(() => {
      if (mesh && !mesh.isDisposed()) {
        this.setupRotationAnimation(mesh);
      }
    }, 500);
  }

  private applyPhysicsData(mesh: Mesh, meshData: any): void {
    if (!meshData.physics || !meshData.physics.enabled) {
      return;
    }

    mesh.metadata.physics = {
      enabled: true,
      mass: meshData.physics.mass || 0,
      friction: meshData.physics.friction || 0.2,
      restitution: meshData.physics.restitution || 0.2,
    };

    console.log(
      `Loaded physics data for mesh ${mesh.name}: mass=${mesh.metadata.physics.mass}, friction=${mesh.metadata.physics.friction}, restitution=${mesh.metadata.physics.restitution}`
    );
  }

  dispose() {
    // Deselect any selected mesh
    this.deselectMesh();

    // Clean up all path visualizations
    this.removeAllPathVisualizations();

    // Dispose all control point meshes
    this.controlPointMeshes.forEach((meshes) => {
      meshes.forEach((mesh) => {
        if (mesh && !mesh.isDisposed()) {
          mesh.dispose();
        }
      });
    });
    this.controlPointMeshes.clear();

    // Clear all maps
    this.objectControlPoints.clear();
    this.objectMovementPaths.clear();
    this.objectPreviewMeshes.clear();
    this.objectAnimations.clear();
    this.rotationObservers.clear();

    // Dispose gizmo manager if it exists
    if (this.gizmoManager) {
      this.gizmoManager.dispose();
      this.gizmoManager = null;
    }

    console.log("ObjectController disposed");
  }

  setWinMesh(mesh: AbstractMesh | TransformNode) {
    if (!mesh) {
      console.error("Cannot set win mesh: mesh is null or undefined");
      return;
    }
    this.removeWinMesh(); // first we remove any existing win mesh

    if (!mesh.metadata) mesh.metadata = {};
    mesh.metadata.isWinMesh = true; // Mark as win mesh
    this.winMesh = mesh;
    console.log(`Win mesh set to: ${mesh}`);
  }

  getWinMesh() {
    return this.winMesh;
  }

  removeWinMesh() {
    if (this.winMesh) {
      this.winMesh.metadata.isWinMesh = false; // Unmark as win mesh
      console.log(`Removing win mesh: ${this.winMesh.metadata}`);
      this.winMesh = null;
      console.log("Win mesh removed : win");
    } else {
      console.warn("No win mesh to remove");
    }
  }
}
