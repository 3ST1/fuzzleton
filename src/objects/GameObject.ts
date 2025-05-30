import {
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { getRandomColor, getRandomColorMaterial } from "../utils";
import { GameEnvironment as GameEnvironment } from "../GameEnvironnement";
import { addPhysicsAggregate } from "../utils";

class GameObject {
  obj: any; // probably a Mesh
  scene: Scene;
  environment: GameEnvironment;
  startPosition: Vector3;
  physicsAggregate!: PhysicsAggregate;
  name: string;
  endPosition: Vector3;
  constructor(
    scene: Scene,
    environment: GameEnvironment,
    name: string = "GameObject",
    // @ts-ignore
    startPos: Vector3 = null,
    // @ts-ignore
    endPos: Vector3 = null,
    createRandomObj: boolean = false
  ) {
    this.scene = scene;
    this.environment = environment;
    this.name = name;
    this.startPosition = startPos;
    if (startPos !== null && endPos === null) {
      this.endPosition = startPos;
    } else {
      this.endPosition = endPos;
    }
    if (createRandomObj) {
      this._createRandomObjects(scene);
    }
  }

  private _createRandomObjects(scene: Scene) {
    const key = Math.floor(Math.random() * 6 + 1);
    const size = Math.random() * 2 + 0.5;
    switch (key) {
      case 1:
        this.obj = MeshBuilder.CreateSphere(
          "PhysicsShapeType.SPHERE",
          { diameter: size },
          scene
        );
        break;
      case 2:
        this.obj = MeshBuilder.CreateCapsule(
          "PhysicsShapeType.CAPSULE",
          { height: size, radius: size / 6 },
          scene
        );
        break;
      case 3:
        this.obj = MeshBuilder.CreateCylinder(
          "PhysicsShapeType.CYLINDER",
          { diameter: size, height: size },
          scene
        );
        break;
      case 4:
        this.obj = MeshBuilder.CreateTorus(
          "PhysicsShapeType.BOX",
          { diameter: size, thickness: size / 3 },
          scene
        );
        break;
      case 5:
        this.obj = MeshBuilder.CreateTiledBox(
          "PhysicsShapeType.BOX ",
          { width: size, height: size, depth: size },
          scene
        );
        break;
      case 6:
        this.obj = MeshBuilder.CreateBox(
          "PhysicsShapeType.BOX",
          { size: size },
          scene
        );
    }
    // material random color
    const [randomColor, num] = getRandomColor();
    const material = new StandardMaterial("material_" + num, scene);
    material.diffuseColor = randomColor;
    this.obj.material = material;

    // random position
    if (this.startPosition === null) {
      this.obj.position = new Vector3(
        Math.random() * 50 - 5,
        Math.random() * 50 - 5,
        Math.random() * 50 - 5
      );
    }

    // add physics
    this.physicsAggregate = addPhysicsAggregate(
      this.scene,
      this.obj,
      PhysicsShapeType.BOX,
      5,
      0.5,
      0.8
    );

    // add shadow
    this.environment.addShadowsToMesh(this.obj); // SHADOW BUGS
    //   this.environment.bisShadowGenerators.addShadowCaster(obj); // TO RESOLVE WHY SHADOWS ARE LAGGING
  }

  public getStartPosition() {
    return this.startPosition;
  }

  public getEndPosition() {
    return this.endPosition;
  }

  // public dispose() {
  //   try {
  //     this.obj.dispose();
  //     this.physicsAggregate.dispose();
  //   } catch (e) {
  //     console.error("Error disposing object (in GameObject)", e, this.obj);
  //   }
  // }
}

export { GameObject };
