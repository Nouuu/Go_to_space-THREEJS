import * as THREE from './libs/three.module.js';
import {THREEx} from './libs/THREEx.KeyboardState.js';
import {GUI} from './libs/dat.gui.module.js';
import Stats from './libs/stats.module.js';
import {ColladaLoader} from './libs/ColladaLoader.js';

import * as initTerrain from './initTerrain.js';

// Création et initialisation des variables
Math.radians = (degrees) => degrees * Math.PI / 180;
let planetRotationSpeed = 0.01;
let systemRotationSpeed = 0.0005;
let planetList = ['earth', 'mercury', 'venus', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune'];
let spaceListener = new THREE.AudioListener();
let shipListener = new THREE.AudioListener();
let spaceSound = new THREE.Audio(spaceListener);
let sWSound = new THREE.PositionalAudio(spaceListener);
let shipSound = new THREE.PositionalAudio(shipListener);
let camera, scene, params, cameraSpace, cameraShip, sceneSpace, sceneShip, renderer, stats, planets, falconPivot,
    falcon;
let gamepad = false;
let onGamePadSelectButton = false;
let spaceRadius = 18000;
let keyboard = new THREEx.KeyboardState(); // import de la librairie qui écoute le clavier
let shipMoveSpeed = 10;
let shipBoostSpeed = 15;
let currentShipMoveSpeed = shipMoveSpeed;
let shipRotationSpeed = 0.02;
let characterMoveSpeed = 5;
let characterRotationSpeed = 0.02;
let shipMoveFrontRotationEffect = 10;
let shipMoveSideRotationEffect = 10;
let currentShipMoveFrontRotationEffect = 0;
let currentShipMoveSideRotationEffect = 0;
let shipMoveRotationPresicion = 0.02;
let musicVolume = 1;
let shipVolume = 1;
let clock = new THREE.Clock();
let vectorX = new THREE.Vector3(1, 0, 0);
let vectorY = new THREE.Vector3(0, 1, 0);
let vectorZ = new THREE.Vector3(0, 0, 1);
let stormMixer1 = undefined;
let stormMixer2 = undefined;
let stormMixer3 = undefined;
let stormMixer4 = undefined;
let stormMixer5 = undefined;
let stormMixer6 = undefined;
let stormMixer7 = undefined;
let stormMixer8 = undefined;
let stormMixer9 = undefined;

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

// Collisions
let corridorWidth = 550;
let corridorLength = 1600;

startGUI();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
init();
animate();

function init() {
    // Ajout des stats FPS
    stats = new Stats();
    document.body.appendChild(stats.dom);


    /**
     * init terrains
     */
    // Récupération des scènes et caméra
    [sceneSpace, cameraSpace] = initTerrain.initSpace(spaceRadius);
    [sceneShip, cameraShip] = initTerrain.initShip();
    // Par défaut, positionnement sur la scène du vaisseau
    scene = sceneSpace;
    camera = cameraSpace;

    cameraSpace.add(spaceListener);
    cameraShip.add(shipListener);

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
    sceneShip.add(cameraShip);
    sceneSpace.add(cameraSpace);

    /**
     * load music
     */

    music();


    let loadingManager = new THREE.LoadingManager(function () {
        cameraSpace.add(falconPivot);
    });

    let loader = new ColladaLoader(loadingManager);
    loader.load('./content/models/MilleniumFalcon/model.dae', function (collada) {
        falconPivot = new THREE.Group();
        falcon = collada.scene;
        falcon.position.x -= 13;
        falcon.rotation.x += Math.radians(180);
        falconPivot.add(falcon);
        falconPivot.position.z -= 75;
        falconPivot.position.y -= 20;
        falcon.children[0].children.pop();
        falcon.traverse(function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
    });

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
    renderer.domElement.id = 'canvas';
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('click', onLoad, false);
    document.addEventListener('keydown', onLoad, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onLoad() {
    const preload = document.querySelector('.container');
    const canvas = document.querySelector('#canvas');
    canvas.classList.add('display');
    preload.classList.add('container-finish');
}

function animate() {
    requestAnimationFrame(animate);
    render();
    if (dimension !== "space") {
        spaceControl();
        planetUpdate();
    } else {
        shipControl();
        danceStorm();
    }
}

function render() {
    stats.update();
    renderer.render(scene, camera);
}

function danceStorm() {
    if (shipSound.isPlaying) {
        let storm1 = sceneShip.getObjectByName('storm1');
        let delta = clock.getDelta();
        if (storm1 !== undefined) {
            if (stormMixer1 === undefined) {
                stormMixer1 = new THREE.AnimationMixer(storm1);
                let action = stormMixer1.clipAction(storm1.animations[0]);
                action.play();
            }
            if (stormMixer1) stormMixer1.update(delta + THREE.Math.randFloatSpread(0.002));
        }
        let storm2 = sceneShip.getObjectByName('storm2');
        if (storm2 !== undefined) {
            if (stormMixer2 === undefined) {
                stormMixer2 = new THREE.AnimationMixer(storm2);
                let action = stormMixer2.clipAction(storm2.animations[0]);
                action.play();
            }
            if (stormMixer2) stormMixer2.update(delta + THREE.Math.randFloatSpread(0.002));
        }
        let storm3 = sceneShip.getObjectByName('storm3');
        if (storm3 !== undefined) {
            if (stormMixer3 === undefined) {
                stormMixer3 = new THREE.AnimationMixer(storm3);
                let action = stormMixer3.clipAction(storm3.animations[0]);
                action.play();
            }
            if (stormMixer3) stormMixer3.update(delta + THREE.Math.randFloatSpread(0.002));
        }
        let storm4 = sceneShip.getObjectByName('storm4');
        if (storm4 !== undefined) {
            if (stormMixer4 === undefined) {
                stormMixer4 = new THREE.AnimationMixer(storm4);
                let action = stormMixer4.clipAction(storm4.animations[0]);
                action.play();
            }
            if (stormMixer4) stormMixer4.update(delta + THREE.Math.randFloatSpread(0.002));
        }
        let storm5 = sceneShip.getObjectByName('storm5');
        if (storm5 !== undefined) {
            if (stormMixer5 === undefined) {
                stormMixer5 = new THREE.AnimationMixer(storm5);
                let action = stormMixer5.clipAction(storm5.animations[0]);
                action.play();
            }
            if (stormMixer5) stormMixer5.update(delta + THREE.Math.randFloatSpread(0.002));
        }
        let storm6 = sceneShip.getObjectByName('storm6');
        if (storm6 !== undefined) {
            if (stormMixer6 === undefined) {
                stormMixer6 = new THREE.AnimationMixer(storm6);
                let action = stormMixer6.clipAction(storm6.animations[0]);
                action.play();
            }
            console.log(delta);
            if (stormMixer6) stormMixer6.update(delta + THREE.Math.randFloatSpread(0.002));
        }
        let storm7 = sceneShip.getObjectByName('storm7');
        if (storm7 !== undefined) {
            if (stormMixer7 === undefined) {
                stormMixer7 = new THREE.AnimationMixer(storm7);
                let action = stormMixer7.clipAction(storm7.animations[0]);
                action.play();
            }
            console.log(delta);
            if (stormMixer7) stormMixer7.update(delta + THREE.Math.randFloatSpread(0.002));
        }
        let storm8 = sceneShip.getObjectByName('storm8');
        if (storm8 !== undefined) {
            if (stormMixer8 === undefined) {
                stormMixer8 = new THREE.AnimationMixer(storm8);
                let action = stormMixer8.clipAction(storm8.animations[0]);
                action.play();
            }
            console.log(delta);
            if (stormMixer8) stormMixer8.update(delta + THREE.Math.randFloatSpread(0.002));
        }
        let storm9 = sceneShip.getObjectByName('storm9');
        if (storm9 !== undefined) {
            if (stormMixer9 === undefined) {
                stormMixer9 = new THREE.AnimationMixer(storm9);
                let action = stormMixer9.clipAction(storm9.animations[0]);
                action.play();
            }
            console.log(delta);
            if (stormMixer9) stormMixer9.update(delta + THREE.Math.randFloatSpread(0.002));
        }
    }
}

function spaceControl() {

    // Partie manette
    /**
     * BOUTONS :
     * a : 0
     * b : 1
     * x : 2
     * y : 3
     * select : 8
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

        // Stick gauche haut : avancer
        if (gamepad.axes[1] <= -0.1) {
            camera.translateZ(currentShipMoveSpeed * gamepad.axes[1]);
            if (currentShipMoveFrontRotationEffect > -shipMoveFrontRotationEffect) {
                falconPivot.rotation.x -= shipMoveRotationPresicion;
                falcon.position.y -= 0.5;
                falcon.position.z -= 0.5;
                currentShipMoveFrontRotationEffect--;
            }
        } else {
            if (currentShipMoveFrontRotationEffect < 0) {
                falconPivot.rotation.x += shipMoveRotationPresicion;
                falcon.position.y += 0.5;
                falcon.position.z += 0.5;
                currentShipMoveFrontRotationEffect++;
            }
        }
        // Stick gauche bas : reculer
        if (gamepad.axes[1] >= 0.1) {
            camera.translateZ(currentShipMoveSpeed * gamepad.axes[1]);
            if (currentShipMoveFrontRotationEffect < shipMoveFrontRotationEffect) {
                falconPivot.rotation.x += shipMoveRotationPresicion;
                falcon.position.y += 0.5;
                falcon.position.z += 0.5;
                currentShipMoveFrontRotationEffect++;
            }
        } else {
            if (currentShipMoveFrontRotationEffect > 0) {
                falconPivot.rotation.x -= shipMoveRotationPresicion;
                falcon.position.y -= 0.5;
                falcon.position.z -= 0.5;
                currentShipMoveFrontRotationEffect--;
            }
        }
        // Stick gauche gauche : gauche
        if (gamepad.axes[0] <= -0.1) {
            camera.translateX(-currentShipMoveSpeed * -gamepad.axes[0]);
            if (currentShipMoveSideRotationEffect > -shipMoveSideRotationEffect) {
                falconPivot.rotation.z += shipMoveRotationPresicion;
                currentShipMoveSideRotationEffect--;
            }
        } else {
            if (currentShipMoveSideRotationEffect < 0) {
                falconPivot.rotation.z -= shipMoveRotationPresicion;
                currentShipMoveSideRotationEffect++;
            }
        }
        // Stick gauche gauche : droite
        if (gamepad.axes[0] >= 0.1) {
            camera.translateX(currentShipMoveSpeed * gamepad.axes[0]);
            if (currentShipMoveSideRotationEffect < shipMoveSideRotationEffect) {
                falconPivot.rotation.z -= shipMoveRotationPresicion;
                currentShipMoveSideRotationEffect++;
            }
        } else {
            if (currentShipMoveSideRotationEffect > 0) {
                falconPivot.rotation.z += shipMoveRotationPresicion;
                currentShipMoveSideRotationEffect--;
            }
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
            camera.translateY(-currentShipMoveSpeed * gamepad.buttons[6].value);
        }
        // Appui sur gachette droite : monter
        if (gamepad.buttons[7].value >= 0.1) {
            camera.translateY(currentShipMoveSpeed * gamepad.buttons[7].value);
        }
        // Appui bouton a
        if (gamepad.buttons[0].pressed) {
            onLoad();
            currentShipMoveSpeed = shipBoostSpeed;
        } else {
            currentShipMoveSpeed = shipMoveSpeed;
        }
        // Appui bouton select
        if (gamepad.buttons[8].pressed) {
            onGamePadSelectButton = true;
        } else {
            if (onGamePadSelectButton) {
                onGamePadSelectButton = false;
                params.Switch();
            }
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
            camera.translateZ(-currentShipMoveSpeed);
            if (currentShipMoveFrontRotationEffect < shipMoveFrontRotationEffect) {
                falconPivot.rotation.x -= shipMoveRotationPresicion;
                falcon.position.y -= 0.5;
                falcon.position.z -= 0.5;
                currentShipMoveFrontRotationEffect++;
            }
        } else {
            if (currentShipMoveFrontRotationEffect > 0) {
                falconPivot.rotation.x += shipMoveRotationPresicion;
                falcon.position.y += 0.5;
                falcon.position.z += 0.5;
                currentShipMoveFrontRotationEffect--;
            }
        }
        if (keyboard.pressed("s")) {
            camera.translateZ(currentShipMoveSpeed);
            if (currentShipMoveFrontRotationEffect > -shipMoveFrontRotationEffect) {
                falconPivot.rotation.x += shipMoveRotationPresicion;
                falcon.position.y += 0.5;
                falcon.position.z += 0.5;
                currentShipMoveFrontRotationEffect--;
            }
        } else {
            if (currentShipMoveFrontRotationEffect < 0) {
                falconPivot.rotation.x -= shipMoveRotationPresicion;
                falcon.position.y -= 0.5;
                falcon.position.z -= 0.5;
                currentShipMoveFrontRotationEffect++;
            }
        }
        if (keyboard.pressed("q")) {
            camera.translateX(-currentShipMoveSpeed);
            if (currentShipMoveSideRotationEffect > -shipMoveSideRotationEffect) {
                falconPivot.rotation.z += shipMoveRotationPresicion;
                currentShipMoveSideRotationEffect--;
            }
        } else {
            if (currentShipMoveSideRotationEffect < 0) {
                falconPivot.rotation.z -= shipMoveRotationPresicion;
                currentShipMoveSideRotationEffect++;
            }
        }
        if (keyboard.pressed("d")) {
            camera.translateX(currentShipMoveSpeed);
            if (currentShipMoveSideRotationEffect < shipMoveSideRotationEffect) {
                falconPivot.rotation.z -= shipMoveRotationPresicion;
                currentShipMoveSideRotationEffect++;
            }
        } else {
            if (currentShipMoveSideRotationEffect > 0) {
                falconPivot.rotation.z += shipMoveRotationPresicion;
                currentShipMoveSideRotationEffect--;
            }
        }
        if (keyboard.pressed("space")) {
            camera.translateY(currentShipMoveSpeed);
        }
        if (keyboard.pressed("ctrl")) {
            camera.translateY(-currentShipMoveSpeed);
        }
        if (keyboard.pressed("a")) {
            camera.rotateOnAxis(vectorZ, shipRotationSpeed * 0.5);
        }
        if (keyboard.pressed("e")) {
            camera.rotateOnAxis(vectorZ, -shipRotationSpeed * 0.5);
        }

        if (keyboard.pressed("shift")) {
            currentShipMoveSpeed = shipBoostSpeed;
        } else {
            currentShipMoveSpeed = shipMoveSpeed;
        }
    }
}

function shipControl() {

    // Partie manette
    /**
     * BOUTONS :
     * a : 0
     * b : 1
     * x : 2
     * y : 3
     * select : 8
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

        // Stick gauche haut : avancer
        if (gamepad.axes[1] <= -0.1) {
            camera.translateZ(characterMoveSpeed * gamepad.axes[1]);
        }
        // Stick gauche bas : reculer
        if (gamepad.axes[1] >= 0.1) {
            camera.translateZ(characterMoveSpeed * gamepad.axes[1]);
        }
        // Stick gauche gauche : gauche
        if (gamepad.axes[0] <= -0.1) {
            camera.translateX(-characterMoveSpeed * -gamepad.axes[0]);
        }
        // Stick gauche gauche : droite
        if (gamepad.axes[0] >= 0.1) {
            camera.translateX(characterMoveSpeed * gamepad.axes[0]);
        }
        // Stick droit haut : roulade avant
        if (gamepad.axes[3] <= -0.1) {
            if (camera.rotation.x < Math.radians(40)) {
                camera.rotateOnAxis(vectorX, characterRotationSpeed * -gamepad.axes[3]);
            }
        }
        // Stick droit haut : roulade arrière
        if (gamepad.axes[3] >= 0.1) {
            if (camera.rotation.x > Math.radians(-40)) {
                camera.rotateOnAxis(vectorX, -characterRotationSpeed * gamepad.axes[3]);
            }
        }
        // Stick droit gauche : tourner à gauche
        if (gamepad.axes[2] <= -0.1) {
            camera.rotateOnAxis(vectorY, characterRotationSpeed * -gamepad.axes[2]);
        }
        // Stick droit gauche : tourner à droite
        if (gamepad.axes[2] >= 0.1) {
            camera.rotateOnAxis(vectorY, -characterRotationSpeed * gamepad.axes[2]);
        }
        // Appui sur gachette haut gauche : tonneau à gauche
        if (gamepad.buttons[4].pressed) {
            camera.rotateOnAxis(vectorZ, characterRotationSpeed * 0.5);
        }
        // Appui sur gachette haut droite : tonneau à droite
        if (gamepad.buttons[5].pressed) {
            camera.rotateOnAxis(vectorZ, -characterRotationSpeed * 0.5);
        }
        // Appui bouton select
        if (gamepad.buttons[8].pressed) {
            onGamePadSelectButton = true;
        } else {
            if (onGamePadSelectButton) {
                onGamePadSelectButton = false;
                params.Switch();
            }
        }
        if (gamepad.buttons[0].pressed) {
            onLoad();
        }
    } else { // Partie clavier
        if (keyboard.pressed("up")) {
            if (camera.rotation.x < Math.radians(40)) {
                camera.rotateOnAxis(vectorX, characterRotationSpeed);
            }
        }
        if (keyboard.pressed("down")) {
            if (camera.rotation.x > Math.radians(-40)) {
                camera.rotateOnAxis(vectorX, -characterRotationSpeed);
            }
        }
        if (keyboard.pressed("left")) {
            camera.rotateOnAxis(vectorY, characterRotationSpeed);
        }
        if (keyboard.pressed("right")) {
            camera.rotateOnAxis(vectorY, -characterRotationSpeed);
        }
        if (keyboard.pressed("z")) {
            camera.translateZ(-characterMoveSpeed);
        }
        if (keyboard.pressed("s")) {
            camera.translateZ(characterMoveSpeed);
        }
        if (keyboard.pressed("q")) {
            camera.translateX(-characterMoveSpeed);
        }
        if (keyboard.pressed("d")) {
            camera.translateX(characterMoveSpeed);
        }
        if (keyboard.pressed("a")) {
            camera.rotateOnAxis(vectorZ, characterRotationSpeed * 0.5);
        }
        if (keyboard.pressed("e")) {
            camera.rotateOnAxis(vectorZ, -characterRotationSpeed * 0.5);
        }

    }
    camera.position.y = 10;
    camera.rotation.z = 0;
    
    // Collisions
    if (camera.position.x >= corridorWidth)
        camera.position.x = corridorWidth;
    if (camera.position.x <= -corridorWidth)
        camera.position.x = -corridorWidth;

    if (camera.position.z >= corridorLength)
        camera.position.z = corridorLength;
    if (camera.position.z <= -corridorLength)
        camera.position.z = -corridorLength;
}

function planetUpdate() {
    planets.rotation.y += systemRotationSpeed;

    for (let i = 0; i < planetList.length; i++) {
        planets.getObjectByName(planetList[i]).rotation.y += planetRotationSpeed;
    }
}

function music() {
    let spaceAudioLoader = new THREE.AudioLoader();
    spaceAudioLoader.load('./content/audio/SpaceAmbient.ogg', function (buffer) {
        spaceSound.setBuffer(buffer); // Définition de la source du buffer
        spaceSound.setLoop(true);
        spaceSound.setVolume(musicVolume);
        spaceSound.play();
    });
    let SWAudioLoader = new THREE.AudioLoader();
    SWAudioLoader.load('./content/audio/starwars.ogg', function (buffer) {
        sWSound.setBuffer(buffer); // Définition de la source du buffer
        sWSound.setRefDistance(150);
        sWSound.setMaxDistance(200);
        sWSound.setLoop(true);
        sWSound.setVolume(2);
    });
    sceneSpace.getObjectByName("earth").add(sWSound);

    let shipAudioLoader = new THREE.AudioLoader();
    shipAudioLoader.load('./content/audio/cantina.ogg', function (buffer) {
        shipSound.setBuffer(buffer);
        shipSound.setRefDistance(200);
        shipSound.setMaxDistance(300);
        shipSound.setLoop(true);
        shipSound.setVolume(shipVolume);
    });
    sceneShip.add(shipSound);
    shipSound.position.set(0, 100, 0);
}

function startGUI() {

    params = {
        Switch: function () {
            switch (dimension) {
                case "space":
                    scene = sceneSpace;
                    camera = cameraSpace;
                    planets = scene.getObjectByName("planets");
                    shipSound.pause();
                    spaceSound.play();
                    sWSound.play();
                    dimension = "ship";
                    break;
                case "ship":
                    camera = cameraShip;
                    scene = sceneShip;
                    dimension = "space";
                    spaceSound.stop();
                    sWSound.stop();
                    break;
                default:
                    break;
            }
        },
        PlanetRotationSpeed: planetRotationSpeed,
        SystemRotationSpeed: systemRotationSpeed,
        MusicVolume: musicVolume,
        ShipMusicVolume: shipVolume,
        PlayPauseSpaceMusic: function () {
            if (spaceSound.isPlaying) {
                spaceSound.pause();
            } else {
                spaceSound.play();
            }
        },
        RestartSpaceMusic: function () {
            spaceSound.stop();
            spaceSound.play();
        },
        PlayPauseShipMusic: function () {
            if (shipSound.isPlaying) {
                shipSound.pause();
            } else {
                shipSound.play();
            }
        },
        RestartShipMusic: function () {
            shipSound.stop();
            shipSound.play();
        },
        ShipMoveSpeed: shipMoveSpeed,
        ShipBoostSpeed: shipBoostSpeed,
        ShipRotationSpeed: shipRotationSpeed,
        CharacterMoveSpeed: characterMoveSpeed,
        CharacterRotationSpeed: characterRotationSpeed
    };

    let gui = new GUI();
    gui.width = 310;
    let spaceFolder = gui.addFolder('Space settings');
    let shipControlsFolder = gui.addFolder('SpaceShip controls settings');
    let spaceSoundFolder;
    let shipFolder = gui.addFolder('Ship settings');
    let characterControlsFolder = shipFolder.addFolder('Character controls settings');
    let shipSoundFolder = shipFolder.addFolder('Music');

    gui.add(params, 'Switch').name('Switch scene');

    spaceFolder.add(params, 'PlanetRotationSpeed').name('Planet rotation speed').min(0).max(0.1).step(0.001).onChange(function () {
        planetRotationSpeed = params.PlanetRotationSpeed;
    });
    spaceFolder.add(params, 'SystemRotationSpeed').name('System rotation speed').min(0).max(0.01).step(0.0001).onChange(function () {
        systemRotationSpeed = params.SystemRotationSpeed;
    });

    spaceSoundFolder = spaceFolder.addFolder('Sound spaceControl');
    spaceSoundFolder.add(params, 'MusicVolume').name('Music volume').min(0).max(2).step(0.1).onChange(function () {
        musicVolume = params.MusicVolume;
        spaceSound.setVolume(musicVolume);
    });
    spaceSoundFolder.add(params, 'PlayPauseSpaceMusic').name('Play/Pause music');
    spaceSoundFolder.add(params, 'RestartSpaceMusic').name('Restart music');

    shipControlsFolder.add(params, 'ShipMoveSpeed').name('Ship move speed').min(1).max(10).step(0.5).onChange(function () {
        shipMoveSpeed = params.ShipMoveSpeed;
    });
    shipControlsFolder.add(params, 'ShipBoostSpeed').name('Ship boost speed').min(2).max(20).step(0.5).onChange(function () {
        shipBoostSpeed = params.ShipBoostSpeed;
    });
    shipControlsFolder.add(params, 'ShipRotationSpeed').name('Ship rotation speed').min(0.001).max(0.05).step(0.001).onChange(function () {
        shipRotationSpeed = params.ShipRotationSpeed;
    });

    characterControlsFolder.add(params, 'CharacterMoveSpeed').name('Character move speed').min(1).max(10).step(0.1).onChange(function () {
        characterMoveSpeed = params.CharacterMoveSpeed;
    });
    characterControlsFolder.add(params, 'CharacterRotationSpeed').name('Character rotation speed').min(0.001).max(0.05).step(0.001).onChange(function () {
        characterRotationSpeed = params.CharacterRotationSpeed;
    });

    shipSoundFolder.add(params, 'ShipMusicVolume').name('Ship volume').min(0).max(2).step(0.1).onChange(function () {
        shipVolume = params.ShipMusicVolume;
        shipSound.setVolume(shipVolume);
    });
    shipSoundFolder.add(params, 'PlayPauseShipMusic').name('Play/Pause music');
    shipSoundFolder.add(params, 'RestartShipMusic').name('Restart music');
}
