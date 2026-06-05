const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GuardVault", function () {
  let guardVault;
  let deployer, oracle, user1, user2, agent1, agent2;

  const ETH = (n) => ethers.parseEther(n.toString());
  const USDC = (n) => ethers.parseUnits(n.toString(), 6);

  beforeEach(async function () {
    [deployer, oracle, user1, user2, agent1, agent2] = await ethers.getSigners();

    const GuardVault = await ethers.getContractFactory("GuardVault");
    guardVault = await GuardVault.deploy();
    await guardVault.waitForDeployment();

    await guardVault.setOracleAddress(oracle.address);
  });

  describe("Vault Creation", function () {
    it("should create a vault for a user", async function () {
      await guardVault.connect(user1).createVault(agent1.address);
      const info = await guardVault.getVaultInfo(user1.address);
      expect(info.owner).to.equal(user1.address);
      expect(info.agent).to.equal(agent1.address);
      expect(info.balance).to.equal(0);
      expect(info.active).to.be.true;
    });

    it("should set default policy", async function () {
      await guardVault.connect(user1).createVault(agent1.address);
      const policy = await guardVault.getPolicy(user1.address);
      expect(policy.maxTxSize).to.equal(USDC(500));
      expect(policy.dailyLimit).to.equal(USDC(5000));
      expect(policy.slippageBps).to.equal(300);
    });

    it("should revert if vault already exists", async function () {
      await guardVault.connect(user1).createVault(agent1.address);
      await expect(guardVault.connect(user1).createVault(agent2.address))
        .to.be.revertedWith("GuardVault: vault already exists");
    });

    it("should revert if agent address is zero", async function () {
      await expect(guardVault.connect(user1).createVault(ethers.ZeroAddress))
        .to.be.revertedWith("GuardVault: invalid agent address");
    });

    it("should emit VaultCreated event", async function () {
      await expect(guardVault.connect(user1).createVault(agent1.address))
        .to.emit(guardVault, "VaultCreated");
    });
  });

  describe("Deposits & Withdrawals", function () {
    beforeEach(async function () {
      await guardVault.connect(user1).createVault(agent1.address);
    });

    it("should accept MNT deposits", async function () {
      await guardVault.connect(user1).deposit({ value: ETH(1) });
      const info = await guardVault.getVaultInfo(user1.address);
      expect(info.balance).to.equal(ETH(1));
    });

    it("should emit Deposit event", async function () {
      await expect(guardVault.connect(user1).deposit({ value: ETH(1) }))
        .to.emit(guardVault, "Deposit");
    });

    it("should allow owner to withdraw", async function () {
      await guardVault.connect(user1).deposit({ value: ETH(1) });
      await guardVault.connect(user1).withdraw(ETH(0.5));
      const info = await guardVault.getVaultInfo(user1.address);
      expect(info.balance).to.equal(ETH(0.5));
    });

    it("should revert withdraw if insufficient balance", async function () {
      await guardVault.connect(user1).deposit({ value: ETH(1) });
      await expect(guardVault.connect(user1).withdraw(ETH(2)))
        .to.be.revertedWith("GuardVault: insufficient balance");
    });

    it("should revert deposit if no vault", async function () {
      await expect(guardVault.connect(user2).deposit({ value: ETH(1) }))
        .to.be.revertedWith("GuardVault: no vault");
    });
  });

  describe("Policy Management", function () {
    beforeEach(async function () {
      await guardVault.connect(user1).createVault(agent1.address);
    });

    it("should update policy", async function () {
      await guardVault.connect(user1).setPolicy(USDC(1000), USDC(10000), 500);
      const policy = await guardVault.getPolicy(user1.address);
      expect(policy.maxTxSize).to.equal(USDC(1000));
      expect(policy.dailyLimit).to.equal(USDC(10000));
      expect(policy.slippageBps).to.equal(500);
    });

    it("should set protocol allowance", async function () {
      await guardVault.connect(user1).setProtocolAllowance(agent1.address, true);
      expect(await guardVault.allowedProtocols(user1.address, agent1.address)).to.be.true;
    });

    it("should revert if not vault owner", async function () {
      await expect(guardVault.connect(user2).setPolicy(USDC(1000), USDC(10000), 500))
        .to.be.revertedWith("GuardVault: not vault owner");
    });
  });

  describe("Policy Execution", function () {
    beforeEach(async function () {
      await guardVault.connect(user1).createVault(agent1.address);
      await guardVault.connect(user1).deposit({ value: ETH(10) });
      await guardVault.connect(user1).setProtocolAllowance(agent1.address, true);
      await guardVault.connect(user1).setPolicy(ETH(100), ETH(100), 300);
    });

    it("should execute if all policies pass", async function () {
      await guardVault.connect(oracle).executeWithPolicy(user1.address, agent1.address, ETH(1));
      const info = await guardVault.getVaultInfo(user1.address);
      expect(info.balance).to.equal(ETH(9));
    });

    it("should emit PolicyExecuted event", async function () {
      await expect(guardVault.connect(oracle).executeWithPolicy(user1.address, agent1.address, ETH(1)))
        .to.emit(guardVault, "PolicyExecuted");
    });

    it("should record violation if max tx exceeded", async function () {
      await guardVault.connect(user1).setPolicy(ETH(0.1), ETH(100), 300);
      await guardVault.connect(oracle).executeWithPolicy(user1.address, agent1.address, ETH(1));
      const violations = await guardVault.getViolations(user1.address);
      expect(violations.length).to.equal(1);
      expect(violations[0].violationType).to.equal("MAX_TX_EXCEEDED");
    });

    it("should record violation if daily limit exceeded", async function () {
      await guardVault.connect(user1).setPolicy(ETH(100), ETH(0.5), 300);
      await guardVault.connect(oracle).executeWithPolicy(user1.address, agent1.address, ETH(0.3));
      await guardVault.connect(oracle).executeWithPolicy(user1.address, agent1.address, ETH(0.3));
      const violations = await guardVault.getViolations(user1.address);
      expect(violations.length).to.equal(1);
      expect(violations[0].violationType).to.equal("DAILY_LIMIT_EXCEEDED");
    });

    it("should record violation if protocol not allowed", async function () {
      await guardVault.connect(user1).setProtocolAllowance(agent1.address, false);
      await guardVault.connect(oracle).executeWithPolicy(user1.address, agent1.address, ETH(1));
      const violations = await guardVault.getViolations(user1.address);
      expect(violations.length).to.equal(1);
      expect(violations[0].violationType).to.equal("PROTOCOL_NOT_ALLOWED");
    });

    it("should revert if not oracle", async function () {
      await expect(guardVault.connect(user1).executeWithPolicy(user1.address, agent1.address, ETH(1)))
        .to.be.revertedWith("GuardVault: caller is not the oracle");
    });
  });

  describe("Slippage Check", function () {
    it("should return true if within bounds", async function () {
      expect(await guardVault.checkSlippage(1000, 980, 300)).to.be.true;
    });

    it("should return false if exceeds bounds", async function () {
      expect(await guardVault.checkSlippage(1000, 960, 300)).to.be.false;
    });
  });

  describe("View Functions", function () {
    it("should return total vaults", async function () {
      expect(await guardVault.getTotalVaults()).to.equal(0);
      await guardVault.connect(user1).createVault(agent1.address);
      expect(await guardVault.getTotalVaults()).to.equal(1);
    });
  });
});
