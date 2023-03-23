// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

// @title Rock-Paper-Scissors Game Contract
// Rock > Scissors, Scissors > Paper, Paper > Rock
// Choices: Rock 0, Paper 1, Scissors 2
// LOSS https://testnet.bscscan.com/tx/0x493a7ccc4bbac93efe96c344a30a6b8e7288f443d6f7fb472a5dd24bf2b42cae
// TIE  https://testnet.bscscan.com/tx/0x96854c6da474f33d71f7d83bdc32231144ac7db8da86a5e4506b8df8dff78513
// WIN  https://testnet.bscscan.com/tx/0x3fd7a7b79c141ebe8279b33ada882318b943e61a7b6f2ee34320b37421f27a0e
contract RockPaperScissors is VRFConsumerBaseV2 {
    enum GameResult { PENDING, TIE, WIN, LOSS }

    struct GameStatus {
        uint256     bet;
        address     player;
        uint8       playerChoice;
        uint8       hostChoice;
        GameResult  result;
    }

    address                                 s_owner;
    VRFCoordinatorV2Interface               s_coordinator;
    uint64                                  s_subscriptionId;
    bytes32                                 s_keyHash;
    mapping(uint256 => GameStatus) public   s_games;

    event PlayerGameResult(address indexed player, GameResult result);

    // @dev Check https://docs.chain.link/vrf/v2/subscription/supported-networks for details
    // The following values for BSC Testnet
    // _vrf_coordinator = 0x6A2AAd07396B36Fe02a22b33cf443582f682c82f
    // _keyHash = 0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314
    constructor(address _vrf_coordinator, uint64 _subscriptionId, bytes32 _keyHash) VRFConsumerBaseV2(_vrf_coordinator) {
        s_owner          = msg.sender;
        s_coordinator    = VRFCoordinatorV2Interface(_vrf_coordinator);
        s_subscriptionId = _subscriptionId;
        s_keyHash        = _keyHash;
    }

    modifier onlyOwner() {
        require(msg.sender==s_owner,"not an owner");
        _;
    }

    // Main gaming function
    function play(uint8 _choice) external payable {
        require(msg.value>=0.0001 ether,"not enough bet amount");
        require(address(this).balance>2*msg.value,"not enough funds");
        require(_choice>=0 && _choice<3,"wrong choice number");

        // anychronous request for random number
        // will revert if chainlink subscription is not set and funded
        uint256 gameId = s_coordinator.requestRandomWords(s_keyHash,s_subscriptionId,3,100000,1);

        s_games[gameId] = GameStatus({
            bet: msg.value,
            player: msg.sender,
            playerChoice: _choice,
            hostChoice: 0, // will be overwritten later anyway
            result: GameResult.PENDING
        });
    }

    // Callback function for chainlink providing random number
    function fulfillRandomWords(uint256 gameId, uint256[] memory _randomWords) internal override {
       GameStatus memory _game = s_games[gameId];
       require(_game.player!=address(0), "game not found");

        _game.hostChoice = randomFrom(_randomWords[0],0,2);
        _game.result     = isWinner(_game.playerChoice,_game.hostChoice);

        emit PlayerGameResult(_game.player,_game.result);

        if(_game.result==GameResult.WIN) {
            payable(_game.player).transfer(2*_game.bet);
        }
        else if(_game.result==GameResult.TIE) {
            payable(_game.player).transfer(_game.bet);
        }
    }

    function isWinner(uint8 _player, uint8 _host) internal pure returns(GameResult) {
        if(_player==_host) return GameResult.TIE;
        
        if((_player == 0 && _host == 2) || // rock > scissors
           (_player == 1 && _host == 0) || // paper > rock
           (_player == 2 && _host == 1))   // scissors > paper
           {
               return GameResult.WIN;
           }

        return GameResult.LOSS;
    }

    function randomFrom(uint256 random, uint8 min, uint8 max) internal pure returns(uint8) {
        assert(min<max);
        return uint8(min+(random%(max+1-min)));
    }

    receive() external payable {}
    
    function withdraw() external onlyOwner {
        payable(s_owner).transfer(address(this).balance);
    }
}