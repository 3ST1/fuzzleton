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
  AssetsManager,
  VertexData,
  FresnelParameters,
  Color4,
} from "@babylonjs/core";
import { Wall } from "../objects/Wall";
import { GameEnvironment, MyEnvObjsToAddPhysics } from "../GameEnvironnement";
import { Stairs } from "../objects/Stairs";
import { GameObject } from "../objects/GameObject";
import { Platform } from "../objects/Platform";
import { Slope } from "../objects/Slope";
import { LevelGenerator } from "./LevelGenerator";
import { levelFromFile } from "./levelFromFile";
import PlayerController from "../player/thirdPersonController";
import { AssetManagerService } from "../AssetManagerService";

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
  gameEnv: GameEnvironment;
  lvlObjs: any[] = [];
  lvlGen: LevelGenerator;
  assetManagerService: AssetManagerService;
  player: PlayerController;

  initialLevelData: any | null = null; // To store data passed for testing

  constructor(
    scene: Scene,
    environment: GameEnvironment,
    assetsManager: AssetManagerService,
    player: PlayerController,
    initialLevelData: any | null = null
  ) {
    this.scene = scene;
    this.gameEnv = environment;
    this.lvlGen = new LevelGenerator(this.scene, this.gameEnv); // to generate random objects
    // this.lvlGen.generateLevel();
    this.assetManagerService = assetsManager;
    this.player = player;
    this.initialLevelData = initialLevelData; // Store the initial level data if provided
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
        this.gameEnv,
        "wall_O0",
        new Vector3(0, 0, 250),
        500,
        100,
        1
      ),
      new Wall(
        this.scene,
        this.gameEnv,
        "wall_O1",
        new Vector3(0, 0, -250),
        500,
        100,
        1
      ),
      new Wall(
        this.scene,
        this.gameEnv,
        "wall_O2",
        new Vector3(250, 0, 0),
        1,
        100,
        500
      ),
      new Wall(
        this.scene,
        this.gameEnv,
        "wall_O3",
        new Vector3(-250, 0, 0),
        1,
        100,
        500
      )
    );

    // INNER WALLS
    walls.forEach((wall) => {
      new Wall(
        this.scene,
        this.gameEnv,
        "wall_" + wall.x + "_" + wall.z,
        new Vector3(wall.x, wall.y, wall.z),
        wall.width,
        wall.height,
        wall.depth
      );
      this.lvlObjs.push(wall);
    });
  }

  public async loadBlanketFort() {
    console.log("adding blanket fort to assets manager");
    // https://mycould.tristan-patout.fr/api/fuzzelton/assets/models/blanketFort.glb
    this.assetManagerService.addAssetToAssetManager(
      "/api/assets/models/",
      "blanketFort.glb",
      "blanketFort"
      // onSuccess
    );
  }

  private placeBlanketFort(): void {
    const hero = this.assetManagerService.createModelInstance(
      "blanketFort",
      new Vector3(0, 0, 0),
      15
    );
    if (!hero) {
      console.error("Failed to load blanket fort model.");
      return;
    }

    if (!hero) {
      console.error("Blanket fort model not found in asset manager.");
      return;
    }

    if (!hero.getChildMeshes().length || hero.getChildMeshes().length === 0) {
      console.error("No child meshes found in blanket fort model.");
      return;
    }

    const childMeshes = hero
      .getChildMeshes()
      .filter(
        (childMesh) =>
          childMesh instanceof Mesh && childMesh.getTotalVertices() > 0
      );

    hero.rotate(new Vector3(0, 1, 0), Math.PI);
    hero.scaling.z = -hero.scaling.z;

    hero.position = new Vector3(0, 0, 0);
    childMeshes.forEach((m) => {
      const physicsAggregate = new PhysicsAggregate(
        m,
        PhysicsShapeType.MESH,
        { mass: 0, friction: 1, restitution: 0 },
        this.scene
      );

      this.gameEnv.addShadowsToMesh(m as Mesh);
      this.lvlObjs.push(m);
    });
  }

  public generateRandomObjects(nbObjs: number): void {
    this.lvlGen.generateRandomObjects(nbObjs);
  }

  public physicsPlane(): void {
    const width = 5;
    const depth = 15;
    const startPos = new Vector3(25, 0, -35);

    // Create base (static non-reactive)
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

    // Correct plane position to be just above the base
    planeMesh.position = startPos.clone();
    planeMesh.position.y += 2; // 0.5 (base height) + 0.05 (half of plane height)

    // Apply physics to the plane
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

  public createPillowProgrammatically(
    color: Color3 = new Color3(1, 1, 1),
    position: Vector3 = new Vector3(12, 0, 12)
  ): Mesh {
    // Create the main pillow body using CreateBox with rounded corners
    const pillow = MeshBuilder.CreateBox(
      "pillow",
      {
        width: 3,
        height: 1,
        depth: 3,
        faceColors: [
          new Color4(color.r, color.g, color.b, 1),
          new Color4(color.r, color.g, color.b, 1),
          new Color4(color.r, color.g, color.b, 1),
          new Color4(color.r, color.g, color.b, 1),
          new Color4(color.r, color.g, color.b, 1),
          new Color4(color.r, color.g, color.b, 1),
        ],
        updatable: true,
      },
      this.scene
    );

    pillow.position = new Vector3(position.x, position.y + 1, position.z);

    const pillowMaterial = new StandardMaterial("pillowMaterial", this.scene);
    pillowMaterial.diffuseColor = color;

    pillowMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
    pillowMaterial.specularPower = 32;

    pillowMaterial.diffuseFresnelParameters = new FresnelParameters();
    pillowMaterial.diffuseFresnelParameters.bias = 0.2;
    pillowMaterial.diffuseFresnelParameters.power = 1;

    pillow.material = pillowMaterial;
    const physicsAggregate = new PhysicsAggregate(
      pillow,
      PhysicsShapeType.BOX,
      { mass: 0, friction: 2, restitution: 6 },
      this.scene
    );

    this.gameEnv.addShadowsToMesh(pillow);

    this.lvlObjs.push(pillow);

    return pillow;
  }

  // public loadSwiper(speed: number = 1): void {
  //   console.log("adding swiper to assets manager");

  //   const onSuccess = (task) => {
  //     const heroMeshes = task.loadedMeshes;
  //     const hero = heroMeshes[0];

  //     hero.name = "swiper";
  //     hero.scaling = new Vector3(2, 2, 2);
  //     hero.position = new Vector3(-51, 0, 19);

  //     const childMeshes = hero.getChildMeshes();
  //     if (childMeshes.length > 0) {
  //       childMeshes.forEach((m) => {
  //         let physicsAggregate = new PhysicsAggregate(
  //           m,
  //           PhysicsShapeType.MESH,
  //           { mass: 0, friction: 0, restitution: 10 },
  //           this.scene
  //         );

  //         physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
  //         physicsAggregate.body.disablePreStep = false;

  //         this.scene.registerBeforeRender(() => {
  //           m.rotate(new Vector3(0, 1, 0), speed * 0.01);
  //         });
  //       });
  //     }

  //     this.gameEnv.addShadowsToMesh(hero as Mesh);
  //     this.lvlObjs.push(hero);
  //   };

  //   this.assetManagerService.addAssetToAssetManager(
  //     "/kaykit/",
  //     "swiper_teamBlue.glb", //"swiperLong_teamBlue.gltf.glb",
  //     "swiper",
  //     onSuccess
  //   );

  //   // addItemToAssetManager(
  //   //   this.assetManagerService,
  //   //   "/kaykit/",
  //   //   "swiperLong_teamBlue.gltf.glb",
  //   //   "swiper",
  //   //   onSuccess
  //   // );
  // }

  public async initLevel(): Promise<void> {
    console.log("init Level...");
    this.loadBlanketFort();

    if (this.initialLevelData) {
      console.log("Initializing level with provided data...");
      const lvlFromFile = new levelFromFile(
        this.scene,
        this.gameEnv,
        this.player,
        this.assetManagerService,
        this.initialLevelData
      );

      await lvlFromFile.load();
    } else {
      // Default level loading if no test data is provided
      // this.loadSpikeRoller();
      // this.loadSwiper();
      this.createPillowProgrammatically();
      this.lvlGen.generateStairs();
      this.lvlGen.generateSlopes();
      this.lvlGen.generatePlatforms();
      this.physicsPlane();

      await this.assetManagerService.loadAssetsAsync();
      // // making it async to wait for the assets to be loaded
      // await new Promise<void>((resolve) => {
      //   assetManager.onFinish = () => resolve();
      //   assetManager.load();
      // });
      // Potentially load a default level from file if desired for normal PLAY mode
      // const lvlFromFile = new levelFromFile(this.scene, this.gameEnv, this.player);
      const lvlFromFile = new levelFromFile(
        this.scene,
        this.gameEnv,
        this.player,
        this.assetManagerService
      );
    }

    this.placeBlanketFort();
    this.generateWalls();
    console.log("Level Loaded!");
  }
}

// TO REMOVE

// public loadBoudin(speed: number = 1): void {
//   // console.log("adding swiper to assets manager");

//   const onSuccess = (task) => {
//     const heroMeshes = task.loadedMeshes;
//     const hero = heroMeshes[0];

//     heroMeshes[1].dispose();

//     hero.name = "swiper";
//     hero.scaling = new Vector3(10, 10, 10);
//     hero.position = new Vector3(-50, 0, 18);

//     const childMeshes = hero.getChildMeshes();
//     if (childMeshes.length > 0) {
//       childMeshes.forEach((m) => {
//         let physicsAggregate = new PhysicsAggregate(
//           m,
//           PhysicsShapeType.MESH,
//           { mass: 0, friction: 2, restitution: 10 },
//           this.scene
//         );

//         physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
//         physicsAggregate.body.disablePreStep = false;

//         this.scene.registerBeforeRender(() => {
//           m.rotate(new Vector3(0, 0, 1), speed * 0.01);
//         });
//       });
//     }

//     this.gameEnv.addShadowsToMesh(hero as Mesh);
//     this.lvlObjs.push(hero);
//   };

//   this.assetManagerService.addAssetToAssetManager(
//     "/kaykit/",
//     "swiperLong_teamBlue.gltf.glb",
//     "swiper",
//     onSuccess
//   );

//   // addItemToAssetManager(
//   //   this.assetManagerService,
//   //   "/kaykit/",
//   //   "swiperLong_teamBlue.gltf.glb",
//   //   "swiper",
//   //   onSuccess
//   // );
// }

// public async swiperGame(speed: number = 1): Promise<void> {
//   const { meshes: heroMeshes } = await SceneLoader.ImportMeshAsync(
//     "",
//     "/kaykit/",
//     "swiperLong_teamBlue.gltf.glb", //"swiper_teamBlue.gltf.glb", //"swiperLong_teamBlue.gltf.glb"
//     this.scene
//   );

//   const hero = heroMeshes[0];
//   hero.name = "swiper1";
//   hero.scaling = new Vector3(2, 2, 2);
//   hero.position = new Vector3(-10, 0, 18);

//   const childMeshes = hero.getChildMeshes();
//   if (childMeshes.length > 0) {
//     childMeshes.forEach((m) => {
//       let physicsAggregate = new PhysicsAggregate(
//         m,
//         PhysicsShapeType.MESH,
//         { mass: 0, friction: 0, restitution: 10 }, // The restitution should work for physics interactions
//         this.scene
//       );

//       // important for the physicsAggregate to rotate with the mesh m
//       physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
//       physicsAggregate.body.disablePreStep = false;

//       this.scene.registerBeforeRender(() => {
//         m.rotate(new Vector3(0, 1, 0), speed * 0.01);
//       });
//     });
//   } else {
//     console.warn(`No child meshes found for ${hero.name}`);
//   }

//   // Add shadows to the hero mesh
//   this.gameEnv.addShadowsToMesh(hero as Mesh);
//   this.lvlObjs.push(hero);
// }

// public loadTestMap(): void {
//   console.log("adding test map to assets manager");

//   const onSuccess = (task) => {
//     const heroMeshes = task.loadedMeshes;
//     const rootNode = heroMeshes[0];

//     rootNode.name = "footMap";
//     rootNode.scaling = new Vector3(3, 3, 3);
//     rootNode.position = new Vector3(-30, 0, -30);

//     const childMeshes = rootNode.getChildMeshes();
//     if (childMeshes.length > 0) {
//       childMeshes.forEach((m) => {
//         const physicsAggregate = new PhysicsAggregate(
//           m,
//           PhysicsShapeType.MESH,
//           { mass: 0, friction: 1, restitution: 0 },
//           this.scene
//         );

//         this.gameEnv.addShadowsToMesh(m as Mesh);
//         this.lvlObjs.push(m);
//       });
//     }
//   };

//   this.assetManagerService.addAssetToAssetManager(
//     "/models/",
//     "grid_map_f1.glb",
//     "footMap",
//     onSuccess
//   );

//   // addItemToAssetManager(
//   //   this.assetManagerService,
//   //   "/models/",
//   //   "grid_map_f1.glb",
//   //   "footMap",
//   //   onSuccess
//   // );
// }

// async loadModels(
//   // @ts-ignore
//   basePath: string,
//   modelFiles: string[],
//   postion = new Vector3(0, 0, 0)
// ): Promise<void> {
//   let postionStart = postion;
//   for (let i = 0; i < modelFiles.length; i++) {
//     const file = modelFiles[i];
//     // const filePath = basePath + file;
//     try {
//       const {
//         meshes: heroMeshes,
//         skeletons,
//         animationGroups,
//       } = await SceneLoader.ImportMeshAsync("", "/kaykit/", file, this.scene);

//       // Get the root node, which may have child meshes
//       const rootNode = heroMeshes[0];

//       // Check if the root node has children (real meshes with geometry)
//       const childMeshes = rootNode.getChildMeshes();

//       // Find the first child mesh with valid vertices
//       const hero = childMeshes.find((mesh) => mesh.getTotalVertices() > 0);

//       let height = 0; // Default height
//       if (!hero) {
//         console.error("No valid mesh found with vertices!");
//       } else {
//         hero.refreshBoundingInfo({});
//         const boundingBox = hero.getBoundingInfo().boundingBox;
//         height = boundingBox.maximum.y - boundingBox.minimum.y;

//         console.log("Hero height:", height);
//       }

//       // hero.scaling = new Vector3(15, 15, 15);
//       // hero.rotate(new Vector3(0, 1, 0), Math.PI);

//       // Calculate the bottom of the mesh to place it on the ground
//       // const boundingInfo = rootNode.getBoundingInfo();
//       // const objectHeight = boundingInfo.boundingBox.extendSize.y * 2; // Total height

//       // Grid positioning logic with proper comments
//       postionStart.x += 5; // Move to next column
//       if (i % 5 === 0 && i !== 0) {
//         postionStart.x = 0; // Reset to first column
//         postionStart.z += 5; // Move to next row
//       }
//       rootNode.position.x = postionStart.x;
//       rootNode.position.z = postionStart.z;
//       // console.log("position: ", postionStart);
//       console.log("object :", hero);
//       rootNode.position.y = height / 2; // Position at ground level

//       // console.log("Hero: ", hero);
//       if (childMeshes.length > 0) {
//         childMeshes.forEach((m) => {
//           const physicsAggregate = new PhysicsAggregate(
//             m,
//             PhysicsShapeType.MESH,
//             { mass: 0, friction: 1, restitution: 0 },
//             this.scene
//           );

//           this.gameEnv.addShadowsToMesh(m as Mesh);
//           this.lvlObjs.push(m);
//         });
//       } else {
//         console.warn(`No child meshes found for ${file}`);
//       }
//     } catch (error) {
//       console.error(`Error loading ${file}:`, error);
//     }
//   }
// }

// loadSpikeRoller(): void {
//   console.log("adding spike roller to assets manager");

//   const onSuccess = (task) => {
//     const heroMeshes = task.loadedMeshes;
//     const hero = heroMeshes[0];

//     hero.name = "spikeRoller";
//     hero.scaling = new Vector3(3, 3, 3);
//     hero.position = new Vector3(-15, 0, 40);

//     const childMeshes = hero.getChildMeshes();
//     if (childMeshes.length > 0) {
//       childMeshes.forEach((m) => {
//         const physicsAggregate = new PhysicsAggregate(
//           m,
//           PhysicsShapeType.MESH,
//           { mass: 0, friction: 0, restitution: 5 },
//           this.scene
//         );

//         physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
//         physicsAggregate.body.disablePreStep = false;

//         this.gameEnv.addShadowsToMesh(m as Mesh);
//         this.lvlObjs.push(m);

//         this.scene.registerBeforeRender(() => {
//           m.rotate(new Vector3(0, 1, 0), 0.01);
//         });
//       });
//     }
//   };

//   this.assetManagerService.addAssetToAssetManager(
//     "/kaykit/",
//     "spikeRoller.gltf.glb",
//     "spikeRoller",
//     onSuccess
//   );

//   // addItemToAssetManager(
//   //   this.assetManagerService,
//   //   "/kaykit/",
//   //   "spikeRoller.gltf.glb",
//   //   "spikeRoller",
//   //   onSuccess
//   // );
// }

// NEED TO FIX WITH A LIGHTER GLB MODEL
// public loadPillow(color: Color3 = new Color3(1, 1, 1)): void {
//   console.log("adding pillow to assets manager");

//   const onSuccess = (task) => {
//     const heroMeshes = task.loadedMeshes;
//     const rootNode = heroMeshes[0];

//     rootNode.name = "pillow";
//     rootNode.scaling = new Vector3(4, 4, 4);
//     rootNode.position = new Vector3(12, 0, 12);

//     const childMeshes = rootNode.getChildMeshes();

//     let hero;
//     if (rootNode.getTotalVertices() > 0) {
//       hero = rootNode;
//     } else {
//       hero = childMeshes.find((mesh) => mesh.getTotalVertices() > 0);
//     }

//     if (hero) {
//       hero.refreshBoundingInfo({});
//       const boundingBox = hero.getBoundingInfo().boundingBox;
//       const height = boundingBox.maximum.y - boundingBox.minimum.y;
//       rootNode.position.y += height / 1.5;
//     }

//     if (childMeshes.length > 0) {
//       childMeshes.forEach((m) => {
//         const material = new StandardMaterial("pillowMaterial", this.scene);
//         material.diffuseColor = color;
//         m.material = material;

//         const physicsAggregate = new PhysicsAggregate(
//           m,
//           PhysicsShapeType.MESH,
//           { mass: 0, friction: 2, restitution: 5 },
//           this.scene
//         );

//         this.gameEnv.addShadowsToMesh(m as Mesh);
//         this.lvlObjs.push(m);
//       });
//     }
//   };

//   addItemToAssetManager(
//     this.assetsManager,
//     "/models/",
//     "pillow.glb",
//     "pillow",
//     onSuccess
//   );
// }
