// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

// @title Rock-Paper-Scissors Game Contract
// Rock > Scissors, Scissors > Paper, Paper > Rock
// Choices: Rock 0, Paper 1, Scissors 2
contract RockPaperScissors is VRFConsumerBaseV2 {
    enum GameResult { PENDING, WIN, LOSS }

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

    event PlayerGameResult(address indexed player, uint8 hostChoice, GameResult result);

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

        _game.hostChoice = hostChoice(_randomWords[0],_game.playerChoice);
        _game.result     = isWinner(_game.playerChoice,_game.hostChoice);

        emit PlayerGameResult(_game.player,_game.hostChoice,_game.result);

        if(_game.result==GameResult.WIN) {
            payable(_game.player).transfer(2*_game.bet);
        }
    }

    function isWinner(uint8 _player, uint8 _host) internal pure returns(GameResult) {
        require(_player!=_host,"player and host choices should not be equal");
        
        if((_player == 0 && _host == 2) || // rock > scissors
           (_player == 1 && _host == 0) || // paper > rock
           (_player == 2 && _host == 1))   // scissors > paper
           {
               return GameResult.WIN;
           }

        return GameResult.LOSS;
    }

    function hostChoice(uint256 _random, uint8 _playerChoice) internal pure returns(uint8) {
        bool turn=(_random%2==0?true:false);

        if(_playerChoice==0)      return turn?1:2;
        else if(_playerChoice==1) return turn?0:2;
        return turn?1:0;
    }

    receive() external payable {}
    
    function withdraw() external onlyOwner {
        payable(s_owner).transfer(address(this).balance);
    }
}