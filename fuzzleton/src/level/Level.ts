import {
  Scene,
  Vector3,
  PhysicsAggregate,
  PhysicsShapeType,
  Mesh,
  SceneLoader,
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

  public async initLevel(): Promise<void> {
    await this.generateWalls();
    await this.loadAssets();

    // Generate predefined objs
    this.lvlGen.generateStairs();
    this.lvlGen.generateSlopes();
    this.lvlGen.generatePlatforms();

    this.lvlObjs = this.lvlGen.getGeneratedObjects();

    console.log("Level Loaded!");
  }
}
