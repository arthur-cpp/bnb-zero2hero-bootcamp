import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { CONTRACT } from '../constants';
import { useAccount } from 'wagmi';
import { writeContract } from '@wagmi/core';
import Alert from 'react-bootstrap/Alert';

export default function SubmitProposalForm() {
    const { isConnected } = useAccount();
    const [_isConnected, _setIsConnected] = useState(false);
    const [ alert, setAlert] = useState("");

    useEffect(() => {
        _setIsConnected(isConnected);
      }, [isConnected]);

    const [text, setText] = useState()

    const onTextChange = ({target:{value}}) => { 
        setText(value)
    }

    const handleSubmitBtn = (event) => {
        event.preventDefault();

        writeContract({
            address: CONTRACT.address,
            abi: CONTRACT.abi,
            functionName: 'addProposal',
            args: [text]
        })
        .then(()=>{
            console.log(`Proposal submitted: ${text}`)
            setText("")
        })
        .catch((reason)=>{
            if(reason.reason) {
                console.log(reason.reason);
                setAlert(reason.reason)
            } else if(reason.cause && reason.cause.reason) {
                console.log(reason.cause.reason);
                setAlert(reason.cause.reason)
            } else {
                console.log(JSON.stringify(reason));
                setAlert(JSON.stringify(reason))
            }
        });
    }

    if(_isConnected) {
        return (
            <>
            { alert!=="" ? 
                <Alert key="danger" variant="danger">
                    <b>Error:</b> {alert}
                </Alert>
            : <></>
            }
            
            <Form>
                <Form.Group className="mb-3" controlId="form_create">
                    <Form.Label>Proposal text</Form.Label>
                    <Form.Control as="textarea" rows={3} value={text} onChange={onTextChange}/>
                </Form.Group>
                <Button variant="primary" type="submit" onClick={handleSubmitBtn}>
                    Submit proposal
                </Button>
            </Form>
            </>
        );
    }

    return <></>
}