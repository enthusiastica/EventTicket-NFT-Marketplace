import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { FC, ReactNode, useMemo } from "react";

export const WalletConnectionProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  if (typeof window === "undefined") return <>{children}</>;
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network =
    process.env.NEXT_PUBLIC_SOL_ENV?.includes("devnet")
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const endpoint = 
    process.env.NEXT_PUBLIC_SOL_ENV !== "devnet"
    ? process.env.NEXT_PUBLIC_SOL_ENV!
    : useMemo(() => clusterApiUrl(network), [network])

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}> 
      <WalletProvider wallets={wallets} autoConnect>
        {children}
       </WalletProvider>
     </ConnectionProvider>
  );
};
