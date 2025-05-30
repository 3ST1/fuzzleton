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
import { GameEnvironment as GameEnvironment } from "../GameEnvironnement";
import { addPhysicsAggregate } from "../utils";
import { GameObject } from "./GameObject";

class Stairs extends GameObject {
  // startPosition: Vector3; // defined in GameObject
  // endPosition: Vector3; // defined in GameObject
  nbSteps: number;
  stepWidth: number;
  stepHeight: number;
  stepDepth: number;
  material: any;
  // name: string; // defined in GameObject
  // scene: Scene; // defined in GameObject
  // environment: GameEnvironment; // defined in GameObject
  steps: [Mesh, PhysicsAggregate][] = [];
  rotation: number;
  shadows: boolean;
  constructor(
    scene: Scene,
    environment: GameEnvironment,
    name: string = "stairs",
    startPosition: Vector3 = new Vector3(0, 0, 0),
    rotation: number = 0,
    nbSteps: number = 10,
    stepWidth: number = 4,
    stepHeight: number = 0.5,
    stepDepth: number = 2,
    material: any = new StandardMaterial("stairsStandardMaterial", scene),
    shadows: boolean = true
  ) {
    super(scene, environment, name, startPosition);
    this.name = name;
    this.scene = scene;
    this.environment = environment;
    this.startPosition = startPosition;
    this.rotation = rotation;
    this.endPosition = new Vector3(
      startPosition.x,
      startPosition.y + nbSteps * stepHeight,
      startPosition.z + nbSteps * stepDepth
    );
    this.nbSteps = nbSteps;
    this.stepWidth = stepWidth;
    this.stepHeight = stepHeight;
    this.stepDepth = stepDepth;
    this.material = material;
    this.shadows = shadows;

    this._createStairs(
      scene,
      environment,
      this.name,
      this.startPosition,
      this.rotation,
      this.nbSteps,
      this.stepWidth,
      this.stepHeight,
      this.stepDepth,
      this.material,
      this.shadows
    );
  }

  private _createStairs(
    scene: Scene,
    environment: GameEnvironment,
    stairName: string = "stairs",
    startPosition: Vector3 = new Vector3(0, 0, 0),
    // @ts-ignore
    rotation: number = 0,
    nbSteps: number = 10,
    stepWidth: number = 4,
    stepHeight: number = 0.5,
    stepDepth: number = 2,
    material: any = new StandardMaterial("stairsStandardMaterial", scene),
    shadows: boolean = true
  ): Mesh[] {
    this.steps = [];

    for (let i = 0; i < nbSteps; i++) {
      // Calculate the position of each step based on the starting position
      const stepPosition = new Vector3(
        startPosition.x,
        startPosition.y + i * stepHeight,
        startPosition.z + i * stepDepth
      );

      const step = MeshBuilder.CreateBox(
        stairName + "-step_" + i,
        { width: stepWidth, height: stepHeight, depth: stepDepth },
        scene
      );
      step.position = stepPosition;

      // rotate the step
      // step.rotation.y = Tools.ToRadians(rotation);

      step.receiveShadows = true;
      if (shadows) environment.addShadowsToMesh(step);

      const physicsAggregate = addPhysicsAggregate(
        scene,
        step,
        PhysicsShapeType.BOX,
        0,
        2,
        0
      );
      // Set material for each step
      step.material = material;
      // Track the step for later (dispose, etc)
      this.steps.push([step, physicsAggregate]);
    }

    // return the steps meshes
    return this.steps.map((step) => step[0]);
  }

  public dispose() {
    // (physics aggregate must be disposed first manually)
    // see Level.disposeLevel (stair is considered as an obj there)
    this.steps.forEach((step) => {
      step[1].dispose();
      this.environment.removeShadowsFromMesh(step[0]);
      step[0].dispose();
    });
  }
}
export { Stairs };
