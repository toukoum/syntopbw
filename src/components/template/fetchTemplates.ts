import { useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import idl from '@/../mintPay/target/idl/mint_pay.json';
import { MintPay } from '@/../mintPay/target/types/mint_pay';
import { Template, dataTemplate, uriResult } from '@/types/template';
import { Keypair, PublicKey } from '@solana/web3.js';
import { toast } from "sonner";

export const useTemplates = () => {
	const [templates, setTemplates] = useState<Template[]>([]);
	const wallet = useAnchorWallet();
	const { connection } = useConnection();

	const fetchUri = async (uri: string): Promise<uriResult> => {
		const response = await fetch(uri);
		const data = await response.json();
		return data;
	};

	const checkTemplate = async () => {
		if (!wallet) return [];

		const provider = new AnchorProvider(connection, wallet, {
			commitment: "confirmed",
		});

		const program = new Program<MintPay>(idl as MintPay, provider);

		// Vider les templates existants
		setTemplates([]);

		// Créer un tableau temporaire pour stocker les templates
		const tempTemplates: Template[] = [];

		const data = await program.account.template.all();

		// Utiliser Promise.all pour attendre que tous les templates soient chargés
		await Promise.all(data.map(async (template: any) => {
			const templateData = await fetchUri(template.account.uri);
			const newTemplate: Template = {
				pubKeyTemplate: template.publicKey.toString(),
				name: templateData.name,
				description: templateData.description,
				image: templateData.image,
				attributes: templateData.attributes,
				parameters: templateData.parameters,
				creator: template.account.creator.toString(),
				price: template.account.price.toString()
			};
			tempTemplates.push(newTemplate);
		}));

		// Mettre à jour l'état avec tous les templates chargés
		setTemplates(tempTemplates);

		// Retourner les templates pour un usage externe
		return tempTemplates;
	};

	const getTemplate = async (pubKeyTemplate: string) => {
		if (!wallet) return;

		const provider = new AnchorProvider(connection, wallet, {
			commitment: "confirmed",
		});

		const program = new Program<MintPay>(idl as MintPay, provider);

		const data = await program.account.template.fetch(new PublicKey(pubKeyTemplate));
		const templateData = await fetchUri(data.uri);
		const template: Template = {
			pubKeyTemplate: pubKeyTemplate,
			name: templateData.name,
			description: templateData.description,
			image: templateData.image,
			attributes: templateData.attributes,
			parameters: templateData.parameters,
			creator: data.creator.toString(),
			price: data.price.toString()
		};
		return template;
	};

	const getAdmin = (): PublicKey => {
		if (!wallet) throw new Error("Program not initialized");;

		const provider = new AnchorProvider(connection, wallet, {
			commitment: "confirmed",
		});

		const program = new Program<MintPay>(idl as MintPay, provider);

		const [admin] = PublicKey.findProgramAddressSync(
			[Buffer.from("admin")],
			program.programId
		);
		console.log("Admin address:", admin.toBase58());
		return admin;
	}

	const mintAsset = async (nameTemplate: string, creatorAsset: string) => {
		if (!wallet) return;

		const provider = new AnchorProvider(connection, wallet, {
			commitment: "confirmed",
		});

		const program = new Program(idl as MintPay, provider);

		try {
			const asset = Keypair.generate();
			const [collectionAccount] = PublicKey.findProgramAddressSync(
				[Buffer.from("collection")],
				program.programId
			);

			const [templatePda] = PublicKey.findProgramAddressSync(
				[
					Buffer.from("template"),
					Buffer.from(nameTemplate),
					new PublicKey(creatorAsset).toBuffer()
				],
				program.programId
			);
			console.log("\nTemplate address: ", templatePda.toBase58());
			// Utiliser le type any pour éviter les erreurs de typage
			const collectionData = await program.account.collection.fetch(collectionAccount) as any;
			console.log("\nCollection address: ", collectionData.collectionAddress.toBase58());
			console.log("\nAsset address: ", asset.publicKey.toBase58());
			const admin = getAdmin();
			const txPromise = program.methods
				.initializeMint()
				.accounts({
					user: wallet.publicKey,
					recipient: new PublicKey("JuijdHQrGSBo9MZ7CXppdBF4jKd9DbzpSLSGnrXHR7G"),  // Pour future utilisation
					mint: asset.publicKey,
					template: templatePda,
					metaplexCollection: collectionData.collectionAddress,
					admin: admin,  // PDA admin pour signer
				})
				.signers([asset])
				.rpc();

			toast.promise(txPromise, {
				loading: "Minting NFT...",
				success: "NFT minted successfully!",
				error: "Failed to mint NFT"
			});
			const tx = await txPromise;
			console.log(`Transaction signature: ${tx}`);
		} catch (error) {
			console.error("Error minting asset:", error);
		}
	}

	return { templates, checkTemplate, getTemplate, wallet, getAdmin, mintAsset };
};
