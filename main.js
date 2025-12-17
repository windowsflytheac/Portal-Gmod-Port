import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PhysicsWorld, createBox } from './physics.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new PhysicsWorld();
let physgun = null;

// --- LOAD PHYSGUN MODEL ---
const loader = new GLTFLoader();
loader.load('./models/physgun.glb', (gltf) => {
    physgun = gltf.scene;
    physgun.scale.set(0.1, 0.1, 0.1); // As requested
    camera.add(physgun); // Attach to camera
    scene.add(camera);
    
    // Position it in the bottom right of the screen
    physgun.position.set(0.5, -0.4, -0.8);
    physgun.rotation.y = Math.PI;
});

// --- PORTAL / MAP SETUP ---
createBox(scene, world, 40, 1, 40, 0, -0.5, 0, 0, 0x222222); // Floor
createBox(scene, world, 1, 10, 40, -20, 5, 0, 0, 0x444444); // Wall

// --- PHYSGUN INTERACTION ---
let grabbedBody = null;
let grabDist = 5;

window.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left Click to grab
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({x: 0, y: 0}, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        
        if (intersects.length > 0 && intersects[0].object.userData.physicsBody) {
            grabbedBody = intersects[0].object.userData.physicsBody;
            grabbedBody.mass = 0; // "Freeze" it while holding
            grabbedBody.updateMassProperties();
        }
    }
});

window.addEventListener('mouseup', () => {
    if (grabbedBody) {
        grabbedBody.mass = 5; // Return weight
        grabbedBody.updateMassProperties();
        grabbedBody = null;
    }
});

function animate() {
    requestAnimationFrame(animate);
    world.update(scene);

    if (grabbedBody) {
        // Move grabbed object with Physgun
        const targetPos = new THREE.Vector3();
        camera.getWorldDirection(targetPos);
        targetPos.multiplyScalar(grabDist).add(camera.position);
        grabbedBody.position.copy(targetPos);
    }

    // Render Main Game
    renderer.render(scene, camera);
}
animate();
