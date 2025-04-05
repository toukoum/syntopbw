"use client";

import { useEffect, useState } from "react";
import { useTemplates } from "@/components/template/fetchTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

export default function ShopPage() {
	const { publicKey } = useWallet();
	const { templates, checkTemplate, mintAsset } = useTemplates();
	const [loading, setLoading] = useState(false);

	// Fonction pour charger les templates
	const loadTemplates = async () => {
		setLoading(true);
		try {
			await checkTemplate();
			console.log("Templates chargés:", templates);
		} catch (error) {
			console.error("Erreur lors du chargement des templates:", error);
		} finally {
			setLoading(false);
		}
	};

	// Charger les templates au montage du composant
	useEffect(() => {
		loadTemplates();
	}, []);

	if (!publicKey) {
		return (
			<div className="w-full py-6 px-10">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Tool Marketplace</h1>
					<p className="text-muted-foreground">
						Please connect your wallet to access the marketplace.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-6 px-10">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Tool Marketplace</h1>
				<Button onClick={loadTemplates} disabled={loading}>
					{loading ? "Loading..." : "Load Tools"}
				</Button>
			</div>

			{templates.length === 0 ? (
				<div className="text-center py-12">
					<h2 className="text-xl font-medium mb-2">No tools available</h2>
					<p className="text-muted-foreground mb-6">
						Connect your wallet and load tools to see available tools.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{templates.map((template) => (
						<Card key={template.pubKeyTemplate} className="flex flex-col">
							<CardHeader>
								<CardTitle>{template.name}</CardTitle>
							</CardHeader>
							<CardContent className="flex-1">
								<p className="text-sm text-muted-foreground mb-4">
									{template.description}
								</p>
								<div className="text-sm">
									<div className="flex justify-between mb-1">
										<span>Price:</span>
										<span className="font-medium">{Number(template.price) / 1000000000} SOL</span>
									</div>
									<div className="flex justify-between">
										<span>Creator:</span>
										<span className="font-medium truncate max-w-[180px]">
											{template.creator.substring(0, 6)}...{template.creator.substring(template.creator.length - 4)}
										</span>
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-between">
								<Link
									href={`/shop/${template.pubKeyTemplate}`}
									className="text-sm text-primary underline"
								>
									View Details
								</Link>
								<Button variant="outline" size="sm" onClick={() => mintAsset(template.name, template.creator)}>
									<ShoppingCart className="h-4 w-4 mr-2" />
									Buy Tool
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}