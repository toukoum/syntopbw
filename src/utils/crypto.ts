//// utils/crypto.ts
//import { AnchorProvider, Program } from "@coral-xyz/anchor";
//import { PublicKey } from "@solana/web3.js";
//import { fetchAssetsByCollection } from "@metaplex-foundation/mpl-core";
//import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
//import { Connection } from "@solana/web3.js";
//import { Wallet } from "@solana/wallet-adapter-react";
//import { NFTAsset } from "@/types/nft";
import { getMint, MintLayout } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

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
      // `https://api.jup.ag/swap/v1/quote?inputMint=${input}&outputMint=${output}&amount=${
      //   amount * LAMPORTS_PER_SOL
      // }&slippageBps=50&restrictIntermediateTokens=true`
    )
  ).json();

  return quoteResponse.transaction;
}

export async function QueryMintDecimals(
  connection: Connection,
  mintAddress: string
): Promise<number> {
  connection = new Connection(
    "https://stylish-blue-butterfly.solana-mainnet.quiknode.pro/a9f23e5699089b9232dca4ef43b088bc1e1ad0d4/"
  );
  console.log({ mintAddress });
  const { decimals } = await getMint(connection, new PublicKey(mintAddress));
  return decimals;
}
