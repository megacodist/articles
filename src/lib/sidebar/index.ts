// src/lib/sidebar/index.ts

// Types
export type {
  SidebarNode,
  BranchNode,
  LeafNode,
  SidebarProps,
  NodeRenderContext,
  RenderNode,
  OnNodeToggle,
  OnNodeActivate,
} from "./types";

// Components
export { Sidebar } from "./Sidebar";
export { DefaultNodeRenderer } from "./DefaultNodeRenderer";

// Hooks (for advanced usage)
export { useSidebarContext } from "./context";