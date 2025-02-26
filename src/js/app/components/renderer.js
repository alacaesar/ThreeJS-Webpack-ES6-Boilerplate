import * as THREE from 'three';

import Config from '../../data/config';
import vars from '../vars';

// Main webGL renderer class
export default class Renderer {
  constructor(scene, container) {
    // Properties
    this.scene = scene;
    this.container = container;

    // Create WebGL renderer and set its antialias
    this.threeRenderer = new THREE.WebGLRenderer({powerPreference: "high-performance", antialias: true});
    this.threeRenderer.outputEncoding = THREE.sRGBEncoding;

    // Set clear color to fog to enable fog or to hex color for no fog
    this.threeRenderer.setClearColor(scene.fog.color);
    this.threeRenderer.setPixelRatio(window.devicePixelRatio); // For retina

    /*
    var globalPlane = new THREE.Plane( new THREE.Vector3( - 1, 0, 0 ), 0);
    this.threeRenderer.clippingPlanes = [ globalPlane ];
    */
    this.threeRenderer.localClippingEnabled = true;

    // Appends canvas
    container.appendChild(this.threeRenderer.domElement);

    // Shadow map options
    this.threeRenderer.shadowMap.enabled = true;
    this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Get anisotropy for textures
    Config.maxAnisotropy = this.threeRenderer.capabilities.getMaxAnisotropy();

    // Initial size update set to canvas container
    this.updateSize();

    // Listeners
    document.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
    window.addEventListener('resize', () => this.updateSize(), false);
  }

  updateSize() {
    vars.windowSize = {width:this.container.offsetWidth, height:this.container.offsetHeight};
    this.threeRenderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
  }

  render(scene, camera) {
    // Renders scene to canvas target
    //this.threeRenderer.autoClear = true;
    this.threeRenderer.clear();
    this.threeRenderer.clearDepth();
    this.threeRenderer.render(scene, camera);
  }
}
