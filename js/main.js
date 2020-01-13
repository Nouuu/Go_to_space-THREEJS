import * as THREE from './libs/three.module.js';
import {THREEx} from './libs/THREEx.KeyboardState.js';
import {GUI} from './libs/dat.gui.module.js';
import Stats from './libs/stats.module.js';

import * as initTerrain from './initTerrain.js';

Math.radians = (degrees) => degrees * Math.PI / 180;
let planetRotationSpeed = 0.0005;
let camera, scene, cameraSpace, cameraShip, sceneSpace, sceneShip, renderer, stats, earth, cube;
let keyboard = new THREEx.KeyboardState();
let moveSpeed = 1;
let rotateSpeed = 0.01;
let vectorX = new THREE.Vector3(1, 0, 0);
let vectorY = new THREE.Vector3(0, 1, 0);

/**
 * Textures matériel
 */
const loader = new THREE.TextureLoader();

const blackMat = new THREE.MeshStandardMaterial({color: 0x000000});
const whiteMat = new THREE.MeshStandardMaterial({color: 0xffffff});
const greenMat = new THREE.MeshStandardMaterial({color: 0x38FF00});

/**
 * GUI
 */
let dimension = "ship";
let params = {
    Switch: function () {
        switch (dimension) {
            case "space":
                scene = sceneSpace;
                camera = cameraSpace;
                dimension = "ship";
                break;
            case "ship":
                camera = cameraShip;
                scene = sceneShip;
                dimension = "space";
                break;
            default:
                break;
        }
    }
};
let gui = new GUI();
gui.add(params, 'Switch');


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
init();
animate();

function init() {
    stats = new Stats();
    document.body.appendChild(stats.dom);

    /**
     * init terrains
     */
    [sceneSpace, cameraSpace] = initTerrain.initSpace();
    [sceneShip, cameraShip] = initTerrain.initShip(whiteMat);

    scene = sceneSpace;
    camera = cameraSpace;

    /**
     * Get planets
     */

    earth = scene.getObjectByName("earth");

    /**
     * Camera object
     */

    cube = new THREE.Mesh(
        new THREE.CubeGeometry(2, 2, 2),
        new THREE.MeshPhongMaterial({color: 0xf2f2f2})
    );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.applyMatrix4(camera.matrixWorld);
    scene.add(camera);
    camera.add(cube);
    cube.position.set(0, -5, -12);
    /**
     * Options de rendu
     */
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
    control();
    if (dimension !== "space") {
        planetUpdate();
    }
}

function render() {
    stats.update();
    renderer.render(scene, camera);
}

function control() {
    if (keyboard.pressed("up")) {
        camera.rotateOnAxis(vectorX, rotateSpeed);
    }
    if (keyboard.pressed("down")) {
        camera.rotateOnAxis(vectorX, -rotateSpeed);
    }
    if (keyboard.pressed("left")) {
        camera.rotateOnAxis(vectorY, rotateSpeed);
    }
    if (keyboard.pressed("right")) {
        camera.rotateOnAxis(vectorY, -rotateSpeed);
    }
}

function planetUpdate() {
    earth.rotation.y += planetRotationSpeed;
}