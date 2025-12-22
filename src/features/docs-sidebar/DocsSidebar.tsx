// src/features/docs-sidebar/DocsSidebar.tsx

// Mark the component as client to run in the browser not in the server
"use client";

import { usePathname } from "next/navigation";
import { useMemo, useCallback } from "react";

import { Sidebar, type SidebarNode, type OnNodeActivate } from "@/lib/sidebar";
import { docsNavigation } from "./data";
import { DocsNodeRenderer } from "./CustomRenderer";

/**
 * Finds the node ID matching the path of the current URL.
 * 
 * @param nodes Array of nodes to search through.
 * @param pathname The current path to match against.
 * @returns The ID of the matching node, or null if no match is found.
 */
function findActiveNode(
  nodes: SidebarNode<string>[],
  pathname: string
): string | null {
  for (const node of nodes) {
    if (node.content === pathname) {
      return node.id;
    }
    if (node.type === "branch" && node.children.length > 0) {
      const found = findActiveNode(node.children, pathname);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Recursively finds all parent branch IDs for a given node.
 * 
 * @param nodes	Current level of the sidebar to search
 * @param targetId	The node ID we're looking for
 * @param parents	Accumulator array of ancestor IDs (default empty)
 * @returns	Array of parent IDs, or `null` if target not found
 */
function findParentIds(
  nodes: SidebarNode<string>[],
  targetId: string,
  parents: string[] = []
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return parents;
    }
    if (node.type === "branch") {
      const found = findParentIds(
        node.children,
        targetId,
        [...parents, node.id,]
      );
      if (found) return found;
    }
  }
  return null;
}

export function DocsSidebar() {
  /** The path part of the current URL */
  const pathname = usePathname();

  /** The node ID of the path of the current URL */
  const activeId = useMemo(
    () => findActiveNode(docsNavigation, pathname),
    [pathname]
  );

  /** 
   * The IDs of the parent nodes of the current article to be expanded
   * by default
   */
  const defaultExpandedIds = useMemo(
    () => {
      if (!activeId) return new Set<string>();
      const parentIds = findParentIds(docsNavigation, activeId);
      return new Set(parentIds ?? []);
    },
    [activeId]
  );

  /** The stable function reference for the activation handler */
  const onNodeActivation: OnNodeActivate<string> = useCallback(
    (node) => {
      console.log("Activated:", node.name);
    },
    []  // Create this memoized function once and reuse the same function reference on every render.
  );

  return (
    <aside className="min-h-full border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span>📖</span>
          Documentation
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        <Sidebar<string>
          data={docsNavigation}
          activeId={activeId}
          defaultExpandedIds={defaultExpandedIds}
          onActivate={onNodeActivation}
          renderNode={DocsNodeRenderer}
          indentSize={20}
          aria-label="Documentation navigation"
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-base-300 text-xs text-base-content/60">
        v1.0.0
      </div>
    </aside>
  );
}