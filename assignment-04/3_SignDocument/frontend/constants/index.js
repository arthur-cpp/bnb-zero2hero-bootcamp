export const CONTRACT = {
    address: "0xd6d19C1e3E4B68364BC07b416d29F1E41f411f7c",
    abi: [
        {
            "inputs": [
            {
                "internalType": "address[]",
                "name": "signers",
                "type": "address[]"
            }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "creator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
            ],
            "name": "ProposalAdded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "signer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
            ],
            "name": "ProposalSigned",
            "type": "event"
        },
        {
            "inputs": [
            {
                "internalType": "string",
                "name": "_message",
                "type": "string"
            }
            ],
            "name": "addProposal",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
            ],
            "name": "getProposal",
            "outputs": [
            {
                "components": [
                {
                    "internalType": "bool",
                    "name": "exists",
                    "type": "bool"
                },
                {
                    "internalType": "address",
                    "name": "signer",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "message",
                    "type": "string"
                }
                ],
                "internalType": "struct SignDocument.Proposal",
                "name": "",
                "type": "tuple"
            }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
            ],
            "name": "signProposal",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
}