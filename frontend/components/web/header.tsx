'use client'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { env } from '@/env'

const menuItems = [
	{ name: 'Features', href: '#features' },
	{ name: 'How It Works', href: '#how-it-works' },
	{ name: 'FAQ', href: '#faqs' },
	{ name: 'Docs', href: 'https://docs.liquidmeshfi.xyz' },
]

export const HeroHeader = () => {
	const [menuState, setMenuState] = React.useState(false)
	const [isScrolled, setIsScrolled] = React.useState(false)

	React.useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50)
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<header>
			<nav data-state={menuState && 'active'} className="fixed z-20 w-full px-2 top-0">
				<div
					className={cn(
						'mx-auto mt-2 max-w-7xl px-6 lg:px-12 transition-all duration-300',
						isScrolled &&
							'bg-background/50 rounded-2xl border supports-[backdrop-filter]:bg-background/30 backdrop-blur-lg shadow-sm lg:px-8'
					)}
				>
					<div
						className={cn(
							'relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4',
							isScrolled && 'py-2 lg:py-2'
						)}
					>
						<div className="flex w-full justify-between lg:w-auto">
							<Link
								href="/"
								aria-label="home"
								className="flex items-center space-x-2"
							>
								<Image
									src="/icon.png"
									alt="LiquidMesh"
									width={24}
									height={24}
									priority
									className="rounded-full"
								/>
								<span
									className={cn(
										'text-xl font-bold transition-colors',
										isScrolled
											? 'text-foreground'
											: 'text-neutral-900/80 dark:text-neutral-100'
									)}
								>
									LiquidMesh
								</span>
							</Link>

							<button
								type="button"
								onClick={() => setMenuState(!menuState)}
								aria-label={menuState === true ? 'Close Menu' : 'Open Menu'}
								className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
							>
								<Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
								<X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
							</button>
						</div>

						<div className="absolute inset-0 m-auto hidden size-fit lg:block">
							<ul className="flex gap-8 text-base">
								{menuItems.map((item) => (
									<li key={item.name}>
										<Link
											href={item.href}
											className="text-muted-foreground hover:text-accent-foreground block duration-150 text-base"
											onClick={() => setMenuState(false)}
										>
											<span>{item.name}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
							<div className="lg:hidden">
								<ul className="space-y-6 text-base font-medium">
									{menuItems.map((item) => (
										<li key={item.name}>
											<Link
												href={item.href}
												className="text-muted-foreground hover:text-accent-foreground block duration-150 font-medium"
												onClick={() => setMenuState(false)}
											>
												<span>{item.name}</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
								<Button
									asChild
									size="lg"
									variant="gradient"
									className={cn(
										'rounded-md text-base px-8 py-3',
										isScrolled && 'lg:hidden'
									)}
								>
									<Link
										href="/dashboard"
										target="_blank"
										rel="noopener noreferrer"
									>
										<span>Launch App</span>
									</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="gradient"
									className={cn(
										'text-base px-8 py-3 rounded-md',
										isScrolled ? 'lg:inline-flex' : 'hidden'
									)}
								>
									<Link
										href="/dashboard"
										target="_blank"
										rel="noopener noreferrer"
									>
										<span>Launch App</span>
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</header>
	)
}
