import Accordion from 'react-bootstrap/Accordion';
import { Button } from 'react-bootstrap';
import { writeContract } from '@wagmi/core';
import { CONTRACT } from '../constants';
import { useEffect, useState } from 'react';
import { useContractEvent } from 'wagmi';

export default function Proposal({proposal: proposalDoc, elementKey: index}) {

    let [doc, setDoc]=useState(proposalDoc);
    const [seed, setSeed] = useState(1);

    /**
     * Subscribe for signing event
     */
    useContractEvent({
        address: CONTRACT.address,
        abi: CONTRACT.abi,
        eventName: 'ProposalSigned',
        listener(signer, proposalIndex) {
            if(proposalDoc.id.eq(proposalIndex)) {
                console.log(`ProposalSigned by ${signer}: #${proposalIndex}`);
                // update doc
                proposalDoc.signer=signer;
                setDoc(proposalDoc);
                // refresh component
                setSeed(Math.random());

                console.log(proposalDoc);
            }
        },
    })

    const handleSignBtn = (event) => {
        event.preventDefault();

        writeContract({
            address: CONTRACT.address,
            abi: CONTRACT.abi,
            functionName: 'signProposal',
            args: [doc.id]
        })
        .then(()=>{
            console.log(`Proposal #${doc.id.toString()} has been signed`)
        })
        .catch((reason)=>{
            if(reason.reason) {
                console.log(reason.reason);
                alert(reason.reason);
            } else if(reason.cause && reason.cause.reason) {
                console.log(reason.cause.reason);
                alert(reason.cause.reason);
            } else {
                console.log(JSON.stringify(reason));
                alert(JSON.stringify(reason));
            }
        });
    }

    const buildHeader = (_doc) => {
        const signed = _doc.signer==="0x0000000000000000000000000000000000000000"?false:true;
        const status = signed?"Signed":"Unsigned";
        const postfix = signed?`, signed by ${_doc.signer}`:'';

        return `${status} proposal #${_doc.id}, created by ${_doc.creator}${postfix}`;
    }

    return (
        <Accordion.Item eventKey={index} key={index} seed={seed}>
            <Accordion.Header>{buildHeader(doc)}</Accordion.Header>
            <Accordion.Body>
                <p>{doc.message}</p>
                {
                    doc.signer==="0x0000000000000000000000000000000000000000"?
                        (<Button onClick={handleSignBtn}>Sign proposal</Button>):
                        <></>
                }
                
            </Accordion.Body>
        </Accordion.Item>
    )
}