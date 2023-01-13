import * as React from 'react'
import styled from 'styled-components'
import { useComboboxState } from 'ariakit'
import { SearchWrapper } from '../v2Base'
import type { IDefiFiltersProps } from './types'
import { findActiveItem } from '~/components/Search/Base/utils'
import { Input } from '~/components/Search/Base/Input'
import { DesktopResults } from '~/components/Search/Base/Results/Desktop'
import { RowLinksWithDropdown } from '../common'
import { TvlFiltersV2 } from '../protocols/v2/IncludeInTvl'

export function DefiFiltersV2({ chainsList, selectedChain = 'All' }: IDefiFiltersProps) {
	const combobox = useComboboxState({
		gutter: 6,
		sameWidth: true,
		list: chainsList.map((x) => x.name)
	})

	// select first item on open
	const item = findActiveItem(combobox)
	const firstId = combobox.first()

	if (combobox.open && !item && firstId) {
		combobox.setActiveId(firstId)
	}

	return (
		<Wrapper>
			<Search>
				<div>
					<Input state={combobox} placeholder="Search..." withValue variant="secondary" />

					<DesktopResults state={combobox} data={chainsList} loading={false} />
				</div>
			</Search>

			<ChainList>
				<RowLinksWithDropdown links={chainsList} activeLink={selectedChain} />
			</ChainList>

			{/* <FiltersWrapper>
				<TvlFiltersV2 />
			</FiltersWrapper> */}
		</Wrapper>
	)
}

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
	background: ${({ theme }) => (theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(246, 246, 246, 0.6)')};

	margin: -8px 0 -24px;

	@media screen and (min-width: 80rem) {
		margin: -20px 0 -28px;
	}
`

const ChainList = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	overflow: hidden;

	ul {
		margin-left: -4px;
	}

	@media screen and (max-width: ${({ theme }) => theme.bpLg}) {
		button {
			width: 100%;
		}

		ul {
			margin-left: 0;
		}
	}
`

const Search = styled(SearchWrapper)`
	position: relative;

	input {
		width: 100%;
		background: ${({ theme }) => (theme.mode === 'dark' ? 'black' : 'white')} !important;
	}

	@media screen and (max-width: ${({ theme }) => theme.bpLg}) {
		display: none;
	}
`

const FiltersWrapper = styled.div`
	display: flex;
	gap: 12px;
	flex-wrap: wrap;

	@media screen and (max-width: ${({ theme }) => theme.bpLg}) {
		display: none;
	}
`
