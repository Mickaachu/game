import * as THREE from 'three';
import camera from '../util/lib/camera';
import scene from '../util/lib/scene';
import { createPlayer } from '../util/components/Player/player';
import {createLights} from '../util/lib/lights';
import { setupMouseLook } from '../util/components/Player/MouseLook';
import { setupKeyListeners, handleMovement, handleRotation } from '../util/components/Player/Movement';
import { io } from 'socket.io-client';
import { setupEnvironment } from '../util/components/Environment/environment';
const socket = io('http://localhost:3000');


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(15, 50);
scene.add(gridHelper);



//player 
let pill1: THREE.Object3D | null = null;  // Initialize pill1 as null

(async () => {
    // Ensure pill1 is created asynchronously
    pill1 = await createPlayer({ x: 0, y: 0.5, z: 0 });
    
    if (pill1) {
        scene.add(pill1);
        pill1.add(camera);
        camera.position.set(0, 0.4, -1);

        // Call the setup functions after pill1 is initialized
        setupMouseLook(pill1, camera);
        setupKeyListeners();

        // Start animation loop
        renderer.setAnimationLoop(animate);
    } else {
        console.error("Failed to create pill1");
    }
})();

const otherPlayers: {[key: string]: THREE.Object3D} = {};


//movements listener



//environment:
setupEnvironment(scene, renderer);




// pointer lock
document.body.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
  });
  

//synch players
socket.on('initialize', async (players) => {
    for (const id in players) {
        if (id === socket.id) continue;  // Avoid adding yourself again

        try {
            // Wait for the player model to load before adding it to the scene
            const player = await createPlayer(players[id]);
            scene.add(player);
            otherPlayers[id] = player;
        } catch (error) {
            console.error("Error loading player model for", id, ":", error);
        }
    }
});
// main.ts
socket.on('newPlayer', async (data) => {
    if (data.id === socket.id) return;  // Avoid adding yourself again
    
    try {
        // Wait for the player model to load before adding it to the scene
        const player = await createPlayer(data.position);
        scene.add(player);
        otherPlayers[data.id] = player;
    } catch (error) {
        console.error("Error loading new player model:", error);
    }
});

// main.ts
socket.on('playerMoved', async (data) => {
    if (data.id === socket.id) return;  // Don't update your own movement

    try {
        if (otherPlayers[data.id]) {
            // Update the position and rotation of the player in the scene
            otherPlayers[data.id].position.set(data.position.x, data.position.y, data.position.z);
            otherPlayers[data.id].rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
        }
    } catch (error) {
        console.error("Error updating player movement for", data.id, ":", error);
    }
});

socket.on('removePlayer' , (id) => {
    if(otherPlayers[id]) {
        scene.remove(otherPlayers[id]);
        delete otherPlayers[id];
    }
})


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
                z: rotation.z
            }
        });

        lastPosition.copy(position);
        lastRotation.copy(rotation);
    }
}

function animate() {
    if (pill1) {
        handleMovement(pill1);
        handleRotation(pill1);
        pill1.position.y = 0.5; 
    }
    
    sendPlayerMovement();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);