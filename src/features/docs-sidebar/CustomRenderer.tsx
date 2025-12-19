// src/features/docs-sidebar/CustomRenderer.tsx

import Link from "next/link";
import type { NodeRenderContext } from "@/lib/sidebar";

/**
 * Custom renderer with daisyUI menu styling.
 */
export function DocsNodeRenderer({
  node,
  isExpanded,
  isActive,
  hasChildren,
  toggle,
  activate,
}: NodeRenderContext<string>): React.ReactNode {
  const href = node.content;
  const isDisabled = node.disabled ?? false;

  // Use daisyUI menu classes
  const itemClass = `
    ${isActive ? "active" : ""}
    ${isDisabled ? "disabled" : ""}
  `;

  const handleClick = () => {
    if (isDisabled) return;
    activate();
  };

  const ChevronIcon = () => (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${
        isExpanded ? "rotate-90" : ""
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );

  // Branch with children
  if (hasChildren) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="btn btn-ghost btn-xs btn-square"
          disabled={isDisabled}
        >
          <ChevronIcon />
        </button>

        {href ? (
          <Link href={href} className={itemClass} onClick={handleClick}>
            {node.icon && <span>{node.icon}</span>}
            {node.name}
          </Link>
        ) : (
          <span
            className={`flex-1 cursor-pointer ${itemClass}`}
            onClick={() => toggle()}
          >
            {node.icon && <span>{node.icon}</span>}
            {node.name}
          </span>
        )}
      </div>
    );
  }

  // Leaf node
  if (href) {
    return (
      <Link href={href} className={itemClass} onClick={handleClick}>
        {node.icon && <span>{node.icon}</span>}
        {node.name}
      </Link>
    );
  }

  return (
    <span className={itemClass} onClick={handleClick}>
      {node.icon && <span>{node.icon}</span>}
      {node.name}
    </span>
  );
}