import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
  LinesMesh,
  AbstractMesh,
  AssetContainer,
} from "@babylonjs/core";

export class MeshUtils {
  // cerate a basic ground
  static createGround(scene: Scene, size: number = 500): Mesh {
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new Color3(0.6, 0.8, 0.9);

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: size, height: size, subdivisions: size },
      scene
    );
    ground.material = groundMaterial;
    ground.position.y = 0;

    return ground;
  }

  //Create a grid visualization for the scene
  static createGridMesh(scene: Scene, gridSize: number = 1): LinesMesh {
    const size = 1000;
    const gridLines: Vector3[][] = [];
    const step = gridSize;
    const halfSize = size / 2;

    // Create grid lines along X axis
    for (let i = -halfSize; i <= halfSize; i += step) {
      gridLines.push([
        new Vector3(i, 0.1, -halfSize),
        new Vector3(i, 0.1, halfSize),
      ]);
    }

    // Create grid lines along Z axis
    for (let i = -halfSize; i <= halfSize; i += step) {
      gridLines.push([
        new Vector3(-halfSize, 0.1, i),
        new Vector3(halfSize, 0.1, i),
      ]);
    }

    // Create the grid mesh
    const gridMesh = MeshBuilder.CreateLineSystem(
      "gridMesh",
      { lines: gridLines },
      scene
    );

    // Set grid material
    const gridMat = new StandardMaterial("gridMat", scene);
    gridMat.emissiveColor = new Color3(0.5, 0.5, 0.5);
    gridMat.alpha = 0.5;
    gridMesh.material = gridMat;

    // Initially hidden
    gridMesh.isVisible = false;

    return gridMesh;
  }
}
