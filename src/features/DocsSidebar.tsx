// src/features/docs-sidebar/DocsSidebar.tsx

"use client";

import { usePathname } from "next/navigation";
import { useMemo, useCallback } from "react";
import { Sidebar, type SidebarNode, type OnNodeActivate } from "@/lib/sidebar";
import { docsNavigation } from "./data";
import { DocsNodeRenderer } from "./CustomRenderer";

/**
 * Finds the node ID matching the current path.
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
 * Finds all parent branch IDs for a given node.
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
      const found = findParentIds(node.children, targetId, [
        ...parents,
        node.id,
      ]);
      if (found) return found;
    }
  }
  return null;
}

export function DocsSidebar() {
  const pathname = usePathname();

  // Determine active node from URL
  const activeId = useMemo(
    () => findActiveNode(docsNavigation, pathname),
    [pathname]
  );

  // Auto-expand parents of active node
  const defaultExpandedIds = useMemo(() => {
    if (!activeId) return new Set<string>();
    const parentIds = findParentIds(docsNavigation, activeId);
    return new Set(parentIds ?? []);
  }, [activeId]);

  // Handle activation (could add analytics, etc.)
  const handleActivate: OnNodeActivate<string> = useCallback((node) => {
    console.log("Activated:", node.name);
  }, []);

  return (
    <aside className="w-72 h-screen bg-base-100 border-r border-base-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
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
          onActivate={handleActivate}
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