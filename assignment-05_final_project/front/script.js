const CONTRACT_ADDRESS = "0x82a81b192b845ca2fd7204aa21a92f4031b85023";
const ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "symbolCode",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "aggregator",
        "type": "address"
      }
    ],
    "name": "SymbolAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "symbolCode",
        "type": "uint256"
      }
    ],
    "name": "SymbolDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "symbolCode",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "aggregatorOld",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "aggregatorNew",
        "type": "address"
      }
    ],
    "name": "SymbolUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "symbolCode",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "aggregator",
        "type": "address"
      }
    ],
    "name": "aggregatorAddOrUpdate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "symbolCode",
        "type": "uint256"
      }
    ],
    "name": "aggregatorDelete",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "symbolCode",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      }
    ],
    "name": "getHistoryPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "symbolCode",
        "type": "uint256"
      }
    ],
    "name": "getLastPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "s_aggregators",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "symbolCode",
        "type": "uint256"
      }
    ],
    "name": "symbolDigits",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "symbolCode",
        "type": "uint256"
      }
    ],
    "name": "symbolName",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-2-s3.binance.org:8545");
//const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/bsc_testnet_chapel");
//const provider = new ethers.providers.JsonRpcProvider("https://endpoints.omniatech.io/v1/bsc/testnet/public");
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

const symbolsMap = new Map([
    ['GOLD'  , 0],
    ['BRENT' , 1],
    ['USDKZT', 2],
  ]);
let  currentSymbolCode= 0;
let  currentPeriod    = 10;
let  historicalLabels = [];
let  historicalPrices = [];
let  symbolDigits     = 2;
let  loading          = false;

const data = {
    labels: [],
    datasets: [{
            label: symbolsMap[currentSymbolCode],
            data: [],
            fill: false,
            borderColor: 'rgb(255,0,0)',
            tension: 0.1
        }]
};
const chart = new Chart("myChart", {type: "line", data: data ,options: {plugins: {legend: {display: false}}}  });

async function onSymbolChanged(symbol) {
    if(loading) return;

    console.log(`Symbol changed: ${symbol}`);
    document.querySelector('.symbol-current').textContent=`Symbol: ${symbol}`;

    currentSymbolCode = symbolsMap.get(symbol);
    updatePrices();
}

async function onPeriodChanged(period) {
    if(loading) return;

    console.log(`Period changed: ${period}`);
    document.querySelector('.period-current').textContent=`Rounds: ${period}`;

    currentPeriod = parseInt(period);
    updatePrices();
}

const symbols = document.querySelectorAll('.symbol');
symbols.forEach((symbol) => {
  symbol.addEventListener('click', (e) => {
    e.preventDefault();
    onSymbolChanged(e.target.textContent);
  });
});

const periods = document.querySelectorAll('.period');
periods.forEach((period) => {
  period.addEventListener('click', (e) => {
    e.preventDefault();
    onPeriodChanged(e.target.textContent);
  });
});

async function updateChart(roundTimestamp, roundPrice) {
  const dtime     = new Date(roundTimestamp.toNumber() * 1000); 
  const timestamp = `${dtime.toLocaleDateString()} ${dtime.toLocaleTimeString()}`;
  const price     = ethers.utils.formatUnits(roundPrice, symbolDigits);

  historicalLabels.push(timestamp);
  historicalPrices.push(price);

  let labels = historicalLabels.slice().reverse();
  let prices = historicalPrices.slice().reverse();

  chart.data.labels = labels;
  chart.data.datasets[0].data = prices;
  chart.update();
}


async function prevRound(roundId, untilRound) {
    if(roundId<0 || roundId<=untilRound) {
        console.log("The end of history");
        loading=false;

        document.querySelector('.price-last').innerHTML=`Last price: ${historicalPrices[0]} <small class="text-body-secondary price-last-timestamp">at ${historicalLabels[0]}</small>`;
        return;
    }

    document.querySelector('.price-last').innerHTML=`Loading (${roundId} -> ${untilRound})...`;

    try {
        [timestamp, price] = await contract.getHistoryPrice(currentSymbolCode, roundId);
        console.log(`Round ${roundId}, timestamp ${timestamp}, price ${price}`);

        updateChart(timestamp, price);
    }
    catch(e) {
        // @dev Round may not exist
        //console.log(e);
    }

    setTimeout(() => prevRound(roundId-1, untilRound), 0);
}

function clearChart() {
  document.querySelector('.price-last').innerHTML="Loading...";

  historicalLabels = [];
  historicalPrices = [];

  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  chart.update();
}

async function updatePrices() {
  loading=true;
  clearChart();

  symbolDigits = await contract.symbolDigits(currentSymbolCode);

  let [lastRoundId, timestamp, price] = await contract.getLastPrice(currentSymbolCode);
  console.log(`Round ${lastRoundId}, timestamp ${timestamp}, price ${price}`)

  updateChart(timestamp, price);

  const untilRound = lastRoundId-currentPeriod;
  if(untilRound<0) untilRound=0;

  console.log(`Requesting rounds from ${lastRoundId} to ${untilRound}`);

  prevRound(lastRoundId-1, untilRound);
}

document.querySelector('.price-last').innerHTML=`Loading...`;
updatePrices();
