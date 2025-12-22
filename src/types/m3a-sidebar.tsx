// m3a-sidebar.ts

import type { ReactNode } from "react";

// ===========================================================================
// Node Types
// ===========================================================================

/**
 * This base type doesn't use `ContentType` directly, but extending types
 * will. This ensures type consistency across the hierarchy
 */
interface BaseNode<ContentType> {
  /** Unique identifier for the node. */
  id: string;
  
  /** Human-readable display label. */
  name: string;
  
  /** The visual indicator (emoji, SVG, component). */
  icon?: ReactNode;
  
  /** When `true`, the node is non-interactive. */
  disabled?: boolean;
}

/**
 * A branch node in the sidebar that can contain children. If caller
 * doesn't specify the generic type, it defaults to `unknown`, which is
 * safer than `any`.
 */
export type BranchNode<ContentType = unknown> = BaseNode<ContentType> & {
  /** Discriminant for type narrowing. Distinguishes this as a branch node. */
  type: "branch";

  /** Nested nodes, can be empty. */
  children: SidebarNode<ContentType>[];

  /** Optional payload data. */
  content?: ContentType;
};

/**
 * A terminal leaf node in the sidebar.
 */
export type LeafNode<ContentType = unknown> = BaseNode<ContentType> & {
  /** Discriminant for type narrowing. Distinguishes this as a leaf node. */
  type: "leaf";

  /** Required payload data. */
  content: ContentType;
};

/**
 * Discriminated union of all node types.
 * 
 * @example
 *function process(node: SidebarNode<string>) {
 *  // TypeScript doesn't know which type yet
 *  node.content  // Error: might be undefined (branch)
 *
 *  if (node.type === "branch") {
 *    // TypeScript now knows: node is BranchNode<string>
 *    node.children  // ✓ Valid
 *    node.content   // string | undefined
 *  } else {
 *    // TypeScript now knows: node is LeafNode<string>
 *    node.content   // ✓ string (required)
 *  }
 * }
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
 * 
 * * `isFirst` and `isLast` are especially useful for styling first/last
 * child nodes differently (e.g., rounded corners).
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
 * 
 * @example
 * const handleToggle: OnNodeToggle<string> = (node, isExpanded) => {
 *   // Lazy load children
 *  if (isExpanded && !node.children.length) {
 *    fetchChildren(node.id);
 *  }
 *  
 *  // Persist to localStorage
 *  saveExpandedState(node.id, isExpanded);
 *
 *  // Analytics
 *  analytics.track("sidebar_toggle", { nodeId: node.id, expanded: isExpanded });
 */
export type OnNodeToggle<ContentType = unknown> = (
  /** The node being toggled */
  node: BranchNode<ContentType>,

  /**
   * The new state after toggling. `true` = now expanded, `false` = now
   * collapsed.
   */
  isExpanded: boolean
) => void;

/**
 * Callback invoked when user activates a node.
 * 
 * @example
 * const handleActivate: OnNodeActivate<string> = (node) => {
 *   // Close mobile menu
 *   setMobileOpen(false);
 *  
 *   // Update breadcrumbs
 *   setBreadcrumbs(buildBreadcrumbs(node));
 *  
 *   // Scroll content to top
 *   window.scrollTo(0, 0);
 * };
 */
export type OnNodeActivate<ContentType = unknown> = (
  node: SidebarNode<ContentType>
) => void;

// ===========================================================================
// Render Prop
// ===========================================================================

/**
 * @example
 * // Consumer provides custom rendering logic
 * <Sidebar
 *   data={nodes}
 *   renderNode={(context) => (
 *     <MyCustomNode
 *       label={context.node.name}
 *       active={context.isActive}
 *       onClick={context.activate}
 *     />
 *   )}
 * />
 */
export type RenderNode<ContentType = unknown> = (
  context: NodeRenderContext<ContentType>
) => ReactNode;

// ===========================================================================
// Component Props
// ===========================================================================

/** 
 * Defines all props the Treeview component accepts. This is the contract
 * between the component and its consumers.
 * 
 * @example <caption>Controlled vs. Uncontrolled</caption>
 * // Fully controlled (parent manages all state)
 * const [activeId, setActiveId] = useState(null);
 * const [expandedIds, setExpandedIds] = useState(new Set());
 * <Sidebar activeId={activeId} expandedIds={expandedIds} />
 *
 * // Fully uncontrolled (Sidebar manages internally)
 * <Sidebar defaultActiveId="home" defaultExpandAll />
 *
 * // Hybrid (parent controls active, Sidebar controls expansion)
 * <Sidebar activeId={activeId} defaultExpandAll />
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

/** Shared state passed through React Context to all descendant nodes. */
export interface SidebarContextValue<ContentType = unknown> {
  /** Currently active node. */
  activeId: string | null;

  /** Set of expanded branch IDs. */
  expandedIds: Set<string>;

  /** Indentation config. */
  indentSize: number;

  /** Mutator for active state. */
  setActiveId: (id: string | null) => void;

  /** Toggle expansion. */
  toggleNode: (id: string) => void;

  /** Explicit expansion control */
  setNodeExpanded: (id: string, expanded: boolean) => void;

  /** Custom renderer (passed through). */
  renderNode?: RenderNode<ContentType>;

  /** User callback (passed through). */
  onToggle?: OnNodeToggle<ContentType>;

  /** User callback (passed through). */
  onActivate?: OnNodeActivate<ContentType>;
}