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

var composer, composer2, renderPass, renderPass2, distortPass, grainPass, fxaaPass, bloomPass;

var params = {
  enableNoise: true,
  noiseSpeed: 0.02,
  noiseIntensity: 0.025,

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

var activeScene = 1;

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

    // Main scene creation
    this.scene2 = new THREE.Scene();
    this.scene2.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

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
    const bokehPass = new BokehPass( this.scene, this.camera.threeCamera, {
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
    //composer.addPass( bokehPass );
    //composer.addPass( bloomPass );

    composer2 = new EffectComposer( this.renderer.threeRenderer );
    composer2.setSize( window.innerWidth, window.innerHeight );
    composer2.setPixelRatio( window.devicePixelRatio );
    composer2.addPass( renderPass2 );
    composer2.addPass( fxaaPass );
    composer2.addPass( distortPass );
    composer2.addPass( grainPass );

    /*
    anime.timeline({loop: true})
            .add({
                targets: params,
                //baseIor: [1.0, 0.6], bandOffset: [0.0, 0.03],
                baseIor: [1.3, 1.0], bandOffset: [0.03, 0.0],
                easing: "easeInOutExpo",
                duration: 2400,
                delay: 2000,
            }).add({
                targets: params,
                //baseIor: [0.6, 1.0], bandOffset: [0.03, 0.0],
                baseIor: [1.0, 1.3], bandOffset: [0.0, 0.03],
                duration: 2400,
                easing: "easeInOutExpo",
                delay: 1000
            });
            */

    // Create and place lights in scene
    const lights = ['ambient', 'directional', 'point', 'hemi'];
    lights.forEach((light) => this.light.place(light));
    lights.forEach((light) => this.light2.place(light));

    /*
    const light1 = new THREE.PointLight( 0xffffff, 1, 0 );
			light1.position.set( 0, 200, 0 );
			this.scene.add( light1 );

			const light2 = new THREE.PointLight( 0xffffff, 1, 0 );
			light2.position.set( 100, 200, 100 );
			this.scene.add( light2 );

			const light3 = new THREE.PointLight( 0xffffff, 1, 0 );
			light3.position.set( - 100, - 200, - 100 );
			this.scene.add( light3 );
      */

    // Set up rStats if dev environment
    if(Config.isDev && Config.isShowingStats) {
      this.stats = new Stats(this.renderer);
      this.stats.setUp();
    }

    // Set up gui
    if (Config.isDev) {
      //this.gui = new DatGUI(this)
    }

    this.events = new Events(this);
    this.events.init(this);

    //this.globe = new Globe(this);
    //this.earth = new Earth(this);
    this.stars = new Stars(this);
    this.platform = new Platform(this);

    //this.camera.threeCamera.position.set(0, 0, 270);
    //this.camera.threeCamera.rotation.set(-30 * THREE.Math.DEG2RAD, 0, 0);
    
    //this.overlay = new Overlay();
    this.timeline = new Timeline(this);

    

    this.render();
  }

  addEarth(){
    this.earth = new Earth(this);
  }

  warpIn(callback){
    anime({
      targets: params,
      baseIor: [1.0, 0.5], bandOffset: [0.0, 0.05],
      easing: "easeInCubic",
      duration: 2000,
      complete: ()=>{ if(callback) callback(); }
    });
  }

  flipScene(){
    console.log('flip');
    activeScene = 1;
  }

  render() {
    // Render rStats if Dev
    if(Config.isDev && Config.isShowingStats) {
      Stats.start();
    }

    // Call render function and pass in created scene and camera
    //this.renderer.render(this.scene, this.camera.threeCamera);

    grainPass.material.uniforms.noiseOffset.value += 0.02;
    grainPass.material.uniforms.intensity.value = 0.05;
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
        vars.loopFunctions[i][0](time, delta);
      }
    }
    
    //this.controls.threeControls.update();
    
    if(vars.isMouseActive){
      this.scene.rotation.y = THREE.MathUtils.lerp(this.scene.rotation.y, (vars.mouseCoords.x * Math.PI) / 10, 0.05);
      this.scene.rotation.x = THREE.MathUtils.lerp(this.scene.rotation.x, (vars.mouseCoords.y * Math.PI) / 10, 0.05);
    }

    // RAF
    if(!vars.isPaused)
    requestAnimationFrame(this.render.bind(this)); // Bind the main class instead of window object
  }
}
