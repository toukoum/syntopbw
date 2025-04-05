import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface BuildLayoutProps {
	children: React.ReactNode;
}

export default function BuildLayout({ children }: BuildLayoutProps) {
	return (
		<SidebarProvider defaultOpen={false}>
			<div className="flex min-h-screen h-screen w-full">
				<AppSidebar />

				<main className="flex-1 flex flex-col w-full overflow-y-auto">
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}
