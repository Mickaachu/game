import * as THREE from 'three';

export function createLights() : THREE.Light[] {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);

    return [ambientLight, directionalLight];
}