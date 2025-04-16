import * as THREE from 'three';
import { io } from 'socket.io-client';

import camera from '../util/lib/camera';
import scene from '../util/lib/scene';
import { createPlayer } from '../util/components/Player/player';
import { setupEnvironment } from '../util/components/Environment/environment';
import { setupPlayerController, updatePlayerController, } from '../util/components/Player/PlayerController';
import * as CANNON from 'cannon';


const socket = io('http://localhost:3000');

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

//world setup
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); 




// Helpers
scene.add(new THREE.AxesHelper(5));
scene.add(new THREE.GridHelper(15, 50));

// Add environment
setupEnvironment(scene, renderer,world);

// Pointer lock on click
document.body.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

// Player
let pill1: THREE.Object3D | null = null;
let pillBody: CANNON.Body ;
const otherPlayers: { [key: string]: THREE.Object3D } = {};

(async () => {
    pill1 = await createPlayer({ x: 0, y: 0.5, z: 0 });
    const shape = new CANNON.Sphere(0.5); // Adjust the shape to match your player model
    pillBody = new CANNON.Body({
        mass: 1,
        shape,
        position: new CANNON.Vec3(0, 0.5, 0), // Initial position
    })
    world.addBody(pillBody); // Add the body to the world
    if (pill1) {
        scene.add(pill1);
        pill1.add(camera);
        camera.position.set(0, 1.5, -1); // Third-person position

        setupPlayerController(pill1, camera); // Unified movement + mouse look
        renderer.setAnimationLoop(animate);
    } else {
        console.error("Failed to create local player.");
    }
})();

// Socket: initialize all other players
socket.on('initialize', async (players) => {
    for (const id in players) {
        if (id === socket.id) continue;

        try {
            const player = await createPlayer(players[id]);
            scene.add(player);
            otherPlayers[id] = player;
        } catch (error) {
            console.error("Error loading player model for", id, ":", error);
        }
    }
});

// Socket: new player joined
socket.on('newPlayer', async (data) => {
    if (data.id === socket.id) return;

    try {
        const player = await createPlayer(data.position);
        scene.add(player);
        otherPlayers[data.id] = player;
    } catch (error) {
        console.error("Error loading new player model:", error);
    }
});

// Socket: update position and rotation of remote players
socket.on('playerMoved', (data) => {
    if (data.id === socket.id) return;

    const other = otherPlayers[data.id];
    console.log(other)
    if (other) {
        other.position.set(data.position.x, data.position.y, data.position.z);
        other.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    }
});

// Socket: remove player
socket.on('removePlayer', (id) => {
    const player = otherPlayers[id];
    if (player) {
        scene.remove(player);
        delete otherPlayers[id];
    }
});

// Send position/rotation if changed
let lastPosition = new THREE.Vector3();
let lastRotation = new THREE.Euler();

function sendPlayerMovement() {
    if (!pill1) return;

    const position = pill1.position;
    const rotation = pill1.rotation;

    if (!position.equals(lastPosition) || !rotation.equals(lastRotation)) {
        socket.emit('move', {
            x: position.x,
            y: position.y,
            z: position.z,
            rotation: {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z,
            }
        });

        lastPosition.copy(position);
        lastRotation.copy(rotation);
    }
}
const timestep = 1 / 60; 
// Animate loop
function animate() {
    world.step(timestep);

    if (pill1 && pillBody) {
        pill1.position.copy(pillBody.position as unknown as THREE.Vector3); // Types don't match perfectly
        pill1.quaternion.copy(pillBody.quaternion as unknown as THREE.Quaternion);
        sendPlayerMovement();
    }
    updatePlayerController(); //
    renderer.render(scene, camera);
}
