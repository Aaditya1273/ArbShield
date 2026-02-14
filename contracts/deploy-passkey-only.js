// Deploy only PasskeyRegistry contract
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Load environment variables
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xaba99cc3922a2229d169325437e68753864685026a900fd753b27735fd9839df';
const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc';

async function compileContract() {
    console.log('📦 Compiling PasskeyRegistry.sol...\n');

    const contractPath = path.join(__dirname, 'src/PasskeyRegistry.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'PasskeyRegistry.sol': {
                content: source
            }
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ Compilation errors:');
            errors.forEach(err => console.error(err.formattedMessage));
            process.exit(1);
        }
    }

    const contract = output.contracts['PasskeyRegistry.sol']['PasskeyRegistry'];
    return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object
    };
}

async function deploy() {
    console.log('🚀 Starting PasskeyRegistry deployment to Arbitrum Sepolia...\n');

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('Deployer address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH\n');
    
    if (balance === 0n) {
        console.error('❌ No ETH balance! Get testnet ETH from: https://faucet.quicknode.com/arbitrum/sepolia');
        process.exit(1);
    }

    try {
        // Compile contract
        const { abi, bytecode } = await compileContract();
        console.log('✅ Contract compiled successfully\n');

        // Deploy PasskeyRegistry
        console.log('📝 Deploying PasskeyRegistry...');
        const PasskeyRegistryFactory = new ethers.ContractFactory(
            abi,
            bytecode,
            wallet
        );
        
        const passkeyRegistry = await PasskeyRegistryFactory.deploy();
        console.log('⏳ Waiting for deployment transaction...');
        
        await passkeyRegistry.waitForDeployment();
        const passkeyRegistryAddress = await passkeyRegistry.getAddress();
        
        console.log('✅ PasskeyRegistry deployed at:', passkeyRegistryAddress);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DEPLOYMENT COMPLETE!');
        console.log('='.repeat(60));
        console.log('\nContract Address:');
        console.log('PasskeyRegistry:', passkeyRegistryAddress);
        console.log('\nNetwork: Arbitrum Sepolia (Chain ID: 421614)');
        console.log('Explorer: https://sepolia.arbiscan.io/address/' + passkeyRegistryAddress);
        console.log('\n📝 Add this to your .env.local:');
        console.log('NEXT_PUBLIC_PASSKEY_REGISTRY=' + passkeyRegistryAddress);
        console.log('='.repeat(60));

        // Update deployed-addresses.json
        const addressesPath = path.join(__dirname, 'deployed-addresses.json');
        let addresses = {};
        
        if (fs.existsSync(addressesPath)) {
            addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
        }

        addresses.contracts = addresses.contracts || {};
        addresses.contracts.PasskeyRegistry = passkeyRegistryAddress;
        addresses.lastUpdated = new Date().toISOString();

        fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
        console.log('\n💾 Address saved to contracts/deployed-addresses.json');

        // Save ABI
        const abiPath = path.join(__dirname, 'out/PasskeyRegistry.abi.json');
        fs.mkdirSync(path.dirname(abiPath), { recursive: true });
        fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
        console.log('💾 ABI saved to contracts/out/PasskeyRegistry.abi.json');

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        if (error.data) {
            console.error('Error data:', error.data);
        }
        process.exit(1);
    }
}

// Run deployment
deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
