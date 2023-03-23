// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @dev Contract deployed to the 0x6c0aFE8070Ea4CDF9101f4F32efeD69C0985E89A
contract DeFaceSoulBoundToken is ERC721, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("DeFace SoulBoundToken", "DFSBT") {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256, uint256) pure override internal {
        require(from == address(0) || to == address(0), "this a soulbound token, only burn allowed");
    }
}

contract Ballot {
    struct BallotChoice {
        string  description;
        uint    votes;
    }

    struct BallotSession {
        address                      owner;
        bool                         stopped;
        uint                         quorum;            // zero means value is unset
        uint                         choices_total;
        uint                         votes_total;
        string                       topic;
        mapping(uint=>BallotChoice)  choices;
        mapping(address=>bool)       voted;
    }

    // used to return list of all sessions
    struct BallotSessionShort {
        address                      owner;
        bool                         stopped;
        uint                         quorum;
        string                       topic;
    }

    DeFaceSoulBoundToken immutable   s_citizenship;
    BallotSession[]                  s_sessions;

    event BallotSessionStopped(uint indexed session, string topic, string winner);

    constructor(DeFaceSoulBoundToken _sbt) {
        s_citizenship=_sbt;
    }

    // Creates new ballot session
    function create(string calldata _topic, string[] calldata _choices) public returns(uint256) {
        BallotSession storage session=s_sessions.push();

        session.topic=_topic;
        session.owner=msg.sender;
        
        uint i;
        for(i=0;i<_choices.length;i++) {
            BallotChoice memory choice=BallotChoice(_choices[i],0);
            session.choices[i]=choice;
        }
        session.choices_total=i;

        return s_sessions.length-1;
    }

    // Voting for some choice in the ballot session
    function vote(uint _session, uint _choice) public {
        // check souldbound token
        require(s_citizenship.balanceOf(msg.sender)>0,"you are not a citizen");
        // check session index
        require(_session<s_sessions.length,"ballot not exist");
        // acquire session and check that user does not voted already
        BallotSession storage session=s_sessions[_session];
        require(!session.voted[msg.sender],"voted already");
        // check that ballot session is active
        require(!session.stopped,"ballot stopped");
        // check choice number
        require(_choice<session.choices_total,"wrong choice number");

        // store choice
        BallotChoice storage choice=session.choices[_choice];
        session.voted[msg.sender]=true;
        choice.votes++;
        session.votes_total++;

        // check quorum if set (non-zero)
        if(session.quorum>0 && session.votes_total>=session.quorum) {
            session.stopped=true;
            emit BallotSessionStopped(_session,session.topic,session.choices[sessionWinner(session)].description);
        }
    }

    // Stop the ballot session by its owner manually
    function stop(uint _session) public {
        // check session index
        require(_session<s_sessions.length,"ballot not exist");
        // acquire session
        BallotSession storage session=s_sessions[_session];
        // check owner of the session
        require(msg.sender==session.owner,"you are not an owner of this ballot session");

        session.stopped=true;
        emit BallotSessionStopped(_session,session.topic,session.choices[sessionWinner(session)].description);
    }

    // Set quorum for the ballot session
    function setSessionQuorum(uint _session, uint _quorum) public {
        // check session index
        require(_session<s_sessions.length,"ballot not exist");
        // acquire session
        BallotSession storage session=s_sessions[_session];
        // check owner of the session
        require(msg.sender==session.owner,"you are not an owner of this ballot session");

        session.quorum=_quorum;
    }

    // Get ballot choice count
    function votesCount(uint _session, uint _choice) public view returns(uint) {
        // check session index
        require(_session<s_sessions.length,"ballot not exist");
        // acquire session
        BallotSession storage session=s_sessions[_session];
        // check choice number
        require(_choice<session.choices_total,"wrong choice number");

        BallotChoice memory choice=session.choices[_choice];
        return choice.votes;
    }

    // Get sessions list
    function sessionsList() public view returns(BallotSessionShort[] memory) {
        BallotSessionShort[] memory result = new BallotSessionShort[](s_sessions.length);

        for(uint i=0;i<s_sessions.length;i++) {
            BallotSession storage session=s_sessions[i];

            result[i]=BallotSessionShort(
                session.owner,
                session.stopped,
                session.quorum,
                session.topic);
        }

        return result;
    }

    // Get the given session vote counters and determine winner
    function sessionResult(uint _session) public view returns(BallotSessionShort memory, uint[] memory, uint winner) {
        // check session index
        require(_session<s_sessions.length,"ballot not exist");
        // acquire session
        BallotSession storage session=s_sessions[_session];
        // collect vote counters
        uint[] memory choices=new uint[](session.choices_total);
        for(uint i=0;i<session.choices_total;i++) {
            choices[i]=session.choices[i].votes;
        }

        return (
            BallotSessionShort(session.owner,session.stopped,session.quorum,session.topic),
            choices,
            sessionWinner(session));
    }

    // Determine current winner of the ballot session
    function sessionWinner(BallotSession storage _session) internal view returns(uint winner) {
        uint winner_votes;
        for(uint i=0;i<_session.choices_total;i++) {
            if(_session.choices[i].votes>winner_votes) {
                winner=i;
                winner_votes=_session.choices[i].votes;
            }
        }
    }
}