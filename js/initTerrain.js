import * as THREE from "./libs/three.module.js";

const loader = new THREE.TextureLoader();

// Sizes
const planetSizes = {
    sun: 300,
    earth: 90,
    mercury: 30,
    venus: 100,
    mars: 60,
    jupiter: 200,
    saturne: 150,
    uranus: 110,
    neptune: 110,
};

// Textures
const earthTexture = loader.load("./content/textures/earth_atmos_4096.jpg");
const sunTexture = loader.load("./content/textures/sun.jpg");
const mercuryTexture = loader.load("./content/textures/mercury.jpg");
const venusTexture = loader.load("./content/textures/venus.jpg");
const marsTexture = loader.load("./content/textures/mars.jpg");
const jupiterTexture = loader.load("./content/textures/jupiter.jpg");
const saturneTexture = loader.load("./content/textures/saturn.jpg");
const saturneRingTexture = loader.load("./content/textures/saturn_ring.png");
const uranusTexture = loader.load("./content/textures/uranus.jpg");
const neptuneTexture = loader.load("./content/textures/neptune.jpg");

// Materials
let earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
});
let mercuryMaterial = new THREE.MeshPhongMaterial({
    map: mercuryTexture,
});
let venusMaterial = new THREE.MeshPhongMaterial({
    map: venusTexture,
});
let marsMaterial = new THREE.MeshPhongMaterial({
    map: marsTexture,
});
let jupiterMaterial = new THREE.MeshPhongMaterial({
    map: jupiterTexture,
});
let saturneMaterial = new THREE.MeshPhongMaterial({
    map: saturneTexture,
});
let saturneRingMaterial = new THREE.MeshPhongMaterial({
    map: saturneRingTexture,
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true
});
let uranusMaterial = new THREE.MeshPhongMaterial({
    map: uranusTexture,
});
let neptuneMaterial = new THREE.MeshPhongMaterial({
    map: neptuneTexture,
});
let sunMaterial = new THREE.MeshPhongMaterial({
    map: sunTexture,
    shininess: 50, // le brillant
    emissive: 0xFFF400,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide
});

let geometry;
let meshPlanet;

export function initSpace(radius) {
    let scene = new THREE.Scene();

    let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, radius * 2);
    camera.position.z = 600;
    camera.position.y = 0;
    camera.position.x = 0;

    /**
     * Planets
     */
    let planets = new THREE.Group();
    planets.position.set(0, 0, 0);
    planets.name = "planets";

    //Create
    let meshMercury = mercury();
    let meshVenus = venus();
    let meshEarth = earth();
    let meshMars = mars();
    let meshJupiter = jupiter();
    let meshSaturne = saturne();
    let meshUranus = uranus();
    let meshNeptune = neptune();
    let meshSun = sun();

    //Position
    meshMercury.position.x = Math.cos(Math.radians(180)) * (1000 + planetSizes.mercury / 2);
    meshMercury.position.z = Math.sin(Math.radians(180)) * (1000 + planetSizes.mercury / 2);

    meshVenus.position.x = Math.cos(Math.radians(30)) * (2000 + planetSizes.venus / 2);
    meshVenus.position.z = Math.sin(Math.radians(30)) * (2000 + planetSizes.venus / 2);

    meshEarth.position.x = Math.cos(Math.radians(225)) * (3000 + planetSizes.earth / 2);
    meshEarth.position.z = Math.sin(Math.radians(225)) * (3000 + planetSizes.earth / 2);

    meshMars.position.x = Math.cos(Math.radians(150)) * (4000 + planetSizes.mars / 2);
    meshMars.position.z = Math.sin(Math.radians(150)) * (4000 + planetSizes.mars / 2);

    meshJupiter.position.x = Math.cos(Math.radians(300)) * (5000 + planetSizes.jupiter / 2);
    meshJupiter.position.z = Math.sin(Math.radians(300)) * (5000 + planetSizes.jupiter / 2);

    meshSaturne.position.x = Math.cos(Math.radians(90)) * (6000 + planetSizes.saturne / 2);
    meshSaturne.position.z = Math.sin(Math.radians(90)) * (6000 + planetSizes.saturne / 2);

    meshUranus.position.x = Math.cos(Math.radians(120)) * (7000 + planetSizes.uranus / 2);
    meshUranus.position.z = Math.sin(Math.radians(120)) * (7000 + planetSizes.uranus / 2);

    meshNeptune.position.x = Math.cos(Math.radians(270)) * (8000 + planetSizes.neptune / 2);
    meshNeptune.position.z = Math.sin(Math.radians(270)) * (8000 + planetSizes.neptune / 2);


    planets.add(meshMercury);
    planets.add(meshVenus);
    planets.add(meshEarth);
    planets.add(meshMars);
    planets.add(meshMars);
    planets.add(meshJupiter);
    planets.add(meshSaturne);
    planets.add(meshUranus);
    planets.add(meshNeptune);
    planets.add(meshSun);
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
    let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
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

function sun() {
    geometry = new THREE.SphereBufferGeometry(planetSizes.sun, 32, 32);
    meshPlanet = new THREE.Mesh(geometry, sunMaterial);
    meshPlanet.name = "sun";
    meshPlanet.position.set(0, 0, 0);
    return meshPlanet;
}

function earth() {
    generatePlanet(planetSizes.earth, earthMaterial);
    meshPlanet.name = "earth";
    meshPlanet.rotateZ(Math.radians(5));
    return meshPlanet;
}

function mercury() {
    generatePlanet(planetSizes.mercury, mercuryMaterial);
    meshPlanet.name = "mercury";
    return meshPlanet;
}

function venus() {
    generatePlanet(planetSizes.venus, venusMaterial);
    meshPlanet.name = "venus";
    return meshPlanet;
}

function mars() {
    generatePlanet(planetSizes.mars, marsMaterial);
    meshPlanet.name = "mars";
    return meshPlanet;
}

function jupiter() {
    generatePlanet(planetSizes.jupiter, jupiterMaterial);
    meshPlanet.name = "jupiter";
    return meshPlanet;
}


function saturne() {
    let group = new THREE.Group();
    generatePlanet(planetSizes.saturne, saturneMaterial);

    let ringGeometry = new THREE.RingBufferGeometry(planetSizes.saturne + 30, planetSizes.saturne + 100, 64);
    let pos = ringGeometry.attributes.position;
    let v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        geometry.attributes.uv.setXY(i, v3.length() < 4 ? 0 : 1, 1);
    }

    let ringMesh = new THREE.Mesh(ringGeometry, saturneRingMaterial);
    ringMesh.rotation.x = Math.radians(75);
    ringMesh.position.set(0, 0, 0);

    group.add(meshPlanet);
    group.add(ringMesh);
    group.name = "saturne";
    return group;
}

function uranus() {
    generatePlanet(planetSizes.uranus, uranusMaterial);
    meshPlanet.name = "uranus";
    return meshPlanet;
}

function neptune() {
    generatePlanet(planetSizes.neptune, neptuneMaterial);
    meshPlanet.name = "neptune";
    return meshPlanet;
}

function generatePlanet(size, material) {
    geometry = new THREE.SphereBufferGeometry(size, 32, 32);
    meshPlanet = new THREE.Mesh(geometry, material);
    meshPlanet.position.set(0, 0, 0);
    meshPlanet.receiveShadow = true;
    meshPlanet.castShadow = true;
}
