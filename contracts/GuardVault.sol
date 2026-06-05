// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC8004.sol";

/// @title GuardVault — Programmable Guardrails for AI Agent Asset Management
/// @notice Users deposit assets with strict policies that agents must follow
contract GuardVault {
    // ============ Structs ============

    struct Policy {
        uint256 maxTxSize;        // max USDC per tx (in wei)
        uint256 dailyLimit;       // max USDC per day (in wei)
        uint256 slippageBps;      // max slippage in basis points (100 = 1%)
        uint256 dailyUsed;        // amount used today
        uint256 lastDayReset;     // timestamp of last daily reset
    }

    struct Vault {
        address owner;
        address agent;
        uint256 balance;
        bool active;
    }

    struct PolicyViolation {
        address agent;
        string violationType;
        uint256 amount;
        uint256 timestamp;
    }

    // ============ State Variables ============

    address public oracleAddress;
    address public immutable deployer;

    mapping(address => Vault) public vaults;           // user => vault
    mapping(address => Policy) public policies;        // user => policy
    mapping(address => mapping(address => bool)) public allowedProtocols; // user => protocol => allowed
    mapping(address => PolicyViolation[]) public violations; // user => violations

    address[] public vaultOwners;

    // ============ Events ============

    event VaultCreated(address indexed user, address indexed agent, uint256 timestamp);
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdraw(address indexed user, uint256 amount, uint256 timestamp);
    event PolicyExecuted(address indexed agent, address indexed protocol, uint256 amount, uint256 timestamp);
    event PolicyViolationEvent(address indexed agent, string violationType, uint256 amount, uint256 timestamp);
    event PolicyUpdated(address indexed user, uint256 maxTx, uint256 daily, uint256 slippage, uint256 timestamp);
    event ProtocolAllowed(address indexed user, address indexed protocol, bool allowed, uint256 timestamp);
    event OracleUpdated(address indexed newOracle, uint256 timestamp);

    // ============ Modifiers ============

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "GuardVault: caller is not the oracle");
        _;
    }

    modifier onlyOracleOrDeployer() {
        require(
            msg.sender == oracleAddress || msg.sender == deployer,
            "GuardVault: caller is not oracle or deployer"
        );
        _;
    }

    modifier onlyVaultOwner(address _user) {
        require(msg.sender == _user, "GuardVault: not vault owner");
        _;
    }

    // ============ Constructor ============

    constructor() {
        deployer = msg.sender;
    }

    // ============ External Functions ============

    /// @notice Create a vault for a user with an assigned agent
    /// @param _agent The agent wallet that will manage this vault
    function createVault(address _agent) external {
        require(vaults[msg.sender].owner == address(0), "GuardVault: vault already exists");
        require(_agent != address(0), "GuardVault: invalid agent address");

        vaults[msg.sender] = Vault({
            owner: msg.sender,
            agent: _agent,
            balance: 0,
            active: true
        });

        // Set default policy
        policies[msg.sender] = Policy({
            maxTxSize: 500 * 1e6,       // 500 USDC default
            dailyLimit: 5000 * 1e6,      // 5000 USDC default
            slippageBps: 300,            // 3% default
            dailyUsed: 0,
            lastDayReset: block.timestamp
        });

        vaultOwners.push(msg.sender);
        emit VaultCreated(msg.sender, _agent, block.timestamp);
    }

    /// @notice Deposit MNT into vault
    function deposit() external payable {
        require(vaults[msg.sender].owner == msg.sender, "GuardVault: no vault");
        require(vaults[msg.sender].active, "GuardVault: vault inactive");
        require(msg.value > 0, "GuardVault: zero deposit");

        vaults[msg.sender].balance += msg.value;
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }

    /// @notice Withdraw MNT from vault
    /// @param _amount Amount to withdraw in wei
    function withdraw(uint256 _amount) external {
        require(vaults[msg.sender].owner == msg.sender, "GuardVault: not vault owner");
        require(_amount > 0, "GuardVault: zero amount");
        require(vaults[msg.sender].balance >= _amount, "GuardVault: insufficient balance");

        vaults[msg.sender].balance -= _amount;
        emit Withdraw(msg.sender, _amount, block.timestamp);

        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "GuardVault: transfer failed");
    }

    /// @notice Execute a transaction with policy validation (called by agent via oracle)
    /// @param _user The vault owner
    /// @param _protocol The target protocol address
    /// @param _amount Transaction amount in wei
    function executeWithPolicy(
        address _user,
        address _protocol,
        uint256 _amount
    ) external onlyOracle {
        require(vaults[_user].active, "GuardVault: vault inactive");
        require(vaults[_user].balance >= _amount, "GuardVault: insufficient balance");

        Policy storage policy = policies[_user];

        // Reset daily usage if new day
        if (block.timestamp >= policy.lastDayReset + 1 days) {
            policy.dailyUsed = 0;
            policy.lastDayReset = block.timestamp;
        }

        // Check max tx size
        if (_amount > policy.maxTxSize) {
            PolicyViolation memory violation = PolicyViolation({
                agent: msg.sender,
                violationType: "MAX_TX_EXCEEDED",
                amount: _amount,
                timestamp: block.timestamp
            });
            violations[_user].push(violation);
            emit PolicyViolationEvent(msg.sender, "MAX_TX_EXCEEDED", _amount, block.timestamp);
            return;
        }

        // Check daily limit
        if (policy.dailyUsed + _amount > policy.dailyLimit) {
            PolicyViolation memory violation = PolicyViolation({
                agent: msg.sender,
                violationType: "DAILY_LIMIT_EXCEEDED",
                amount: _amount,
                timestamp: block.timestamp
            });
            violations[_user].push(violation);
            emit PolicyViolationEvent(msg.sender, "DAILY_LIMIT_EXCEEDED", _amount, block.timestamp);
            return;
        }

        // Check protocol whitelist
        if (!allowedProtocols[_user][_protocol]) {
            PolicyViolation memory violation = PolicyViolation({
                agent: msg.sender,
                violationType: "PROTOCOL_NOT_ALLOWED",
                amount: _amount,
                timestamp: block.timestamp
            });
            violations[_user].push(violation);
            emit PolicyViolationEvent(msg.sender, "PROTOCOL_NOT_ALLOWED", _amount, block.timestamp);
            return;
        }

        // All checks passed — execute
        policy.dailyUsed += _amount;
        vaults[_user].balance -= _amount;

        emit PolicyExecuted(msg.sender, _protocol, _amount, block.timestamp);
    }

    // ============ Policy Management ============

    /// @notice Set vault policy (vault owner only)
    /// @param _maxTx Max tx size in wei
    /// @param _daily Daily limit in wei
    /// @param _slippage Max slippage in basis points
    function setPolicy(uint256 _maxTx, uint256 _daily, uint256 _slippage) external {
        require(msg.sender == vaults[msg.sender].owner, "GuardVault: not vault owner");

        policies[msg.sender].maxTxSize = _maxTx;
        policies[msg.sender].dailyLimit = _daily;
        policies[msg.sender].slippageBps = _slippage;

        emit PolicyUpdated(msg.sender, _maxTx, _daily, _slippage, block.timestamp);
    }

    /// @notice Allow or disallow a protocol
    /// @param _protocol Protocol address
    /// @param _allowed Whether to allow
    function setProtocolAllowance(address _protocol, bool _allowed) external {
        require(msg.sender == vaults[msg.sender].owner, "GuardVault: not vault owner");
        allowedProtocols[msg.sender][_protocol] = _allowed;
        emit ProtocolAllowed(msg.sender, _protocol, _allowed, block.timestamp);
    }

    /// @notice Check if slippage is within bounds
    /// @param _expected Expected price
    /// @param _actual Actual price
    /// @param _slippageBps Max slippage in basis points
    /// @return True if within bounds
    function checkSlippage(
        uint256 _expected,
        uint256 _actual,
        uint256 _slippageBps
    ) public pure returns (bool) {
        if (_expected == 0) return false;
        uint256 diff = _expected > _actual ? _expected - _actual : _actual - _expected;
        return (diff * 10000) / _expected <= _slippageBps;
    }

    // ============ View Functions ============

    /// @notice Get vault info
    /// @param _user Vault owner
    function getVaultInfo(address _user) external view returns (
        address owner,
        address agent,
        uint256 balance,
        bool active
    ) {
        Vault storage v = vaults[_user];
        return (v.owner, v.agent, v.balance, v.active);
    }

    /// @notice Get policy for a vault
    /// @param _user Vault owner
    function getPolicy(address _user) external view returns (
        uint256 maxTxSize,
        uint256 dailyLimit,
        uint256 slippageBps,
        uint256 dailyUsed
    ) {
        Policy storage p = policies[_user];
        return (p.maxTxSize, p.dailyLimit, p.slippageBps, p.dailyUsed);
    }

    /// @notice Get violations for a vault
    /// @param _user Vault owner
    /// @return Array of PolicyViolation
    function getViolations(address _user) external view returns (PolicyViolation[] memory) {
        return violations[_user];
    }

    /// @notice Get total vault count
    /// @return Total vaults created
    function getTotalVaults() external view returns (uint256) {
        return vaultOwners.length;
    }

    // ============ Admin Functions ============

    /// @notice Set oracle address
    function setOracleAddress(address _oracleAddress) external onlyOracleOrDeployer {
        require(_oracleAddress != address(0), "GuardVault: invalid oracle address");
        oracleAddress = _oracleAddress;
        emit OracleUpdated(_oracleAddress, block.timestamp);
    }
}
