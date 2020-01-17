import * as THREE from './libs/three.module.js';
import {THREEx} from './libs/THREEx.KeyboardState.js';
import {GUI} from './libs/dat.gui.module.js';
import Stats from './libs/stats.module.js';

import * as initTerrain from './initTerrain.js';

// Création et initialisation des variables
Math.radians = (degrees) => degrees * Math.PI / 180;
let planetRotationSpeed = 0.01;
let systemRotationSpeed = 0.0005;
let planetList = ['earth', 'mercury', 'venus', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune'];
let listener = new THREE.AudioListener();
let sound = new THREE.Audio(listener);
let camera, scene, cameraSpace, cameraShip, sceneSpace, sceneShip, renderer, stats, planets, cube;
let gamepad = false;
let spaceRadius = 14000;
let keyboard = new THREEx.KeyboardState(); // import de la librairie qui écoute le clavier
let shipMoveSpeed = 10;
let shipBoostSpeed = 15;
let currentMoveSpeed = shipMoveSpeed;
let shipRotationSpeed = 0.02;
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
let dimension = "space";

startGUI();

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
    // Par défaut, positionnement sur la scène du vaisseau
    scene = sceneShip;
    camera = cameraShip;

    /**
     * Get planets
     */
    // Récupération du groupe "planets"
    if (dimension === 'ship') {
        planets = scene.getObjectByName("planets");
    }

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
     * BOUTONS :
     * a : 0
     * b : 1
     * x : 2
     * y : 3
     * gachette haut gauche : 4
     * gachette haut droite : 5
     * gachette gauche : 6
     * gachette droite : 7
     * haut : 12
     * bas : 13
     * gauche : 14
     * droite : 15
     *
     * AXES :
     * Stick gauche gauche : axe 0, négatif
     * Stick gauche droite : axe 0, positif
     * Stick gauche haut : axe 1, négatif
     * Stick gauche bas : axe 1, positif
     * Stick droit gauche : axe 2, négatif
     * Stick droit droite : axe 2, positif
     * Stick droit haut : axe 3, négatif
     * Stick droit bas : axe 3, positif
     */
    if (gamepad) {
        gamepad = navigator.getGamepads()[0];

        // Stick gauche haut : reculer
        if (gamepad.axes[1] <= -0.1) {
            camera.translateZ(currentMoveSpeed * gamepad.axes[1])
        }
        // Stick gauche bas : avancer
        if (gamepad.axes[1] >= 0.1) {
            camera.translateZ(currentMoveSpeed * gamepad.axes[1])
        }
        // Stick gauche gauche : gauche
        if (gamepad.axes[0] <= -0.1) {
            camera.translateX(-currentMoveSpeed * -gamepad.axes[0]);
        }
        // Stick gauche gauche : droite
        if (gamepad.axes[0] >= 0.1) {
            camera.translateX(currentMoveSpeed * gamepad.axes[0])
        }
        // Stick droit haut : roulade avant
        if (gamepad.axes[3] <= -0.1) {
            camera.rotateOnAxis(vectorX, shipRotationSpeed * -gamepad.axes[3]);
        }
        // Stick droit haut : roulade arrière
        if (gamepad.axes[3] >= 0.1) {
            camera.rotateOnAxis(vectorX, -shipRotationSpeed * gamepad.axes[3]);
        }
        // Stick droit gauche : tourner à gauche
        if (gamepad.axes[2] <= -0.1) {
            camera.rotateOnAxis(vectorY, shipRotationSpeed * -gamepad.axes[2]);
        }
        // Stick droit gauche : tourner à droite
        if (gamepad.axes[2] >= 0.1) {
            camera.rotateOnAxis(vectorY, -shipRotationSpeed * gamepad.axes[2]);
        }
        // Appui sur gachette haut gauche : tonneau à gauche
        if (gamepad.buttons[4].pressed) {
            camera.rotateOnAxis(vectorZ, shipRotationSpeed * 0.5);
        }
        // Appui sur gachette haut droite : tonneau à droite
        if (gamepad.buttons[5].pressed) {
            camera.rotateOnAxis(vectorZ, -shipRotationSpeed * 0.5);
        }
        // Appui sur gachette gauche : descendre
        if (gamepad.buttons[6].value >= 0.1) {
            camera.translateY(-currentMoveSpeed * gamepad.buttons[6].value);
        }
        // Appui sur gachette droite : monter
        if (gamepad.buttons[7].value >= 0.1) {
            camera.translateY(currentMoveSpeed * gamepad.buttons[7].value);
        }
        // Appui bouton a
        if (gamepad.buttons[0].pressed) {
            currentMoveSpeed = shipBoostSpeed;
        } else {
            currentMoveSpeed = shipMoveSpeed;
        }
    } else { // Partie clavier
        if (keyboard.pressed("up")) {
            camera.rotateOnAxis(vectorX, shipRotationSpeed);
        }
        if (keyboard.pressed("down")) {
            camera.rotateOnAxis(vectorX, -shipRotationSpeed);
        }
        if (keyboard.pressed("left")) {
            camera.rotateOnAxis(vectorY, shipRotationSpeed);
        }
        if (keyboard.pressed("right")) {
            camera.rotateOnAxis(vectorY, -shipRotationSpeed);
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
            camera.rotateOnAxis(vectorZ, shipRotationSpeed * 0.5);
        }
        if (keyboard.pressed("e")) {
            camera.rotateOnAxis(vectorZ, -shipRotationSpeed * 0.5);
        }

        if (keyboard.pressed("shift")) {
            currentMoveSpeed = shipBoostSpeed;
        } else {
            currentMoveSpeed = shipMoveSpeed;
        }
    }
}

function planetUpdate() {
    planets.rotation.y += systemRotationSpeed;

    for (let i = 0; i < planetList.length; i++) {
        planets.getObjectByName(planetList[i]).rotation.y += planetRotationSpeed;
    }
}

function music() {
    let audioLoader = new THREE.AudioLoader();
    audioLoader.load('./content/audio/2001.ogg', function (buffer) {
        sound.setBuffer(buffer); // Définition de la source du buffer
        sound.setLoop(false);
        sound.setVolume(1);
    });
}

function startGUI() {

    let params = {
        Switch: function () {
            switch (dimension) {
                case "space":
                    scene.remove(camera);
                    scene = sceneSpace;
                    camera = cameraSpace;
                    scene.add(camera);
                    camera.add(cube);
                    cube.position.set(0, -5, -12);
                    planets = scene.getObjectByName("planets");
                    camera.add(listener); // Ajout de l'audio à la caméra
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
        },
        PlanetRotationSpeed : planetRotationSpeed,
        SystemRotationSpeed : systemRotationSpeed,
        PlayPauseMusic : function () {
            if (sound.isPlaying) {
                sound.stop();
            } else {
                sound.play();
            }
        },
        ShipMoveSpeed: shipMoveSpeed,
        ShipBoostSpeed: shipBoostSpeed,
        ShipRotationSpeed: shipRotationSpeed
    };

    let gui = new GUI();
    gui.width = 310;
    let spaceFolder = gui.addFolder('Space settings');
    let shipControlsFolder = gui.addFolder('SpaceShip controls settings');

    gui.add(params, 'Switch').name('Switch scene');

    spaceFolder.add(params, 'PlanetRotationSpeed').name('Planet rotation speed').min(0).max(0.1).step(0.005).onChange(function () {
        planetRotationSpeed = params.PlanetRotationSpeed;
    });
    spaceFolder.add(params, 'SystemRotationSpeed').name('System rotation speed').min(0).max(0.01).step(0.0005).onChange(function () {
        systemRotationSpeed = params.SystemRotationSpeed;
    });
    spaceFolder.add(params, 'PlayPauseMusic').name('Play/Pause music');

    shipControlsFolder.add(params, 'ShipMoveSpeed').name('Ship move speed').min(1).max(10).step(0.5).onChange(function () {
        shipMoveSpeed = params.ShipMoveSpeed;
    });
    shipControlsFolder.add(params, 'ShipBoostSpeed').name('Ship boost speed').min(2).max(20).step(0.5).onChange(function () {
        shipBoostSpeed = params.ShipBoostSpeed;
    });
    shipControlsFolder.add(params, 'ShipRotationSpeed').name('Ship rotation speed').min(0.001).max(0.05).step(0.001).onChange(function () {
        shipRotationSpeed = params.ShipRotationSpeed;
    });


    spaceFolder.open();
    shipControlsFolder.open();
}
