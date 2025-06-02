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
import { addPhysicsAggregate } from "./utils";
import { c } from "vite/dist/node/moduleRunnerTransport.d-CXw_Ws6P";
import PlayerController from "./player/thirdPersonController";

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
  private light!: DirectionalLight;
  private shadowGenerator!: ShadowGenerator;
  ground: any;
  skybox!: Mesh;
  private hemiLight!: HemisphericLight;
  private mainDirLight!: DirectionalLight;

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
      // this.camera.radius = 12;
      this.camera.lowerRadiusLimit = 4;
      this.camera.upperRadiusLimit = 55;
      this.camera.lowerBetaLimit = 0.1;

      // this.camera.checkCollisions = true; // FIND A WAY TO NOT LAG when a lot of objects are in the scene
      // ->  PROBABLY DO A RAYCASTING TO CHECK IF THE CAMERA IS COLLIDING WITH THE GROUND
      const defaultRadius = 12; // normal camera distance from target
      const minRadiusAtMaxBeta = 5; // closest distance when looking very upward
      const minRadius = 4; // absolute minimum radius (used for zoomT calculation)
      const betaThreshold = Math.PI / 2.4; // angle at which camera starts zooming in when looking up
      const maxBetaDefault = Math.PI / 2.25; // Normal upper limit for vertical camera angle
      const maxBetaZoomed = 1.65; // Max vertical angle allowed when zoomed in (almost straight up)

      this.scene.registerBeforeRender(() => {
        if (!this.ground || !this.camera) return; // Make sure ground and camera exist

        const cam = this.camera;
        const camPos = cam.position;
        const beta = cam.beta; // current vertical angle of camera

        const groundY = this.ground.getHeightAtCoordinates(camPos.x, camPos.z);
        if (groundY === null) return; // no ground height info we skip

        // Calculate how zoomed in the camera is (0 = far, 1 = close)
        const zoomT = Math.min(
          1,
          (defaultRadius - cam.radius) / (defaultRadius - minRadius)
        );

        // Calculate the base safe height of the target
        const baseSafeY = groundY + 3;

        // height added to the target based on zoom amount (up to +3)
        const extraTargetYOffset = Scalar.Lerp(0, 3, zoomT);

        // final safe target height (base + extra offset)
        const safeTargetY = baseSafeY + extraTargetYOffset;

        // Slowly move target Y upwards if it's below safe height
        if (cam.target.y < safeTargetY) {
          cam.target.y = Scalar.Lerp(cam.target.y, safeTargetY, 0.1);
        }

        // Same safe height applied to camera position Y to avoid clipping the ground
        const safeCameraY = baseSafeY + extraTargetYOffset;

        // Slowly move camera Y upwards if below safe height
        if (camPos.y < safeCameraY) {
          cam.position.y = Scalar.Lerp(camPos.y, safeCameraY, 0.1);
        }

        // If camera is looking up beyond threshold, zoom camera in
        if (beta > betaThreshold) {
          // Calculate progress between threshold and looking straight up
          const t = Math.min(
            1,
            (beta - betaThreshold) / (Math.PI / 2 - betaThreshold)
          );

          // We interpolate thz radius between default and minRadiusAtMaxBeta based on t
          const targetRadius = Scalar.Lerp(
            defaultRadius,
            minRadiusAtMaxBeta,
            t
          );

          // Smoothly update camera radius towards target radius
          cam.radius = Scalar.Lerp(cam.radius, targetRadius, 0.05);
        } else {
          // If looking less steep, smoothly reset radius to default distance
          cam.radius = Scalar.Lerp(cam.radius, defaultRadius, 0.02);
        }

        // Adjust max vertical angle allowed based on zoom amount (look higher when zoomed in)
        cam.upperBetaLimit = Scalar.Lerp(maxBetaDefault, maxBetaZoomed, zoomT);

        // Slowly nudge beta back toward default vertical angle when not looking up
        const defaultBeta = Math.PI / 2.25;
        if (Math.abs(beta - defaultBeta) > 0.01) {
          cam.beta = Scalar.Lerp(beta, defaultBeta, 0.01);
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

  private _setupLights(): void {
    // Hemispheric light for ambient lightning
    this.hemiLight = new HemisphericLight(
      "HemiLight",
      new Vector3(0, 1, 0),
      this.scene
    );
    this.hemiLight.intensity = 0.4;
    this.hemiLight.diffuse = new Color3(0.7, 0.5, 0.5);
    this.hemiLight.specular = new Color3(0.7, 0.5, 0.3);
    this.hemiLight.groundColor = new Color3(0.6, 0.5, 0.5);

    // Main DirectionalLight Light
    var light = new DirectionalLight(
      "MainDirLight",
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
    light.orthoRight = 500; // Right X boundary*

    this.mainDirLight = light;

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

    // Adding a small abient fog
    this.scene.fogMode = Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.0009;
    this.scene.fogColor = new Color3(0.85, 0.75, 0.65);
    // this.scene.fogMode = Scene.FOGMODE_EXP;
  }

  private _setupShadows(): void {
    // Shadows
    // this.shadowGenerator = [];
    this.shadowGenerator = new ShadowGenerator(2048, this.mainDirLight);

    this.shadowGenerator.mapSize = 14000;
    this.shadowGenerator.bias = 0.001;
    this.shadowGenerator.normalBias = 0.02;
    // this.shadowGenerator.useBlurExponentialShadowMap = false;
    this.shadowGenerator.useKernelBlur = true;
    this.shadowGenerator.blurKernel = 256;
    this.shadowGenerator.usePercentageCloserFiltering = true;
    this.shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;

    // this.bisShadowGenerator = new ShadowGenerator(2048, lightbis);
    // // this.shadowGenerators.push(new ShadowGenerator(4096, light2));
    // // this.shadowGenerators.push(new ShadowGenerator(2048, spotLight));
    // this.bisShadowGenerator.mapSize = 512;
    // this.bisShadowGenerator.bias = 0.001;
    // this.bisShadowGenerator.normalBias = 0.01;
    // this.bisShadowGenerator.useBlurExponentialShadowMap = true;
    // this.bisShadowGenerator.useKernelBlur = true;
    // this.bisShadowGenerator.blurKernel = 256;
    // this.bisShadowGenerator.usePercentageCloserFiltering = true;
    // this.bisShadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
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
    const onGroundCreated = (
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
      const textureLink = "/api/assets/textures/woodPlanks.jpg"; // https://mycould.tristan-patout.fr/api/fuzzelton/assets/textures/woodPlanks.jpg
      const groundTexture = new Texture(textureLink, this.scene);
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
    };

    const groundOptions = {
      width: 500,
      height: 500,
      subdivisions: 500,
      minHeight: 0,
      // if we pass an heightmap, we set the max height to 100 else 1 (flat ground)
      maxHeight: heightMapPath === "" ? 1 : 100,
    };

    if (heightMapPath === "") {
      // PLANE GROUND
      this.ground = MeshBuilder.CreateGround(
        "groundBox",
        groundOptions,
        this.scene
      );
      onGroundCreated(this.ground);
    } else {
      // // FROM HEIGHTMAP
      this.ground = MeshBuilder.CreateGroundFromHeightMap(
        "groundHeightmap",
        heightMapPath,
        {
          ...groundOptions,
          onReady: (ground: GroundMesh) => onGroundCreated(ground, true),
        },
        this.scene
      );
    }
  }

  // >TO REMOVE
  private async testBallAndHeavyCube(): Promise<void> {
    const {
      meshes: heroMeshes,
      skeletons,
      animationGroups,
    } = await SceneLoader.ImportMeshAsync(
      "",
      "/api/assets/models/",
      "beachBall.glb", // https://mycould.tristan-patout.fr/api/fuzzelton/assets/models/beachBall.glb
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

    // // Add physics to the sphere
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
    // TO DO
  }

  public updateFps(fps: number) {
    this.fpsText.text = "FPS: " + fps.toFixed(0);
  }

  public updateTipsText(text: string) {
    this.infosText.text = text;
  }

  public setupBeforeRender(
    scene: Scene,
    engine: Engine,
    char: PlayerController
  ): void {
    scene.onBeforeRenderObservable.add(() => {
      this.updateFps(engine.getFps());
      if (this.scene) {
        char.updatePlayer(this.scene.deltaTime);
      }

      // TEST MAX DISTANCE DISABLE
      // const maxDistance = 100;
      const maxDistance = 500;

      const playerPos = char.player.position;

      scene.meshes.forEach((mesh) => {
        if (!mesh || !mesh.physicsBody) return;

        const dist = Vector3.Distance(mesh.position, playerPos);

        if (dist > maxDistance) {
          // Far away: disable rendering and physics
          mesh.setEnabled(false);
        } else {
          // Nearby enable mesh if not already
          if (!mesh.isEnabled()) mesh.setEnabled(true);
        }
      });
    });

    scene.onBeforeAnimationsObservable.add(() => {
      char.onBeforeAnimations();
    });
  }

  public setupGameEnvironment(thirdPers: boolean = true): void {
    this._setupLights();
    this._setupShadows();
    this._setupSkybox();
    this._setupGround(); // if you want to use heightmap, pass the path to the heightmap image like that this._setupGround("./heightmaps/dunes.png")
    // this._setupGround("./heightmaps/dunes.png")
    this._setupPlayerCamera(this.canvas, thirdPers);
    // this.testBallAndHeavyCube();
    this.setupInfosGUI();
    this.setupDebugGUI();

    console.log("Environment loaded!");
  }
}
