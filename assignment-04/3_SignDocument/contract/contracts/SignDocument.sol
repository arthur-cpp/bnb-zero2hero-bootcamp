// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SignDocument {
    struct Proposal {
        bool        exists;
        address     signer;
        string      message;
    }

    uint256                      s_counter;
    mapping(address=>bool)       s_signers;
    mapping(uint256 => Proposal) s_proposals;

    event ProposalAdded(address indexed creator, uint256 index);
    event ProposalSigned(address indexed signer, uint256 index);

    constructor(address[] memory signers) {
        for(uint i=0;i<signers.length;i++) {
            s_signers[signers[i]]=true;
        }
    }

    function addProposal(string calldata _message) external {
        s_proposals[s_counter]=Proposal({
            exists:  true,
            message: _message,
            signer:  address(0)
        });

        emit ProposalAdded(msg.sender,s_counter);
        s_counter++;
    }

    function getProposal(uint256 _index) external view returns(Proposal memory) {
        return s_proposals[_index];
    }

    function signProposal(uint256 _index) external {
        require(s_signers[msg.sender],"you are not allowed to sign");

        Proposal storage _proposal=s_proposals[_index];
        require(_proposal.exists,"proposal not exists");
        require(_proposal.signer==address(0),"proposal is signed already");
        
        _proposal.signer=msg.sender;
        emit ProposalSigned(msg.sender,_index);
    }
}