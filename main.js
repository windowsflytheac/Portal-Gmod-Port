import * as THREE from 'three';
import { PhysicsWorld, createBox } from './physics.js';

let fuckedMode = false;
const startBtn = document.getElementById('start-btn');
const fuckedBtn = document.getElementById('fucked-btn');
const warning = document.getElementById('fucked-warning');
const menu = document.getElementById('menu-overlay');
const ui = document.getElementById('ui-layer');

// --- SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new PhysicsWorld();

// --- MENU LOGIC ---
fuckedBtn.addEventListener('click', () => {
    fuckedMode = !fuckedMode;
    fuckedBtn.innerText = `FUCKED PHYSICS ENGINE: ${fuckedMode ? 'ON' : 'OFF'}`;
    warning.style.visibility = fuckedMode ? 'visible' : 'hidden';
    fuckedBtn.style.borderColor = fuckedMode ? '#ff0000' : '#00ffff';
    fuckedBtn.style.color = fuckedMode ? '#ff0000' : '#00ffff';
});

startBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    ui.style.display = 'block';
    renderer.domElement.requestPointerLock();
    
    // Apply "Fucked" Physics
    if (fuckedMode) {
        world.world.gravity.set(0, 50.82, 0); // Reverse/High Gravity
        world.timeStep = 1 / 10; // Extremely unstable time step
    }
});

// --- REMAINDER OF ENGINE ---
createBox(scene, world, 50, 1, 50, 0, -0.5, 0, 0, 0x1a1a1a);

function animate() {
    requestAnimationFrame(animate);
    world.update(scene); // Uses the updated timeStep
    renderer.render(scene, camera);
}
animate();
