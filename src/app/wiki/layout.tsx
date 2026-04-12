import { getSidebarData } from "@/lib/content";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarData = getSidebarData();

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <div className="flex">
        <Sidebar data={sidebarData} />
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-12">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
