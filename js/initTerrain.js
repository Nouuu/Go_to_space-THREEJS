import * as THREE from "./libs/three.module.js";

const loader = new THREE.TextureLoader();

// Textures
const earthTexture = loader.load("./content/textures/earth_atmos_4096.jpg");
const sunTexture = loader.load("./content/textures/sun.jpg");

// Materials
let earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 30, // le brillant
});

let sunMaterial = new THREE.MeshPhongMaterial({
    map: sunTexture,
    shininess: 50,
    emissive: 0xFFF400,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide
});

let geometry;
let meshPlanet;

export function initSpace(radius) {
    let scene = new THREE.Scene();

    let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, radius);
    camera.position.z = 300;
    camera.position.y = 0;
    camera.position.x = 0;

    /**
     * Planets
     */
    let planets = new THREE.Group();
    planets.position.set(0, 0, 0);
    planets.name = "planets";

    let meshEarth = earth();
    let meshSun = sun();

    meshEarth.position.x = -1000;

    planets.add(meshSun);
    planets.add(meshEarth);
    scene.add(planets);

    /**
     * light
     */

    let pointLight = new THREE.PointLight(0xffffff, 2, radius * 2);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    pointLight.shadow.camera.near = 1;
    pointLight.shadow.camera.far = radius;
    scene.add(pointLight);


    let ambientLight = new THREE.AmbientLight(0xf2f2f2, 0.8);
    scene.add(ambientLight);

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
        return THREE.Math.randFloatSpread(2) * (radius);
    };
    let star = new THREE.Vector3();
    let star2 = new THREE.Vector3();

    for (let i = 0; i < radius; i++) {
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

function earth() {
    geometry = new THREE.SphereBufferGeometry(30, 32, 32);
    meshPlanet = new THREE.Mesh(geometry, earthMaterial);
    meshPlanet.position.set(0, 0, 0);
    meshPlanet.receiveShadow = true;
    meshPlanet.castShadow = true;
    meshPlanet.name = "earth";
    meshPlanet.rotateZ(Math.radians(5));
    return meshPlanet;
}

function sun() {
    geometry = new THREE.SphereBufferGeometry(90, 32, 32);
    meshPlanet = new THREE.Mesh(geometry, sunMaterial);
    // meshPlanet.receiveShadow = true;
    // meshPlanet.castShadow = true;
    meshPlanet.name = "sun";
    meshPlanet.position.set(0, 0, 0);

    return meshPlanet;
}
