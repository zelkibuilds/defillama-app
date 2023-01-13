export interface IDropdownMenusProps {
	pathname?: string
}

export interface IDefiFiltersProps extends IDropdownMenusProps {
	header: string
	chainsList: Array<{ name: string; route: string; label: string; to: string }>
	trackingStats?: string
	selectedChain: string
}
