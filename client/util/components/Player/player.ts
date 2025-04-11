import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

interface Player {
  x: number;
  y: number;
  z: number;
}

// Player creation function
export async function createPlayer({ x, y, z }: Player): Promise<THREE.Object3D> {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      '/player1.glb', // path to your GLB/GLTF file
      (gltf) => {
        const model = gltf.scene;
        model.position.set(x, y, z);
        model.scale.set(1, 0.8, 1); // Adjust scale as needed
        resolve(model);
      },
      undefined,
      (error) => reject(error)
    );
  });
}

// Set up camera relative to player
export function setupCameraRelativeToPlayer(camera: THREE.Camera, player: THREE.Object3D) {
  // Set a default camera offset behind and above the player
  const offset = new THREE.Vector3(0, 1.5, 5); // Adjust the values as needed (y = height, z = distance behind player)

  // Update the camera position every frame
  function updateCameraPosition() {
    // Position the camera relative to the player
    camera.position.set(
      player.position.x + offset.x,
      player.position.y + offset.y,
      player.position.z + offset.z
    );

    // Always make the camera look at the player
    camera.lookAt(player.position);
  }

  return updateCameraPosition;
}

