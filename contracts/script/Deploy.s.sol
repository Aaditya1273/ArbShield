// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/ZKVerifier.sol";
import "../src/ComplianceRegistry.sol";
import "../src/MockBUIDL.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Stylus Rust verifier first (manually via cargo-stylus)
        // For demo, use a placeholder address
        address stylusVerifier = address(0x1234567890123456789012345678901234567890);

        // Deploy ZKVerifier wrapper
        ZKVerifier zkVerifier = new ZKVerifier(stylusVerifier);
        console.log("ZKVerifier deployed at:", address(zkVerifier));

        // Deploy ComplianceRegistry
        ComplianceRegistry registry = new ComplianceRegistry();
        console.log("ComplianceRegistry deployed at:", address(registry));

        // Grant verifier role to ZKVerifier
        registry.grantRole(registry.VERIFIER_ROLE(), address(zkVerifier));

        // Deploy MockBUIDL
        MockBUIDL buidl = new MockBUIDL(address(registry));
        console.log("MockBUIDL deployed at:", address(buidl));

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Complete ===");
        console.log("Network: Arbitrum Sepolia");
        console.log("ZKVerifier:", address(zkVerifier));
        console.log("ComplianceRegistry:", address(registry));
        console.log("MockBUIDL:", address(buidl));
        console.log("\nUpdate frontend/lib/contracts.ts with these addresses");
    }
}
