import * as CANNON from 'cannon';
import * as THREE from 'three';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.items = [];
    }

    update(scene) {
        this.world.step(1/60);
        this.items.forEach(item => {
            item.mesh.position.copy(item.body.position);
            item.mesh.quaternion.copy(item.body.quaternion);
        });
    }
}

export function createBox(scene, pWorld, w, h, d, x, y, z, mass, color) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: color })
    );
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: mass,
        shape: new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2))
    });
    body.position.set(x, y, z);
    mesh.userData.physicsBody = body; // Link for Physgun to find
    
    pWorld.world.addBody(body);
    if (mass > 0) pWorld.items.push({ mesh, body });
    return body;
}
