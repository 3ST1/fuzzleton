import {
  Mesh,
  Vector3,
  Scene,
  Color3,
  StandardMaterial,
} from "@babylonjs/core";
import { AssetManagerService } from "../AssetManagerService";
import { ObjectController } from "./ObjectController";

export class ModelManager {
  private scene: Scene;
  private assetManager: AssetManagerService;
  private snapToGrid!: boolean;
  private gridSize!: number;
  private placedMeshes: Mesh[] = [];

  constructor(
    scene: Scene,
    assetManager: AssetManagerService,
    gridSize: number,
    snapToGrid: boolean
  ) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.gridSize = gridSize;
    this.snapToGrid = snapToGrid;
  }

  // Create a model preview for dragging
  createModelPreview(modelId: string): Mesh | null {
    console.log(`ModelManager: Creating preview for model: ${modelId}`);

    try {
      // const preview = this.assetManager.createModelPreview(modelId, this.scene);
      const preview = this.assetManager.createModelPreview(modelId);

      if (!preview) {
        console.error(`ModelManager: Failed to create preview for ${modelId}`);
        return null;
      }

      // console.log(`ModelManager: Preview created successfully for ${modelId}`);

      return preview;
    } catch (error) {
      console.error(`ModelManager: Error creating preview:`, error);
      return null;
    }
  }

  // Create a model at a specific position
  createModelAtPosition(modelId: string, position: Vector3): Mesh | null {
    console.log(
      `ModelManager: Creating model ${modelId} at position: ${position}`
    );
    // set the position to the grid if snapping is enabled
    if (this.snapToGrid) {
      const snappedX = Math.round(position.x / this.gridSize) * this.gridSize;
      const snappedZ = Math.round(position.z / this.gridSize) * this.gridSize;
      const snappedY = Math.max(
        Math.round(position.y / this.gridSize) * this.gridSize,
        0
      );
      position = new Vector3(snappedX, snappedY, snappedZ);
    }

    const mesh = this.assetManager.createModelInstance(
      modelId,
      position
      // this.scene,
      // this.snapToGrid,
      // this.gridSize
      // true,
      // 1
    );

    if (mesh) {
      // add the model ID to the mesh metadata for later reference
      // mesh.metadata.modelId = modelId;
      // mesh.metadata.type = "asset-instance";
      // console.info(`ModelManager: Successfully created model ${modelId}`);
      this.placedMeshes.push(mesh);

      // Initialize metadata if needed
      if (!mesh.metadata) {
        mesh.metadata = {};
      }

      // Add model type info
      mesh.metadata.type = "model";
      mesh.metadata.modelId = modelId;

      // Add current position as initial position
      mesh.metadata.startPos = position.clone();

      return mesh;
    } else {
      console.error(`ModelManager: Failed to create model ${modelId}`);
    }

    return null;
  }

  // private applyPositionWithSnapping(mesh: Mesh, position: Vector3) {
  //   if (this.snapToGrid) {
  //     const snappedX = Math.round(position.x / this.gridSize) * this.gridSize;
  //     const snappedZ = Math.round(position.z / this.gridSize) * this.gridSize;
  //     const snappedY = Math.max(
  //       Math.round(position.y / this.gridSize) * this.gridSize,
  //       0
  //     );
  //     mesh.position = new Vector3(snappedX, snappedY, snappedZ);
  //   } else {
  //     mesh.position = new Vector3(
  //       position.x,
  //       Math.max(position.y, 0),
  //       position.z
  //     );
  //   }
  // }

  // Delete a mesh from the scene
  deleteMesh(mesh: Mesh, objectController?: ObjectController): void {
    if (!mesh || mesh.isDisposed()) return;

    // If we have access to the ObjectController, let it clean up visualizations first
    if (objectController) {
      // Get mesh ID for cleanup
      const meshId = mesh.uniqueId.toString();

      // Clean up movement paths and visualizations
      objectController.cleanupMeshVisualization(meshId);
    }

    // Check if this is a root node of a model
    const isModelRoot =
      mesh.name.includes("placed-") && mesh.name.includes("-root");

    if (isModelRoot) {
      // If it's a model root, dispose all its children too
      const childrenToDispose = [...mesh.getChildMeshes()];
      childrenToDispose.forEach((child) => {
        child.dispose();
      });
    }

    // Remove from placed meshes array
    const index = this.placedMeshes.findIndex((m) => m === mesh);
    if (index !== -1) {
      this.placedMeshes.splice(index, 1);
    }

    // Dispose the mesh
    mesh.dispose();
    console.log(`Deleted mesh: ${mesh.name}`);
  }

  // Set grid snapping (can change the grid size through this method only after construction of the
  setGridSnapping(enabled: boolean, gridSize: number) {
    this.snapToGrid = enabled;
    this.gridSize = gridSize;

    // When enabling grid snapping, snap all existing meshes to grid
    if (enabled) {
      this.placedMeshes.forEach((mesh) => {
        if (mesh && !mesh.isDisposed()) {
          mesh.position.x =
            Math.round(mesh.position.x / this.gridSize) * this.gridSize;
          mesh.position.z =
            Math.round(mesh.position.z / this.gridSize) * this.gridSize;
        }
      });
    }
  }

  //Get all placed meshes
  getPlacedMeshes(): Mesh[] {
    return this.placedMeshes;
  }
}
