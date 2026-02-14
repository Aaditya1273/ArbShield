// Test script to verify the ZKVerifier contract works
const { ethers } = require('ethers');

const PRIVATE_KEY = '0xaba99cc3922a2229d169325437e68753864685026a900fd753b27735fd9839df';
const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
const ZK_VERIFIER_ADDRESS = '0xEa53E2fF08CD18fD31B188a72079aE9Ca34856e4';

const ZK_VERIFIER_ABI = [
    "function verifyProof(bytes calldata proof, string calldata attributeType) external returns (bool)",
    "function userCompliance(address user, string calldata attributeType) external view returns (bool)"
];

async function testVerification() {
    console.log('🧪 Testing ZKVerifier contract...\n');

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(ZK_VERIFIER_ADDRESS, ZK_VERIFIER_ABI, wallet);

    console.log('Wallet address:', wallet.address);
    console.log('Contract address:', ZK_VERIFIER_ADDRESS);

    // Generate a simple 256-byte proof with high checksum
    function generateProof() {
        // Create actual bytes with high values for checksum
        const bytes = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            bytes[i] = 255 - (i % 128); // High values
        }
        return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const proof = generateProof();
    const attributeType = 'credit_score';

    console.log('\nProof details:');
    console.log('- Length:', proof.length, 'chars');
    console.log('- Bytes:', (proof.length - 2) / 2);
    console.log('- First 66 chars:', proof.slice(0, 66));

    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < 32; i++) {
        const byte = parseInt(proof.slice(2 + i*2, 4 + i*2), 16);
        checksum += byte;
    }
    console.log('- Checksum:', checksum);
    console.log('- Attribute:', attributeType);

    try {
        console.log('\n📝 Submitting proof...');
        
        // Estimate gas first
        try {
            const gasEstimate = await contract.verifyProof.estimateGas(proof, attributeType);
            console.log('Gas estimate:', gasEstimate.toString());
        } catch (estimateError) {
            console.log('Gas estimation failed:', estimateError.message);
            console.log('Proceeding with fixed gas limit...');
        }
        
        const tx = await contract.verifyProof(proof, attributeType, {
            gasLimit: 500000
        });
        
        console.log('Transaction hash:', tx.hash);
        console.log('Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('\n✅ Transaction confirmed!');
        console.log('Block:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        console.log('Status:', receipt.status === 1 ? 'Success' : 'Failed');

        // Check compliance
        const isCompliant = await contract.userCompliance(wallet.address, attributeType);
        console.log('\n📊 Compliance check:');
        console.log('User:', wallet.address);
        console.log('Attribute:', attributeType);
        console.log('Is compliant:', isCompliant);

        console.log('\n🎉 Test passed!');
        console.log('View on Arbiscan:', `https://sepolia.arbiscan.io/tx/${tx.hash}`);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.data) {
            console.error('Error data:', error.data);
        }
        if (error.reason) {
            console.error('Reason:', error.reason);
        }
        if (error.transaction) {
            console.error('Transaction:', JSON.stringify(error.transaction, null, 2));
        }
        if (error.receipt) {
            console.error('Receipt status:', error.receipt.status);
            console.error('Gas used:', error.receipt.gasUsed.toString());
        }
        process.exit(1);
    }
}

testVerification()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
