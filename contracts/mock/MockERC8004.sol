// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC8004.sol";

/// @title MockERC8004
/// @notice Simple mock ERC-8004 implementation for testing TripwireRegistry
contract MockERC8004 is IERC8004 {
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _agentIds;
    mapping(address => bool) private _registeredAgents;

    uint256 private _totalSupply;

    /// @notice Mint a new agent token
    /// @param to The address to mint to
    /// @param tokenId The token ID to mint
    function mint(address to, uint256 tokenId) external {
        require(to != address(0), "MockERC8004: mint to zero address");
        require(_owners[tokenId] == address(0), "MockERC8004: token already minted");

        _owners[tokenId] = to;
        _agentIds[to] = tokenId;
        _registeredAgents[to] = true;
        _totalSupply++;
    }

    /// @inheritdoc IERC8004
    function agentId(address wallet) external view override returns (uint256) {
        return _agentIds[wallet];
    }

    /// @inheritdoc IERC8004
    function ownerOf(uint256 tokenId) external view override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "MockERC8004: token does not exist");
        return owner;
    }

    /// @inheritdoc IERC8004
    function isRegisteredAgent(address wallet) external view override returns (bool) {
        return _registeredAgents[wallet];
    }

    /// @notice Get total supply of minted tokens
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
}
