import * as THREE from '/js/three.module.js';
import { GLTFLoader } from '/js/GLTFLoader.js';
import { OrbitControls } from '/js/OrbitControls.js';
import { DRACOLoader } from '/js/DRACOLoader.js';
import { EXRLoader } from '/js/EXRLoader.js';
import HeadacheRack from '/js/headacheRack.js';
import { UnrealBloomPass } from '/js/UnrealBloomPass.js';
import { EffectComposer } from '/js/EffectComposer.js';
import { RenderPass } from '/js/RenderPass.js';
// import { SAOPass } from '/js/SAOPass.js';
// import * as THREE from 'https://highwayproducts.com/wp-content/uploads/resources/TestEnvironment/js/three.module.js';
// import { GLTFLoader } from 'https://highwayproducts.com/wp-content/uploads/resources/TestEnvironment/js/GLTFLoader.js';
// import { OrbitControls } from 'https://highwayproducts.com/wp-content/uploads/resources/TestEnvironment/js/OrbitControls.js';
// import { DRACOLoader } from 'https://highwayproducts.com/wp-content/uploads/resources/TestEnvironment/js/DRACOLoader.js'
// import { EXRLoader } from 'https://highwayproducts.com/wp-content/uploads/resources/TestEnvironment/js/EXRLoader.js'

//#region custom shaders
const vert = `
varying vec3 vNormal;
void main(){
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    vNormal = normal;
}
`;
const frag =`
varying vec3 vNormal;
void main()
{
    gl_FragColor=vec4(vNormal,1.0);
}
`;
//#endregion


let loader, fileLoader, scene, container, camera, renderer, controls, dracoLoader, pmremGenerator, clientPUP;

//#region INIT FILES
let basemesh, testmesh, windowMesh, truckBaseMesh, testMat, hingePoint, lidTest;
//All Models
var allModels, TruckModel, GullwingModel, HeadacheRackPost, HeadacheRackHex, LongLowSides, ShortLowSides,LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, LadderRack, XTBase, XT1200Truckslide, XT2000Truckslide;
//Textures
var bdpBumpTexture, dpBumpTexture, patriotTexture, BK62BumpTexture;

let composer, renderPass, SaoPass;

var isHatchOpen = false;
var isTailgateOpen = false;
var isTruckslideOpen = false;


var sun = new THREE.Vector3();

var clock;

clock = new THREE.Clock();
//#endregion

//Lazy Load files

var vertexData = vert;
var fragData = frag;
var isFullLengthPUPLoaded = false;
//materials
let metalMat, windowMat, redGlassMat,truckPaintMat, clearGlassMat, bdpMaterial, dpMaterial, blackMetalMat, leopardMaterial, patriotMat, emissiveLight, BK62Mat;

init();
animate();

function init(){

    //Scene setup
    loader = new GLTFLoader();
    fileLoader = new THREE.FileLoader();
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2(0xffffff, .01);
    container = document.getElementById('myCanvas');
    camera = new THREE.PerspectiveCamera( 35, container.offsetWidth / container.offsetHeight, 0.1, 1000 );
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.position.z = -15;
    camera.position.y = 5;
    camera.position.x = -15;

    renderer = new THREE.WebGLRenderer({canvas: container, antialias: true, alpha: true});
    renderer.setClearColor( 0x000000, 0 );
    renderer.localClippingEnabled = true;

    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectdirectionalLights = true;
    renderer.shadowMap.enabled = true;

    // //SaoPass = new SAOPass(scene, camera, false, true);
    // SaoPass = new SAOPass(scene, camera, false, true);

    // SaoPass.OUTPUT = SaoPass.OUTPUT.Default;
    // SaoPass.params.saoBias = -1;
    // SaoPass.params.saoIntensity = .165;
    // SaoPass.params.saoScale = .1;
    // SaoPass.params.saoKernalRadius = 100;
    // SaoPass.params.saoMinResolution = .005;
    // SaoPass.params.saoBlur = true;
    // SaoPass.params.saoBlurRadius = 20;
    // SaoPass.params.saoBlurStdDev = 35;
    // SaoPass.params.saoBlurDepthCutoff = .027;

    // composer.addPass(SaoPass);

    // console.log(SaoPass);


    //initialize objects

    // const directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 1 );
    // //const directionaldirectionalLight = new THREE.DirectionaldirectionalLight(0xffffff, 1);
    // directionalLight.position.set(5,12,7.5);
    // directionalLight.castShadow = true;
    // directionalLight.shadow.camera.top = 10000;
    // directionalLight.shadow.camera.bottom = - 10000;
    // directionalLight.shadow.camera.left = - 10000;
    // directionalLight.shadow.camera.right = 10000;
    // directionalLight.shadow.camera.near = 0.0001;
    // directionalLight.shadow.camera.far = 1000000;
    // directionalLight.shadow.bias = - 0.002;
    // directionalLight.shadow.mapSize.width = 1024 *4;
    // directionalLight.shadow.mapSize.height = 1024 *4;

    // scene.add(directionalLight);


    //load textures

    bdpBumpTexture = new THREE.TextureLoader().load('textures/bdp-best-bump.jpg', texture => {texture.flipY = false});
    dpBumpTexture = new THREE.TextureLoader().load('textures/dp-pattern.jpg', texture => {texture.flipY = false});
    patriotTexture = new THREE.TextureLoader().load('textures/star-bump.jpg', texture => {texture.flipY = false});
    BK62BumpTexture = new THREE.TextureLoader().load('textures/dp-bump-final.jpg', texture => {texture.flipY = false});

    bdpBumpTexture.wrapS = THREE.repeatWrapping;
    bdpBumpTexture.wrapT = THREE.repeatWrapping;
    dpBumpTexture.wrapS = THREE.repeatWrapping;
    dpBumpTexture.wrapT = THREE.repeatWrapping;
    patriotTexture.wrapS = THREE.repeatWrapping;
    patriotTexture.wrapT = THREE.repeatWrapping;

        //Materials
    metalMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: .1,
    });
    blackMetalMat = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: .1,
    });
    bdpMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0.15,
        bumpScale: .005,
        bumpMap: bdpBumpTexture,
    });
    patriotMat = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0.15,
        bumpScale: .005,
        bumpMap: patriotTexture,
    });
    leopardMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        map: dpBumpTexture,
        metalness: 1,
        roughness: 0.15,
        bumpScale: .005,
        bumpMap: bdpBumpTexture,
    });
    dpMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.15,
        bumpScale: .005,
        bumpMap: dpBumpTexture,
    });
    windowMat = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        transparent: true,
        roughness: 0,
        //transmission: .015, //doubles the draw calls! don't include for now.
        opacity: .95,
    });
    redGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xfa0707,
        transparent: true,
        roughness: 0,
        //transmission: .015, //doubles the draw calls! don't include for now.
        opacity: .85,
    });
    clearGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        roughness: 0,
        //transmission: .015, //doubles the draw calls! don't include for now.
        opacity: .55,
    });

    truckPaintMat = new THREE.MeshPhysicalMaterial({
        color: 0x606060,
        roughness: .05,
    });
    emissiveLight = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 100,
    })
    BK62Mat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: .15,
        bumpScale: .005,
        bumpMap: BK62BumpTexture,
    })

    //directionalLights

    pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new EXRLoader()
    .load( 'hdrs/sunset_jhbcentral_1k.exr', function ( texture ) {

        var exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

        scene.environment = exrCubeRenderTarget.texture;

        texture.dispose();
        pmremGenerator.dispose();
    });

    //Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);

    controls.minDistance = 10;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxPolarAngle = 1.6;
    controls.maxDistance = 25;
    controls.maxAzimuthAngle = .5;
    controls.minAzimuthAngle = -3.5;
    controls.rotateSpeed = (container.offsetWidth / 2560);

    //Draco Loader
    dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/')
    loader.setDRACOLoader(dracoLoader)

    //  Model Loader
    // loader.load(
    //     // resource URL
    //     'models/gullwing-flat-hatch.glb',
    //     // called when the resource is loaded
    //     function ( gltf ) {

    //         basemesh = gltf.scene;
    //         testmesh = gltf.scene.getObjectByName('hatch');
    //         hingePoint = gltf.scene.getObjectByName('lowside-hinge');
    //         lidTest = gltf.scene.getObjectByName('standard-left-lid');

    //         //Traverse method to change materials
    //         gltf.scene.traverse(function(child){
    //             if(child.material && child.material.name === 'windowglass.001'){
    //                 child.material = windowMat;
    //             }
    //             if(child.material && child.material.name === 'redglass.001'){
    //                 child.material = redGlassMat;
    //             }
    //         });
    //         scene.add(basemesh);
    //     },
    //     // called while loading is progressing
    //     function ( xhr ) {
    //         console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    //     },
    //     // called when loading has errors
    //     function ( error ) {
    //         console.log( 'An error happened' + error );
    //     }
    // );

    addModelsToScene();

    //#region Basic PUP object implementation
    clientPUP = {
        Hatch: 'flat',
        Gullwing: true,
        HeadacheRack: 'None',
        LadderRack: true,
        LEDdirectionalLighting: 'None', //'battery', 'wired'
        AdditionalGullwingTray: false,
        AdditionalLowSideTray: 'None', //1, 2
        LidFinishes: "DiamondPlate", //BlackDiamondPlate, Leopard, Gladiator, Patriot
        XT1200Truckslide: '1200',
    };
    //#endregion

    //functions
    //document.getElementById('change-texture').addEventListener("click", function(){applyHatch('domed')});
    document.getElementById('hinge').addEventListener("click", function(){openLowSideLid()});
    document.getElementById('pup-pro').addEventListener("click", function(){renderPro()});
    document.getElementById('pup-standard').addEventListener("click", function(){renderStandard()});
    document.getElementById('domed-hatch').addEventListener("click", function(){renderDomedHatch()});
    document.getElementById('flat-hatch').addEventListener("click", function(){renderFlatHatch()});
    document.getElementById('post-headache-rack').addEventListener("click", function(){switchToPostHeadacheRack()});
    document.getElementById('hex-headache-rack').addEventListener("click", function(){switchToHexHeadacheRack()});
    document.getElementById('ladder-rack').addEventListener("click", function(){showOrHideLadderRack()});
    //document.getElementById('hr-viewer').addEventListener("mouseover", function(){changeCam()});
    //document.getElementById('open-hatch').addEventListener("click", function(){OpenHatch()});
    document.getElementById('open-tailgate').addEventListener("click", function(){openTailgate()});
    document.getElementById('dp').addEventListener("click", function(){switchToDiamondPlate()});
    document.getElementById('black-dp').addEventListener("click", function(){switchToBlackDiamondPlate()});
    document.getElementById('leopard').addEventListener("click", function(){switchToLeopard()});
    document.getElementById('patriot').addEventListener("click", function(){switchToPatriot()});
    // document.getElementById('hide').addEventListener("click", function(){findActiveObject(GullwingModel)});
    document.getElementById('open-gullwing').addEventListener("click", function(){openGullwing()});
    document.getElementById('xt1200').addEventListener("click", function(){chooseXT1200()});
    document.getElementById('xt2000').addEventListener("click", function(){chooseXT2000()});
    document.getElementById('open-hatch').addEventListener("click", function(){openHatch()});
    document.getElementById('open-truckslide').addEventListener("click", function(){openTruckslide()});
    document.getElementById('hide-truckslide').addEventListener("click", function(){hideTruckslide()});
    document.getElementById('test').addEventListener("click", function(){swapMeshes()});

    //document.getElementById('hatches').addEventListener("click", function(){swapHatches()});


    //Window resizing
    window.addEventListener( 'resize', onWindowResize );
    function onWindowResize(){
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.offsetWidth , container.offsetHeight );

}

    //Math function to convert angle to Radian
    //radian = 2 * Math.PI * (p_angle / 360);
}


function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    //composer.render();
    controls.update();
        //Observe a scene or a renderer
        if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
            __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
            __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
          }
}

function applyHatch(hatchSelection){

    clientPUP.Hatch = hatchSelection;
    console.log("Hatch is selected");
    testmesh.visible = !testmesh.visible;
    renderPup(clientPUP);

}

function renderPup(pupObject){

    //switch cases with dependencies go here
    //this function should be called after every change in selection
    switch(clientPUP.Hatch){
        case 'flat':
            console.log("flat hatch is selected");
            break;
        case 'domed':
            console.log("domed hatch is selected");
            break;
        default:
        console.log("invalid selection");
    }
    switch(clientPUP.Gullwing){
        case true:
            //this is loaded by default
            console.log("Loading Gullwing");
            break;
        case false:
            if(!isFullLengthPUPLoaded){
                //Load full length PUP pack here
            }
            //unload gullwing, load full length PUP
            console.log("Unloading Gullwing, load long hatch and lowsides");
            break;
    }
    switch(clientPUP.HeadacheRack){
        case 'Hex':
            console.log("Loading Hex");
            break;
        case 'Post':
            console.log("Loading Post");
            break;
        case 'None':
            console.log("Removing headache rack");
            break;
    }
    switch(clientPUP.LadderRack){
        case true:
            console.log("Loading Ladder Rack");
            break;
        case false:
            console.log("Removing Ladder Rack");
            break;
    }
    switch(clientPUP.LEDdirectionalLighting){
        //Do we need Wired and Battery as options?
        //If not, simplify LED directionalLighting to boolean options
        case 'None':
            console.log("Unload LED directionalLighting");
            break;
        case 'Wired':
            console.log("Load directionalLighting");
    }
    switch(clientPUP.AdditionalGullwingTray){
        case true:
            console.log("Loading Gullwing tray");
            break;
        case false:
            console.log("Remove Gullwing tray");
            break;
    }
    switch(clientPUP.AdditionalLowSideTray){
        case '1':
            console.log("Adding one tray");
            break;
        case '2':
            console.log("Adding another tray");
            break;
    }
    switch(clientPUP.LidFinishes){
        case 'DiamondPlate':
            console.log("Loading diamond plate");
            break;
        case 'BlackDiamondPlate':
            console.log("Loading black diamond plate");
            break;
        case 'Leopard':
            console.log("Loading leopard");
            break;
        case 'Gladiator':
            console.log("Loading gladiator");
            break;
        case 'Patriot':
            console.log("Loading patriot");
            break;
    }
    switch(clientPUP.XT1200Truckslide){
        case '1200':
            console.log("Loading 1200XT XT1200Truckslide");
            break;
        case '2000':
            console.log("Loading 2000XT XT1200Truckslide");
            break;
        case '4000':
            console.log("Loading 4000XT XT1200Truckslide");
            break;
    }
    console.log("PUP rendered successfully")

}

var lidOpen;

async function loadModels(){
    //add all models here
    var [truckData, gullwingData, hrHexData, hrPostData, LongLSData, shortLSData, longFHData, shortFHdata, longDomedData, shortDomedData, shortGladFHData, longGladFHData, shortGladDHData, longGladDHData, lRData, TSBaseData, TSData1200, TSData2000] = await Promise.all([
        loader.loadAsync('models/seperate-models/truck.gltf'),
        loader.loadAsync('models/seperate-models/gullwing.gltf'),
        loader.loadAsync('models/seperate-models/headacheRackHex.gltf'),
        loader.loadAsync('models/seperate-models/headacheRackPost.gltf'),
        loader.loadAsync('models/seperate-models/longLowSides.gltf'),
        loader.loadAsync('models/seperate-models/shortLowSides.gltf'),
        loader.loadAsync('models/seperate-models/longFlatHatch.gltf'),
        loader.loadAsync('models/seperate-models/shortFlatHatch.gltf'),
        loader.loadAsync('models/seperate-models/longDomedHatch.gltf'),
        loader.loadAsync('models/seperate-models/shortDomedHatch.gltf'),
        loader.loadAsync('models/seperate-models/shortGladiatorFlatHatch.gltf'),
        loader.loadAsync('models/seperate-models/longGladiatorFlatHatch.gltf'),
        loader.loadAsync('models/seperate-models/shortGladiatorDomedHatch.gltf'),
        loader.loadAsync('models/seperate-models/longGladiatorDomedHatch.gltf'),
        loader.loadAsync('models/seperate-models/ladderRack.gltf'),
        loader.loadAsync('models/seperate-models/truckslide-base.gltf'),
        loader.loadAsync('models/seperate-models/truckslide-xt1200.gltf'),
        loader.loadAsync('models/seperate-models/truckslide-xt2000.gltf'),
    ]);

    TruckModel = setupModel(truckData);
    GullwingModel = setupModel(gullwingData);
    HeadacheRackHex = setupModel(hrHexData);
    HeadacheRackPost = setupModel(hrPostData);
    LongLowSides = setupModel(LongLSData);
    ShortLowSides = setupModel(shortLSData);
    LongFlatHatch = setupModel(longFHData);
    ShortFlatHatch = setupModel(shortFHdata);
    LongDomedHatch = setupModel(longDomedData);
    ShortDomedHatch = setupModel(shortDomedData);
    shortGladiatorFH = setupModel(shortGladFHData);
    longGladiatorFH = setupModel(longGladFHData);
    shortGladiatorDH = setupModel(shortGladDHData);
    longGladiatorDH = setupModel(longGladDHData);
    LadderRack = setupModel(lRData);
    XTBase = setupModel(TSBaseData);
    XT1200Truckslide = setupModel(TSData1200);
    XT2000Truckslide = setupModel(TSData2000);
    console.log("model data set up");
    return {TruckModel, GullwingModel, HeadacheRackHex, HeadacheRackPost, LongLowSides, ShortLowSides, LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, LadderRack, XTBase, XT1200Truckslide, XT2000Truckslide };
}

function setupModel(data){
    const model = data.scene;
    return model;
}

async function addModelsToScene(){
    //load models, add to scene, assign hinges to variables here
    var {TruckModel, GullwingModel, HeadacheRackHex, HeadacheRackPost, LongLowSides, ShortLowSides, LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, LadderRack, XTBase, XT1200Truckslide, XT2000Truckslide} = await loadModels();

    scene.add(TruckModel, GullwingModel, HeadacheRackHex, HeadacheRackPost, LongLowSides, ShortLowSides, LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, LadderRack, XTBase, XT1200Truckslide, XT2000Truckslide);

    //adding hinge points
    hingePoint = ShortLowSides.getObjectByName('lowside-hinge');

    //Setup Materials
    TruckModel.traverse(function(child){
        if(child.material && child.material.name === 'windowglass.001'){
            child.material = windowMat;
        }
        if(child.material && child.material.name === 'redglass.001'){
            child.material = redGlassMat;
        }
    });
    scene.traverse(function(child){
        if(child.material && child.material.name === 'accent color'){
            child.material = blackMetalMat;
        }
        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
            console.log("shadow casted");
        }
        
    });
    ShortFlatHatch.getObjectByName("Decimated_Hatch").material = bdpMaterial;
    GullwingModel.getObjectByName("gw-decimated-left-lid").material = bdpMaterial;
    GullwingModel.getObjectByName("gw-decimated-right-lid").material = bdpMaterial;
    ShortLowSides.getObjectByName("standard-left-lid").material = bdpMaterial;
    ShortLowSides.getObjectByName("standard-right-lid").material = bdpMaterial;
    LongLowSides.getObjectByName("standard-long-left-lid").material = bdpMaterial;
    LongLowSides.getObjectByName("standard-long-right-lid").material = bdpMaterial;
    LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").material = bdpMaterial;
    ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").material = bdpMaterial;
    LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").material = bdpMaterial;
    ShortLowSides.getObjectByName("Shape_IndexedFaceSet118").material = clearGlassMat;
    ShortLowSides.getObjectByName("Icosphere").material = emissiveLight;


    //console.log(XT1200Truckslide.getObjectByName("Shape_IndexedFaceSet1773"));
    //hide models
    HeadacheRackPost.visible = false;
    GullwingModel.visible = false;
    GullwingModel.getObjectByName("GL-gw-left-lid").visible = false;
    GullwingModel.getObjectByName("GL-gw-right-lid").visible = false;
    ShortLowSides.getObjectByName("GL-left-lid").visible = false;
    ShortLowSides.getObjectByName("GL-right-lid").visible = false;
    LongLowSides.getObjectByName("GL-ls-left-lid").visible = false;
    LongLowSides.getObjectByName("GL-ls-right-lid").visible = false;
    ShortLowSides.visible = false
    ShortFlatHatch.visible = false;
    LongDomedHatch.visible = false;
    ShortDomedHatch.visible = false;
    LongDomedHatch.visible = false;
    shortGladiatorFH.visible = false;
    longGladiatorFH.visible = false;
    shortGladiatorDH.visible = false;
    longGladiatorDH.visible = false;
    LadderRack.visible = false;
    XT2000Truckslide.visible = false;
}

function openLowSideLid(){
    if(!lidOpen){
        document.getElementById('hinge').textContent = 'Close lid';
        gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" });
        gsap.to(LongLowSides.getObjectByName('Shape_IndexedFaceSet506').rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" });
        lidOpen = true;
    }
    else{
        document.getElementById('hinge').textContent = 'Open Lid';
        gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (90 / 360), ease:"expo" });
        gsap.to(LongLowSides.getObjectByName('Shape_IndexedFaceSet506').rotation, {duration: 2, x: 2 * Math.PI * (90 / 360), ease:"expo" });
        lidOpen = false;
    }
}

function showOrHideLadderRack(){
    if(LadderRack.visible){
        document.getElementById('ladder-rack').textContent = 'Add Ladder Rack';
        LadderRack.visible = false;
    }
    else if(!LadderRack.visible){
        document.getElementById('ladder-rack').textContent = 'Remove Ladder Rack';
        LadderRack.visible = true;
    }
};

function renderPro(){

    clientPUP.Gullwing = true;

    swapMeshes();

    if(clientPUP.LidFinishes === "Gladiator"){
        //render gladiator
    }

    else{
        ShortLowSides.visible = true;
        LongLowSides.visible = false;
        if(!GullwingModel.visible){
            GullwingModel.visible = true;
            if(LongFlatHatch.visible){
                LongFlatHatch.visible = false;
                ShortFlatHatch.visible = true;
            }
            else if(LongDomedHatch.visible){
                LongDomedHatch.visible = false;
                ShortDomedHatch.visible = true;
            }
        }
    }

    ShortLowSides.visible = true;
    LongLowSides.visible = false;
    if(!GullwingModel.visible){
        GullwingModel.visible = true;
        if(LongFlatHatch.visible){
            LongFlatHatch.visible = false;
            ShortFlatHatch.visible = true;
        }
        else if(LongDomedHatch.visible){
            LongDomedHatch.visible = false;
            ShortDomedHatch.visible = true;
        }
    }
}

function renderStandard(){

    ShortLowSides.visible =false;
    LongLowSides.visible = true;
    if(GullwingModel.visible){
        GullwingModel.visible = false;
        if(ShortFlatHatch.visible){
            LongFlatHatch.visible = true;
            ShortFlatHatch.visible = false;
        }
        else if(ShortDomedHatch.visible){
            LongDomedHatch.visible = true;
            ShortDomedHatch.visible = false;
        }
    }
}

function renderDomedHatch(){
    if(LongFlatHatch.visible){
        LongFlatHatch.visible = false;
        LongDomedHatch.visible = true;
    }
    else if(ShortFlatHatch.visible){
        ShortFlatHatch.visible = false;
        ShortDomedHatch.visible = true;
    }
}

function renderFlatHatch(){
    if(LongDomedHatch.visible){
        LongDomedHatch.visible = false;
        LongFlatHatch.visible = true;
    }
    else if(ShortDomedHatch.visible){
        ShortDomedHatch.visible = false;
        ShortFlatHatch.visible = true;
    }
}

function switchToPostHeadacheRack(){
    HeadacheRackPost.visible = true;
    HeadacheRackHex.visible = false;
}

function switchToHexHeadacheRack(){
    HeadacheRackHex.visible = true;
    HeadacheRackPost.visible = false;
}

function changeCam(){

    //declare animation
    let animation = gsap.to(camera.position, {duration: 2, x:-10, y:2.35, z: 0, ease:"expo"});
    //controls.minDistance = 5;
    animation.play();
    //will kill animation if somebody clicks any part of the page, otherwise user won't be able to regain control after
    //animation is over.
    document.getElementById('body').addEventListener("mousedown", function(){animation.kill()});
}


function presentXT1200Truckslide(){
    if(!isHatchOpen){
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (-5 / 360), ease:"expo" });
        document.getElementById('open-hatch').textContent = 'Close Hatch';
        isHatchOpen = true;
    }
    else{
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo" });
        document.getElementById('open-hatch').textContent = 'Open Hatch';
        isHatchOpen = false;
    }
    console.log("Open Hatch was clicked");
}

function chooseXT1200(){
    if(XT1200Truckslide.visible !== true){
        XTBase.visible = true;
        XT2000Truckslide.visible = false;
        XT1200Truckslide.visible = true;
    }
}

function chooseXT2000(){
    if(XT2000Truckslide.visible !== true){
        XTBase.visible = true;
        XT2000Truckslide.visible = true;
        XT1200Truckslide.visible = false;
    }
}

function openHatch(){

    if(!isHatchOpen){
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
        gsap.to(LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
        gsap.to(LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
        gsap.to(ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
        document.getElementById("open-hatch").innerText = "Close Hatch";
        isHatchOpen = true;
    }
    else{
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        document.getElementById("open-hatch").innerText = "Open Hatch";
        isHatchOpen = false;
    }
}

function openTailgate(){
    if(!isTailgateOpen && isHatchOpen){
        gsap.to(TruckModel.getObjectByName("tailgate").rotation, {duration: 2, x: 2 * Math.PI * (-90 / 360), ease:"expo"});
        isTailgateOpen = true;
    }
    else if(isTailgateOpen && isHatchOpen && !isTruckslideOpen){
        gsap.to(TruckModel.getObjectByName("tailgate").rotation, {duration: 2, x: 2 * Math.PI * (0 / 360), ease:"expo"});
        isTailgateOpen = false;
    }
}

function hideTruckslide(){
    XTBase.visible = false;
    XT1200Truckslide.visible = false;
    XT2000Truckslide.visible = false;
}

function openTruckslide(){
    if(!isTruckslideOpen && isTailgateOpen){
        gsap.to(XTBase.getObjectByName("truckslide_movingBase").position, {duration: 2, x: -11, ease:"expo"});
        gsap.to(XT2000Truckslide.getObjectByName("Truckslide_XT2000").position, {duration: 2, x: -11, ease:"expo"});
        gsap.to(XT1200Truckslide.getObjectByName("Truckslide_XT1200").position, {duration: 2, x: -11, ease:"expo"});
        document.getElementById('open-truckslide').innerText = "Close Truckslide";
        isTruckslideOpen = true;
    }
    else if(isTruckslideOpen && isTailgateOpen){
        gsap.to(XTBase.getObjectByName("truckslide_movingBase").position, {duration: 2, x: -4.65, ease:"expo"});
        gsap.to(XT1200Truckslide.getObjectByName("Truckslide_XT1200").position, {duration: 2, x: -4.65, ease:"expo"});
        gsap.to(XT2000Truckslide.getObjectByName("Truckslide_XT2000").position, {duration: 2, x: -4.65, ease:"expo"});
        document.getElementById('open-truckslide').innerText = "Open Truckslide";
        isTruckslideOpen = false;
    }
}

function openGullwing(){
    if(GullwingModel.getObjectByName("gw-decimated-left-lid").rotation.x < 2 ){
        gsap.to(GullwingModel.getObjectByName("gw-decimated-left-lid").rotation, {duration: 2, x: 135 * (Math.PI / 180), ease:"expo"});
    }
    else{
        gsap.to(GullwingModel.getObjectByName("gw-decimated-left-lid").rotation, {duration: 2, x: 90 * (Math.PI / 180), ease:"expo"});
    }
}

function switchToDiamondPlate(){
    var _accentColor = null;

    switch(ShortFlatHatch.getObjectByName("Decimated_Hatch").material){
        case bdpMaterial:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case dpMaterial:
            _accentColor = metalMat
            console.log("accent color is dp");
            break;
        case leopardMaterial:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case patriotMat:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        default:
            console.log("unknown accent color");
            break;
    }
    ShortFlatHatch.getObjectByName("Decimated_Hatch").material = dpMaterial;
    GullwingModel.getObjectByName("gw-decimated-left-lid").material = dpMaterial;
    GullwingModel.getObjectByName("gw-decimated-right-lid").material = dpMaterial;
    ShortLowSides.getObjectByName("standard-left-lid").material = dpMaterial;
    ShortLowSides.getObjectByName("standard-right-lid").material = dpMaterial;
    LongLowSides.getObjectByName("standard-long-left-lid").material = dpMaterial;
    LongLowSides.getObjectByName("standard-long-right-lid").material = dpMaterial;
    LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").material = dpMaterial;
    ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").material = dpMaterial;
    LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").material = dpMaterial;

    scene.traverse(function(child){
        if(child.material === _accentColor){
            child.material = metalMat;
        }
    });
}

function switchToBlackDiamondPlate(){
    var _accentColor = null;

    switch(ShortFlatHatch.getObjectByName("Decimated_Hatch").material){
        case bdpMaterial:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case dpMaterial:
            _accentColor = metalMat
            console.log("accent color is dp");
            break;
        case leopardMaterial:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case patriotMat:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        default:
            console.log("unknown accent color");
            break;
    }
    ShortFlatHatch.getObjectByName("Decimated_Hatch").material = bdpMaterial;
    GullwingModel.getObjectByName("gw-decimated-left-lid").material = bdpMaterial;
    GullwingModel.getObjectByName("gw-decimated-right-lid").material = bdpMaterial;
    ShortLowSides.getObjectByName("standard-left-lid").material = bdpMaterial;
    ShortLowSides.getObjectByName("standard-right-lid").material = bdpMaterial;
    LongLowSides.getObjectByName("standard-long-left-lid").material = bdpMaterial;
    LongLowSides.getObjectByName("standard-long-right-lid").material = bdpMaterial;
    LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").material = bdpMaterial;
    ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").material = bdpMaterial;
    LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").material = bdpMaterial;

    scene.traverse(function(child){
        if(child.material === _accentColor){
            child.material = blackMetalMat;
        }
    });
}

function switchToLeopard(){
    var _accentColor = null;

    // switch(ShortFlatHatch.getObjectByName("Decimated_Hatch").material){
    //     case bdpMaterial:
    //         _accentColor = blackMetalMat;
    //         console.log("accent color is bdp");
    //         break;
    //     case dpMaterial:
    //         _accentColor = metalMat
    //         console.log("accent color is dp");
    //         break;
    //     case leopardMaterial:
    //         _accentColor = blackMetalMat;
    //         console.log("accent color is bdp");
    //         break;
    //     case patriotMat:
    //         _accentColor = blackMetalMat;
    //         console.log("accent color is bdp");
    //         break;
    //     default:
    //         console.log("unknown accent color");
    //         break;
    // }
    ShortFlatHatch.getObjectByName("Decimated_Hatch").material = leopardMaterial;
    GullwingModel.getObjectByName("gw-decimated-left-lid").material = leopardMaterial;
    GullwingModel.getObjectByName("gw-decimated-right-lid").material = leopardMaterial;
    ShortLowSides.getObjectByName("standard-left-lid").material = leopardMaterial;
    ShortLowSides.getObjectByName("standard-right-lid").material = leopardMaterial;
    LongLowSides.getObjectByName("standard-long-left-lid").material = leopardMaterial;
    LongLowSides.getObjectByName("standard-long-right-lid").material = leopardMaterial;
    LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").material = leopardMaterial;
    ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").material = leopardMaterial;
    LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").material = leopardMaterial;

    scene.traverse(function(child){
        if(child.material === "accentColor"){
            child.material = blackMetalMat;
        }
    });
}

console.log(blackMetalMat);
function switchToPatriot(){
    var _accentColor = null;

    switch(ShortFlatHatch.getObjectByName("Decimated_Hatch").material){
        case bdpMaterial:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case dpMaterial:
            _accentColor = metalMat
            console.log("accent color is dp");
            break;
        case leopardMaterial:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case patriotMat:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        default:
            console.log("unknown accent color");
            break;
    }
    ShortFlatHatch.getObjectByName("Decimated_Hatch").material = patriotMat;
    GullwingModel.getObjectByName("gw-decimated-left-lid").material = patriotMat;
    GullwingModel.getObjectByName("gw-decimated-right-lid").material = patriotMat;
    ShortLowSides.getObjectByName("standard-left-lid").material = patriotMat;
    ShortLowSides.getObjectByName("standard-right-lid").material = patriotMat;
    LongLowSides.getObjectByName("standard-long-left-lid").material = patriotMat;
    LongLowSides.getObjectByName("standard-long-right-lid").material = patriotMat;
    LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").material = patriotMat;
    ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").material = patriotMat;
    LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").material = patriotMat;

    scene.traverse(function(child){
        if(child.material === _accentColor){
            child.material = blackMetalMat;
        }
    });
}

function switchToGladiator(){
    var _accentColor = null;

    clientPUP.LidFinishes = "Gladiator";
    swapMeshes();

    switch(ShortFlatHatch.getObjectByName("Decimated_Hatch").material){
        case bdpMaterial:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case dpMaterial:
            _accentColor = metalMat
            console.log("accent color is dp");
            break;
        case leopardMaterial:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case patriotMat:
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        default:
            console.log("unknown accent color");
            break;
    }


    scene.traverse(function(child){
        if(child.material === _accentColor){
            child.material = blackMetalMat;
        }
    });
}
function swapMeshes(){
    if(clientPUP.LidFinishes === "DiamondPlate" || clientPUP.LidFinishes === "Leopard" || clientPUP.LidFinishes === "BlackDiamondPlate"){
        ShortFlatHatch.visible = true;
        GullwingModel.getObjectByName("gw-decimated-right-lid").visible = true;
        GullwingModel.getObjectByName("gw-decimated-left-lid").visible = true;
        ShortLowSides.getObjectByName("standard-left-lid").visible = true;
        ShortLowSides.getObjectByName("standard-right-lid").visible = true;
        LongLowSides.getObjectByName("standard-long-left-lid").visible = true;
        LongLowSides.getObjectByName("standard-long-right-lid").visible = true;
        LongFlatHatch.visible = true;
        ShortDomedHatch.visible = true;
        LongDomedHatch.visible = true;

        GullwingModel.getObjectByName("GL-gw-left-lid").visible = false;
        GullwingModel.getObjectByName("GL-gw-right-lid").visible = false;
        ShortLowSides.getObjectByName("GL-left-lid").visible = false;
        ShortLowSides.getObjectByName("GL-right-lid").visible = false;
        LongLowSides.getObjectByName("GL-ls-left-lid").visible = false;
        LongLowSides.getObjectByName("GL-ls-right-lid").visible = false;
        shortGladiatorFH.visible = false;
        longGladiatorFH.visible = false;
        shortGladiatorDH.visible = false;
        longGladiatorDH.visible = false;

        console.log("true");
    }
    else{
        {
            ShortFlatHatch.visible = true;
            GullwingModel.getObjectByName("gw-decimated-right-lid").visible = false;
            GullwingModel.getObjectByName("gw-decimated-left-lid").visible = false;
            ShortLowSides.getObjectByName("standard-left-lid").visible = false;
            ShortLowSides.getObjectByName("standard-right-lid").visible = false;
            LongLowSides.getObjectByName("standard-long-left-lid").visible = false;
            LongLowSides.getObjectByName("standard-long-right-lid").visible = false;
            LongFlatHatch.visible = false;
            ShortDomedHatch.visible = false;
            LongDomedHatch.visible = false;
    
            GullwingModel.getObjectByName("GL-gw-left-lid").visible = true;
            GullwingModel.getObjectByName("GL-gw-right-lid").visible = true;
            ShortLowSides.getObjectByName("GL-left-lid").visible = true;
            ShortLowSides.getObjectByName("GL-right-lid").visible = true;
            LongLowSides.getObjectByName("GL-ls-left-lid").visible = true;
            LongLowSides.getObjectByName("GL-ls-right-lid").visible = true;
            shortGladiatorFH.visible = true;
            longGladiatorFH.visible = true;
            shortGladiatorDH.visible = true;
            longGladiatorDH.visible = true;
    
            console.log("false");
        }
    }
}
//Returns all active objects in a group
function findAllActiveObjects(x){
    var group;

    if(x !== undefined ){
        for(let i = 0; i <= x.children.length - 1; i++){
            if(x.children[i].visible){
                console.log(x.children[i]);
                group += x.children[i];
                //x.children[i].visible = false;
            }
        }
        return group;
    }
}
//Returns the first child that is visible in a given group
function findActiveObject(x){
    if(x !== undefined ){
        for(let i = 0; i <= x.children.length - 1; i++){
            if(x.children[i].visible){
                console.log(x.children[i]);
                return x.children[i];
                //x.children[i].visible = false;
            }
        }
    }
}