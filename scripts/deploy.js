// scripts/deploy.js
// Deploy Tripwire contracts to Mantle Network

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  // 1. Deploy MockERC8004 (for testing)
  console.log("\n--- Deploying MockERC8004 ---");
  const MockERC8004 = await hre.ethers.getContractFactory("MockERC8004");
  const mockERC8004 = await MockERC8004.deploy();
  await mockERC8004.waitForDeployment();
  const mockAddress = await mockERC8004.getAddress();
  console.log("MockERC8004 deployed to:", mockAddress);

  // 2. Deploy GuardVault
  console.log("\n--- Deploying GuardVault ---");
  const GuardVault = await hre.ethers.getContractFactory("GuardVault");
  const guardVault = await GuardVault.deploy();
  await guardVault.waitForDeployment();
  const vaultAddress = await guardVault.getAddress();
  console.log("GuardVault deployed to:", vaultAddress);

  // 3. Deploy InsuranceFund
  console.log("\n--- Deploying InsuranceFund ---");
  const InsuranceFund = await hre.ethers.getContractFactory("InsuranceFund");
  const insuranceFund = await InsuranceFund.deploy();
  await insuranceFund.waitForDeployment();
  const insuranceAddress = await insuranceFund.getAddress();
  console.log("InsuranceFund deployed to:", insuranceAddress);

  // 4. Deploy TripwireRegistry
  console.log("\n--- Deploying TripwireRegistry ---");
  const TripwireRegistry = await hre.ethers.getContractFactory("TripwireRegistry");
  const registry = await TripwireRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("TripwireRegistry deployed to:", registryAddress);

  // 5. Configure Registry
  console.log("\n--- Configuring Registry ---");
  await registry.setOracleAddress(deployer.address);
  await registry.setERC8004Contract(mockAddress);
  console.log("Oracle set to:", deployer.address);
  console.log("ERC8004 set to:", mockAddress);

  // 6. Configure GuardVault
  console.log("\n--- Configuring GuardVault ---");
  await guardVault.setOracleAddress(deployer.address);
  console.log("Oracle set to:", deployer.address);

  // 7. Configure InsuranceFund
  console.log("\n--- Configuring InsuranceFund ---");
  await insuranceFund.setOracleAddress(deployer.address);
  console.log("Oracle set to:", deployer.address);

  // Summary
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;

  console.log("\n" + "=".repeat(60));
  console.log("  TRIPWIRE DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`  Network:         ${network} (Chain ID: ${chainId})`);
  console.log(`  Deployer:        ${deployer.address}`);
  console.log(`  MockERC8004:     ${mockAddress}`);
  console.log(`  GuardVault:      ${vaultAddress}`);
  console.log(`  InsuranceFund:   ${insuranceAddress}`);
  console.log(`  TripwireRegistry: ${registryAddress}`);
  console.log("=".repeat(60));

  console.log("\n--- .env snippet ---");
  console.log(`GUARD_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`GUARD_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`INSURANCE_FUND_ADDRESS=${insuranceAddress}`);
  console.log(`ORACLE_ADDRESS=${deployer.address}`);

  // Verify on explorer (if supported)
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\nWaiting for block confirmations before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: vaultAddress,
        constructorArguments: [],
      });
      console.log("GuardVault verified!");
    } catch (e) {
      console.log("GuardVault verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: insuranceAddress,
        constructorArguments: [],
      });
      console.log("InsuranceFund verified!");
    } catch (e) {
      console.log("InsuranceFund verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: registryAddress,
        constructorArguments: [],
      });
      console.log("TripwireRegistry verified!");
    } catch (e) {
      console.log("TripwireRegistry verification failed:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
