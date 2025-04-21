import * as THREE from 'three';
import * as CANNON from 'cannon-es';

interface BoxOptions {
  width: number;
  height: number;
  depth: number;
  color: number;
  position: [number, number, number];
  mass: number;
}

export function addBox(scene: THREE.Scene, world: CANNON.World, options: BoxOptions) {
  const { width, height, depth, color, position, mass } = options;
  
  // Create Three.js mesh
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(position[0], position[1], position[2]);
  
  // Mark as draggable
  mesh.userData.draggable = true;
  
  // Add to scene
  scene.add(mesh);
  
  // Create physics body
  const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
  const body = new CANNON.Body({
    mass,
    shape,
    position: new CANNON.Vec3(position[0], position[1], position[2])
  });
  
  // Add to world
  world.addBody(body);
  
  // Store reference to the physics body
  mesh.userData.physicsBody = body;
  
  return { mesh, body };
}

export function addSphere(scene: THREE.Scene, world: CANNON.World, options: {
  radius: number;
  color: number;
  position: [number, number, number];
  mass: number;
}) {
  const { radius, color, position, mass } = options;
  
  // Create Three.js mesh
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(position[0], position[1], position[2]);
  
  // Mark as draggable
  mesh.userData.draggable = true;
  
  // Add to scene
  scene.add(mesh);
  
  // Create physics body
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass,
    shape,
    position: new CANNON.Vec3(position[0], position[1], position[2])
  });
  
  // Add to world
  world.addBody(body);
  
  // Store reference to the physics body
  mesh.userData.physicsBody = body;
  
  return { mesh, body };
}