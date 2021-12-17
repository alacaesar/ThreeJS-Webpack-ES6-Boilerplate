// Global imports -
import * as THREE from 'three';
import { GLTFLoader } from '../loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import SimplexNoise from 'simplex-noise';

import Material from '../components/material';
import RectLight from './rectLight';

import fx from '../fx';
import vars from '../vars';
import { BufferGeometryUtils } from '../../utils/bufferGeometryUtils';

let lights;

let variants = {
    platform:[
        {t:25, b:30, h:8, s:64},
        {t:25, b:30, h:8, s:5},
        {t:30, b:20, h:8, s:4},
        {t:30, b:20, h:8, s:8},
        {t:25, b:30, h:8, s:4},
    ],
    light:[
        {w:5, h:15, c:3},
        {w:1, h:15, c:6},
        {w:6, h:12, c:2},
        {w:8, h:10, c:4},
        {w:5, h:10, c:3},
    ]
}

let flies = new THREE.Object3D();

let platformConfig, lightConfig;
const simplex = new SimplexNoise();
var mixer;

const modelHolderObject = new THREE.Object3D();
const object = new THREE.Object3D();

export default class Platform {
    constructor(main) {

        this.lights;
    }
  
    init() {

        const _this = this;

        this.scene = vars.main.scene2;
        lights = new THREE.Object3D();

        modelHolderObject.position.y = -10;
        object.add(modelHolderObject);

        platformConfig = variants.platform[Math.floor(variants.platform.length * Math.random())];
        lightConfig = variants.light[Math.floor(variants.light.length * Math.random())];

        var geometry = new THREE.CylinderGeometry(platformConfig.t, platformConfig.b, platformConfig.h, platformConfig.s);
        var plane = new THREE.Mesh(
            geometry,
            new Material("#5AA9DD").standard
        );
        //object.add(plane);
        //this.scene.add(this.object);
        //this.scene.add(lights);

        vars.loopFunctions.push([this.animate, "ANIMATE_EARTH", 1]);

        var landGeometry = new THREE.PlaneGeometry(1600, 1600, 20, 32, 32);
            landGeometry.setAttribute("basePosition", new THREE.BufferAttribute().copy(landGeometry.attributes.position));
        var landMaterial = new Material('#076CAE').standard;
        this.land = new THREE.Mesh(landGeometry, landMaterial);
        this.land.rotation.set(90 * THREE.Math.DEG2RAD, 0, 0);
        this.land.position.y = -10;

        const basePositionAttribute = this.land.geometry.getAttribute("basePosition");
        const positionAttribute = this.land.geometry.getAttribute( 'position' );
        const vertex = new THREE.Vector3();

        for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++ ) {

            vertex.fromBufferAttribute( basePositionAttribute, vertexIndex );

            //console.log('before', vertex.x);

            var perlin = simplex.noise3D(
                vertex.x * 0.06 + 1 * 0.002,
                vertex.y * 0.06 + 1 * 0.003,
                vertex.z * 0.06 + 1 * 0.005
            );

            //var ratio = perlin * 0.4 * ( mouse.y + 0.1 ) + 0.8;
            var ratio = perlin * 0.4 * 0.1 + 0.8;
            //var ratio = perlin;
            vertex.multiplyScalar( ratio );

            //console.log('after', vertex.x, ratio);

            positionAttribute.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);

        }

        this.land.geometry.attributes.position.needsUpdate = true; // required after the first render
        this.land.geometry.computeBoundingSphere();

        object.add(this.land);

        this.addGrass();
        //this.addLights(lights);
        this.addFireflies();
        this.addModel();
        //this.addObject(main);

        object.position.set(-10, -5, 0);

        this.scene.add(object);

        vars.platformIsInitialized = true;
    }

    dispose(){
        fx.removeFromLoop("ANIMATE_MODEL");
        fx.removeFromLoop("ANIMATE_FLIES");

        var parent = vars.main.scene2;

        for (var i = parent.children.length - 1; i >= 0; i--) {
            parent.remove(parent.children[i]);
        }

        flies.children.forEach(element => flies.remove(element));

        vars.platformIsInitialized = false;
    }

    removeModel(){
        fx.removeFromLoop("ANIMATE_MODEL");
        fx.removeFromLoop("ANIMATE_FLIES");

        var parent = modelHolderObject;
        
        for (var i = parent.children.length - 1; i >= 0; i--) {
            parent.remove(parent.children[i]);
        }
    }

    addModel(){

        let milestone = vars.currentMilestone;

        const _this = this;
        
        const loader = new GLTFLoader().setPath( './assets/models/statues/' );

        //const marble = new THREE.TextureLoader().load( '/assets/textures/marble.jpg' );
        
        loader.load(
            milestone.model,
            function ( gltf ) {

                var model = gltf.scene;
                model.traverse((o) => {
                    if (o.isMesh) o.material = new THREE.MeshPhysicalMaterial({
                        color:0xFFFFFF,
                        //map:marble,
                        roughness:.98,
                        metalness: .5,
                    });
                  });

                gltf.scene.scale.set(1.3, 1.3, 1.3);
                gltf.scene.position.set(0, 0, 0);

				modelHolderObject.add( gltf.scene );

                mixer = new THREE.AnimationMixer( gltf.scene );
        
                gltf.animations.forEach( ( clip ) => {
                    mixer.clipAction( clip ).play();
                });

                vars.loopFunctions.push([_this.animateModel, "ANIMATE_MODEL", 1]);
						
            });
    }

    animateModel(time, delta){
        if ( mixer ) mixer.update( delta );
    }

    addFireflies(scene){

        const sphere = new THREE.SphereGeometry( 0.1, 3, 3 );

        //lights
        let light1 = new THREE.PointLight( 0x9145B6, 2, 30 );
        light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x9145B6 } ) ) );
        flies.add( light1 );

        let light2 = new THREE.PointLight( 0x0040ff, 2, 30 );
        light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
        flies.add( light2 );

        let light3 = new THREE.PointLight( 0x80ff80, 2, 30 );
        light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
        flies.add( light3 );

        let light4 = new THREE.PointLight( 0xffaa00, 2, 30 );
        light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
        flies.add( light4 );

        flies.position.y = 15;

        object.add( flies );

        this.animateFlies(1);
        vars.loopFunctions.push([this.animateFlies, "ANIMATE_FLIES", 1]);
    }

    animateFlies(time){
        
        time = time * 0.0005;
        
        let light1 = flies.children[0];
        let light2 = flies.children[1];
        let light3 = flies.children[2];
        let light4 = flies.children[3];

        let radius = 20;

        light1.position.x = Math.sin( time * 0.7 ) * radius;
        light1.position.y = Math.cos( time * 0.5 ) * radius;
        light1.position.z = Math.cos( time * 0.3 ) * radius;

        light2.position.x = Math.cos( time * 0.3 ) * radius;
        light2.position.y = Math.sin( time * 0.5 ) * radius;
        light2.position.z = Math.sin( time * 0.7 ) * radius;

        light3.position.x = Math.sin( time * 0.7 ) * radius;
        light3.position.y = Math.cos( time * 0.3 ) * radius;
        light3.position.z = Math.sin( time * 0.5 ) * radius;

        light4.position.x = Math.sin( time * 0.3 ) * radius;
        light4.position.y = Math.cos( time * 0.7 ) * radius;
        light4.position.z = Math.sin( time * 0.5 ) * radius;
    }

    addGrass(scene){

        const matrix = new THREE.Matrix4();

        const radius = 30;
        const gap = 5;

        let mergedGeometry = new THREE.BufferGeometry();
        let saplingGeometry = new THREE.CylinderBufferGeometry(.5,.5,6,3);
        
        
        let grassMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color2: {
                  value: new THREE.Color("#193498")
                },
                color1: {
                  value: new THREE.Color("#B958A5")
                }
              },
              vertexShader: `
                varying vec2 vUv;
            
                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                }
              `,
              fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
              
                varying vec2 vUv;
                
                void main() {
                  
                  gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                }
              `
        });
        
        //let grassMaterial = new Material("#B958A5").standard;

        const geometries = [];

        for(var i=0; i<Math.pow(radius, 2); i++){

            let row = Math.floor( i / radius );

            var perlin = simplex.noise2D(
                i - row * radius * 0.000000001,
                row * 0.000000001,
            );

            var ratio = perlin * 2;

            matrix.makeTranslation(
                (i - row * radius) * gap,
                -ratio,
                row * gap,
            )

            /*
            matrix.makeTranslation(
                radius * Math.random() - radius * .5,
                0,
                radius * Math.random() - radius * .5,
            )
            */

            if(fx.isPointInsideCircle(radius * gap * .5, radius * gap * .5, radius * gap * .5, (i - row * radius) * gap, row * gap)
            && !fx.isPointInsideCircle(radius * gap * .5, radius * gap * .5, 35, (i - row * radius) * gap, row * gap)
            )
                geometries.push(saplingGeometry.clone().applyMatrix4(matrix));
            
        }

        mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

        let grass = new THREE.Mesh(mergedGeometry, grassMaterial);
            grass.position.set(-radius * gap * .5, -12, -radius * gap * .5);

        object.add(grass);

    }

    addLights(main){
        let segment = 360/lightConfig.c;
        let radius = platformConfig.t;

        for(var i=0; i<lightConfig.c; ++i){

            let alpha = segment * THREE.MathUtils.DEG2RAD * i;
            let random = Math.random();

            //console.log(segment, alpha, THREE.MathUtils.DEG2RAD, Math.PI / 180);

            var light = new RectLight(main, {width:lightConfig.w, height:lightConfig.h, intensity:8});
                light.place(
                    [Math.cos(alpha) * radius, random * 0 + 15, Math.sin(alpha) * radius], 
                    [ 0, (-segment*i + 90) * THREE.MathUtils.DEG2RAD, 0]
                );

                light.lightBox.rotation.x = ( -15 - ( random * 0) ) * THREE.MathUtils.DEG2RAD;

        }

    }

    animate(){
       //object.rotation.y += .0007;
    }

  }