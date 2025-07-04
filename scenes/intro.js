/* 
	Scene Bureau
	Première scène du portfolio
	Cliqué sur le bouton du PC 3D pour passer a l'autre scène
	Aprés Animation de la Camera
*/

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { loadGLTF } from "../script/gltf_loader.js";
import { transitionToHUB } from "../main.js";
import { hub_scene } from "./hub.js";

async function intro_scene() {
	const scene = new THREE.Scene();
	const COLOR_SCENE = 0x222222;
	scene.background = new THREE.Color(COLOR_SCENE);
	// scene.fog = new THREE.Fog(COLOR_SCENE, 1, 100);

	let camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	let raycaster = new THREE.Raycaster();
	let INTERSECTED;
	let pointer = new THREE.Vector2();

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	document.body.appendChild(renderer.domElement);

	/* ---------- ADD SECTION ---------- */
	let mouseX = 0;
	let mouseY = 0;
	let scrollOffsetY = 0; // Variable pour stocker le décalage dû au scroll
	let mouseFactor = 0.5; // Ajustez le facteur pour contrôler la distance
	let mouseSpeed = 0.05; // Ajustez le facteur pour contrôler la vitesse
	window.addEventListener("mousemove", onMouseMouve);
	function onMouseMouve(event) {
		mouseX = (event.clientX / window.innerWidth) * 2 - 1;
		mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
		pointer.x = mouseX;
		pointer.y = mouseY;
	}

	const ambientLight = new THREE.AmbientLight(0xffffff, 1);
	scene.add(ambientLight);

	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(0, 4, 0); //default; light shining from top
	light.castShadow = true; // default false
	scene.add(light);

	/* ---------- GLTF LOADER ---------- */
	let model;
	let mixer;
	try {
		model = await loadGLTF("/assets/Intro_Scene.glb", scene);
		model.traverse((child) => {
			if (child.isMesh) {
				model.receiveShadow = true;
				model.castShadow = true;
			}
			if (child.name === "Camera") {
				camera = child;
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
			}
		});
	} catch (error) {
		console.error("Fail to load GLTF : ", error);
	}

	const renderScene = new RenderPass(scene, camera);
	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		0.3,
		0.1,
		0.85
	);
	const ssaoPass = new SSAOPass(
		scene,
		camera,
		window.innerWidth,
		window.innerHeight
	);

	const outputPass = new OutputPass();

	const composer = new EffectComposer(renderer);
	composer.setSize(window.innerWidth, window.innerHeight);
	composer.addPass(renderScene);
	composer.addPass(bloomPass);
	composer.addPass(ssaoPass);
	composer.addPass(outputPass);

	renderer.setAnimationLoop(animate);

	window.addEventListener("resize", onWindowResize);
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
		composer.setSize(window.innerWidth, window.innerHeight);
	}

	document.addEventListener("click", onIntersect);
	function onIntersect() {
		if (INTERSECTED.isMesh && INTERSECTED.name === "Power_PC") {
			transitionToHUB(() => {
				hub_scene();
			});
			document.removeEventListener("click", onIntersect);
			window.removeEventListener("mousemove", onMouseMouve);
		}
		if (INTERSECTED.isMesh && INTERSECTED.material.name === "Rasp"){
			window.location.href = "/pages/galerie.html";
		}
	}

	let powerPCMesh;
	let powerPCMeshMaterial;

	function animate() {
		camera.position.x +=
			(mouseX * mouseFactor - camera.position.x) * mouseSpeed;
		camera.position.y +=
			(mouseY * mouseFactor + scrollOffsetY - camera.position.y + 2.5) *
			mouseSpeed;

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

					if (INTERSECTED.name === "Power_PC" || INTERSECTED.material.name === "Rasp") {
						document.body.style.cursor = "pointer";
						INTERSECTED.material.emissive.setHex(0x00ff00);
					} else {
						document.body.style.cursor = "default";
					}
				}
			}
		} else {
			if (INTERSECTED && INTERSECTED.isMesh) {
				if (INTERSECTED.initialEmissive !== undefined) {
					INTERSECTED.material.emissive.setHex(INTERSECTED.initialEmissive);
				}
				document.body.style.cursor = "default";
				INTERSECTED = null;
			}
		}

		//renderer.render(scene, camera);
		composer.render();
	}
}

export { intro_scene };
