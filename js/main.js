import * as THREE from './libs/three.module.js';
import {THREEx} from './libs/THREEx.KeyboardState.js';
import {GUI} from './libs/dat.gui.module.js';
import Stats from './libs/stats.module.js';

import * as initTerrain from './initTerrain.js';

// Création et initialisation des variables
Math.radians = (degrees) => degrees * Math.PI / 180;
let planetRotationSpeed = 0.0005;
let systemRotationSpeed = 0.0005;
let listener = new THREE.AudioListener();
let sound = new THREE.Audio(listener);
let camera, scene, cameraSpace, cameraShip, sceneSpace, sceneShip, renderer, stats, planets, cube;
let gamepad = false;
let spaceRadius = 14000;
let keyboard = new THREEx.KeyboardState();
let moveSpeed = 10;
let currentMoveSpeed = moveSpeed;
let boostMoveSpeed = 15;
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
                camera.add(listener);
                sound.play();
                dimension = "ship";
                break;
            case "ship":
                camera = cameraShip;
                scene = sceneShip;
                dimension = "space";
                sound.stop();
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

    // Ajout des stats FPS
    stats = new Stats();
    document.body.appendChild(stats.dom);

    /**
     * load music
     */

    music();

    /**
     * init terrains
     */
    // Récupération des scènes et caméra
    [sceneSpace, cameraSpace] = initTerrain.initSpace(spaceRadius);
    [sceneShip, cameraShip] = initTerrain.initShip(whiteMat);
    // Par défaut, positionnement sur la scène de l'espace
    scene = sceneSpace;
    camera = cameraSpace;

    /**
     * Get planets
     */
    // Récupération du groupe "planets"
    planets = scene.getObjectByName("planets");

    /**
     * Camera object
     */
    // Création du cube représentant la caméra
    cube = new THREE.Mesh(
        new THREE.CubeGeometry(2, 2, 2),
        new THREE.MeshPhongMaterial({color: 0xf2f2f2})
    );
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(camera);
    camera.add(cube);
    cube.position.set(0, -5, -12);

    /**
     * Gamepad
     */
    // Ecoute du branchement de la manette
    window.addEventListener("gamepadconnected", (event) => {
        console.log("Une manette est connectée :");
        console.log(event.gamepad);
        gamepad = navigator.getGamepads()[0];
    });

    // Ecoute du débranchement de la manette
    window.addEventListener("gamepaddisconnected", (event) => {
        console.log("Une manette est déconnectée :");
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
        planetsRotation();
    }
}

function render() {
    stats.update();
    renderer.render(scene, camera);
}

function planetsRotation() {
    planets.rotation.y += systemRotationSpeed;
}

// Fonction de gestion des contrôles de la navigation
function control() {

    // Partie manette
    /**
     * Boutons :
     * a : 0
     * b : 1
     * y : 3
     * x : 2
     * gauche : 14
     * droite : 15
     * haut : 12
     * bas : 13
     * gachette gauche : 6
     * gachette haut gauche : 4
     * gachette droite : 7
     * gachette haut droite : 5
     *
     * Axes :
     * Stick gauche left : 0 négatif
     * Stick gauche right : 0 positif
     * Stick gauche up : 1 négatif
     * Stick gauche down : 1 positif
     * Stick droit gauche : 2 négatif
     * Stick droit droite : 2 positif
     * Stick droit haut : 3 négatif
     * Stick droit bas : 3 positif
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
        if (gamepad.buttons[4].pressed) {
            camera.rotateOnAxis(vectorZ, rotateSpeed * 0.5);
        }
        if (gamepad.buttons[5].pressed) {
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