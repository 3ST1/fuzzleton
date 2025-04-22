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
  StandardMaterial,
  Color3,
  PhysicsMotionType,
} from "@babylonjs/core";
import { Wall } from "../objects/Wall";
import {
  GameEnvironment as GameEnvironment,
  MyEnvObjsToAddPhysics,
} from "../GameEnvironnement";
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

  public async loadBlanketFort(): Promise<void> {
    const {
      meshes: heroMeshes,
      skeletons,
      animationGroups,
    } = await SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "blanketFort.glb",
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

  async loadModels(
    basePath: string,
    modelFiles: string[],
    postion = new Vector3(0, 0, 0)
  ): Promise<void> {
    let postionStart = postion;
    for (let i = 0; i < modelFiles.length; i++) {
      const file = modelFiles[i];
      // const filePath = basePath + file;
      try {
        const {
          meshes: heroMeshes,
          skeletons,
          animationGroups,
        } = await SceneLoader.ImportMeshAsync("", "/kaykit/", file, this.scene);

        // Get the root node, which may have child meshes
        const rootNode = heroMeshes[0];

        // Check if the root node has children (real meshes with geometry)
        const childMeshes = rootNode.getChildMeshes();

        // Find the first child mesh with valid vertices
        const hero = childMeshes.find((mesh) => mesh.getTotalVertices() > 0);

        let height = 0; // Default height
        if (!hero) {
          console.error("No valid mesh found with vertices!");
        } else {
          hero.refreshBoundingInfo({});
          const boundingBox = hero.getBoundingInfo().boundingBox;
          height = boundingBox.maximum.y - boundingBox.minimum.y;

          console.log("Hero height:", height);
        }

        // hero.scaling = new Vector3(15, 15, 15);
        // hero.rotate(new Vector3(0, 1, 0), Math.PI);

        // Calculate the bottom of the mesh to place it on the ground
        // const boundingInfo = rootNode.getBoundingInfo();
        // const objectHeight = boundingInfo.boundingBox.extendSize.y * 2; // Total height

        // Grid positioning logic with proper comments
        postionStart.x += 5; // Move to next column
        if (i % 5 === 0 && i !== 0) {
          postionStart.x = 0; // Reset to first column
          postionStart.z += 5; // Move to next row
        }
        rootNode.position.x = postionStart.x;
        rootNode.position.z = postionStart.z;
        // console.log("position: ", postionStart);
        console.log("object :", hero);
        rootNode.position.y = height / 2; // Position at ground level

        // console.log("Hero: ", hero);
        if (childMeshes.length > 0) {
          childMeshes.forEach((m) => {
            const physicsAggregate = new PhysicsAggregate(
              m,
              PhysicsShapeType.MESH,
              { mass: 0, friction: 1, restitution: 0 },
              this.scene
            );

            this.environment.addShadowsToMesh(m as Mesh);
            this.lvlObjs.push(m);
          });
        } else {
          console.warn(`No child meshes found for ${file}`);
        }
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }
  }

  private async loadAssetsKit(): Promise<void> {
    // const p = "KayKit Mini-Game Variety Pack 1.2/Models/gltf";
    const p = "kaykit";

    const modelFiles = [
      "arrow_teamBlue.gltf.glb",
      "arrow_teamRed.gltf.glb",
      "arrow_teamYellow.gltf.glb",
      "ball.gltf.glb",
      "ball_teamBlue.gltf.glb",
      "ball_teamRed.gltf.glb",
      "ball_teamYellow.gltf.glb",
      "barrierFloor.gltf.glb",
      "barrierLadder.gltf.glb",
      "barrierLarge.gltf.glb",
      "barrierMedium.gltf.glb",
      "barrierSmall.gltf.glb",
      "barrierStrut.gltf.glb",
      "blaster_teamBlue.gltf.glb",
      "blaster_teamRed.gltf.glb",
      "blaster_teamYellow.gltf.glb",
      "bomb_teamBlue.gltf.glb",
      "bomb_teamRed.gltf.glb",
      "bomb_teamYellow.gltf.glb",
      "bow_teamBlue.gltf.glb",
      "bow_teamRed.gltf.glb",
      "bow_teamYellow.gltf.glb",
      "button_teamBlue.gltf.glb",
      "button_teamRed.gltf.glb",
      "button_teamYellow.gltf.glb",
      "characer_duck.gltf.glb",
      "character_bear.gltf.glb",
      "character_dog.gltf.glb",
      "detail_desert.gltf.glb",
      "detail_forest.gltf.glb",
      "diamond_teamBlue.gltf.glb",
      "diamond_teamRed.gltf.glb",
      "diamond_teamYellow.gltf.glb",
      "flag_teamBlue.gltf.glb",
      "flag_teamRed.gltf.glb",
      "flag_teamYellow.gltf.glb",
      "gateLargeWide_teamBlue.gltf.glb",
      "gateLargeWide_teamRed.gltf.glb",
      "gateLargeWide_teamYellow.gltf.glb",
      "gateLarge_teamBlue.gltf.glb",
      "gateLarge_teamRed.gltf.glb",
      "gateLarge_teamYellow.gltf.glb",
      "gateSmallWide_teamBlue.gltf.glb",
      "gateSmallWide_teamRed.gltf.glb",
      "gateSmallWide_teamYellow.gltf.glb",
      "gateSmall_teamBlue.gltf.glb",
      "gateSmall_teamRed.gltf.glb",
      "gateSmall_teamYellow.gltf.glb",
      "heart_teamBlue.gltf.glb",
      "heart_teamRed.gltf.glb",
      "heart_teamYellow.gltf.glb",
      "hoop_teamBlue.gltf.glb",
      "hoop_teamRed.gltf.glb",
      "hoop_teamYellow.gltf.glb",
      "lightning.gltf.glb",
      "plantA_desert.gltf.glb",
      "plantA_forest.gltf.glb",
      "plantB_desert.gltf.glb",
      "plantB_forest.gltf.glb",
      "powerupBlock_teamBlue.gltf.glb",
      "powerupBlock_teamRed.gltf.glb",
      "powerupBlock_teamYellow.gltf.glb",
      "powerupBomb.gltf.glb",
      "ring_teamBlue.gltf.glb",
      "ring_teamRed.gltf.glb",
      "ring_teamYellow.gltf.glb",
      "rocksA_desert.gltf.glb",
      "rocksA_forest.gltf.glb",
      "rocksB_desert.gltf.glb",
      "rocksB_forest.gltf.glb",
      "slingshot_teamBlue.gltf.glb",
      "slingshot_teamRed.gltf.glb",
      "slingshot_teamYellow.gltf.glb",
      "spikeRoller.gltf.glb",
      "star.gltf.glb",
      "swiperDouble_teamBlue.gltf.glb",
      "swiperDouble_teamRed.gltf.glb",
      "swiperDouble_teamYellow.gltf.glb",
      "swiperLong_teamBlue.gltf.glb",
      "swiperLong_teamRed.gltf.glb",
      "swiperLong_teamYellow.gltf.glb",
      "swiper_teamBlue.gltf.glb",
      "swiper_teamRed.gltf.glb",
      "swiper_teamYellow.gltf.glb",
      "sword_teamBlue.gltf.glb",
      "sword_teamRed.gltf.glb",
      "sword_teamYellow.gltf.glb",
      "target.gltf.glb",
      "targetStand.gltf.glb",
      "tileHigh_desert.gltf.glb",
      "tileHigh_forest.gltf.glb",
      "tileHigh_teamBlue.gltf.glb",
      "tileHigh_teamRed.gltf.glb",
      "tileHigh_teamYellow.gltf.glb",
      "tileLarge_desert.gltf.glb",
      "tileLarge_forest.gltf.glb",
      "tileLarge_teamBlue.gltf.glb",
      "tileLarge_teamRed.gltf.glb",
      "tileLarge_teamYellow.gltf.glb",
      "tileLow_desert.gltf.glb",
      "tileLow_forest.gltf.glb",
      "tileLow_teamBlue.gltf.glb",
      "tileLow_teamRed.gltf.glb",
      "tileLow_teamYellow.gltf.glb",
      "tileMedium_desert.gltf.glb",
      "tileMedium_forest.gltf.glb",
      "tileMedium_teamBlue.gltf.glb",
      "tileMedium_teamRed.gltf.glb",
      "tileMedium_teamYellow.gltf.glb",
      "tileSlopeLowHigh_desert.gltf.glb",
      "tileSlopeLowHigh_forest.gltf.glb",
      "tileSlopeLowHigh_teamBlue.gltf.glb",
      "tileSlopeLowHigh_teamRed.gltf.glb",
      "tileSlopeLowHigh_teamYellow.gltf.glb",
      "tileSlopeLowMedium_teamRed.gltf.glb",
      "tileSlopeLowMedium_desert.gltf.glb",
      "tileSlopeLowMedium_forest.gltf.glb",
      "tileSlopeLowMedium_teamBlue.gltf.glb",
      "tileSlopeLowMedium_teamYellow.gltf.glb",
      "tileSlopeMediumHigh_desert.gltf.glb",
      "tileSlopeMediumHigh_forest.gltf.glb",
      "tileSlopeMediumHigh_teamBlue.gltf.glb",
      "tileSlopeMediumHigh_teamRed.gltf.glb",
      "tileSlopeMediumHigh_teamYellow.gltf.glb",
      "tileSmall_desert.gltf.glb",
      "tileSmall_forest.gltf.glb",
      "tileSmall_teamBlue.gltf.glb",
      "tileSmall_teamRed.gltf.glb",
      "tileSmall_teamYellow.gltf.glb",
      "tree_desert.gltf.glb",
      "tree_forest.gltf.glb",
    ];

    // the 5 first models
    // const modelsToLoad = modelFiles.slice(0, 5);
    this.loadModels(p, modelFiles).then(() => {
      console.log("Models loaded successfully!");
    });
  }

  private async spikeRoller(): Promise<void> {
    const { meshes: heroMeshes } = await SceneLoader.ImportMeshAsync(
      "",
      "/kaykit/",
      "spikeRoller.gltf.glb",
      this.scene
    );

    const hero = heroMeshes[0];
    hero.name = "spikeRoller";
    hero.scaling = new Vector3(3, 3, 3);
    hero.position = new Vector3(0, 0, 0);

    // Handle child meshes if any
    const childMeshes = hero.getChildMeshes();
    if (childMeshes.length > 0) {
      childMeshes.forEach((m) => {
        const physicsAggregate = new PhysicsAggregate(
          m,
          PhysicsShapeType.MESH,
          { mass: 0, friction: 0, restitution: 5 },
          this.scene
        );

        // important for the physicsAggregate to rotate with the mesh m
        physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
        physicsAggregate.body.disablePreStep = false;

        this.environment.addShadowsToMesh(m as Mesh);
        this.lvlObjs.push(m);

        this.scene.registerBeforeRender(() => {
          m.rotate(new Vector3(0, 1, 0), 0.01);
        });
      });
    } else {
      console.warn(`No child meshes found for ${hero.name}`);
    }
  }

  public async loadPillow(
    color: Color3 = new Color3(1, 1, 1) // Default color (light red)
  ): Promise<void> {
    const {
      meshes: heroMeshes,
      skeletons,
      animationGroups,
    } = await SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "pillow.glb",
      this.scene
    );

    // Get the root node, which may have child meshes
    const rootNode = heroMeshes[0];

    rootNode.name = "pillow";
    rootNode.scaling = new Vector3(4, 4, 4);
    rootNode.position = new Vector3(-20, 0, -20);

    // Check if the root node has children (real meshes with geometry)
    const childMeshes = rootNode.getChildMeshes();

    let hero; // Initialize hero as undefined
    if (rootNode.getTotalVertices() > 0) {
      hero = rootNode;
    } else {
      // Find the first child mesh with valid vertices
      hero = childMeshes.find((mesh) => mesh.getTotalVertices() > 0);
    }

    let height = 0; // Default height
    if (!hero) {
      console.error("No valid mesh found with vertices!");
    } else {
      hero.refreshBoundingInfo({});
      const boundingBox = hero.getBoundingInfo().boundingBox;
      height = boundingBox.maximum.y - boundingBox.minimum.y;

      console.log("Hero height:", height);
    }

    // Change position of the pillow
    console.log("height pillow: ", height);
    rootNode.position.y += height / 1.5; // Position at ground level

    // Change color based on the passed parameter
    if (childMeshes.length > 0) {
      childMeshes.forEach((m) => {
        const material = new StandardMaterial("pillowMaterial", this.scene);
        material.diffuseColor = color; // Set the diffuse color to the passed color
        m.material = material;

        const physicsAggregate = new PhysicsAggregate(
          m,
          PhysicsShapeType.MESH,
          { mass: 0, friction: 2, restitution: 5 },
          this.scene
        );

        this.environment.addShadowsToMesh(m as Mesh);
        this.lvlObjs.push(m);
      });
    } else {
      console.warn(`No child meshes found for ${hero.name}`);
    }
  }

  public async swiper(speed: number = 1): Promise<void> {
    const { meshes: heroMeshes } = await SceneLoader.ImportMeshAsync(
      "",
      "/kaykit/",
      "swiperLong_teamBlue.gltf.glb", //"swiper_teamBlue.gltf.glb", //"swiperLong_teamBlue.gltf.glb"
      this.scene
    );

    const hero = heroMeshes[0];
    hero.name = "swiper";
    hero.scaling = new Vector3(2, 2, 2);
    hero.position = new Vector3(-10, 0, -10);

    const childMeshes = hero.getChildMeshes();
    if (childMeshes.length > 0) {
      childMeshes.forEach((m) => {
        let physicsAggregate = new PhysicsAggregate(
          m,
          PhysicsShapeType.MESH,
          { mass: 0, friction: 0, restitution: 10 }, // The restitution should work for physics interactions
          this.scene
        );

        // important for the physicsAggregate to rotate with the mesh m
        physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
        physicsAggregate.body.disablePreStep = false;

        this.scene.registerBeforeRender(() => {
          m.rotate(new Vector3(0, 1, 0), speed * 0.01);
        });
      });
    } else {
      console.warn(`No child meshes found for ${hero.name}`);
    }

    // Add shadows to the hero mesh
    this.environment.addShadowsToMesh(hero as Mesh);
    this.lvlObjs.push(hero);
  }

  public async swiperGame(speed: number = 1): Promise<void> {
    const { meshes: heroMeshes } = await SceneLoader.ImportMeshAsync(
      "",
      "/kaykit/",
      "swiperLong_teamBlue.gltf.glb", //"swiper_teamBlue.gltf.glb", //"swiperLong_teamBlue.gltf.glb"
      this.scene
    );

    const hero = heroMeshes[0];
    hero.name = "swiper1";
    hero.scaling = new Vector3(2, 2, 2);
    hero.position = new Vector3(-10, 0, -10);

    const childMeshes = hero.getChildMeshes();
    if (childMeshes.length > 0) {
      childMeshes.forEach((m) => {
        let physicsAggregate = new PhysicsAggregate(
          m,
          PhysicsShapeType.MESH,
          { mass: 0, friction: 0, restitution: 10 }, // The restitution should work for physics interactions
          this.scene
        );

        // important for the physicsAggregate to rotate with the mesh m
        physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
        physicsAggregate.body.disablePreStep = false;

        this.scene.registerBeforeRender(() => {
          m.rotate(new Vector3(0, 1, 0), speed * 0.01);
        });
      });
    } else {
      console.warn(`No child meshes found for ${hero.name}`);
    }

    // Add shadows to the hero mesh
    this.environment.addShadowsToMesh(hero as Mesh);
    this.lvlObjs.push(hero);
  }

  public async testLoadMap(): Promise<void> {
    // Load the map from a file
    const { meshes: heroMeshes } = await SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "grid_map_f1.glb",
      this.scene
    );

    // // Get the root node, which may have child meshes
    const rootNode = heroMeshes[0];

    rootNode.name = "footMap";
    rootNode.scaling = new Vector3(3, 3, 3);
    rootNode.position = new Vector3(-20, 0, -20);

    // // Check if the root node has children (real meshes with geometry)
    const childMeshes = rootNode.getChildMeshes();

    if (childMeshes.length > 0) {
      childMeshes.forEach((m) => {
        const physicsAggregate = new PhysicsAggregate(
          m,
          PhysicsShapeType.MESH,
          { mass: 0, friction: 1, restitution: 0 },
          this.scene
        );

        this.environment.addShadowsToMesh(m as Mesh);
        this.lvlObjs.push(m);
      });
    } else {
      console.warn(`No child meshes found for ${rootNode.name}`);
    }
  }

  public async initLevel(): Promise<void> {
    // this.scene.debugLayer.show();

    // await this.generateWalls();
    await this.loadBlanketFort();
    // await this.loadAssetsKit();

    await this.testLoadMap();

    await this.spikeRoller();

    await this.loadPillow();

    await this.swiper();
    // Generate predefined objs
    this.lvlGen.generateStairs();
    this.lvlGen.generateSlopes();
    this.lvlGen.generatePlatforms();
    this.physicsPlane();

    this.lvlObjs = this.lvlGen.getGeneratedObjects();

    console.log("Level Loaded!");
  }
}
l;
