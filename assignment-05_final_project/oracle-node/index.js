const { ethers } = require('ethers');
const { abi } = require('./abi');
require('dotenv').config()

// helpers
function isset (ref) { return typeof ref !== 'undefined' }
function timestamp() { let now = Date.now(); return Math.floor(now/1000); }


async function fetchMarketwatchPrice() {
  let responseDoc;
  
  await fetch(process.env.FETCH_PRICE_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then(data => {
    responseDoc=data;
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

  const htmlparser2 = require('htmlparser2');
  const cheerio     = require('cheerio');
  const dom         = htmlparser2.parseDocument(responseDoc);
  
  const $ = cheerio.load(dom);
  const price = $('h2.intraday__price > bg-quote').text();

  return parseFloat(price.replace(',',''));
}

async function makeSignature(roundId, timestamp, price, signer) {
  let payload = ethers.utils.defaultAbiCoder.encode([ "uint", "uint", "uint" ], [ roundId, timestamp, price ]);
  //console.log("Payload:", payload);

  let payloadHash = ethers.utils.keccak256(payload);
  //console.log("PayloadHash:", payloadHash);

  let signature = await signer.signMessage(ethers.utils.arrayify(payloadHash));
  let sig = ethers.utils.splitSignature(signature);

  //console.log("Signature:", sig);
  //console.log("Recovered:", ethers.utils.verifyMessage(ethers.utils.arrayify(payloadHash), sig));
  //console.log(`Sig vrs (${sig.v}, ${sig.r}, ${sig.s})`);

  return sig;
}

async function main() {
  const provider    = new ethers.providers.JsonRpcProvider(process.env.RPC_URI);
  const signer      = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  let   transmitter = new ethers.Contract(process.env.TRANSMITTER, abi, signer);

  transmitter.on("Round", async (roundId) => {
    console.log(`Round ${roundId}: challenge received`);

    const now = timestamp();
    let   price = await fetchMarketwatchPrice();
    price = Math.floor(price*Math.pow(10,process.env.SYMBOL_DIGITS));

    const sig = await makeSignature(roundId, now, price, signer);
    console.log(`Round ${roundId}: timestamp ${now}, price ${price}`);
    console.log(`Round ${roundId}: sig vrs (${sig.v}, ${sig.r}, ${sig.s})`);

    transmitter.transmit(roundId, now, price, sig.v, sig.r, sig.s)
    .then((value)=>{
      console.log(`Round ${roundId}: submitted`);
    })
    .catch((error)=>{
      console.error(`Round ${roundId}: submit failed with error ${error.reason}`);
      if(isset(error.error) && isset(error.error.reason))
        console.error(`Round ${roundId}: ${error.error.reason}`);
    });
  
  });
}

main();