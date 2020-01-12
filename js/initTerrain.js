import * as THREE from "./libs/three.module.js";

export function initSpace(bgText) {
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.z = 100;
    camera.position.y = 50;
    /**
     * Ambient light
     */

    let light = new THREE.AmbientLight(0xf2f2f2, 1);
    scene.add(light);

    /**
     * Background
     */

    scene.background = bgText;

    return [scene, camera];
}

export function initShip(terrainMat) {
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.z = 30;
    camera.position.y = 10;
    // camera.rotation.x -= Math.radians(90);


    /**
     * Ajout du terrain
     */
    let geometry;
    geometry = new THREE.PlaneBufferGeometry(30, 30, 32, 32);
    let terrain = new THREE.Mesh(geometry, terrainMat);
    terrain.receiveShadow = true;
    terrain.rotateX(Math.radians(-90));

    scene.add(terrain);

    /**
     * Ambient light
     */

    let light = new THREE.AmbientLight(0xf2f2f2, 1);
    scene.add(light);

    return [scene, camera];
}
