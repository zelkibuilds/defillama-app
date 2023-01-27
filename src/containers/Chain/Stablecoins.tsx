import * as React from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { BreakpointPanel, BreakpointPanels, ChartAndValuesWrapper, DownloadButton, DownloadIcon } from '~/components'
import { PeggedChainResponsivePie, PeggedChainResponsiveDominance, AreaChart } from '~/components/Charts'
import { RowLinksWithDropdown, RowLinksWrapper } from '~/components/Filters'
import type { IBarChartProps, IChartProps } from '~/components/ECharts/types'
import { PeggedSearch } from '~/components/Search'
import { ChartSelector } from '~/components/PeggedPage/.'
import {
	Attribute,
	stablecoinAttributeOptions,
	PegType,
	stablecoinPegTypeOptions,
	BackingType,
	stablecoinBackingOptions,
	McapRange,
	ResetAllStablecoinFilters
} from '~/components/Filters'
import { PeggedAssetsTable } from '~/components/Table'
import { ChainLayout } from './Layout'
import { StatsWrapper, Stat } from '~/layout/Stats/Large'
import {
	useCalcCirculating,
	useCalcGroupExtraPeggedByDay,
	useFormatStablecoinQueryParams
} from '~/hooks/data/stablecoins'
import { useBuildPeggedChartData } from '~/utils/stablecoins'
import { useXl, useMed } from '~/hooks/useBreakpoints'
import {
	getRandomColor,
	capitalizeFirstLetter,
	formattedNum,
	getPercentChange,
	getPeggedDominance,
	toNiceMonthlyDate,
	toNiceCsvDate,
	download
} from '~/utils'
import { ChartContainer } from './common'

const Chart = dynamic(() => import('~/components/GlobalChart'), {
	ssr: false
}) as React.FC<any>

export function ChainStablecoins({
	chainsList,
	selectedChain,
	filteredPeggedAssets,
	peggedAssetNames,
	peggedNameToChartDataIndex,
	chartDataByPeggedAsset,
	chainTVLData
}) {
	const [chartType, setChartType] = React.useState(selectedChain === 'All' ? 'Token Market Caps' : 'USD Inflows')

	const chartTypeList =
		selectedChain !== 'All'
			? ['USD Inflows', 'Total Market Cap', 'Token Market Caps', 'Token Inflows', 'Pie', 'Dominance']
			: ['Total Market Cap', 'Token Market Caps', 'Pie', 'Dominance', 'USD Inflows', 'Token Inflows']

	const belowMed = useMed()
	const belowXl = useXl()
	const aspect = belowXl ? (belowMed ? 1 : 60 / 42) : 60 / 22

	const [filteredIndexes, setFilteredIndexes] = React.useState([])

	const { query } = useRouter()
	const { minMcap, maxMcap } = query

	const { selectedAttributes, selectedPegTypes, selectedBackings } = useFormatStablecoinQueryParams({
		stablecoinAttributeOptions,
		stablecoinPegTypeOptions,
		stablecoinBackingOptions
	})

	const peggedAssets = React.useMemo(() => {
		let chartDataIndexes = []
		const peggedAssets = filteredPeggedAssets.reduce((acc, curr) => {
			let toFilter = false

			// These together filter depegged. Need to refactor once any other attributes are added.
			toFilter = Math.abs(curr.pegDeviation) < 10 || !(typeof curr.pegDeviation === 'number')
			selectedAttributes.forEach((attribute) => {
				const attributeOption = stablecoinAttributeOptions.find((o) => o.key === attribute)

				if (attributeOption) {
					toFilter = attributeOption.filterFn(curr)
				}
			})

			toFilter =
				toFilter &&
				selectedPegTypes
					.map((pegtype) => {
						const pegTypeOption = stablecoinPegTypeOptions.find((o) => o.key === pegtype)
						return pegTypeOption ? pegTypeOption.filterFn(curr) : false
					})
					.some((bool) => bool)

			toFilter =
				toFilter &&
				selectedBackings
					.map((backing) => {
						const backingOption = stablecoinBackingOptions.find((o) => o.key === backing)
						return backingOption ? backingOption.filterFn(curr) : false
					})
					.some((bool) => bool)

			const isValidMcapRange =
				(minMcap !== undefined && !Number.isNaN(Number(minMcap))) ||
				(maxMcap !== undefined && !Number.isNaN(Number(maxMcap)))

			if (isValidMcapRange) {
				toFilter = toFilter && (minMcap ? curr.mcap > minMcap : true) && (maxMcap ? curr.mcap < maxMcap : true)
			}

			if (toFilter) {
				const chartDataIndex = peggedNameToChartDataIndex[curr.name]
				chartDataIndexes.push(chartDataIndex)
				return acc.concat(curr)
			} else return acc
		}, [])

		setFilteredIndexes(chartDataIndexes)

		return peggedAssets
	}, [
		filteredPeggedAssets,
		peggedNameToChartDataIndex,
		minMcap,
		maxMcap,
		selectedAttributes,
		selectedPegTypes,
		selectedBackings
	])

	const { peggedAreaChartData, peggedAreaTotalData, stackedDataset, tokenInflows, tokenInflowNames, usdInflows } =
		useBuildPeggedChartData(
			chartDataByPeggedAsset,
			peggedAssetNames,
			filteredIndexes,
			'mcap',
			chainTVLData,
			selectedChain
		)

	const peggedTotals = useCalcCirculating(peggedAssets)

	const chainsCirculatingValues = React.useMemo(() => {
		const data = peggedTotals.map((chain) => ({ name: chain.symbol, value: chain.mcap }))

		const otherCirculating = data.slice(10).reduce((total, entry) => {
			return (total += entry.value)
		}, 0)

		return data
			.slice(0, 10)
			.sort((a, b) => b.value - a.value)
			.concat({ name: 'Others', value: otherCirculating })
	}, [peggedTotals])

	const chainColor = React.useMemo(
		() =>
			Object.fromEntries(
				[...peggedTotals, 'Others'].map((peggedAsset) => {
					return typeof peggedAsset === 'string' ? ['-', getRandomColor()] : [peggedAsset.symbol, getRandomColor()]
				})
			),
		[peggedTotals]
	)

	const { data: stackedData, daySum } = useCalcGroupExtraPeggedByDay(stackedDataset)

	const downloadCsv = () => {
		const filteredPeggedNames = peggedAssetNames.filter((name, i) => filteredIndexes.includes(i))
		const rows = [['Timestamp', 'Date', ...filteredPeggedNames, 'Total']]
		stackedData
			.sort((a, b) => a.date - b.date)
			.forEach((day) => {
				rows.push([
					day.date,
					toNiceCsvDate(day.date),
					...filteredPeggedNames.map((peggedAsset) => day[peggedAsset] ?? ''),
					filteredPeggedNames.reduce((acc, curr) => {
						return (acc += day[curr] ?? 0)
					}, 0)
				])
			})
		download('stablecoins.csv', rows.map((r) => r.join(',')).join('\n'))
	}

	let title = `Stablecoins Market Cap`
	if (selectedChain !== 'All') {
		title = `${capitalizeFirstLetter(selectedChain)} Stablecoins Market Cap`
	}

	const { percentChange, totalMcapCurrent } = React.useMemo(() => {
		let totalMcapCurrent = peggedAreaTotalData?.[peggedAreaTotalData.length - 1]?.Mcap
		let totalMcapPrevWeek = peggedAreaTotalData?.[peggedAreaTotalData.length - 8]?.Mcap
		const percentChange = getPercentChange(totalMcapCurrent, totalMcapPrevWeek)?.toFixed(2)
		return { percentChange, totalMcapCurrent }
	}, [peggedAreaTotalData])

	const mcapToDisplay = formattedNum(totalMcapCurrent, true)

	let topToken = { symbol: 'USDT', mcap: 0 }
	if (peggedTotals.length > 0) {
		const topTokenData = peggedTotals[0]
		topToken.symbol = topTokenData.symbol
		topToken.mcap = topTokenData.mcap
	}

	const dominance = getPeggedDominance(topToken, totalMcapCurrent)

	const totalMcapLabel = ['Mcap', 'TVL']

	const path = selectedChain === 'All' ? '/stablecoins' : `/stablecoins/${selectedChain}`

	return (
		<ChainLayout chainsList={chainsList} selectedChain={selectedChain}>
			<Stats>
				<Stat>
					<span>{`Total ${title}`}</span>
					<span>{mcapToDisplay}</span>
				</Stat>

				<hr />

				<Stat>
					<span>Change (7d)</span>
					<span>{percentChange || 0}%</span>
				</Stat>

				<hr />

				<Stat>
					<span>{topToken.symbol} Dominance</span>
					<span>{dominance}%</span>
				</Stat>
			</Stats>

			<ChartContainer></ChartContainer>
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

// const Wrapper = styled(ProtocolsTable)`
// 	width: 100%;
// 	margin-top: -24px;
// 	border: none;
// 	--table-width-offset: 48px;

// 	th,
// 	td,
// 	table,
// 	tr,
// 	tbody,
// 	thead {
// 		background: ${({ theme }) => (theme.mode === 'dark' ? 'black' : 'white')};
// 	}

// 	@media screen and (min-width: 80rem) {
// 		margin-top: -48px;
// 		--table-width-offset: 82px;
// 	}
// `
