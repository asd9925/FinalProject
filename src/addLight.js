import * as THREE from 'three'

export function addLight(){
    const light = new THREE.DirectionalLight(0xffffff, 1)

    const light2 = new THREE.AmbientLight(0xffffff, 0.8)

    light.position.set(1, 1, 1)
    return light
}