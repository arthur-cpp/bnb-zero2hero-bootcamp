import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import styles from '../styles/Home.module.css';

function NftCard({id, uri}) {
  const [hasMounted, setHasMounted] = useState(false);
  const [metadata, setMetadata] = useState({image:""});

  const ipfsUriToGateway = (uri) => {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  const loadMetadata = async () => {
    try {
      //console.log(ipfsUriToGateway(uri));
      const url = ipfsUriToGateway(uri);
      const response = await axios.get(url);
      //console.log(`Response: ${response.data}`)
      setMetadata(response.data);
    } catch (exception) {
      console.error(`loadMetadata error: ${exception}\n`);
    }
  };

  useEffect(() => {
    setHasMounted(true);
    loadMetadata();
  }, [])

  if (!hasMounted)                 return null;
  if(!metadata || !metadata.image) return null;

  let url=ipfsUriToGateway(metadata.image);
  let name = metadata.name;

  console.log(url)

  return (
    <div className={styles.card}>
      <h2>{metadata.name}</h2>
      <img src={url} width="200"/>
      <p>NFT #{id}</p>
      
    </div>
  )
}

export default NftCard;