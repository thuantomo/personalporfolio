import { scene, camera, renderer, controls } from "./scene.js";
import { loadIsland } from "./model.js";
import { handleClick } from "./interaction.js";
import "./tailwind.css"; 

loadIsland();

renderer.domElement.addEventListener("click", (e) => {
  handleClick(e, renderer);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();