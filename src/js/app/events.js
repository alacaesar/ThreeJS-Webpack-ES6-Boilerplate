import anime from "animejs";
import vars from "./vars";

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

    document.addEventListener("mousemove", (e)=> vars.mouseCoords = {x:e.clientX/vars.windowSize.width, y:e.clientY/vars.windowSize.height} );

    document.querySelector(".flip").addEventListener("click", function(){
      vars.main.flipScene();
    });
  }

  /* global handlers */
  milestoneClickHandler(n){
    let _this = this;
    let id = n.target.getAttribute("id");
    let milestone = vars.milestones[id];
    console.log(milestone.city, milestone.position, 'clicked');

    const curtain = document.querySelector(".curtain");
          curtain.classList.remove("hide");
    this.prepareTransition(milestone);

    var altitude = 100;
    
    var coeff = 1+ altitude/(vars.globeRadius + 12);

    vars.isMouseActive = false;
    vars.isPauseLoopFunctions = true;

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
    vars.main.warpIn(()=>{
      vars.main.timeline.goto.curtain();
    });
  }

  prepareTransition(milestone){
    let h2 = document.querySelector(".curtain h2");
        h2.innerText = milestone.city;
    let _h = h2.getBoundingClientRect().height;
    let text = milestone.city;

    h2.innerHTML = "";

    for (var i = 0; i < 6; ++i) {
      let div = document.createElement("div");
      let ratio = (10 - i * 1.2) / 10;
      div.style.cssText = "height:" + (_h * ratio) + "px; " + (i == 1 ? " color:#DCDFE3;" : "");
      div.innerHTML = "<span>" + text + "</span>";

      h2.appendChild(div);
    }
  }

}
