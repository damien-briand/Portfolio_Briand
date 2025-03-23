import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadGLTF } from "./script/gltf_loader.js";

const scene = new THREE.Scene();
const COLOR_SCENE = 0x222222;
scene.fog = new THREE.Fog(COLOR_SCENE, 1, 100);

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );

const geometry = new THREE.BoxGeometry(1, 1, 1);
const materials = [
	new THREE.MeshStandardMaterial({ color: 0xff0000 }),
	new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
	new THREE.MeshStandardMaterial({ color: 0x0000ff }),
	new THREE.MeshStandardMaterial({ color: 0xffff00 }),
	new THREE.MeshStandardMaterial({ color: 0xff00ff }),
	new THREE.MeshStandardMaterial({ color: 0x00ffff }),
];
const cube = new THREE.Mesh(geometry, materials);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.y = 1;

const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 1);

const directionalLight = new THREE.PointLight(0xffffff, 1000);
const helper = new THREE.PointLightHelper(directionalLight, 1, 0x0FFF000);
directionalLight.position.set(3, 5, 3);
directionalLight.castShadow = true;

const axesHelper = new THREE.AxesHelper(10);
const gridHelper = new THREE.GridHelper(50, 50);

/* ---------- ADD SECTION ---------- */
scene.add(cube);
scene.add(ground);
scene.add(ambientLight);
scene.add(helper);
scene.add(directionalLight);
scene.add(gridHelper);
scene.add(axesHelper);

/* ---------- GLTF LOADER ---------- */
let model;
const MODEL_SCALE = 0.5;
// try {
	// model = await loadGLTF("../assets/sword.glb", scene);
    // model.traverse((child) => {
        // if (child.isMesh) {
            // child.material.color.set(0xffffff);
			// model.castShadow = true;
        // }
    // });
// } catch (error) {
	// console.error("An error happened", error);
// }
// model.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);

function animate() {
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.render(scene, camera);
}
