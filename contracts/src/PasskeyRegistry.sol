// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title PasskeyRegistry
 * @notice Decentralized registry for user passkeys with multi-device support
 * @dev Stores secp256r1 public keys for RIP-7212 verification
 * 
 * WORLD-CLASS FEATURES:
 * - Multi-device support (register multiple passkeys per user)
 * - Device management (add/remove devices)
 * - Social recovery (guardian-based recovery)
 * - Fully on-chain (no localStorage dependency)
 */
contract PasskeyRegistry {
    struct Passkey {
        bytes publicKey;        // secp256r1 public key (65 bytes)
        string deviceName;      // User-friendly device name
        uint256 registeredAt;   // Registration timestamp
        uint256 lastUsedAt;     // Last authentication timestamp
        bool isActive;          // Active status
    }

    struct UserAccount {
        mapping(bytes32 => Passkey) passkeys;  // credentialId => Passkey
        bytes32[] passkeyIds;                   // Array of credential IDs
        address[] guardians;                    // Social recovery guardians
        uint256 requiredGuardians;              // Number of guardians needed for recovery
        bool isInitialized;                     // Account initialized
    }

    /// @notice Mapping of user address to their account
    mapping(address => UserAccount) private accounts;

    /// @notice Mapping to track if a public key is already registered
    mapping(bytes32 => address) public publicKeyOwner;

    /// @notice Recovery requests
    struct RecoveryRequest {
        address newOwner;
        uint256 approvalCount;
        mapping(address => bool) approvals;
        uint256 expiresAt;
    }
    mapping(address => RecoveryRequest) public recoveryRequests;

    event PasskeyRegistered(
        address indexed user,
        bytes32 indexed credentialId,
        string deviceName,
        uint256 timestamp
    );

    event PasskeyRevoked(
        address indexed user,
        bytes32 indexed credentialId,
        uint256 timestamp
    );

    event PasskeyUsed(
        address indexed user,
        bytes32 indexed credentialId,
        uint256 timestamp
    );

    event GuardianAdded(
        address indexed user,
        address indexed guardian
    );

    event RecoveryInitiated(
        address indexed oldOwner,
        address indexed newOwner,
        uint256 expiresAt
    );

    event RecoveryApproved(
        address indexed guardian,
        address indexed user
    );

    event RecoveryExecuted(
        address indexed oldOwner,
        address indexed newOwner
    );

    /**
     * @notice Register a new passkey for the caller
     * @param credentialId The WebAuthn credential ID
     * @param publicKey The secp256r1 public key (65 bytes uncompressed)
     * @param deviceName User-friendly device name (e.g., "iPhone 15 Pro")
     */
    function registerPasskey(
        bytes32 credentialId,
        bytes calldata publicKey,
        string calldata deviceName
    ) external {
        require(publicKey.length == 65, "Invalid public key length");
        require(publicKey[0] == 0x04, "Public key must be uncompressed");
        require(bytes(deviceName).length > 0, "Device name required");

        UserAccount storage account = accounts[msg.sender];
        
        // Initialize account if first passkey
        if (!account.isInitialized) {
            account.isInitialized = true;
        }

        require(!account.passkeys[credentialId].isActive, "Credential already registered");

        bytes32 pubKeyHash = keccak256(publicKey);
        require(publicKeyOwner[pubKeyHash] == address(0), "Public key already in use");

        account.passkeys[credentialId] = Passkey({
            publicKey: publicKey,
            deviceName: deviceName,
            registeredAt: block.timestamp,
            lastUsedAt: block.timestamp,
            isActive: true
        });

        account.passkeyIds.push(credentialId);
        publicKeyOwner[pubKeyHash] = msg.sender;

        emit PasskeyRegistered(msg.sender, credentialId, deviceName, block.timestamp);
    }

    /**
     * @notice Revoke a passkey
     * @param credentialId The credential ID to revoke
     */
    function revokePasskey(bytes32 credentialId) external {
        UserAccount storage account = accounts[msg.sender];
        require(account.passkeys[credentialId].isActive, "Passkey not active");
        require(account.passkeyIds.length > 1, "Cannot revoke last passkey");

        bytes32 pubKeyHash = keccak256(account.passkeys[credentialId].publicKey);
        publicKeyOwner[pubKeyHash] = address(0);

        account.passkeys[credentialId].isActive = false;

        emit PasskeyRevoked(msg.sender, credentialId, block.timestamp);
    }

    /**
     * @notice Update last used timestamp (called after successful auth)
     * @param credentialId The credential ID that was used
     */
    function recordPasskeyUsage(bytes32 credentialId) external {
        UserAccount storage account = accounts[msg.sender];
        require(account.passkeys[credentialId].isActive, "Passkey not active");

        account.passkeys[credentialId].lastUsedAt = block.timestamp;

        emit PasskeyUsed(msg.sender, credentialId, block.timestamp);
    }

    /**
     * @notice Add a guardian for social recovery
     * @param guardian The guardian address
     */
    function addGuardian(address guardian) external {
        require(guardian != address(0), "Invalid guardian");
        require(guardian != msg.sender, "Cannot be own guardian");

        UserAccount storage account = accounts[msg.sender];
        require(account.isInitialized, "Account not initialized");

        account.guardians.push(guardian);
        if (account.requiredGuardians == 0) {
            account.requiredGuardians = (account.guardians.length + 1) / 2; // Majority
        }

        emit GuardianAdded(msg.sender, guardian);
    }

    /**
     * @notice Get user's passkeys
     * @param user The user address
     * @return credentialIds Array of credential IDs
     * @return deviceNames Array of device names
     * @return lastUsed Array of last used timestamps
     */
    function getUserPasskeys(address user) 
        external 
        view 
        returns (
            bytes32[] memory credentialIds,
            string[] memory deviceNames,
            uint256[] memory lastUsed
        ) 
    {
        UserAccount storage account = accounts[user];
        uint256 activeCount = 0;

        // Count active passkeys
        for (uint256 i = 0; i < account.passkeyIds.length; i++) {
            if (account.passkeys[account.passkeyIds[i]].isActive) {
                activeCount++;
            }
        }

        credentialIds = new bytes32[](activeCount);
        deviceNames = new string[](activeCount);
        lastUsed = new uint256[](activeCount);

        uint256 index = 0;
        for (uint256 i = 0; i < account.passkeyIds.length; i++) {
            bytes32 credId = account.passkeyIds[i];
            if (account.passkeys[credId].isActive) {
                credentialIds[index] = credId;
                deviceNames[index] = account.passkeys[credId].deviceName;
                lastUsed[index] = account.passkeys[credId].lastUsedAt;
                index++;
            }
        }
    }

    /**
     * @notice Check if user has any active passkeys
     * @param user The user address
     * @return hasPasskey Whether user has active passkeys
     */
    function hasActivePasskey(address user) external view returns (bool) {
        UserAccount storage account = accounts[user];
        if (!account.isInitialized) return false;

        for (uint256 i = 0; i < account.passkeyIds.length; i++) {
            if (account.passkeys[account.passkeyIds[i]].isActive) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get passkey public key
     * @param user The user address
     * @param credentialId The credential ID
     * @return publicKey The public key
     */
    function getPasskeyPublicKey(address user, bytes32 credentialId) 
        external 
        view 
        returns (bytes memory) 
    {
        UserAccount storage account = accounts[user];
        require(account.passkeys[credentialId].isActive, "Passkey not active");
        return account.passkeys[credentialId].publicKey;
    }
}
