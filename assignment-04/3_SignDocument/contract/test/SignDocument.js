const { ethers } = require("hardhat");
const { expect } = require("chai");
  
describe("SignDocument", function () {
    let owner, attacker;
    let contract;

    beforeEach(async function() {
        [owner, attacker] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("SignDocument", owner);
        contract = await Factory.deploy(["0x000BD2D0322C21fAA0C8477a5a9bBE04cCC1C369","0xdefac1e443A7134443d4a37c4Ef6EC643d6fA15E"]);
        await contract.deployed();
    })

    it("Should be deployed", async function() {
        expect(contract.address).to.be.properAddress;
    })
});