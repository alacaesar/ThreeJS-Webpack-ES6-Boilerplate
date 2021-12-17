import anime from "animejs";

import vars from "./vars";
import Events from "./events";

var events = new Events();
var curtain = null;

export default class Overlay {
    constructor() {
        this.container = document.getElementById('overlay');

        this.initText(document);
        this.initGlobe();
    }

    initText(ID){
        var textWrappers = ID.querySelectorAll(".off");
        for(var i=0; i<textWrappers.length; ++i){
            let text = textWrappers[i];

            text.setAttribute("data-count", text.textContent.split(' ').length);

            if(text.classList.contains("anim-letters")){
                text.innerHTML = "<span class='word'>" + text.textContent.replaceAll(" ", "</span> <span class='word'>") + "</span>";
                let words = text.querySelectorAll("span.word");
                    for(var k=0; k<words.length; ++k){
                        words[k].innerHTML = words[k].textContent.replace(/\S/g, "<span class='letter'><span>$&</span></span>");
                    }
            }
            else if(text.classList.contains("anim-words")){
                //text.innerHTML = "<span class='letter'><span>" + text.textContent.replaceAll(" ", "</span></span> <span class='letter'><span>") + "</span></span>";
                let arr = text.textContent.split(" ");
                    arr = arr.map(n=>n.replaceAll('<$', '<i>').replaceAll('$>', '</i>'));
                text.innerHTML = '<span class="letter"><span>' + arr.join("</span></span> <span class='letter'><span>") + "</span></span>";
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
                an.addEventListener('mouseenter', (e)=>{ events.buttonHoverHandler(e); }, false);
                an.innerHTML = '<svg width="100" height="100"><defs><linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#B3DBF5"></stop><stop offset="10%" stop-color="#38B0FF"></stop><stop offset="100%" stop-color="#003DB2"></stop></linearGradient></defs><circle cx="50" cy="50" r="49" stroke="url(#gradient)" stroke-width="1" fill="none"></circle></svg><span>'+vars.milestones[i].city+'<i>'+vars.milestones[i].year+'</i></span>';
                li.appendChild(an);
                ul.appendChild(li);
        }
    }

    initStatue(){
        let milestone = vars.currentMilestone;

        let container = document.querySelector(".statue");
        container.querySelector(".where").innerHTML = milestone.city;
        container.querySelector(".when").innerHTML = milestone.year;
        container.querySelector("h3").innerHTML =  milestone.title;
        container.querySelector("p").innerHTML = milestone.description;
        container.querySelector("audio").setAttribute("data-time", milestone.time);
        container.querySelector("audio").setAttribute("src", "/assets/audios/" + milestone.sound);

        this.initText(container);
    }

    startGlobe(){
        let inside = document.querySelector(".globe .inside");
        let texts = document.querySelectorAll(".globe .off span.letter span");
        let btns = document.querySelectorAll(".globe button");
        let stones = document.querySelectorAll(".globe .milestones li");

        anime.timeline({loop:false})
        .add({
            targets: texts,
            translateY: [0, '100%'],
            easing: "easeInCubic",
            duration: 555,
            delay: (el, i) => 55 * i,
            complete: () => inside.classList.add("hide")
        }).add({
            targets: btns,
            opacity: 0,
            translateY: [0, 30],
            duration: 555,
            easing: "easeInCubic",
            
        }, 0).add({
            targets: stones,
            translateY: [0, -10, 15, 0],
            easing: "easeInOutCubic",
            duration: 999,
            delay: (el, i) => 55 * i
        });
    }

    initCurtain(milestone){
        curtain = document.querySelector(".curtain");
        curtain.classList.remove("hide");
        
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

    animateCurtain(DIRECTION, callback){
        if(DIRECTION == "IN"){
            curtain.classList.add("in");
            anime({
                targets: '.curtain h2 span',
                translateY: ["100%", 0],
                easing: "easeOutExpo",
                duration: (el, i) => 950 + 150 * i,
                delay: (el, i) => 66 * i
              });
        }else{
            anime({
                targets: '.curtain h2 span',
                translateY: [0, "-100%"],
                easing: "easeInCubic",
                duration: (el, i) => 1150 - 160 * i,
                complete:()=>{ 
                    curtain.classList.remove("in");
                    if(callback) callback();
                }
              }); 
        }
    }

    animate(section){
        let texts = section.querySelectorAll(".off");

        for(var i=0; i<texts.length; ++i){
            texts[i].style.opacity = 1;
            anime.timeline({loop:false})
            .add({
                targets: texts[i].querySelectorAll(".letter span"),
                translateY: ['100%',0],
                easing: "easeOutExpo",
                duration: 999,
                delay: (el, i) => 99 * i
            }).add({
                targets: texts[i],
                translateY: ['40%', 0],
                //scale:[1.2, 1],
                easing: "easeOutCubic",
                duration: 2222,
            }, 0);
        }
    }

}