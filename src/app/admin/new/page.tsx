"use client";

import { useEffect, useState } from "react";
import { EntryEditor } from "@/components/admin/entry-editor";

export default function AdminNewPage() {
  const [allSlugs, setAllSlugs] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/entries")
      .then((r) => r.json())
      .then((entries: Array<{ slug: string }>) =>
        setAllSlugs(entries.map((e) => e.slug))
      );
  }, []);

  return <EntryEditor mode="new" allSlugs={allSlugs} />;
}
