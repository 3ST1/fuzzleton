import {
  Scene,
  Vector3,
  PhysicsAggregate,
  PhysicsShapeType,
  Mesh,
  SceneLoader,
  MeshBuilder,
  Physics6DoFConstraint,
  HingeConstraint,
} from "@babylonjs/core";
import { Wall } from "../objects/Wall";
import {
  Environment as GameEnvironment,
  MyEnvObjsToAddPhysics,
} from "../Environnement";
import { addPhysicsAggregate } from "../App";
import { Stairs } from "../objects/Stairs";
import { GameObject } from "../objects/GameObject";
import { Platform } from "../objects/Platform";
import { Slope } from "../objects/Slope";
import { LevelGenerator } from "./LevelGenerator";
export interface WallProp {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

export class Level {
  scene: Scene;
  environment: GameEnvironment;
  lvlObjs: any[] = [];
  lvlGen: LevelGenerator;

  constructor(scene: Scene, environment: GameEnvironment) {
    this.scene = scene;
    this.environment = environment;
    this.lvlGen = new LevelGenerator(this.scene, this.environment);
  }

  public disposeLevel(): void {
    this.lvlObjs.forEach((obj) => {
      // dispose the object
      obj.dispose();
    });
    this.lvlObjs = [];
  }

  generateWalls(walls: WallProp[] = []): void {
    // OUTER WALLS

    this.lvlObjs.push(
      new Wall(
        this.scene,
        this.environment,
        "wall_O0",
        new Vector3(0, 0, 150),
        500,
        100,
        1
      ),
      new Wall(
        this.scene,
        this.environment,
        "wall_O1",
        new Vector3(0, 0, -150),
        500,
        100,
        1
      ),
      new Wall(
        this.scene,
        this.environment,
        "wall_O2",
        new Vector3(150, 0, 0),
        1,
        100,
        500
      ),
      new Wall(
        this.scene,
        this.environment,
        "wall_O3",
        new Vector3(-150, 0, 0),
        1,
        100,
        500
      )
    );

    // INNER WALLS
    walls.forEach((wall) => {
      new Wall(
        this.scene,
        this.environment,
        "wall_" + wall.x + "_" + wall.z,
        new Vector3(wall.x, wall.y, wall.z),
        wall.width,
        wall.height,
        wall.depth
      );
      this.lvlObjs.push(wall);
    });
  }

  public async loadAssets(): Promise<void> {
    const {
      meshes: heroMeshes,
      skeletons,
      animationGroups,
    } = await SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "blanketFort.gltf",
      this.scene
    );

    // console.log("Hero Meshes: ", heroMeshes);
    // console.log("Skeletons: ", skeletons);
    // console.log("Animation Groups: ", animationGroups);

    // Create a hero mesh
    const hero = heroMeshes[0];

    hero.name = "hero";

    hero.scaling = new Vector3(15, 15, 15);
    hero.rotate(new Vector3(0, 1, 0), Math.PI);

    hero.position = new Vector3(0, 0, 0);

    // console.log("Hero: ", hero);
    hero.getChildMeshes().forEach((m) => {
      // console.log("child mesh: ", m);
      const physicsAggregate = new PhysicsAggregate(
        m,
        PhysicsShapeType.MESH,
        { mass: 0, friction: 1, restitution: 0 },
        this.scene
      );

      this.environment.addShadowsToMesh(m as Mesh);
    });
  }

  public generateRandomObjects(nbObjs: number): void {
    this.lvlGen.generateRandomObjects(nbObjs);
  }

  public physicsPlane(): void {
    const width = 5;
    const depth = 15;
    const startPos = new Vector3(15, 0, 15); // Start higher to see behavior

    // Create base (static, non-reactive)
    const base = MeshBuilder.CreateBox(
      "balanceBase",
      { width: width, height: 2, depth: 0.5 },
      this.scene
    );
    base.position = startPos.clone();

    // Apply physics to base (static)
    const fixedMass = new PhysicsAggregate(
      base,
      PhysicsShapeType.BOX,
      { mass: 0 },
      this.scene
    );

    // Create the balancing plane
    const planeMesh = MeshBuilder.CreateBox(
      "plane",
      { width: width, height: 0.8, depth: depth },
      this.scene
    );

    // Correct plane position to be **just above** the base
    planeMesh.position = startPos.clone();
    planeMesh.position.y += 2; // 0.5 (base height) + 0.05 (half of plane height)

    // Apply physics to the plane (dynamic)
    const plane = new PhysicsAggregate(
      planeMesh,
      PhysicsShapeType.BOX,
      { mass: 100, friction: 0.5, restitution: 0 },
      this.scene
    );

    // Define hinge constraint with correct pivots
    const joint = new HingeConstraint(
      new Vector3(0, 0.9, 0), // Pivot at the **top of the base**
      new Vector3(0, -0.05, 0), // Pivot at **bottom of the plane**
      new Vector3(1, 0, 0), // X-axis rotation
      new Vector3(1, 0, 0),
      this.scene
    );

    // Attach the hinge constraint
    fixedMass.body.addConstraint(plane.body, joint);
  }

  public async initLevel(): Promise<void> {
    // this.scene.debugLayer.show();

    await this.generateWalls();
    // await this.loadAssets();

    // Generate predefined objs
    this.lvlGen.generateStairs();
    this.lvlGen.generateSlopes();
    this.lvlGen.generatePlatforms();
    this.physicsPlane();

    this.lvlObjs = this.lvlGen.getGeneratedObjects();

    console.log("Level Loaded!");
  }
}
