import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

/**
 * Load HDRI file and add to scene
 * @param {*} hdri_path 
 * @param {*} scene 
 * @param {*} renderer 
 * @returns 
 */
function HDRI_Loader(hdri_path, scene, renderer) {
	return new Promise((resolve, reject) => {
		const rgbeLoader = new RGBELoader();
		rgbeLoader.load(hdri_path, (texture) => {
			texture.mapping = THREE.EquirectangularReflectionMapping;

			scene.background = texture;
			scene.environment = texture;

			cube.material.envMap = texture;
			cube.material.needsUpdate = true;
			renderer.render();
			resolve(texture);
		}, undefined, function (error) {
			reject(error);
		});
	});
}

export { HDRI_Loader };