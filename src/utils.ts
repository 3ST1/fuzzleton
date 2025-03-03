import { Color3, PBRMaterial, Scene, StandardMaterial } from "@babylonjs/core";

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
