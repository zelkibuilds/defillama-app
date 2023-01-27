import * as React from 'react'
import Image from 'next/future/image'
import Link from 'next/link'
import Announcement from '~/components/Announcement'
import { ArrowUpRight } from 'react-feather'
import { DefiFiltersV2 } from '~/components/Filters'
import styled from 'styled-components'
import { primaryColor } from '~/constants/colors'
import { transparentize } from 'polished'
import { useRouter } from 'next/router'

interface IChainLayout {
	chainsList: Array<{ name: string; label: string; to: string; route: string }>
	selectedChain: string
	children?: React.ReactNode
}

export function ChainLayout({ chainsList, selectedChain, children }: IChainLayout) {
	const router = useRouter()

	return (
		<>
			<AnnouncementWrapper>
				<span>Check out our new</span>{' '}
				<Link href={`https://swap.defillama.com/`}>
					<a>
						<Image
							src="https://icons.llamao.fi/icons/memes/gib?w=36&h=36"
							alt="Gib"
							width={18}
							height={18}
							unoptimized
							style={{ marginRight: '0.25rem', display: 'inline' }}
						/>{' '}
						DEX meta-aggregator <ArrowUpRight size={14} style={{ display: 'inline' }} />{' '}
					</a>
				</Link>
			</AnnouncementWrapper>

			<DefiFiltersV2 header="TVL Rankings" chainsList={chainsList} selectedChain={selectedChain} />

			<DashboardLinks>
				<Link href={`/chain/${selectedChain}/tvl`} passHref>
					<DashboardLink
						active={
							router.pathname === '/' ||
							router.pathname === '/chain/[chain]' ||
							router.pathname === '/chain/[chain]/tvl'
						}
					>
						Total Value Locked
					</DashboardLink>
				</Link>
				<Link href={`/chain/${selectedChain}/stablecoins`} passHref>
					<DashboardLink
						active={
							router.pathname === '/stablecoins' ||
							router.pathname === '/stablecoins/[...chain]' ||
							router.pathname === '/stablecoins/[chain]' ||
							router.pathname === '/chain/[chain]/stablecoins'
						}
					>
						Stablecoins
					</DashboardLink>
				</Link>
				<Link href={`/chain/${selectedChain}/volume`} passHref>
					<DashboardLink active={router.pathname === '/chain/[chain]/volume'}>Volume</DashboardLink>
				</Link>
			</DashboardLinks>

			<Wrapper>{children}</Wrapper>
		</>
	)
}

const AnnouncementWrapper = styled(Announcement)`
	margin: -20px 0 0px;

	@media screen and (max-width: ${({ theme }) => theme.bpLg}) {
		display: none;
	}
`

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 48px;
	padding: 24px 24px 0;
	background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(246, 246, 246, 0.6)')};
	border-radius: 0;
	border: 1px solid ${({ theme }) => theme.divider};
	border-top: 0;

	@media screen and (min-width: 80rem) {
		flex-direction: row;
		flex-wrap: wrap;
		padding: 40px 40px 0;
	}
`

interface IDashboardLink {
	active?: boolean
}

const DashboardLinks = styled.nav`
	display: none;
	flex-wrap: wrap;
	background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(246, 246, 246, 0.6)')};
	border: 1px solid ${({ theme }) => theme.divider};
	margin-bottom: -28px;

	@media screen and (min-width: 80rem) {
		display: flex;
	}
`

const DashboardLink = styled.a<IDashboardLink>`
	padding: 8px 24px;
	white-space: nowrap;
	font-weight: 500;
	border-radius: 0px;

	& + & {
		border-left: ${({ theme }) => '1px solid ' + theme.divider};
	}

	border-bottom: ${({ active, theme }) => '1px solid ' + (active ? primaryColor : theme.divider)};

	:hover,
	:focus-visible {
		background-color: ${() => transparentize(0.9, primaryColor)};
	}
`
