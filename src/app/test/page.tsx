"use client";
import ConnectButton from "@/components/solana/connectButton";
import { useTemplates } from "@/components/template/fetchTemplates";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import idlSwapSynto from "@/../swapSynto/target/idl/swap_synto.json";
import { SwapSynto } from "@/../swapSynto/target/types/swap_synto";
import idlMintPay from "@/../mintPay/target/idl/mint_pay.json";
import { MintPay } from "@/../mintPay/target/types/mint_pay";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { fetchAssetsByCollection } from '@metaplex-foundation/mpl-core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
	TOKEN_PROGRAM_ID,
	getAssociatedTokenAddress
} from "@solana/spl-token";
import { clusterApiUrl } from "@solana/web3.js";
export default function Test() {
	const tokenMint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
	const owner = new PublicKey("JuijdHQrGSBo9MZ7CXppdBF4jKd9DbzpSLSGnrXHR7G");
	const { templates, checkTemplate } = useTemplates();
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();
	const wallet = useAnchorWallet();


	const fetchNftCollection = async () => {
		if (!wallet) return;

		
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
		const collection = await fetchAssetsByCollection(createUmi(connection), collectionAddress)
		
		console.log("Collection address depuis le programme:", collectionAddress.toBase58());
		console.log("Collection depuis le programme:", collection.filter(asset => asset.owner === publicKey?.toBase58()));
	}

	const sendSol = async () => {
		if (!publicKey) return;
		try {
			const transaction = new Transaction().add(
				SystemProgram.transfer({
					fromPubkey: publicKey,
					toPubkey: new PublicKey("E8fdgWzEcWh5EkXgXRHGFKEmYiXHXx8Tg9F2CCBvwRMX"),
					lamports: 0.02 * 1e9, // Convert SOL en lamports
				})
			);
			const signature = await sendTransaction(transaction, connection);
			console.log(`Transaction envoyée: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
		} catch (error) {
			console.error('Error sending SOL:', error);
		}
	}

	const init = async () => {
		if (!wallet) return;

		const provider = new AnchorProvider(connection, wallet, {
			commitment: "confirmed",
		});

		const program = new Program<SwapSynto>(idlSwapSynto as SwapSynto, provider);
		const [escrowPDA] = PublicKey.findProgramAddressSync(
			[Buffer.from("escrow"), wallet.publicKey.toBuffer()],
			program.programId
		);

		const tx = await program.methods.initialize()
			.accounts({
				escrow: escrowPDA,
			})
			.rpc();
		console.log("Transaction d'initialisation:", tx);
	};

	const deposit = async () => {
		if (!wallet) return;

		const provider = new AnchorProvider(connection, wallet, {
			commitment: "confirmed",
		});

		const program = new Program<SwapSynto>(idlSwapSynto as SwapSynto, provider);
		const [escrowPDA] = PublicKey.findProgramAddressSync(
			[Buffer.from("escrow"), wallet.publicKey.toBuffer()],
			program.programId
		);

		const userTokenAccount = await getAssociatedTokenAddress(
			tokenMint,
			wallet.publicKey,
			true
		);

		const vaultTokenAccount = await getAssociatedTokenAddress(
			tokenMint,
			escrowPDA,
			true
		);

		const tx = await program.methods.deposit(new BN(1000000000))
			.accounts({
				escrow: escrowPDA,
				userTokenAccount: userTokenAccount,
				vaultTokenAccount: vaultTokenAccount,
				tokenMint: tokenMint,
				tokenProgram: TOKEN_PROGRAM_ID
			})
			.rpc();
		console.log("Transaction de dépôt:", tx);
	};

	const swap = async () => {
		if (!wallet) return;

		const provider = new AnchorProvider(connection, wallet, {
			commitment: "confirmed",
		});

		const program = new Program<SwapSynto>(idlSwapSynto as SwapSynto, provider);
		const [escrowPDA] = PublicKey.findProgramAddressSync(
			[Buffer.from("escrow"), owner.toBuffer()],
			program.programId
		);

		const userTokenAccount = await getAssociatedTokenAddress(
			tokenMint,
			wallet.publicKey,
			true
		);

		const vaultTokenAccount = await getAssociatedTokenAddress(
			tokenMint,
			escrowPDA,
			true
		);

		const tx = await program.methods.swap(new BN(250000000))
			.accounts({
				escrow: escrowPDA,
				owner: owner,
				userTokenAccount: userTokenAccount,
				vaultTokenAccount: vaultTokenAccount,
				tokenMint: tokenMint,
				tokenProgram: TOKEN_PROGRAM_ID
			})
			.rpc();
		console.log("Transaction de swap:", tx);
	};

	return (
		<div className="p-8">
			<ConnectButton className='flex justify-end mt-4 mr-4' />
			<div className="mt-4 border-4 border-blue-500">
				<p>Template + send SOL</p>
				<button className="bg-blue-500 text-white px-4 py-2 rounded m-2" onClick={() => checkTemplate()}>Check Template</button>
				<button className="bg-blue-500 text-white px-4 py-2 rounded m-2" onClick={() => console.log(templates)}>Show Templates</button>
				<button className="bg-blue-500 text-white px-4 py-2 rounded m-2" onClick={() => sendSol()}>Send SOL</button>
			</div>
			<div className="mt-4 border-4 border-blue-500">
				<p>Swap</p>
				<button className="bg-blue-500 text-white px-4 py-2 rounded m-2" onClick={() => init()}>Initialize</button>
				<button className="bg-blue-500 text-white px-4 py-2 rounded m-2" onClick={() => deposit()}>Deposit</button>
				<button className="bg-blue-500 text-white px-4 py-2 rounded m-2" onClick={() => swap()}>Swap</button>
			</div>
			<div className="mt-4 border-4 border-blue-500">
				<p>Mint Pay</p>
				<button className="bg-blue-500 text-white px-4 py-2 rounded m-2" onClick={() => fetchNftCollection()}>Fetch NFT Collection</button>
			</div>
		</div>
	);
}
