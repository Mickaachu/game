// environment.ts
import * as THREE from 'three';
import * as CANNON from 'cannon';

export function setupEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer, world: CANNON.World) {
    // Set sky background color
    scene.background = new THREE.Color(0xaec6cf); // sky blue

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light (sunlight)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 10, 7.5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Enable shadow map
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x556b2f }); // olive green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const groundBody = new CANNON.Body({
        mass: 0, // Static body
        position: new CANNON.Vec3(0, 0, 0),
        shape: new CANNON.Plane()
    })

    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); 
    world.addBody(groundBody)
}
