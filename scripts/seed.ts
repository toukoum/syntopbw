const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Créer les utilisateurs
  const toukoum = await prisma.user.create({
    data: {
      walletAddress: '9FgUdh5qsMNNqKmVTe957GJBeCfg2WjzF4xUVCWHDHF4',
      name: 'Toukoum',
      avatar: '/user-avatars/toukoum.png',
    },
  });

  const loul = await prisma.user.create({
    data: {
      walletAddress: 'BipPiy6YiJF3cFqKVRXuZvVsMeJsoWYrGYJxYxKc3GEU',
      name: 'loul',
      avatar: '/user-avatars/loul.png',
    },
  });


  const sendTool = await prisma.tool.create({
    data: {
      name: 'Send SOL',
      description: 'Instantly transfer SOL to any Solana wallet address with a seamless one-click experience. No confirmation dialogs, just fast and efficient transactions on Solana Devnet.',
      category: 'Finance',
      image: '/tool-avatars/1.jpeg',
      isDefault: true,
      enabled: true,
      published: true,
      parameters: {
        create: [
          {
            name: 'to',
            type: 'string',
            description: 'Recipient SOL address (32-44 characters)',
            required: true
          },
          {
            name: 'amount',
            type: 'number',
            description: 'Amount of SOL to send',
            required: true
          }
        ]
      },
      creatorId: toukoum.id,
      attributes: {
        create: [
          {
            traitType: 'Tool Type',
            value: 'Transaction',
          },
          {
            traitType: 'Execution Type',
            value: 'Direct',
          },
          {
            traitType: 'Network',
            value: 'Devnet',
          }
        ]
      }
    },
    include: {
      parameters: true,
      attributes: true
    }
  });

  // SWAP TOOL
  const swapTool = await prisma.tool.create({
    data: {
      name: 'Swap SOL to USDC',
      description: 'Instantly convert your SOL to USDC at competitive market rates. This tool executes swaps immediately without confirmation prompts, providing a streamlined trading experience.',
      category: 'Finance',
      image: '/tool-avatars/2.jpeg',
      isDefault: true,
      enabled: true,
      published: true,
      parameters: {
        create: [
          {
            name: 'amount',
            type: 'number',
            description: 'Amount of SOL to swap to USDC',
            required: true
          }
        ]
      },
      creatorId: toukoum.id,
      attributes: {
        create: [
          {
            traitType: 'Tool Type',
            value: 'Exchange',
          },
          {
            traitType: 'Execution Type',
            value: 'Direct',
          },
          {
            traitType: 'Network',
            value: 'Devnet',
          }
        ]
      }
    },
    include: {
      parameters: true,
      attributes: true
    }
  });

  // GET LOCATION TOOL
  const locationTool = await prisma.tool.create({
    data: {
      name: 'Location Generator',
      description: 'Generate a random city location for inspiration, travel planning, or creative projects. This tool provides diverse global locations to spark your imagination.',
      category: 'Utility',
      image: '/tool-avatars/3.jpeg',
      isDefault: true,
      enabled: true,
      published: true,
      parameters: {
        create: [] // No parameters required
      },
      creatorId: toukoum.id,
      attributes: {
        create: [
          {
            traitType: 'Tool Type',
            value: 'Generator',
          },
          {
            traitType: 'Confirmation Required',
            value: 'Yes',
          }
        ]
      }
    },
    include: {
      parameters: true,
      attributes: true
    }
  });

  // WEATHER TOOL
  const weatherTool = await prisma.tool.create({
    data: {
      name: 'Weather Insights',
      description: 'Access real-time weather data for any city globally. Get accurate temperature, conditions, and forecasts to plan your day or trip with confidence.',
      category: 'Information',
      image: '/tool-avatars/4.jpeg',
      isDefault: true,
      enabled: true,
      published: true,
      parameters: {
        create: [
          {
            name: 'city',
            type: 'string',
            description: 'Name of the city to get weather for',
            required: true
          }
        ]
      },
      creatorId: toukoum.id,
      attributes: {
        create: [
          {
            traitType: 'Data Source',
            value: 'Real-time API',
          },
          {
            traitType: 'Update Frequency',
            value: 'Live',
          }
        ]
      }
    },
    include: {
      parameters: true,
      attributes: true
    }
  });

  // ADD CONTACT TOOL
  const addContactTool = await prisma.tool.create({
    data: {
      name: 'Contact Manager: Add',
      description: 'Save wallet addresses with friendly names to your personal contact directory. Simplify future transactions by creating an organized address book of your frequent recipients.',
      category: 'Organization',
      image: '/tool-avatars/5.jpeg',
      isDefault: true,
      enabled: true,
      published: true,
      parameters: {
        create: [
          {
            name: 'name',
            type: 'string',
            description: 'Name for the contact (minimum 3 characters)',
            required: true
          },
          {
            name: 'address',
            type: 'string',
            description: 'Solana wallet address of the contact (32-44 characters)',
            required: true
          }
        ]
      },
      creatorId: toukoum.id,
      attributes: {
        create: [
          {
            traitType: 'Storage',
            value: 'Persistent',
          },
          {
            traitType: 'Privacy',
            value: 'User-only',
          }
        ]
      }
    },
    include: {
      parameters: true,
      attributes: true
    }
  });

  // GET CONTACT TOOL
  const getContactTool = await prisma.tool.create({
    data: {
      name: 'Contact Manager: Lookup',
      description: 'Retrieve wallet addresses by contact name from your personal directory. Quickly access saved addresses without having to remember complex wallet strings.',
      category: 'Organization',
      image: '/tool-avatars/6.jpeg',
      isDefault: true,
      enabled: true,
      published: true,
      parameters: {
        create: [
          {
            name: 'name',
            type: 'string',
            description: 'Name of the contact to find (minimum 3 characters)',
            required: true
          }
        ]
      },
      creatorId: toukoum.id,
      attributes: {
        create: [
          {
            traitType: 'Response Type',
            value: 'Address',
          },
          {
            traitType: 'Privacy',
            value: 'User-only',
          }
        ]
      }
    },
    include: {
      parameters: true,
      attributes: true
    }
  });

  // Create your custom tools as well
  const nftMinter = await prisma.tool.create({
    data: {
      name: 'NFT Minter',
      description: 'Create and mint NFTs directly from the chat interface. Transform your ideas into blockchain assets with just a few parameters.',
      category: 'NFT',
      image: '/tool-avatars/7.jpeg',
      isDefault: false,
      enabled: true,
      published: true,
      parameters: {
        create: [
          { name: 'name', type: 'string', description: 'Name of the NFT', required: true },
          { name: 'description', type: 'string', description: 'Description of the NFT', required: true },
          { name: 'imageUrl', type: 'string', description: 'URL to the image', required: true }
        ]
      },
      creatorId: loul.id,
      attributes: {
        create: [
          {
            traitType: 'Number of parameters',
            value: '3',
          },
          {
            traitType: 'Execution code',
            value: 'async function execute({name, description, imageUrl}) { return `Minted NFT: ${name}`; }',
          },
          {
            traitType: 'price',
            value: '0.75',
          },
        ]
      },
    },
    include: {
      parameters: true,
      attributes: true
    }
  });

  // BALANCE CHECKER TOOL (additional default tool)
  const balanceTool = await prisma.tool.create({
    data: {
      name: 'Balance Checker',
      description: 'View your current SOL balance and token holdings at a glance. Stay informed about your wallet status without leaving the chat interface.',
      category: 'Finance',
      image: '/tool-avatars/8.jpeg',
      isDefault: true,
      enabled: true,
      published: true,
      parameters: {
        create: [] // No parameters required
      },
      creatorId: toukoum.id,
      attributes: {
        create: [
          {
            traitType: 'Tool Type',
            value: 'Information',
          },
          {
            traitType: 'Network',
            value: 'Devnet',
          }
        ]
      }
    },
    include: {
      parameters: true,
      attributes: true
    }
  });

  // TRANSACTION HISTORY TOOL (additional default tool)
  const txHistoryTool = await prisma.tool.create({
    data: {
      name: 'Transaction History',
      description: 'Access a detailed log of your recent transactions with filtering options. Keep track of your financial activity directly through the chat interface.',
      category: 'Finance',
      image: '/tool-avatars/9.jpeg',
      isDefault: true,
      enabled: true,
      published: true,
      parameters: {
        create: [
          {
            name: 'limit',
            type: 'number',
            description: 'Number of transactions to display (max 20)',
            required: false
          }
        ]
      },
      creatorId: toukoum.id,
      attributes: {
        create: [
          {
            traitType: 'Tool Type',
            value: 'History',
          },
          {
            traitType: 'Network',
            value: 'Devnet',
          }
        ]
      }
    },
    include: {
      parameters: true,
      attributes: true
    }
  });

  //// WALLET CONNECT TOOL (additional default tool)
  //const walletConnectTool = await prisma.tool.create({
  //  data: {
  //    name: 'Wallet Connect',
  //    description: 'Connect your Solana wallet to enable transactions and interactions with the blockchain. A secure gateway to unlock the full functionality of your agent.',
  //    category: 'System',
  //    image: '/tool-avatars/10.jpeg',
  //    isDefault: true,
  //    enabled: true,
  //    published: true,
  //    parameters: {
  //      create: [] // No parameters required
  //    },
  //    creatorId: toukoum.id,
  //    attributes: {
  //      create: [
  //        {
  //          traitType: 'Tool Type',
  //          value: 'System',
  //        },
  //        {
  //          traitType: 'Security',
  //          value: 'High',
  //        }
  //      ]
  //    }
  //  },
  //  include: {
  //    parameters: true,
  //    attributes: true
  //  }
  //});

  console.log('Default tools created successfully!');
  console.log('Custom tools created successfully!');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Erreur pendant le seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });