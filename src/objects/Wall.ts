import {
  Scene,
  Vector3,
  MeshBuilder,
  PhysicsImpostor,
  PhysicsAggregate,
  PhysicsShapeType,
  Mesh,
} from "@babylonjs/core";
import { GameObject } from "./GameObject";
import { GameEnvironment as GameEnvironment } from "../GameEnvironnement";

class Wall extends GameObject {
  wall!: Mesh;
  height: number;
  width: number;
  depth: number;
  constructor(
    scene: Scene,
    environment: GameEnvironment,
    name: string = "wall",
    pos: Vector3,
    width: number,
    height: number,
    depth: number
  ) {
    super(scene, environment, name, pos);
    this.scene = scene;
    this.environment = environment;
    this.name = name;
    this.startPosition = pos;
    this.height = height;
    this.width = width;
    this.depth = depth;

    this._createWall(scene, environment, name, pos, width, height, depth);
  }

  private _createWall(
    scene: Scene,
    environment: GameEnvironment,
    name: string,
    pos: Vector3,
    width: number,
    height: number,
    depth: number
  ) {
    // Create the wall as a box mesh
    this.wall = MeshBuilder.CreateBox(
      name,
      { width: width, height: height, depth: depth },
      scene
    );
    this.wall.position = pos;

    // Add physics impostor to the wall for collision handling
    this.physicsAggregate = new PhysicsAggregate(
      this.wall,
      PhysicsShapeType.BOX,
      { mass: 0, friction: 1, restitution: 0 },
      scene
    );

    // Add the wall shadows
    environment.addShadowsToMesh(this.wall);
  }

  // public dispose() {
  //   this.physicsAggregate.dispose();
  //   this.wall.dispose();
  // }
}

export { Wall };
