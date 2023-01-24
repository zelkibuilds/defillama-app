import * as React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { ChainLayout } from './Layout'
import { StatsWrapper, Stat } from '~/layout/Stats/Large'
import { formattedNum, getPercentChange, getPrevTvlFromChart, getTokenDominance } from '~/utils'
import { useDenominationPriceHistory, useGetProtocolsList } from '~/api/categories/protocols/client'
import { useDefiManager } from '~/contexts/LocalStorage'
import { formatProtocolsList } from '~/hooks/data/defi'
import { chainCoingeckoIds } from '~/constants/chainTokens'
import { ChartContainer } from './common'
import Tooltip from '~/components/Tooltip'
import { ProtocolsTable } from '~/components/Table'

const Chart = dynamic(() => import('~/components/GlobalChart'), {
	ssr: false
}) as React.FC<any>

const BASIC_DENOMINATIONS = ['USD']

export function ChainTVL({ chainsList, selectedChain, chart, extraTvlCharts, protocolsList }) {
	const {
		fullProtocolsList,
		parentProtocols,
		isLoading: fetchingProtocolsList
	} = useGetProtocolsList({ chain: selectedChain })
	const [extraTvlsEnabled] = useDefiManager()

	const router = useRouter()

	const { minTvl, maxTvl } = router.query

	const denomination = typeof router.query?.currency === 'string' ? router.query?.currency ?? 'USD' : 'USD'

	const { totalVolumeUSD, volumeChangeUSD, globalChart } = React.useMemo(() => {
		const globalChart = chart.map((data) => {
			let sum = data[1]
			Object.entries(extraTvlCharts).forEach(([prop, propCharts]: [string, Array<[string, number]>]) => {
				const stakedData = propCharts.find((x) => x[0] === data[0])

				// find current date and only add values on that date in "data" above
				if (stakedData) {
					if (prop === 'doublecounted' && !extraTvlsEnabled['doublecounted']) {
						sum -= stakedData[1]
					}

					if (prop === 'liquidstaking' && !extraTvlsEnabled['liquidstaking']) {
						sum -= stakedData[1]
					}

					if (prop === 'dcAndLsOverlap') {
						if (!extraTvlsEnabled['doublecounted'] || !extraTvlsEnabled['liquidstaking']) {
							sum += stakedData[1]
						}
					}

					if (extraTvlsEnabled[prop.toLowerCase()] && prop !== 'doublecounted' && prop !== 'liquidstaking') {
						sum += stakedData[1]
					}
				}
			})
			return [data[0], sum]
		})

		const tvl = getPrevTvlFromChart(globalChart, 0)
		const tvlPrevDay = getPrevTvlFromChart(globalChart, 1)
		const volumeChangeUSD = getPercentChange(tvl, tvlPrevDay)

		return { totalVolumeUSD: tvl, volumeChangeUSD, globalChart }
	}, [chart, extraTvlsEnabled, extraTvlCharts])

	const { protocolTotals, topToken } = React.useMemo(() => {
		let protocolTotals = protocolsList

		if (!fetchingProtocolsList && fullProtocolsList) {
			protocolTotals = formatProtocolsList({ extraTvlsEnabled, protocols: fullProtocolsList, parentProtocols })
		}

		const topToken = { name: 'Uniswap', tvl: 0 }
		if (protocolTotals.length > 0) {
			topToken.name = protocolTotals[0]?.name
			topToken.tvl = protocolTotals[0]?.tvl
			if (topToken.name === 'AnySwap') {
				topToken.name = protocolTotals[1]?.name
				topToken.tvl = protocolTotals[1]?.tvl
			}
		}

		return { protocolTotals, topToken }
	}, [extraTvlsEnabled, fetchingProtocolsList, fullProtocolsList, parentProtocols, protocolsList])

	const [DENOMINATIONS, chainGeckoId] = React.useMemo(() => {
		let DENOMINATIONS = []
		let chainGeckoId = null
		if (selectedChain !== 'All') {
			let chainDenomination = chainCoingeckoIds[selectedChain] ?? null

			chainGeckoId = chainDenomination?.geckoId ?? null

			if (chainGeckoId && chainDenomination.symbol) {
				DENOMINATIONS = [...BASIC_DENOMINATIONS, chainDenomination.symbol]
			}
		}
		return [DENOMINATIONS, chainGeckoId]
	}, [selectedChain])

	const { data: denominationPriceHistory, loading } = useDenominationPriceHistory(chainGeckoId)

	const [finalChartData, chainPriceInUSD] = React.useMemo(() => {
		if (denomination !== 'USD' && denominationPriceHistory && chainGeckoId) {
			let priceIndex = 0
			let prevPriceDate = 0
			const denominationPrices = denominationPriceHistory.prices
			const newChartData = []
			let priceInUSD = 1
			for (let i = 0; i < globalChart.length; i++) {
				const date = globalChart[i][0] * 1000
				while (
					priceIndex < denominationPrices.length &&
					Math.abs(date - prevPriceDate) > Math.abs(date - denominationPrices[priceIndex][0])
				) {
					prevPriceDate = denominationPrices[priceIndex][0]
					priceIndex++
				}
				priceInUSD = denominationPrices[priceIndex - 1][1]
				newChartData.push([globalChart[i][0], globalChart[i][1] / priceInUSD])
			}
			return [newChartData, priceInUSD]
		} else return [globalChart, 1]
	}, [chainGeckoId, globalChart, denominationPriceHistory, denomination])

	const updateRoute = (unit) => {
		router.push({
			query: {
				...router.query,
				currency: unit
			}
		})
	}

	const tvl = formattedNum(totalVolumeUSD, true)

	const totalVolume = totalVolumeUSD / chainPriceInUSD

	const dominance = getTokenDominance(topToken, totalVolumeUSD)

	const isLoading = denomination !== 'USD' && loading

	const percentChange = volumeChangeUSD?.toFixed(2)

	const volumeChange = (Number(percentChange) > 0 ? '+' : '') + percentChange + '%'

	const finalProtocolTotals = React.useMemo(() => {
		const isValidTvlRange =
			(minTvl !== undefined && !Number.isNaN(Number(minTvl))) || (maxTvl !== undefined && !Number.isNaN(Number(maxTvl)))

		return isValidTvlRange
			? protocolTotals.filter((p) => (minTvl ? p.tvl > minTvl : true) && (maxTvl ? p.tvl < maxTvl : true))
			: protocolTotals
	}, [minTvl, maxTvl, protocolTotals])

	return (
		<ChainLayout chainsList={chainsList} selectedChain={selectedChain}>
			<Stats>
				<Stat>
					<span>TVL</span>
					<span>
						<Tooltip
							content={totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
							style={{ padding: '4px' }}
						>
							{tvl}
						</Tooltip>
					</span>
				</Stat>

				<hr />

				<Stat>
					<span>Change (24h)</span>
					<span>{percentChange || 0}%</span>
				</Stat>

				<hr />

				<Stat>
					<span>{topToken.name} Dominance</span>
					<span>{dominance}%</span>
				</Stat>
			</Stats>

			<ChartContainer>
				<Chart
					dailyData={finalChartData}
					unit={denomination}
					totalLiquidity={totalVolume}
					liquidityChange={volumeChangeUSD}
				/>
			</ChartContainer>

			{finalProtocolTotals.length > 0 && <Wrapper data={finalProtocolTotals} />}
		</ChainLayout>
	)
}

const Stats = styled(StatsWrapper)`
	padding-left: 0px;

	@media screen and (max-width: 80rem) {
		& > *:not(:first-child) {
			display: none;
		}
	}
`

const Wrapper = styled(ProtocolsTable)`
	width: 100%;
	margin-top: -24px;
	--table-width-offset: 48px;

	th,
	td,
	table,
	tr,
	tbody,
	thead {
		background: ${({ theme }) => (theme.mode === 'dark' ? 'black' : 'white')};
	}

	& > * {
		border: none;
	}

	@media screen and (min-width: 80rem) {
		margin-top: -48px;
		--table-width-offset: 82px;
	}
`
