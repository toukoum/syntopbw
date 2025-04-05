"use client";

import { fetchUserTools } from "@/app/actions/tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Info, Search, SortAsc } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ToolCard } from "./tool-card";

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

type SortOption = "name-asc" | "name-desc" | "recent" | "oldest" | "enabled";

export default function AgentTools({ walletAddress }: { walletAddress: string }) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);

  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  useEffect(() => {
    const loadTools = async () => {
      try {
        setLoading(true);
        // Fetch all tools
        const userTools = await fetchUserTools(walletAddress);

        // Remove duplicates by using a Map with tool.id as key
        const uniqueToolsMap = new Map();
        userTools.forEach(tool => {
          if (!uniqueToolsMap.has(tool.id)) {
            uniqueToolsMap.set(tool.id, tool);
          }
        });

        // Convert Map back to array
        const uniqueTools = Array.from(uniqueToolsMap.values());

        setTools(uniqueTools);
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

  // Filter and sort tools
  const filteredAndSortedTools = useMemo(() => {
    // First filter by search and enabled status
    let result = [...tools];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }

    if (showEnabledOnly) {
      result = result.filter(tool => tool.enabled);
    }

    // Then sort
    switch (sortBy) {
      case "name-asc":
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return result.sort((a, b) => b.name.localeCompare(a.name));
      case "recent":
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "enabled":
        return result.sort((a, b) => {
          if (a.enabled === b.enabled) return a.name.localeCompare(b.name);
          return a.enabled ? -1 : 1;
        });
      default:
        return result;
    }
  }, [tools, searchQuery, sortBy, showEnabledOnly]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tools ({filteredAndSortedTools.length})</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Info className="h-4 w-4" />
              What is a tool?
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Understanding Tools</DialogTitle>
              <DialogDescription>
                Tools extend your agent's capabilities to perform specific tasks.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p>
                Tools are specialized functions that allow your AI agent to perform actions such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Retrieving real-time data (weather, prices, etc.)</li>
                <li>Interacting with blockchain networks (transactions, balance checks)</li>
                <li>Performing calculations or data transformations</li>
                <li>Connecting to external APIs and services</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                You can enable or disable tools, purchase new ones from the marketplace, or create your own custom tools to extend your agent's functionality.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Close</Button>
              </DialogClose>
              <Link href="/agent">
                <Button>Start Chatting</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and filter section */}
      <Card className="mb-6 bg-background border-none px-0">
        <CardContent className="pt-2 px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search field */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort dropdown */}
            <div>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="recent">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="enabled">Enabled First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show enabled only toggle */}
            <div className="flex items-center justify-end space-x-2">
              <Label htmlFor="enabled-filter" className="cursor-pointer">Show enabled only</Label>
              <Switch
                id="enabled-filter"
                checked={showEnabledOnly}
                onCheckedChange={setShowEnabledOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {filteredAndSortedTools.length !== tools.length && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredAndSortedTools.length} of {tools.length} tools
            </p>
          )}
        </div>

        {loading ? (
          <ToolsLoadingSkeleton />
        ) : (
          <>
            {filteredAndSortedTools.length === 0 ? (
              searchQuery || showEnabledOnly ? (
                <div className="text-center py-10 border rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No Matching Tools</h3>
                  <p className="text-muted-foreground mb-6">
                    No tools match your current filters.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setShowEnabledOnly(false);
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <EmptyToolsState />
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedTools.map(tool => (
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
      </div>
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