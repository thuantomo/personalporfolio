import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let defaultCameraPosition = new THREE.Vector3();
let defaultTarget = new THREE.Vector3();
let isFocused = false;

import { gsap } from "gsap";
/* =========================
   SCENE
========================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);


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

controls.enablePan = false;          // không kéo ngang
controls.enableZoom = true;          // vẫn cho zoom nếu muốn
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;
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
   INFO BOX
========================= */
const infoBox = document.createElement("div");
infoBox.style.position = "absolute";
infoBox.style.bottom = "40px";
infoBox.style.left = "50%";
infoBox.style.transform = "translateX(-50%)";
infoBox.style.padding = "15px 25px";
infoBox.style.background = "rgba(0,0,0,0.7)";
infoBox.style.color = "white";
infoBox.style.fontFamily = "monospace";
infoBox.style.borderRadius = "10px";
infoBox.style.display = "none";
document.body.appendChild(infoBox);

const infoMap = {
  Sphere001: "Projects",
  body: "About Me",
  Sphere007: "Skills",
  Sphere002: "Contact",
  Sphere005: "???",
};  

/* =========================
   LOAD ISLAND
========================= */
const loader = new GLTFLoader();
let islandModel;

loader.load("/island.glb", (gltf) => {

  islandModel = gltf.scene;

  islandModel.scale.set(200, 200,200  );
  islandModel.position.set(0, -10, 0);

  islandModel.traverse((child) => {
    if (child.isMesh) {
      console.log("Object name:", child.name);


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

const size = box.getSize(new THREE.Vector3()).length();

controls.target.copy(center);

camera.position.copy(center);
camera.position.z += size * 1.5;

controls.update();
defaultCameraPosition.copy(camera.position);
defaultTarget.copy(controls.target);

});

/* =========================
   INTERACTION FUNCTION
========================= */
function handleInteraction(clientX, clientY) {

  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(islandModel.children, true);

  // Nếu click trúng object
  if (intersects.length > 0) {

    const object = intersects[0].object;
    const cleanName = object.name.split("_Material")[0];

    if (infoMap[cleanName]) {

      // 🔥 Nếu đang focus rồi thì không zoom lại
      if (!isFocused) {

        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()).length();

        // smooth move
        gsap.to(camera.position, {
          duration: 1,
          x: center.x,
          y: center.y + size * 0.3,
          z: center.z + size,
        });

        gsap.to(controls.target, {
          duration: 1,
          x: center.x,
          y: center.y,
          z: center.z,
        });

        isFocused = true;
        controls.autoRotate = false;
      }

      infoBox.innerText = infoMap[cleanName];
      infoBox.style.display = "block";
    }

  } else {

    // 🔥 Click nền → quay về toàn cảnh
    if (isFocused) {

      gsap.to(camera.position, {
        duration: 1,
        x: defaultCameraPosition.x,
        y: defaultCameraPosition.y,
        z: defaultCameraPosition.z,
      });

      gsap.to(controls.target, {
        duration: 1,
        x: defaultTarget.x,
        y: defaultTarget.y,
        z: defaultTarget.z,
      });

      infoBox.style.display = "none";
      isFocused = false;
      controls.autoRotate = true;
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

  if (!islandModel) return;

  const intersects = raycaster.intersectObjects(islandModel.children, true);

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
    islandModel.rotation.y += 0.00085;
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