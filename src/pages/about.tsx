import * as React from 'react'
import styled from 'styled-components'
import { TYPE } from '~/Theme'
import Layout from '~/layout'
import { Divider, Panel } from '~/components'
import { RowBetween } from '~/components/Row'
import Link from '~/components/Link'

const DashGrid = styled.div`
	display: grid;
	grid-gap: 1em;
	grid-template-columns: 1fr;
	grid-template-areas: 'account';
	padding: 0 4px;

	> * {
		justify-content: flex-end;
	}
`

function AboutPage() {
	return (
		<Layout title="About - Llama.Fi" defaultSEO>
			<RowBetween>
				<TYPE.largeHeader>About</TYPE.largeHeader>
			</RowBetween>
			<Panel style={{ marginTop: '6px' }}>
				<DashGrid style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
					<TYPE.heading>About Llama.Fi</TYPE.heading>
					<Divider />
					<TYPE.main>
						Llama.Fi is the largest TVL aggregator for DeFi (Decentralized Finance). Our data is fully{' '}
						<Link href="https://github.com/DefiLlama/DefiLlama-Adapters">open-source</Link> and maintained by a team of
						passionate individuals and{' '}
						<Link href="https://github.com/DefiLlama/DefiLlama-Adapters/graphs/contributors">contributors</Link> from
						hundreds of protocols.
					</TYPE.main>
					<TYPE.main>Our focus is on accurate data and transparent methodology.</TYPE.main>
				</DashGrid>
			</Panel>
			<Panel style={{ marginTop: '6px' }}>
				<DashGrid style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
					<TYPE.main area="account">Contact</TYPE.main>
					<Divider />
					<TYPE.main>
						Contact us on <Link href="https://twitter.com/llamadotfi">Twitter</Link> or{' '}
						<Link href="https://discord.llama.fi">Discord</Link>
					</TYPE.main>
				</DashGrid>
			</Panel>
			<Panel style={{ marginTop: '6px' }}>
				<DashGrid style={{ height: 'fit-content', padding: '0 0 1rem 0' }}>
					<TYPE.main area="account">Acknowledgements</TYPE.main>
					<Divider />
					<TYPE.main>
						Thanks to <Link href="https://www.coingecko.com/">CoinGecko</Link> for the continued support.
					</TYPE.main>
					<Divider />
					<TYPE.main>
						Llama.Fi&apos;s design is based on <Link href="https://github.com/Uniswap/uniswap-info">Uniswap.info</Link>
					</TYPE.main>
				</DashGrid>
			</Panel>
		</Layout>
	)
}

export default AboutPage
