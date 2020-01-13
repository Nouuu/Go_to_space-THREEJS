import * as THREE from "./libs/three.module.js";

export function initSpace() {
    let scene = new THREE.Scene();
    let radius = 7000;

    let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1e7);
    camera.position.z = 0;
    camera.position.y = 0;
    camera.position.x = 0;

    /**
     * Ambient light
     */

    let light = new THREE.AmbientLight(0xf2f2f2, 1);
    scene.add(light);

    /**
     * Background
     */

    let starField = stars(radius);
    scene.add(starField[0]);
    scene.add(starField[1]);

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

function stars(radius) {
    let starsGeometry = [
        new THREE.BufferGeometry(),
        new THREE.BufferGeometry()
    ];

    let vertices = [];
    let vertices2 = [];
    let newRand = function (radius) {
        return (0.5 - Math.random()) * (radius / 2);
    };
    let star = new THREE.Vector3();
    let star2 = new THREE.Vector3();

    for (let i = 0; i <radius; i++) {
        star.set(newRand(radius), newRand(radius), newRand(radius));
        star2.set(newRand(radius), newRand(radius), newRand(radius));

        vertices[i * 3] = star.x;
        vertices[i * 3 + 1] = star.y;
        vertices[i * 3 + 2] = star.z;
        vertices2[i * 3] = star2.x;
        vertices2[i * 3 + 1] = star2.y;
        vertices2[i * 3 + 2] = star2.z;
    }


    starsGeometry[0].addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    starsGeometry[1].addAttribute('position', new THREE.Float32BufferAttribute(vertices2, 3));

    let starMaterial = [
        new THREE.PointsMaterial({color: 0xffffff, size: 2, sizeAttenuation: false}),
        new THREE.PointsMaterial({color: 0xFF0003, size: 1, sizeAttenuation: false})
    ];

    let starField = [
        new THREE.Points(starsGeometry[0], starMaterial[0]),
        new THREE.Points(starsGeometry[1], starMaterial[1])
    ];

    //TODO trouver à quoi ça sert
    starField[0].matrixAutoUpdate = false;
    starField[0].updateMatrix();
    starField[1].matrixAutoUpdate = false;
    starField[1].updateMatrix();

    return starField;
}
