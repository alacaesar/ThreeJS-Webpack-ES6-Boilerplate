import * as THREE from 'three';
import anime, { timeline } from "animejs";
import vars from "./vars";

let audio, equilizer, statueInside, readTimer, j = 0, audioPaused = true;

let pointer = new THREE.Raycaster(),
    mouseXY = new THREE.Vector2(),
    selected = null,
    selectedID = null,
    dots;

let bip, ambient, promise, musicBtn;

// Controls based on orbit controls
export default class Events {
  constructor(main) {
    // do nothing;
    this.main = main;
  }

  init(main) {

    window.addEventListener("blur", () => {
      vars.isPaused = true;
      if (promise !== undefined) {
        promise.then(_ => {
          ambient.pause();
        }).catch(error => {
          // do nothing
        });
      }
    } );
    window.addEventListener("focus", () => {
        vars.isPaused = false; 
        main.render();
        if(!musicBtn.classList.contains("paused")){
          ambient.play();
        }
    } );

    document.addEventListener("mousemove", (e)=> this.onMouseMoveHandler(e), false);
    bip = document.querySelector("audio.bip");

    let btns = document.querySelectorAll("button");

    for(var i=0; i<btns.length; ++i){
      let btn = btns[i];
      btn.addEventListener("click", (e)=> this.buttonClickSwitcher(e), false );
      btn.addEventListener("mouseenter", (e)=> this.buttonHoverHandler(e), false);
    }

    musicBtn = document.querySelector("button.music");
    ambient = document.querySelector("audio.ambient");
    audio = document.querySelector("audio.vo");
    equilizer = document.querySelector(".equilizer");
    equilizer.querySelectorAll("animate").forEach(element => { element.setAttribute("repeatCount", "0"); });
    statueInside = document.querySelector(".statue .inside");
    statueInside.addEventListener("click", (e)=> this.onAudioClick(e), false );

    main.container.addEventListener('click', (e)=> this.onMouseDownHandler(e), false);

    dots = document.querySelectorAll("ul.milestones li");

  }

  buttonHoverHandler(e){
    promise = bip.play();
    if (promise !== undefined) {
      promise.then(_ => {
        // Autoplay started!
      }).catch(error => {
        // Autoplay was prevented.
        // Show a "Play" button so that user can start playback.
      });
    }
  }

  onMouseMoveHandler(e){
    vars.mouseCoords = {x:e.clientX/vars.windowSize.width, y:e.clientY/vars.windowSize.height};
    if(vars.isGlobeActive) this.handleIntersects(e);
  }

  handleIntersects(e){
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
      this.markerClickHandler(selected.name);
      selected = null;
    }
  }

  buttonClickSwitcher(e){
    let _this = this;
    let c = e.target.getAttribute("id");
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
      case "introStartBtn" :
        _this.introStartClickHandler();
      break;
      case "musicBtn" :
        _this.musicClickHandler();
      break;
      case "readMoreBtn" :
        _this.readMoreClickHandler();
      break;
      case "closeAboutBtn" :
        _this.closeAboutClickHandler();
      break;
    }
  }

  readMoreClickHandler(){
    vars.isPaused = true;
    vars.overlay.animateAbout();
  }

  closeAboutClickHandler(){
    vars.isPaused = false;
    vars.overlay.animateAboutClose();
    vars.main.render();
  }

  musicClickHandler(){
    if(musicBtn.classList.contains("paused")){
      musicBtn.classList.remove("paused");
      ambient.play();
    }else{
      musicBtn.classList.add("paused");
      ambient.pause();
    }
  }

  introStartClickHandler(){
    vars.isCutActive = false;
    anime.timeline().add({
      targets:vars.localPlanes,
      constant: -500,
      duration: 1000,
      easing: "easeInOutCubic"
    }).add({
      targets:vars.localPlanes[1],
      constant: 500,
      duration: 1000,
      easing: "easeInOutCubic",
      complete:()=>{
        vars.main.earth.dispose();
      }
    }, 0).add({
      targets:vars.main.camera.threeCamera.position,
      z: 340,
      duration: 2000,
      easing: "easeInOutCubic"
    }, 0);

    vars.main.timeline.goto.globe();

    ambient.volume = .2;
    ambient.play();
    musicBtn.classList.remove("paused");

    setTimeout(()=>{
      vars.main.globe.addMarkers();
      setTimeout(()=>{ 
        vars.main.globe.showMarkers();
        vars.main.controls.threeControls.enabled = true;
        vars.isGlobeActive = true;
      }, 1000);
    }, 2000);
  }

  startClickHandler(){
    vars.overlay.startGlobe();
  }

  nextClickHandler(DIRECTION){

    j = 0;

    vars.isMouseActive = false;
    vars.isPauseLoopFunctions = true;

    let milestone;

    if(DIRECTION == "NEXT"){
      milestone = vars.currentMilestone.id < vars.milestones.length-1 ? 
      vars.milestones[vars.currentMilestone.id+1] :
      vars.milestones[0];
    }else if(DIRECTION == "PREV"){
      milestone = vars.currentMilestone.id > 0 ? 
      vars.milestones[vars.currentMilestone.id-1] :
      vars.milestones[vars.milestones.length-1];
    }else if(Number.isInteger(DIRECTION)){
      milestone = vars.milestones[DIRECTION];
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
      vars.main.disposePlatform();

      var altitude = 100;
      var coeff = 1+ altitude/(vars.globeRadius + 12);

      vars.main.camera.threeCamera.position.set( milestone.position.x * coeff, milestone.position.y * coeff, milestone.position.z * coeff);
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
        vars.isGlobeActive = true;

        vars.main.timeline.goto.globe();
      });
    });
  }

  onAudioClick(e){

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
          audioPaused = true;
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

    let id = parseInt(n.target.getAttribute("id"));

    j = 0;

    if(vars.isGlobeActive == false && id != vars.currentMilestone.id){
      this.nextClickHandler(id);
    }
    else if(vars.isGlobeActive == true){
      if(vars.currentMilestone == null){
        this.startClickHandler();
      }
      this.gotoMilestone(id);
      vars.isGlobeActive = false;
    }
  }

  markerClickHandler(id){
    if(vars.currentMilestone == null){
      this.startClickHandler();
    }
    this.gotoMilestone(id);
  }

  gotoMilestone(id){
    let _this = this;
    let milestone = vars.milestones[id];

    j = 0;
    this.startClickHandler();

    vars.currentMilestone = milestone;

    document.body.classList.add("hold");

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
      complete: ()=>{
        _this.handleTransition();
        vars.isGlobeActive = false;
      }
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
        setTimeout(()=>{
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
        }, 555);
      }, 1000);

      //

    });
  }

}
