(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("babylonjs"));
	else if(typeof define === 'function' && define.amd)
		define("babylonjs-materials", ["babylonjs"], factory);
	else if(typeof exports === 'object')
		exports["babylonjs-materials"] = factory(require("babylonjs"));
	else
		root["MATERIALS"] = factory(root["BABYLON"]);
})((typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : this), (__WEBPACK_EXTERNAL_MODULE_babylonjs_Materials_effect__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../../dev/materials/src/water/index.ts":
/*!*************************************************!*\
  !*** ../../../dev/materials/src/water/index.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WaterMaterial: () => (/* reexport safe */ _waterMaterial__WEBPACK_IMPORTED_MODULE_0__.WaterMaterial)
/* harmony export */ });
/* harmony import */ var _waterMaterial__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./waterMaterial */ "../../../dev/materials/src/water/waterMaterial.ts");



/***/ }),

/***/ "../../../dev/materials/src/water/water.fragment.ts":
/*!**********************************************************!*\
  !*** ../../../dev/materials/src/water/water.fragment.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   waterPixelShader: () => (/* binding */ waterPixelShader)
/* harmony export */ });
/* harmony import */ var babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babylonjs/Shaders/ShadersInclude/fogFragment */ "babylonjs/Materials/effect");
/* harmony import */ var babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__);
// Do not edit.















var name = "waterPixelShader";
var shader = "#ifdef LOGARITHMICDEPTH\n#extension GL_EXT_frag_depth : enable\n#endif\nprecision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;\n#ifdef SPECULARTERM\nuniform vec4 vSpecularColor;\n#endif\nvarying vec3 vPositionW;\n#ifdef NORMAL\nvarying vec3 vNormalW;\n#endif\n#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)\nvarying vec4 vColor;\n#endif\n#include<helperFunctions>\n#include<imageProcessingDeclaration>\n#include<imageProcessingFunctions>\n#include<__decl__lightFragment>[0..maxSimultaneousLights]\n#include<lightsFragmentFunctions>\n#include<shadowsFragmentFunctions>\n#ifdef BUMP\nvarying vec2 vNormalUV;\n#ifdef BUMPSUPERIMPOSE\nvarying vec2 vNormalUV2;\n#endif\nuniform sampler2D normalSampler;uniform vec2 vNormalInfos;\n#endif\nuniform sampler2D refractionSampler;uniform sampler2D reflectionSampler;const float LOG2=1.442695;uniform vec3 cameraPosition;uniform vec4 waterColor;uniform float colorBlendFactor;uniform vec4 waterColor2;uniform float colorBlendFactor2;uniform float bumpHeight;uniform float time;varying vec3 vRefractionMapTexCoord;varying vec3 vReflectionMapTexCoord;\n#include<clipPlaneFragmentDeclaration>\n#include<logDepthDeclaration>\n#include<fogFragmentDeclaration>\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\n#include<clipPlaneFragment>\nvec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(1.,1.,1.,1.);vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;\n#ifdef BUMP\n#ifdef BUMPSUPERIMPOSE\nbaseColor=0.6*texture2D(normalSampler,vNormalUV)+0.4*texture2D(normalSampler,vec2(vNormalUV2.x,vNormalUV2.y));\n#else\nbaseColor=texture2D(normalSampler,vNormalUV);\n#endif\nvec3 bumpColor=baseColor.rgb;\n#ifdef ALPHATEST\nif (baseColor.a<0.4)\ndiscard;\n#endif\nbaseColor.rgb*=vNormalInfos.y;\n#else\nvec3 bumpColor=vec3(1.0);\n#endif\n#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)\nbaseColor.rgb*=vColor.rgb;\n#endif\n#ifdef NORMAL\nvec2 perturbation=bumpHeight*(baseColor.rg-0.5);\n#ifdef BUMPAFFECTSREFLECTION\nvec3 normalW=normalize(vNormalW+vec3(perturbation.x*8.0,0.0,perturbation.y*8.0));if (normalW.y<0.0) {normalW.y=-normalW.y;}\n#else\nvec3 normalW=normalize(vNormalW);\n#endif\n#else\nvec3 normalW=vec3(1.0,1.0,1.0);vec2 perturbation=bumpHeight*(vec2(1.0,1.0)-0.5);\n#endif\n#ifdef FRESNELSEPARATE\n#ifdef REFLECTION\nvec2 projectedRefractionTexCoords=clamp(vRefractionMapTexCoord.xy/vRefractionMapTexCoord.z+perturbation*0.5,0.0,1.0);vec4 refractiveColor=texture2D(refractionSampler,projectedRefractionTexCoords);\n#ifdef IS_REFRACTION_LINEAR\nrefractiveColor.rgb=toGammaSpace(refractiveColor.rgb);\n#endif\nvec2 projectedReflectionTexCoords=clamp(vec2(\nvReflectionMapTexCoord.x/vReflectionMapTexCoord.z+perturbation.x*0.3,\nvReflectionMapTexCoord.y/vReflectionMapTexCoord.z+perturbation.y\n),0.0,1.0);vec4 reflectiveColor=texture2D(reflectionSampler,projectedReflectionTexCoords);\n#ifdef IS_REFLECTION_LINEAR\nreflectiveColor.rgb=toGammaSpace(reflectiveColor.rgb);\n#endif\nvec3 upVector=vec3(0.0,1.0,0.0);float fresnelTerm=clamp(abs(pow(dot(viewDirectionW,upVector),3.0)),0.05,0.65);float IfresnelTerm=1.0-fresnelTerm;refractiveColor=colorBlendFactor*waterColor+(1.0-colorBlendFactor)*refractiveColor;reflectiveColor=IfresnelTerm*colorBlendFactor2*waterColor+(1.0-colorBlendFactor2*IfresnelTerm)*reflectiveColor;vec4 combinedColor=refractiveColor*fresnelTerm+reflectiveColor*IfresnelTerm;baseColor=combinedColor;\n#endif\nvec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float aggShadow=0.;float numLights=0.;\n#ifdef SPECULARTERM\nfloat glossiness=vSpecularColor.a;vec3 specularBase=vec3(0.,0.,0.);vec3 specularColor=vSpecularColor.rgb;\n#else\nfloat glossiness=0.;\n#endif\n#include<lightFragment>[0..maxSimultaneousLights]\nvec3 finalDiffuse=clamp(baseColor.rgb,0.0,1.0);\n#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)\nalpha*=vColor.a;\n#endif\n#ifdef SPECULARTERM\nvec3 finalSpecular=specularBase*specularColor;\n#else\nvec3 finalSpecular=vec3(0.0);\n#endif\n#else \n#ifdef REFLECTION\nvec2 projectedRefractionTexCoords=clamp(vRefractionMapTexCoord.xy/vRefractionMapTexCoord.z+perturbation,0.0,1.0);vec4 refractiveColor=texture2D(refractionSampler,projectedRefractionTexCoords);\n#ifdef IS_REFRACTION_LINEAR\nrefractiveColor.rgb=toGammaSpace(refractiveColor.rgb);\n#endif\nvec2 projectedReflectionTexCoords=clamp(vReflectionMapTexCoord.xy/vReflectionMapTexCoord.z+perturbation,0.0,1.0);vec4 reflectiveColor=texture2D(reflectionSampler,projectedReflectionTexCoords);\n#ifdef IS_REFLECTION_LINEAR\nreflectiveColor.rgb=toGammaSpace(reflectiveColor.rgb);\n#endif\nvec3 upVector=vec3(0.0,1.0,0.0);float fresnelTerm=max(dot(viewDirectionW,upVector),0.0);vec4 combinedColor=refractiveColor*fresnelTerm+reflectiveColor*(1.0-fresnelTerm);baseColor=colorBlendFactor*waterColor+(1.0-colorBlendFactor)*combinedColor;\n#endif\nvec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float aggShadow=0.;float numLights=0.;\n#ifdef SPECULARTERM\nfloat glossiness=vSpecularColor.a;vec3 specularBase=vec3(0.,0.,0.);vec3 specularColor=vSpecularColor.rgb;\n#else\nfloat glossiness=0.;\n#endif\n#include<lightFragment>[0..maxSimultaneousLights]\nvec3 finalDiffuse=clamp(baseColor.rgb,0.0,1.0);\n#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)\nalpha*=vColor.a;\n#endif\n#ifdef SPECULARTERM\nvec3 finalSpecular=specularBase*specularColor;\n#else\nvec3 finalSpecular=vec3(0.0);\n#endif\n#endif\nvec4 color=vec4(finalDiffuse+finalSpecular,alpha);\n#include<logDepthFragment>\n#include<fogFragment>\n#ifdef IMAGEPROCESSINGPOSTPROCESS\ncolor.rgb=toLinearSpace(color.rgb);\n#elif defined(IMAGEPROCESSING)\ncolor.rgb=toLinearSpace(color.rgb);color=applyImageProcessing(color);\n#endif\ngl_FragColor=color;\n#define CUSTOM_FRAGMENT_MAIN_END\n}\n";
// Sideeffect
babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStore[name] = shader;
/** @internal */
var waterPixelShader = { name: name, shader: shader };


/***/ }),

/***/ "../../../dev/materials/src/water/water.vertex.ts":
/*!********************************************************!*\
  !*** ../../../dev/materials/src/water/water.vertex.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   waterVertexShader: () => (/* binding */ waterVertexShader)
/* harmony export */ });
/* harmony import */ var babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babylonjs/Shaders/ShadersInclude/logDepthVertex */ "babylonjs/Materials/effect");
/* harmony import */ var babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__);
// Do not edit.

















var name = "waterVertexShader";
var shader = "precision highp float;attribute vec3 position;\n#ifdef NORMAL\nattribute vec3 normal;\n#endif\n#ifdef UV1\nattribute vec2 uv;\n#endif\n#ifdef UV2\nattribute vec2 uv2;\n#endif\n#ifdef VERTEXCOLOR\nattribute vec4 color;\n#endif\n#include<bonesDeclaration>\n#include<bakedVertexAnimationDeclaration>\n#include<instancesDeclaration>\nuniform mat4 view;uniform mat4 viewProjection;\n#ifdef BUMP\nvarying vec2 vNormalUV;\n#ifdef BUMPSUPERIMPOSE\nvarying vec2 vNormalUV2;\n#endif\nuniform mat4 normalMatrix;uniform vec2 vNormalInfos;\n#endif\n#ifdef POINTSIZE\nuniform float pointSize;\n#endif\nvarying vec3 vPositionW;\n#ifdef NORMAL\nvarying vec3 vNormalW;\n#endif\n#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)\nvarying vec4 vColor;\n#endif\n#include<clipPlaneVertexDeclaration>\n#include<fogVertexDeclaration>\n#include<__decl__lightFragment>[0..maxSimultaneousLights]\n#include<logDepthDeclaration>\nuniform mat4 reflectionViewProjection;uniform vec2 windDirection;uniform float waveLength;uniform float time;uniform float windForce;uniform float waveHeight;uniform float waveSpeed;uniform float waveCount;varying vec3 vRefractionMapTexCoord;varying vec3 vReflectionMapTexCoord;\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\n#include<instancesVertex>\n#include<bonesVertex>\n#include<bakedVertexAnimation>\nvec4 worldPos=finalWorld*vec4(position,1.0);vPositionW=vec3(worldPos);\n#ifdef NORMAL\nvNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));\n#endif\n#ifndef UV1\nvec2 uv=vec2(0.,0.);\n#endif\n#ifndef UV2\nvec2 uv2=vec2(0.,0.);\n#endif\n#ifdef BUMP\nif (vNormalInfos.x==0.)\n{vNormalUV=vec2(normalMatrix*vec4((uv*1.0)/waveLength+time*windForce*windDirection,1.0,0.0));\n#ifdef BUMPSUPERIMPOSE\nvNormalUV2=vec2(normalMatrix*vec4((uv*0.721)/waveLength+time*1.2*windForce*windDirection,1.0,0.0));\n#endif\n}\nelse\n{vNormalUV=vec2(normalMatrix*vec4((uv2*1.0)/waveLength+time*windForce*windDirection ,1.0,0.0));\n#ifdef BUMPSUPERIMPOSE\nvNormalUV2=vec2(normalMatrix*vec4((uv2*0.721)/waveLength+time*1.2*windForce*windDirection ,1.0,0.0));\n#endif\n}\n#endif\n#include<clipPlaneVertex>\n#include<fogVertex>\n#include<shadowsVertex>[0..maxSimultaneousLights]\n#include<vertexColorMixing>\n#if defined(POINTSIZE) && !defined(WEBGPU)\ngl_PointSize=pointSize;\n#endif\nfloat finalWaveCount=1.0/(waveCount*0.5);\n#ifdef USE_WORLD_COORDINATES\nvec3 p=worldPos.xyz;\n#else\nvec3 p=position;\n#endif\nfloat newY=(sin(((p.x/finalWaveCount)+time*waveSpeed))*waveHeight*windDirection.x*5.0)\n+ (cos(((p.z/finalWaveCount)+ time*waveSpeed))*waveHeight*windDirection.y*5.0);p.y+=abs(newY);\n#ifdef USE_WORLD_COORDINATES\ngl_Position=viewProjection*vec4(p,1.0);\n#else\ngl_Position=viewProjection*finalWorld*vec4(p,1.0);\n#endif\n#ifdef REFLECTION\nvRefractionMapTexCoord.x=0.5*(gl_Position.w+gl_Position.x);vRefractionMapTexCoord.y=0.5*(gl_Position.w+gl_Position.y);vRefractionMapTexCoord.z=gl_Position.w;worldPos=reflectionViewProjection*finalWorld*vec4(position,1.0);vReflectionMapTexCoord.x=0.5*(worldPos.w+worldPos.x);vReflectionMapTexCoord.y=0.5*(worldPos.w+worldPos.y);vReflectionMapTexCoord.z=worldPos.w;\n#endif\n#include<logDepthVertex>\n#define CUSTOM_VERTEX_MAIN_END\n}\n";
// Sideeffect
babylonjs_Engines_shaderStore__WEBPACK_IMPORTED_MODULE_0__.ShaderStore.ShadersStore[name] = shader;
/** @internal */
var waterVertexShader = { name: name, shader: shader };


/***/ }),

/***/ "../../../dev/materials/src/water/waterMaterial.ts":
/*!*********************************************************!*\
  !*** ../../../dev/materials/src/water/waterMaterial.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WaterMaterial: () => (/* binding */ WaterMaterial)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tslib */ "../../../../node_modules/tslib/tslib.es6.mjs");
/* harmony import */ var babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babylonjs/Rendering/boundingBoxRenderer */ "babylonjs/Materials/effect");
/* harmony import */ var babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _water_fragment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./water.fragment */ "../../../dev/materials/src/water/water.fragment.ts");
/* harmony import */ var _water_vertex__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./water.vertex */ "../../../dev/materials/src/water/water.vertex.ts");























var WaterMaterialDefines = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__extends)(WaterMaterialDefines, _super);
    function WaterMaterialDefines() {
        var _this = _super.call(this) || this;
        _this.BUMP = false;
        _this.REFLECTION = false;
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
        _this.SPECULARTERM = false;
        _this.LOGARITHMICDEPTH = false;
        _this.USE_REVERSE_DEPTHBUFFER = false;
        _this.FRESNELSEPARATE = false;
        _this.BUMPSUPERIMPOSE = false;
        _this.BUMPAFFECTSREFLECTION = false;
        _this.USE_WORLD_COORDINATES = false;
        _this.IMAGEPROCESSING = false;
        _this.VIGNETTE = false;
        _this.VIGNETTEBLENDMODEMULTIPLY = false;
        _this.VIGNETTEBLENDMODEOPAQUE = false;
        _this.TONEMAPPING = 0;
        _this.CONTRAST = false;
        _this.EXPOSURE = false;
        _this.COLORCURVES = false;
        _this.COLORGRADING = false;
        _this.COLORGRADING3D = false;
        _this.SAMPLER3DGREENDEPTH = false;
        _this.SAMPLER3DBGRMAP = false;
        _this.DITHER = false;
        _this.IMAGEPROCESSINGPOSTPROCESS = false;
        _this.SKIPFINALCOLORCLAMP = false;
        _this.rebuild();
        return _this;
    }
    return WaterMaterialDefines;
}(babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.MaterialDefines));
var WaterMaterial = /** @class */ (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__extends)(WaterMaterial, _super);
    /**
     * Constructor
     * @param name
     * @param scene
     * @param renderTargetSize
     */
    function WaterMaterial(name, scene, renderTargetSize) {
        if (renderTargetSize === void 0) { renderTargetSize = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Vector2(512, 512); }
        var _this = _super.call(this, name, scene) || this;
        _this.renderTargetSize = renderTargetSize;
        _this.diffuseColor = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Color3(1, 1, 1);
        _this.specularColor = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Color3(0, 0, 0);
        _this.specularPower = 64;
        _this._disableLighting = false;
        _this._maxSimultaneousLights = 4;
        /**
         * Defines the wind force.
         */
        _this.windForce = 6;
        /**
         * Defines the direction of the wind in the plane (X, Z).
         */
        _this.windDirection = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, 1);
        /**
         * Defines the height of the waves.
         */
        _this.waveHeight = 0.4;
        /**
         * Defines the bump height related to the bump map.
         */
        _this.bumpHeight = 0.4;
        /**
         * Defines wether or not: to add a smaller moving bump to less steady waves.
         */
        _this._bumpSuperimpose = false;
        /**
         * Defines wether or not color refraction and reflection differently with .waterColor2 and .colorBlendFactor2. Non-linear (physically correct) fresnel.
         */
        _this._fresnelSeparate = false;
        /**
         * Defines wether or not bump Wwves modify the reflection.
         */
        _this._bumpAffectsReflection = false;
        /**
         * Defines the water color blended with the refraction (near).
         */
        _this.waterColor = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Color3(0.1, 0.1, 0.6);
        /**
         * Defines the blend factor related to the water color.
         */
        _this.colorBlendFactor = 0.2;
        /**
         * Defines the water color blended with the reflection (far).
         */
        _this.waterColor2 = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Color3(0.1, 0.1, 0.6);
        /**
         * Defines the blend factor related to the water color (reflection, far).
         */
        _this.colorBlendFactor2 = 0.2;
        /**
         * Defines the maximum length of a wave.
         */
        _this.waveLength = 0.1;
        /**
         * Defines the waves speed.
         */
        _this.waveSpeed = 1.0;
        /**
         * Defines the number of times waves are repeated. This is typically used to adjust waves count according to the ground's size where the material is applied on.
         */
        _this.waveCount = 20;
        /**
         * Sets or gets whether or not automatic clipping should be enabled or not. Setting to true will save performances and
         * will avoid calculating useless pixels in the pixel shader of the water material.
         */
        _this.disableClipPlane = false;
        /**
         * Defines whether or not to use world coordinates for wave deformations.
         * The default value is false, meaning that the deformation is applied in object (local) space.
         * You will probably need to set it to true if you are using instances or thin instances for your water objects.
         */
        _this._useWorldCoordinatesForWaveDeformation = false;
        _this._renderTargets = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.SmartArray(16);
        /*
         * Private members
         */
        _this._mesh = null;
        _this._reflectionTransform = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Matrix.Zero();
        _this._lastTime = 0;
        _this._lastDeltaTime = 0;
        _this._createRenderTargets(_this.getScene(), renderTargetSize);
        // Create render targets
        _this.getRenderTargetTextures = function () {
            _this._renderTargets.reset();
            _this._renderTargets.push(_this._reflectionRTT);
            _this._renderTargets.push(_this._refractionRTT);
            return _this._renderTargets;
        };
        _this._imageProcessingConfiguration = _this.getScene().imageProcessingConfiguration;
        if (_this._imageProcessingConfiguration) {
            _this._imageProcessingObserver = _this._imageProcessingConfiguration.onUpdateParameters.add(function () {
                _this._markAllSubMeshesAsImageProcessingDirty();
            });
        }
        return _this;
    }
    Object.defineProperty(WaterMaterial.prototype, "hasRenderTargetTextures", {
        /**
         * Gets a boolean indicating that current material needs to register RTT
         */
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WaterMaterial.prototype, "refractionTexture", {
        // Get / Set
        get: function () {
            return this._refractionRTT;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WaterMaterial.prototype, "reflectionTexture", {
        get: function () {
            return this._reflectionRTT;
        },
        enumerable: false,
        configurable: true
    });
    // Methods
    WaterMaterial.prototype.addToRenderList = function (node) {
        if (this._refractionRTT && this._refractionRTT.renderList) {
            this._refractionRTT.renderList.push(node);
        }
        if (this._reflectionRTT && this._reflectionRTT.renderList) {
            this._reflectionRTT.renderList.push(node);
        }
    };
    WaterMaterial.prototype.removeFromRenderList = function (node) {
        if (this._refractionRTT && this._refractionRTT.renderList) {
            var idx = this._refractionRTT.renderList.indexOf(node);
            if (idx !== -1) {
                this._refractionRTT.renderList.splice(idx, 1);
            }
        }
        if (this._reflectionRTT && this._reflectionRTT.renderList) {
            var idx = this._reflectionRTT.renderList.indexOf(node);
            if (idx !== -1) {
                this._reflectionRTT.renderList.splice(idx, 1);
            }
        }
    };
    WaterMaterial.prototype.enableRenderTargets = function (enable) {
        var refreshRate = enable ? 1 : 0;
        if (this._refractionRTT) {
            this._refractionRTT.refreshRate = refreshRate;
        }
        if (this._reflectionRTT) {
            this._reflectionRTT.refreshRate = refreshRate;
        }
    };
    WaterMaterial.prototype.getRenderList = function () {
        return this._refractionRTT ? this._refractionRTT.renderList : [];
    };
    Object.defineProperty(WaterMaterial.prototype, "renderTargetsEnabled", {
        get: function () {
            return !(this._refractionRTT && this._refractionRTT.refreshRate === 0);
        },
        enumerable: false,
        configurable: true
    });
    WaterMaterial.prototype.needAlphaBlending = function () {
        return this.alpha < 1.0;
    };
    WaterMaterial.prototype.needAlphaTesting = function () {
        return false;
    };
    WaterMaterial.prototype.getAlphaTestTexture = function () {
        return null;
    };
    WaterMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
        var drawWrapper = subMesh._drawWrapper;
        if (this.isFrozen) {
            if (drawWrapper.effect && drawWrapper._wasPreviouslyReady && drawWrapper._wasPreviouslyUsingInstances === useInstances) {
                return true;
            }
        }
        if (!subMesh.materialDefines) {
            subMesh.materialDefines = new WaterMaterialDefines();
        }
        var defines = subMesh.materialDefines;
        var scene = this.getScene();
        if (this._isReadyForSubMesh(subMesh)) {
            return true;
        }
        var engine = scene.getEngine();
        // Textures
        if (defines._areTexturesDirty) {
            defines._needUVs = false;
            if (scene.texturesEnabled) {
                if (this.bumpTexture && babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.MaterialFlags.BumpTextureEnabled) {
                    if (!this.bumpTexture.isReady()) {
                        return false;
                    }
                    else {
                        defines._needUVs = true;
                        defines.BUMP = true;
                    }
                }
                if (babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.MaterialFlags.ReflectionTextureEnabled) {
                    defines.REFLECTION = true;
                }
            }
        }
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareDefinesForFrameBoundValues)(scene, engine, this, defines, useInstances ? true : false);
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareDefinesForMisc)(mesh, scene, this._useLogarithmicDepth, this.pointsCloud, this.fogEnabled, this._shouldTurnAlphaTestOn(mesh), defines);
        if (defines._areMiscDirty) {
            defines.FRESNELSEPARATE = this._fresnelSeparate;
            defines.BUMPSUPERIMPOSE = this._bumpSuperimpose;
            defines.BUMPAFFECTSREFLECTION = this._bumpAffectsReflection;
            defines.USE_WORLD_COORDINATES = this._useWorldCoordinatesForWaveDeformation;
        }
        // Lights
        defines._needNormals = (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareDefinesForLights)(scene, mesh, defines, true, this._maxSimultaneousLights, this._disableLighting);
        // Image processing
        if (defines._areImageProcessingDirty && this._imageProcessingConfiguration) {
            if (!this._imageProcessingConfiguration.isReady()) {
                return false;
            }
            this._imageProcessingConfiguration.prepareDefines(defines);
            defines.IS_REFLECTION_LINEAR = this.reflectionTexture != null && !this.reflectionTexture.gammaSpace;
            defines.IS_REFRACTION_LINEAR = this.refractionTexture != null && !this.refractionTexture.gammaSpace;
        }
        // Attribs
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareDefinesForAttributes)(mesh, defines, true, true);
        // Configure this
        this._mesh = mesh;
        if (this._waitingRenderList) {
            for (var i = 0; i < this._waitingRenderList.length; i++) {
                this.addToRenderList(scene.getNodeById(this._waitingRenderList[i]));
            }
            this._waitingRenderList = null;
        }
        // Get correct effect
        if (defines.isDirty) {
            defines.markAsProcessed();
            scene.resetCachedMaterial();
            // Fallbacks
            var fallbacks = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.EffectFallbacks();
            if (defines.FOG) {
                fallbacks.addFallback(1, "FOG");
            }
            if (defines.LOGARITHMICDEPTH) {
                fallbacks.addFallback(0, "LOGARITHMICDEPTH");
            }
            (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.HandleFallbacksForShadows)(defines, fallbacks, this.maxSimultaneousLights);
            if (defines.NUM_BONE_INFLUENCERS > 0) {
                fallbacks.addCPUSkinningFallback(0, mesh);
            }
            //Attributes
            var attribs = [babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.PositionKind];
            if (defines.NORMAL) {
                attribs.push(babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.NormalKind);
            }
            if (defines.UV1) {
                attribs.push(babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.UVKind);
            }
            if (defines.UV2) {
                attribs.push(babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.UV2Kind);
            }
            if (defines.VERTEXCOLOR) {
                attribs.push(babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.ColorKind);
            }
            (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareAttributesForBones)(attribs, mesh, defines, fallbacks);
            (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareAttributesForInstances)(attribs, defines);
            // Legacy browser patch
            var shaderName = "water";
            var join = defines.toString();
            var uniforms = [
                "world",
                "view",
                "viewProjection",
                "vEyePosition",
                "vLightsType",
                "vDiffuseColor",
                "vSpecularColor",
                "vFogInfos",
                "vFogColor",
                "pointSize",
                "vNormalInfos",
                "mBones",
                "normalMatrix",
                "logarithmicDepthConstant",
                // Water
                "reflectionViewProjection",
                "windDirection",
                "waveLength",
                "time",
                "windForce",
                "cameraPosition",
                "bumpHeight",
                "waveHeight",
                "waterColor",
                "waterColor2",
                "colorBlendFactor",
                "colorBlendFactor2",
                "waveSpeed",
                "waveCount",
            ];
            var samplers = [
                "normalSampler",
                // Water
                "refractionSampler",
                "reflectionSampler",
            ];
            var uniformBuffers = [];
            if (babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.ImageProcessingConfiguration) {
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.ImageProcessingConfiguration.PrepareUniforms(uniforms, defines);
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.ImageProcessingConfiguration.PrepareSamplers(samplers, defines);
            }
            (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.addClipPlaneUniforms)(uniforms);
            (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PrepareUniformsAndSamplersList)({
                uniformsNames: uniforms,
                uniformBuffersNames: uniformBuffers,
                samplers: samplers,
                defines: defines,
                maxSimultaneousLights: this.maxSimultaneousLights,
            });
            subMesh.setEffect(scene.getEngine().createEffect(shaderName, {
                attributes: attribs,
                uniformsNames: uniforms,
                uniformBuffersNames: uniformBuffers,
                samplers: samplers,
                defines: join,
                fallbacks: fallbacks,
                onCompiled: this.onCompiled,
                onError: this.onError,
                indexParameters: { maxSimultaneousLights: this._maxSimultaneousLights },
            }, engine), defines, this._materialContext);
        }
        if (!subMesh.effect || !subMesh.effect.isReady()) {
            return false;
        }
        defines._renderId = scene.getRenderId();
        drawWrapper._wasPreviouslyReady = true;
        drawWrapper._wasPreviouslyUsingInstances = !!useInstances;
        return true;
    };
    WaterMaterial.prototype.bindForSubMesh = function (world, mesh, subMesh) {
        var scene = this.getScene();
        var defines = subMesh.materialDefines;
        if (!defines) {
            return;
        }
        var effect = subMesh.effect;
        if (!effect || !this._mesh) {
            return;
        }
        this._activeEffect = effect;
        // Matrices
        this.bindOnlyWorldMatrix(world);
        this._activeEffect.setMatrix("viewProjection", scene.getTransformMatrix());
        // Bones
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.BindBonesParameters)(mesh, this._activeEffect);
        if (this._mustRebind(scene, effect, subMesh)) {
            // Textures
            if (this.bumpTexture && babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.MaterialFlags.BumpTextureEnabled) {
                this._activeEffect.setTexture("normalSampler", this.bumpTexture);
                this._activeEffect.setFloat2("vNormalInfos", this.bumpTexture.coordinatesIndex, this.bumpTexture.level);
                this._activeEffect.setMatrix("normalMatrix", this.bumpTexture.getTextureMatrix());
            }
            // Clip plane
            (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.bindClipPlane)(effect, this, scene);
            // Point size
            if (this.pointsCloud) {
                this._activeEffect.setFloat("pointSize", this.pointSize);
            }
            // Log. depth
            if (this._useLogarithmicDepth) {
                (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.BindLogDepth)(defines, effect, scene);
            }
            scene.bindEyePosition(effect);
        }
        this._activeEffect.setColor4("vDiffuseColor", this.diffuseColor, this.alpha * mesh.visibility);
        if (defines.SPECULARTERM) {
            this._activeEffect.setColor4("vSpecularColor", this.specularColor, this.specularPower);
        }
        if (scene.lightsEnabled && !this.disableLighting) {
            (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.BindLights)(scene, mesh, this._activeEffect, defines, this.maxSimultaneousLights);
        }
        // View
        if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Scene.FOGMODE_NONE) {
            this._activeEffect.setMatrix("view", scene.getViewMatrix());
        }
        // Fog
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.BindFogParameters)(scene, mesh, this._activeEffect);
        // Log. depth
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.BindLogDepth)(defines, this._activeEffect, scene);
        // Water
        if (babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.MaterialFlags.ReflectionTextureEnabled) {
            this._activeEffect.setTexture("refractionSampler", this._refractionRTT);
            this._activeEffect.setTexture("reflectionSampler", this._reflectionRTT);
        }
        var wrvp = this._reflectionTransform.multiply(scene.getProjectionMatrix());
        // Add delta time. Prevent adding delta time if it hasn't changed.
        var deltaTime = scene.getEngine().getDeltaTime();
        if (deltaTime !== this._lastDeltaTime) {
            this._lastDeltaTime = deltaTime;
            this._lastTime += this._lastDeltaTime;
        }
        this._activeEffect.setMatrix("reflectionViewProjection", wrvp);
        this._activeEffect.setVector2("windDirection", this.windDirection);
        this._activeEffect.setFloat("waveLength", this.waveLength);
        this._activeEffect.setFloat("time", this._lastTime / 100000);
        this._activeEffect.setFloat("windForce", this.windForce);
        this._activeEffect.setFloat("waveHeight", this.waveHeight);
        this._activeEffect.setFloat("bumpHeight", this.bumpHeight);
        this._activeEffect.setColor4("waterColor", this.waterColor, 1.0);
        this._activeEffect.setFloat("colorBlendFactor", this.colorBlendFactor);
        this._activeEffect.setColor4("waterColor2", this.waterColor2, 1.0);
        this._activeEffect.setFloat("colorBlendFactor2", this.colorBlendFactor2);
        this._activeEffect.setFloat("waveSpeed", this.waveSpeed);
        this._activeEffect.setFloat("waveCount", this.waveCount);
        // image processing
        if (this._imageProcessingConfiguration && !this._imageProcessingConfiguration.applyByPostProcess) {
            this._imageProcessingConfiguration.bind(this._activeEffect);
        }
        this._afterBind(mesh, this._activeEffect, subMesh);
    };
    WaterMaterial.prototype._createRenderTargets = function (scene, renderTargetSize) {
        var _this = this;
        // Render targets
        this._refractionRTT = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.RenderTargetTexture(name + "_refraction", { width: renderTargetSize.x, height: renderTargetSize.y }, scene, false, true);
        this._refractionRTT.wrapU = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Constants.TEXTURE_MIRROR_ADDRESSMODE;
        this._refractionRTT.wrapV = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Constants.TEXTURE_MIRROR_ADDRESSMODE;
        this._refractionRTT.ignoreCameraViewport = true;
        var boundingBoxRendererEnabled = false;
        this._refractionRTT.onBeforeRenderObservable.add(function () {
            boundingBoxRendererEnabled = scene.getBoundingBoxRenderer().enabled;
            scene.getBoundingBoxRenderer().enabled = false;
        });
        this._refractionRTT.onAfterRenderObservable.add(function () {
            scene.getBoundingBoxRenderer().enabled = boundingBoxRendererEnabled;
        });
        this._reflectionRTT = new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.RenderTargetTexture(name + "_reflection", { width: renderTargetSize.x, height: renderTargetSize.y }, scene, false, true);
        this._reflectionRTT.wrapU = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Constants.TEXTURE_MIRROR_ADDRESSMODE;
        this._reflectionRTT.wrapV = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Constants.TEXTURE_MIRROR_ADDRESSMODE;
        this._reflectionRTT.ignoreCameraViewport = true;
        var isVisible;
        var clipPlane = null;
        var savedViewMatrix;
        var mirrorMatrix = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Matrix.Zero();
        this._refractionRTT.onBeforeRender = function () {
            if (_this._mesh) {
                isVisible = _this._mesh.isVisible;
                _this._mesh.isVisible = false;
            }
            // Clip plane
            if (!_this.disableClipPlane) {
                clipPlane = scene.clipPlane;
                var positiony = _this._mesh ? _this._mesh.absolutePosition.y : 0.0;
                scene.clipPlane = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Plane.FromPositionAndNormal(new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, positiony + 0.05, 0), new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 1, 0));
            }
        };
        this._refractionRTT.onAfterRender = function () {
            if (_this._mesh) {
                _this._mesh.isVisible = isVisible;
            }
            // Clip plane
            if (!_this.disableClipPlane) {
                scene.clipPlane = clipPlane;
            }
        };
        this._reflectionRTT.onBeforeRender = function () {
            if (_this._mesh) {
                isVisible = _this._mesh.isVisible;
                _this._mesh.isVisible = false;
            }
            // Clip plane
            if (!_this.disableClipPlane) {
                clipPlane = scene.clipPlane;
                var positiony = _this._mesh ? _this._mesh.absolutePosition.y : 0.0;
                scene.clipPlane = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Plane.FromPositionAndNormal(new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, positiony - 0.05, 0), new babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, -1, 0));
                babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Matrix.ReflectionToRef(scene.clipPlane, mirrorMatrix);
            }
            // Transform
            savedViewMatrix = scene.getViewMatrix();
            mirrorMatrix.multiplyToRef(savedViewMatrix, _this._reflectionTransform);
            scene.setTransformMatrix(_this._reflectionTransform, scene.getProjectionMatrix());
            scene._mirroredCameraPosition = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.Vector3.TransformCoordinates(scene.activeCamera.position, mirrorMatrix);
        };
        this._reflectionRTT.onAfterRender = function () {
            if (_this._mesh) {
                _this._mesh.isVisible = isVisible;
            }
            // Clip plane
            scene.clipPlane = clipPlane;
            // Transform
            scene.setTransformMatrix(savedViewMatrix, scene.getProjectionMatrix());
            scene._mirroredCameraPosition = null;
        };
    };
    WaterMaterial.prototype.getAnimatables = function () {
        var results = [];
        if (this.bumpTexture && this.bumpTexture.animations && this.bumpTexture.animations.length > 0) {
            results.push(this.bumpTexture);
        }
        if (this._reflectionRTT && this._reflectionRTT.animations && this._reflectionRTT.animations.length > 0) {
            results.push(this._reflectionRTT);
        }
        if (this._refractionRTT && this._refractionRTT.animations && this._refractionRTT.animations.length > 0) {
            results.push(this._refractionRTT);
        }
        return results;
    };
    WaterMaterial.prototype.getActiveTextures = function () {
        var activeTextures = _super.prototype.getActiveTextures.call(this);
        if (this._bumpTexture) {
            activeTextures.push(this._bumpTexture);
        }
        return activeTextures;
    };
    WaterMaterial.prototype.hasTexture = function (texture) {
        if (_super.prototype.hasTexture.call(this, texture)) {
            return true;
        }
        if (this._bumpTexture === texture) {
            return true;
        }
        return false;
    };
    WaterMaterial.prototype.dispose = function (forceDisposeEffect) {
        if (this.bumpTexture) {
            this.bumpTexture.dispose();
        }
        var index = this.getScene().customRenderTargets.indexOf(this._refractionRTT);
        if (index != -1) {
            this.getScene().customRenderTargets.splice(index, 1);
        }
        index = -1;
        index = this.getScene().customRenderTargets.indexOf(this._reflectionRTT);
        if (index != -1) {
            this.getScene().customRenderTargets.splice(index, 1);
        }
        if (this._reflectionRTT) {
            this._reflectionRTT.dispose();
        }
        if (this._refractionRTT) {
            this._refractionRTT.dispose();
        }
        // Remove image-processing observer
        if (this._imageProcessingConfiguration && this._imageProcessingObserver) {
            this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver);
        }
        _super.prototype.dispose.call(this, forceDisposeEffect);
    };
    WaterMaterial.prototype.clone = function (name) {
        var _this = this;
        return babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.SerializationHelper.Clone(function () { return new WaterMaterial(name, _this.getScene()); }, this);
    };
    WaterMaterial.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.customType = "BABYLON.WaterMaterial";
        serializationObject.renderList = [];
        if (this._refractionRTT && this._refractionRTT.renderList) {
            for (var i = 0; i < this._refractionRTT.renderList.length; i++) {
                serializationObject.renderList.push(this._refractionRTT.renderList[i].id);
            }
        }
        return serializationObject;
    };
    WaterMaterial.prototype.getClassName = function () {
        return "WaterMaterial";
    };
    // Statics
    WaterMaterial.Parse = function (source, scene, rootUrl) {
        var mat = babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.SerializationHelper.Parse(function () { return new WaterMaterial(source.name, scene); }, source, scene, rootUrl);
        mat._waitingRenderList = source.renderList;
        return mat;
    };
    WaterMaterial.CreateDefaultMesh = function (name, scene) {
        var mesh = (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.CreateGround)(name, { width: 512, height: 512, subdivisions: 32, updatable: false }, scene);
        return mesh;
    };
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsTexture)("bumpTexture")
    ], WaterMaterial.prototype, "_bumpTexture", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)("_markAllSubMeshesAsTexturesDirty")
    ], WaterMaterial.prototype, "bumpTexture", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsColor3)()
    ], WaterMaterial.prototype, "diffuseColor", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsColor3)()
    ], WaterMaterial.prototype, "specularColor", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "specularPower", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)("disableLighting")
    ], WaterMaterial.prototype, "_disableLighting", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)("_markAllSubMeshesAsLightsDirty")
    ], WaterMaterial.prototype, "disableLighting", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)("maxSimultaneousLights")
    ], WaterMaterial.prototype, "_maxSimultaneousLights", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)("_markAllSubMeshesAsLightsDirty")
    ], WaterMaterial.prototype, "maxSimultaneousLights", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "windForce", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsVector2)()
    ], WaterMaterial.prototype, "windDirection", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "waveHeight", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "bumpHeight", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)("bumpSuperimpose")
    ], WaterMaterial.prototype, "_bumpSuperimpose", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)("_markAllSubMeshesAsMiscDirty")
    ], WaterMaterial.prototype, "bumpSuperimpose", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)("fresnelSeparate")
    ], WaterMaterial.prototype, "_fresnelSeparate", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)("_markAllSubMeshesAsMiscDirty")
    ], WaterMaterial.prototype, "fresnelSeparate", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)("bumpAffectsReflection")
    ], WaterMaterial.prototype, "_bumpAffectsReflection", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)("_markAllSubMeshesAsMiscDirty")
    ], WaterMaterial.prototype, "bumpAffectsReflection", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsColor3)()
    ], WaterMaterial.prototype, "waterColor", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "colorBlendFactor", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serializeAsColor3)()
    ], WaterMaterial.prototype, "waterColor2", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "colorBlendFactor2", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "waveLength", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "waveSpeed", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "waveCount", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)()
    ], WaterMaterial.prototype, "disableClipPlane", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.serialize)("useWorldCoordinatesForWaveDeformation")
    ], WaterMaterial.prototype, "_useWorldCoordinatesForWaveDeformation", void 0);
    (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__decorate)([
        (0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.expandToProperty)("_markAllSubMeshesAsMiscDirty")
    ], WaterMaterial.prototype, "useWorldCoordinatesForWaveDeformation", void 0);
    return WaterMaterial;
}(babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.PushMaterial));

(0,babylonjs_Misc_decorators__WEBPACK_IMPORTED_MODULE_0__.RegisterClass)("BABYLON.WaterMaterial", WaterMaterial);


/***/ }),

/***/ "../../../lts/materials/src/legacy/legacy-water.ts":
/*!*********************************************************!*\
  !*** ../../../lts/materials/src/legacy/legacy-water.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WaterMaterial: () => (/* reexport safe */ materials_water_index__WEBPACK_IMPORTED_MODULE_0__.WaterMaterial)
/* harmony export */ });
/* harmony import */ var materials_water_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! materials/water/index */ "../../../dev/materials/src/water/index.ts");
/* eslint-disable import/no-internal-modules */

/**
 * This is the entry point for the UMD module.
 * The entry point for a future ESM package should be index.ts
 */
var globalObject = typeof __webpack_require__.g !== "undefined" ? __webpack_require__.g : typeof window !== "undefined" ? window : undefined;
if (typeof globalObject !== "undefined") {
    for (var key in materials_water_index__WEBPACK_IMPORTED_MODULE_0__) {
        globalObject.BABYLON[key] = materials_water_index__WEBPACK_IMPORTED_MODULE_0__[key];
    }
}



/***/ }),

/***/ "babylonjs/Materials/effect":
/*!****************************************************************************************************!*\
  !*** external {"root":"BABYLON","commonjs":"babylonjs","commonjs2":"babylonjs","amd":"babylonjs"} ***!
  \****************************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_babylonjs_Materials_effect__;

/***/ }),

/***/ "../../../../node_modules/tslib/tslib.es6.mjs":
/*!****************************************************!*\
  !*** ../../../../node_modules/tslib/tslib.es6.mjs ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __addDisposableResource: () => (/* binding */ __addDisposableResource),
/* harmony export */   __assign: () => (/* binding */ __assign),
/* harmony export */   __asyncDelegator: () => (/* binding */ __asyncDelegator),
/* harmony export */   __asyncGenerator: () => (/* binding */ __asyncGenerator),
/* harmony export */   __asyncValues: () => (/* binding */ __asyncValues),
/* harmony export */   __await: () => (/* binding */ __await),
/* harmony export */   __awaiter: () => (/* binding */ __awaiter),
/* harmony export */   __classPrivateFieldGet: () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   __classPrivateFieldIn: () => (/* binding */ __classPrivateFieldIn),
/* harmony export */   __classPrivateFieldSet: () => (/* binding */ __classPrivateFieldSet),
/* harmony export */   __createBinding: () => (/* binding */ __createBinding),
/* harmony export */   __decorate: () => (/* binding */ __decorate),
/* harmony export */   __disposeResources: () => (/* binding */ __disposeResources),
/* harmony export */   __esDecorate: () => (/* binding */ __esDecorate),
/* harmony export */   __exportStar: () => (/* binding */ __exportStar),
/* harmony export */   __extends: () => (/* binding */ __extends),
/* harmony export */   __generator: () => (/* binding */ __generator),
/* harmony export */   __importDefault: () => (/* binding */ __importDefault),
/* harmony export */   __importStar: () => (/* binding */ __importStar),
/* harmony export */   __makeTemplateObject: () => (/* binding */ __makeTemplateObject),
/* harmony export */   __metadata: () => (/* binding */ __metadata),
/* harmony export */   __param: () => (/* binding */ __param),
/* harmony export */   __propKey: () => (/* binding */ __propKey),
/* harmony export */   __read: () => (/* binding */ __read),
/* harmony export */   __rest: () => (/* binding */ __rest),
/* harmony export */   __rewriteRelativeImportExtension: () => (/* binding */ __rewriteRelativeImportExtension),
/* harmony export */   __runInitializers: () => (/* binding */ __runInitializers),
/* harmony export */   __setFunctionName: () => (/* binding */ __setFunctionName),
/* harmony export */   __spread: () => (/* binding */ __spread),
/* harmony export */   __spreadArray: () => (/* binding */ __spreadArray),
/* harmony export */   __spreadArrays: () => (/* binding */ __spreadArrays),
/* harmony export */   __values: () => (/* binding */ __values),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
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
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
  function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
  function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

var ownKeys = function(o) {
  ownKeys = Object.getOwnPropertyNames || function (o) {
    var ar = [];
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
    return ar;
  };
  return ownKeys(o);
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
        }
        else s |= 1;
      }
      catch (e) {
        fail(e);
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError) throw env.error;
  }
  return next();
}

function __rewriteRelativeImportExtension(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) {
      return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
          return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
      });
  }
  return path;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
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
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/water.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   materials: () => (/* reexport module object */ _lts_materials_legacy_legacy_water__WEBPACK_IMPORTED_MODULE_0__)
/* harmony export */ });
/* harmony import */ var _lts_materials_legacy_legacy_water__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @lts/materials/legacy/legacy-water */ "../../../lts/materials/src/legacy/legacy-water.ts");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_lts_materials_legacy_legacy_water__WEBPACK_IMPORTED_MODULE_0__);

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFieWxvbi53YXRlck1hdGVyaWFsLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ1ZBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQXdJQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQWdHQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBR0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBS0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWVBO0FBRUE7QUFBQTtBQThDQTtBQUNBO0FBOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7O0FBQ0E7QUFDQTtBQUFBO0FBRUE7QUFBQTtBQXdKQTs7Ozs7QUFLQTtBQUNBO0FBR0E7QUFFQTtBQUZBO0FBdkpBO0FBR0E7QUFHQTtBQUdBO0FBS0E7QUFJQTs7QUFFQTtBQUVBO0FBQ0E7O0FBRUE7QUFFQTtBQUNBOztBQUVBO0FBRUE7QUFDQTs7QUFFQTtBQUVBO0FBQ0E7O0FBRUE7QUFFQTtBQUlBOztBQUVBO0FBRUE7QUFJQTs7QUFFQTtBQUVBO0FBSUE7O0FBRUE7QUFFQTtBQUNBOztBQUVBO0FBRUE7QUFDQTs7QUFFQTtBQUVBO0FBQ0E7O0FBRUE7QUFFQTtBQUNBOztBQUVBO0FBRUE7QUFFQTs7QUFFQTtBQUVBO0FBRUE7O0FBRUE7QUFFQTtBQUNBOzs7QUFHQTtBQUVBO0FBRUE7Ozs7QUFJQTtBQUVBO0FBSUE7QUFFQTs7QUFFQTtBQUNBO0FBS0E7QUFDQTtBQUNBO0FBMkJBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0E7QUFsQ0E7QUFIQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQUE7QUFtQ0E7QUFEQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQUE7QUFFQTtBQUFBO0FBQ0E7QUFDQTs7O0FBQUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFBQTtBQUNBO0FBQ0E7OztBQUFBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUFBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQWp2QkE7QUFEQTtBQUNBO0FBRUE7QUFEQTtBQUNBO0FBR0E7QUFEQTtBQUNBO0FBR0E7QUFEQTtBQUNBO0FBR0E7QUFEQTtBQUNBO0FBR0E7QUFEQTtBQUNBO0FBRUE7QUFEQTtBQUNBO0FBR0E7QUFEQTtBQUNBO0FBRUE7QUFEQTtBQUNBO0FBTUE7QUFEQTtBQUNBO0FBS0E7QUFEQTtBQUNBO0FBS0E7QUFEQTtBQUNBO0FBS0E7QUFEQTtBQUNBO0FBS0E7QUFEQTtBQUNBO0FBRUE7QUFEQTtBQUNBO0FBTUE7QUFEQTtBQUNBO0FBRUE7QUFEQTtBQUNBO0FBTUE7QUFEQTtBQUNBO0FBRUE7QUFEQTtBQUNBO0FBTUE7QUFEQTtBQUNBO0FBS0E7QUFEQTtBQUNBO0FBS0E7QUFEQTtBQUNBO0FBS0E7QUFEQTtBQUNBO0FBS0E7QUFEQTtBQUNBO0FBTUE7QUFEQTtBQUNBO0FBTUE7QUFEQTtBQUNBO0FBTUE7QUFEQTtBQUNBO0FBUUE7QUFEQTtBQUNBO0FBRUE7QUFEQTtBQUNBO0FBMm5CQTtBQUFBO0FBdnZCQTtBQXl2QkE7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5MUJBO0FBQ0E7QUFFQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7Ozs7Ozs7QUNkQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNoWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1BBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDTkE7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vTUFURVJJQUxTL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9NQVRFUklBTFMvLi4vLi4vLi4vZGV2L21hdGVyaWFscy9zcmMvd2F0ZXIvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTLy4uLy4uLy4uL2Rldi9tYXRlcmlhbHMvc3JjL3dhdGVyL3dhdGVyLmZyYWdtZW50LnRzIiwid2VicGFjazovL01BVEVSSUFMUy8uLi8uLi8uLi9kZXYvbWF0ZXJpYWxzL3NyYy93YXRlci93YXRlci52ZXJ0ZXgudHMiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTLy4uLy4uLy4uL2Rldi9tYXRlcmlhbHMvc3JjL3dhdGVyL3dhdGVyTWF0ZXJpYWwudHMiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTLy4uLy4uLy4uL2x0cy9tYXRlcmlhbHMvc3JjL2xlZ2FjeS9sZWdhY3ktd2F0ZXIudHMiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTL2V4dGVybmFsIHVtZCB7XCJyb290XCI6XCJCQUJZTE9OXCIsXCJjb21tb25qc1wiOlwiYmFieWxvbmpzXCIsXCJjb21tb25qczJcIjpcImJhYnlsb25qc1wiLFwiYW1kXCI6XCJiYWJ5bG9uanNcIn0iLCJ3ZWJwYWNrOi8vTUFURVJJQUxTLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYubWpzIiwid2VicGFjazovL01BVEVSSUFMUy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9NQVRFUklBTFMvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vTUFURVJJQUxTL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9NQVRFUklBTFMvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9NQVRFUklBTFMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9NQVRFUklBTFMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9NQVRFUklBTFMvLi9zcmMvd2F0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKFwiYmFieWxvbmpzXCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwiYmFieWxvbmpzLW1hdGVyaWFsc1wiLCBbXCJiYWJ5bG9uanNcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiYmFieWxvbmpzLW1hdGVyaWFsc1wiXSA9IGZhY3RvcnkocmVxdWlyZShcImJhYnlsb25qc1wiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wiTUFURVJJQUxTXCJdID0gZmFjdG9yeShyb290W1wiQkFCWUxPTlwiXSk7XG59KSgodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHRoaXMpLCAoX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9iYWJ5bG9uanNfTWF0ZXJpYWxzX2VmZmVjdF9fKSA9PiB7XG5yZXR1cm4gIiwiZXhwb3J0ICogZnJvbSBcIi4vd2F0ZXJNYXRlcmlhbFwiO1xyXG4iLCIvLyBEbyBub3QgZWRpdC5cbmltcG9ydCB7IFNoYWRlclN0b3JlIH0gZnJvbSBcImNvcmUvRW5naW5lcy9zaGFkZXJTdG9yZVwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2hlbHBlckZ1bmN0aW9uc1wiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2ltYWdlUHJvY2Vzc2luZ0RlY2xhcmF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvaW1hZ2VQcm9jZXNzaW5nRnVuY3Rpb25zXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvbGlnaHRGcmFnbWVudERlY2xhcmF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvbGlnaHRVYm9EZWNsYXJhdGlvblwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2xpZ2h0c0ZyYWdtZW50RnVuY3Rpb25zXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvc2hhZG93c0ZyYWdtZW50RnVuY3Rpb25zXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvY2xpcFBsYW5lRnJhZ21lbnREZWNsYXJhdGlvblwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2xvZ0RlcHRoRGVjbGFyYXRpb25cIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9mb2dGcmFnbWVudERlY2xhcmF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvY2xpcFBsYW5lRnJhZ21lbnRcIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9saWdodEZyYWdtZW50XCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvbG9nRGVwdGhGcmFnbWVudFwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2ZvZ0ZyYWdtZW50XCI7XG5cbmNvbnN0IG5hbWUgPSBcIndhdGVyUGl4ZWxTaGFkZXJcIjtcbmNvbnN0IHNoYWRlciA9IGAjaWZkZWYgTE9HQVJJVEhNSUNERVBUSFxuI2V4dGVuc2lvbiBHTF9FWFRfZnJhZ19kZXB0aCA6IGVuYWJsZVxuI2VuZGlmXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7dW5pZm9ybSB2ZWM0IHZFeWVQb3NpdGlvbjt1bmlmb3JtIHZlYzQgdkRpZmZ1c2VDb2xvcjtcbiNpZmRlZiBTUEVDVUxBUlRFUk1cbnVuaWZvcm0gdmVjNCB2U3BlY3VsYXJDb2xvcjtcbiNlbmRpZlxudmFyeWluZyB2ZWMzIHZQb3NpdGlvblc7XG4jaWZkZWYgTk9STUFMXG52YXJ5aW5nIHZlYzMgdk5vcm1hbFc7XG4jZW5kaWZcbiNpZiBkZWZpbmVkKFZFUlRFWENPTE9SKSB8fCBkZWZpbmVkKElOU1RBTkNFU0NPTE9SKSAmJiBkZWZpbmVkKElOU1RBTkNFUylcbnZhcnlpbmcgdmVjNCB2Q29sb3I7XG4jZW5kaWZcbiNpbmNsdWRlPGhlbHBlckZ1bmN0aW9ucz5cbiNpbmNsdWRlPGltYWdlUHJvY2Vzc2luZ0RlY2xhcmF0aW9uPlxuI2luY2x1ZGU8aW1hZ2VQcm9jZXNzaW5nRnVuY3Rpb25zPlxuI2luY2x1ZGU8X19kZWNsX19saWdodEZyYWdtZW50PlswLi5tYXhTaW11bHRhbmVvdXNMaWdodHNdXG4jaW5jbHVkZTxsaWdodHNGcmFnbWVudEZ1bmN0aW9ucz5cbiNpbmNsdWRlPHNoYWRvd3NGcmFnbWVudEZ1bmN0aW9ucz5cbiNpZmRlZiBCVU1QXG52YXJ5aW5nIHZlYzIgdk5vcm1hbFVWO1xuI2lmZGVmIEJVTVBTVVBFUklNUE9TRVxudmFyeWluZyB2ZWMyIHZOb3JtYWxVVjI7XG4jZW5kaWZcbnVuaWZvcm0gc2FtcGxlcjJEIG5vcm1hbFNhbXBsZXI7dW5pZm9ybSB2ZWMyIHZOb3JtYWxJbmZvcztcbiNlbmRpZlxudW5pZm9ybSBzYW1wbGVyMkQgcmVmcmFjdGlvblNhbXBsZXI7dW5pZm9ybSBzYW1wbGVyMkQgcmVmbGVjdGlvblNhbXBsZXI7Y29uc3QgZmxvYXQgTE9HMj0xLjQ0MjY5NTt1bmlmb3JtIHZlYzMgY2FtZXJhUG9zaXRpb247dW5pZm9ybSB2ZWM0IHdhdGVyQ29sb3I7dW5pZm9ybSBmbG9hdCBjb2xvckJsZW5kRmFjdG9yO3VuaWZvcm0gdmVjNCB3YXRlckNvbG9yMjt1bmlmb3JtIGZsb2F0IGNvbG9yQmxlbmRGYWN0b3IyO3VuaWZvcm0gZmxvYXQgYnVtcEhlaWdodDt1bmlmb3JtIGZsb2F0IHRpbWU7dmFyeWluZyB2ZWMzIHZSZWZyYWN0aW9uTWFwVGV4Q29vcmQ7dmFyeWluZyB2ZWMzIHZSZWZsZWN0aW9uTWFwVGV4Q29vcmQ7XG4jaW5jbHVkZTxjbGlwUGxhbmVGcmFnbWVudERlY2xhcmF0aW9uPlxuI2luY2x1ZGU8bG9nRGVwdGhEZWNsYXJhdGlvbj5cbiNpbmNsdWRlPGZvZ0ZyYWdtZW50RGVjbGFyYXRpb24+XG4jZGVmaW5lIENVU1RPTV9GUkFHTUVOVF9ERUZJTklUSU9OU1xudm9pZCBtYWluKHZvaWQpIHtcbiNkZWZpbmUgQ1VTVE9NX0ZSQUdNRU5UX01BSU5fQkVHSU5cbiNpbmNsdWRlPGNsaXBQbGFuZUZyYWdtZW50PlxudmVjMyB2aWV3RGlyZWN0aW9uVz1ub3JtYWxpemUodkV5ZVBvc2l0aW9uLnh5ei12UG9zaXRpb25XKTt2ZWM0IGJhc2VDb2xvcj12ZWM0KDEuLDEuLDEuLDEuKTt2ZWMzIGRpZmZ1c2VDb2xvcj12RGlmZnVzZUNvbG9yLnJnYjtmbG9hdCBhbHBoYT12RGlmZnVzZUNvbG9yLmE7XG4jaWZkZWYgQlVNUFxuI2lmZGVmIEJVTVBTVVBFUklNUE9TRVxuYmFzZUNvbG9yPTAuNip0ZXh0dXJlMkQobm9ybWFsU2FtcGxlcix2Tm9ybWFsVVYpKzAuNCp0ZXh0dXJlMkQobm9ybWFsU2FtcGxlcix2ZWMyKHZOb3JtYWxVVjIueCx2Tm9ybWFsVVYyLnkpKTtcbiNlbHNlXG5iYXNlQ29sb3I9dGV4dHVyZTJEKG5vcm1hbFNhbXBsZXIsdk5vcm1hbFVWKTtcbiNlbmRpZlxudmVjMyBidW1wQ29sb3I9YmFzZUNvbG9yLnJnYjtcbiNpZmRlZiBBTFBIQVRFU1RcbmlmIChiYXNlQ29sb3IuYTwwLjQpXG5kaXNjYXJkO1xuI2VuZGlmXG5iYXNlQ29sb3IucmdiKj12Tm9ybWFsSW5mb3MueTtcbiNlbHNlXG52ZWMzIGJ1bXBDb2xvcj12ZWMzKDEuMCk7XG4jZW5kaWZcbiNpZiBkZWZpbmVkKFZFUlRFWENPTE9SKSB8fCBkZWZpbmVkKElOU1RBTkNFU0NPTE9SKSAmJiBkZWZpbmVkKElOU1RBTkNFUylcbmJhc2VDb2xvci5yZ2IqPXZDb2xvci5yZ2I7XG4jZW5kaWZcbiNpZmRlZiBOT1JNQUxcbnZlYzIgcGVydHVyYmF0aW9uPWJ1bXBIZWlnaHQqKGJhc2VDb2xvci5yZy0wLjUpO1xuI2lmZGVmIEJVTVBBRkZFQ1RTUkVGTEVDVElPTlxudmVjMyBub3JtYWxXPW5vcm1hbGl6ZSh2Tm9ybWFsVyt2ZWMzKHBlcnR1cmJhdGlvbi54KjguMCwwLjAscGVydHVyYmF0aW9uLnkqOC4wKSk7aWYgKG5vcm1hbFcueTwwLjApIHtub3JtYWxXLnk9LW5vcm1hbFcueTt9XG4jZWxzZVxudmVjMyBub3JtYWxXPW5vcm1hbGl6ZSh2Tm9ybWFsVyk7XG4jZW5kaWZcbiNlbHNlXG52ZWMzIG5vcm1hbFc9dmVjMygxLjAsMS4wLDEuMCk7dmVjMiBwZXJ0dXJiYXRpb249YnVtcEhlaWdodCoodmVjMigxLjAsMS4wKS0wLjUpO1xuI2VuZGlmXG4jaWZkZWYgRlJFU05FTFNFUEFSQVRFXG4jaWZkZWYgUkVGTEVDVElPTlxudmVjMiBwcm9qZWN0ZWRSZWZyYWN0aW9uVGV4Q29vcmRzPWNsYW1wKHZSZWZyYWN0aW9uTWFwVGV4Q29vcmQueHkvdlJlZnJhY3Rpb25NYXBUZXhDb29yZC56K3BlcnR1cmJhdGlvbiowLjUsMC4wLDEuMCk7dmVjNCByZWZyYWN0aXZlQ29sb3I9dGV4dHVyZTJEKHJlZnJhY3Rpb25TYW1wbGVyLHByb2plY3RlZFJlZnJhY3Rpb25UZXhDb29yZHMpO1xuI2lmZGVmIElTX1JFRlJBQ1RJT05fTElORUFSXG5yZWZyYWN0aXZlQ29sb3IucmdiPXRvR2FtbWFTcGFjZShyZWZyYWN0aXZlQ29sb3IucmdiKTtcbiNlbmRpZlxudmVjMiBwcm9qZWN0ZWRSZWZsZWN0aW9uVGV4Q29vcmRzPWNsYW1wKHZlYzIoXG52UmVmbGVjdGlvbk1hcFRleENvb3JkLngvdlJlZmxlY3Rpb25NYXBUZXhDb29yZC56K3BlcnR1cmJhdGlvbi54KjAuMyxcbnZSZWZsZWN0aW9uTWFwVGV4Q29vcmQueS92UmVmbGVjdGlvbk1hcFRleENvb3JkLnorcGVydHVyYmF0aW9uLnlcbiksMC4wLDEuMCk7dmVjNCByZWZsZWN0aXZlQ29sb3I9dGV4dHVyZTJEKHJlZmxlY3Rpb25TYW1wbGVyLHByb2plY3RlZFJlZmxlY3Rpb25UZXhDb29yZHMpO1xuI2lmZGVmIElTX1JFRkxFQ1RJT05fTElORUFSXG5yZWZsZWN0aXZlQ29sb3IucmdiPXRvR2FtbWFTcGFjZShyZWZsZWN0aXZlQ29sb3IucmdiKTtcbiNlbmRpZlxudmVjMyB1cFZlY3Rvcj12ZWMzKDAuMCwxLjAsMC4wKTtmbG9hdCBmcmVzbmVsVGVybT1jbGFtcChhYnMocG93KGRvdCh2aWV3RGlyZWN0aW9uVyx1cFZlY3RvciksMy4wKSksMC4wNSwwLjY1KTtmbG9hdCBJZnJlc25lbFRlcm09MS4wLWZyZXNuZWxUZXJtO3JlZnJhY3RpdmVDb2xvcj1jb2xvckJsZW5kRmFjdG9yKndhdGVyQ29sb3IrKDEuMC1jb2xvckJsZW5kRmFjdG9yKSpyZWZyYWN0aXZlQ29sb3I7cmVmbGVjdGl2ZUNvbG9yPUlmcmVzbmVsVGVybSpjb2xvckJsZW5kRmFjdG9yMip3YXRlckNvbG9yKygxLjAtY29sb3JCbGVuZEZhY3RvcjIqSWZyZXNuZWxUZXJtKSpyZWZsZWN0aXZlQ29sb3I7dmVjNCBjb21iaW5lZENvbG9yPXJlZnJhY3RpdmVDb2xvcipmcmVzbmVsVGVybStyZWZsZWN0aXZlQ29sb3IqSWZyZXNuZWxUZXJtO2Jhc2VDb2xvcj1jb21iaW5lZENvbG9yO1xuI2VuZGlmXG52ZWMzIGRpZmZ1c2VCYXNlPXZlYzMoMC4sMC4sMC4pO2xpZ2h0aW5nSW5mbyBpbmZvO2Zsb2F0IHNoYWRvdz0xLjtmbG9hdCBhZ2dTaGFkb3c9MC47ZmxvYXQgbnVtTGlnaHRzPTAuO1xuI2lmZGVmIFNQRUNVTEFSVEVSTVxuZmxvYXQgZ2xvc3NpbmVzcz12U3BlY3VsYXJDb2xvci5hO3ZlYzMgc3BlY3VsYXJCYXNlPXZlYzMoMC4sMC4sMC4pO3ZlYzMgc3BlY3VsYXJDb2xvcj12U3BlY3VsYXJDb2xvci5yZ2I7XG4jZWxzZVxuZmxvYXQgZ2xvc3NpbmVzcz0wLjtcbiNlbmRpZlxuI2luY2x1ZGU8bGlnaHRGcmFnbWVudD5bMC4ubWF4U2ltdWx0YW5lb3VzTGlnaHRzXVxudmVjMyBmaW5hbERpZmZ1c2U9Y2xhbXAoYmFzZUNvbG9yLnJnYiwwLjAsMS4wKTtcbiNpZiBkZWZpbmVkKFZFUlRFWEFMUEhBKSB8fCBkZWZpbmVkKElOU1RBTkNFU0NPTE9SKSAmJiBkZWZpbmVkKElOU1RBTkNFUylcbmFscGhhKj12Q29sb3IuYTtcbiNlbmRpZlxuI2lmZGVmIFNQRUNVTEFSVEVSTVxudmVjMyBmaW5hbFNwZWN1bGFyPXNwZWN1bGFyQmFzZSpzcGVjdWxhckNvbG9yO1xuI2Vsc2VcbnZlYzMgZmluYWxTcGVjdWxhcj12ZWMzKDAuMCk7XG4jZW5kaWZcbiNlbHNlIFxuI2lmZGVmIFJFRkxFQ1RJT05cbnZlYzIgcHJvamVjdGVkUmVmcmFjdGlvblRleENvb3Jkcz1jbGFtcCh2UmVmcmFjdGlvbk1hcFRleENvb3JkLnh5L3ZSZWZyYWN0aW9uTWFwVGV4Q29vcmQueitwZXJ0dXJiYXRpb24sMC4wLDEuMCk7dmVjNCByZWZyYWN0aXZlQ29sb3I9dGV4dHVyZTJEKHJlZnJhY3Rpb25TYW1wbGVyLHByb2plY3RlZFJlZnJhY3Rpb25UZXhDb29yZHMpO1xuI2lmZGVmIElTX1JFRlJBQ1RJT05fTElORUFSXG5yZWZyYWN0aXZlQ29sb3IucmdiPXRvR2FtbWFTcGFjZShyZWZyYWN0aXZlQ29sb3IucmdiKTtcbiNlbmRpZlxudmVjMiBwcm9qZWN0ZWRSZWZsZWN0aW9uVGV4Q29vcmRzPWNsYW1wKHZSZWZsZWN0aW9uTWFwVGV4Q29vcmQueHkvdlJlZmxlY3Rpb25NYXBUZXhDb29yZC56K3BlcnR1cmJhdGlvbiwwLjAsMS4wKTt2ZWM0IHJlZmxlY3RpdmVDb2xvcj10ZXh0dXJlMkQocmVmbGVjdGlvblNhbXBsZXIscHJvamVjdGVkUmVmbGVjdGlvblRleENvb3Jkcyk7XG4jaWZkZWYgSVNfUkVGTEVDVElPTl9MSU5FQVJcbnJlZmxlY3RpdmVDb2xvci5yZ2I9dG9HYW1tYVNwYWNlKHJlZmxlY3RpdmVDb2xvci5yZ2IpO1xuI2VuZGlmXG52ZWMzIHVwVmVjdG9yPXZlYzMoMC4wLDEuMCwwLjApO2Zsb2F0IGZyZXNuZWxUZXJtPW1heChkb3Qodmlld0RpcmVjdGlvblcsdXBWZWN0b3IpLDAuMCk7dmVjNCBjb21iaW5lZENvbG9yPXJlZnJhY3RpdmVDb2xvcipmcmVzbmVsVGVybStyZWZsZWN0aXZlQ29sb3IqKDEuMC1mcmVzbmVsVGVybSk7YmFzZUNvbG9yPWNvbG9yQmxlbmRGYWN0b3Iqd2F0ZXJDb2xvcisoMS4wLWNvbG9yQmxlbmRGYWN0b3IpKmNvbWJpbmVkQ29sb3I7XG4jZW5kaWZcbnZlYzMgZGlmZnVzZUJhc2U9dmVjMygwLiwwLiwwLik7bGlnaHRpbmdJbmZvIGluZm87ZmxvYXQgc2hhZG93PTEuO2Zsb2F0IGFnZ1NoYWRvdz0wLjtmbG9hdCBudW1MaWdodHM9MC47XG4jaWZkZWYgU1BFQ1VMQVJURVJNXG5mbG9hdCBnbG9zc2luZXNzPXZTcGVjdWxhckNvbG9yLmE7dmVjMyBzcGVjdWxhckJhc2U9dmVjMygwLiwwLiwwLik7dmVjMyBzcGVjdWxhckNvbG9yPXZTcGVjdWxhckNvbG9yLnJnYjtcbiNlbHNlXG5mbG9hdCBnbG9zc2luZXNzPTAuO1xuI2VuZGlmXG4jaW5jbHVkZTxsaWdodEZyYWdtZW50PlswLi5tYXhTaW11bHRhbmVvdXNMaWdodHNdXG52ZWMzIGZpbmFsRGlmZnVzZT1jbGFtcChiYXNlQ29sb3IucmdiLDAuMCwxLjApO1xuI2lmIGRlZmluZWQoVkVSVEVYQUxQSEEpIHx8IGRlZmluZWQoSU5TVEFOQ0VTQ09MT1IpICYmIGRlZmluZWQoSU5TVEFOQ0VTKVxuYWxwaGEqPXZDb2xvci5hO1xuI2VuZGlmXG4jaWZkZWYgU1BFQ1VMQVJURVJNXG52ZWMzIGZpbmFsU3BlY3VsYXI9c3BlY3VsYXJCYXNlKnNwZWN1bGFyQ29sb3I7XG4jZWxzZVxudmVjMyBmaW5hbFNwZWN1bGFyPXZlYzMoMC4wKTtcbiNlbmRpZlxuI2VuZGlmXG52ZWM0IGNvbG9yPXZlYzQoZmluYWxEaWZmdXNlK2ZpbmFsU3BlY3VsYXIsYWxwaGEpO1xuI2luY2x1ZGU8bG9nRGVwdGhGcmFnbWVudD5cbiNpbmNsdWRlPGZvZ0ZyYWdtZW50PlxuI2lmZGVmIElNQUdFUFJPQ0VTU0lOR1BPU1RQUk9DRVNTXG5jb2xvci5yZ2I9dG9MaW5lYXJTcGFjZShjb2xvci5yZ2IpO1xuI2VsaWYgZGVmaW5lZChJTUFHRVBST0NFU1NJTkcpXG5jb2xvci5yZ2I9dG9MaW5lYXJTcGFjZShjb2xvci5yZ2IpO2NvbG9yPWFwcGx5SW1hZ2VQcm9jZXNzaW5nKGNvbG9yKTtcbiNlbmRpZlxuZ2xfRnJhZ0NvbG9yPWNvbG9yO1xuI2RlZmluZSBDVVNUT01fRlJBR01FTlRfTUFJTl9FTkRcbn1cbmA7XG4vLyBTaWRlZWZmZWN0XG5TaGFkZXJTdG9yZS5TaGFkZXJzU3RvcmVbbmFtZV0gPSBzaGFkZXI7XG4vKiogQGludGVybmFsICovXG5leHBvcnQgY29uc3Qgd2F0ZXJQaXhlbFNoYWRlciA9IHsgbmFtZSwgc2hhZGVyIH07XG4iLCIvLyBEbyBub3QgZWRpdC5cbmltcG9ydCB7IFNoYWRlclN0b3JlIH0gZnJvbSBcImNvcmUvRW5naW5lcy9zaGFkZXJTdG9yZVwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2JvbmVzRGVjbGFyYXRpb25cIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9iYWtlZFZlcnRleEFuaW1hdGlvbkRlY2xhcmF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvaW5zdGFuY2VzRGVjbGFyYXRpb25cIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9jbGlwUGxhbmVWZXJ0ZXhEZWNsYXJhdGlvblwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2ZvZ1ZlcnRleERlY2xhcmF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvbGlnaHRGcmFnbWVudERlY2xhcmF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvbGlnaHRVYm9EZWNsYXJhdGlvblwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2xvZ0RlcHRoRGVjbGFyYXRpb25cIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9pbnN0YW5jZXNWZXJ0ZXhcIjtcbmltcG9ydCBcImNvcmUvU2hhZGVycy9TaGFkZXJzSW5jbHVkZS9ib25lc1ZlcnRleFwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL2Jha2VkVmVydGV4QW5pbWF0aW9uXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvY2xpcFBsYW5lVmVydGV4XCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvZm9nVmVydGV4XCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvc2hhZG93c1ZlcnRleFwiO1xuaW1wb3J0IFwiY29yZS9TaGFkZXJzL1NoYWRlcnNJbmNsdWRlL3ZlcnRleENvbG9yTWl4aW5nXCI7XG5pbXBvcnQgXCJjb3JlL1NoYWRlcnMvU2hhZGVyc0luY2x1ZGUvbG9nRGVwdGhWZXJ0ZXhcIjtcblxuY29uc3QgbmFtZSA9IFwid2F0ZXJWZXJ0ZXhTaGFkZXJcIjtcbmNvbnN0IHNoYWRlciA9IGBwcmVjaXNpb24gaGlnaHAgZmxvYXQ7YXR0cmlidXRlIHZlYzMgcG9zaXRpb247XG4jaWZkZWYgTk9STUFMXG5hdHRyaWJ1dGUgdmVjMyBub3JtYWw7XG4jZW5kaWZcbiNpZmRlZiBVVjFcbmF0dHJpYnV0ZSB2ZWMyIHV2O1xuI2VuZGlmXG4jaWZkZWYgVVYyXG5hdHRyaWJ1dGUgdmVjMiB1djI7XG4jZW5kaWZcbiNpZmRlZiBWRVJURVhDT0xPUlxuYXR0cmlidXRlIHZlYzQgY29sb3I7XG4jZW5kaWZcbiNpbmNsdWRlPGJvbmVzRGVjbGFyYXRpb24+XG4jaW5jbHVkZTxiYWtlZFZlcnRleEFuaW1hdGlvbkRlY2xhcmF0aW9uPlxuI2luY2x1ZGU8aW5zdGFuY2VzRGVjbGFyYXRpb24+XG51bmlmb3JtIG1hdDQgdmlldzt1bmlmb3JtIG1hdDQgdmlld1Byb2plY3Rpb247XG4jaWZkZWYgQlVNUFxudmFyeWluZyB2ZWMyIHZOb3JtYWxVVjtcbiNpZmRlZiBCVU1QU1VQRVJJTVBPU0VcbnZhcnlpbmcgdmVjMiB2Tm9ybWFsVVYyO1xuI2VuZGlmXG51bmlmb3JtIG1hdDQgbm9ybWFsTWF0cml4O3VuaWZvcm0gdmVjMiB2Tm9ybWFsSW5mb3M7XG4jZW5kaWZcbiNpZmRlZiBQT0lOVFNJWkVcbnVuaWZvcm0gZmxvYXQgcG9pbnRTaXplO1xuI2VuZGlmXG52YXJ5aW5nIHZlYzMgdlBvc2l0aW9uVztcbiNpZmRlZiBOT1JNQUxcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsVztcbiNlbmRpZlxuI2lmIGRlZmluZWQoVkVSVEVYQ09MT1IpIHx8IGRlZmluZWQoSU5TVEFOQ0VTQ09MT1IpICYmIGRlZmluZWQoSU5TVEFOQ0VTKVxudmFyeWluZyB2ZWM0IHZDb2xvcjtcbiNlbmRpZlxuI2luY2x1ZGU8Y2xpcFBsYW5lVmVydGV4RGVjbGFyYXRpb24+XG4jaW5jbHVkZTxmb2dWZXJ0ZXhEZWNsYXJhdGlvbj5cbiNpbmNsdWRlPF9fZGVjbF9fbGlnaHRGcmFnbWVudD5bMC4ubWF4U2ltdWx0YW5lb3VzTGlnaHRzXVxuI2luY2x1ZGU8bG9nRGVwdGhEZWNsYXJhdGlvbj5cbnVuaWZvcm0gbWF0NCByZWZsZWN0aW9uVmlld1Byb2plY3Rpb247dW5pZm9ybSB2ZWMyIHdpbmREaXJlY3Rpb247dW5pZm9ybSBmbG9hdCB3YXZlTGVuZ3RoO3VuaWZvcm0gZmxvYXQgdGltZTt1bmlmb3JtIGZsb2F0IHdpbmRGb3JjZTt1bmlmb3JtIGZsb2F0IHdhdmVIZWlnaHQ7dW5pZm9ybSBmbG9hdCB3YXZlU3BlZWQ7dW5pZm9ybSBmbG9hdCB3YXZlQ291bnQ7dmFyeWluZyB2ZWMzIHZSZWZyYWN0aW9uTWFwVGV4Q29vcmQ7dmFyeWluZyB2ZWMzIHZSZWZsZWN0aW9uTWFwVGV4Q29vcmQ7XG4jZGVmaW5lIENVU1RPTV9WRVJURVhfREVGSU5JVElPTlNcbnZvaWQgbWFpbih2b2lkKSB7XG4jZGVmaW5lIENVU1RPTV9WRVJURVhfTUFJTl9CRUdJTlxuI2luY2x1ZGU8aW5zdGFuY2VzVmVydGV4PlxuI2luY2x1ZGU8Ym9uZXNWZXJ0ZXg+XG4jaW5jbHVkZTxiYWtlZFZlcnRleEFuaW1hdGlvbj5cbnZlYzQgd29ybGRQb3M9ZmluYWxXb3JsZCp2ZWM0KHBvc2l0aW9uLDEuMCk7dlBvc2l0aW9uVz12ZWMzKHdvcmxkUG9zKTtcbiNpZmRlZiBOT1JNQUxcbnZOb3JtYWxXPW5vcm1hbGl6ZSh2ZWMzKGZpbmFsV29ybGQqdmVjNChub3JtYWwsMC4wKSkpO1xuI2VuZGlmXG4jaWZuZGVmIFVWMVxudmVjMiB1dj12ZWMyKDAuLDAuKTtcbiNlbmRpZlxuI2lmbmRlZiBVVjJcbnZlYzIgdXYyPXZlYzIoMC4sMC4pO1xuI2VuZGlmXG4jaWZkZWYgQlVNUFxuaWYgKHZOb3JtYWxJbmZvcy54PT0wLilcbnt2Tm9ybWFsVVY9dmVjMihub3JtYWxNYXRyaXgqdmVjNCgodXYqMS4wKS93YXZlTGVuZ3RoK3RpbWUqd2luZEZvcmNlKndpbmREaXJlY3Rpb24sMS4wLDAuMCkpO1xuI2lmZGVmIEJVTVBTVVBFUklNUE9TRVxudk5vcm1hbFVWMj12ZWMyKG5vcm1hbE1hdHJpeCp2ZWM0KCh1diowLjcyMSkvd2F2ZUxlbmd0aCt0aW1lKjEuMip3aW5kRm9yY2Uqd2luZERpcmVjdGlvbiwxLjAsMC4wKSk7XG4jZW5kaWZcbn1cbmVsc2Vcbnt2Tm9ybWFsVVY9dmVjMihub3JtYWxNYXRyaXgqdmVjNCgodXYyKjEuMCkvd2F2ZUxlbmd0aCt0aW1lKndpbmRGb3JjZSp3aW5kRGlyZWN0aW9uICwxLjAsMC4wKSk7XG4jaWZkZWYgQlVNUFNVUEVSSU1QT1NFXG52Tm9ybWFsVVYyPXZlYzIobm9ybWFsTWF0cml4KnZlYzQoKHV2MiowLjcyMSkvd2F2ZUxlbmd0aCt0aW1lKjEuMip3aW5kRm9yY2Uqd2luZERpcmVjdGlvbiAsMS4wLDAuMCkpO1xuI2VuZGlmXG59XG4jZW5kaWZcbiNpbmNsdWRlPGNsaXBQbGFuZVZlcnRleD5cbiNpbmNsdWRlPGZvZ1ZlcnRleD5cbiNpbmNsdWRlPHNoYWRvd3NWZXJ0ZXg+WzAuLm1heFNpbXVsdGFuZW91c0xpZ2h0c11cbiNpbmNsdWRlPHZlcnRleENvbG9yTWl4aW5nPlxuI2lmIGRlZmluZWQoUE9JTlRTSVpFKSAmJiAhZGVmaW5lZChXRUJHUFUpXG5nbF9Qb2ludFNpemU9cG9pbnRTaXplO1xuI2VuZGlmXG5mbG9hdCBmaW5hbFdhdmVDb3VudD0xLjAvKHdhdmVDb3VudCowLjUpO1xuI2lmZGVmIFVTRV9XT1JMRF9DT09SRElOQVRFU1xudmVjMyBwPXdvcmxkUG9zLnh5ejtcbiNlbHNlXG52ZWMzIHA9cG9zaXRpb247XG4jZW5kaWZcbmZsb2F0IG5ld1k9KHNpbigoKHAueC9maW5hbFdhdmVDb3VudCkrdGltZSp3YXZlU3BlZWQpKSp3YXZlSGVpZ2h0KndpbmREaXJlY3Rpb24ueCo1LjApXG4rIChjb3MoKChwLnovZmluYWxXYXZlQ291bnQpKyB0aW1lKndhdmVTcGVlZCkpKndhdmVIZWlnaHQqd2luZERpcmVjdGlvbi55KjUuMCk7cC55Kz1hYnMobmV3WSk7XG4jaWZkZWYgVVNFX1dPUkxEX0NPT1JESU5BVEVTXG5nbF9Qb3NpdGlvbj12aWV3UHJvamVjdGlvbip2ZWM0KHAsMS4wKTtcbiNlbHNlXG5nbF9Qb3NpdGlvbj12aWV3UHJvamVjdGlvbipmaW5hbFdvcmxkKnZlYzQocCwxLjApO1xuI2VuZGlmXG4jaWZkZWYgUkVGTEVDVElPTlxudlJlZnJhY3Rpb25NYXBUZXhDb29yZC54PTAuNSooZ2xfUG9zaXRpb24udytnbF9Qb3NpdGlvbi54KTt2UmVmcmFjdGlvbk1hcFRleENvb3JkLnk9MC41KihnbF9Qb3NpdGlvbi53K2dsX1Bvc2l0aW9uLnkpO3ZSZWZyYWN0aW9uTWFwVGV4Q29vcmQuej1nbF9Qb3NpdGlvbi53O3dvcmxkUG9zPXJlZmxlY3Rpb25WaWV3UHJvamVjdGlvbipmaW5hbFdvcmxkKnZlYzQocG9zaXRpb24sMS4wKTt2UmVmbGVjdGlvbk1hcFRleENvb3JkLng9MC41Kih3b3JsZFBvcy53K3dvcmxkUG9zLngpO3ZSZWZsZWN0aW9uTWFwVGV4Q29vcmQueT0wLjUqKHdvcmxkUG9zLncrd29ybGRQb3MueSk7dlJlZmxlY3Rpb25NYXBUZXhDb29yZC56PXdvcmxkUG9zLnc7XG4jZW5kaWZcbiNpbmNsdWRlPGxvZ0RlcHRoVmVydGV4PlxuI2RlZmluZSBDVVNUT01fVkVSVEVYX01BSU5fRU5EXG59XG5gO1xuLy8gU2lkZWVmZmVjdFxuU2hhZGVyU3RvcmUuU2hhZGVyc1N0b3JlW25hbWVdID0gc2hhZGVyO1xuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IGNvbnN0IHdhdGVyVmVydGV4U2hhZGVyID0geyBuYW1lLCBzaGFkZXIgfTtcbiIsIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbiAqL1xyXG5pbXBvcnQgdHlwZSB7IE51bGxhYmxlIH0gZnJvbSBcImNvcmUvdHlwZXNcIjtcclxuaW1wb3J0IHsgc2VyaWFsaXplQXNWZWN0b3IyLCBzZXJpYWxpemVBc1RleHR1cmUsIHNlcmlhbGl6ZSwgZXhwYW5kVG9Qcm9wZXJ0eSwgc2VyaWFsaXplQXNDb2xvcjMgfSBmcm9tIFwiY29yZS9NaXNjL2RlY29yYXRvcnNcIjtcclxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbkhlbHBlciB9IGZyb20gXCJjb3JlL01pc2MvZGVjb3JhdG9ycy5zZXJpYWxpemF0aW9uXCI7XHJcbmltcG9ydCB7IE1hdHJpeCwgVmVjdG9yMiwgVmVjdG9yMyB9IGZyb20gXCJjb3JlL01hdGhzL21hdGgudmVjdG9yXCI7XHJcbmltcG9ydCB7IENvbG9yMyB9IGZyb20gXCJjb3JlL01hdGhzL21hdGguY29sb3JcIjtcclxuaW1wb3J0IHsgUGxhbmUgfSBmcm9tIFwiY29yZS9NYXRocy9tYXRoLnBsYW5lXCI7XHJcbmltcG9ydCB0eXBlIHsgSUFuaW1hdGFibGUgfSBmcm9tIFwiY29yZS9BbmltYXRpb25zL2FuaW1hdGFibGUuaW50ZXJmYWNlXCI7XHJcbmltcG9ydCB7IENvbnN0YW50cyB9IGZyb20gXCJjb3JlL0VuZ2luZXMvY29uc3RhbnRzXCI7XHJcbmltcG9ydCB7IFNtYXJ0QXJyYXkgfSBmcm9tIFwiY29yZS9NaXNjL3NtYXJ0QXJyYXlcIjtcclxuaW1wb3J0IHR5cGUgeyBPYnNlcnZlciB9IGZyb20gXCJjb3JlL01pc2Mvb2JzZXJ2YWJsZVwiO1xyXG5pbXBvcnQgdHlwZSB7IEJhc2VUZXh0dXJlIH0gZnJvbSBcImNvcmUvTWF0ZXJpYWxzL1RleHR1cmVzL2Jhc2VUZXh0dXJlXCI7XHJcbmltcG9ydCB7IFJlbmRlclRhcmdldFRleHR1cmUgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvVGV4dHVyZXMvcmVuZGVyVGFyZ2V0VGV4dHVyZVwiO1xyXG5pbXBvcnQgdHlwZSB7IElFZmZlY3RDcmVhdGlvbk9wdGlvbnMgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvZWZmZWN0XCI7XHJcbmltcG9ydCB7IE1hdGVyaWFsRGVmaW5lcyB9IGZyb20gXCJjb3JlL01hdGVyaWFscy9tYXRlcmlhbERlZmluZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBJSW1hZ2VQcm9jZXNzaW5nQ29uZmlndXJhdGlvbkRlZmluZXMgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvaW1hZ2VQcm9jZXNzaW5nQ29uZmlndXJhdGlvbi5kZWZpbmVzXCI7XHJcbmltcG9ydCB7IEltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24gfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvaW1hZ2VQcm9jZXNzaW5nQ29uZmlndXJhdGlvblwiO1xyXG5pbXBvcnQgeyBQdXNoTWF0ZXJpYWwgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvcHVzaE1hdGVyaWFsXCI7XHJcbmltcG9ydCB7IE1hdGVyaWFsRmxhZ3MgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvbWF0ZXJpYWxGbGFnc1wiO1xyXG5pbXBvcnQgeyBWZXJ0ZXhCdWZmZXIgfSBmcm9tIFwiY29yZS9CdWZmZXJzL2J1ZmZlclwiO1xyXG5pbXBvcnQgdHlwZSB7IEFic3RyYWN0TWVzaCB9IGZyb20gXCJjb3JlL01lc2hlcy9hYnN0cmFjdE1lc2hcIjtcclxuaW1wb3J0IHR5cGUgeyBTdWJNZXNoIH0gZnJvbSBcImNvcmUvTWVzaGVzL3N1Yk1lc2hcIjtcclxuaW1wb3J0IHR5cGUgeyBNZXNoIH0gZnJvbSBcImNvcmUvTWVzaGVzL21lc2hcIjtcclxuaW1wb3J0IHR5cGUgeyBDYW1lcmEgfSBmcm9tIFwiY29yZS9DYW1lcmFzL2NhbWVyYVwiO1xyXG5pbXBvcnQgeyBTY2VuZSB9IGZyb20gXCJjb3JlL3NjZW5lXCI7XHJcbmltcG9ydCB7IFJlZ2lzdGVyQ2xhc3MgfSBmcm9tIFwiY29yZS9NaXNjL3R5cGVTdG9yZVwiO1xyXG5cclxuaW1wb3J0IFwiLi93YXRlci5mcmFnbWVudFwiO1xyXG5pbXBvcnQgXCIuL3dhdGVyLnZlcnRleFwiO1xyXG5pbXBvcnQgeyBFZmZlY3RGYWxsYmFja3MgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvZWZmZWN0RmFsbGJhY2tzXCI7XHJcbmltcG9ydCB7IENyZWF0ZUdyb3VuZCB9IGZyb20gXCJjb3JlL01lc2hlcy9CdWlsZGVycy9ncm91bmRCdWlsZGVyXCI7XHJcbmltcG9ydCB7IGFkZENsaXBQbGFuZVVuaWZvcm1zLCBiaW5kQ2xpcFBsYW5lIH0gZnJvbSBcImNvcmUvTWF0ZXJpYWxzL2NsaXBQbGFuZU1hdGVyaWFsSGVscGVyXCI7XHJcbmltcG9ydCB7XHJcbiAgICBCaW5kQm9uZXNQYXJhbWV0ZXJzLFxyXG4gICAgQmluZEZvZ1BhcmFtZXRlcnMsXHJcbiAgICBCaW5kTGlnaHRzLFxyXG4gICAgQmluZExvZ0RlcHRoLFxyXG4gICAgSGFuZGxlRmFsbGJhY2tzRm9yU2hhZG93cyxcclxuICAgIFByZXBhcmVBdHRyaWJ1dGVzRm9yQm9uZXMsXHJcbiAgICBQcmVwYXJlQXR0cmlidXRlc0Zvckluc3RhbmNlcyxcclxuICAgIFByZXBhcmVEZWZpbmVzRm9yQXR0cmlidXRlcyxcclxuICAgIFByZXBhcmVEZWZpbmVzRm9yRnJhbWVCb3VuZFZhbHVlcyxcclxuICAgIFByZXBhcmVEZWZpbmVzRm9yTGlnaHRzLFxyXG4gICAgUHJlcGFyZURlZmluZXNGb3JNaXNjLFxyXG4gICAgUHJlcGFyZVVuaWZvcm1zQW5kU2FtcGxlcnNMaXN0LFxyXG59IGZyb20gXCJjb3JlL01hdGVyaWFscy9tYXRlcmlhbEhlbHBlci5mdW5jdGlvbnNcIjtcclxuXHJcbmltcG9ydCBcImNvcmUvUmVuZGVyaW5nL2JvdW5kaW5nQm94UmVuZGVyZXJcIjtcclxuXHJcbmNsYXNzIFdhdGVyTWF0ZXJpYWxEZWZpbmVzIGV4dGVuZHMgTWF0ZXJpYWxEZWZpbmVzIGltcGxlbWVudHMgSUltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb25EZWZpbmVzIHtcclxuICAgIHB1YmxpYyBCVU1QID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgUkVGTEVDVElPTiA9IGZhbHNlO1xyXG4gICAgcHVibGljIENMSVBQTEFORSA9IGZhbHNlO1xyXG4gICAgcHVibGljIENMSVBQTEFORTIgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBDTElQUExBTkUzID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgQ0xJUFBMQU5FNCA9IGZhbHNlO1xyXG4gICAgcHVibGljIENMSVBQTEFORTUgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBDTElQUExBTkU2ID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgQUxQSEFURVNUID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgREVQVEhQUkVQQVNTID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgUE9JTlRTSVpFID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgRk9HID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgTk9STUFMID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgVVYxID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgVVYyID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgVkVSVEVYQ09MT1IgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBWRVJURVhBTFBIQSA9IGZhbHNlO1xyXG4gICAgcHVibGljIE5VTV9CT05FX0lORkxVRU5DRVJTID0gMDtcclxuICAgIHB1YmxpYyBCb25lc1Blck1lc2ggPSAwO1xyXG4gICAgcHVibGljIElOU1RBTkNFUyA9IGZhbHNlO1xyXG4gICAgcHVibGljIElOU1RBTkNFU0NPTE9SID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgU1BFQ1VMQVJURVJNID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgTE9HQVJJVEhNSUNERVBUSCA9IGZhbHNlO1xyXG4gICAgcHVibGljIFVTRV9SRVZFUlNFX0RFUFRIQlVGRkVSID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgRlJFU05FTFNFUEFSQVRFID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgQlVNUFNVUEVSSU1QT1NFID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgQlVNUEFGRkVDVFNSRUZMRUNUSU9OID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgVVNFX1dPUkxEX0NPT1JESU5BVEVTID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIElNQUdFUFJPQ0VTU0lORyA9IGZhbHNlO1xyXG4gICAgcHVibGljIFZJR05FVFRFID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgVklHTkVUVEVCTEVORE1PREVNVUxUSVBMWSA9IGZhbHNlO1xyXG4gICAgcHVibGljIFZJR05FVFRFQkxFTkRNT0RFT1BBUVVFID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgVE9ORU1BUFBJTkcgPSAwO1xyXG4gICAgcHVibGljIENPTlRSQVNUID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgRVhQT1NVUkUgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBDT0xPUkNVUlZFUyA9IGZhbHNlO1xyXG4gICAgcHVibGljIENPTE9SR1JBRElORyA9IGZhbHNlO1xyXG4gICAgcHVibGljIENPTE9SR1JBRElORzNEID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgU0FNUExFUjNER1JFRU5ERVBUSCA9IGZhbHNlO1xyXG4gICAgcHVibGljIFNBTVBMRVIzREJHUk1BUCA9IGZhbHNlO1xyXG4gICAgcHVibGljIERJVEhFUiA9IGZhbHNlO1xyXG4gICAgcHVibGljIElNQUdFUFJPQ0VTU0lOR1BPU1RQUk9DRVNTID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgU0tJUEZJTkFMQ09MT1JDTEFNUCA9IGZhbHNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5yZWJ1aWxkKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXYXRlck1hdGVyaWFsIGV4dGVuZHMgUHVzaE1hdGVyaWFsIHtcclxuICAgIC8qXHJcbiAgICAgKiBQdWJsaWMgbWVtYmVyc1xyXG4gICAgICovXHJcbiAgICBAc2VyaWFsaXplQXNUZXh0dXJlKFwiYnVtcFRleHR1cmVcIilcclxuICAgIHByaXZhdGUgX2J1bXBUZXh0dXJlOiBCYXNlVGV4dHVyZTtcclxuICAgIEBleHBhbmRUb1Byb3BlcnR5KFwiX21hcmtBbGxTdWJNZXNoZXNBc1RleHR1cmVzRGlydHlcIilcclxuICAgIHB1YmxpYyBidW1wVGV4dHVyZTogQmFzZVRleHR1cmU7XHJcblxyXG4gICAgQHNlcmlhbGl6ZUFzQ29sb3IzKClcclxuICAgIHB1YmxpYyBkaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzKDEsIDEsIDEpO1xyXG5cclxuICAgIEBzZXJpYWxpemVBc0NvbG9yMygpXHJcbiAgICBwdWJsaWMgc3BlY3VsYXJDb2xvciA9IG5ldyBDb2xvcjMoMCwgMCwgMCk7XHJcblxyXG4gICAgQHNlcmlhbGl6ZSgpXHJcbiAgICBwdWJsaWMgc3BlY3VsYXJQb3dlciA9IDY0O1xyXG5cclxuICAgIEBzZXJpYWxpemUoXCJkaXNhYmxlTGlnaHRpbmdcIilcclxuICAgIHByaXZhdGUgX2Rpc2FibGVMaWdodGluZyA9IGZhbHNlO1xyXG4gICAgQGV4cGFuZFRvUHJvcGVydHkoXCJfbWFya0FsbFN1Yk1lc2hlc0FzTGlnaHRzRGlydHlcIilcclxuICAgIHB1YmxpYyBkaXNhYmxlTGlnaHRpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgQHNlcmlhbGl6ZShcIm1heFNpbXVsdGFuZW91c0xpZ2h0c1wiKVxyXG4gICAgcHJpdmF0ZSBfbWF4U2ltdWx0YW5lb3VzTGlnaHRzID0gNDtcclxuICAgIEBleHBhbmRUb1Byb3BlcnR5KFwiX21hcmtBbGxTdWJNZXNoZXNBc0xpZ2h0c0RpcnR5XCIpXHJcbiAgICBwdWJsaWMgbWF4U2ltdWx0YW5lb3VzTGlnaHRzOiBudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIHRoZSB3aW5kIGZvcmNlLlxyXG4gICAgICovXHJcbiAgICBAc2VyaWFsaXplKClcclxuICAgIHB1YmxpYyB3aW5kRm9yY2U6IG51bWJlciA9IDY7XHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgdGhlIGRpcmVjdGlvbiBvZiB0aGUgd2luZCBpbiB0aGUgcGxhbmUgKFgsIFopLlxyXG4gICAgICovXHJcbiAgICBAc2VyaWFsaXplQXNWZWN0b3IyKClcclxuICAgIHB1YmxpYyB3aW5kRGlyZWN0aW9uOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoMCwgMSk7XHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgdGhlIGhlaWdodCBvZiB0aGUgd2F2ZXMuXHJcbiAgICAgKi9cclxuICAgIEBzZXJpYWxpemUoKVxyXG4gICAgcHVibGljIHdhdmVIZWlnaHQ6IG51bWJlciA9IDAuNDtcclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyB0aGUgYnVtcCBoZWlnaHQgcmVsYXRlZCB0byB0aGUgYnVtcCBtYXAuXHJcbiAgICAgKi9cclxuICAgIEBzZXJpYWxpemUoKVxyXG4gICAgcHVibGljIGJ1bXBIZWlnaHQ6IG51bWJlciA9IDAuNDtcclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyB3ZXRoZXIgb3Igbm90OiB0byBhZGQgYSBzbWFsbGVyIG1vdmluZyBidW1wIHRvIGxlc3Mgc3RlYWR5IHdhdmVzLlxyXG4gICAgICovXHJcbiAgICBAc2VyaWFsaXplKFwiYnVtcFN1cGVyaW1wb3NlXCIpXHJcbiAgICBwcml2YXRlIF9idW1wU3VwZXJpbXBvc2UgPSBmYWxzZTtcclxuICAgIEBleHBhbmRUb1Byb3BlcnR5KFwiX21hcmtBbGxTdWJNZXNoZXNBc01pc2NEaXJ0eVwiKVxyXG4gICAgcHVibGljIGJ1bXBTdXBlcmltcG9zZTogYm9vbGVhbjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgd2V0aGVyIG9yIG5vdCBjb2xvciByZWZyYWN0aW9uIGFuZCByZWZsZWN0aW9uIGRpZmZlcmVudGx5IHdpdGggLndhdGVyQ29sb3IyIGFuZCAuY29sb3JCbGVuZEZhY3RvcjIuIE5vbi1saW5lYXIgKHBoeXNpY2FsbHkgY29ycmVjdCkgZnJlc25lbC5cclxuICAgICAqL1xyXG4gICAgQHNlcmlhbGl6ZShcImZyZXNuZWxTZXBhcmF0ZVwiKVxyXG4gICAgcHJpdmF0ZSBfZnJlc25lbFNlcGFyYXRlID0gZmFsc2U7XHJcbiAgICBAZXhwYW5kVG9Qcm9wZXJ0eShcIl9tYXJrQWxsU3ViTWVzaGVzQXNNaXNjRGlydHlcIilcclxuICAgIHB1YmxpYyBmcmVzbmVsU2VwYXJhdGU6IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIHdldGhlciBvciBub3QgYnVtcCBXd3ZlcyBtb2RpZnkgdGhlIHJlZmxlY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIEBzZXJpYWxpemUoXCJidW1wQWZmZWN0c1JlZmxlY3Rpb25cIilcclxuICAgIHByaXZhdGUgX2J1bXBBZmZlY3RzUmVmbGVjdGlvbiA9IGZhbHNlO1xyXG4gICAgQGV4cGFuZFRvUHJvcGVydHkoXCJfbWFya0FsbFN1Yk1lc2hlc0FzTWlzY0RpcnR5XCIpXHJcbiAgICBwdWJsaWMgYnVtcEFmZmVjdHNSZWZsZWN0aW9uOiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyB0aGUgd2F0ZXIgY29sb3IgYmxlbmRlZCB3aXRoIHRoZSByZWZyYWN0aW9uIChuZWFyKS5cclxuICAgICAqL1xyXG4gICAgQHNlcmlhbGl6ZUFzQ29sb3IzKClcclxuICAgIHB1YmxpYyB3YXRlckNvbG9yOiBDb2xvcjMgPSBuZXcgQ29sb3IzKDAuMSwgMC4xLCAwLjYpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIHRoZSBibGVuZCBmYWN0b3IgcmVsYXRlZCB0byB0aGUgd2F0ZXIgY29sb3IuXHJcbiAgICAgKi9cclxuICAgIEBzZXJpYWxpemUoKVxyXG4gICAgcHVibGljIGNvbG9yQmxlbmRGYWN0b3I6IG51bWJlciA9IDAuMjtcclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyB0aGUgd2F0ZXIgY29sb3IgYmxlbmRlZCB3aXRoIHRoZSByZWZsZWN0aW9uIChmYXIpLlxyXG4gICAgICovXHJcbiAgICBAc2VyaWFsaXplQXNDb2xvcjMoKVxyXG4gICAgcHVibGljIHdhdGVyQ29sb3IyOiBDb2xvcjMgPSBuZXcgQ29sb3IzKDAuMSwgMC4xLCAwLjYpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIHRoZSBibGVuZCBmYWN0b3IgcmVsYXRlZCB0byB0aGUgd2F0ZXIgY29sb3IgKHJlZmxlY3Rpb24sIGZhcikuXHJcbiAgICAgKi9cclxuICAgIEBzZXJpYWxpemUoKVxyXG4gICAgcHVibGljIGNvbG9yQmxlbmRGYWN0b3IyOiBudW1iZXIgPSAwLjI7XHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgdGhlIG1heGltdW0gbGVuZ3RoIG9mIGEgd2F2ZS5cclxuICAgICAqL1xyXG4gICAgQHNlcmlhbGl6ZSgpXHJcbiAgICBwdWJsaWMgd2F2ZUxlbmd0aDogbnVtYmVyID0gMC4xO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyB0aGUgd2F2ZXMgc3BlZWQuXHJcbiAgICAgKi9cclxuICAgIEBzZXJpYWxpemUoKVxyXG4gICAgcHVibGljIHdhdmVTcGVlZDogbnVtYmVyID0gMS4wO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyB0aGUgbnVtYmVyIG9mIHRpbWVzIHdhdmVzIGFyZSByZXBlYXRlZC4gVGhpcyBpcyB0eXBpY2FsbHkgdXNlZCB0byBhZGp1c3Qgd2F2ZXMgY291bnQgYWNjb3JkaW5nIHRvIHRoZSBncm91bmQncyBzaXplIHdoZXJlIHRoZSBtYXRlcmlhbCBpcyBhcHBsaWVkIG9uLlxyXG4gICAgICovXHJcbiAgICBAc2VyaWFsaXplKClcclxuICAgIHB1YmxpYyB3YXZlQ291bnQ6IG51bWJlciA9IDIwO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIG9yIGdldHMgd2hldGhlciBvciBub3QgYXV0b21hdGljIGNsaXBwaW5nIHNob3VsZCBiZSBlbmFibGVkIG9yIG5vdC4gU2V0dGluZyB0byB0cnVlIHdpbGwgc2F2ZSBwZXJmb3JtYW5jZXMgYW5kXHJcbiAgICAgKiB3aWxsIGF2b2lkIGNhbGN1bGF0aW5nIHVzZWxlc3MgcGl4ZWxzIGluIHRoZSBwaXhlbCBzaGFkZXIgb2YgdGhlIHdhdGVyIG1hdGVyaWFsLlxyXG4gICAgICovXHJcbiAgICBAc2VyaWFsaXplKClcclxuICAgIHB1YmxpYyBkaXNhYmxlQ2xpcFBsYW5lOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIHdoZXRoZXIgb3Igbm90IHRvIHVzZSB3b3JsZCBjb29yZGluYXRlcyBmb3Igd2F2ZSBkZWZvcm1hdGlvbnMuXHJcbiAgICAgKiBUaGUgZGVmYXVsdCB2YWx1ZSBpcyBmYWxzZSwgbWVhbmluZyB0aGF0IHRoZSBkZWZvcm1hdGlvbiBpcyBhcHBsaWVkIGluIG9iamVjdCAobG9jYWwpIHNwYWNlLlxyXG4gICAgICogWW91IHdpbGwgcHJvYmFibHkgbmVlZCB0byBzZXQgaXQgdG8gdHJ1ZSBpZiB5b3UgYXJlIHVzaW5nIGluc3RhbmNlcyBvciB0aGluIGluc3RhbmNlcyBmb3IgeW91ciB3YXRlciBvYmplY3RzLlxyXG4gICAgICovXHJcbiAgICBAc2VyaWFsaXplKFwidXNlV29ybGRDb29yZGluYXRlc0ZvcldhdmVEZWZvcm1hdGlvblwiKVxyXG4gICAgcHJpdmF0ZSBfdXNlV29ybGRDb29yZGluYXRlc0ZvcldhdmVEZWZvcm1hdGlvbiA9IGZhbHNlO1xyXG4gICAgQGV4cGFuZFRvUHJvcGVydHkoXCJfbWFya0FsbFN1Yk1lc2hlc0FzTWlzY0RpcnR5XCIpXHJcbiAgICBwdWJsaWMgdXNlV29ybGRDb29yZGluYXRlc0ZvcldhdmVEZWZvcm1hdGlvbjogYm9vbGVhbjtcclxuXHJcbiAgICBwcm90ZWN0ZWQgX3JlbmRlclRhcmdldHMgPSBuZXcgU21hcnRBcnJheTxSZW5kZXJUYXJnZXRUZXh0dXJlPigxNik7XHJcblxyXG4gICAgLypcclxuICAgICAqIFByaXZhdGUgbWVtYmVyc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9tZXNoOiBOdWxsYWJsZTxBYnN0cmFjdE1lc2g+ID0gbnVsbDtcclxuXHJcbiAgICBwcml2YXRlIF9yZWZyYWN0aW9uUlRUOiBOdWxsYWJsZTxSZW5kZXJUYXJnZXRUZXh0dXJlPjtcclxuICAgIHByaXZhdGUgX3JlZmxlY3Rpb25SVFQ6IE51bGxhYmxlPFJlbmRlclRhcmdldFRleHR1cmU+O1xyXG5cclxuICAgIHByaXZhdGUgX3JlZmxlY3Rpb25UcmFuc2Zvcm06IE1hdHJpeCA9IE1hdHJpeC5aZXJvKCk7XHJcbiAgICBwcml2YXRlIF9sYXN0VGltZTogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgX2xhc3REZWx0YVRpbWU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHJpdmF0ZSBfd2FpdGluZ1JlbmRlckxpc3Q6IE51bGxhYmxlPHN0cmluZ1tdPjtcclxuXHJcbiAgICBwcml2YXRlIF9pbWFnZVByb2Nlc3NpbmdDb25maWd1cmF0aW9uOiBOdWxsYWJsZTxJbWFnZVByb2Nlc3NpbmdDb25maWd1cmF0aW9uPjtcclxuICAgIHByaXZhdGUgX2ltYWdlUHJvY2Vzc2luZ09ic2VydmVyOiBOdWxsYWJsZTxPYnNlcnZlcjxJbWFnZVByb2Nlc3NpbmdDb25maWd1cmF0aW9uPj47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHRoYXQgY3VycmVudCBtYXRlcmlhbCBuZWVkcyB0byByZWdpc3RlciBSVFRcclxuICAgICAqL1xyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldCBoYXNSZW5kZXJUYXJnZXRUZXh0dXJlcygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICogQHBhcmFtIHNjZW5lXHJcbiAgICAgKiBAcGFyYW0gcmVuZGVyVGFyZ2V0U2l6ZVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2NlbmU/OiBTY2VuZSxcclxuICAgICAgICBwdWJsaWMgcmVuZGVyVGFyZ2V0U2l6ZTogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKDUxMiwgNTEyKVxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIobmFtZSwgc2NlbmUpO1xyXG5cclxuICAgICAgICB0aGlzLl9jcmVhdGVSZW5kZXJUYXJnZXRzKHRoaXMuZ2V0U2NlbmUoKSwgcmVuZGVyVGFyZ2V0U2l6ZSk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSByZW5kZXIgdGFyZ2V0c1xyXG4gICAgICAgIHRoaXMuZ2V0UmVuZGVyVGFyZ2V0VGV4dHVyZXMgPSAoKTogU21hcnRBcnJheTxSZW5kZXJUYXJnZXRUZXh0dXJlPiA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclRhcmdldHMucmVzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVGFyZ2V0cy5wdXNoKDxSZW5kZXJUYXJnZXRUZXh0dXJlPnRoaXMuX3JlZmxlY3Rpb25SVFQpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUYXJnZXRzLnB1c2goPFJlbmRlclRhcmdldFRleHR1cmU+dGhpcy5fcmVmcmFjdGlvblJUVCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVuZGVyVGFyZ2V0cztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLl9pbWFnZVByb2Nlc3NpbmdDb25maWd1cmF0aW9uID0gdGhpcy5nZXRTY2VuZSgpLmltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb247XHJcbiAgICAgICAgaWYgKHRoaXMuX2ltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5faW1hZ2VQcm9jZXNzaW5nT2JzZXJ2ZXIgPSB0aGlzLl9pbWFnZVByb2Nlc3NpbmdDb25maWd1cmF0aW9uLm9uVXBkYXRlUGFyYW1ldGVycy5hZGQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFya0FsbFN1Yk1lc2hlc0FzSW1hZ2VQcm9jZXNzaW5nRGlydHkoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEdldCAvIFNldFxyXG4gICAgcHVibGljIGdldCByZWZyYWN0aW9uVGV4dHVyZSgpOiBOdWxsYWJsZTxSZW5kZXJUYXJnZXRUZXh0dXJlPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZnJhY3Rpb25SVFQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCByZWZsZWN0aW9uVGV4dHVyZSgpOiBOdWxsYWJsZTxSZW5kZXJUYXJnZXRUZXh0dXJlPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmxlY3Rpb25SVFQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWV0aG9kc1xyXG4gICAgcHVibGljIGFkZFRvUmVuZGVyTGlzdChub2RlOiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fcmVmcmFjdGlvblJUVCAmJiB0aGlzLl9yZWZyYWN0aW9uUlRULnJlbmRlckxpc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVmcmFjdGlvblJUVC5yZW5kZXJMaXN0LnB1c2gobm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fcmVmbGVjdGlvblJUVCAmJiB0aGlzLl9yZWZsZWN0aW9uUlRULnJlbmRlckxpc3QpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVmbGVjdGlvblJUVC5yZW5kZXJMaXN0LnB1c2gobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVGcm9tUmVuZGVyTGlzdChub2RlOiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5fcmVmcmFjdGlvblJUVCAmJiB0aGlzLl9yZWZyYWN0aW9uUlRULnJlbmRlckxpc3QpIHtcclxuICAgICAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5fcmVmcmFjdGlvblJUVC5yZW5kZXJMaXN0LmluZGV4T2Yobm9kZSk7XHJcbiAgICAgICAgICAgIGlmIChpZHggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZyYWN0aW9uUlRULnJlbmRlckxpc3Quc3BsaWNlKGlkeCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9yZWZsZWN0aW9uUlRUICYmIHRoaXMuX3JlZmxlY3Rpb25SVFQucmVuZGVyTGlzdCkge1xyXG4gICAgICAgICAgICBjb25zdCBpZHggPSB0aGlzLl9yZWZsZWN0aW9uUlRULnJlbmRlckxpc3QuaW5kZXhPZihub2RlKTtcclxuICAgICAgICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZmxlY3Rpb25SVFQucmVuZGVyTGlzdC5zcGxpY2UoaWR4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZW5hYmxlUmVuZGVyVGFyZ2V0cyhlbmFibGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCByZWZyZXNoUmF0ZSA9IGVuYWJsZSA/IDEgOiAwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fcmVmcmFjdGlvblJUVCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyYWN0aW9uUlRULnJlZnJlc2hSYXRlID0gcmVmcmVzaFJhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fcmVmbGVjdGlvblJUVCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZsZWN0aW9uUlRULnJlZnJlc2hSYXRlID0gcmVmcmVzaFJhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRSZW5kZXJMaXN0KCk6IE51bGxhYmxlPEFic3RyYWN0TWVzaFtdPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZnJhY3Rpb25SVFQgPyB0aGlzLl9yZWZyYWN0aW9uUlRULnJlbmRlckxpc3QgOiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHJlbmRlclRhcmdldHNFbmFibGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhKHRoaXMuX3JlZnJhY3Rpb25SVFQgJiYgdGhpcy5fcmVmcmFjdGlvblJUVC5yZWZyZXNoUmF0ZSA9PT0gMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIG5lZWRBbHBoYUJsZW5kaW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhIDwgMS4wO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBuZWVkQWxwaGFUZXN0aW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0QWxwaGFUZXN0VGV4dHVyZSgpOiBOdWxsYWJsZTxCYXNlVGV4dHVyZT4ge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBpc1JlYWR5Rm9yU3ViTWVzaChtZXNoOiBBYnN0cmFjdE1lc2gsIHN1Yk1lc2g6IFN1Yk1lc2gsIHVzZUluc3RhbmNlcz86IGJvb2xlYW4pOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBkcmF3V3JhcHBlciA9IHN1Yk1lc2guX2RyYXdXcmFwcGVyO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0Zyb3plbikge1xyXG4gICAgICAgICAgICBpZiAoZHJhd1dyYXBwZXIuZWZmZWN0ICYmIGRyYXdXcmFwcGVyLl93YXNQcmV2aW91c2x5UmVhZHkgJiYgZHJhd1dyYXBwZXIuX3dhc1ByZXZpb3VzbHlVc2luZ0luc3RhbmNlcyA9PT0gdXNlSW5zdGFuY2VzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzdWJNZXNoLm1hdGVyaWFsRGVmaW5lcykge1xyXG4gICAgICAgICAgICBzdWJNZXNoLm1hdGVyaWFsRGVmaW5lcyA9IG5ldyBXYXRlck1hdGVyaWFsRGVmaW5lcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGVmaW5lcyA9IDxXYXRlck1hdGVyaWFsRGVmaW5lcz5zdWJNZXNoLm1hdGVyaWFsRGVmaW5lcztcclxuICAgICAgICBjb25zdCBzY2VuZSA9IHRoaXMuZ2V0U2NlbmUoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVhZHlGb3JTdWJNZXNoKHN1Yk1lc2gpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZW5naW5lID0gc2NlbmUuZ2V0RW5naW5lKCk7XHJcblxyXG4gICAgICAgIC8vIFRleHR1cmVzXHJcbiAgICAgICAgaWYgKGRlZmluZXMuX2FyZVRleHR1cmVzRGlydHkpIHtcclxuICAgICAgICAgICAgZGVmaW5lcy5fbmVlZFVWcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoc2NlbmUudGV4dHVyZXNFbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idW1wVGV4dHVyZSAmJiBNYXRlcmlhbEZsYWdzLkJ1bXBUZXh0dXJlRW5hYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5idW1wVGV4dHVyZS5pc1JlYWR5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZXMuX25lZWRVVnMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVzLkJVTVAgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0ZXJpYWxGbGFncy5SZWZsZWN0aW9uVGV4dHVyZUVuYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZpbmVzLlJFRkxFQ1RJT04gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBQcmVwYXJlRGVmaW5lc0ZvckZyYW1lQm91bmRWYWx1ZXMoc2NlbmUsIGVuZ2luZSwgdGhpcywgZGVmaW5lcywgdXNlSW5zdGFuY2VzID8gdHJ1ZSA6IGZhbHNlKTtcclxuXHJcbiAgICAgICAgUHJlcGFyZURlZmluZXNGb3JNaXNjKG1lc2gsIHNjZW5lLCB0aGlzLl91c2VMb2dhcml0aG1pY0RlcHRoLCB0aGlzLnBvaW50c0Nsb3VkLCB0aGlzLmZvZ0VuYWJsZWQsIHRoaXMuX3Nob3VsZFR1cm5BbHBoYVRlc3RPbihtZXNoKSwgZGVmaW5lcyk7XHJcblxyXG4gICAgICAgIGlmIChkZWZpbmVzLl9hcmVNaXNjRGlydHkpIHtcclxuICAgICAgICAgICAgZGVmaW5lcy5GUkVTTkVMU0VQQVJBVEUgPSB0aGlzLl9mcmVzbmVsU2VwYXJhdGU7XHJcbiAgICAgICAgICAgIGRlZmluZXMuQlVNUFNVUEVSSU1QT1NFID0gdGhpcy5fYnVtcFN1cGVyaW1wb3NlO1xyXG4gICAgICAgICAgICBkZWZpbmVzLkJVTVBBRkZFQ1RTUkVGTEVDVElPTiA9IHRoaXMuX2J1bXBBZmZlY3RzUmVmbGVjdGlvbjtcclxuICAgICAgICAgICAgZGVmaW5lcy5VU0VfV09STERfQ09PUkRJTkFURVMgPSB0aGlzLl91c2VXb3JsZENvb3JkaW5hdGVzRm9yV2F2ZURlZm9ybWF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTGlnaHRzXHJcbiAgICAgICAgZGVmaW5lcy5fbmVlZE5vcm1hbHMgPSBQcmVwYXJlRGVmaW5lc0ZvckxpZ2h0cyhzY2VuZSwgbWVzaCwgZGVmaW5lcywgdHJ1ZSwgdGhpcy5fbWF4U2ltdWx0YW5lb3VzTGlnaHRzLCB0aGlzLl9kaXNhYmxlTGlnaHRpbmcpO1xyXG5cclxuICAgICAgICAvLyBJbWFnZSBwcm9jZXNzaW5nXHJcbiAgICAgICAgaWYgKGRlZmluZXMuX2FyZUltYWdlUHJvY2Vzc2luZ0RpcnR5ICYmIHRoaXMuX2ltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24pIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9pbWFnZVByb2Nlc3NpbmdDb25maWd1cmF0aW9uLmlzUmVhZHkoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9pbWFnZVByb2Nlc3NpbmdDb25maWd1cmF0aW9uLnByZXBhcmVEZWZpbmVzKGRlZmluZXMpO1xyXG5cclxuICAgICAgICAgICAgZGVmaW5lcy5JU19SRUZMRUNUSU9OX0xJTkVBUiA9IHRoaXMucmVmbGVjdGlvblRleHR1cmUgIT0gbnVsbCAmJiAhdGhpcy5yZWZsZWN0aW9uVGV4dHVyZS5nYW1tYVNwYWNlO1xyXG4gICAgICAgICAgICBkZWZpbmVzLklTX1JFRlJBQ1RJT05fTElORUFSID0gdGhpcy5yZWZyYWN0aW9uVGV4dHVyZSAhPSBudWxsICYmICF0aGlzLnJlZnJhY3Rpb25UZXh0dXJlLmdhbW1hU3BhY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBdHRyaWJzXHJcbiAgICAgICAgUHJlcGFyZURlZmluZXNGb3JBdHRyaWJ1dGVzKG1lc2gsIGRlZmluZXMsIHRydWUsIHRydWUpO1xyXG5cclxuICAgICAgICAvLyBDb25maWd1cmUgdGhpc1xyXG4gICAgICAgIHRoaXMuX21lc2ggPSBtZXNoO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fd2FpdGluZ1JlbmRlckxpc3QpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl93YWl0aW5nUmVuZGVyTGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRUb1JlbmRlckxpc3Qoc2NlbmUuZ2V0Tm9kZUJ5SWQodGhpcy5fd2FpdGluZ1JlbmRlckxpc3RbaV0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fd2FpdGluZ1JlbmRlckxpc3QgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2V0IGNvcnJlY3QgZWZmZWN0XHJcbiAgICAgICAgaWYgKGRlZmluZXMuaXNEaXJ0eSkge1xyXG4gICAgICAgICAgICBkZWZpbmVzLm1hcmtBc1Byb2Nlc3NlZCgpO1xyXG4gICAgICAgICAgICBzY2VuZS5yZXNldENhY2hlZE1hdGVyaWFsKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBGYWxsYmFja3NcclxuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2tzID0gbmV3IEVmZmVjdEZhbGxiYWNrcygpO1xyXG4gICAgICAgICAgICBpZiAoZGVmaW5lcy5GT0cpIHtcclxuICAgICAgICAgICAgICAgIGZhbGxiYWNrcy5hZGRGYWxsYmFjaygxLCBcIkZPR1wiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGRlZmluZXMuTE9HQVJJVEhNSUNERVBUSCkge1xyXG4gICAgICAgICAgICAgICAgZmFsbGJhY2tzLmFkZEZhbGxiYWNrKDAsIFwiTE9HQVJJVEhNSUNERVBUSFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgSGFuZGxlRmFsbGJhY2tzRm9yU2hhZG93cyhkZWZpbmVzLCBmYWxsYmFja3MsIHRoaXMubWF4U2ltdWx0YW5lb3VzTGlnaHRzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZWZpbmVzLk5VTV9CT05FX0lORkxVRU5DRVJTID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZmFsbGJhY2tzLmFkZENQVVNraW5uaW5nRmFsbGJhY2soMCwgbWVzaCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vQXR0cmlidXRlc1xyXG4gICAgICAgICAgICBjb25zdCBhdHRyaWJzID0gW1ZlcnRleEJ1ZmZlci5Qb3NpdGlvbktpbmRdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlZmluZXMuTk9STUFMKSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJzLnB1c2goVmVydGV4QnVmZmVyLk5vcm1hbEtpbmQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVmaW5lcy5VVjEpIHtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnMucHVzaChWZXJ0ZXhCdWZmZXIuVVZLaW5kKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGRlZmluZXMuVVYyKSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJzLnB1c2goVmVydGV4QnVmZmVyLlVWMktpbmQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVmaW5lcy5WRVJURVhDT0xPUikge1xyXG4gICAgICAgICAgICAgICAgYXR0cmlicy5wdXNoKFZlcnRleEJ1ZmZlci5Db2xvcktpbmQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBQcmVwYXJlQXR0cmlidXRlc0ZvckJvbmVzKGF0dHJpYnMsIG1lc2gsIGRlZmluZXMsIGZhbGxiYWNrcyk7XHJcbiAgICAgICAgICAgIFByZXBhcmVBdHRyaWJ1dGVzRm9ySW5zdGFuY2VzKGF0dHJpYnMsIGRlZmluZXMpO1xyXG5cclxuICAgICAgICAgICAgLy8gTGVnYWN5IGJyb3dzZXIgcGF0Y2hcclxuICAgICAgICAgICAgY29uc3Qgc2hhZGVyTmFtZSA9IFwid2F0ZXJcIjtcclxuICAgICAgICAgICAgY29uc3Qgam9pbiA9IGRlZmluZXMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY29uc3QgdW5pZm9ybXMgPSBbXHJcbiAgICAgICAgICAgICAgICBcIndvcmxkXCIsXHJcbiAgICAgICAgICAgICAgICBcInZpZXdcIixcclxuICAgICAgICAgICAgICAgIFwidmlld1Byb2plY3Rpb25cIixcclxuICAgICAgICAgICAgICAgIFwidkV5ZVBvc2l0aW9uXCIsXHJcbiAgICAgICAgICAgICAgICBcInZMaWdodHNUeXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcInZEaWZmdXNlQ29sb3JcIixcclxuICAgICAgICAgICAgICAgIFwidlNwZWN1bGFyQ29sb3JcIixcclxuICAgICAgICAgICAgICAgIFwidkZvZ0luZm9zXCIsXHJcbiAgICAgICAgICAgICAgICBcInZGb2dDb2xvclwiLFxyXG4gICAgICAgICAgICAgICAgXCJwb2ludFNpemVcIixcclxuICAgICAgICAgICAgICAgIFwidk5vcm1hbEluZm9zXCIsXHJcbiAgICAgICAgICAgICAgICBcIm1Cb25lc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJub3JtYWxNYXRyaXhcIixcclxuICAgICAgICAgICAgICAgIFwibG9nYXJpdGhtaWNEZXB0aENvbnN0YW50XCIsXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gV2F0ZXJcclxuICAgICAgICAgICAgICAgIFwicmVmbGVjdGlvblZpZXdQcm9qZWN0aW9uXCIsXHJcbiAgICAgICAgICAgICAgICBcIndpbmREaXJlY3Rpb25cIixcclxuICAgICAgICAgICAgICAgIFwid2F2ZUxlbmd0aFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ0aW1lXCIsXHJcbiAgICAgICAgICAgICAgICBcIndpbmRGb3JjZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJjYW1lcmFQb3NpdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgXCJidW1wSGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICBcIndhdmVIZWlnaHRcIixcclxuICAgICAgICAgICAgICAgIFwid2F0ZXJDb2xvclwiLFxyXG4gICAgICAgICAgICAgICAgXCJ3YXRlckNvbG9yMlwiLFxyXG4gICAgICAgICAgICAgICAgXCJjb2xvckJsZW5kRmFjdG9yXCIsXHJcbiAgICAgICAgICAgICAgICBcImNvbG9yQmxlbmRGYWN0b3IyXCIsXHJcbiAgICAgICAgICAgICAgICBcIndhdmVTcGVlZFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ3YXZlQ291bnRcIixcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgY29uc3Qgc2FtcGxlcnMgPSBbXHJcbiAgICAgICAgICAgICAgICBcIm5vcm1hbFNhbXBsZXJcIixcclxuICAgICAgICAgICAgICAgIC8vIFdhdGVyXHJcbiAgICAgICAgICAgICAgICBcInJlZnJhY3Rpb25TYW1wbGVyXCIsXHJcbiAgICAgICAgICAgICAgICBcInJlZmxlY3Rpb25TYW1wbGVyXCIsXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1CdWZmZXJzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgaWYgKEltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIEltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24uUHJlcGFyZVVuaWZvcm1zKHVuaWZvcm1zLCBkZWZpbmVzKTtcclxuICAgICAgICAgICAgICAgIEltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24uUHJlcGFyZVNhbXBsZXJzKHNhbXBsZXJzLCBkZWZpbmVzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYWRkQ2xpcFBsYW5lVW5pZm9ybXModW5pZm9ybXMpO1xyXG5cclxuICAgICAgICAgICAgUHJlcGFyZVVuaWZvcm1zQW5kU2FtcGxlcnNMaXN0KDxJRWZmZWN0Q3JlYXRpb25PcHRpb25zPntcclxuICAgICAgICAgICAgICAgIHVuaWZvcm1zTmFtZXM6IHVuaWZvcm1zLFxyXG4gICAgICAgICAgICAgICAgdW5pZm9ybUJ1ZmZlcnNOYW1lczogdW5pZm9ybUJ1ZmZlcnMsXHJcbiAgICAgICAgICAgICAgICBzYW1wbGVyczogc2FtcGxlcnMsXHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzOiBkZWZpbmVzLFxyXG4gICAgICAgICAgICAgICAgbWF4U2ltdWx0YW5lb3VzTGlnaHRzOiB0aGlzLm1heFNpbXVsdGFuZW91c0xpZ2h0cyxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHN1Yk1lc2guc2V0RWZmZWN0KFxyXG4gICAgICAgICAgICAgICAgc2NlbmUuZ2V0RW5naW5lKCkuY3JlYXRlRWZmZWN0KFxyXG4gICAgICAgICAgICAgICAgICAgIHNoYWRlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgPElFZmZlY3RDcmVhdGlvbk9wdGlvbnM+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmlmb3Jtc05hbWVzOiB1bmlmb3JtcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pZm9ybUJ1ZmZlcnNOYW1lczogdW5pZm9ybUJ1ZmZlcnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZXJzOiBzYW1wbGVycyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lczogam9pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGJhY2tzOiBmYWxsYmFja3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ29tcGlsZWQ6IHRoaXMub25Db21waWxlZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcjogdGhpcy5vbkVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleFBhcmFtZXRlcnM6IHsgbWF4U2ltdWx0YW5lb3VzTGlnaHRzOiB0aGlzLl9tYXhTaW11bHRhbmVvdXNMaWdodHMgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZ2luZVxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIGRlZmluZXMsXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXRlcmlhbENvbnRleHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzdWJNZXNoLmVmZmVjdCB8fCAhc3ViTWVzaC5lZmZlY3QuaXNSZWFkeSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRlZmluZXMuX3JlbmRlcklkID0gc2NlbmUuZ2V0UmVuZGVySWQoKTtcclxuICAgICAgICBkcmF3V3JhcHBlci5fd2FzUHJldmlvdXNseVJlYWR5ID0gdHJ1ZTtcclxuICAgICAgICBkcmF3V3JhcHBlci5fd2FzUHJldmlvdXNseVVzaW5nSW5zdGFuY2VzID0gISF1c2VJbnN0YW5jZXM7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBiaW5kRm9yU3ViTWVzaCh3b3JsZDogTWF0cml4LCBtZXNoOiBNZXNoLCBzdWJNZXNoOiBTdWJNZXNoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc2NlbmUgPSB0aGlzLmdldFNjZW5lKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRlZmluZXMgPSA8V2F0ZXJNYXRlcmlhbERlZmluZXM+c3ViTWVzaC5tYXRlcmlhbERlZmluZXM7XHJcbiAgICAgICAgaWYgKCFkZWZpbmVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVmZmVjdCA9IHN1Yk1lc2guZWZmZWN0O1xyXG4gICAgICAgIGlmICghZWZmZWN0IHx8ICF0aGlzLl9tZXNoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0ID0gZWZmZWN0O1xyXG5cclxuICAgICAgICAvLyBNYXRyaWNlc1xyXG4gICAgICAgIHRoaXMuYmluZE9ubHlXb3JsZE1hdHJpeCh3b3JsZCk7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldE1hdHJpeChcInZpZXdQcm9qZWN0aW9uXCIsIHNjZW5lLmdldFRyYW5zZm9ybU1hdHJpeCgpKTtcclxuXHJcbiAgICAgICAgLy8gQm9uZXNcclxuICAgICAgICBCaW5kQm9uZXNQYXJhbWV0ZXJzKG1lc2gsIHRoaXMuX2FjdGl2ZUVmZmVjdCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9tdXN0UmViaW5kKHNjZW5lLCBlZmZlY3QsIHN1Yk1lc2gpKSB7XHJcbiAgICAgICAgICAgIC8vIFRleHR1cmVzXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1bXBUZXh0dXJlICYmIE1hdGVyaWFsRmxhZ3MuQnVtcFRleHR1cmVFbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0VGV4dHVyZShcIm5vcm1hbFNhbXBsZXJcIiwgdGhpcy5idW1wVGV4dHVyZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldEZsb2F0MihcInZOb3JtYWxJbmZvc1wiLCB0aGlzLmJ1bXBUZXh0dXJlLmNvb3JkaW5hdGVzSW5kZXgsIHRoaXMuYnVtcFRleHR1cmUubGV2ZWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldE1hdHJpeChcIm5vcm1hbE1hdHJpeFwiLCB0aGlzLmJ1bXBUZXh0dXJlLmdldFRleHR1cmVNYXRyaXgoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQ2xpcCBwbGFuZVxyXG4gICAgICAgICAgICBiaW5kQ2xpcFBsYW5lKGVmZmVjdCwgdGhpcywgc2NlbmUpO1xyXG5cclxuICAgICAgICAgICAgLy8gUG9pbnQgc2l6ZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5wb2ludHNDbG91ZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldEZsb2F0KFwicG9pbnRTaXplXCIsIHRoaXMucG9pbnRTaXplKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTG9nLiBkZXB0aFxyXG4gICAgICAgICAgICBpZiAodGhpcy5fdXNlTG9nYXJpdGhtaWNEZXB0aCkge1xyXG4gICAgICAgICAgICAgICAgQmluZExvZ0RlcHRoKGRlZmluZXMsIGVmZmVjdCwgc2NlbmUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzY2VuZS5iaW5kRXllUG9zaXRpb24oZWZmZWN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2ZUVmZmVjdC5zZXRDb2xvcjQoXCJ2RGlmZnVzZUNvbG9yXCIsIHRoaXMuZGlmZnVzZUNvbG9yLCB0aGlzLmFscGhhICogbWVzaC52aXNpYmlsaXR5KTtcclxuXHJcbiAgICAgICAgaWYgKGRlZmluZXMuU1BFQ1VMQVJURVJNKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FjdGl2ZUVmZmVjdC5zZXRDb2xvcjQoXCJ2U3BlY3VsYXJDb2xvclwiLCB0aGlzLnNwZWN1bGFyQ29sb3IsIHRoaXMuc3BlY3VsYXJQb3dlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc2NlbmUubGlnaHRzRW5hYmxlZCAmJiAhdGhpcy5kaXNhYmxlTGlnaHRpbmcpIHtcclxuICAgICAgICAgICAgQmluZExpZ2h0cyhzY2VuZSwgbWVzaCwgdGhpcy5fYWN0aXZlRWZmZWN0LCBkZWZpbmVzLCB0aGlzLm1heFNpbXVsdGFuZW91c0xpZ2h0cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBWaWV3XHJcbiAgICAgICAgaWYgKHNjZW5lLmZvZ0VuYWJsZWQgJiYgbWVzaC5hcHBseUZvZyAmJiBzY2VuZS5mb2dNb2RlICE9PSBTY2VuZS5GT0dNT0RFX05PTkUpIHtcclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldE1hdHJpeChcInZpZXdcIiwgc2NlbmUuZ2V0Vmlld01hdHJpeCgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEZvZ1xyXG4gICAgICAgIEJpbmRGb2dQYXJhbWV0ZXJzKHNjZW5lLCBtZXNoLCB0aGlzLl9hY3RpdmVFZmZlY3QpO1xyXG5cclxuICAgICAgICAvLyBMb2cuIGRlcHRoXHJcbiAgICAgICAgQmluZExvZ0RlcHRoKGRlZmluZXMsIHRoaXMuX2FjdGl2ZUVmZmVjdCwgc2NlbmUpO1xyXG5cclxuICAgICAgICAvLyBXYXRlclxyXG4gICAgICAgIGlmIChNYXRlcmlhbEZsYWdzLlJlZmxlY3Rpb25UZXh0dXJlRW5hYmxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0VGV4dHVyZShcInJlZnJhY3Rpb25TYW1wbGVyXCIsIHRoaXMuX3JlZnJhY3Rpb25SVFQpO1xyXG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0VGV4dHVyZShcInJlZmxlY3Rpb25TYW1wbGVyXCIsIHRoaXMuX3JlZmxlY3Rpb25SVFQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgd3J2cCA9IHRoaXMuX3JlZmxlY3Rpb25UcmFuc2Zvcm0ubXVsdGlwbHkoc2NlbmUuZ2V0UHJvamVjdGlvbk1hdHJpeCgpKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGRlbHRhIHRpbWUuIFByZXZlbnQgYWRkaW5nIGRlbHRhIHRpbWUgaWYgaXQgaGFzbid0IGNoYW5nZWQuXHJcbiAgICAgICAgY29uc3QgZGVsdGFUaW1lID0gc2NlbmUuZ2V0RW5naW5lKCkuZ2V0RGVsdGFUaW1lKCk7XHJcbiAgICAgICAgaWYgKGRlbHRhVGltZSAhPT0gdGhpcy5fbGFzdERlbHRhVGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sYXN0RGVsdGFUaW1lID0gZGVsdGFUaW1lO1xyXG4gICAgICAgICAgICB0aGlzLl9sYXN0VGltZSArPSB0aGlzLl9sYXN0RGVsdGFUaW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldE1hdHJpeChcInJlZmxlY3Rpb25WaWV3UHJvamVjdGlvblwiLCB3cnZwKTtcclxuICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0VmVjdG9yMihcIndpbmREaXJlY3Rpb25cIiwgdGhpcy53aW5kRGlyZWN0aW9uKTtcclxuICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0RmxvYXQoXCJ3YXZlTGVuZ3RoXCIsIHRoaXMud2F2ZUxlbmd0aCk7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldEZsb2F0KFwidGltZVwiLCB0aGlzLl9sYXN0VGltZSAvIDEwMDAwMCk7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldEZsb2F0KFwid2luZEZvcmNlXCIsIHRoaXMud2luZEZvcmNlKTtcclxuICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0RmxvYXQoXCJ3YXZlSGVpZ2h0XCIsIHRoaXMud2F2ZUhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldEZsb2F0KFwiYnVtcEhlaWdodFwiLCB0aGlzLmJ1bXBIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuX2FjdGl2ZUVmZmVjdC5zZXRDb2xvcjQoXCJ3YXRlckNvbG9yXCIsIHRoaXMud2F0ZXJDb2xvciwgMS4wKTtcclxuICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0RmxvYXQoXCJjb2xvckJsZW5kRmFjdG9yXCIsIHRoaXMuY29sb3JCbGVuZEZhY3Rvcik7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldENvbG9yNChcIndhdGVyQ29sb3IyXCIsIHRoaXMud2F0ZXJDb2xvcjIsIDEuMCk7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldEZsb2F0KFwiY29sb3JCbGVuZEZhY3RvcjJcIiwgdGhpcy5jb2xvckJsZW5kRmFjdG9yMik7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0LnNldEZsb2F0KFwid2F2ZVNwZWVkXCIsIHRoaXMud2F2ZVNwZWVkKTtcclxuICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3Quc2V0RmxvYXQoXCJ3YXZlQ291bnRcIiwgdGhpcy53YXZlQ291bnQpO1xyXG5cclxuICAgICAgICAvLyBpbWFnZSBwcm9jZXNzaW5nXHJcbiAgICAgICAgaWYgKHRoaXMuX2ltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24gJiYgIXRoaXMuX2ltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24uYXBwbHlCeVBvc3RQcm9jZXNzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24uYmluZCh0aGlzLl9hY3RpdmVFZmZlY3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fYWZ0ZXJCaW5kKG1lc2gsIHRoaXMuX2FjdGl2ZUVmZmVjdCwgc3ViTWVzaCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlUmVuZGVyVGFyZ2V0cyhzY2VuZTogU2NlbmUsIHJlbmRlclRhcmdldFNpemU6IFZlY3RvcjIpOiB2b2lkIHtcclxuICAgICAgICAvLyBSZW5kZXIgdGFyZ2V0c1xyXG4gICAgICAgIHRoaXMuX3JlZnJhY3Rpb25SVFQgPSBuZXcgUmVuZGVyVGFyZ2V0VGV4dHVyZShuYW1lICsgXCJfcmVmcmFjdGlvblwiLCB7IHdpZHRoOiByZW5kZXJUYXJnZXRTaXplLngsIGhlaWdodDogcmVuZGVyVGFyZ2V0U2l6ZS55IH0sIHNjZW5lLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5fcmVmcmFjdGlvblJUVC53cmFwVSA9IENvbnN0YW50cy5URVhUVVJFX01JUlJPUl9BRERSRVNTTU9ERTtcclxuICAgICAgICB0aGlzLl9yZWZyYWN0aW9uUlRULndyYXBWID0gQ29uc3RhbnRzLlRFWFRVUkVfTUlSUk9SX0FERFJFU1NNT0RFO1xyXG4gICAgICAgIHRoaXMuX3JlZnJhY3Rpb25SVFQuaWdub3JlQ2FtZXJhVmlld3BvcnQgPSB0cnVlO1xyXG5cclxuICAgICAgICBsZXQgYm91bmRpbmdCb3hSZW5kZXJlckVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9yZWZyYWN0aW9uUlRULm9uQmVmb3JlUmVuZGVyT2JzZXJ2YWJsZS5hZGQoKCkgPT4ge1xyXG4gICAgICAgICAgICBib3VuZGluZ0JveFJlbmRlcmVyRW5hYmxlZCA9IHNjZW5lLmdldEJvdW5kaW5nQm94UmVuZGVyZXIoKS5lbmFibGVkO1xyXG4gICAgICAgICAgICBzY2VuZS5nZXRCb3VuZGluZ0JveFJlbmRlcmVyKCkuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3JlZnJhY3Rpb25SVFQub25BZnRlclJlbmRlck9ic2VydmFibGUuYWRkKCgpID0+IHtcclxuICAgICAgICAgICAgc2NlbmUuZ2V0Qm91bmRpbmdCb3hSZW5kZXJlcigpLmVuYWJsZWQgPSBib3VuZGluZ0JveFJlbmRlcmVyRW5hYmxlZDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVmbGVjdGlvblJUVCA9IG5ldyBSZW5kZXJUYXJnZXRUZXh0dXJlKG5hbWUgKyBcIl9yZWZsZWN0aW9uXCIsIHsgd2lkdGg6IHJlbmRlclRhcmdldFNpemUueCwgaGVpZ2h0OiByZW5kZXJUYXJnZXRTaXplLnkgfSwgc2NlbmUsIGZhbHNlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLl9yZWZsZWN0aW9uUlRULndyYXBVID0gQ29uc3RhbnRzLlRFWFRVUkVfTUlSUk9SX0FERFJFU1NNT0RFO1xyXG4gICAgICAgIHRoaXMuX3JlZmxlY3Rpb25SVFQud3JhcFYgPSBDb25zdGFudHMuVEVYVFVSRV9NSVJST1JfQUREUkVTU01PREU7XHJcbiAgICAgICAgdGhpcy5fcmVmbGVjdGlvblJUVC5pZ25vcmVDYW1lcmFWaWV3cG9ydCA9IHRydWU7XHJcblxyXG4gICAgICAgIGxldCBpc1Zpc2libGU6IGJvb2xlYW47XHJcbiAgICAgICAgbGV0IGNsaXBQbGFuZTogTnVsbGFibGU8UGxhbmU+ID0gbnVsbDtcclxuICAgICAgICBsZXQgc2F2ZWRWaWV3TWF0cml4OiBNYXRyaXg7XHJcbiAgICAgICAgY29uc3QgbWlycm9yTWF0cml4ID0gTWF0cml4Llplcm8oKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVmcmFjdGlvblJUVC5vbkJlZm9yZVJlbmRlciA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX21lc2gpIHtcclxuICAgICAgICAgICAgICAgIGlzVmlzaWJsZSA9IHRoaXMuX21lc2guaXNWaXNpYmxlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWVzaC5pc1Zpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ2xpcCBwbGFuZVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZUNsaXBQbGFuZSkge1xyXG4gICAgICAgICAgICAgICAgY2xpcFBsYW5lID0gc2NlbmUuY2xpcFBsYW5lO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9ueSA9IHRoaXMuX21lc2ggPyB0aGlzLl9tZXNoLmFic29sdXRlUG9zaXRpb24ueSA6IDAuMDtcclxuICAgICAgICAgICAgICAgIHNjZW5lLmNsaXBQbGFuZSA9IFBsYW5lLkZyb21Qb3NpdGlvbkFuZE5vcm1hbChuZXcgVmVjdG9yMygwLCBwb3NpdGlvbnkgKyAwLjA1LCAwKSwgbmV3IFZlY3RvcjMoMCwgMSwgMCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVmcmFjdGlvblJUVC5vbkFmdGVyUmVuZGVyID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWVzaCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWVzaC5pc1Zpc2libGUgPSBpc1Zpc2libGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENsaXAgcGxhbmVcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVDbGlwUGxhbmUpIHtcclxuICAgICAgICAgICAgICAgIHNjZW5lLmNsaXBQbGFuZSA9IGNsaXBQbGFuZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuX3JlZmxlY3Rpb25SVFQub25CZWZvcmVSZW5kZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9tZXNoKSB7XHJcbiAgICAgICAgICAgICAgICBpc1Zpc2libGUgPSB0aGlzLl9tZXNoLmlzVmlzaWJsZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21lc2guaXNWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENsaXAgcGxhbmVcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVDbGlwUGxhbmUpIHtcclxuICAgICAgICAgICAgICAgIGNsaXBQbGFuZSA9IHNjZW5lLmNsaXBQbGFuZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb3NpdGlvbnkgPSB0aGlzLl9tZXNoID8gdGhpcy5fbWVzaC5hYnNvbHV0ZVBvc2l0aW9uLnkgOiAwLjA7XHJcbiAgICAgICAgICAgICAgICBzY2VuZS5jbGlwUGxhbmUgPSBQbGFuZS5Gcm9tUG9zaXRpb25BbmROb3JtYWwobmV3IFZlY3RvcjMoMCwgcG9zaXRpb255IC0gMC4wNSwgMCksIG5ldyBWZWN0b3IzKDAsIC0xLCAwKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgTWF0cml4LlJlZmxlY3Rpb25Ub1JlZihzY2VuZS5jbGlwUGxhbmUsIG1pcnJvck1hdHJpeCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRyYW5zZm9ybVxyXG4gICAgICAgICAgICBzYXZlZFZpZXdNYXRyaXggPSBzY2VuZS5nZXRWaWV3TWF0cml4KCk7XHJcblxyXG4gICAgICAgICAgICBtaXJyb3JNYXRyaXgubXVsdGlwbHlUb1JlZihzYXZlZFZpZXdNYXRyaXgsIHRoaXMuX3JlZmxlY3Rpb25UcmFuc2Zvcm0pO1xyXG4gICAgICAgICAgICBzY2VuZS5zZXRUcmFuc2Zvcm1NYXRyaXgodGhpcy5fcmVmbGVjdGlvblRyYW5zZm9ybSwgc2NlbmUuZ2V0UHJvamVjdGlvbk1hdHJpeCgpKTtcclxuICAgICAgICAgICAgc2NlbmUuX21pcnJvcmVkQ2FtZXJhUG9zaXRpb24gPSBWZWN0b3IzLlRyYW5zZm9ybUNvb3JkaW5hdGVzKCg8Q2FtZXJhPnNjZW5lLmFjdGl2ZUNhbWVyYSkucG9zaXRpb24sIG1pcnJvck1hdHJpeCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5fcmVmbGVjdGlvblJUVC5vbkFmdGVyUmVuZGVyID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWVzaCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWVzaC5pc1Zpc2libGUgPSBpc1Zpc2libGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENsaXAgcGxhbmVcclxuICAgICAgICAgICAgc2NlbmUuY2xpcFBsYW5lID0gY2xpcFBsYW5lO1xyXG5cclxuICAgICAgICAgICAgLy8gVHJhbnNmb3JtXHJcbiAgICAgICAgICAgIHNjZW5lLnNldFRyYW5zZm9ybU1hdHJpeChzYXZlZFZpZXdNYXRyaXgsIHNjZW5lLmdldFByb2plY3Rpb25NYXRyaXgoKSk7XHJcbiAgICAgICAgICAgIHNjZW5lLl9taXJyb3JlZENhbWVyYVBvc2l0aW9uID0gbnVsbDtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRBbmltYXRhYmxlcygpOiBJQW5pbWF0YWJsZVtdIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJ1bXBUZXh0dXJlICYmIHRoaXMuYnVtcFRleHR1cmUuYW5pbWF0aW9ucyAmJiB0aGlzLmJ1bXBUZXh0dXJlLmFuaW1hdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5idW1wVGV4dHVyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9yZWZsZWN0aW9uUlRUICYmIHRoaXMuX3JlZmxlY3Rpb25SVFQuYW5pbWF0aW9ucyAmJiB0aGlzLl9yZWZsZWN0aW9uUlRULmFuaW1hdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5fcmVmbGVjdGlvblJUVCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9yZWZyYWN0aW9uUlRUICYmIHRoaXMuX3JlZnJhY3Rpb25SVFQuYW5pbWF0aW9ucyAmJiB0aGlzLl9yZWZyYWN0aW9uUlRULmFuaW1hdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5fcmVmcmFjdGlvblJUVCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0QWN0aXZlVGV4dHVyZXMoKTogQmFzZVRleHR1cmVbXSB7XHJcbiAgICAgICAgY29uc3QgYWN0aXZlVGV4dHVyZXMgPSBzdXBlci5nZXRBY3RpdmVUZXh0dXJlcygpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fYnVtcFRleHR1cmUpIHtcclxuICAgICAgICAgICAgYWN0aXZlVGV4dHVyZXMucHVzaCh0aGlzLl9idW1wVGV4dHVyZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYWN0aXZlVGV4dHVyZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIGhhc1RleHR1cmUodGV4dHVyZTogQmFzZVRleHR1cmUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoc3VwZXIuaGFzVGV4dHVyZSh0ZXh0dXJlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9idW1wVGV4dHVyZSA9PT0gdGV4dHVyZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZShmb3JjZURpc3Bvc2VFZmZlY3Q/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuYnVtcFRleHR1cmUpIHtcclxuICAgICAgICAgICAgdGhpcy5idW1wVGV4dHVyZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmdldFNjZW5lKCkuY3VzdG9tUmVuZGVyVGFyZ2V0cy5pbmRleE9mKDxSZW5kZXJUYXJnZXRUZXh0dXJlPnRoaXMuX3JlZnJhY3Rpb25SVFQpO1xyXG4gICAgICAgIGlmIChpbmRleCAhPSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmdldFNjZW5lKCkuY3VzdG9tUmVuZGVyVGFyZ2V0cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmRleCA9IC0xO1xyXG4gICAgICAgIGluZGV4ID0gdGhpcy5nZXRTY2VuZSgpLmN1c3RvbVJlbmRlclRhcmdldHMuaW5kZXhPZig8UmVuZGVyVGFyZ2V0VGV4dHVyZT50aGlzLl9yZWZsZWN0aW9uUlRUKTtcclxuICAgICAgICBpZiAoaW5kZXggIT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRTY2VuZSgpLmN1c3RvbVJlbmRlclRhcmdldHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9yZWZsZWN0aW9uUlRUKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZmxlY3Rpb25SVFQuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fcmVmcmFjdGlvblJUVCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyYWN0aW9uUlRULmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBpbWFnZS1wcm9jZXNzaW5nIG9ic2VydmVyXHJcbiAgICAgICAgaWYgKHRoaXMuX2ltYWdlUHJvY2Vzc2luZ0NvbmZpZ3VyYXRpb24gJiYgdGhpcy5faW1hZ2VQcm9jZXNzaW5nT2JzZXJ2ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5faW1hZ2VQcm9jZXNzaW5nQ29uZmlndXJhdGlvbi5vblVwZGF0ZVBhcmFtZXRlcnMucmVtb3ZlKHRoaXMuX2ltYWdlUHJvY2Vzc2luZ09ic2VydmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoZm9yY2VEaXNwb3NlRWZmZWN0KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgY2xvbmUobmFtZTogc3RyaW5nKTogV2F0ZXJNYXRlcmlhbCB7XHJcbiAgICAgICAgcmV0dXJuIFNlcmlhbGl6YXRpb25IZWxwZXIuQ2xvbmUoKCkgPT4gbmV3IFdhdGVyTWF0ZXJpYWwobmFtZSwgdGhpcy5nZXRTY2VuZSgpKSwgdGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIHNlcmlhbGl6ZSgpOiBhbnkge1xyXG4gICAgICAgIGNvbnN0IHNlcmlhbGl6YXRpb25PYmplY3QgPSBzdXBlci5zZXJpYWxpemUoKTtcclxuICAgICAgICBzZXJpYWxpemF0aW9uT2JqZWN0LmN1c3RvbVR5cGUgPSBcIkJBQllMT04uV2F0ZXJNYXRlcmlhbFwiO1xyXG5cclxuICAgICAgICBzZXJpYWxpemF0aW9uT2JqZWN0LnJlbmRlckxpc3QgPSBbXTtcclxuICAgICAgICBpZiAodGhpcy5fcmVmcmFjdGlvblJUVCAmJiB0aGlzLl9yZWZyYWN0aW9uUlRULnJlbmRlckxpc3QpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9yZWZyYWN0aW9uUlRULnJlbmRlckxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb25PYmplY3QucmVuZGVyTGlzdC5wdXNoKHRoaXMuX3JlZnJhY3Rpb25SVFQucmVuZGVyTGlzdFtpXS5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uT2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRDbGFzc05hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gXCJXYXRlck1hdGVyaWFsXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RhdGljc1xyXG4gICAgcHVibGljIHN0YXRpYyBvdmVycmlkZSBQYXJzZShzb3VyY2U6IGFueSwgc2NlbmU6IFNjZW5lLCByb290VXJsOiBzdHJpbmcpOiBXYXRlck1hdGVyaWFsIHtcclxuICAgICAgICBjb25zdCBtYXQgPSBTZXJpYWxpemF0aW9uSGVscGVyLlBhcnNlKCgpID0+IG5ldyBXYXRlck1hdGVyaWFsKHNvdXJjZS5uYW1lLCBzY2VuZSksIHNvdXJjZSwgc2NlbmUsIHJvb3RVcmwpO1xyXG4gICAgICAgIG1hdC5fd2FpdGluZ1JlbmRlckxpc3QgPSBzb3VyY2UucmVuZGVyTGlzdDtcclxuXHJcbiAgICAgICAgcmV0dXJuIG1hdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIENyZWF0ZURlZmF1bHRNZXNoKG5hbWU6IHN0cmluZywgc2NlbmU6IFNjZW5lKTogTWVzaCB7XHJcbiAgICAgICAgY29uc3QgbWVzaCA9IENyZWF0ZUdyb3VuZChuYW1lLCB7IHdpZHRoOiA1MTIsIGhlaWdodDogNTEyLCBzdWJkaXZpc2lvbnM6IDMyLCB1cGRhdGFibGU6IGZhbHNlIH0sIHNjZW5lKTtcclxuICAgICAgICByZXR1cm4gbWVzaDtcclxuICAgIH1cclxufVxyXG5cclxuUmVnaXN0ZXJDbGFzcyhcIkJBQllMT04uV2F0ZXJNYXRlcmlhbFwiLCBXYXRlck1hdGVyaWFsKTtcclxuIiwiLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L25vLWludGVybmFsLW1vZHVsZXMgKi9cclxuaW1wb3J0ICogYXMgTWF0TGliIGZyb20gXCJtYXRlcmlhbHMvd2F0ZXIvaW5kZXhcIjtcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgdGhlIFVNRCBtb2R1bGUuXHJcbiAqIFRoZSBlbnRyeSBwb2ludCBmb3IgYSBmdXR1cmUgRVNNIHBhY2thZ2Ugc2hvdWxkIGJlIGluZGV4LnRzXHJcbiAqL1xyXG5jb25zdCBnbG9iYWxPYmplY3QgPSB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcclxuaWYgKHR5cGVvZiBnbG9iYWxPYmplY3QgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgIGZvciAoY29uc3Qga2V5IGluIE1hdExpYikge1xyXG4gICAgICAgICg8YW55Pmdsb2JhbE9iamVjdCkuQkFCWUxPTltrZXldID0gKDxhbnk+TWF0TGliKVtrZXldO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgKiBmcm9tIFwibWF0ZXJpYWxzL3dhdGVyL2luZGV4XCI7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9iYWJ5bG9uanNfTWF0ZXJpYWxzX2VmZmVjdF9fOyIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxuXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlLCBTdXBwcmVzc2VkRXJyb3IsIFN5bWJvbCwgSXRlcmF0b3IgKi9cblxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XG4gIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XG4gIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XG4gIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XG4gIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG59XG5cbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcbiAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcbiAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0O1xuICB9XG4gIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcbiAgdmFyIHQgPSB7fTtcbiAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXG4gICAgICB0W3BdID0gc1twXTtcbiAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcbiAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XG4gICAgICB9XG4gIHJldHVybiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX2VzRGVjb3JhdGUoY3RvciwgZGVzY3JpcHRvckluLCBkZWNvcmF0b3JzLCBjb250ZXh0SW4sIGluaXRpYWxpemVycywgZXh0cmFJbml0aWFsaXplcnMpIHtcbiAgZnVuY3Rpb24gYWNjZXB0KGYpIHsgaWYgKGYgIT09IHZvaWQgMCAmJiB0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRnVuY3Rpb24gZXhwZWN0ZWRcIik7IHJldHVybiBmOyB9XG4gIHZhciBraW5kID0gY29udGV4dEluLmtpbmQsIGtleSA9IGtpbmQgPT09IFwiZ2V0dGVyXCIgPyBcImdldFwiIDoga2luZCA9PT0gXCJzZXR0ZXJcIiA/IFwic2V0XCIgOiBcInZhbHVlXCI7XG4gIHZhciB0YXJnZXQgPSAhZGVzY3JpcHRvckluICYmIGN0b3IgPyBjb250ZXh0SW5bXCJzdGF0aWNcIl0gPyBjdG9yIDogY3Rvci5wcm90b3R5cGUgOiBudWxsO1xuICB2YXIgZGVzY3JpcHRvciA9IGRlc2NyaXB0b3JJbiB8fCAodGFyZ2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGNvbnRleHRJbi5uYW1lKSA6IHt9KTtcbiAgdmFyIF8sIGRvbmUgPSBmYWxzZTtcbiAgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBjb250ZXh0ID0ge307XG4gICAgICBmb3IgKHZhciBwIGluIGNvbnRleHRJbikgY29udGV4dFtwXSA9IHAgPT09IFwiYWNjZXNzXCIgPyB7fSA6IGNvbnRleHRJbltwXTtcbiAgICAgIGZvciAodmFyIHAgaW4gY29udGV4dEluLmFjY2VzcykgY29udGV4dC5hY2Nlc3NbcF0gPSBjb250ZXh0SW4uYWNjZXNzW3BdO1xuICAgICAgY29udGV4dC5hZGRJbml0aWFsaXplciA9IGZ1bmN0aW9uIChmKSB7IGlmIChkb25lKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGFkZCBpbml0aWFsaXplcnMgYWZ0ZXIgZGVjb3JhdGlvbiBoYXMgY29tcGxldGVkXCIpOyBleHRyYUluaXRpYWxpemVycy5wdXNoKGFjY2VwdChmIHx8IG51bGwpKTsgfTtcbiAgICAgIHZhciByZXN1bHQgPSAoMCwgZGVjb3JhdG9yc1tpXSkoa2luZCA9PT0gXCJhY2Nlc3NvclwiID8geyBnZXQ6IGRlc2NyaXB0b3IuZ2V0LCBzZXQ6IGRlc2NyaXB0b3Iuc2V0IH0gOiBkZXNjcmlwdG9yW2tleV0sIGNvbnRleHQpO1xuICAgICAgaWYgKGtpbmQgPT09IFwiYWNjZXNzb3JcIikge1xuICAgICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkgY29udGludWU7XG4gICAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCB8fCB0eXBlb2YgcmVzdWx0ICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkXCIpO1xuICAgICAgICAgIGlmIChfID0gYWNjZXB0KHJlc3VsdC5nZXQpKSBkZXNjcmlwdG9yLmdldCA9IF87XG4gICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LnNldCkpIGRlc2NyaXB0b3Iuc2V0ID0gXztcbiAgICAgICAgICBpZiAoXyA9IGFjY2VwdChyZXN1bHQuaW5pdCkpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoXyA9IGFjY2VwdChyZXN1bHQpKSB7XG4gICAgICAgICAgaWYgKGtpbmQgPT09IFwiZmllbGRcIikgaW5pdGlhbGl6ZXJzLnVuc2hpZnQoXyk7XG4gICAgICAgICAgZWxzZSBkZXNjcmlwdG9yW2tleV0gPSBfO1xuICAgICAgfVxuICB9XG4gIGlmICh0YXJnZXQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGNvbnRleHRJbi5uYW1lLCBkZXNjcmlwdG9yKTtcbiAgZG9uZSA9IHRydWU7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gX19ydW5Jbml0aWFsaXplcnModGhpc0FyZywgaW5pdGlhbGl6ZXJzLCB2YWx1ZSkge1xuICB2YXIgdXNlVmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbml0aWFsaXplcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlID0gdXNlVmFsdWUgPyBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnLCB2YWx1ZSkgOiBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnKTtcbiAgfVxuICByZXR1cm4gdXNlVmFsdWUgPyB2YWx1ZSA6IHZvaWQgMDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBfX3Byb3BLZXkoeCkge1xuICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCIgPyB4IDogXCJcIi5jb25jYXQoeCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gX19zZXRGdW5jdGlvbk5hbWUoZiwgbmFtZSwgcHJlZml4KSB7XG4gIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJzeW1ib2xcIikgbmFtZSA9IG5hbWUuZGVzY3JpcHRpb24gPyBcIltcIi5jb25jYXQobmFtZS5kZXNjcmlwdGlvbiwgXCJdXCIpIDogXCJcIjtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmLCBcIm5hbWVcIiwgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiBwcmVmaXggPyBcIlwiLmNvbmNhdChwcmVmaXgsIFwiIFwiLCBuYW1lKSA6IG5hbWUgfSk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xuICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xuICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnID0gT2JqZWN0LmNyZWF0ZSgodHlwZW9mIEl0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBJdGVyYXRvciA6IE9iamVjdCkucHJvdG90eXBlKTtcbiAgcmV0dXJuIGcubmV4dCA9IHZlcmIoMCksIGdbXCJ0aHJvd1wiXSA9IHZlcmIoMSksIGdbXCJyZXR1cm5cIl0gPSB2ZXJiKDIpLCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xuICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gIH1cbn1cblxuZXhwb3J0IHZhciBfX2NyZWF0ZUJpbmRpbmcgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gIH1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gIG9bazJdID0gbVtrXTtcbn0pO1xuXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIG8pIHtcbiAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xuICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xuICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcbiAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xuICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XG4gICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xuICAgICAgfVxuICB9O1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xuICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gIGlmICghbSkgcmV0dXJuIG87XG4gIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xuICB0cnkge1xuICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XG4gIH1cbiAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XG4gIGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcbiAgICAgIH1cbiAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxuICB9XG4gIHJldHVybiBhcjtcbn1cblxuLyoqIEBkZXByZWNhdGVkICovXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XG4gIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xuICByZXR1cm4gYXI7XG59XG5cbi8qKiBAZGVwcmVjYXRlZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xuICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcbiAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxuICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXG4gICAgICAgICAgcltrXSA9IGFbal07XG4gIHJldHVybiByO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheSh0bywgZnJvbSwgcGFjaykge1xuICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xuICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XG4gICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xuICAgICAgfVxuICB9XG4gIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XG4gIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcbiAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbiAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcbiAgcmV0dXJuIGkgPSBPYmplY3QuY3JlYXRlKCh0eXBlb2YgQXN5bmNJdGVyYXRvciA9PT0gXCJmdW5jdGlvblwiID8gQXN5bmNJdGVyYXRvciA6IE9iamVjdCkucHJvdG90eXBlKSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiLCBhd2FpdFJldHVybiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcbiAgZnVuY3Rpb24gYXdhaXRSZXR1cm4oZikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGYsIHJlamVjdCk7IH07IH1cbiAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlmIChnW25dKSB7IGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IGlmIChmKSBpW25dID0gZihpW25dKTsgfSB9XG4gIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cbiAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XG4gIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cbiAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxuICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcbiAgdmFyIGksIHA7XG4gIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XG4gIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IGZhbHNlIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcbiAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcbiAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcbiAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xuICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XG4gIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XG4gIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XG4gIHJldHVybiBjb29rZWQ7XG59O1xuXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICBvW1wiZGVmYXVsdFwiXSA9IHY7XG59O1xuXG52YXIgb3duS2V5cyA9IGZ1bmN0aW9uKG8pIHtcbiAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgdmFyIGFyID0gW107XG4gICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICByZXR1cm4gYXI7XG4gIH07XG4gIHJldHVybiBvd25LZXlzKG8pO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcbiAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgPSBvd25LZXlzKG1vZCksIGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykgaWYgKGtbaV0gIT09IFwiZGVmYXVsdFwiKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGtbaV0pO1xuICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xuICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgc3RhdGUsIGtpbmQsIGYpIHtcbiAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xuICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcbiAgcmV0dXJuIGtpbmQgPT09IFwibVwiID8gZiA6IGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyKSA6IGYgPyBmLnZhbHVlIDogc3RhdGUuZ2V0KHJlY2VpdmVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRTZXQocmVjZWl2ZXIsIHN0YXRlLCB2YWx1ZSwga2luZCwgZikge1xuICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XG4gIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcbiAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3Qgd3JpdGUgcHJpdmF0ZSBtZW1iZXIgdG8gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcbiAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4oc3RhdGUsIHJlY2VpdmVyKSB7XG4gIGlmIChyZWNlaXZlciA9PT0gbnVsbCB8fCAodHlwZW9mIHJlY2VpdmVyICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZWNlaXZlciAhPT0gXCJmdW5jdGlvblwiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB1c2UgJ2luJyBvcGVyYXRvciBvbiBub24tb2JqZWN0XCIpO1xuICByZXR1cm4gdHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciA9PT0gc3RhdGUgOiBzdGF0ZS5oYXMocmVjZWl2ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX19hZGREaXNwb3NhYmxlUmVzb3VyY2UoZW52LCB2YWx1ZSwgYXN5bmMpIHtcbiAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkLlwiKTtcbiAgICB2YXIgZGlzcG9zZSwgaW5uZXI7XG4gICAgaWYgKGFzeW5jKSB7XG4gICAgICBpZiAoIVN5bWJvbC5hc3luY0Rpc3Bvc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNEaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcbiAgICAgIGRpc3Bvc2UgPSB2YWx1ZVtTeW1ib2wuYXN5bmNEaXNwb3NlXTtcbiAgICB9XG4gICAgaWYgKGRpc3Bvc2UgPT09IHZvaWQgMCkge1xuICAgICAgaWYgKCFTeW1ib2wuZGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5kaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcbiAgICAgIGRpc3Bvc2UgPSB2YWx1ZVtTeW1ib2wuZGlzcG9zZV07XG4gICAgICBpZiAoYXN5bmMpIGlubmVyID0gZGlzcG9zZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBkaXNwb3NlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3Qgbm90IGRpc3Bvc2FibGUuXCIpO1xuICAgIGlmIChpbm5lcikgZGlzcG9zZSA9IGZ1bmN0aW9uKCkgeyB0cnkgeyBpbm5lci5jYWxsKHRoaXMpOyB9IGNhdGNoIChlKSB7IHJldHVybiBQcm9taXNlLnJlamVjdChlKTsgfSB9O1xuICAgIGVudi5zdGFjay5wdXNoKHsgdmFsdWU6IHZhbHVlLCBkaXNwb3NlOiBkaXNwb3NlLCBhc3luYzogYXN5bmMgfSk7XG4gIH1cbiAgZWxzZSBpZiAoYXN5bmMpIHtcbiAgICBlbnYuc3RhY2sucHVzaCh7IGFzeW5jOiB0cnVlIH0pO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxudmFyIF9TdXBwcmVzc2VkRXJyb3IgPSB0eXBlb2YgU3VwcHJlc3NlZEVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBTdXBwcmVzc2VkRXJyb3IgOiBmdW5jdGlvbiAoZXJyb3IsIHN1cHByZXNzZWQsIG1lc3NhZ2UpIHtcbiAgdmFyIGUgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlLm5hbWUgPSBcIlN1cHByZXNzZWRFcnJvclwiLCBlLmVycm9yID0gZXJyb3IsIGUuc3VwcHJlc3NlZCA9IHN1cHByZXNzZWQsIGU7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gX19kaXNwb3NlUmVzb3VyY2VzKGVudikge1xuICBmdW5jdGlvbiBmYWlsKGUpIHtcbiAgICBlbnYuZXJyb3IgPSBlbnYuaGFzRXJyb3IgPyBuZXcgX1N1cHByZXNzZWRFcnJvcihlLCBlbnYuZXJyb3IsIFwiQW4gZXJyb3Igd2FzIHN1cHByZXNzZWQgZHVyaW5nIGRpc3Bvc2FsLlwiKSA6IGU7XG4gICAgZW52Lmhhc0Vycm9yID0gdHJ1ZTtcbiAgfVxuICB2YXIgciwgcyA9IDA7XG4gIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgd2hpbGUgKHIgPSBlbnYuc3RhY2sucG9wKCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghci5hc3luYyAmJiBzID09PSAxKSByZXR1cm4gcyA9IDAsIGVudi5zdGFjay5wdXNoKHIpLCBQcm9taXNlLnJlc29sdmUoKS50aGVuKG5leHQpO1xuICAgICAgICBpZiAoci5kaXNwb3NlKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHIuZGlzcG9zZS5jYWxsKHIudmFsdWUpO1xuICAgICAgICAgIGlmIChyLmFzeW5jKSByZXR1cm4gcyB8PSAyLCBQcm9taXNlLnJlc29sdmUocmVzdWx0KS50aGVuKG5leHQsIGZ1bmN0aW9uKGUpIHsgZmFpbChlKTsgcmV0dXJuIG5leHQoKTsgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBzIHw9IDE7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBmYWlsKGUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocyA9PT0gMSkgcmV0dXJuIGVudi5oYXNFcnJvciA/IFByb21pc2UucmVqZWN0KGVudi5lcnJvcikgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICBpZiAoZW52Lmhhc0Vycm9yKSB0aHJvdyBlbnYuZXJyb3I7XG4gIH1cbiAgcmV0dXJuIG5leHQoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uKHBhdGgsIHByZXNlcnZlSnN4KSB7XG4gIGlmICh0eXBlb2YgcGF0aCA9PT0gXCJzdHJpbmdcIiAmJiAvXlxcLlxcLj9cXC8vLnRlc3QocGF0aCkpIHtcbiAgICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcLih0c3gpJHwoKD86XFwuZCk/KSgoPzpcXC5bXi4vXSs/KT8pXFwuKFtjbV0/KXRzJC9pLCBmdW5jdGlvbiAobSwgdHN4LCBkLCBleHQsIGNtKSB7XG4gICAgICAgICAgcmV0dXJuIHRzeCA/IHByZXNlcnZlSnN4ID8gXCIuanN4XCIgOiBcIi5qc1wiIDogZCAmJiAoIWV4dCB8fCAhY20pID8gbSA6IChkICsgZXh0ICsgXCIuXCIgKyBjbS50b0xvd2VyQ2FzZSgpICsgXCJqc1wiKTtcbiAgICAgIH0pO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIF9fZXh0ZW5kcyxcbiAgX19hc3NpZ24sXG4gIF9fcmVzdCxcbiAgX19kZWNvcmF0ZSxcbiAgX19wYXJhbSxcbiAgX19lc0RlY29yYXRlLFxuICBfX3J1bkluaXRpYWxpemVycyxcbiAgX19wcm9wS2V5LFxuICBfX3NldEZ1bmN0aW9uTmFtZSxcbiAgX19tZXRhZGF0YSxcbiAgX19hd2FpdGVyLFxuICBfX2dlbmVyYXRvcixcbiAgX19jcmVhdGVCaW5kaW5nLFxuICBfX2V4cG9ydFN0YXIsXG4gIF9fdmFsdWVzLFxuICBfX3JlYWQsXG4gIF9fc3ByZWFkLFxuICBfX3NwcmVhZEFycmF5cyxcbiAgX19zcHJlYWRBcnJheSxcbiAgX19hd2FpdCxcbiAgX19hc3luY0dlbmVyYXRvcixcbiAgX19hc3luY0RlbGVnYXRvcixcbiAgX19hc3luY1ZhbHVlcyxcbiAgX19tYWtlVGVtcGxhdGVPYmplY3QsXG4gIF9faW1wb3J0U3RhcixcbiAgX19pbXBvcnREZWZhdWx0LFxuICBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0LFxuICBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0LFxuICBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4sXG4gIF9fYWRkRGlzcG9zYWJsZVJlc291cmNlLFxuICBfX2Rpc3Bvc2VSZXNvdXJjZXMsXG4gIF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uLFxufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCAqIGFzIG1hdGVyaWFscyBmcm9tIFwiQGx0cy9tYXRlcmlhbHMvbGVnYWN5L2xlZ2FjeS13YXRlclwiO1xyXG5leHBvcnQgeyBtYXRlcmlhbHMgfTtcclxuZXhwb3J0IGRlZmF1bHQgbWF0ZXJpYWxzO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=