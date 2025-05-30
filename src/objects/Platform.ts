import {
  Scene,
  Vector3,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Mesh,
  StandardMaterial,
} from "@babylonjs/core";
import {
  GameEnvironment as GameEnvironment,
  MyEnvObjsToAddPhysics,
} from "../GameEnvironnement";
import { addPhysicsAggregate } from "../utils";
import { GameObject } from "./GameObject";

class Platform extends GameObject {
  metadata: { physicsAggregate: PhysicsAggregate } | undefined;

  //   scene: Scene; // defined in GameObject
  //   environment: GameEnvironment; // defined in GameObject
  //   name: string; // defined in GameObject
  width: number;
  height: number;
  depth: number;
  rotation!: number;
  position: Vector3;
  material: any;
  slope!: Mesh;
  //   physicsAggregate: any; // defined in GameObject
  platform!: Mesh;
  moving: boolean;
  endPos!: Vector3;
  speed: number;
  shadows: boolean;

  constructor(
    scene: Scene,
    environment: GameEnvironment,
    name: string = "platform",
    width: number = 12,
    height: number = 0.1,
    depth: number = 12,
    moving: boolean = true,
    startPos: Vector3,
    endPos: Vector3,
    speed: number = 2,
    material: any = new StandardMaterial(
      "elevatorPlatformStandardMaterial",
      scene
    ),
    shadows: boolean = true
  ) {
    super(scene, environment, name, startPos, endPos);
    this.scene = scene;
    this.environment = environment;
    this.name = name;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.position = startPos;
    this.moving = moving;
    // this.endPosition = endPos;
    this.speed = speed;
    this.material = material;
    this.shadows = shadows;

    this._createPlatform(
      scene,
      environment,
      name,
      width,
      height,
      depth,
      moving,
      startPos,
      endPos,
      speed,
      material,
      shadows
    );
  }

  private _createPlatform(
    scene: Scene,
    environment: GameEnvironment,
    name: string = "platform",
    width: number = 12,
    height: number = 0.1,
    depth: number = 12,
    moving: boolean = true,
    startPos: Vector3,
    endPos: Vector3,
    speed: number = 2,
    material: any = new StandardMaterial(
      "elevatorPlatformStandardMaterial",
      scene
    ),
    shadows: boolean = true
  ) {
    this.platform = MeshBuilder.CreateBox(
      name,
      { width: width, height: height, depth: depth },
      scene
    );
    this.platform.receiveShadows = true;
    this.platform.position = startPos.clone();
    if (shadows) environment.addShadowsToMesh(this.platform);
    this.platform.material = material;

    this.physicsAggregate = addPhysicsAggregate(
      scene,
      this.platform,
      PhysicsShapeType.BOX,
      0,
      2,
      0
    );

    // Make the platform kinematic (not affected by physics forces)
    this.physicsAggregate?.body.setMotionType(1);

    let targetPosition = endPos.clone();
    let waitTime = 0; // Tracks waiting time
    let needReset = false;

    if (moving) {
      scene.onBeforeRenderObservable.add((scene) => {
        const actualPosition = this.platform.position;
        const dt = scene.deltaTime;

        if (actualPosition.equalsWithEpsilon(targetPosition, 0.2)) {
          // Swap start and end position when wait time is over
          targetPosition = targetPosition.equals(endPos)
            ? startPos.clone()
            : endPos.clone();
        }

        const direction = targetPosition.subtract(actualPosition).normalize();

        // Move platform
        if (this.physicsAggregate) {
          this.physicsAggregate.body.setLinearVelocity(direction.scale(speed));
        } else {
          this.platform.position.addInPlace(direction.scale(speed * dt));
        }
      });
    }
  }

  // public dispose() {
  //   this.physicsAggregate.dispose();
  //   this.environment.removeShadowsFromMesh(this.platform);
  //   this.platform.dispose();
  // }
}
export { Platform };
