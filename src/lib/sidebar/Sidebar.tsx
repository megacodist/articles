// src/lib/sidebar/Sidebar.tsx

"use client";

import { useMemo } from "react";
import { SidebarProvider } from "./context";
import { SidebarNodeRenderer } from "./SidebarNodeRenderer";
import {
  useExpandedState,
  useActiveState,
  normalizeData,
} from "./hooks";
import type { SidebarProps, SidebarContextValue } from "@/types/m3a-sidebar";

const DEFAULT_INDENT_SIZE = 16;

export function Sidebar<ContentType = unknown>({
  data,
  activeId: controlledActiveId,
  expandedIds: controlledExpandedIds,
  defaultActiveId,
  defaultExpandedIds,
  defaultExpandAll = false,
  renderNode,
  onToggle,
  onActivate,
  className = "",
  indentSize = DEFAULT_INDENT_SIZE,
  "aria-label": ariaLabel = "Sidebar navigation",
}: SidebarProps<ContentType>): React.ReactNode {
  // Normalize data to array
  const nodes = useMemo(() => normalizeData(data), [data]);

  // Expansion state (controlled or uncontrolled)
  const {
    expandedIds,
    toggle: toggleNode,
    setExpanded: setNodeExpanded,
  } = useExpandedState({
    data: nodes,
    controlledIds: controlledExpandedIds,
    defaultIds: defaultExpandedIds,
    defaultExpandAll,
  });

  // Active state (controlled or uncontrolled)
  const { activeId, setActive: setActiveId } = useActiveState({
    controlledId: controlledActiveId,
    defaultId: defaultActiveId,
  });

  // Build context value
  const contextValue: SidebarContextValue<ContentType> = useMemo(
    () => ({
      activeId,
      expandedIds,
      indentSize,
      setActiveId,
      toggleNode,
      setNodeExpanded,
      renderNode,
      onToggle,
      onActivate,
    }),
    [
      activeId,
      expandedIds,
      indentSize,
      setActiveId,
      toggleNode,
      setNodeExpanded,
      renderNode,
      onToggle,
      onActivate,
    ]
  );

  return (
    <SidebarProvider value={contextValue as SidebarContextValue}>
      <nav
        className={`flex flex-col ${className}`}
        aria-label={ariaLabel}
      >
        <ul role="tree" className="flex flex-col gap-0.5">
          {nodes.map((node, index) => (
            <SidebarNodeRenderer
              key={node.id}
              node={node}
              depth={0}
              index={index}
              siblingsCount={nodes.length}
            />
          ))}
        </ul>
      </nav>
    </SidebarProvider>
  );
}