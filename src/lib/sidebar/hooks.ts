/**
 * @module lib/sidebar/hooks
 * @description This module provides two custom React hooks for managing
 * sidebar state:
 * 
 * 1. expansion state (which branches are open)
 * 2. active state (which item is selected).
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import type { SidebarNode, BranchNode } from "@/types/m3a-sidebar";

/**
 * Collects all branch node IDs from the sidebar.
 */
function collectBranchIds<T>(nodes: SidebarNode<T>[]): Set<string> {
  const ids = new Set<string>();

  function traverse(node: SidebarNode<T>): void {
    if (node.type === "branch") {
      ids.add(node.id);
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);
  return ids;
}

/**
 * Normalizes single node or array to array.
 */
export function normalizeData<T>(
  data: SidebarNode<T> | SidebarNode<T>[]
): SidebarNode<T>[] {
  return Array.isArray(data) ? data : [data];
}

// ===========================================================================
// useExpandedState
// ===========================================================================

interface UseExpandedStateOptions<T> {
  /** Tree structure (needed for `defaultExpandAll`) */
  data: SidebarNode<T>[];

  /** External control (if provided, internal state ignored) */
  controlledIds?: Set<string>;

  /** Initial internal state */
  defaultIds?: Set<string>;

  /** Expand all branches initially */
  defaultExpandAll?: boolean;
}

interface UseExpandedStateReturn {
  /** Current set (either controlled or internal) */
  expandedIds: Set<string>;

  /** Predicate function for checking single ID */
  isExpanded: (id: string) => boolean;

  /** Flip expansion state */
  toggle: (id: string) => void;

  /** Explicit set expansion state */
  setExpanded: (id: string, expanded: boolean) => void;
}

export function useExpandedState<T>({
  data,
  controlledIds,
  defaultIds,
  defaultExpandAll = false,
}: UseExpandedStateOptions<T>): UseExpandedStateReturn {
  // Compute initial state
  const initialIds = useMemo(
    () => {
      // Priority:
      // 1. defaultExpandAll=true → collect all branch IDs
      // 2. defaultIds provided → use those
      // 3. Neither → empty Set
      if (defaultExpandAll) {
        return collectBranchIds(data);
      }
      return defaultIds ?? new Set<string>();
    },
    [data, defaultIds, defaultExpandAll]
  ); // Only compute once on mount

  const [internalIds, setInternalIds] = useState<Set<string>>(initialIds);

  // Use controlled or internal state
  const expandedIds = controlledIds ?? internalIds;
  const isControlled = controlledIds !== undefined;

  const isExpanded = useCallback(
    (id: string): boolean => expandedIds.has(id),
    [expandedIds]
  );

  const toggle = useCallback(
    (id: string): void => {
      if (isControlled) return; // Don't modify if controlled

      setInternalIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [isControlled]
  );

  const setExpanded = useCallback(
    (id: string, expanded: boolean): void => {
      if (isControlled) return;

      setInternalIds((prev) => {
        const next = new Set(prev);
        if (expanded) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    },
    [isControlled]
  );

  return { expandedIds, isExpanded, toggle, setExpanded };
}

// ===========================================================================
// useActiveState
// ===========================================================================

interface UseActiveStateOptions {
  controlledId?: string | null;
  defaultId?: string | null;
}

interface UseActiveStateReturn {
  activeId: string | null;
  isActive: (id: string) => boolean;
  setActive: (id: string | null) => void;
}

export function useActiveState({
  controlledId,
  defaultId = null,
}: UseActiveStateOptions): UseActiveStateReturn {
  const [internalId, setInternalId] = useState<string | null>(defaultId);

  const isControlled = controlledId !== undefined;
  const activeId = isControlled ? controlledId : internalId;

  const isActive = useCallback(
    (id: string): boolean => activeId === id,
    [activeId]
  );

  const setActive = useCallback(
    (id: string | null): void => {
      if (!isControlled) {
        setInternalId(id);
      }
    },
    [isControlled]
  );

  return { activeId, isActive, setActive };
}