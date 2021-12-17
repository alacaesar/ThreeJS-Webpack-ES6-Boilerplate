// Global imports -
import * as THREE from 'three';
import anime from 'animejs';

// Local imports -
// Components
import Renderer from './components/renderer';
import Camera from './components/camera';
import Light from './components/light';
import Controls from './components/controls';
import Geometry from './components/geometry';

// Helpers
import Stats from './helpers/stats';
import MeshHelper from './helpers/meshHelper';

// Model
import Texture from './model/texture';
import Model from './model/model';

// Managers
import Interaction from './managers/interaction';
import DatGUI from './managers/datGUI';

//Other
import Events from './events';
import vars from './vars';

//Elements
import Globe from './elements/globe';
import Earth from './elements/earth';
import Stars from './elements/stars';
import Platform from './elements/platform';
import Timeline from './timeline';
import Overlay from './overlay';

// data
import Config from './../data/config';
// -- End of imports

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { FilmGrainShader } from './helpers/FilmGrainShader.js';
import { LensDistortionShader } from './helpers/LensDistortionShader.js';

var composer, composer2, renderPass, renderPass2, distortPass, grainPass, fxaaPass, bloomPass, bokehPass;

var params = {
  enableNoise: true,
  noiseSpeed: 0.0,
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

var activeScene = 0, scenes = [];

const bloomLayer = new THREE.Layers();
bloomLayer.set(1);

export default class Main {
  constructor(container) {

    vars.main = this;
    
    this.container = container;

    // Start Three clock
    this.clock = new THREE.Clock();

    // Main scene creation
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);
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
    this.light = new Light(this.scene);
    this.light2 = new Light(this.scene2);

    // Render Pass Setup
    renderPass = new RenderPass( this.scene, this.camera.threeCamera );
    renderPass2 = new RenderPass( this.scene2, this.camera.threeCamera );
    grainPass = new ShaderPass( FilmGrainShader );
    fxaaPass = new ShaderPass( FXAAShader );
    distortPass = new ShaderPass( LensDistortionShader );
    distortPass.material.defines.CHROMA_SAMPLES = 7;

    //bloom
    /*
    bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
		bloomPass.threshold = params.bloomThreshold;
		bloomPass.strength = params.bloomStrength;
		bloomPass.radius = params.bloomRadius;
    */

    /*
    bokehPass = new BokehPass( this.scene, this.camera.threeCamera, {
      focus: 1.0,
      aperture: 0.025,
      maxblur: 0.01,

      width: window.innerWidth,
      height: window.innerHeight
    } );
    */

    composer = new EffectComposer( this.renderer.threeRenderer );
    composer.setSize( window.innerWidth, window.innerHeight );
    composer.setPixelRatio( window.devicePixelRatio );
    composer.addPass( renderPass );
    composer.addPass( fxaaPass );
    composer.addPass( distortPass );
    composer.addPass( grainPass );
    //composer.addPass( bloomPass );

    composer2 = new EffectComposer( this.renderer.threeRenderer );
    composer2.setSize( window.innerWidth, window.innerHeight );
    composer2.setPixelRatio( window.devicePixelRatio );
    composer2.addPass( renderPass2 );
    composer2.addPass( fxaaPass );
    composer2.addPass( distortPass );
    composer2.addPass( grainPass );


    // Create and place lights in scene
    const lights = ['ambient', 'directional', 'point', 'hemi'];
    lights.forEach((light) => this.light.place(light));
    
    const lights2 = ['hemi', 'point', 'directional', 'ambient'];
    lights2.forEach((light) => this.light2.place(light));


    // Set up rStats if dev environment
    if(Config.isDev && Config.isShowingStats) {
      this.stats = new Stats(this.renderer);
      this.stats.setUp();
    }

    // Set up gui
    if (Config.isDev) {
      //this.gui = new DatGUI(this)
    }

    this.globe = new Globe(this);
    //this.earth = new Earth(this);
    this.stars = new Stars(this);
    this.platform = new Platform(this);

    //this.camera.threeCamera.position.set(0, 0, 270);
    //this.camera.threeCamera.rotation.set(-30 * THREE.Math.DEG2RAD, 0, 0);
    
    //this.overlay = new Overlay();
    this.timeline = new Timeline(this);

    this.events = new Events(this);
    this.events.init(this);

    this.render();
  }

  addEarth(){
    this.earth = new Earth(this);
  }

  warp(DIRECTION, callback){

    let wrapDuration = 2000;
    let easingIn = 'easeInQuad';

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
    console.log('flip');
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

  render() {
    // Render rStats if Dev
    if(Config.isDev && Config.isShowingStats) {
      Stats.start();
    }

    // Call render function and pass in created scene and camera
    //this.renderer.render(this.scene, this.camera.threeCamera);

    //grainPass.material.uniforms.noiseOffset.value += 0.02;
    //grainPass.material.uniforms.intensity.value = 0.08;
    distortPass.material.uniforms.baseIor.value = params.baseIor;
    distortPass.material.uniforms.bandOffset.value = params.bandOffset;
    //distortPass.material.uniforms.jitterOffset.value += 0.01;
    distortPass.material.uniforms.jitterIntensity.value = 1.0;

    if(activeScene == 0)
      composer.render();
    else if(activeScene == 1)
      composer2.render();

    // rStats has finished determining render call now
    if(Config.isDev && Config.isShowingStats) {
      Stats.end();
    }

    // Delta time is sometimes needed for certain updates
    const delta = this.clock.getDelta();

    // loop functions
    if(!vars.isPauseLoopFunctions){
      var time = Date.now();
      for (var i in vars.loopFunctions){
        if( vars.loopFunctions[i][2] == activeScene ) vars.loopFunctions[i][0](time, delta);
      }
    }
    
    //this.controls.threeControls.update();
    
    if(vars.isMouseActive){
      scenes[activeScene].rotation.y = THREE.MathUtils.lerp(scenes[activeScene].rotation.y, (vars.mouseCoords.x * Math.PI) / 10, 0.05);
      scenes[activeScene].rotation.x = THREE.MathUtils.lerp(scenes[activeScene].rotation.x, (vars.mouseCoords.y * Math.PI) / 10, 0.05);
    }

    // RAF
    if(!vars.isPaused)
    requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
  }
}
