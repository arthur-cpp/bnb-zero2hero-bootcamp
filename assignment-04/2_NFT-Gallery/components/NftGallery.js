import { useEffect, useState } from "react";
import { useAccount, useContractEvent } from "wagmi";
import { NFT } from "../constants";
import { readContract } from '@wagmi/core'
import styles from '../styles/Home.module.css';
import NftCard from '../components/NftCard';

export default function NftGallery() {
  const { address, isConnected } = useAccount();
  const [_isConnected, _setIsConnected] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [tokensBalance, setTokensBalance] = useState(0);

  /**
   * Waiting for wallet connection
   */
  useEffect(() => {
    _setIsConnected(isConnected);
    if(isConnected) readOwnedNfts();
  }, [isConnected]);

  /**
   * Detect account switched
   */
  useEffect(() => {
    setNfts([]);
    if(isConnected) readOwnedNfts();
  }, [address]);

  /**
   * Subscribe for minted NFTs
   */
  useContractEvent({
    address: NFT.address,
    abi: NFT.abi,
    eventName: 'Transfer',
    listener(from, to, tokenId) {
      if(isConnected && to==address) {
        console.log(`Minted NFT for ${to}: #${tokenId}`);
        readOwnedNfts();
      }
    },
  })

  /**
   * Read NFTs owned by user
   */
  const readOwnedNfts = async () => {
    let _nfts = [];
    let _tokensBalance = await readContract({
      address: NFT.address,
      abi: NFT.abi,
      functionName: 'balanceOf',
      args: [address]}
    );
    setTokensBalance(_tokensBalance);
    console.log(`balanceOf(${address}) = ${_tokensBalance}`);

    for(let tokenIndex=0; tokenIndex<_tokensBalance; tokenIndex++) {
      let tokenId = Number(await readContract({
        address: NFT.address,
        abi: NFT.abi,
        functionName: 'tokenOfOwnerByIndex',
        args: [address, tokenIndex]}
      ));
      console.log(`tokenOfOwnerByIndex(${address}, ${tokenIndex}) = ${tokenId}`);

      let tokenUri = String(await readContract({
        address: NFT.address,
        abi: NFT.abi,
        functionName: 'tokenURI',
        args: [tokenId]}
      ));

      _nfts.push({id: tokenId, uri: tokenUri});

      console.log(`tokenURI(${tokenId}) = ${tokenUri}`);
    }

    setNfts(_nfts)
  }

  /**
   * Render
   */
  if(_isConnected) {
    if(tokensBalance>0) {
      if(nfts.length>0) {
        return (
          <div className={styles.grid}>
            {
              nfts.map((nft) => (
                <NftCard key={nft.id} id={nft.id} uri={nft.uri} />
              ))
            }
          </div>
        );
      }
    
      return (<div className={styles.grid}>LOADING...</div>);
    }
  }

  return (<div className={styles.grid}></div>)
}