"use client";

import useChatStore from "@/app/hooks/useChatStore";
import { executeToolCall } from "@/components/chat/tools/ToolExecutor"; // Import the tool executor
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
    // Just delegate to our extracted tool executor
    onToolCall: async (tool) => {
      return executeToolCall(tool, userWalletAddress);
    },
  });

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const saveMessages = useChatStore((state) => state.saveMessages);
  const getMessagesById = useChatStore((state) => state.getMessagesById);
  const isLocal = useChatStore((state) => state.isLocal);
  const router = useRouter();

  let isNewChat = messages.length === 0;

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
      <div className="sticky top-0">
        <ChatTopbar
          isLoading={isLoading}
          chatId={id}
          messages={messages}
          setMessages={setMessages}
          isNewChat={isNewChat}
        />
      </div>

      {isNewChat ? (
        <div className="flex flex-col h-full w-full items-center justify-center md:p-6 md:max-w-5xl mx-auto">
          <div className="w-full flex flex-col items-center mb-8">
            <div className="relative">
              <div className="absolute -z-10 inset-0 rounded-full bg-primary/10 blur-3xl opacity-20 animate-pulse"></div>
              <Image
                src="/synto/agentProfilePbw.png"
                alt="Agent"
                width={120}
                height={120}
                className="w-24  rounded-full shadow-xl object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold mt-6 mb-2">Synto Agent</h2>
          </div>

          <div className="w-full md:px-12 max-w-3xl mx-auto">
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

          <div className="mt-10 w-full overflow-y-auto overflow-visible hidden md:block">
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
          <div className="w-full max-w-3xl mx-auto ">
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