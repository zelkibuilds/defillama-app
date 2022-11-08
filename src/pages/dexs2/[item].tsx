import { type } from '.'
import { getStaticPropsByType, getStaticPathsByType } from '../../utils/adaptorsPages/[type]/[item]'
export const getStaticProps = getStaticPropsByType(type)
export const getStaticPaths = getStaticPathsByType(type)

// When exporting this simple component from another folder and load http://localhost:3000/dexs2/dodo we get the following error:
// TypeError: CreateListFromArrayLike called on non-object
export { default } from '../../utils/adaptorsPages/[type]/[item]'

// If we export the same component but instad of importing it from another file, we export it from this file and load http://localhost:3000/dexs2/dodo we get no error
// Uncomment below to load without error
/* export default function ReproduceErrorSimple() {
	return <>[ITEM] component</>
} */
