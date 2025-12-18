// src/lib/sidebar/SidebarNodeRenderer.tsx

"use client";

import { memo, useCallback, useMemo } from "react";
import { useSidebarContext } from "./context";
import { DefaultNodeRenderer } from "./DefaultNodeRenderer";
import type { SidebarNode, BranchNode, NodeRenderContext } from "@/types/m3a-sidebar";

interface SidebarNodeRendererProps<ContentType> {
  node: SidebarNode<ContentType>;
  depth: number;
  index: number;
  siblingsCount: number;
}

function SidebarNodeRendererInner<ContentType>({
  node,
  depth,
  index,
  siblingsCount,
}: SidebarNodeRendererProps<ContentType>): React.ReactNode {
  const {
    activeId,
    expandedIds,
    indentSize,
    setActiveId,
    toggleNode,
    setNodeExpanded,
    renderNode,
    onToggle,
    onActivate,
  } = useSidebarContext<ContentType>();

  // Computed state
  const isExpanded = node.type === "branch" && expandedIds.has(node.id);
  const isActive = activeId === node.id;
  const hasChildren =
    node.type === "branch" && node.children.length > 0;
  const isFirst = index === 0;
  const isLast = index === siblingsCount - 1;

  // Callbacks
  const toggle = useCallback(() => {
    if (node.type !== "branch") return;

    const newExpanded = !expandedIds.has(node.id);
    toggleNode(node.id);
    onToggle?.(node as BranchNode<ContentType>, newExpanded);
  }, [node, expandedIds, toggleNode, onToggle]);

  const setExpanded = useCallback(
    (expanded: boolean) => {
      if (node.type !== "branch") return;

      setNodeExpanded(node.id, expanded);
      onToggle?.(node as BranchNode<ContentType>, expanded);
    },
    [node, setNodeExpanded, onToggle]
  );

  const activate = useCallback(() => {
    if (node.disabled) return;

    setActiveId(node.id);
    onActivate?.(node);
  }, [node, setActiveId, onActivate]);

  // Build render context
  const context: NodeRenderContext<ContentType> = useMemo(
    () => ({
      node,
      depth,
      index,
      isFirst,
      isLast,
      isExpanded,
      isActive,
      hasChildren,
      toggle,
      setExpanded,
      activate,
    }),
    [
      node,
      depth,
      index,
      isFirst,
      isLast,
      isExpanded,
      isActive,
      hasChildren,
      toggle,
      setExpanded,
      activate,
    ]
  );

  // Use custom renderer or default
  const Renderer = renderNode ?? DefaultNodeRenderer;

  // Indentation style
  const indentStyle = {
    paddingLeft: `${depth * indentSize}px`,
  };

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <div style={indentStyle}>{Renderer(context)}</div>

      {/* Render children if branch and expanded */}
      {node.type === "branch" && isExpanded && node.children.length > 0 && (
        <ul role="group" className="relative">
          {/* Visual connector line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-base-300"
            style={{ marginLeft: `${(depth + 1) * indentSize - 8}px` }}
            aria-hidden="true"
          />

          {node.children.map((child, childIndex) => (
            <SidebarNodeRenderer
              key={child.id}
              node={child}
              depth={depth + 1}
              index={childIndex}
              siblingsCount={node.children.length}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// Memoize to prevent unnecessary re-renders
export const SidebarNodeRenderer = memo(
  SidebarNodeRendererInner
) as typeof SidebarNodeRendererInner;