import * as THREE from 'three';
import anime from "animejs";

import Overlay from './overlay';

import Config from "../data/config";
import vars from "./vars";
import fx from "./fx";

const color = {r:Config.colors.night.r, g:Config.colors.night.g, b:Config.colors.night.b};
let sections, section;

export default class Timeline {
  constructor(main) {

    const _this = this;
    sections = document.querySelectorAll('main section');

    // init the overlay
    this.overlay = new Overlay();
    vars.overlay = this.overlay;

    // animate stars
    vars.loopFunctions.push([main.stars.animate, "ANIMATE_STARS", 0]);
        
    this.goto = {
      preloader: (callback) => {

        //console.log('[ timeline : preloader ]');
        this.fixSections([0]);

        anime({
          targets: color,
          r: Config.colors.day.r,
          g: Config.colors.day.g,
          b: Config.colors.day.b,
          duration: 1000,
          delay:10,
          easing: 'linear',
          update: function(){
            const c = "rgb("+Math.floor(color.r)+", "+Math.floor(color.g)+", "+Math.floor(color.b)+")";
            main.scene.fog = new THREE.FogExp2(c, Config.fog.near);
            main.scene.background = new THREE.Color(c);
          },
          complete:function(){
                        
            section.classList.add("play");
            
            setTimeout(() => {
                section.classList.add("full");
            }, 1444);

            setTimeout(() => {
                section.classList.add("done");
                setTimeout(() => { 
                  
                  _this.goto.intro();

                  anime.timeline()
                    .add({
                        targets: main.earth.object.position,
                        z: 0,
                        duration:3000,
                        delay: 555,
                        easing:"easeInOutQuad",
                        complete:()=>{
                            fx.removeFromLoop("ANIMATE_STARS");
                        }
                    }).add({
                        targets: main.earth.object.rotation,
                        y: 0,
                        duration:4000,
                        easing: "easeInOutQuad",
                        complete:()=>{
                            vars.isMouseActive = true;
                        }
                    }, 0);


                }, 1333);
            }, 3000);
          }
        });

      },
      intro: (callback) => {

        //console.log('[ timeline : intro ]');
        this.fixSections([1]);
        this.overlay.animate(section);

        //vars.main.globe.addMarkers();

        setTimeout(() => {
            //vars.main.globe.showMarkers();

            //vars.main.earth.animateCut();
            vars.main.addGlobe();

            anime({
                targets:vars.localPlanes,
                constant: 0,
                duration: 666,
                easing: "easeInOutCubic",
                complete:()=>{
                    vars.isCutActive = true;
                }
            })

        }, 4000);

        /*
        anime.timeline({loop:false,})
          .add({
            targets:main.camera.threeCamera.position,
            z:250,
            y:0,
            duration:2000,
            easing:"easeInOutCubic",
            delay:1000,
          }).add({
            targets:main.camera.threeCamera.rotation,
            x:0,
            duration:2000,
            easing:"easeInOutCubic"
          }, '-=2000').add({
            targets: main.earth.object.rotation,
            y: -110 * THREE.Math.DEG2RAD,
            x: 30 * THREE.Math.DEG2RAD,
            duration:6000,
            easing:"easeInOutQuad"
          }, '-=2000');
          */
                
      },
      globe: (callback) => {
        //console.log('[ timeline : globe ]');
        this.fixSections([2]);
        this.overlay.animateGlobe(section);

        document.body.classList.add("ready");

        setTimeout(() => {
            this.overlay.startGlobe();
        }, 5555);

        anime({
            targets: color,
            r: Config.colors.globe.r,
            g: Config.colors.globe.g,
            b: Config.colors.globe.b,
            duration: 1000,
            easing: 'linear',
            update: function(){
              const c = "rgb("+Math.floor(color.r)+", "+Math.floor(color.g)+", "+Math.floor(color.b)+")";
              main.scene.fog = new THREE.FogExp2(c, Config.fog.near);
              main.scene.background = new THREE.Color(c);
            },
        });
        //vars.isPaused = true;
        //fx.removeFromLoop("ANIMATE_STARS");
      },
      curtain: (n, callback) => {
        //console.log('[ timeline : transition curtain ]');
        this.fixSections([3]);
        this.overlay.animateCurtain("IN");
        document.body.classList.remove("hold");
      },
      section: (n, callback) => {
        //console.log('[ timeline : section'+n+' ]');
        this.fixSections([2, 4]);
        this.overlay.animate(section);
      },
      about: (n, callback) => {
        //console.log('[ timeline : section'+n+' ]');
        this.fixSections([5]);
        this.overlay.animate(section);
      }
    };

    const getTextures = ()=> new Promise((resolve, reject)=>{
      const loader = new THREE.TextureLoader();
      THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
        //console.log(url, loaded, total);
      }
      THREE.DefaultLoadingManager.onLoad = ()=>resolve(textures);
      const textures = [
        vars.path.textures + 'map2.jpg',
        vars.path.textures + 'elevation2.jpg',
        vars.path.textures + 'water.png',
        vars.path.textures + 'clouds.png'
      ].map(filename=>loader.load(filename));
    });
          
    getTextures().then(result=>{
      vars.textures = result;
      //console.log("We received,", result);
      setTimeout(() => { 
        main.addEarth();
        _this.goto.preloader();
        //vars.main.flipScene(1);
        //vars.main.initPlatform();
      }, 333);
    });

  }

  fixSections(n){
    for(var i=0; i<sections.length; ++i){
      if(n.includes(i)){
        sections[i].classList.remove("hide");
        section = sections[i];
      }else{
        sections[i].classList.add("hide");
      }
    }
  }
}
