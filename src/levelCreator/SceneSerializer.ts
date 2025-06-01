import { Mesh, Vector3, Quaternion, AssetsManager } from "@babylonjs/core";
import { AssetManagerService } from "../AssetManagerService";

// Interface to represent serialized data for a mesh
export interface SerializedMesh {
  id: string;
  type: string;
  modelId?: string;
  rootFolder?: string;
  filename?: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  scaling: {
    x: number;
    y: number;
    z: number;
  };
  isWinMesh?: boolean; // to indicate if this mesh is a win mesh
  // Additional properties for material identification
  material?: {
    name?: string;
    color?: string;
  };
  // Movement paths and control points
  movement?: {
    enabled: boolean;
    speed: number;
    endPosition: { x: number; y: number; z: number };
    controlPoints?: { x: number; y: number; z: number }[];
  };
  // Add rotation animation data
  rotation_animation?: {
    enabled: boolean;
    axis: { x: number; y: number; z: number };
    speed: number;
  };
  // Add physics properties
  physics?: {
    enabled: boolean;
    mass: number;
    friction: number;
    restitution: number;
  };
}

// Interface for the entire serialized scene
export interface SerializedScene {
  name: string;
  meshes: SerializedMesh[];
  metadata: {
    createdAt: string;
    version: string;
  };
}

export class SceneSerializer {
  static assetManager: AssetManagerService;
  //Serializes all meshes in the scene to a JSON string

  public static async serializeScene(
    meshes: Mesh[],
    sceneName: string = "MyLevel",
    assetManager: AssetManagerService
  ): Promise<string> {
    this.assetManager = assetManager;

    try {
      // Use Promise.all with map for better async handling
      const serializedMeshes: SerializedMesh[] = await Promise.all(
        meshes.map(async (mesh) => {
          return await this.serializeMeshAsync(mesh);
        })
      );

      // Create the complete scene object
      const scene: SerializedScene = {
        name: sceneName,
        meshes: serializedMeshes,
        metadata: {
          createdAt: new Date().toISOString(),
          version: "0.1.0",
        },
      };

      // Return the serialized JSON string
      return JSON.stringify(scene, null, 2);
    } catch (error) {
      console.error("Error serializing scene:", error);
      throw new Error(`Failed to serialize scene: ${error}`);
    }
  }

  // method to serialize a single mesh asynchronously
  private static async serializeMeshAsync(mesh: Mesh): Promise<SerializedMesh> {
    console.log("Serializing mesh: ", mesh.name, mesh);
    console.log("Mesh metadata: ", mesh.metadata);

    // Determine mesh type and model ID
    let type: string = "unknown";
    let modelId: string | undefined = undefined;

    // Extract from metadata first if available
    if (mesh.metadata) {
      if (mesh.metadata.type) type = mesh.metadata.type;
      if (mesh.metadata.modelId) modelId = mesh.metadata.modelId;
    }

    // If no metadata, try to determine from name
    if (type === "unknown" || !modelId) {
      // For basic shapes, check for specific patterns
      if (mesh.name.includes("sphere")) {
        type = "sphere";
      } else if (mesh.name.includes("box-green")) {
        type = "box-green";
      } else if (mesh.name.includes("box-blue")) {
        type = "box-blue";
      } else if (mesh.name.includes("torus")) {
        type = "torus";
      }

      // For models, check for model prefix
      else if (mesh.name.includes("placed-model")) {
        type = "model";

        // Try to extract model ID from the name
        // Example: placed-model-ball_teamBlue-123456
        const nameParts = mesh.name.split("-");
        if (nameParts.length >= 3) {
          // Extract the model ID part (e.g., ball_teamBlue)
          const modelIdPart = nameParts.slice(2, -1).join("-");
          if (modelIdPart) {
            modelId = modelIdPart;
          }
        }
      }
    }

    console.log(`Determined type: ${type}, modelId: ${modelId}`);

    // Create the serialized mesh object
    const serializedMesh: SerializedMesh = {
      id: mesh.id,
      type: type,
      modelId: mesh.metadata?.modelId || undefined,
      rootFolder: mesh.metadata?.rootFolder || undefined,
      filename: mesh.metadata?.fileName || undefined,
      position: {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z,
      },
      rotation: {
        x: mesh.rotationQuaternion ? mesh.rotationQuaternion.x : 0,
        y: mesh.rotationQuaternion ? mesh.rotationQuaternion.y : 0,
        z: mesh.rotationQuaternion ? mesh.rotationQuaternion.z : 0,
        w: mesh.rotationQuaternion ? mesh.rotationQuaternion.w : 1,
      },
      scaling: {
        x: mesh.scaling.x,
        y: mesh.scaling.y,
        z: mesh.scaling.z,
      },
      isWinMesh: mesh.metadata?.isWinMesh || false,
    };

    // Add material information if available
    if (mesh.material) {
      serializedMesh.material = {
        name: mesh.material.name,
      };

      // Try to extract color information for basic materials
      try {
        if ("diffuseColor" in mesh.material) {
          const color = (mesh.material as any).diffuseColor;
          if (color) {
            serializedMesh.material.color = `${color.r},${color.g},${color.b}`;
          }
        }
      } catch (e) {
        console.warn("Could not extract material color", e);
      }
    }

    // Serialize movement data if present in metadata
    if (mesh.metadata && mesh.metadata.moving === true) {
      const movementData: any = {
        enabled: true,
        speed: mesh.metadata.speed || 2.0,
        endPosition: {
          x: mesh.metadata.endPos?.x || 0,
          y: mesh.metadata.endPos?.y || 0,
          z: mesh.metadata.endPos?.z || 0,
        },
      };

      // Include control points if they exist
      if (
        mesh.metadata.controlPoints &&
        Array.isArray(mesh.metadata.controlPoints)
      ) {
        movementData.controlPoints = mesh.metadata.controlPoints.map(
          (point) => ({
            x: point.x,
            y: point.y,
            z: point.z,
          })
        );

        console.log(
          `Serialized ${movementData.controlPoints.length} control points for mesh ${mesh.name}`
        );
      }

      serializedMesh.movement = movementData;
    }

    // Serialize rotation animation data if present in metadata
    if (mesh.metadata && mesh.metadata.rotating === true) {
      const rotationAnimData: any = {
        enabled: true,
        axis: {
          x: mesh.metadata.rotationAxis?.x || 0,
          y: mesh.metadata.rotationAxis?.y || 1, // Default to Y-axis
          z: mesh.metadata.rotationAxis?.z || 0,
        },
        speed: mesh.metadata.rotationSpeed || 0.01,
      };

      serializedMesh.rotation_animation = rotationAnimData;

      console.log(`Serialized rotation animation data for mesh ${mesh.name}`);
    }

    // Serialize physics data if present in metadata
    if (
      mesh.metadata &&
      mesh.metadata.physics &&
      mesh.metadata.physics.enabled
    ) {
      const physicsData = {
        enabled: true,
        mass: mesh.metadata.physics.mass || 0,
        friction: mesh.metadata.physics.friction || 0.2,
        restitution: mesh.metadata.physics.restitution || 0.2,
      };

      serializedMesh.physics = physicsData;

      console.log(
        `Serialized physics data for mesh ${mesh.name}: mass=${physicsData.mass}, friction=${physicsData.friction}, restitution=${physicsData.restitution}`
      );
    }

    // Any asynchronous operations could happen here
    // For example, if we need to fetch additional data for the mesh

    return serializedMesh;
  }

  // Saves the serialized scene to a file
  public static saveToFile(
    serializedScene: string,
    filename: string = "level.json"
  ): void {
    const blob = new Blob([serializedScene], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // Set file download attributes
    link.href = url;
    link.download = filename;

    // Append to the body, trigger download, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Reads a file given froim the user and returns its contents as text
  public static readFromFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create a file input element
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);

      // Set up the file reader
      fileInput.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (!files || files.length === 0) {
          document.body.removeChild(fileInput);
          reject(new Error("No file selected"));
          return;
        }

        const file = files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          document.body.removeChild(fileInput);
          const content = e.target?.result as string;
          resolve(content);
        };

        // @ts-ignore
        reader.onerror = (e) => {
          document.body.removeChild(fileInput);
          reject(new Error("Error reading file"));
        };

        reader.readAsText(file);
      };

      // Trigger the file selection dialog
      fileInput.click();
    });
  }

  // Parses a serialized scene JSON string
  public static async parseSerializedScene(
    jsonString: string
  ): Promise<SerializedScene | null> {
    try {
      return (await JSON.parse(jsonString)) as SerializedScene;
    } catch (error) {
      // throw new Error(`Failed to parse scene JSON: ${error}`);
      console.error("Failed to parse scene JSON:", error);
      return null;
    }
  }
}
