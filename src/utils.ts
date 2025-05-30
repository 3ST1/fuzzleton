import {
  Color3,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  Texture,
  TransformNode,
} from "@babylonjs/core";

export function getRandomColor(): [Color3, string] {
  const num = Math.floor(Math.random() * 16777215).toString(16);
  return [Color3.FromHexString("#" + num), num];
}

export function getRandomColorMaterial(scene: Scene): StandardMaterial {
  const [randomColor, num] = getRandomColor();
  const material = new StandardMaterial("material_" + num, scene);
  material.diffuseColor = randomColor;
  return material;
}

export function getPBRMaterial(
  this: any,
  color: Color3 = new Color3(1, 1, 1)
): PBRMaterial {
  const pbr = new PBRMaterial("pbr", this.scene);

  // Set color properties
  pbr.albedoColor = color; // Set to red (RGB: 1, 0, 0)

  // Set metallic and roughness properties
  pbr.metallic = 0.0;
  pbr.roughness = 0;

  // Set sub-surface scattering for refraction
  pbr.subSurface.isRefractionEnabled = true;
  pbr.subSurface.indexOfRefraction = 1.8;

  return pbr;
}

import { FurMaterial } from "@babylonjs/materials";

export function getFurMaterial(
  scene: Scene,
  highLevelFur = false,
  furLength = 0.2,
  furAngle = Math.PI / 6,
  furColor = new Color3(1, 1, 1),
  furDiffuseTextureImg = "/api/assets/textures/bluePinkFur.jpg" // (proxied in vite.config.ts to https://mycould.tristan-patout.fr/api/fuzzelton/assets/textures/bluePinkFur.jpg)
): FurMaterial {
  const fur = new FurMaterial("furT", scene);
  fur.highLevelFur = highLevelFur;
  fur.furLength = furLength;
  fur.furAngle = furAngle;
  // fur.furAngle = 0;
  fur.furColor = furColor;
  // fur.furSpacing = 6;
  // fur.furDensity = 100;
  // fur.furSpeed = 200;
  // fur.furGravity = new Vector3(0, -1, 0);
  fur.furTexture = FurMaterial.GenerateTexture("furTexture", scene);
  fur.diffuseTexture = new Texture(furDiffuseTextureImg, scene);
  // fur.furTexture = FurMaterial.GenerateTexture("furTexture", scene);

  return fur;
}

// TO DO : move this away ( do we still really need it ? )
export function addPhysicsAggregate(
  scene: Scene,
  meshe: TransformNode,
  shape: PhysicsShapeType,
  mass: number = 0,
  friction: number = 0.5,
  restitution: number = 0
): PhysicsAggregate {
  const physicsAggregate = new PhysicsAggregate(
    meshe,
    shape,
    { mass: mass, friction: friction, restitution: restitution },
    scene
  );

  // Set linear damping based on mass and friction
  // physicsAggregate.body.setLinearDamping(getLinearDamping(mass, friction));

  // Store it inside the mesh for later use (accessible through metadata)
  meshe.metadata = { physicsAggregate };

  return physicsAggregate;
}
