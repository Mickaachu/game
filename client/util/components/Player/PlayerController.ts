// util/components/Player/PlayerController.ts

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const keysPressed: { [key: string]: boolean } = {};
let pitch = 0;
const pitchLimit = Math.PI / 2.5;
const movementSpeed = 4

let player: CANNON.Body;
let camera: THREE.Camera;

export function setupPlayerController(playerObj: CANNON.Body, cam: THREE.Camera) {
    player = playerObj;
    camera = cam;

    document.addEventListener('keydown', (event) => keysPressed[event.key.toLowerCase()] = true);
    document.addEventListener('keyup', (event) => keysPressed[event.key.toLowerCase()] = false);

    document.addEventListener('mousemove', (event) => {
        if (!document.pointerLockElement) return;

        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        // Yaw (left/right): rotate player
        const quaternion = new CANNON.Quaternion();
        quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -movementX * 0.002);
        player.quaternion = player.quaternion.mult(quaternion);

        // Pitch (up/down): rotate camera
        pitch -= movementY * 0.002;
        pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));
        camera.rotation.x = pitch;
    });
}



export function updatePlayerController() {
    if (!player) return;

    const direction = new THREE.Vector3();

    const isRunning = keysPressed['shift']; 
    const currentSpeed = isRunning ? movementSpeed * 2 : movementSpeed;

    if (keysPressed['w']) direction.z -= 1;
    if (keysPressed['s']) direction.z += 1;
    if (keysPressed['a']) direction.x -= 1;
    if (keysPressed['d']) direction.x += 1;

    direction.normalize().applyQuaternion(new THREE.Quaternion(
        player.quaternion.x,
        player.quaternion.y,
        player.quaternion.z,
        player.quaternion.w,
    ));

    player.velocity.x = direction.x * currentSpeed;
    player.velocity.z = direction.z * currentSpeed;
}