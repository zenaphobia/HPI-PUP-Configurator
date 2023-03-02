import * as THREE from '/js/three.module.js';
import { GLTFLoader } from '/js/GLTFLoader.js';
import { OrbitControls } from '/js/OrbitControls.js';
import { DRACOLoader } from '/js/DRACOLoader.js';
import { EXRLoader } from '/js/EXRLoader.js';
import { FlakesTexture } from '/js/FlakesTexture.js'
import { PickupPack } from '/js/PickupPack.js';
//import HeadacheRack from '/js/headacheRack.js';
//import { UnrealBloomPass } from '/js/UnrealBloomPass.js';
//import { EffectComposer } from '/js/EffectComposer.js';
//import { RenderPass } from '/js/RenderPass.js';
//import { ShaderPass } from './shaders/ShaderPass.js'
//import { SAOPass } from '/js/SAOPass.js';
//import { GUI } from '/js/lil-gui.module.min.js'
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

let loader, fileLoader, scene, container, camera, renderer, controls, dracoLoader, pmremGenerator;

//#region INIT FILES
let basemesh, testmesh, windowMesh, truckBaseMesh, testMat, hingePoint, lidTest, testLight, spotLightHelper;
//All Models
var allModels, TruckModel, GullwingModel, HeadacheRackPost, HeadacheRackHex, LongLowSides, ShortLowSides,LongFlatHatch, ShortFlatHatch, LongDomedHatch, ShortDomedHatch, shortGladiatorFH, longGladiatorFH, shortGladiatorDH, longGladiatorDH, PupAccessories, XTBase, XT1200Truckslide, XT2000Truckslide;
//Textures
var bdpBumpTexture, dpBumpTexture, patriotTexture, BK62BumpTexture, carPaintTexture, blankTexture, customMaterial, emissionMap;

var clientPUP = new PickupPack("Flat Center Hatch", false, "Hex Headache Rack", false, false, false, 0, "Black Diamond Plate", "1200");
console.log(clientPUP);
//console.log(clientPUP.AdditionalLowsideTray);
console.log(clientPUP.LowsideTrayCount);

let cameraTracker, lightTracker;
const standardCameraAngle = new THREE.Vector3(-25.0, 7.0, -10.0);
var uniforms;
const clock = new THREE.Clock();

let composer, renderPass, SaoPass;

var isHatchOpen = false;
var isTailgateOpen = false;
var isTruckslideOpen = false;


//#endregion

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
    camera = new THREE.PerspectiveCamera( 25, container.offsetWidth / container.offsetHeight, 0.1, 100 );
    camera.aspect = (container.offsetWidth / container.offsetHeight);
    camera.position.set(standardCameraAngle.x, standardCameraAngle.y, standardCameraAngle.z);
    renderer = new THREE.WebGLRenderer({canvas: container, antialias: true, alpha: true});
    renderer.setClearColor( 0xffffff, 1 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1; //If you enable sao, turn to 2
    renderer.outputEncoding = THREE.sRGBEncoding;
    //renderer.physicallyCorrectdirectionalLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // const bloomParams = {
    //     exposure: 1,
    //     bloomStrength: 1.5,
    //     bloomThreshold: 0,
    //     bloomRadius: 0
    // }


    // const renderscene = new RenderPass(scene, camera);

    // const bloomPass = new UnrealBloomPass( new THREE.Vector2( container.offsetWidth, container.offsetHeight ), 1.5, 0.4, 0.85);
    // bloomPass.threshold = 0;
    // bloomPass.strength = 1.5;
    // bloomPass.radius = 0;

    // bloomComposer = new EffectComposer(renderer);
    // bloomComposer.renderToScreen = false;
    // bloomComposer.addPass(renderscene);
    // bloomComposer.addPass(bloomPass);

    // const finalPass = new ShaderPass(
    //         new THREE.ShaderMaterial({
    //             uniforms: {
    //                 baseTexture: {value: null},
    //                 bloomTexture: {value: bloomComposer.renderTarget2.texture}
    //             },
    //             vertexShader: bloomVert,
    //             fragmentShader: bloomFrag,
    //             defines: {}
    //         }), 'baseTexture'
    // );

    // finalPass.needsSwap = true;

    // finalComposer = new EffectComposer(renderer);
    // finalComposer.addPass(renderscene);
    // finalComposer.addPass(finalPass);
    // // composer = new EffectComposer(renderer);
    // // composer.addPass(renderscene);
    // // composer.addPass(bloomPass);

    // const gui = new GUI();


    // gui.add( bloomParams, 'exposure', 0.1, 2 ).onChange( function ( value ) {

    //     renderer.toneMappingExposure = Math.pow( value, 4.0 );

    // } );

    // gui.add( bloomParams, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

    //     bloomPass.threshold = Number( value );

    // } );

    // gui.add( bloomParams, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

    //     bloomPass.strength = Number( value );

    // } );

    // gui.add( bloomParams, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

    //     bloomPass.radius = Number( value );

    // } );

    //const renderScene = new RenderPass(scene, camera);

    // SaoPass = new SAOPass(scene, camera, false, true);

    // SaoPass.params.saoBias = 1;
    // SaoPass.params.saoIntensity = .041;
    // SaoPass.params.saoScale = .9;
    // SaoPass.params.saoKernalRadius = 10;
    // SaoPass.params.saoMinResolution = .004;
    // SaoPass.params.output = 0;
    // SaoPass.params.saoBlur = true;
    // SaoPass.params.saoBlurRadius = 15.6;
    // SaoPass.params.saoBlurStdDev = 8.5215;
    // SaoPass.params.saoBlurDepthCutoff = .0078;
    // SaoPass.resolution.set(8192,8192);

    // const gui = new GUI();
    // gui.add( SaoPass.params, 'output', {
    //     'Beauty': SAOPass.OUTPUT.Beauty,
    //     'Beauty+SAO': SAOPass.OUTPUT.Default,
    //     'SAO': SAOPass.OUTPUT.SAO,
    //     'Depth': SAOPass.OUTPUT.Depth,
    //     'Normal': SAOPass.OUTPUT.Normal
    // } ).onChange( function ( value ) {

    //     SaoPass.params.output = parseInt( value );

    // } );
    // gui.add( SaoPass.params, 'saoBias', - 1, 1 );
    // gui.add( SaoPass.params, 'saoIntensity', 0, 1 );
    // gui.add( SaoPass.params, 'saoScale', 0, 10 );
    // gui.add( SaoPass.params, 'saoKernelRadius', 1, 100 );
    // gui.add( SaoPass.params, 'saoMinResolution', 0, 1 );
    // gui.add( SaoPass.params, 'saoBlur' );
    // gui.add( SaoPass.params, 'saoBlurRadius', 0, 200 );
    // gui.add( SaoPass.params, 'saoBlurStdDev', 0.5, 150 );
    // gui.add( SaoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1 );


    // composer.addPass(SaoPass);

    // console.log(SaoPass);

    //load textures

    bdpBumpTexture = new THREE.TextureLoader().load('textures/bdp-final.jpg', texture => {texture.flipY = false});
    dpBumpTexture = new THREE.TextureLoader().load('textures/dp-pattern-final.jpg', texture => {texture.flipY = false});
    patriotTexture = new THREE.TextureLoader().load('textures/star-bump.jpg', texture => {texture.flipY = false});
    BK62BumpTexture = new THREE.TextureLoader().load('textures/BK62-bump.jpg', texture => {texture.flipY = false});
    emissionMap = new THREE.TextureLoader().load('textures/emissionMap.png', texture => {texture.flipY = false});
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
        // emissive: 0xffffff,
        // emissiveMap: emissionMap,
        // emissiveIntensity: 5,
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
        emissiveIntensity: 0,
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

    //Lights

    //Primitive Lighting tracker
    lightTracker = new THREE.Mesh(geometry, blankTexture);
    lightTracker.position.y = -1;
    lightTracker.visible = false;
    scene.add(lightTracker);

    testLight = new THREE.SpotLight(0xffffff, 0, 125, 1.04, 1, 2, 1);
    testLight.position.set(-1.25,1,-2.65)

    testLight.castShadow = true;
    testLight.target = lightTracker;

    //spotLightHelper = new THREE.SpotLightHelper(testLight, 0xffae88);

    scene.add(testLight);
    //scene.add(spotLightHelper);

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
    controls.maxDistance = 50;
    controls.maxAzimuthAngle = .5;
    controls.minAzimuthAngle = -3.5;
    controls.rotateSpeed = (container.offsetWidth / 8000);
    //controls.enabled = false;

    //Draco Loader
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./js/draco/');
    loader.setDRACOLoader(dracoLoader);

    //  Model Loader
    addModelsToScene();

    //functions
    //document.getElementById('headacherack').addEventListener("mouseenter", function(){headacheRackHoverOn();});
    //document.getElementById('headacherack').addEventListener("mouseleave", function(){headacheRackHoverOff()});
    document.getElementById('headacherack').addEventListener("click", function(){headacheRackSelect()});
    //document.getElementById('ladderrack').addEventListener("mouseenter", function(){ladderRackHoverOn()});
    //document.getElementById('ladderrack').addEventListener("mouseleave", function(){ladderRackHoverOff()});
    document.getElementById('ladderrack').addEventListener("click", function(){ladderRackSelect()});
    // document.getElementById('hinge').addEventListener("click", function(){openLowSideLid()});
    document.getElementById('gullwing').addEventListener("click", function(){gullwingSelect()});
    document.getElementById('pup-gullwing-radio').addEventListener("click", function(){renderPro(); refreshConfig("config-toolbox-description", "Gullwing")});
    document.getElementById('pup-standard-radio').addEventListener("click", function(){renderStandard();refreshConfig("config-toolbox-description", "Gullwing")});
    document.getElementById('hatch-nav').addEventListener("click", function(){hatchSelect();});
    document.getElementById('domed-hatch-radio').addEventListener("click", function(){renderDomedHatch();refreshConfig("config-hatch-description", "Hatch");});
    document.getElementById('flat-hatch-radio').addEventListener("click", function(){renderFlatHatch();refreshConfig("config-hatch-description", "Hatch");});
    document.getElementById('post-headache-rack-radio').addEventListener("click", function(){switchToPostHeadacheRack();refreshConfig("config-headache-rack-description", "HeadacheRack");});
    document.getElementById('hex-headache-rack-radio').addEventListener("click", function(){switchToHexHeadacheRack();refreshConfig("config-headache-rack-description", "HeadacheRack");});
    document.getElementById('no-ladder-rack-radio').addEventListener("click", function(){hideLadderRack();refreshConfig("config-ladder-rack-description", "LadderRack");});
    document.getElementById('ladder-rack-radio').addEventListener("click", function(){renderLadderRack();refreshConfig("config-ladder-rack-description", "LadderRack");});
    document.getElementById('additional-trays').addEventListener("click", function(){additionalTraysSelect()});
    document.getElementById('lowside-tray-0-radio').addEventListener("click", function(){renderLowSideTrays()});
    document.getElementById('lowside-tray-1-radio').addEventListener("click", function(){renderLowSideTrays()});
    document.getElementById('lowside-tray-2-radio').addEventListener("click", function(){renderLowSideTrays()});
    document.getElementById('gullwing-1-radio').addEventListener("click", function(){renderGullwingTray()});
    document.getElementById('gullwing-2-radio').addEventListener("click", function(){renderGullwingTray()});
    // document.getElementById('add-ls-tray').addEventListener("click", function(){addLowSideTrays()});
    // document.getElementById('remove-ls-tray').addEventListener("click", function(){removeLowSideTrays()});
    // document.getElementById('open-tailgate').addEventListener("click", function(){openTailgate()});
    document.getElementById('additional-lights').addEventListener("click", function(){additionalLightsSelect()});
    document.getElementById('LED-lights-radio').addEventListener("click", function(){renderLights()});
    document.getElementById('no-LED-lights-radio').addEventListener("click", function(){disableLights()});
    document.getElementById('lid-finishes').addEventListener("click", function(){finishSelect()});
    document.getElementById('diamond-plate-radio').addEventListener("click", function(){switchToDiamondPlate();refreshConfig("config-finish-description", "Finish")});
    document.getElementById('black-diamond-plate-radio').addEventListener("click", function(){switchToBlackDiamondPlate();refreshConfig("config-finish-description", "Finish")});
    document.getElementById('leopard-radio').addEventListener("click", function(){switchToLeopard();refreshConfig("config-finish-description", "Finish")});
    document.getElementById('gladiator-radio').addEventListener("click", function(){switchToGladiator();refreshConfig("config-finish-description", "Finish")});
    // document.getElementById('open-gullwing').addEventListener("click", function(){openGullwing()});
    document.getElementById('truckslide').addEventListener("click", function(){truckslideSelect()});
    document.getElementById('no-truckslide-radio').addEventListener("click", function(){hideTruckslide();refreshConfig("config-truckslide-description", "Truckslide")});
    document.getElementById('1200-truckslide-radio').addEventListener("click", function(){chooseXT1200();refreshConfig("config-truckslide-description", "Truckslide")});
    document.getElementById('2000-truckslide-radio').addEventListener("click", function(){chooseXT2000();refreshConfig("config-truckslide-description", "Truckslide")});
    document.getElementById('4000-truckslide-radio').addEventListener("click", function(){chooseXT4000();refreshConfig("config-truckslide-description", "Truckslide")});
    // document.getElementById('open-hatch').addEventListener("click", function(){openHatch()});
    // document.getElementById('open-truckslide').addEventListener("click", function(){openTruckslide()});
    // document.getElementById('hide-truckslide').addEventListener("click", function(){hideTruckslide()});
    document.getElementById('red-btn').addEventListener("click", function(){truckPaintMat.color.set(0x570000);truckPaintMat.sheenColor.set(0x2b0000); });
    document.getElementById('blue-btn').addEventListener("click", function(){truckPaintMat.color.set(0x001340); truckPaintMat.sheenColor.set(0x000000); });
    document.getElementById('grey-btn').addEventListener("click", function(){truckPaintMat.color.set(0x1f1f1f); truckPaintMat.sheenColor.set(0xffffff);});
    document.getElementById('black-btn').addEventListener("click", function(){truckPaintMat.color.set(0x050505); truckPaintMat.sheenColor.set(0xffffff);});
    document.getElementById('white-btn').addEventListener("click", function(){truckPaintMat.color.set(0xf0f0f0)});
    document.getElementById("back-btn-container").addEventListener("click", function(){hideSidebar()});
    document.getElementById("congif-back-btn-container").addEventListener("click", function(){hideConfigBar()});
    document.getElementById("shopping-cart").addEventListener("click", function(){showConfigBar(); refreshAllConfig()});

    // document.addEventListener('keydown', (e) => {
    //     if(e.code === "Space"){
    //         startAnimation();
    //     }
    // });

    //Window resizing
    window.addEventListener( 'resize', onWindowResize );
    function onWindowResize(){
    camera.aspect = (container.offsetWidth / container.offsetHeight);
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
    //spotLightHelper.update()
    //console.log(camera.position);
    //composer.render();
    controls.update();
        // //Observe a scene or a renderer
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

function refreshAllConfig(){
    refreshConfig("config-headache-rack-description", "HeadacheRack");
    refreshConfig("config-hatch-description", "Hatch");
    refreshConfig("config-toolbox-description", "Gullwing");
    refreshConfig("config-finish-description", "Finish");
    refreshConfig("config-truckslide-description", "Truckslide");
}

function refreshConfig(id, section){
    const element = document.getElementById(id);
    element.innerText = clientPUP[section].name;
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
            switch(clientPUP.Finish.name){
                case "Black Diamond Plate":
                    child.material = blackMetalMat;
                    console.log("accent color is bdp");
                    break;
                case "Diamond Plate":
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
            switch(clientPUP.Finish.name){
                case "Black Diamond Plate":
                    child.material = bdpMaterial;
                    console.log("accent color is bdp");
                    break;
                case "Diamond Plate":
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
    switch(clientPUP.HeadacheRack.name){
        case "Hex Headache Rack":
            ToHoloMaterial(HeadacheRackHex);
            break;
        case "Post Headache Rack":
            ToHoloMaterial(HeadacheRackPost);
            break;
    }
}
function headacheRackHoverOff(){
    switch(clientPUP.HeadacheRack.name){
        case "Hex Headache Rack":
            toNormalMaterial(HeadacheRackHex);
            break;
        case "Post Headache Rack":
            toNormalMaterial(HeadacheRackPost);
            break;
    }
}

function headacheRackSelect(){

    refreshUI("headache-rack-section");
    refreshConfig("config-headache-rack-description", "HeadacheRack");

    //close other compartments
    closeAllCompartments();
    resetGlobalLight();

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //Grabbing elements.
    const hexText = document.getElementById("hex-radio-text");
    const postText = document.getElementById("post-radio-text");

    //Check which option is selected already.
    switch(clientPUP.HeadacheRack.name){
        case "Hex Headache Rack":
            hexText.innerText = "Option is selected";
            postText.innerText = "Select this option";
            break;
        case "Post Headache Rack":
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
    gsap.to(cameraTracker.position, {duration: 2, x: 5, y: 2, z: 0, ease:"expo", onComplete: changeTargetDistance(6,20)});
    controls.target = cameraTracker.position;
    // controls.minDistance = 6;
    // controls.maxDistance = 20;

}


function hatchSelect(){

    refreshUI("hatch-section");
    refreshConfig("config-hatch-description", "Hatch");
    resetGlobalLight();

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //close other compartments
    closeAllCompartments();

    //Grabbing elements.
    const flatHatchText = document.getElementById("flat-hatch-radio-text");
    const domedHatchText = document.getElementById("domed-hatch-radio-text");

    //Check which option is selected already.

    switch(clientPUP.Hatch.name){
        case "Flat Center Hatch":
            flatHatchText.innerText = "Option is selected";
            domedHatchText.innerText = "Select this option";
            break;
        case "Domed Center Hatch":
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
    gsap.to(cameraTracker.position, {duration: 2, x: 0, y: -1, z: 0, ease:"expo", onComplete: changeTargetDistance(10,30)});
    controls.target = cameraTracker.position;

    console.log(camera.position);
}

function changeTargetDistance(number1, number2){
    controls.minDistance = number1;
    controls.maxDistance = number2;
}

function gullwingSelect(){

    refreshUI("gullwing-section");
    refreshConfig("config-toolbox-description", "Gullwing");

    //close other compartments
    closeAllCompartments();
    resetGlobalLight();

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //Grabbing elements.
    const standardText = document.getElementById("pup-standard-text");
    const gullwingText = document.getElementById("pup-gullwing-text");

    //Check which option is selected already.

    switch(clientPUP.Gullwing.name){
        case "Standard":
            standardText.innerText = "Option is selected";
            gullwingText.innerText = "Select this option";
            break;
        case "Gullwing Toolbox":
            gullwingText.innerText = "Option is selected";
            standardText.innerText = "Select this option";
            break;
    }

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    //TODO: implement function that dynamically grabs objects and inserts info.
    //createNewElements(HeadacheRackPostObjects); <-- Current solution

    controls.enabled = false;
    gsap.to(camera.position, {duration: 2, x: -7.665, y: 5.15, z: -7, ease:"expo", onComplete: enableOrbitControls});
    gsap.to(cameraTracker.position, {duration: 2, x: 5, y: 0, z:0, ease:"expo"});
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.target = cameraTracker.position;

    console.log(camera.position);
}

function finishSelect(){

    refreshUI("finish-section");
    refreshConfig("config-finish-description", "Finish");

    //close other compartments
    closeAllCompartments();
    resetGlobalLight();

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //Grabbing elements.
    const diamondPlateText = document.getElementById("diamond-plate-radio-text");
    const blackDiamondPlateText = document.getElementById("black-diamond-plate-radio-text");
    const leopardText = document.getElementById("leopard-radio-text");
    const gladiatorText = document.getElementById("gladiator-radio-text");

    //Check which option is selected already.

    switch(clientPUP.Finish.name){
        case "Diamond Plate":
            diamondPlateText.innerText = "Option is selected";
            blackDiamondPlateText.innerText = "Select this option";
            leopardText.innerText = "Select this option";
            gladiatorText.innerText = "Select this option";
            break;
        case "Black Diamond Plate":
            diamondPlateText.innerText = "Select this option";
            blackDiamondPlateText.innerText = "Option is selected";
            leopardText.innerText = "Select this option";
            gladiatorText.innerText = "Select this option";
            break;
        case "Leopard":
            diamondPlateText.innerText = "Select this option";
            blackDiamondPlateText.innerText = "Select this option";
            leopardText.innerText = "Option is selected";
            gladiatorText.innerText = "Select this option";
            break;
        case "Gladiator":
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
    gsap.to(cameraTracker.position, {duration: 2, x: 0, y:-1, z:0, ease:"expo"});
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.target = cameraTracker.position;

    console.log(camera.position);
}

function truckslideSelect(){

    refreshUI("truckslide-section");
    refreshConfig("config-truckslide-description", "Truckslide");

    //close other compartments
    closeGullwing();
    closeLowSideLid();
    resetGlobalLight();

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    //TODO: implement function that dynamically grabs objects and inserts info.
    //createNewElements(HeadacheRackPostObjects); <-- Current solution
    presentTruckslide();
    controls.enabled = false;
    gsap.to(camera.position, {duration: 2, x: standardCameraAngle.x, y: standardCameraAngle.y, z: standardCameraAngle.z, ease:"expo", onComplete: enableOrbitControls});
    gsap.to(cameraTracker.position, {duration: 2, x: -5, y: -1, Z:0, ease:"expo"});
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
    if(clientPUP.LadderRack.enabled === true){
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

    refreshUI("ladder-rack-section");
    refreshConfig("config-ladder-rack-description", "LadderRack");

    //close other compartments
    closeAllCompartments();
    resetGlobalLight();

    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    controls.enabled = false;
    gsap.to(camera.position, {duration: 2, x: -25, y: 8, z: 0, ease:"expo", onComplete: enableOrbitControls});
    gsap.to(cameraTracker.position, {duration: 2, x: -5, y: 0, z: 0, ease:"expo"});

    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.target = cameraTracker.position;

}

function additionalTraysSelect(){

    refreshUI("additional-trays-section");
    refreshConfig("config-ladder-rack-description", "LadderRack");
    const gullwingtrayid1 = document.getElementById("gullwing-1-radio");
    const gullwingtrayid2 = document.getElementById("gullwing-2-radio");
    const gullwingDescription = document.getElementById("config-gw-trays-count-id");

    //close other compartments
    closeTruckslide();
    resetGlobalLight();


    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    //if Gullwing isn't selected, disable option to add tray
    if(!clientPUP.Gullwing.enabled){
        gullwingtrayid1.disabled = true;
        gullwingtrayid2.disabled = true;
        gullwingDescription.innerText = 0;
        gullwingtrayid1.checked = true;
    }
    else{
        gullwingtrayid1.disabled = false;
        gullwingtrayid2.disabled = false;
    }

    controls.enabled = false;

    //dtermine if PUP Pro or Standard
    if(clientPUP.Gullwing.enabled === true){
        gsap.to(camera.position, {duration: 2, x: -8, y: 5, z: -10, ease:"expo", onComplete: enableOrbitControls});
        gsap.to(cameraTracker.position, {duration: 2, x: -1.25, y: 0, z:-3, ease:"expo"});
    }
    else{
        gsap.to(camera.position, {duration: 2, x: -5, y: 5, z: -10, ease:"expo", onComplete: enableOrbitControls});
        gsap.to(cameraTracker.position, {duration: 2, x: 0, y: 0, z: -3, ease:"expo"});
    }

    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.target = cameraTracker.position;

    openLowSideLid();
    openGullwing();

}

function additionalLightsSelect(){
    refreshUI("additional-lights-section");
    refreshConfig("config-LED-light-description", "LED");

    //close other compartments
    closeTruckslide();


    //grabbing main element
    const sidebar = document.getElementById("options-bar-container");

    //show sidebar
    gsap.to(sidebar, {duration: 1, left:0, ease:"expo.inOut"});

    controls.enabled = false;


    if(clientPUP.Gullwing.enabled === true){
        gsap.to(camera.position, {duration: 2, x: -8, y: 5, z: -10, ease:"expo", onComplete: enableOrbitControls});
        gsap.to(cameraTracker.position, {duration: 2, x: -1.25, y: 0, z:-3, ease:"expo"});
        gsap.to(lightTracker.position, {duration: 2, x: -1.25, y: 0, z:-3, ease:"expo"});
        testLight.position.set(-1.25 , 1 , -2.25);
    }
    else{
        gsap.to(camera.position, {duration: 2, x: -5, y: 5, z: -10, ease:"expo", onComplete: enableOrbitControls});
        gsap.to(cameraTracker.position, {duration: 2, x: 0, y: 0, z: -3, ease:"expo"});
        gsap.to(lightTracker.position, {duration: 2, x: 0, y: 0, z: -3, ease:"expo"});
        testLight.position.set(0 , 1 , -2.25);
    }

    if(clientPUP.LED.enabled){
        gsap.to(testLight, {duration: 2, intensity: 10000, ease:"expo"});
    }

    gsap.to(emissiveLight, {duration: 2, emissiveIntensity: 10000000, ease:"expo"});
    gsap.to(renderer, {duration: 2, toneMappingExposure: .15, ease:"expo"});

    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.target = cameraTracker.position;

    openLowSideLid();
}

THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

    const loaderText = document.getElementById("percent-loaded");
    const loaderBar = document.getElementById("bar-length");

    loaderText.innerText = parseInt(100 * (itemsLoaded / itemsTotal)) + '%';
    loaderBar.style.width = 100 * (itemsLoaded / itemsTotal) + '%';

    console.log(100 * (itemsLoaded / itemsTotal)) + '%';

};

THREE.DefaultLoadingManager.onLoad = function(){
    showPage();
}


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
        loader.loadAsync('models/seperate-models/ShortDomedHatch.gltf'),
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
    //console.log("model data set up");
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
    GullwingModel.getObjectByName("GL-gw-left-lid").material = blackMetalMat;
    GullwingModel.getObjectByName("GL-gw-right-lid").material = blackMetalMat;
    ShortLowSides.getObjectByName("standard-left-lid").material = bdpMaterial;
    ShortLowSides.getObjectByName("standard-right-lid").material = bdpMaterial;
    LongLowSides.getObjectByName("standard-long-left-lid").material = bdpMaterial;
    LongLowSides.getObjectByName("standard-long-right-lid").material = bdpMaterial;
    LongFlatHatch.getObjectByName("Shape_IndexedFaceSet622").material = bdpMaterial;
    ShortDomedHatch.getObjectByName("Shape_IndexedFaceSet028").material = bdpMaterial;
    LongDomedHatch.getObjectByName("Shape_IndexedFaceSet012").material = bdpMaterial;
    ShortLowSides.getObjectByName("Shape_IndexedFaceSet118").material = emissiveLight;
    LongLowSides.getObjectByName("Shape_IndexedFaceSet095").material = emissiveLight;

    //ShortLowSides.getObjectByName("Shape_IndexedFaceSet221").material = metalMat;


    //ShortLowSides.getObjectByName("Icosphere").attach(HeadacheRackHex.getObjectByName("Curve006"));

    //hide models
    HeadacheRackPost.visible = false;
    GullwingModel.visible = false;
    GullwingModel.getObjectByName("GL-gw-left-lid").visible = false;
    GullwingModel.getObjectByName("GL-gw-right-lid").visible = false;
    GullwingModel.getObjectByName("additional-gw-tray").visible = false;
    ShortLowSides.getObjectByName("GL-left-lid").visible = false;
    ShortLowSides.getObjectByName("GL-right-lid").visible = false;
    ShortLowSides.getObjectByName("GL-right-lid").visible = false;
    ShortLowSides.getObjectByName("Shape_IndexedFaceSet118").visible = false
    LongLowSides.getObjectByName("GL-ls-left-lid").visible = false;
    LongLowSides.getObjectByName("GL-ls-right-lid").visible = false;
    LongLowSides.getObjectByName("Shape_IndexedFaceSet095").visible = false;
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
}

function openLowSideLid(){
    // if(!lidOpen){
    //     gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" });
    //     gsap.to(LongLowSides.getObjectByName('long-ls-left-hinge').rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" });
    //     lidOpen = true;
    // }
    // else{
    //     gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (90 / 360), ease:"expo" });
    //     gsap.to(LongLowSides.getObjectByName('long-ls-left-hinge').rotation, {duration: 2, x: 2 * Math.PI * (90 / 360), ease:"expo" });
    //     lidOpen = false;
    // }

    gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" });
    gsap.to(LongLowSides.getObjectByName('long-ls-left-hinge').rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" });
}

function closeLowSideLid(){
    gsap.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (90 / 360), ease:"expo" });
    gsap.to(LongLowSides.getObjectByName('long-ls-left-hinge').rotation, {duration: 2, x: 2 * Math.PI * (90 / 360), ease:"expo" });
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

function determineLowSideCount(){
    if(document.getElementById("lowside-tray-0-radio").checked){
        console.log("case 0");
        return 0;
    }
    else if(document.getElementById("lowside-tray-1-radio").checked){
        console.log("case 1");
        return 1;
    }
    else if(document.getElementById("lowside-tray-2-radio").checked){
        console.log("case 2");
        return 2;
    }
    return 0;
}

function closeAllCompartments(){
    closeLowSideLid();
    closeGullwing();
    closeTruckslide();
}

function renderLights(){
    const LEDid = document.getElementById("config-LED-light-description");
    clientPUP.setLED = 'Wired';

    LEDid.innerText = clientPUP.LED.name;

    gsap.to(testLight, {duration: 1, intensity: 10000, ease:"expo"});
    gsap.to(emissiveLight, {duration: 2, emissiveIntensity: 10000000, ease:"expo"});

    ShortLowSides.getObjectByName("Shape_IndexedFaceSet118").visible = true;
    LongLowSides.getObjectByName("Shape_IndexedFaceSet095").visible = true;
}

function disableLights(){
    const LEDid = document.getElementById("config-LED-light-description");
    clientPUP.setLED = false;

    LEDid.innerText = clientPUP.LED.name;

    testLight.intensity = 0;

    ShortLowSides.getObjectByName("Shape_IndexedFaceSet118").visible = false;
    LongLowSides.getObjectByName("Shape_IndexedFaceSet095").visible = false;
}

function resetGlobalLight(){
    gsap.to(renderer, {duration: 2, toneMappingExposure: 1, ease:"expo"});
    gsap.to(testLight, {duration: .015, intensity: 0, ease:"expo"});
}

function renderGullwingTray(){
    const gullwingid = document.getElementById("config-gw-trays-count-id");
    const loc = GullwingModel.getObjectByName("additional-gw-tray").position;

    if(document.getElementById("gullwing-1-radio").checked){
        GullwingModel.getObjectByName("additional-gw-tray").visible = false;
        gullwingid.innerText = 0;
    }
    else{
        GullwingModel.getObjectByName("additional-gw-tray").visible = true;
        gullwingid.innerText = 1;
    }

    gsap.to(cameraTracker.position, {duration: 2, x: loc.x, y: loc.y, z:loc.z, ease:"expo"});
    gsap.to(camera.position, {duration: 2, x: 3.25, y: 4, z: -12, ease:"expo"});
    controls.target = cameraTracker.position;

}

function renderLowSideTrays(){
    const lowsideCountid = document.getElementById("config-lowside-trays-count");
    openLowSideLid();
    switch(determineLowSideCount()){
        case 0:
            PupAccessories.getObjectByName("lowside-tray-2").visible = false;
            PupAccessories.getObjectByName("lowside-tray-3").visible = false;
            clientPUP.setAdditionalLowsideTray = 0;
            lowsideCountid.innerText = clientPUP.LowsideTrayCount;
            switch(clientPUP.Gullwing.enabled){
                case true:
                    PupAccessories.getObjectByName("lowside-tray-2").position.x = -2.76635;
                    break;
                case false:
                    PupAccessories.getObjectByName("lowside-tray-2").position.x = -1.71959;
                    break;
            }
        break;
        case 1:
            PupAccessories.getObjectByName("lowside-tray-2").visible = true;
            PupAccessories.getObjectByName("lowside-tray-3").visible = false;
            clientPUP.setAdditionalLowsideTray = 1;
            lowsideCountid.innerText = clientPUP.LowsideTrayCount;
            switch(clientPUP.Gullwing.enabled){
                case true:
                    PupAccessories.getObjectByName("lowside-tray-2").position.x = -2.76635;
                    break;
                case false:
                    PupAccessories.getObjectByName("lowside-tray-2").position.x = -1.71959;
                    break;
            }
        break;
        case 2:
            PupAccessories.getObjectByName("lowside-tray-2").visible = true;
            PupAccessories.getObjectByName("lowside-tray-3").visible = true;
            clientPUP.setAdditionalLowsideTray = 2;
            lowsideCountid.innerText = clientPUP.LowsideTrayCount;
                switch(clientPUP.Gullwing.enabled){
                    case true:
                        PupAccessories.getObjectByName("lowside-tray-2").position.x = -2.76635;
                        PupAccessories.getObjectByName("lowside-tray-3").position.x = -4.38547;
                        break;
                    case false:
                        PupAccessories.getObjectByName("lowside-tray-2").position.x = -1.71959;
                        PupAccessories.getObjectByName("lowside-tray-3").position.x = -3.41479;
                        break;
                }
        break;
    }

    if(clientPUP.Gullwing.enabled === true){
        gsap.to(camera.position, {duration: 2, x: -8, y: 5, z: -10, ease:"expo", onComplete: enableOrbitControls});
        gsap.to(cameraTracker.position, {duration: 2, x: -1.25, y: 0, z:-3, ease:"expo"});
    }
    else{
        gsap.to(camera.position, {duration: 2, x: -5, y: 5, z: -10, ease:"expo", onComplete: enableOrbitControls});
        gsap.to(cameraTracker.position, {duration: 2, x: 0, y: 0, z:-3, ease:"expo"});
    }

    controls.target = cameraTracker.position;

}

function renderLadderRack(){
    clientPUP.setLadderRack = true;
    PupAccessories.getObjectByName("ladder-rack").visible = true;
}

function hideLadderRack(){
    clientPUP.setLadderRack = false;
    PupAccessories.getObjectByName("ladder-rack").visible = false;
}

function renderPro(){

    clientPUP.setGullwing = true;
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
    if(clientPUP.Finish.name === "Gladiator"){

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

    clientPUP.setGullwing = false;
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

    if(clientPUP.Finish.name === "Gladiator"){
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

    clientPUP.setHatch = "Domed Center Hatch";
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
        if(clientPUP.Finish.name === "Gladiator"){
            shortGladiatorDH.visible = true;
        }
        else{
            ShortDomedHatch.visible = true;
        }
    }
    //If PUP w/o Gullwing
    else{
        if(clientPUP.Finish.name === "Gladiator"){
            longGladiatorDH.visible = true;
        }
        else{

            LongDomedHatch.visible = true;
        }
    }
}

function renderFlatHatch(){
    clientPUP.setHatch = "Flat Center Hatch";
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
        if(clientPUP.Finish.name === "Gladiator"){
            shortGladiatorFH.visible = true;
        }
        else{
            ShortFlatHatch.visible = true;
        }
    }
    //If PUP w/o Gullwing
    else{
        if(clientPUP.Finish.name === "Gladiator"){
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
    clientPUP.setHeadacheRack = "Post Headache Rack";
}

function switchToHexHeadacheRack(){
    const hexText = document.getElementById("hex-radio-text");
    const postText = document.getElementById("post-radio-text");

    postText.innerText = "Select this option";
    hexText.innerText = "Option is selected";

    HeadacheRackHex.visible = true;
    HeadacheRackPost.visible = false;

    //Switching options for consistency
    clientPUP.setHeadacheRack = "Hex Headache Rack";
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
    clientPUP.setTruckslide = "1200";
    if(XT1200Truckslide.visible !== true){
        XTBase.visible = true;
        XT2000Truckslide.visible = false;
        XT1200Truckslide.visible = true;
    }
}

function chooseXT2000(){
    clientPUP.setTruckslide = "2000";
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
    clientPUP.setTruckslide = "4000";
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
    clientPUP.setTruckslide = false;
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


function openGullwing(){

    gsap.to(GullwingModel.getObjectByName("GW-left-hinge").rotation, {duration: 2, x: 135 * (Math.PI / 180), ease:"expo"});
    // if(!isGullwingOpen){
    //     gsap.to(GullwingModel.getObjectByName("GW-left-hinge").rotation, {duration: 2, x: 135 * (Math.PI / 180), ease:"expo"});
    //     isGullwingOpen = true;
    // }
    // else{
    //     gsap.to(GullwingModel.getObjectByName("GW-left-hinge").rotation, {duration: 2, x: 90 * (Math.PI / 180), ease:"expo"});
    //     isGullwingOpen = false;
    // }
}

function closeGullwing(){
    gsap.to(GullwingModel.getObjectByName("GW-left-hinge").rotation, {duration: 2, x: 90 * (Math.PI / 180), ease:"expo"});
}

function switchToDiamondPlate(){
    var _accentColor = null;

    switch(clientPUP.Finish.name){
        case "Black Diamond Plate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Diamond Plate":
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
    clientPUP.setFinish = "Diamond Plate";

    switch(clientPUP.Hatch.name){
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing.enabled){
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

    switch(clientPUP.Finish.name){
        case "Black Diamond Plate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Diamond Plate":
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
    clientPUP.setFinish = "Black Diamond Plate";

    switch(clientPUP.Hatch.name){
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing.enabled){
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

    switch(clientPUP.Finish.name){
        case "Black Diamond Plate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Diamond Plate":
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

    clientPUP.setFinish = "Leopard";

    switch(clientPUP.Hatch.name){
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing.enabled){
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

    switch(clientPUP.Finish.name){
        case "Black Diamond Plate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Diamond Plate":
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

    clientPUP.setFinish = "Patriot";

    switch(clientPUP.Finish.name){
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing.enabled){
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

    switch(clientPUP.Finish.name){
        case "Black Diamond Plate":
            _accentColor = blackMetalMat;
            console.log("accent color is bdp");
            break;
        case "Diamond Plate":
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

    clientPUP.setFinish = "Gladiator";

    switch(clientPUP.Hatch.name){
        case "Flat Center Hatch":
            renderFlatHatch();
            break;
        case "Domed Center Hatch":
            renderDomedHatch();
            break;
        default:
            throw new Error("Unknown Hatch type");
    }
    switch(clientPUP.Gullwing.enabled){
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

//animation -- remmeber to delete:
// function startAnimation(){
//     const camStart = new THREE.Vector3(-30.5, -1.29, 23.78);
//     //const camEnd = new THREE.Vector3(-18.792, 6.661, -15.08);

//     camera.position.x = camStart.x;
//     camera.position.y = camStart.y;
//     camera.position.z = camStart.z;
//     //start x -19.65, y: - 0.729, z: 15.43
//     //end  x: -18.792, y: 6.661, z: -15.08
//     var timeline = gsap.timeline();
//     timeline.to(camera.position, {x: -30.662, y: 13.51, z: -23.345, ease:"power2.inOut", duration: 5, delay: 1});
//     gsap.to(cameraTracker.position, {duration: 2, x: 0, y: 0, Z:0, ease:"sine.inOut", duration: 4}, "<2");
//     timeline.to(GullwingModel.getObjectByName("GW-left-hinge").rotation, {duration: 2, x: 135 * (Math.PI / 180), ease:"expo"},"< 2");
//     timeline.to(hingePoint.rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" }, "< 1");
//     timeline.to(LongLowSides.getObjectByName('long-ls-left-hinge').rotation, {duration: 2, x: 2 * Math.PI * (160 / 360), ease:"expo" },"<");
//     timeline.to(ShortFlatHatch.getObjectByName("Decimated_Hatch").rotation, {duration: 2, y: 2 * Math.PI * (-15 / 360), ease:"expo"},"< .5");
//     timeline.to(TruckModel.getObjectByName("tailgate").rotation, {duration: 2, x: 2 * Math.PI * (-90 / 360), ease:"expo", delay: 0},"<.5");
//     timeline.to(XTBase.getObjectByName("truckslide_movingBase").position, {duration: 2, x: -11, ease:"expo", delay: 0}, "<.5");
//     timeline.to(XT1200Truckslide.getObjectByName("Truckslide_XT1200").position, {duration: 2, x: -11, ease:"expo", delay: 0}, "<");
// }


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