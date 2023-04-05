import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import SubmitProposalForm from '@/components/SubmitProposalForm';
import ProposalsList from '@/components/ProposalsList';

export default function Home() {
  return (
    <>
      <Head>
        <title>Sign Document Frontend</title>
        <meta name="description" content="sign document frontend" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <ConnectButton showBalance={false}/>
        <Container className="p-3">
          <SubmitProposalForm></SubmitProposalForm>
        </Container>
        <Container className="p-3">
          <ProposalsList />
        </Container>
      </main>
    </>
  )
}
