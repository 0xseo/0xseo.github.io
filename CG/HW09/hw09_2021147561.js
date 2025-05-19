import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initStats, initRenderer, initCamera } from "./util.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();

const renderer = initRenderer();
let camera = initCamera();
const stats = initStats();
const controls = setupControls();
controls.orbitControls = new OrbitControls(camera, renderer.domElement);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(10),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
sun.position.set(0, 0, 0);
scene.add(sun);

const mercuryTexture = textureLoader.load("Mercury.jpg");
const mercuryMaterial = new THREE.MeshStandardMaterial({
  map: mercuryTexture,
  roughness: 0.8,
  metalness: 0.2,
});
const mercury = new THREE.Mesh(new THREE.SphereGeometry(1.5), mercuryMaterial);
mercury.position.set(20, 0, 0);
mercury.castShadow = true;
scene.add(mercury);

const venusTexture = textureLoader.load("Venus.jpg");
const venusMaterial = new THREE.MeshStandardMaterial({
  map: venusTexture,
  roughness: 0.8,
  metalness: 0.2,
});
const venus = new THREE.Mesh(new THREE.SphereGeometry(3), venusMaterial);
venus.position.set(35, 0, 0);
venus.castShadow = true;
scene.add(venus);

const earthTexture = textureLoader.load("Earth.jpg");
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  roughness: 0.8,
  metalness: 0.2,
});
const earth = new THREE.Mesh(new THREE.SphereGeometry(3.5), earthMaterial);
earth.position.set(50, 0, 0);
earth.castShadow = true;
scene.add(earth);

const marsTexture = textureLoader.load("Mars.jpg");
const marsMaterial = new THREE.MeshStandardMaterial({
  map: marsTexture,
  roughness: 0.8,
  metalness: 0.2,
});
const mars = new THREE.Mesh(new THREE.SphereGeometry(2.5), marsMaterial);
mars.position.set(65, 0, 0);
mars.castShadow = true;
scene.add(mars);

// add subtle ambient lighting
const ambiColor = "#1c1c1c";
const ambientLight = new THREE.AmbientLight(ambiColor);
scene.add(ambientLight);

// add directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(100, 200, 200);
scene.add(dirLight);

// for controlling the rendering

let mercuryOrbitStep = 0;
let mercuryRotationStep = 0;
let venusOrbitStep = 0;
let venusRotationStep = 0;
let earthOrbitStep = 0;
let earthRotationStep = 0;
let marsOrbitStep = 0;
let marsRotationStep = 0;

// const controls = setupControls();
render();

function render() {
  stats.update();
  controls.orbitControls.update();

  mercuryRotationStep -= controls.mercuryRotationSpeed;
  mercuryOrbitStep -= controls.mercuryOrbitSpeed;
  mercury.position.x = 20 * Math.cos(mercuryOrbitStep);
  mercury.position.z = 20 * Math.sin(mercuryOrbitStep);
  mercury.rotation.y = mercuryRotationStep;
  mercury.rotation.x = mercuryRotationStep;

  venusRotationStep -= controls.venusRotationSpeed;
  venusOrbitStep -= controls.venusOrbitSpeed;
  venus.position.x = 35 * Math.cos(venusOrbitStep);
  venus.position.z = 35 * Math.sin(venusOrbitStep);
  venus.rotation.y = venusRotationStep;
  venus.rotation.x = venusRotationStep;

  earthRotationStep -= controls.earthRotationSpeed;
  earthOrbitStep -= controls.earthOrbitSpeed;
  earth.position.x = 50 * Math.cos(earthOrbitStep);
  earth.position.z = 50 * Math.sin(earthOrbitStep);
  earth.rotation.y = earthRotationStep;
  earth.rotation.x = earthRotationStep;

  marsRotationStep -= controls.marsRotationSpeed;
  marsOrbitStep -= controls.marsOrbitSpeed;
  mars.position.x = 65 * Math.cos(marsOrbitStep);
  mars.position.z = 65 * Math.sin(marsOrbitStep);
  mars.rotation.y = marsRotationStep;
  mars.rotation.x = marsRotationStep;

  // render using requestAnimationFrame
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function setupControls() {
  const controls = new (function () {
    this.mercuryRotationSpeed = 0.02;
    this.mercuryOrbitSpeed = 0.02;
    this.venusRotationSpeed = 0.015;
    this.venusOrbitSpeed = 0.015;
    this.earthRotationSpeed = 0.01;
    this.earthOrbitSpeed = 0.01;
    this.marsRotationSpeed = 0.008;
    this.marsOrbitSpeed = 0.008;
    this.orbitControls = null;

    // 여기 추가
    this.perspective = "Perspective"; // 현재 카메라 타입 표시용
    this.switchCamera = () => {
      // 기존 카메라와 컨트롤 제거
      controls.orbitControls.dispose();

      if (camera instanceof THREE.PerspectiveCamera) {
        camera = new THREE.OrthographicCamera(
          window.innerWidth / -16,
          window.innerWidth / 16,
          window.innerHeight / 16,
          window.innerHeight / -16,
          -200,
          500
        );
        this.perspective = "Orthographic";
      } else {
        camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.1,
          100000
        );
        this.perspective = "Perspective";
      }

      // 카메라 새로 셋업
      camera.position.set(120, 60, 180);
      camera.lookAt(scene.position);

      controls.orbitControls = new OrbitControls(camera, renderer.domElement);
      controls.orbitControls.enableDamping = true;
    };
  })();

  const gui = new GUI();

  // Camera 폴더
  const cameraFolder = gui.addFolder("Camera");
  cameraFolder.add(controls, "switchCamera").name("Switch Camera Type");
  cameraFolder.add(controls, "perspective").name("Current Camera").listen();
  cameraFolder.open();

  // Mercury 폴더
  const mercuryFolder = gui.addFolder("Mercury");
  mercuryFolder
    .add(controls, "mercuryRotationSpeed", 0, 0.5)
    .name("Rotation Speed");
  mercuryFolder.add(controls, "mercuryOrbitSpeed", 0, 0.5).name("Orbit Speed");
  mercuryFolder.open();

  // Venus 폴더
  const venusFolder = gui.addFolder("Venus");
  venusFolder
    .add(controls, "venusRotationSpeed", 0, 0.5)
    .name("Rotation Speed");
  venusFolder.add(controls, "venusOrbitSpeed", 0, 0.5).name("Orbit Speed");
  venusFolder.open();

  // Earth 폴더
  const earthFolder = gui.addFolder("Earth");
  earthFolder
    .add(controls, "earthRotationSpeed", 0, 0.5)
    .name("Rotation Speed");
  earthFolder.add(controls, "earthOrbitSpeed", 0, 0.5).name("Orbit Speed");
  earthFolder.open();

  // Mars 폴더
  const marsFolder = gui.addFolder("Mars");
  marsFolder.add(controls, "marsRotationSpeed", 0, 0.5).name("Rotation Speed");
  marsFolder.add(controls, "marsOrbitSpeed", 0, 0.5).name("Orbit Speed");
  marsFolder.open();

  return controls;
}
