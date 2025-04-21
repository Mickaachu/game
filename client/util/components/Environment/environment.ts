// environment.ts
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function setupEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer, world: CANNON.World) {
    // Set sky background color
    scene.background = new THREE.Color(0xaec6cf); // sky blue
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 10, 7.5);
    sunLight.castShadow = true;
    scene.add(sunLight);
    scene.add(ambientLight);
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

    // Walls
    const wallHeight = 20;
    const wallThickness = 1;
    const wallLength = 5; 

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 , side: THREE.DoubleSide}); // gray
    
    const wallpos = [
        { x:0, y: wallHeight / 2, z: -wallLength / 2, rotation: [0, 0, 0] }, // Back wall
        { x:0, y: wallHeight / 2, z: wallLength / 2, rotation: [0, Math.PI, 0] }, // Front wall
        { x: -wallLength / 2, y: wallHeight / 2, z: 0, rotation: [0, Math.PI / 2, 0] }, // Left wall
        { x: wallLength / 2, y: wallHeight / 2, z: 0, rotation: [0, -Math.PI / 2, 0] }, // Right wall
    ]

    wallpos.forEach(({x,y,z, rotation = 0})=> {
        const wallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength);
        const wall = new THREE.Mesh(wallGeo, wallMaterial);
        wall.position.set(x, y, z);
        wall.rotation.set(0, Array.isArray(rotation) ? rotation[1] : rotation, 0);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);

        const wallBody = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(x, y, z),
            shape: new CANNON.Box(new CANNON.Vec3(wallThickness * 0.75, wallHeight * 0.75, wallLength * 0.75))
        })
        
        wallBody.quaternion.setFromEuler(0, Array.isArray(rotation) ? rotation[1] : rotation, 0); 
        world.addBody(wallBody)
    })


}
