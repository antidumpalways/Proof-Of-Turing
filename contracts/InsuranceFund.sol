// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title InsuranceFund — Staking and Compensation for AI Agent Accountability
/// @notice Agents stake MNT as collateral; slashed on policy violations to compensate users
contract InsuranceFund {
    // ============ Structs ============

    struct AgentStake {
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }

    struct Claim {
        address user;
        address agent;
        uint256 amount;
        string reason;
        uint256 timestamp;
    }

    // ============ State Variables ============

    address public oracleAddress;
    address public immutable deployer;

    uint256 public totalStaked;
    uint256 public totalClaims;
    uint256 public claimBalance;

    mapping(address => AgentStake) public agentStakes;      // agent => stake
    mapping(uint256 => Claim) public claims;                 // claimId => claim
    uint256 public claimCount;

    // ============ Events ============

    event AgentStaked(address indexed agent, uint256 amount, uint256 timestamp);
    event AgentUnstaked(address indexed agent, uint256 amount, uint256 timestamp);
    event AgentSlashed(address indexed agent, uint256 amount, string reason, uint256 timestamp);
    event UserCompensated(address indexed user, uint256 amount, string reason, uint256 timestamp);
    event OracleUpdated(address indexed newOracle, uint256 timestamp);

    // ============ Modifiers ============

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "InsuranceFund: caller is not the oracle");
        _;
    }

    modifier onlyOracleOrDeployer() {
        require(
            msg.sender == oracleAddress || msg.sender == deployer,
            "InsuranceFund: caller is not oracle or deployer"
        );
        _;
    }

    // ============ Constructor ============

    constructor() {
        deployer = msg.sender;
    }

    // ============ External Functions ============

    /// @notice Agent stakes MNT as collateral
    function stakeAsAgent() external payable {
        require(msg.value > 0, "InsuranceFund: zero stake");

        AgentStake storage stake = agentStakes[msg.sender];
        stake.amount += msg.value;
        stake.timestamp = block.timestamp;
        stake.exists = true;

        totalStaked += msg.value;

        emit AgentStaked(msg.sender, msg.value, block.timestamp);
    }

    /// @notice Agent unstakes MNT (only if not slashed and balance available)
    /// @param _amount Amount to unstake
    function unstake(uint256 _amount) external {
        require(agentStakes[msg.sender].amount >= _amount, "InsuranceFund: insufficient stake");
        require(claimBalance >= _amount, "InsuranceFund: insufficient pool balance");

        agentStakes[msg.sender].amount -= _amount;
        totalStaked -= _amount;

        emit AgentUnstaked(msg.sender, _amount, block.timestamp);

        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "InsuranceFund: transfer failed");
    }

    /// @notice Slash agent stake for policy violation (oracle only)
    /// @param _agent Agent to slash
    /// @param _amount Amount to slash
    /// @param _reason Reason for slashing
    function slashAgent(
        address _agent,
        uint256 _amount,
        string calldata _reason
    ) external onlyOracle {
        require(agentStakes[_agent].amount >= _amount, "InsuranceFund: insufficient stake");

        agentStakes[_agent].amount -= _amount;
        totalStaked -= _amount;
        claimBalance += _amount;

        emit AgentSlashed(_agent, _amount, _reason, block.timestamp);
    }

    /// @notice Compensate user from insurance pool (oracle only)
    /// @param _user User to compensate
    /// @param _amount Compensation amount
    /// @param _reason Reason for compensation
    function claimCompensation(
        address _user,
        uint256 _amount,
        string calldata _reason
    ) external onlyOracle {
        require(claimBalance >= _amount, "InsuranceFund: insufficient pool balance");

        claimBalance -= _amount;
        totalClaims += _amount;

        claims[claimCount] = Claim({
            user: _user,
            agent: msg.sender,
            amount: _amount,
            reason: _reason,
            timestamp: block.timestamp
        });
        claimCount++;

        emit UserCompensated(_user, _amount, _reason, block.timestamp);

        (bool success, ) = _user.call{value: _amount}("");
        require(success, "InsuranceFund: transfer failed");
    }

    // ============ View Functions ============

    /// @notice Get agent's staked amount
    /// @param _agent Agent address
    /// @return Stake amount in wei
    function getAgentStake(address _agent) external view returns (uint256) {
        return agentStakes[_agent].amount;
    }

    /// @notice Get pool statistics
    function getPoolInfo() external view returns (
        uint256 _totalStaked,
        uint256 _totalClaims,
        uint256 _claimBalance
    ) {
        return (totalStaked, totalClaims, claimBalance);
    }

    /// @notice Get claim details
    /// @param _claimId Claim ID
    function getClaim(uint256 _claimId) external view returns (
        address user,
        address agent,
        uint256 amount,
        string memory reason,
        uint256 timestamp
    ) {
        Claim storage c = claims[_claimId];
        return (c.user, c.agent, c.amount, c.reason, c.timestamp);
    }

    /// @notice Get total claims count
    function getClaimCount() external view returns (uint256) {
        return claimCount;
    }

    // ============ Admin Functions ============

    /// @notice Set oracle address
    function setOracleAddress(address _oracleAddress) external onlyOracleOrDeployer {
        require(_oracleAddress != address(0), "InsuranceFund: invalid oracle address");
        oracleAddress = _oracleAddress;
        emit OracleUpdated(_oracleAddress, block.timestamp);
    }

    // ============ Receive ============

    receive() external payable {
        claimBalance += msg.value;
    }
}
