// Global imports -
import * as THREE from 'three';
import { BufferGeometryUtils } from '../../utils/bufferGeometryUtils';
import SimplexNoise from 'simplex-noise';

import Geometry from '../components/geometry';

import fx from '../fx';
import vars from '../vars';

import * as data from '../../data/points.json';

const matrix = new THREE.Matrix4();

const markers = new THREE.Object3D();

const simplex = new SimplexNoise();
var blob, ring, ring2;

let flies = new THREE.Object3D();

export default class Globe {
    constructor(main) {
      if (fx.hasWebGL()) {
        this.init(main);
      }
    }
  
    init(main) {

        this.scene = main.scene;

        // Create and place geo in scene

        /*
        let core = new THREE.Mesh(new THREE.IcosahedronGeometry(vars.globeRadius * .8, 8), new THREE.MeshPhongMaterial({color:"black"}));
        this.scene.add(core);
        */

        let blobGeometry = new THREE.IcosahedronGeometry( vars.globeRadius - 5, 10 );
            blobGeometry.setAttribute("basePosition", new THREE.BufferAttribute().copy(blobGeometry.attributes.position));
        var blobMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x14134F,
                emissive: 0x000000,
                emissiveIntensity:.2,
                transparent:true,
                opacity:.6,
                depthTest: true,
                depthWrite: true,
                flatShading:true,
                roughness:.5,
                metalness:.95,
                reflectivity:2.95,
            });

        ring = new THREE.Mesh(
            new THREE.CylinderGeometry( vars.globeRadius *2, vars.globeRadius *2, 2, 36, 1, true),
            new THREE.MeshBasicMaterial( {wireframe:false, color:0x1F55A7, side:THREE.DoubleSide, transparent:true, opacity:.1, flatShading:true })
        );
        ring.rotation.set(30 * THREE.Math.DEG2RAD, 0, 45 * THREE.Math.DEG2RAD);

        this.scene.add(ring);

        ring2 = new THREE.Mesh(
            new THREE.CylinderGeometry( vars.globeRadius * 2.5, vars.globeRadius *2.5, 2, 36, 1, true),
            new THREE.MeshBasicMaterial( {wireframe:false, color:0xFFE600, side:THREE.DoubleSide, transparent:true, opacity:.05, flatShading:true })
        );
        ring2.rotation.set(-45 * THREE.Math.DEG2RAD, 0, -30 * THREE.Math.DEG2RAD);

        this.scene.add(ring2);


        blob = new THREE.Mesh( blobGeometry, blobMaterial );
        //blob.position.y = 30;
        this.scene.add( blob );

        vars.loopFunctions.push([this.animatePositions, "ANIMATE_EARTH"]);
        

        var localPlane = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0);

        const waterMap = new THREE.TextureLoader().load( 'assets/textures/water.png' );

        this.mergedGeometry = new THREE.BufferGeometry();
        this.pointGeometry = new THREE.SphereBufferGeometry(.4,1,1);
        this.pointGeometry2 = new THREE.SphereBufferGeometry(.6,1,1);
        this.pointMaterial = new THREE.MeshPhysicalMaterial({
            color:0x1F55A7,
            //clippingPlanes: [localPlane],
            clipShadows: true,
            roughness:1,
            metalness:.1,
        });

        const geometries = [];

        for (let point of data.points) {
            const { x, y, z } = fx.convertFlatCoordsToSphereCoords(
              point.x,
              point.y,
              vars.globeRadius + 0,
              2040,
              1000,
            );

            if (x && y && z) {

                matrix.makeTranslation(
                    x,
                    y,
                    z
                  );

                let k = Math.random() > .25 ? 
                geometries.push(this.pointGeometry.clone().applyMatrix4(matrix))
                 : geometries.push(this.pointGeometry2.clone().applyMatrix4(matrix));

              //geometries.push(this.pointGeometry.clone().applyMatrix4(matrix));

            }
        }

        this.mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

        this.globeShape = new THREE.Mesh(this.mergedGeometry, this.pointMaterial);
        //this.globeShape.rotation.y = -40 * THREE.Math.DEG2RAD;
        this.scene.add(this.globeShape);

        for(var i=0; i<vars.milestones.length; ++i){
            this.addMarker(vars.milestones[i].coords, i);
        }

        this.scene.add(markers);
        this.addFireflies(main);

    }

    addMarker(obj, i){
        this.marker = new THREE.Object3D();

        let grassMaterial = new THREE.ShaderMaterial({
            side:THREE.DoubleSide,
            transparent:true,
            depthTest:false,
            uniforms: {
                color1: {
                  value: new THREE.Color(0xFFE600)
                },
                color2: {
                  value: new THREE.Color(0x14134F)
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
                  
                  gl_FragColor = vec4(mix(color1, color2, vUv.y), 0.2);
                }
              `
        });

        let mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 3, 24, 16, 1, true),
            grassMaterial
        )

        var latRad = obj.lat * (Math.PI / 180);
        var lonRad = -obj.lng * (Math.PI / 180);
        var r = vars.globeRadius + 12;
        
        this.marker.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * r, 
            Math.sin(latRad) * r, 
            Math.cos(latRad) * Math.sin(lonRad) * r
        );
        this.marker.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);

        vars.milestones[i].position = this.marker.position;

        this.marker.add(mesh);
        markers.add(this.marker);

    }

    addFireflies(main){

        this.scene = main.scene;

        const sphere = new THREE.SphereGeometry( 1, 3, 3 );

        //lights
        let light1 = new THREE.PointLight( 0xff0040, 12, 50 );
        light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
        flies.add( light1 );

        let light2 = new THREE.PointLight( 0x0040ff, 12, 50 );
        light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
        flies.add( light2 );

        let light3 = new THREE.PointLight( 0x80ff80, 12, 50 );
        light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
        flies.add( light3 );

        let light4 = new THREE.PointLight( 0xffaa00, 12, 50 );
        light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
        flies.add( light4 );

        flies.position.y = 0;

        this.scene.add( flies );

        vars.loopFunctions.push([this.animateFlies, "ANIMATE_FLIES"]);
    }

    animateFlies(time){
        
        time = time * 0.0005;
        
        let light1 = flies.children[0];
        let light2 = flies.children[1];
        let light3 = flies.children[2];
        let light4 = flies.children[3];

        let radius = vars.globeRadius;

        light1.position.x = Math.sin( time * 0.7 ) * radius;
        light1.position.y = Math.sin( time * 0.5 ) * radius;
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

    animatePositions(a){
      const basePositionAttribute = blob.geometry.getAttribute("basePosition");
      const positionAttribute = blob.geometry.getAttribute( 'position' );
      let newPositionAttribute = [];
      const vertex = new THREE.Vector3();

      for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++ ) {

          vertex.fromBufferAttribute( basePositionAttribute, vertexIndex );

          var perlin = simplex.noise3D(
              vertex.x * 0.018 + a * 0.0002,
              vertex.y * 0.018 + a * 0.0003,
              vertex.z * 0.018 );

          //var ratio = perlin * 0.4 * ( mouse.y + 0.1 ) + 0.8;
          var ratio = perlin * 0.4 * 0.1 + 0.8;
          vertex.multiplyScalar( ratio );

          positionAttribute.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);

      }

      blob.geometry.attributes.position.needsUpdate = true; // required after the first render
      blob.geometry.computeBoundingSphere();

      //ring.rotation.y -= 0.001;
      //ring2.rotation.y += 0.002;
  }

  }