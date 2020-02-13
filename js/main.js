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
let spaceSound = new THREE.Audio(spaceListener);
let SWSound = new THREE.PositionalAudio(spaceListener);
let camera, scene, params, cameraSpace, cameraShip, sceneSpace, sceneShip, renderer, stats, planets, falconPivot,
    falcon, objects;
let gamepad = false;
let onGamePadSelectButton = false;
let spaceRadius = 18000;
let keyboard = new THREEx.KeyboardState(); // import de la librairie qui écoute le clavier
let shipMoveSpeed = 10;
let shipBoostSpeed = 15;
let currentShipMoveSpeed = shipMoveSpeed;
let shipRotationSpeed = 0.02;
let characterMoveSpeed = 1;
let characterRotationSpeed = 0.02;
let shipMoveFrontRotationEffect = 10;
let shipMoveSideRotationEffect = 10;
let currentShipMoveFrontRotationEffect = 0;
let currentShipMoveSideRotationEffect = 0;
let shipMoveRotationPresicion = 0.02;
let musicVolume = 1;
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

/**
 * Collision
 */
let raycaster;
//let objects = [];

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
    [sceneShip, cameraShip, objects] = initTerrain.initShip();
    // Par défaut, positionnement sur la scène du vaisseau
    scene = sceneShip;
    camera = cameraShip;

    cameraSpace.add(spaceListener);

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
     * Raycaster pour la collision
     */
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );


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
        //raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;
        let intersections = raycaster.intersectObjects( objects );
        let onObject = intersections.length > 0;
        if ( onObject === true ) {
          console.log("hit");
        }
    }
}

function render() {
    stats.update();
    renderer.render(scene, camera);
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
            camera.rotateOnAxis(vectorX, characterRotationSpeed * -gamepad.axes[3]);
        }
        // Stick droit haut : roulade arrière
        if (gamepad.axes[3] >= 0.1) {
            camera.rotateOnAxis(vectorX, -characterRotationSpeed * gamepad.axes[3]);
        }
        // Stick droit gauche : tourner à gauche
        if (gamepad.axes[2] <= -0.1) {
            camera.rotateOnAxis(vectorY, characterRotationSpeed * -gamepad.axes[2]);
        }
        // Stick droit gauche : tourner à droite
        if (gamepad.axes[2] >= 0.1) {
            camera.rotateOnAxis(vectorY, -characterRotationSpeed * gamepad.axes[2]);
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
            if (camera.rotation.x < Math.radians(20)) {
                camera.rotateOnAxis(vectorX, characterRotationSpeed);
            }
            console.log(camera.rotation);
        }
        if (keyboard.pressed("down")) {
            if (camera.rotation.x > Math.radians(-20)) {
                camera.rotateOnAxis(vectorX, -characterRotationSpeed);
            }
            console.log(camera.rotation);
        }
        if (keyboard.pressed("left")) {
            camera.rotateOnAxis(vectorY, characterRotationSpeed);
            console.log(camera.rotation);
        }
        if (keyboard.pressed("right")) {
            camera.rotateOnAxis(vectorY, -characterRotationSpeed);
            console.log(camera.rotation);
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
    }
    camera.position.y = 10;
    camera.rotation.z = 0;
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
    });
    let SWAudioLoader = new THREE.AudioLoader();
    SWAudioLoader.load('./content/audio/starwars.ogg', function (buffer) {
        SWSound.setBuffer(buffer); // Définition de la source du buffer
        SWSound.setRefDistance(150);
        SWSound.setMaxDistance(200);
        SWSound.setLoop(true);
        SWSound.setVolume(2);
    });
    sceneSpace.getChildByName("earth").add(SWSound);
}

function startGUI() {

    params = {
        Switch: function () {
            switch (dimension) {
                case "space":
                    scene = sceneSpace;
                    camera = cameraSpace;
                    planets = scene.getObjectByName("planets");
                    spaceSound.play();
                    SWSound.play();
                    dimension = "ship";
                    break;
                case "ship":
                    camera = cameraShip;
                    scene = sceneShip;
                    dimension = "space";
                    spaceSound.stop();
                    SWSound.stop();
                    break;
                default:
                    break;
            }
        },
        PlanetRotationSpeed: planetRotationSpeed,
        SystemRotationSpeed: systemRotationSpeed,
        MusicVolume: musicVolume,
        PlayPauseMusic: function () {
            if (spaceSound.isPlaying) {
                spaceSound.pause();
            } else {
                spaceSound.play();
            }
        },
        RestartMusic: function () {
            spaceSound.stop();
            spaceSound.play();
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
    let characterControlsFolder = gui.addFolder('Character controls settings');
    let spaceSoundFolder;

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
    spaceSoundFolder.add(params, 'PlayPauseMusic').name('Play/Pause music');
    spaceSoundFolder.add(params, 'RestartMusic').name('Restart music');

    shipControlsFolder.add(params, 'ShipMoveSpeed').name('Ship move speed').min(1).max(10).step(0.5).onChange(function () {
        shipMoveSpeed = params.ShipMoveSpeed;
    });
    shipControlsFolder.add(params, 'ShipBoostSpeed').name('Ship boost speed').min(2).max(20).step(0.5).onChange(function () {
        shipBoostSpeed = params.ShipBoostSpeed;
    });
    shipControlsFolder.add(params, 'ShipRotationSpeed').name('Ship rotation speed').min(0.001).max(0.05).step(0.001).onChange(function () {
        shipRotationSpeed = params.ShipRotationSpeed;
    });

    characterControlsFolder.add(params, 'CharacterMoveSpeed').name('Character move speed').min(0.5).max(3).step(0.1).onChange(function () {
        characterMoveSpeed = params.CharacterMoveSpeed;
    });
    characterControlsFolder.add(params, 'CharacterRotationSpeed').name('Character rotation speed').min(0.001).max(0.05).step(0.001).onChange(function () {
        characterRotationSpeed = params.CharacterRotationSpeed;
    });
}
