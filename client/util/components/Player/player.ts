import * as THREE from 'three';


interface Player {
    x: number;
    y: number;
    z: number;
}


export function createPlayer({ x, y, z }: Player): THREE.Mesh {
    
const geometry = new THREE.CapsuleGeometry(0.3, 1); // radius, length
const material = new THREE.MeshStandardMaterial({ color: 0xff6699 });
const pill = new THREE.Mesh(geometry, material);
pill.position.set(x,y,z);

return pill
}