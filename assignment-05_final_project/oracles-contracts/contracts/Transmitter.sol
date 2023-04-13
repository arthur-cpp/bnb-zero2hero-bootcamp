// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAggregator.sol";

contract Transmitter is Ownable {
    struct Deviation {
        uint16  value;
        uint16  denominator;
    }

    uint                    s_counter;
    uint                    s_currentRound;
    address                 s_sequencer;
    address                 s_aggregator;
    mapping(address=>bool)  s_oracles;
    Deviation               s_maxDeviation;
    uint                    s_minSigners;
    uint constant           MAX_DELAY = 30 seconds;
    // round data
    uint                    s_prevRoundPrice;
    uint                    s_startedAt;
    uint[]                  s_prices;
    address[]               s_signers;

    event Round(uint roundId, uint startedAt);

    /// @dev default minSigners = 2
    constructor(address sequencer, uint minSigners) {
        s_sequencer=sequencer;
        s_counter=1;
        s_minSigners=minSigners;

        // we request price rarely, let's use 10% max price deviation by default
        s_maxDeviation.value=10;
        s_maxDeviation.denominator=100;
    }

    modifier onlySequencer() {
        require(msg.sender==s_sequencer,"wrong tx initiator");
        _;
    }

    /// @notice Called by sequencer
    function startRound() public onlySequencer {
        require(s_currentRound==0,"round in progress");

        s_currentRound=s_counter;
        s_counter++;
        s_startedAt=block.timestamp;

        emit Round(s_currentRound, s_startedAt);
    }

    /// @notice Called by oracles
    function transmit(uint roundId, uint timestamp, uint price, uint8 v, bytes32 r, bytes32 s) public {
        // check round started and not stopped
        require(s_currentRound!=0,"round not in progress");
        // check price and block timestamps
        require(timestamp      <=s_startedAt+MAX_DELAY,"outdated price (oracle)");
        require(block.timestamp<=s_startedAt+MAX_DELAY,"outdated price (network)");
        // check price deviation
        if(s_prevRoundPrice>0) {
            uint _maxDeviation= (s_prevRoundPrice*s_maxDeviation.value)/s_maxDeviation.denominator;
            uint _deviation   = s_prevRoundPrice>price?(s_prevRoundPrice-price):(price-s_prevRoundPrice);
            require(_deviation<_maxDeviation,"too high price deviation");
        }

        // check oracle authorized
        bytes32 payloadHash = keccak256(abi.encode(roundId, timestamp, price));
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", payloadHash));
        address signer      = ecrecover(messageHash, v, r, s);

        require(s_oracles[signer],"oracle not authorized to submit prices");

        // do not allow oracle send prices multiple times to avoid avg.price spoofing
        require(!isSignedRound(signer),"oracle can submit price only once");
        s_signers.push(signer);
        
        // all checks passed, store price
        s_prices.push(price);
    }

    /// @notice Called by sequencer
    /// @dev    Even no aggregator set, no prices collected we must force closing round
    function stopRound() external onlySequencer {
        // check aggregator is set
        if(s_aggregator!=address(0)) {
            // check prices collected
            uint _numPrices=s_prices.length;
            if(s_minSigners>0 && _numPrices>=s_minSigners) {
                // calc average price
                uint _averagePrice;
                for(uint i; i<_numPrices; i++) {
                    _averagePrice+=s_prices[i];
                }
                _averagePrice=_averagePrice/_numPrices;
                
                // check average price not equals price from previous round
                if(_averagePrice!=s_prevRoundPrice) {
                    // submit price to aggregator
                    IAggregator(s_aggregator).roundAdd(s_currentRound,s_startedAt,_averagePrice);
                }
            }
        }

        // reset round state
        s_currentRound=0;
        s_startedAt=0;
        delete s_prices;
        delete s_signers;
    }

    function isSignedRound(address signer) internal view returns(bool) {
        uint _numSigners=s_signers.length;
        for(uint i=0;i<_numSigners;i++) {
            if(s_signers[i]==signer) {
                return true;
            }
        }

        return false;
    }

    /// @notice Administrative functions
    function setSequencer(address sequencer) public onlyOwner {
        s_sequencer=sequencer;
    }

    function setAggregator(address aggregator) public onlyOwner {
        s_aggregator=aggregator;
    }

    function oracleAdd(address oracle) public onlyOwner {
        s_oracles[oracle]=true;
    }

    function oracleDelete(address oracle) public onlyOwner {
        if(s_oracles[oracle]) {
            delete s_oracles[oracle];
        }
    }

    function setMaxPriceDeviation(uint16 value, uint16 denominator) public onlyOwner {
        s_maxDeviation.value      =value;
        s_maxDeviation.denominator=denominator;
    }

    function setMinSigners(uint minSigners) public onlyOwner {
        require(minSigners>0,"zero value");
        s_minSigners=minSigners;
    }
}