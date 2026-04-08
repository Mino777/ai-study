"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface GraphSearchState {
  highlightedNodes: Set<string>;
  selectedNodeId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  highlightNodes: (ids: string[]) => void;
  clearHighlights: () => void;
  selectNode: (id: string | null) => void;
}

const GraphSearchContext = createContext<GraphSearchState | null>(null);

export function GraphSearchProvider({ children }: { children: React.ReactNode }) {
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState("");

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const highlightNodes = useCallback((ids: string[]) => {
    setHighlightedNodes(new Set(ids));
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlightedNodes(new Set());
    setSelectedNodeId(null);
    setSearchQueryState("");
  }, []);

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  return (
    <GraphSearchContext.Provider
      value={{
        highlightedNodes,
        selectedNodeId,
        searchQuery,
        setSearchQuery,
        highlightNodes,
        clearHighlights,
        selectNode,
      }}
    >
      {children}
    </GraphSearchContext.Provider>
  );
}

export function useGraphSearch() {
  const ctx = useContext(GraphSearchContext);
  if (!ctx) throw new Error("useGraphSearch must be used within GraphSearchProvider");
  return ctx;
}
