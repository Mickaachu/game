import * as THREE from 'three';

let pitch = 0;
const pitchLimit = Math.PI / 2.5; // Prevent looking too far up/down

export function setupMouseLook(player: THREE.Object3D, camera: THREE.Camera) {
  document.addEventListener('mousemove', (event) => {
    if(!document.pointerLockElement) return; // Ignore if not in pointer lock mode

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    // Yaw (left/right) applied to player
    player.rotation.y -= movementX * 0.002;

    // Pitch (up/down) applied to camera
    pitch -= movementY * 0.002;
    pitch = Math.max(-pitchLimit, Math.min(pitchLimit, pitch));
    camera.rotation.x = pitch;
   
  });
}
