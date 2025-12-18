import * as CANNON from 'cannon';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.timeStep = 1 / 60; // Normal
        this.items = [];
    }

    update(scene) {
        this.world.step(this.timeStep);
        this.items.forEach(item => {
            item.mesh.position.copy(item.body.position);
            item.mesh.quaternion.copy(item.body.quaternion);
        });
    }
}
