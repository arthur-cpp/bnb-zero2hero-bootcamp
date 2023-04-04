const { network } = require("hardhat");
const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {

  if(network.name=="hardhat") {
    console.warn("You are trying to deploy a contract to the Hardhat Network which " +
                 "gets automatically created and destroyed every time. "+
                 "Use the Hardhat option '--network localhost'");
  }

  const [signer] = await ethers.getSigners();

  const Factory = await ethers.getContractFactory("SignDocument");
  const contract = await Factory.deploy(["0x000BD2D0322C21fAA0C8477a5a9bBE04cCC1C369","0xdefac1e443A7134443d4a37c4Ef6EC643d6fA15E"]);

  await contract.deployed();

  console.log(`Deployed to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
