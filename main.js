import * as THREE from 'three';
import { PhysicsWorld, createBox } from './physics.js';

// --- STATE ---
let fuckedMode = false;
let noclip = false;
const menu = document.getElementById('menu-overlay');
const ui = document.getElementById('ui-layer');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new PhysicsWorld();

// --- MENU BUTTONS ---
document.getElementById('fucked-btn').addEventListener('click', (e) => {
    fuckedMode = !fuckedMode;
    e.target.innerText = `FUCKED PHYSICS ENGINE: ${fuckedMode ? 'ON' : 'OFF'}`;
    document.getElementById('fucked-warning').style.visibility = fuckedMode ? 'visible' : 'hidden';
});

document.getElementById('start-btn').addEventListener('click', () => {
    menu.style.display = 'none';
    ui.style.display = 'block';
    renderer.domElement.requestPointerLock();
    
    if (fuckedMode) {
        world.world.gravity.set(0, 150, 0); // Extreme chaotic gravity
        world.timeStep = 1 / 5; // Glitchy movement
    }
});

// --- NOCLIP & MOVEMENT ---
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyV') noclip = !noclip; // Toggle Noclip
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

function handleMovement() {
    const speed = noclip ? 0.5 : 0.15;
    if (keys['KeyW']) camera.translateZ(-speed);
    if (keys['KeyS']) camera.translateZ(speed);
    if (keys['KeyA']) camera.translateX(-speed);
    if (keys['KeyD']) camera.translateX(speed);
    
    if (!noclip) camera.position.y = 2; // Floor lock
}

// --- ENGINE LOOP ---
createBox(scene, world, 100, 1, 100, 0, -0.5, 0, 0, 0x222222);

function animate() {
    requestAnimationFrame(animate);
    handleMovement();
    world.update(scene);
    renderer.render(scene, camera);
}
animate();

// Mouse Look
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
        camera.rotation.y -= e.movementX * 0.002;
        camera.rotation.x -= e.movementY * 0.002;
        camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));
    }
});
camera.rotation.order = 'YXZ';
