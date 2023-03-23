// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract SignerNFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("SignerNFT", "SNFT") {
        // let's start from 1 to simplify coding
        _tokenIdCounter.increment();
    }

    function safeMint(address to) public onlyOwner returns(uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        return tokenId;
    }
}

// @dev Make MerkleTree root and proofs using https://github.com/OpenZeppelin/merkle-tree
contract SignDocument {
    struct Proposal {
        bool        exists;
        string      message;
        uint256     tokenId; // zero means proposal is unsigned
    }

    SignerNFT public             s_nfts;
    uint256                      s_counter;
    mapping(uint256 => Proposal) s_proposals;
    bytes32 private              s_merkle_root;

    event ProposalSigned(address indexed signer, uint256 index, uint256 mintedTokenId);

    constructor(bytes32 _root) {
        s_nfts=new SignerNFT();
        s_merkle_root=_root;
    }

    function addProposal(string calldata _message) external returns(uint256) {
        s_proposals[++s_counter]=Proposal({
            exists: true,
            message: _message,
            tokenId: 0
        });
        return s_counter;
    }

    function getProposal(uint256 _index) external view returns(Proposal memory) {
        return s_proposals[_index];
    }

    function sign(uint256 _index, bytes32[] memory proof) external {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender))));
        require(MerkleProof.verify(proof, s_merkle_root, leaf), "invalid proof");

        Proposal storage _proposal=s_proposals[_index];
        require(_proposal.exists,"proposal not exists");
        require(_proposal.tokenId==0,"proposal is signed already");
        
        _proposal.tokenId=s_nfts.safeMint(msg.sender);

        emit ProposalSigned(msg.sender,_index,_proposal.tokenId);
    }
}
