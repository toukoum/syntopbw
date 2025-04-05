"use client";

import useChatStore from "@/app/hooks/useChatStore";
import { useChat } from "@ai-sdk/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChatRequestOptions, generateId } from "ai";
import { Message } from "ai/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { toast } from "sonner";
import CardList from "./CardList";
import ChatBottombar from "./chat-bottombar";
import ChatList from "./chat-list";
import ChatTopbar from "./chat-topbar";

export interface ChatProps {
  id: string;
  initialMessages: Message[] | [];
}

export default function Chat({ initialMessages, id }: ChatProps) {
  const { publicKey } = useWallet();
  const userWalletAddress = publicKey?.toString();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
    addToolResult
  } = useChat({
    id,
    initialMessages,
    maxSteps: 5, // Enable multi-step tool usage
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onFinish: (message) => {
      const savedMessages = getMessagesById(id);
      saveMessages(id, [...savedMessages, message]);
      setLoadingSubmit(false);
      router.replace(`/agent/c/${id}`);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      console.error("Chat error:", error.message, error.cause);
      toast.error(`Error: ${error.message}`);
    },
    onToolCall: async (tool) => {
      const toolName = tool.toolCall.toolName;
      const args = tool.toolCall.args;
      console.log('Tool call:', toolName, args);

      // Exécuter tous les outils non-wallet directement ici
      if (!['send', 'swap', 'bridge', 'stake', 'convert'].includes(toolName.toLowerCase())) {
        try {
          console.log(`Executing non-wallet tool: ${toolName}`);

          // Vérifier si l'utilisateur a un portefeuille connecté pour les outils qui en ont besoin
          if (['addcontact', 'getcontact'].includes(toolName.toLowerCase()) && !userWalletAddress) {
            throw new Error("Wallet connection required to manage contacts");
          }

          // Exécuter différents outils en fonction du nom
          switch (toolName.toLowerCase()) {
            case 'getweather':
              // Simuler une API météo
              await new Promise(resolve => setTimeout(resolve, 1000));
              return JSON.stringify({
                success: true,
                data: {
                  location: args.city,
                  temperature: Math.floor(Math.random() * 30) + 5,
                  condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
                  humidity: Math.floor(Math.random() * 100),
                  wind: Math.floor(Math.random() * 30),
                },
                message: `Weather information for ${args.city}`
              });

            case 'getlocation':
              // Simuler une API de localisation
              await new Promise(resolve => setTimeout(resolve, 800));
              return JSON.stringify({
                success: true,
                data: {
                  city: ['New York', 'London', 'Tokyo', 'Paris'][Math.floor(Math.random() * 4)],
                  country: ['USA', 'UK', 'Japan', 'France'][Math.floor(Math.random() * 4)],
                },
                message: 'Location determined successfully'
              });

            case 'addcontact':
              // Appeler l'API pour ajouter un contact
              console.log(`Executing addContact tool for: ${args.name}`);
              const addContactResponse = await fetch('/api/contacts/add', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userWalletAddress,
                  contactName: args.name,
                  contactWalletAddress: args.address
                }),
              });

              const addContactData = await addContactResponse.json();

              if (!addContactResponse.ok) {
                throw new Error(addContactData.error || 'Failed to add contact');
              }

              return JSON.stringify(addContactData);

            case 'getcontact':
              // Appeler l'API pour obtenir un contact
              console.log(`Executing getContact tool for: ${args.name}`);
              const getContactResponse = await fetch(`/api/contacts/get?userWalletAddress=${encodeURIComponent(userWalletAddress || '')}&contactName=${encodeURIComponent(args.name)}`);

              const getContactData = await getContactResponse.json();

              if (!getContactResponse.ok) {
                // Not found is handled as a result with success: false
                if (getContactResponse.status === 404) {
                  return JSON.stringify({
                    success: false,
                    data: null,
                    error: `Contact '${args.name}' not found`,
                    message: `No contact found with name ${args.name}`
                  });
                }

                throw new Error(getContactData.error || 'Failed to get contact');
              }

              return JSON.stringify(getContactData);

            case 'visualizedata':
            case 'generatechart':
              // Simuler une visualisation de données
              await new Promise(resolve => setTimeout(resolve, 1000));
              return JSON.stringify({
                success: true,
                data: {
                  chartType: args.type || 'bar',
                  dataPoints: 8,
                  url: 'https://example.com/chart',
                },
                message: 'Chart generated successfully'
              });

            default:
              // Traitement générique pour d'autres outils non-wallet
              console.log(`Executing generic tool: ${toolName}`);
              await new Promise(resolve => setTimeout(resolve, 500));
              return JSON.stringify({
                success: true,
                data: { executed: true, timestamp: new Date().toISOString() },
                message: `Tool ${toolName} executed successfully`
              });
          }
        } catch (error: any) {
          console.error(`Error executing tool ${toolName}:`, error);
          return JSON.stringify({
            success: false,
            error: error.message || 'Tool execution failed'
          });
        }
      }

      // Pour les outils wallet, retourner null pour qu'ils soient gérés par le UI
      return null;
    },
  });

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const saveMessages = useChatStore((state) => state.saveMessages);
  const getMessagesById = useChatStore((state) => state.getMessagesById);
  const isLocal = useChatStore((state) => state.isLocal);
  const router = useRouter();

  // Check if any wallet tool is in progress
  const isToolInProgress = useCallback(() => {
    return messages.some(
      (m) =>
        m.role === 'assistant' &&
        m.parts?.some(
          (part) =>
            part.type === 'tool-invocation' &&
            part.toolInvocation?.state !== 'result'
        )
    );
  }, [messages]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && !window.location.pathname.includes(`/agent/c/${id}`)) {
      window.history.replaceState({}, "", `/agent/c/${id}`);
    }

    // Prevent submission if a tool is in progress
    if (isToolInProgress()) {
      toast.warning("Please complete the current action before continuing");
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
    };
    saveMessages(id, [...messages, userMessage]);

    setLoadingSubmit(true);

    const requestOptions: ChatRequestOptions = {
      body: {
        isLocal: isLocal,
      },
    };

    handleSubmit(e, requestOptions);
  };

  const removeLatestMessage = () => {
    const updatedMessages = messages.slice(0, -1);
    setMessages(updatedMessages);
    saveMessages(id, updatedMessages);
    return updatedMessages;
  };

  const handleStop = () => {
    stop();
    saveMessages(id, [...messages]);
    setLoadingSubmit(false);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="sticky top-0 z-10">
        <ChatTopbar
          isLoading={isLoading}
          chatId={id}
          messages={messages}
          setMessages={setMessages}
        />
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col h-full w-full items-center justify-center p-6 max-w-5xl mx-auto">
          <div className="w-full flex flex-col items-center mb-8">
            <div className="relative">
              <div className="absolute -z-10 inset-0 rounded-full bg-primary/10 blur-3xl opacity-20 animate-pulse"></div>
              <Image
                src="/synto/agentProfile.png"
                alt="Agent"
                width={120}
                height={120}
                className="w-24  rounded-full border-2 border-primary/20 shadow-xl object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold mt-6 mb-2">Synto Agent</h2>
          </div>

          <div className="w-full px-4 md:px-12 max-w-3xl mx-auto">
            <ChatBottombar
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              stop={handleStop}
              setInput={setInput}
              isToolInProgress={isToolInProgress()}
              isMiddle={true}
            />
          </div>

          <div className="mt-10 w-full">
            <CardList />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto">
            <ChatList
              messages={messages}
              isLoading={isLoading}
              loadingSubmit={loadingSubmit}
              reload={async () => {
                removeLatestMessage();

                const requestOptions: ChatRequestOptions = {
                  body: {
                    isLocal: isLocal,
                  },
                };

                setLoadingSubmit(true);
                return reload(requestOptions);
              }}
              addToolResult={addToolResult}
            />
          </div>
          <div className="w-full max-w-4xl mx-auto ">
            <ChatBottombar
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              stop={handleStop}
              setInput={setInput}
              isToolInProgress={isToolInProgress()}
              isMiddle={false}
            />
          </div>
        </>
      )}
    </div>
  );
}