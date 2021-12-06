// Global imports -
import * as THREE from 'three';
import vars from '../vars';

let stars = [];
let radius = 500;
let sphere;

export default class Stars {
    constructor(main) {
        this.init(main);
    }
  
    init(main) {

        this.scene = main.scene;

        for ( var z= -radius; z < radius; z+=10 ) {

            var geometry   = new THREE.SphereGeometry(0.4, 3, 3)
            var material = new THREE.MeshBasicMaterial( {color: 0x4FA1D8} );
            sphere = new THREE.Mesh(geometry, material)

            sphere.position.x = Math.random() * radius - (radius*.5);
            sphere.position.y = Math.random() * radius - (radius*.5);

            sphere.position.z = z;

            sphere.scale.x = sphere.scale.y = 2;

            this.scene.add( sphere );
            stars.push(sphere); 
        }

        //vars.loopFunctions.push([this.animate, "ANIMATE_STARS"]);
    }

    animate(){
        
        
        for(var i=0; i<stars.length; i++) {
			
			let star = stars[i]; 
			star.position.z +=  i/10;
				
			if(star.position.z>radius) star.position.z-=radius*2; 
			
		}
        
       //sphere.rotation.y += 1;
    }
  }