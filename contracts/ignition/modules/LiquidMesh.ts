import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('LiquidMeshModule', (m) => {
	// Step 1: Deploy WrappedSTT (wSTT)
	const wrappedSTT = m.contract('WrappedSTT')

	// Step 2: Deploy MockUSDC
	const mockUSDC = m.contract('MockUSDC')

	// Step 3: Deploy LiquidityVault with wSTT + MockUSDC addresses
	const liquidityVault = m.contract('LiquidityVault', [wrappedSTT, mockUSDC])

	// Step 4: Deploy AgentExecutor with LiquidityVault address
	const agentExecutor = m.contract('AgentExecutor', [liquidityVault])

	// Step 5: Transfer vault ownership to AgentExecutor
	// This allows AgentExecutor to call updatePosition on the vault
	m.call(liquidityVault, 'transferOwnership', [agentExecutor])

	return { wrappedSTT, mockUSDC, liquidityVault, agentExecutor }
})
