// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC8004.sol";

/// @title Proof-of-Turing Registry
/// @notice Verifies whether a wallet is operated by an autonomous AI agent or a human
/// @dev Core contract for the PoT protocol - an "inverse captcha" system
contract PoTRegistry {
    // ============ Enums ============

    enum AgentStatus { Unverified, Pending, Verified, Rejected }

    // ============ Structs ============

    struct AgentInfo {
        uint256 erc8004TokenId;
        address wallet;
        AgentStatus status;
        uint256 agenticScore; // 0-100
        uint256 lastHeartbeat;
        uint256 heartbeatsCount;
        uint256 verificationTimestamp;
        uint256 lastScoreUpdate;
    }

    struct ScoreRecord {
        uint256 score;
        uint256 timestamp;
    }

    // ============ State Variables ============

    address public oracleAddress;
    address public erc8004Contract;
    address public immutable deployer;

    mapping(address => AgentInfo) public agents;
    mapping(uint256 => address) public tokenToWallet;
    mapping(address => ScoreRecord[]) public scoreHistory;

    address[] public agentAddresses;

    // ============ Events ============

    event AgentRegistered(address indexed wallet, uint256 indexed tokenId, uint256 timestamp);
    event ScoreUpdated(address indexed wallet, uint256 newScore, uint256 timestamp);
    event AgentVerified(address indexed wallet, uint256 timestamp);
    event HeartbeatReceived(address indexed wallet, uint256 timestamp);
    event OracleUpdated(address indexed newOracle, uint256 timestamp);

    // ============ Modifiers ============

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "PoTRegistry: caller is not the oracle");
        _;
    }

    modifier onlyOracleOrDeployer() {
        require(
            msg.sender == oracleAddress || msg.sender == deployer,
            "PoTRegistry: caller is not oracle or deployer"
        );
        _;
    }

    // ============ Constructor ============

    constructor() {
        deployer = msg.sender;
    }

    // ============ External Functions ============

    /// @notice Register an agent with an ERC-8004 token
    /// @param _tokenId The token ID to register
    function registerAgent(uint256 _tokenId) external {
        require(erc8004Contract != address(0), "PoTRegistry: ERC8004 not set");

        IERC8004 erc8004 = IERC8004(erc8004Contract);
        address wallet = erc8004.ownerOf(_tokenId);
        require(wallet == msg.sender, "PoTRegistry: not token owner");
        require(_tokenId != 0, "PoTRegistry: invalid token ID");
        require(agents[wallet].status == AgentStatus.Unverified, "PoTRegistry: already registered");

        require(erc8004.isRegisteredAgent(wallet), "PoTRegistry: not a registered agent");

        agents[wallet] = AgentInfo({
            erc8004TokenId: _tokenId,
            wallet: wallet,
            status: AgentStatus.Pending,
            agenticScore: 0,
            lastHeartbeat: 0,
            heartbeatsCount: 0,
            verificationTimestamp: 0,
            lastScoreUpdate: 0
        });

        tokenToWallet[_tokenId] = wallet;
        agentAddresses.push(wallet);

        emit AgentRegistered(wallet, _tokenId, block.timestamp);
    }

    /// @notice Submit a heartbeat from an agent wallet
    function submitHeartbeat() external {
        AgentInfo storage agent = agents[msg.sender];
        require(agent.status != AgentStatus.Unverified, "PoTRegistry: agent not registered");
        require(agent.status != AgentStatus.Rejected, "PoTRegistry: agent rejected");

        agent.lastHeartbeat = block.timestamp;
        agent.heartbeatsCount++;

        emit HeartbeatReceived(msg.sender, block.timestamp);
    }

    /// @notice Submit a score for an agent (oracle only)
    /// @param _wallet The agent wallet
    /// @param _score The score to assign (0-100)
    function submitScore(address _wallet, uint256 _score) external onlyOracle {
        require(_score <= 100, "PoTRegistry: score must be 0-100");
        AgentInfo storage agent = agents[_wallet];
        require(agent.status != AgentStatus.Unverified, "PoTRegistry: agent not registered");

        agent.agenticScore = _score;
        agent.lastScoreUpdate = block.timestamp;

        scoreHistory[_wallet].push(ScoreRecord({
            score: _score,
            timestamp: block.timestamp
        }));

        // Auto-verify if score >= 70
        if (_score >= 70) {
            agent.status = AgentStatus.Verified;
            agent.verificationTimestamp = block.timestamp;
            emit AgentVerified(_wallet, block.timestamp);
        } else {
            agent.status = AgentStatus.Pending;
        }

        emit ScoreUpdated(_wallet, _score, block.timestamp);
    }

    /// @notice Set agent status (oracle only)
    /// @param _wallet The agent wallet
    /// @param _status The new status
    function setAgentStatus(address _wallet, AgentStatus _status) external onlyOracle {
        require(agents[_wallet].status != AgentStatus.Unverified, "PoTRegistry: agent not registered");
        agents[_wallet].status = _status;

        if (_status == AgentStatus.Verified) {
            agents[_wallet].verificationTimestamp = block.timestamp;
            emit AgentVerified(_wallet, block.timestamp);
        }
    }

    // ============ View Functions ============

    /// @notice Get the agentic score for a wallet
    /// @param _wallet The wallet to query
    /// @return The agentic score (0-100)
    function getAgentScore(address _wallet) external view returns (uint256) {
        require(agents[_wallet].status != AgentStatus.Unverified, "PoTRegistry: agent not registered");
        return agents[_wallet].agenticScore;
    }

    /// @notice Check if a wallet is a verified agent
    /// @param _wallet The wallet to check
    /// @return True if status is Verified AND score >= 70
    function isVerifiedAgent(address _wallet) external view returns (bool) {
        AgentInfo storage agent = agents[_wallet];
        return agent.status == AgentStatus.Verified && agent.agenticScore >= 70;
    }

    /// @notice Get full agent info for a wallet
    /// @param _wallet The wallet to query
    /// @return AgentInfo struct
    function getAgentInfo(address _wallet) external view returns (AgentInfo memory) {
        require(agents[_wallet].status != AgentStatus.Unverified, "PoTRegistry: agent not registered");
        return agents[_wallet];
    }

    /// @notice Get the score history for a wallet
    /// @param _wallet The wallet to query
    /// @return Array of ScoreRecord
    function getScoreHistory(address _wallet) external view returns (ScoreRecord[] memory) {
        require(agents[_wallet].status != AgentStatus.Unverified, "PoTRegistry: agent not registered");
        return scoreHistory[_wallet];
    }

    /// @notice Get total number of registered agents
    /// @return The count of registered agent addresses
    function getTotalAgents() external view returns (uint256) {
        return agentAddresses.length;
    }

    // ============ Admin Functions ============

    /// @notice Set the oracle address (oracle or deployer only)
    /// @param _oracleAddress The new oracle address
    function setOracleAddress(address _oracleAddress) external onlyOracleOrDeployer {
        require(_oracleAddress != address(0), "PoTRegistry: invalid oracle address");
        oracleAddress = _oracleAddress;
        emit OracleUpdated(_oracleAddress, block.timestamp);
    }

    /// @notice Set the ERC-8004 contract address (oracle or deployer only)
    /// @param _erc8004Contract The new ERC-8004 contract address
    function setERC8004Contract(address _erc8004Contract) external onlyOracleOrDeployer {
        require(_erc8004Contract != address(0), "PoTRegistry: invalid ERC8004 address");
        erc8004Contract = _erc8004Contract;
    }
}
