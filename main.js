import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PhysicsWorld, createBox } from './physics.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const world = new PhysicsWorld();

// --- LIGHTING FIX ---
// This adds depth so the cubes aren't flat green
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const pointLight = new THREE.PointLight(0x00ffff, 100);
pointLight.position.set(5, 10, 5);
scene.add(pointLight);

// --- PHYSGUN PATCH ---
let physgun = null;
const loader = new GLTFLoader();
loader.load('./models/physgun.glb', (gltf) => {
    physgun = gltf.scene;
    physgun.scale.set(0.1, 0.1, 0.1);
    
    // Positioned for the bottom-right corner hand view
    physgun.position.set(0.7, -0.5, -1.2); 
    physgun.rotation.y = Math.PI + 0.35; 
    
    camera.add(physgun);
    scene.add(camera);
});

// --- ASPECT RATIO PATCH ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GRAB MECHANICS ---
let grabbedBody = null;
const raycaster = new THREE.Raycaster();

window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        raycaster.setFromCamera({x: 0, y: 0}, camera);
        const hits = raycaster.intersectObjects(scene.children);
        if (hits.length > 0 && hits[0].object.userData.physicsBody) {
            grabbedBody = hits[0].object.userData.physicsBody;
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

// --- MAP & SPAWNING ---
createBox(scene, world, 60, 1, 60, 0, -0.5, 0, 0, 0x1a1a1a); // Dark Floor

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyQ') {
        const dir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
        createBox(scene, world, 2, 2, 2, camera.position.x + dir.x*5, 5, camera.position.z + dir.z*5, 3, 0x00ff00);
    }
});

function animate() {
    requestAnimationFrame(animate);
    world.update(scene);

    if (grabbedBody) {
        const target = new THREE.Vector3(0, 0, -8).applyQuaternion(camera.quaternion).add(camera.position);
        grabbedBody.position.copy(target);
    }

    renderer.render(scene, camera);
}
animate();

// Pointer Lock for controls
document.addEventListener('click', () => renderer.domElement.requestPointerLock());
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
        camera.rotation.y -= e.movementX * 0.002;
        camera.rotation.x -= e.movementY * 0.002;
        camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));
    }
});
camera.rotation.order = 'YXZ';
