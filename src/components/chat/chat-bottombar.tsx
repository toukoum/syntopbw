"use client";

import {
  StopIcon,
} from "@radix-ui/react-icons";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChatRequestOptions } from "ai";
import { AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import React, { useEffect } from "react";
import { ToolsDrawer } from "./tool-drawer";
import { Button } from "../ui/button";
import { ChatInput } from "../ui/chat/chat-input";

interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  setInput?: React.Dispatch<React.SetStateAction<string>>;
  input: string;
  isToolInProgress: boolean;
  isMiddle: boolean;
}

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  setInput,
  isToolInProgress,
  isMiddle,
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString() || "";

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      !isToolInProgress &&
      input.trim()
    ) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <div className="flex justify-between w-full items-center z-10 max-w-4xl">
      <AnimatePresence initial={false}>
        <form
          onSubmit={handleSubmit}
          className={`w-full items-center flex flex-col bg-accent rounded-lg ${!isMiddle ? ' shadow-white border-t' : 'shadow-2xl border-t w-full px-0'} `}
        >
          <ChatInput
            value={input}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name="message"
            placeholder={
              isToolInProgress
                ? "Tool is in progress..."
                : "Enter your prompt here"
            }
            className="resize-none border-none bg-accent dark:bg-background max-h-40 px-6 pt-6 shadow-none rounded-t-lg text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed"
            disabled={isToolInProgress}
          />

          <div className={`flex w-full items-center p-2 bg-accent dark:bg-background ${isMiddle ? 'rounded-b-lg' : ''}`}>
            {isLoading ? (
              <div className={`flex w-full justify-end ${!isMiddle ? 'p-4' : ''}`}>
                <div>
                  <Button
                    className="shrink-0 rounded-full"
                    variant="ghost"
                    size="icon"
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      stop();
                    }}
                  >
                    <StopIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`flex w-full justify-between items-center space-x-2 ${!isMiddle ? 'p-4' : ''}`}>
                {/* Tools Drawer button */}
                <div>
                  {walletAddress && <ToolsDrawer walletAddress={walletAddress} />}
                </div>

                <div>
                  {/* Send button */}
                  <Button
                    className="shrink-0 rounded-full"
                    size="icon"
                    type="submit"
                    disabled={
                      isLoading ||
                      !input.trim() ||
                      isToolInProgress
                    }
                  >
                    <ArrowUp className="w-6 h-6" strokeWidth={3} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </AnimatePresence>
    </div>
  );
}