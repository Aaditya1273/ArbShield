// Simple deployment script using ethers.js
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const PRIVATE_KEY = '0xaba99cc3922a2229d169325437e68753864685026a900fd753b27735fd9839df';
const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';

// Contract ABIs and Bytecode (we'll read from compiled files)
async function deploy() {
    console.log('🚀 Starting deployment to Arbitrum Sepolia...\n');

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
        // Read compiled contracts
        const zkVerifierPath = path.join(__dirname, 'out/ZKVerifier.sol/ZKVerifier.json');
        const registryPath = path.join(__dirname, 'out/ComplianceRegistry.sol/ComplianceRegistry.json');
        const buidlPath = path.join(__dirname, 'out/MockBUIDL.sol/MockBUIDL.json');

        const zkVerifierArtifact = JSON.parse(fs.readFileSync(zkVerifierPath, 'utf8'));
        const registryArtifact = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        const buidlArtifact = JSON.parse(fs.readFileSync(buidlPath, 'utf8'));

        // 1. Deploy ZKVerifier
        console.log('📝 Deploying ZKVerifier...');
        const stylusVerifierPlaceholder = '0x1111111111111111111111111111111111111111';
        
        const ZKVerifierFactory = new ethers.ContractFactory(
            zkVerifierArtifact.abi,
            zkVerifierArtifact.bytecode.object,
            wallet
        );
        
        const zkVerifier = await ZKVerifierFactory.deploy(stylusVerifierPlaceholder);
        await zkVerifier.waitForDeployment();
        const zkVerifierAddress = await zkVerifier.getAddress();
        console.log('✅ ZKVerifier deployed at:', zkVerifierAddress);

        // 2. Deploy ComplianceRegistry
        console.log('\n📝 Deploying ComplianceRegistry...');
        const RegistryFactory = new ethers.ContractFactory(
            registryArtifact.abi,
            registryArtifact.bytecode.object,
            wallet
        );
        
        const registry = await RegistryFactory.deploy();
        await registry.waitForDeployment();
        const registryAddress = await registry.getAddress();
        console.log('✅ ComplianceRegistry deployed at:', registryAddress);

        // 3. Grant VERIFIER_ROLE to ZKVerifier
        console.log('\n📝 Granting VERIFIER_ROLE...');
        const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('VERIFIER_ROLE'));
        const grantTx = await registry.grantRole(VERIFIER_ROLE, zkVerifierAddress);
        await grantTx.wait();
        console.log('✅ VERIFIER_ROLE granted to ZKVerifier');

        // 4. Deploy MockBUIDL
        console.log('\n📝 Deploying MockBUIDL...');
        const BUIDLFactory = new ethers.ContractFactory(
            buidlArtifact.abi,
            buidlArtifact.bytecode.object,
            wallet
        );
        
        const buidl = await BUIDLFactory.deploy(registryAddress);
        await buidl.waitForDeployment();
        const buidlAddress = await buidl.getAddress();
        console.log('✅ MockBUIDL deployed at:', buidlAddress);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DEPLOYMENT COMPLETE!');
        console.log('='.repeat(60));
        console.log('\nContract Addresses:');
        console.log('-------------------');
        console.log('ZKVerifier:         ', zkVerifierAddress);
        console.log('ComplianceRegistry: ', registryAddress);
        console.log('MockBUIDL:          ', buidlAddress);
        console.log('\nNetwork: Arbitrum Sepolia (Chain ID: 421614)');
        console.log('Explorer: https://sepolia.arbiscan.io/');
        console.log('\nView contracts:');
        console.log('- ZKVerifier:          https://sepolia.arbiscan.io/address/' + zkVerifierAddress);
        console.log('- ComplianceRegistry:  https://sepolia.arbiscan.io/address/' + registryAddress);
        console.log('- MockBUIDL:           https://sepolia.arbiscan.io/address/' + buidlAddress);
        console.log('\n📝 Next steps:');
        console.log('1. Update lib/contracts.ts with these addresses');
        console.log('2. Deploy Stylus Rust verifier (optional)');
        console.log('3. Test the frontend!');
        console.log('='.repeat(60));

        // Save addresses to file
        const addresses = {
            network: 'Arbitrum Sepolia',
            chainId: 421614,
            contracts: {
                ZKVerifier: zkVerifierAddress,
                ComplianceRegistry: registryAddress,
                MockBUIDL: buidlAddress,
                StylusVerifier: stylusVerifierPlaceholder
            },
            deployer: wallet.address,
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync(
            path.join(__dirname, 'deployed-addresses.json'),
            JSON.stringify(addresses, null, 2)
        );
        console.log('\n💾 Addresses saved to contracts/deployed-addresses.json');

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
