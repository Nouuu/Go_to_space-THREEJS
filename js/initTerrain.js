import * as THREE from "./libs/three.module.js";
import {FBXLoader} from './libs/FBXLoader.js';
import {ColladaLoader} from './libs/ColladaLoader.js';

const loader = new THREE.TextureLoader();

// Sizes
const planetSizes = {
    sun: 600,
    earth: 180,
    mercury: 60,
    venus: 200,
    mars: 120,
    jupiter: 400,
    saturne: 300,
    uranus: 220,
    neptune: 220,
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
    side: THREE.DoubleSide, // Application de la texture sur les deux côtés de l'anneau
    transparent: true       // active la transparence du png
});
let uranusMaterial = new THREE.MeshPhongMaterial({
    map: uranusTexture,
});
let neptuneMaterial = new THREE.MeshPhongMaterial({
    map: neptuneTexture,
});
let sunMaterial = new THREE.MeshPhongMaterial({
    map: sunTexture,
    shininess: 50,          // Brillance
    emissive: 0xFFF400,     // Couleur émise par l'objet
    emissiveIntensity: 0.3, // Intensité de la couleur émise
    side: THREE.DoubleSide  // Applique la texture des deux côtés et garantit que la lumière passe à travers
});

let geometry;
let meshPlanet;

//audio
let SWSound;
let SWAudioLoader;

export function initSpace(radius) { // radius = rayon du système solaire
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, radius * 2);
    camera.position.z = 1200;
    camera.position.y = 0;
    camera.position.x = 0;
    //camera.lookAt(new THREE.Vector3(600,0,0));

    /**
     * Planets
     */
        // Création du groupe qui contient toutes les planètes
    let planets = new THREE.Group();
    planets.position.set(0, 0, 0); // Positionné au centre du plan
    planets.name = "planets";

    // Génération des mesh grâce à des fonctions
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
    meshMercury.position.x = Math.cos(Math.radians(180)) * (2000 + planetSizes.mercury / 2);
    meshMercury.position.z = Math.sin(Math.radians(180)) * (2000 + planetSizes.mercury / 2);

    meshVenus.position.x = Math.cos(Math.radians(30)) * (4000 + planetSizes.venus / 2);
    meshVenus.position.z = Math.sin(Math.radians(30)) * (4000 + planetSizes.venus / 2);

    meshEarth.position.x = Math.cos(Math.radians(225)) * (6000 + planetSizes.earth / 2);
    meshEarth.position.z = Math.sin(Math.radians(225)) * (6000 + planetSizes.earth / 2);

    meshMars.position.x = Math.cos(Math.radians(150)) * (8000 + planetSizes.mars / 2);
    meshMars.position.z = Math.sin(Math.radians(150)) * (8000 + planetSizes.mars / 2);

    meshJupiter.position.x = Math.cos(Math.radians(300)) * (10000 + planetSizes.jupiter / 2);
    meshJupiter.position.z = Math.sin(Math.radians(300)) * (10000 + planetSizes.jupiter / 2);

    meshSaturne.position.x = Math.cos(Math.radians(90)) * (12000 + planetSizes.saturne / 2);
    meshSaturne.position.z = Math.sin(Math.radians(90)) * (12000 + planetSizes.saturne / 2);

    meshUranus.position.x = Math.cos(Math.radians(120)) * (14000 + planetSizes.uranus / 2);
    meshUranus.position.z = Math.sin(Math.radians(120)) * (14000 + planetSizes.uranus / 2);

    meshNeptune.position.x = Math.cos(Math.radians(270)) * (18000 + planetSizes.neptune / 2);
    meshNeptune.position.z = Math.sin(Math.radians(270)) * (18000 + planetSizes.neptune / 2);


    // Ajout des planètes dans le groupe
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

    // Ajout du groupe dans la scène

    /**
     * Death star
     */

    let deathStar;
    let deathStarG = new THREE.Group();
    deathStarG.name = "deathStar";

    let loadingManager = new THREE.LoadingManager(function () {
        meshEarth.add(deathStarG);
    });
    let loader = new ColladaLoader(loadingManager);
    loader.load('./content/models/ds/model.dae', function (collada) {
        deathStar = collada.scene;
        deathStar.traverse(function (child) {
            if (child.type === 'LineSegments') {
                child.visible = false;
            }
            child.castShadow = true;
        });
        deathStar.scale.x = deathStar.scale.y = deathStar.scale.z = 0.015;
        deathStar.position.x += planetSizes.earth * 3;
        deathStarG.add(deathStar);
    });


    scene.add(planets);


    /**
     * Light
     */

        // Création du spotlight
    let pointLight = new THREE.PointLight(0xf2f2f2, 1.5, radius * 2);
    pointLight.position.set(0, 0, 0);       // Positionné au centre de la scène (au centre du soleil)
    pointLight.castShadow = true;           // Génère des ombres
    pointLight.shadow.camera.near = 1;      // Distance minimum d'émission des ombres
    pointLight.shadow.camera.far = radius;  // Distance maximale d'émission des ombres
    scene.add(pointLight);

    // Création de la lumière ambiante
    let ambientLight = new THREE.AmbientLight(0xf2f2f2, 0.8);
    scene.add(ambientLight);

    /**
     * Background
     */

        // Génération et ajout des particules d'étoiles dans la scène
    let starField = stars(radius);          // Fonction qui retourne un tableau de deux éléménets
    scene.add(starField[0]);
    scene.add(starField[1]);

    // La fonction renvoie un tableau contenant la scène et la caméra
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
    let geometry = new THREE.PlaneBufferGeometry(30, 30, 32, 32);
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

// Fonction de création des particules d'étoiles
function stars(radius) {

    // (-1 < float aléatoire < 1) * radius
    let newRand = function (radius) {
        return THREE.Math.randFloatSpread(2) * (radius);
    };

    // Création de deux types d'étoiles
    let starsGeometry = [
        new THREE.BufferGeometry(),
        new THREE.BufferGeometry()
    ];

    // Création d'un vecteur de coordonnées par type d'étoile (x, y, z)
    let star = new THREE.Vector3();
    let star2 = new THREE.Vector3();

    // Création de deux tableaux vides
    let starCoordinates = [];
    let star2Coordinates = [];

    // Boucle sur tout le rayon de l'univers
    for (let i = 0; i < radius/2; i++) {
        // Attribution aléatoire de coordonnées à aux étoiles
        star.set(newRand(radius), newRand(radius), newRand(radius));
        star2.set(newRand(radius), newRand(radius), newRand(radius));

        //Remplissage du tableau avec les coordonnées de l'étoile 1
        starCoordinates[i * 3] = star.x;
        starCoordinates[i * 3 + 1] = star.y;
        starCoordinates[i * 3 + 2] = star.z;

        //Remplissage du tableau avec les coordonnées de l'étoile 2
        star2Coordinates[i * 3] = star2.x;
        star2Coordinates[i * 3 + 1] = star2.y;
        star2Coordinates[i * 3 + 2] = star2.z;
    }

    // Pour chaque objet BufferGeometry dans starsGeometry, ajout de l'attribut 'position'
    // Les valeurs de starCoordinates sont passées en position à starsGeometry, organisées trois par trois
    starsGeometry[0].addAttribute('position', new THREE.Float32BufferAttribute(starCoordinates, 3));
    starsGeometry[1].addAttribute('position', new THREE.Float32BufferAttribute(star2Coordinates, 3));

    // Couleur et taille
    let starMaterial = [
        new THREE.PointsMaterial({color: 0xffffff, size: 1, sizeAttenuation: false}),
        new THREE.PointsMaterial({color: 0xFFFC00, size: 0.5, sizeAttenuation: false})
    ];

    // Création de points basés sur les coordonnées dans les starsGeometry
    let starField = [
        new THREE.Points(starsGeometry[0], starMaterial[0]),
        new THREE.Points(starsGeometry[1], starMaterial[1])
    ];

    return starField;
}

function generatePlanet(size, material) {
    geometry = new THREE.SphereBufferGeometry(size, 32, 32);
    meshPlanet = new THREE.Mesh(geometry, material);
    meshPlanet.position.set(0, 0, 0);
    meshPlanet.receiveShadow = true;
    meshPlanet.castShadow = true;
}

function sun() {
    geometry = new THREE.SphereBufferGeometry(planetSizes.sun, 64, 64);
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
    /*let ringPosition = ringGeometry.attributes.position;
    let v3 = new THREE.Vector3();
    for (let i = 0; i < ringPosition.count; i++) {
        v3.fromBufferAttribute(ringPosition, i);
        geometry.attributes.uv.setXY(i, v3.length() < 4 ? 0 : 1, 1);
    }*/

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