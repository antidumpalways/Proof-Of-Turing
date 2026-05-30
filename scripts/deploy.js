const hre = require("hardhat");

async function main() {
  console.log("Deploying Proof-of-Turing to Mantle Testnet...\n");

  // Deploy PoTRegistry
  console.log("1. Deploying PoTRegistry...");
  const PoTRegistry = await hre.ethers.getContractFactory("PoTRegistry");
  const potRegistry = await PoTRegistry.deploy();
  await potRegistry.waitForDeployment();
  const potRegistryAddress = await potRegistry.getAddress();
  console.log(`   PoTRegistry deployed to: ${potRegistryAddress}`);

  // Configure PoTRegistry
  console.log("\n2. Configuring PoTRegistry...");
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  const setOracleTx = await potRegistry.setOracleAddress(deployerAddress);
  await setOracleTx.wait();
  console.log(`   Oracle address set to: ${deployerAddress}`);

  console.log("\n✅ Deployment complete!");
  console.log("========================");
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
