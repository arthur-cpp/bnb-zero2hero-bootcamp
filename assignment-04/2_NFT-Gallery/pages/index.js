import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import NftGallery from '@/components/NftGallery';
import MintButton from '@/components/MintButton';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>NFT Gallery</title>
        <meta name="description" content="NFT Gallery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        
        <div className={styles.description}>
          <h1>NFT Gallery</h1>
          <ConnectButton showBalance={true} chainStatus={'icon'} />
        </div>

        <MintButton />
        
        <NftGallery/>
      </main>
    </>
  )
}
