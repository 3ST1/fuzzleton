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
  Texture,
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

    const textureLink = "/api/assets/textures/woodPlanks.jpg"; // https://mycould.tristan-patout.fr/api/fuzzelton/assets/textures/woodPlanks.jpg
    const groundTexture = new Texture(textureLink, scene);
    groundTexture.uScale = 100;
    groundTexture.vScale = 100;

    ground.material = new StandardMaterial("groundMaterial", scene);
    const groundMat = ground.material as StandardMaterial;
    groundMat.diffuseTexture = groundTexture;

    // no light reflection
    groundMat.specularColor = new Color3(0.1, 0.1, 0.1); // almost no reflection
    groundMat.specularPower = 64; // low for a less brillant

    ground.receiveShadows = true;

    return ground;
  }

  //Create a grid visualization for the scene
  static createGridMesh(scene: Scene, gridSize: number): LinesMesh {
    const size = 1000;
    const gridLines: Vector3[][] = [];
    const step = gridSize;
    const halfSize = size / 2;

    // grid lines along X axis
    for (let i = -halfSize; i <= halfSize; i += step) {
      gridLines.push([
        new Vector3(i, 0.1, -halfSize),
        new Vector3(i, 0.1, halfSize),
      ]);
    }

    // grid lines along Z axis
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

    // initially hidden
    gridMesh.isVisible = false;

    return gridMesh;
  }
}
