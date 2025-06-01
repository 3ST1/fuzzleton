import { Scene, Vector3 } from "@babylonjs/core";
import { Platform } from "../objects/Platform";
import { Slope } from "../objects/Slope";
import { Stairs } from "../objects/Stairs";
import { GameObject } from "../objects/GameObject";
import { getRandomColor, getRandomColorMaterial } from "../utils";
class LevelGenerator {
  scene: Scene;
  environment: any;
  generatedLevelObjects: GameObject[] = [];
  lastY!: number;
  lastX!: number;
  lastZ!: number;
  // Constrain x and z within [-75, 75] to updat with the playable area
  maxX = 75;
  minX = -75;
  maxZ = 75;
  minZ = -75;

  constructor(
    scene: Scene,
    environment: any,
    minX = -75,
    maxX = 75,
    minZ = -75,
    maxZ = 75
  ) {
    this.scene = scene;
    this.environment = environment;
    this.minX = minX;
    this.maxX = maxX;
    this.minZ = minZ;
    this.maxZ = maxZ;

    // this.generateLevel();
  }
  getNewRandomPosition(): Vector3 {
    const x = this.lastX + Math.random() * 10 - 5;
    const y = this.lastY + Math.random() * 3;
    const z = this.lastZ + Math.random() * 10 - 5;

    return new Vector3(x, y, z);
  }

  createNewStairs(i: number): void {
    // Next stairs position is randomly generated at a distance less than 5 from the last one (3 for Y)
    const startPos = this.getNewRandomPosition();

    // Random number of steps between 5 and 25
    const nbSteps = Math.floor(Math.random() * 20 + 5);

    // Step width, height and depth
    const stepWidth = Math.random() * 4 + 2; // between 2 and 6
    const stepHeight = Math.random() * 0.25 + 0.25; // between 0.25 and 0.5
    const stepDepth = Math.random() * 4 + 1; // between 1 and 5

    const stairs = new Stairs(
      this.scene,
      this.environment,
      "stairs" + i,
      startPos,
      Math.random() * 360, // Random rotation between 0 and 360 degrees
      nbSteps,
      stepWidth,
      stepHeight,
      stepDepth,
      getRandomColorMaterial(this.scene),
      false
    );

    // Add the stairs to the level objects
    this.generatedLevelObjects.push(stairs);

    // Update the last position
    this.updateLastPosition(stairs.getEndPosition());
  }

  createNewSlope(i: number): void {
    // Next slope position is randomly generated at a distance less than 5 from the last one (3 for Y)
    const startPos = this.getNewRandomPosition();

    // Random width, height, depth and rotation
    const width = Math.random() * 4 + 2; // between 2 and 6
    const height = Math.random() * 0.9 + 0.1; // between 0.1 and 1
    const depth = Math.random() * 9 + 1; // between 1 and 10
    // between -135 and 135 degrees
    // const rotation = Math.random() * 270 - 135;
    // between -60 and 60 degrees
    const rotation = Math.random() * 120 - 60;

    const slope = new Slope(
      this.scene,
      this.environment,
      "slope" + i,
      width,
      height,
      depth,
      rotation,
      startPos,
      getRandomColorMaterial(this.scene),
      false
    );

    // Add the slope to the level objects
    this.generatedLevelObjects.push(slope);

    // Update the last position
    this.updateLastPosition(slope.getEndPosition());
  }

  createNewPlatform(i: number): void {
    // Next platform position is randomly generated at a distance less than 5 from the last one (3 for Y)
    const startPos = this.getNewRandomPosition();

    // 50% chance of cretaing moving platform
    const isMoving = Math.random() < 0.5;

    // If moving, end position is randomly generated at a distance less than 10 from the start position
    let endPos = startPos;
    if (isMoving) {
      endPos = new Vector3(
        startPos.x + Math.random() * 10,
        startPos.y + Math.random() * 10,
        startPos.z + Math.random() * 10
      );
    }

    // Random width, height, depth and speed
    const width = Math.random() * 4 + 1; // between 1 and 5
    const height = Math.random() * 0.9 + 0.1; // between 0.1 and 1
    const depth = Math.random() * 9 + 1; // between 1 and 10

    // Random speed between 1 and 5
    const speed = isMoving ? Math.random() * 4 + 1 : 0;

    const platform = new Platform(
      this.scene,
      this.environment,
      `${isMoving ? "moving" : "fixed"}` + "platform" + i,
      width,
      height,
      depth,
      true,
      startPos,
      endPos,
      speed,
      getRandomColorMaterial(this.scene),
      false
    );

    // Add the platform to the level objects
    this.generatedLevelObjects.push(platform);

    // Update the last position
    this.updateLastPosition(platform.getEndPosition());
  }

  generateUpwardLevel(nbObjs: number): void {
    // start position
    this.lastY = 0;
    this.lastX = 20;
    this.lastZ = 20;

    // randomly generate platforms, slopes and stairs
    for (let i = 0; i < nbObjs; i++) {
      const rand = Math.random();
      if (rand < 0.4) {
        this.createNewPlatform(i);
      } else if (rand < 0.7) {
        this.createNewSlope(i);
      } else {
        this.createNewStairs(i);
      }
    }
  }

  updateLastPosition(position: Vector3): void {
    if (position.x) this.lastX = position.x;
    if (position.y) this.lastY = position.y;
    if (position.z) this.lastZ = position.z;
  }

  public generateLevel(): void {
    this.generateUpwardLevel(100);
  }

  public generateRandomObjects(nbObjs: number): void {
    for (let i = 0; i < nbObjs; i++) {
      const obj = new GameObject(
        this.scene,
        this.environment,
        `randomObj${i}`,
        undefined,
        undefined,
        true
      );

      // Add the random objects to the level objects
      this.generatedLevelObjects.push(obj);
    }
  }

  // TO REMOVE
  generateStairs(): void {
    const s1 = new Stairs(
      this.scene,
      this.environment,
      "stairsP0",
      new Vector3(50, 0, 20),
      0,
      10,
      4,
      0.5,
      2
    );

    const s2 = new Stairs(
      this.scene,
      this.environment,
      "stairsP1",
      s1.endPosition.clone(),
      0,
      10,
      4,
      0.5,
      2
    );

    const s3 = new Stairs(
      this.scene,
      this.environment,
      "stairsP2",
      s2.endPosition.clone(),
      0,
      10,
      4,
      0.5,
      2
    );

    this.generatedLevelObjects.push(s1, s2, s3);
  }

  generatePlatforms(): void {
    const p1 = new Platform(
      this.scene,
      this.environment,
      "platformP1",
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
      "platformP2",
      12,
      0.1,
      12,
      true,
      new Vector3(20, 0, 20),
      new Vector3(40, 10, 40),
      3
    );

    this.generatedLevelObjects.push(p1);
  }

  generateSlopes(): void {
    const s1 = new Slope(
      this.scene,
      this.environment,
      "slopeP1",
      4,
      0.1,
      12,
      -35,
      new Vector3(0, 0, 50)
    );

    const s2 = new Slope(
      this.scene,
      this.environment,
      "slopeP2",
      4,
      0.1,
      12,
      35,
      new Vector3(0, 0, -50)
    );

    const s3 = new Slope(
      this.scene,
      this.environment,
      "slopeP3",
      4,
      0.1,
      25,
      55,
      new Vector3(50, 0, 0)
    );

    this.generatedLevelObjects.push(s1, s2, s3);
  }

  getGeneratedObjects(): GameObject[] {
    return this.generatedLevelObjects;
  }
}

export { LevelGenerator };
