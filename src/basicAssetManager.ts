import { Engine } from "@babylonjs/core/Engines/engine";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import { Scene } from "@babylonjs/core/scene";

export const initializeAssetsManager = (
  scene: Scene,
  engine: Engine
): AssetsManager => {
  console.log("Initializing assets manager...");
  const assetsManager = new AssetsManager(scene);
  console.log("Assets manager initialized: ", assetsManager);
  // @ts-ignore
  assetsManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
    console.log(
      "Loading assets: ",
      remainingCount,
      " out of ",
      totalCount,
      " items still need to be loaded."
    );

    engine.loadingUIText =
      "Loading the scene... " +
      remainingCount +
      " out of " +
      totalCount +
      " items still need to be loaded.";
  };

  //put the text at the bottom of the screen
  engine.loadingScreen.loadingUIBackgroundColor = "orange";

  assetsManager.onFinish = (tasks) => {
    console.log("All assets loaded: ", tasks);
    // this.hideLoading();
  };

  return assetsManager;
};

export const addItemToAssetManager = (
  assetsManager: AssetsManager,
  rootUrl: string,
  model: string,
  id: string,
  // @ts-ignore
  onSuccess: any = null,
  // @ts-ignore
  onError: any = null
) => {
  if (!rootUrl || !model) {
    console.error("No asset provided -> not adding it to the scene.");
    return false;
  }

  console.log(
    "Adding the following item to asset manager: ",
    id,
    rootUrl,
    model
  );

  const meshTask = assetsManager.addMeshTask(id, "", rootUrl, model);

  // Pass in custom function to call after asset loads
  meshTask.onSuccess = onSuccess;

  // On error, just get rid of any problematic meshes
  meshTask.onError = (task) => {
    if (task.loadedMeshes && task.loadedMeshes.length > 0) {
      task.loadedMeshes.forEach((mesh) => {
        mesh.dispose();
      });
    }
  };
  return meshTask;
};
