import type { IPhysicsEngine } from "@babylonjs/core/Physics/IPhysicsEngine";
import { GameEnvironment as GameEnvironment } from "./GameEnvironnement";
import {
  AbstractEngine,
  AbstractMesh,
  ActionManager,
  AnimationGroup,
  ArcRotateCamera,
  AssetContainer,
  Color3,
  Color4,
  ExecuteCodeAction,
  HighlightLayer,
  IPhysicsCollisionEvent,
  Mesh,
  MeshBuilder,
  Nullable,
  PhysicsAggregate,
  PhysicsEngine,
  PhysicsEventType,
  PhysicsMotionType,
  PhysicsRaycastResult,
  PhysicsShapeType,
  Quaternion,
  Ray,
  RayHelper,
  Scalar,
  Scene,
  SceneLoader,
  Skeleton,
  Sound,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { GRAVITY } from "./App";
import { FurMaterial } from "@babylonjs/materials";

export class PLayer {
  constructor(
    scene: Scene,
    environnement: GameEnvironment,
    thirdPers: boolean = true
  ) {
    this.scene = scene;
    this.environment = environnement;
    this.camera = environnement.camera;
    this.thirdPerson = thirdPers;
  }

  
}
