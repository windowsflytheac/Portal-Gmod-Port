import * as CANNON from 'cannon';
import * as THREE from 'three';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.timeStep = 1 / 60; 
        this.items = [];
    }

    update(scene) {
        this.world.step(this.timeStep);
        this.items.forEach(item => {
            if (item.mesh && item.body) {
                item.mesh.position.copy(item.body.position);
                item.mesh.quaternion.copy(item.body.quaternion);
            }
        });
    }
}

// THIS IS THE LINE CAUSING THE ERROR - ENSURE 'export' IS PRESENT
export function createBox(scene, pWorld, w, h, d, x, y, z, mass, color) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: color })
    );
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2));
    const body = new CANNON.Body({ mass: mass });
    body.addShape(shape);
    body.position.set(x, y, z);
    
    mesh.userData.physicsBody = body;
    pWorld.world.addBody(body);

    if (mass > 0) {
        pWorld.items.push({ mesh, body });
    }
    return body;
}
