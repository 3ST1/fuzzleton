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
  Environment as GameEnvironment,
  MyEnvObjsToAddPhysics,
} from "../Environnement";
import { addPhysicsAggregate } from "../App";
import { GameObject } from "./GameObject";

class Slope extends GameObject {
  metadata: { physicsAggregate: PhysicsAggregate };

  // scene: Scene; // defined in GameObject
  // environment: GameEnvironment; // defined in GameObject
  // name: string; // defined in GameObject
  width: number;
  height: number;
  depth: number;
  rotation: number;
  position: Vector3;
  material: any;
  slope: Mesh;
  // physicsAggregate: any; // defined in GameObject

  constructor(
    scene: Scene,
    environment: GameEnvironment,
    name: string = "slope",
    slopeWidth: number = 4,
    slopeHeight: number = 0.1,
    slopeDepth: number = 12,
    slopeRotation: number = -35,
    slopePosition: Vector3 = new Vector3(0, 0, 0),
    material: any = new StandardMaterial("slopeStandardMaterial", scene)
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

    this._createSlope(
      scene,
      environment,
      name,
      slopeWidth,
      slopeHeight,
      slopeDepth,
      slopeRotation,
      slopePosition,
      material
    );
  }

  private _createSlope(
    scene: Scene,
    environment: GameEnvironment,
    name: string = "slope",
    width: number = 4,
    height: number = 0.1,
    depth: number = 12,
    rotation: number = -35,
    position: Vector3 = new Vector3(0, 0, 0),
    material: any = new StandardMaterial("slopeStandardMaterial", scene)
  ): Mesh {
    this.slope = MeshBuilder.CreateBox(
      name,
      { width: width, height: height, depth: depth },
      scene
    );
    this.slope.receiveShadows = true;
    this.slope.position = position;
    this.slope.rotation.x = Tools.ToRadians(rotation);

    // Add shadows to the slope
    environment.addShadowsToMesh(this.slope);

    this.physicsAggregate = addPhysicsAggregate(
      scene,
      this.slope,
      PhysicsShapeType.BOX,
      0,
      2,
      0
    );

    // Set material
    this.slope.material = material;

    return this.slope;
  }

  public dispose() {
    this.physicsAggregate.dispose();
    this.environment.removeShadowsFromMesh(this.slope);
    this.slope.dispose();
  }
}
export { Slope };
