// src/components/chat/tools/WalletConfirmation.tsx
import React, { useEffect, useMemo, useState } from 'react';
import ICON from "@/components/icons/rook.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Player } from "@lordicon/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Shield } from "lucide-react";
import ToolProcessingCard from "./ToolProcessingCard";
import ToolResultCard from "./ToolResultCard";
import { TransactionState, ToolInvocation } from "./types";
import { BuildSwapInstruction, QueryMintDecimals } from "@/utils/crypto";
import { SOL, USDC, wBTC, wETH } from "@/components/constantes/tokenAddresses";
import { toast } from 'sonner';
import { ArrowBigRight, Check, ExternalLink, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Composants Alert simples
const Alert = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 rounded-md border bg-background">
    {children}
  </div>
);

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-base font-medium mb-2">{children}</h4>
);

const AlertDescription = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`text-sm text-muted-foreground ${className}`}>{children}</div>
);

// Fonction utilitaire pour tronquer une adresse de portefeuille
const truncateWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

interface WalletConfirmationProps {
  tool: ToolInvocation;
  onSuccess: (result: string) => void;
  onFailure: (error: string) => void;
}

/**
 * Handles the wallet tool operations with user confirmation
 */
export default function WalletConfirmation({
  tool,
  onSuccess,
  onFailure,
}: WalletConfirmationProps) {
  const { publicKey } = useWallet();
  const userAddress = publicKey?.toString() || '';
  const [txState, setTxState] = useState<TransactionState>(
    TransactionState.WAITING_CONFIRMATION
  );
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Vérifier que tool existe et a les propriétés nécessaires
  if (!tool) {
    console.error("WalletConfirmation: tool object is undefined");
    return (
      <div className="p-4 text-red-500">
        Erreur: Impossible de traiter cette opération. Veuillez réessayer.
      </div>
    );
  }

  const args = tool.args || {};
  const toolName = tool.toolName.toLowerCase();

  // Prepare confirmation UI based on wallet tool type
  const renderConfirmationUI = useMemo(() => {
    switch (toolName) {
      case 'send':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Send Transaction</AlertTitle>
              <AlertDescription className="flex flex-col gap-1">
                <div>
                  <span className="text-muted-foreground">From:</span>{' '}
                  <span className="font-medium">
                    {truncateWalletAddress(userAddress)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">To:</span>{' '}
                  <span className="font-medium">
                    {truncateWalletAddress(args.recipient)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>{' '}
                  <span className="font-semibold">
                    {args.amount} {args.token || 'SOL'}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'swap':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Swap Tokens</AlertTitle>
              <AlertDescription className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-muted-foreground text-sm">From</div>
                    <div className="font-semibold">{args.amount} {args.fromToken}</div>
                  </div>
                  <ArrowBigRight />
                  <div className="flex-1">
                    <div className="text-muted-foreground text-sm">To</div>
                    <div className="font-semibold">≈ {args.toAmount} {args.toToken}</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'copyportfolio':
        // Déterminer le montant à investir
        const investmentAmount = args.amount || 0.1;
        // Calculer les allocations réelles
        const portfolio = {
          assets: [
            { symbol: "SOL", allocation: 0.50, amount: (investmentAmount * 0.50).toFixed(4) },
            { symbol: "wBTC", allocation: 0.50, amount: (investmentAmount * 0.50).toFixed(4) }
          ],
        };

        return (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Copier le Portfolio de @{args.username || "toukoum"}</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Investissement total: {investmentAmount} {args.currency || "USD"}
                </div>

                <div className="grid gap-2">
                  {portfolio.assets.map((asset) => (
                    <div key={asset.symbol} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          {asset.symbol.charAt(0)}
                        </div>
                        <span>{asset.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{(asset.allocation * 100)}%</span>
                        <span className="font-medium">{asset.amount} {args.currency || "USD"}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-2" />

                <div className="text-sm text-muted-foreground">
                  Ce portfolio est basé sur l'allocation partagée par @{args.username || "toukoum"}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return (
          <div>
            <Alert>
              <AlertTitle>{toolName.charAt(0).toUpperCase() + toolName.slice(1)}</AlertTitle>
              <AlertDescription>
                Action wallet requise: {JSON.stringify(args)}
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  }, [toolName, args, userAddress]);

  // Mock a transaction execution with a delay
  const executeMockTransaction = async () => {
    try {
      setTxState(TransactionState.PENDING);

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate mock transaction hash
      const mockTxHash = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setTxHash(mockTxHash);
      setTxState(TransactionState.SUCCESS);

      // Format a success response depending on the tool
      let result;

      if (toolName === 'send') {
        result = {
          success: true,
          txHash: mockTxHash,
          data: {
            sender: userAddress,
            recipient: args.recipient,
            amount: args.amount,
            token: args.token || 'SOL'
          },
          message: `Sent ${args.amount} ${args.token || 'SOL'} to ${truncateWalletAddress(args.recipient)}`
        };
      } else if (toolName === 'swap') {
        result = {
          success: true,
          txHash: mockTxHash,
          data: {
            fromToken: args.fromToken,
            toToken: args.toToken,
            fromAmount: args.amount,
            toAmount: args.toAmount,
          },
          message: `Swapped ${args.amount} ${args.fromToken} to ${args.toAmount} ${args.toToken}`
        };
      } else if (toolName === 'copyportfolio') {
        result = {
          success: true,
          txHash: mockTxHash,
          data: {
            username: args.username || "toukoum",
            portfolio: {
              assets: [
                { symbol: "SOL", allocation: 0.50 },
                { symbol: "wBTC", allocation: 0.50 }
              ],
              swapResults: [
                { from: args.currency || "USD", to: "SOL", amount: (args.amount * 0.50).toFixed(4) },
                { from: args.currency || "USD", to: "wBTC", amount: (args.amount * 0.50).toFixed(4) }
              ]
            }
          },
          message: `Portfolio de @${args.username || "toukoum"} copié avec succès`
        };
      } else {
        result = {
          success: true,
          txHash: mockTxHash,
          data: args,
          message: `${toolName} operation completed successfully`
        };
      }

      onSuccess(JSON.stringify(result));
    } catch (error: any) {
      setTxState(TransactionState.FAILED);
      onFailure(error.message || 'Transaction failed');
      toast.error('Transaction failed');
    }
  };

  const handleCancelTransaction = () => {
    onFailure('Transaction cancelled by user');
    setIsDialogOpen(false);
    toast.info('Transaction cancelled');
  };

  return (
    <div className="h-full w-full flex flex-col">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {txHash ? (
                <span>Transaction hash: {txHash}</span>
              ) : (
                'Preparing your transaction...'
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Mock transaction explorer link */}
          {txHash && (
            <div className="flex items-center gap-2">
              <a
                href={`https://explorer.solana.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 flex items-center gap-1"
              >
                View on Solana Explorer <ExternalLink size={12} />
              </a>
            </div>
          )}

          <DialogFooter className="flex justify-between mt-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderConfirmationUI}

      <div className="flex justify-between mt-4">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancelTransaction}
          disabled={txState !== TransactionState.WAITING_CONFIRMATION}
        >
          <X size={16} className="mr-2" /> Cancel
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={executeMockTransaction}
          disabled={txState !== TransactionState.WAITING_CONFIRMATION}
        >
          <Check size={16} className="mr-2" /> Confirm
        </Button>
      </div>

      {txState === TransactionState.PENDING && (
        <div className="mt-4 text-center">
          <div className="animate-pulse">Processing transaction...</div>
        </div>
      )}

      {txState === TransactionState.SUCCESS && (
        <div className="mt-4 flex items-center justify-center text-green-500">
          <Check size={16} className="mr-2" /> Transaction successful
        </div>
      )}

      {txState === TransactionState.FAILED && (
        <div className="mt-4 flex items-center justify-center text-red-500">
          <X size={16} className="mr-2" /> Transaction failed
        </div>
      )}
    </div>
  );
}
