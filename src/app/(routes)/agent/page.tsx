"use client";

import useChatStore from "@/app/hooks/useChatStore";
import AgentProfile from "@/components/agent/agent-profile";
import AgentTools from "@/components/agent/agent-tools";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateUUID } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { MessageSquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CustomWalletButton } from "@/components/solana/customwalletbutton";

export default function AgentPage() {
  const [activeTab, setActiveTab] = useState("tools");
  const { publicKey } = useWallet();
  const router = useRouter();

  // Récupérer les fonctions et les données du store
  const chats = useChatStore((state) => state.chats);
  const saveMessages = useChatStore((state) => state.saveMessages);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);

  // Générer un ID stable pour une nouvelle conversation si nécessaire
  const newChatId = useMemo(() => generateUUID(), []);

  // Écouter les changements d'onglet et naviguer automatiquement vers le chat si sélectionné
  useEffect(() => {
    if (activeTab === "chat" && publicKey) {
      // Vérifier s'il y a des conversations existantes
      const chatEntries = Object.entries(chats);

      if (chatEntries.length > 0) {
        // Trier les conversations par date (la plus récente en premier)
        const sortedChats = chatEntries.sort(([, a], [, b]) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Récupérer l'ID de la conversation la plus récente
        const [mostRecentChatId] = sortedChats[0];

        // Définir comme conversation active et rediriger
        setCurrentChatId(mostRecentChatId);
        router.push(`/agent/c/${mostRecentChatId}`);
      } else {
        // Aucune conversation existante, en créer une nouvelle
        saveMessages(newChatId, []);
        setCurrentChatId(newChatId);
        router.push(`/agent/c/${newChatId}`);
      }
    }
  }, [activeTab, publicKey, chats, newChatId, router, saveMessages, setCurrentChatId]);

  if (!publicKey) {
    return (
      <div className="w-full py-6 px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Agent</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to access your agent.
          </p>
          <div className="mt-6">
            <CustomWalletButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with tabs and wallet */}
      <div className="w-full border-b flex justify-between items-center px-4 py-2 sticky top-0 z-10 bg-background">
        <Tabs
          defaultValue="tools"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-md h-full "
        >
          <TabsList className="h-full grid  grid-cols-2 w-72">
            <TabsTrigger value="tools" className="h-full flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex h-full items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="hide md:block" >
          <CustomWalletButton />
        </div>
      </div>

      {/* Content - Ne montrer que l'onglet outils car l'onglet chat va rediriger */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 h-full overflow-y-auto">
          <AgentProfile walletAddress={publicKey.toString()} />
          <AgentTools walletAddress={publicKey.toString()} />
        </div>
      </div>
    </div>
  );
}