// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAggregator.sol";

contract DataFeed is Ownable {
    mapping(uint=>address) public s_aggregators;

    event SymbolAdded(uint indexed symbolCode, address aggregator);
    event SymbolUpdated(uint indexed symbolCode, address aggregatorOld, address aggregatorNew);
    event SymbolDeleted(uint indexed symbolCode);

    modifier symbolExist(uint symbolCode) {
        require(s_aggregators[symbolCode]!=address(0),"wrong symbol code");
        _;
    }

    /// @notice Proxies to aggregators functions
    function symbolDigits(uint symbolCode) public view symbolExist(symbolCode) returns(uint8) {
        return IAggregator(s_aggregators[symbolCode]).digits();
    }

    function symbolName(uint symbolCode) public view symbolExist(symbolCode) returns(string memory) {
        return IAggregator(s_aggregators[symbolCode]).name();
    }

    function getLastPrice(uint symbolCode) public view symbolExist(symbolCode) returns(uint roundId, uint timestamp, uint price) {
        (roundId, timestamp, price) = IAggregator(s_aggregators[symbolCode]).getLastPrice();
    }

    function getHistoryPrice(uint symbolCode, uint roundId) public view symbolExist(symbolCode) returns(uint timestamp, uint price) {
        (timestamp, price) = IAggregator(s_aggregators[symbolCode]).getHistoryPrice(roundId);
    }

    /// @notice Owner only, manipulating for set of aggregators
    function aggregatorAddOrUpdate(uint symbolCode, address aggregator) public onlyOwner {
        if(s_aggregators[symbolCode]==address(0)) {
            s_aggregators[symbolCode]=aggregator;

            emit SymbolAdded(symbolCode, aggregator);
        }
        else {
            address _oldAggregator=s_aggregators[symbolCode];
            s_aggregators[symbolCode]=aggregator;

            emit SymbolUpdated(symbolCode, _oldAggregator, aggregator);
        }
    }

    function aggregatorDelete(uint symbolCode) public onlyOwner symbolExist(symbolCode) {
        delete s_aggregators[symbolCode];

        emit SymbolDeleted(symbolCode);
    }
}