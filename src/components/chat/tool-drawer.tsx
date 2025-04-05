"use client";

import { fetchToolsForDrawer, updateToolStatus } from "@/app/actions/tools";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PlugZap, Search, Settings, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Tool {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  enabled?: boolean;
  isDefault?: boolean;
  parameters: {
    params: {
      name: string;
      type: string;
      required: boolean;
    }[];
  };
  createdAt: string;
  creator: {
    id: string;
    name: string;
    walletAddress: string;
  };
}

interface ToolsDrawerProps {
  walletAddress: string;
}

export function ToolsDrawer({ walletAddress }: ToolsDrawerProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Filter tools when search query changes
    if (searchQuery.trim() === "") {
      setFilteredTools(tools);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTools(
        tools.filter(
          (tool) =>
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, tools]);

  useEffect(() => {
    const loadTools = async () => {
      if (!open) return;

      try {
        setLoading(true);
        const fetchedTools = await fetchToolsForDrawer(walletAddress);

        // Ensure there are no duplicate tools by using a Map with tool.id as key
        const uniqueTools = Array.from(
          new Map(fetchedTools.map(tool => [tool.id, { ...tool, image: tool.image || "" }])).values()
        ) as Tool[];

        setTools(uniqueTools);
        setFilteredTools(uniqueTools);
      } catch (error) {
        console.error("Error loading tools:", error);
        toast.error("Failed to load tools");
      } finally {
        setLoading(false);
      }
    };

    if (open && walletAddress) {
      loadTools();
    }
  }, [open, walletAddress]);

  const handleToggle = async (id: string, checked: boolean) => {
    try {
      // Optimistically update UI
      setTools(tools.map(tool =>
        tool.id === id ? { ...tool, enabled: checked } : tool
      ));
      setFilteredTools(filteredTools.map(tool =>
        tool.id === id ? { ...tool, enabled: checked } : tool
      ));

      // Update in database
      const result = await updateToolStatus(id, checked);

      if (!result.success) {
        // Revert if failed
        setTools(tools);
        setFilteredTools(filteredTools);
        toast.error("Failed to update tool status");
      }
    } catch (error) {
      console.error(`Error updating tool ${id}:`, error);
      // Revert on error
      setTools(tools);
      setFilteredTools(filteredTools);
      toast.error("Failed to update tool status");
    }
  };

  const enabledToolsCount = tools.filter(tool => tool.enabled).length;
  const totalToolsCount = tools.length;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full flex items-center justify-center relative"
        >
          <PlugZap className="h-5 w-5" />
          {enabledToolsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {enabledToolsCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerPortal>
        <DrawerOverlay className="fixed inset-0 bg-black/40 z-40" />
        <DrawerContent className="bg-background flex flex-col rounded-t-[10px] h-[80%] fixed bottom-0 left-0 right-0 z-50 outline-none">

          {/* Header section - with max-width container */}
          <div className="px-4 py-4 w-full max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Agent Tools</h2>
              <Badge variant="outline">
                {enabledToolsCount}/{totalToolsCount} Enabled
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Manage which tools your agent can use in this conversation
            </p>

            {/* Search input */}
            <div className="relative mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Scrollable content - with max-width container for the content but not for the scroll area */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <div className="w-full max-w-3xl mx-auto p-4">
              {loading ? (
                <div className="py-4 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={`loading-${i}`} className="h-24 bg-muted rounded-md animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTools.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No tools match your search" : "No tools available"}
                    </div>
                  ) : (
                    filteredTools.map(tool => (
                      <ToolItem
                        key={tool.id}
                        tool={tool}
                        onToggle={(checked) => handleToggle(tool.id, checked)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}

function ToolItem({ tool, onToggle }: { tool: Tool; onToggle: (checked: boolean) => void }) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`border rounded-md p-3 ${tool.enabled ? 'bg-card' : 'bg-muted/30 border-muted text-muted-foreground'}`}>
      <div className="flex items-center gap-3">
        <Avatar className={`h-10 w-10 ${!tool.enabled ? 'opacity-60' : ''}`}>
          <AvatarImage src={tool.image || "/tool-avatars/default.jpeg"} alt={tool.name} />
          <AvatarFallback>{getInitials(tool.name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-medium ${!tool.enabled ? 'text-muted-foreground' : ''}`}>
              {tool.name}
            </h3>
            {tool.isDefault && (
              <Badge variant="outline" className="bg-background/80 text-xs font-normal">
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                Default
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="text-xs font-normal"
            >
              {tool.category}
            </Badge>
          </div>
          <p className={`text-xs mt-1 line-clamp-2 ${!tool.enabled ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
            {tool.description}
          </p>
        </div>

        <Switch
          checked={tool.enabled ?? false}
          onCheckedChange={onToggle}
          aria-label={`Enable ${tool.name}`}
        />
      </div>

      {tool.parameters.params.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 pl-[52px]">
          {tool.parameters.params.slice(0, 3).map((param, idx) => (
            <Badge key={`param-${tool.id}-${idx}`} variant="outline" className="text-[10px] px-1.5 py-0">
              {param.name}
            </Badge>
          ))}
          {tool.parameters.params.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{tool.parameters.params.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}