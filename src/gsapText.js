import gsap from 'gsap'

export function gsapText(index) {
	// Grab every DOM element with the .info class.
	// querySelectorAll returns a NodeList, and GSAP can animate the whole collection.
	const text = document.querySelectorAll('.info')

	// Animate every item in the collection at the same time.
	// GSAP will loop through the NodeList and apply these values to each element.
	gsap.to(text, {
		// `i` is the position of the current element in the NodeList.
		// If this element's position matches the active `index`, make it visible.
		// Otherwise, fade it out.
		opacity: (i) => (i === index ? 1 : 0),
		// How long the fade takes.
		duration: 0.6,
		// Controls how the animation accelerates/decelerates.
		ease: 'power1.out',
		// If this function gets called again before the current tween finishes,
		// GSAP replaces the old opacity tween so animations don't conflict.
		overwrite: 'auto',
	})
}