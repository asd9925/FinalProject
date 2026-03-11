import {
	TubeGeometry,
	MeshBasicMaterial,
	DoubleSide,
	Mesh,
	Group,
	Vector3,
	CatmullRomCurve3,
	SphereGeometry,
	MeshMatcapMaterial,
	TextureLoader,
} from 'three'

export const addTrack = () => {
	const group = new Group()

	// Define control points for the track curve
	// Each point is a 3D vector with (x, y, z) coordinates
	const points = [
		new Vector3(320, 200, -170), //into
		new Vector3(300, 160, -170), //intro-2000
        new Vector3(275, 130, -170), //2000-2010
        new Vector3(250, 100, -170), //2010-2020
        new Vector3(225, 80, -170), //2020-2030
        new Vector3(200, 60, -170), //2030-2040
        new Vector3(175, 55, -170), //2040-2060
        new Vector3(150, 50, -170), //2060-2070
        new Vector3(120, 35, -170), //2070-2100
        new Vector3(100, 20, -170), //2100-2120
        new Vector3(80, 10, -170), //year x
	]

	// Create visual markers (red spheres) for each control point
	const sphereGeometry = new SphereGeometry(0.5)
	const sphereMaterial = new MeshBasicMaterial({
		color: 'red',
	})
	// Add a sphere at each control point for debugging/visualization
	points.forEach((point) => {
		const sphere = new Mesh(sphereGeometry, sphereMaterial)
		sphere.position.copy(point)
		group.add(sphere)
	})

	// Create a smooth curve through all control points
	const curve = new CatmullRomCurve3(points)

	// Create a tube geometry that follows the curve
	const geometry = new TubeGeometry(
		curve, // The curve to follow
		100, // Number of segments (higher = smoother)
		2, // Tube radius
		8, // Number of sides (higher = rounder tube)
		false // Closed loop (connects end to start)
	)

	const loader = new TextureLoader()
	const matcapTexture = loader.load('mat.png')

	const material = new MeshMatcapMaterial({
		matcap: matcapTexture,
		side: DoubleSide,
		wireframe: true,
	})

	const tube = new Mesh(geometry, material)

	// Return both the debug points group and the track tube
	return { debug: group, track: tube }
}