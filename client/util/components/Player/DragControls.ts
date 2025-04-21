import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function setupCustomDragControls(camera: THREE.Camera, scene: THREE.Scene, domElement: HTMLElement, ) {
    const raycaster = new THREE.Raycaster();
    const dragOffset = new THREE.Vector3(0, 0, 0);
    let selectedObject: THREE.Mesh | null = null;
    let isDragging = false;

    domElement.addEventListener('mousedown', (event) => {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        for(const hit of intersects) {
            const obj = hit.object as THREE.Mesh;
            if (obj.userData.draggable) {
                selectedObject = obj;
                isDragging = true;
                dragOffset.copy(hit.point).sub(obj.position);
                const body: CANNON.Body = obj.userData.physicsBody;
                body.velocity.set(0,0,0)
                body.angularVelocity.set(0,0,0)
                body.type = CANNON.Body.KINEMATIC;
                break;
            }
        }

    })

    domElement.addEventListener('mouseup', () => {
        if(selectedObject) {
            const body: CANNON.Body = selectedObject.userData.physicsBody;
            body.type = CANNON.Body.DYNAMIC;
        }
        isDragging = false;
        selectedObject = null;
        
    })
    const update = () => {
        if(isDragging && selectedObject) {
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            const dragDistance = 3;
            const direction = raycaster.ray.direction.clone();
            const targetPos = raycaster.ray.origin
                .clone()
                .add(direction.multiplyScalar(dragDistance))
                .sub(dragOffset);

            selectedObject.position.copy(targetPos);
            const body: CANNON.Body = selectedObject.userData.physicsBody;
            body.position.copy(targetPos as unknown as CANNON.Vec3);
            body.velocity.set(0,0,0);
            
        }
    }

    return {update};

}