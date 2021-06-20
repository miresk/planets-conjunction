// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  // Enable MSAA in WebGL
  // Turn on MSAA
  attributes: { antialias: true },
};

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
const colors = {
  blue: 0x7bb2d9,
  pink: 0xffc6d9,
  yellow: 0xfff7ae,
  purple: 0xcfbae1,
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
    alpha: true,
  });

  // WebGL background color
  renderer.setClearColor("#121212", 1);

  const camera = new THREE.PerspectiveCamera(60, aspect, 1, 1500);
  camera.position.set(0, 100, 200);
  //   camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  //   const controls = new THREE.OrbitControls(camera, context.canvas);
  //   controls.target.set(0, 0, 0);

  // Setup your scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
  //   scene.fog = new THREE.FogExp2( colors.yellow, 0.01 );

  //   TEXTURES
  const loader = new THREE.TextureLoader();
  const sunTexture = loader.load("assets/sun.jpg");
  const jupiterTexture = loader.load("assets/jupiter.jpg");
  const saturnTexture = loader.load("assets/saturn.jpg");

  // MATERIALS
  const sunMaterial = new THREE.MeshStandardMaterial({ map: sunTexture });
  const jupiterMaterial = new THREE.MeshStandardMaterial({
    map: jupiterTexture,
  });
  const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTexture });

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 10000; i++) {
    vertices.push(THREE.MathUtils.randFloatSpread(1500)); // x
    vertices.push(THREE.MathUtils.randFloatSpread(1500)); // y
    vertices.push(THREE.MathUtils.randFloatSpread(1500)); // z
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0x888888 })
  );
  scene.add(particles);

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);

  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  sunMesh.position.set(0, -200, 0);
  sunMesh.scale.setScalar(200);
  scene.add(sunMesh);

  const jupiterGroup = new THREE.Group();
  const jupiterMesh = new THREE.Mesh(sphereGeometry, jupiterMaterial);
  createPlanet(scene, jupiterMesh, jupiterGroup, -400, 20, -300, 20);

  const saturnGroup = new THREE.Group();
  const saturnMesh = new THREE.Mesh(sphereGeometry, saturnMaterial);
  createPlanet(scene, saturnMesh, saturnGroup, -800, 19, -350, 17);

  const light = new THREE.PointLight("white", 1.25);
  light.position.set(0, 0, 0);
  scene.add(light);

    // scene.add(new THREE.PointLightHelper(light, 1));
    // scene.add( new THREE.SpotLightHelper( spotLightLeft ));
    // scene.add(new THREE.GridHelper(50, 50));

  // illuminate the sun
  createSpotlights(scene);

  // create an AudioListener and add it to the camera
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
    console.log('dur', buffer.duration.toFixed(2));
    sound.play();
  });

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      sunMesh.rotation.y = time * 0.03;
      particles.rotation.y = time * 0.01;

      if (time <= 176) {
        jupiterGroup.rotation.y = time * -0.01;
        saturnGroup.rotation.y = time * -0.011;
      }

      jupiterMesh.rotation.y = time * 0.15;
      saturnMesh.rotation.y = time * 0.25;

      //   controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      //   controls.dispose();
      renderer.dispose();
    },
  };
};

function createPlanet(scene, mesh, group, x, y, z, scale) {
  mesh.position.set(x, y, z);
  mesh.scale.setScalar(scale);
  group.add(mesh);
  scene.add(group);
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

canvasSketch(sketch, settings);
