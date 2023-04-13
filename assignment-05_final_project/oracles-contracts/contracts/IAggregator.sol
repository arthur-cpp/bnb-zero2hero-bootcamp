// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAggregator {
    function digits() external view returns(uint8 _digits);
    function name() external view returns(string memory _name);

    function getLastPrice() external view returns(uint roundId, uint timestamp, uint price);
    function getHistoryPrice(uint roundId) external view returns(uint timestamp, uint price);

    function roundAdd(uint roundId, uint timestamp, uint price) external;
}