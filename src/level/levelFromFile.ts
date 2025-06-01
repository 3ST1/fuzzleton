import * as BABYLON from "@babylonjs/core";
import {
  AnimationGroup,
  Animation,
  Mesh,
  PhysicsAggregate,
  PhysicsJoint,
  PhysicsMotionType,
  PhysicsShapeType,
  Quaternion,
  Scene,
  Space,
  TransformNode,
  Vector3,
  PhysicsShapeBox,
  PhysicsBody,
  PhysicsShape,
  PhysicsMaterial,
} from "@babylonjs/core";
import {
  SceneSerializer,
  SerializedMesh,
  SerializedScene,
} from "../levelCreator/SceneSerializer";
// import { Debug } from "@babylonjs/inspector";
import { AssetManagerService } from "../AssetManagerService";
import { ObjectController } from "../levelCreator/ObjectController";
import { GameEnvironment } from "../GameEnvironnement";
import PlayerController from "../player/thirdPersonController";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Image } from "@babylonjs/gui/2D/controls/image";
import { UIComponentsFactory } from "../levelCreator/UIComponentsFactory";
import { StackPanel } from "@babylonjs/gui";
// TO TEST / DEBUG
const meshesDocDataExemple: SerializedScene = {
  name: "MyLevel",
  meshes: [
    {
      id: "placed-tileLarge_teamYellow-1744892455445",
      type: "model",
      modelId: "tileLarge_teamYellow",
      rootFolder: "/kaykit/",
      filename: "tileLarge_teamYellow.glb",
      position: {
        x: 30,
        y: 0,
        z: 0,
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
    },
    {
      id: "placed-tileLarge_teamYellow-1744892473355",
      type: "model",
      modelId: "tileLarge_teamYellow",
      rootFolder: "/kaykit/",
      filename: "tileLarge_teamYellow.glb",
      position: {
        x: 36,
        y: 0,
        z: -0.011101436022006084,
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
      movement: {
        enabled: true,
        speed: 1,
        endPosition: {
          x: 42,
          y: 12,
          z: 0,
        },
      },
    },
    {
      id: "placed-ring_teamYellow-1744831113442",
      type: "model",
      modelId: "ring_teamYellow",
      rootFolder: "/kaykit/",
      filename: "ring_teamYellow.glb",
      position: {
        x: 52.72068657665831,
        y: 0,
        z: 144.09111089646126,
      },
      rotation: {
        x: -0.046133473916491904,
        y: 0.9504574387910377,
        z: 0.25467430316421186,
        w: -0.17217246858600355,
      },
      scaling: {
        x: 1,
        y: 1,
        z: 1,
      },
      rotation_animation: {
        enabled: true,
        axis: {
          x: 0,
          y: 1,
          z: 0,
        },
        speed: 0.01,
      },
    },
    {
      id: "placed-barrierLadder-1744839863111",
      type: "model",
      modelId: "barrierLadder",
      rootFolder: "/kaykit/",
      filename: "barrierLadder.glb",
      position: {
        x: -11.65918288993208,
        y: -3.552713678800501e-15,
        z: 99.13787914256511,
      },
      rotation: {
        x: 0.4999999999999999,
        y: 0,
        z: 0,
        w: 0.8660254037844386,
      },
      scaling: {
        x: 4.717944050000005,
        y: 4.717944050000005,
        z: 4.717944050000005,
      },
      physics: {
        enabled: true,
        mass: 10,
        friction: 0.2,
        restitution: 0.2,
      },
    },
    {
      id: "placed-swiperLong_teamRed-1744844024680",
      type: "model",
      modelId: "swiperLong_teamRed",
      rootFolder: "/kaykit/",
      filename: "swiperLong_teamRed.glb",
      position: {
        x: 3.3844833580966442,
        y: 0,
        z: 22.40712635911808,
      },
      rotation: {
        x: 0,
        y: 0.917687538478077,
        z: 0,
        w: 0.39730288411007825,
      },
      scaling: {
        x: 1,
        y: 1,
        z: 1,
      },
      rotation_animation: {
        enabled: true,
        axis: {
          x: 0,
          y: 1,
          z: 0,
        },
        speed: 0.1,
      },
      physics: {
        enabled: true,
        mass: 10,
        friction: 0.2,
        restitution: 0.2,
      },
    },
    {
      id: "placed-ball_teamYellow-1744844050160",
      type: "model",
      modelId: "ball_teamYellow",
      rootFolder: "/kaykit/",
      filename: "ball_teamYellow.glb",
      position: {
        x: -12.785085940705756,
        y: 10,
        z: 83.35073323573664,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
        w: 1,
      },
      scaling: {
        x: 5,
        y: 5,
        z: 5,
      },
      physics: {
        enabled: true,
        mass: 5,
        friction: 0.2,
        restitution: 0.3,
      },
      isWinMesh: true,
    },
    {
      id: "placed-tileLow_teamRed-1744876237326",
      type: "model",
      modelId: "tileLow_teamRed",
      rootFolder: "/kaykit/",
      filename: "tileLow_teamRed.glb",
      position: {
        x: 95.08025769537853,
        y: 10,
        z: 215.5946562219683,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
        w: 1,
      },
      scaling: {
        x: 3.968712300500009,
        y: 3.968712300500009,
        z: 3.968712300500009,
      },
      movement: {
        enabled: true,
        speed: 5,
        endPosition: {
          x: 3,
          y: 120,
          z: 165.7,
        },
        controlPoints: [
          {
            x: 95.08025769537853,
            y: 10,
            z: 215.5946562219683,
          },
          {
            x: 3.0128916458999857,
            y: 70,
            z: 165.71139354296716,
          },
          {
            x: 3,
            y: 120,
            z: 165.7,
          },
        ],
      },
    },
  ],
  metadata: {
    createdAt: "2025-04-16T19:18:53.349Z",
    version: "0.3",
  },
};
//////////////////////////////::

export class levelFromFile {
  scene: Scene;
  assetManager: AssetManagerService;
  objectController!: ObjectController;
  addedAssets: any[] = [];
  gameEnv: GameEnvironment;
  player: PlayerController;
  meshesDoc: any;

  constructor(
    scene: Scene,
    gameEnv: GameEnvironment,
    player: PlayerController,
    assetManager: AssetManagerService,
    meshesDoc: SerializedScene = meshesDocDataExemple // this receives the parsed JSON created in the levelCreator
  ) {
    this.scene = scene;
    this.gameEnv = gameEnv;
    this.player = player;
    // // this.assetManager = new AssetManagerService(scene);
    this.assetManager = assetManager;
    this.meshesDoc = meshesDoc;

    // For simplicity wee let levelFromFile manage its own assets for now (but later we should probably pass the asset manager from the gameEnv so we load them only once)
    // this.assetManager.initializeAssetsManager(this.scene);

    // using the already in use asset manager to load the level
    // this.assetManager.changeScene(scene);
  }

  public async load() {
    if (this.meshesDoc) {
      // if meshesDoc data provided we load the level
      console.log("Loading level from meshesDoc:", this.meshesDoc);
      this._addNeededAssetsToTheAssetManager(this.meshesDoc);
      await this.loadLevel(this.meshesDoc); // This will call assetManager.loadAssetsAsync()
    } else {
      console.warn("levelFromFile: No meshesDoc provided to load.");
    }
  }

  private _addNeededAssetsToTheAssetManager(meshesDoc: any) {
    console.log("Adding needed assets to the level asset manager...");
    console.log(meshesDoc);
    console.log("meshes : ", meshesDoc.meshes);
    meshesDoc.meshes.forEach((mesh: any) => {
      if (!mesh.rootFolder || !mesh.filename || !mesh.id) {
        console.error(`Invalid mesh data:`, mesh);
        return;
      }
      this.addedAssets.push(mesh);
      //   if (!this.addedAssets.includes(mesh)) {
      console.log(
        "Adding to level asset manager : ",
        mesh.rootFolder,
        mesh.filename,
        mesh.id
      );
      this.assetManager.addAssetToAssetManager(
        mesh.rootFolder,
        mesh.filename,
        mesh.id
      );
      //   }
    });
  }

  private _loadModelMesh(meshData: any): Mesh | null | undefined {
    console.warn(
      `levelFromFile : Creating model mesh with ID: ${meshData.modelId}`
    );
    // Check if model exists or find alternative
    const modelId = this.assetManager.checkIfModelIdExist(meshData.modelId);

    if (!modelId) {
      console.warn("model not found in asset manager ");
      return;
    } else {
      console.log("model found of id: ", modelId);
    }

    return this.assetManager.createModelInstance(
      modelId,
      new Vector3(meshData.position.x, meshData.position.y, meshData.position.z)
      // this.scene,
      // false,
      // 0,
      // false
    );
  }

  async loadLevel(meshesDoc: any) {
    console.warn("Loading level from file : ", meshesDoc);
    // await this.assetManager.loadAssetsAsync(this.scene);
    await this.assetManager.loadAssetsAsync();
    meshesDoc.meshes.forEach((meshData: SerializedMesh) => {
      console.warn("Loading mesh data: ", meshData);
      if (meshData.type === "model") {
        const newMesh = this._loadModelMesh(meshData);
        console.warn("mesh returned : ", newMesh);
        if (newMesh instanceof Mesh) {
          console.warn("applying mesh properties ", newMesh);
          this._applyMeshProperties(newMesh, meshData);
        }
      } else {
        console.error(`Unknown mesh type: ${meshData.type}`);
      }
    });
  }

  private _applyMeshProperties(mesh: Mesh, meshData: SerializedMesh): void {
    console.warn(
      `levelFromFile.ts : applying properties to mesh: ${mesh.name} with id: ${meshData.id}`
    );
    // console.log(`Successfully created mesh: ${mesh.name}`);

    // Set properties from saved data
    mesh.scaling = new Vector3(
      meshData.scaling.x,
      meshData.scaling.y,
      meshData.scaling.z
    );

    // Initialize metadata if needed
    if (!mesh.metadata) {
      mesh.metadata = {};
    }

    // Apply physics data first it may return a new merged mesh
    let activeMesh = mesh;
    const mergedMesh = this._applyPhysicsAndRotation(mesh, meshData);
    if (mergedMesh) {
      activeMesh = mergedMesh;
      // console.log(
      //   `using merged mesh for further operations: ${activeMesh.name}`
      // );
    }
    // else {
    //   console.log(
    //     `no physics mesh created, using original: ${activeMesh.name}`
    //   );
    // }

    // Apply mesh movements animation
    if (meshData.movement && meshData.movement.enabled) {
      this._applyMovement(mesh, meshData);
    }

    this._applyWinMesh(activeMesh, meshData);

    // Apply additional metadata from the saved data
    // if (meshData.metadata) {
    //   // Preserve existing metadata and add any missing properties
    //   Object.keys(meshData.metadata).forEach((key) => {
    //     if (key !== "type" && key !== "modelId") {
    //       // Skip these as they're already set
    //       mesh.metadata[key] = meshData.metadata[key];
    //     }
    //   });
    // }
  }

  private _applyMovement(mesh: Mesh, meshData: SerializedMesh): void {
    if (!meshData.movement || !meshData.movement.enabled) {
      return;
    }

    // Initialize metadata properties
    mesh.metadata.moving = true;
    mesh.metadata.speed = meshData.movement.speed || 2.0;

    // Set start and end positions
    mesh.metadata.startPos = new Vector3(
      meshData.position.x,
      meshData.position.y,
      meshData.position.z
    );

    mesh.metadata.endPos = new Vector3(
      meshData.movement.endPosition.x,
      meshData.movement.endPosition.y,
      meshData.movement.endPosition.z
    );

    // Define the startMovementAnimation function inside applyMovementData
    const startMovementAnimation = (
      pathPoints: Vector3[],
      speed: number,
      meshId: string,
      mesh: Mesh
    ) => {
      if (!mesh || pathPoints.length < 2) return;

      // Calculate total path length to determine duration
      let totalDistance = 0;
      for (let i = 1; i < pathPoints.length; i++) {
        totalDistance += Vector3.Distance(pathPoints[i - 1], pathPoints[i]);
      }
      const duration = totalDistance / speed;

      // Create animation group
      const animationGroup = new AnimationGroup(
        `previewMotion_${meshId}`,
        this.scene
      );

      // Position animation
      const positionAnim = new Animation(
        `anim_position_${meshId}`,
        "position",
        30,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );

      //  keyframes for movement along the path
      const keyframes: { frame: number; value: Vector3 }[] = [];
      const segmentLength = 1 / (pathPoints.length - 1);

      // forward movement
      for (let i = 0; i < pathPoints.length; i++) {
        keyframes.push({
          frame: i * (30 * duration * segmentLength),
          value: pathPoints[i].clone(),
        });
      }

      // backwards movement
      for (let i = pathPoints.length - 1; i >= 0; i--) {
        keyframes.push({
          frame:
            30 * duration +
            (pathPoints.length - 1 - i) * (30 * duration * segmentLength),
          value: pathPoints[i].clone(),
        });
      }

      positionAnim.setKeys(keyframes);

      // Add animation to mesh and animation group
      animationGroup.addTargetedAnimation(positionAnim, mesh);

      // Start playing the animation in loop
      animationGroup.play(true);
    };

    // Process control points if they exist
    if (
      meshData.movement.controlPoints &&
      meshData.movement.controlPoints.length > 0
    ) {
      mesh.metadata.controlPoints = meshData.movement.controlPoints.map(
        (point: any) => ({
          x: point.x,
          y: point.y,
          z: point.z,
        })
      );

      console.log(
        `Loaded ${mesh.metadata.controlPoints.length} control points for mesh ${mesh.name}`
      );

      // Start the animation with the control points
      if (mesh.metadata.controlPoints.length >= 2) {
        startMovementAnimation(
          mesh.metadata.controlPoints.map(
            (point: any) => new Vector3(point.x, point.y, point.z)
          ),
          mesh.metadata.speed,
          mesh.name,
          mesh
        );
      }
    } else {
      // If no control points, create a simple path from start to end
      const simplePathPoints = [mesh.metadata.startPos, mesh.metadata.endPos];

      console.log(
        `Creating simple path for mesh ${mesh.name} with start and end points`
      );

      startMovementAnimation(
        simplePathPoints,
        mesh.metadata.speed,
        mesh.name,
        mesh
      );
    }
  }

  private _applyPhysicsAndRotation(
    mesh: Mesh,
    meshData: SerializedMesh
  ): Mesh | void {
    let mass = 0;
    let friction = 0.2;
    let restitution = 0.2;

    if (!mesh.metadata) {
      mesh.metadata = {};
    }

    if (meshData.physics && meshData.physics.enabled) {
      mass = meshData.physics.mass || 0;
      friction = meshData.physics.friction || 0.2;
      restitution = meshData.physics.restitution || 0.2;
    }

    // set up the physics metadata with the values we just determined
    mesh.metadata.physics = {
      enabled: true,
      mass: mass,
      friction: friction,
      restitution: restitution,
    };

    let m = mesh;
    // Get all child meshes that have vertices
    const childMeshes = mesh
      .getChildMeshes()
      .filter(
        (childMesh) =>
          childMesh instanceof Mesh && childMesh.getTotalVertices() > 0
      );

    // console.log(
    //   `Found ${childMeshes.length} child meshes with vertices for ${mesh.name}`
    // );

    if (childMeshes.length === 0) {
      console.warn(`No geometry found for physics in ${mesh.name}`);
      return;
    }
    // console.warn("debug metatdat : ", meshData);

    // CREATING A ROTATING MESH
    if (meshData.rotation_animation && meshData.rotation_animation?.enabled) {
      // console.warn("CREATING A ROTATING MESH");
      childMeshes.forEach((child) => {
        const physicsAggregate = new PhysicsAggregate(
          child,
          PhysicsShapeType.MESH,
          {
            mass: 0,
            friction: friction,
            restitution: restitution,
          },
          this.scene
        );

        physicsAggregate.body.disablePreStep = false;
        physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);

        this.scene.registerBeforeRender(() => {
          // child.rotate(new Vector3(0, 1, 0), 1 * 0.01);
          child.rotate(
            new Vector3(
              meshData.rotation_animation?.axis.x || 0,
              meshData.rotation_animation?.axis.y || 1,
              meshData.rotation_animation?.axis.z || 0
            ),
            1 * (meshData.rotation_animation?.speed ?? 0.01)
          );
        });
      });
      // physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);

      // CREATING A NON ROTATING MESH
    } else {
      mesh.refreshBoundingInfo(true);
      mesh.computeWorldMatrix(true);

      // TO REMOVE //////////////////////////////////////////////////////////////////////////////////////////
      ///// using THE MESH SHAPE COLLISIONS BOX INSTEAD OF A BOX
      // https://playground.babylonjs.com/#K7TJIG#400
      // https://forum.babylonjs.com/t/creating-a-box-physics-body-for-an-external-mesh-transform-node/47426
      // https://playground.babylonjs.com/#S7E00P#408
      // https://forum.babylonjs.com/t/collision-impostors-for-imported-meshes-imperfect/42394/3
      // const newRoot = new TransformNode("newRoot");
      // mesh.parent = newRoot;
      ///////////////////////////////////////////////////////////////////////////////////////////////////////

      // https://doc.babylonjs.com/typedoc/classes/BABYLON.PhysicsShape
      var shape = new BABYLON.PhysicsShape(
        {
          type: BABYLON.PhysicsShapeType.MESH,
          parameters: { mesh: mesh, includeChildMeshes: true },
        },
        this.scene
      );

      // https://doc.babylonjs.com/typedoc/interfaces/BABYLON.PhysicsMaterial
      const physMaterial: PhysicsMaterial = {
        friction: friction,
        restitution: restitution,
      };
      shape.material = physMaterial;

      if (meshData.movement && meshData.movement.enabled) {
        // console.warn("CREATING A ANIMATED MESH for mesh: ", mesh.name);
        // Create physics body as ANIMATED type

        const body = new BABYLON.PhysicsBody(
          mesh,
          PhysicsMotionType.STATIC,
          false,
          this.scene
        );
        body.shape = shape;

        // Store physics body in mesh metadata
        mesh.metadata.physicsBody = body;

        // Set the body to be animated
        body.disablePreStep = false;
        body.setMotionType(PhysicsMotionType.ANIMATED);
        // Make the platform a "parent" of anything standing on it
        const observer = this.scene.onBeforeRenderObservable.add(() => {
          // Check if character is on platform - Improved version

          // Get all scene meshes and check which ones are standing on this platform
          const character = this.player.player;

          // check if character is colliding with the mesh
          if (character) {
            // Get the character's bounding box
            const characterBoundingBox =
              character.getBoundingInfo().boundingBox;
            // console.log("character bounding box : ", characterBoundingBox);
            const charPosition = character.getAbsolutePosition();
            // get the mesh bounding box
            const meshBoundingBox = mesh.getBoundingInfo().boundingBox;
            // console.log("mesh bounding box : ", meshBoundingBox);
            const meshPosition = mesh.getAbsolutePosition();

            // check if the character is colliding with the mesh its position in the meshBounding box
            const isOnPlatform =
              charPosition.x >= meshPosition.x - meshBoundingBox.extendSize.x &&
              charPosition.x <= meshPosition.x + meshBoundingBox.extendSize.x &&
              charPosition.z >= meshPosition.z - meshBoundingBox.extendSize.z &&
              charPosition.z <= meshPosition.z + meshBoundingBox.extendSize.z &&
              charPosition.y >= meshPosition.y - meshBoundingBox.extendSize.y &&
              charPosition.y <= meshPosition.y + meshBoundingBox.extendSize.y;
            // console.log("is on platform : ", isOnPlatform);

            // CHECK IF CHARACTER IS ON  TO DO :
            // IMPLEMENT THIS IN ORDER TO KEEP THE CHARACTER ON THE MOVING OBJECT (HORIZONTALLY WITH A RESITANCE BASED ON THE MASS OF THE PLAYER )

            // const isOnPlatform =
            //   Math.abs(characterBottom - platformTop) < 0.2 &&
            //   character.position.x >=
            //     mesh.position.x -
            //       mesh.getBoundingInfo().boundingBox.extendSize.x &&
            //   character.position.x <=
            //     mesh.position.x +
            //       mesh.getBoundingInfo().boundingBox.extendSize.x &&
            //   character.position.z >=
            //     mesh.position.z -
            //       mesh.getBoundingInfo().boundingBox.extendSize.z &&
            //   character.position.z <=
            //     mesh.position.z +
            //       mesh.getBoundingInfo().boundingBox.extendSize.z;

            // if (isOnPlatform) {
            //   console.log("PLayer on the moving object");
            //   // If character is on platform but not yet parented
            //   if (character.parent !== mesh) {
            //     // Store original world position
            //     const worldPos = character.getAbsolutePosition();

            //     // Parent to platform
            //     character.parent = mesh;

            //     // Maintain world position (prevents "jumping")
            //     character.position = worldPos;
            //     character.position.subtractInPlace(mesh.position);
            //   }
            // } else if (character.parent === mesh) {
            //   // If character left platform, unparent it
            //   const worldPos = character.getAbsolutePosition();
            //   character.parent = null;
            //   character.position = worldPos;
            // }
          }
        });
      } else if (mass > 0) {
        const body = new BABYLON.PhysicsBody(
          mesh,
          PhysicsMotionType.DYNAMIC,
          false,
          this.scene
        );
        body.shape = shape;
        body.setMassProperties({
          mass: mass,
        });
      } else {
        const body = new BABYLON.PhysicsBody(
          mesh,
          PhysicsMotionType.STATIC,
          false,
          this.scene
        );
        body.shape = shape;
      }
    }

    this.gameEnv.addShadowsToMesh(m);

    // console.log(
    //   `loaded physics data for mesh ${mesh.name}: mass=${mass}, friction=${friction}, restitution=${restitution}`
    // );

    return m;
  }

  private _applyWinMesh(mesh: Mesh, meshData: SerializedMesh): void {
    if (meshData?.isWinMesh === true) {
      mesh.metadata.isWinMesh = true;
      console.warn("Setting win mesh to : ", mesh.name);

      // Create UI in top right corner showing the win object
      this._createWinObjectUI(mesh, meshData);

      // when player collides with the win mesh window alert the player
      this.player.setWinCollisionMesh(mesh, () => {
        window.alert("You win! Congratulations!");
      });
    }
  }

  // @ts-ignore
  private _createWinObjectUI(mesh: Mesh, meshData: SerializedMesh): void {
    const ui = AdvancedDynamicTexture.CreateFullscreenUI(
      "WinObjectUI",
      true,
      this.scene
    );
    const container = new StackPanel("winObjectContainer");
    container.width = "200px";
    container.color = "white";
    container.background = "rgba(0, 0, 0, 0.5)";
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    container.top = "20px";
    container.left = "-20px";
    container.paddingTop = "10px";
    container.paddingBottom = "10px";
    ui.addControl(container);

    const titleText = new TextBlock("winObjectTitle", "Win Object");
    titleText.color = "white";
    titleText.fontSize = 16;
    titleText.height = "30px";
    titleText.paddingBottom = "0px";
    container.addControl(titleText);

    let imgPath = this.assetManager.getAssetImageUrl(meshData.modelId || "");
    if (!imgPath) {
      console.warn(
        `No image found for modelId ${meshData.modelId}. Using default placeholder.`
      );
      imgPath = ""; // empty string
    }

    const img = UIComponentsFactory.createImagePreview(
      "winObjectImage",
      imgPath
    );
    img.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    img.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    img.width = "80px";
    img.height = "80px";
    container.addControl(img);

    const infoText = new TextBlock(
      "winObjectInfo",
      "Find the right one to win!"
    );
    infoText.color = "white";
    infoText.fontSize = 14;
    infoText.height = "30px";
    infoText.paddingTop = "0px";
    container.addControl(infoText);
  }
}
