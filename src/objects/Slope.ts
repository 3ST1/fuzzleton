import {
  Scene,
  Vector3,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Mesh,
  StandardMaterial,
  Tools,
} from "@babylonjs/core";
import {
  GameEnvironment as GameEnvironment,
  MyEnvObjsToAddPhysics,
} from "../GameEnvironnement";
import { addPhysicsAggregate } from "../utils";
import { GameObject } from "./GameObject";

class Slope extends GameObject {
  // metadata: { physicsAggregate: PhysicsAggregate };
  width: number;
  height: number;
  depth: number;
  rotation: number;
  position: Vector3;
  material: any;
  slope: Mesh;
  shadows: boolean;
  // startPosition: Vector3; // defined in GameObject
  // endPosition: Vector3; // defined in GameObject

  constructor(
    scene: Scene,
    environment: GameEnvironment,
    name: string = "slope",
    slopeWidth: number = 4,
    slopeHeight: number = 0.1,
    slopeDepth: number = 12,
    slopeRotation: number = -35,
    slopePosition: Vector3 = new Vector3(0, 0, 0),
    material: any = new StandardMaterial("slopeStandardMaterial", scene),
    shadows: boolean = true
  ) {
    super(scene, environment, name, slopePosition);
    this.scene = scene;
    this.environment = environment;
    this.name = name;
    this.width = slopeWidth;
    this.height = slopeHeight;
    this.depth = slopeDepth;
    this.rotation = slopeRotation;
    this.position = slopePosition;
    this.material = material;
    this.shadows = shadows;

    this.slope = this._createSlope();
    this._calculateSlopePositions();
  }

  private _createSlope(): Mesh {
    const slope = MeshBuilder.CreateBox(
      this.name,
      { width: this.width, height: this.height, depth: this.depth },
      this.scene
    );
    slope.receiveShadows = true;
    slope.position = this.position;
    slope.rotation.x = Tools.ToRadians(this.rotation);

    if (this.shadows) this.environment.addShadowsToMesh(slope);
    this.physicsAggregate = addPhysicsAggregate(
      this.scene,
      slope,
      PhysicsShapeType.BOX,
      0,
      2,
      0
    );
    slope.material = this.material;

    return slope;
  }

  private _calculateSlopePositions() {
    const rotationRadians = Tools.ToRadians(this.rotation);
    const halfDepth = this.depth / 2;

    const offsetX = Math.sin(rotationRadians) * halfDepth;
    const offsetY = Math.cos(rotationRadians) * halfDepth;

    this.startPosition = new Vector3(
      this.position.x - offsetX,
      this.position.y + offsetY,
      this.position.z - halfDepth
    );

    this.endPosition = new Vector3(
      this.position.x + offsetX,
      this.position.y - offsetY,
      this.position.z + halfDepth
    );
  }

  // public dispose() {
  //   this.physicsAggregate.dispose();
  //   this.environment.removeShadowsFromMesh(this.slope);
  //   this.slope.dispose();
  // }
}

export { Slope };
