import { Color3, Scene, StandardMaterial } from "@babylonjs/core";

/**
 * Factory for creating common materials
 */
export class MaterialFactory {
  /**
   * Create standard materials used in the level creator
   */
  static createStandardMaterials(scene: Scene): {
    [key: string]: StandardMaterial;
  } {
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new Color3(0.7, 0.7, 0.9);

    const redMat = new StandardMaterial("redMaterial", scene);
    redMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
    redMat.specularColor = new Color3(0.4, 0.4, 0.4);
    redMat.emissiveColor = Color3.Red();

    const greenMat = new StandardMaterial("greenMaterial", scene);
    greenMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
    greenMat.specularColor = new Color3(0.4, 0.4, 0.4);
    greenMat.emissiveColor = Color3.Green();

    const blueMat = new StandardMaterial("blueMaterial", scene);
    blueMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
    blueMat.specularColor = new Color3(0.4, 0.4, 0.4);
    blueMat.emissiveColor = Color3.Blue();

    const purpleMat = new StandardMaterial("purpleMaterial", scene);
    purpleMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
    purpleMat.specularColor = new Color3(0.4, 0.4, 0.4);
    purpleMat.emissiveColor = Color3.Purple();

    return {
      red: redMat,
      green: greenMat,
      blue: blueMat,
      purple: purpleMat,
      ground: groundMaterial,
    };
  }
}
