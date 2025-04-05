"use client";

import { ReactNode } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { useWallet } from "@solana/wallet-adapter-react";
import ConnectButton from "@/components/solana/connectButton";
import { Toaster } from "@/components/ui/sonner";

export default function AppRouteLayout({
	children,
}: {
	children: ReactNode;
}) {
	const { publicKey } = useWallet();
	return (
			<AppLayout>
				{publicKey ? <></> : <ConnectButton className="fixed top-4 right-4" />}
				{children}
			<Toaster />
			</AppLayout>
	);

}