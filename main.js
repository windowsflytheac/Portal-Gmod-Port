import * as THREE from 'three';
import { PhysicsWorld, createBox } from './physics.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new PhysicsWorld();

// --- PORTAL RENDERING SETUP ---
const blueRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const orangeRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

const bluePortal = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 3),
    new THREE.MeshBasicMaterial({ map: orangeRenderTarget.texture })
);
const orangePortal = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 3),
    new THREE.MeshBasicMaterial({ map: blueRenderTarget.texture })
);

scene.add(bluePortal, orangePortal);
bluePortal.position.set(-5, 2, -9.9);
orangePortal.position.set(5, 2, -9.9);

// --- MAP GENERATION (Portal 1 Style) ---
// Large Test Chamber
createBox(scene, world, 30, 1, 30, 0, -0.5, 0, 0, 0x444444); // Floor
createBox(scene, world, 30, 10, 1, 0, 5, -15, 0, 0x666666); // Wall
createBox(scene, world, 1, 10, 30, -15, 5, 0, 0, 0x666666); // Wall

const light = new THREE.PointLight(0xffffff, 100, 100);
light.position.set(0, 8, 0);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.4));

// --- GMOD PHYSICS INTERACTION ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyQ') {
        // Spawn a GMod cube in front of player
        const pos = new THREE.Vector3();
        camera.getWorldDirection(pos);
        createBox(scene, world, 1.5, 1.5, 1.5, camera.position.x + pos.x * 5, 5, camera.position.z + pos.z * 5, 5, 0x00ff00);
    }
});

// Controls
document.addEventListener('mousedown', () => renderer.domElement.requestPointerLock());
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
        camera.rotation.y -= e.movementX * 0.002;
        camera.rotation.x -= e.movementY * 0.002;
    }
});
camera.rotation.order = 'YXZ';
camera.position.set(0, 2, 10);

function animate() {
    requestAnimationFrame(animate);
    world.update(scene);
    
    // Portal Rendering Logic: 
    // 1. Hide blue portal, render orange camera view to blueRenderTarget
    // 2. Hide orange portal, render blue camera view to orangeRenderTarget
    renderer.render(scene, camera);
}
animate();
