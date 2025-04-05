"use client";

import { useEffect, useState } from "react";
import { useTemplates } from "@/components/template/fetchTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Template } from "@/types/template";
import { useRouter } from "next/navigation";

export default function ToolDetailPage({ params }: { params: { id: string } }) {
	const router = useRouter();
	const { getTemplate, mintAsset } = useTemplates();
	const [tool, setTool] = useState<Template | null>(null);
	const [loading, setLoading] = useState(true);


	useEffect(() => {
		const loadTool = async () => {
			setLoading(true);
			const templateData = await getTemplate(params.id);
			console.log(params.id);
			console.log(templateData);
			if (!templateData) setTool(null);
			else setTool(templateData);
			setLoading(false);
		};

		loadTool();
	}, []);

	if (loading) {
		return (
			<div className="w-full py-12 text-center">
				<p>Loading tool details...</p>
			</div>
		);
	}

	if (!tool) {
		return (
			<div className="w-full py-12 text-center">
				<h2 className="text-2xl font-bold mb-4">Tool Not Found</h2>
				<p className="text-muted-foreground mb-6">
					The tool you're looking for doesn't exist or couldn't be loaded.
				</p>
				<Button asChild>
					<Link href="/shop">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Shop
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full py-6 px-10">
			<div className="mb-6">
				<Button variant="ghost" onClick={() => router.push('/shop')}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Shop
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="md:col-span-2">
					<h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
					<p className="text-muted-foreground mb-6">{tool.description}</p>

					<div className="mb-6">
						<h2 className="text-xl font-semibold mb-2">Tool Parameters</h2>
						<Card>
							<CardContent className="pt-6">
								{tool.parameters.map((param, index) => (
									<div key={index} className="mb-4">
										<div className="flex justify-between mb-1">
											<span className="font-medium">{param.name}</span>
											<span className="text-sm bg-accent px-2 py-0.5 rounded">
												{param.type}
											</span>
										</div>
										<p className="text-sm text-muted-foreground mb-1">
											{param.description}
										</p>
										<p className="text-xs">
											Required: {param.required ? "Yes" : "No"}
										</p>
										{index < tool.parameters.length - 1 && (
											<Separator className="my-3" />
										)}
									</div>
								))}
							</CardContent>
						</Card>
					</div>

					<div>
						<h2 className="text-xl font-semibold mb-2">Attributes</h2>
						<div className="grid grid-cols-2 gap-4">
							{tool.attributes.map((attr, index) => (
								<Card key={index}>
									<CardContent className="p-4">
										<p className="text-sm text-muted-foreground">{attr.traitType}</p>
										<p className="font-medium">{attr.value}</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>

				<div>
					<Card>
						<CardContent className="pt-6">
							<div className="mb-6">
								<h2 className="text-xl font-semibold mb-4">Purchase Tool</h2>

								<div className="space-y-4">
									<div className="flex justify-between">
										<span>Price:</span>
										<span className="font-medium">{Number(tool.price) / 1000000000} SOL</span>
									</div>

									<div className="flex justify-between">
										<span>Creator:</span>
										<span className="font-medium truncate max-w-[180px]" title={tool.creator}>
											{tool.creator.substring(0, 6)}...{tool.creator.substring(tool.creator.length - 4)}
										</span>
									</div>

									<Separator />

									<Button className="w-full" onClick={() => mintAsset(tool.name, tool.creator)}>
										<ShoppingCart className="mr-2 h-4 w-4" />
										Buy Now
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}