import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PhysicsWorld, createBox } from './physics.js';

// --- ENGINE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new PhysicsWorld();

// --- PHYSGUN & BEAM ---
let physgun = null;
let beam, beamLight;
const beamMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });

function initPhysgunFX() {
    // Blue glow at the tip
    beamLight = new THREE.PointLight(0x00ffff, 2, 5);
    scene.add(beamLight);

    // The Beam Line
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    beam = new THREE.Line(geometry, beamMaterial);
    beam.visible = false;
    scene.add(beam);
}

const loader = new GLTFLoader();
loader.load('./models/physgun.glb', (gltf) => {
    physgun = gltf.scene;
    physgun.scale.set(0.1, 0.1, 0.1);
    physgun.position.set(0.5, -0.4, -0.8); // Adjusted for right-hand view
    physgun.rotation.y = Math.PI; 
    camera.add(physgun);
    scene.add(camera);
    initPhysgunFX();
});

// --- INTERACTION LOGIC ---
let grabbedBody = null;
let grabDist = 7;

window.addEventListener('mousedown', (e) => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({x: 0, y: 0}, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (e.button === 0 && intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.physicsBody) {
            grabbedBody = obj.userData.physicsBody;
            grabbedBody.mass = 0; // Lock in air
            grabbedBody.velocity.set(0,0,0);
            grabbedBody.updateMassProperties();
            beam.visible = true;
        }
    }
});

window.addEventListener('mouseup', () => {
    if (grabbedBody) {
        grabbedBody.mass = 5;
        grabbedBody.updateMassProperties();
        grabbedBody = null;
        beam.visible = false;
    }
});

// --- MAP & SPAWNING ---
createBox(scene, world, 50, 1, 50, 0, -0.5, 0, 0, 0x222222); // Floor
window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyQ') { // Spawn GMod Prop
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        createBox(scene, world, 1, 1, 1, camera.position.x + dir.x*5, 2, camera.position.z + dir.z*5, 2, 0x00ff00);
    }
});

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    world.update(scene);

    if (grabbedBody && physgun) {
        // Calculate target position based on camera look direction
        const targetPos = new THREE.Vector3();
        camera.getWorldDirection(targetPos);
        targetPos.multiplyScalar(grabDist).add(camera.position);
        
        grabbedBody.position.copy(targetPos);

        // Update Beam FX
        const muzzlePos = new THREE.Vector3().setFromMatrixPosition(physgun.matrixWorld);
        beam.geometry.setFromPoints([muzzlePos, grabbedBody.position]);
        beamLight.position.copy(muzzlePos);
    }

    renderer.render(scene, camera);
}
animate();

// Pointer Lock
document.addEventListener('click', () => renderer.domElement.requestPointerLock());
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
        camera.rotation.y -= e.movementX * 0.002;
        camera.rotation.x -= e.movementY * 0.002;
        camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));
    }
});
camera.rotation.order = 'YXZ';
