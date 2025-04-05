"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export default function ConectButton({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey } = useWallet();

  // Set mounted to true after component is mounted to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null until component has mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className={` rounded-full bg-primary hover:bg-primary/80`}>
      <WalletMultiButton
        style={{
          backgroundColor: "#007AFF",
          borderRadius: "2rem",
          padding: "0.5rem",
        }}
      />
    </div>
  );
}
