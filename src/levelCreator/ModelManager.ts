import {
  Mesh,
  Vector3,
  Scene,
  Color3,
  StandardMaterial,
} from "@babylonjs/core";
import { AssetManagerService } from "./AssetManager";
import { ObjectController } from "./ObjectController";

export class ModelManager {
  private scene: Scene;
  private assetManager: AssetManagerService;
  private snapToGrid: boolean = false;
  private gridSize: number = 1;
  private placedMeshes: Mesh[] = [];

  constructor(scene: Scene, assetManager: AssetManagerService) {
    this.scene = scene;
    this.assetManager = assetManager;
  }

  // Create a model preview for dragging
  createModelPreview(modelId: string): Mesh | null {
    console.log(`ModelManager: Creating preview for model: ${modelId}`);

    try {
      const preview = this.assetManager.createModelPreview(modelId, this.scene);

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
    const mesh = this.assetManager.createModelInstance(
      modelId,
      position,
      this.scene,
      this.snapToGrid,
      this.gridSize
      // true,
      // 1
    );

    if (mesh) {
      // add the model ID to the mesh metadata for later reference
      // mesh.metadata.modelId = modelId;
      // mesh.metadata.type = "asset-instance";
      console.info(`ModelManager: Successfully created model ${modelId}`);
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

  // Create a basic shape at a position
  createBasicShapeAtPosition(
    meshType: string,
    position: Vector3,
    materials: { [key: string]: any }
  ): Mesh | null {
    let newMesh: Mesh;
    const timestamp = Date.now().toString();

    try {
      switch (meshType) {
        case "sphere":
          newMesh = this.createSphere(timestamp, position, materials.red);
          break;
        case "box-green":
          newMesh = this.createBox(
            timestamp,
            "green",
            position,
            materials.green
          );
          break;
        case "box-blue":
          newMesh = this.createBox(timestamp, "blue", position, materials.blue);
          break;
        case "torus":
          newMesh = this.createTorus(timestamp, position, materials.purple);
          break;
        default:
          return null;
      }

      this.placedMeshes.push(newMesh);

      // Initialize metadata if needed
      if (!newMesh.metadata) {
        newMesh.metadata = {};
      }

      // Add shape type info
      newMesh.metadata.type = meshType;

      // Add current position as initial position
      newMesh.metadata.startPos = position.clone();

      return newMesh;
    } catch (error) {
      console.error("Error creating mesh:", error);
      return null;
    }
  }

  private createSphere(
    timestamp: string,
    position: Vector3,
    material: any
  ): Mesh {
    const mesh = Mesh.CreateSphere(
      "placed-sphere-" + timestamp,
      16,
      20,
      this.scene
    );
    mesh.material = material.clone("red-mat-" + timestamp);
    this.applyPositionWithSnapping(mesh, position);
    return mesh;
  }

  private createBox(
    timestamp: string,
    colorName: string,
    position: Vector3,
    material: any
  ): Mesh {
    const mesh = Mesh.CreateBox(
      `placed-${colorName}-${timestamp}`,
      20,
      this.scene
    );
    mesh.material = material.clone(`${colorName}-mat-${timestamp}`);
    this.applyPositionWithSnapping(mesh, position);
    return mesh;
  }

  private createTorus(
    timestamp: string,
    position: Vector3,
    material: any
  ): Mesh {
    const mesh = Mesh.CreateTorus(
      "placed-torus-" + timestamp,
      15,
      5,
      32,
      this.scene
    );
    mesh.material = material.clone("purple-mat-" + timestamp);
    this.applyPositionWithSnapping(mesh, position);
    return mesh;
  }

  private applyPositionWithSnapping(mesh: Mesh, position: Vector3) {
    if (this.snapToGrid) {
      const snappedX = Math.round(position.x / this.gridSize) * this.gridSize;
      const snappedZ = Math.round(position.z / this.gridSize) * this.gridSize;
      const snappedY = Math.max(
        Math.round(position.y / this.gridSize) * this.gridSize,
        0
      );
      mesh.position = new Vector3(snappedX, snappedY, snappedZ);
    } else {
      mesh.position = new Vector3(
        position.x,
        Math.max(position.y, 0),
        position.z
      );
    }
  }

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

  /**
   * Set grid snapping
   */
  setGridSnapping(enabled: boolean, gridSize: number = 1) {
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

  /**
   * Get all placed meshes
   */
  getPlacedMeshes(): Mesh[] {
    return this.placedMeshes;
  }

  /**
   * Checks if a model with the given ID exists in the asset manager
   * @param modelId The ID of the model to check
   * @returns True if the model exists, false otherwise
   */
}
