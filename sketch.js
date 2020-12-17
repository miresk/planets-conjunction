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
  scaleToView: false,
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
    antialias: true,
    alpha: true,
  });

  // WebGL background color
  renderer.setClearColor("#121212", 1);

  // Setup a camera
  //   const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  //   camera.position.set(0, 0, -4);
  const camera = new THREE.PerspectiveCamera(60, aspect, 1, 1500);
//   const camera = new THREE.OrthographicCamera(
//     SCREEN_WIDTH / -2,
//     SCREEN_WIDTH / 2,
//     SCREEN_HEIGHT / 2,
//     SCREEN_HEIGHT / -2,
//     1,
//     1000
//   );
  camera.position.set(0, 100, 200);
  //   camera.position.set(0, 0, -4);

//   camera.lookAt(new THREE.Vector3());

  // Setup camera controller
//   const controls = new THREE.OrbitControls(camera, context.canvas);
//   controls.target.set(0, 0, 0);

  // Setup your scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
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
    createPlanet(scene, jupiterMesh, jupiterGroup, -500, 20, -410, 20);

  const saturnGroup = new THREE.Group();
  const saturnMesh = new THREE.Mesh(sphereGeometry, saturnMaterial);
    createPlanet(scene, saturnMesh, saturnGroup, -1000, 16, -360, 15);

  const light = new THREE.PointLight("white", 1.25);
  light.position.set(0, 0, 0);
  scene.add(light);

  //   scene.add(new THREE.PointLightHelper(light, 1));
  //   scene.add( new THREE.SpotLightHelper( spotLightLeft ));
  //   scene.add(new THREE.GridHelper(50, 50));

  // illuminate the sun
  createSpotlights(scene);

  // Setup a geometry
    // const geometry = new THREE.SphereGeometry(1, 32, 16);

  // Setup a material
  //   const material = new THREE.MeshBasicMaterial({
  //     color: "red",
  //     wireframe: true
  //   });

  // Setup a mesh with geometry + material
  //   const mesh = new THREE.Mesh(geometry, material);
  //   scene.add(mesh);

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
      sunMesh.rotation.y = time * 0.03
      particles.rotation.y = time * 0.01

      if(time <= 176) {
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
