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
var blob, ring, ring2, ring3;

let globe = new THREE.Object3D();
let flies = new THREE.Object3D();

export default class Globe {
    constructor(main) {
      if (fx.hasWebGL()) {
        this.init(main);
      }

      this.markers = markers;
    }
  
    init(main) {

        this.scene = main.scene;

        let blobGeometry = new THREE.IcosahedronGeometry( vars.globeRadius - 3, 10 );
            blobGeometry.setAttribute("basePosition", new THREE.BufferAttribute().copy(blobGeometry.attributes.position));
        var blobMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x000957,
                emissive: 0x002B7E,
                emissiveIntensity:.1,
                transparent:true,
                opacity:1,
                depthTest: true,
                depthWrite: true,
                flatShading:true,
                roughness:.8,
                metalness:.2,
                reflectivity:1.95,
            });
        blob = new THREE.Mesh( blobGeometry, blobMaterial );
        globe.add( blob );
        
        ring = new THREE.Mesh(
            new THREE.CylinderGeometry( vars.globeRadius *2.4, vars.globeRadius *2.4, 1, 36, 1, true),
            new THREE.MeshBasicMaterial( {wireframe:false, color:0xFFFFFF, side:THREE.DoubleSide, transparent:true, opacity:.2, flatShading:true })
        );
        ring.rotation.set(30 * THREE.Math.DEG2RAD, 0, 45 * THREE.Math.DEG2RAD);
        globe.add(ring);

        ring2 = new THREE.Mesh(
            new THREE.CylinderGeometry( vars.globeRadius * 3.3, vars.globeRadius * 3.3, 1, 36, 1, true),
            new THREE.MeshBasicMaterial( {wireframe:false, color:0x38B0FF, side:THREE.DoubleSide, transparent:true, opacity:.2, flatShading:true })
        );
        ring2.rotation.set(-45 * THREE.Math.DEG2RAD, 0, -30 * THREE.Math.DEG2RAD);
        globe.add(ring2);

        ring3 = new THREE.Mesh(
            new THREE.CylinderGeometry( vars.globeRadius * 3.5, vars.globeRadius *3.5, 1, 36, 1, true),
            new THREE.MeshBasicMaterial( {wireframe:false, color:0x38B0FF, side:THREE.DoubleSide, transparent:true, opacity:.4, flatShading:true })
        );
        ring3.rotation.set(-15 * THREE.Math.DEG2RAD, 0, 10 * THREE.Math.DEG2RAD);
        globe.add(ring3);

        //vars.loopFunctions.push([this.animatePositions, "ANIMATE_EARTH", 0]);
        
        var localPlane = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0);

        this.mergedGeometry = new THREE.BufferGeometry();
        this.pointGeometry = new THREE.SphereBufferGeometry(.4,1,1);
        this.pointGeometry2 = new THREE.SphereBufferGeometry(.7,1,1);
        this.pointMaterial = new THREE.MeshBasicMaterial({
            color:0x9D92F3,
            //clippingPlanes: [localPlane],
            clipShadows: true,
            roughness:.8,
            metalness:.4,
        });
        this.pointMaterial = new THREE.MeshBasicMaterial({color:"#9145B6"});

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
                matrix.makeTranslation( x, y, z );

                let k = Math.random() > .25 ? 
                geometries.push(this.pointGeometry.clone().applyMatrix4(matrix))
                 : geometries.push(this.pointGeometry2.clone().applyMatrix4(matrix));

            }
        }

        this.mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
        this.globeShape = new THREE.Mesh(this.mergedGeometry, this.pointMaterial);
        //this.globeShape.rotation.y = -40 * THREE.Math.DEG2RAD;
        globe.add(this.globeShape);

        for(var i=0; i<vars.milestones.length; ++i){
            this.addMarker(vars.milestones[i].coords, i);
        }

        globe.add(markers);
        //this.addFireflies(main);

        //vars.loopFunctions.push([this.animateGlobe, "ANIMATE_EARTH", 0]);

        this.scene.add(globe);

    }

    addMarker(obj, i){
        this.marker = new THREE.Object3D();

        let grassMaterial = new THREE.ShaderMaterial({
            side:THREE.DoubleSide,
            transparent:true,
            depthTest:false,
            uniforms: {
                color1: {
                  value: new THREE.Color(0x38B0FF)
                },
                color2: {
                  value: new THREE.Color(0x003DB2)
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
                  
                  gl_FragColor = vec4(mix(color1, color2, vUv.y), 0.4);
                }
              `
        });

        let mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 3, 24, 16, 1, true),
            grassMaterial
        )
        mesh.name = i;

        var latRad = obj.lat * (Math.PI / 180);
        var lonRad = -obj.lng * (Math.PI / 180);
        var r = vars.globeRadius + 12;
        
        this.marker.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * r, 
            Math.sin(latRad) * r, 
            Math.cos(latRad) * Math.sin(lonRad) * r
        );
        this.marker.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);

        const sphere = new THREE.SphereGeometry( .2, 3, 3 );
        let light = new THREE.PointLight( 0x009AFF, 2, 25 );
        light.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x009AFF } ) ) );
        light.position.set(0, 5, 0);
        this.marker.add(light);

        vars.milestones[i].position = this.marker.position;

        this.marker.add(mesh);

        markers.add(this.marker);

    }

    addFireflies(main){

        this.scene = main.scene;

        const sphere = new THREE.SphereGeometry( .4, 3, 3 );

        let v =  vars.globeRadius * .6;

        //lights
        let light1 = new THREE.PointLight( 0xff0040, 2, 30 );
        light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
        light1.position.set(v, v, -v);
        flies.add( light1 );

        let light2 = new THREE.PointLight( 0x0040ff, 2, 30 );
        light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
        light2.position.set(-v, -v, -v);
        flies.add( light2 );

        let light3 = new THREE.PointLight( 0x80ff80, 2, 30 );
        light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
        light3.position.set(v, -v, v);
        flies.add( light3 );

        let light4 = new THREE.PointLight( 0xffaa00, 2, 30 );
        light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
        light4.position.set(-v, v, v);
        flies.add( light4 );

        flies.position.y = 0;

        this.scene.add( flies );

        //vars.loopFunctions.push([this.animateFlies, "ANIMATE_FLIES"]);
    }

    animateFlies(time){

        flies.rotation.y += .003;
        flies.rotation.x += .002;

        /*
        
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

        */
    }

    animatePositions(a){
      const basePositionAttribute = blob.geometry.getAttribute("basePosition");
      const positionAttribute = blob.geometry.getAttribute( 'position' );
      let newPositionAttribute = [];
      const vertex = new THREE.Vector3();

      for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++ ) {

          vertex.fromBufferAttribute( basePositionAttribute, vertexIndex );

          var perlin = simplex.noise3D(
              vertex.x * 0.0095 + a * 0.0002,
              vertex.y * 0.0095 + a * 0.0004,
              vertex.z * 0.0095 );

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

    animateGlobe(){
      globe.rotation.y += .0008;
    }

  }