import { getSidebarData, getManifest } from "@/lib/content";
import { Sidebar } from "@/components/sidebar";
import { SearchDialog } from "@/components/search-dialog";
import { GraphSearchProvider } from "@/contexts/graph-search-context";
import { Header } from "@/components/header";

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarData = getSidebarData();
  const manifest = getManifest();

  const searchEntries = manifest.entries.map((e) => ({
    slug: e.slug,
    title: e.frontmatter.title,
    category: e.frontmatter.category,
    description: e.frontmatter.description,
    tags: e.frontmatter.tags,
  }));

  return (
    <GraphSearchProvider>
    <div className="min-h-screen bg-bg">
      <Header />
      <div className="flex">
        <Sidebar data={sidebarData} />
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-12">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
      <SearchDialog entries={searchEntries} />
    </div>
    </GraphSearchProvider>
  );
}
