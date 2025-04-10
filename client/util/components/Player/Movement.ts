// movement.ts

import * as THREE from 'three';

// Define movement speed
const movementSpeed = 0.05;
const rotationSpeed = 0.02;

// Track key presses
const keysPressed: { [key: string]: boolean } = {
    W: false,
    A: false,
    S: false,
    D: false,
    Q: false,
    E: false
};

// Setup event listeners for keydown and keyup
export function setupKeyListeners() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'w' || event.key === 'W') keysPressed.W = true;
        if (event.key === 'a' || event.key === 'A') keysPressed.A = true;
        if (event.key === 's' || event.key === 'S') keysPressed.S = true;
        if (event.key === 'd' || event.key === 'D') keysPressed.D = true;
        if (event.key === 'q' || event.key === 'Q') keysPressed.Q = true;
        if (event.key === 'e' || event.key === 'E') keysPressed.E = true;
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'w' || event.key === 'W') keysPressed.W = false;
        if (event.key === 'a' || event.key === 'A') keysPressed.A = false;
        if (event.key === 's' || event.key === 'S') keysPressed.S = false;
        if (event.key === 'd' || event.key === 'D') keysPressed.D = false;
        if (event.key === 'q' || event.key === 'Q') keysPressed.Q = false;
        if (event.key === 'e' || event.key === 'E') keysPressed.E = false;
    });
}

// Handle player movement
export function handleMovement(pill1: THREE.Mesh) {
    const direction = new THREE.Vector3(0, 0, 0); // Movement vector

    // Move forward (W key)
    if (keysPressed.W) {
        direction.z -= movementSpeed;
    }

    // Move backward (S key)
    if (keysPressed.S) {
        direction.z += movementSpeed;
    }

    // Move left (A key)
    if (keysPressed.A) {
        direction.x -= movementSpeed;
    }

    // Move right (D key)
    if (keysPressed.D) {
        direction.x += movementSpeed;
    }

    // Apply the movement to pill1's position
    direction.applyQuaternion(pill1.quaternion);
    pill1.position.add(direction) // Rotate the direction vector by the pill's rotation
}

// Handle rotation (turning left or right)
export function handleRotation(pill1: THREE.Mesh) {
    // Rotate left (Q key)
    if (keysPressed.Q) {
        pill1.rotation.y += rotationSpeed;
    }

    // Rotate right (E key)
    if (keysPressed.E) {
        pill1.rotation.y -= rotationSpeed;
    }
}
