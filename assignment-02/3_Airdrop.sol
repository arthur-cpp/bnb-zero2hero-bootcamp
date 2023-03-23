// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @dev Deploy the contract before an airdrop and transfer tokens to the contract below
contract DeFaceToken is ERC20, Ownable {
    constructor() ERC20("DeFace Token", "DFT") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

/// @title Airdrop contract
contract Airdrop {
    DeFaceToken              s_token;
    address                  s_owner;
    bytes32 private          s_merkle_root;
    uint256 immutable public s_airdrop_amount;
    mapping(address=>bool)   s_claimed;

    constructor(DeFaceToken _token, bytes32 _root) {
        s_token=_token;
        s_airdrop_amount=2*10**s_token.decimals();

        s_owner=msg.sender;
        s_merkle_root=_root;
    }

    modifier onlyOwner() {
        require(msg.sender==s_owner,"not an owner");
        _;
    }

    // Main airdrop function
    function claim(bytes32[] memory _proof) external {
        require(!s_claimed[msg.sender],"already claimed");
        require(s_token.balanceOf(address(this))>=s_airdrop_amount,"not enough tokens");

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender))));
        require(MerkleProof.verify(_proof, s_merkle_root, leaf), "invalid proof");

        s_claimed[msg.sender]=true;
        s_token.transfer(msg.sender, s_airdrop_amount);
    }

    /// @dev Method to claim junk and accidentally sent tokens
    function rescueTokens(IERC20 _token, address payable _to, uint256 _amount) external onlyOwner {
        require(_to!=address(0), "can not send to zero address");

        if(address(_token)==address(0)) {
            // for Ether
            uint256 totalBalance = address(this).balance;
            uint256 balance = totalBalance<_amount?totalBalance:_amount;
            require(balance > 0, "trying to send 0 ethers");
            _to.transfer(balance);
        } else {
            // any other erc20
            uint256 totalBalance = _token.balanceOf(address(this));
            uint256 balance = totalBalance<_amount?totalBalance:_amount;
            require(balance > 0, "trying to send 0 tokens");
            _token.transfer(_to, balance);
        }
    }
}
