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

## Heading Convention

To keep all articles portable, consistent, and free of technical debt, follow these rules when writing Markdown content:

1. **Every article must include exactly one H1 heading.**

	The first non–front matter line must be a single `#` heading, representing the document title.

2. **Front matter `title:` is metadata, not the displayed title.**

	Include a `title:` field in the front matter for SEO, listings, and system use. The H1 in the content should normally match this value.

3. **Start all major sections with H2 (##).**

4. **Subsections should use H3-H6 as needed.**

	Never use additional H1s in the content.

5. **Do not rely on the site generator to provide the H1.**

	Each `.md` file must be a complete, self-contained document that renders correctly in any Markdown viewer.

6. **Avoid duplicate titles on the rendered page.**

	If a layout or theme automatically inserts a page title, disable that behavior to prevent multiple H1s.

7. **Better to keep URLs stable.**

	When URL stability matters, it is recommended to define a `slug:` in the front matter rather than relying on auto-generated slugs from headings.

8. **Use CI or linting to enforce consistency.**

	A linter (e.g., markdownlint with rule MD041) or a simple script should check that each file has exactly one H1 and that front matter and H1 titles remain consistent.

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
