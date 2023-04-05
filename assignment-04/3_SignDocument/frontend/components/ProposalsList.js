import { useEffect, useState } from 'react';
import { CONTRACT } from '../constants';
import { useAccount, useContract, useContractEvent, useProvider } from 'wagmi';
import { readContract } from '@wagmi/core';
import { fetchBlockNumber } from 'wagmi/actions'
import styles from '@/styles/Home.module.css'
import Accordion from 'react-bootstrap/Accordion';
import Proposal from './Proposal';

export default function ProposalsList() {
    const { address, isConnected } = useAccount();
    const [_isConnected, _setIsConnected] = useState(false);
    const [docs, setDocs] = useState([]);


    /**
     * Waiting for wallet connection
     */
    useEffect(() => {
        _setIsConnected(isConnected);
        if(isConnected) loadLastProposals();
    }, [isConnected]);

    /**
     * Detect account switched
     */
    useEffect(() => {
        setDocs([]);
        if(isConnected) loadLastProposals();
    }, [address]);


    /**
     * Subscribe for LIVE events (not history)
     */
    useContractEvent({
        address: CONTRACT.address,
        abi: CONTRACT.abi,
        eventName: 'ProposalAdded',
        listener(creator, index) {
            if(isConnected) {
                console.log(`ProposalAdded by ${creator}: #${index}`);
                // reload history
                loadLastProposals();
            }
        },
    })


    /**
     * Load history events
     */
    const provider = useProvider();
    const contract = useContract({address: CONTRACT.address, abi: CONTRACT.abi, signerOrProvider: provider});

    const loadLastProposals = async () => {
        let _docs=[];
        const blockNumber = await fetchBlockNumber();
        const events = await contract.queryFilter("ProposalAdded",blockNumber-5000,blockNumber);

        for(let i=0;i<events.length;i++) {
            let event=events[i];
            let proposalId=event.args[1];
            let proposal = await readContract({
                address: CONTRACT.address,
                abi: CONTRACT.abi,
                functionName: 'getProposal',
                args: [proposalId]}
                );
            
            _docs.push({
                creator: event.args[0],
                id:      proposalId,
                message: proposal.message,
                signer:  proposal.signer
            });
        }

        setDocs(_docs);
    }

    if(_isConnected) {
        if(docs.length>0) {
            let i=0;

            return (
                <Accordion defaultActiveKey="0">
                {
                  docs.map((doc) => (
                    <Proposal key={i} proposal={doc} elementKey={i++} />
                  ))
                }
                </Accordion>
            );
        }
    }

    return <></>
}