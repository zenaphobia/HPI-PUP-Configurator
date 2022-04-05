// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
// import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js'
// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
// import { EXRLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/EXRLoader.js'
// import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/DRACOLoader.js'
// import { Water } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/objects/Water.js';
// import { Sky } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/objects/Sky.js';
import * as THREE from '/js/three.module.js';
import { GLTFLoader } from '/js/GLTFLoader.js';
import { OrbitControls } from '/js/OrbitControls.js';
import { DRACOLoader } from '/js/DRACOLoader.js'
import { Water } from '/js/Water.js';
import { Sky } from '/js/Sky.js';

init();

function init(){

    //Scene setup
    const loader = new GLTFLoader();
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
    var base;
    var windowMesh;
    let water;
    var sun = new THREE.Vector3();
    let mixer;
    let Clock;

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
    //Lights
    const light = new THREE.PointLight( 0xFFFFFF, 5, 100 );


    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    //pmremGenerator.compileEquirectangularShader();

    // new EXRLoader()
    // .load( 'hdrs/gothic_manor_01_1k.exr', function ( texture ) {

    //     var exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
    //     var exrBackground = exrCubeRenderTarget.texture;
    //     var newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;

    //     scene.environment = exrCubeRenderTarget.texture;

    //     texture.dispose();
    //     pmremGenerator.dispose();
    // } );


    //Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    //controls.maxDistance = 3.5;
    controls.minDistance = 1.5;
    controls.enablePan = false;
    controls.enableDamping = true;
    //controls.maxPolarAngle = 1.6;

    //Draco Loader
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/')
    loader.setDRACOLoader(dracoLoader)

    //  Model Loader
    loader.load(
        // resource URL
        'models/stripped-model3.glb',
        // called when the resource is loaded
        function ( gltf ) {

            //texture changes

            //windowMesh = gltf.scene.getObjectByName('Window');
            base = gltf.scene;
            windowMesh = base.getObjectByName('Window');
            base.scale.set(.045,.045,.045);
            //Animations
            mixer = new THREE.AnimationMixer(base);
            const clips = gltf.animations;
            const floatClip = THREE.AnimationClip.findByName(clips, 'Tower_Top_Shell_Top_DC_ShellAction.001');
            const action = mixer.clipAction(floatClip);

            action.play();

            scene.add(base);
            windowMesh.material = windowMat;
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

        //water
        const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

        water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( '/textures/waternormals.jpg', function ( texture ) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                } ),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: scene.fog !== undefined
            }
        );
        water.rotation.x = - Math.PI / 2;
        water.material.uniforms[ 'size' ].value = 50;

        water.rotation.x = - Math.PI / 2;
        scene.add( water );

                        // Skybox

                        const sky = new Sky();
                        sky.scale.setScalar( 10000 );
                        scene.add( sky );

                        const skyUniforms = sky.material.uniforms;

                        skyUniforms[ 'turbidity' ].value = 10;
                        skyUniforms[ 'rayleigh' ].value = 2;
                        skyUniforms[ 'mieCoefficient' ].value = 0.005;
                        skyUniforms[ 'mieDirectionalG' ].value = 0.8;

                        const parameters = {
                            elevation: .04,
                            azimuth: 125
                        };


                    function updateSun() {

                        const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
                        const theta = THREE.MathUtils.degToRad( parameters.azimuth );

                        sun.setFromSphericalCoords( 1, phi, theta );

                        sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
                        water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

                        scene.environment = pmremGenerator.fromScene( sky ).texture;

                    }

                    updateSun();

    Clock = new THREE.Clock();
    //Animate
    function animate() {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
        controls.update();
        if(mixer)
            mixer.update(Clock.getDelta());
        water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
        //console.log(container.offsetWidth);
        //console.log(controls.getPolarAngle());
            //Observe a scene or a renderer
            if (typeof __THREE_DEVTOOLS__ !== 'undefined') {
                __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }));
                __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: renderer }));
              }
    }
    animate();

    //functions

    //document.getElementById('open-door').addEventListener("click", function(){openDoorAnim()})


    //Window resizing

    window.addEventListener( 'resize', onWindowResize );

    function onWindowResize(){

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.offsetWidth , container.offsetHeight );
    console.log(container.offsetWidth + ', ' + container.offsetHeight);

}

    //Math function to convert angle to Radian
    //radian = 2 * Math.PI * (p_angle / 360);
}