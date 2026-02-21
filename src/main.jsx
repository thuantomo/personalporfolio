import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap } from "gsap";

/* =========================
   SCENE
========================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

/* =========================
   CONTROLS
========================= */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = true;
controls.minDistance = 50;
controls.maxDistance = 2000;
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;

/* =========================
   LIGHT
========================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(200, 300, 200);
directionalLight.castShadow = true;
scene.add(directionalLight);

/* =========================
   STATE
========================= */
let islandModel;
let isFocused = false;
let defaultCameraPosition = new THREE.Vector3();
let defaultTarget = new THREE.Vector3();

/* =========================
   FLOATING PANELS
========================= */
const overlay = document.createElement("div");
Object.assign(overlay.style, {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 0.4s ease",
  zIndex: 998,
});
document.body.appendChild(overlay);

const panelContainer = document.createElement("div");
Object.assign(panelContainer.style, {
  position: "fixed",
  left: "50%",
  bottom: "-500px",
  transform: "translateX(-50%)",
  width: "90%",
  maxWidth: "900px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  transition: "bottom 0.5s cubic-bezier(.22,1,.36,1)",
  zIndex: 999,
});
document.body.appendChild(panelContainer);

const smallPanel = document.createElement("div");
Object.assign(smallPanel.style, {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(20px)",
  borderRadius: "30px",
  padding: "18px 30px",
  color: "white",
  fontSize: "18px",
  fontWeight: "600",
  fontFamily: "sans-serif",
});
panelContainer.appendChild(smallPanel);

const largePanel = document.createElement("div");
Object.assign(largePanel.style, {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(25px)",
  borderRadius: "40px",
  padding: "40px",
  color: "white",
  fontFamily: "sans-serif",
  lineHeight: "1.7",
  maxHeight: "60vh",
  overflowY: "auto",
});
panelContainer.appendChild(largePanel);

function openPanel(title, content) {
  smallPanel.innerHTML = title;
  largePanel.innerHTML = content;

  panelContainer.style.bottom = "40px";
  overlay.style.opacity = 1;
  overlay.style.pointerEvents = "auto";
}

function closePanel() {
  panelContainer.style.bottom = "-500px";
  overlay.style.opacity = 0;
  overlay.style.pointerEvents = "none";
}

overlay.addEventListener("click", resetView);

/* =========================
   INFO MAP (TITLE + CONTENT)
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

/* =========================
   LOAD MODEL
========================= */
const loader = new GLTFLoader();

loader.load("/island.glb", (gltf) => {
  islandModel = gltf.scene;
  islandModel.scale.set(150, 150, 150);
  islandModel.position.set(0, -10, 0);

  islandModel.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.clickable = true;
    }
  });

  scene.add(islandModel);

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
   RAYCAST
========================= */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function handleInteraction(x, y) {
  if (!islandModel) return;

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((y - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(islandModel.children, true);

  if (intersects.length > 0) {
    let object = intersects[0].object;

    while (object && !object.userData.clickable) {
      object = object.parent;
    }
    if (!object) return;

    const cleanName = object.name.split("_Material")[0];

    if (infoMap[cleanName]) {
      focusObject(object, infoMap[cleanName]);
    }
  } else {
    resetView();
  }
}

/* =========================
   FOCUS OBJECT
========================= */
function focusObject(object, data) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();

  const offsetX = size * 0.6;

  gsap.to(camera.position, {
    duration: 1.2,
    x: center.x - offsetX,
    y: center.y + size * 0.3,
    z: center.z + size * 1.2,
    ease: "power3.inOut",
  });

  gsap.to(controls.target, {
    duration: 1.2,
    x: center.x,
    y: center.y,
    z: center.z,
    ease: "power3.inOut",
    onComplete: () => controls.update(),
  });

  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;

  isFocused = true;
  openPanel(data.title, data.content);
}

/* =========================
   RESET VIEW
========================= */
function resetView() {
  if (!isFocused) return;

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

  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;

  isFocused = false;
  closePanel();
}

/* =========================
   EVENTS
========================= */
renderer.domElement.addEventListener("click", (e) => {
  handleInteraction(e.clientX, e.clientY);
});

/* =========================
   ANIMATE
========================= */
function animate() {
  requestAnimationFrame(animate);

  if (!isFocused && islandModel) {
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