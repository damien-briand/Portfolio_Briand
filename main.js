import { scene001 } from "./scenes/001.js";
import { intro_scene } from "./scenes/intro.js";
import { hub_scene } from "./scenes/hub.js";

const timeAnimationIntro = 6000;
const timeAnimationHub = 5000;

function transitionToIntro(callback) {
    document.getElementById("hub").style.display = "none";
    if (callback) callback();

    setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none";
    }, timeAnimationIntro);
}

function transitionToHUB(callback) {
    document.getElementById("hub").style.display = "flex";
    document.getElementById("intro").style.display = "none";

    const topBar = document.querySelector(".top-bar");
    const bottomBar = document.querySelector(".bottom-bar");

    setTimeout(() => {
        document.getElementById("transition-screen").style.display = "none";
    }, timeAnimationHub);
    if (callback) callback();
}

transitionToIntro(() => {
    intro_scene();
});

export { transitionToIntro, transitionToHUB };
