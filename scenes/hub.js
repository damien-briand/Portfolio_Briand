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
import { transitionToIntro } from "../main.js";
import { intro_scene } from "./intro.js";

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
	camera.position.z = 21;
	camera.position.y = 3;
	camera.lookAt(0, 3, 0); // Oriente la caméra vers le centre

	const composer = new EffectComposer(renderer);

	// Interaction Mouse Declaration
	let raycastEnabled = true;
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
		model = await loadGLTF("/Portfolio_Briand/assets/OS_HUB_scene.glb", scene);
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

	// --- Reglages de la caméra ---
	window.addEventListener("resize", onWindowResize);
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
		composer.setSize(window.innerWidth, window.innerHeight);
	}

	// --- Gestion des modals ---
	function centerModal(modal) {
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
		const modalWidth = modal.offsetWidth;
		const modalHeight = modal.offsetHeight;
		modal.style.left = `${(windowWidth - modalWidth) / 8}px`;
		modal.style.top = `${(windowHeight - modalHeight) / 8}px`;
	}

	function openModal(modal) {
		centerModal(modal);
		modal.style.display = "block";
	}

	function closeModal(modal) {
		modal.style.display = "none";
	}

	// Ajout des listeners sur tous les boutons de fermeture
	document.querySelectorAll(".closeModalBtn").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			const modal = btn.closest(".modal");
			closeModal(modal);
		});
	});

	// Gestion du drag & drop pour tous les modals
	let isDragging = false,
		offsetX = 0,
		offsetY = 0,
		currentModal = null;
	document.querySelectorAll(".modal-header").forEach((header) => {
		header.addEventListener("mousedown", (e) => {
			currentModal = header.closest(".modal");
			isDragging = true;
			offsetX = e.clientX - currentModal.offsetLeft;
			offsetY = e.clientY - currentModal.offsetTop;
		});
	});
	document.addEventListener("mousemove", (e) => {
		if (isDragging && currentModal) {
			currentModal.style.left = `${e.clientX - offsetX}px`;
			currentModal.style.top = `${e.clientY - offsetY}px`;
		}

		const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
		if (
			elementUnderMouse &&
			elementUnderMouse.closest(".modal") &&
			elementUnderMouse.closest(".modal").style.display === "block"
		) {
			raycastEnabled = false;
			raycaster = new THREE.Raycaster();
			document.body.style.cursor = "default";
		} else {
			raycastEnabled = true;
		}
	});
	document.addEventListener("mouseup", () => {
		isDragging = false;
		currentModal = null;
	});

	// --- Affichage du modal au clic sur un objet ---
	document.addEventListener("click", onBoxClick);

	function onBoxClick(e) {
		// Si le clic est sur un modal, on ne fait rien
		if (
			e.target.closest(".modal") &&
			e.target.closest(".modal").style.display === "block"
		) {
			return;
		}
		if (!INTERSECTED || !INTERSECTED.isMesh) return;
		const findName = MATERIAL_NAME.find(
			(name) => name === INTERSECTED.material.name
		);
		if (findName) {
			const modal = document.getElementById(INTERSECTED.material.name);
			if (modal) openModal(modal);
		}
	}

	// Empêche la propagation du clic sur les modals
	document.querySelectorAll(".modal").forEach((modal) => {
		modal.addEventListener("click", (e) => {
			e.stopPropagation();
		});
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

	const buttonPowerOff = document.getElementById("power-off-button");
	buttonPowerOff.addEventListener("click", onPowerOff);

	function animate() {
		if (Math.abs(targetAngle - currentAngle) > 0.01) {
			currentAngle += (targetAngle - currentAngle) * rotationSpeed;
			rotationCameraReg(camera, currentAngle);
		}
		if (raycastEnabled) {
			raycaster.setFromCamera(pointer, camera);
			const intersects = raycaster.intersectObjects(scene.children, true);

			if (intersects.length > 0) {
				if (INTERSECTED != intersects[0].object) {
					if (INTERSECTED && INTERSECTED.isMesh) {
						// Restaure l'emissive initiale si elle existe
						if (INTERSECTED.initialEmissive !== undefined) {
							INTERSECTED.material.emissive.setHex(INTERSECTED.initialEmissive);
						}
					}

					INTERSECTED = intersects[0].object;

					if (INTERSECTED.isMesh) {
						// Sauvegarde l'état initial de l'emissive si ce n'est pas déjà fait
						if (INTERSECTED.initialEmissive === undefined) {
							INTERSECTED.initialEmissive =
								INTERSECTED.material.emissive.getHex();
						}

						const findName = MATERIAL_NAME.find(
							(name) => name === INTERSECTED.material.name
						);

						if (findName !== undefined) {
							document.body.style.cursor = "pointer";
							INTERSECTED.material.emissive.setHex(0xffffff);
						}
					}
				}
			} else {
				if (INTERSECTED && INTERSECTED.isMesh) {
					// Restaure l'emissive initiale si elle existe
					if (INTERSECTED.initialEmissive !== undefined) {
						INTERSECTED.material.emissive.setHex(INTERSECTED.initialEmissive);
					}
					document.body.style.cursor = "default";
					INTERSECTED = null;
				}
			}
		}
		composer.render();
	}

	addEventListener("keypress", () => {
		targetAngle += 0.4 * Math.PI; // Augmente l'angle cible
	});

	function onPowerOff() {
		document.removeEventListener("click", onBoxClick);
		document.removeEventListener("mousemove", onMouseMouve);
		const osMenu = (document.getElementById("os-menu").style.display = "none");
		scene.clear();
		document.body.querySelector("canvas").remove();
		transitionToIntro(() => {
			intro_scene();
		});
	}
}

function rotationCameraReg(camera, angle) {
	const radius = 21; // Rayon de la rotation
	camera.position.x = Math.sin(angle) * radius;
	camera.position.z = Math.cos(angle) * radius;
	camera.lookAt(0, 3, 0); // Oriente la caméra vers le centre
	camera.updateProjectionMatrix();
}

export { hub_scene };
