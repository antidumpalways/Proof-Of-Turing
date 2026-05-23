const hre = require("hardhat");

async function main() {
  console.log("Deploying Proof-of-Turing contracts to Mantle Testnet...\n");

  // Step 1: Deploy MockERC8004
  console.log("1. Deploying MockERC8004...");
  const MockERC8004 = await hre.ethers.getContractFactory("MockERC8004");
  const mockERC8004 = await MockERC8004.deploy();
  await mockERC8004.waitForDeployment();
  const mockERC8004Address = await mockERC8004.getAddress();
  console.log(`   MockERC8004 deployed to: ${mockERC8004Address}`);

  // Step 2: Deploy PoTRegistry
  console.log("\n2. Deploying PoTRegistry...");
  const PoTRegistry = await hre.ethers.getContractFactory("PoTRegistry");
  const potRegistry = await PoTRegistry.deploy();
  await potRegistry.waitForDeployment();
  const potRegistryAddress = await potRegistry.getAddress();
  console.log(`   PoTRegistry deployed to: ${potRegistryAddress}`);

  // Step 3: Configure PoTRegistry
  console.log("\n3. Configuring PoTRegistry...");
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  // Set oracle address to deployer (can be changed later)
  const setOracleTx = await potRegistry.setOracleAddress(deployerAddress);
  await setOracleTx.wait();
  console.log(`   Oracle address set to: ${deployerAddress}`);

  // Set ERC-8004 contract address
  const setERC8004Tx = await potRegistry.setERC8004Contract(mockERC8004Address);
  await setERC8004Tx.wait();
  console.log(`   ERC8004 contract set to: ${mockERC8004Address}`);

  console.log("\n✅ Deployment complete!");
  console.log("========================");
  console.log(`MockERC8004: ${mockERC8004Address}`);
  console.log(`PoTRegistry: ${potRegistryAddress}`);
  console.log(`Oracle:      ${deployerAddress}`);
  console.log("========================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
