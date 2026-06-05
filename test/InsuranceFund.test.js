const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InsuranceFund", function () {
  let insuranceFund;
  let deployer, oracle, agent1, agent2, user1;

  const ETH = (n) => ethers.parseEther(n.toString());

  beforeEach(async function () {
    [deployer, oracle, agent1, agent2, user1] = await ethers.getSigners();

    const InsuranceFund = await ethers.getContractFactory("InsuranceFund");
    insuranceFund = await InsuranceFund.deploy();
    await insuranceFund.waitForDeployment();

    await insuranceFund.setOracleAddress(oracle.address);
  });

  describe("Staking", function () {
    it("should allow agent to stake MNT", async function () {
      await insuranceFund.connect(agent1).stakeAsAgent({ value: ETH(10) });
      const stake = await insuranceFund.getAgentStake(agent1.address);
      expect(stake).to.equal(ETH(10));
    });

    it("should update total staked", async function () {
      await insuranceFund.connect(agent1).stakeAsAgent({ value: ETH(10) });
      await insuranceFund.connect(agent2).stakeAsAgent({ value: ETH(5) });
      const [totalStaked] = await insuranceFund.getPoolInfo();
      expect(totalStaked).to.equal(ETH(15));
    });

    it("should emit AgentStaked event", async function () {
      await expect(insuranceFund.connect(agent1).stakeAsAgent({ value: ETH(10) }))
        .to.emit(insuranceFund, "AgentStaked");
    });

    it("should revert if zero stake", async function () {
      await expect(insuranceFund.connect(agent1).stakeAsAgent({ value: 0 }))
        .to.be.revertedWith("InsuranceFund: zero stake");
    });

    it("should allow additional staking", async function () {
      await insuranceFund.connect(agent1).stakeAsAgent({ value: ETH(10) });
      await insuranceFund.connect(agent1).stakeAsAgent({ value: ETH(5) });
      const stake = await insuranceFund.getAgentStake(agent1.address);
      expect(stake).to.equal(ETH(15));
    });
  });

  describe("Slashing", function () {
    beforeEach(async function () {
      await insuranceFund.connect(agent1).stakeAsAgent({ value: ETH(10) });
    });

    it("should slash agent stake", async function () {
      await insuranceFund.connect(oracle).slashAgent(agent1.address, ETH(3), "Policy violation");
      const stake = await insuranceFund.getAgentStake(agent1.address);
      expect(stake).to.equal(ETH(7));
    });

    it("should add slashed amount to claim balance", async function () {
      await insuranceFund.connect(oracle).slashAgent(agent1.address, ETH(3), "Policy violation");
      const [, , claimBalance] = await insuranceFund.getPoolInfo();
      expect(claimBalance).to.equal(ETH(3));
    });

    it("should emit AgentSlashed event", async function () {
      await expect(insuranceFund.connect(oracle).slashAgent(agent1.address, ETH(3), "Policy violation"))
        .to.emit(insuranceFund, "AgentSlashed");
    });

    it("should revert if insufficient stake", async function () {
      await expect(insuranceFund.connect(oracle).slashAgent(agent1.address, ETH(20), "Excessive"))
        .to.be.revertedWith("InsuranceFund: insufficient stake");
    });

    it("should revert if not oracle", async function () {
      await expect(insuranceFund.connect(user1).slashAgent(agent1.address, ETH(1), "Unauthorized"))
        .to.be.revertedWith("InsuranceFund: caller is not the oracle");
    });
  });

  describe("Claims", function () {
    beforeEach(async function () {
      await insuranceFund.connect(agent1).stakeAsAgent({ value: ETH(10) });
      await insuranceFund.connect(oracle).slashAgent(agent1.address, ETH(5), "Flash loan attack");
    });

    it("should compensate user from pool", async function () {
      const balBefore = await ethers.provider.getBalance(user1.address);
      await insuranceFund.connect(oracle).claimCompensation(user1.address, ETH(2), "Compensated");
      const balAfter = await ethers.provider.getBalance(user1.address);
      expect(balAfter - balBefore).to.equal(ETH(2));
    });

    it("should update claim balance", async function () {
      await insuranceFund.connect(oracle).claimCompensation(user1.address, ETH(2), "Compensated");
      const [, , claimBalance] = await insuranceFund.getPoolInfo();
      expect(claimBalance).to.equal(ETH(3));
    });

    it("should increment total claims", async function () {
      await insuranceFund.connect(oracle).claimCompensation(user1.address, ETH(2), "Compensated");
      const [, totalClaims] = await insuranceFund.getPoolInfo();
      expect(totalClaims).to.equal(ETH(2));
    });

    it("should record claim details", async function () {
      await insuranceFund.connect(oracle).claimCompensation(user1.address, ETH(2), "Flash loan attack");
      const claim = await insuranceFund.getClaim(0);
      expect(claim.user).to.equal(user1.address);
      expect(claim.amount).to.equal(ETH(2));
      expect(claim.reason).to.equal("Flash loan attack");
    });

    it("should emit UserCompensated event", async function () {
      await expect(insuranceFund.connect(oracle).claimCompensation(user1.address, ETH(2), "Compensated"))
        .to.emit(insuranceFund, "UserCompensated");
    });

    it("should revert if insufficient pool balance", async function () {
      await expect(insuranceFund.connect(oracle).claimCompensation(user1.address, ETH(100), "Too much"))
        .to.be.revertedWith("InsuranceFund: insufficient pool balance");
    });
  });

  describe("View Functions", function () {
    it("should return pool info", async function () {
      await insuranceFund.connect(agent1).stakeAsAgent({ value: ETH(10) });
      const [totalStaked, totalClaims, claimBalance] = await insuranceFund.getPoolInfo();
      expect(totalStaked).to.equal(ETH(10));
      expect(totalClaims).to.equal(0);
      expect(claimBalance).to.equal(0);
    });

    it("should return claim count", async function () {
      expect(await insuranceFund.getClaimCount()).to.equal(0);
    });
  });

  describe("Admin", function () {
    it("should allow deployer to set oracle", async function () {
      await insuranceFund.connect(deployer).setOracleAddress(user1.address);
      expect(await insuranceFund.oracleAddress()).to.equal(user1.address);
    });

    it("should emit OracleUpdated event", async function () {
      await expect(insuranceFund.connect(deployer).setOracleAddress(user1.address))
        .to.emit(insuranceFund, "OracleUpdated");
    });
  });
});
