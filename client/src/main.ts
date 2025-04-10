import * as THREE from 'three';
import camera from '../util/lib/camera';
import scene from '../util/lib/scene';
import { createPlayer } from '../util/components/Player/player';
import {createLights} from '../util/lib/lights';


import { setupKeyListeners, handleMovement, handleRotation } from '../util/components/Player/Movement';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(15, 50);
scene.add(gridHelper);



//player 
const pill1 = createPlayer({ x: 0, y: 0.8, z: 0 });
const pill2 = createPlayer({ x: -2, y: 0.8, z: -4 });


scene.add(pill1);
scene.add(pill2);

pill1.add(camera)

camera.position.set(0, 0.4, -1);
camera.lookAt(pill1.position.clone().add(new THREE.Vector3(0, 0.4, -1)));


//movements listener
setupKeyListeners();


// light
const lights = createLights();
scene.add(lights[0])
scene.add(lights[1])


// ground
const planeGeometry = new THREE.PlaneGeometry(15, 15);
const planeMaterial = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
planeMesh.rotation.x = -0.5 * Math.PI;



function animate() {
    handleMovement(pill1);
    handleRotation(pill1);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);