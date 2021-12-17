import * as THREE from 'three';
import anime, { timeline } from "animejs";
import vars from "./vars";

let audio, equilizer, statueInside, readTimer, j = 0, audioPaused = true;

let pointer = new THREE.Raycaster(),
    mouseXY = new THREE.Vector2(),
    selected = null,
    selectedID = null,
    dots;

let bip;

// Controls based on orbit controls
export default class Events {
  constructor(main) {
    // do nothing;
    this.main = main;
  }

  init(main) {

    window.addEventListener("blur", () => vars.isPaused = true );
    window.addEventListener("focus", () => {
        vars.isPaused = false; 
        main.render(); 
    } );

    document.addEventListener("mousemove", (e)=> this.onMouseMoveHandler(e), false);
    bip = document.querySelector("audio.bip");

    let btns = document.querySelectorAll("button");

    for(var i=0; i<btns.length; ++i){
      let btn = btns[i];
      btn.addEventListener("click", (e)=> this.buttonClickSwitcher(e), false );
      btn.addEventListener("mouseenter", (e)=> this.buttonHoverHandler(e), false);
    }

    audio = document.querySelector("audio.vo");
    equilizer = document.querySelector(".equilizer");
    equilizer.querySelectorAll("animate").forEach(element => { element.setAttribute("repeatCount", "0"); });
    statueInside = document.querySelector(".statue .inside");
    statueInside.addEventListener("click", (e)=> this.onAudioClick(e), false );

    main.container.addEventListener('click', (e)=> this.onMouseDownHandler(e), false);

    dots = document.querySelectorAll("ul.milestones li");

  }

  buttonHoverHandler(e){
    bip.play();
  }

  onMouseMoveHandler(e){
    vars.mouseCoords = {x:e.clientX/vars.windowSize.width, y:e.clientY/vars.windowSize.height};

    mouseXY.set(
      (e.clientX / vars.windowSize.width) * 2 - 1,
      - (e.clientY / vars.windowSize.height) * 2+1
    );

    pointer.setFromCamera( mouseXY, vars.main.camera.threeCamera );

    var intersects = pointer.intersectObjects( vars.main.globe.markers.children, true );
    if( intersects.length > 0){
      selected = intersects[0].object;
      if( selectedID != selected.name){
        selectedID = selected.name;
        dots.forEach(element => {element.classList.remove("hover"); });
        dots[selected.name].classList.add("hover");
        this.buttonHoverHandler();
      }
    }else{
      dots.forEach(element => {element.classList.remove("hover"); });
      selected = null;
      selectedID = null;
    }
  }

  onMouseDownHandler(){
    if(selected != null){
      this.gotoMilestone(selected.name);
    }
  }

  buttonClickSwitcher(e){
    let _this = this;
    let c = e.target.getAttribute("class");
    bip.play();
    switch(c){
      case "backBtn" :
        _this.backClickHandler();
      break;
      case "nextBtn" :
        _this.nextClickHandler("NEXT");
      break;
      case "previousBtn" :
        _this.nextClickHandler("PREV");
      break;
      case "startBtn" :
        _this.startClickHandler();
      break;
    }
  }

  startClickHandler(){
    console.log('sfkhdskfhsdf');
    vars.overlay.startGlobe();
  }

  nextClickHandler(DIRECTION){

    vars.isMouseActive = false;
    vars.isPauseLoopFunctions = true;

    let milestone;

    if(DIRECTION == "NEXT"){
      milestone = vars.currentMilestone.id < vars.milestones.length-1 ? 
      vars.milestones[vars.currentMilestone.id+1] :
      vars.milestones[0];
    }else{
      milestone = vars.currentMilestone.id > 0 ? 
      vars.milestones[vars.currentMilestone.id-1] :
      vars.milestones[vars.milestones.length-1];
    }

    vars.currentMilestone = milestone;
    vars.overlay.initCurtain(milestone);

    anime({
      targets: vars.main.platform.scene.rotation,
      y:(Math.random() - .5) * 200 * THREE.Math.DEG2RAD,
      x: Math.random() * 100 * THREE.Math.DEG2RAD,
      easing: 'easeInOutExpo',
      duration:2000, 
    });
    
    vars.main.warp("IN", ()=>{
      vars.main.timeline.goto.curtain();
      setTimeout(() => {
        vars.overlay.initStatue();
        vars.main.resetPlatform();
        vars.main.platform.addModel();
        vars.overlay.animateCurtain("OUT", ()=>{

          /*
          anime({
            targets: vars.main.platform.scene.rotation,
            y:[(Math.random() - .5) * 200 * THREE.Math.DEG2RAD, 0],
            x:[30 * THREE.Math.DEG2RAD, 0],
            easing: 'easeInOutExpo',
            duration:5000, 
          });
          */

          vars.main.warp("OUT", ()=>{
            vars.main.timeline.goto.section();
            vars.isMouseActive = true;
            vars.isPauseLoopFunctions = false;
          });
        });
      }, 1000);
    });
  }

  backClickHandler(){
    let milestone = vars.currentMilestone;

    vars.isMouseActive = false;
    vars.isPauseLoopFunctions = true;

    vars.main.warp("RIN", ()=>{
      vars.main.flipScene(0);
      vars.main.resetPlatform();

      var altitude = 100;
      var coeff = 1+ altitude/(vars.globeRadius + 12);

      vars.main.camera.threeCamera.position.set(
        milestone.position.x * coeff,
        milestone.position.y * coeff,
        milestone.position.z * coeff,
      );
      vars.main.camera.threeCamera.lookAt(0, 0, 0);

      vars.main.warp("ROUT", ()=>{

        var altitude = 200;
        var coeff = 1+ altitude/(vars.globeRadius + 12);

        anime({
          targets:vars.main.camera.threeCamera.position,
          x: milestone.position.x * coeff,
          y: milestone.position.y * coeff,
          z: milestone.position.z * coeff,
          duration:2000,
          easing: 'easeOutCubic',
          update: ()=>{ vars.main.camera.threeCamera.lookAt(0, 0, 0); },
        })

        vars.isMouseActive = true;
        vars.isPauseLoopFunctions = false;

        vars.main.timeline.goto.globe();
      });
    });
  }

  onAudioClick(e){

    console.log('slkhdkfhdkfhskhfkhsdkfhksdhkfls');

    if(audioPaused){

      audioPaused = false;

      let count = statueInside.querySelector("p.off").getAttribute("data-count");
      let words = statueInside.querySelectorAll("p.off span.letter");
      let time = vars.currentMilestone.time;
      let tickTime = (time*0.92)/count;

      audio.play();
      equilizer.querySelectorAll("animate").forEach(element => { element.setAttribute("repeatCount", "indefinite"); });

      statueInside.classList.add("cursor-pause");
      statueInside.classList.remove("cursor-play");

      readTimer = setInterval(()=>{ 
        words[j].style.cssText = "opacity:1";
        if(j < words.length - 1){ 
          j++; 
        }else{
          clearInterval(readTimer);
          statueInside.classList.remove("cursor-pause");
          statueInside.classList.add("cursor-play");
          equilizer.querySelectorAll("animate").forEach(element => { element.setAttribute("repeatCount", "0"); });
          j=0;
        }
      
      }, tickTime * 1000);

    }else{
      audioPaused = true;
      audio.pause();
      equilizer.querySelectorAll("animate").forEach(element => { element.setAttribute("repeatCount", "0"); });
      clearInterval(readTimer);
      statueInside.classList.remove("cursor-pause");
      statueInside.classList.add("cursor-play");
    }
  }

  /* global handlers */
  milestoneClickHandler(n){
    let id = n.target.getAttribute("id");
    this.gotoMilestone(id);
  }

  gotoMilestone(id){
    let _this = this;
    let milestone = vars.milestones[id];

    vars.currentMilestone = milestone;

    document.body.classList.add("hold");

    console.log(milestone.city, milestone.position, 'clicked');

    vars.overlay.initStatue();
    vars.overlay.initCurtain(milestone);

    vars.isMouseActive = false;
    vars.isPauseLoopFunctions = true;

    var altitude = 100;
    var coeff = 1+ altitude/(vars.globeRadius + 12);

    anime.timeline().add({
      targets: vars.main.camera.threeCamera.position,
      x: milestone.position.x * coeff,
      y: milestone.position.y * coeff,
      z: milestone.position.z * coeff,
      duration:3000,
      easing: 'easeInOutCubic',
      update: ()=>{ vars.main.camera.threeCamera.lookAt(0, 0, 0); },
      complete: _this.handleTransition
    }).add({
      targets: vars.main.scene.rotation,
      x:0,
      y:0,
      easing: 'easeInOutCubic',
      duration:3000,
    }, 0); 
  }

  handleTransition(){
    vars.main.warp("IN", ()=>{
      vars.main.timeline.goto.curtain();
      setTimeout(() => {
        vars.main.flipScene(1);
        vars.main.initPlatform();
        vars.overlay.animateCurtain("OUT", ()=>{

          anime({
            targets: vars.main.platform.scene.rotation,
            y:[(Math.random() - .5) * 200 * THREE.Math.DEG2RAD, 0],
            x:[30 * THREE.Math.DEG2RAD, 0],
            easing: 'easeInOutExpo',
            duration:5000, 
          });

          vars.main.warp("OUT", ()=>{
            vars.main.timeline.goto.section();
            vars.isMouseActive = true;
            vars.isPauseLoopFunctions = false;
          });
        });
      }, 1000);

      //

    });
  }

}
