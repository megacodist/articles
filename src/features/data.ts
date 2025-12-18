// src/features/docs-sidebar/data.ts

import type { SidebarNode } from "@/lib/sidebar";

// src/
// ├── lib/
// │   └── sidebar/
// │       ├── types.ts              # Type definitions
// │       ├── hooks.ts              # State management hooks
// │       ├── context.ts            # React context for sidebar state
// │       ├── Sidebar.tsx           # Main component
// │       ├── SidebarNodeRenderer.tsx # Recursive node renderer
// │       ├── DefaultNodeRenderer.tsx # Default styling
// │       └── index.ts              # Public exports
// │
// ├── features/
// │   └── docs-sidebar/
// │       ├── data.ts               # Example data
// │       ├── CustomRenderer.tsx    # Custom renderer example
// │       └── DocsSidebar.tsx       # Composed component
// │
// └── app/
//     └── docs/
//         └── layout.tsx            # Usage example

// Content type is URL string
type DocNode = SidebarNode<string>;

export const docsNavigation: DocNode[] = [
  {
    id: "home",
    type: "leaf",
    name: "Home",
    icon: "🏠",
    content: "/docs",
  },
  {
    id: "getting-started",
    type: "branch",
    name: "Getting Started",
    icon: "🚀",
    children: [
      {
        id: "installation",
        type: "leaf",
        name: "Installation",
        content: "/docs/installation",
      },
      {
        id: "quick-start",
        type: "leaf",
        name: "Quick Start",
        content: "/docs/quick-start",
      },
      {
        id: "project-structure",
        type: "leaf",
        name: "Project Structure",
        content: "/docs/project-structure",
      },
    ],
  },
  {
    id: "guides",
    type: "branch",
    name: "Guides",
    icon: "📚",
    content: "/docs/guides", // Branch with its own page
    children: [
      {
        id: "authentication",
        type: "branch",
        name: "Authentication",
        icon: "🔐",
        children: [
          {
            id: "auth-oauth",
            type: "leaf",
            name: "OAuth 2.0",
            content: "/docs/guides/auth/oauth",
          },
          {
            id: "auth-jwt",
            type: "leaf",
            name: "JWT Tokens",
            content: "/docs/guides/auth/jwt",
          },
          {
            id: "auth-session",
            type: "leaf",
            name: "Session Management",
            content: "/docs/guides/auth/session",
          },
        ],
      },
      {
        id: "data-fetching",
        type: "branch",
        name: "Data Fetching",
        icon: "📡",
        children: [
          {
            id: "fetch-server",
            type: "leaf",
            name: "Server Components",
            content: "/docs/guides/data/server",
          },
          {
            id: "fetch-client",
            type: "leaf",
            name: "Client Components",
            content: "/docs/guides/data/client",
          },
        ],
      },
      {
        id: "deployment",
        type: "leaf",
        name: "Deployment",
        icon: "🌐",
        content: "/docs/guides/deployment",
      },
    ],
  },
  {
    id: "api",
    type: "branch",
    name: "API Reference",
    icon: "⚡",
    children: [
      {
        id: "api-components",
        type: "leaf",
        name: "Components",
        content: "/docs/api/components",
      },
      {
        id: "api-hooks",
        type: "leaf",
        name: "Hooks",
        content: "/docs/api/hooks",
      },
      {
        id: "api-utilities",
        type: "leaf",
        name: "Utilities",
        content: "/docs/api/utilities",
      },
    ],
  },
  {
    id: "examples",
    type: "leaf",
    name: "Examples",
    icon: "💡",
    content: "/docs/examples",
  },
  {
    id: "changelog",
    type: "leaf",
    name: "Changelog",
    icon: "📝",
    content: "/docs/changelog",
    disabled: true, // Example of disabled node
  },
];