(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory(require("babylonjs"));
  else if (typeof define === "function" && define.amd)
    define("babylonjs-materials", ["babylonjs"], factory);
  else if (typeof exports === "object")
    exports["babylonjs-materials"] = factory(require("babylonjs"));
  else root["MATERIALS"] = factory(root["BABYLON"]);
})(
  typeof self !== "undefined"
    ? self
    : typeof global !== "undefined"
    ? global
    : this,
  (__WEBPACK_EXTERNAL_MODULE_babylonjs_Materials_effect__) => {
    return /******/ (() => {
      // webpackBootstrap
      /******/ "use strict";
      /******/ var __webpack_modules__ = {
        /***/ "../../../dev/materials/src/fur/fur.fragment.ts":
          /*!******************************************************!*\
  !*** ../../../dev/materials/src/fur/fur.fragment.ts ***!
  \******************************************************/
          /***/ (
            __unused_webpack_module,
            __webpack_exports__,
            __webpack_require__
          ) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
              /* harmony export */ furPixelShader: () =>
                /* binding */ furPixelShader,
              /* harmony export */
            });
            /* harmony import */ var babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__ =
              __webpack_require__(
                /*! babylonjs/Shaders/ShadersInclude/imageProcessingCompatibility */ "babylonjs/Materials/effect"
              );
            /* harmony import */ var babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0___default =
              /*#__PURE__*/ __webpack_require__.n(
                babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__
              );
            // Do not edit.

            var name = "furPixelShader";
            var shader =
              "precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;uniform vec4 furColor;uniform float furLength;varying vec3 vPositionW;varying float vfur_length;\n#ifdef NORMAL\nvarying vec3 vNormalW;\n#endif\n#ifdef VERTEXCOLOR\nvarying vec4 vColor;\n#endif\n#include<helperFunctions>\n#include<__decl__lightFragment>[0..maxSimultaneousLights]\n#ifdef DIFFUSE\nvarying vec2 vDiffuseUV;uniform sampler2D diffuseSampler;uniform vec2 vDiffuseInfos;\n#endif\n#ifdef HIGHLEVEL\nuniform float furOffset;uniform float furOcclusion;uniform sampler2D furTexture;varying vec2 vFurUV;\n#endif\n#ifdef LOGARITHMICDEPTH\n#extension GL_EXT_frag_depth : enable\n#endif\n#include<logDepthDeclaration>\n#include<lightsFragmentFunctions>\n#include<shadowsFragmentFunctions>\n#include<fogFragmentDeclaration>\n#include<clipPlaneFragmentDeclaration>\nfloat Rand(vec3 rv) {float x=dot(rv,vec3(12.9898,78.233,24.65487));return fract(sin(x)*43758.5453);}\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\n#include<clipPlaneFragment>\nvec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=furColor;vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;\n#ifdef DIFFUSE\nbaseColor*=texture2D(diffuseSampler,vDiffuseUV);\n#ifdef ALPHATEST\nif (baseColor.a<0.4)\ndiscard;\n#endif\n#include<depthPrePass>\nbaseColor.rgb*=vDiffuseInfos.y;\n#endif\n#ifdef VERTEXCOLOR\nbaseColor.rgb*=vColor.rgb;\n#endif\n#ifdef NORMAL\nvec3 normalW=normalize(vNormalW);\n#else\nvec3 normalW=vec3(1.0,1.0,1.0);\n#endif\n#ifdef HIGHLEVEL\nvec4 furTextureColor=texture2D(furTexture,vec2(vFurUV.x,vFurUV.y));if (furTextureColor.a<=0.0 || furTextureColor.g<furOffset) {discard;}\nfloat occlusion=mix(0.0,furTextureColor.b*1.2,furOffset);baseColor=vec4(baseColor.xyz*max(occlusion,furOcclusion),1.1-furOffset);\n#endif\nvec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;\n#ifdef SPECULARTERM\nvec3 specularBase=vec3(0.,0.,0.);\n#endif\n#include<lightFragment>[0..maxSimultaneousLights]\n#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)\nalpha*=vColor.a;\n#endif\nvec3 finalDiffuse=clamp(diffuseBase.rgb*baseColor.rgb,0.0,1.0);\n#ifdef HIGHLEVEL\nvec4 color=vec4(finalDiffuse,alpha);\n#else\nfloat r=vfur_length/furLength*0.5;vec4 color=vec4(finalDiffuse*(0.5+r),alpha);\n#endif\n#include<logDepthFragment>\n#include<fogFragment>\ngl_FragColor=color;\n#include<imageProcessingCompatibility>\n#define CUSTOM_FRAGMENT_MAIN_END\n}";
            // Sideeffect
            babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStore[
              name
            ] = shader;
            /** @internal */
            var furPixelShader = { name: name, shader: shader };

            /***/
          },

        /***/ "../../../dev/materials/src/fur/fur.vertex.ts":
          /*!****************************************************!*\
  !*** ../../../dev/materials/src/fur/fur.vertex.ts ***!
  \****************************************************/
          /***/ (
            __unused_webpack_module,
            __webpack_exports__,
            __webpack_require__
          ) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
              /* harmony export */ furVertexShader: () =>
                /* binding */ furVertexShader,
              /* harmony export */
            });
            /* harmony import */ var babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__ =
              __webpack_require__(
                /*! babylonjs/Shaders/ShadersInclude/vertexColorMixing */ "babylonjs/Materials/effect"
              );
            /* harmony import */ var babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0___default =
              /*#__PURE__*/ __webpack_require__.n(
                babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__
              );
            // Do not edit.

            var name = "furVertexShader";
            var shader =
              "precision highp float;attribute vec3 position;attribute vec3 normal;\n#ifdef UV1\nattribute vec2 uv;\n#endif\n#ifdef UV2\nattribute vec2 uv2;\n#endif\n#ifdef VERTEXCOLOR\nattribute vec4 color;\n#endif\n#include<bonesDeclaration>\n#include<bakedVertexAnimationDeclaration>\nuniform float furLength;uniform float furAngle;\n#ifdef HIGHLEVEL\nuniform float furOffset;uniform vec3 furGravity;uniform float furTime;uniform float furSpacing;uniform float furDensity;\n#endif\n#ifdef HEIGHTMAP\nuniform sampler2D heightTexture;\n#endif\n#ifdef HIGHLEVEL\nvarying vec2 vFurUV;\n#endif\n#include<instancesDeclaration>\nuniform mat4 view;uniform mat4 viewProjection;\n#ifdef DIFFUSE\nvarying vec2 vDiffuseUV;uniform mat4 diffuseMatrix;uniform vec2 vDiffuseInfos;\n#endif\n#ifdef POINTSIZE\nuniform float pointSize;\n#endif\nvarying vec3 vPositionW;\n#ifdef NORMAL\nvarying vec3 vNormalW;\n#endif\nvarying float vfur_length;\n#ifdef VERTEXCOLOR\nvarying vec4 vColor;\n#endif\n#include<clipPlaneVertexDeclaration>\n#include<logDepthDeclaration>\n#include<fogVertexDeclaration>\n#include<__decl__lightFragment>[0..maxSimultaneousLights]\nfloat Rand(vec3 rv) {float x=dot(rv,vec3(12.9898,78.233,24.65487));return fract(sin(x)*43758.5453);}\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\n#include<instancesVertex>\n#include<bonesVertex>\n#include<bakedVertexAnimation>\nfloat r=Rand(position);\n#ifdef HEIGHTMAP\n#if __VERSION__>100\nvfur_length=furLength*texture(heightTexture,uv).x;\n#else\nvfur_length=furLength*texture2D(heightTexture,uv).r;\n#endif\n#else \nvfur_length=(furLength*r);\n#endif\nvec3 tangent1=vec3(normal.y,-normal.x,0);vec3 tangent2=vec3(-normal.z,0,normal.x);r=Rand(tangent1*r);float J=(2.0+4.0*r);r=Rand(tangent2*r);float K=(2.0+2.0*r);tangent1=tangent1*J+tangent2*K;tangent1=normalize(tangent1);vec3 newPosition=position+normal*vfur_length*cos(furAngle)+tangent1*vfur_length*sin(furAngle);\n#ifdef HIGHLEVEL\nvec3 forceDirection=vec3(0.0,0.0,0.0);forceDirection.x=sin(furTime+position.x*0.05)*0.2;forceDirection.y=cos(furTime*0.7+position.y*0.04)*0.2;forceDirection.z=sin(furTime*0.7+position.z*0.04)*0.2;vec3 displacement=vec3(0.0,0.0,0.0);displacement=furGravity+forceDirection;float displacementFactor=pow(furOffset,3.0);vec3 aNormal=normal;aNormal.xyz+=displacement*displacementFactor;newPosition=vec3(newPosition.x,newPosition.y,newPosition.z)+(normalize(aNormal)*furOffset*furSpacing);\n#endif\n#ifdef NORMAL\nvNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));\n#endif\ngl_Position=viewProjection*finalWorld*vec4(newPosition,1.0);vec4 worldPos=finalWorld*vec4(newPosition,1.0);vPositionW=vec3(worldPos);\n#ifndef UV1\nvec2 uv=vec2(0.,0.);\n#endif\n#ifndef UV2\nvec2 uv2=vec2(0.,0.);\n#endif\n#ifdef DIFFUSE\nif (vDiffuseInfos.x==0.)\n{vDiffuseUV=vec2(diffuseMatrix*vec4(uv,1.0,0.0));}\nelse\n{vDiffuseUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));}\n#ifdef HIGHLEVEL\nvFurUV=vDiffuseUV*furDensity;\n#endif\n#else\n#ifdef HIGHLEVEL\nvFurUV=uv*furDensity;\n#endif\n#endif\n#include<clipPlaneVertex>\n#include<logDepthVertex>\n#include<fogVertex>\n#include<shadowsVertex>[0..maxSimultaneousLights]\n#include<vertexColorMixing>\n#if defined(POINTSIZE) && !defined(WEBGPU)\ngl_PointSize=pointSize;\n#endif\n#define CUSTOM_VERTEX_MAIN_END\n}\n";
            // Sideeffect
            babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStore[
              name
            ] = shader;
            /** @internal */
            var furVertexShader = { name: name, shader: shader };

            /***/
          },

        /***/ "../../../dev/materials/src/fur/furMaterial.ts":
          /*!*****************************************************!*\
  !*** ../../../dev/materials/src/fur/furMaterial.ts ***!
  \*****************************************************/
          /***/ (
            __unused_webpack_module,
            __webpack_exports__,
            __webpack_require__
          ) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
              /* harmony export */ FurMaterial: () => /* binding */ FurMaterial,
              /* harmony export */
            });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_3__ =
              __webpack_require__(
                /*! tslib */ "../../../../node_modules/tslib/tslib.es6.mjs"
              );
            /* harmony import */ var babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__ =
              __webpack_require__(
                /*! babylonjs/Materials/materialHelper.functions */ "babylonjs/Materials/effect"
              );
            /* harmony import */ var babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0___default =
              /*#__PURE__*/ __webpack_require__.n(
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__
              );
            /* harmony import */ var _fur_fragment__WEBPACK_IMPORTED_MODULE_1__ =
              __webpack_require__(
                /*! ./fur.fragment */ "../../../dev/materials/src/fur/fur.fragment.ts"
              );
            /* harmony import */ var _fur_vertex__WEBPACK_IMPORTED_MODULE_2__ =
              __webpack_require__(
                /*! ./fur.vertex */ "../../../dev/materials/src/fur/fur.vertex.ts"
              );

            var FurMaterialDefines = /** @class */ (function (_super) {
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__extends)(
                FurMaterialDefines,
                _super
              );
              function FurMaterialDefines() {
                var _this = _super.call(this) || this;
                _this.DIFFUSE = false;
                _this.HEIGHTMAP = false;
                _this.CLIPPLANE = false;
                _this.CLIPPLANE2 = false;
                _this.CLIPPLANE3 = false;
                _this.CLIPPLANE4 = false;
                _this.CLIPPLANE5 = false;
                _this.CLIPPLANE6 = false;
                _this.ALPHATEST = false;
                _this.DEPTHPREPASS = false;
                _this.POINTSIZE = false;
                _this.FOG = false;
                _this.NORMAL = false;
                _this.UV1 = false;
                _this.UV2 = false;
                _this.VERTEXCOLOR = false;
                _this.VERTEXALPHA = false;
                _this.NUM_BONE_INFLUENCERS = 0;
                _this.BonesPerMesh = 0;
                _this.INSTANCES = false;
                _this.INSTANCESCOLOR = false;
                _this.HIGHLEVEL = false;
                _this.IMAGEPROCESSINGPOSTPROCESS = false;
                _this.SKIPFINALCOLORCLAMP = false;
                _this.LOGARITHMICDEPTH = false;
                _this.AREALIGHTSUPPORTED = true;
                _this.AREALIGHTNOROUGHTNESS = true;
                _this.rebuild();
                return _this;
              }
              return FurMaterialDefines;
            })(
              babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.MaterialDefines
            );
            var FurMaterial = /** @class */ (function (_super) {
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__extends)(
                FurMaterial,
                _super
              );
              function FurMaterial(name, scene) {
                var _this = _super.call(this, name, scene) || this;
                _this.diffuseColor =
                  new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Color3(
                    1,
                    1,
                    1
                  );
                _this.furLength = 1;
                _this.furAngle = 0;
                _this.furColor =
                  new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Color3(
                    0.44,
                    0.21,
                    0.02
                  );
                _this.furOffset = 0.0;
                _this.furSpacing = 12;
                _this.furGravity =
                  new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Vector3(
                    0,
                    0,
                    0
                  );
                _this.furSpeed = 100;
                _this.furDensity = 20;
                _this.furOcclusion = 0.0;
                _this._disableLighting = false;
                _this._maxSimultaneousLights = 4;
                _this.highLevelFur = true;
                _this._furTime = 0;
                return _this;
              }
              Object.defineProperty(FurMaterial.prototype, "furTime", {
                get: function () {
                  return this._furTime;
                },
                set: function (furTime) {
                  this._furTime = furTime;
                },
                enumerable: false,
                configurable: true,
              });
              FurMaterial.prototype.needAlphaBlending = function () {
                return this.alpha < 1.0;
              };
              FurMaterial.prototype.needAlphaTesting = function () {
                return false;
              };
              FurMaterial.prototype.getAlphaTestTexture = function () {
                return null;
              };
              FurMaterial.prototype.updateFur = function () {
                for (var i = 1; i < this._meshes.length; i++) {
                  var offsetFur = this._meshes[i].material;
                  offsetFur.furLength = this.furLength;
                  offsetFur.furAngle = this.furAngle;
                  offsetFur.furGravity = this.furGravity;
                  offsetFur.furSpacing = this.furSpacing;
                  offsetFur.furSpeed = this.furSpeed;
                  offsetFur.furColor = this.furColor;
                  offsetFur.diffuseTexture = this.diffuseTexture;
                  offsetFur.furTexture = this.furTexture;
                  offsetFur.highLevelFur = this.highLevelFur;
                  offsetFur.furTime = this.furTime;
                  offsetFur.furDensity = this.furDensity;
                }
              };
              // Methods
              FurMaterial.prototype.isReadyForSubMesh = function (
                mesh,
                subMesh,
                useInstances
              ) {
                var drawWrapper = subMesh._drawWrapper;
                if (this.isFrozen) {
                  if (
                    drawWrapper.effect &&
                    drawWrapper._wasPreviouslyReady &&
                    drawWrapper._wasPreviouslyUsingInstances === useInstances
                  ) {
                    return true;
                  }
                }
                if (!subMesh.materialDefines) {
                  subMesh.materialDefines = new FurMaterialDefines();
                }
                var defines = subMesh.materialDefines;
                var scene = this.getScene();
                if (this._isReadyForSubMesh(subMesh)) {
                  return true;
                }
                var engine = scene.getEngine();
                // Textures
                if (defines._areTexturesDirty) {
                  if (scene.texturesEnabled) {
                    if (
                      this.diffuseTexture &&
                      babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__
                        .MaterialFlags.DiffuseTextureEnabled
                    ) {
                      if (!this.diffuseTexture.isReady()) {
                        return false;
                      } else {
                        defines._needUVs = true;
                        defines.DIFFUSE = true;
                      }
                    }
                    if (
                      this.heightTexture &&
                      engine.getCaps().maxVertexTextureImageUnits
                    ) {
                      if (!this.heightTexture.isReady()) {
                        return false;
                      } else {
                        defines._needUVs = true;
                        defines.HEIGHTMAP = true;
                      }
                    }
                  }
                }
                // High level
                if (this.highLevelFur !== defines.HIGHLEVEL) {
                  defines.HIGHLEVEL = true;
                  defines.markAsUnprocessed();
                }
                // Misc.
                (0,
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareDefinesForMisc)(
                  mesh,
                  scene,
                  this._useLogarithmicDepth,
                  this.pointsCloud,
                  this.fogEnabled,
                  this._shouldTurnAlphaTestOn(mesh),
                  defines
                );
                // Lights
                defines._needNormals = (0,
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareDefinesForLights)(
                  scene,
                  mesh,
                  defines,
                  false,
                  this._maxSimultaneousLights,
                  this._disableLighting
                );
                // Values that need to be evaluated on every frame
                (0,
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareDefinesForFrameBoundValues)(
                  scene,
                  engine,
                  this,
                  defines,
                  useInstances ? true : false
                );
                // Attribs
                (0,
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareDefinesForAttributes)(
                  mesh,
                  defines,
                  true,
                  true
                );
                // Get correct effect
                if (defines.isDirty) {
                  defines.markAsProcessed();
                  scene.resetCachedMaterial();
                  // Fallbacks
                  var fallbacks =
                    new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.EffectFallbacks();
                  if (defines.FOG) {
                    fallbacks.addFallback(1, "FOG");
                  }
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.HandleFallbacksForShadows)(
                    defines,
                    fallbacks,
                    this.maxSimultaneousLights
                  );
                  if (defines.NUM_BONE_INFLUENCERS > 0) {
                    fallbacks.addCPUSkinningFallback(0, mesh);
                  }
                  defines.IMAGEPROCESSINGPOSTPROCESS =
                    scene.imageProcessingConfiguration.applyByPostProcess;
                  //Attributes
                  var attribs = [
                    babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__
                      .VertexBuffer.PositionKind,
                  ];
                  if (defines.NORMAL) {
                    attribs.push(
                      babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__
                        .VertexBuffer.NormalKind
                    );
                  }
                  if (defines.UV1) {
                    attribs.push(
                      babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__
                        .VertexBuffer.UVKind
                    );
                  }
                  if (defines.UV2) {
                    attribs.push(
                      babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__
                        .VertexBuffer.UV2Kind
                    );
                  }
                  if (defines.VERTEXCOLOR) {
                    attribs.push(
                      babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__
                        .VertexBuffer.ColorKind
                    );
                  }
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareAttributesForBones)(
                    attribs,
                    mesh,
                    defines,
                    fallbacks
                  );
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareAttributesForInstances)(
                    attribs,
                    defines
                  );
                  // Legacy browser patch
                  var shaderName = "fur";
                  var join = defines.toString();
                  var uniforms = [
                    "world",
                    "view",
                    "viewProjection",
                    "vEyePosition",
                    "vLightsType",
                    "vDiffuseColor",
                    "vFogInfos",
                    "vFogColor",
                    "pointSize",
                    "vDiffuseInfos",
                    "mBones",
                    "diffuseMatrix",
                    "logarithmicDepthConstant",
                    "furLength",
                    "furAngle",
                    "furColor",
                    "furOffset",
                    "furGravity",
                    "furTime",
                    "furSpacing",
                    "furDensity",
                    "furOcclusion",
                  ];
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.addClipPlaneUniforms)(
                    uniforms
                  );
                  var samplers = [
                    "diffuseSampler",
                    "heightTexture",
                    "furTexture",
                    "areaLightsLTC1Sampler",
                    "areaLightsLTC2Sampler",
                  ];
                  var uniformBuffers = [];
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareUniformsAndSamplersList)(
                    {
                      uniformsNames: uniforms,
                      uniformBuffersNames: uniformBuffers,
                      samplers: samplers,
                      defines: defines,
                      maxSimultaneousLights: this.maxSimultaneousLights,
                    }
                  );
                  subMesh.setEffect(
                    scene.getEngine().createEffect(
                      shaderName,
                      {
                        attributes: attribs,
                        uniformsNames: uniforms,
                        uniformBuffersNames: uniformBuffers,
                        samplers: samplers,
                        defines: join,
                        fallbacks: fallbacks,
                        onCompiled: this.onCompiled,
                        onError: this.onError,
                        indexParameters: {
                          maxSimultaneousLights: this.maxSimultaneousLights,
                        },
                      },
                      engine
                    ),
                    defines,
                    this._materialContext
                  );
                }
                // Check if Area Lights have LTC texture.
                if (defines["AREALIGHTUSED"]) {
                  for (
                    var index = 0;
                    index < mesh.lightSources.length;
                    index++
                  ) {
                    if (!mesh.lightSources[index]._isReady()) {
                      return false;
                    }
                  }
                }
                if (!subMesh.effect || !subMesh.effect.isReady()) {
                  return false;
                }
                defines._renderId = scene.getRenderId();
                drawWrapper._wasPreviouslyReady = true;
                drawWrapper._wasPreviouslyUsingInstances = !!useInstances;
                return true;
              };
              FurMaterial.prototype.bindForSubMesh = function (
                world,
                mesh,
                subMesh
              ) {
                var scene = this.getScene();
                var defines = subMesh.materialDefines;
                if (!defines) {
                  return;
                }
                var effect = subMesh.effect;
                if (!effect) {
                  return;
                }
                this._activeEffect = effect;
                // Matrices
                this.bindOnlyWorldMatrix(world);
                this._activeEffect.setMatrix(
                  "viewProjection",
                  scene.getTransformMatrix()
                );
                // Bones
                (0,
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.BindBonesParameters)(
                  mesh,
                  this._activeEffect
                );
                if (this._mustRebind(scene, effect, subMesh)) {
                  // Textures
                  if (
                    this._diffuseTexture &&
                    babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__
                      .MaterialFlags.DiffuseTextureEnabled
                  ) {
                    this._activeEffect.setTexture(
                      "diffuseSampler",
                      this._diffuseTexture
                    );
                    this._activeEffect.setFloat2(
                      "vDiffuseInfos",
                      this._diffuseTexture.coordinatesIndex,
                      this._diffuseTexture.level
                    );
                    this._activeEffect.setMatrix(
                      "diffuseMatrix",
                      this._diffuseTexture.getTextureMatrix()
                    );
                  }
                  if (this._heightTexture) {
                    this._activeEffect.setTexture(
                      "heightTexture",
                      this._heightTexture
                    );
                  }
                  // Clip plane
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.bindClipPlane)(
                    this._activeEffect,
                    this,
                    scene
                  );
                  // Point size
                  if (this.pointsCloud) {
                    this._activeEffect.setFloat("pointSize", this.pointSize);
                  }
                  // Log. depth
                  if (this._useLogarithmicDepth) {
                    (0,
                    babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.BindLogDepth)(
                      defines,
                      effect,
                      scene
                    );
                  }
                  scene.bindEyePosition(effect);
                }
                this._activeEffect.setColor4(
                  "vDiffuseColor",
                  this.diffuseColor,
                  this.alpha * mesh.visibility
                );
                if (scene.lightsEnabled && !this.disableLighting) {
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.BindLights)(
                    scene,
                    mesh,
                    this._activeEffect,
                    defines,
                    this.maxSimultaneousLights
                  );
                }
                // View
                if (
                  scene.fogEnabled &&
                  mesh.applyFog &&
                  scene.fogMode !==
                    babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Scene
                      .FOGMODE_NONE
                ) {
                  this._activeEffect.setMatrix("view", scene.getViewMatrix());
                }
                // Fog
                (0,
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.BindFogParameters)(
                  scene,
                  mesh,
                  this._activeEffect
                );
                this._activeEffect.setFloat("furLength", this.furLength);
                this._activeEffect.setFloat("furAngle", this.furAngle);
                this._activeEffect.setColor4("furColor", this.furColor, 1.0);
                if (this.highLevelFur) {
                  this._activeEffect.setVector3("furGravity", this.furGravity);
                  this._activeEffect.setFloat("furOffset", this.furOffset);
                  this._activeEffect.setFloat("furSpacing", this.furSpacing);
                  this._activeEffect.setFloat("furDensity", this.furDensity);
                  this._activeEffect.setFloat(
                    "furOcclusion",
                    this.furOcclusion
                  );
                  this._furTime +=
                    this.getScene().getEngine().getDeltaTime() / this.furSpeed;
                  this._activeEffect.setFloat("furTime", this._furTime);
                  this._activeEffect.setTexture("furTexture", this.furTexture);
                }
                this._afterBind(mesh, this._activeEffect, subMesh);
              };
              FurMaterial.prototype.getAnimatables = function () {
                var results = [];
                if (
                  this.diffuseTexture &&
                  this.diffuseTexture.animations &&
                  this.diffuseTexture.animations.length > 0
                ) {
                  results.push(this.diffuseTexture);
                }
                if (
                  this.heightTexture &&
                  this.heightTexture.animations &&
                  this.heightTexture.animations.length > 0
                ) {
                  results.push(this.heightTexture);
                }
                return results;
              };
              FurMaterial.prototype.getActiveTextures = function () {
                var activeTextures =
                  _super.prototype.getActiveTextures.call(this);
                if (this._diffuseTexture) {
                  activeTextures.push(this._diffuseTexture);
                }
                if (this._heightTexture) {
                  activeTextures.push(this._heightTexture);
                }
                return activeTextures;
              };
              FurMaterial.prototype.hasTexture = function (texture) {
                if (_super.prototype.hasTexture.call(this, texture)) {
                  return true;
                }
                if (this.diffuseTexture === texture) {
                  return true;
                }
                if (this._heightTexture === texture) {
                  return true;
                }
                return false;
              };
              FurMaterial.prototype.dispose = function (forceDisposeEffect) {
                if (this.diffuseTexture) {
                  this.diffuseTexture.dispose();
                }
                if (this._meshes) {
                  for (var i = 1; i < this._meshes.length; i++) {
                    var mat = this._meshes[i].material;
                    if (mat) {
                      mat.dispose(forceDisposeEffect);
                    }
                    this._meshes[i].dispose();
                  }
                }
                _super.prototype.dispose.call(this, forceDisposeEffect);
              };
              FurMaterial.prototype.clone = function (name) {
                var _this = this;
                return babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.SerializationHelper.Clone(
                  function () {
                    return new FurMaterial(name, _this.getScene());
                  },
                  this
                );
              };
              FurMaterial.prototype.serialize = function () {
                var serializationObject = _super.prototype.serialize.call(this);
                serializationObject.customType = "BABYLON.FurMaterial";
                if (this._meshes) {
                  serializationObject.sourceMeshName = this._meshes[0].name;
                  serializationObject.quality = this._meshes.length;
                }
                return serializationObject;
              };
              FurMaterial.prototype.getClassName = function () {
                return "FurMaterial";
              };
              // Statics
              FurMaterial.Parse = function (source, scene, rootUrl) {
                var material =
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.SerializationHelper.Parse(
                    function () {
                      return new FurMaterial(source.name, scene);
                    },
                    source,
                    scene,
                    rootUrl
                  );
                if (source.sourceMeshName && material.highLevelFur) {
                  scene.executeWhenReady(function () {
                    var sourceMesh = scene.getMeshByName(source.sourceMeshName);
                    if (sourceMesh) {
                      var furTexture = FurMaterial.GenerateTexture(
                        "Fur Texture",
                        scene
                      );
                      material.furTexture = furTexture;
                      FurMaterial.FurifyMesh(sourceMesh, source.quality);
                    }
                  });
                }
                return material;
              };
              FurMaterial.GenerateTexture = function (name, scene) {
                // Generate fur textures
                var texture =
                  new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.DynamicTexture(
                    "FurTexture " + name,
                    256,
                    scene,
                    true
                  );
                var context = texture.getContext();
                for (var i = 0; i < 20000; ++i) {
                  context.fillStyle =
                    "rgba(255, " +
                    Math.floor(Math.random() * 255) +
                    ", " +
                    Math.floor(Math.random() * 255) +
                    ", 1)";
                  context.fillRect(
                    Math.random() * texture.getSize().width,
                    Math.random() * texture.getSize().height,
                    2,
                    2
                  );
                }
                texture.update(false);
                texture.wrapU =
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Texture.WRAP_ADDRESSMODE;
                texture.wrapV =
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Texture.WRAP_ADDRESSMODE;
                return texture;
              };
              // Creates and returns an array of meshes used as shells for the Fur Material
              // that can be disposed later in your code
              // The quality is in interval [0, 100]
              FurMaterial.FurifyMesh = function (sourceMesh, quality) {
                var meshes = [sourceMesh];
                var mat = sourceMesh.material;
                var i;
                if (!(mat instanceof FurMaterial)) {
                  // eslint-disable-next-line no-throw-literal
                  throw "The material of the source mesh must be a Fur Material";
                }
                for (i = 1; i < quality; i++) {
                  var offsetFur = new FurMaterial(
                    mat.name + i,
                    sourceMesh.getScene()
                  );
                  sourceMesh.getScene().materials.pop();
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Tags.EnableFor(
                    offsetFur
                  );
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Tags.AddTagsTo(
                    offsetFur,
                    "furShellMaterial"
                  );
                  offsetFur.furLength = mat.furLength;
                  offsetFur.furAngle = mat.furAngle;
                  offsetFur.furGravity = mat.furGravity;
                  offsetFur.furSpacing = mat.furSpacing;
                  offsetFur.furSpeed = mat.furSpeed;
                  offsetFur.furColor = mat.furColor;
                  offsetFur.diffuseTexture = mat.diffuseTexture;
                  offsetFur.furOffset = i / quality;
                  offsetFur.furTexture = mat.furTexture;
                  offsetFur.highLevelFur = mat.highLevelFur;
                  offsetFur.furTime = mat.furTime;
                  offsetFur.furDensity = mat.furDensity;
                  var offsetMesh = sourceMesh.clone(sourceMesh.name + i);
                  offsetMesh.material = offsetFur;
                  offsetMesh.skeleton = sourceMesh.skeleton;
                  offsetMesh.position =
                    babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Vector3.Zero();
                  meshes.push(offsetMesh);
                }
                for (i = 1; i < meshes.length; i++) {
                  meshes[i].parent = sourceMesh;
                }
                sourceMesh.material._meshes = meshes;
                return meshes;
              };
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsTexture)(
                    "diffuseTexture"
                  ),
                ],
                FurMaterial.prototype,
                "_diffuseTexture",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)(
                    "_markAllSubMeshesAsTexturesDirty"
                  ),
                ],
                FurMaterial.prototype,
                "diffuseTexture",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsTexture)(
                    "heightTexture"
                  ),
                ],
                FurMaterial.prototype,
                "_heightTexture",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)(
                    "_markAllSubMeshesAsTexturesDirty"
                  ),
                ],
                FurMaterial.prototype,
                "heightTexture",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsColor3)(),
                ],
                FurMaterial.prototype,
                "diffuseColor",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(),
                ],
                FurMaterial.prototype,
                "furLength",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(),
                ],
                FurMaterial.prototype,
                "furAngle",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsColor3)(),
                ],
                FurMaterial.prototype,
                "furColor",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(),
                ],
                FurMaterial.prototype,
                "furOffset",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(),
                ],
                FurMaterial.prototype,
                "furSpacing",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsVector3)(),
                ],
                FurMaterial.prototype,
                "furGravity",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(),
                ],
                FurMaterial.prototype,
                "furSpeed",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(),
                ],
                FurMaterial.prototype,
                "furDensity",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(),
                ],
                FurMaterial.prototype,
                "furOcclusion",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(
                    "disableLighting"
                  ),
                ],
                FurMaterial.prototype,
                "_disableLighting",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)(
                    "_markAllSubMeshesAsLightsDirty"
                  ),
                ],
                FurMaterial.prototype,
                "disableLighting",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(
                    "maxSimultaneousLights"
                  ),
                ],
                FurMaterial.prototype,
                "_maxSimultaneousLights",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)(
                    "_markAllSubMeshesAsLightsDirty"
                  ),
                ],
                FurMaterial.prototype,
                "maxSimultaneousLights",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(),
                ],
                FurMaterial.prototype,
                "highLevelFur",
                void 0
              );
              (0, tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)(
                [
                  (0,
                  babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)(),
                ],
                FurMaterial.prototype,
                "furTime",
                null
              );
              return FurMaterial;
            })(
              babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PushMaterial
            );

            (0,
            babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.RegisterClass)(
              "BABYLON.FurMaterial",
              FurMaterial
            );

            /***/
          },

        /***/ "../../../dev/materials/src/fur/index.ts":
          /*!***********************************************!*\
  !*** ../../../dev/materials/src/fur/index.ts ***!
  \***********************************************/
          /***/ (
            __unused_webpack_module,
            __webpack_exports__,
            __webpack_require__
          ) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
              /* harmony export */ FurMaterial: () =>
                /* reexport safe */ _furMaterial__WEBPACK_IMPORTED_MODULE_0__.FurMaterial,
              /* harmony export */
            });
            /* harmony import */ var _furMaterial__WEBPACK_IMPORTED_MODULE_0__ =
              __webpack_require__(
                /*! ./furMaterial */ "../../../dev/materials/src/fur/furMaterial.ts"
              );

            /***/
          },

        /***/ "../../../lts/materials/src/legacy/legacy-fur.ts":
          /*!*******************************************************!*\
  !*** ../../../lts/materials/src/legacy/legacy-fur.ts ***!
  \*******************************************************/
          /***/ (
            __unused_webpack_module,
            __webpack_exports__,
            __webpack_require__
          ) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
              /* harmony export */ FurMaterial: () =>
                /* reexport safe */ materials_fur_index__WEBPACK_IMPORTED_MODULE_0__.FurMaterial,
              /* harmony export */
            });
            /* harmony import */ var materials_fur_index__WEBPACK_IMPORTED_MODULE_0__ =
              __webpack_require__(
                /*! materials/fur/index */ "../../../dev/materials/src/fur/index.ts"
              );
            /* eslint-disable import/no-internal-modules */

            /**
             * This is the entry point for the UMD module.
             * The entry point for a future ESM package should be index.ts
             */
            var globalObject =
              typeof __webpack_require__.g !== "undefined"
                ? __webpack_require__.g
                : typeof window !== "undefined"
                ? window
                : undefined;
            if (typeof globalObject !== "undefined") {
              for (var key in materials_fur_index__WEBPACK_IMPORTED_MODULE_0__) {
                globalObject.BABYLON[key] =
                  materials_fur_index__WEBPACK_IMPORTED_MODULE_0__[key];
              }
            }

            /***/
          },

        /***/ "babylonjs/Materials/effect":
          /*!****************************************************************************************************!*\
  !*** external {"root":"BABYLON","commonjs":"babylonjs","commonjs2":"babylonjs","amd":"babylonjs"} ***!
  \****************************************************************************************************/
          /***/ (module) => {
            module.exports =
              __WEBPACK_EXTERNAL_MODULE_babylonjs_Materials_effect__;

            /***/
          },

        /***/ "../../../../node_modules/tslib/tslib.es6.mjs":
          /*!****************************************************!*\
  !*** ../../../../node_modules/tslib/tslib.es6.mjs ***!
  \****************************************************/
          /***/ (
            __unused_webpack___webpack_module__,
            __webpack_exports__,
            __webpack_require__
          ) => {
            __webpack_require__.r(__webpack_exports__);
            /* harmony export */ __webpack_require__.d(__webpack_exports__, {
              /* harmony export */ __addDisposableResource: () =>
                /* binding */ __addDisposableResource,
              /* harmony export */ __assign: () => /* binding */ __assign,
              /* harmony export */ __asyncDelegator: () =>
                /* binding */ __asyncDelegator,
              /* harmony export */ __asyncGenerator: () =>
                /* binding */ __asyncGenerator,
              /* harmony export */ __asyncValues: () =>
                /* binding */ __asyncValues,
              /* harmony export */ __await: () => /* binding */ __await,
              /* harmony export */ __awaiter: () => /* binding */ __awaiter,
              /* harmony export */ __classPrivateFieldGet: () =>
                /* binding */ __classPrivateFieldGet,
              /* harmony export */ __classPrivateFieldIn: () =>
                /* binding */ __classPrivateFieldIn,
              /* harmony export */ __classPrivateFieldSet: () =>
                /* binding */ __classPrivateFieldSet,
              /* harmony export */ __createBinding: () =>
                /* binding */ __createBinding,
              /* harmony export */ __decorate: () => /* binding */ __decorate,
              /* harmony export */ __disposeResources: () =>
                /* binding */ __disposeResources,
              /* harmony export */ __esDecorate: () =>
                /* binding */ __esDecorate,
              /* harmony export */ __exportStar: () =>
                /* binding */ __exportStar,
              /* harmony export */ __extends: () => /* binding */ __extends,
              /* harmony export */ __generator: () => /* binding */ __generator,
              /* harmony export */ __importDefault: () =>
                /* binding */ __importDefault,
              /* harmony export */ __importStar: () =>
                /* binding */ __importStar,
              /* harmony export */ __makeTemplateObject: () =>
                /* binding */ __makeTemplateObject,
              /* harmony export */ __metadata: () => /* binding */ __metadata,
              /* harmony export */ __param: () => /* binding */ __param,
              /* harmony export */ __propKey: () => /* binding */ __propKey,
              /* harmony export */ __read: () => /* binding */ __read,
              /* harmony export */ __rest: () => /* binding */ __rest,
              /* harmony export */ __rewriteRelativeImportExtension: () =>
                /* binding */ __rewriteRelativeImportExtension,
              /* harmony export */ __runInitializers: () =>
                /* binding */ __runInitializers,
              /* harmony export */ __setFunctionName: () =>
                /* binding */ __setFunctionName,
              /* harmony export */ __spread: () => /* binding */ __spread,
              /* harmony export */ __spreadArray: () =>
                /* binding */ __spreadArray,
              /* harmony export */ __spreadArrays: () =>
                /* binding */ __spreadArrays,
              /* harmony export */ __values: () => /* binding */ __values,
              /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
              /* harmony export */
            });
            /******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
            /* global Reflect, Promise, SuppressedError, Symbol, Iterator */

            var extendStatics = function (d, b) {
              extendStatics =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (d, b) {
                    d.__proto__ = b;
                  }) ||
                function (d, b) {
                  for (var p in b)
                    if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
                };
              return extendStatics(d, b);
            };

            function __extends(d, b) {
              if (typeof b !== "function" && b !== null)
                throw new TypeError(
                  "Class extends value " +
                    String(b) +
                    " is not a constructor or null"
                );
              extendStatics(d, b);
              function __() {
                this.constructor = d;
              }
              d.prototype =
                b === null
                  ? Object.create(b)
                  : ((__.prototype = b.prototype), new __());
            }

            var __assign = function () {
              __assign =
                Object.assign ||
                function __assign(t) {
                  for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s)
                      if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
                  }
                  return t;
                };
              return __assign.apply(this, arguments);
            };

            function __rest(s, e) {
              var t = {};
              for (var p in s)
                if (
                  Object.prototype.hasOwnProperty.call(s, p) &&
                  e.indexOf(p) < 0
                )
                  t[p] = s[p];
              if (
                s != null &&
                typeof Object.getOwnPropertySymbols === "function"
              )
                for (
                  var i = 0, p = Object.getOwnPropertySymbols(s);
                  i < p.length;
                  i++
                ) {
                  if (
                    e.indexOf(p[i]) < 0 &&
                    Object.prototype.propertyIsEnumerable.call(s, p[i])
                  )
                    t[p[i]] = s[p[i]];
                }
              return t;
            }

            function __decorate(decorators, target, key, desc) {
              var c = arguments.length,
                r =
                  c < 3
                    ? target
                    : desc === null
                    ? (desc = Object.getOwnPropertyDescriptor(target, key))
                    : desc,
                d;
              if (
                typeof Reflect === "object" &&
                typeof Reflect.decorate === "function"
              )
                r = Reflect.decorate(decorators, target, key, desc);
              else
                for (var i = decorators.length - 1; i >= 0; i--)
                  if ((d = decorators[i]))
                    r =
                      (c < 3
                        ? d(r)
                        : c > 3
                        ? d(target, key, r)
                        : d(target, key)) || r;
              return c > 3 && r && Object.defineProperty(target, key, r), r;
            }

            function __param(paramIndex, decorator) {
              return function (target, key) {
                decorator(target, key, paramIndex);
              };
            }

            function __esDecorate(
              ctor,
              descriptorIn,
              decorators,
              contextIn,
              initializers,
              extraInitializers
            ) {
              function accept(f) {
                if (f !== void 0 && typeof f !== "function")
                  throw new TypeError("Function expected");
                return f;
              }
              var kind = contextIn.kind,
                key =
                  kind === "getter"
                    ? "get"
                    : kind === "setter"
                    ? "set"
                    : "value";
              var target =
                !descriptorIn && ctor
                  ? contextIn["static"]
                    ? ctor
                    : ctor.prototype
                  : null;
              var descriptor =
                descriptorIn ||
                (target
                  ? Object.getOwnPropertyDescriptor(target, contextIn.name)
                  : {});
              var _,
                done = false;
              for (var i = decorators.length - 1; i >= 0; i--) {
                var context = {};
                for (var p in contextIn)
                  context[p] = p === "access" ? {} : contextIn[p];
                for (var p in contextIn.access)
                  context.access[p] = contextIn.access[p];
                context.addInitializer = function (f) {
                  if (done)
                    throw new TypeError(
                      "Cannot add initializers after decoration has completed"
                    );
                  extraInitializers.push(accept(f || null));
                };
                var result = (0, decorators[i])(
                  kind === "accessor"
                    ? { get: descriptor.get, set: descriptor.set }
                    : descriptor[key],
                  context
                );
                if (kind === "accessor") {
                  if (result === void 0) continue;
                  if (result === null || typeof result !== "object")
                    throw new TypeError("Object expected");
                  if ((_ = accept(result.get))) descriptor.get = _;
                  if ((_ = accept(result.set))) descriptor.set = _;
                  if ((_ = accept(result.init))) initializers.unshift(_);
                } else if ((_ = accept(result))) {
                  if (kind === "field") initializers.unshift(_);
                  else descriptor[key] = _;
                }
              }
              if (target)
                Object.defineProperty(target, contextIn.name, descriptor);
              done = true;
            }

            function __runInitializers(thisArg, initializers, value) {
              var useValue = arguments.length > 2;
              for (var i = 0; i < initializers.length; i++) {
                value = useValue
                  ? initializers[i].call(thisArg, value)
                  : initializers[i].call(thisArg);
              }
              return useValue ? value : void 0;
            }

            function __propKey(x) {
              return typeof x === "symbol" ? x : "".concat(x);
            }

            function __setFunctionName(f, name, prefix) {
              if (typeof name === "symbol")
                name = name.description
                  ? "[".concat(name.description, "]")
                  : "";
              return Object.defineProperty(f, "name", {
                configurable: true,
                value: prefix ? "".concat(prefix, " ", name) : name,
              });
            }

            function __metadata(metadataKey, metadataValue) {
              if (
                typeof Reflect === "object" &&
                typeof Reflect.metadata === "function"
              )
                return Reflect.metadata(metadataKey, metadataValue);
            }

            function __awaiter(thisArg, _arguments, P, generator) {
              function adopt(value) {
                return value instanceof P
                  ? value
                  : new P(function (resolve) {
                      resolve(value);
                    });
              }
              return new (P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) {
                  try {
                    step(generator.next(value));
                  } catch (e) {
                    reject(e);
                  }
                }
                function rejected(value) {
                  try {
                    step(generator["throw"](value));
                  } catch (e) {
                    reject(e);
                  }
                }
                function step(result) {
                  result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
                }
                step(
                  (generator = generator.apply(
                    thisArg,
                    _arguments || []
                  )).next()
                );
              });
            }

            function __generator(thisArg, body) {
              var _ = {
                  label: 0,
                  sent: function () {
                    if (t[0] & 1) throw t[1];
                    return t[1];
                  },
                  trys: [],
                  ops: [],
                },
                f,
                y,
                t,
                g = Object.create(
                  (typeof Iterator === "function" ? Iterator : Object).prototype
                );
              return (
                (g.next = verb(0)),
                (g["throw"] = verb(1)),
                (g["return"] = verb(2)),
                typeof Symbol === "function" &&
                  (g[Symbol.iterator] = function () {
                    return this;
                  }),
                g
              );
              function verb(n) {
                return function (v) {
                  return step([n, v]);
                };
              }
              function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while ((g && ((g = 0), op[0] && (_ = 0)), _))
                  try {
                    if (
                      ((f = 1),
                      y &&
                        (t =
                          op[0] & 2
                            ? y["return"]
                            : op[0]
                            ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                            : y.next) &&
                        !(t = t.call(y, op[1])).done)
                    )
                      return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                      case 0:
                      case 1:
                        t = op;
                        break;
                      case 4:
                        _.label++;
                        return { value: op[1], done: false };
                      case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                      case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                      default:
                        if (
                          !((t = _.trys),
                          (t = t.length > 0 && t[t.length - 1])) &&
                          (op[0] === 6 || op[0] === 2)
                        ) {
                          _ = 0;
                          continue;
                        }
                        if (
                          op[0] === 3 &&
                          (!t || (op[1] > t[0] && op[1] < t[3]))
                        ) {
                          _.label = op[1];
                          break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                          _.label = t[1];
                          t = op;
                          break;
                        }
                        if (t && _.label < t[2]) {
                          _.label = t[2];
                          _.ops.push(op);
                          break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();
                        continue;
                    }
                    op = body.call(thisArg, _);
                  } catch (e) {
                    op = [6, e];
                    y = 0;
                  } finally {
                    f = t = 0;
                  }
                if (op[0] & 5) throw op[1];
                return { value: op[0] ? op[1] : void 0, done: true };
              }
            }

            var __createBinding = Object.create
              ? function (o, m, k, k2) {
                  if (k2 === undefined) k2 = k;
                  var desc = Object.getOwnPropertyDescriptor(m, k);
                  if (
                    !desc ||
                    ("get" in desc
                      ? !m.__esModule
                      : desc.writable || desc.configurable)
                  ) {
                    desc = {
                      enumerable: true,
                      get: function () {
                        return m[k];
                      },
                    };
                  }
                  Object.defineProperty(o, k2, desc);
                }
              : function (o, m, k, k2) {
                  if (k2 === undefined) k2 = k;
                  o[k2] = m[k];
                };

            function __exportStar(m, o) {
              for (var p in m)
                if (
                  p !== "default" &&
                  !Object.prototype.hasOwnProperty.call(o, p)
                )
                  __createBinding(o, m, p);
            }

            function __values(o) {
              var s = typeof Symbol === "function" && Symbol.iterator,
                m = s && o[s],
                i = 0;
              if (m) return m.call(o);
              if (o && typeof o.length === "number")
                return {
                  next: function () {
                    if (o && i >= o.length) o = void 0;
                    return { value: o && o[i++], done: !o };
                  },
                };
              throw new TypeError(
                s
                  ? "Object is not iterable."
                  : "Symbol.iterator is not defined."
              );
            }

            function __read(o, n) {
              var m = typeof Symbol === "function" && o[Symbol.iterator];
              if (!m) return o;
              var i = m.call(o),
                r,
                ar = [],
                e;
              try {
                while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                  ar.push(r.value);
              } catch (error) {
                e = { error: error };
              } finally {
                try {
                  if (r && !r.done && (m = i["return"])) m.call(i);
                } finally {
                  if (e) throw e.error;
                }
              }
              return ar;
            }

            /** @deprecated */
            function __spread() {
              for (var ar = [], i = 0; i < arguments.length; i++)
                ar = ar.concat(__read(arguments[i]));
              return ar;
            }

            /** @deprecated */
            function __spreadArrays() {
              for (var s = 0, i = 0, il = arguments.length; i < il; i++)
                s += arguments[i].length;
              for (var r = Array(s), k = 0, i = 0; i < il; i++)
                for (
                  var a = arguments[i], j = 0, jl = a.length;
                  j < jl;
                  j++, k++
                )
                  r[k] = a[j];
              return r;
            }

            function __spreadArray(to, from, pack) {
              if (pack || arguments.length === 2)
                for (var i = 0, l = from.length, ar; i < l; i++) {
                  if (ar || !(i in from)) {
                    if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                  }
                }
              return to.concat(ar || Array.prototype.slice.call(from));
            }

            function __await(v) {
              return this instanceof __await
                ? ((this.v = v), this)
                : new __await(v);
            }

            function __asyncGenerator(thisArg, _arguments, generator) {
              if (!Symbol.asyncIterator)
                throw new TypeError("Symbol.asyncIterator is not defined.");
              var g = generator.apply(thisArg, _arguments || []),
                i,
                q = [];
              return (
                (i = Object.create(
                  (typeof AsyncIterator === "function" ? AsyncIterator : Object)
                    .prototype
                )),
                verb("next"),
                verb("throw"),
                verb("return", awaitReturn),
                (i[Symbol.asyncIterator] = function () {
                  return this;
                }),
                i
              );
              function awaitReturn(f) {
                return function (v) {
                  return Promise.resolve(v).then(f, reject);
                };
              }
              function verb(n, f) {
                if (g[n]) {
                  i[n] = function (v) {
                    return new Promise(function (a, b) {
                      q.push([n, v, a, b]) > 1 || resume(n, v);
                    });
                  };
                  if (f) i[n] = f(i[n]);
                }
              }
              function resume(n, v) {
                try {
                  step(g[n](v));
                } catch (e) {
                  settle(q[0][3], e);
                }
              }
              function step(r) {
                r.value instanceof __await
                  ? Promise.resolve(r.value.v).then(fulfill, reject)
                  : settle(q[0][2], r);
              }
              function fulfill(value) {
                resume("next", value);
              }
              function reject(value) {
                resume("throw", value);
              }
              function settle(f, v) {
                if ((f(v), q.shift(), q.length)) resume(q[0][0], q[0][1]);
              }
            }

            function __asyncDelegator(o) {
              var i, p;
              return (
                (i = {}),
                verb("next"),
                verb("throw", function (e) {
                  throw e;
                }),
                verb("return"),
                (i[Symbol.iterator] = function () {
                  return this;
                }),
                i
              );
              function verb(n, f) {
                i[n] = o[n]
                  ? function (v) {
                      return (p = !p)
                        ? { value: __await(o[n](v)), done: false }
                        : f
                        ? f(v)
                        : v;
                    }
                  : f;
              }
            }

            function __asyncValues(o) {
              if (!Symbol.asyncIterator)
                throw new TypeError("Symbol.asyncIterator is not defined.");
              var m = o[Symbol.asyncIterator],
                i;
              return m
                ? m.call(o)
                : ((o =
                    typeof __values === "function"
                      ? __values(o)
                      : o[Symbol.iterator]()),
                  (i = {}),
                  verb("next"),
                  verb("throw"),
                  verb("return"),
                  (i[Symbol.asyncIterator] = function () {
                    return this;
                  }),
                  i);
              function verb(n) {
                i[n] =
                  o[n] &&
                  function (v) {
                    return new Promise(function (resolve, reject) {
                      (v = o[n](v)), settle(resolve, reject, v.done, v.value);
                    });
                  };
              }
              function settle(resolve, reject, d, v) {
                Promise.resolve(v).then(function (v) {
                  resolve({ value: v, done: d });
                }, reject);
              }
            }

            function __makeTemplateObject(cooked, raw) {
              if (Object.defineProperty) {
                Object.defineProperty(cooked, "raw", { value: raw });
              } else {
                cooked.raw = raw;
              }
              return cooked;
            }

            var __setModuleDefault = Object.create
              ? function (o, v) {
                  Object.defineProperty(o, "default", {
                    enumerable: true,
                    value: v,
                  });
                }
              : function (o, v) {
                  o["default"] = v;
                };

            var ownKeys = function (o) {
              ownKeys =
                Object.getOwnPropertyNames ||
                function (o) {
                  var ar = [];
                  for (var k in o)
                    if (Object.prototype.hasOwnProperty.call(o, k))
                      ar[ar.length] = k;
                  return ar;
                };
              return ownKeys(o);
            };

            function __importStar(mod) {
              if (mod && mod.__esModule) return mod;
              var result = {};
              if (mod != null)
                for (var k = ownKeys(mod), i = 0; i < k.length; i++)
                  if (k[i] !== "default") __createBinding(result, mod, k[i]);
              __setModuleDefault(result, mod);
              return result;
            }

            function __importDefault(mod) {
              return mod && mod.__esModule ? mod : { default: mod };
            }

            function __classPrivateFieldGet(receiver, state, kind, f) {
              if (kind === "a" && !f)
                throw new TypeError(
                  "Private accessor was defined without a getter"
                );
              if (
                typeof state === "function"
                  ? receiver !== state || !f
                  : !state.has(receiver)
              )
                throw new TypeError(
                  "Cannot read private member from an object whose class did not declare it"
                );
              return kind === "m"
                ? f
                : kind === "a"
                ? f.call(receiver)
                : f
                ? f.value
                : state.get(receiver);
            }

            function __classPrivateFieldSet(receiver, state, value, kind, f) {
              if (kind === "m")
                throw new TypeError("Private method is not writable");
              if (kind === "a" && !f)
                throw new TypeError(
                  "Private accessor was defined without a setter"
                );
              if (
                typeof state === "function"
                  ? receiver !== state || !f
                  : !state.has(receiver)
              )
                throw new TypeError(
                  "Cannot write private member to an object whose class did not declare it"
                );
              return (
                kind === "a"
                  ? f.call(receiver, value)
                  : f
                  ? (f.value = value)
                  : state.set(receiver, value),
                value
              );
            }

            function __classPrivateFieldIn(state, receiver) {
              if (
                receiver === null ||
                (typeof receiver !== "object" && typeof receiver !== "function")
              )
                throw new TypeError("Cannot use 'in' operator on non-object");
              return typeof state === "function"
                ? receiver === state
                : state.has(receiver);
            }

            function __addDisposableResource(env, value, async) {
              if (value !== null && value !== void 0) {
                if (typeof value !== "object" && typeof value !== "function")
                  throw new TypeError("Object expected.");
                var dispose, inner;
                if (async) {
                  if (!Symbol.asyncDispose)
                    throw new TypeError("Symbol.asyncDispose is not defined.");
                  dispose = value[Symbol.asyncDispose];
                }
                if (dispose === void 0) {
                  if (!Symbol.dispose)
                    throw new TypeError("Symbol.dispose is not defined.");
                  dispose = value[Symbol.dispose];
                  if (async) inner = dispose;
                }
                if (typeof dispose !== "function")
                  throw new TypeError("Object not disposable.");
                if (inner)
                  dispose = function () {
                    try {
                      inner.call(this);
                    } catch (e) {
                      return Promise.reject(e);
                    }
                  };
                env.stack.push({
                  value: value,
                  dispose: dispose,
                  async: async,
                });
              } else if (async) {
                env.stack.push({ async: true });
              }
              return value;
            }

            var _SuppressedError =
              typeof SuppressedError === "function"
                ? SuppressedError
                : function (error, suppressed, message) {
                    var e = new Error(message);
                    return (
                      (e.name = "SuppressedError"),
                      (e.error = error),
                      (e.suppressed = suppressed),
                      e
                    );
                  };

            function __disposeResources(env) {
              function fail(e) {
                env.error = env.hasError
                  ? new _SuppressedError(
                      e,
                      env.error,
                      "An error was suppressed during disposal."
                    )
                  : e;
                env.hasError = true;
              }
              var r,
                s = 0;
              function next() {
                while ((r = env.stack.pop())) {
                  try {
                    if (!r.async && s === 1)
                      return (
                        (s = 0), env.stack.push(r), Promise.resolve().then(next)
                      );
                    if (r.dispose) {
                      var result = r.dispose.call(r.value);
                      if (r.async)
                        return (
                          (s |= 2),
                          Promise.resolve(result).then(next, function (e) {
                            fail(e);
                            return next();
                          })
                        );
                    } else s |= 1;
                  } catch (e) {
                    fail(e);
                  }
                }
                if (s === 1)
                  return env.hasError
                    ? Promise.reject(env.error)
                    : Promise.resolve();
                if (env.hasError) throw env.error;
              }
              return next();
            }

            function __rewriteRelativeImportExtension(path, preserveJsx) {
              if (typeof path === "string" && /^\.\.?\//.test(path)) {
                return path.replace(
                  /\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,
                  function (m, tsx, d, ext, cm) {
                    return tsx
                      ? preserveJsx
                        ? ".jsx"
                        : ".js"
                      : d && (!ext || !cm)
                      ? m
                      : d + ext + "." + cm.toLowerCase() + "js";
                  }
                );
              }
              return path;
            }

            /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = {
              __extends,
              __assign,
              __rest,
              __decorate,
              __param,
              __esDecorate,
              __runInitializers,
              __propKey,
              __setFunctionName,
              __metadata,
              __awaiter,
              __generator,
              __createBinding,
              __exportStar,
              __values,
              __read,
              __spread,
              __spreadArrays,
              __spreadArray,
              __await,
              __asyncGenerator,
              __asyncDelegator,
              __asyncValues,
              __makeTemplateObject,
              __importStar,
              __importDefault,
              __classPrivateFieldGet,
              __classPrivateFieldSet,
              __classPrivateFieldIn,
              __addDisposableResource,
              __disposeResources,
              __rewriteRelativeImportExtension,
            };

            /***/
          },

        /******/
      };
      /************************************************************************/
      /******/ // The module cache
      /******/ var __webpack_module_cache__ = {};
      /******/
      /******/ // The require function
      /******/ function __webpack_require__(moduleId) {
        /******/ // Check if module is in cache
        /******/ var cachedModule = __webpack_module_cache__[moduleId];
        /******/ if (cachedModule !== undefined) {
          /******/ return cachedModule.exports;
          /******/
        }
        /******/ // Create a new module (and put it into the cache)
        /******/ var module = (__webpack_module_cache__[moduleId] = {
          /******/ // no module.id needed
          /******/ // no module.loaded needed
          /******/ exports: {},
          /******/
        });
        /******/
        /******/ // Execute the module function
        /******/ __webpack_modules__[moduleId](
          module,
          module.exports,
          __webpack_require__
        );
        /******/
        /******/ // Return the exports of the module
        /******/ return module.exports;
        /******/
      }
      /******/
      /************************************************************************/
      /******/ /* webpack/runtime/compat get default export */
      /******/ (() => {
        /******/ // getDefaultExport function for compatibility with non-harmony modules
        /******/ __webpack_require__.n = (module) => {
          /******/ var getter =
            module && module.__esModule
              ? /******/ () => module["default"]
              : /******/ () => module;
          /******/ __webpack_require__.d(getter, { a: getter });
          /******/ return getter;
          /******/
        };
        /******/
      })();
      /******/
      /******/ /* webpack/runtime/define property getters */
      /******/ (() => {
        /******/ // define getter functions for harmony exports
        /******/ __webpack_require__.d = (exports, definition) => {
          /******/ for (var key in definition) {
            /******/ if (
              __webpack_require__.o(definition, key) &&
              !__webpack_require__.o(exports, key)
            ) {
              /******/ Object.defineProperty(exports, key, {
                enumerable: true,
                get: definition[key],
              });
              /******/
            }
            /******/
          }
          /******/
        };
        /******/
      })();
      /******/
      /******/ /* webpack/runtime/global */
      /******/ (() => {
        /******/ __webpack_require__.g = (function () {
          /******/ if (typeof globalThis === "object") return globalThis;
          /******/ try {
            /******/ return this || new Function("return this")();
            /******/
          } catch (e) {
            /******/ if (typeof window === "object") return window;
            /******/
          }
          /******/
        })();
        /******/
      })();
      /******/
      /******/ /* webpack/runtime/hasOwnProperty shorthand */
      /******/ (() => {
        /******/ __webpack_require__.o = (obj, prop) =>
          Object.prototype.hasOwnProperty.call(obj, prop);
        /******/
      })();
      /******/
      /******/ /* webpack/runtime/make namespace object */
      /******/ (() => {
        /******/ // define __esModule on exports
        /******/ __webpack_require__.r = (exports) => {
          /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            /******/ Object.defineProperty(exports, Symbol.toStringTag, {
              value: "Module",
            });
            /******/
          }
          /******/ Object.defineProperty(exports, "__esModule", {
            value: true,
          });
          /******/
        };
        /******/
      })();
      /******/
      /************************************************************************/
      var __webpack_exports__ = {};
      // This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
      (() => {
        /*!********************!*\
  !*** ./src/fur.ts ***!
  \********************/
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
          /* harmony export */ materials: () =>
            /* reexport module object */ _lts_materials_legacy_legacy_fur__WEBPACK_IMPORTED_MODULE_0__,
          /* harmony export */
        });
        /* harmony import */ var _lts_materials_legacy_legacy_fur__WEBPACK_IMPORTED_MODULE_0__ =
          __webpack_require__(
            /*! @lts/materials/legacy/legacy-fur */ "../../../lts/materials/src/legacy/legacy-fur.ts"
          );

        /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ =
          _lts_materials_legacy_legacy_fur__WEBPACK_IMPORTED_MODULE_0__;
      })();

      __webpack_exports__ = __webpack_exports__["default"];
      /******/ return __webpack_exports__;
      /******/
    })();
  }
);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFieWxvbi5mdXJNYXRlcmlhbC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBc0VBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBaUdBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0SEE7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBZUE7QUFBQTtBQTZCQTtBQUNBO0FBN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBOztBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQUE7QUE0REE7QUFDQTtBQWpEQTtBQUdBO0FBR0E7QUFHQTtBQUdBO0FBR0E7QUFHQTtBQUdBO0FBR0E7QUFHQTtBQUtBO0FBS0E7QUFLQTtBQUlBOztBQUlBO0FBR0E7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7OztBQUpBO0FBTUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUFBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUF4aEJBO0FBREE7QUFDQTtBQUVBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUVBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUtBO0FBREE7QUFDQTtBQUVBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQUVBO0FBREE7QUFDQTtBQUdBO0FBREE7QUFDQTtBQVdBO0FBREE7QUFHQTtBQXdkQTtBQUFBO0FBM2hCQTtBQTZoQkE7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxbUJBOzs7Ozs7Ozs7Ozs7Ozs7O0FDQUE7QUFDQTtBQUVBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7Ozs7Ozs7OztBQ2RBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ2haQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDUEE7Ozs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9NQVRFUklBTFMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL01BVEVSSUFMUy8uLi8uLi8uLi9kZXYvbWF0ZXJpYWxzL3NyYy9mdXIvZnVyLmZyYWdtZW50LnRzIiwid2VicGFjazovL01BVEVSSUFMUy8uLi8uLi8uLi9kZXYvbWF0ZXJpYWxzL3NyYy9mdXIvZnVyLnZlcnRleC50cyIsIndlYnBhY2s6Ly9NQVRFUklBTFMvLi4vLi4vLi4vZGV2L21hdGVyaWFscy9zcmMvZnVyL2Z1ck1hdGVyaWFsLnRzIiwid2VicGFjazovL01BVEVSSUFMUy8uLi8uLi8uLi9kZXYvbWF0ZXJpYWxzL3NyYy9mdXIvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTLy4uLy4uLy4uL2x0cy9tYXRlcmlhbHMvc3JjL2xlZ2FjeS9sZWdhY3ktZnVyLnRzIiwid2VicGFjazovL01BVEVSSUFMUy9leHRlcm5hbCB1bWQge1wicm9vdFwiOlwiQkFCWUxPTlwiLFwiY29tbW9uanNcIjpcImJhYnlsb25qc1wiLFwiY29tbW9uanMyXCI6XCJiYWJ5bG9uanNcIixcImFtZFwiOlwiYmFieWxvbmpzXCJ9Iiwid2VicGFjazovL01BVEVSSUFMUy8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2Lm1qcyIsIndlYnBhY2s6Ly9NQVRFUklBTFMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL01BVEVSSUFMUy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTLy4vc3JjL2Z1ci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJiYWJ5bG9uanNcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJiYWJ5bG9uanMtbWF0ZXJpYWxzXCIsIFtcImJhYnlsb25qc1wiXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJiYWJ5bG9uanMtbWF0ZXJpYWxzXCJdID0gZmFjdG9yeShyZXF1aXJlKFwiYmFieWxvbmpzXCIpKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJNQVRFUklBTFNcIl0gPSBmYWN0b3J5KHJvb3RbXCJCQUJZTE9OXCJdKTtcbn0pKCh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdGhpcyksIChfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2JhYnlsb25qc19NYXRlcmlhbHNfZWZmZWN0X18pID0+IHtcbnJldHVybiAiLCIvLyBEbyBub3QgZWRpdC5cbmltcG9ydCB7IFNoYWRlclN0b3JlIH0gZnJvbSBcImNvcmUvRW5naW5lcy9zaGFkZXJTdG9yZVwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2hlbHBlckZ1bmN0aW9uc1wiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2xpZ2h0RnJhZ21lbnREZWNsYXJhdGlvblwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2xpZ2h0VWJvRGVjbGFyYXRpb25cIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9sb2dEZXB0aERlY2xhcmF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvbGlnaHRzRnJhZ21lbnRGdW5jdGlvbnNcIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9zaGFkb3dzRnJhZ21lbnRGdW5jdGlvbnNcIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9mb2dGcmFnbWVudERlY2xhcmF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvY2xpcFBsYW5lRnJhZ21lbnREZWNsYXJhdGlvblwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2NsaXBQbGFuZUZyYWdtZW50XCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvZGVwdGhQcmVQYXNzXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvbGlnaHRGcmFnbWVudFwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2xvZ0RlcHRoRnJhZ21lbnRcIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9mb2dGcmFnbWVudFwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2ltYWdlUHJvY2Vzc2luZ0NvbXBhdGliaWxpdHlcIjtcblxuY29uc3QgbmFtZSA9IFwiZnVyUGl4ZWxTaGFkZXJcIjtcbmNvbnN0IHNoYWRlciA9IGBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7dW5pZm9ybSB2ZWM0IHZFeWVQb3NpdGlvbjt1bmlmb3JtIHZlYzQgdkRpZmZ1c2VDb2xvcjt1bmlmb3JtIHZlYzQgZnVyQ29sb3I7dW5pZm9ybSBmbG9hdCBmdXJMZW5ndGg7dmFyeWluZyB2ZWMzIHZQb3NpdGlvblc7dmFyeWluZyBmbG9hdCB2ZnVyX2xlbmd0aDtcbiNpZmRlZiBOT1JNQUxcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsVztcbiNlbmRpZlxuI2lmZGVmIFZFUlRFWENPTE9SXG52YXJ5aW5nIHZlYzQgdkNvbG9yO1xuI2VuZGlmXG4jaW5jbHVkZTxoZWxwZXJGdW5jdGlvbnM+XG4jaW5jbHVkZTxfX2RlY2xfX2xpZ2h0RnJhZ21lbnQ+WzAuLm1heFNpbXVsdGFuZW91c0xpZ2h0c11cbiNpZmRlZiBESUZGVVNFXG52YXJ5aW5nIHZlYzIgdkRpZmZ1c2VVVjt1bmlmb3JtIHNhbXBsZXIyRCBkaWZmdXNlU2FtcGxlcjt1bmlmb3JtIHZlYzIgdkRpZmZ1c2VJbmZvcztcbiNlbmRpZlxuI2lmZGVmIEhJR0hMRVZFTFxudW5pZm9ybSBmbG9hdCBmdXJPZmZzZXQ7dW5pZm9ybSBmbG9hdCBmdXJPY2NsdXNpb247dW5pZm9ybSBzYW1wbGVyMkQgZnVyVGV4dHVyZTt2YXJ5aW5nIHZlYzIgdkZ1clVWO1xuI2VuZGlmXG4jaWZkZWYgTE9HQVJJVEhNSUNERVBUSFxuI2V4dGVuc2lvbiBHTF9FWFRfZnJhZ19kZXB0aCA6IGVuYWJsZVxuI2VuZGlmXG4jaW5jbHVkZTxsb2dEZXB0aERlY2xhcmF0aW9uPlxuI2luY2x1ZGU8bGlnaHRzRnJhZ21lbnRGdW5jdGlvbnM+XG4jaW5jbHVkZTxzaGFkb3dzRnJhZ21lbnRGdW5jdGlvbnM+XG4jaW5jbHVkZTxmb2dGcmFnbWVudERlY2xhcmF0aW9uPlxuI2luY2x1ZGU8Y2xpcFBsYW5lRnJhZ21lbnREZWNsYXJhdGlvbj5cbmZsb2F0IFJhbmQodmVjMyBydikge2Zsb2F0IHg9ZG90KHJ2LHZlYzMoMTIuOTg5OCw3OC4yMzMsMjQuNjU0ODcpKTtyZXR1cm4gZnJhY3Qoc2luKHgpKjQzNzU4LjU0NTMpO31cbiNkZWZpbmUgQ1VTVE9NX0ZSQUdNRU5UX0RFRklOSVRJT05TXG52b2lkIG1haW4odm9pZCkge1xuI2RlZmluZSBDVVNUT01fRlJBR01FTlRfTUFJTl9CRUdJTlxuI2luY2x1ZGU8Y2xpcFBsYW5lRnJhZ21lbnQ+XG52ZWMzIHZpZXdEaXJlY3Rpb25XPW5vcm1hbGl6ZSh2RXllUG9zaXRpb24ueHl6LXZQb3NpdGlvblcpO3ZlYzQgYmFzZUNvbG9yPWZ1ckNvbG9yO3ZlYzMgZGlmZnVzZUNvbG9yPXZEaWZmdXNlQ29sb3IucmdiO2Zsb2F0IGFscGhhPXZEaWZmdXNlQ29sb3IuYTtcbiNpZmRlZiBESUZGVVNFXG5iYXNlQ29sb3IqPXRleHR1cmUyRChkaWZmdXNlU2FtcGxlcix2RGlmZnVzZVVWKTtcbiNpZmRlZiBBTFBIQVRFU1RcbmlmIChiYXNlQ29sb3IuYTwwLjQpXG5kaXNjYXJkO1xuI2VuZGlmXG4jaW5jbHVkZTxkZXB0aFByZVBhc3M+XG5iYXNlQ29sb3IucmdiKj12RGlmZnVzZUluZm9zLnk7XG4jZW5kaWZcbiNpZmRlZiBWRVJURVhDT0xPUlxuYmFzZUNvbG9yLnJnYio9dkNvbG9yLnJnYjtcbiNlbmRpZlxuI2lmZGVmIE5PUk1BTFxudmVjMyBub3JtYWxXPW5vcm1hbGl6ZSh2Tm9ybWFsVyk7XG4jZWxzZVxudmVjMyBub3JtYWxXPXZlYzMoMS4wLDEuMCwxLjApO1xuI2VuZGlmXG4jaWZkZWYgSElHSExFVkVMXG52ZWM0IGZ1clRleHR1cmVDb2xvcj10ZXh0dXJlMkQoZnVyVGV4dHVyZSx2ZWMyKHZGdXJVVi54LHZGdXJVVi55KSk7aWYgKGZ1clRleHR1cmVDb2xvci5hPD0wLjAgfHwgZnVyVGV4dHVyZUNvbG9yLmc8ZnVyT2Zmc2V0KSB7ZGlzY2FyZDt9XG5mbG9hdCBvY2NsdXNpb249bWl4KDAuMCxmdXJUZXh0dXJlQ29sb3IuYioxLjIsZnVyT2Zmc2V0KTtiYXNlQ29sb3I9dmVjNChiYXNlQ29sb3IueHl6Km1heChvY2NsdXNpb24sZnVyT2NjbHVzaW9uKSwxLjEtZnVyT2Zmc2V0KTtcbiNlbmRpZlxudmVjMyBkaWZmdXNlQmFzZT12ZWMzKDAuLDAuLDAuKTtsaWdodGluZ0luZm8gaW5mbztmbG9hdCBzaGFkb3c9MS47ZmxvYXQgZ2xvc3NpbmVzcz0wLjtmbG9hdCBhZ2dTaGFkb3c9MC47ZmxvYXQgbnVtTGlnaHRzPTAuO1xuI2lmZGVmIFNQRUNVTEFSVEVSTVxudmVjMyBzcGVjdWxhckJhc2U9dmVjMygwLiwwLiwwLik7XG4jZW5kaWZcbiNpbmNsdWRlPGxpZ2h0RnJhZ21lbnQ+WzAuLm1heFNpbXVsdGFuZW91c0xpZ2h0c11cbiNpZiBkZWZpbmVkKFZFUlRFWEFMUEhBKSB8fCBkZWZpbmVkKElOU1RBTkNFU0NPTE9SKSAmJiBkZWZpbmVkKElOU1RBTkNFUylcbmFscGhhKj12Q29sb3IuYTtcbiNlbmRpZlxudmVjMyBmaW5hbERpZmZ1c2U9Y2xhbXAoZGlmZnVzZUJhc2UucmdiKmJhc2VDb2xvci5yZ2IsMC4wLDEuMCk7XG4jaWZkZWYgSElHSExFVkVMXG52ZWM0IGNvbG9yPXZlYzQoZmluYWxEaWZmdXNlLGFscGhhKTtcbiNlbHNlXG5mbG9hdCByPXZmdXJfbGVuZ3RoL2Z1ckxlbmd0aCowLjU7dmVjNCBjb2xvcj12ZWM0KGZpbmFsRGlmZnVzZSooMC41K3IpLGFscGhhKTtcbiNlbmRpZlxuI2luY2x1ZGU8bG9nRGVwdGhGcmFnbWVudD5cbiNpbmNsdWRlPGZvZ0ZyYWdtZW50PlxuZ2xfRnJhZ0NvbG9yPWNvbG9yO1xuI2luY2x1ZGU8aW1hZ2VQcm9jZXNzaW5nQ29tcGF0aWJpbGl0eT5cbiNkZWZpbmUgQ1VTVE9NX0ZSQUdNRU5UX01BSU5fRU5EXG59YDtcbi8vIFNpZGVlZmZlY3RcblNoYWRlclN0b3JlLlNoYWRlcnNTdG9yZVtuYW1lXSA9IHNoYWRlcjtcbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBjb25zdCBmdXJQaXhlbFNoYWRlciA9IHsgbmFtZSwgc2hhZGVyIH07XG4iLCIvLyBEbyBub3QgZWRpdC5cbmltcG9ydCB7IFNoYWRlclN0b3JlIH0gZnJvbSBcImNvcmUvRW5naW5lcy9zaGFkZXJTdG9yZVwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2JvbmVzRGVjbGFyYXRpb25cIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9iYWtlZFZlcnRleEFuaW1hdGlvbkRlY2xhcmF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvaW5zdGFuY2VzRGVjbGFyYXRpb25cIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9jbGlwUGxhbmVWZXJ0ZXhEZWNsYXJhdGlvblwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2xvZ0RlcHRoRGVjbGFyYXRpb25cIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9mb2dWZXJ0ZXhEZWNsYXJhdGlvblwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2xpZ2h0RnJhZ21lbnREZWNsYXJhdGlvblwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2xpZ2h0VWJvRGVjbGFyYXRpb25cIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9pbnN0YW5jZXNWZXJ0ZXhcIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9ib25lc1ZlcnRleFwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2Jha2VkVmVydGV4QW5pbWF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvY2xpcFBsYW5lVmVydGV4XCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvbG9nRGVwdGhWZXJ0ZXhcIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9mb2dWZXJ0ZXhcIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9zaGFkb3dzVmVydGV4XCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvdmVydGV4Q29sb3JNaXhpbmdcIjtcblxuY29uc3QgbmFtZSA9IFwiZnVyVmVydGV4U2hhZGVyXCI7XG5jb25zdCBzaGFkZXIgPSBgcHJlY2lzaW9uIGhpZ2hwIGZsb2F0O2F0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO2F0dHJpYnV0ZSB2ZWMzIG5vcm1hbDtcbiNpZmRlZiBVVjFcbmF0dHJpYnV0ZSB2ZWMyIHV2O1xuI2VuZGlmXG4jaWZkZWYgVVYyXG5hdHRyaWJ1dGUgdmVjMiB1djI7XG4jZW5kaWZcbiNpZmRlZiBWRVJURVhDT0xPUlxuYXR0cmlidXRlIHZlYzQgY29sb3I7XG4jZW5kaWZcbiNpbmNsdWRlPGJvbmVzRGVjbGFyYXRpb24+XG4jaW5jbHVkZTxiYWtlZFZlcnRleEFuaW1hdGlvbkRlY2xhcmF0aW9uPlxudW5pZm9ybSBmbG9hdCBmdXJMZW5ndGg7dW5pZm9ybSBmbG9hdCBmdXJBbmdsZTtcbiNpZmRlZiBISUdITEVWRUxcbnVuaWZvcm0gZmxvYXQgZnVyT2Zmc2V0O3VuaWZvcm0gdmVjMyBmdXJHcmF2aXR5O3VuaWZvcm0gZmxvYXQgZnVyVGltZTt1bmlmb3JtIGZsb2F0IGZ1clNwYWNpbmc7dW5pZm9ybSBmbG9hdCBmdXJEZW5zaXR5O1xuI2VuZGlmXG4jaWZkZWYgSEVJR0hUTUFQXG51bmlmb3JtIHNhbXBsZXIyRCBoZWlnaHRUZXh0dXJlO1xuI2VuZGlmXG4jaWZkZWYgSElHSExFVkVMXG52YXJ5aW5nIHZlYzIgdkZ1clVWO1xuI2VuZGlmXG4jaW5jbHVkZTxpbnN0YW5jZXNEZWNsYXJhdGlvbj5cbnVuaWZvcm0gbWF0NCB2aWV3O3VuaWZvcm0gbWF0NCB2aWV3UHJvamVjdGlvbjtcbiNpZmRlZiBESUZGVVNFXG52YXJ5aW5nIHZlYzIgdkRpZmZ1c2VVVjt1bmlmb3JtIG1hdDQgZGlmZnVzZU1hdHJpeDt1bmlmb3JtIHZlYzIgdkRpZmZ1c2VJbmZvcztcbiNlbmRpZlxuI2lmZGVmIFBPSU5UU0laRVxudW5pZm9ybSBmbG9hdCBwb2ludFNpemU7XG4jZW5kaWZcbnZhcnlpbmcgdmVjMyB2UG9zaXRpb25XO1xuI2lmZGVmIE5PUk1BTFxudmFyeWluZyB2ZWMzIHZOb3JtYWxXO1xuI2VuZGlmXG52YXJ5aW5nIGZsb2F0IHZmdXJfbGVuZ3RoO1xuI2lmZGVmIFZFUlRFWENPTE9SXG52YXJ5aW5nIHZlYzQgdkNvbG9yO1xuI2VuZGlmXG4jaW5jbHVkZTxjbGlwUGxhbmVWZXJ0ZXhEZWNsYXJhdGlvbj5cbiNpbmNsdWRlPGxvZ0RlcHRoRGVjbGFyYXRpb24+XG4jaW5jbHVkZTxmb2dWZXJ0ZXhEZWNsYXJhdGlvbj5cbiNpbmNsdWRlPF9fZGVjbF9fbGlnaHRGcmFnbWVudD5bMC4ubWF4U2ltdWx0YW5lb3VzTGlnaHRzXVxuZmxvYXQgUmFuZCh2ZWMzIHJ2KSB7ZmxvYXQgeD1kb3QocnYsdmVjMygxMi45ODk4LDc4LjIzMywyNC42NTQ4NykpO3JldHVybiBmcmFjdChzaW4oeCkqNDM3NTguNTQ1Myk7fVxuI2RlZmluZSBDVVNUT01fVkVSVEVYX0RFRklOSVRJT05TXG52b2lkIG1haW4odm9pZCkge1xuI2RlZmluZSBDVVNUT01fVkVSVEVYX01BSU5fQkVHSU5cbiNpbmNsdWRlPGluc3RhbmNlc1ZlcnRleD5cbiNpbmNsdWRlPGJvbmVzVmVydGV4PlxuI2luY2x1ZGU8YmFrZWRWZXJ0ZXhBbmltYXRpb24+XG5mbG9hdCByPVJhbmQocG9zaXRpb24pO1xuI2lmZGVmIEhFSUdIVE1BUFxuI2lmIF9fVkVSU0lPTl9fPjEwMFxudmZ1cl9sZW5ndGg9ZnVyTGVuZ3RoKnRleHR1cmUoaGVpZ2h0VGV4dHVyZSx1dikueDtcbiNlbHNlXG52ZnVyX2xlbmd0aD1mdXJMZW5ndGgqdGV4dHVyZTJEKGhlaWdodFRleHR1cmUsdXYpLnI7XG4jZW5kaWZcbiNlbHNlIFxudmZ1cl9sZW5ndGg9KGZ1ckxlbmd0aCpyKTtcbiNlbmRpZlxudmVjMyB0YW5nZW50MT12ZWMzKG5vcm1hbC55LC1ub3JtYWwueCwwKTt2ZWMzIHRhbmdlbnQyPXZlYzMoLW5vcm1hbC56LDAsbm9ybWFsLngpO3I9UmFuZCh0YW5nZW50MSpyKTtmbG9hdCBKPSgyLjArNC4wKnIpO3I9UmFuZCh0YW5nZW50MipyKTtmbG9hdCBLPSgyLjArMi4wKnIpO3RhbmdlbnQxPXRhbmdlbnQxKkordGFuZ2VudDIqSzt0YW5nZW50MT1ub3JtYWxpemUodGFuZ2VudDEpO3ZlYzMgbmV3UG9zaXRpb249cG9zaXRpb24rbm9ybWFsKnZmdXJfbGVuZ3RoKmNvcyhmdXJBbmdsZSkrdGFuZ2VudDEqdmZ1cl9sZW5ndGgqc2luKGZ1ckFuZ2xlKTtcbiNpZmRlZiBISUdITEVWRUxcbnZlYzMgZm9yY2VEaXJlY3Rpb249dmVjMygwLjAsMC4wLDAuMCk7Zm9yY2VEaXJlY3Rpb24ueD1zaW4oZnVyVGltZStwb3NpdGlvbi54KjAuMDUpKjAuMjtmb3JjZURpcmVjdGlvbi55PWNvcyhmdXJUaW1lKjAuNytwb3NpdGlvbi55KjAuMDQpKjAuMjtmb3JjZURpcmVjdGlvbi56PXNpbihmdXJUaW1lKjAuNytwb3NpdGlvbi56KjAuMDQpKjAuMjt2ZWMzIGRpc3BsYWNlbWVudD12ZWMzKDAuMCwwLjAsMC4wKTtkaXNwbGFjZW1lbnQ9ZnVyR3Jhdml0eStmb3JjZURpcmVjdGlvbjtmbG9hdCBkaXNwbGFjZW1lbnRGYWN0b3I9cG93KGZ1ck9mZnNldCwzLjApO3ZlYzMgYU5vcm1hbD1ub3JtYWw7YU5vcm1hbC54eXorPWRpc3BsYWNlbWVudCpkaXNwbGFjZW1lbnRGYWN0b3I7bmV3UG9zaXRpb249dmVjMyhuZXdQb3NpdGlvbi54LG5ld1Bvc2l0aW9uLnksbmV3UG9zaXRpb24ueikrKG5vcm1hbGl6ZShhTm9ybWFsKSpmdXJPZmZzZXQqZnVyU3BhY2luZyk7XG4jZW5kaWZcbiNpZmRlZiBOT1JNQUxcbnZOb3JtYWxXPW5vcm1hbGl6ZSh2ZWMzKGZpbmFsV29ybGQqdmVjNChub3JtYWwsMC4wKSkpO1xuI2VuZGlmXG5nbF9Qb3NpdGlvbj12aWV3UHJvamVjdGlvbipmaW5hbFdvcmxkKnZlYzQobmV3UG9zaXRpb24sMS4wKTt2ZWM0IHdvcmxkUG9zPWZpbmFsV29ybGQqdmVjNChuZXdQb3NpdGlvbiwxLjApO3ZQb3NpdGlvblc9dmVjMyh3b3JsZFBvcyk7XG4jaWZuZGVmIFVWMVxudmVjMiB1dj12ZWMyKDAuLDAuKTtcbiNlbmRpZlxuI2lmbmRlZiBVVjJcbnZlYzIgdXYyPXZlYzIoMC4sMC4pO1xuI2VuZGlmXG4jaWZkZWYgRElGRlVTRVxuaWYgKHZEaWZmdXNlSW5mb3MueD09MC4pXG57dkRpZmZ1c2VVVj12ZWMyKGRpZmZ1c2VNYXRyaXgqdmVjNCh1diwxLjAsMC4wKSk7fVxuZWxzZVxue3ZEaWZmdXNlVVY9dmVjMihkaWZmdXNlTWF0cml4KnZlYzQodXYyLDEuMCwwLjApKTt9XG4jaWZkZWYgSElHSExFVkVMXG52RnVyVVY9dkRpZmZ1c2VVVipmdXJEZW5zaXR5O1xuI2VuZGlmXG4jZWxzZVxuI2lmZGVmIEhJR0hMRVZFTFxudkZ1clVWPXV2KmZ1ckRlbnNpdHk7XG4jZW5kaWZcbiNlbmRpZlxuI2luY2x1ZGU8Y2xpcFBsYW5lVmVydGV4PlxuI2luY2x1ZGU8bG9nRGVwdGhWZXJ0ZXg+XG4jaW5jbHVkZTxmb2dWZXJ0ZXg+XG4jaW5jbHVkZTxzaGFkb3dzVmVydGV4PlswLi5tYXhTaW11bHRhbmVvdXNMaWdodHNdXG4jaW5jbHVkZTx2ZXJ0ZXhDb2xvck1peGluZz5cbiNpZiBkZWZpbmVkKFBPSU5UU0laRSkgJiYgIWRlZmluZWQoV0VCR1BVKVxuZ2xfUG9pbnRTaXplPXBvaW50U2l6ZTtcbiNlbmRpZlxuI2RlZmluZSBDVVNUT01fVkVSVEVYX01BSU5fRU5EXG59XG5gO1xuLy8gU2lkZWVmZmVjdFxuU2hhZGVyU3RvcmUuU2hhZGVyc1N0b3JlW25hbWVdID0gc2hhZGVyO1xuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IGNvbnN0IGZ1clZlcnRleFNoYWRlciA9IHsgbmFtZSwgc2hhZGVyIH07XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24gKi9cclxuaW1wb3J0IHR5cGUgeyBOdWxsYWJsZSB9IGZyb20gXCJjb3JlL3R5cGVzXCI7XHJcbmltcG9ydCB7IHNlcmlhbGl6ZUFzVmVjdG9yMywgc2VyaWFsaXplQXNUZXh0dXJlLCBzZXJpYWxpemUsIGV4cGFuZFRvUHJvcGVydHksIHNlcmlhbGl6ZUFzQ29sb3IzIH0gZnJvbSBcImNvcmUvTWlzYy9kZWNvcmF0b3JzXCI7XHJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb25IZWxwZXIgfSBmcm9tIFwiY29yZS9NaXNjL2RlY29yYXRvcnMuc2VyaWFsaXphdGlvblwiO1xyXG5pbXBvcnQgdHlwZSB7IE1hdHJpeCB9IGZyb20gXCJjb3JlL01hdGhzL21hdGgudmVjdG9yXCI7XHJcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tIFwiY29yZS9NYXRocy9tYXRoLnZlY3RvclwiO1xyXG5pbXBvcnQgeyBDb2xvcjMgfSBmcm9tIFwiY29yZS9NYXRocy9tYXRoLmNvbG9yXCI7XHJcbmltcG9ydCB0eXBlIHsgSUFuaW1hdGFibGUgfSBmcm9tIFwiY29yZS9BbmltYXRpb25zL2FuaW1hdGFibGUuaW50ZXJmYWNlXCI7XHJcbmltcG9ydCB7IFRhZ3MgfSBmcm9tIFwiY29yZS9NaXNjL3RhZ3NcIjtcclxuaW1wb3J0IHR5cGUgeyBCYXNlVGV4dHVyZSB9IGZyb20gXCJjb3JlL01hdGVyaWFscy9UZXh0dXJlcy9iYXNlVGV4dHVyZVwiO1xyXG5pbXBvcnQgeyBUZXh0dXJlIH0gZnJvbSBcImNvcmUvTWF0ZXJpYWxzL1RleHR1cmVzL3RleHR1cmVcIjtcclxuaW1wb3J0IHsgRHluYW1pY1RleHR1cmUgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvVGV4dHVyZXMvZHluYW1pY1RleHR1cmVcIjtcclxuaW1wb3J0IHR5cGUgeyBJRWZmZWN0Q3JlYXRpb25PcHRpb25zIH0gZnJvbSBcImNvcmUvTWF0ZXJpYWxzL2VmZmVjdFwiO1xyXG5pbXBvcnQgeyBNYXRlcmlhbERlZmluZXMgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvbWF0ZXJpYWxEZWZpbmVzXCI7XHJcbmltcG9ydCB7IFB1c2hNYXRlcmlhbCB9IGZyb20gXCJjb3JlL01hdGVyaWFscy9wdXNoTWF0ZXJpYWxcIjtcclxuaW1wb3J0IHsgTWF0ZXJpYWxGbGFncyB9IGZyb20gXCJjb3JlL01hdGVyaWFscy9tYXRlcmlhbEZsYWdzXCI7XHJcbmltcG9ydCB7IFZlcnRleEJ1ZmZlciB9IGZyb20gXCJjb3JlL0J1ZmZlcnMvYnVmZmVyXCI7XHJcbmltcG9ydCB0eXBlIHsgQWJzdHJhY3RNZXNoIH0gZnJvbSBcImNvcmUvTWVzaGVzL2Fic3RyYWN0TWVzaFwiO1xyXG5pbXBvcnQgdHlwZSB7IFN1Yk1lc2ggfSBmcm9tIFwiY29yZS9NZXNoZXMvc3ViTWVzaFwiO1xyXG5pbXBvcnQgdHlwZSB7IE1lc2ggfSBmcm9tIFwiY29yZS9NZXNoZXMvbWVzaFwiO1xyXG5pbXBvcnQgeyBTY2VuZSB9IGZyb20gXCJjb3JlL3NjZW5lXCI7XHJcbmltcG9ydCB7IFJlZ2lzdGVyQ2xhc3MgfSBmcm9tIFwiY29yZS9NaXNjL3R5cGVTdG9yZVwiO1xyXG5pbXBvcnQgeyBFZmZlY3RGYWxsYmFja3MgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvZWZmZWN0RmFsbGJhY2tzXCI7XHJcblxyXG5pbXBvcnQgXCIuL2Z1ci5mcmFnbWVudFwiO1xyXG5pbXBvcnQgXCIuL2Z1ci52ZXJ0ZXhcIjtcclxuaW1wb3J0IHsgYWRkQ2xpcFBsYW5lVW5pZm9ybXMsIGJpbmRDbGlwUGxhbmUgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvY2xpcFBsYW5lTWF0ZXJpYWxIZWxwZXJcIjtcclxuaW1wb3J0IHtcclxuICAgIEJpbmRCb25lc1BhcmFtZXRlcnMsXHJcbiAgICBCaW5kRm9nUGFyYW1ldGVycyxcclxuICAgIEJpbmRMaWdodHMsXHJcbiAgICBCaW5kTG9nRGVwdGgsXHJcbiAgICBIYW5kbGVGYWxsYmFja3NGb3JTaGFkb3dzLFxyXG4gICAgUHJlcGFyZUF0dHJpYnV0ZXNGb3JCb25lcyxcclxuICAgIFByZXBhcmVBdHRyaWJ1dGVzRm9ySW5zdGFuY2VzLFxyXG4gICAgUHJlcGFyZURlZmluZXNGb3JBdHRyaWJ1dGVzLFxyXG4gICAgUHJlcGFyZURlZmluZXNGb3JGcmFtZUJvdW5kVmFsdWVzLFxyXG4gICAgUHJlcGFyZURlZmluZXNGb3JMaWdodHMsXHJcbiAgICBQcmVwYXJlRGVmaW5lc0Zvck1pc2MsXHJcbiAgICBQcmVwYXJlVW5pZm9ybXNBbmRTYW1wbGVyc0xpc3QsXHJcbn0gZnJvbSBcImNvcmUvTWF0ZXJpYWxzL21hdGVyaWFsSGVscGVyLmZ1bmN0aW9uc1wiO1xyXG5cclxuY2xhc3MgRnVyTWF0ZXJpYWxEZWZpbmVzIGV4dGVuZHMgTWF0ZXJpYWxEZWZpbmVzIHtcclxuICAgIHB1YmxpYyBESUZGVVNFID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgSEVJR0hUTUFQID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgQ0xJUFBMQU5FID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgQ0xJUFBMQU5FMiA9IGZhbHNlO1xyXG4gICAgcHVibGljIENMSVBQTEFORTMgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBDTElQUExBTkU0ID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgQ0xJUFBMQU5FNSA9IGZhbHNlO1xyXG4gICAgcHVibGljIENMSVBQTEFORTYgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBBTFBIQVRFU1QgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBERVBUSFBSRVBBU1MgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBQT0lOVFNJWkUgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBGT0cgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBOT1JNQUwgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBVVjEgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBVVjIgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBWRVJURVhDT0xPUiA9IGZhbHNlO1xyXG4gICAgcHVibGljIFZFUlRFWEFMUEhBID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgTlVNX0JPTkVfSU5GTFVFTkNFUlMgPSAwO1xyXG4gICAgcHVibGljIEJvbmVzUGVyTWVzaCA9IDA7XHJcbiAgICBwdWJsaWMgSU5TVEFOQ0VTID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgSU5TVEFOQ0VTQ09MT1IgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBISUdITEVWRUwgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBJTUFHRVBST0NFU1NJTkdQT1NUUFJPQ0VTUyA9IGZhbHNlO1xyXG4gICAgcHVibGljIFNLSVBGSU5BTENPTE9SQ0xBTVAgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBMT0dBUklUSE1JQ0RFUFRIID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgQVJFQUxJR0hUU1VQUE9SVEVEID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBBUkVBTElHSFROT1JPVUdIVE5FU1MgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5yZWJ1aWxkKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGdXJNYXRlcmlhbCBleHRlbmRzIFB1c2hNYXRlcmlhbCB7XHJcbiAgICBAc2VyaWFsaXplQXNUZXh0dXJlKFwiZGlmZnVzZVRleHR1cmVcIilcclxuICAgIHByaXZhdGUgX2RpZmZ1c2VUZXh0dXJlOiBCYXNlVGV4dHVyZTtcclxuICAgIEBleHBhbmRUb1Byb3BlcnR5KFwiX21hcmtBbGxTdWJNZXNoZXNBc1RleHR1cmVzRGlydHlcIilcclxuICAgIHB1YmxpYyBkaWZmdXNlVGV4dHVyZTogQmFzZVRleHR1cmU7XHJcblxyXG4gICAgQHNlcmlhbGl6ZUFzVGV4dHVyZShcImhlaWdodFRleHR1cmVcIilcclxuICAgIHByaXZhdGUgX2hlaWdodFRleHR1cmU6IEJhc2VUZXh0dXJlO1xyXG4gICAgQGV4cGFuZFRvUHJvcGVydHkoXCJfbWFya0FsbFN1Yk1lc2hlc0FzVGV4dHVyZXNEaXJ0eVwiKVxyXG4gICAgcHVibGljIGhlaWdodFRleHR1cmU6IEJhc2VUZXh0dXJlO1xyXG5cclxuICAgIEBzZXJpYWxpemVBc0NvbG9yMygpXHJcbiAgICBwdWJsaWMgZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMygxLCAxLCAxKTtcclxuXHJcbiAgICBAc2VyaWFsaXplKClcclxuICAgIHB1YmxpYyBmdXJMZW5ndGg6IG51bWJlciA9IDE7XHJcblxyXG4gICAgQHNlcmlhbGl6ZSgpXHJcbiAgICBwdWJsaWMgZnVyQW5nbGU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgQHNlcmlhbGl6ZUFzQ29sb3IzKClcclxuICAgIHB1YmxpYyBmdXJDb2xvciA9IG5ldyBDb2xvcjMoMC40NCwgMC4yMSwgMC4wMik7XHJcblxyXG4gICAgQHNlcmlhbGl6ZSgpXHJcbiAgICBwdWJsaWMgZnVyT2Zmc2V0OiBudW1iZXIgPSAwLjA7XHJcblxyXG4gICAgQHNlcmlhbGl6ZSgpXHJcbiAgICBwdWJsaWMgZnVyU3BhY2luZzogbnVtYmVyID0gMTI7XHJcblxyXG4gICAgQHNlcmlhbGl6ZUFzVmVjdG9yMygpXHJcbiAgICBwdWJsaWMgZnVyR3Jhdml0eSA9IG5ldyBWZWN0b3IzKDAsIDAsIDApO1xyXG5cclxuICAgIEBzZXJpYWxpemUoKVxyXG4gICAgcHVibGljIGZ1clNwZWVkOiBudW1iZXIgPSAxMDA7XHJcblxyXG4gICAgQHNlcmlhbGl6ZSgpXHJcbiAgICBwdWJsaWMgZnVyRGVuc2l0eTogbnVtYmVyID0gMjA7XHJcblxyXG4gICAgQHNlcmlhbGl6ZSgpXHJcbiAgICBwdWJsaWMgZnVyT2NjbHVzaW9uOiBudW1iZXIgPSAwLjA7XHJcblxyXG4gICAgcHVibGljIGZ1clRleHR1cmU6IER5bmFtaWNUZXh0dXJlO1xyXG5cclxuICAgIEBzZXJpYWxpemUoXCJkaXNhYmxlTGlnaHRpbmdcIilcclxuICAgIHByaXZhdGUgX2Rpc2FibGVMaWdodGluZyA9IGZhbHNlO1xyXG4gICAgQGV4cGFuZFRvUHJvcGVydHkoXCJfbWFya0FsbFN1Yk1lc2hlc0FzTGlnaHRzRGlydHlcIilcclxuICAgIHB1YmxpYyBkaXNhYmxlTGlnaHRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgQHNlcmlhbGl6ZShcIm1heFNpbXVsdGFuZW91c0xpZ2h0c1wiKVxyXG4gICAgcHJpdmF0ZSBfbWF4U2ltdWx0YW5lb3VzTGlnaHRzID0gNDtcclxuICAgIEBleHBhbmRUb1Byb3BlcnR5KFwiX21hcmtBbGxTdWJNZXNoZXNBc0xpZ2h0c0RpcnR5XCIpXHJcbiAgICBwdWJsaWMgbWF4U2ltdWx0YW5lb3VzTGlnaHRzOiBudW1iZXI7XHJcblxyXG4gICAgQHNlcmlhbGl6ZSgpXHJcbiAgICBwdWJsaWMgaGlnaExldmVsRnVyOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBwdWJsaWMgX21lc2hlczogQWJzdHJhY3RNZXNoW107XHJcblxyXG4gICAgcHJpdmF0ZSBfZnVyVGltZTogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHNjZW5lPzogU2NlbmUpIHtcclxuICAgICAgICBzdXBlcihuYW1lLCBzY2VuZSk7XHJcbiAgICB9XHJcblxyXG4gICAgQHNlcmlhbGl6ZSgpXHJcbiAgICBwdWJsaWMgZ2V0IGZ1clRpbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Z1clRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBmdXJUaW1lKGZ1clRpbWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2Z1clRpbWUgPSBmdXJUaW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBuZWVkQWxwaGFCbGVuZGluZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hbHBoYSA8IDEuMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgbmVlZEFscGhhVGVzdGluZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldEFscGhhVGVzdFRleHR1cmUoKTogTnVsbGFibGU8QmFzZVRleHR1cmU+IHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlRnVyKCk6IHZvaWQge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5fbWVzaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldEZ1ciA9IDxGdXJNYXRlcmlhbD50aGlzLl9tZXNoZXNbaV0ubWF0ZXJpYWw7XHJcblxyXG4gICAgICAgICAgICBvZmZzZXRGdXIuZnVyTGVuZ3RoID0gdGhpcy5mdXJMZW5ndGg7XHJcbiAgICAgICAgICAgIG9mZnNldEZ1ci5mdXJBbmdsZSA9IHRoaXMuZnVyQW5nbGU7XHJcbiAgICAgICAgICAgIG9mZnNldEZ1ci5mdXJHcmF2aXR5ID0gdGhpcy5mdXJHcmF2aXR5O1xyXG4gICAgICAgICAgICBvZmZzZXRGdXIuZnVyU3BhY2luZyA9IHRoaXMuZnVyU3BhY2luZztcclxuICAgICAgICAgICAgb2Zmc2V0RnVyLmZ1clNwZWVkID0gdGhpcy5mdXJTcGVlZDtcclxuICAgICAgICAgICAgb2Zmc2V0RnVyLmZ1ckNvbG9yID0gdGhpcy5mdXJDb2xvcjtcclxuICAgICAgICAgICAgb2Zmc2V0RnVyLmRpZmZ1c2VUZXh0dXJlID0gdGhpcy5kaWZmdXNlVGV4dHVyZTtcclxuICAgICAgICAgICAgb2Zmc2V0RnVyLmZ1clRleHR1cmUgPSB0aGlzLmZ1clRleHR1cmU7XHJcbiAgICAgICAgICAgIG9mZnNldEZ1ci5oaWdoTGV2ZWxGdXIgPSB0aGlzLmhpZ2hMZXZlbEZ1cjtcclxuICAgICAgICAgICAgb2Zmc2V0RnVyLmZ1clRpbWUgPSB0aGlzLmZ1clRpbWU7XHJcbiAgICAgICAgICAgIG9mZnNldEZ1ci5mdXJEZW5zaXR5ID0gdGhpcy5mdXJEZW5zaXR5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBNZXRob2RzXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgaXNSZWFkeUZvclN1Yk1lc2gobWVzaDogQWJzdHJhY3RNZXNoLCBzdWJNZXNoOiBTdWJNZXNoLCB1c2VJbnN0YW5jZXM/OiBib29sZWFuKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgZHJhd1dyYXBwZXIgPSBzdWJNZXNoLl9kcmF3V3JhcHBlcjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNGcm96ZW4pIHtcclxuICAgICAgICAgICAgaWYgKGRyYXdXcmFwcGVyLmVmZmVjdCAmJiBkcmF3V3JhcHBlci5fd2FzUHJldmlvdXNseVJlYWR5ICYmIGRyYXdXcmFwcGVyLl93YXNQcmV2aW91c2x5VXNpbmdJbnN0YW5jZXMgPT09IHVzZUluc3RhbmNlcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc3ViTWVzaC5tYXRlcmlhbERlZmluZXMpIHtcclxuICAgICAgICAgICAgc3ViTWVzaC5tYXRlcmlhbERlZmluZXMgPSBuZXcgRnVyTWF0ZXJpYWxEZWZpbmVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkZWZpbmVzID0gPEZ1ck1hdGVyaWFsRGVmaW5lcz5zdWJNZXNoLm1hdGVyaWFsRGVmaW5lcztcclxuICAgICAgICBjb25zdCBzY2VuZSA9IHRoaXMuZ2V0U2NlbmUoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVhZHlGb3JTdWJNZXNoKHN1Yk1lc2gpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZW5naW5lID0gc2NlbmUuZ2V0RW5naW5lKCk7XHJcblxyXG4gICAgICAgIC8vIFRleHR1cmVzXHJcbiAgICAgICAgaWYgKGRlZmluZXMuX2FyZVRleHR1cmVzRGlydHkpIHtcclxuICAgICAgICAgICAgaWYgKHNjZW5lLnRleHR1cmVzRW5hYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlmZnVzZVRleHR1cmUgJiYgTWF0ZXJpYWxGbGFncy5EaWZmdXNlVGV4dHVyZUVuYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZGlmZnVzZVRleHR1cmUuaXNSZWFkeSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVzLl9uZWVkVVZzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lcy5ESUZGVVNFID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oZWlnaHRUZXh0dXJlICYmIGVuZ2luZS5nZXRDYXBzKCkubWF4VmVydGV4VGV4dHVyZUltYWdlVW5pdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaGVpZ2h0VGV4dHVyZS5pc1JlYWR5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZXMuX25lZWRVVnMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVzLkhFSUdIVE1BUCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBIaWdoIGxldmVsXHJcbiAgICAgICAgaWYgKHRoaXMuaGlnaExldmVsRnVyICE9PSBkZWZpbmVzLkhJR0hMRVZFTCkge1xyXG4gICAgICAgICAgICBkZWZpbmVzLkhJR0hMRVZFTCA9IHRydWU7XHJcbiAgICAgICAgICAgIGRlZmluZXMubWFya0FzVW5wcm9jZXNzZWQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE1pc2MuXHJcbiAgICAgICAgUHJlcGFyZURlZmluZXNGb3JNaXNjKG1lc2gsIHNjZW5lLCB0aGlzLl91c2VMb2dhcml0aG1pY0RlcHRoLCB0aGlzLnBvaW50c0Nsb3VkLCB0aGlzLmZvZ0VuYWJsZWQsIHRoaXMuX3Nob3VsZFR1cm5BbHBoYVRlc3RPbihtZXNoKSwgZGVmaW5lcyk7XHJcblxyXG4gICAgICAgIC8vIExpZ2h0c1xyXG4gICAgICAgIGRlZmluZXMuX25lZWROb3JtYWxzID0gUHJlcGFyZURlZmluZXNGb3JMaWdodHMoc2NlbmUsIG1lc2gsIGRlZmluZXMsIGZhbHNlLCB0aGlzLl9tYXhTaW11bHRhbmVvdXNMaWdodHMsIHRoaXMuX2Rpc2FibGVMaWdodGluZyk7XHJcblxyXG4gICAgICAgIC8vIFZhbHVlcyB0aGF0IG5lZWQgdG8gYmUgZXZhbHVhdGVkIG9uIGV2ZXJ5IGZyYW1lXHJcbiAgICAgICAgUHJlcGFyZURlZmluZXNGb3JGcmFtZUJvdW5kVmFsdWVzKHNjZW5lLCBlbmdpbmUsIHRoaXMsIGRlZmluZXMsIHVzZUluc3RhbmNlcyA/IHRydWUgOiBmYWxzZSk7XHJcblxyXG4gICAgICAgIC8vIEF0dHJpYnNcclxuICAgICAgICBQcmVwYXJlRGVmaW5lc0ZvckF0dHJpYnV0ZXMobWVzaCwgZGVmaW5lcywgdHJ1ZSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIC8vIEdldCBjb3JyZWN0IGVmZmVjdFxyXG4gICAgICAgIGlmIChkZWZpbmVzLmlzRGlydHkpIHtcclxuICAgICAgICAgICAgZGVmaW5lcy5tYXJrQXNQcm9jZXNzZWQoKTtcclxuXHJcbiAgICAgICAgICAgIHNjZW5lLnJlc2V0Q2FjaGVkTWF0ZXJpYWwoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrc1xyXG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja3MgPSBuZXcgRWZmZWN0RmFsbGJhY2tzKCk7XHJcbiAgICAgICAgICAgIGlmIChkZWZpbmVzLkZPRykge1xyXG4gICAgICAgICAgICAgICAgZmFsbGJhY2tzLmFkZEZhbGxiYWNrKDEsIFwiRk9HXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBIYW5kbGVGYWxsYmFja3NGb3JTaGFkb3dzKGRlZmluZXMsIGZhbGxiYWNrcywgdGhpcy5tYXhTaW11bHRhbmVvdXNMaWdodHMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlZmluZXMuTlVNX0JPTkVfSU5GTFVFTkNFUlMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBmYWxsYmFja3MuYWRkQ1BVU2tpbm5pbmdGYWxsYmFjaygwLCBtZXNoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGVmaW5lcy5JTUFHRVBST0NFU1NJTkdQT1NUUFJPQ0VTUyA9IHNjZW5lLmltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24uYXBwbHlCeVBvc3RQcm9jZXNzO1xyXG5cclxuICAgICAgICAgICAgLy9BdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnMgPSBbVmVydGV4QnVmZmVyLlBvc2l0aW9uS2luZF07XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVmaW5lcy5OT1JNQUwpIHtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnMucHVzaChWZXJ0ZXhCdWZmZXIuTm9ybWFsS2luZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChkZWZpbmVzLlVWMSkge1xyXG4gICAgICAgICAgICAgICAgYXR0cmlicy5wdXNoKFZlcnRleEJ1ZmZlci5VVktpbmQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVmaW5lcy5VVjIpIHtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnMucHVzaChWZXJ0ZXhCdWZmZXIuVVYyS2luZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChkZWZpbmVzLlZFUlRFWENPTE9SKSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJzLnB1c2goVmVydGV4QnVmZmVyLkNvbG9yS2luZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIFByZXBhcmVBdHRyaWJ1dGVzRm9yQm9uZXMoYXR0cmlicywgbWVzaCwgZGVmaW5lcywgZmFsbGJhY2tzKTtcclxuICAgICAgICAgICAgUHJlcGFyZUF0dHJpYnV0ZXNGb3JJbnN0YW5jZXMoYXR0cmlicywgZGVmaW5lcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBMZWdhY3kgYnJvd3NlciBwYXRjaFxyXG4gICAgICAgICAgICBjb25zdCBzaGFkZXJOYW1lID0gXCJmdXJcIjtcclxuICAgICAgICAgICAgY29uc3Qgam9pbiA9IGRlZmluZXMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY29uc3QgdW5pZm9ybXMgPSBbXHJcbiAgICAgICAgICAgICAgICBcIndvcmxkXCIsXHJcbiAgICAgICAgICAgICAgICBcInZpZXdcIixcclxuICAgICAgICAgICAgICAgIFwidmlld1Byb2plY3Rpb25cIixcclxuICAgICAgICAgICAgICAgIFwidkV5ZVBvc2l0aW9uXCIsXHJcbiAgICAgICAgICAgICAgICBcInZMaWdodHNUeXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcInZEaWZmdXNlQ29sb3JcIixcclxuICAgICAgICAgICAgICAgIFwidkZvZ0luZm9zXCIsXHJcbiAgICAgICAgICAgICAgICBcInZGb2dDb2xvclwiLFxyXG4gICAgICAgICAgICAgICAgXCJwb2ludFNpemVcIixcclxuICAgICAgICAgICAgICAgIFwidkRpZmZ1c2VJbmZvc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJtQm9uZXNcIixcclxuICAgICAgICAgICAgICAgIFwiZGlmZnVzZU1hdHJpeFwiLFxyXG4gICAgICAgICAgICAgICAgXCJsb2dhcml0aG1pY0RlcHRoQ29uc3RhbnRcIixcclxuICAgICAgICAgICAgICAgIFwiZnVyTGVuZ3RoXCIsXHJcbiAgICAgICAgICAgICAgICBcImZ1ckFuZ2xlXCIsXHJcbiAgICAgICAgICAgICAgICBcImZ1ckNvbG9yXCIsXHJcbiAgICAgICAgICAgICAgICBcImZ1ck9mZnNldFwiLFxyXG4gICAgICAgICAgICAgICAgXCJmdXJHcmF2aXR5XCIsXHJcbiAgICAgICAgICAgICAgICBcImZ1clRpbWVcIixcclxuICAgICAgICAgICAgICAgIFwiZnVyU3BhY2luZ1wiLFxyXG4gICAgICAgICAgICAgICAgXCJmdXJEZW5zaXR5XCIsXHJcbiAgICAgICAgICAgICAgICBcImZ1ck9jY2x1c2lvblwiLFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICBhZGRDbGlwUGxhbmVVbmlmb3Jtcyh1bmlmb3Jtcyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNhbXBsZXJzID0gW1wiZGlmZnVzZVNhbXBsZXJcIiwgXCJoZWlnaHRUZXh0dXJlXCIsIFwiZnVyVGV4dHVyZVwiLCBcImFyZWFMaWdodHNMVEMxU2FtcGxlclwiLCBcImFyZWFMaWdodHNMVEMyU2FtcGxlclwiXTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1CdWZmZXJzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgUHJlcGFyZVVuaWZvcm1zQW5kU2FtcGxlcnNMaXN0KDxJRWZmZWN0Q3JlYXRpb25PcHRpb25zPntcclxuICAgICAgICAgICAgICAgIHVuaWZvcm1zTmFtZXM6IHVuaWZvcm1zLFxyXG4gICAgICAgICAgICAgICAgdW5pZm9ybUJ1ZmZlcnNOYW1lczogdW5pZm9ybUJ1ZmZlcnMsXHJcbiAgICAgICAgICAgICAgICBzYW1wbGVyczogc2FtcGxlcnMsXHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzOiBkZWZpbmVzLFxyXG4gICAgICAgICAgICAgICAgbWF4U2ltdWx0YW5lb3VzTGlnaHRzOiB0aGlzLm1heFNpbXVsdGFuZW91c0xpZ2h0cyxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzdWJNZXNoLnNldEVmZmVjdChcclxuICAgICAgICAgICAgICAgIHNjZW5lLmdldEVuZ2luZSgpLmNyZWF0ZUVmZmVjdChcclxuICAgICAgICAgICAgICAgICAgICBzaGFkZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIDxJRWZmZWN0Q3JlYXRpb25PcHRpb25zPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogYXR0cmlicyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pZm9ybXNOYW1lczogdW5pZm9ybXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaWZvcm1CdWZmZXJzTmFtZXM6IHVuaWZvcm1CdWZmZXJzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1wbGVyczogc2FtcGxlcnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZXM6IGpvaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrczogZmFsbGJhY2tzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBpbGVkOiB0aGlzLm9uQ29tcGlsZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3I6IHRoaXMub25FcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhQYXJhbWV0ZXJzOiB7IG1heFNpbXVsdGFuZW91c0xpZ2h0czogdGhpcy5tYXhTaW11bHRhbmVvdXNMaWdodHMgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZ2luZVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIGRlZmluZXMsXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXRlcmlhbENvbnRleHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGlmIEFyZWEgTGlnaHRzIGhhdmUgTFRDIHRleHR1cmUuXHJcbiAgICAgICAgaWYgKGRlZmluZXNbXCJBUkVBTElHSFRVU0VEXCJdKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBtZXNoLmxpZ2h0U291cmNlcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgICAgIGlmICghbWVzaC5saWdodFNvdXJjZXNbaW5kZXhdLl9pc1JlYWR5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc3ViTWVzaC5lZmZlY3QgfHwgIXN1Yk1lc2guZWZmZWN0LmlzUmVhZHkoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkZWZpbmVzLl9yZW5kZXJJZCA9IHNjZW5lLmdldFJlbmRlcklkKCk7XHJcbiAgICAgICAgZHJhd1dyYXBwZXIuX3dhc1ByZXZpb3VzbHlSZWFkeSA9IHRydWU7XHJcbiAgICAgICAgZHJhd1dyYXBwZXIuX3dhc1ByZXZpb3VzbHlVc2luZ0luc3RhbmNlcyA9ICEhdXNlSW5zdGFuY2VzO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgYmluZEZvclN1Yk1lc2god29ybGQ6IE1hdHJpeCwgbWVzaDogTWVzaCwgc3ViTWVzaDogU3ViTWVzaCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHNjZW5lID0gdGhpcy5nZXRTY2VuZSgpO1xyXG5cclxuICAgICAgICBjb25zdCBkZWZpbmVzID0gPEZ1ck1hdGVyaWFsRGVmaW5lcz5zdWJNZXNoLm1hdGVyaWFsRGVmaW5lcztcclxuICAgICAgICBpZiAoIWRlZmluZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZWZmZWN0ID0gc3ViTWVzaC5lZmZlY3Q7XHJcbiAgICAgICAgaWYgKCFlZmZlY3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3QgPSBlZmZlY3Q7XHJcblxyXG4gICAgICAgIC8vIE1hdHJpY2VzXHJcbiAgICAgICAgdGhpcy5iaW5kT25seVdvcmxkTWF0cml4KHdvcmxkKTtcclxuICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0TWF0cml4KFwidmlld1Byb2plY3Rpb25cIiwgc2NlbmUuZ2V0VHJhbnNmb3JtTWF0cml4KCkpO1xyXG5cclxuICAgICAgICAvLyBCb25lc1xyXG4gICAgICAgIEJpbmRCb25lc1BhcmFtZXRlcnMobWVzaCwgdGhpcy5fYWN0aXZlRWZmZWN0KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX211c3RSZWJpbmQoc2NlbmUsIGVmZmVjdCwgc3ViTWVzaCkpIHtcclxuICAgICAgICAgICAgLy8gVGV4dHVyZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2RpZmZ1c2VUZXh0dXJlICYmIE1hdGVyaWFsRmxhZ3MuRGlmZnVzZVRleHR1cmVFbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0VGV4dHVyZShcImRpZmZ1c2VTYW1wbGVyXCIsIHRoaXMuX2RpZmZ1c2VUZXh0dXJlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0RmxvYXQyKFwidkRpZmZ1c2VJbmZvc1wiLCB0aGlzLl9kaWZmdXNlVGV4dHVyZS5jb29yZGluYXRlc0luZGV4LCB0aGlzLl9kaWZmdXNlVGV4dHVyZS5sZXZlbCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0TWF0cml4KFwiZGlmZnVzZU1hdHJpeFwiLCB0aGlzLl9kaWZmdXNlVGV4dHVyZS5nZXRUZXh0dXJlTWF0cml4KCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5faGVpZ2h0VGV4dHVyZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldFRleHR1cmUoXCJoZWlnaHRUZXh0dXJlXCIsIHRoaXMuX2hlaWdodFRleHR1cmUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDbGlwIHBsYW5lXHJcbiAgICAgICAgICAgIGJpbmRDbGlwUGxhbmUodGhpcy5fYWN0aXZlRWZmZWN0LCB0aGlzLCBzY2VuZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBQb2ludCBzaXplXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBvaW50c0Nsb3VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0RmxvYXQoXCJwb2ludFNpemVcIiwgdGhpcy5wb2ludFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBMb2cuIGRlcHRoXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl91c2VMb2dhcml0aG1pY0RlcHRoKSB7XHJcbiAgICAgICAgICAgICAgICBCaW5kTG9nRGVwdGgoZGVmaW5lcywgZWZmZWN0LCBzY2VuZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjZW5lLmJpbmRFeWVQb3NpdGlvbihlZmZlY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldENvbG9yNChcInZEaWZmdXNlQ29sb3JcIiwgdGhpcy5kaWZmdXNlQ29sb3IsIHRoaXMuYWxwaGEgKiBtZXNoLnZpc2liaWxpdHkpO1xyXG5cclxuICAgICAgICBpZiAoc2NlbmUubGlnaHRzRW5hYmxlZCAmJiAhdGhpcy5kaXNhYmxlTGlnaHRpbmcpIHtcclxuICAgICAgICAgICAgQmluZExpZ2h0cyhzY2VuZSwgbWVzaCwgdGhpcy5fYWN0aXZlRWZmZWN0LCBkZWZpbmVzLCB0aGlzLm1heFNpbXVsdGFuZW91c0xpZ2h0cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBWaWV3XHJcbiAgICAgICAgaWYgKHNjZW5lLmZvZ0VuYWJsZWQgJiYgbWVzaC5hcHBseUZvZyAmJiBzY2VuZS5mb2dNb2RlICE9PSBTY2VuZS5GT0dNT0RFX05PTkUpIHtcclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldE1hdHJpeChcInZpZXdcIiwgc2NlbmUuZ2V0Vmlld01hdHJpeCgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEZvZ1xyXG4gICAgICAgIEJpbmRGb2dQYXJhbWV0ZXJzKHNjZW5lLCBtZXNoLCB0aGlzLl9hY3RpdmVFZmZlY3QpO1xyXG5cclxuICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0RmxvYXQoXCJmdXJMZW5ndGhcIiwgdGhpcy5mdXJMZW5ndGgpO1xyXG4gICAgICAgIHRoaXMuX2FjdGl2ZUVmZmVjdC5zZXRGbG9hdChcImZ1ckFuZ2xlXCIsIHRoaXMuZnVyQW5nbGUpO1xyXG4gICAgICAgIHRoaXMuX2FjdGl2ZUVmZmVjdC5zZXRDb2xvcjQoXCJmdXJDb2xvclwiLCB0aGlzLmZ1ckNvbG9yLCAxLjApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5oaWdoTGV2ZWxGdXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldFZlY3RvcjMoXCJmdXJHcmF2aXR5XCIsIHRoaXMuZnVyR3Jhdml0eSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FjdGl2ZUVmZmVjdC5zZXRGbG9hdChcImZ1ck9mZnNldFwiLCB0aGlzLmZ1ck9mZnNldCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FjdGl2ZUVmZmVjdC5zZXRGbG9hdChcImZ1clNwYWNpbmdcIiwgdGhpcy5mdXJTcGFjaW5nKTtcclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldEZsb2F0KFwiZnVyRGVuc2l0eVwiLCB0aGlzLmZ1ckRlbnNpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0RmxvYXQoXCJmdXJPY2NsdXNpb25cIiwgdGhpcy5mdXJPY2NsdXNpb24pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fZnVyVGltZSArPSB0aGlzLmdldFNjZW5lKCkuZ2V0RW5naW5lKCkuZ2V0RGVsdGFUaW1lKCkgLyB0aGlzLmZ1clNwZWVkO1xyXG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0RmxvYXQoXCJmdXJUaW1lXCIsIHRoaXMuX2Z1clRpbWUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldFRleHR1cmUoXCJmdXJUZXh0dXJlXCIsIHRoaXMuZnVyVGV4dHVyZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9hZnRlckJpbmQobWVzaCwgdGhpcy5fYWN0aXZlRWZmZWN0LCBzdWJNZXNoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0QW5pbWF0YWJsZXMoKTogSUFuaW1hdGFibGVbXSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kaWZmdXNlVGV4dHVyZSAmJiB0aGlzLmRpZmZ1c2VUZXh0dXJlLmFuaW1hdGlvbnMgJiYgdGhpcy5kaWZmdXNlVGV4dHVyZS5hbmltYXRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZGlmZnVzZVRleHR1cmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0VGV4dHVyZSAmJiB0aGlzLmhlaWdodFRleHR1cmUuYW5pbWF0aW9ucyAmJiB0aGlzLmhlaWdodFRleHR1cmUuYW5pbWF0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmhlaWdodFRleHR1cmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldEFjdGl2ZVRleHR1cmVzKCk6IEJhc2VUZXh0dXJlW10ge1xyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVRleHR1cmVzID0gc3VwZXIuZ2V0QWN0aXZlVGV4dHVyZXMoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2RpZmZ1c2VUZXh0dXJlKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZVRleHR1cmVzLnB1c2godGhpcy5fZGlmZnVzZVRleHR1cmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2hlaWdodFRleHR1cmUpIHtcclxuICAgICAgICAgICAgYWN0aXZlVGV4dHVyZXMucHVzaCh0aGlzLl9oZWlnaHRUZXh0dXJlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhY3RpdmVUZXh0dXJlcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgaGFzVGV4dHVyZSh0ZXh0dXJlOiBCYXNlVGV4dHVyZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChzdXBlci5oYXNUZXh0dXJlKHRleHR1cmUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlmZnVzZVRleHR1cmUgPT09IHRleHR1cmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5faGVpZ2h0VGV4dHVyZSA9PT0gdGV4dHVyZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZShmb3JjZURpc3Bvc2VFZmZlY3Q/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlmZnVzZVRleHR1cmUpIHtcclxuICAgICAgICAgICAgdGhpcy5kaWZmdXNlVGV4dHVyZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fbWVzaGVzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5fbWVzaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtYXQgPSB0aGlzLl9tZXNoZXNbaV0ubWF0ZXJpYWw7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1hdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdC5kaXNwb3NlKGZvcmNlRGlzcG9zZUVmZmVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tZXNoZXNbaV0uZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdXBlci5kaXNwb3NlKGZvcmNlRGlzcG9zZUVmZmVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIGNsb25lKG5hbWU6IHN0cmluZyk6IEZ1ck1hdGVyaWFsIHtcclxuICAgICAgICByZXR1cm4gU2VyaWFsaXphdGlvbkhlbHBlci5DbG9uZSgoKSA9PiBuZXcgRnVyTWF0ZXJpYWwobmFtZSwgdGhpcy5nZXRTY2VuZSgpKSwgdGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIHNlcmlhbGl6ZSgpOiBhbnkge1xyXG4gICAgICAgIGNvbnN0IHNlcmlhbGl6YXRpb25PYmplY3QgPSBzdXBlci5zZXJpYWxpemUoKTtcclxuICAgICAgICBzZXJpYWxpemF0aW9uT2JqZWN0LmN1c3RvbVR5cGUgPSBcIkJBQllMT04uRnVyTWF0ZXJpYWxcIjtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX21lc2hlcykge1xyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uT2JqZWN0LnNvdXJjZU1lc2hOYW1lID0gdGhpcy5fbWVzaGVzWzBdLm5hbWU7XHJcbiAgICAgICAgICAgIHNlcmlhbGl6YXRpb25PYmplY3QucXVhbGl0eSA9IHRoaXMuX21lc2hlcy5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbk9iamVjdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q2xhc3NOYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIFwiRnVyTWF0ZXJpYWxcIjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTdGF0aWNzXHJcbiAgICBwdWJsaWMgc3RhdGljIG92ZXJyaWRlIFBhcnNlKHNvdXJjZTogYW55LCBzY2VuZTogU2NlbmUsIHJvb3RVcmw6IHN0cmluZyk6IEZ1ck1hdGVyaWFsIHtcclxuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IFNlcmlhbGl6YXRpb25IZWxwZXIuUGFyc2UoKCkgPT4gbmV3IEZ1ck1hdGVyaWFsKHNvdXJjZS5uYW1lLCBzY2VuZSksIHNvdXJjZSwgc2NlbmUsIHJvb3RVcmwpO1xyXG5cclxuICAgICAgICBpZiAoc291cmNlLnNvdXJjZU1lc2hOYW1lICYmIG1hdGVyaWFsLmhpZ2hMZXZlbEZ1cikge1xyXG4gICAgICAgICAgICBzY2VuZS5leGVjdXRlV2hlblJlYWR5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZU1lc2ggPSA8TWVzaD5zY2VuZS5nZXRNZXNoQnlOYW1lKHNvdXJjZS5zb3VyY2VNZXNoTmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlTWVzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZ1clRleHR1cmUgPSBGdXJNYXRlcmlhbC5HZW5lcmF0ZVRleHR1cmUoXCJGdXIgVGV4dHVyZVwiLCBzY2VuZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0ZXJpYWwuZnVyVGV4dHVyZSA9IGZ1clRleHR1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgRnVyTWF0ZXJpYWwuRnVyaWZ5TWVzaChzb3VyY2VNZXNoLCBzb3VyY2UucXVhbGl0eSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG1hdGVyaWFsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgR2VuZXJhdGVUZXh0dXJlKG5hbWU6IHN0cmluZywgc2NlbmU6IFNjZW5lKTogRHluYW1pY1RleHR1cmUge1xyXG4gICAgICAgIC8vIEdlbmVyYXRlIGZ1ciB0ZXh0dXJlc1xyXG4gICAgICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgRHluYW1pY1RleHR1cmUoXCJGdXJUZXh0dXJlIFwiICsgbmFtZSwgMjU2LCBzY2VuZSwgdHJ1ZSk7XHJcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHRleHR1cmUuZ2V0Q29udGV4dCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDIwMDAwOyArK2kpIHtcclxuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LCBcIiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NSkgKyBcIiwgXCIgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTUpICsgXCIsIDEpXCI7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3QoTWF0aC5yYW5kb20oKSAqIHRleHR1cmUuZ2V0U2l6ZSgpLndpZHRoLCBNYXRoLnJhbmRvbSgpICogdGV4dHVyZS5nZXRTaXplKCkuaGVpZ2h0LCAyLCAyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRleHR1cmUudXBkYXRlKGZhbHNlKTtcclxuICAgICAgICB0ZXh0dXJlLndyYXBVID0gVGV4dHVyZS5XUkFQX0FERFJFU1NNT0RFO1xyXG4gICAgICAgIHRleHR1cmUud3JhcFYgPSBUZXh0dXJlLldSQVBfQUREUkVTU01PREU7XHJcblxyXG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZXMgYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgbWVzaGVzIHVzZWQgYXMgc2hlbGxzIGZvciB0aGUgRnVyIE1hdGVyaWFsXHJcbiAgICAvLyB0aGF0IGNhbiBiZSBkaXNwb3NlZCBsYXRlciBpbiB5b3VyIGNvZGVcclxuICAgIC8vIFRoZSBxdWFsaXR5IGlzIGluIGludGVydmFsIFswLCAxMDBdXHJcbiAgICBwdWJsaWMgc3RhdGljIEZ1cmlmeU1lc2goc291cmNlTWVzaDogTWVzaCwgcXVhbGl0eTogbnVtYmVyKTogTWVzaFtdIHtcclxuICAgICAgICBjb25zdCBtZXNoZXMgPSBbc291cmNlTWVzaF07XHJcbiAgICAgICAgY29uc3QgbWF0OiBGdXJNYXRlcmlhbCA9IDxGdXJNYXRlcmlhbD5zb3VyY2VNZXNoLm1hdGVyaWFsO1xyXG4gICAgICAgIGxldCBpO1xyXG5cclxuICAgICAgICBpZiAoIShtYXQgaW5zdGFuY2VvZiBGdXJNYXRlcmlhbCkpIHtcclxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRocm93LWxpdGVyYWxcclxuICAgICAgICAgICAgdGhyb3cgXCJUaGUgbWF0ZXJpYWwgb2YgdGhlIHNvdXJjZSBtZXNoIG11c3QgYmUgYSBGdXIgTWF0ZXJpYWxcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBxdWFsaXR5OyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0RnVyID0gbmV3IEZ1ck1hdGVyaWFsKG1hdC5uYW1lICsgaSwgc291cmNlTWVzaC5nZXRTY2VuZSgpKTtcclxuICAgICAgICAgICAgc291cmNlTWVzaC5nZXRTY2VuZSgpLm1hdGVyaWFscy5wb3AoKTtcclxuICAgICAgICAgICAgVGFncy5FbmFibGVGb3Iob2Zmc2V0RnVyKTtcclxuICAgICAgICAgICAgVGFncy5BZGRUYWdzVG8ob2Zmc2V0RnVyLCBcImZ1clNoZWxsTWF0ZXJpYWxcIik7XHJcblxyXG4gICAgICAgICAgICBvZmZzZXRGdXIuZnVyTGVuZ3RoID0gbWF0LmZ1ckxlbmd0aDtcclxuICAgICAgICAgICAgb2Zmc2V0RnVyLmZ1ckFuZ2xlID0gbWF0LmZ1ckFuZ2xlO1xyXG4gICAgICAgICAgICBvZmZzZXRGdXIuZnVyR3Jhdml0eSA9IG1hdC5mdXJHcmF2aXR5O1xyXG4gICAgICAgICAgICBvZmZzZXRGdXIuZnVyU3BhY2luZyA9IG1hdC5mdXJTcGFjaW5nO1xyXG4gICAgICAgICAgICBvZmZzZXRGdXIuZnVyU3BlZWQgPSBtYXQuZnVyU3BlZWQ7XHJcbiAgICAgICAgICAgIG9mZnNldEZ1ci5mdXJDb2xvciA9IG1hdC5mdXJDb2xvcjtcclxuICAgICAgICAgICAgb2Zmc2V0RnVyLmRpZmZ1c2VUZXh0dXJlID0gbWF0LmRpZmZ1c2VUZXh0dXJlO1xyXG4gICAgICAgICAgICBvZmZzZXRGdXIuZnVyT2Zmc2V0ID0gaSAvIHF1YWxpdHk7XHJcbiAgICAgICAgICAgIG9mZnNldEZ1ci5mdXJUZXh0dXJlID0gbWF0LmZ1clRleHR1cmU7XHJcbiAgICAgICAgICAgIG9mZnNldEZ1ci5oaWdoTGV2ZWxGdXIgPSBtYXQuaGlnaExldmVsRnVyO1xyXG4gICAgICAgICAgICBvZmZzZXRGdXIuZnVyVGltZSA9IG1hdC5mdXJUaW1lO1xyXG4gICAgICAgICAgICBvZmZzZXRGdXIuZnVyRGVuc2l0eSA9IG1hdC5mdXJEZW5zaXR5O1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0TWVzaCA9IHNvdXJjZU1lc2guY2xvbmUoc291cmNlTWVzaC5uYW1lICsgaSkgYXMgTWVzaDtcclxuXHJcbiAgICAgICAgICAgIG9mZnNldE1lc2gubWF0ZXJpYWwgPSBvZmZzZXRGdXI7XHJcbiAgICAgICAgICAgIG9mZnNldE1lc2guc2tlbGV0b24gPSBzb3VyY2VNZXNoLnNrZWxldG9uO1xyXG4gICAgICAgICAgICBvZmZzZXRNZXNoLnBvc2l0aW9uID0gVmVjdG9yMy5aZXJvKCk7XHJcbiAgICAgICAgICAgIG1lc2hlcy5wdXNoKG9mZnNldE1lc2gpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IG1lc2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBtZXNoZXNbaV0ucGFyZW50ID0gc291cmNlTWVzaDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICg8RnVyTWF0ZXJpYWw+c291cmNlTWVzaC5tYXRlcmlhbCkuX21lc2hlcyA9IG1lc2hlcztcclxuXHJcbiAgICAgICAgcmV0dXJuIG1lc2hlcztcclxuICAgIH1cclxufVxyXG5cclxuUmVnaXN0ZXJDbGFzcyhcIkJBQllMT04uRnVyTWF0ZXJpYWxcIiwgRnVyTWF0ZXJpYWwpO1xyXG4iLCJleHBvcnQgKiBmcm9tIFwiLi9mdXJNYXRlcmlhbFwiO1xyXG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbm8taW50ZXJuYWwtbW9kdWxlcyAqL1xyXG5pbXBvcnQgKiBhcyBNYXRMaWIgZnJvbSBcIm1hdGVyaWFscy9mdXIvaW5kZXhcIjtcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgdGhlIFVNRCBtb2R1bGUuXHJcbiAqIFRoZSBlbnRyeSBwb2ludCBmb3IgYSBmdXR1cmUgRVNNIHBhY2thZ2Ugc2hvdWxkIGJlIGluZGV4LnRzXHJcbiAqL1xyXG5jb25zdCBnbG9iYWxPYmplY3QgPSB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcclxuaWYgKHR5cGVvZiBnbG9iYWxPYmplY3QgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgIGZvciAoY29uc3Qga2V5IGluIE1hdExpYikge1xyXG4gICAgICAgICg8YW55Pmdsb2JhbE9iamVjdCkuQkFCWUxPTltrZXldID0gKDxhbnk+TWF0TGliKVtrZXldO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgKiBmcm9tIFwibWF0ZXJpYWxzL2Z1ci9pbmRleFwiO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfYmFieWxvbmpzX01hdGVyaWFsc19lZmZlY3RfXzsiLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cblxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSwgU3VwcHJlc3NlZEVycm9yLCBTeW1ib2wsIEl0ZXJhdG9yICovXG5cbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xuICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xuICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xuICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xuICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xufVxuXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XG4gIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XG4gICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XG4gICAgICB9XG4gICAgICByZXR1cm4gdDtcbiAgfVxuICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XG4gIHZhciB0ID0ge307XG4gIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxuICAgICAgdFtwXSA9IHNbcF07XG4gIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcbiAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXG4gICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xuICAgICAgfVxuICByZXR1cm4gdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX19lc0RlY29yYXRlKGN0b3IsIGRlc2NyaXB0b3JJbiwgZGVjb3JhdG9ycywgY29udGV4dEluLCBpbml0aWFsaXplcnMsIGV4dHJhSW5pdGlhbGl6ZXJzKSB7XG4gIGZ1bmN0aW9uIGFjY2VwdChmKSB7IGlmIChmICE9PSB2b2lkIDAgJiYgdHlwZW9mIGYgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZ1bmN0aW9uIGV4cGVjdGVkXCIpOyByZXR1cm4gZjsgfVxuICB2YXIga2luZCA9IGNvbnRleHRJbi5raW5kLCBrZXkgPSBraW5kID09PSBcImdldHRlclwiID8gXCJnZXRcIiA6IGtpbmQgPT09IFwic2V0dGVyXCIgPyBcInNldFwiIDogXCJ2YWx1ZVwiO1xuICB2YXIgdGFyZ2V0ID0gIWRlc2NyaXB0b3JJbiAmJiBjdG9yID8gY29udGV4dEluW1wic3RhdGljXCJdID8gY3RvciA6IGN0b3IucHJvdG90eXBlIDogbnVsbDtcbiAgdmFyIGRlc2NyaXB0b3IgPSBkZXNjcmlwdG9ySW4gfHwgKHRhcmdldCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBjb250ZXh0SW4ubmFtZSkgOiB7fSk7XG4gIHZhciBfLCBkb25lID0gZmFsc2U7XG4gIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHt9O1xuICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4pIGNvbnRleHRbcF0gPSBwID09PSBcImFjY2Vzc1wiID8ge30gOiBjb250ZXh0SW5bcF07XG4gICAgICBmb3IgKHZhciBwIGluIGNvbnRleHRJbi5hY2Nlc3MpIGNvbnRleHQuYWNjZXNzW3BdID0gY29udGV4dEluLmFjY2Vzc1twXTtcbiAgICAgIGNvbnRleHQuYWRkSW5pdGlhbGl6ZXIgPSBmdW5jdGlvbiAoZikgeyBpZiAoZG9uZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBhZGQgaW5pdGlhbGl6ZXJzIGFmdGVyIGRlY29yYXRpb24gaGFzIGNvbXBsZXRlZFwiKTsgZXh0cmFJbml0aWFsaXplcnMucHVzaChhY2NlcHQoZiB8fCBudWxsKSk7IH07XG4gICAgICB2YXIgcmVzdWx0ID0gKDAsIGRlY29yYXRvcnNbaV0pKGtpbmQgPT09IFwiYWNjZXNzb3JcIiA/IHsgZ2V0OiBkZXNjcmlwdG9yLmdldCwgc2V0OiBkZXNjcmlwdG9yLnNldCB9IDogZGVzY3JpcHRvcltrZXldLCBjb250ZXh0KTtcbiAgICAgIGlmIChraW5kID09PSBcImFjY2Vzc29yXCIpIHtcbiAgICAgICAgICBpZiAocmVzdWx0ID09PSB2b2lkIDApIGNvbnRpbnVlO1xuICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZFwiKTtcbiAgICAgICAgICBpZiAoXyA9IGFjY2VwdChyZXN1bHQuZ2V0KSkgZGVzY3JpcHRvci5nZXQgPSBfO1xuICAgICAgICAgIGlmIChfID0gYWNjZXB0KHJlc3VsdC5zZXQpKSBkZXNjcmlwdG9yLnNldCA9IF87XG4gICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmluaXQpKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKF8gPSBhY2NlcHQocmVzdWx0KSkge1xuICAgICAgICAgIGlmIChraW5kID09PSBcImZpZWxkXCIpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xuICAgICAgICAgIGVsc2UgZGVzY3JpcHRvcltrZXldID0gXztcbiAgICAgIH1cbiAgfVxuICBpZiAodGFyZ2V0KSBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBjb250ZXh0SW4ubmFtZSwgZGVzY3JpcHRvcik7XG4gIGRvbmUgPSB0cnVlO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9fcnVuSW5pdGlhbGl6ZXJzKHRoaXNBcmcsIGluaXRpYWxpemVycywgdmFsdWUpIHtcbiAgdmFyIHVzZVZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW5pdGlhbGl6ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZSA9IHVzZVZhbHVlID8gaW5pdGlhbGl6ZXJzW2ldLmNhbGwodGhpc0FyZywgdmFsdWUpIDogaW5pdGlhbGl6ZXJzW2ldLmNhbGwodGhpc0FyZyk7XG4gIH1cbiAgcmV0dXJuIHVzZVZhbHVlID8gdmFsdWUgOiB2b2lkIDA7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gX19wcm9wS2V5KHgpIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSBcInN5bWJvbFwiID8geCA6IFwiXCIuY29uY2F0KHgpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9fc2V0RnVuY3Rpb25OYW1lKGYsIG5hbWUsIHByZWZpeCkge1xuICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIG5hbWUgPSBuYW1lLmRlc2NyaXB0aW9uID8gXCJbXCIuY29uY2F0KG5hbWUuZGVzY3JpcHRpb24sIFwiXVwiKSA6IFwiXCI7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoZiwgXCJuYW1lXCIsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogcHJlZml4ID8gXCJcIi5jb25jYXQocHJlZml4LCBcIiBcIiwgbmFtZSkgOiBuYW1lIH0pO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcbiAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZyA9IE9iamVjdC5jcmVhdGUoKHR5cGVvZiBJdGVyYXRvciA9PT0gXCJmdW5jdGlvblwiID8gSXRlcmF0b3IgOiBPYmplY3QpLnByb3RvdHlwZSk7XG4gIHJldHVybiBnLm5leHQgPSB2ZXJiKDApLCBnW1widGhyb3dcIl0gPSB2ZXJiKDEpLCBnW1wicmV0dXJuXCJdID0gdmVyYigyKSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcbiAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICB9XG59XG5cbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICBvW2syXSA9IG1ba107XG59KTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XG4gIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgcCkpIF9fY3JlYXRlQmluZGluZyhvLCBtLCBwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcbiAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcbiAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XG4gIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xuICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcbiAgICAgIH1cbiAgfTtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcbiAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xuICBpZiAoIW0pIHJldHVybiBvO1xuICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcbiAgdHJ5IHtcbiAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xuICB9XG4gIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxuICBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XG4gICAgICB9XG4gICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cbiAgfVxuICByZXR1cm4gYXI7XG59XG5cbi8qKiBAZGVwcmVjYXRlZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xuICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcbiAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcbiAgcmV0dXJuIGFyO1xufVxuXG4vKiogQGRlcHJlY2F0ZWQgKi9cbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcbiAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XG4gIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcbiAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxuICAgICAgICAgIHJba10gPSBhW2pdO1xuICByZXR1cm4gcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20sIHBhY2spIHtcbiAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcbiAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xuICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcbiAgICAgIH1cbiAgfVxuICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xuICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XG4gIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG4gIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XG4gIHJldHVybiBpID0gT2JqZWN0LmNyZWF0ZSgodHlwZW9mIEFzeW5jSXRlcmF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IEFzeW5jSXRlcmF0b3IgOiBPYmplY3QpLnByb3RvdHlwZSksIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiwgYXdhaXRSZXR1cm4pLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XG4gIGZ1bmN0aW9uIGF3YWl0UmV0dXJuKGYpIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBQcm9taXNlLnJlc29sdmUodikudGhlbihmLCByZWplY3QpOyB9OyB9XG4gIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpZiAoZ1tuXSkgeyBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyBpZiAoZikgaVtuXSA9IGYoaVtuXSk7IH0gfVxuICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XG4gIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxuICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XG4gIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cbiAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XG4gIHZhciBpLCBwO1xuICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xuICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBmYWxzZSB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XG4gIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG4gIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XG4gIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcbiAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxuICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxuICByZXR1cm4gY29va2VkO1xufTtcblxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcbiAgb1tcImRlZmF1bHRcIl0gPSB2O1xufTtcblxudmFyIG93bktleXMgPSBmdW5jdGlvbihvKSB7XG4gIG93bktleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiAobykge1xuICAgIHZhciBhciA9IFtdO1xuICAgIGZvciAodmFyIGsgaW4gbykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKSkgYXJbYXIubGVuZ3RoXSA9IGs7XG4gICAgcmV0dXJuIGFyO1xuICB9O1xuICByZXR1cm4gb3duS2V5cyhvKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XG4gIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrID0gb3duS2V5cyhtb2QpLCBpID0gMDsgaSA8IGsubGVuZ3RoOyBpKyspIGlmIChrW2ldICE9PSBcImRlZmF1bHRcIikgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrW2ldKTtcbiAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcbiAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XG4gIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIGdldHRlclwiKTtcbiAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XG4gIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcbiAgaWYgKGtpbmQgPT09IFwibVwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBtZXRob2QgaXMgbm90IHdyaXRhYmxlXCIpO1xuICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XG4gIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XG4gIHJldHVybiAoa2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIsIHZhbHVlKSA6IGYgPyBmLnZhbHVlID0gdmFsdWUgOiBzdGF0ZS5zZXQocmVjZWl2ZXIsIHZhbHVlKSksIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEluKHN0YXRlLCByZWNlaXZlcikge1xuICBpZiAocmVjZWl2ZXIgPT09IG51bGwgfHwgKHR5cGVvZiByZWNlaXZlciAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVjZWl2ZXIgIT09IFwiZnVuY3Rpb25cIikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlICdpbicgb3BlcmF0b3Igb24gbm9uLW9iamVjdFwiKTtcbiAgcmV0dXJuIHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgPT09IHN0YXRlIDogc3RhdGUuaGFzKHJlY2VpdmVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fYWRkRGlzcG9zYWJsZVJlc291cmNlKGVudiwgdmFsdWUsIGFzeW5jKSB7XG4gIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZC5cIik7XG4gICAgdmFyIGRpc3Bvc2UsIGlubmVyO1xuICAgIGlmIChhc3luYykge1xuICAgICAgaWYgKCFTeW1ib2wuYXN5bmNEaXNwb3NlKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jRGlzcG9zZSBpcyBub3QgZGVmaW5lZC5cIik7XG4gICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmFzeW5jRGlzcG9zZV07XG4gICAgfVxuICAgIGlmIChkaXNwb3NlID09PSB2b2lkIDApIHtcbiAgICAgIGlmICghU3ltYm9sLmRpc3Bvc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuZGlzcG9zZSBpcyBub3QgZGVmaW5lZC5cIik7XG4gICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmRpc3Bvc2VdO1xuICAgICAgaWYgKGFzeW5jKSBpbm5lciA9IGRpc3Bvc2U7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZGlzcG9zZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IG5vdCBkaXNwb3NhYmxlLlwiKTtcbiAgICBpZiAoaW5uZXIpIGRpc3Bvc2UgPSBmdW5jdGlvbigpIHsgdHJ5IHsgaW5uZXIuY2FsbCh0aGlzKTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7IH0gfTtcbiAgICBlbnYuc3RhY2sucHVzaCh7IHZhbHVlOiB2YWx1ZSwgZGlzcG9zZTogZGlzcG9zZSwgYXN5bmM6IGFzeW5jIH0pO1xuICB9XG4gIGVsc2UgaWYgKGFzeW5jKSB7XG4gICAgZW52LnN0YWNrLnB1c2goeyBhc3luYzogdHJ1ZSB9KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbnZhciBfU3VwcHJlc3NlZEVycm9yID0gdHlwZW9mIFN1cHByZXNzZWRFcnJvciA9PT0gXCJmdW5jdGlvblwiID8gU3VwcHJlc3NlZEVycm9yIDogZnVuY3Rpb24gKGVycm9yLCBzdXBwcmVzc2VkLCBtZXNzYWdlKSB7XG4gIHZhciBlID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZS5uYW1lID0gXCJTdXBwcmVzc2VkRXJyb3JcIiwgZS5lcnJvciA9IGVycm9yLCBlLnN1cHByZXNzZWQgPSBzdXBwcmVzc2VkLCBlO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9fZGlzcG9zZVJlc291cmNlcyhlbnYpIHtcbiAgZnVuY3Rpb24gZmFpbChlKSB7XG4gICAgZW52LmVycm9yID0gZW52Lmhhc0Vycm9yID8gbmV3IF9TdXBwcmVzc2VkRXJyb3IoZSwgZW52LmVycm9yLCBcIkFuIGVycm9yIHdhcyBzdXBwcmVzc2VkIGR1cmluZyBkaXNwb3NhbC5cIikgOiBlO1xuICAgIGVudi5oYXNFcnJvciA9IHRydWU7XG4gIH1cbiAgdmFyIHIsIHMgPSAwO1xuICBmdW5jdGlvbiBuZXh0KCkge1xuICAgIHdoaWxlIChyID0gZW52LnN0YWNrLnBvcCgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXIuYXN5bmMgJiYgcyA9PT0gMSkgcmV0dXJuIHMgPSAwLCBlbnYuc3RhY2sucHVzaChyKSwgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihuZXh0KTtcbiAgICAgICAgaWYgKHIuZGlzcG9zZSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSByLmRpc3Bvc2UuY2FsbChyLnZhbHVlKTtcbiAgICAgICAgICBpZiAoci5hc3luYykgcmV0dXJuIHMgfD0gMiwgUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkudGhlbihuZXh0LCBmdW5jdGlvbihlKSB7IGZhaWwoZSk7IHJldHVybiBuZXh0KCk7IH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgcyB8PSAxO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgZmFpbChlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHMgPT09IDEpIHJldHVybiBlbnYuaGFzRXJyb3IgPyBQcm9taXNlLnJlamVjdChlbnYuZXJyb3IpIDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgaWYgKGVudi5oYXNFcnJvcikgdGhyb3cgZW52LmVycm9yO1xuICB9XG4gIHJldHVybiBuZXh0KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX3Jld3JpdGVSZWxhdGl2ZUltcG9ydEV4dGVuc2lvbihwYXRoLCBwcmVzZXJ2ZUpzeCkge1xuICBpZiAodHlwZW9mIHBhdGggPT09IFwic3RyaW5nXCIgJiYgL15cXC5cXC4/XFwvLy50ZXN0KHBhdGgpKSB7XG4gICAgICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXC4odHN4KSR8KCg/OlxcLmQpPykoKD86XFwuW14uL10rPyk/KVxcLihbY21dPyl0cyQvaSwgZnVuY3Rpb24gKG0sIHRzeCwgZCwgZXh0LCBjbSkge1xuICAgICAgICAgIHJldHVybiB0c3ggPyBwcmVzZXJ2ZUpzeCA/IFwiLmpzeFwiIDogXCIuanNcIiA6IGQgJiYgKCFleHQgfHwgIWNtKSA/IG0gOiAoZCArIGV4dCArIFwiLlwiICsgY20udG9Mb3dlckNhc2UoKSArIFwianNcIik7XG4gICAgICB9KTtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBfX2V4dGVuZHMsXG4gIF9fYXNzaWduLFxuICBfX3Jlc3QsXG4gIF9fZGVjb3JhdGUsXG4gIF9fcGFyYW0sXG4gIF9fZXNEZWNvcmF0ZSxcbiAgX19ydW5Jbml0aWFsaXplcnMsXG4gIF9fcHJvcEtleSxcbiAgX19zZXRGdW5jdGlvbk5hbWUsXG4gIF9fbWV0YWRhdGEsXG4gIF9fYXdhaXRlcixcbiAgX19nZW5lcmF0b3IsXG4gIF9fY3JlYXRlQmluZGluZyxcbiAgX19leHBvcnRTdGFyLFxuICBfX3ZhbHVlcyxcbiAgX19yZWFkLFxuICBfX3NwcmVhZCxcbiAgX19zcHJlYWRBcnJheXMsXG4gIF9fc3ByZWFkQXJyYXksXG4gIF9fYXdhaXQsXG4gIF9fYXN5bmNHZW5lcmF0b3IsXG4gIF9fYXN5bmNEZWxlZ2F0b3IsXG4gIF9fYXN5bmNWYWx1ZXMsXG4gIF9fbWFrZVRlbXBsYXRlT2JqZWN0LFxuICBfX2ltcG9ydFN0YXIsXG4gIF9faW1wb3J0RGVmYXVsdCxcbiAgX19jbGFzc1ByaXZhdGVGaWVsZEdldCxcbiAgX19jbGFzc1ByaXZhdGVGaWVsZFNldCxcbiAgX19jbGFzc1ByaXZhdGVGaWVsZEluLFxuICBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZSxcbiAgX19kaXNwb3NlUmVzb3VyY2VzLFxuICBfX3Jld3JpdGVSZWxhdGl2ZUltcG9ydEV4dGVuc2lvbixcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgKiBhcyBtYXRlcmlhbHMgZnJvbSBcIkBsdHMvbWF0ZXJpYWxzL2xlZ2FjeS9sZWdhY3ktZnVyXCI7XHJcbmV4cG9ydCB7IG1hdGVyaWFscyB9O1xyXG5leHBvcnQgZGVmYXVsdCBtYXRlcmlhbHM7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
