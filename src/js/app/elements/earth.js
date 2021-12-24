// Global imports -
import anime from 'animejs';
import * as THREE from 'three';
import vars from '../vars';
import fx from '../fx';

let clouds, earthBall;
var localPlane;

export default class Earth {
  constructor(main) {
    this.init(main);
  }
  
  init(main) {

    this.scene = main.scene;

    this.object = new THREE.Object3D();
        
    localPlane = new THREE.Plane( new THREE.Vector3( -1, 0.1, 0 ), 100);
    vars.localPlanes[0] = localPlane;

    var geometry = new THREE.SphereGeometry(vars.globeRadius, 32, 32);

    const mapTexture = new THREE.TextureLoader().load( '/assets/textures/map2.jpg' );
    mapTexture.matrix.rotate(.2);
    const elevMap = new THREE.TextureLoader().load( '/assets/textures/elevation2.jpg' );
    const waterMap = new THREE.TextureLoader().load( 'assets/textures/water.png' );
    const cloudsTexture = new THREE.TextureLoader().load( 'assets/textures/clouds.png' );

    var material = new THREE.MeshPhongMaterial({
      map: mapTexture,
      bumpMap: elevMap,
      bumpScale: .005,
      specularMap: waterMap,
      specular: new THREE.Color( 0xDDDDDD ),
      clippingPlanes: [localPlane],
      clipShadows: true,
    });

    earthBall = new THREE.Mesh(geometry, material);
    clouds = new THREE.Mesh(
      new THREE.SphereGeometry(vars.globeRadius + 5, 32, 32),
      new THREE.MeshStandardMaterial({
        map: cloudsTexture,
        transparent: true,
        roughness: .9,
        clippingPlanes: [localPlane],
        clipShadows: true,
      })
    );

    this.object.add(earthBall);
    this.object.add(clouds);

    this.object.rotation.y = 140 * THREE.Math.DEG2RAD; 
    this.object.position.z = -1000;

    this.scene.add(this.object);

    vars.loopFunctions.push([this.animateEarth, "ANIMATE_EARTH", 0]);

    return this.object;
  }

  dispose(){
    fx.removeFromLoop("ANIMATE_EARTH");

    var parent = this.object;
    for (var i = parent.children.length - 1; i >= 0; i--) {
        parent.remove(parent.children[i]);
    }
    this.scene.remove(this.object);

  }

  animateEarth(){
    clouds.rotation.y += -.0007;
    //earthBall.rotation.y += -.0004;
  }
}
