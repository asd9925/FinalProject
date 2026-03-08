//allow this file to use 3.js
import * as THREE from 'three'

export function addDefaultMeshes(){
    const geometry = new THREE.BoxGeometry(1,1,1);
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    const mesh = new THREE.Mesh(geometry, material);

    //return a value
    return mesh;
}

export function addStandardMeshes(){
    const geometry = new THREE.BoxGeometry(1,1,1)
    const material = new THREE.MeshStandardMaterial({
        color: 0x00f000
    })

    const mesh = new THREE.Mesh(geometry, material)
    return mesh
}