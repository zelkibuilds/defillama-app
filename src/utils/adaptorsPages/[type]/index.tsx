import { GetStaticProps, GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import * as React from 'react'
import { maxAgeForNext } from '~/api'
import { getChainPageData } from '~/api/categories/adaptors'
import SEO from '~/components/SEO'
import OverviewContainer, { IOverviewContainerProps } from '~/containers/DexsAndFees'
import Layout from '~/layout'
import { capitalizeFirstLetter } from '~/utils'

const cgDerivsId = {
	'2797': 'aevo'
}

export const getStaticProps: GetStaticProps<IOverviewContainerProps> = async ({
	params
}: GetStaticPropsContext<{ type: string; chain: string }>) => {
	const data = await getChainPageData(params.type, params.chain).catch((e) =>
		console.info(`Chain page data not found ${params.type} ${params.chain}`, e)
	)

	if (!data || !data.protocols || data.protocols.length <= 0) return { notFound: true }

	const categories = new Set<string>()

	data.protocols.forEach((p) => {
		if (p.category) {
			categories.add(p.category)
		}
	})

	let protocols = data.protocols

	// console.log({ type: params.type, protocols })

	if (params.type === 'options') {
		const [
			derivs,
			{
				coins: {
					'coingecko:bitcoin': { price: btcPrice }
				}
			}
		] = await Promise.all([
			fetch(
				`https://pro-api.coingecko.com/api/v3/derivatives/exchanges?per_page=1000&x_cg_pro_api_key=${process.env.CG_KEY}`
			).then((r) => r.json()),
			fetch(`https://coins.llama.fi/prices/current/coingecko:bitcoin`).then((r) => r.json())
		])

		protocols = data.protocols.map((protocol) => {
			if (cgDerivsId[protocol.id]) {
				const _derivs = derivs && !derivs.status && derivs.find((ex) => ex.id === cgDerivsId[protocol.id])

				if (_derivs) {
					protocol.oi = _derivs.open_interest_btc * btcPrice
				}
			}

			return protocol
		})
	}

	return {
		props: {
			...data,
			protocols,
			type: params.type,
			categories: Array.from(categories)
		},
		revalidate: maxAgeForNext([22])
	}
}

export const getStaticPropsByType = (type: string) => {
	return (context) =>
		getStaticProps({
			...context,
			params: {
				...context.params,
				type
			}
		})
}

const AllChainsDexs = (props: IOverviewContainerProps) => {
	const router = useRouter()
	const isSimpleFees = router?.pathname?.includes('/fees/simple')
	return (
		<Layout title={`${capitalizeFirstLetter(props.type)} - DefiLlama`}>
			<SEO pageType={props.type} />
			<OverviewContainer {...props} isSimpleFees={isSimpleFees} />
		</Layout>
	)
}

export default AllChainsDexs
