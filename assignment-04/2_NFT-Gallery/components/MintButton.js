import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { writeContract } from '@wagmi/core'
import { NFT } from "../constants";
import styles from '@/styles/Home.module.css'
import { ethers } from "ethers";

export default function MintButton() {
    const { address, isConnected } = useAccount();
    const [_isConnected, _setIsConnected] = useState(false);

    useEffect(() => {
        _setIsConnected(isConnected);
      }, [isConnected]);

    const mint = async () => {
        writeContract({
            address: NFT.address,
            abi: NFT.abi,
            functionName: 'safeMint',
            args: [address],
            overrides: {
                value: ethers.utils.parseEther("0.001")
            }
        }).catch((reason)=>{
            if(reason.reason) {
                console.log(reason.reason);
                alert(reason.reason);
            } else {
                console.log(JSON.stringify(reason));
            }
        });
    }
    

    if(_isConnected) {
        return (
            <div className={styles.mint}>
                <a href='#' role="button" onClick={mint}>Mint a new NFT!</a>
            </div>
        );
    }
    
    return (<></>);
}