const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PoTRegistry", function () {
  let mockERC8004;
  let potRegistry;
  let deployer, oracle, agent, attacker;

  const TOKEN_ID_1 = 1;
  const TOKEN_ID_2 = 2;

  // Helper to normalize BigInt to Number for comparison
  const toNum = (bn) => Number(bn);

  beforeEach(async function () {
    [deployer, oracle, agent, attacker] = await ethers.getSigners();

    // Deploy MockERC8004
    const MockERC8004 = await ethers.getContractFactory("MockERC8004");
    mockERC8004 = await MockERC8004.deploy();
    await mockERC8004.waitForDeployment();

    // Deploy PoTRegistry
    const PoTRegistry = await ethers.getContractFactory("PoTRegistry");
    potRegistry = await PoTRegistry.deploy();
    await potRegistry.waitForDeployment();

    // Configure PoTRegistry
    await potRegistry.setOracleAddress(oracle.address);
    await potRegistry.setERC8004Contract(await mockERC8004.getAddress());

    // Mint tokens to agent
    await mockERC8004.mint(agent.address, TOKEN_ID_1);
    await mockERC8004.mint(deployer.address, TOKEN_ID_2);
  });

  describe("Agent Registration", function () {
    it("should register an agent with valid ERC-8004 token", async function () {
      await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);

      const info = await potRegistry.getAgentInfo(agent.address);
      expect(toNum(info.erc8004TokenId)).to.equal(TOKEN_ID_1);
      expect(info.wallet).to.equal(agent.address);
    });

    it("should set status to Pending after registration", async function () {
      await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);

      const info = await potRegistry.getAgentInfo(agent.address);
      expect(toNum(info.status)).to.equal(1); // Pending
    });

    it("should revert if not token owner", async function () {
      try {
        await potRegistry.connect(attacker).registerAgent(TOKEN_ID_1);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: not token owner");
      }
    });

    it("should revert if already registered", async function () {
      await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);
      try {
        await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: already registered");
      }
    });

    it("should emit AgentRegistered event", async function () {
      const tx = await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);
      const receipt = await tx.wait();

      // Check that AgentRegistered event was emitted
      const event = receipt.logs.find(log => {
        try {
          const parsed = potRegistry.interface.parseLog(log);
          return parsed && parsed.name === "AgentRegistered";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;
    });
  });

  describe("Score Submission", function () {
    beforeEach(async function () {
      await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);
    });

    it("should allow oracle to submit a score", async function () {
      await potRegistry.connect(oracle).submitScore(agent.address, 50);

      const score = await potRegistry.getAgentScore(agent.address);
      expect(toNum(score)).to.equal(50);
    });

    it("should revert if non-oracle submits score", async function () {
      try {
        await potRegistry.connect(attacker).submitScore(agent.address, 50);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: caller is not the oracle");
      }
    });

    it("should auto-verify agent if score >= 70", async function () {
      await potRegistry.connect(oracle).submitScore(agent.address, 85);

      const info = await potRegistry.getAgentInfo(agent.address);
      expect(toNum(info.status)).to.equal(2); // Verified
      expect(toNum(info.agenticScore)).to.equal(85);
    });

    it("should set status to Pending if score < 70", async function () {
      await potRegistry.connect(oracle).submitScore(agent.address, 85);
      await potRegistry.connect(oracle).submitScore(agent.address, 40);

      const info = await potRegistry.getAgentInfo(agent.address);
      expect(toNum(info.status)).to.equal(1); // Pending
      expect(toNum(info.agenticScore)).to.equal(40);
    });

    it("should revert if score > 100", async function () {
      try {
        await potRegistry.connect(oracle).submitScore(agent.address, 101);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: score must be 0-100");
      }
    });

    it("should emit ScoreUpdated event", async function () {
      const tx = await potRegistry.connect(oracle).submitScore(agent.address, 75);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const parsed = potRegistry.interface.parseLog(log);
          return parsed && parsed.name === "ScoreUpdated";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;
    });

    it("should emit AgentVerified when auto-verifying", async function () {
      const tx = await potRegistry.connect(oracle).submitScore(agent.address, 75);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const parsed = potRegistry.interface.parseLog(log);
          return parsed && parsed.name === "AgentVerified";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;
    });
  });

  describe("Verification Threshold", function () {
    beforeEach(async function () {
      await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);
    });

    it("should return isVerifiedAgent = true when score >= 70 and status Verified", async function () {
      await potRegistry.connect(oracle).submitScore(agent.address, 90);
      expect(await potRegistry.isVerifiedAgent(agent.address)).to.be.true;
    });

    it("should return isVerifiedAgent = false when score < 70", async function () {
      await potRegistry.connect(oracle).submitScore(agent.address, 50);
      expect(await potRegistry.isVerifiedAgent(agent.address)).to.be.false;
    });

    it("should return isVerifiedAgent = false when score >= 70 but manually set to Pending", async function () {
      await potRegistry.connect(oracle).submitScore(agent.address, 90);
      await potRegistry.connect(oracle).setAgentStatus(agent.address, 1); // Set back to Pending
      expect(await potRegistry.isVerifiedAgent(agent.address)).to.be.false;
    });
  });

  describe("Heartbeat", function () {
    beforeEach(async function () {
      await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);
    });

    it("should record heartbeat", async function () {
      await potRegistry.connect(agent).submitHeartbeat();

      const info = await potRegistry.getAgentInfo(agent.address);
      expect(toNum(info.heartbeatsCount)).to.equal(1);
      expect(toNum(info.lastHeartbeat)).to.be.gt(0);
    });

    it("should increment heartbeatsCount on multiple calls", async function () {
      await potRegistry.connect(agent).submitHeartbeat();
      await potRegistry.connect(agent).submitHeartbeat();
      await potRegistry.connect(agent).submitHeartbeat();

      const info = await potRegistry.getAgentInfo(agent.address);
      expect(toNum(info.heartbeatsCount)).to.equal(3);
    });

    it("should emit HeartbeatReceived event", async function () {
      const tx = await potRegistry.connect(agent).submitHeartbeat();
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const parsed = potRegistry.interface.parseLog(log);
          return parsed && parsed.name === "HeartbeatReceived";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;
    });

    it("should revert for unregistered agent", async function () {
      try {
        await potRegistry.connect(attacker).submitHeartbeat();
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: agent not registered");
      }
    });

    it("should revert for rejected agent", async function () {
      // Agent already registered in beforeEach
      await potRegistry.connect(oracle).setAgentStatus(agent.address, 3); // Rejected
      try {
        await potRegistry.connect(agent).submitHeartbeat();
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: agent rejected");
      }
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);
    });

    it("should return correct agent info", async function () {
      const info = await potRegistry.getAgentInfo(agent.address);
      expect(info.wallet).to.equal(agent.address);
      expect(toNum(info.erc8004TokenId)).to.equal(TOKEN_ID_1);
    });

    it("should return total number of agents", async function () {
      expect(toNum(await potRegistry.getTotalAgents())).to.equal(1);
      await mockERC8004.mint(attacker.address, 3);
      await potRegistry.connect(attacker).registerAgent(3);
      expect(toNum(await potRegistry.getTotalAgents())).to.equal(2);
    });

    it("should return score history", async function () {
      await potRegistry.connect(oracle).submitScore(agent.address, 30);
      await potRegistry.connect(oracle).submitScore(agent.address, 60);
      await potRegistry.connect(oracle).submitScore(agent.address, 90);

      const history = await potRegistry.getScoreHistory(agent.address);
      expect(history.length).to.equal(3);
      expect(toNum(history[0].score)).to.equal(30);
      expect(toNum(history[1].score)).to.equal(60);
      expect(toNum(history[2].score)).to.equal(90);
    });

    it("should revert getAgentInfo for unregistered agent", async function () {
      try {
        await potRegistry.getAgentInfo(attacker.address);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: agent not registered");
      }
    });
  });

  describe("Admin Functions", function () {
    it("should allow oracle to set agent status", async function () {
      await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);
      await potRegistry.connect(oracle).setAgentStatus(agent.address, 3); // Rejected

      const info = await potRegistry.getAgentInfo(agent.address);
      expect(toNum(info.status)).to.equal(3);
    });

    it("should allow oracle or deployer to set oracle address", async function () {
      await potRegistry.connect(deployer).setOracleAddress(attacker.address);
      expect(await potRegistry.oracleAddress()).to.equal(attacker.address);
    });

    it("should reject setting ERC8004 to zero address", async function () {
      try {
        await potRegistry.connect(deployer).setERC8004Contract(ethers.ZeroAddress);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: invalid ERC8004 address");
      }
    });

    it("should revert setOracleAddress from non-oracle/non-deployer", async function () {
      try {
        await potRegistry.connect(agent).setOracleAddress(attacker.address);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: caller is not oracle or deployer");
      }
    });

    it("should emit OracleUpdated event", async function () {
      const tx = await potRegistry.connect(deployer).setOracleAddress(attacker.address);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => {
        try {
          const parsed = potRegistry.interface.parseLog(log);
          return parsed && parsed.name === "OracleUpdated";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;
    });
  });

  describe("Edge Cases", function () {
    it("should revert registration query for unregistered agent", async function () {
      try {
        await potRegistry.getAgentScore(attacker.address);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: agent not registered");
      }
    });

    it("should revert score submission for unregistered agent", async function () {
      try {
        await potRegistry.connect(oracle).submitScore(attacker.address, 50);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: agent not registered");
      }
    });

    it("should revert registration when ERC8004 not set", async function () {
      // Deploy a new PoTRegistry without setting ERC8004
      const PoTRegistry = await ethers.getContractFactory("PoTRegistry");
      const newRegistry = await PoTRegistry.deploy();
      await newRegistry.waitForDeployment();

      try {
        await newRegistry.connect(agent).registerAgent(TOKEN_ID_1);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PoTRegistry: ERC8004 not set");
      }
    });

    it("should handle multiple agents correctly", async function () {
      await potRegistry.connect(agent).registerAgent(TOKEN_ID_1);
      // Register deployer's token
      await potRegistry.connect(deployer).registerAgent(TOKEN_ID_2);

      expect(toNum(await potRegistry.getTotalAgents())).to.equal(2);
    });
  });
});
