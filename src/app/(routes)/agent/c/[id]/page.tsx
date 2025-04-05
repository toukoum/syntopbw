"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChatLayout } from "@/components/chat/chat-layout";
import useChatStore from "@/app/hooks/useChatStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Sparkles } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConversationPage({ params }: { params: { id: string } }) {
  const { publicKey } = useWallet();
  const id = params.id;
  const router = useRouter();
  
  const getChatById = useChatStore((state) => state.getChatById);
  const saveMessages = useChatStore((state) => state.saveMessages);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);
  
  // Vérifier si la conversation existe, sinon la créer
  const chat = getChatById(id);

  // Définir l'ID de chat actuel et créer un chat vide si nécessaire
  useEffect(() => {
    setCurrentChatId(id);
    
    // Si le chat n'existe pas encore, créer une entrée vide
    if (!chat) {
      saveMessages(id, []);
    }
  }, [id, chat, setCurrentChatId, saveMessages]);

  if (!publicKey) {
    return (
      <div className="w-full py-6 px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Chat with Agent</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to chat with the agent.
          </p>
          <div className="mt-6">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with tabs and wallet */}
      <div className="w-full border-b flex justify-between items-center px-4 py-2 sticky top-0 z-10 bg-background">
        <Tabs defaultValue="chat" className="w-full max-w-md">
          <TabsList className="grid grid-cols-2 w-72">
            <TabsTrigger value="tools" className="flex items-center gap-2" asChild>
              <Link href="/agent">
                <Sparkles className="h-4 w-4" />
                Agent
              </Link>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <WalletMultiButton />
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden h-[calc(100vh-110px)]">
        <ChatLayout
          key={id}
          id={id}
          initialMessages={chat?.messages || []}
        />
      </div>
    </div>
  );
}