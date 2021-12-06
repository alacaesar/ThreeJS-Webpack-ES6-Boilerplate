import anime from "animejs";

import vars from "./vars";
import Events from "./events";

var events = new Events();

export default class Overlay {
    constructor() {
        this.container = document.getElementById('overlay');
        this.init();
        this.initGlobe();
    }

    init(){
        var textWrappers = document.querySelectorAll(".off");
        for(var i=0; i<textWrappers.length; ++i){
            let text = textWrappers[i];

            if(text.classList.contains("anim-letters")){
                text.innerHTML = text.textContent.replace(/\S/g, "<span class='letter'><span>$&</span></span>");
            }
            else if(text.classList.contains("anim-words")){
                text.innerHTML = "<span class='letter'><span>" + text.textContent.replaceAll(" ", "</span></span> <span class='letter'><span>") + "</span></span>";
            }
        }
    }

    initGlobe(){
        const ul = document.querySelector("ul.milestones");
        for(var i=0; i<vars.milestones.length; ++i){
            let li = document.createElement("li");
            let an = document.createElement("a");
                an.setAttribute("href", "javascript:void(0);");
                an.id = i;
                an.addEventListener('click', (e)=>{ events.milestoneClickHandler(e); }, false);
                an.innerHTML = '<span>'+vars.milestones[i].city+'</span>';
                li.appendChild(an);
                ul.appendChild(li);
        }
    }

    animateCurtain(section, direction){
        if(direction == "IN"){
            section.classList.add("in");
            anime.timeline({
                loop: false
              })
              .add({
                targets: section.querySelectorAll('h2 span'),
                translateY: ["100%", 0],
                easing: "easeOutExpo",
                duration: (el, i) => 950 + 150 * i,
                delay: (el, i) => 66 * i
              });
        }
    }

    animate(section){
        let texts = section.querySelectorAll(".off");

        for(var i=0; i<texts.length; ++i){
            anime.timeline({loop:false})
            .add({
                targets: texts[i].querySelectorAll(".letter span"),
                translateY: ['100%',0],
                easing: "easeOutExpo",
                duration: 999,
                delay: (el, i) => 99 * i
            }).add({
                targets: texts[i],
                translateY: ['-40%', 0],
                scale:[1.2, 1],
                easing: "easeOutCubic",
                duration: 2222,
            }, 0);
        }
    }

}