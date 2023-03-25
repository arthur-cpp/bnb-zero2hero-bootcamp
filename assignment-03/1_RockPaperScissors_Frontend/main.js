let gameItemsCont = Array.from(document.querySelectorAll("div[class^='game-body__circle-container'"));
let tempoV;
let tempoArr = [];
let stateFlag = false;
let score = document.querySelector('.header__value');

setScore(state = 'init', tar = score);


const contractAddress="0xD6648616527044b71FFD2E2d1f95A2C3327829CC";
const contractABI=[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "have",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "want",
				"type": "address"
			}
		],
		"name": "OnlyCoordinatorCanFulfill",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "hostChoice",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "enum RockPaperScissors.GameResult",
				"name": "result",
				"type": "uint8"
			}
		],
		"name": "PlayerGameResult",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_choice",
				"type": "uint8"
			}
		],
		"name": "play",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "requestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "randomWords",
				"type": "uint256[]"
			}
		],
		"name": "rawFulfillRandomWords",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vrf_coordinator",
				"type": "address"
			},
			{
				"internalType": "uint64",
				"name": "_subscriptionId",
				"type": "uint64"
			},
			{
				"internalType": "bytes32",
				"name": "_keyHash",
				"type": "bytes32"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "s_games",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "bet",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "playerChoice",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "hostChoice",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.GameResult",
				"name": "result",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

function onPlayResult(hostChoice, gameResult) {
    // Trigger Game Fuction
    swipe(stateFlag, tempoV, hostChoice, gameResult);
    // Swipe Game State Flag
    stateFlag = true;
    // Play Again
}

const provider = new ethers.providers.Web3Provider(window.ethereum, 97);
let signer;
let contract;

provider.send("eth_requestAccounts", []).then(() => {
	provider.listAccounts().then((accounts) => {
		signer = provider.getSigner(accounts[0]);
		contract = new ethers.Contract(contractAddress, contractABI, signer);
		console.log("Player "+accounts[0]+" | Contract "+contract.address);

        const filter = {
            address: contractAddress,
            topics: [
                ethers.utils.id("PlayerGameResult(address,uint8,uint8)"),
                ethers.utils.hexZeroPad(accounts[0], 32)
            ]
        };

        contract.on(filter, (address, hostChoice, gameResult, event) => {
            console.log(`Player ${address}, host choice ${hostChoice}, game result : ${gameResult}`);

            onPlayResult(hostChoice, gameResult);
        });

	});
});

async function play(choice) {

    console.log(`Player choice: ${choice}`);

	let txPlay = await contract.play(choice, {value: ethers.utils.parseEther("0.01")}).catch((error)=>{
		document.getElementById("tx-error").innerText = "ERROR! "+error.data.message;
	});

    //console.log(txPlay);

    txWaitAnimation(arr = gameItemsCont, slim = gameItemsCont[choice]);
}



document.querySelector('.rules-btn').addEventListener('click', (e) =>{
    e.preventDefault();
    document.querySelector('.rules-popup').classList.toggle('rules-popup--active');
    document.querySelector('.overlay').classList.toggle('overlay--active');
});

/*document.querySelector('.tests-btn').addEventListener('click', (e) =>{
    e.preventDefault();
    txWaitAnimation(arr = gameItemsCont, slim = gameItemsCont[0]);
});*/

function txWaitAnimation(arr, slim) {
    // Add Stage 2 Class to Element
    document.querySelector('.bg-triangle').classList.add('bg-triangle--s2');
    document.querySelector('.choosed-item--com__bg-circle').classList.add('choosed-item--com__bg-circle--s2');
    
    // mark player choice as choosed
    slim.classList.add('choosed-item--user');
    // mark host choices as unchoosed
    arr.filter((e)=>{
        if(slim !== arr[arr.indexOf(e)]){
            e.classList.add('unchoosed-item');
        }
    });
}

document.querySelector('.close-icon').addEventListener('click', () =>{
    document.querySelector('.rules-popup').classList.remove('rules-popup--active');
    document.querySelector('.overlay').classList.toggle('overlay--active');
});


// Convert selected element class to choice number for smart-contract interaction
function classNameToChoice(el) {
    if(el.className.includes('rock'))       return 0;
    else if(el.className.includes('paper')) return 1;
    return 2;
}

// Loop through Each Game Item
gameItemsCont.forEach((e) =>{
    // Listen For Click Event
    e.addEventListener('click', function(){
        // Store The Clicked Item in Variable
        tempoV = e;
        // Play with smart-contract
        play(classNameToChoice(e));
    });
});

// Stage 1 to 2 trigger Function
function swipe(flag, slim, hostChoice, gameResult){
    // Stage 2 If TRUE
    if (flag === true){
        
    }
    // Stage 1 if FALSE. And Go To Stage 2
    else{
        // Choose host item
        let comItem = gameItemsCont[hostChoice];
        
        // Show host choice
        setTimeout(()=>{
            comItem.classList.remove('unchoosed-item');
            comItem.classList.add('choosed-item--com');
        }, 1000)
        setTimeout(()=>{
            document.querySelector('.choosed-item--com__bg-circle').classList.remove('choosed-item--com__bg-circle--s2');
        }, 1000)
        
        // Create Heading
        let headingUser = document.createElement('h3');
        let headingUserContent = document.createTextNode('You Picked');
        headingUser.classList.add('you-picked');
        headingUser.append(headingUserContent);
        slim.append(headingUser);
        let headingCom = document.createElement('h3');
        let headingComContent = document.createTextNode('The house Picked');
        headingCom.append(headingComContent);
        headingCom.classList.add('you-picked');
        comItem.append(headingCom);
        
        // Show game result
        if(gameResult==1) {
            // WIN
            gameOver(state = 'win', hUser1=headingUser, hCom1=headingCom);
            setTimeout(()=>{setScore(state = 'win', tar = score);}, 1500)
            // Add Highlight Effect For Choosed Item
            setTimeout(()=>{highlightEffect(slim=slim);}, 1250);
        }
        else {
            //LOSE
            gameOver(state = 'lose', hUser1=headingUser, hCom1=headingCom);
            setTimeout(()=>{setScore(state = 'lose', tar = score);}, 1500)
            // Add Highlight Effect For Choosed Item
            setTimeout(()=>{highlightEffect(slim=comItem);}, 1250);
        }
    }
}

function highlightEffect(slim){
    let c1 = document.createElement('div');
    let c2 = document.createElement('div');
    let c3 = document.createElement('div');
    slim.append(c1);
    slim.append(c2);
    slim.append(c3);
    c1.classList.add('circle');
    c1.classList.add('circle--1');
    c2.classList.add('circle');
    c2.classList.add('circle--2');
    c3.classList.add('circle');
    c3.classList.add('circle--3');
}
function gameOver(state, hUser1, hCom1){
    let heading = document.createElement('h2');
    let playAgain = document.createElement('button');
    let gameOverCont  = document.createElement('div');
    let playAgainSen = document.createTextNode('Play Again');
    let winSen = document.createTextNode('You Win');
    let loseSen = document.createTextNode('You Lose');
    heading.classList.add('gameoversen');
    playAgain.classList.add('btn');
    gameOverCont.classList.add('game-over-container')
    playAgain.append(playAgainSen);
    if(state == 'win'){
        heading.append(winSen);
    }else if(state == 'lose'){
        heading.append(loseSen);
    }
    gameOverCont.append(heading);
    gameOverCont.append(playAgain);
    setTimeout(()=>{
        document.querySelector('main').insertBefore(gameOverCont, document.querySelector('.rules-btn'));
        // document.querySelector('main').insertBefore(playAgain, document.querySelector('.rules-btn'));
        document.querySelector('.choosed-item--user').classList.add('choosed-item--user--s4');
        document.querySelector('.choosed-item--com').classList.add('choosed-item--com--s4');
        // document.querySelector('.game-body__big-circle').classList.add('game-body__big-circle--s4');
        // document.querySelector('.game-body__tiny-circle').classList.add('game-body__tiny-circle--s4');
        Array.from(document.querySelectorAll('.game-body__big-circle')).forEach((e)=>{
            e.classList.add('game-body__big-circle--s4');
        });
        Array.from(document.querySelectorAll('.game-body__tiny-circle')).forEach((e)=>{
            e.classList.add('game-body__tiny-circle--s4');
        });

    }, 1500)
    playAgain.addEventListener('click', ()=>{initGame(btn=playAgain, heading=heading, hUser=hUser1, hCom=hCom1, gmovCon=gameOverCont)});
}
function initGame(btn,heading,hUser,hCom,gmovCon){
    document.querySelector('.bg-triangle').classList.remove('bg-triangle--s2');
    document.querySelector('.choosed-item--com__bg-circle').classList.remove('choosed-item--com__bg-circle--s2');
    document.querySelector('.choosed-item--user').classList.remove('choosed-item--user--s4');
    document.querySelector('.choosed-item--com').classList.remove('choosed-item--com--s4');
    Array.from(document.querySelectorAll('.game-body__big-circle')).forEach((e)=>{
        e.classList.remove('game-body__big-circle--s4');
    });
    Array.from(document.querySelectorAll('.game-body__tiny-circle')).forEach((e)=>{
        e.classList.remove('game-body__tiny-circle--s4');
    });
    gameItemsCont.forEach((e)=>{
        if(e.className.includes('choosed-item--user')){
            for(let i = 1; i <= 3; i++){
                document.querySelector(`.circle--${i}`).remove();
            }
            e.classList.remove('choosed-item--user');
        }else if(e.className.includes('choosed-item--com')){
            e.classList.remove('choosed-item--com');
        }else{
            e.classList.remove('unchoosed-item');
        }
    });
    btn.remove();
    heading.remove();
    gmovCon.remove();
    hUser.remove();
    hCom.remove();
    stateFlag = false;
    tempoArr = [];
}
function setScore(state, tar){
    if(state == 'win'){
        tar.textContent++;
    }else if(state == 'lose'){
        if(tar.textContent > 0){
            tar.textContent--;
        }
    }else if(state == 'init'){
        tar.textContent = 0;
    }
}