import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import gsap from 'gsap';
let model;
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();
// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// Create renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
  alpha:true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

// Add HDRI environment map
const hdriLoader = new RGBELoader();
hdriLoader.load("./pond_bridge_night_1k.hdr", function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  // scene.background = texture;
  
});

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Add 3D model
const loader = new GLTFLoader();
loader.load("./DamagedHelmet.gltf", function(gltf) {
  model=gltf.scene;
  scene.add(model);
}, undefined, function(err) {
  console.log(err);
});

// Add orbit controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// Set up post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.003;
composer.addPass(rgbShiftPass);
//add event listener for mouse movement
window.addEventListener("mousemove",(event)=>{
  gsap.to(model.rotation , {
    y:((event.clientX/window.innerWidth)-0.5)*Math.PI*0.2,
    x:((event.clientY/window.innerHeight)-0.5)*Math.PI*0.2,
    duration:0.2,
    ease:"none"
  })
})

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // controls.update();
  composer.render();
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation loop
animate();