// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LiquidityVault.sol";

/**
 * @title AgentExecutor
 * @notice Manages AI agent proposals and executes rebalancing strategies
 * @dev Authorized agents can propose strategies, users/owner can execute them
 */
contract AgentExecutor is Ownable {
    LiquidityVault public vault;

    struct StrategyProposal {
        address user; // User whose position to rebalance
        uint256 rangeLower; // Proposed lower range
        uint256 rangeUpper; // Proposed upper range
        string reasoning; // AI-generated explanation
        uint256 timestamp; // When proposed
        bool executed; // Whether executed
        address proposer; // Which agent proposed it
    }

    StrategyProposal[] public proposals;

    // Agent authorization mapping
    mapping(address => bool) public authorizedAgents;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed user,
        uint256 rangeLower,
        uint256 rangeUpper,
        string reasoning,
        address proposer
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor
    );

    event AgentAuthorized(address indexed agent);
    event AgentRevoked(address indexed agent);

    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }

    constructor(address _vault) Ownable(msg.sender) {
        require(_vault != address(0), "Invalid vault address");
        vault = LiquidityVault(_vault);
    }

    /**
     * @notice Authorize an agent address to propose strategies
     * @dev Only owner (deployer) can authorize agents
     * @param agent Address of agent to authorize
     */
    function authorizeAgent(address agent) external onlyOwner {
        require(agent != address(0), "Invalid agent address");
        require(!authorizedAgents[agent], "Agent already authorized");

        authorizedAgents[agent] = true;
        emit AgentAuthorized(agent);
    }

    /**
     * @notice Revoke agent authorization
     * @param agent Address of agent to revoke
     */
    function revokeAgent(address agent) external onlyOwner {
        require(authorizedAgents[agent], "Agent not authorized");

        authorizedAgents[agent] = false;
        emit AgentRevoked(agent);
    }

    /**
     * @notice AI agent proposes a rebalancing strategy
     * @dev Stores proposal on-chain with reasoning for transparency
     * @param user User address whose position to rebalance
     * @param rangeLower New lower range bound
     * @param rangeUpper New upper range bound
     * @param reasoning AI-generated explanation of why this strategy is optimal
     * @return proposalId ID of created proposal
     */
    function proposeStrategy(
        address user,
        uint256 rangeLower,
        uint256 rangeUpper,
        string calldata reasoning
    ) external onlyAuthorizedAgent returns (uint256 proposalId) {
        require(user != address(0), "Invalid user address");
        require(rangeLower < rangeUpper, "Invalid range: lower >= upper");
        require(rangeLower > 0, "Lower bound must be positive");
        require(bytes(reasoning).length > 0, "Reasoning required");

        proposalId = proposals.length;

        proposals.push(
            StrategyProposal({
                user: user,
                rangeLower: rangeLower,
                rangeUpper: rangeUpper,
                reasoning: reasoning,
                timestamp: block.timestamp,
                executed: false,
                proposer: msg.sender
            })
        );

        emit ProposalCreated(
            proposalId,
            user,
            rangeLower,
            rangeUpper,
            reasoning,
            msg.sender
        );

        return proposalId;
    }

    /**
     * @notice Execute a proposed rebalancing strategy
     * @dev Can be called by the user themselves or the owner
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external {
        require(proposalId < proposals.length, "Invalid proposal ID");

        StrategyProposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(
            msg.sender == proposal.user || msg.sender == owner(),
            "Not authorized to execute"
        );

        // Execute rebalance on vault
        vault.updatePosition(
            proposal.user,
            proposal.rangeLower,
            proposal.rangeUpper
        );

        proposal.executed = true;

        emit ProposalExecuted(proposalId, msg.sender);
    }

    /**
     * @notice Get total number of proposals
     * @return count Total proposals created
     */
    function getProposalCount() external view returns (uint256 count) {
        return proposals.length;
    }

    /**
     * @notice Get proposal details by ID
     * @param proposalId ID of proposal
     * @return proposal Full proposal struct
     */
    function getProposal(
        uint256 proposalId
    ) external view returns (StrategyProposal memory proposal) {
        require(proposalId < proposals.length, "Invalid proposal ID");
        return proposals[proposalId];
    }

    /**
     * @notice Get all pending (unexecuted) proposals for a user
     * @param user Address of user
     * @return pendingProposalIds Array of proposal IDs
     */
    function getUserPendingProposals(
        address user
    ) external view returns (uint256[] memory pendingProposalIds) {
        uint256 count = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].user == user && !proposals[i].executed) {
                count++;
            }
        }

        pendingProposalIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].user == user && !proposals[i].executed) {
                pendingProposalIds[index] = i;
                index++;
            }
        }

        return pendingProposalIds;
    }

    /**
     * @notice Get all proposals for a user (both executed and pending)
     * @param user Address of user
     * @return userProposalIds Array of proposal IDs
     */
    function getUserProposals(
        address user
    ) external view returns (uint256[] memory userProposalIds) {
        uint256 count = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].user == user) {
                count++;
            }
        }

        userProposalIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].user == user) {
                userProposalIds[index] = i;
                index++;
            }
        }

        return userProposalIds;
    }
}
