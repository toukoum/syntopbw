import { addressesToken } from "@/components/constantes/tokenAddresses";
import { FetchBalances } from "@/utils/crypto";
import { PublicKey } from "@solana/web3.js";
import { isWalletTool } from "./types";
// List of wallet tools that should be handled by UI

/**
 * Execute a tool call from the AI
 * @param tool The tool call from the AI
 * @param userWalletAddress The user's wallet address
 * @returns The result of the tool execution as a string, or null if it should be handled by the UI
 */
export const executeToolCall = async (
  tool: any,
  userWalletAddress?: string
): Promise<string | null> => {
  const toolName = tool.toolCall.toolName;
  const args = tool.toolCall.args;
  console.log("Tool call:", toolName, args);

  // Return null for wallet tools to be handled by UI
  if (isWalletTool(toolName)) {
    console.log(
      `Tool ${toolName} is a wallet tool, returning null for UI handling.`
    );
    return null;
  }

  try {
    console.log(`Executing non-wallet tool: ${toolName}`);

    // Check wallet connection for contact-related tools
    if (
      ["addcontact", "getcontact"].includes(toolName.toLowerCase()) &&
      !userWalletAddress
    ) {
      throw new Error("Wallet connection required to manage contacts");
    }

    // Execute different tools based on name
    switch (toolName.toLowerCase()) {
      case "checkportfolio":
        return handleBalancesTool(args, userWalletAddress);
      case "checkbalance":
        return handleBalanceTool(args, userWalletAddress);
      case "getweather":
        return handleWeatherTool(args);

      case "getlocation":
        return handleLocationTool();

      case "addcontact":
        return handleAddContactTool(args, userWalletAddress);

      case "getcontact":
        return handleGetContactTool(args, userWalletAddress);

      case "displayresults":
        return JSON.stringify({
          success: true,
          data: args,
          message: "Data visualization requested",
        });

      case "fetchtwitterdescription":
        return handleFetchTwitterDescriptionTool(args);

      default:
        return handleGenericTool(toolName);
    }
  } catch (error: any) {
    console.error(`Error executing tool ${toolName}:`, error);
    return JSON.stringify({
      success: false,
      error: error.message || "Tool execution failed",
    });
  }
};

// Individual tool handlers
const handleWeatherTool = async (args: any): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return JSON.stringify({
    success: true,
    data: {
      location: args.city,
      temperature: Math.floor(Math.random() * 30) + 5,
      condition: ["Sunny", "Cloudy", "Rainy", "Snowy"][
        Math.floor(Math.random() * 4)
      ],
      humidity: Math.floor(Math.random() * 100),
      wind: Math.floor(Math.random() * 30),
    },
    message: `Weather information for ${args.city}`,
  });
};

const handleLocationTool = async (): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return JSON.stringify({
    success: true,
    data: {
      city: ["New York", "London", "Tokyo", "Paris"][
        Math.floor(Math.random() * 4)
      ],
      country: ["USA", "UK", "Japan", "France"][Math.floor(Math.random() * 4)],
    },
    message: "Location determined successfully",
  });
};

const handleAddContactTool = async (
  args: any,
  userWalletAddress?: string
): Promise<string> => {
  console.log(`Executing addContact tool for: ${args.name}`);
  const addContactResponse = await fetch("/api/contacts/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userWalletAddress,
      contactName: args.name,
      contactWalletAddress: args.address,
    }),
  });

  const addContactData = await addContactResponse.json();

  if (!addContactResponse.ok) {
    throw new Error(addContactData.error || "Failed to add contact");
  }

  return JSON.stringify(addContactData);
};

const handleGetContactTool = async (
  args: any,
  userWalletAddress?: string
): Promise<string> => {
  console.log(`Executing getContact tool for: ${args.name}`);
  const getContactResponse = await fetch(
    `/api/contacts/get?userWalletAddress=${encodeURIComponent(
      userWalletAddress || ""
    )}&contactName=${encodeURIComponent(args.name)}`
  );

  const getContactData = await getContactResponse.json();

  if (!getContactResponse.ok) {
    // Not found is handled as a result with success: false
    if (getContactResponse.status === 404) {
      return JSON.stringify({
        success: false,
        data: null,
        error: `Contact '${args.name}' not found`,
        message: `No contact found with name ${args.name}`,
      });
    }

    throw new Error(getContactData.error || "Failed to get contact");
  }

  return JSON.stringify(getContactData);
};

const handleGenericTool = async (toolName: string): Promise<string> => {
  console.log(`Executing generic tool: ${toolName}`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return JSON.stringify({
    success: true,
    data: { executed: true, timestamp: new Date().toISOString() },
    message: `Tool ${toolName} executed successfully`,
  });
};

const handleFetchTwitterDescriptionTool = async (
  args: any
): Promise<string> => {
  console.log(`Executing fetchTwitterDescription tool for: ${args.username}`);
  return JSON.stringify({
    success: true,
    data: {
      content: `Week 6 – Quick Update
      
      Overall: -35% (BTC Benchmark: -13.3%)
      
      New Allocation:

      • 50% SOL
      • 50% BTC

      Still waiting for either a BTC retest of 68-70k or a Fed pivot

      No leverage. Vibecoding, reading, sports.

      Love you all 🧡`,
      executed: true,
      timestamp: new Date().toISOString(),
    },
    message: `Twitter description fetched successfully for ${args.username}`,
  });
};

const handleBalancesTool = async (
  args: any,
  userWalletAddress?: string
): Promise<string> => {
  console.log(`Executing checkPortfolio tool for: ${userWalletAddress}`);
  if (!userWalletAddress)
    return JSON.stringify({
      success: false,
      error: "Wallet address is required to check portfolio",
    });
  const balances = await FetchBalances(new PublicKey(userWalletAddress));
  return JSON.stringify({
    success: true,
    data: { balances },
    message: `Balances fetched successfully for ${args.address}`,
  });
};

const handleBalanceTool = async (
  args: any,
  userWalletAddress?: string
): Promise<string> => {
  console.log(`Executing checkPortfolio tool for: ${userWalletAddress}`);
  if (!userWalletAddress)
    return JSON.stringify({
      success: false,
      error: "Wallet address is required to check portfolio",
    });
  const balances = await FetchBalances(new PublicKey(userWalletAddress));
  console.log("Balances", balances[addressesToken.get(args.address) ?? ""]);
  return JSON.stringify({
    success: true,
    data: { balance: balances[addressesToken.get(args.address) ?? ""] },
    message: `Balance fetched successfully for ${args.address}`,
  });
};
