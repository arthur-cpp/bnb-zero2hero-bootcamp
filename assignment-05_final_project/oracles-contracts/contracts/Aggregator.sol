// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAggregator.sol";

contract Aggregator is IAggregator, Ownable {
    struct Round {
        uint timestamp;
        uint price;
    }

    address                 s_transmitter;
    uint8                   s_digits;
    string                  s_name;
    mapping(uint=>Round)    s_rounds;
    uint                    s_last_round_id;

    event PriceUpdated(uint createdAt, uint updatedAt, uint price);

    constructor(string memory _name, uint8 _digits, address _transmitter) {
        s_name = _name;
        s_digits = _digits;
        s_transmitter = _transmitter;
    }

    /// @notice Interface functions for datafeed contract
    function digits() public view override returns(uint8) {
        return s_digits;
    }

    function name() public view override returns(string memory) {
        return s_name;
    }

    function getLastPrice() public view override returns(uint, uint, uint) {
        // may be not initialized yet or something went wrong
        require(s_rounds[s_last_round_id].timestamp>0, "no prices");

        Round storage round=s_rounds[s_last_round_id];
        return (s_last_round_id, round.timestamp, round.price);
    }

    function getHistoryPrice(uint roundId) public view override returns(uint, uint) {
        require(s_rounds[roundId].timestamp>0, "round not exist");

        Round storage round=s_rounds[roundId];
        return (round.timestamp, round.price);
    }

    /// @notice Internal mechanics
    function setTransmitter(address _transmitter) public onlyOwner {
        s_transmitter = _transmitter;
    }

    function setName(string calldata _name) public onlyOwner {
        s_name = _name;
    }

    function roundAdd(uint roundId, uint timestamp, uint price) public {
        require(msg.sender==s_transmitter, "not authorized");
        require(s_rounds[roundId].timestamp==0, "round already exist");

        s_rounds[roundId]=Round(timestamp, price);
        s_last_round_id=roundId;

        emit PriceUpdated(timestamp, block.timestamp, price);
    }
}