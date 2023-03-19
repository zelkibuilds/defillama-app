import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/future/image'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import logoLight from '~/public/logo.png'
import { Header, LogoWrapper } from '../shared'
import { Menu } from './Menu'
import { Settings } from './Settings'

const MobileSearch = dynamic(() => import('~/components/Search/Base/Mobile'), {
	ssr: false,
	loading: () => <></>
}) as React.FC

export default function MobileNav() {
	const router = useRouter()

	return (
		<Wrapper>
			<Link href="/" passHref>
				<LogoWrapper>
					<Image src={logoLight} alt="=" priority />

					<span>Llama.Fi</span>
				</LogoWrapper>
			</Link>

			{!router.pathname.startsWith('/yield') && !router.pathname.startsWith('/raises') && <MobileSearch />}

			<Settings />
			<Menu />
		</Wrapper>
	)
}

const Wrapper = styled(Header)`
	display: flex;
	z-index: 10;

	button {
		flex-shrink: 0;
	}

	@media (min-width: ${({ theme: { bpLg } }) => bpLg}) {
		display: none;
	}
`
