import {
  Scene,
  HemisphericLight,
  ArcRotateCamera,
  Vector3,
  Texture,
  CubeTexture,
  StandardMaterial,
  MeshBuilder,
  Color3,
  FreeCamera,
  ShadowGenerator,
  DirectionalLight,
  PhysicsAggregate,
  PhysicsShapeType,
  TransformNode,
  Mesh,
  PBRMaterial,
  Tools,
  Engine,
  Color4,
  PhysicsMotionType,
  PhysicsBody,
  Scalar,
  Ray,
  GroundMesh,
  SpotLight,
  SceneLoader,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";
import { addPhysicsAggregate } from "./App";

// create a type for the objects to add physics
export type MyEnvObjsToAddPhysics = {
  mesh: TransformNode;
  physicsShapeType: PhysicsShapeType;
  mass: number;
  friction: number;
  restitution: number;
};

export class GameEnvironment {
  private scene: Scene;
  private canvas: HTMLCanvasElement;
  camera!: ArcRotateCamera;
  light!: DirectionalLight;
  shadowGenerator!: ShadowGenerator;
  ground: any;

  //   public camera: FreeCamera;
  // objectsToAddPhysics: MyEnvObjsToAddPhysics[] = [];
  skybox!: Mesh;
  hemiLight!: HemisphericLight;
  // shadowGenerator: any;
  bisShadowGenerator: any;

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.scene = scene;
    this.canvas = canvas;
  }

  private _setupPlayerCamera(
    canvas: HTMLCanvasElement,
    thirdPers: boolean
  ): void {
    if (thirdPers === true) {
      // Third person camera
      this.camera = new ArcRotateCamera(
        "arcCamera13dpers",
        0,
        0,
        12,
        new Vector3(0, 0, 0),
        this.scene
      );
      this.camera.setPosition(new Vector3(0, 12, 3));
      // zoom in on the player
      this.camera.radius = 12;
      this.camera.lowerRadiusLimit = 10;
      this.camera.upperRadiusLimit = 55;

      // limit camera to certain angles to avoid seeing through the ground
      // this.camera.lowerBetaLimit = 0.1;
      // this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
      // no zooming
      // this.camera.wheelPrecision = 0;
      // this.camera.attachControl(canvas, false);

      this.camera.checkCollisions = true; // FIND A WAY TO NOT LAG when a lot of objects are in the scene
      // ->  PROBABLY DO A RAYCASTING TO CHECK IF THE CAMERA IS COLLIDING WITH THE GROUND
      this.camera.onCollide = (collidedMesh) => {
        // console.log(`Camera collided with: ${collidedMesh.name}`);
        this.camera.position.y += 2; // to avoid going trough the ground for example and little tilt on collision
      };

      this.scene.registerBeforeRender(() => {
        // check if the y position of the camera is below the ground and if it is put it back above
        if (this.ground && this.camera) {
          const groundHeight = this.ground.getHeightAtCoordinates(
            this.camera.position.x,
            this.camera.position.z
          );

          // console.log(
          //   `camera y: ${this.camera.position.y}, ground height: ${groundHeight}`
          // );
          if (this.camera.position.y < groundHeight + 1) {
            // Place the camera above the ground
            this.camera.position.y = groundHeight + 1;
            // console.log("camera position corrected to above ground");
          }
        }
      });
      console.log("created third person camera");
    } else {
      // First person camera but still using ArcRotateCamera
      // TO CONTINUE BUT WE DO NOT USE IT FOR THE MOMENT
      throw console.error("1st person camera not implemented");

      // this.camera = new ArcRotateCamera(
      //   "arcCamera13dpers",
      //   0,
      //   0,
      //   0, // No distance from target for first-person
      //   new Vector3(0, 0, 0),
      //   this.scene
      // );
      // // camera in a first person like pos
      // this.camera.setPosition(new Vector3(0, 0, 0)); // Slightly above ground level (camera height)
      // this.camera.lowerRadiusLimit = 0.1; // Minimal radius to simulate first-person effect
      // this.camera.upperRadiusLimit = 0.1; // To restrict the radius and prevent zooming out

      // // this.camera.alpha = Math.PI / 2; // Start facing the positive Z direction
      // // this.camera.beta = Math.PI / 4; // Adjust beta to control vertical view angle

      // // Enable mouse controls for first-person-like movement (looking around)
      // this.camera.attachControl(canvas, true);
      // // this.camera.pinchPrecision = 0;
    }

    this.camera.attachControl(canvas, false);

    const isLocked = false;
    this.scene.onPointerDown = () => {
      if (!isLocked) {
        canvas.requestPointerLock =
          canvas.requestPointerLock ||
          // @ts-ignore
          canvas.msRequestPointerLock ||
          // @ts-ignore
          canvas.mozRequestPointerLock ||
          // @ts-ignore
          canvas.webkitRequestPointerLock ||
          false;
        if (canvas.requestPointerLock) {
          // isLocked = true;
          canvas.requestPointerLock();
        }
      }
    };
  }
  private _setupLightsAndShadows(): void {
    // Hemispheric light for ambient illumination
    this.hemiLight = new HemisphericLight(
      "HemiLight",
      new Vector3(0, 1, 0),
      this.scene
    );
    this.hemiLight.intensity = 0.4;
    this.hemiLight.diffuse = new Color3(0.7, 0.5, 0.5);
    this.hemiLight.specular = new Color3(0.7, 0.5, 0.3);
    this.hemiLight.groundColor = new Color3(0.6, 0.5, 0.5);

    // Directional Light 1
    var light = new DirectionalLight(
      "lightDir01",
      new Vector3(-1, -1, -1),
      this.scene
    );
    light.position = new Vector3(1000, 500, 350);
    light.intensity = 0.5;

    light.shadowMinZ = -0;
    light.shadowMaxZ = 2500;

    // https://forum.babylonjs.com/t/shadow-getting-clipped/43849/4
    light.autoUpdateExtends = false;
    light.shadowOrthoScale = 0.2; //prevent shadow frustrum clipping,  inflate the frustum  see https://forum.babylonjs.com/t/shadow-getting-clipped/43849
    // Set wide frustum boundaries to cover the entire playable area
    light.orthoTop = 500; // Upper Y boundary (increase if shadows clip vertically)
    light.orthoBottom = -500; // Lower Y boundary
    light.orthoLeft = -500; // Left X boundary
    light.orthoRight = 500; // Right X boundary

    // var lightSphere = Mesh.CreateSphere("sphere", 10, 2, this.scene);
    // lightSphere.position = light.position;
    // lightSphere.material = new StandardMaterial("light", this.scene);
    // (lightSphere.material as StandardMaterial).emissiveColor = new Color3(
    //   1,
    //   1,
    //   0
    // );
    // var lightbis = new DirectionalLight(
    //   "dir01",
    //   new Vector3(-1, -1, -1),
    //   this.scene
    // );
    // lightbis.position = new Vector3(350, 100, 350); // Increased position for better coverage
    // lightbis.intensity = 0.5;
    // // lightbis.intensity = 0;
    // lightbis.shadowMinZ = 0;
    // lightbis.shadowMaxZ = 1000;

    // var lightSphere = Mesh.CreateSphere("sphere", 10, 2, this.scene);
    // lightSphere.position = lightbis.position;
    // lightSphere.material = new StandardMaterial("light", this.scene);
    // (lightSphere.material as StandardMaterial).emissiveColor = new Color3(
    //   1,
    //   1,
    //   0
    // );

    var light2 = new DirectionalLight(
      "dir02",
      new Vector3(1, -1, 1),
      this.scene
    );
    light2.position = new Vector3(-1000, 100, -350);
    light2.intensity = 0.2;
    light2.shadowMinZ = 0;
    light2.shadowMaxZ = 1000;

    var lightSphere2 = Mesh.CreateSphere("sphere", 10, 2, this.scene);
    lightSphere2.position = light2.position;
    lightSphere2.material = new StandardMaterial("light", this.scene);
    (lightSphere2.material as StandardMaterial).emissiveColor = new Color3(
      1,
      1,
      0
    );

    // Shadows
    // this.shadowGenerator = [];
    this.shadowGenerator = new ShadowGenerator(2048, light);
    // this.bisShadowGenerator = new ShadowGenerator(2048, lightbis);
    // // this.shadowGenerators.push(new ShadowGenerator(4096, light2));
    // // this.shadowGenerators.push(new ShadowGenerator(2048, spotLight));

    this.shadowGenerator.mapSize = 14000;
    this.shadowGenerator.bias = 0.001;
    this.shadowGenerator.normalBias = 0.02;
    // this.shadowGenerator.useBlurExponentialShadowMap = false;
    this.shadowGenerator.useKernelBlur = true;
    this.shadowGenerator.blurKernel = 256;
    this.shadowGenerator.usePercentageCloserFiltering = true;
    this.shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;

    // this.bisShadowGenerator.mapSize = 512;
    // this.bisShadowGenerator.bias = 0.001;
    // this.bisShadowGenerator.normalBias = 0.01;
    // this.bisShadowGenerator.useBlurExponentialShadowMap = true;
    // this.bisShadowGenerator.useKernelBlur = true;
    // this.bisShadowGenerator.blurKernel = 256;
    // this.bisShadowGenerator.usePercentageCloserFiltering = true;
    // this.bisShadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;

    // Adding a small abient fog
    this.scene.fogMode = Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.0009;
    this.scene.fogColor = new Color3(0.85, 0.75, 0.65);
    // this.scene.fogMode = Scene.FOGMODE_EXP;
  }

  public addShadowsToMesh(mesh: Mesh): void {
    // console.log("Adding shadows to mesh: ", mesh);
    // if (this.shadowGenerators.length > 0)
    //   this.shadowGenerators.forEach((sg) => {
    //     sg.addShadowCaster(mesh);
    //   });
    mesh.receiveShadows = true;
    this.shadowGenerator.addShadowCaster(mesh);
  }

  public removeShadowsFromMesh(mesh: Mesh): void {
    // this.shadowGenerator.forEach((sg) => {
    //   sg.removeShadowCaster(mesh);
    // });
    this.shadowGenerator.removeShadowCaster(mesh);
    // this.bisShadowGenerator.removeShadowCaster(mesh);
  }

  private _setupSkybox(): void {
    var skybox = MeshBuilder.CreateBox("skybox", { size: 2000 }, this.scene); // Corrected Mesh creation
    var skyboxMaterial = new StandardMaterial("skyboxMat", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true; // Ensures proper display

    // Load the cube texture for the skybox
    skyboxMaterial.reflectionTexture = new CubeTexture(
      "https://playground.babylonjs.com/textures/TropicalSunnyDay", // Corrected URL
      // "./textures/skybox",
      this.scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;

    // Set scene clear color to prevent background override
    this.scene.clearColor = new Color4(0, 0, 0, 0);

    this.skybox = skybox;
  }

  private _setupGround(heightMapPath: string = ""): void {
    const groundOptions = {
      width: 500,
      height: 500,
      subdivisions: 500,
      minHeight: 0,
      maxHeight: heightMapPath === "" ? 1 : 100,
      onReady: (ground: GroundMesh) =>
        this._onGroundCreated(ground, heightMapPath !== ""),
    };

    if (heightMapPath === "") {
      // PLANE GROUND
      const ground: GroundMesh = MeshBuilder.CreateGround(
        "groundBox",
        { width: groundOptions.width, height: groundOptions.height },
        this.scene
      );
      this._onGroundCreated(ground);
    } else {
      // // FROM HEIGHTMAP
      const ground: GroundMesh = MeshBuilder.CreateGroundFromHeightMap(
        "groundHeightmap",
        heightMapPath,
        groundOptions,
        this.scene
      );
    }
  }

  private _onGroundCreated = (
    ground: GroundMesh,
    fromHeightMap: boolean = false
  ): void => {
    // console.log("Ground created: ", ground);
    ground.checkCollisions = true;
    ground.position.y = fromHeightMap ? -100 : 0;

    // Add shadows to the ground
    // this._addShadowCaster(ground);

    // Apply a sand-like material with soft glow
    // const sandMaterial = new StandardMaterial("sandMaterial", this.scene);
    // sandMaterial.diffuseColor = new Color3(1, 0.8, 0.6); // Warm sand color
    // sandMaterial.specularColor = new Color3(0, 0, 0);
    // sandMaterial.emissiveColor = new Color3(0.2, 0.15, 0.1); // Soft glow

    // ground.material = sandMaterial;

    // Load a texture image for the ground
    const groundTexture = new Texture("/textures/woodPlanks.jpg", this.scene);
    groundTexture.uScale = 100;
    groundTexture.vScale = 100;
    ground.material = new StandardMaterial("groundMaterial", this.scene);
    (ground.material as StandardMaterial).diffuseTexture = groundTexture;

    ground.receiveShadows = true;

    if (this.scene.getPhysicsEngine()) {
      const groundPhysics = new PhysicsAggregate(
        ground,
        PhysicsShapeType.MESH, // MESH is better for heightmap terrain
        { mass: 0, friction: 0.5, restitution: 0 },
        this.scene
      );
    }

    this.ground = ground;
  };

  // >TO REMOVE
  private async _initSphere(): Promise<void> {
    const {
      meshes: heroMeshes,
      skeletons,
      animationGroups,
    } = await SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "beachBall.glb",
      this.scene
    );

    const hero = heroMeshes[0];
    hero.scaling = new Vector3(4, 4, 4);
    hero.position = new Vector3(30, 10, 0);

    const sphere = MeshBuilder.CreateSphere(
      "sphereBall",
      { diameter: 8 },
      this.scene
    );
    sphere.position.y = 10;
    sphere.position.x = 30;

    sphere.visibility = 0;

    // Add physics to the sphere
    const physicsAggregate = addPhysicsAggregate(
      this.scene,
      sphere,
      PhysicsShapeType.SPHERE,
      1,
      0.2,
      0.9
    );

    // attach the hero to the sphere
    sphere.addChild(hero);

    const bigBox = MeshBuilder.CreateBox(
      "bigBox",
      { width: 10, height: 10, depth: 10 },
      this.scene
    );
    bigBox.position.y = 50;
    bigBox.position.z = 50;
    bigBox.position.x = 50;
    const bigBoxMaterial = new StandardMaterial("bigBoxMaterial", this.scene);
    bigBoxMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4);
    bigBoxMaterial.specularColor = new Color3(0.4, 0.4, 0.4);
    bigBoxMaterial.emissiveColor = new Color3(0.4, 0.4, 0.4);
    bigBox.material = bigBoxMaterial;

    const boxPhysicsAggregate = new PhysicsAggregate(
      bigBox,
      PhysicsShapeType.MESH,
      { mass: 500000, friction: 100, restitution: 0 },
      this.scene
    );
  }

  // PANEL FPS AND OTHER INFOS
  private advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
  private fpsText = new TextBlock();
  private infosText = new TextBlock();

  private setupInfosGUI(): void {
    this.fpsText.text = "";
    this.fpsText.fontSize = 13;
    this.fpsText.color = "white";
    this.fpsText.paddingLeft = 10;
    this.fpsText.paddingBottom = 10;
    this.fpsText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.fpsText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.advancedTexture.addControl(this.fpsText);

    this.infosText.text = "Press esc to cancel mouse lock \nHold Shift to run";
    this.infosText.fontSize = 13;
    this.infosText.color = "white";
    this.infosText.paddingLeft = 10;
    this.infosText.paddingBottom = 30;
    this.infosText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.infosText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.advancedTexture.addControl(this.infosText);
  }

  private setupDebugGUI(): void {
    // debug info menu that is shown when this.debug is true
    // TO DO ?
  }

  public updateFps(fps: number) {
    this.fpsText.text = "FPS: " + fps.toFixed(0);
  }

  public updateTipsText(text: string) {
    this.infosText.text = text;
  }

  public setupGameEnvironment(thirdPers: boolean = true): void {
    this._setupLightsAndShadows();
    this._setupSkybox();
    this._setupGround(); // if you want to use heightmap, pass the path to the heightmap image like that this._setupGround("./heightmaps/dunes.png")
    // this._setupGround("./heightmaps/dunes.png")
    this._setupPlayerCamera(this.canvas, thirdPers);
    this._initSphere();
    this.setupInfosGUI();
    this.setupDebugGUI();

    console.log("Environment loaded!");
  }
}
