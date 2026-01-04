---
title: README
---
# Megacodist's Tech Tutorials

A collection of practical, no-fluff tutorials for IT and software development.

## Tech Stack Requirements

To ensure maximum stability, reproducibility, and performance, this project is carefully tuned to run on a modern, battle‑tested stack. Each component has been chosen to guarantee smooth developer experience and long‑term maintainability.

**Concise:**  
Node.js v24.11.1 + React v19.2.0 + Next.js v16.0.4 + pnpm v10.23.0 + Tailwind v4.1 + daisyUI v5.5.8

**Detailed:**

*   **Runtime:** Node.js `v24.11.1`  
    Provides a fast, reliable JavaScript runtime with cutting‑edge features and security updates.

*   **Package Manager:** pnpm `v10.23.0`  
    A blazing‑fast, disk‑space‑efficient package manager that ensures consistent installs across environments.

*   **UI Library:** React `v19.2.0`  
    The core library for building highly interactive, component‑driven user interfaces with the latest concurrent features.

*   **Framework:** Next.js `v16.0.4`  
    The powerful React framework for building scalable, production‑ready applications with ease.

*   **Styling Engine:** Tailwind CSS `v4.1`  
    A modern, utility‑first CSS engine designed for rapid styling, high performance, and minimal bundle sizes.

*   **Component Kit:** daisyUI `v5.5.8`  
    A comprehensive component library that extends Tailwind CSS to provide semantic class names and faster UI development.

## Philosophy

This repository is a collection of technical guides I wish I had when I was learning. Most online tutorials are bloated with unnecessary backstory, affiliate links, and simplistic examples that don't work in the real world.

These tutorials are different. They are built on three principles:

1.  **Practical First:** Every guide is designed to solve a specific, real-world problem. The focus is on applicable knowledge, not just theory.

2.  **Brutally Honest:** I explain *why* a certain method is recommended and what the trade-offs are. If a common practice is flawed, I will say so.

3.  **No Fluff:** We get straight to the point. Minimal introductions, maximum information density.

## Heading Conventions

To keep all articles portable, consistent, and free of technical debt, follow these rules when writing Markdown content:

1. **Every article must include exactly one H1 heading.**

	The first non–front matter line must be a single `#` heading, representing the document title.

2. **Front matter `title:` is metadata, not the displayed title.**

	Include a `title:` field in the front matter for SEO, listings, and system use. The H1 in the content must match this value.

3. **Start all major sections with H2 (##).**

4. **Subsections should use H3-H6 as needed.**

	Never use additional H1s in the content.

5. **Do not rely on the site generator to provide the H1.**

	Each `.md` file must be a complete, self-contained document that renders correctly in any Markdown viewer.

6. **Avoid duplicate titles on the rendered page.**

	If a layout or theme automatically inserts a page title, disable that behavior to prevent multiple H1s.

7. **Keep URLs stable.**

	To ensure stable and predictable URLs, every article **must** define a `slug` in the front matter. This decouples the URL from the main heading, preventing broken links if the title changes.

8. **Use CI or linting to enforce consistency.**

	A linter (e.g., markdownlint with rule MD041) or a simple script should check that each file has exactly one H1 and that front matter and H1 titles remain consistent.

## 📝 Article Metadata (Front Matter)

Every article must begin with a YAML Front Matter block. The build system enforces strict validation on these fields.

### Quick Start Template
Copy this block to the top of any new `.md` or `.mdx` file:

```yaml
---
slug: mitigating-prop-drilling
title: "Mitigating Prop Drilling: A Composition Strategy"
authors: ["John Doe"]
created_on: "2025-01-27T14:30:00+00:00"
status: "draft"
tags: ["react", "architecture", "patterns"]
weight: 1
---
```

### Field Reference

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| **`slug`** | `string` | ✅ | **The URL path segment.** <br>Must be URL-safe (kebab-case). <br> Highly recommended to match the filename (excluding extension). |
| **`title`** | `string` | ✅ | The title of the article. <br> ⚠️ **Must match the only H1 heading just after the front matter.** |
| **`authors`** | `string[]` | ✅ | List of author names. Must be an array, even for a single author. |
| **`created_on`** | `string` | ✅ | ISO 8601 Date string (e.g., `2025-12-31T10:00:00Z`). Used for sorting. |
| **`status`** | `enum` | ✅ | Controls build visibility. See [Status Lifecycle](#status-lifecycle) below. |
| `tags` | `string[]` | ❌ | Taxonomy for grouping content (e.g., `["nextjs", "tutorial"]`). |
| `weight` | `number` | ❌ | **Manual Sorting Override.** <br>Articles with a weight appear *before* unweighted articles.<br>Lower number = Higher priority (e.g., `1` is top). |

### Status Lifecycle

The `status` field controls how the build engine treats your file:

*   **`wip`** (Work In Progress):
    *   **Behavior:** Completely ignored by the scanner.
    *   **Use Case:** Local notes or bare outlines not ready for code review.
*   **`draft`** (Preview):
    *   **Behavior:** Included in the build data but should be hidden from production lists in the UI.
    *   **Use Case:** content ready for review/staging but not public release.
*   **`published`** (Live):
    *   **Behavior:** Fully visible and accessible.

### ⚠️ Validation Rules

The `scanner` script runs automatically before every build. It will warn you (and potentially fail CI) if:

1.  **Slug Mismatch:** If your file is named `cool-hooks.md` but your slug is `react-hooks`, the scanner will flag this. **Best Practice:** Rename the file to match the slug.
2.  **Missing Fields:** If any required field (marked ✅) is omitted.

## Contributing

Contributions are welcome, but they must adhere to the philosophy of this repository.

**What to contribute:**

*   **Corrections & Clarifications:** If you find a technical error, a typo, or a command that could be explained better, please open a pull request.

*   **Suggestions:** Have an idea for a tutorial that fits the "practical, no-fluff" model? Open an issue and outline the concept.

**How to contribute:**

1.  **Open an issue first** to discuss any significant changes or new tutorial ideas. This prevents wasted work.

2.  Keep pull requests small and focused on a single issue or improvement.

3.  Write clearly and concisely.

PRs that add marketing content, lengthy personal anecdotes, or overly simplistic "hello world" examples will be rejected.

## License

The content of this repository is licensed under the [Creative Commons Attribution 4.0 International License](./LICENSE).

You are free to share and adapt this material for any purpose, commercially or non-commercially, as long as you provide appropriate credit.
