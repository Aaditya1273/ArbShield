// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title LiquidityVault
 * @notice AI-managed concentrated liquidity vault for wSTT/USDC pairs
 * @dev Follows Somnia DEX pattern: "use wSTT and USDC Token Pairs"
 * Users deposit token pairs, receive LP tokens, earn fees from trading
 */
contract LiquidityVault is ERC20, ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable wstt;   // Wrapped STT token
    IERC20 public immutable usdc;   // MockUSDC token

    struct Position {
        uint256 wsttAmount;     // wSTT deposited
        uint256 usdcAmount;     // USDC deposited
        uint256 lpTokens;       // LP tokens minted
        uint256 rangeLower;     // Price range lower (scaled by 10000)
        uint256 rangeUpper;     // Price range upper (scaled by 10000)
        uint256 feesEarnedWSTT; // Trading fees earned in wSTT
        uint256 feesEarnedUSDC; // Trading fees earned in USDC
        uint256 depositTime;    // Timestamp of deposit
        uint256 lastFeeUpdate;  // Last fee calculation
        bool active;            // Position status
    }

    mapping(address => Position) public positions;
    address[] public users;
    
    uint256 public totalWSTT;   // Total wSTT in vault
    uint256 public totalUSDC;   // Total USDC in vault
    uint256 public totalFees;   // Total fees collected

    // Fee rate: 0.3% (30 basis points) - standard for DEXes
    uint256 public constant FEE_RATE = 30;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Minimum deposit: 10 USDC worth (testnet friendly!)
    uint256 public constant MIN_DEPOSIT_USDC = 10e6; // 10 USDC (6 decimals)

    // Events
    event DepositPair(
        address indexed user,
        uint256 wsttAmount,
        uint256 usdcAmount,
        uint256 lpTokens,
        uint256 timestamp
    );
    
    event Withdraw(
        address indexed user,
        uint256 wsttAmount,
        uint256 usdcAmount,
        uint256 lpTokens
    );
    
    event FeesAccrued(
        address indexed user,
        uint256 wsttFees,
        uint256 usdcFees
    );
    
    event FeesClaimed(
        address indexed user,
        uint256 wsttFees,
        uint256 usdcFees
    );
    
    event PositionUpdated(
        address indexed user,
        uint256 rangeLower,
        uint256 rangeUpper
    );

    constructor(
        address _wstt,
        address _usdc
    ) ERC20("LiquidMesh LP Token", "LM-LP") Ownable(msg.sender) {
        require(_wstt != address(0), "Invalid wSTT address");
        require(_usdc != address(0), "Invalid USDC address");
        wstt = IERC20(_wstt);
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Deposit wSTT + USDC pair and receive LP tokens
     * @dev Follows Uniswap V2 pattern for LP token calculation
     * @param wsttAmount Amount of wSTT to deposit
     * @param usdcAmount Amount of USDC to deposit
     * @return lpTokens Amount of LP tokens minted
     */
    function depositPair(
        uint256 wsttAmount,
        uint256 usdcAmount
    ) external nonReentrant whenNotPaused returns (uint256 lpTokens) {
        require(usdcAmount >= MIN_DEPOSIT_USDC, "Minimum 10 USDC required");
        require(wsttAmount > 0, "wSTT amount must be positive");

        // Transfer tokens from user
        require(
            wstt.transferFrom(msg.sender, address(this), wsttAmount),
            "wSTT transfer failed"
        );
        require(
            usdc.transferFrom(msg.sender, address(this), usdcAmount),
            "USDC transfer failed"
        );

        // Calculate LP tokens to mint
        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            // First deposit: mint LP tokens based on geometric mean
            lpTokens = _sqrt(wsttAmount * usdcAmount);
        } else {
            // Subsequent deposits: maintain ratio
            lpTokens = _min(
                (wsttAmount * _totalSupply) / totalWSTT,
                (usdcAmount * _totalSupply) / totalUSDC
            );
        }

        require(lpTokens > 0, "Insufficient liquidity minted");

        // Mint LP tokens to user
        _mint(msg.sender, lpTokens);

        // Add user to tracking if new
        if (!positions[msg.sender].active) {
            users.push(msg.sender);
        }

        // Update position
        positions[msg.sender] = Position({
            wsttAmount: positions[msg.sender].wsttAmount + wsttAmount,
            usdcAmount: positions[msg.sender].usdcAmount + usdcAmount,
            lpTokens: positions[msg.sender].lpTokens + lpTokens,
            rangeLower: 12000, // Default: 1.20 (price scaled by 10000)
            rangeUpper: 13000, // Default: 1.30
            feesEarnedWSTT: positions[msg.sender].feesEarnedWSTT,
            feesEarnedUSDC: positions[msg.sender].feesEarnedUSDC,
            depositTime: block.timestamp,
            lastFeeUpdate: block.timestamp,
            active: true
        });

        totalWSTT += wsttAmount;
        totalUSDC += usdcAmount;

        emit DepositPair(msg.sender, wsttAmount, usdcAmount, lpTokens, block.timestamp);
        
        return lpTokens;
    }

    /**
     * @notice Withdraw liquidity by burning LP tokens
     * @dev Returns proportional share of wSTT and USDC
     * @param lpTokens Amount of LP tokens to burn
     * @return wsttAmount Amount of wSTT withdrawn
     * @return usdcAmount Amount of USDC withdrawn
     */
    function withdraw(
        uint256 lpTokens
    ) external nonReentrant returns (uint256 wsttAmount, uint256 usdcAmount) {
        Position storage pos = positions[msg.sender];
        require(pos.active, "No active position");
        require(lpTokens > 0 && lpTokens <= pos.lpTokens, "Invalid LP token amount");

        // Calculate share of pool
        uint256 _totalSupply = totalSupply();
        wsttAmount = (lpTokens * totalWSTT) / _totalSupply;
        usdcAmount = (lpTokens * totalUSDC) / _totalSupply;

        // Burn LP tokens
        _burn(msg.sender, lpTokens);

        // Update position
        pos.wsttAmount -= wsttAmount;
        pos.usdcAmount -= usdcAmount;
        pos.lpTokens -= lpTokens;

        if (pos.lpTokens == 0) {
            pos.active = false;
        }

        totalWSTT -= wsttAmount;
        totalUSDC -= usdcAmount;

        // Transfer tokens to user
        require(wstt.transfer(msg.sender, wsttAmount), "wSTT transfer failed");
        require(usdc.transfer(msg.sender, usdcAmount), "USDC transfer failed");

        emit Withdraw(msg.sender, wsttAmount, usdcAmount, lpTokens);

        return (wsttAmount, usdcAmount);
    }

    /**
     * @notice Accrue fees for a user (called by agents or anyone)
     * @dev Simulates trading fees for demo purposes
     * @param user Address of user to accrue fees for
     */
    function accrueFees(address user) external {
        Position storage pos = positions[user];
        require(pos.active, "No active position");

        // Simple fee simulation: 0.1% of position per day
        uint256 timeElapsed = block.timestamp - pos.lastFeeUpdate;
        if (timeElapsed > 0) {
            uint256 wsttFees = (pos.wsttAmount * 10 * timeElapsed) / (86400 * 10000);
            uint256 usdcFees = (pos.usdcAmount * 10 * timeElapsed) / (86400 * 10000);

            pos.feesEarnedWSTT += wsttFees;
            pos.feesEarnedUSDC += usdcFees;
            pos.lastFeeUpdate = block.timestamp;

            totalFees += (wsttFees + usdcFees);

            emit FeesAccrued(user, wsttFees, usdcFees);
        }
    }

    /**
     * @notice Claim earned trading fees
     * @dev Transfers accumulated fees to user
     */
    function claimFees() external nonReentrant {
        Position storage pos = positions[msg.sender];
        require(pos.active, "No active position");

        uint256 wsttFees = pos.feesEarnedWSTT;
        uint256 usdcFees = pos.feesEarnedUSDC;

        require(wsttFees > 0 || usdcFees > 0, "No fees to claim");

        // Reset fees
        pos.feesEarnedWSTT = 0;
        pos.feesEarnedUSDC = 0;

        // Transfer fees (in production, these would come from actual trading)
        if (wsttFees > 0) {
            require(wstt.transfer(msg.sender, wsttFees), "wSTT fee transfer failed");
        }
        if (usdcFees > 0) {
            require(usdc.transfer(msg.sender, usdcFees), "USDC fee transfer failed");
        }

        emit FeesClaimed(msg.sender, wsttFees, usdcFees);
    }

    /**
     * @notice Update position range (called by AgentExecutor)
     * @dev AI agents optimize the liquidity range
     * @param user Address of user
     * @param newLower New lower range bound
     * @param newUpper New upper range bound
     */
    function updatePosition(
        address user,
        uint256 newLower,
        uint256 newUpper
    ) external onlyOwner {
        require(positions[user].active, "No active position");
        require(newLower < newUpper, "Invalid range");
        require(newLower > 0, "Lower must be positive");

        positions[user].rangeLower = newLower;
        positions[user].rangeUpper = newUpper;

        emit PositionUpdated(user, newLower, newUpper);
    }

    /**
     * @notice Get portfolio value for a user
     * @dev Returns total value including fees
     * @param user Address of user
     * @return totalValueUSDC Total position value in USDC
     */
    function getPortfolioValue(address user) external view returns (uint256 totalValueUSDC) {
        Position memory pos = positions[user];
        if (!pos.active) return 0;

        // Simple calculation: assume 1 wSTT = 1 USDC for demo
        // In production, use oracle price
        totalValueUSDC = pos.wsttAmount + pos.usdcAmount + pos.feesEarnedWSTT + pos.feesEarnedUSDC;
        
        return totalValueUSDC;
    }

    /**
     * @notice Get all active users
     * @return activeUsers Array of addresses
     */
    function getActiveUsers() external view returns (address[] memory activeUsers) {
        uint256 count = 0;
        for (uint256 i = 0; i < users.length; i++) {
            if (positions[users[i]].active) count++;
        }

        activeUsers = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < users.length; i++) {
            if (positions[users[i]].active) {
                activeUsers[index++] = users[i];
            }
        }

        return activeUsers;
    }

    /**
     * @notice Get position details
     * @param user Address of user
     */
    function getPosition(address user) external view returns (
        uint256 wsttAmount,
        uint256 usdcAmount,
        uint256 lpTokens,
        uint256 rangeLower,
        uint256 rangeUpper,
        uint256 feesEarnedWSTT,
        uint256 feesEarnedUSDC,
        bool active
    ) {
        Position memory pos = positions[user];
        return (
            pos.wsttAmount,
            pos.usdcAmount,
            pos.lpTokens,
            pos.rangeLower,
            pos.rangeUpper,
            pos.feesEarnedWSTT,
            pos.feesEarnedUSDC,
            pos.active
        );
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Helper functions
    function _sqrt(uint256 x) private pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}

