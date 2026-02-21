import * as THREE from "three";
import { gsap } from "gsap";
import { camera, controls } from "./scene.js";


import { openPanel, closePanel, overlay } from "./ui.js";



const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let islandModel = null;
let defaultCameraPosition = new THREE.Vector3();
let defaultTarget = new THREE.Vector3();
let isFocused = false;

/* =========================
   INFO MAP 
========================= */
const infoMap = {
  Sphere001: {
    title: "Projects",
    content: `
      <h3>My Projects</h3>
      <p>• 3D Personal Portfolio</p>
    `,
  },

  body: {
    title: "About Me",
    content: `
      <h3>Nguyễn Quang Thuận</h3>
      <p>Tôi là developer yêu thích web 3D và animation.</p>
      <p>Hiện đang tập trung vào Frontend.</p>
    `,
  },

  Sphere007: {
    title: "Skills",
    content: `
      <h3>Skills</h3>
      <p>• Three.js</p>
      <p>• JavaScript</p>
      <p>• GSAP Animation</p>
      <p>• Responsive Design</p>
    `,
  },

  Sphere002: {
    title: "Contact",
    content: `
      <h3>Contact</h3>
      <p>Email: nquangthuan1902@gmail.com</p>
      <p>GitHub: github.com/thuantomo</p>
    `,
  },

  Sphere005: {
    title: "Coming Soon",
    content: `
      <h3>New Feature</h3>
      <p>Tính năng này đang được phát triển.</p>
    `,
  },
};

export function setModel(model) {
  islandModel = model;

  defaultCameraPosition.copy(camera.position);
  defaultTarget.copy(controls.target);
}

export function handleClick(event, renderer) {
  if (!islandModel) return;

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(islandModel, true);

  if (intersects.length > 0) {
    let object = intersects[0].object;

    while (object && !object.userData.clickable) {
      object = object.parent;
    }

    if (!object) return;

    const cleanName = object.name.split("_Material")[0];

    if (infoMap[cleanName]) {
      focus(object, infoMap[cleanName]);
    }
  } else {
    resetView();
  }
}

function focus(object, data) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();

  const newPosition = {
    x: center.x - size * 0.6,
    y: center.y + size * 0.3,
    z: center.z + size,
  };

  gsap.to(camera.position, {
    duration: 1.2,
    ...newPosition,
    ease: "power3.inOut",
    onUpdate: () => controls.update(),
  });

  gsap.to(controls.target, {
    duration: 1.2,
    x: center.x,
    y: center.y,
    z: center.z,
    ease: "power3.inOut",
    onUpdate: () => controls.update(),
  });

  controls.enableRotate = false;
  controls.enableZoom = false;

  // 👇 SỬA CHỖ NÀY
  openPanel(data.title, data.content);

  isFocused = true;
}

function resetView() {
  if (!isFocused) return;

  gsap.to(camera.position, {
    duration: 1,
    x: defaultCameraPosition.x,
    y: defaultCameraPosition.y,
    z: defaultCameraPosition.z,
    onUpdate: () => controls.update(),
  });

  gsap.to(controls.target, {
    duration: 1,
    x: defaultTarget.x,
    y: defaultTarget.y,
    z: defaultTarget.z,
    onUpdate: () => controls.update(),
  });

  controls.enableRotate = true;
  controls.enableZoom = true;

  closePanel();
  isFocused = false;
}

overlay.addEventListener("click", () => {
  resetView();
});