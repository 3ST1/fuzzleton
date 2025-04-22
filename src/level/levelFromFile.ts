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
import { AssetManagerService } from "../levelCreator/AssetManager";
import { ObjectController } from "../levelCreator/ObjectController";
import { GameEnvironment } from "../GameEnvironnement";

const meshesDocData = {
  name: "MyLevel",
  meshes: [
    {
      id: "placed-tileLarge_teamYellow-1744892455445",
      type: "model",
      modelId: "tileLarge_teamYellow",
      rootFolder: "/kaykit/",
      filename: "tileLarge_teamYellow.gltf.glb",
      position: {
        x: 0,
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
      filename: "tileLarge_teamYellow.gltf.glb",
      position: {
        x: 6,
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
    },
    {
      id: "placed-ring_teamYellow-1744831113442",
      type: "model",
      modelId: "ring_teamYellow",
      rootFolder: "/kaykit/",
      filename: "ring_teamYellow.gltf.glb",
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
      filename: "barrierLadder.gltf.glb",
      position: {
        x: -141.65918288993208,
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
        x: 2.717944050000005,
        y: 2.717944050000005,
        z: 2.717944050000005,
      },
    },
    {
      id: "placed-swiperLong_teamRed-1744844024680",
      type: "model",
      modelId: "swiperLong_teamRed",
      rootFolder: "/kaykit/",
      filename: "swiperLong_teamRed.gltf.glb",
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
        enabled: false,
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
        restitution: 3.2,
      },
    },
    {
      id: "placed-ball_teamYellow-1744844050160",
      type: "model",
      modelId: "ball_teamYellow",
      rootFolder: "/kaykit/",
      filename: "ball_teamYellow.gltf.glb",
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
    },
    {
      id: "placed-tileLow_teamRed-1744876237326",
      type: "model",
      modelId: "tileLow_teamRed",
      rootFolder: "/kaykit/",
      filename: "tileLow_teamRed.gltf.glb",
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

export class levelFromFile {
  scene: Scene;
  assetManager: AssetManagerService;
  objectController!: ObjectController;
  addedAssets: any[] = [];
  gameEnv: GameEnvironment;

  constructor(
    scene: Scene,
    gameEnv: GameEnvironment,
    meshesDoc: any = meshesDocData
  ) {
    this.scene = scene;
    this.gameEnv = gameEnv;
    this.assetManager = new AssetManagerService(scene);
    this.assetManager.initializeAssetsManager(this.scene);
    this.addNeededAssetsToTheAssetManager(meshesDoc);
    this.loadLevel(meshesDoc);
  }

  addNeededAssetsToTheAssetManager(meshesDoc: any) {
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

  private loadModelMesh(meshData: any): Mesh | null | undefined {
    console.log(`Creating model mesh with ID: ${meshData.modelId}`);
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
      new Vector3(
        meshData.position.x,
        meshData.position.y,
        meshData.position.z
      ),
      this.scene,
      false,
      0,
      false
    );
  }

  async loadLevel(meshesDoc: any) {
    console.log("Loading level...");
    await this.assetManager.loadAssetsAsync();
    meshesDoc.meshes.forEach((meshData: any) => {
      if (meshData.type === "model") {
        const newMesh = this.loadModelMesh(meshData);
        console.warn("mesh returned : ", newMesh);
        if (newMesh instanceof Mesh) {
          console.warn("applying mesh properties ", newMesh);
          this.applyMeshProperties(newMesh, meshData);
        }
      } else {
        console.error(`Unknown mesh type: ${meshData.type}`);
      }
    });
  }

  public applyMeshProperties(mesh: Mesh, meshData: any): void {
    console.log(`Successfully created mesh: ${mesh.name}`);

    // Set properties from saved data
    mesh.scaling = new Vector3(
      meshData.scaling.x,
      meshData.scaling.y,
      meshData.scaling.z
    );

    // Set rotation if available
    // if (meshData.rotation) {
    //   mesh.rotationQuaternion = new Quaternion(
    //     meshData.rotation.x,
    //     meshData.rotation.y,
    //     meshData.rotation.z,
    //     meshData.rotation.w
    //   );
    // }

    // Initialize metadata if needed
    if (!mesh.metadata) {
      mesh.metadata = {};
    }

    // Initialize metadata if needed
    if (!mesh.metadata) {
      mesh.metadata = {};
    }

    if (meshData.movement && meshData.movement.enabled) {
      this.applyMovementData(mesh, meshData);
    } else {
      // Apply physics data first - it may return a new merged mesh
      let activeMesh = mesh;
      const mergedMesh = this.applyPhysicsData(mesh, meshData);
      if (mergedMesh) {
        activeMesh = mergedMesh;
        console.log(
          `Using merged mesh for further operations: ${activeMesh.name}`
        );
      } else {
        console.log(
          `No physics mesh created, using original: ${activeMesh.name}`
        );
      }
    }

    // Apply rotation animation data using the correct mesh
    // this.applyRotationAnimationData(activeMesh, meshData);

    // Apply movement data if available
    // this.applyMovementData(mesh, meshData);

    // Apply additional metadata from the saved data
    if (meshData.metadata) {
      // Preserve existing metadata and add any missing properties
      Object.keys(meshData.metadata).forEach((key) => {
        if (key !== "type" && key !== "modelId") {
          // Skip these as they're already set
          mesh.metadata[key] = meshData.metadata[key];
        }
      });
    }
  }

  private applyMovementData(mesh: Mesh, meshData: any): void {
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
        this.startMovementAnimation(
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

      this.startMovementAnimation(
        simplePathPoints,
        mesh.metadata.speed,
        mesh.name,
        mesh
      );
    }
  }

  private startMovementAnimation(
    pathPoints: Vector3[],
    speed: number,
    meshId: string,
    previewMesh: Mesh
  ) {
    if (!previewMesh || pathPoints.length < 2) return;

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
    animationGroup.addTargetedAnimation(positionAnim, previewMesh);

    // Start playing the animation in loop
    animationGroup.play(true);

    // console.log(
    //   `Animation started for mesh ${meshId} with ${pathPoints.length} points and duration ${duration}`
    // );
  }

  // private applyPhysicsData(mesh: Mesh, meshData: any): void {
  //   if (!meshData.physics || !meshData.physics.enabled) {
  //     return;
  //   }

  //   mesh.metadata.physics = {
  //     enabled: true,
  //     mass: meshData.physics.mass || 0,
  //     friction: meshData.physics.friction || 0.2,
  //     restitution: meshData.physics.restitution || 0.2,
  //   };

  //   console.warn(mesh);
  //   const childs = mesh.getChildren();
  //   console.warn("nb childs:", childs.length);
  //   const childMeshes = childs.filter(
  //     (mesh) => (mesh as Mesh).getTotalVertices() > 0
  //   );

  //   console.warn("child meshes having vertices :", childMeshes.length);

  //   const mass = mesh.metadata.physics.mass;
  //   const friction = mesh.metadata.physics.friction;
  //   const restitution = mesh.metadata.physics.restitution;
  //   // childMeshes.forEach((mesh) => {
  //   //   console.warn("child mesh : ", mesh);
  //   //   const physicsAggregate = new PhysicsAggregate(
  //   //     mesh as TransformNode,
  //   //     PhysicsShapeType.MESH,
  //   //     {
  //   //       mass: mass,
  //   //       friction: friction,
  //   //       restitution: restitution,
  //   //     },
  //   //     this.scene
  //   //   );
  //   // });

  //   // Create a compound physics body for the entire mesh hierarchy
  //   const physicsAggregate = new PhysicsAggregate(
  //     mesh,
  //     PhysicsShapeType.MESH,
  //     {
  //       mass: mass,
  //       friction: friction,
  //       restitution: restitution,

  //       includeChildMeshes: true
  //     },
  //     this.scene
  //   );
  //   // physicsAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
  //   // physicsAggregate.body.disablePreStep = false;

  //   this.gameEnv.addShadowsToMesh(mesh);

  //   console.log(
  //     `Loaded physics data for mesh ${mesh.name}: mass=${mesh.metadata.physics.mass}, friction=${mesh.metadata.physics.friction}, restitution=${mesh.metadata.physics.restitution}`
  //   );
  // }

  private applyPhysicsData(mesh: Mesh, meshData: any): Mesh | void {
    let mass = 0;
    let friction = 0.2;
    let restitution = 0.2;

    // Initialize physics metadata with defaults first
    if (!mesh.metadata) {
      mesh.metadata = {};
    }

    // Get physics values from meshData instead of from mesh.metadata (which doesn't exist yet)
    if (meshData.physics && meshData.physics.enabled) {
      mass = meshData.physics.mass || 0;
      friction = meshData.physics.friction || 0.2;
      restitution = meshData.physics.restitution || 0.2;
    }

    // Now set up the physics metadata with the values we just determined
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

    console.log(
      `Found ${childMeshes.length} child meshes with vertices for ${mesh.name}`
    );

    if (childMeshes.length === 0) {
      console.warn(`No geometry found for physics in ${mesh.name}`);
      return;
    }
    console.warn("metatdat : ", meshData);
    if (meshData.rotation_animation && meshData.rotation_animation?.enabled) {
      console.warn("CREATING A ROTATING MESH");
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
          child.rotate(new Vector3(0, 1, 0), 1 * 0.01);
        });
      });
      // physicsAggregate.body.setMotionType(PhysicsMotionType.ANIMATED);

      // mergedMesh.setPivotPoint(new Vector3(0, 1, 0));
      // this.scene.registerBeforeRender(() => {
      //   mergedMesh.rotate(new Vector3(0, 1, 0), 1 * 0.01);
      // });
    } else {
      // Create a clone that combines all child geometries into one mesh
      // const mergedMesh = Mesh.MergeMeshes(
      //   childMeshes as Mesh[],
      //   true,
      //   true,
      //   undefined,
      //   false,
      //   true
      // );
      // // const mergedMesh = null;

      // if (!mergedMesh) {
      //   console.error("Failed to merge meshes for physics");
      //   return;
      // }

      // // Position the merged mesh at the parent's position
      // mergedMesh.position = mesh.position.clone();
      // mergedMesh.rotationQuaternion = mesh.rotationQuaternion
      //   ? mesh.rotationQuaternion.clone()
      //   : null;
      // mergedMesh.scaling = mesh.scaling.clone();

      // // Make it invisible - we'll use the original meshes for rendering
      // mergedMesh.isVisible = true;
      // mergedMesh.name = `${mesh.name}_merged_physics`;

      mesh.refreshBoundingInfo(true);
      mesh.computeWorldMatrix(true);

      // Create a single physics aggregate for the parent mesh
      // const physicsAggregate = new PhysicsAggregate(
      //   mesh,
      //   PhysicsShapeType.MESH,
      //   {
      //     mass: mass,
      //     friction: friction,
      //     restitution: restitution,
      //     includeChildMeshes: true, // This makes all child meshes part of one compound body
      //   },
      //   this.scene
      // );

      // // If this has mass, make sure it's dynamic
      // if (mass > 0) {
      //   physicsAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
      // }

      // console.log(
      //   `Created compound physics body for ${mesh.name} with ${childMeshes.length} child meshes`
      // );

      // https://playground.babylonjs.com/#K7TJIG#400
      // https://forum.babylonjs.com/t/creating-a-box-physics-body-for-an-external-mesh-transform-node/47426
      // https://playground.babylonjs.com/#S7E00P#408
      // https://forum.babylonjs.com/t/collision-impostors-for-imported-meshes-imperfect/42394/3
      // const newRoot = new TransformNode("newRoot");
      // mesh.parent = newRoot;

      // const { min, max } = newRoot.getHierarchyBoundingVectors();

      // const size = max.subtract(min);

      // const center = min.add(max).scale(0.5);

      // console.log("mesh world center", center.toString());

      // const shape = new PhysicsShapeBox(
      //   new Vector3(center.x, center.y, center.z),
      //   Quaternion.Identity(),
      //   size,
      //   this.scene
      // );

      ////////////////////////////////////////////// TO FIX USING A THE MESH SHAPE COLLISIONS BOX INSTEAD OF A BOX
      // const shape = new PhysicsShape(
      //   {
      //     type: PhysicsShapeType.CONVEX_HULL,
      //     parameters: { mesh: mesh, includeChildMeshes: true },
      //   },
      //   this.scene
      // );

      // const body = new PhysicsBody(
      //   newRoot,
      //   PhysicsMotionType.DYNAMIC,
      //   false,
      //   this.scene
      // );
      // body.shape = shape;
      // body.setMassProperties({ mass: 1 });
      /////////////////////////////////

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

      if (mass > 0) {
        const body = new BABYLON.PhysicsBody(
          mesh,
          BABYLON.PhysicsMotionType.DYNAMIC,
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
          BABYLON.PhysicsMotionType.STATIC,
          false,
          this.scene
        );
        body.shape = shape;
      }

      // physicsViewer.showBody(palmBody);

      // const viewer = new BABYLON.Debug.PhysicsViewer();
      // viewer.showBody(body);

      //and/or
      // mesh.computeWorldMatrix(true);
      ////////////////////////////////////////////////////////////
      // childMeshes.forEach((child) => {
      //   const physicsAggregate = new PhysicsAggregate(
      //     child,
      //     PhysicsShapeType.MESH,
      //     {
      //       mass: mass,
      //       friction: friction,
      //       restitution: restitution,
      //     },
      //     this.scene
      //   );
      // });
      /////////////////////////////////////////////////////////////

      // const m0 = mesh[0];
      // m0.refreshBoundingInfo(true);
      // m0.computeWorldMatrix(true);
      // const physicsAggregate = new PhysicsAggregate(
      //   mesh,
      //   PhysicsShapeType.MESH,
      //   {
      //     mass: mass,
      //     friction: friction,
      //     restitution: restitution,
      //   },
      //   this.scene
      // );
      // Create physics on the merged mesh
      // const physicsAggregate = new PhysicsAggregate(
      //   mergedMesh,
      //   PhysicsShapeType.MESH,
      //   {
      //     mass: mass,
      //     friction: friction,
      //     restitution: restitution,
      //   },
      //   this.scene
      // );

      // Make sure we initialize metadata on the merged mesh
      // if (!mergedMesh.metadata) {
      //   mergedMesh.metadata = {};
      // }

      // // Copy metadata from the original mesh
      // Object.assign(mergedMesh.metadata, mesh.metadata);

      // // this.scene.registerBeforeRender(() => {
      // //   mergedMesh.rotate(new Vector3(0, 1, 0), 0.1);
      // // });

      // mesh.dispose();
      // m = mergedMesh;
    }

    // // Make the original mesh hierarchy follow the physics mesh
    // this.scene.onBeforeRenderObservable.add(() => {
    //   mesh.position.copyFrom(mergedMesh.position);

    //   if (mesh.rotationQuaternion && mergedMesh.rotationQuaternion) {
    //     mesh.rotationQuaternion.copyFrom(mergedMesh.rotationQuaternion);
    //   }
    // });

    this.gameEnv.addShadowsToMesh(m);

    // console.log(
    //   `Loaded physics data for mesh ${mesh.name}: mass=${mass}, friction=${friction}, restitution=${restitution}`
    // );

    return m;
  }
}
