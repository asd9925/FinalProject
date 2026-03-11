import './style.css'
import * as THREE from 'three'
import { addLight } from './addLight'
import Model from './model'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { environment } from './environment'
import { addTrack } from './addTrack'
import gsap from 'gsap'
import { gsapText } from './gsapText'
import { Water } from 'three/addons/objects/Water.js'
import { reflect } from 'three/tsl'

//calling three library with our own variable scene
const scene = new THREE.Scene()

//FOV, ASPECT RATIO, NEAR, FAR
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000,
)

//antialias makes rendering smoother, less pixels, just turn on by default
const renderer = new THREE.WebGLRenderer({ antialias: true })

//apparently would need a point light to cast shadows
renderer.shadowMap.enabled = true

//make it so you can move, pan, go all around screen
const controls = new OrbitControls(camera, renderer.domElement)

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
const introEndProgress = 0.1384137598564551

const pointTwo = 0.26086905641985725

const pointThree = 0.3834024169985245

const pointFour = 0.48383017674646234

const pointFive = 0.5842777965364307

const pointSix = 0.6644891644168056

const pointSeven = 0.7444219619946211

const pointEight = 0.8496676715797598

const pointNine = 0.928067373269962

let isIntroPlaying = true

let scrollingStarted = false

let scrolling2Started = false

let scrolling3Started = false

let scrolling4Started = false

let scrolling5Started = false

let scrolling6Started = false

let scrolling7Started = false

let scrolling8Started = false

let scrolling9Started = false

const clock = new THREE.Clock()

let water
let waterOverlay
let waterOverlayOpacity = 0

//make it so click interaction only works at the very end
let canClick = false;

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );
// create a global audio source
const sound = new THREE.Audio( listener );
// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'shepard-tone.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.35 );
});


init()
//all setup stuff goes here
function init() {
	//render full screen (choose size, can change)
	renderer.setSize(window.innerWidth, window.innerHeight)
	//created screen caputre, drew image, so put it on the screen
	document.body.appendChild(renderer.domElement)
	waterOverlay = document.querySelector('.water-overlay')

	//by defalt everything is at 0,0,0 so move your camera back by 5
	camera.position.z = 5

	meshes.track = addTrack().track
	meshes.debug = addTrack().debug
	//hide visual track and dots
	// scene.add(meshes.track)
	// scene.add(meshes.debug)

	//add a light to the scene (not needed for mesh basic!!)
	lights.default = addLight()
	// scene.add(lights.default)

	//add sky
	scene.background = environment()
	//allow flowers to use background to light scene
	scene.environment = environment()
	//lower or raise light intensity
	scene.environmentIntensity = 0.8

	// Create the water geometry
	const waterGeometry = new THREE.PlaneGeometry(10000, 10000)

	// Create the water object
	water = new Water(waterGeometry, {
		textureWidth: 500,
		textureHeight: 500,
		waterNormals: new THREE.TextureLoader().load(
			'waternormals.jpg',
			function (texture) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping
				water.rotation.x = -Math.PI / 2 //make it flat
				water.position.x = 0
				water.position.y = -11
			},
		),
		sunDirection: new THREE.Vector3(0, 0, 0),
		sunColor: 0xffffff,
		side: THREE.DoubleSide,
		// waterColor: 0x34bdeb,
		waterColor: 0x34bdeb,
		distortionScale: 0.1,
		alpha: 0.01,
	})
	scene.add(water)

	gsapText(1)
	playIntro()

	handleScroll()
	instances()
	resize()
	animate()
  outroAnimation()
}

function handleScroll() {
	// Convert wheel events into camera movement
	window.addEventListener('wheel', (event) => {
		if (isIntroPlaying) return

		const scrollDelta = event.deltaY
		scrollVelocity += scrollDelta * acceleration
		// Clamp velocity to maximum speed
		scrollVelocity = Math.max(
			Math.min(scrollVelocity, maxVelocity),
			-maxVelocity,
		)
	})
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

function playIntro() {
	const introState = { progress: targetProgress }

	gsap.to(introState, {
		progress: introEndProgress,
		duration: 5,
		ease: 'power2.out',
		onUpdate: () => {
			targetProgress = introState.progress
		},
		onComplete: () => {
			targetProgress = introEndProgress
			scrollProgress = introEndProgress
			scrollVelocity = 0
			isIntroPlaying = false

			//display instructions/begin text
			document.querySelector('.begin-text').style.display = 'block'
		},
	})
}

function outroAnimation(){

  //on click remove previous text
  window.addEventListener('click', (event)=> {
    //dont go through with interaction too early
    if (!canClick) return

    //get current progress on track
    const outroState = { progress: targetProgress }

    //after click fade final data text away, and new text fades in
    gsap.to(['.click-text', '.twelfth-text', '.year9', '.level9'], {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    })

    gsap.set(['.final-text', '.final-text2'], {
      display: 'block',
      delay: 0.8,
      duration: 1,
    })

    gsap.fromTo(['.final-text', '.final-text2'], {
      opacity: 0
    }, {
      opacity: 1,
      duration: 1,
      delay: 0.8,
      ease: 'power2.out',
    })

    //MAKE CAMERA MOVE BACKWARDS
    gsap.to(outroState, {
		progress: introEndProgress,
		duration: 25,
		ease: 'none',
		onUpdate: () => {
			targetProgress = outroState.progress
		},

    //remove final text and fade in outro text
    onComplete: () => {
      gsap.to(['.final-text', '.final-text2'], {
      opacity: 0,
      duration: 0.7,
      ease: 'power2.in',
    })
      gsap.set('.outro-text', {
        display: 'block',
        delay: 1,
        duration: 1,
  })
      gsap.fromTo(['.outro-text'], {
      opacity: 0
    }, {
      opacity: 1,
      duration: 1,
      delay: 1,
      ease: 'power2.out',
    })
  }
})
  })
  }

function animateLevelText(activeLevel) {
	const allLevelText = Array.from({ length: 9 }, (_, index) => [
		`.level${index + 1}`,
		`.year${index + 1}`,
	]).flat()
	const currentLevelText = [`.level${activeLevel}`, `.year${activeLevel}`]
	const inactiveLevelText = allLevelText.filter(
		(selector) => !currentLevelText.includes(selector),
	)

	gsap.killTweensOf(allLevelText)

	gsap.to(inactiveLevelText, {
		opacity: 0,
		duration: 0.4,
		overwrite: 'auto',
	})

	gsap.set(currentLevelText, {
		opacity: 0,
	})

	gsap.to(currentLevelText, {
		opacity: 1,
		duration: 0.8,
		delay: 1.8,
		overwrite: 'auto',
	})
}

function animateWaterPosition(y) {
	if (!water) return

	gsap.to(water.position, {
		y,
		duration: 1.5,
		ease: 'power2.out',
		overwrite: 'auto',
	})
}

function updateWaterOverlay() {
	if (!water || !waterOverlay) return

	const underwaterDepth = water.position.y - camera.position.y - 0.5
	const targetOpacity = THREE.MathUtils.clamp(underwaterDepth * 0.12, 0, 0.45)

	waterOverlayOpacity = THREE.MathUtils.lerp(
		waterOverlayOpacity,
		targetOpacity,
		0.08,
	)
	waterOverlay.style.opacity = waterOverlayOpacity.toFixed(3)
}

//scroll between points here
function interactions() {
	//old intro text goes up page when you begin scrolling
	gsap.to(['.first-text', '.second-text', '.third-text', '.begin-text'], {
		y: -window.innerHeight,
		duration: 2,
	})
	//make new text appear from bottom
	document.querySelector('.fourth-text').style.display = 'block'
	gsap.fromTo(
		'.fourth-text',
		{
			y: window.innerHeight,
		},
		{
			y: window.innerHeight / 2,
			duration: 2,
		},
	)

	//make year and level appear after animation
	animateLevelText(1)
}

function interactions2() {
	gsap.to('.fourth-text', {
		y: -window.innerHeight,
		duration: 2,
	})
	document.querySelector('.fifth-text').style.display = 'block'
	gsap.fromTo(
		'.fifth-text',
		{
			y: window.innerHeight,
		},
		{
			y: window.innerHeight / 2,
			duration: 2,
		},
	)

	animateLevelText(2)
}

function interactions3() {
	gsap.to('.fifth-text', {
		y: -window.innerHeight,
		duration: 2,
	})
	document.querySelector('.sixth-text').style.display = 'block'
	gsap.fromTo(
		'.sixth-text',
		{
			y: window.innerHeight,
		},
		{
			y: window.innerHeight / 2,
			duration: 2,
		},
	)

	animateLevelText(3)
}

function interactions4() {
	gsap.to('.sixth-text', {
		y: -window.innerHeight,
		duration: 2,
	})
	document.querySelector('.seventh-text').style.display = 'block'
	gsap.fromTo(
		'.seventh-text',
		{
			y: window.innerHeight,
		},
		{
			y: window.innerHeight / 2,
			duration: 2,
		},
	)

	animateLevelText(4)
}

function interactions5() {
	gsap.to('.seventh-text', {
		y: -window.innerHeight,
		duration: 2,
	})
	document.querySelector('.eighth-text').style.display = 'block'
	gsap.fromTo(
		'.eighth-text',
		{
			y: window.innerHeight,
		},
		{
			y: window.innerHeight / 2,
			duration: 2,
		},
	)

	animateLevelText(5)
}

function interactions6() {
	gsap.to('.eighth-text', {
		y: -window.innerHeight,
		duration: 2,
	})
	document.querySelector('.ninth-text').style.display = 'block'
	gsap.fromTo(
		'.ninth-text',
		{
			y: window.innerHeight,
		},
		{
			y: window.innerHeight / 2,
			duration: 2,
		},
	)

	animateLevelText(6)
}

function interactions7() {
	gsap.to('.ninth-text', {
		y: -window.innerHeight,
		duration: 2,
	})
	document.querySelector('.tenth-text').style.display = 'block'
	gsap.fromTo(
		'.tenth-text',
		{
			y: window.innerHeight,
		},
		{
			y: window.innerHeight / 2,
			duration: 2,
		},
	)

	animateLevelText(7)
}

function interactions8() {
	gsap.to('.tenth-text', {
		y: -window.innerHeight,
		duration: 2,
	})
	document.querySelector('.eleventh-text').style.display = 'block'
	gsap.fromTo(
		'.eleventh-text',
		{
			y: window.innerHeight,
		},
		{
			y: window.innerHeight / 2,
			duration: 2,
		},
	)

	animateLevelText(8)
}

function interactions9() {
	gsap.to('.eleventh-text', {
		y: -window.innerHeight,
		duration: 2,
	})
	document.querySelector('.twelfth-text').style.display = 'block'
	gsap.fromTo(
		'.twelfth-text',
		{
			y: window.innerHeight,
		},
		{
			y: window.innerHeight / 2,
			duration: 2,
		},
	)

	animateLevelText(9)

  gsap.set('.click-text', {
    display: 'block',
    delay: 2,
  })
  canClick = true;
}

function instances() {
	const miami = new Model({
		url: './Untitled.glb',
		scene: scene,
		meshes: meshes,
		scale: new THREE.Vector3(0.5, 0.5, 0.5),
		position: new THREE.Vector3(-50, -10, 0),
		// emissive: 1.5,
	})
	miami.init()
}

function resize() {
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
	})
}

function animate() {
	//EVERY FRAME WE UPDATE THE POSITION OF OUR meshes.default, meshes.copy, meshes.copy2
	const delta = clock.getDelta()
	for (const mixer of mixers) {
		mixer.update(delta)
	}

	//restart the loop
	requestAnimationFrame(animate)
	targetProgress += scrollVelocity
	scrollVelocity *= friction // Apply friction to slow movement
	if (Math.abs(scrollVelocity) < 0.0001) {
		scrollVelocity = 0 // Stop completely at very low speeds
	}

	// Clamp progress to valid range
	targetProgress = Math.max(0, Math.min(targetProgress, 1))

	// Smoothly move toward target position
	scrollProgress += (targetProgress - scrollProgress) * 0.1
	updateCamera(scrollProgress)
	updateWaterOverlay()

	//start scrolling animations with interactions()
	if (targetProgress > introEndProgress + 0.001 && !scrollingStarted) {
		scrollingStarted = true
		interactions()
    sound.play();
	}

	//start second scroll interaction
	if (targetProgress > pointTwo && !scrolling2Started) {
		scrolling2Started = true
		animateWaterPosition(-10.4)
		interactions2()
	}

	if (targetProgress > pointThree && !scrolling3Started) {
		scrolling3Started = true
		animateWaterPosition(-10)
		interactions3()
	}

	if (targetProgress > pointFour && !scrolling4Started) {
		scrolling4Started = true
		animateWaterPosition(-9.4)
		interactions4()
	}

	if (targetProgress > pointFive && !scrolling5Started) {
		scrolling5Started = true
		interactions5()
		animateWaterPosition(-7)
	}

	if (targetProgress > pointSix && !scrolling6Started) {
		scrolling6Started = true
		interactions6()
		animateWaterPosition(0)
	}

	if (targetProgress > pointSeven && !scrolling7Started) {
		scrolling7Started = true
		interactions7()
		animateWaterPosition(5)
	}

	if (targetProgress > pointEight && !scrolling8Started) {
		scrolling8Started = true
		interactions8()
		animateWaterPosition(10)
	}

	if (targetProgress > pointNine && !scrolling9Started) {
		scrolling9Started = true
		interactions9()
		animateWaterPosition(30)
	}

	//tell renderer to render whats in arguments (current scene and camera)
	renderer.render(scene, camera)
}
