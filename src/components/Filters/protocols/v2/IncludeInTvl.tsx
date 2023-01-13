import { SelectArrow } from 'ariakit/select'
import HeadHelp from '~/components/HeadHelp'
import { Checkbox } from '~/components'
import { protocolsAndChainsOptions } from '../options'
import { SelectItem, SelectPopover, SelectButton } from '../../common'
import { useProtocolsFilterState } from '../useProtocolFilterState'
import { useSetPopoverStyles } from '~/components/Popover/utils'

export function TvlFiltersV2() {
	const select = useProtocolsFilterState({ sameWidth: true })

	const [isLarge] = useSetPopoverStyles()

	return (
		<>
			<SelectButton state={select}>
				<span>{renderValue(select.value)}</span>
				<SelectArrow />
			</SelectButton>
			{select.mounted && (
				<SelectPopover state={select} modal={!isLarge}>
					{protocolsAndChainsOptions.map(({ key, name, help }) => (
						<SelectItem key={key} value={key}>
							{help ? <HeadHelp title={name} text={help} /> : name}
							<Checkbox checked={select.value.includes(key)} />
						</SelectItem>
					))}
				</SelectPopover>
			)}
		</>
	)
}

function renderValue(value: string[]) {
	if (value.length === 0) return 'Include in TVL'

	const labels = value.map((val) => protocolsAndChainsOptions.find((e) => e.key === val)?.name ?? val)

	return (
		<>
			<span>Include in TVL : </span>
			<span data-selecteditems>
				{labels.length > 2 ? `${labels[0]} + ${labels.length - 1} others` : labels.join(', ')}
			</span>
		</>
	)
}
