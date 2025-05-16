/*
    Scene Ecran HUB
    Style PS1
*/

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { DotScreenShader } from "../shaders/DotScreenShader.js";
import { loadGLTF } from "../script/gltf_loader.js";
import { HDRI_Loader } from "../script/hdri_loader.js";

const CUBE_NAME = [
	"Cube003_3",
	"Cube005_1",
	"Cube089",
	"Cube001_1",
	"Cube038_1",
];
const MATERIAL_NAME = ["ME", "PROJECT", "COMP", "ETUDE", "CONTACT"];

async function hub_scene() {
	let camera;

	let currentAngle = 0; // Angle actuel
	let targetAngle = 0; // Angle cible
	const rotationSpeed = 0.03; // Vitesse de l'animation

	const renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	document.body.querySelector("canvas").remove();
	document.body.appendChild(renderer.domElement);

	//
	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.z = 20;
	camera.position.y = 3;
	camera.lookAt(0, 3, 0); // Oriente la caméra vers le centre

	const composer = new EffectComposer(renderer);

	// Interaction Mouse Declaration
	let raycaster = new THREE.Raycaster();
	let INTERSECTED;
	let pointer = new THREE.Vector2();

	window.addEventListener("mousemove", onMouseMouve);
	function onMouseMouve(event) {
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}
	//

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x727790); // Orange
	scene.fog = new THREE.Fog(0x000000, 1, 1000);
	/* ---------- GLTF LOADER ---------- */
	let model;
	let mixer;
	try {
		model = await loadGLTF("/assets/OS_HUB_scene.glb", scene);
		model.traverse((child) => {
			if (child.isMesh) {
				model.receiveShadow = true;
				model.castShadow = true;
			}
			if (child.name === "Camera") {
				camera = child;
			}
		});
		mixer = new THREE.AnimationMixer(model);
	} catch (error) {
		console.error("An error happened", error);
	}

	scene.add(new THREE.AmbientLight(0xcccccc));
	const gridHelper = new THREE.GridHelper(100, 50, 0xff0000, 0x00ff00);
	gridHelper.position.y = -0.4;
	scene.add(gridHelper);

	// postprocessing
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	const effect1 = new ShaderPass(DotScreenShader);
	effect1.uniforms["scale"].value = 10;
	composer.addPass(effect1);

	const effect2 = new ShaderPass(RGBShiftShader);
	effect2.uniforms["amount"].value = 0.0015;
	composer.addPass(effect2);

	const effect3 = new OutputPass();
	composer.addPass(effect3);

	//
	window.addEventListener("resize", onWindowResize);
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
		composer.setSize(window.innerWidth, window.innerHeight);
	}

	//const modal = document.getElementById("modal");
	let modal = document.getElementById("ME");
	const closeModalBtn = document.getElementsByClassName("closeModalBtn");
	document.addEventListener("click", onBoxClick);
	function onBoxClick() {
		let findName = MATERIAL_NAME.find(
			(name) => name === INTERSECTED.material.name
		);
		if (INTERSECTED.isMesh && findName != undefined) {
			modal = document.getElementById(INTERSECTED.material.name);
			modal.style.display = "block";
		}
	}

	for (let i = 0; i < closeModalBtn.length; i++) {
		closeModalBtn[i].addEventListener("click", () => {
			modal.style.display = "none";
		});
	}

	// Rendre la fenêtre modale déplaçable
	const allModalsHeader = document.getElementsByClassName("modal-header");
	let isDragging = false;
	let offsetX, offsetY;

	for (let i = 0; i < allModalsHeader.length; i++) {
		allModalsHeader[i].addEventListener("mousedown", (e) => {
			isDragging = true;
			offsetX = e.clientX - modal.offsetLeft;
			offsetY = e.clientY - modal.offsetTop;
		});
	}

	document.addEventListener("mousemove", (e) => {
		if (isDragging) {
			modal.style.left = `${e.clientX - offsetX}px`;
			modal.style.top = `${e.clientY - offsetY}px`;
		}
	});

	document.addEventListener("mouseup", () => {
		isDragging = false;
	});

	const buttonMenu = document.getElementById("menu-button");
	buttonMenu.addEventListener("click", () => {
		const osMenu = document.getElementById("os-menu");
		if (osMenu.style.display === "none" || osMenu.style.display === "") {
			osMenu.style.display = "block";
		} else {
			osMenu.style.display = "none";
		}
	});

	function animate() {
		if (Math.abs(targetAngle - currentAngle) > 0.01) {
			currentAngle += (targetAngle - currentAngle) * rotationSpeed;
			rotationCameraReg(camera, currentAngle);
		}
		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects(scene.children, true);

		if (intersects.length > 0) {
			if (INTERSECTED != intersects[0].object) {
				if (INTERSECTED && INTERSECTED.isMesh)
					INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

				INTERSECTED = intersects[0].object;
				let findName = MATERIAL_NAME.find(
					(name) => name === INTERSECTED.material.name
				);
				if (findName != undefined) {
					document.body.style.cursor = "pointer";
					INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
					INTERSECTED.material.emissive.setHex(0xffffff);
				}
			}
		} else {
			if (INTERSECTED && INTERSECTED.isMesh) {
				document.body.style.cursor = "auto";
				INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
				INTERSECTED = null;
			}
		}

		composer.render();
	}

	addEventListener("keypress", () => {
		targetAngle += 0.4 * Math.PI; // Augmente l'angle cible
	});
}

function rotationCameraReg(camera, angle) {
	const radius = 20; // Rayon de la rotation
	camera.position.x = Math.sin(angle) * radius;
	camera.position.z = Math.cos(angle) * radius;
	camera.lookAt(0, 3, 0); // Oriente la caméra vers le centre
	camera.updateProjectionMatrix();
}

export { hub_scene };
