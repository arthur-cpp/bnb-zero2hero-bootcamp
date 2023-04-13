const { ethers } = require('ethers');
const { abi } = require('./abi');
require('dotenv').config();
var CronJob = require('cron').CronJob;

// parse transmitters addresses
const transmitters = process.env.TRANSMITTERS.split(' ');
// initialize network
const provider    = new ethers.providers.JsonRpcProvider(process.env.RPC_URI);
const signer      = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// helper
function timestamp() {
    let now = Date.now();
    return Math.floor(now/1000);
}

// start/stop round
async function round(transmitterAddress) {
    let transmitter = new ethers.Contract(transmitterAddress, abi, signer);
    let tx = await transmitter.startRound();

    console.log(`${transmitterAddress} ${timestamp()}: Round start with tx ${tx.hash}`);
    await tx.wait();
    
    setTimeout(async ()=> {
        tx = await transmitter.stopRound();
        console.log(`${transmitterAddress} ${timestamp()}: Round stop with tx ${tx.hash}`);

        await tx.wait();
    },35*1000);
}

async function startRounds() {
    for (const transmitter of transmitters) {
        await round(transmitter);
    }
}

// cron job for periodic execution
var job = new CronJob(
    '0 */5 * * * *',
    function() {
        startRounds()
    },
    null,
    true
);
