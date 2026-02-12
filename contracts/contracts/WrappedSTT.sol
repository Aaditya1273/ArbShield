// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title WrappedSTT
 * @notice Wrapped version of native STT token for use in DEX pairs
 * @dev Similar to WETH on Ethereum - allows native STT to be used as ERC20
 * Following Somnia's official DEX tutorial pattern: "use wSTT and USDC Token Pairs"
 */
contract WrappedSTT is ERC20 {
    event Deposit(address indexed account, uint256 amount);
    event Withdrawal(address indexed account, uint256 amount);

    constructor() ERC20("Wrapped STT", "wSTT") {}

    /**
     * @notice Wrap native STT into wSTT tokens
     * @dev Mints wSTT 1:1 with deposited STT
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit STT");
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice Unwrap wSTT back to native STT
     * @dev Burns wSTT and returns native STT to user
     * @param amount Amount of wSTT to unwrap
     */
    function withdraw(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient wSTT balance");
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @notice Fallback function to wrap STT when sent directly
     * @dev Allows users to send STT directly to contract
     */
    receive() external payable {
        require(msg.value > 0, "Must send STT");
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }
}
