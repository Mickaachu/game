// util/components/Player/PlayerController.ts

import * as THREE from 'three';

const keysPressed: { [key: string]: boolean } = {};
let pitch = 0;
const pitchLimit = Math.PI / 2.5;
const movementSpeed = 0.05;

let player: THREE.Object3D;
let camera: THREE.Camera;

export function setupPlayerController(playerObj: THREE.Object3D, cam: THREE.Camera) {
    player = playerObj;
    camera = cam;

    document.addEventListener('keydown', (event) => keysPressed[event.key.toLowerCase()] = true);
    document.addEventListener('keyup', (event) => keysPressed[event.key.toLowerCase()] = false);

    document.addEventListener('mousemove', (event) => {
        if (!document.pointerLockElement) return;

        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        // Yaw (left/right): rotate player
        player.rotation.y -= movementX * 0.002;

        // Pitch (up/down): rotate camera
        pitch -= movementY * 0.002;
        pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));
        camera.rotation.x = pitch;
    });
}

export function updatePlayerController() {
    if (!player) return;

    const direction = new THREE.Vector3();

    if (keysPressed['w']) direction.z -= movementSpeed;
    if (keysPressed['s']) direction.z += movementSpeed;
    if (keysPressed['a']) direction.x -= movementSpeed;
    if (keysPressed['d']) direction.x += movementSpeed;

    direction.applyQuaternion(player.quaternion);
    player.position.add(direction);
}
