import { ethers } from 'hardhat'
import fs from 'fs'

async function main() {
	console.log('🚀 Deploying LiquidMesh contracts to Somnia Testnet...\n')

	// Step 1: Deploy WrappedSTT
	console.log('📦 Deploying WrappedSTT...')
	const WrappedSTT = await ethers.getContractFactory('WrappedSTT')
	const wrappedSTT = await WrappedSTT.deploy()
	await wrappedSTT.waitForDeployment()
	const wSTTAddress = await wrappedSTT.getAddress()
	console.log(`✅ WrappedSTT deployed to: ${wSTTAddress}\n`)

	// Step 2: Deploy MockUSDC
	console.log('📦 Deploying MockUSDC...')
	const MockUSDC = await ethers.getContractFactory('MockUSDC')
	const mockUSDC = await MockUSDC.deploy()
	await mockUSDC.waitForDeployment()
	const usdcAddress = await mockUSDC.getAddress()
	console.log(`✅ MockUSDC deployed to: ${usdcAddress}\n`)

	// Step 3: Deploy LiquidityVault
	console.log('📦 Deploying LiquidityVault...')
	const LiquidityVault = await ethers.getContractFactory('LiquidityVault')
	const liquidityVault = await LiquidityVault.deploy(wSTTAddress, usdcAddress)
	await liquidityVault.waitForDeployment()
	const vaultAddress = await liquidityVault.getAddress()
	console.log(`✅ LiquidityVault deployed to: ${vaultAddress}\n`)

	// Step 4: Deploy AgentExecutor
	console.log('📦 Deploying AgentExecutor...')
	const AgentExecutor = await ethers.getContractFactory('AgentExecutor')
	const agentExecutor = await AgentExecutor.deploy(vaultAddress)
	await agentExecutor.waitForDeployment()
	const executorAddress = await agentExecutor.getAddress()
	console.log(`✅ AgentExecutor deployed to: ${executorAddress}\n`)

	// Step 5: Transfer vault ownership to AgentExecutor
	console.log('🔑 Transferring vault ownership to AgentExecutor...')
	const tx = await liquidityVault.transferOwnership(executorAddress)
	await tx.wait()
	console.log('✅ Ownership transferred!\n')

	// Save deployment info
	const deploymentInfo = {
		network: 'somnia-testnet',
		chainId: 50312,
		timestamp: new Date().toISOString(),
		contracts: {
			WrappedSTT: wSTTAddress,
			MockUSDC: usdcAddress,
			LiquidityVault: vaultAddress,
			AgentExecutor: executorAddress,
		},
	}

	// Summary
	console.log('='.repeat(60))
	console.log('📋 DEPLOYMENT SUMMARY')
	console.log('='.repeat(60))
	console.log(`WrappedSTT:      ${wSTTAddress}`)
	console.log(`MockUSDC:        ${usdcAddress}`)
	console.log(`LiquidityVault:  ${vaultAddress}`)
	console.log(`AgentExecutor:   ${executorAddress}`)
	console.log('='.repeat(60))

	// Save to file for agents to use
	fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2))
	console.log('\n💾 Deployment info saved to deployment.json')

	console.log('\n🎉 All contracts deployed successfully!')
	console.log('\n📝 To verify contracts, run:')
	console.log(`npx hardhat verify --network somnia ${wSTTAddress}`)
	console.log(`npx hardhat verify --network somnia ${usdcAddress}`)
	console.log(`npx hardhat verify --network somnia ${vaultAddress} ${wSTTAddress} ${usdcAddress}`)
	console.log(`npx hardhat verify --network somnia ${executorAddress} ${vaultAddress}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Deployment failed:', error)
		process.exit(1)
	})
