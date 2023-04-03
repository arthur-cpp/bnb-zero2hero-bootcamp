const { ethers } = require("hardhat");
const { expect } = require("chai");
  
describe("NFT", function () {
    let owner, attacker;
    let contract;

    beforeEach(async function() {
        [owner, attacker] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("NFT", owner);
        contract = await Factory.deploy();
        await contract.deployed();
    })

    describe("Basic checks", function() {
        it("Should be deployed", async function() {
            expect(contract.address).to.be.properAddress;
        })

        it("Can update baseURI", async function() {
            await expect(contract.changeBaseURI("ipfs://Qme4ofiJgsSP2HDWtcmLhLeJSpv8mRE8LvGzShSqr3ZwBq/")).to.be.not.reverted;
        })
    })


    describe("Minting", function() {
        it("Should mint token", async function() {
            await expect(contract.safeMint(owner.address, {value: ethers.utils.parseEther("0.001")})).to.be.not.reverted;
            expect(await contract.balanceOf(owner.address)).greaterThan(0);
        })

        it("Minted token URI check", async function() {
            const txMint = await contract.safeMint(owner.address, {value: ethers.utils.parseEther("0.001")});
            txMint.wait();
            
            expect(await contract.tokenURI(0)).to.be.a('string').to.have.lengthOf.at.least(1);
        })

        it("Should revert on max supply", async function() {
            let maxSupply = 6;

            for(let i=0;i<maxSupply;i++) {
                await contract.safeMint(owner.address, {value: ethers.utils.parseEther("0.001")})
            }

            await expect(contract.safeMint(owner.address, {value: ethers.utils.parseEther("0.001")})).to.be.revertedWith("You reached max supply");
        })

        it("Should revert on the low payment", async function() {
            await expect(contract.safeMint(owner.address, {value: 0})).to.be.revertedWith("Please add valid amount of ETH");
        })
    })

    describe("Withdrawal", function() {
        it("Should not revert on normal usage", async function() {
            await contract.safeMint(owner.address, {value: ethers.utils.parseEther("0.001")})
            await expect(contract.withdraw()).to.be.not.reverted;
        })

        it("Should work only for owner", async function() {
            await contract.safeMint(owner.address, {value: ethers.utils.parseEther("0.001")})
            await expect(contract.connect(attacker).withdraw()).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })
});