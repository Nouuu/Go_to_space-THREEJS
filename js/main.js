import * as THREE from './libs/three.module.js';
import {GUI} from './libs/dat.gui.module.js';
import Stats from './libs/stats.module.js';

import * as initTerrain from './initTerrain.js';

Math.radians = (degrees) => degrees * Math.PI / 180;
let camera, scene, sceneSpace, sceneShip, renderer, stats;
let terrain;

/**
 * Textures matériel
 */
const loader = new THREE.TextureLoader();

const bgSpaceTexture = loader.load("./content/textures/spacebg.PNG");
bgSpaceTexture.wrapS = THREE.RepeatWrapping;
bgSpaceTexture.wrapT = THREE.RepeatWrapping;
bgSpaceTexture.repeat.set(2, 2);

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
                dimension = "ship";
                break;
            case "ship":
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

    [sceneSpace, camera] = initTerrain.initSpace(bgSpaceTexture);
    [sceneShip, camera] = initTerrain.initShip(whiteMat);

    scene = sceneSpace;
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
}

function render() {
    stats.update();
    renderer.render(scene, camera);
}