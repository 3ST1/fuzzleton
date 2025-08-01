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

  defaultLvlData = {
    name: "defaultlvl",
    meshes: [
      {
        id: "placed-kaykit/swiperDouble_teamBlue-1748886318770",
        type: "model",
        modelId: "kaykit/swiperDouble_teamBlue",
        rootFolder: "/api/assets/",
        filename: "kaykit/swiperDouble_teamBlue.glb",
        position: {
          x: 19.996657094624652,
          y: 0,
          z: 31.38514263689666,
        },
        rotation: {
          x: 0,
          y: -0.9981862937249513,
          z: 0,
          w: 0.06020068952636533,
        },
        scaling: {
          x: 1,
          y: 1,
          z: 1,
        },
        isWinMesh: false,
        rotation_animation: {
          enabled: true,
          axis: {
            x: 0,
            y: 1,
            z: 0,
          },
          speed: 0.01,
        },
        physics: {
          enabled: true,
          mass: 0,
          friction: 1,
          restitution: 3,
        },
      },
      {
        id: "placed-kaykit/swiperDouble_teamRed-1748886318792",
        type: "model",
        modelId: "kaykit/swiperDouble_teamRed",
        rootFolder: "/api/assets/",
        filename: "kaykit/swiperDouble_teamRed.glb",
        position: {
          x: 46.928026101372595,
          y: 1.4210854715202004e-14,
          z: 47.54704630645058,
        },
        rotation: {
          x: 0,
          y: -0.022089783393034097,
          z: 0,
          w: -0.9997559909660374,
        },
        scaling: {
          x: 1,
          y: 1,
          z: 1,
        },
        isWinMesh: false,
        rotation_animation: {
          enabled: true,
          axis: {
            x: 0,
            y: 1,
            z: 0,
          },
          speed: -0.05,
        },
        physics: {
          enabled: true,
          mass: 0,
          friction: 1,
          restitution: 3,
        },
      },
      {
        id: "placed-kaykit/star-1748886318812",
        type: "model",
        modelId: "kaykit/star",
        rootFolder: "/api/assets/",
        filename: "kaykit/star.glb",
        position: {
          x: 38.5,
          y: 10.0,
          z: -8.0,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
        scaling: {
          x: 1,
          y: 1,
          z: 1,
        },
        isWinMesh: true,
        physics: {
          enabled: true,
          mass: 0,
          friction: 0.2,
          restitution: 0.2,
        },
      },
      {
        id: "placed-kaykit/spikeRoller-1748886318819",
        type: "model",
        modelId: "kaykit/spikeRoller",
        rootFolder: "/api/assets/",
        filename: "kaykit/spikeRoller.glb",
        position: {
          x: 32,
          y: 0,
          z: -23,
        },
        rotation: {
          x: 0,
          y: -0.126793186154813,
          z: 0,
          w: -0.991929174862432,
        },
        scaling: {
          x: 2.853116706110003,
          y: 2.853116706110003,
          z: 2.853116706110003,
        },
        isWinMesh: false,
        rotation_animation: {
          enabled: true,
          axis: {
            x: 0,
            y: 1,
            z: 0,
          },
          speed: 0.04,
        },
        physics: {
          enabled: true,
          mass: 0,
          friction: 0.2,
          restitution: 8,
        },
      },
      {
        id: "placed-kaykit/ball-1748886318835",
        type: "model",
        modelId: "kaykit/ball",
        rootFolder: "/api/assets/",
        filename: "kaykit/ball.glb",
        position: {
          x: 30,
          y: 4.000000000000007,
          z: 2,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
        scaling: {
          x: 2.853116706110003,
          y: 2.853116706110003,
          z: 2.853116706110003,
        },
        isWinMesh: false,
        physics: {
          enabled: true,
          mass: 2,
          friction: 0.2,
          restitution: 0.8,
        },
      },
      {
        id: "placed-kaykit/arrow_teamBlue-1748886318853",
        type: "model",
        modelId: "kaykit/arrow_teamBlue",
        rootFolder: "/api/assets/",
        filename: "kaykit/arrow_teamBlue.glb",
        position: {
          x: -2,
          y: 2.9999999999999996,
          z: 182,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
        scaling: {
          x: 1,
          y: 1,
          z: 1,
        },
        isWinMesh: false,
        physics: {
          enabled: true,
          mass: 1,
          friction: 0.2,
          restitution: 0.2,
        },
      },
      {
        id: "placed-platformerkit/Sofa_Large-1748886318864",
        type: "model",
        modelId: "platformerkit/Sofa_Large",
        rootFolder: "/api/assets/",
        filename: "platformerkit/Sofa_Large.glb",
        position: {
          x: 40.34392722309838,
          y: 0,
          z: -8.180913303985866,
        },
        rotation: {
          x: -3.9252311467094367e-17,
          y: -0.7071067811865471,
          z: 3.925231146709436e-17,
          w: 0.7071067811865472,
        },
        scaling: {
          x: 3.1384283767210035,
          y: 3.1384283767210035,
          z: 3.1384283767210035,
        },
        isWinMesh: false,
        physics: {
          enabled: true,
          mass: 0, // 0 or this will bounce everywhere
          friction: 0.8,
          restitution: 5,
        },
      },
      {
        id: "placed-platformerkit/Cardboard_Box_High-1748886318869",
        type: "model",
        modelId: "platformerkit/Cardboard_Box_High",
        rootFolder: "/api/assets/",
        filename: "platformerkit/Cardboard_Box_High.glb",
        position: {
          x: 36.705557274381206,
          y: 2.000000000000003,
          z: 10.2062462286316,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
        scaling: {
          x: 59.049000000000014,
          y: 59.049000000000014,
          z: 59.049000000000014,
        },
        isWinMesh: false,
        physics: {
          enabled: true,
          mass: 2.5,
          friction: 0.2,
          restitution: 0.1,
        },
      },
      {
        id: "placed-platformerkit/Cardboard_Box_High-1748886318880",
        type: "model",
        modelId: "platformerkit/Cardboard_Box_High",
        rootFolder: "/api/assets/",
        filename: "platformerkit/Cardboard_Box_High.glb",
        position: {
          x: 35.953605364518786,
          y: 4.000000000000002,
          z: 9.847557176639171,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
        scaling: {
          x: 36.45,
          y: 36.45,
          z: 36.45,
        },
        isWinMesh: false,
        physics: {
          enabled: true,
          mass: 2,
          friction: 0.2,
          restitution: 0.1,
        },
      },
      {
        id: "placed-platformerkit/Cardboard_Box_Low-1748886318892",
        type: "model",
        modelId: "platformerkit/Cardboard_Box_Low",
        rootFolder: "/api/assets/",
        filename: "platformerkit/Cardboard_Box_Low.glb",
        position: {
          x: 36.24857407117376,
          y: 2.0000000000000044,
          z: 12.56034298249626,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
        scaling: {
          x: 50,
          y: 50,
          z: 50,
        },
        isWinMesh: false,
        physics: {
          enabled: true,
          mass: 2,
          friction: 0.2,
          restitution: 0.1,
        },
      },
      {
        id: "placed-platformerkit/Cardboard_Box_Low-1748886318903",
        type: "model",
        modelId: "platformerkit/Cardboard_Box_Low",
        rootFolder: "/api/assets/",
        filename: "platformerkit/Cardboard_Box_Low.glb",
        position: {
          x: 33.80383315921077,
          y: 1.9999999999999973,
          z: 9.99112142639487,
        },
        rotation: {
          x: -0.35355339059327356,
          y: 0.35355339059327356,
          z: -0.6123724356957941,
          w: 0.6123724356957942,
        },
        scaling: {
          x: 40,
          y: 40,
          z: 40,
        },
        isWinMesh: false,
        physics: {
          enabled: true,
          mass: 2,
          friction: 0.2,
          restitution: 0.1,
        },
      },
    ],
    metadata: {
      createdAt: "2025-06-02T17:45:42.075Z",
      version: "0.1.0",
    },
  };

  public async initLevel(): Promise<void> {
    console.log("init Level...");
    // this.loadBlanketFort();
    let lvlFromFile: levelFromFile;

    if (this.initialLevelData) {
      console.log("Initializing level with provided data...");
      lvlFromFile = new levelFromFile(
        this.scene,
        this.gameEnv,
        this.player,
        this.assetManagerService,
        this.initialLevelData
      );
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
      lvlFromFile = new levelFromFile(
        this.scene,
        this.gameEnv,
        this.player,
        this.assetManagerService,
        this.defaultLvlData
      );
    }
    await lvlFromFile.load();
    // this.placeBlanketFort();
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
