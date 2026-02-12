'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import type { AgentThought, LiquidityPosition, PoolMetrics } from '@/lib/types'

// Fetch agent thoughts via Next.js API route
export function useAgentThoughts(agent?: string) {
	const query = useQuery({
		queryKey: ['agent-thoughts', agent],
		queryFn: async () => {
			const url = agent ? `/api/thoughts/${agent}` : '/api/thoughts'
			try {
				const response = await fetch(url)
				if (response.ok) {
					const data = (await response.json()) as AgentThought[]
					if (Array.isArray(data) && data.length > 0) return data
				}
				// Fallback to demo snapshot
				const demo = await fetch('/demo/thoughts.json')
					.then((r) => r.json())
					.catch(() => [])
				return Array.isArray(demo) ? demo : []
			} catch {
				const demo = await fetch('/demo/thoughts.json')
					.then((r) => r.json())
					.catch(() => [])
				return Array.isArray(demo) ? demo : []
			}
		},
		refetchInterval: 5000, // Poll every 5 seconds
		staleTime: 3000,
		retry: 2,
	})

	useEffect(() => {
		if (query.isError) {
			toast.error('Failed to load agent activity', {
				description: query.error?.message || 'Unknown error',
			})
		}
	}, [query.isError, query.error])

	return query
}

// Fetch liquidity positions via Next.js API route
export function useLiquidityPositions() {
	const query = useQuery({
		queryKey: ['liquidity-positions'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/positions')
				if (response.ok) {
					const data = (await response.json()) as LiquidityPosition[]
					if (Array.isArray(data) && data.length > 0) return data
				}
				const demo = await fetch('/demo/positions.json')
					.then((r) => r.json())
					.catch(() => [])
				return Array.isArray(demo) ? demo : []
			} catch {
				const demo = await fetch('/demo/positions.json')
					.then((r) => r.json())
					.catch(() => [])
				return Array.isArray(demo) ? demo : []
			}
		},
		refetchInterval: 10000, // Poll every 10 seconds
		staleTime: 5000,
		retry: 2,
	})

	useEffect(() => {
		if (query.isError) {
			toast.error('Failed to load positions', {
				description: query.error?.message || 'Unknown error',
			})
		}
	}, [query.isError, query.error])

	return query
}

// Fetch pool metrics via Next.js API route
export function usePoolMetrics() {
	const query = useQuery({
		queryKey: ['pool-metrics'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/positions/pools')
				if (response.ok) {
					const data = (await response.json()) as PoolMetrics[]
					if (Array.isArray(data) && data.length > 0) return data
				}
				const demo = await fetch('/demo/pools.json')
					.then((r) => r.json())
					.catch(() => [])
				return Array.isArray(demo) ? demo : []
			} catch {
				const demo = await fetch('/demo/pools.json')
					.then((r) => r.json())
					.catch(() => [])
				return Array.isArray(demo) ? demo : []
			}
		},
		refetchInterval: 15000, // Poll every 15 seconds
		staleTime: 10000,
		retry: 2,
	})

	useEffect(() => {
		if (query.isError) {
			toast.error('Failed to load pool metrics', {
				description: query.error?.message || 'Unknown error',
			})
		}
	}, [query.isError, query.error])

	return query
}

// Fetch agent status
export function useAgentStatus() {
	const query = useQuery({
		queryKey: ['agent-status'],
		queryFn: async () => {
			const response = await fetch('/api/agents/status')
			if (!response.ok) {
				const error = await response.json().catch(() => ({ error: 'Unknown error' }))
				throw new Error(error.error || 'Failed to fetch agent status')
			}
			return await response.json()
		},
		refetchInterval: 10000, // Poll every 10 seconds
		staleTime: 5000,
		retry: 2,
	})

	useEffect(() => {
		if (query.isError) {
			toast.error('Failed to load agent status', {
				description: query.error?.message || 'Unknown error',
			})
		}
	}, [query.isError, query.error])

	return query
}

// Calculate total TVL and APY
export function useDashboardStats() {
	const { data: positionsResp } = useLiquidityPositions()
	const { data: poolsResp } = usePoolMetrics()

	const positions = Array.isArray(positionsResp) ? positionsResp : []
	const pools = Array.isArray(poolsResp) ? poolsResp : []

	const totalTVL = positions.reduce((sum, pos: any) => sum + (pos.liquidityUSD || 0), 0)
	const avgAPY =
		positions.length > 0
			? positions.reduce((sum: number, pos: any) => sum + (pos.apy || 0), 0) /
			  positions.length
			: 0
	const activePositions = positions.filter((pos: any) => pos.inRange).length

	return {
		totalTVL,
		avgAPY,
		activePositions,
		totalPositions: positions.length,
		pools,
	}
}
