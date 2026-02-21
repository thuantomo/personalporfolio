import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { scene, camera, controls } from "./scene.js";
import { setModel } from "./interaction.js";

export function loadIsland() {
  const loader = new GLTFLoader();

  loader.load("/island.glb", (gltf) => {
    const model = gltf.scene;
    model.scale.set(150, 150, 150);
    model.position.set(0, -10, 0);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.userData.clickable = true; // QUAN TRỌNG
      }
    });

    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();

    controls.target.copy(center);
    camera.position.copy(center);
    camera.position.z += size * 1.5;
    controls.update();

    setModel(model);
  });
}