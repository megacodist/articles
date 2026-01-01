---
title: "Initialize a Next.js App"
slug: "initialize-a-next-js-app"
created_on: 2025-11-27T20:16:52+03:30
authors: ["Megacodist"]
status: "published"
tags: []
---

# Initialize a Next.js App

This is an opinionated guide to initializing a modern Next.js application. We will use pnpm and Corepack for a clean, fast, and secure setup. The result will be a production-ready foundation configured with TypeScript, Tailwind CSS, and the App Router.

This process is divided into two parts: a one-time environment setup and the per-project initialization.

Of course. Here is the provided text, transformed into a comprehensive and professional tutorial. The original commands and their order are preserved, but they are now wrapped in the necessary context to explain not just the "how," but the "why."

---

# Initialize a Next.js App

This is an opinionated guide to initializing a modern Next.js application. We will use `pnpm` and `Corepack` for a clean, fast, and secure setup. The result will be a production-ready foundation configured with TypeScript, Tailwind CSS, and the App Router.

This process is divided into two parts: a one-time environment setup and the per-project initialization.

---

## **Part 1: The One-Time Environment Setup**

The first two commands configure your machine to use `pnpm` through Node.js's built-in tool manager, Corepack. This is the modern, correct way to manage package managers.

**The Philosophy:**

*   **No Global Pollution:** These commands do not use `npm install -g`. They don't pollute your global `node_modules` or install `pnpm` in the old, fragile way.

*   **User-Level, Not Project-Level:** This is a one-time setup for your user account on your machine, not something you do for every project.

### **Step 1: Enable Corepack**

This command allows Corepack to intercept package manager calls (like `pnpm`, `yarn`, `npm`). It's a lightweight shim that ensures the correct package manager version is used for each project.

```bash
corepack enable
```

This is effectively a "global" change because it affects your entire user environment, but it is not a global package installation. In Windows, you may need to run this command in an elevated (administrator) PowerShell or Command Prompt.

### **Step 2: Prepare and Activate pnpm**

This command tells Corepack to download and activate the latest version of `pnpm`.

```bash
corepack prepare pnpm@latest --activate
```

Corepack downloads the `pnpm` executable to its own internal cache, not your project. It then makes the `pnpm` command available across your system. Again, this has a global effect but avoids the pitfalls of a traditional global install.

You can either use `@latest` to acquire the layest stable version of `pnpm` or specify a specific version like `@10.23.0`.

With this setup complete, you will never have to run these two commands on this machine again.

---

## **Part 2: Creating Your Next.js Project**

Now, with your environment correctly configured, you can create your application.

### **Step 3: Create and Enter the Project Directory**

This command creates a new folder for your project and immediately navigates into it.

```bash
mkdir my-next-app && cd my-next-app
```

### **Step 4: Scaffold the Next.js Application**

This is the main command. It uses `pnpm dlx` to run the `create-next-app` scaffolding tool with a precise set of configuration flags.

```bash
pnpm dlx create-next-app@16.0.4 . --typescript --eslint --app --src-dir --tailwind --import-alias "@/*"
```

Let's dissect each part of this command:

*   **`pnpm dlx`**

    This is the secure and clean way to run a command-line tool without permanently installing it. `dlx` stands for "download and execute." It fetches the package, runs the command, and then discards the package. This keeps your system free of globally installed clutter.

*   **`create-next-app@16.0.4`**

    This is the official scaffolding tool. We are pinning it to a specific version (`@16.0.4`) instead of using `@latest`.

    *   **Pinning (`@16.0.4`):** Guarantees a reproducible build. Running this command a year from now will produce the exact same project structure. This is a best practice for team environments and documentation.

    *   **Latest (`@latest`):** Gives you the newest features and defaults, but can introduce unexpected changes or bugs. Use it when you want the absolute cutting edge, but be prepared for potential instability.

*   **`.`**

    The target directory. A single dot means "initialize the project inside the current folder," which is `my-next-app`. If you omitted this, it would create a *new* folder inside `my-next-app`.

*   **`--typescript`**

    Initializes the project with TypeScript. This is non-negotiable for any serious, maintainable codebase. It adds a `tsconfig.json`, uses `.ts`/`.tsx` file extensions, and enables type-checking during builds.

*   **`--eslint`**

    Sets up ESLint with Next.js's recommended configuration. This helps catch common errors and enforce code quality. If you want a disciplined codebase, this is essential.

*   **`--app`**

    Forces the project to use the **App Router**, the current standard for Next.js architecture. The legacy Pages Router is no longer the recommended approach for new projects. This flag ensures your project is built with modern patterns like server components, layouts, and streaming.

*   **`--src-dir`**

    Organizes your application code inside a `src/` directory (e.g., `src/app/` instead of a root `app/`). This is a crucial practice for keeping your project's root directory clean and separating your source code from configuration files.

*   **`--tailwind`**

    Pre-configures Tailwind CSS, including `tailwind.config.ts`, `postcss.config.mjs`, and the necessary CSS directives in `globals.css`. This is the fastest way to get a modern styling solution up and running.

*   **`--import-alias "@/*"`**

    This dramatically improves long-term project maintainability. It configures a path alias in `tsconfig.json` so you can avoid fragile, deeply nested relative imports.

    Instead of this unreadable path:

    ```typescript
    import Header from "../../../components/Header";
    ```

    You can write this clean, absolute-style path from anywhere in your project:

    ```typescript
    import Header from "@/components/Header";
    ```

### **Step 5: Install Dependencies**

The `create-next-app` script usually runs this for you, but it's good practice to run it manually to ensure all dependencies are correctly installed.

```bash
pnpm install
```

### **Step 6: Handle Build Script Approvals**

`pnpm` has a security feature that prevents packages from running post-install scripts without your permission. You may see a warning like this:

> ```text
> ╭ Warning ───────────────────────────────────────────────────────────────────╮
> │   Ignored build scripts: <pkg_1>, <pkg_2>, ...                              │
> │   Run "pnpm approve-builds" to pick which dependencies should be allowed.   │
> ╰─────────────────────────────────────────────────────────────────────────────╯
> ```

This is `pnpm` protecting you. To approve the necessary scripts:

1.  Run the approval command:

    ```bash
    pnpm approve-builds
    ```

2.  Your terminal will prompt you to select which packages to approve. Use your arrow keys and spacebar to select all of them (they are typically required for packages like Next.js and its dependencies).

3.  Run the install command one more time to execute the now-approved scripts:

    ```bash
    pnpm install
    ```

### **Step 7: Run the Development Server**

Finally, start the Next.js development server.

```bash
pnpm dev
```

Your terminal will display a message indicating the server is running, typically at `http://localhost:3000`. Open this URL in your browser to see your new Next.js application. Your professional, clean, and modern development environment is now ready.
