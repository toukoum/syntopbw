import { isWalletTool } from "./types";
// List of wallet tools that should be handled by UI
const WALLET_TOOLS = ['send', 'swap', 'bridge', 'stake', 'convert'];

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
  console.log('Tool call:', toolName, args);

  // Return null for wallet tools to be handled by UI
  if (isWalletTool(toolName)) {
    console.log(`Tool ${toolName} is a wallet tool, returning null for UI handling.`);
    return null;
  }

  try {
    console.log(`Executing non-wallet tool: ${toolName}`);

    // Check wallet connection for contact-related tools
    if (['addcontact', 'getcontact'].includes(toolName.toLowerCase()) && !userWalletAddress) {
      throw new Error("Wallet connection required to manage contacts");
    }

    // Execute different tools based on name
    switch (toolName.toLowerCase()) {
      case 'getweather':
        return handleWeatherTool(args);
      
      case 'getlocation':
        return handleLocationTool();
      
      case 'addcontact':
        return handleAddContactTool(args, userWalletAddress);
      
      case 'getcontact':
        return handleGetContactTool(args, userWalletAddress);
      
      case 'visualizedata':
      case 'generatechart':
        return handleVisualizationTool(args);
      
      default:
        return handleGenericTool(toolName);
    }
  } catch (error: any) {
    console.error(`Error executing tool ${toolName}:`, error);
    return JSON.stringify({
      success: false,
      error: error.message || 'Tool execution failed'
    });
  }
};

// Individual tool handlers
const handleWeatherTool = async (args: any): Promise<string> => {
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
};

const handleLocationTool = async (): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return JSON.stringify({
    success: true,
    data: {
      city: ['New York', 'London', 'Tokyo', 'Paris'][Math.floor(Math.random() * 4)],
      country: ['USA', 'UK', 'Japan', 'France'][Math.floor(Math.random() * 4)],
    },
    message: 'Location determined successfully'
  });
};

const handleAddContactTool = async (args: any, userWalletAddress?: string): Promise<string> => {
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
};

const handleGetContactTool = async (args: any, userWalletAddress?: string): Promise<string> => {
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
};

const handleVisualizationTool = async (args: any): Promise<string> => {
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
};

const handleGenericTool = async (toolName: string): Promise<string> => {
  console.log(`Executing generic tool: ${toolName}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.stringify({
    success: true,
    data: { executed: true, timestamp: new Date().toISOString() },
    message: `Tool ${toolName} executed successfully`
  });
};