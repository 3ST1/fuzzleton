import {
  Scene,
  AssetsManager,
  TransformNode,
  Vector3,
  AssetContainer,
  Material,
  Mesh,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";

// Handles asset loading and management for the level creator

export class AssetManagerService {
  // Singleton instance
  // We use a private static variable to hold the instance
  // private static _instance: AssetManagerService | null = null;

  private assetsManager!: AssetsManager;
  public modelAssets: { [key: string]: AssetContainer } = {};
  private allAssestsLoaded: boolean = false;
  // Track which assets have already been added to the manager
  private addedAssets: Set<string> = new Set();
  // Add storage for asset paths
  private assetPaths: {
    [key: string]: { rootPath: string; filename: string };
  } = {};
  private scene!: Scene;

  // Add storage for asset image URLs
  private assetImageUrls: { [key: string]: string } = {};

  constructor(scene: Scene) {
    // WE REMOVED THIS AND THE assetsManager will now be automatically initialized when needed (in loadAssets or loadAssetsAsync is called)
    this.scene = scene;
    this.initializeAssetsManager();
  }

  // Static methods to get/set the singleton instance
  // public static setInstance(scene: Scene): AssetManagerService {
  //   if (!AssetManagerService._instance) {
  //     AssetManagerService._instance = new AssetManagerService(scene);
  //     console.log("AssetManagerService instance created");
  //   } else {
  //     console.warn(
  //       "AssetManagerService instance already exists, returning the existing instance"
  //     );
  //   }
  //   return AssetManagerService._instance;
  // }
  // public static getInstance(): AssetManagerService {
  //   if (!AssetManagerService._instance) {
  //     throw new Error(
  //       "AssetManagerService instance not created.\
  //        Please call setInstance with a scene first \
  //        (scene can be changed later wiht changeScene or directly through loadAssets or loadAssetsAsync  )."
  //     );
  //   }
  //   return AssetManagerService._instance;
  // }

  // Initialize the AssetsManager for the scene

  public initializeAssetsManager(): AssetsManager {
    console.log("Initializing assets manager...");
    if (!this.assetsManager) {
      console.log("Creating new AssetsManager instance");
      this.assetsManager = new AssetsManager(this.scene);
    } else {
      console.log("Using existing AssetsManager instance");
    }

    this.assetsManager.onProgress = (
      remainingCount,
      totalCount,
      // @ts-ignore
      lastFinishedTask
    ) => {
      // console.log(
      //   "Loading assets: ",
      //   remainingCount,
      //   " out of ",
      //   totalCount,
      //   " items still need to be loaded."
      // );

      if (this.scene) {
        const engine = this.scene.getEngine();
        if (engine) {
          engine.loadingUIText =
            "Loading the scene... " +
            remainingCount +
            " out of " +
            totalCount +
            " items still need to be loaded.";
        }
      }
    };

    this.scene.getEngine().loadingScreen.loadingUIBackgroundColor = "orange";

    // Add this code to continue loading when a task fails
    this.assetsManager.onTaskError = (task) => {
      console.warn(
        `ERROR - Failed to load asset: ${task.name}`,
        task.errorObject
      );
      console.log(`Will continue loading: true`);
      this.assetsManager.removeTask(task); // Remove the task to avoid blocking
      return true; // Return true to continue loading other assets
    };

    this.assetsManager.onFinish = (tasks) => {
      console.log("All assets loaded: ", tasks);
    };

    return this.assetsManager;
  }

  // public changeScene(scene: Scene): void {
  //   console.log("Changing scene for AssetManager");
  //   this.scene = scene;
  //   this.initializeAssetsManager(); // Reinitialize the assets manager for the new scene
  // }

  // Loads an asset from the specified path
  public addAssetToAssetManager(
    rootPath: string,
    filename: string,
    id: string,
    _onSuccess: (task: any) => void = () => {},
    _onError: (task: any) => void = () => {}
  ): void {
    // Use clean ID without additional prefixes or timestamps
    console.log(id);
    const cleanId = id.replace(/^placed-/, "").split("-")[0]; // Remove prefix and timestamp
    const taskId = `task-${id}-${Date.now()}`; // Use a separate ID for the task

    console.log(`Adding asset with clean ID: ${cleanId}, task ID: ${taskId}`);

    // Store the path information for this asset using clean ID
    this.assetPaths[cleanId] = {
      rootPath: rootPath,
      filename: filename,
    };

    const onSuccess = (task) => {
      _onSuccess(task);
      // Store loaded meshes to create a template
      const originalMeshes = task.loadedMeshes;

      // Create a proper container for cloning the model later
      const container = new AssetContainer(task.scene);

      // Add everything from the loaded task to the container
      container.meshes = [...originalMeshes];
      container.skeletons = [...task.loadedSkeletons];
      container.animationGroups = [...task.loadedAnimationGroups];
      container.particleSystems = [...task.loadedParticleSystems];

      // Make sure to collect all materials
      const materials: Material[] = [];
      originalMeshes.forEach((mesh) => {
        if (mesh.material && !materials.includes(mesh.material)) {
          materials.push(mesh.material);
          container.materials.push(mesh.material);
        }
      });

      // Hide original meshes without disposing them
      originalMeshes.forEach((mesh) => {
        mesh.setEnabled(false);
      });

      // Store container using clean ID for consistent lookup
      this.modelAssets[cleanId] = container;

      // Then we store the image URL for this asset (must be a PNG !!!!!!!)
      const splitFilename = filename.split("/");
      const filenameOnly = splitFilename.pop() || "";
      const path = splitFilename.join("/");
      const imagePath =
        rootPath +
        (path ? path + "/" : "") +
        "previews/" +
        filenameOnly.replace(/\.[^/.]+$/, ".png");

      this.setAssetImageUrl(cleanId, imagePath);
    };

    const onError = (task) => {
      _onError(task);
      console.error("Error loading asset: ", task.errorObject);
      // Remove the path info for failed loads using clean ID
      delete this.assetPaths[cleanId];
      // Optionally, remove the model from modelAssets if it was partially loaded
      if (this.modelAssets[cleanId]) {
        this.modelAssets[cleanId].dispose(); // Dispose the container if it exists
        delete this.modelAssets[cleanId]; // Remove from modelAssets
      }
      console.warn(
        `Removed asset with clean ID: ${cleanId} from modelAssets due to error`
      );
      return;
    };

    // Pass taskId to the mesh task for uniqueness, but store with cleanId
    this.addItem(rootPath, filename, taskId, onSuccess, onError);
  }

  // Create a raw clone of all meshes in a model container
  private createRawClone(
    container: AssetContainer,
    namePrefix: string,
    // targetScene: Scene, // seems like we cannot pass meshes from one scene to another so we will use multiple AssetManager and reload everything each time ...
    rootMesh: Mesh,
    modelId?: string
  ): void {
    // Map to keep track of original mesh to clone relationships
    const meshMap = new Map<Mesh, Mesh>();

    console.log(
      `Starting to clone ${container.meshes.length} meshes for ${namePrefix}`
    );

    // Store metadata only if this is a placed mesh and we have modelId (for the leveCreator )
    // if this is juste a preview (during dragged and drop) we don't need to store metadata as th object is temporary
    if (modelId && !namePrefix.startsWith("preview")) {
      // Get asset path information
      const assetPath = this.getAssetPathFromId(modelId);

      // Initialize metadata object if it doesn't exist
      if (!rootMesh.metadata) {
        rootMesh.metadata = {};
      }

      // Store model information in metadata
      rootMesh.metadata.modelId = modelId;
      rootMesh.metadata.type = "model";

      // Store file path information if available
      if (assetPath) {
        rootMesh.metadata.rootFolder = assetPath.rootPath;
        rootMesh.metadata.fileName = assetPath.filename;
      }

      // console.log(`Added metadata to root mesh: modelId=${modelId}`);
    }

    // Now first we clone all meshes but don't set parents yet
    container.meshes.forEach((originalMesh) => {
      if (originalMesh instanceof Mesh) {
        // Make sure original mesh is visible first (for proper cloning)
        const wasVisible = originalMesh.isVisible;
        originalMesh.isVisible = true;

        // Clone with all properties and geometry
        const clone = originalMesh.clone(
          `${namePrefix}-${originalMesh.name}`,
          null,
          true
        );

        // Restore original visibility
        originalMesh.isVisible = wasVisible;

        if (clone) {
          // Ensure the clone is visible and enabled
          clone.isVisible = true;
          clone.setEnabled(true);
          clone.isPickable = true;

          // Add metadata to child mesh as well for better tracking
          if (modelId && !namePrefix.startsWith("preview") && !clone.metadata) {
            clone.metadata = {
              parentModelId: modelId,
              type: "modelPart",
            };
          }

          // Check if material needs to be cloned
          if (originalMesh.material) {
            if (namePrefix.startsWith("preview")) {
              // For previews, create semi-transparent materials
              const clonedMaterial = originalMesh.material.clone(
                `${namePrefix}-${originalMesh.material.name}`
              );
              clone.material = clonedMaterial;
              if (clone.material) {
                clone.material.alpha = 0.6;
                clone.material.wireframe = true; // we display the wire frame of the mesh only
              }
            } else {
              // For placed objects, just copy the material
              clone.material = originalMesh.material.clone(
                `${namePrefix}-${originalMesh.material.name}`
              );
            }
          }

          meshMap.set(originalMesh, clone);
          console.log(
            `Cloned mesh: ${clone.name}, isVisible: ${clone.isVisible}`
          );
        } else {
          console.warn(`Failed to clone mesh: ${originalMesh.name}`);
        }
      }
    });

    // Now set up parent-child relationships
    container.meshes.forEach((originalMesh) => {
      if (originalMesh instanceof Mesh) {
        const clone = meshMap.get(originalMesh);
        if (clone) {
          if (originalMesh.parent && originalMesh.parent instanceof Mesh) {
            // If parent exists in our map, use that
            const parentClone = meshMap.get(originalMesh.parent);
            if (parentClone) {
              clone.parent = parentClone;
              console.log(
                `Set parent for ${clone.name} to ${parentClone.name}`
              );
            } else {
              // Otherwise attach to root
              clone.parent = rootMesh;
              console.log(
                `No parent clone found, attaching ${clone.name} to root mesh`
              );
            }
          } else {
            // No parent in original, attach to root
            clone.parent = rootMesh;
            console.log(
              `No original parent, attaching ${clone.name} to root mesh`
            );
          }
        }
      }
    });

    // Log the result
    console.log(`Created ${meshMap.size} cloned meshes for ${namePrefix}`);

    // Ensure root mesh is visible
    rootMesh.isVisible = true;
    rootMesh.setEnabled(true);

    // Debug all child meshes of the root
    const childMeshes = rootMesh.getChildMeshes();
    console.log(
      `Root mesh ${rootMesh.name} has ${childMeshes.length} child meshes`
    );
    childMeshes.forEach((mesh, index) => {
      console.log(
        `Child ${index}: ${mesh.name}, isVisible: ${
          mesh.isVisible
        }, hasParent: ${mesh.parent !== null}`
      );
    });
  }

  // Create a model instance at a specific position
  public createModelInstance(
    modelId: string,
    position: Vector3, // NOW GRID SIZE MUST BE APPLIED ON POSITION BEFORE PASSING IT HERE
    // targetScene: Scene, // it seems like we cannot pass meshes from one scene to another so we will use multiple AssetManager and reload everything each time ...
    // snapToGrid: boolean = false,
    // gridSize: number = 2,
    // scaling: boolean = true,
    scalingFactor: number = 1
  ): Mesh | null {
    try {
      console.log(
        `AssetManager: Creating instance of ${modelId} at position :${position}`
      );
      const container = this.modelAssets[modelId];

      if (!container) {
        console.error(
          `Model ${modelId} not found in loaded assets : `,
          this.modelAssets
        );
        return null;
      }

      // Create a timestamp for unique naming
      const timestamp = Date.now();

      // Create a root mesh to hold the model
      // const rootMesh = new Mesh(`placed-${modelId}-${timestamp}`, targetScene);
      const rootMesh = new Mesh(`placed-${modelId}-${timestamp}`, this.scene);
      rootMesh.isVisible = true; // Ensure the root is visible

      // Set name based on modelId for better identification
      rootMesh.name = `model-${modelId}`;

      // Use our direct cloning method instead of instantiateModelsToScene
      // Pass the modelId to store in metadata
      this.createRawClone(
        container,
        `placed-${timestamp}`,
        // targetScene,
        rootMesh,
        modelId
      );

      // Apply position (with grid snapping if enabled)
      rootMesh.position.y = 0;
      // console.log("snap to grid ? ", snapToGrid);
      // if (snapToGrid) {
      //   rootMesh.position.x = Math.round(position.x / gridSize); // gridSize;
      //   rootMesh.position.y = 0; //Math.round(position.y / gridSize) // gridSize;
      //   rootMesh.position.z = Math.round(position.z / gridSize); // gridSize;
      // } else {
      // console.warn("position: ", position);
      rootMesh.position = new Vector3(position.x, position.y, position.z);
      // }
      // console.warn(
      //   `placed model at: X:${rootMesh.position.x}, Y:${rootMesh.position.y}, Z:${rootMesh.position.z}`
      // );

      // if (scaling) {
      if (scalingFactor !== 1) {
        rootMesh.scaling = new Vector3(
          scalingFactor,
          scalingFactor,
          scalingFactor
        );
      }

      // Make sure the mesh is in the scene
      if (!this.scene.meshes.includes(rootMesh)) {
        console.warn("Root mesh not found in scene - adding it explicitly");
        this.scene.addMesh(rootMesh);
      }
      // if (!targetScene.meshes.includes(rootMesh)) {
      //   console.warn("Root mesh not found in scene - adding it explicitly");
      //   targetScene.addMesh(rootMesh);
      // }

      console.log(
        `Placed model at: X:${rootMesh.position.x}, Y:${rootMesh.position.y}, Z:${rootMesh.position.z}`
      );

      return rootMesh;
    } catch (error) {
      console.error(`Failed to create model instance for ${modelId}:`, error);
      return null;
    }
  }

  // Create a preview instance of a model
  public createModelPreview(
    modelId: string,
    // targetScene: Scene,
    scalingFactor = 1
  ): Mesh | null {
    try {
      console.log(`AssetManager: Creating preview for ${modelId} `);
      const container = this.modelAssets[modelId];

      if (!container) {
        console.error(
          `Model ${modelId} not found in loaded assets. Available models:`,
          Object.keys(this.modelAssets)
        );
        return null;
      }

      console.log(
        `AssetManager: Found container for ${modelId} with ${container.meshes.length} meshes`
      );

      // Create a temporary root mesh to hold the model
      const previewRoot = new Mesh(`preview-${modelId}`, this.scene);
      // const previewRoot = new Mesh(`preview-${modelId}`, targetScene);
      previewRoot.isVisible = true;

      // Add preview metadata
      previewRoot.metadata = {
        isPreview: true,
        modelId: modelId,
        type: "modelPreview",
      };

      try {
        this.createRawClone(container, `preview`, previewRoot);
        // this.createRawClone(container, `preview`, targetScene, previewRoot);

        previewRoot.scaling = new Vector3(
          scalingFactor,
          scalingFactor,
          scalingFactor
        );

        // Add to scene
        if (!this.scene.meshes.includes(previewRoot)) {
          console.log("Adding preview mesh to scene explicitly");
          this.scene.addMesh(previewRoot);
        }
        // if (!targetScene.meshes.includes(previewRoot)) {
        //   console.log("Adding preview mesh to scene explicitly");
        //   targetScene.addMesh(previewRoot);
        // }

        return previewRoot;
      } catch (error) {
        console.error(`AssetManager: Error instantiating model:`, error);
        previewRoot.dispose();
        return null;
      }
    } catch (error) {
      console.error(
        `AssetManager: Failed to create model preview for ${modelId}:`,
        error
      );
      return null;
    }
  }

  // Load multiple assets from a list of filenames (modelsFiles)
  public addModelsToAssetManager(
    rootPath: string,
    modelsFiles: string[]
  ): void {
    modelsFiles.forEach((filename) => {
      const modelId = this.getModelIdFromFilename(filename);
      this.addAssetToAssetManager(rootPath, filename, modelId);
    });
  }

  // Extract model ID from filename
  getModelIdFromFilename(filename: string): string {
    // Remove file extension and any path and placed timestamp and model
    const cleanName = filename
      .replace(/\.gltf$/, "")
      .replace(/\.glb$/, "")
      .replace(/\.png$/, "");

    return cleanName;
  }

  // Set an image URL for a specific model ID
  public setAssetImageUrl(modelId: string, imageUrl: string): void {
    this.assetImageUrls[modelId] = imageUrl;
  }

  // Get the image URL for a model, constructing it if not already set
  public getAssetImageUrl(modelId: string): string | null {
    // First check if we have a stored URL
    if (this.assetImageUrls[modelId]) {
      return this.assetImageUrls[modelId];
    }

    // Try to construct the URL from asset path
    const pathObj = this.getAssetPathFromId(modelId);
    if (!pathObj) {
      return null;
    }

    const splitFilename = pathObj.filename.split("/");
    const filename = splitFilename.pop() || "";
    const path = splitFilename.join("/");
    const imagePath =
      pathObj.rootPath +
      (path ? path + "/" : "") +
      "previews/" +
      filename.replace(/\.[^/.]+$/, ".png");

    this.setAssetImageUrl(modelId, imagePath);

    return imagePath;
  }

  // Add an item to the assets manager
  private addItem(
    rootUrl: string,
    model: string,
    id: string,
    onSuccess: any = null,
    onError: any = null
  ) {
    if (!rootUrl || !model) {
      console.error("No asset provided -> not adding it to the scene.");
      return false;
    }

    // Check if this exact asset has already been added to the manager
    const assetKey = `${rootUrl}/${model}`;
    if (this.addedAssets.has(assetKey)) {
      console.log(`Asset ${assetKey} already added to manager, skipping`);
      // If the asset already exists and we have a success callback, call it
      if (onSuccess && this.modelAssets[this.getModelIdFromFilename(model)]) {
        // Create a simulated task object with the loaded meshes
        const simulatedTask = {
          loadedMeshes: [],
          loadedSkeletons: [],
          loadedAnimationGroups: [],
          loadedParticleSystems: [],
          scene: this.scene,
        };
        onSuccess(simulatedTask);
      }
      return true;
    }

    // Mark that we're adding a new asset
    this.allAssestsLoaded = false;

    // Add to our tracking set
    this.addedAssets.add(assetKey);

    const meshTask = this.assetsManager.addMeshTask(id, "", rootUrl, model);

    // Pass in custom function to call after asset loads
    meshTask.onSuccess = onSuccess;

    // On error, just get rid of any problematic meshes
    meshTask.onError = (task) => {
      if (task.loadedMeshes && task.loadedMeshes.length > 0) {
        task.loadedMeshes.forEach((mesh) => {
          mesh.dispose();
        });
      }
      if (onError) onError(task);

      // Remove the path info for failed loads
      delete this.assetPaths[id];

      // Remove from tracking set
      this.addedAssets.delete(assetKey);
    };
    return meshTask;
  }

  // Start loading all registered assets
  public loadAssets(
    // scene: Scene, // so we are sure the asset manager always has the wanted scene by forcing the scene to be passed
    onFinish?: () => void
  ): void {
    console.warn(
      "AssetManager: Starting to load assets with loadAssets function. We recommend using loadAssetsAsync instead for better async handling."
    );
    // if (scene.uid !== this.scene?.uid) {
    //   console.warn("Scene has changed, resetting AssetManager");
    //   this.changeScene(scene);
    // }

    // Check if there are any pending tasks to load
    const hasPendingTasks =
      this.assetsManager.useDefaultLoadingScreen ||
      Object.keys(this.assetPaths).some((id) => !this.modelAssets[id]);

    if (!hasPendingTasks) {
      console.log("No assets to load, marking as complete");
      this.allAssestsLoaded = true;
      if (typeof onFinish === "function") {
        try {
          onFinish();
        } catch (error) {
          console.error("Error in onFinish callback:", error);
        }
      }
      return;
    }

    // Set up the onFinish callback for assets manager
    // @ts-ignore
    this.assetsManager.onFinish = (tasks) => {
      this.allAssestsLoaded = true;
      console.log(
        "All assets loaded, available models:",
        Object.keys(this.modelAssets)
      );
      if (typeof onFinish === "function") {
        try {
          onFinish();
        } catch (error) {
          console.error("Error in onFinish callback:", error);
        }
      }
    };

    if (this.allAssestsLoaded) {
      console.log("All assets already loaded, skipping load");
      if (typeof onFinish === "function") {
        try {
          onFinish();
        } catch (error) {
          console.error("Error in onFinish callback:", error);
        }
      }
      return;
    }

    this.assetsManager.load();
  }

  public async loadAssetsAsync(
    // scene: Scene, // so we are sure the asset manager always has the wanted scene by forcing the scene to be passed
    onFinish?: () => void
  ): Promise<void> {
    // if (scene.uid !== this.scene?.uid) {
    //   console.warn("Scene has changed resetting it in AssetManager");
    //   this.changeScene(scene);
    // }

    console.log("starting loadAssets Async ");
    if (this.allAssestsLoaded) {
      console.log("All assets already loaded, skipping load");
      if (typeof onFinish === "function") {
        try {
          onFinish();
        } catch (error) {
          console.error("Error in onFinish callback:", error);
        }
      }
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.loadAssets(() => {
        // this.loadAssets(scene, () => {
        console.log("AssetManager: All Assets loaded successfully");
        if (typeof onFinish === "function") {
          try {
            onFinish();
          } catch (error) {
            console.error("Error in onFinish callback:", error);
          }
        }
        resolve();
      });
    });
  }

  // Checks if the modelId exists (or a similar one) TO BE IMPROVED (bc problem if we have a model like ball and yellow_ball, might returns yellow_ball for ball ? !
  public checkIfModelIdExist(modelId: string): string | null {
    // Check the model exists in our loaded assets
    if (!this.modelAssets[modelId]) {
      console.warn(
        `Model with ID ${modelId} not found in loaded models: `,
        this.modelAssets
      );

      // Try to find by name match
      const models = Object.keys(this.modelAssets);
      const similarModel = models.find(
        (id) =>
          id.toLowerCase() === modelId.toLowerCase() ||
          id.includes(modelId) ||
          modelId.includes(id)
      );

      if (similarModel) {
        console.log(
          `Found similar model: ${similarModel} instead of ${modelId}`
        );
        return similarModel;
      }

      return null;
    } else if (this.modelAssets[modelId]) {
      return modelId;
    }

    return null;
  }

  // Check if all assets are loaded
  public hasFinishLoading(): boolean {
    // Check if assets manager has finished loading
    // return Object.keys(this.modelAssets).length > 0; /// HERE
    return this.allAssestsLoaded;
  }

  // Gets a list of all available model IDs that are loaded
  public getAvailableModelIds(): string[] {
    return Object.keys(this.modelAssets);
  }

  // Get the root path and filename for an asset based on its ID
  public getAssetPathFromId(
    modelId: string
  ): { rootPath: string; filename: string } | null {
    // First, check if we have the path information stored
    if (this.assetPaths[modelId]) {
      return this.assetPaths[modelId];
    }

    // Check if the model exists in our assets
    if (!this.modelAssets[modelId]) {
      console.warn(`Model with ID ${modelId} not found in loaded models`);

      // Try to find by similar name match
      const models = Object.keys(this.modelAssets);
      const similarModel = models.find(
        (id) =>
          id.toLowerCase() === modelId.toLowerCase() ||
          id.includes(modelId) ||
          modelId.includes(id)
      );

      if (similarModel && this.assetPaths[similarModel]) {
        console.log(
          `Found similar model: ${similarModel} instead of ${modelId}`
        );
        return this.assetPaths[similarModel];
      }

      return null;
    }

    // This is a fallback in case we somehow have the asset loaded but don't have path info
    // (should not normally happen)
    // return {
    //   rootPath: "/kaykit/", // Default root path
    //   filename: `${modelId}.gltf.glb`, // Constructed filename
    // };
    throw new Error(
      `Asset path for model ID ${modelId} not found in assetPaths : ${this.assetPaths}`
    );
  }

  // check if a model exists
  public modelExists(modelId: string): boolean {
    try {
      // Check if the model exists in the asset manager
      const modelRoot = this.checkIfModelIdExist(modelId);
      if (modelRoot !== null) {
        return true;
      }

      // If not found directly, try to find a similar name
      const availableModels = this.getAvailableModelIds();
      if (!availableModels || availableModels.length === 0) {
        console.warn("No models available in asset manager");
        return false;
      }

      // Try to find an approximate match
      const match = availableModels.find(
        (id) =>
          id.toLowerCase() === modelId.toLowerCase() ||
          id.includes(modelId) ||
          modelId.includes(id)
      );

      if (match) {
        console.log(`Found approximate model match: ${match} for ${modelId}`);
        modelId = match;
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error checking if model exists: ${modelId}`, error);
      return false;
    }
  }

  // Add the missing changeScene method
  // public changeScene(scene: Scene): void {
  //   console.log("Changing scene for AssetManager");
  //   this.scene = scene;
  //   this.initializeAssetsManager(); // Reinitialize the assets manager for the new scene
  // }
}
