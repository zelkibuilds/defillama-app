import Layout from '~/layout'
import { ChainTVL } from '~/containers/Chain/TVL'
import { PROTOCOLS_API } from '~/constants/index'
import { maxAgeForNext } from '~/api'
import { getChainPageData } from '~/api/categories/protocols'
import { chainIconUrl } from '~/utils'

export async function getStaticProps({ params }) {
	const chain = params.chain
	const { props: data } = await getChainPageData(chain)

	const setSelectedChain = (newSelectedChain) => (newSelectedChain === 'All' ? '/' : `/chain/${newSelectedChain}`)

	let chainsList = ['All'].concat(data.chainsSet).map((name) => ({
		name,
		label: name,
		to: setSelectedChain(name),
		route: setSelectedChain(name),
		logo: chainIconUrl(name)
	}))

	return {
		props: { ...data, chainsList },
		revalidate: maxAgeForNext([22])
	}
}

export async function getStaticPaths() {
	const res = await fetch(PROTOCOLS_API)

	const paths = (await res.json()).chains.slice(0, 20).map((chain) => ({
		params: { chain }
	}))

	return { paths, fallback: 'blocking' }
}

export default function Chain({ chain, ...props }) {
	return (
		<Layout title={`${chain} TVL - DefiLlama`}>
			<ChainTVL {...props} selectedChain={chain} />
		</Layout>
	)
}
