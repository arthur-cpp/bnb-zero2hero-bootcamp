const hre = require("hardhat");
const ethers = hre.ethers;
const NFTArtifact=require('../artifacts/contracts/NFT.sol/NFT.json');

async function main() {
    // TODO: replace the following address with your deployed NFT contract address!
    const contractAddress='0x...';
    const [signer] = await ethers.getSigners();
    const contract=new ethers.Contract(contractAddress,NFTArtifact.abi,signer);

    const tx=await contract.safeMint(signer.address,{value: ethers.utils.parseEther("0.001")})
    console.log("Minting transaction: \033[32m" + tx.hash)
    await tx.wait()
    console.log("\033[0mThe new NFT minted for \033[32m" + signer.address + "!")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});