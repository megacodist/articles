// src/lib/sidebar/DefaultNodeRenderer.tsx

import type { NodeRenderContext } from "@/types/m3a-sidebar";
import Link from "next/link";

/**
 * Default renderer using daisyUI + Tailwind styling.
 * Handles both branch and leaf nodes with proper semantics.
 */
export function DefaultNodeRenderer<ContentType = string>({
  node,
  depth,
  isExpanded,
  isActive,
  hasChildren,
  toggle,
  activate,
}: NodeRenderContext<ContentType>): React.ReactNode {
  const isDisabled = node.disabled ?? false;

  // Determine if content is a navigable URL (string)
  const href =
    typeof node.content === "string" ? node.content : null;

  // Base styles
  const baseClasses = `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm
    transition-colors duration-150 select-none
    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${isActive ? "bg-primary text-primary-content" : "hover:bg-base-200"}
  `;

  // Expand/collapse chevron for branches
  const Chevron = () => {
    if (!hasChildren) return null;

    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        disabled={isDisabled}
        className="p-0.5 rounded hover:bg-base-300 transition-transform duration-200"
        style={{
          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
        }}
        aria-label={isExpanded ? "Collapse" : "Expand"}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    );
  };

  // Icon rendering
  const Icon = () => {
    if (node.icon) {
      return <span className="flex-shrink-0">{node.icon}</span>;
    }

    // Default icons based on node type
    if (node.type === "branch") {
      return <span className="flex-shrink-0">{isExpanded ? "📂" : "📁"}</span>;
    }

    return <span className="flex-shrink-0">📄</span>;
  };

  // Content wrapper
  const Content = () => (
    <>
      <Chevron />
      <Icon />
      <span className="truncate flex-1">{node.name}</span>
    </>
  );

  // Handle click
  const handleClick = () => {
    if (isDisabled) return;
    activate();
  };

  // Render as link if href exists
  if (href && !isDisabled) {
    return (
      <Link
        href={href}
        className={baseClasses}
        onClick={handleClick}
        aria-current={isActive ? "page" : undefined}
      >
        <Content />
      </Link>
    );
  }

  // Render as button/div
  return (
    <div
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      className={baseClasses}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
          if (hasChildren) toggle();
        }
      }}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-disabled={isDisabled}
    >
      <Content />
    </div>
  );
}