import 'bootstrap/dist/css/bootstrap.min.css';
import '@rainbow-me/rainbowkit/styles.css';
import '@/styles/globals.css'
import {metaMaskWallet, ledgerWallet, injectedWallet, rainbowWallet, walletConnectWallet, trustWallet, coinbaseWallet, braveWallet, omniWallet, zerionWallet} from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains(
  [bscTestnet],
  [
    publicProvider()
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({chains}),
      ledgerWallet({chains}),
      trustWallet({chains}),
      coinbaseWallet({chains}),
      braveWallet({chains}),
      omniWallet({chains}),
      zerionWallet({chains}),
      injectedWallet({ chains }),
      rainbowWallet({ chains }),
      walletConnectWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export default function App({ Component, pageProps }) {

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} modalSize="full" showRecentTransactions={true}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};