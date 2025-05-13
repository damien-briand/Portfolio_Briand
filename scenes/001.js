import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadGLTF } from "../script/gltf_loader.js";
import { HDRI_Loader } from "../script/hdri_loader.js";

async function scene001() {
	const scene = new THREE.Scene();
	const COLOR_SCENE = 0x222222;
	scene.background = new THREE.Color(0xf5ebd6); // Orange
	// scene.fog = new THREE.Fog(COLOR_SCENE, 1, 100);

	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.z = 4;

	let raycaster = new THREE.Raycaster();
	let INTERSECTED;
	let pointer = new THREE.Vector2();

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.setAnimationLoop(animate);
	document.body.appendChild(renderer.domElement);

	// Activate OrbitControls
	// const controls = new OrbitControls( camera, renderer.domElement );

	const groundGeometry = new THREE.PlaneGeometry(10, 10);
	const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
	const ground = new THREE.Mesh(groundGeometry, groundMaterial);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;

	const ambientLight = new THREE.AmbientLight(0xffffff, 2);

	const directionalLight = new THREE.PointLight(0xffffff, 1000);
	const helper = new THREE.PointLightHelper(directionalLight, 1, 0x0fff000);
	directionalLight.position.set(3, 5, 3);
	directionalLight.castShadow = true;

	const axesHelper = new THREE.AxesHelper(10);
	const gridHelper = new THREE.GridHelper(50, 50);

	/* ---------- ADD SECTION ---------- */
	// scene.add(ground);
	scene.add(ambientLight);
	scene.add(directionalLight);
	// scene.add(gridHelper);

	let mouseX = 0;
	let mouseY = 0;
	let scrollOffsetY = 0; // Variable pour stocker le décalage dû au scroll
	let mouseFactor = 0.5; // Ajustez le facteur pour contrôler la distance
	let mouseSpeed = 0.05; // Ajustez le facteur pour contrôler la vitesse
	window.addEventListener("mousemove", (event) => {
		// Normaliser les coordonnées de la souris entre -1 et 1
		mouseX = (event.clientX / window.innerWidth) * 2 - 1;
		mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

		pointer.x = mouseX;
		pointer.y = mouseY;
	});

	// Scroll event to move the camera
	window.addEventListener("scroll", () => {
		const scrollY = window.scrollY;
		scrollOffsetY = -scrollY / 100; // Ajustez le facteur pour contrôler la vitesse de défilement
	});

	/* ---------- GLTF LOADER ---------- */
	let suzannes = [];
	let model;
	const MODEL_SCALE = 0.5;
	try {
		model = await loadGLTF("../assets/suzanne.glb", scene);
		model.traverse((child) => {
			if (child.isMesh) {
				child.material = new THREE.MeshStandardMaterial({
					color: Math.random() * 0xffffff, // Couleur aléatoire
					roughness: 0.6, // Ajustez la rugosité
					metalness: 0.1, // Ajustez le niveau de métal
				});
				model.receiveShadow = true;
				model.castShadow = true;
			}
		});
	} catch (error) {
		console.error("An error happened", error);
	}
	model.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);

	for (let i = 1; i < 10; i++) {
		const suzanne = model.clone();
		suzanne.position.x = Math.random() * 2 - 1;
		suzanne.position.y = -i * 2;
		suzannes.push(suzanne);
		scene.add(suzanne);
	}

	function animate() {
		camera.position.x +=
			(mouseX * mouseFactor - camera.position.x) * mouseSpeed;
		camera.position.y +=
			(mouseY * mouseFactor + scrollOffsetY - camera.position.y) * mouseSpeed;

		suzannes.forEach((suzanne) => {
			suzanne.rotation.x += 0.01;
			suzanne.rotation.y += 0.01;
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects(scene.children, true);
		let currentColor = new THREE.Color(0x00ff00);

		if (intersects.length > 0) {
			if (INTERSECTED != intersects[0].object) {
				INTERSECTED = intersects[0].object;
				if (INTERSECTED.isMesh) {
					INTERSECTED.material = new THREE.MeshStandardMaterial({
						color: 0xff0000,
						roughness: 0.6,
						metalness: 0.1,
					});
				}
			}
		} else {
			if (INTERSECTED) {
				INTERSECTED.material = new THREE.MeshStandardMaterial({
					color: currentColor,
					roughness: 0.6,
					metalness: 0.1,
				});
			}
			INTERSECTED = null;
		}

		renderer.render(scene, camera);
	}
}

export { scene001 };
