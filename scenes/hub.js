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

async function hub_scene() {
	let camera, renderer, composer, object;

	renderer = new THREE.WebGLRenderer();
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
	camera.position.z = 400;

	// Interaction Mouse Declaration
	let raycaster = new THREE.Raycaster();
	let INTERSECTED;
	let pointer = new THREE.Vector2();

	let mouseX = 0;
	let mouseY = 0;
	window.addEventListener("mousemove", onMouseMouve);
	function onMouseMouve(event) {
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}
	//

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf5ebd6); // Orange
	scene.fog = new THREE.Fog(0x000000, 1, 1000);

	object = new THREE.Object3D();
	scene.add(object);

	const geometry = new THREE.BoxGeometry(50, 50, 50);

	for (let i = 0; i < 5; i++) {
		const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xf000f0, flatShading: true,}));
		// Met les cube en rond a 200 de rayon
		const angle = (i / 5) * Math.PI * 2;
		mesh.position.x = Math.cos(angle) * 200;
		mesh.position.z = Math.sin(angle) * 200;
		scene.add(mesh);
	}

	scene.add(new THREE.AmbientLight(0xcccccc));

	const light = new THREE.DirectionalLight(0xffffff, 3);
	light.position.set(1, 1, 1);
	scene.add(light);

	// postprocessing

	composer = new EffectComposer(renderer);
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	const effect1 = new ShaderPass(DotScreenShader);
	effect1.uniforms["scale"].value = 6;
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

	let currentAngle = 0; // Angle actuel
	let targetAngle = 0; // Angle cible
	const rotationSpeed = 0.03; // Vitesse de l'animation

	let powerPCMesh;
	let powerPCMeshMaterial;

	function animate() {
		if (Math.abs(targetAngle - currentAngle) > 0.001) {
			currentAngle += (targetAngle - currentAngle) * rotationSpeed;
			rotationCameraReg(camera, currentAngle);
		}
		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects(scene.children, true);

		if ( intersects.length > 0 ) {
			if ( INTERSECTED != intersects[ 0 ].object ) {
				if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
				INTERSECTED.material.emissive.setHex( 0xff0000 );
			}
		} else {
			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
			INTERSECTED = null;
		}

		composer.render();
	}

	addEventListener("keypress", () => {
		targetAngle += 1; // Augmente l'angle cible
	});
}

function rotationCameraReg(camera, angle) {
	const radius = 400; // Rayon de la rotation
	camera.position.x = Math.sin(angle) * radius;
	camera.position.z = Math.cos(angle) * radius;
	camera.lookAt(0, 0, 0); // Oriente la caméra vers le centre
	camera.updateProjectionMatrix();
}

export { hub_scene };
