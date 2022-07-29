import * as THREE from '/js/three.module.js';
import { GLTFLoader } from '/js/GLTFLoader.js';
import { OrbitControls } from '/js/OrbitControls.js';
import { DRACOLoader } from '/js/DRACOLoader.js';
import { EXRLoader } from '/js/EXRLoader.js';
import { FlakesTexture } from '/js/FlakesTexture.js'
import PickupPack from '/js/PickupPack.js'
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

let loader, fileLoader, scene, container, camera, renderer, controls, dracoLoader, pmremGenerator, clientPUP;

//#region INIT FILES
let basemesh, testmesh, windowMesh, truckBaseMesh, testMat, hingePoint, lidTest;
//All Models
var allModels, TruckModel, GullwingModel, HeadacheRackPost, HeadacheRackHex, LongLowSides, ShortLowSides,LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, PupAccessories, XTBase, XT1200Truckslide, XT2000Truckslide;
//Textures
var bdpBumpTexture, dpBumpTexture, patriotTexture, BK62BumpTexture, carPaintTexture, blankTexture, customMaterial;

var PUPtest = new PickupPack("Flat", false, "Hex", false, "Wired", false, 1, "BlackDiamondPlate", "1200");

console.log(PUPtest);

let cameraTracker;
const standardCameraAngle = new THREE.Vector3(-25.0, 7.0, -10.0);
var uniforms;

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
    cameraTracker.visible = true;

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
    controls = new OrbitControls(camera, renderer.domElement);

    controls.minDistance = 10;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxPolarAngle = 1.6;
    controls.maxDistance = 25;
    controls.maxAzimuthAngle = .5;
    controls.minAzimuthAngle = -3.5;
    controls.rotateSpeed = (container.offsetWidth / 8000);
    //controls.enabled = false;

    //Draco Loader
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    //  Model Loader

    addModelsToScene();

    //#region Basic PUP object implementation
    clientPUP = {
        Hatch: "Flat Center Hatch",
        Gullwing: false,
        HeadacheRack: "Hex",
        LadderRack: false,
        LEDdirectionalLighting: "None", //'battery', 'wired'
        AdditionalGullwingTray: false,
        AdditionalLowSideTray: "None", //1, 2
        LidFinishes: "BlackDiamondPlate", //BlackDiamondPlate, Leopard, Gladiator
        Truckslide: "1200",
    };
    //#endregion

    //functions
    document.getElementById('headacherack').addEventListener("mouseenter", function(){headacheRackHoverOn();});
    document.getElementById('headacherack').addEventListener("mouseleave", function(){headacheRackHoverOff()});
    document.getElementById('headacherack').addEventListener("click", function(){headacheRackSelect(); closeTruckslide()});
    document.getElementById('ladderrack').addEventListener("mouseenter", function(){ladderRackHoverOn()});
    document.getElementById('ladderrack').addEventListener("mouseleave", function(){ladderRackHoverOff()});
    document.getElementById('ladderrack').addEventListener("click", function(){ladderRackSelect()});
    // document.getElementById('hinge').addEventListener("click", function(){openLowSideLid()});
    document.getElementById('gullwing').addEventListener("click", function(){gullwingSelect(); closeTruckslide()});
    document.getElementById('pup-gullwing-radio').addEventListener("click", function(){renderPro(); refreshConfig("pup-toolbox-description", "Gullwing")});
    document.getElementById('pup-standard-radio').addEventListener("click", function(){renderStandard();refreshConfig("pup-toolbox-description", "Gullwing")});
    document.getElementById('hatch-nav').addEventListener("click", function(){hatchSelect(); closeTruckslide()});
    document.getElementById('domed-hatch-radio').addEventListener("click", function(){renderDomedHatch();refreshConfig("config-hatch-description", "Hatch");});
    document.getElementById('flat-hatch-radio').addEventListener("click", function(){renderFlatHatch();refreshConfig("config-hatch-description", "Hatch");});
    document.getElementById('post-headache-rack-radio').addEventListener("click", function(){switchToPostHeadacheRack();refreshConfig("config-headache-rack-description", "HeadacheRack");});
    document.getElementById('hex-headache-rack-radio').addEventListener("click", function(){switchToHexHeadacheRack();refreshConfig("config-headache-rack-description", "HeadacheRack");});
    // document.getElementById('ladder-rack').addEventListener("click", function(){showOrHideLadderRack()});
    // document.getElementById('add-ls-tray').addEventListener("click", function(){addLowSideTrays()});
    // document.getElementById('remove-ls-tray').addEventListener("click", function(){removeLowSideTrays()});
    // document.getElementById('open-tailgate').addEventListener("click", function(){openTailgate()});
    document.getElementById('lid-finishes').addEventListener("click", function(){finishSelect(); closeTruckslide()});
    document.getElementById('diamond-plate-radio').addEventListener("click", function(){switchToDiamondPlate();refreshConfig("config-finish-description", "LidFinishes")});
    document.getElementById('black-diamond-plate-radio').addEventListener("click", function(){switchToBlackDiamondPlate();refreshConfig("config-finish-description", "LidFinishes")});
    document.getElementById('leopard-radio').addEventListener("click", function(){switchToLeopard();refreshConfig("config-finish-description", "LidFinishes")});
    document.getElementById('gladiator-radio').addEventListener("click", function(){switchToGladiator();refreshConfig("config-finish-description", "LidFinishes")});
    // document.getElementById('open-gullwing').addEventListener("click", function(){openGullwing()});
    document.getElementById('truckslide').addEventListener("click", function(){truckslideSelect()});
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
    document.getElementById("back-btn-container").addEventListener("click", function(){hideSidebar()});
    document.getElementById("congif-back-btn-container").addEventListener("click", function(){hideConfigBar()});
    document.getElementById("shopping-cart").addEventListener("click", function(){showConfigBar()});

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
    controls.update();
        //Observe a scene or a renderer
        // if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
        //     __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
        //     __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
        //   }
}

function hideAllOpenElements(){
    const element = document.getElementsByClassName("options-group");
    var elementGroup;
    for(let i = 0; i < element.length; i++){
        // if(element[i].style["display"] !== "none"){
        //     return element[i];
        // }
        element[i].style["display"] = "none";
    }
}

//use this function to hide all elements and show relevant one.
function refreshUI(id){
    const element = document.getElementById(id);
    hideAllOpenElements();
    element.style.display = "flex";
}

function refreshConfig(id, section){
    const element = document.getElementById(id);
    element.innerText = clientPUP[section];
}

function showPage(){
    var loader = document.getElementById("loader");
    gsap.to(loader, {duration: 2, opacity: 0, ease:"expo.inOut", onComplete: hideLoader});
}

function hideSidebar(){
    const sidebar = document.getElementById("options-bar-container");
    gsap.to(sidebar, {duration: 1, left: -425, ease: "expo.inOut"});
}

function showConfigBar(){
    const configBar = document.getElementById("config-options-bar");
    gsap.to(configBar, {duration: 1, right: 0, ease:"expo.inOut"});
}

function hideConfigBar(){
    const configBar = document.getElementById("config-options-bar");
    gsap.to(configBar, {duration: 1, right: -425, ease: "expo.inOut"});
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

function showOptionsUI(idElement){
    var element = document.getElementById(idElement);
    element.style.display = "flex";
    gsap.to(element, {duration: 2.5, opacity: 100, ease:"expo.inOut"});
}


function hideOptionsUI(idElement){
    var element = document.querySelector(idElement);
    console.log(idElement);
    element.style.display = "flex";
    gsap.to(element, {duration: 2.5, opacity: 0, ease:"expo.inOut"});
}

function enableOrbitControls(){
    controls.enabled = true;
}

function createElement(postObject){

    for(let i = 0; i < postObject.length; i++){
        console.log(postObject[i]);
        var UIHeader = postObject[i].name;
        var UIDescription = postObject[i].description;
        const optionsElement = document.getElementById("options-bar1");
        const node = document.getElementById("option-1");
        document.getElementById("option-1").remove();
        var clonedElement = node.cloneNode(true);
        clonedElement.querySelector(".header").innerText = UIHeader;
        clonedElement.querySelector(".description").innerText = UIDescription;
        optionsElement.appendChild(clonedElement);
    }
}

function createNewElements(postObject){
    try{
        for(let i = 0; i < postObject.length; i++){
            const page = document.getElementById("options-bar1");

            var UIHeader = postObject[i].name;
            var UIDescription = postObject[i].description;

            //creating new elements for each object
            const topLevelWrapper = document.getElementById("options-bar1");
            const newWrapper = document.createElement("div");
            const newHeader = document.createElement("div");
            const newDescription = document.createElement("div");
            const newCheckBox = document.createElement("div");
            const newCheckBoxText = document.createElement("button");

            //replacing text
            newHeader.innerText = UIHeader;
            newDescription.innerText = UIDescription;
            newCheckBoxText.innerText = "+ add this item";

            //attaching classes
            newWrapper.classList.add("option");
            newHeader.classList.add("header");
            newDescription.classList.add("description");
            newCheckBox.classList.add("checkbox");
            newCheckBoxText.classList.add("checkbox-text");
            newCheckBoxText.setAttribute("id", UIHeader);

            //appending objects to DOM
            topLevelWrapper.appendChild(newWrapper);
            newWrapper.appendChild(newHeader);
            newWrapper.appendChild(newDescription);
            newWrapper.appendChild(newCheckBox);
            newCheckBox.appendChild(newCheckBoxText);
        }
    }
    catch{
        console.log("an error has occured...");
    }
}

function headacheRackHoverOn(){
    switch(clientPUP.HeadacheRack){
        case "Hex":
            ToHoloMaterial(HeadacheRackHex);
            break;
        case "Post":
            ToHoloMaterial(HeadacheRackPost);
            break;
    }
}
function headacheRackHoverOff(){
    switch(clientPUP.HeadacheRack){
        case "Hex":
            toNormalMaterial(HeadacheRackHex);
            break;
        case "Post":
            toNormalMaterial(HeadacheRackPost);
            break;
    }
}

function headacheRackSelect(){

    refreshUI("headache-rack-section");

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //Grabbing elements.
    const hexRadio = document.getElementById("hex-headache-rack-radio");
    const hexText = document.getElementById("hex-radio-text");
    const postRadio = document.getElementById("post-headache-rack-radio");
    const postText = document.getElementById("post-radio-text");

    //Check which option is selected already.
    switch(clientPUP.HeadacheRack){
        case "Hex":
            hexRadio.checked = true;
            postRadio.checked = false;
            hexText.innerText = "Option is selected";
            postText.innerText = "Select this option";
            break;
        case "Post":
            hexRadio.checked = false;
            postRadio.checked = true;
            postText.innerText = "Option is selected";
            hexText.innerText = "Select this option";
            break
    }

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    //
    //TODO: implement function that dynamically grabs objects and inserts info.
    //createNewElements(HeadacheRackPostObjects); <-- Current solution
    controls.enabled = false;
    gsap.to(camera.position, {duration: 2, x: -4, y: 4, z: 0, ease:"expo", onComplete: enableOrbitControls});
    gsap.to(cameraTracker.position, {duration: 2, x: 5, y: 2, ease:"expo"});
    //showOptionsUI("headache-racks");
    controls.target = cameraTracker.position;
    controls.minDistance = 6;
    controls.maxDistance = 20;

}


function hatchSelect(){

    refreshUI("hatch-section");
    refreshConfig("config-hatch-description", "Hatch");

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //Grabbing elements.
    const flatHatchRadio = document.getElementById("flat-hatch-radio");
    const flatHatchText = document.getElementById("flat-hatch-radio-text");
    const domedHatchRadio = document.getElementById("domed-hatch-radio");
    const domedHatchText = document.getElementById("domed-hatch-radio-text");

    //Check which option is selected already.

    switch(clientPUP.Hatch){
        case "Flat Center Hatch":
            flatHatchRadio.checked = true;
            domedHatchRadio.checked = false;
            flatHatchText.innerText = "Option is selected";
            domedHatchText.innerText = "Select this option";
            break;
        case "Domed Center Hatch":
            flatHatchRadio.checked = false;
            domedHatchRadio.checked = true;
            flatHatchText.innerText = "Option is selected";
            domedHatchText.innerText = "Select this option";
            break;
    }

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    //TODO: implement function that dynamically grabs objects and inserts info.
    //createNewElements(HeadacheRackPostObjects); <-- Current solution

    controls.enabled = false;
    gsap.to(camera.position, {duration: 2, x: standardCameraAngle.x, y: standardCameraAngle.y, z: standardCameraAngle.z, ease:"expo", onComplete: enableOrbitControls});
    gsap.to(cameraTracker.position, {duration: 2, x: 0, y: -1, ease:"expo", onComplete: changeTargetDistance});
    controls.target = cameraTracker.position;

    console.log(camera.position);
}

function changeTargetDistance(){
    controls.minDistance = 10;
    controls.maxDistance = 30;
}

function gullwingSelect(){

    refreshUI("gullwing-section");
    refreshConfig("config-hatch-description", "Hatch");

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //Grabbing elements.
    const standardRadio = document.getElementById("pup-standard-radio");
    const standardText = document.getElementById("pup-standard-text");
    const gullwingRadio = document.getElementById("pup-gullwing-radio");
    const gullwingText = document.getElementById("pup-gullwing-text");

    //Check which option is selected already.

    switch(clientPUP.Gullwing){
        case false:
            standardRadio.checked = true;
            gullwingRadio.checked = false;
            standardText.innerText = "Option is selected";
            gullwingText.innerText = "Select this option";
            break;
        case true:
            standardRadio.checked = false;
            gullwingRadio.checked = true;
            gullwingText.innerText = "Option is selected";
            standardText.innerText = "Select this option";
            break;
    }

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    //TODO: implement function that dynamically grabs objects and inserts info.
    //createNewElements(HeadacheRackPostObjects); <-- Current solution

    controls.enabled = false;
    gsap.to(camera.position, {duration: 2, x: -4, y: 3, z: -5, ease:"expo", onComplete: enableOrbitControls});
    gsap.to(cameraTracker.position, {duration: 2, x: 5, y: 0, ease:"expo"});
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.target = cameraTracker.position;

    console.log(camera.position);
}

function finishSelect(){

    refreshUI("finish-section");
    refreshConfig("config-hatch-description", "LidFinishes");

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //Grabbing elements.
    const diamondPlateRadio = document.getElementById("diamond-plate-radio");
    const diamondPlateText = document.getElementById("diamond-plate-radio-text");
    const blackDiamondPlateRadio = document.getElementById("black-diamond-plate-radio");
    const blackDiamondPlateText = document.getElementById("black-diamond-plate-radio-text");
    const leopardRadio = document.getElementById("leopard-radio");
    const leopardText = document.getElementById("leopard-radio-text");
    const gladiatorRadio = document.getElementById("gladiator-radio");
    const gladiatorText = document.getElementById("gladiator-radio-text");

    //Check which option is selected already.

    switch(clientPUP.LidFinishes){
        case "DiamondPlate":
            diamondPlateRadio.checked = true;
            blackDiamondPlateRadio.checked = false;
            leopardRadio.checked = false;
            gladiatorRadio.checked = false;
            diamondPlateText.innerText = "Option is selected";
            blackDiamondPlateText.innerText = "Select this option";
            leopardText.innerText = "Select this option";
            gladiatorText.innerText = "Select this option";
            break;
        case "BlackDiamondPlate":
            diamondPlateRadio.checked = false;
            blackDiamondPlateRadio.checked = true;
            leopardRadio.checked = false;
            gladiatorRadio.checked = false;
            diamondPlateText.innerText = "Select this option";
            blackDiamondPlateText.innerText = "Option is selected";
            leopardText.innerText = "Select this option";
            gladiatorText.innerText = "Select this option";
            break;
        case "Leopard":
            diamondPlateRadio.checked = false;
            blackDiamondPlateRadio.checked = false;
            leopardRadio.checked = true;
            gladiatorRadio.checked = false;
            diamondPlateText.innerText = "Select this option";
            blackDiamondPlateText.innerText = "Select this option";
            leopardText.innerText = "Option is selected";
            gladiatorText.innerText = "Select this option";
            break;
        case "Gladiator":
            diamondPlateRadio.checked = false;
            blackDiamondPlateRadio.checked = false;
            leopardRadio.checked = false;
            gladiatorRadio.checked = true;
            diamondPlateText.innerText = "Select this option";
            blackDiamondPlateText.innerText = "Select this option";
            leopardText.innerText = "Select this option";
            gladiatorText.innerText = "Option is selected";
            break;
    }

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    //TODO: implement function that dynamically grabs objects and inserts info.
    //createNewElements(HeadacheRackPostObjects); <-- Current solution

    controls.enabled = false;
    gsap.to(camera.position, {duration: 2, x: standardCameraAngle.x, y: standardCameraAngle.y, z: standardCameraAngle.z, ease:"expo", onComplete: enableOrbitControls});
    gsap.to(cameraTracker.position, {duration: 2, x: 0, y:-1, ease:"expo"});
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.target = cameraTracker.position;

    console.log(camera.position);
}

function truckslideSelect(){

    refreshUI("truckslide-section");
    refreshConfig("config-hatch-description", "Truckslide");

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //Grabbing elements.
    const noTruckslideRadio = document.getElementById("no-truckslide-radio");
    const noTruckslideText = document.getElementById("no-truckslide-radio-text");
    const twelveTruckslideRadio = document.getElementById("1200-truckslide-radio");
    const twelveTruckslideText = document.getElementById("1200-truckslide-radio-text");
    const twoTruckslideRadio = document.getElementById("2000-truckslide-radio");
    const twoTruckslideText = document.getElementById("2000-truckslide-radio-text");
    const fourTruckslideRadio = document.getElementById("4000-truckslide-radio");
    const fourTruckslideText = document.getElementById("4000-truckslide-radio-text");

    //Check which option is selected already.

    switch(clientPUP.Truckslide){
        case "None":
            noTruckslideRadio.checked = true;
            twelveTruckslideRadio.checked  = false;
            twoTruckslideRadio.checked = false;
            fourTruckslideRadio.checked = false;
            //radio text
            noTruckslideText.innerText = "This option is selected";
            twelveTruckslideText.innerText = "Select this option";
            twoTruckslideText.innerText = "Select this option";
            fourTruckslideText.innerText = "Select this option";
            break;
        case "1200":
            noTruckslideRadio.checked = false;
            twelveTruckslideRadio.checked = true;
            twoTruckslideRadio.checked = false;
            fourTruckslideRadio.checked = false;
            //radio text
            noTruckslideText.innerText = "Select this option";
            twelveTruckslideText.innerText = "This option is selected";
            twoTruckslideText.innerText = "Select this option";
            fourTruckslideText.innerText = "Select this option";
            break;
        case "2000":
            noTruckslideRadio.radio = false;
            twelveTruckslideRadio.checked = false;
            twoTruckslideRadio.checked = true;
            fourTruckslideRadio.checked = false;
            //radio text
            noTruckslideText.innerText = "Select this option";
            twelveTruckslideText.innerText = "Select this option";
            twoTruckslideText.innerText = "This option is selected";
            fourTruckslideText.innerText = "Select this option";
            break;
        case "4000":
            noTruckslideRadio.checked = false;
            twelveTruckslideRadio.checked = false;
            twoTruckslideRadio.checked = false;
            fourTruckslideRadio.checked = true;
            //radio text
            noTruckslideText.innerText = "Select this option";
            twelveTruckslideText.innerText = "Select this option";
            twoTruckslideText.innerText = "Select this option";
            fourTruckslideText.innerText = "This option is selected";
            break;
    }

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    //TODO: implement function that dynamically grabs objects and inserts info.
    //createNewElements(HeadacheRackPostObjects); <-- Current solution
    presentTruckslide();
    controls.enabled = false;
    gsap.to(camera.position, {duration: 2, x: standardCameraAngle.x, y: standardCameraAngle.y, z: standardCameraAngle.z, ease:"expo", onComplete: enableOrbitControls});
    gsap.to(cameraTracker.position, {duration: 2, x: -5, y: -1, ease:"expo"});
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.target = cameraTracker.position;

    console.log(camera.position);
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

    //shows page after entire model is loaded and rendered.
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

    clientPUP.Hatch = "Domed Center Hatch";
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
    clientPUP.Hatch = "Flat Center Hatch";
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
    const hexText = document.getElementById("hex-radio-text");
    const postText = document.getElementById("post-radio-text");

    postText.innerText = "Option is selected";
    hexText.innerText = "Select this option";

    HeadacheRackPost.visible = true;
    HeadacheRackHex.visible = false;


    //Switching options for consistency
    clientPUP.HeadacheRack = "Post";
}

function switchToHexHeadacheRack(){
    const hexText = document.getElementById("hex-radio-text");
    const postText = document.getElementById("post-radio-text");

    postText.innerText = "Select this option";
    hexText.innerText = "Option is selected";

    HeadacheRackHex.visible = true;
    HeadacheRackPost.visible = false;

    //Switching options for consistency
    clientPUP.HeadacheRack = "Hex";
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
        //document.getElementById("open-hatch").innerText = "Close Hatch";
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
        //document.getElementById("open-hatch").innerText = "Open Hatch";
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
        //document.getElementById('open-truckslide').innerText = "Close Truckslide";
        isTruckslideOpen = true;
    }
    else if(isTruckslideOpen && isTailgateOpen){
        gsap.to(XTBase.getObjectByName("truckslide_movingBase").position, {duration: 2, x: -4.65, ease:"expo"});
        gsap.to(XT1200Truckslide.getObjectByName("Truckslide_XT1200").position, {duration: 2, x: -4.65, ease:"expo"});
        gsap.to(XT2000Truckslide.getObjectByName("Truckslide_XT2000").position, {duration: 2, x: -4.65, ease:"expo"});
        //document.getElementById('open-truckslide').innerText = "Open Truckslide";
        isTruckslideOpen = false;
    }
}

function presentTruckslide(){
    //open hatch
    gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
    gsap.to(LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
    gsap.to(LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
    gsap.to(ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
    gsap.to(shortGladiatorFH.getObjectByName("short-hatch-gladiator").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
    gsap.to(longGladiatorFH.getObjectByName("gladiator-long-hatch").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
    gsap.to(longGladiatorDH.getObjectByName("gladiator-long-dome-hatch").rotation, {duration: 2, y: 2 * Math.PI * (-10 / 360), ease:"expo"});
    gsap.to(shortGladiatorDH.getObjectByName("gladiator-short-domed-hatch").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"});
    //open tailgate
    gsap.to(TruckModel.getObjectByName("tailgate").rotation, {duration: 2, x: 2 * Math.PI * (-90 / 360), ease:"expo", delay: .5});
    //open truckslide
    gsap.to(XTBase.getObjectByName("truckslide_movingBase").position, {duration: 2, x: -11, ease:"expo", delay: 1});
    gsap.to(XT2000Truckslide.getObjectByName("Truckslide_XT2000").position, {duration: 2, x: -11, ease:"expo", delay: 1});
    gsap.to(XT1200Truckslide.getObjectByName("Truckslide_XT1200").position, {duration: 2, x: -11, ease:"expo", delay: 1});
}
function closeTruckslide(){
    //close in reverse order

    //close truckslide first
    gsap.to(XTBase.getObjectByName("truckslide_movingBase").position, {duration: 2, x: -4.65, ease:"expo"});
    gsap.to(XT1200Truckslide.getObjectByName("Truckslide_XT1200").position, {duration: 2, x: -4.65, ease:"expo"});
    gsap.to(XT2000Truckslide.getObjectByName("Truckslide_XT2000").position, {duration: 2, x: -4.65, ease:"expo"});

    gsap.to(TruckModel.getObjectByName("tailgate").rotation, {duration: 2, x: 2 * Math.PI * (0 / 360), ease:"expo", delay: .5});

    gsap.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 1});
    gsap.to(LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 1});
    gsap.to(LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 1});
    gsap.to(ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 1});
    gsap.to(shortGladiatorFH.getObjectByName("short-hatch-gladiator").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 1});
    gsap.to(longGladiatorFH.getObjectByName("gladiator-long-hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 1});
    gsap.to(longGladiatorDH.getObjectByName("gladiator-long-dome-hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 1});
    gsap.to(shortGladiatorDH.getObjectByName("gladiator-short-domed-hatch").rotation, {duration: 2, y: 2 * Math.PI * (0 / 360), ease:"expo", delay: 1});
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
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
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
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
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
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
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
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
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
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
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

    if(x !== undefined && x.children > 1){
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
        console.log("Object is undefined or has no children");
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