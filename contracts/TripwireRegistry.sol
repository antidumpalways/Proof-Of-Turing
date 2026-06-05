// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC8004.sol";

/// @title TripwireRegistry — Agent Identity, Reputation, and Threat Management
/// @notice Tracks agent reputation, risk scores, threat history, and quarantine status
contract TripwireRegistry {
    // ============ Enums ============

    enum AgentStatus { Unverified, Pending, Verified, Rejected }
    enum ThreatLevel { None, Low, Medium, High, Critical }

    // ============ Structs ============

    struct AgentInfo {
        uint256 erc8004TokenId;
        address wallet;
        AgentStatus status;
        uint256 agenticScore;
        uint256 riskScore;
        ThreatLevel threatLevel;
        bool isQuarantined;
        uint256 lastHeartbeat;
        uint256 heartbeatsCount;
        uint256 verificationTimestamp;
        uint256 lastScoreUpdate;
        uint256 quarantineCount;
    }

    struct ScoreRecord {
        uint256 score;
        uint256 timestamp;
    }

    struct ThreatRecord {
        ThreatLevel level;
        string threatType;
        uint256 timestamp;
        string details;
    }

    struct QuarantineRecord {
        uint256 timestamp;
        string reason;
        bool active;
    }

    // ============ State Variables ============

    address public oracleAddress;
    address public erc8004Contract;
    address public immutable deployer;

    mapping(address => AgentInfo) public agents;
    mapping(uint256 => address) public tokenToWallet;
    mapping(address => ScoreRecord[]) public scoreHistory;
    mapping(address => ThreatRecord[]) public threatHistory;
    mapping(address => QuarantineRecord[]) public quarantineHistory;

    address[] public agentAddresses;
    address[] public verifiedAgentList;
    address[] public quarantinedList;

    uint256 public totalThreatsDetected;
    uint256 public totalQuarantines;

    // ============ Events ============

    event AgentRegistered(address indexed wallet, uint256 indexed tokenId, uint256 timestamp);
    event ScoreUpdated(address indexed wallet, uint256 newScore, uint256 timestamp);
    event AgentVerified(address indexed wallet, uint256 timestamp);
    event HeartbeatReceived(address indexed wallet, uint256 timestamp);
    event RiskScoreUpdated(address indexed wallet, uint256 riskScore, ThreatLevel level, uint256 timestamp);
    event AgentQuarantined(address indexed wallet, string reason, uint256 timestamp);
    event AgentUnquarantined(address indexed wallet, uint256 timestamp);
    event ThreatDetected(address indexed wallet, ThreatLevel level, string threatType, uint256 timestamp);
    event OracleUpdated(address indexed newOracle, uint256 timestamp);

    // ============ Modifiers ============

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Registry: caller is not the oracle");
        _;
    }

    modifier onlyOracleOrDeployer() {
        require(
            msg.sender == oracleAddress || msg.sender == deployer,
            "Registry: caller is not oracle or deployer"
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
        require(erc8004Contract != address(0), "Registry: ERC8004 not set");

        IERC8004 erc8004 = IERC8004(erc8004Contract);
        address wallet = erc8004.ownerOf(_tokenId);
        require(wallet == msg.sender, "Registry: not token owner");
        require(_tokenId != 0, "Registry: invalid token ID");
        require(agents[wallet].status == AgentStatus.Unverified, "Registry: already registered");
        require(erc8004.isRegisteredAgent(wallet), "Registry: not a registered agent");

        agents[wallet] = AgentInfo({
            erc8004TokenId: _tokenId,
            wallet: wallet,
            status: AgentStatus.Pending,
            agenticScore: 0,
            riskScore: 0,
            threatLevel: ThreatLevel.None,
            isQuarantined: false,
            lastHeartbeat: 0,
            heartbeatsCount: 0,
            verificationTimestamp: 0,
            lastScoreUpdate: 0,
            quarantineCount: 0
        });

        tokenToWallet[_tokenId] = wallet;
        agentAddresses.push(wallet);

        emit AgentRegistered(wallet, _tokenId, block.timestamp);
    }

    /// @notice Directly verify a wallet and submit score (oracle only)
    /// @param _wallet The agent wallet
    /// @param _score The agentic score (0-100)
    function verifyAgentDirect(address _wallet, uint256 _score) external onlyOracle {
        require(_score <= 100, "Registry: score must be 0-100");
        require(_wallet != address(0), "Registry: invalid wallet");

        AgentInfo storage agent = agents[_wallet];
        if (agent.status == AgentStatus.Unverified) {
            agents[_wallet] = AgentInfo({
                erc8004TokenId: 0,
                wallet: _wallet,
                status: AgentStatus.Pending,
                agenticScore: 0,
                riskScore: 0,
                threatLevel: ThreatLevel.None,
                isQuarantined: false,
                lastHeartbeat: 0,
                heartbeatsCount: 0,
                verificationTimestamp: 0,
                lastScoreUpdate: 0,
                quarantineCount: 0
            });
            agentAddresses.push(_wallet);
            emit AgentRegistered(_wallet, 0, block.timestamp);
        }

        agent.agenticScore = _score;
        agent.lastScoreUpdate = block.timestamp;

        scoreHistory[_wallet].push(ScoreRecord({
            score: _score,
            timestamp: block.timestamp
        }));

        if (_score >= 70) {
            if (agent.status != AgentStatus.Verified) {
                verifiedAgentList.push(_wallet);
            }
            agent.status = AgentStatus.Verified;
            agent.verificationTimestamp = block.timestamp;
            emit AgentVerified(_wallet, block.timestamp);
        } else {
            agent.status = AgentStatus.Pending;
        }

        emit ScoreUpdated(_wallet, _score, block.timestamp);
    }

    /// @notice Submit a heartbeat from an agent wallet
    function submitHeartbeat() external {
        AgentInfo storage agent = agents[msg.sender];
        require(agent.status != AgentStatus.Unverified, "Registry: agent not registered");
        require(agent.status != AgentStatus.Rejected, "Registry: agent rejected");

        agent.lastHeartbeat = block.timestamp;
        agent.heartbeatsCount++;

        emit HeartbeatReceived(msg.sender, block.timestamp);
    }

    /// @notice Submit a score for an agent (oracle only)
    function submitScore(address _wallet, uint256 _score) external onlyOracle {
        require(_score <= 100, "Registry: score must be 0-100");
        AgentInfo storage agent = agents[_wallet];
        require(agent.status != AgentStatus.Unverified, "Registry: agent not registered");
        require(!agent.isQuarantined, "Registry: agent is quarantined");

        agent.agenticScore = _score;
        agent.lastScoreUpdate = block.timestamp;

        scoreHistory[_wallet].push(ScoreRecord({
            score: _score,
            timestamp: block.timestamp
        }));

        if (_score >= 70) {
            if (agent.status != AgentStatus.Verified) {
                verifiedAgentList.push(_wallet);
            }
            agent.status = AgentStatus.Verified;
            agent.verificationTimestamp = block.timestamp;
            emit AgentVerified(_wallet, block.timestamp);
        } else {
            agent.status = AgentStatus.Pending;
        }

        emit ScoreUpdated(_wallet, _score, block.timestamp);
    }

    // ============ Guard Functions (NEW) ============

    /// @notice Submit risk score and threat level for an agent (oracle only)
    /// @param _wallet Agent wallet
    /// @param _riskScore Risk score (0-100, higher = more dangerous)
    /// @param _level Threat level
    /// @param _threatType Type of threat detected
    /// @param _details Additional details
    function submitRiskScore(
        address _wallet,
        uint256 _riskScore,
        ThreatLevel _level,
        string calldata _threatType,
        string calldata _details
    ) external onlyOracle {
        require(_riskScore <= 100, "Registry: risk score must be 0-100");
        require(agents[_wallet].status != AgentStatus.Unverified, "Registry: agent not registered");

        AgentInfo storage agent = agents[_wallet];
        agent.riskScore = _riskScore;
        agent.threatLevel = _level;
        agent.lastScoreUpdate = block.timestamp;

        // Record threat
        threatHistory[_wallet].push(ThreatRecord({
            level: _level,
            threatType: _threatType,
            timestamp: block.timestamp,
            details: _details
        }));
        totalThreatsDetected++;

        emit RiskScoreUpdated(_wallet, _riskScore, _level, block.timestamp);
        emit ThreatDetected(_wallet, _level, _threatType, block.timestamp);

        // Auto-quarantine if critical
        if (_level == ThreatLevel.Critical && !agent.isQuarantined) {
            agent.isQuarantined = true;
            agent.quarantineCount++;
            quarantinedList.push(_wallet);

            quarantineHistory[_wallet].push(QuarantineRecord({
                timestamp: block.timestamp,
                reason: string(abi.encodePacked("AUTO: ", _threatType)),
                active: true
            }));
            totalQuarantines++;

            agent.status = AgentStatus.Rejected;

            emit AgentQuarantined(_wallet, _threatType, block.timestamp);
        }
    }

    /// @notice Quarantine an agent (oracle only)
    /// @param _wallet Agent to quarantine
    /// @param _reason Reason for quarantine
    function quarantineAgent(address _wallet, string calldata _reason) external onlyOracle {
        require(agents[_wallet].status != AgentStatus.Unverified, "Registry: agent not registered");

        AgentInfo storage agent = agents[_wallet];
        if (agent.isQuarantined) return; // already quarantined

        agent.isQuarantined = true;
        agent.quarantineCount++;
        quarantinedList.push(_wallet);

        quarantineHistory[_wallet].push(QuarantineRecord({
            timestamp: block.timestamp,
            reason: _reason,
            active: true
        }));
        totalQuarantines++;

        agent.status = AgentStatus.Rejected;

        emit AgentQuarantined(_wallet, _reason, block.timestamp);
    }

    /// @notice Unquarantine an agent (oracle only)
    /// @param _wallet Agent to unquarantine
    function unquarantineAgent(address _wallet) external onlyOracle {
        require(agents[_wallet].isQuarantined, "Registry: not quarantined");

        AgentInfo storage agent = agents[_wallet];
        agent.isQuarantined = false;

        // Mark last quarantine as inactive
        QuarantineRecord[] storage records = quarantineHistory[_wallet];
        if (records.length > 0) {
            records[records.length - 1].active = false;
        }

        agent.status = AgentStatus.Pending;

        emit AgentUnquarantined(_wallet, block.timestamp);
    }

    /// @notice Set agent status (oracle only)
    function setAgentStatus(address _wallet, AgentStatus _status) external onlyOracle {
        require(agents[_wallet].status != AgentStatus.Unverified, "Registry: agent not registered");
        agents[_wallet].status = _status;

        if (_status == AgentStatus.Verified) {
            agents[_wallet].verificationTimestamp = block.timestamp;
            emit AgentVerified(_wallet, block.timestamp);
        }
    }

    // ============ View Functions ============

    function isRegistered(address _wallet) external view returns (bool) {
        return agents[_wallet].status != AgentStatus.Unverified;
    }

    function isVerifiedAgent(address _wallet) external view returns (bool) {
        AgentInfo storage agent = agents[_wallet];
        return agent.status == AgentStatus.Verified && agent.agenticScore >= 70 && !agent.isQuarantined;
    }

    function isQuarantined(address _wallet) external view returns (bool) {
        return agents[_wallet].isQuarantined;
    }

    function getAgentScore(address _wallet) external view returns (uint256) {
        if (agents[_wallet].status == AgentStatus.Unverified) return 0;
        return agents[_wallet].agenticScore;
    }

    function getRiskScore(address _wallet) external view returns (uint256) {
        return agents[_wallet].riskScore;
    }

    function getThreatLevel(address _wallet) external view returns (ThreatLevel) {
        return agents[_wallet].threatLevel;
    }

    function getAgentStatus(address _wallet) external view returns (AgentStatus) {
        return agents[_wallet].status;
    }

    function getAgentInfo(address _wallet) external view returns (AgentInfo memory) {
        return agents[_wallet];
    }

    function getScoreHistory(address _wallet) external view returns (ScoreRecord[] memory) {
        return scoreHistory[_wallet];
    }

    function getScoreHistoryLength(address _wallet) external view returns (uint256) {
        return scoreHistory[_wallet].length;
    }

    function getThreatHistory(address _wallet) external view returns (ThreatRecord[] memory) {
        return threatHistory[_wallet];
    }

    function getQuarantineHistory(address _wallet) external view returns (QuarantineRecord[] memory) {
        return quarantineHistory[_wallet];
    }

    function getGuardStatus(address _wallet) external view returns (
        bool isGuarded,
        ThreatLevel threatLevel,
        uint256 riskScore,
        bool quarantined
    ) {
        AgentInfo storage agent = agents[_wallet];
        return (
            agent.status != AgentStatus.Unverified,
            agent.threatLevel,
            agent.riskScore,
            agent.isQuarantined
        );
    }

    function getAllAgents() external view returns (address[] memory) {
        return agentAddresses;
    }

    function getAllVerifiedAgents() external view returns (address[] memory) {
        return verifiedAgentList;
    }

    function getQuarantinedAgents() external view returns (address[] memory) {
        return quarantinedList;
    }

    function getTotalAgents() external view returns (uint256) {
        return agentAddresses.length;
    }

    function getTotalVerifiedAgents() external view returns (uint256) {
        return verifiedAgentList.length;
    }

    function getTotalQuarantined() external view returns (uint256) {
        return quarantinedList.length;
    }

    function getAgentCounts() external view returns (
        uint256 total,
        uint256 verified,
        uint256 quarantined,
        uint256 threats
    ) {
        return (agentAddresses.length, verifiedAgentList.length, quarantinedList.length, totalThreatsDetected);
    }

    // ============ Admin Functions ============

    function setOracleAddress(address _oracleAddress) external onlyOracleOrDeployer {
        require(_oracleAddress != address(0), "Registry: invalid oracle address");
        oracleAddress = _oracleAddress;
        emit OracleUpdated(_oracleAddress, block.timestamp);
    }

    function setERC8004Contract(address _erc8004Contract) external onlyOracleOrDeployer {
        require(_erc8004Contract != address(0), "Registry: invalid ERC8004 address");
        erc8004Contract = _erc8004Contract;
    }
}
