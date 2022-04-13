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
let basemesh, testmesh, windowMesh, truckBaseMesh, testMat;
var vertexData = vert;
var fragData = frag;
//materials
let metalMat, windowMat, redGlassMat,truckPaintMat, clearGlassMat;
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
    // camera.position.z = -1.5;
    // camera.position.y = .5;
    // camera.position.x = -1;

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

    //var lidColorTexture = new THREE.TextureLoader().load('./textures/lid-color.jpg', texture => {texture.flipY = false;});

        //Materials
    metalMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0,
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
    //controls.maxDistance = 3.5;
    controls.minDistance = 1.5;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxPolarAngle = 1.6;
    controls.rotateSpeed = (container.offsetWidth / 2560);

    //Draco Loader
    dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/')
    loader.setDRACOLoader(dracoLoader)

    //  Model Loader
    loader.load(
        // resource URL
        'models/test-mat.glb',
        // called when the resource is loaded
        function ( gltf ) {

            basemesh = gltf.scene;
            testmesh = gltf.scene.getObjectByName('hatch');

            //Traverse method to change materials
            gltf.scene.traverse(function(child){
                if(child.material && child.material.name === 'windowglass.001'){
                    child.material = windowMat;
                }
                if(child.material && child.material.name === 'redglass.001'){
                    child.material = redGlassMat;
                }
                if(child.material){
                    allMaterials.add(child.material);
                }
            });
            console.log(allMaterials);
            scene.add(basemesh);
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' + error );
        }
    );

    //#region Basic PUP object implementation
    clientPUP = {
        Hatch: 'flat',
        Gullwing: true,
        HeadacheRack: 'none',
        LadderRack: true,
        LEDLighting: 'none', //'battery', 'wired'
        AdditionalGullwingTray: false,
        AdditionalLowSideTray: 'none',
        LidFinshes: 'Diamond Plate',
        TruckSlide: '1200',
    };

    //example of one render switch case, there will be one for every option in renderPUP();
    switch(clientPUP.Hatch){
        case 'flat':
            console.log('flat hatch is selected');
            break;
        case 'domed':
            console.log('domed hatch is selected');
            break;
        default:
        console.log('invalid selection');
    }
    //#endregion

    //functions
    document.getElementById('change-texture').addEventListener("click", function(){applyHatch('domed')})


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
    switch(clientPUP.Hatch){
        case 'flat':
            console.log('flat hatch is selected');
            break;
        case 'domed':
            console.log('domed hatch is selected');
            break;
        default:
        console.log('invalid selection');
    }
    console.log("PUP rendered successfully")

}