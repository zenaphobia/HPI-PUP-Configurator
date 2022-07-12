import * as THREE from '/js/three.module.js';
import { GLTFLoader } from '/js/GLTFLoader.js';
import { OrbitControls } from '/js/OrbitControls.js';
import { DRACOLoader } from '/js/DRACOLoader.js';
import { EXRLoader } from '/js/EXRLoader.js';
import { FlakesTexture } from '/js/FlakesTexture.js'
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
uniform float u_time;
void main(){
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}
`;
const frag =`
varying vec3 vNormal;
uniform float u_time;
uniform vec3 colorMine;
void main()
{
    vec3 colorMine = vec3(55,0,0);
    gl_FragColor = vec4( colorMine, clamp(sin(u_time / 2.0), 0.5, .75) );
}
`;
//#endregion

const HexHeadacheRackPost = {
    name: "Hex Headache Rack",
    price: 100,
    description: "Whether you want added protection for your rear window or to gain overhead storage a headache rack is the perfect add on."
}
const PostHeadacheRackPost = {
    name: "Open Headache Rack",
    price: 75,
    description: "3rd brakelight camera compatible. "
}

let loader, fileLoader, scene, container, camera, renderer, controls, dracoLoader, pmremGenerator, clientPUP;

//#region INIT FILES
let basemesh, testmesh, windowMesh, truckBaseMesh, testMat, hingePoint, lidTest;
//All Models
var allModels, TruckModel, GullwingModel, HeadacheRackPost, HeadacheRackHex, LongLowSides, ShortLowSides,LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, PupAccessories, XTBase, XT1200Truckslide, XT2000Truckslide;
//Textures
var bdpBumpTexture, dpBumpTexture, patriotTexture, BK62BumpTexture, carPaintTexture, blankTexture, customMaterial;

let cameraTracker;
const standardCameraAngle = new THREE.Vector3(-25.0, 7.0, -10.0);
var uniforms;
var headacheRackHexDupe;

const clock = new THREE.Clock();

var longLowsideTrayCount = 1;
//let composer, renderPass, SaoPass;

var isHatchOpen = false;
var isTailgateOpen = false;
var isTruckslideOpen = false;


//#endregion

//Lazy Load files

var vertexData = vert;
var fragData = frag;
var isFullLengthPUPLoaded = false;
//materials
let metalMat, windowMat, redGlassMat,truckPaintMat, clearGlassMat, bdpMaterial, dpMaterial, blackMetalMat, leopardMaterial, patriotMat, emissiveLight, BK62Mat, clearGlassMatLights;

init();
animate();

function init(){

    //Scene setup
    loader = new GLTFLoader();
    fileLoader = new THREE.FileLoader();
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2(0xffffff, .01);
    container = document.getElementById('myCanvas');
    camera = new THREE.PerspectiveCamera( 25, container.offsetWidth / container.offsetHeight, 0.1, 1000 );
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.position.set(standardCameraAngle.x, standardCameraAngle.y, standardCameraAngle.z);
    console.log(camera.position);

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

    

    // const renderScene = new RenderPass(scene, camera);
    // const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.offsetWidth / container.offsetHeight), 1.5, 0.4, 0.85);
    // bloomPass.threshold = .85;
    // bloomPass.strength = .15;
    // bloomPass.radius = 0;

    // composer = new EffectComposer(renderer);
    // composer.addPass(renderScene);
    // composer.addPass(bloomPass);

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

    //load textures

    bdpBumpTexture = new THREE.TextureLoader().load('textures/bdp-final.jpg', texture => {texture.flipY = false});
    dpBumpTexture = new THREE.TextureLoader().load('textures/dp-pattern-final.jpg', texture => {texture.flipY = false});
    patriotTexture = new THREE.TextureLoader().load('textures/star-bump.jpg', texture => {texture.flipY = false});
    BK62BumpTexture = new THREE.TextureLoader().load('textures/BK62-bump.jpg', texture => {texture.flipY = false});
    carPaintTexture = new  THREE.CanvasTexture(new FlakesTexture());

    bdpBumpTexture.wrapS = THREE.repeatWrapping;
    bdpBumpTexture.wrapT = THREE.repeatWrapping;
    dpBumpTexture.wrapS = THREE.repeatWrapping;
    dpBumpTexture.wrapT = THREE.repeatWrapping;
    patriotTexture.wrapS = THREE.repeatWrapping;
    patriotTexture.wrapT = THREE.repeatWrapping;
    BK62BumpTexture.wrapS = THREE.repeatWrapping;
    BK62BumpTexture.wrapT = THREE.repeatWrapping;
    carPaintTexture.wrapT = THREE.repeatWrapping;
    carPaintTexture.wrapS = THREE.repeatWrapping;
    carPaintTexture.repeat.x = 40;
    carPaintTexture.repeat.y = 40;

    uniforms = {
        u_time: {value: 0.0},
    }
        //Materials
    metalMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: .1,
    });
    blackMetalMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: .1,
        bumpScale: .005,
        bumpMap: BK62BumpTexture,
        name: "BlackMetalMat"
    });
    bdpMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0.15,
        bumpScale: .005,
        bumpMap: bdpBumpTexture,
    });
    patriotMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0.15,
        bumpScale: .005,
        bumpMap: patriotTexture,
    });
    leopardMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: dpBumpTexture,
        metalness: 1,
        roughness: 0.15,
        bumpScale: .005,
        bumpMap: bdpBumpTexture,
    });
    dpMaterial = new THREE.MeshStandardMaterial({
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
    clearGlassMatLights = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
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
        color: 0x1f1f1f,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        roughness: .05,
        normalMap: carPaintTexture,
        normalScale: new THREE.Vector2(.03,.03),
        sheen: 1,
        sheenRoughness: .155,
        sheenColor: 0xffffff,
    });
    emissiveLight = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 100,
    });
    BK62Mat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: .15,
        bumpScale: .005,
        bumpMap: BK62BumpTexture,
        name: "Bk62Mat"
    });
    blankTexture = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });
    customMaterial = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: uniforms,
        transparent: true,
    });

    //CameraHelper
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    cameraTracker = new THREE.Mesh(geometry, blankTexture);
    scene.add(cameraTracker);
    cameraTracker.position.y = -1;
    cameraTracker.visible = false;

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

    //Orbit Controls - Tailored Experience
    // controls = new OrbitControls(camera, renderer.domElement);

    // controls.minDistance = 10;
    // controls.enablePan = false;
    // controls.enableDamping = true;
    // controls.maxPolarAngle = 1.6;
    // controls.maxDistance = 25;
    // controls.maxAzimuthAngle = .5;
    // controls.minAzimuthAngle = -3.5;
    // controls.rotateSpeed = (container.offsetWidth / 2560);

    //Draco Loader
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    //  Model Loader

    addModelsToScene();

    //#region Basic PUP object implementation
    clientPUP = {
        Hatch: "Flat",
        Gullwing: false,
        HeadacheRack: "Hex",
        LadderRack: false,
        LEDdirectionalLighting: "None", //'battery', 'wired'
        AdditionalGullwingTray: false,
        AdditionalLowSideTray: "None", //1, 2
        LidFinishes: "BlackDiamondPlate", //BlackDiamondPlate, Leopard, Gladiator
        Truckslide: "None",
    };
    //#endregion

    //functions
    document.getElementById('headacherack').addEventListener("mouseenter", function(){headacheRackHoverOn()});
    document.getElementById('headacherack').addEventListener("mouseleave", function(){headacheRackHoverOff()});
    document.getElementById('headacherack').addEventListener("click", function(){headacheRackSelect()});
    document.getElementById('ladderrack').addEventListener("mouseenter", function(){ladderRackHoverOn()});
    document.getElementById('ladderrack').addEventListener("mouseleave", function(){ladderRackHoverOff()});
    document.getElementById('ladderrack').addEventListener("click", function(){ladderRackSelect()});
    // document.getElementById('hinge').addEventListener("click", function(){openLowSideLid()});
    // document.getElementById('pup-pro').addEventListener("click", function(){renderPro()});
    // document.getElementById('pup-standard').addEventListener("click", function(){renderStandard()});
    // document.getElementById('domed-hatch').addEventListener("click", function(){renderDomedHatch()});
    // document.getElementById('flat-hatch').addEventListener("click", function(){renderFlatHatch()});
    // document.getElementById('post-headache-rack').addEventListener("click", function(){switchToPostHeadacheRack()});
    // document.getElementById('hex-headache-rack').addEventListener("click", function(){switchToHexHeadacheRack()});
    // document.getElementById('ladder-rack').addEventListener("click", function(){showOrHideLadderRack()});
    // document.getElementById('add-ls-tray').addEventListener("click", function(){addLowSideTrays()});
    // document.getElementById('remove-ls-tray').addEventListener("click", function(){removeLowSideTrays()});
    // document.getElementById('open-tailgate').addEventListener("click", function(){openTailgate()});
    // document.getElementById('dp').addEventListener("click", function(){switchToDiamondPlate()});
    // document.getElementById('black-dp').addEventListener("click", function(){switchToBlackDiamondPlate()});
    // document.getElementById('leopard').addEventListener("click", function(){switchToLeopard()});
    // document.getElementById('gladiator').addEventListener("click", function(){switchToGladiator()});
    // document.getElementById('open-gullwing').addEventListener("click", function(){openGullwing()});
    // document.getElementById('xt1200').addEventListener("click", function(){chooseXT1200()});
    // document.getElementById('xt2000').addEventListener("click", function(){chooseXT2000()});
    // document.getElementById('xt4000').addEventListener("click", function(){chooseXT4000()});
    // document.getElementById('open-hatch').addEventListener("click", function(){openHatch()});
    // document.getElementById('open-truckslide').addEventListener("click", function(){openTruckslide()});
    // document.getElementById('hide-truckslide').addEventListener("click", function(){hideTruckslide()});
    // document.getElementById('change-to-red').addEventListener("click", function(){truckPaintMat.color.set(0x570000);truckPaintMat.sheenColor.set(0x2b0000); });
    // document.getElementById('change-to-blue').addEventListener("click", function(){truckPaintMat.color.set(0x001340); truckPaintMat.sheenColor.set(0x000000); });
    // document.getElementById('change-to-grey').addEventListener("click", function(){truckPaintMat.color.set(0x1f1f1f); truckPaintMat.sheenColor.set(0xffffff);});
    // document.getElementById('change-to-black').addEventListener("click", function(){truckPaintMat.color.set(0x050505); truckPaintMat.sheenColor.set(0xffffff);});
    // document.getElementById('change-to-white').addEventListener("click", function(){truckPaintMat.color.set(0xf0f0f0)});

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
    camera.lookAt(cameraTracker.position);
    renderer.render( scene, camera );
    //composer.render();
    // controls.update();
        //Observe a scene or a renderer
        // if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
        //     __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
        //     __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
        //   }
}

function showPage(){
    var loader = document.getElementById("loader");
    gsap.to(loader, {duration: 2, opacity: 0, ease:"expo", onComplete: hideLoader});
}

function hideLoader(){
    var loader = document.getElementById("loader");
    loader.style.display = "none";
}

function ToHoloMaterial(mesh){
    mesh.traverse(function(child){
        if(child.isMesh && child.geometry.name !== ""){
            child.material = customMaterial;
        }
    });
}

function toNormalMaterial(mesh){
    mesh.traverse(function(child){
        if(child.isMesh && child.geometry.name === "accentColor"){
            switch(clientPUP.LidFinishes){
                case "BlackDiamondPlate":
                    child.material = blackMetalMat;
                    console.log("accent color is bdp");
                    break;
                case "DiamondPlate":
                    child.material = metalMat
                    console.log("accent color is dp");
                    break;
                case "Leopard":
                    child.material = blackMetalMat;
                    console.log("accent color is bdp");
                    break;
                case "Patriot":
                    child.material = blackMetalMat;
                    console.log("accent color is bdp");
                    break;
                case "Gladiator":
                    child.material = blackMetalMat;
                    break;
                default:
                    console.log("unknown accent color");
                    break;
            }
        }
        if(child.isMesh && child.geometry.name === "lidMaterial"){
            switch(clientPUP.LidFinishes){
                case "BlackDiamondPlate":
                    child.material = bdpMaterial;
                    console.log("accent color is bdp");
                    break;
                case "DiamondPlate":
                    child.material = dpMaterial;
                    console.log("accent color is dp");
                    break;
                case "Leopard":
                    child.material = leopardMaterial;
                    console.log("accent color is bdp");
                    break;
                case "Patriot":
                    child.material = patriotMat;
                    console.log("accent color is bdp");
                    break;
                case "Gladiator":
                    child.material = blackMetalMat;
                    break;
                default:
                    console.log("unknown accent color");
                    break;
            }
        }
    });
}

function headacheRackHoverOn(){
    ToHoloMaterial(HeadacheRackHex);
}
function headacheRackHoverOff(){
    toNormalMaterial(HeadacheRackHex);
}

function headacheRackSelect(){
    gsap.to(cameraTracker.position, {duration: 2, x: 5, y: 2, ease:"expo"});
    gsap.to(camera.position, {duration: 2, x: -4, y: 4, z: 0, ease:"expo"});
    console.log(HeadacheRackHex);
}

function ladderRackHoverOn(){
    PupAccessories.getObjectByName("ladder-rack").visible = true;
    ToHoloMaterial(PupAccessories.getObjectByName("ladder-rack"));
}
function ladderRackHoverOff(){
    if(clientPUP.LadderRack === true){
        PupAccessories.getObjectByName("ladder-rack").visible = true;
        console.log("ladder rack is on");
    }
    else{
        PupAccessories.getObjectByName("ladder-rack").visible = false;
        console.log("ladder is off");
    }
    toNormalMaterial(PupAccessories.getObjectByName("ladder-rack"));
}
function ladderRackSelect(){
    PupAccessories.getObjectByName("ladder-rack").visible = true;
    clientPUP.LadderRack = true;
    toNormalMaterial(PupAccessories.getObjectByName("ladder-rack"));
}

function renderPup(){

    //switch cases with dependencies go here
    //this function should be called after every change in selection
    switch(clientPUP.Hatch){
        case 'flat':
            renderFlatHatch();
            if(clientPUP.LidFinishes === "Gladiator"){
                LongFlatHatch.visible = false;
                ShortFlatHatch.visible = false;
                longGladiatorFH.visible = true;
                shortGladiatorFH.visible = true;
            }
            break;
        case 'domed':
            renderDomedHatch();
            if(clientPUP.LidFinishes === "Gladiator"){
                LongDomedHatch.visible = false;

            }
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
    switch(clientPUP.PupAccessories){
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
    var [truckData, gullwingData, hrHexData, hrPostData, LongLSData, shortLSData, longFHData, shortFHdata, longDomedData, shortDomedData, shortGladFHData, longGladFHData, shortGladDHData, longGladDHData, PupExtrasData, TSBaseData, TSData1200, TSData2000] = await Promise.all([
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
        loader.loadAsync('models/seperate-models/pup-extras.gltf'),
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
    PupAccessories = setupModel(PupExtrasData);
    XTBase = setupModel(TSBaseData);
    XT1200Truckslide = setupModel(TSData1200);
    XT2000Truckslide = setupModel(TSData2000);
    console.log("model data set up");
    return {TruckModel, GullwingModel, HeadacheRackHex, HeadacheRackPost, LongLowSides, ShortLowSides, LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, PupAccessories, XTBase, XT1200Truckslide, XT2000Truckslide };
}

function setupModel(data){
    const model = data.scene;
    return model;
}

async function addModelsToScene(){
    //load models, add to scene, assign hinges to variables here
    var {TruckModel, GullwingModel, HeadacheRackHex, HeadacheRackPost, LongLowSides, ShortLowSides, LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, PupAccessories, XTBase, XT1200Truckslide, XT2000Truckslide} = await loadModels();

    scene.add(TruckModel, GullwingModel, HeadacheRackHex, HeadacheRackPost, LongLowSides, ShortLowSides, LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, PupAccessories, XTBase, XT1200Truckslide, XT2000Truckslide);

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
        if(child.material && child.material.name === 'clearglass.001'){
            child.material = clearGlassMatLights;
        }
        if(child.material && child.material.name === 'Carpaint'){
            child.material = truckPaintMat;
        }
    });
    scene.traverse(function(child){
        if(child.material && child.material.name === 'accent color'){
            child.material = blackMetalMat;
            child.geometry.name = "accentColor";
        }
        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
            console.log("shadow casted");
        }
        if(child.material && child.material.name === 'Black Diamond Plate Test 3'){
            child.material = BK62Mat;
            child.geometry.name = "lidMaterial";
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

    //hide models
    HeadacheRackPost.visible = false;
    GullwingModel.visible = false;
    GullwingModel.getObjectByName("GL-gw-left-lid").visible = false;
    GullwingModel.getObjectByName("GL-gw-right-lid").visible = false;
    ShortLowSides.getObjectByName("GL-left-lid").visible = false;
    ShortLowSides.getObjectByName("GL-right-lid").visible = false;
    LongLowSides.getObjectByName("GL-ls-left-lid").visible = false;
    LongLowSides.getObjectByName("GL-ls-right-lid").visible = false;
    PupAccessories.getObjectByName("lowside-tray-2").visible = false;
    PupAccessories.getObjectByName("lowside-tray-3").visible = false;
    ShortLowSides.visible = false
    ShortFlatHatch.visible = false;
    LongDomedHatch.visible = false;
    ShortDomedHatch.visible = false;
    LongDomedHatch.visible = false;
    shortGladiatorFH.visible = false;
    longGladiatorFH.visible = false;
    shortGladiatorDH.visible = false;
    longGladiatorDH.visible = false;
    PupAccessories.getObjectByName("ladder-rack").visible = false;
    XT2000Truckslide.visible = false;
    XT2000Truckslide.getObjectByName("truckslide-left-xt4000").visible = false;
    XT2000Truckslide.getObjectByName("truckslide-right-xt4000").visible = false;
    XT2000Truckslide.getObjectByName("4000-middle-taper").visible = false;

    //shows page after model is loaded.
    XT2000Truckslide.onAfterRender(showPage());

}

function openLowSideLid(){
    if(!lidOpen){
        document.getElementById('hinge').textContent = 'Close lid';
        gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" });
        gsap.to(LongLowSides.getObjectByName('long-ls-left-hinge').rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" });
        lidOpen = true;
    }
    else{
        document.getElementById('hinge').textContent = 'Open Lid';
        gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (90 / 360), ease:"expo" });
        gsap.to(LongLowSides.getObjectByName('long-ls-left-hinge').rotation, {duration: 2, x: 2 * Math.PI * (90 / 360), ease:"expo" });
        lidOpen = false;
    }
}

function GetLowSideCounter(){
    if(PupAccessories.getObjectByName("lowside-tray-2").visible === true && PupAccessories.getObjectByName("lowside-tray-3").visible === false){
        console.log("returned 2");
        return 2;
    }
    else if(PupAccessories.getObjectByName("lowside-tray-3").visible === true){
        console.log("returned 3");
        return 3;
    }
    else{
        return 1;
    }
}

function addLowSideTrays(){
    switch(GetLowSideCounter()){
        case 1:
            PupAccessories.getObjectByName("lowside-tray-2").visible = true;
            console.log("case 1");
            switch(clientPUP.Gullwing){
                case true:
                    PupAccessories.getObjectByName("lowside-tray-2").position.x = -2.76635;
                    break;
                case false:
                    PupAccessories.getObjectByName("lowside-tray-2").position.x = -1.71959;
                    break;
            }
        break;
        case 2:
            PupAccessories.getObjectByName("lowside-tray-3").visible = true;
            console.log("case 2");
                switch(clientPUP.Gullwing){
                    case true:
                        PupAccessories.getObjectByName("lowside-tray-3").position.x = -4.38547;
                        break;
                    case false:
                        PupAccessories.getObjectByName("lowside-tray-3").position.x = -3.41479;
                        break;
                }
        break;
    }

}

function removeLowSideTrays(){
    switch(GetLowSideCounter()){
        case 2:
            PupAccessories.getObjectByName("lowside-tray-2").visible = false;
        break;
        case 3:
            PupAccessories.getObjectByName("lowside-tray-3").visible = false;
        break;
    }
}

function showOrHideLadderRack(){
    if(PupAccessories.getObjectByName("ladder-rack").visible === true){
        document.getElementById('ladder-rack').textContent = 'Add Ladder Rack';
        PupAccessories.visible = false;
    }
    else{
        document.getElementById('ladder-rack').textContent = 'Remove Ladder Rack';
        PupAccessories.getObjectByName("ladder-rack").visible = true;
    }
};

function renderPro(){

    clientPUP.Gullwing = true;
    ShortLowSides.visible = true;
    LongLowSides.visible = false;
    ShortLowSides.getObjectByName("GL-left-lid").visible  = false;
    ShortLowSides.getObjectByName("GL-right-lid").visible = false;
    LongLowSides.getObjectByName("GL-ls-left-lid").visible = false;
    LongLowSides.getObjectByName("GL-ls-right-lid").visible = false;
    GullwingModel.getObjectByName("gw-decimated-right-lid").visible = false;
    GullwingModel.getObjectByName("gw-decimated-left-lid").visible = false;
    ShortLowSides.getObjectByName("standard-left-lid").visible = false;
    ShortLowSides.getObjectByName("standard-right-lid").visible = false;
    LongLowSides.getObjectByName("standard-long-left-lid").visible = false;
    LongLowSides.getObjectByName("standard-long-right-lid").visible = false;

    //If it's a Gladiator, reconstruct the whole damn thing
    if(clientPUP.LidFinishes === "Gladiator"){

        //If Gullwing is not loaded, add to scene
        if(!GullwingModel.visible){
            GullwingModel.visible = true;
            ShortLowSides.getObjectByName("GL-left-lid").visible  = true;
            ShortLowSides.getObjectByName("GL-right-lid").visible = true;
            GullwingModel.getObjectByName("GL-gw-left-lid").visible = true;
            GullwingModel.getObjectByName("GL-gw-right-lid").visible = true;
            GullwingModel.getObjectByName("gw-decimated-left-lid").visible = false;
            GullwingModel.getObjectByName("gw-decimated-right-lid").visible = false;
            console.log("1. Gladiator Case");
            if(LongFlatHatch.visible){
                LongFlatHatch.visible = false;
                ShortFlatHatch.visible = true;
            }
            else if(LongDomedHatch.visible){
                LongDomedHatch.visible = false;
                ShortDomedHatch.visible = true;
            }
            else if(longGladiatorDH.visible){
                longGladiatorDH.visible = false;
                shortGladiatorDH.visible = true;
            }
            else if(longGladiatorFH.visible){
                longGladiatorFH.visible = false;
                shortGladiatorFH.visible = true;
            }
            else{
                throw new Error("Unknown status of hatch?...");
            }
        }
        //If already added, replace gullwing meshes
        else{
            console.log("2. Gladiator Else case - Gullwing");
            ShortLowSides.getObjectByName("GL-left-lid").visible  = true;
            ShortLowSides.getObjectByName("GL-right-lid").visible = true;
            GullwingModel.getObjectByName("GL-gw-left-lid").visible = true;
            GullwingModel.getObjectByName("GL-gw-right-lid").visible = true;
            GullwingModel.getObjectByName("gw-decimated-left-lid").visible = false;
            GullwingModel.getObjectByName("gw-decimated-right-lid").visible = false;
            if(LongFlatHatch.visible){
                LongFlatHatch.visible = false;
                ShortFlatHatch.visible = true;
            }
            else if(LongDomedHatch.visible){
                LongDomedHatch.visible = false;
                ShortDomedHatch.visible = true;
            }
            else if(longGladiatorDH.visible){
                LongDomedHatch.visible = false;
                shortGladiatorDH.visible = true;
            }
            else if(longGladiatorFH.visible){
                longGladiatorFH.visible = false;
                shortGladiatorFH.visible = true;
            }
        }
    }

    else{
        console.log("3. Else case")
        ShortLowSides.getObjectByName("GL-left-lid").visible  = false;
        ShortLowSides.getObjectByName("GL-right-lid").visible = false;
        LongLowSides.getObjectByName("GL-ls-left-lid").visible = false;
        LongLowSides.getObjectByName("GL-ls-right-lid").visible = false;
        GullwingModel.getObjectByName("GL-gw-left-lid").visible = false;
        GullwingModel.getObjectByName("GL-gw-right-lid").visible = false;
        GullwingModel.getObjectByName("gw-decimated-left-lid").visible = true;
        GullwingModel.getObjectByName("gw-decimated-right-lid").visible = true;
        ShortLowSides.getObjectByName("standard-right-lid").visible = true;
        ShortLowSides.getObjectByName("standard-left-lid").visible = true;
        if(!GullwingModel.visible){
            GullwingModel.visible = true;
            ShortLowSides.visible = true;
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
    switch(GetLowSideCounter()){
        case 2:
            PupAccessories.getObjectByName("lowside-tray-2").position.x = -2.76635;
            break;
        case 3:
            PupAccessories.getObjectByName("lowside-tray-2").position.x = -2.76635;
            PupAccessories.getObjectByName("lowside-tray-3").position.x = -4.38547;
            break;
    }
}

function renderStandard(){

    clientPUP.Gullwing = false;
    ShortLowSides.visible = false;
    LongLowSides.visible = true;
    GullwingModel.visible = false;

    if(ShortFlatHatch.visible){
        LongFlatHatch.visible = true;
        ShortFlatHatch.visible = false;
        shortGladiatorFH.visible = false;
    }
    else if(ShortDomedHatch.visible){
        LongDomedHatch.visible = true;
        ShortDomedHatch.visible = false;
        shortGladiatorDH.visible = false;
    }
    else if(shortGladiatorFH.visible){
        shortGladiatorFH.visible = false;
        longGladiatorFH.visible = true;
    }
    else if(shortGladiatorDH.visible){
        shortGladiatorDH.visible = false;
        longGladiatorDH.visible = true;
    }
    else{

    }

    if(clientPUP.LidFinishes === "Gladiator"){
        LongLowSides.getObjectByName("standard-long-left-lid").visible = false;
        LongLowSides.getObjectByName("standard-long-right-lid").visible = false;
        LongLowSides.getObjectByName("GL-ls-left-lid").visible = true;
        LongLowSides.getObjectByName("GL-ls-right-lid").visible = true;
        console.log("Gladiator is true");
    }
    else{
        LongLowSides.getObjectByName("standard-long-left-lid").visible = true;
        LongLowSides.getObjectByName("standard-long-right-lid").visible = true;
        LongLowSides.getObjectByName("GL-ls-left-lid").visible = false;
        LongLowSides.getObjectByName("GL-ls-right-lid").visible = false;
        console.log("Gladiator is false");
    }
    switch(GetLowSideCounter()){
        case 2:
            PupAccessories.getObjectByName("lowside-tray-2").position.x = -1.71959;
            break;
        case 3:
            PupAccessories.getObjectByName("lowside-tray-2").position.x = -1.71959;
            PupAccessories.getObjectByName("lowside-tray-3").position.x = -3.41479;
            break;
    }
}

function renderDomedHatch(){

    clientPUP.Hatch = "Domed";
    //determine if PUP w/ Gullwing or PUP w/o Gullwing
    //render correct Hatch

    LongFlatHatch.visible = false;
    ShortFlatHatch.visible = false;
    LongDomedHatch.visible = false;
    ShortDomedHatch.visible = false;
    longGladiatorDH.visible = false;
    shortGladiatorDH.visible = false;
    longGladiatorFH.visible = false;
    shortGladiatorFH.visible = false;

    if(GullwingModel.visible){
        if(clientPUP.LidFinishes === "Gladiator"){
            shortGladiatorDH.visible = true;
        }
        else{
            ShortDomedHatch.visible = true;
        }
    }
    //If PUP w/o Gullwing
    else{
        if(clientPUP.LidFinishes === "Gladiator"){
            longGladiatorDH.visible = true;
        }
        else{

            LongDomedHatch.visible = true;
        }
    }
}

function renderFlatHatch(){
    clientPUP.Hatch = "Flat";
    //determine if PUP w/ Gullwing or PUP w/o Gullwing
    //render correct Hatch
    LongFlatHatch.visible = false;
    ShortFlatHatch.visible = false;
    LongDomedHatch.visible = false;
    ShortDomedHatch.visible = false;
    longGladiatorDH.visible = false;
    shortGladiatorDH.visible = false;
    longGladiatorFH.visible = false;
    shortGladiatorFH.visible = false;
    //If PUP w/Gullwing
    if(GullwingModel.visible){
        if(clientPUP.LidFinishes === "Gladiator"){
            shortGladiatorFH.visible = true;
        }
        else{
            ShortFlatHatch.visible = true;
        }
    }
    //If PUP w/o Gullwing
    else{
        if(clientPUP.LidFinishes === "Gladiator"){
            longGladiatorFH.visible = true;
        }
        else{
            LongFlatHatch.visible = true;
        }
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
    if(XT2000Truckslide.getObjectByName("truckslide-left-xt4000").visible === true){
        XT2000Truckslide.getObjectByName("truckslide-left-xt4000").visible = false;
        XT2000Truckslide.getObjectByName("truckslide-right-xt4000").visible = false;
        XT2000Truckslide.getObjectByName("4000-middle-taper").visible = false;
    }
    if(XT2000Truckslide.visible !== true){
        XTBase.visible = true;
        XT2000Truckslide.visible = true;
        XT1200Truckslide.visible = false;
    }
    XT2000Truckslide.getObjectByName("truckslide-left-xt2000").visible = true;
    XT2000Truckslide.getObjectByName("truckslide-right-xt2000").visible = true;
    XT2000Truckslide.getObjectByName("2000-middle-taper").visible = true;
}

function chooseXT4000(){
    if(XT2000Truckslide.visible !== true){
        XTBase.visible = true;
        XT2000Truckslide.visible = true;
        XT1200Truckslide.visible = false;
        XT2000Truckslide.getObjectByName("truckslide-left-xt2000").visible = false;
        XT2000Truckslide.getObjectByName("truckslide-right-xt2000").visible = false;
        XT2000Truckslide.getObjectByName("2000-middle-taper").visible = false;
        XT2000Truckslide.getObjectByName("truckslide-left-xt4000").visible = true;
        XT2000Truckslide.getObjectByName("truckslide-right-xt4000").visible = true;
        XT2000Truckslide.getObjectByName("4000-middle-taper").visible = true;
    }
    else{
        XT2000Truckslide.getObjectByName("truckslide-left-xt2000").visible = false;
        XT2000Truckslide.getObjectByName("truckslide-right-xt2000").visible = false;
        XT2000Truckslide.getObjectByName("2000-middle-taper").visible = false;
        XT2000Truckslide.getObjectByName("truckslide-left-xt4000").visible = true;
        XT2000Truckslide.getObjectByName("truckslide-right-xt4000").visible = true;
        XT2000Truckslide.getObjectByName("4000-middle-taper").visible = true;
    }
}

function openHatch(){

    if(!isHatchOpen){
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
        gsap.to(LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
        gsap.to(LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
        gsap.to(ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
        gsap.to(shortGladiatorFH.getObjectByName("short-hatch-gladiator").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
        gsap.to(longGladiatorFH.getObjectByName("gladiator-long-hatch").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
        gsap.to(longGladiatorDH.getObjectByName("gladiator-long-dome-hatch").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
        gsap.to(shortGladiatorDH.getObjectByName("gladiator-short-domed-hatch").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
        document.getElementById("open-hatch").innerText = "Close Hatch";
        isHatchOpen = true;
    }
    else{
        gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(shortGladiatorFH.getObjectByName("short-hatch-gladiator").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(longGladiatorFH.getObjectByName("gladiator-long-hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(longGladiatorDH.getObjectByName("gladiator-long-dome-hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
        gsap.to(shortGladiatorDH.getObjectByName("gladiator-short-domed-hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 0});
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
var isGullwingOpen = false;
function openGullwing(){
    if(!isGullwingOpen){
        gsap.to(GullwingModel.getObjectByName("GW-left-hinge").rotation, {duration: 2, x: 135 * (Math.PI / 180), ease:"expo"});
        isGullwingOpen = true;
    }
    else{
        gsap.to(GullwingModel.getObjectByName("GW-left-hinge").rotation, {duration: 2, x: 90 * (Math.PI / 180), ease:"expo"});
        isGullwingOpen = false;
    }
}

function switchToDiamondPlate(){
    var _accentColor = null;

    switch(clientPUP.LidFinishes){
        case "BlackDiamondPlate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "DiamondPlate":
            _accentColor = metalMat
            console.log("accent color is dp");
            break;
        case "Leopard":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Patriot":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Gladiator":
            _accentColor = blackMetalMat;
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
    clientPUP.LidFinishes = "DiamondPlate";

    switch(clientPUP.Hatch){
        case "Flat":
            renderFlatHatch();
            break;
        case "Domed":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing){
        case true:
            renderPro();
            break;
        case false:
            renderStandard();
            break;
    }
}

function switchToBlackDiamondPlate(){
    var _accentColor = null;

    switch(clientPUP.LidFinishes){
        case "BlackDiamondPlate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "DiamondPlate":
            _accentColor = metalMat
            console.log("accent color is dp");
            break;
        case "Leopard":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Patriot":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Gladiator":
            _accentColor = blackMetalMat;
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
    clientPUP.LidFinishes = "BlackDiamondPlate";

    switch(clientPUP.Hatch){
        case "Flat":
            renderFlatHatch();
            break;
        case "Domed":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing){
        case true:
            renderPro();
            break;
        case false:
            renderStandard();
            break;
    }
}

function switchToLeopard(){
    var _accentColor = null;

    switch(clientPUP.LidFinishes){
        case "BlackDiamondPlate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "DiamondPlate":
            _accentColor = metalMat
            console.log("accent color is dp");
            break;
        case "Leopard":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Patriot":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Gladiator":
            _accentColor = blackMetalMat;
            break;
        default:
            console.log("unknown accent color");
            break;
    }
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
        if(child.material === _accentColor){
            child.material = blackMetalMat;
        }
    });

    clientPUP.LidFinishes = "Leopard";

    switch(clientPUP.Hatch){
        case "Flat":
            renderFlatHatch();
            break;
        case "Domed":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing){
        case true:
            renderPro();
            break;
        case false:
            renderStandard();
            break;
    }
}

function switchToPatriot(){

    var _accentColor = null;

    switch(clientPUP.LidFinishes){
        case "BlackDiamondPlate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "DiamondPlate":
            _accentColor = metalMat
            console.log("accent color is dp");
            break;
        case "Leopard":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Patriot":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Gladiator":
            _accentColor = blackMetalMat;
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

    clientPUP.LidFinishes = "Patriot"

    switch(clientPUP.Hatch){
        case "Flat":
            renderFlatHatch();
            break;
        case "Domed":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing){
        case true:
            renderPro();
            break;
        case false:
            renderStandard();
            break;
    }
}

function switchToGladiator(){
    var _accentColor = null;

    switch(clientPUP.LidFinishes){
        case "BlackDiamondPlate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "DiamondPlate":
            _accentColor = metalMat
            console.log("accent color is dp");
            break;
        case "Leopard":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Patriot":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Gladiator":
            _accentColor = blackMetalMat;
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

    clientPUP.LidFinishes = "Gladiator"

    switch(clientPUP.Hatch){
        case "Flat":
            renderFlatHatch();
            break;
        case "Domed":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing){
        case true:
            renderPro();
            break;
        case false:
            renderStandard();
            break;
    }
}
function swapMeshes(){
    if(LidFinishes === "DiamondPlate" || clientPUP.LidFinishes === "Leopard" || clientPUP.LidFinishes === "BlackDiamondPlate"){
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
    else{
        console.log("Object is undefined");
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
    else{
        console.log("Object is undefined");
    }
}