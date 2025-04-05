// src/components/chat/tools/ToolManager.tsx
import { memo } from 'react';
import ToolResultCard from './ToolResultCard';
import { ToolInvocation, isWalletTool } from './types';
import WalletConfirmation from './WalletConfirmation';

interface ToolManagerProps {
  toolInvocation: ToolInvocation;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
}

/**
 * ToolManager - gère les invocations d'outils dans l'interface de chat
 * Version simplifiée qui ne gère que:
 * 1. Les états partiels d'appel d'outil
 * 2. Les confirmations pour les outils wallet
 * 3. L'affichage des résultats des outils
 */
function ToolManager({ toolInvocation, addToolResult }: ToolManagerProps) {
  const { toolCallId, toolName, state, result, args } = toolInvocation;

  // Pour l'état d'appel partiel (préparation de l'outil)
  if (state === "partial-call") {
    return (
      <div className="text-muted-foreground mt-2">
        <p className="text-sm">Preparing to run {toolName}...</p>
      </div>
    );
  }

  // Pour l'état d'appel complet (l'outil est prêt à être exécuté)
  if (state === "call") {
    // Seuls les outils wallet nécessitent une confirmation utilisateur
    if (isWalletTool(toolName)) {
      return (
        <WalletConfirmation
          toolCallId={toolCallId}
          toolName={toolName}
          args={args}
          addToolResult={addToolResult}
        />
      );
    }

    // Pour les outils non-wallet, afficher simplement un message de préparation
    // (l'exécution réelle est gérée dans onToolCall dans le composant Chat)
    return (
      <div className="text-muted-foreground px-4 py-3 bg-muted/30 my-2 rounded-md">
        <p className="text-sm">Executing {toolName}...</p>
      </div>
    );
  }

  // Pour l'état de résultat (l'outil a terminé)
  if (state === "result" && result) {
    // Analyser le résultat pour déterminer s'il s'agit d'un succès ou d'un échec
    let isSuccess = true;
    let errorMessage = '';

    try {
      if (typeof result === 'string') {
        const parsedResult = JSON.parse(result);
        isSuccess = parsedResult.success !== false;
        errorMessage = parsedResult.error || '';
      }
    } catch (e) {
      // Si le parsing échoue, vérifier si le résultat contient des mots-clés d'erreur
      isSuccess = !String(result).toLowerCase().includes('error') &&
        !String(result).toLowerCase().includes('fail');
    }

    return (
      <ToolResultCard
        toolName={toolName}
        result={typeof result === 'string' ? result : JSON.stringify(result)}
        success={isSuccess}
        error={errorMessage}
        action={toolName}
      />
    );
  }

  // Fallback pour tout autre état
  return null;
}

export default memo(ToolManager);