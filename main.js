import * as THREE from 'three';
import * as CANNON from 'cannon';

// --- CONFIG ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- PHYSICS (The GMod Side) ---
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
const physicsBodies = [];

function createBox(w, h, d, x, y, z, mass = 0, color = 0x888888) {
    // Three.js Visual
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshPhongMaterial({ color })
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);

    // Cannon.js Physics
    const shape = new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2));
    const body = new CANNON.Body({ mass });
    body.addShape(shape);
    body.position.set(x, y, z);
    world.addBody(body);
    
    if (mass > 0) physicsBodies.push({ mesh, body });
    return body;
}

// --- MAP DESIGN (The Portal Side) ---
// Floor
createBox(30, 1, 30, 0, -0.5, 0, 0, 0x333333);
// Walls
createBox(30, 10, 1, 0, 5, -15, 0, 0x555555); // Back Wall
createBox(1, 10, 30, -15, 5, 0, 0, 0x555555); // Left Wall
// Elevated Platform
createBox(10, 0.5, 10, 5, 4, -5, 0, 0x777777);

const light = new THREE.PointLight(0xffffff, 500);
light.position.set(0, 10, 0);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

// --- PLAYER CONTROLS ---
let move = { f: 0, b: 0, l: 0, r: 0 };
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') move.f = 1;
    if (e.code === 'KeyS') move.b = 1;
    if (e.code === 'KeyA') move.l = 1;
    if (e.code === 'KeyD') move.r = 1;
    if (e.code === 'KeyQ') createBox(1, 1, 1, camera.position.x, 5, camera.position.z, 5, 0x00ff00); // GMod Spawn
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') move.f = 0;
    if (e.code === 'KeyS') move.b = 0;
    if (e.code === 'KeyA') move.l = 0;
    if (e.code === 'KeyD') move.r = 0;
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
        camera.rotation.y -= e.movementX * 0.002;
        camera.rotation.x -= e.movementY * 0.002;
        camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));
    }
});
document.addEventListener('mousedown', () => renderer.domElement.requestPointerLock());

camera.position.set(0, 2, 10);
camera.rotation.order = 'YXZ';

// --- MAIN LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    // Movement Logic
    const speed = 0.15;
    if (move.f) camera.translateZ(-speed);
    if (move.b) camera.translateZ(speed);
    if (move.l) camera.translateX(-speed);
    if (move.r) camera.translateX(speed);
    camera.position.y = 2; // Keep on ground

    world.step(1/60);
    physicsBodies.forEach(obj => {
        obj.mesh.position.copy(obj.body.position);
        obj.mesh.quaternion.copy(obj.body.quaternion);
    });

    renderer.render(scene, camera);
}
animate();
