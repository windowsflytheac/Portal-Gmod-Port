import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PhysicsWorld, createBox } from './physics.js';

// --- INITIALIZATION ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const world = new PhysicsWorld();

// --- LIGHTING PATCH (Prevents Black Textures) ---
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 7);
scene.add(sun);

// --- PHYSGUN PATCH ---
let physgun = null;
const loader = new GLTFLoader();
loader.load('./models/physgun.glb', (gltf) => {
    physgun = gltf.scene;
    physgun.scale.set(0.1, 0.1, 0.1);
    
    // Positioned for First-Person Right Hand
    physgun.position.set(0.6, -0.5, -1.0); 
    physgun.rotation.y = Math.PI + 0.3; 
    
    camera.add(physgun);
    scene.add(camera);
});

// --- FULLSCREEN RESIZE PATCH ---
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});

// --- PHYSICS GRAB PATCH ---
let grabbedBody = null;
const raycaster = new THREE.Raycaster();

window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        raycaster.setFromCamera({x: 0, y: 0}, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0 && intersects[0].object.userData.physicsBody) {
            grabbedBody = intersects[0].object.userData.physicsBody;
            grabbedBody.mass = 0; 
            grabbedBody.velocity.set(0,0,0);
        }
    }
});

window.addEventListener('mouseup', () => {
    if (grabbedBody) {
        grabbedBody.mass = 5;
        grabbedBody.updateMassProperties();
        grabbedBody = null;
    }
});

// --- TEST CHAMBER MAP ---
createBox(scene, world, 50, 1, 50, 0, -0.5, 0, 0, 0x333333); // Ground
createBox(scene, world, 1, 10, 50, -10, 5, 0, 0, 0x555555); // Wall L

// --- ANIMATION ---
function animate() {
    requestAnimationFrame(animate);
    world.update(scene);

    if (grabbedBody) {
        const target = new THREE.Vector3(0, 0, -6); // Hold distance
        target.applyQuaternion(camera.quaternion);
        target.add(camera.position);
        grabbedBody.position.copy(target);
    }

    renderer.render(scene, camera);
}
animate();

// Controls
document.addEventListener('click', () => renderer.domElement.requestPointerLock());
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
        camera.rotation.y -= e.movementX * 0.002;
        camera.rotation.x -= e.movementY * 0.002;
        camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));
    }
});
camera.rotation.order = 'YXZ';
