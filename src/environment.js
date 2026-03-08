import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { EquirectangularReflectionMapping } from 'three'

//free HDRI's in polyhaven
export function environment() {
    //prepare hdri to be loaded in
    //can turn off visual background and only use lighting
	const rgbeLoader = new RGBELoader()
	const hdrMap = rgbeLoader.load('miamisky.hdr', (envMap) => {
		envMap.mapping = EquirectangularReflectionMapping
		return envMap
	})
	return hdrMap
}