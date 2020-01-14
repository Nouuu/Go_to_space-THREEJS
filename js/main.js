import * as THREE from './libs/three.module.js';
import {THREEx} from './libs/THREEx.KeyboardState.js';
import {GUI} from './libs/dat.gui.module.js';
import Stats from './libs/stats.module.js';

import * as initTerrain from './initTerrain.js';

Math.radians = (degrees) => degrees * Math.PI / 180;
let planetRotationSpeed = 0.0005;
let camera, scene, cameraSpace, cameraShip, sceneSpace, sceneShip, renderer, stats, earth, cube;
let gamepad = false;
let spaceRadius = 14000;
let keyboard = new THREEx.KeyboardState();
let moveSpeed = 0.5;
let currentMoveSpeed = moveSpeed;
let boostMoveSpeed = 2;
let rotateSpeed = 0.02;
let vectorX = new THREE.Vector3(1, 0, 0);
let vectorY = new THREE.Vector3(0, 1, 0);
let vectorZ = new THREE.Vector3(0, 0, 1);


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
    [sceneSpace, cameraSpace] = initTerrain.initSpace(spaceRadius);
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
     * Gamepad
     */

    window.addEventListener("gamepadconnected", (event) => {
        console.log("A gamepad connected:");
        console.log(event.gamepad);
        gamepad = navigator.getGamepads()[0];
    });

    window.addEventListener("gamepaddisconnected", (event) => {
        console.log("A gamepad disconnected:");
        console.log(event.gamepad);
        gamepad = false;
    });

    /**
     * Options de rendu
     */
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
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
    // Partie manette
    /**
     * Buttons :
     * a : 0
     * b : 1
     * y : 3
     * x : 2
     * left : 14
     * right : 15
     * up : 12
     * down : 13
     * gachette gauche : 6
     * gachette droite : 7
     *
     * Axes :
     * LStick left : 0 négatif
     * LStick right : 0 positif
     * LStick up : 1 négatif
     * LStick down : 1 positif
     * RStick Left : 2 négatif
     * RStick Right : 2 positif
     * RStick up : 3 négatif
     * RStick down : 3 positif
     */
    if (gamepad) {
        gamepad = navigator.getGamepads()[0];

        if (gamepad.axes[1] <= -0.1) {
            camera.translateZ(-currentMoveSpeed * -gamepad.axes[1])
        }
        if (gamepad.axes[1] >= 0.1) {
            camera.translateZ(currentMoveSpeed * gamepad.axes[1])
        }
        if (gamepad.axes[0] <= -0.1) {
            camera.translateX(-currentMoveSpeed * -gamepad.axes[0]);
        }
        if (gamepad.axes[0] >= 0.1) {
            camera.translateX(currentMoveSpeed * gamepad.axes[0])
        }
        if (gamepad.axes[3] <= -0.1) {
            camera.rotateOnAxis(vectorX, rotateSpeed * -gamepad.axes[3]);
        }
        if (gamepad.axes[3] >= 0.1) {
            camera.rotateOnAxis(vectorX, -rotateSpeed * gamepad.axes[3]);
        }
        if (gamepad.axes[2] <= -0.1) {
            camera.rotateOnAxis(vectorY, rotateSpeed * -gamepad.axes[2]);
        }
        if (gamepad.axes[2] >= 0.1) {
            camera.rotateOnAxis(vectorY, -rotateSpeed * gamepad.axes[2]);
        }
        if (gamepad.buttons[14].pressed) {
            camera.rotateOnAxis(vectorZ, rotateSpeed * 0.5);
        }
        if (gamepad.buttons[15].pressed) {
            camera.rotateOnAxis(vectorZ, -rotateSpeed * 0.5);
        }
        if (gamepad.buttons[7].value >= 0.1) {
            camera.translateY(currentMoveSpeed * gamepad.buttons[7].value);
        }
        if (gamepad.buttons[6].value >= 0.1) {
            camera.translateY(-currentMoveSpeed * gamepad.buttons[6].value);
        }
        if (gamepad.buttons[0].pressed) {
            currentMoveSpeed = boostMoveSpeed;
        } else {
            currentMoveSpeed = moveSpeed;
        }
    } else {
        // Partie clavier
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
        if (keyboard.pressed("z")) {
            camera.translateZ(-currentMoveSpeed)
        }
        if (keyboard.pressed("s")) {
            camera.translateZ(currentMoveSpeed)
        }
        if (keyboard.pressed("q")) {
            camera.translateX(-currentMoveSpeed);
        }
        if (keyboard.pressed("d")) {
            camera.translateX(currentMoveSpeed);
        }
        if (keyboard.pressed("space")) {
            camera.translateY(currentMoveSpeed);
        }
        if (keyboard.pressed("ctrl")) {
            camera.translateY(-currentMoveSpeed);
        }
        if (keyboard.pressed("a")) {
            camera.rotateOnAxis(vectorZ, rotateSpeed * 0.5);
        }
        if (keyboard.pressed("e")) {
            camera.rotateOnAxis(vectorZ, -rotateSpeed * 0.5);
        }

        if (keyboard.pressed("shift")) {
            currentMoveSpeed = boostMoveSpeed;
        } else {
            currentMoveSpeed = moveSpeed;
        }
    }
}

function planetUpdate() {
    earth.rotation.y += planetRotationSpeed;
}