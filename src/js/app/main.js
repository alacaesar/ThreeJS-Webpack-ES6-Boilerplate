// Global imports -
import * as THREE from 'three';
import anime from 'animejs';

// Local imports -
// Components
import Renderer from './components/renderer';
import Camera from './components/camera';
import Light from './components/light';
import Controls from './components/controls';

//Other
import Events from './events';
import vars from './vars';
import fx from './fx';

//Elements
import Globe from './elements/globe';
import Earth from './elements/earth';
import Stars from './elements/stars';
import Platform from './elements/platform';
import Timeline from './timeline';

// data
import Config from './../data/config';
// -- End of imports

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { FilmGrainShader } from './helpers/FilmGrainShader.js';
import { LensDistortionShader } from './helpers/LensDistortionShader.js';

var composer, composer2, renderPass, renderPass2, distortPass, grainPass, fxaaPass, bloomPass, bokehPass;

var params = {
  enableNoise: true,
  noiseSpeed: 0.1,
  noiseIntensity: 0.0,

  enableDistortion: true,
  baseIor: 1.0,
  bandOffset: 0.0,
  jitterIntensity: 1.0,
  samples: 7,

  exposure: .01,
  bloomStrength: .05,
  bloomThreshold: 0.1,
  bloomRadius: 0.1,
};

var activeScene = 0, scenes = [], composers = [];

export default class Main {
  constructor(container) {

    vars.main = this;
    vars.mobile = fx.isMobile();

    if(vars.mobile){
      Config.camera.posZ = 450;
      Config.globeCamera.posZ = 540;
      Config.platformCamera.posZ = 120;
      Config.fog.near = 0.0014;
    }
    
    this.container = container;

    // Start Three clock
    this.clock = new THREE.Clock();

    let startColor = "rgb("+Config.colors.night.r+", "+Config.colors.night.g+", "+Config.colors.night.b+")";

    // Main scene creation
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(startColor, Config.fog.near);
    scenes.push(this.scene);

    // Main scene creation
    this.scene2 = new THREE.Scene();
    this.scene2.fog = new THREE.FogExp2(Config.fog2.color, Config.fog2.near);
    scenes.push(this.scene2);

    // Get Device Pixel Ratio first for retina
    if(window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio;
    }

    // Main renderer constructor
    this.renderer = new Renderer(this.scene, container);

    // Components instantiations
    this.camera = new Camera(this.renderer.threeRenderer);
    this.controls = new Controls(this.camera.threeCamera, container);
    this.controls.threeControls.enabled = false;
    this.light = new Light(this.scene);
    this.light2 = new Light(this.scene2);

    // Render Pass Setup
    renderPass = new RenderPass( this.scene, this.camera.threeCamera );
    renderPass2 = new RenderPass( this.scene2, this.camera.threeCamera );
    grainPass = new ShaderPass( FilmGrainShader );
    fxaaPass = new ShaderPass( FXAAShader );
    distortPass = new ShaderPass( LensDistortionShader );
    
    //grainPass.material.uniforms.intensity.value = 0.05;
    distortPass.material.defines.CHROMA_SAMPLES = 7;
    distortPass.material.uniforms.jitterIntensity.value = params.jitterIntensity;

    composer = new EffectComposer( this.renderer.threeRenderer );
    composer.setSize( window.innerWidth, window.innerHeight );
    composer.setPixelRatio( window.devicePixelRatio );
    composer.addPass( renderPass );
    composer.addPass( fxaaPass );
    composer.addPass( distortPass );
    composer.addPass( grainPass );
    
    composers.push(composer);

    composer2 = new EffectComposer( this.renderer.threeRenderer );
    composer2.setSize( window.innerWidth, window.innerHeight );
    composer2.setPixelRatio( window.devicePixelRatio );
    composer2.addPass( renderPass2 );
    composer2.addPass( fxaaPass );
    composer2.addPass( distortPass );
    composer2.addPass( grainPass );

    composers.push(composer2);


    // Create and place lights in scene
    const lights = ['ambient', 'directional', 'point', 'hemi'];
    lights.forEach((light) => this.light.place(light));
    
    const lights2 = ['hemi', 'point', 'directional', 'ambient'];
    lights2.forEach((light) => this.light2.place(light));


    //this.globe = new Globe(this);
    //this.earth = new Earth(this);
    this.stars = new Stars(this);
    this.platform = new Platform(this);

    this.camera.threeCamera.position.set(0, 0, Config.camera.posZ);
    //this.camera.threeCamera.rotation.set(-30 * THREE.Math.DEG2RAD, 0, 0);
    
    //this.overlay = new Overlay();
    this.timeline = new Timeline(this);

    this.events = new Events(this);
    this.events.init(this);

    this.render();
  }

  addGlobe(){
    this.globe = new Globe(this);
  }

  addEarth(){
    this.earth = new Earth(this);
  }

  warp(DIRECTION, callback){

    const wrapDuration = 2000;
    const easingIn = 'easeInQuad';

    if(DIRECTION == "IN"){
      anime({
        targets: params,
        baseIor: [1.0, 0.5], bandOffset: [0.0, 0.05],
        easing: easingIn,
        duration: wrapDuration,
        complete: ()=>{ if(callback) callback(); }
      });
    }else if(DIRECTION == "OUT"){
      anime({
        targets: params,
        baseIor: [1.4, 1.0], bandOffset: [0.08, 0.0],
        easing: "easeOutCubic",
        duration: wrapDuration,
        complete: ()=>{ if(callback) callback(); },
      });
    }else if(DIRECTION == "RIN"){
      anime({
        targets: params,
        baseIor: [1.0, 1.4], bandOffset: [0.0, 0.08],
        easing: "easeInCubic",
        duration: wrapDuration * .5,
        complete: ()=>{ if(callback) callback(); }
      });
    }else if(DIRECTION == "ROUT"){
      anime({
        targets: params,
        baseIor: [0.5, 1.0], bandOffset: [0.05, 0.0],
        easing: "easeInCubic",
        duration: wrapDuration * .5,
        complete: ()=>{ if(callback) callback(); }
      });
    }
  }

  flipScene(K){
    activeScene = K;
    if( activeScene == 0 ){
      this.renderer.threeRenderer.setClearColor(Config.fog.color);
      this.controls.threeControls.enabled = true;
    }else{
      this.controls.threeControls.enabled = false;
      this.renderer.threeRenderer.setClearColor(Config.fog2.color);
    }
  }

  initPlatform(){
    this.camera.threeCamera.position.set(Config.platformCamera.posX, Config.platformCamera.posY, Config.platformCamera.posZ);
    this.camera.threeCamera.lookAt(0,0,0);
    this.platform.init();
    vars.platformIsInitialized = true;
  }

  resetPlatform(){
    this.platform.removeModel();
  }

  disposePlatform(){
    this.platform.dispose();
  }

  render() {

    // Call render function and pass in created scene and camera
    //this.renderer.render(this.scene, this.camera.threeCamera);

    distortPass.material.uniforms.baseIor.value = params.baseIor;
    distortPass.material.uniforms.bandOffset.value = params.bandOffset;
    
   composers[activeScene].render();
    
    const delta = this.clock.getDelta();

    // loop functions
    if(!vars.isPauseLoopFunctions){
      var time = Date.now();
      for (var i in vars.loopFunctions){
        if( vars.loopFunctions[i][2] == activeScene ) vars.loopFunctions[i][0](time, delta);
      }
    }
    
    if(vars.isMouseActive){
      scenes[activeScene].rotation.y = THREE.MathUtils.lerp(scenes[activeScene].rotation.y, (vars.mouseCoords.x * Math.PI) / 10, 0.05);
      scenes[activeScene].rotation.x = THREE.MathUtils.lerp(scenes[activeScene].rotation.x, (vars.mouseCoords.y * Math.PI) / 10, 0.05);
    }

    if(vars.isCutActive){
      let vec = ((.5 - vars.mouseCoords.x) * 100) - vars.localPlanes[0].constant;
      vars.localPlanes[0].constant += vec / 30;
      vars.localPlanes[1].constant += -vec / 30;
    }

    // RAF
    if(!vars.isPaused)
      requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
  }
}
