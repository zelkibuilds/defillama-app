import Layout from '~/layout'
import { maxAgeForNext } from '~/api'
import { getPeggedAssets, getPeggedOverviewPageData } from '~/api/categories/stablecoins'
import { chainIconUrl } from '~/utils'
import { ChainStablecoins } from '~/containers/Chain/Stablecoins'

export async function getStaticProps({
	params: {
		chain: [chain]
	}
}) {
	const data = await getPeggedOverviewPageData(chain === 'All' ? null : chain)

	if (!data.filteredPeggedAssets || data.filteredPeggedAssets?.length === 0) {
		return {
			notFound: true
		}
	}

	const setSelectedChain = (newSelectedChain) => `/chain/${newSelectedChain}/stablecoins`

	let chainsList = ['All'].concat(data.chains).map((name) => ({
		name,
		label: name,
		to: setSelectedChain(name),
		route: setSelectedChain(name),
		logo: chainIconUrl(name)
	}))

	return {
		props: { ...data, chainsList, selectedChain: chain },
		revalidate: maxAgeForNext([22])
	}
}

export async function getStaticPaths() {
	const { chains } = await getPeggedAssets()

	const paths = chains.slice(0, 20).map((chain) => ({
		params: { chain: [chain.name] }
	}))

	return { paths: paths.slice(0, 11), fallback: 'blocking' }
}

export default function PeggedAssets(props) {
	return (
		<Layout title={`Stablecoins Circulating - DefiLlama`} defaultSEO>
			<ChainStablecoins {...props} />
		</Layout>
	)
}
