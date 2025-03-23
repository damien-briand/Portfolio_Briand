import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Load GLTF file and add to scene
 * @param {*} url 
 * @param {*} scene 
 * @returns 
 */
function loadGLTF(url, scene) {
	return new Promise((resolve, reject) => {
		const loader = new GLTFLoader();

		loader.load(
			url,
			function (gltf) {
				scene.add(gltf.scene);
				gltf.animations; // Array<THREE.AnimationClip>
				gltf.scene; // THREE.Group
				gltf.scenes; // Array<THREE.Group>
				gltf.cameras; // Array<THREE.Camera>
				gltf.asset; // Object
				resolve(gltf.scene);
			},
			undefined,
			function (error) {
				reject(error);
			}
		);
	});
}

export { loadGLTF };
