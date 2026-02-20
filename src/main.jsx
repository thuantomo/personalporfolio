import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* =========================
   SCENE
========================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);


/* =========================
   CAMERA
========================= */
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

/* =========================
   RENDERER
========================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

/* =========================
   CONTROLS
========================= */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 2000;
controls.minDistance = 50;

/* =========================
   RAYCAST SYSTEM
========================= */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let currentIntersect = null;

/* =========================
   LIGHTING
========================= */
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(200, 300, 200);
directionalLight.castShadow = true;
scene.add(directionalLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

/* =========================
   LOAD ISLAND
========================= */
const loader = new GLTFLoader();
let islandModel;

loader.load("/island.glb", (gltf) => {

  islandModel = gltf.scene;

  islandModel.scale.set(1000, 1000,1000 );
  islandModel.position.set(0, 0, 0);

  islandModel.traverse((child) => {
    if (child.isMesh) {

      child.castShadow = true;
      child.receiveShadow = true;

      child.userData.clickable = true;
      child.userData.section = child.name;
      child.userData.originalColor = child.material.color.clone();
    }
  });

  scene.add(islandModel);

  // 🔥 Auto center model
const box = new THREE.Box3().setFromObject(islandModel);
const center = box.getCenter(new THREE.Vector3());

controls.target.copy(center);
camera.lookAt(center);

  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();

});

/* =========================
   INTERACTION FUNCTION
========================= */
function handleInteraction(clientX, clientY) {

  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {

    const object = intersects[0].object;

    if (object.userData.clickable) {

      console.log("Clicked section:", object.userData.section);

      object.material.color.set(0xff4444);

      setTimeout(() => {
        object.material.color.copy(object.userData.originalColor);
      }, 400);
    }
  }
}

/* =========================
   CLICK (PC)
========================= */
window.addEventListener("click", (event) => {
  handleInteraction(event.clientX, event.clientY);
});

/* =========================
   TOUCH (iPad)
========================= */
window.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  handleInteraction(touch.clientX, touch.clientY);
});

/* =========================
   HOVER (PC)
========================= */
window.addEventListener("mousemove", (event) => {

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {

    const object = intersects[0].object;

    if (object.userData.clickable) {

      if (currentIntersect && currentIntersect !== object) {
        currentIntersect.material.color.copy(currentIntersect.userData.originalColor);
      }

      currentIntersect = object;
      object.material.color.set(0xffff00);
    }

  } else {
    if (currentIntersect) {
      currentIntersect.material.color.copy(currentIntersect.userData.originalColor);
      currentIntersect = null;
    }
  }

});

/* =========================
   ANIMATE
========================= */
function animate() {
  requestAnimationFrame(animate);

  if (islandModel) {
    islandModel.rotation.y += 0.000015;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

/* =========================
   RESPONSIVE
========================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});