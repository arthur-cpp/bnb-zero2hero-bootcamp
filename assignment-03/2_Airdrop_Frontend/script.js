const contractAddress="0x06Fad3f7f13ee961400E774Ccd33d0dF0A019026";
const contractABI=[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "claimer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Claimed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32[]",
				"name": "_proof",
				"type": "bytes32[]"
			}
		],
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IERC20",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "address payable",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "rescueTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract DeFaceToken",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "_root",
				"type": "bytes32"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "isClaimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "s_airdrop_amount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const provider = new ethers.providers.Web3Provider(window.ethereum, 97);
let signer;
let contract;

async function checkClaimed() {
    const claimed = await contract.isClaimed();

    console.log("Contract says that tokens are "+(claimed?"claimed":"not claimed")+" by user");

    if(claimed) {
        document.getElementById("claiming").style.display = "none";
        document.getElementById("claimed-already").style.display = "";
    }
    else {
        document.getElementById("claiming").style.display = "";
        document.getElementById("claimed-already").style.display = "none";
    }
}

function connect(accounts) {
    signer = provider.getSigner(accounts[0]);
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Claimer "+accounts[0]+" | Contract "+contract.address);

    // may be user claimed tokens already?
    checkClaimed();

    const filter = {
        address: contractAddress,
        topics: [
            ethers.utils.id("Claimed(address,uint256)"),
            ethers.utils.hexZeroPad(accounts[0], 32)
        ]
    };

    // subscribe for claim event notifications
    contract.on(filter, (address, amount, event) => {
        console.log(`User claimed token to the ${address}`);
        checkClaimed();
    });

}

// reconnect on account change
window.ethereum.on('accountsChanged', function (accounts) {
    connect(accounts);
})

// request accounts and connect
provider.send("eth_requestAccounts", []).then(() => {
	provider.listAccounts().then((accounts) => {
        connect(accounts);
	});
});

document.querySelector('.button').addEventListener('click', async (e) =>{
    e.preventDefault();

    try {
        // eval proof as an array
        let proof=eval(document.getElementById('proof').value);
        if(Array.isArray(proof)) {
            // show that user need wait for tx confirmation
            document.getElementById("submit-claim").style.display = "none";
            document.getElementById("wait-claim").style.display = "";
            // claim tokens
            await contract.claim(proof);
            // check claiming for a luck, but it will be checked using event too
            checkClaimed();
        }
        else {
            alert("Wrong proof format!");
        }
     }
    catch(e) {
        alert("Something went wrong! Check your proof.");
        // revert styles
        document.getElementById("submit-claim").style.display = "";
        document.getElementById("wait-claim").style.display = "none";
    }
});
