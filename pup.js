import * as THREE from '/js/three.module.js';
import { GLTFLoader } from '/js/GLTFLoader.js';
import { OrbitControls } from '/js/OrbitControls.js';
import { DRACOLoader } from '/js/DRACOLoader.js'
import { EXRLoader } from '/js/EXRLoader.js'

init();

function init(){

    //Scene setup
    const loader = new GLTFLoader();
    const fileLoader = new THREE.FileLoader();
    const scene = new THREE.Scene();
    const container = document.getElementById('myCanvas');
    var camera = new THREE.PerspectiveCamera( 35, container.offsetWidth / container.offsetHeight, 0.1, 1000 );
    camera.aspect = container.offsetWidth / container.offsetHeight;
    // camera.position.z = -1.5;
    // camera.position.y = .5;
    // camera.position.x = -1;

    const renderer = new THREE.WebGLRenderer({canvas: container, antialias: true, alpha: false});
    renderer.localClippingEnabled = true;

    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.outputEncoding = THREE.sRGBEncoding;

    //initialize objects
    var basemesh;
    var windowMesh;
    let testmesh;
    let vertexShaderData;

    //Loader Function
    async function loadWebObjects(url) {
        try{
            await fileLoader.load(
                // resource URL
                url,

                // onLoad callback
                function ( data ) {
                    // output the text to the console
                    console.log("data loaded successfully");
                    console.log(data);
                    return data;
                },

                // onProgress callback
                function ( xhr ) {
                    //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                },

                // onError callback
                function ( err ) {
                    console.error( err );
                    return null;
                }
            );
            //loader.load('shader.frag',function ( data ) {fShader =  data;},);
        }
        catch {
            console.log(error);
            return null;
        }
        return null;
    };


    //load textures

    //var lidColorTexture = new THREE.TextureLoader().load('./textures/lid-color.jpg', texture => {texture.flipY = false;});

        //Materials
    var metalMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0,
    });
    var windowMat = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        transparent: true,
        roughness: 0,
        transmission: .65,
        opacity: .5,
    });

async function loadCustomMat(){
    const testMat = await new THREE.ShaderMaterial({
        uniforms: {

            u_Time: { value: 1.0 },
            resolution: { value: new THREE.Vector2()}
        },
        vertexShader: loadWebObjects('shaders/vert.glsl'),
        fragmentShader: loadWebObjects('shaders/frag.glsl')

    });
    return testMat;
}

    //Lights
    const light = new THREE.PointLight( 0xFFFFFF, 5, 100 );

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new EXRLoader()
    .load( 'hdrs/gothic_manor_01_1k.exr', function ( texture ) {

        var exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        var exrBackground = exrCubeRenderTarget.texture;
        var newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;

        scene.environment = exrCubeRenderTarget.texture;

        texture.dispose();
        pmremGenerator.dispose();
    } );


    //Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    //controls.maxDistance = 3.5;
    controls.minDistance = 1.5;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxPolarAngle = 1.6;

    //Draco Loader
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/')
    loader.setDRACOLoader(dracoLoader)

    //  Model Loader
    loader.load(
        // resource URL
        'models/decimate-all.glb',
        // called when the resource is loaded
        function ( gltf ) {

            basemesh = gltf.scene;
            testmesh = gltf.scene.getObjectByName('hatch');
            testmesh.material = loadCustomMat();
            scene.add(basemesh);
            //windowMesh.material = windowMat;
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

    //Animate
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
    animate();

    //#region Basic PUP object implementation
    var clientPUP = {
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

    function applyHatch(hatchSelection){

        clientPUP.Hatch = hatchSelection;
        console.log("Hatch is selected");
        testmesh.visible = !testmesh.visible;
        renderPup(clientPUP);

    }

    function renderPup(pupObject){

        //switch cases with dependencies go here
        console.log("PUP rendered successfully")

    }
    //Math function to convert angle to Radian
    //radian = 2 * Math.PI * (p_angle / 360);
}