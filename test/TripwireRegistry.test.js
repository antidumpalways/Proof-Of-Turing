const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TripwireRegistry", function () {
  let mockERC8004;
  let registry;
  let deployer, oracle, agent, attacker, user1;

  const TOKEN_ID_1 = 1;
  const TOKEN_ID_2 = 2;

  const toNum = (bn) => Number(bn);

  beforeEach(async function () {
    [deployer, oracle, agent, attacker, user1] = await ethers.getSigners();

    const MockERC8004 = await ethers.getContractFactory("MockERC8004");
    mockERC8004 = await MockERC8004.deploy();
    await mockERC8004.waitForDeployment();

    const TripwireRegistry = await ethers.getContractFactory("TripwireRegistry");
    registry = await TripwireRegistry.deploy();
    await registry.waitForDeployment();

    await registry.setOracleAddress(oracle.address);
    await registry.setERC8004Contract(await mockERC8004.getAddress());

    await mockERC8004.mint(agent.address, TOKEN_ID_1);
    await mockERC8004.mint(deployer.address, TOKEN_ID_2);
  });

  describe("Agent Registration", function () {
    it("should register an agent with valid ERC-8004 token", async function () {
      await registry.connect(agent).registerAgent(TOKEN_ID_1);

      const info = await registry.getAgentInfo(agent.address);
      expect(toNum(info.erc8004TokenId)).to.equal(TOKEN_ID_1);
      expect(info.wallet).to.equal(agent.address);
    });

    it("should set status to Pending after registration", async function () {
      await registry.connect(agent).registerAgent(TOKEN_ID_1);

      const info = await registry.getAgentInfo(agent.address);
      expect(toNum(info.status)).to.equal(1); // Pending
    });

    it("should revert if not token owner", async function () {
      try {
        await registry.connect(attacker).registerAgent(TOKEN_ID_1);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Registry: not token owner");
      }
    });

    it("should revert if already registered", async function () {
      await registry.connect(agent).registerAgent(TOKEN_ID_1);
      try {
        await registry.connect(agent).registerAgent(TOKEN_ID_1);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Registry: already registered");
      }
    });
  });

  describe("Score Submission", function () {
    beforeEach(async function () {
      await registry.connect(agent).registerAgent(TOKEN_ID_1);
    });

    it("should allow oracle to submit a score", async function () {
      await registry.connect(oracle).submitScore(agent.address, 50);

      const score = await registry.getAgentScore(agent.address);
      expect(toNum(score)).to.equal(50);
    });

    it("should auto-verify agent if score >= 70", async function () {
      await registry.connect(oracle).submitScore(agent.address, 85);

      const info = await registry.getAgentInfo(agent.address);
      expect(toNum(info.status)).to.equal(2); // Verified
    });

    it("should set status to Pending if score < 70", async function () {
      await registry.connect(oracle).submitScore(agent.address, 85);
      await registry.connect(oracle).submitScore(agent.address, 40);

      const info = await registry.getAgentInfo(agent.address);
      expect(toNum(info.status)).to.equal(1); // Pending
    });

    it("should revert if score > 100", async function () {
      try {
        await registry.connect(oracle).submitScore(agent.address, 101);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Registry: score must be 0-100");
      }
    });
  });

  describe("Risk Score & Threat Detection", function () {
    beforeEach(async function () {
      await registry.connect(agent).registerAgent(TOKEN_ID_1);
    });

    it("should submit risk score", async function () {
      await registry.connect(oracle).submitRiskScore(
        agent.address,
        25,
        1, // Low
        "Unusual timing",
        "Agent showed non-standard patterns"
      );

      const risk = await registry.getRiskScore(agent.address);
      expect(toNum(risk)).to.equal(25);
    });

    it("should submit threat level", async function () {
      await registry.connect(oracle).submitRiskScore(
        agent.address,
        50,
        2, // Medium
        "High slippage",
        "Multiple high slippage trades detected"
      );

      const level = await registry.getThreatLevel(agent.address);
      expect(toNum(level)).to.equal(2); // Medium
    });

    it("should record threat history", async function () {
      await registry.connect(oracle).submitRiskScore(
        agent.address,
        30,
        1,
        "Anomaly",
        "First detection"
      );

      const history = await registry.getThreatHistory(agent.address);
      expect(history.length).to.equal(1);
      expect(history[0].threatType).to.equal("Anomaly");
    });

    it("should auto-quarantine on Critical threat", async function () {
      await registry.connect(oracle).submitRiskScore(
        agent.address,
        90,
        4, // Critical
        "Flash loan attack",
        "Detected flash loan pattern"
      );

      const info = await registry.getAgentInfo(agent.address);
      expect(info.isQuarantined).to.be.true;
      expect(toNum(info.status)).to.equal(3); // Rejected
    });

    it("should emit ThreatDetected event", async function () {
      const tx = await registry.connect(oracle).submitRiskScore(
        agent.address,
        40,
        2,
        "Suspicious",
        "Pattern detected"
      );
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const parsed = registry.interface.parseLog(log);
          return parsed && parsed.name === "ThreatDetected";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;
    });

    it("should emit RiskScoreUpdated event", async function () {
      const tx = await registry.connect(oracle).submitRiskScore(
        agent.address,
        40,
        2,
        "Suspicious",
        "Pattern detected"
      );
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const parsed = registry.interface.parseLog(log);
          return parsed && parsed.name === "RiskScoreUpdated";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;
    });
  });

  describe("Quarantine", function () {
    beforeEach(async function () {
      await registry.connect(agent).registerAgent(TOKEN_ID_1);
    });

    it("should quarantine an agent", async function () {
      await registry.connect(oracle).quarantineAgent(agent.address, "Malicious behavior");

      const info = await registry.getAgentInfo(agent.address);
      expect(info.isQuarantined).to.be.true;
    });

    it("should set status to Rejected after quarantine", async function () {
      await registry.connect(oracle).quarantineAgent(agent.address, "Malicious behavior");

      const info = await registry.getAgentInfo(agent.address);
      expect(toNum(info.status)).to.equal(3); // Rejected
    });

    it("should increment quarantine count", async function () {
      await registry.connect(oracle).quarantineAgent(agent.address, "First offense");
      await registry.connect(oracle).unquarantineAgent(agent.address);
      await registry.connect(oracle).quarantineAgent(agent.address, "Second offense");

      const info = await registry.getAgentInfo(agent.address);
      expect(toNum(info.quarantineCount)).to.equal(2);
    });

    it("should record quarantine history", async function () {
      await registry.connect(oracle).quarantineAgent(agent.address, "Malicious");

      const history = await registry.getQuarantineHistory(agent.address);
      expect(history.length).to.equal(1);
      expect(history[0].reason).to.equal("Malicious");
      expect(history[0].active).to.be.true;
    });

    it("should unquarantine an agent", async function () {
      await registry.connect(oracle).quarantineAgent(agent.address, "Malicious");
      await registry.connect(oracle).unquarantineAgent(agent.address);

      const info = await registry.getAgentInfo(agent.address);
      expect(info.isQuarantined).to.be.false;
      expect(toNum(info.status)).to.equal(1); // Pending
    });

    it("should mark quarantine record as inactive", async function () {
      await registry.connect(oracle).quarantineAgent(agent.address, "Malicious");
      await registry.connect(oracle).unquarantineAgent(agent.address);

      const history = await registry.getQuarantineHistory(agent.address);
      expect(history[0].active).to.be.false;
    });

    it("should emit AgentQuarantined event", async function () {
      const tx = await registry.connect(oracle).quarantineAgent(agent.address, "Malicious");
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const parsed = registry.interface.parseLog(log);
          return parsed && parsed.name === "AgentQuarantined";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;
    });

    it("should emit AgentUnquarantined event", async function () {
      await registry.connect(oracle).quarantineAgent(agent.address, "Malicious");
      const tx = await registry.connect(oracle).unquarantineAgent(agent.address);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const parsed = registry.interface.parseLog(log);
          return parsed && parsed.name === "AgentUnquarantined";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;
    });

    it("should revert score submission for quarantined agent", async function () {
      await registry.connect(oracle).quarantineAgent(agent.address, "Malicious");
      await expect(registry.connect(oracle).submitScore(agent.address, 90))
        .to.be.revertedWith("Registry: agent is quarantined");
    });
  });

  describe("Guard Status", function () {
    beforeEach(async function () {
      await registry.connect(agent).registerAgent(TOKEN_ID_1);
    });

    it("should return guard status", async function () {
      await registry.connect(oracle).submitRiskScore(
        agent.address,
        30,
        1,
        "Anomaly",
        "Minor"
      );

      const status = await registry.getGuardStatus(agent.address);
      expect(status.isGuarded).to.be.true;
      expect(toNum(status.threatLevel)).to.equal(1);
      expect(toNum(status.riskScore)).to.equal(30);
      expect(status.quarantined).to.be.false;
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await registry.connect(agent).registerAgent(TOKEN_ID_1);
    });

    it("should return correct agent info", async function () {
      const info = await registry.getAgentInfo(agent.address);
      expect(info.wallet).to.equal(agent.address);
      expect(toNum(info.erc8004TokenId)).to.equal(TOKEN_ID_1);
    });

    it("should return total agents", async function () {
      expect(toNum(await registry.getTotalAgents())).to.equal(1);
    });

    it("should return score history", async function () {
      await registry.connect(oracle).submitScore(agent.address, 30);
      await registry.connect(oracle).submitScore(agent.address, 60);

      const history = await registry.getScoreHistory(agent.address);
      expect(history.length).to.equal(2);
    });

    it("should return quarantined agents list", async function () {
      await registry.connect(oracle).quarantineAgent(agent.address, "Malicious");

      const list = await registry.getQuarantinedAgents();
      expect(list.length).to.equal(1);
      expect(list[0]).to.equal(agent.address);
    });

    it("should return agent counts", async function () {
      await registry.connect(oracle).submitScore(agent.address, 80);
      await registry.connect(oracle).quarantineAgent(agent.address, "Test");

      const counts = await registry.getAgentCounts();
      expect(toNum(counts.total)).to.equal(1);
      expect(toNum(counts.threats)).to.equal(0);
    });
  });

  describe("Admin", function () {
    it("should allow oracle to set agent status", async function () {
      await registry.connect(agent).registerAgent(TOKEN_ID_1);
      await registry.connect(oracle).setAgentStatus(agent.address, 3); // Rejected

      const info = await registry.getAgentInfo(agent.address);
      expect(toNum(info.status)).to.equal(3);
    });

    it("should allow deployer to set oracle address", async function () {
      await registry.connect(deployer).setOracleAddress(attacker.address);
      expect(await registry.oracleAddress()).to.equal(attacker.address);
    });

    it("should revert setOracleAddress from non-oracle/non-deployer", async function () {
      try {
        await registry.connect(agent).setOracleAddress(attacker.address);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("Registry: caller is not oracle or deployer");
      }
    });
  });
});
