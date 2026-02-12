// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {ZKVerifier} from "../src/ZKVerifier.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {MockBUIDL} from "../src/MockBUIDL.sol";

contract DeploySimple is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();

        // For now, use a placeholder for Stylus verifier
        // We'll deploy the Rust contract separately
        address stylusVerifier = address(0x1111111111111111111111111111111111111111);

        // Deploy ZKVerifier wrapper
        ZKVerifier zkVerifier = new ZKVerifier(stylusVerifier);
        console.log("ZKVerifier deployed at:", address(zkVerifier));

        // Deploy ComplianceRegistry
        ComplianceRegistry registry = new ComplianceRegistry();
        console.log("ComplianceRegistry deployed at:", address(registry));

        // Grant verifier role to ZKVerifier
        registry.grantRole(registry.VERIFIER_ROLE(), address(zkVerifier));
        console.log("Granted VERIFIER_ROLE to ZKVerifier");

        // Deploy MockBUIDL
        MockBUIDL buidl = new MockBUIDL(address(registry));
        console.log("MockBUIDL deployed at:", address(buidl));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Complete ===");
        console.log("Network: Arbitrum Sepolia");
        console.log("ZKVerifier:", address(zkVerifier));
        console.log("ComplianceRegistry:", address(registry));
        console.log("MockBUIDL:", address(buidl));
        console.log("\nUpdate frontend/lib/contracts.ts with these addresses");
    }
}
