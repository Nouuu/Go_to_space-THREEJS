import * as THREE from './libs/three.module.js';
import {GUI} from './libs/dat.gui.module.js';

Math.radians = (degrees) => degrees * Math.PI / 180;
let camera, scene, renderer;
let terrain;

/**
 * Textures matériel
 */

const blackMat = new THREE.MeshStandardMaterial({color: 0x000000});
const whiteMat = new THREE.MeshStandardMaterial({color: 0xffffff});
const greenMat = new THREE.MeshStandardMaterial({color: 0x38FF00});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
init();
animate();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.z = 0;
    camera.position.y = 30;
    camera.rotation.x -= Math.radians(90);




    /**
     * Ajout du terrain
     */
    let geometry;
    geometry = new THREE.PlaneBufferGeometry(30, 30, 32, 32);
    terrain = new THREE.Mesh(geometry, whiteMat);
    terrain.receiveShadow = true;
    terrain.rotateX(Math.radians(-90));

    scene.add(terrain);




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
}

function render() {
    renderer.render(scene, camera);
}