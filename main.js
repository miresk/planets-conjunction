import * as THREE from "https://unpkg.com/three@0.123.0/build/three.module.js";
import { Clock } from "https://unpkg.com/three@0.123.0/src/core/Clock.js";
import {
  Lensflare,
  LensflareElement,
} from "https://unpkg.com/three@0.123.0/examples/jsm/objects/Lensflare.js";

// THREEJS RELATED VARIABLES

var scene,
  camera,
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane,
  renderer,
  sunMesh,
  jupiterGroup,
  jupiterMesh,
  saturnGroup,
  saturnMesh,
  particles,
  flareLight,
  playBtn,
  clock,
  dur,
  container;

var HEIGHT, WIDTH;
HEIGHT = window.innerHeight;
WIDTH = window.innerWidth;

// var isPlaying = false;

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 1500;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
  camera.position.x = 0;
  camera.position.y = 100;
  camera.position.z = 200;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColor("#121212", 1);
  renderer.shadowMap.enabled = true;
  container = document.getElementById("world");
  container.appendChild(renderer.domElement);

  clock = new Clock(false);

  window.addEventListener("resize", handleWindowResize, false);

  playBtn = document.getElementById("play");
  playBtn.addEventListener("click", playScene);

//   const axesHelper = new THREE.AxesHelper(50);
//   scene.add(axesHelper);
}

function createLights() {
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);

  //   TEXTURES
  const loader = new THREE.TextureLoader();
  const sunTexture = loader.load("assets/sun.jpg");
  const jupiterTexture = loader.load("assets/jupiter.jpg");
  const saturnTexture = loader.load("assets/saturn.jpg");
  const textureFlare0 = loader.load("assets/lensflare0.png");
  const textureFlare3 = loader.load("assets/lensflare3.png");

  // MATERIALS
  const sunMaterial = new THREE.MeshStandardMaterial({ map: sunTexture });
  const jupiterMaterial = new THREE.MeshStandardMaterial({map: jupiterTexture,});
  const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTexture });

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 6000; i++) {
    vertices.push(THREE.MathUtils.randFloatSpread(1500)); // x
    vertices.push(THREE.MathUtils.randFloatSpread(1500)); // y
    vertices.push(THREE.MathUtils.randFloatSpread(1500)); // z
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0x888888 })
  );
  scene.add(particles);

  sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  sunMesh.position.set(0, -200, 0);
  sunMesh.scale.setScalar(200);
  scene.add(sunMesh);

  jupiterGroup = new THREE.Group();
  var jupiterGroupRadius = -300;
  var jupiterGroupX = (2 * Math.PI * jupiterGroupRadius) / 4;
  jupiterMesh = new THREE.Mesh(sphereGeometry, jupiterMaterial);
  createPlanet(scene, jupiterMesh, jupiterGroup, jupiterGroupX , 23, jupiterGroupRadius, 20);

  saturnGroup = new THREE.Group();
  var saturnGroupRadius = -400;
  var saturnGroupX = (2 * Math.PI * saturnGroupRadius) / 4;
  saturnMesh = new THREE.Mesh(sphereGeometry, saturnMaterial);
  createPlanet(scene, saturnMesh, saturnGroup, saturnGroupX, 10, saturnGroupRadius, 18);

  const light = new THREE.PointLight("white", 1.2);
  light.position.set(0, 0, 0);
  scene.add(light);

  flareLight = new THREE.PointLight(0xffffff, 1.5, 1000);
  flareLight.position.set(0, 50, -300);
  flareLight.scale.setScalar(20);
  const lensflare = new Lensflare();

  lensflare.addElement(new LensflareElement(textureFlare0, 512, 0));
  lensflare.addElement(new LensflareElement(textureFlare3, 512, 0));
  lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));

  flareLight.add(lensflare);
  //   scene.add(flareLight);

  const manager = new THREE.LoadingManager();
  manager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total);
  };

  //   scene.add(new THREE.PointLightHelper(light, 1));
  // scene.add( new THREE.SpotLightHelper( spotLightLeft ));
  // scene.add(new THREE.GridHelper(50, 50));

  // illuminate the sun
  createSpotlights(scene);
}

// HANDLE SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function createPlanet(scene, mesh, group, x, y, z, scale) {
  mesh.position.set(x, y, z);
  mesh.scale.setScalar(scale);
  group.add(mesh);
  scene.add(group);
}

function playScene() {
  var music = document.getElementById("music");
  music.classList.add("playing");
  playBtn.disabled = true;
  const listener = new THREE.AudioListener();
  camera.add(listener);
  // create a global audio source
  const sound = new THREE.Audio(listener);

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("assets/Orloe-PassingJupiter.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
    dur = buffer.duration.toFixed(0); // 176s
    sound.play();
    rotatePlanets();
  });
}

function rotatePlanets(time) {
  clock.start();
  renderer.setAnimationLoop(() => {

    const time = clock.elapsedTime;
    const delta = clock.getDelta();
    // const deltaSec = delta * 1000;

    sunMesh.rotation.y += 0.03 * delta;
    particles.rotation.y += 0.01 * delta;
    if (time <= (dur/2)) {
    //   jupiterGroup.rotation.y -= 0.01 * delta;
      jupiterGroup.rotation.y -= delta/(dur/2);
      saturnGroup.rotation.y -= delta/(dur/2);
      jupiterMesh.rotation.y += 0.015 * delta;
      saturnMesh.rotation.y += 0.025 * delta;
    } else if (time > (dur/2)) {
      scene.add(flareLight);
      // window.cancelAnimationFrame(animationPlanets);
      renderer.setAnimationLoop(null);
    }
    //   animationPlanets = requestAnimationFrame(rotatePlanets);

    // render a frame
    renderer.render(scene, camera);
  });
}

function createSpotlights(scene) {
  var color = 0xffffff;
  var intensity = 15;
  var distance = 250;
  var angle = Math.PI / 7;

  new Array(6).fill("").forEach((item, i) => {
    var spotlight = new THREE.SpotLight(color, intensity, distance, angle);
    var value = i % 2 === 0 ? 260 : -260;

    spotlight.position.set(
      i < 2 ? value : 0,
      i >= 2 && i < 4 ? value : 0,
      i >= 4 ? value : 0
    );
    scene.add(spotlight);
  });
}

function init(event) {
  //   document.addEventListener("mousemove", handleMouseMove, false);
  createScene();
  createLights();
  //   loop();
  setTimeout(() => {
    renderer.render(scene, camera);
    //       window.cancelAnimationFrame(animationLoop);
  }, 1000);
}

window.addEventListener("load", init, false);
