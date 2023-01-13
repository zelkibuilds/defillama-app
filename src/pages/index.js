import Layout from '~/layout'
import { ChainTVL } from '~/containers/Chain/TVL'
import { maxAgeForNext } from '~/api'
import { getChainPageData } from '~/api/categories/protocols'
import { chainIconUrl } from '~/utils'

export async function getStaticProps() {
	const { props: data } = await getChainPageData()

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

export default function HomePage(props) {
	return (
		<Layout title="DefiLlama - DeFi Dashboard">
			<ChainTVL selectedChain="All" {...props} />
		</Layout>
	)
}
