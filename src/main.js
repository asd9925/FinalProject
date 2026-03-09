import './style.css'
import * as THREE from 'three'
//call helper function
import {addDefaultMeshes, addStandardMeshes} from './addDefaultMeshes'
import { addLight } from './addLight';
import Model from './model'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { environment } from './environment'
import { addTrack } from './addTrack'
// import { manager } from './manager'
import gsap from 'gsap'
// import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { gsapText } from './gsapText'
//referencing scene in THREE library (anything with THREE prefix is refering something in the THREE library)
//THREE.Scene

//calling three library with our own variable scene
const scene = new THREE.Scene();

//FOV, ASPECT RATIO, NEAR, FAR
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//antialias makes rendering smoother, less pixels, just turn on by default
const renderer = new THREE.WebGLRenderer({ antialias: true});

//incase i want three.js 3d text instead of image
//apparently would need a point light to cast shadows
renderer.shadowMap.enabled = true

//set up over, now add things to scene
//meshes means something 3d btw
const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color: 0xff0000});
// const mesh = new THREE.Mesh(geometry, material);

//make it so you can move, pan, go all around screen
const controls = new OrbitControls(camera,renderer.domElement)

// //call function
// const mesh = addDefaultMeshes();
// //now add mesh to scene (pass thing you're adding in argument)
// //won't add things to scene manually
// scene.add(mesh);

//global function, curly brackets means object (currently empty)
//container for meshes
const meshes = {}

//container for lights
const lights = {}

const mixers = []

//current position (0-1) along the track
let scrollProgress = 0
//target position to smooth towards
let targetProgress = 0
//current scroll speed
let scrollVelocity = 0
//reduces velocity over time (must be < 1)
const friction = 0.95
//how quickly scroll affects velocity
const acceleration = 0.000007
//maximum scroll speed
const maxVelocity = 0.5

const clock = new THREE.Clock()


// const loader = new FontLoader();
// const font = await loader.loadAsync( 'fonts/helvetiker_regular.typeface.json' );
// const geometry2 = new TextGeometry( 'Hello three.js!', {
// 	font: font,
// 	size: 80,
// 	depth: 5,
// 	curveSegments: 12
// } );



init();
//all setup stuff goes here
function init(){
  //render full screen (choose size, can change)
  renderer.setSize(window.innerWidth, window.innerHeight)
  //created screen caputre, drew image, so put it on the screen
  document.body.appendChild(renderer.domElement);

  //by defalt everything is at 0,0,0 so move your camera back by 5
  camera.position.z = 5;

  meshes.track = addTrack().track
	meshes.debug = addTrack().debug
	scene.add(meshes.track)
  scene.add(meshes.debug)

  //add a light to the scene (not needed for mesh basic!!)
  lights.default = addLight()
  // scene.add(lights.default)



  //here we populat our meshes object/container
  //mesh.default = mesh i got back
  // meshes.default = addDefaultMeshes();
  // //move the cube
  // meshes.default.position.x = 2;

  // //add standard material from external function
  // meshes.standard = addStandardMeshes()
  // meshes.standard.position.x = -2

  //add sky
  scene.background = environment()
  //allow flowers to use background to light scene
  scene.environment = environment()
  //lower or raise light intensity
  scene.environmentIntensity = 0.9

  //add meshes to our screen
  // scene.add(meshes.default);
  // scene.add(meshes.standard)
  
  console.log(meshes)

  gsapText(1)

  handleScroll()
  instances()
  resize()
  animate();
}

function handleScroll() {
	// Convert wheel events into camera movement
	window.addEventListener('wheel', (event) => {
		const scrollDelta = event.deltaY
		scrollVelocity += scrollDelta * acceleration
		// Clamp velocity to maximum speed
		scrollVelocity = Math.max(
			Math.min(scrollVelocity, maxVelocity),
			-maxVelocity,
		)
	})
  console.log(scrollProgress)
}

function updateCamera(scrollProgress) {
	
  // Get current position on the track
	const position =
		meshes.track.geometry.parameters.path.getPointAt(scrollProgress)

	// Look slightly ahead on the track
	const lookAtPosition = meshes.track.geometry.parameters.path.getPointAt(
		Math.min(scrollProgress + 0.01, 1),
	)
	camera.position.copy(position)
	camera.lookAt(lookAtPosition)

}

function intoAnimation(){

}

function instances(){
  const miami = new Model({
    url: './Untitled.glb',
    scene: scene,
    meshes: meshes,
    scale: new THREE.Vector3(0.5,0.5,0.5),
    position: new THREE.Vector3(-50, -10, 0),
    // emissive: 1.5,
    // replace: true,
    // replaceURL: '/newmat/png',
  })
  miami.init()
}

function resize(){
  window.addEventListener('resize', ()=>{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  })
}

//text loader
const loader = new FontLoader();

loader.load('./miamifont.json', function (){
  const geometry = new new THREE.TextGeometry("Whats up.\n help",{
    font: font,
    size: 6,
    height: 2,
  })
})

function animate(){
  //EVERY FRAME WE UPDATE THE POSITION OF OUR meshes.default, meshes.copy, meshes.copy2
	const delta = clock.getDelta()
	for (const mixer of mixers) {
		mixer.update(delta)
	}

	// if (meshes.flower) {
	// 	meshes.flower.rotation.y -= 0.01
	// }

  //restart the loop
  requestAnimationFrame(animate);
  targetProgress += scrollVelocity
	scrollVelocity *= friction // Apply friction to slow movement
	if (Math.abs(scrollVelocity < 0.0001)) {
		scrollVelocity = 0 // Stop completely at very low speeds
	}

	// Clamp progress to valid range
	targetProgress = Math.max(0, Math.min(targetProgress, 1))

	// Smoothly move toward target position
	scrollProgress += (targetProgress - scrollProgress) * 0.1
	updateCamera(scrollProgress)

  //tell renderer to render whats in arguments (current scene and camera)
  renderer.render(scene, camera);

  // console.log(camera.position)

if (scrollProgress<scrollProgress == 2){
  scrollVelocity = 1
}


}

  