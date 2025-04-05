import "./globals.css";
import { Wallet } from "@/components/solana/provider";
import CustomHead from "@/components/constantes/metadata";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";


const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});


export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<CustomHead />
			<body
				className={cn(
					"min-h-screen bg-background font-sans antialiased",
					inter.variable,
				)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={true}
				>
					<Wallet>
						{children}
					</Wallet>
				</ThemeProvider>
				<Toaster />

			</body>
		</html>
	);
}
