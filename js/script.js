import * as THREE from './three.module.js';
import {GUI} from './dat.gui.module.js';

Math.radians = (degrees) => degrees * Math.PI / 180;
let camera, scene, renderer;
let terrain, mesh, array, newArray;
let group = new THREE.Group();
let arrayGroup = new THREE.Group();
let arrayGroupNew = new THREE.Group();
let frequence = 0;
let frequenceMax = 24;
let resume = true;
let light1, light2, light3;

/**
 * Textures matériel
 */

const blackMat = new THREE.MeshStandardMaterial({color: 0x000000});
const whiteMat = new THREE.MeshStandardMaterial({color: 0xffffff});
const greenMat = new THREE.MeshStandardMaterial({color: 0x38FF00});

/**
 * Dimensions
 */
const terrainDim = {
    Width: 50,
    Height: 25
};

/**
 * GUI
 */

var params = {
    Height: 25,
    Width: 50,
    Camera: 30,
    Pause: function () {
        pause();
    },
    Restart: function () {
        initArray();
    },
    Speed: 5
};
var gui = new GUI();
var folderDim = gui.addFolder('Dimensions');
var folderSet = gui.addFolder('Settings');
folderDim.open();
folderSet.open();

folderDim.add(params, 'Width').min(5).max(100).step(1).onFinishChange(function () {
    terrainDim.Width = params.Width;
    initArray();
    scene.remove(terrain);
    let geometry = new THREE.PlaneGeometry(terrainDim.Width, terrainDim.Height);
    terrain = new THREE.Mesh(geometry, whiteMat);
    terrain.rotateX(Math.radians(-90));
    terrain.receiveShadow = true;
    scene.add(terrain);
    resume = true;
});

folderDim.add(params, 'Height').min(5).max(50).step(1).onFinishChange(function () {
    terrainDim.Height = params.Height;
    initArray();
    scene.remove(terrain);
    let geometry = new THREE.PlaneGeometry(terrainDim.Width, terrainDim.Height);
    terrain = new THREE.Mesh(geometry, whiteMat);
    terrain.rotateX(Math.radians(-90));
    terrain.receiveShadow = true;
    scene.add(terrain);
    resume = true;
});

gui.add(params, 'Camera').min(1).max(58).step(0.1).onChange(function () {
    camera.position.y = 60 - params.Camera;
});
folderSet.add(params, 'Pause').name('Pause / Resume');
folderSet.add(params, 'Restart').name('Start new game').onChange(function () {
    resume = true;
});
folderSet.add(params, 'Speed').min(1).max(60).step(1).onChange(function () {
    frequenceMax = Math.round(120 / params.Speed);
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.z = 0;
    camera.position.y = 30;
    camera.rotation.x -= Math.radians(90);
    var geometry;

    // createPanel();

    /**
     * Ajout du terrain
     */
    geometry = new THREE.PlaneBufferGeometry(terrainDim.Width, terrainDim.Height, 32, 32);
    terrain = new THREE.Mesh(geometry, whiteMat);
    terrain.receiveShadow = true;
    terrain.rotateX(Math.radians(-90));
    scene.add(terrain);

    /**
     * Array generation
     */
    initArray();

    /**
     * Light
     */

    light();

    /**
     * Affichage
     */
    showArray();

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
    if (resume && ++frequence % frequenceMax === 0) {
        frequence = 0;
        isAlive();
        showArray();
    }

    let time = Date.now() * 0.0005;

    light1.position.x = Math.sin(time * 0.7) * terrainDim.Width / 2;
    light1.position.z = Math.cos(time * 0.3) * terrainDim.Height / 2;

    light2.position.x = Math.sin(time * 0.3) * terrainDim.Width / 2;
    light2.position.z = Math.cos(time * 0.5) * terrainDim.Height / 2;

    light3.position.x = Math.sin(time * 0.9) * terrainDim.Width / 2;
    light3.position.z = Math.cos(time * 0.2) * terrainDim.Height / 2;

    renderer.render(scene, camera);
}

function showArray() {
    arrayGroupNew = new THREE.Group();
    let geometry = new THREE.BoxBufferGeometry(0.8, 1, 0.8);
    let cube = new THREE.Mesh(geometry, greenMat);
    cube.receiveShadow = true;
    cube.castShadow = true;


    for (let i = 0; i < terrainDim.Height; i++) {
        for (let j = 0; j < terrainDim.Width; j++) {
            if (array[i][j] === 1) {
                cube.position.set(j - terrainDim.Width / 2 + .5 ,
                    .5,
                    i - terrainDim.Height / 2 + .5);
                arrayGroupNew.add(cube.clone());
            }
        }
    }
    scene.remove(arrayGroup);
    arrayGroup = arrayGroupNew;
    scene.add(arrayGroup);
}

function initArray() {
    array = [];
    newArray = [];
    for (let i = 0; i < terrainDim.Height; i++) {
        array[i] = [];
        newArray[i] = [];
        for (let j = 0; j < terrainDim.Width; j++) {
            array[i][j] = Math.floor(Math.random() * 11) % 11;
            newArray[i][j] = 0;
        }
    }
}

function isAlive() {
    for (let i = 0; i < terrainDim.Height; i++) {
        for (let j = 0; j < terrainDim.Width; j++) {
            let alive = 0;
            const neighbours = [
                {
                    x: j - 1, y: i - 1,
                },
                {
                    x: j, y: i - 1,
                },
                {
                    x: j + 1, y: i - 1,
                },
                {
                    x: j + 1, y: i,
                },
                {
                    x: j + 1, y: i + 1,
                },
                {
                    x: j, y: i + 1,
                },
                {
                    x: j - 1, y: i + 1,
                },
                {
                    x: j - 1, y: i,
                },
            ];
            neighbours.forEach(neighbour => {
                if (neighbour.y >= 0 && neighbour.x >= 0 && neighbour.y < terrainDim.Height && neighbour.x < terrainDim.Width) {
                    if (array[neighbour.y][neighbour.x] === 1) {
                        alive++;
                    }
                }
            });
            if ((array[i][j] === 1 && alive === 2) || alive === 3) {
                newArray[i][j] = 1;
            } else {
                newArray[i][j] = 0;
            }
        }
    }
    array = newArray;
}

function pause() {
    resume = !resume;
}

function light() {
    var sphere = new THREE.SphereBufferGeometry(0.25, 16, 8);

    light1 = new THREE.PointLight(0xFFBF00, 1);
    light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xFFBF00})));
    light1.position.set(0, 10, 0);
    light1.castShadow = true;

    light2 = new THREE.PointLight(0x38FF00, 1);
    light2.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0x38FF00})));
    light2.position.set(0, 10, 0);
    light2.castShadow = true;

    light3 = new THREE.PointLight(0xFF0AC5, 1);
    light3.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xFF0AC5})));
    light3.position.set(0, 10, 0);
    light3.castShadow = true;

    scene.add(light1);
    scene.add(light2);
    scene.add(light3);
}
