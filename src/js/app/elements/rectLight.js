// Global imports -
import * as THREE from 'three';
import Material from '../components/material';

export default class RectLight {
  constructor(main, config) {
    this.init(main, config);
  }
  
  init(main, config) {

    this.scene = main;
    this.object = new THREE.Object3D();
    this.lightBox = new THREE.Object3D();

    var width = config.width;
    var height = config.height;
    var intensity = config.intensity;
    var rectLight = new THREE.RectAreaLight(0xfff4d4, intensity, width, height);

    this.lightBox.add(rectLight);

    var rectLightMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0xfffaed }));
    rectLightMesh.scale.x = rectLight.width;
    rectLightMesh.scale.y = rectLight.height;
    rectLight.add(rectLightMesh);

    var rectLightMeshBack = new THREE.Mesh(new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xfffaed, side: THREE.FrontSide }));
    rectLightMesh.add(rectLightMeshBack);

    var rectBox = new THREE.Mesh(
      new THREE.BoxGeometry(rectLight.width, rectLight.height, (rectLight.height+rectLight.width)*.05),
      new Material("#DCDFE3").standard
    )
        
    rectBox.position.z = (rectLight.height+rectLight.width)*.05 * .5 + 0.1;

    this.lightBox.add(rectBox);
    this.object.add(this.lightBox);

    this.scene.add(this.object);
        
    //vars.loopFunctions.push([this.animate, "ANIMATE_EARTH"]);
  }

  place(position, rotation) {
    this.object.position.set(...position);
    this.object.rotation.set(...rotation);
  }

  animate(){
    // animate
  }

}
