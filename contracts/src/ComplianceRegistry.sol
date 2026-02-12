// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ComplianceRegistry
 * @notice Registry for storing verified compliance attributes
 * @dev Only authorized verifiers can update compliance status
 */
contract ComplianceRegistry is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct ComplianceRecord {
        bool verified;
        uint256 verifiedAt;
        uint256 expiresAt;
        bytes32 proofHash;
    }

    /// @notice User compliance records by attribute type
    mapping(address => mapping(string => ComplianceRecord)) public records;

    event ComplianceVerified(
        address indexed user,
        string attributeType,
        uint256 verifiedAt,
        uint256 expiresAt
    );

    event ComplianceRevoked(address indexed user, string attributeType);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @notice Record a verified compliance attribute
     * @param user The user address
     * @param attributeType The compliance attribute type
     * @param proofHash Hash of the ZK proof
     * @param validityPeriod How long the verification is valid (seconds)
     */
    function recordCompliance(
        address user,
        string calldata attributeType,
        bytes32 proofHash,
        uint256 validityPeriod
    ) external onlyRole(VERIFIER_ROLE) {
        uint256 verifiedAt = block.timestamp;
        uint256 expiresAt = verifiedAt + validityPeriod;

        records[user][attributeType] = ComplianceRecord({
            verified: true,
            verifiedAt: verifiedAt,
            expiresAt: expiresAt,
            proofHash: proofHash
        });

        emit ComplianceVerified(user, attributeType, verifiedAt, expiresAt);
    }

    /**
     * @notice Check if a user's compliance is valid
     * @param user The user address
     * @param attributeType The compliance attribute type
     * @return valid Whether the compliance is currently valid
     */
    function isCompliant(
        address user,
        string calldata attributeType
    ) external view returns (bool valid) {
        ComplianceRecord memory record = records[user][attributeType];
        return record.verified && block.timestamp < record.expiresAt;
    }

    /**
     * @notice Revoke a user's compliance
     * @param user The user address
     * @param attributeType The compliance attribute type
     */
    function revokeCompliance(
        address user,
        string calldata attributeType
    ) external onlyRole(VERIFIER_ROLE) {
        delete records[user][attributeType];
        emit ComplianceRevoked(user, attributeType);
    }

    /**
     * @notice Get full compliance record
     * @param user The user address
     * @param attributeType The compliance attribute type
     */
    function getRecord(
        address user,
        string calldata attributeType
    ) external view returns (ComplianceRecord memory) {
        return records[user][attributeType];
    }
}
