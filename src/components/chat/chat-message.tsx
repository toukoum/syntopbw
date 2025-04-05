// src/components/chat/chat-message.tsx
import { memo, useState } from "react";
import { CheckIcon, CopyIcon, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { ChatRequestOptions } from "ai";
import { Message } from "ai/react";
import { toast } from "sonner";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToolManager } from "@/components/chat/tools";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

// Constants for animations
const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, ease: "easeInOut" },
};

export type ChatMessageProps = {
  message: Message;
  isLast: boolean;
  isLoading: boolean | undefined;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
};

function ButtonWithTooltip({
  children,
  toolTipText,
  side = "top",
}: {
  children: React.ReactNode;
  toolTipText: string;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          className="text-xs font-normal"
          sideOffset={8}
        >
          {toolTipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ChatMessage({ message, isLast, isLoading, reload, addToolResult }: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Hooks pour l'outil copyportfolio (déplacés au niveau supérieur)
  const [isSwapProcessing, setIsSwapProcessing] = useState(false);
  const [isSwapCompleted, setIsSwapCompleted] = useState(false);

  const handleConfirmSwap = async () => {
    setIsSwapProcessing(true);
    // Simuler un traitement
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSwapProcessing(false);
    setIsSwapCompleted(true);
  };

  const handleCopy = () => {
    const textToCopy = message.content?.trim() || '';
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const renderTextContent = (text: string) => {
    return (
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Wrapper div pour remplacer l'attribut className sur Markdown
          root: ({ children }) => (
            <div className="prose prose-invert max-w-none break-words prose-p:leading-relaxed prose-pre:p-0">
              {children}
            </div>
          ),
          pre({ children }) {
            return <>{children}</>;
          },
          code({ children, className, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            if (!children || typeof children !== "string") {
              return <code className={className} {...props} />;
            }

            // If it's inline code (no language specified)
            if (!language) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm">
                  {children}
                </code>
              );
            }

            return (
              <div className="rounded-md overflow-hidden my-2 bg-[#1E1E1E] text-[#D4D4D4]">
                <div className="flex items-center justify-between py-2 px-4 bg-card/50">
                  <span className="text-xs text-muted-foreground">{language}</span>
                  <ButtonWithTooltip toolTipText="Copy code">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(String(children));
                        toast.success("Code copied to clipboard");
                      }}
                    >
                      <CopyIcon className="h-3.5 w-3.5" />
                    </Button>
                  </ButtonWithTooltip>
                </div>
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: "1rem" }}
                  showLineNumbers
                >
                  {String(children).trim()}
                </SyntaxHighlighter>
              </div>
            );
          },
        }}
      >
        {text}
      </Markdown>
    );
  };

  const renderToolResult = (toolInvocation: any) => {
    const { toolName } = toolInvocation;
    const resultStr = toolInvocation.result || "{}";
    let result;

    try {
      result = JSON.parse(resultStr);
    } catch (e) {
      result = { success: false, error: "Failed to parse result" };
    }

    console.log("Tool result:", toolName, result);

    // Vérifier si c'est un résultat de copyportfolio
    if (toolName.toLowerCase() === 'copyportfolio' && result.success) {
      console.log("Rendu copyportfolio avec les données:", result);

      const researchData = result.data?.research || {};
      const swapsData = result.data?.swaps || {};

      return (
        <div className="my-2 rounded-xl border border-border bg-card p-4 overflow-hidden">
          {/* Message de recherche et traitement */}
          <div className="mb-3 text-xs text-muted-foreground">
            <span className="font-medium text-primary">Research summary:</span> Analyzed {researchData.analyzed_tweets || '100+'} tweets from @{result.data?.username}
            with {(researchData.confidence_score * 100).toFixed(0) || '85'}% confidence score.
            Completed in {(researchData.scrape_time_ms / 1000).toFixed(2) || '2.34'}s.
          </div>

          {/* Afficher l'image du tweet */}
          <img
            src="/synto/tweetmusk.png"
            alt="Tweet de @toukoum"
            className="w-full rounded-lg mb-4"
            style={{ maxWidth: "550px" }}
          />

          {/* Section de confirmation des swaps */}
          {!isSwapCompleted ? (
            <div className="mt-3 pt-3 border-t">
              <div className="flex flex-col gap-3">
                <h5 className="text-sm font-medium">Proposed transactions:</h5>
                <div className="space-y-1 mb-3">
                  {swapsData.transactions?.map((swap: any, index: number) => (
                    <div key={index} className="text-xs flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                      <span>
                        {swap.from} → {swap.to}: {swap.amount}
                        <span className="text-muted-foreground ml-1">(est. gas: {swapsData.estimated_gas} ETH)</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {isSwapProcessing ? (
                    <Button variant="default" className="w-full" disabled>
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing transactions...
                      </span>
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={handleConfirmSwap}
                    >
                      Confirm Transactions
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Quote expires in 5 minutes. Transactions will be executed on Testnet.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 mb-3 text-sm text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Transactions completed successfully</span>
              </div>
              <div className="space-y-1">
                {swapsData.transactions?.map((swap: any, index: number) => (
                  <div key={index} className="text-xs flex items-center justify-between">
                    <span>
                      {swap.from} → {swap.to}: {swap.amount}
                    </span>
                    <span className="text-green-500">Confirmed</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null; // Laisser le composant ToolManager gérer les autres types de résultats
  };

  const renderParts = () => {
    return message.parts?.map((part, index) => {
      switch (part.type) {
        case "text":
          return (
            <div key={index}>
              {renderTextContent(part.text)}
            </div>
          );
        case "tool-invocation":
          // Vérifier si l'outil a un résultat et si c'est un copyportfolio
          if (part.toolInvocation?.state === 'result' &&
              part.toolInvocation?.toolName?.toLowerCase() === 'copyportfolio') {
            // Utiliser notre rendu personnalisé pour copyportfolio
            const customResult = renderToolResult(part.toolInvocation);
            if (customResult) {
              return <div key={`tool-${index}`}>{customResult}</div>;
            }
          }
          // Sinon, utiliser le composant ToolManager standard
          return (
            <ToolManager
              key={`tool-${index}`}
              toolInvocation={part.toolInvocation as any}
              addToolResult={addToolResult}
            />
          );
        default:
          return null;
      }
    });
  };

  const renderActionButtons = () =>
    message.role === "assistant" && (
      <div className="pt-4 flex gap-1 items-center text-muted-foreground">
        {!isLoading && (
          <ButtonWithTooltip side="bottom" toolTipText="Copy">
            <Button onClick={handleCopy} variant="ghost" size="icon" className="h-4 w-4">
              {isCopied ? (
                <CheckIcon className="w-3.5 h-3.5 transition-all" />
              ) : (
                <CopyIcon className="w-3.5 h-3.5 transition-all" />
              )}
            </Button>
          </ButtonWithTooltip>
        )}
        {!isLoading && isLast && (
          <ButtonWithTooltip side="bottom" toolTipText="Regenerate">
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={() => reload()}
            >
              <RefreshCcw className="w-3.5 h-3.5 scale-100 transition-all" />
            </Button>
          </ButtonWithTooltip>
        )}
      </div>
    );

  // If the message has no content and no parts, don't render anything
  if (!message.content && (!message.parts || message.parts.length === 0)) {
    return null;
  }

  return (
    <motion.div {...MOTION_CONFIG} className="flex flex-col gap-2 whitespace-pre-wrap">
      <ChatBubble variant={message.role === "user" ? "sent" : "received"}>
        {message.role === "assistant" && (
          <ChatBubbleAvatar
            src="/synto/agentProfilePbw.png"
            width={20}
            height={20}
            className="object-contain"
          />
        )}
        <ChatBubbleMessage>
          {/* Render content directly if no parts exist */}
          {!message.parts && message.content && renderTextContent(message.content)}

          {/* Render parts if they exist */}
          {message.parts && renderParts()}

          {/* Action buttons */}
          {renderActionButtons()}
        </ChatBubbleMessage>
      </ChatBubble>
    </motion.div>
  );
}

export default memo(
  ChatMessage,
  (prevProps, nextProps) => {
    if (nextProps.isLast) return false;
    return (
      prevProps.isLast === nextProps.isLast &&
      prevProps.message === nextProps.message
    );
  }
);