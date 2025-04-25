import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadGLTF } from "../script/gltf_loader.js";
import { HDRI_Loader } from "../script/hdri_loader.js";

async function intro_scene() {
	const scene = new THREE.Scene();
	const COLOR_SCENE = 0x222222;
	scene.background = new THREE.Color(COLOR_SCENE);
	// scene.fog = new THREE.Fog(COLOR_SCENE, 1, 100);

	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.z = 4;

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.setAnimationLoop(animate);
	document.body.appendChild(renderer.domElement);

	// Activate OrbitControls
	// const controls = new OrbitControls( camera, renderer.domElement );

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
	scene.add(helper);
	scene.add(directionalLight);
	// scene.add(gridHelper);
	scene.add(axesHelper);

	// Create a cube
	const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
	const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
	const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	scene.add(cube);

	let mouseX = 0;
	let mouseY = 0;
	let scrollOffsetY = 0; // Variable pour stocker le décalage dû au scroll
	let mouseFactor = 0.5; // Ajustez le facteur pour contrôler la distance
	let mouseSpeed = 0.05; // Ajustez le facteur pour contrôler la vitesse
	window.addEventListener("mousemove", (event) => {
		// Normaliser les coordonnées de la souris entre -1 et 1
		mouseX = (event.clientX / window.innerWidth) * 2 - 1;
		mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
	});

	// Scroll event to move the camera
	window.addEventListener("scroll", () => {
		const scrollY = window.scrollY;
		scrollOffsetY = -scrollY / 100; // Ajustez le facteur pour contrôler la vitesse de défilement
	});

	function animate() {
        // Update cube position based on mouse movement
        cube.position.x += (mouseX * 6 - cube.position.x);
        cube.position.y += (mouseY * 2 - cube.position.y);

		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.render(scene, camera);
	}
}

export { intro_scene };
