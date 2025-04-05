//// utils/crypto.ts
//import { AnchorProvider, Program } from "@coral-xyz/anchor";
//import { PublicKey } from "@solana/web3.js";
//import { fetchAssetsByCollection } from "@metaplex-foundation/mpl-core";
//import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
//import { Connection } from "@solana/web3.js";
//import { Wallet } from "@solana/wallet-adapter-react";
//import { NFTAsset } from "@/types/nft";
import { SOL, tokenAddresses } from "@/components/constantes/tokenAddresses";
import { getAccount, getMint } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

//// Type for the MintPay program
//interface MintPay {
//  programId: PublicKey;
//  account: {
//    collection: {
//      fetch: (account: PublicKey) => Promise<any>;
//    };
//  };
//}

///**
// * Fetches NFT tools owned by a user from the blockchain
// */
//export async function fetchNFTTools(
//  connection: Connection,
//  wallet: Wallet,
//  publicKey: PublicKey,
//  idlMintPay: any
//): Promise<NFTAsset[]> {
//  if (!wallet) return [];

//  try {
//    const provider = new AnchorProvider(connection, wallet, {
//      commitment: "confirmed",
//    });

//    const program = new Program(idlMintPay as MintPay, provider);

//    const [collectionAccount] = PublicKey.findProgramAddressSync(
//      [Buffer.from("collection")],
//      program.programId
//    );

//    const collectionData = await program.account.collection.fetch(collectionAccount);
//    const collectionAddress = collectionData.collectionAddress;

//    const collection = await fetchAssetsByCollection(
//      createUmi(connection),
//      collectionAddress
//    );

//    // Filter assets owned by the current wallet
//    const ownedAssets = collection.filter(
//      asset => asset.owner === publicKey.toBase58()
//    );

//    // Format the assets to match NFTAsset type and fetch URI data
//    const formattedAssets = await Promise.all(
//      ownedAssets.map(async (asset) => {
//        try {
//          // Fetch metadata from URI
//          const response = await fetch(asset.uri);
//          const uriData = await response.json();

//          // Format to match NFTAsset type
//          return {
//            name: asset.name,
//            owner: asset.owner,
//            publicKey: asset.publicKey,
//            uri: asset.uri,
//            uriResult: {
//              name: uriData.name || asset.name,
//              description: uriData.description || "",
//              image: uriData.image || "",
//              attributes: uriData.attributes || [],
//              parameters: uriData.parameters || []
//            }
//          };
//        } catch (uriError) {
//          console.error(`Error fetching URI data for ${asset.name}:`, uriError);
//          // Return asset with empty uriResult if fetch fails
//          return {
//            name: asset.name,
//            owner: asset.owner,
//            publicKey: asset.publicKey,
//            uri: asset.uri,
//            uriResult: {
//              name: asset.name,
//              description: "",
//              image: "",
//              attributes: [],
//              parameters: []
//            }
//          };
//        }
//      })
//    );

//    return formattedAssets;
//  } catch (error) {
//    console.error('Error fetching NFT tools:', error);
//    return [];
//  }
//}

export async function BuildSwapInstruction(
  input: string,
  output: string,
  amount: number,
  userAddress: string
): Promise<string> {
  console.log({ amount });
  const quoteResponse = await (
    await fetch(
      `https://ultra-api.jup.ag/order?inputMint=${input}&outputMint=${output}&amount=${amount}&taker=${userAddress}`
    )
  ).json();

  return quoteResponse.transaction;
}

export async function QueryMintDecimals(
  connection: Connection,
  mintAddress: string
): Promise<number> {
  connection = new Connection(process.env.NEXT_PUBLIC_RPC ?? "");
  const { decimals } = await getMint(connection, new PublicKey(mintAddress));
  return decimals;
}

export async function FetchBalances(
  userAddress: PublicKey
): Promise<{ [key: string]: number }> {
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC ?? "");
  console.log("user address", userAddress);
  const accounts = await connection.getTokenAccountsByOwner(userAddress, {
    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  });

  const balanceMap: { [key: string]: number } = {};

  for (const balance of accounts.value) {
    const bal = await connection.getTokenAccountBalance(balance.pubkey);
    console.log("bal", bal);
    console.log("balance", balance.pubkey.toString());
    const { mint } = await getAccount(connection, balance.pubkey);
    console.log("mint", mint.toString());
    balanceMap[tokenAddresses.get(mint.toString()) ?? ""] =
      +bal.value.amount / 10 ** bal.value.decimals;
  }
  const solBalance = await connection.getBalance(userAddress);
  balanceMap[SOL] = solBalance / LAMPORTS_PER_SOL; // Convert to SOL
  return balanceMap;
}
