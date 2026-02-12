// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZKVerifier
 * @notice Wrapper contract for Stylus Rust ZK proof verifier
 * @dev Delegates verification to Stylus WASM contract for 10x gas efficiency
 */
contract ZKVerifier is Ownable {
    /// @notice Address of the Stylus Rust verifier contract
    address public stylusVerifier;

    /// @notice Mapping of verified proofs
    mapping(bytes32 => bool) public verifiedProofs;

    /// @notice Mapping of user compliance attributes
    mapping(address => mapping(string => bool)) public userCompliance;

    event ProofVerified(
        address indexed user,
        string attributeType,
        bytes32 proofHash,
        uint256 gasUsed
    );

    event StylusVerifierUpdated(address indexed oldVerifier, address indexed newVerifier);

    constructor(address _stylusVerifier) Ownable(msg.sender) {
        require(_stylusVerifier != address(0), "Invalid verifier address");
        stylusVerifier = _stylusVerifier;
    }

    /**
     * @notice Verify a ZK proof using Stylus Rust verifier
     * @param proof The ZK proof bytes
     * @param attributeType The compliance attribute being proven
     * @return success Whether the proof was verified
     */
    function verifyProof(
        bytes calldata proof,
        string calldata attributeType
    ) external returns (bool success) {
        uint256 gasStart = gasleft();

        // Call Stylus Rust verifier
        (bool verified, ) = stylusVerifier.call(
            abi.encodeWithSignature("verify(bytes)", proof)
        );

        require(verified, "Proof verification failed");

        bytes32 proofHash = keccak256(proof);
        verifiedProofs[proofHash] = true;
        userCompliance[msg.sender][attributeType] = true;

        uint256 gasUsed = gasStart - gasleft();

        emit ProofVerified(msg.sender, attributeType, proofHash, gasUsed);

        return true;
    }

    /**
     * @notice Check if a user has verified a specific compliance attribute
     * @param user The user address
     * @param attributeType The compliance attribute type
     * @return verified Whether the attribute is verified
     */
    function isCompliant(
        address user,
        string calldata attributeType
    ) external view returns (bool verified) {
        return userCompliance[user][attributeType];
    }

    /**
     * @notice Update the Stylus verifier address
     * @param _newVerifier The new verifier address
     */
    function updateStylusVerifier(address _newVerifier) external onlyOwner {
        require(_newVerifier != address(0), "Invalid verifier address");
        address oldVerifier = stylusVerifier;
        stylusVerifier = _newVerifier;
        emit StylusVerifierUpdated(oldVerifier, _newVerifier);
    }
}
