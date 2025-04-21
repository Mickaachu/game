import * as THREE from 'three';
import { io } from 'socket.io-client';
import * as CANNON from 'cannon-es';

import camera from '../util/lib/camera';
import scene from '../util/lib/scene';
import { createPlayer } from '../util/components/Player/player';
import { setupEnvironment } from '../util/components/Environment/environment';
import {setupPlayerController, updatePlayerController, } from '../util/components/Player/PlayerController';
import { setupCustomDragControls } from '../util/components/Player/DragControls';
import {addBox} from '../util/components/Objects/Objects'

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
renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});


// Player
let pill1: THREE.Object3D | null = null;
let pillBody: CANNON.Body ;
const otherPlayers: { [key: string]: THREE.Object3D } = {};
let draggableObjects: THREE.Mesh[] = [];
renderer.domElement.style.cursor = 'none';
let dragUpdate : (() => void) | null = null;


const crosshair = document.createElement('div');
Object.assign(crosshair.style, {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '20px',
  height: '20px',
  marginLeft: '-10px',
  marginTop: '-10px',
  pointerEvents: 'none',
  background: `url('data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">\
<line x1="10" y1="0" x2="10" y2="20" stroke="white" stroke-width="2"/>\
<line x1="0" y1="10" x2="20" y2="10" stroke="white" stroke-width="2"/>\
</svg>') no-repeat center center`,
  mixBlendMode: 'difference',
  zIndex: '1000',
});

document.body.appendChild(crosshair);




(async () => {
    pill1 = await createPlayer({ x: 0, y: 0.5, z: 0 });
    const shape = new CANNON.Sphere(0.5); // Adjust the shape to match your player model

    pillBody = new CANNON.Body({
        mass: 1,
        shape,
        material: new CANNON.Material('player'),
        position: new CANNON.Vec3(0, 0.5, 0),
         // Initial position
    })
   // Update mass properties based on the shape
    pillBody.angularFactor.set(0, 0, 0); // Prevent rotation
    pillBody.angularDamping = 0; // Damping to slow down rotation

    world.addBody(pillBody); 

    if (pill1) {
        scene.add(pill1);
        pill1.add(camera);
        camera.position.set(0, 1.5, -1

        ); // Third-person position

        setupPlayerController(pillBody, camera);
        const dragControl = setupCustomDragControls(camera, scene, renderer.domElement);
        dragUpdate = dragControl.update;
        renderer.setAnimationLoop(animate);
    } else {
        console.error("Failed to create local player.");
    }
})();

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

socket.on('playerMoved', (data) => {
    if (data.id === socket.id) return;

    const other = otherPlayers[data.id];
    console.log(other)
    if (other) {
        other.position.set(data.position.x, data.position.y, data.position.z);
        other.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    }
});

socket.on('removePlayer', (id) => {
    const player = otherPlayers[id];
    if (player) {
        scene.remove(player);
        delete otherPlayers[id];
    }
});

let lastPosition = new THREE.Vector3();
let lastRotation = new THREE.Euler();

const {mesh: redBox, body: redBoxBody} = addBox(scene, world, {width: 1, height: 1, depth: 1, color: 0xff0000, position: [4, 0.5, 4], mass: 1});
draggableObjects.push(redBox);

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
    updatePlayerController();
    world.step(timestep);

    // Only needed if mass > 0 (i.e. it's a dynamic object)
    redBox.position.copy(redBoxBody.position as unknown as THREE.Vector3);
    redBox.quaternion.copy(redBoxBody.quaternion as unknown as THREE.Quaternion);

    if (pill1 && pillBody) {
        pill1.position.set(
            pillBody.position.x,
            pillBody.position.y,
            pillBody.position.z
        )
        pill1.quaternion.set(
            pillBody.quaternion.x,
            pillBody.quaternion.y,
            pillBody.quaternion.z,
            pillBody.quaternion.w
        );
        sendPlayerMovement();
    }
    if (dragUpdate) {
        dragUpdate();
    }

    renderer.render(scene, camera);
}
