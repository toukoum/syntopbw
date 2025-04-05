"use client";
import React, { FC, useMemo, ReactNode, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletProps {
	children: ReactNode;
}

export const Wallet: FC<WalletProps> = ({ children }) => {
	// Add state to prevent hydration mismatch
	const [mounted, setMounted] = useState(false);

	// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
	const network = WalletAdapterNetwork.Devnet;

	// You can also provide a custom RPC endpoint.
	const endpoint = useMemo(() => "https://api.devnet.solana.com", []);
	const wallets = useMemo(
		() => [
		],
		[network]
	);

	// Set mounted to true after the component is first mounted
	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>
					{mounted ? children : null}
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};