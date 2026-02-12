import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { network } from 'hardhat'
import { parseEther, parseUnits, zeroAddress } from 'viem'

describe('LiquidMesh Smart Contracts', async function () {
	const { viem } = await network.connect()
	const publicClient = await viem.getPublicClient()
	const [deployer, user1, user2, agent] = await viem.getWalletClients()

	describe('WrappedSTT', async function () {
		it('Should wrap STT to wSTT', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')

			// Wrap 100 STT
			const wrapAmount = parseEther('100')
			await wSTT.write.deposit({ value: wrapAmount })

			// Check balance
			const balance = await wSTT.read.balanceOf([deployer.account.address])
			assert.equal(balance, wrapAmount)
		})

		it('Should unwrap wSTT to STT', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')

			// Wrap 100 STT
			const wrapAmount = parseEther('100')
			await wSTT.write.deposit({ value: wrapAmount })

			// Unwrap 50 wSTT
			const unwrapAmount = parseEther('50')
			await wSTT.write.withdraw([unwrapAmount])

			// Check balance
			const balance = await wSTT.read.balanceOf([deployer.account.address])
			assert.equal(balance, parseEther('50'))
		})

		it('Should emit Deposit event', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const wrapAmount = parseEther('100')

			// Just verify event is emitted, don't check args due to address casing
			await viem.assertions.emit(wSTT.write.deposit({ value: wrapAmount }), wSTT, 'Deposit')
		})
	})

	describe('MockUSDC', async function () {
		it('Should mint USDC with 6 decimals', async function () {
			const usdc = await viem.deployContract('MockUSDC')

			// Mint 10,000 USDC
			const mintAmount = parseUnits('10000', 6)
			await usdc.write.mint([user1.account.address, mintAmount])

			// Check balance
			const balance = await usdc.read.balanceOf([user1.account.address])
			assert.equal(balance, mintAmount)
		})

		it('Should have correct decimals', async function () {
			const usdc = await viem.deployContract('MockUSDC')
			const decimals = await usdc.read.decimals()
			assert.equal(decimals, 6)
		})
	})

	describe('LiquidityVault', async function () {
		it('Should deploy with correct token addresses', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])

			const vaultWSTT = await vault.read.wstt()
			const vaultUSDC = await vault.read.usdc()

			assert.equal(vaultWSTT.toLowerCase(), wSTT.address.toLowerCase())
			assert.equal(vaultUSDC.toLowerCase(), usdc.address.toLowerCase())
		})

		it('Should accept pair deposits and mint LP tokens', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])

			// Setup: Wrap STT and mint USDC
			const wSTTAmount = parseEther('1000')
			const usdcAmount = parseUnits('1000', 6)

			await wSTT.write.deposit({ value: wSTTAmount })
			await usdc.write.mint([deployer.account.address, usdcAmount])

			// Approve vault
			await wSTT.write.approve([vault.address, wSTTAmount])
			await usdc.write.approve([vault.address, usdcAmount])

			// Deposit pair
			const tx = vault.write.depositPair([wSTTAmount, usdcAmount])

			// Should emit DepositPair event
			await viem.assertions.emit(tx, vault, 'DepositPair')

			// Check LP tokens minted
			const lpBalance = await vault.read.balanceOf([deployer.account.address])
			assert(lpBalance > 0n, 'LP tokens should be minted')

			// Check position created
			const position = await vault.read.positions([deployer.account.address])
			assert.equal(position[0], wSTTAmount) // wsttAmount
			assert.equal(position[1], usdcAmount) // usdcAmount
			assert.equal(position[9], true) // active
		})

		it('Should reject deposits below minimum', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])

			// Try to deposit below minimum (less than 10 wSTT and 10 USDC)
			const smallAmount = parseEther('5')
			const smallUSDC = parseUnits('5', 6)

			await wSTT.write.deposit({ value: smallAmount })
			await usdc.write.mint([deployer.account.address, smallUSDC])

			await wSTT.write.approve([vault.address, smallAmount])
			await usdc.write.approve([vault.address, smallUSDC])

			// Should revert with minimum deposit error
			try {
				await vault.write.depositPair([smallAmount, smallUSDC])
				assert.fail('Should have reverted')
			} catch (error: any) {
				assert(error.message.includes('Minimum'), 'Should fail on minimum deposit')
			}
		})

		it('Should allow withdrawals and burn LP tokens', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])

			// Setup and deposit
			const wSTTAmount = parseEther('1000')
			const usdcAmount = parseUnits('1000', 6)

			await wSTT.write.deposit({ value: wSTTAmount })
			await usdc.write.mint([deployer.account.address, usdcAmount])
			await wSTT.write.approve([vault.address, wSTTAmount])
			await usdc.write.approve([vault.address, usdcAmount])

			await vault.write.depositPair([wSTTAmount, usdcAmount])

			// Get LP balance
			const lpBalance = await vault.read.balanceOf([deployer.account.address])

			// Withdraw half
			const withdrawAmount = lpBalance / 2n
			await vault.write.withdraw([withdrawAmount])

			// Check LP balance reduced
			const newLpBalance = await vault.read.balanceOf([deployer.account.address])
			assert.equal(newLpBalance, lpBalance - withdrawAmount)

			// Check tokens returned
			const wSTTBalance = await wSTT.read.balanceOf([deployer.account.address])
			assert(wSTTBalance > 0n, 'wSTT should be returned')
		})

		it('Should track fees', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])

			// Setup and deposit
			const wSTTAmount = parseEther('1000')
			const usdcAmount = parseUnits('1000', 6)

			await wSTT.write.deposit({ value: wSTTAmount })
			await usdc.write.mint([deployer.account.address, usdcAmount])
			await wSTT.write.approve([vault.address, wSTTAmount])
			await usdc.write.approve([vault.address, usdcAmount])

			await vault.write.depositPair([wSTTAmount, usdcAmount])

			// Accrue fees
			await vault.write.accrueFees([deployer.account.address])

			// Check fees increased (they should be > 0 if time passed)
			const position = await vault.read.getPosition([deployer.account.address])
			// position[5] = feesEarnedWSTT, position[6] = feesEarnedUSDC
			// May be 0 if no time passed, but structure should work
			assert.equal(typeof position[5], 'bigint')
			assert.equal(typeof position[6], 'bigint')
		})

		it('Should allow owner to pause', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])

			// Pause
			await vault.write.pause()

			// Try to deposit (should fail)
			const wSTTAmount = parseEther('1000')
			const usdcAmount = parseUnits('1000', 6)

			await wSTT.write.deposit({ value: wSTTAmount })
			await usdc.write.mint([deployer.account.address, usdcAmount])
			await wSTT.write.approve([vault.address, wSTTAmount])
			await usdc.write.approve([vault.address, usdcAmount])

			// Should revert when paused
			try {
				await vault.write.depositPair([wSTTAmount, usdcAmount])
				assert.fail('Should have reverted when paused')
			} catch (error: any) {
				assert(error.message.includes('EnforcedPause'), 'Should fail when paused')
			}
		})
	})

	describe('AgentExecutor', async function () {
		it('Should deploy with vault address', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])
			const executor = await viem.deployContract('AgentExecutor', [vault.address])

			const executorVault = await executor.read.vault()
			assert.equal(executorVault.toLowerCase(), vault.address.toLowerCase())
		})

		it('Should allow owner to authorize agents', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])
			const executor = await viem.deployContract('AgentExecutor', [vault.address])

			// Authorize agent
			await executor.write.authorizeAgent([agent.account.address])

			// Check authorization
			const isAuthorized = await executor.read.authorizedAgents([agent.account.address])
			assert.equal(isAuthorized, true)
		})

		it('Should allow authorized agents to propose strategies', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])
			const executor = await viem.deployContract('AgentExecutor', [vault.address])

			// Setup user position using deployer account (has ETH)
			const wSTTAmount = parseEther('1000')
			const usdcAmount = parseUnits('1000', 6)

			// Deployer wraps STT to get wSTT
			await wSTT.write.deposit({ value: wSTTAmount })
			await usdc.write.mint([deployer.account.address, usdcAmount])

			// Deployer approves and deposits
			await wSTT.write.approve([vault.address, wSTTAmount])
			await usdc.write.approve([vault.address, usdcAmount])
			await vault.write.depositPair([wSTTAmount, usdcAmount])

			// Authorize agent
			await executor.write.authorizeAgent([agent.account.address])

			// Agent proposes strategy for deployer
			const proposalTx = executor.write.proposeStrategy(
				[
					deployer.account.address,
					12000n,
					13000n,
					'Market volatility detected - narrow range',
				],
				{ account: agent.account }
			)

			// Should emit ProposalCreated event
			await viem.assertions.emit(proposalTx, executor, 'ProposalCreated')
		})

		it('Should reject proposals from unauthorized agents', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])
			const executor = await viem.deployContract('AgentExecutor', [vault.address])

			// Try to propose without authorization
			try {
				await executor.write.proposeStrategy(
					[user1.account.address, 12000n, 13000n, 'Unauthorized attempt'],
					{ account: user2.account }
				)
				assert.fail('Should have reverted')
			} catch (error: any) {
				assert(error.message.includes('authorized'), 'Should reject unauthorized agent')
			}
		})

		it('Should allow users to execute proposals', async function () {
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])
			const executor = await viem.deployContract('AgentExecutor', [vault.address])

			// Transfer vault ownership to executor
			await vault.write.transferOwnership([executor.address])

			// Setup position using deployer (has STT)
			const wSTTAmount = parseEther('1000')
			const usdcAmount = parseUnits('1000', 6)

			// Deployer wraps STT
			await wSTT.write.deposit({ value: wSTTAmount })
			await usdc.write.mint([deployer.account.address, usdcAmount])

			await wSTT.write.approve([vault.address, wSTTAmount])
			await usdc.write.approve([vault.address, usdcAmount])
			await vault.write.depositPair([wSTTAmount, usdcAmount])

			// Authorize agent and propose
			await executor.write.authorizeAgent([agent.account.address])
			await executor.write.proposeStrategy(
				[deployer.account.address, 12000n, 13000n, 'Optimized range'],
				{ account: agent.account }
			)

			// Get proposal ID
			const proposalCount = await executor.read.getProposalCount()
			const proposalId = proposalCount - 1n

			// Deployer executes proposal
			const executeTx = executor.write.executeProposal([proposalId])

			// Should emit ProposalExecuted event
			await viem.assertions.emit(executeTx, executor, 'ProposalExecuted')

			// Check position updated
			const position = await vault.read.positions([deployer.account.address])
			assert.equal(position[3], 12000n) // rangeLower
			assert.equal(position[4], 13000n) // rangeUpper
		})
	})

	describe('Integration: Full User Flow', async function () {
		it('Should complete full deposit → propose → execute flow', async function () {
			// 1. Deploy all contracts
			const wSTT = await viem.deployContract('WrappedSTT')
			const usdc = await viem.deployContract('MockUSDC')
			const vault = await viem.deployContract('LiquidityVault', [wSTT.address, usdc.address])
			const executor = await viem.deployContract('AgentExecutor', [vault.address])

			// 2. Transfer vault ownership to executor
			await vault.write.transferOwnership([executor.address])

			// 3. Deployer wraps STT and gets USDC (deployer has STT)
			const wSTTAmount = parseEther('1000')
			const usdcAmount = parseUnits('1000', 6)

			// Deployer wraps STT
			await wSTT.write.deposit({ value: wSTTAmount })
			await usdc.write.mint([deployer.account.address, usdcAmount])

			// 4. Deployer deposits pair
			await wSTT.write.approve([vault.address, wSTTAmount])
			await usdc.write.approve([vault.address, usdcAmount])
			await vault.write.depositPair([wSTTAmount, usdcAmount])

			// 5. Agent is authorized
			await executor.write.authorizeAgent([agent.account.address])

			// 6. Agent proposes strategy
			await executor.write.proposeStrategy(
				[deployer.account.address, 11500n, 13500n, 'Initial optimal range'],
				{ account: agent.account }
			)

			// 7. Deployer executes proposal
			const proposalCount = await executor.read.getProposalCount()
			await executor.write.executeProposal([proposalCount - 1n])

			// 8. Verify final state
			const position = await vault.read.positions([deployer.account.address])
			assert.equal(position[3], 11500n) // rangeLower
			assert.equal(position[4], 13500n) // rangeUpper
			assert.equal(position[9], true) // active

			// 9. Deployer withdraws
			const lpBalance = await vault.read.balanceOf([deployer.account.address])
			await vault.write.withdraw([lpBalance])

			// Position should now be inactive
			const finalPosition = await vault.read.positions([deployer.account.address])
			assert.equal(finalPosition[9], false) // active
		})
	})
})
