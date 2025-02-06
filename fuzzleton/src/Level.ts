import {
  Scene,
  Vector3,
  Texture,
  CubeTexture,
  StandardMaterial,
  MeshBuilder,
  Color3,
  PhysicsAggregate,
  PhysicsShapeType,
  TransformNode,
  Mesh,
  PBRMaterial,
  Tools,
  Color4,
  PhysicsMotionType,
  PhysicsBody,
  Scalar,
  Ray,
  GroundMesh,
  SpotLight,
  SceneLoader,
  SimplificationType,
} from "@babylonjs/core";
import { Wall } from "./objects/Wall";
import {
  Environment as GameEnvironment,
  MyEnvObjsToAddPhysics,
} from "./Environnement";
import { addPhysicsAggregate } from "./App";
import { Stair } from "./objects/Stairs";
import { GameObject } from "./objects/GameObject";
import { Platform } from "./objects/Platform";
import { Slope } from "./objects/Slope";

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

  constructor(scene: Scene, environment: GameEnvironment) {
    this.scene = scene;
    this.environment = environment;
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

  generateStairs(): void {
    // this.createStairs("stairs1", new Vector3(0, 0, 0), 10, 4, 0.5, 2);
    // let endPos = this.createStairs(
    //   "stairs2",
    //   new Vector3(50, 0, 20),
    //   10,
    //   4,
    //   0.5,
    //   2
    // );
    // // Add +10 to z position for the next stairs
    // // endPos.z += 8;
    // // endPos.x += 4;
    // // endPos.y + 1;
    const s1 = new Stair(
      this.scene,
      this.environment,
      "stairs0",
      new Vector3(50, 0, 20),
      10,
      4,
      0.5,
      2
    );

    const s2 = new Stair(
      this.scene,
      this.environment,
      "stairs1",
      s1.endPosition.clone(),
      10,
      4,
      0.5,
      2
    );

    const s3 = new Stair(
      this.scene,
      this.environment,
      "stairs2",
      s2.endPosition.clone(),
      10,
      4,
      0.5,
      2
    );

    this.lvlObjs.push(s1, s2, s3);
  }

  generatePlatforms(): void {
    const p1 = new Platform(
      this.scene,
      this.environment,
      "platform1",
      12,
      0.1,
      12,
      true,
      new Vector3(10, 0, 40),
      new Vector3(10, 40, 10),
      3
    );

    const p2 = new Platform(
      this.scene,
      this.environment,
      "platform2",
      12,
      0.1,
      12,
      true,
      new Vector3(20, 0, 20),
      new Vector3(40, 10, 40),
      3
    );

    this.lvlObjs.push(p1);
  }

  generateSlopes(): void {
    // // Create slopes
    // this.createSlope("slope1", 4, 0.1, 12, -35, new Vector3(0, 0, 50));
    // this.createSlope("slope2", 4, 0.1, 12, 35, new Vector3(0, 0, -50));
    // this.createSlope("slope3", 4, 0.1, 25, 55, new Vector3(50, 0, 0));
    // // endPos.y += 0.5;
    const s1 = new Slope(
      this.scene,
      this.environment,
      "slope1",
      4,
      0.1,
      12,
      -35,
      new Vector3(0, 0, 50)
    );

    const s2 = new Slope(
      this.scene,
      this.environment,
      "slope2",
      4,
      0.1,
      12,
      35,
      new Vector3(0, 0, -50)
    );

    const s3 = new Slope(
      this.scene,
      this.environment,
      "slope3",
      4,
      0.1,
      25,
      55,
      new Vector3(50, 0, 0)
    );

    this.lvlObjs.push(s1, s2, s3);
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

    console.log("Hero Meshes: ", heroMeshes);
    console.log("Skeletons: ", skeletons);
    console.log("Animation Groups: ", animationGroups);

    // Create a hero mesh
    const hero = heroMeshes[0];

    // set name
    hero.name = "hero";

    // scale
    hero.scaling = new Vector3(15, 15, 15);
    hero.rotate(new Vector3(0, 1, 0), Math.PI);

    // Set the hero position
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

    // Add the wall shadows
  }

  public async initLevel(): Promise<void> {
    await this.generateWalls();
    await this.generateStairs();
    await this.generatePlatforms();
    await this.generateSlopes();
    await this.loadAssets();

    console.log("Level Loaded!");
  }
}
