// utils/crypto.ts
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { fetchAssetsByCollection } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Connection } from "@solana/web3.js";
import { Wallet } from "@solana/wallet-adapter-react";
import { NFTAsset } from "@/types/nft";

// Type for the MintPay program
interface MintPay {
  programId: PublicKey;
  account: {
    collection: {
      fetch: (account: PublicKey) => Promise<any>;
    };
  };
}

/**
 * Fetches NFT tools owned by a user from the blockchain
 */
export async function fetchNFTTools(
  connection: Connection,
  wallet: Wallet,
  publicKey: PublicKey,
  idlMintPay: any
): Promise<NFTAsset[]> {
  if (!wallet) return [];

  try {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    
    const program = new Program(idlMintPay as MintPay, provider);
    
    const [collectionAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("collection")],
      program.programId
    );

    const collectionData = await program.account.collection.fetch(collectionAccount);
    const collectionAddress = collectionData.collectionAddress;
    
    const collection = await fetchAssetsByCollection(
      createUmi(connection), 
      collectionAddress
    );

    // Filter assets owned by the current wallet
    const ownedAssets = collection.filter(
      asset => asset.owner === publicKey.toBase58()
    );

    // Format the assets to match NFTAsset type and fetch URI data
    const formattedAssets = await Promise.all(
      ownedAssets.map(async (asset) => {
        try {
          // Fetch metadata from URI
          const response = await fetch(asset.uri);
          const uriData = await response.json();

          // Format to match NFTAsset type
          return {
            name: asset.name,
            owner: asset.owner,
            publicKey: asset.publicKey,
            uri: asset.uri,
            uriResult: {
              name: uriData.name || asset.name,
              description: uriData.description || "",
              image: uriData.image || "",
              attributes: uriData.attributes || [],
              parameters: uriData.parameters || []
            }
          };
        } catch (uriError) {
          console.error(`Error fetching URI data for ${asset.name}:`, uriError);
          // Return asset with empty uriResult if fetch fails
          return {
            name: asset.name,
            owner: asset.owner,
            publicKey: asset.publicKey,
            uri: asset.uri,
            uriResult: {
              name: asset.name,
              description: "",
              image: "",
              attributes: [],
              parameters: []
            }
          };
        }
      })
    );

    return formattedAssets;
  } catch (error) {
    console.error('Error fetching NFT tools:', error);
    return [];
  }
}