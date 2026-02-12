// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockBUIDL
 * @notice Mock RWA token for demo purposes (simulates BlackRock BUIDL)
 * @dev Only compliant users can hold/transfer this token
 */
contract MockBUIDL is ERC20, Ownable {
    address public complianceRegistry;

    event ComplianceRegistryUpdated(address indexed newRegistry);

    constructor(address _complianceRegistry) ERC20("Mock BUIDL", "mBUIDL") Ownable(msg.sender) {
        complianceRegistry = _complianceRegistry;
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /**
     * @notice Override transfer to check compliance
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        // Skip compliance check for minting and owner
        if (from != address(0) && from != owner()) {
            require(isCompliant(from), "Sender not compliant");
        }
        
        // Skip compliance check for burning and owner
        if (to != address(0) && to != owner()) {
            require(isCompliant(to), "Recipient not compliant");
        }

        super._update(from, to, value);
    }

    /**
     * @notice Check if an address is compliant
     * @param user The address to check
     */
    function isCompliant(address user) public view returns (bool) {
        if (complianceRegistry == address(0)) return true;
        
        // Check if user has verified accredited investor status
        (bool success, bytes memory data) = complianceRegistry.staticcall(
            abi.encodeWithSignature(
                "isCompliant(address,string)",
                user,
                "accredited_investor"
            )
        );

        if (!success) return false;
        return abi.decode(data, (bool));
    }

    /**
     * @notice Update compliance registry address
     */
    function updateComplianceRegistry(address _newRegistry) external onlyOwner {
        complianceRegistry = _newRegistry;
        emit ComplianceRegistryUpdated(_newRegistry);
    }

    /**
     * @notice Mint tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
