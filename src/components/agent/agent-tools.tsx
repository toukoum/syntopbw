"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ToolCard } from "./tool-card";
import { ToolCardChain } from "./tool-card-chain";
import { fetchUserTools, fetchCreatedTools, fetchDefaultTools } from "@/app/actions/tools";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import idlMintPay from "@/../mintPay/target/idl/mint_pay.json";
import { fetchNFTTools } from "@/utils/crypto";
import { NFTAsset } from "@/types/nft";

export interface Tool {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  parameters: {
    params: {
      name: string;
      type: string;
      required: boolean;
      description: string;
    }[];
  };
  published: boolean;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    walletAddress: string;
  };
  hasExecutionCode: boolean;
  isDefault?: boolean;
  enabled?: boolean;
}

export default function AgentTools({ walletAddress }: { walletAddress: string }) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [boughtTools, setBoughtTools] = useState<NFTAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  useEffect(() => {
    const loadTools = async () => {
      try {
        setLoading(true);
        // Fetch all tools (user-created + default)
        const userTools = await fetchUserTools(walletAddress);
        setTools(userTools);

        // Fetch NFT tools if wallet is connected
        if (wallet && publicKey) {
          const nftTools = await fetchNFTTools(
            connection, 
            wallet, 
            publicKey, 
            idlMintPay
          );
          setBoughtTools(nftTools);
        }
      } catch (error) {
        console.error('Error loading tools:', error);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      loadTools();
    }
  }, [walletAddress, wallet, publicKey, connection]);

  // Filter tools into categories
  const createdTools = tools.filter(tool => tool.creator.walletAddress === walletAddress && !tool.isDefault);
  const defaultTools = tools.filter(tool => tool.isDefault);
  const allToolsCount = tools.length;
  const defaultToolsCount = defaultTools.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Agent Tools</h2>
        <Link href="/shop">
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Get More Tools
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tools ({allToolsCount})</TabsTrigger>
          <TabsTrigger value="created">Created ({createdTools.length})</TabsTrigger>
          <TabsTrigger value="bought">Purchased ({boughtTools.length})</TabsTrigger>
          {/*<TabsTrigger value="default">Default ({defaultToolsCount})</TabsTrigger>*/}
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {loading ? <ToolsLoadingSkeleton /> : (
            <>
              {tools.length === 0 ? (
                <EmptyToolsState />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tools.map(tool => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isCreator={tool.creator.walletAddress === walletAddress && !tool.isDefault}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="created" className="space-y-8">
          {loading ? <ToolsLoadingSkeleton /> : (
            <>
              {createdTools.length === 0 ? (
                <EmptyCreatedToolsState />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {createdTools.map(tool => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isCreator={true}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="bought" className="space-y-8">
          {loading ? <ToolsLoadingSkeleton /> : (
            <>
              {boughtTools.length === 0 ? (
                <EmptyBoughtToolsState />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boughtTools.map(tool => (
                    <ToolCardChain
                      key={tool.publicKey}
                      tool={tool}
                      isCreator={false}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}

function ToolsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="border rounded-lg p-4">
          <Skeleton className="h-32 w-full rounded-md mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex justify-between">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyToolsState() {
  return (
    <div className="text-center py-10 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">No Tools Available</h3>
      <p className="text-muted-foreground mb-6">
        You don&apos;t have any tools yet. Get started by browsing the marketplace.
      </p>
      <Link href="/shop">
        <Button>Explore Marketplace</Button>
      </Link>
    </div>
  );
}

function EmptyCreatedToolsState() {
  return (
    <div className="text-center py-10 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">No Created Tools</h3>
      <p className="text-muted-foreground mb-6">
        You haven&apos;t created any tools yet. Start building your first tool.
      </p>
      <Link href="/build">
        <Button>Create Tool</Button>
      </Link>
    </div>
  );
}

function EmptyBoughtToolsState() {
  return (
    <div className="text-center py-10 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">No Purchased Tools</h3>
      <p className="text-muted-foreground mb-6">
        You haven&apos;t purchased any tools yet. Browse the marketplace to find tools.
      </p>
      <Link href="/shop">
        <Button>Browse Marketplace</Button>
      </Link>
    </div>
  );
}

function EmptyDefaultToolsState() {
  return (
    <div className="text-center py-10 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">No Default Tools</h3>
      <p className="text-muted-foreground mb-6">
        There are currently no default tools available in the system.
      </p>
      <Link href="/shop">
        <Button>Browse Marketplace</Button>
      </Link>
    </div>
  );
}