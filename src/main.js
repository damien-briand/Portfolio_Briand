import { scene001 } from "./scenes/001.js";

const timeAnimation = 3000; 

function showTransition(callback) {
    const topBar = document.querySelector(".top-bar");
    const bottomBar = document.querySelector(".bottom-bar");
    const text = document.getElementById("transition-text");

    topBar.style.transform = "translateY(0)";
    bottomBar.style.transform = "translateY(0)";

    setTimeout(() => {
        document.getElementById("transition-screen").style.display = "none";
        if (callback) callback();
    }, timeAnimation);
}

showTransition(() => {
    scene001();
});