// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IERC8004 - Agent Identity Token Interface
/// @notice Interface for ERC-8004 compliant agent identity tokens
interface IERC8004 {
    /// @notice Returns the agent ID (token ID) associated with a wallet address
    /// @param wallet The wallet address to query
    /// @return The agent's token ID, or 0 if not registered
    function agentId(address wallet) external view returns (uint256);

    /// @notice Returns the owner of a given token ID
    /// @param tokenId The token ID to query
    /// @return The owner address of the token
    function ownerOf(uint256 tokenId) external view returns (address);

    /// @notice Checks if a wallet is a registered agent
    /// @param wallet The wallet address to check
    /// @return True if the wallet has a registered agent token
    function isRegisteredAgent(address wallet) external view returns (bool);
}
