// m3a-sidebar.ts

import type { ReactNode } from "react";

// ===========================================================================
// Node Types
// ===========================================================================

interface BaseNode<ContentType> {
  /** Unique identifier for the node. */
  id: string;
  
  /** Human-readable display label. */
  name: string;
  
  /** Optional icon (emoji, SVG, component). */
  icon?: ReactNode;
  
  /** When `true`, the node is non-interactive. */
  disabled?: boolean;
}

/**
 * A branch node that can contain children.
 */
export type BranchNode<ContentType = unknown> = BaseNode<ContentType> & {
  /** Distinguishes this as a branch node. */
  type: "branch";

  /** Child nodes. */
  children: SidebarNode<ContentType>[];

  /** Optional payload data. */
  content?: ContentType;
};

/**
 * A terminal leaf node in the sidebar.
 */
export type LeafNode<ContentType = unknown> = BaseNode<ContentType> & {
  /** Distinguishes this as a leaf node. */
  type: "leaf";

  /** Optional payload data. */
  content: ContentType;
};

/**
 * Discriminated union of all node types.
 */
export type SidebarNode<ContentType = unknown> =
  | BranchNode<ContentType>
  | LeafNode<ContentType>;

// ===========================================================================
// Render Context
// ===========================================================================

/**
 * When you provide a custom render function, you need information about
 * the current node's state. This interface packages everything a
 * renderer needs into a single object.
 */
export interface NodeRenderContext<ContentType = unknown> {
  /** The node data being rendered. */
  node: SidebarNode<ContentType>;

  /** Nesting depth. Root = 0. */
  depth: number;

  /** Index among siblings. */
  index: number;

  /** `true` if first among siblings. */
  isFirst: boolean;

  /** `true` if last among siblings. */
  isLast: boolean;

  /**
   * `true` if this node's children are visible. Always `false` for
   * leaves.
   */
  isExpanded: boolean;

  /** `true` if this is the currently active node. */
  isActive: boolean;

  /**
   * `true` if node has children (convenience for `node.type === 'branch'
   * && node.children.length > 0`).
   */
  hasChildren: boolean;

  /** Toggle expansion state. No-op for leaves. */
  toggle(): void;

  /** Explicitly set expansion state. No-op for leaves. */
  setExpanded(expanded: boolean): void;

  /** Mark this node as active. */
  activate(): void;
}

// ===========================================================================
// Callbacks
// ===========================================================================

/**
 * Callback invoked when a node is expanded or collapsed. Receives the
 * node and the new expansion state.
 * 
 * Common Uses
 * * Lazy loading children when expanded
 * * Persisting expansion state to localStorage
 * * Analytics
 *
 * @param node 	The node being toggled
 * @param isExpanded The new state after toggling. `true` = now expanded,
 * `false` = now collapsed.
 */
export type OnNodeToggle<ContentType = unknown> = (
  node: BranchNode<ContentType>,
  isExpanded: boolean
) => void;

/**
 * Callback invoked when user activates a node.
 */
export type OnNodeActivate<ContentType = unknown> = (
  node: SidebarNode<ContentType>
) => void;

// ===========================================================================
// Render Prop
// ===========================================================================

export type RenderNode<ContentType = unknown> = (
  context: NodeRenderContext<ContentType>
) => ReactNode;

// ===========================================================================
// Component Props
// ===========================================================================

/** 
 * Defines all props the Treeview component accepts. This is the contract
 * between the component and its consumers.
 */
export interface SidebarProps<ContentType = unknown> {
  /** Sidebar data. Single root or array of roots (forest). */
  data: SidebarNode<ContentType> | SidebarNode<ContentType>[];

  // ---- Controlled State ----
  /** Controlled active node ID. */
  activeId?: string | null;

  /** Controlled expanded node IDs. */
  expandedIds?: Set<string>;

  // ---- Uncontrolled Defaults ----
  /** Initial active ID (uncontrolled). */
  defaultActiveId?: string | null;

  /** Initial expanded IDs (uncontrolled). */
  defaultExpandedIds?: Set<string>;

  /** If true, all branches start expanded. */
  defaultExpandAll?: boolean;

  // ---- Customization ----
  /** Custom node renderer. */
  renderNode?: RenderNode<ContentType>;

  // ---- Callbacks ----
  /** Called when a branch is expanded/collapsed. */
  onToggle?: OnNodeToggle<ContentType>;

  /** Called when any node is activated. */
  onActivate?: OnNodeActivate<ContentType>;

  // ---- Styling ----
  /** Root element class name. */
  className?: string;

  /** Pixels of indentation per depth level. */
  indentSize?: number;

  // ---- Accessibility ----
  /** Accessible label for the nav landmark. */
  "aria-label"?: string;
}

// ===========================================================================
// Internal Types
// ===========================================================================

export interface SidebarContextValue<ContentType = unknown> {
  activeId: string | null;
  expandedIds: Set<string>;
  indentSize: number;
  setActiveId: (id: string | null) => void;
  toggleNode: (id: string) => void;
  setNodeExpanded: (id: string, expanded: boolean) => void;
  renderNode?: RenderNode<ContentType>;
  onToggle?: OnNodeToggle<ContentType>;
  onActivate?: OnNodeActivate<ContentType>;
}