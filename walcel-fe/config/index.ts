import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  Chain,
} from 'wagmi/chains';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '563915def13237d53553406f89b3d315'

export const localChain: Chain = {
  id: 31337,
  name: "Local Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
}

export const config = getDefaultConfig({
  appName: 'dWeb',
  projectId: '563915def13237d53553406f89b3d315',
  chains: [
    // mainnet,
    // polygon,
    // optimism,
    // arbitrum,
    // base,
    // localChain,
    process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? sepolia : mainnet,
  ],
  ssr: true,
});