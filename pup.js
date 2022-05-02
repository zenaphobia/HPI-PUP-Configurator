import * as THREE from '/js/three.module.js';
import { GLTFLoader } from '/js/GLTFLoader.js';
import { OrbitControls } from '/js/OrbitControls.js';
import { DRACOLoader } from '/js/DRACOLoader.js';
import { EXRLoader } from '/js/EXRLoader.js';

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
//Hatches
var longHatch;

var allModels, TruckModel, GullwingModel, HeadacheRackPost, HeadacheRackHex, LongLowSides, ShortLowSides,LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, LadderRack, TruckSlide;

//Lowsides

//#endregion

//Lazy Load files

var vertexData = vert;
var fragData = frag;
var isFullLengthPUPLoaded = false;
//materials
let metalMat, windowMat, redGlassMat,truckPaintMat, clearGlassMat, testMetal;
const allMaterials = new Set();

let customShader;

init();
animate();

function init(){

    //Scene setup
    loader = new GLTFLoader();
    fileLoader = new THREE.FileLoader();
    scene = new THREE.Scene();
    container = document.getElementById('myCanvas');
    camera = new THREE.PerspectiveCamera( 35, container.offsetWidth / container.offsetHeight, 0.1, 1000 );
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.position.z = -15;
    camera.position.y = 5;
    camera.position.x = -15;

    renderer = new THREE.WebGLRenderer({canvas: container, antialias: true, alpha: true});
    renderer.localClippingEnabled = true;

    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;

    //initialize objects

    const light = new THREE.PointLight( 0xFFFFFF, 5, 100 );


    //load textures

    var lidNormalTexture = new THREE.TextureLoader().load('textures/bdp-noise-better.jpg', texture => {texture.flipY = false});
    lidNormalTexture.wrapS = THREE.repeatWrapping;
    lidNormalTexture.wrapT = THREE.repeatWrapping;
    //lidNormalTexture.repeat.x = 10;
    //lidNormalTexture.repeat.y = 10;

        //Materials
    metalMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0,
    });
    testMetal = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0.15,
        bumpScale: .005,
        bumpMap: lidNormalTexture,
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

    customShader = new THREE.ShaderMaterial({
        uniforms:{},
        vertexShader: vertexData,
        fragmentShader: fragData
    });

    truckPaintMat = new THREE.MeshPhysicalMaterial({
        color: 0x606060,
        roughness: .05,
    });

    //Lights

    pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new EXRLoader()
    .load( 'hdrs/air_museum_playground_1k.exr', function ( texture ) {

        var exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

        scene.environment = exrCubeRenderTarget.texture;

        texture.dispose();
        pmremGenerator.dispose();
    } );


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
    //         lidTest = gltf.scene.getObjectByName('Shape_IndexedFaceSet215');

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
        LEDLighting: 'None', //'battery', 'wired'
        AdditionalGullwingTray: false,
        AdditionalLowSideTray: 'None', //1, 2
        LidFinshes: 'DiamondPlate', //BlackDiamondPlate, Leopard, Gladiator, Patriot
        TruckSlide: '1200',
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
    document.getElementById('hr-viewer').addEventListener("mouseover", function(){changeCam()});
    //document.getElementById('open-hatch').addEventListener("click", function(){OpenHatch()});
    document.getElementById('open-tailgate').addEventListener("click", function(){openTailgate()});

    
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
    controls.update();
    //console.log(container.offsetWidth);
    //console.log(controls.getPolarAngle());
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
    switch(clientPUP.LEDLighting){
        //Do we need Wired and Battery as options?
        //If not, simplify LED lighting to boolean options
        case 'None':
            console.log("Unload LED Lighting");
            break;
        case 'Wired':
            console.log("Load Lighting");
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
    switch(clientPUP.LidFinshes){
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
    switch(clientPUP.TruckSlide){
        case '1200':
            console.log("Loading 1200XT truckslide");
            break;
        case '2000':
            console.log("Loading 2000XT truckslide");
            break;
        case '4000':
            console.log("Loading 4000XT truckslide");
            break;
    }
    console.log("PUP rendered successfully")

}

var lidOpen;

async function loadModels(){
    //add all models here
    var [truckData, gullwingData, hrHexData, hrPostData, LongLSData, shortLSData, longFHData, shortFHdata, longDomedData, shortDomedData, lRData, TSdata] = await Promise.all([
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
        loader.loadAsync('models/seperate-models/ladderRack.gltf'),
        loader.loadAsync('models/seperate-models/truckslide.gltf'),
    ])

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
    LadderRack = setupModel(lRData);
    TruckSlide = setupModel(TSdata);
    console.log("model data set up");
    return {TruckModel, GullwingModel, HeadacheRackHex, HeadacheRackPost, LongLowSides, ShortLowSides, LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, LadderRack, TruckSlide };
}

function setupModel(data){
    const model = data.scene;
    console.log("setup() finished");
    return model;
}

async function addModelsToScene(){
    //load models, add to scene, assign hinges to variables here
    var {TruckModel, GullwingModel, HeadacheRackHex, HeadacheRackPost, LongLowSides, ShortLowSides, LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, LadderRack, TruckSlide} = await loadModels();

    scene.add(TruckModel, GullwingModel, HeadacheRackHex, HeadacheRackPost, LongLowSides, ShortLowSides, LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, LadderRack, TruckSlide);

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
    ShortFlatHatch.getObjectByName("Decimated_Hatch").material = testMetal;
    GullwingModel.getObjectByName("gw-decimated-left-lid").material = testMetal;
    GullwingModel.getObjectByName("gw-decimated-right-lid").material = testMetal;
    ShortLowSides.getObjectByName("Shape_IndexedFaceSet215").material = testMetal;
    ShortLowSides.getObjectByName("Shape_IndexedFaceSet413").material = testMetal;
    LongLowSides.getObjectByName("Shape_IndexedFaceSet507").material = testMetal;
    LongLowSides.getObjectByName("Shape_IndexedFaceSet023").material = testMetal;
    LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").material = testMetal;
    ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").material = testMetal;
    LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").material = testMetal;
    //hide models
    HeadacheRackPost.visible = false;
    LongLowSides.visible = false;
    LongFlatHatch.visible = false;
    LongDomedHatch.visible = false;
    ShortDomedHatch.visible = false;
    LongDomedHatch.visible = false;
    LadderRack.visible = false;
    console.log("added models");
    //console.log(GullwingModel);
}

function openLowSideLid(){
    if(!lidOpen){
        document.getElementById('hinge').innerHTML = 'Close lid';
        gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (140 / 360), ease:"expo" })
        lidOpen = true;
    }
    else{
        document.getElementById('hinge').innerHTML = 'Open Lid';
        gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (90 / 360), ease:"expo" })
        lidOpen = false;
    }
}

function showOrHideLadderRack(){
    if(LadderRack.visible){
        document.getElementById('ladder-rack').innerHTML = 'Add Ladder Rack';
        LadderRack.visible = false;
    }
    else if(!LadderRack.visible){
        document.getElementById('ladder-rack').innerHTML = 'Remove Ladder Rack';
        LadderRack.visible = true;
    }
};

function renderPro(){

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

var isHatchOpen = false;

function OpenHatch(){
    if(!isHatchOpen){
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (-5 / 360), ease:"expo" });
        document.getElementById('open-hatch').innerHTML = 'Close Hatch';
        isHatchOpen = true;
    }
    else{
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo" });
        document.getElementById('open-hatch').innerHTML = 'Open Hatch';
        isHatchOpen = false;
    }
    console.log("Open Hatch was clicked");
}

function presentTruckslide(){
    if(!isHatchOpen){
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (-5 / 360), ease:"expo" });
        document.getElementById('open-hatch').innerHTML = 'Close Hatch';
        isHatchOpen = true;
    }
    else{
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo" });
        document.getElementById('open-hatch').innerHTML = 'Open Hatch';
        isHatchOpen = false;
    }
    console.log("Open Hatch was clicked");
}

var isTailgateOpen = false;

function openTailgate(){

    if(!isTailgateOpen){
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (-5 / 360), ease:"expo"});
        gsap.to(TruckModel.getObjectByName("tailgate").rotation, {duration: 2, x: 2 * Math.PI * (-90 / 360), ease:"expo", delay: .5});
        gsap.to(TruckSlide.getObjectByName("truckslide").position, {duration: 2, x: -9.55, ease:"expo", delay: 1});
        document.getElementById('open-tailgate').innerHTML = 'Close tailgate';
        isTailgateOpen = true;
    }
    else{
        gsap.to(TruckSlide.getObjectByName("truckslide").position, {duration: 2, x: -4.65, ease:"expo"});
        gsap.to(TruckModel.getObjectByName("tailgate").rotation, {duration: 2, x: 2 * Math.PI * (0 / 360), ease:"expo", delay: .5});
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 1});
        document.getElementById('open-tailgate').innerHTML = 'Open tailgate';
        isTailgateOpen = false;
    }
    console.log("Button was clicked");
}