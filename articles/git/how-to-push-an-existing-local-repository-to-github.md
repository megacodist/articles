---
title: "How to Push an Existing Local Repository to GitHub"
slug: "how-to-push-an-existing-local-repository-to-github"
created_on: 2025-11-20T10:38:20+03:30
authors: ["Megacodist"]
status: "published"
tags: []
---
# How to Push an Existing Local Repository to GitHub

This guide covers the professional "push-first" workflow: connecting a local project to a new GitHub repo. It's the most common and essential method for publishing a new project you've started on your own machine.

**Goal**

To take a project that exists only on your local computer, initialize it as a Git repository, and publish it to a new, empty repository on GitHub.

**Why This Workflow Matters**

Most beginner tutorials teach you to `git clone`. That's for joining a project that *already exists*. This tutorial teaches you how to *start* one. This is the correct procedure for any new project, from a simple script to a full-stack application. You build locally first, and when you're ready, you publish.

**Prerequisites**

1.  A project folder on your local machine.

2.  Git installed (run `git --version` in your terminal to check).

3.  A GitHub account.

---

## Workflow

### Navigate to Your Project and Initialize Git

First, you must be in the correct directory. Then, you'll turn that directory into a Git repository.

*   **Command 1: Change Directory**

    Navigate to your project's root folder.

    ```bash
    cd /path/to/your/project/root/folder
    ```

    Replace `/path/to/your/project/folder` with the actual path. If you run the next commands in the wrong place, you'll create a repository in the wrong directory, and that's a mess you don't want to clean up.

*   **Command 2: Initialize Repository**

    ```bash
    git init
    ```

    **What it does:** This creates a hidden `.git` subdirectory inside your project. This single folder is the entire "brain" of your repository—it stores all history, commits, and versioning information. Without it, your folder is just a folder. With it, it's a repository.

### Stage and Commit Your First Snapshot

Before you can save a version of your project, you have to tell Git exactly which files to include in the snapshot. This is called "staging."

*   **Command 3: Stage Files**
    You have two primary options. Choose one.

    **Option A: Stage all files in the directory.**
    ```bash
    git add .
    ```
    This is the most common choice for a brand new project. The `.` is a wildcard for "everything in this directory."

    **Option B: Stage specific files.**
    ```bash
    git add README.md LICENSE file1.js styles/main.css
    ```
    This gives you precise control. You'll use this method more often for subsequent updates when you only want to commit some of your changes.

*   **Command 4: Commit the Snapshot**

    ```bash
    git commit -m "Initial commit"
    ```

    **What it does:** This takes all the files you staged with `git add` and saves them permanently to the repository's history with the message "Initial commit."

    **Note:** This is the one and only time a vague commit message like `"Initial commit"` is acceptable. Every future commit message should describe *what changed and why*. "Updated stuff" is not a useful message.

### Create an Empty Repository on GitHub

Now, you need to create a destination for your code on GitHub. The word **empty** is critical.

1.  Go to [GitHub](https://github.com) and log in.

2.  Click the **+** icon in the top-right corner and select **"New repository"**.

3.  **Repository name:** Give it a name (usually the same as your local project folder).

4.  **Description (Optional):** Write a brief, one-sentence description. This is good practice and helps others (and your future self) understand the project's purpose at a glance.

5.  **CRITICAL:** **DO NOT** check any of the boxes to initialize the repository with a `README`, `LICENSE`, or `.gitignore`. The repository must be completely empty.

    If you initialize the remote with a `README`, GitHub creates a commit. Your local repository has a *different* first commit. When you try to push, Git will see two conflicting histories and fail. You'll be forced to resolve a merge conflict before you've even started. Always start with an empty remote.

### Connect Your Local Repository to the Remote

Now we'll link your local repo to the empty shell you just created on GitHub.

*   **Command 5: Add the Remote**

    On your new GitHub repository's page, copy the URL. It will look like `https://github.com/YourUsername/YourRepoName.git`.

    ```bash
    git remote add origin https://github.com/YourUsername/YourRepoName.git
    ```

    **What it does:** This command creates a connection (a "remote") named `origin` that points to your GitHub repository's URL.

    **Note:** `origin` is the universal, standard nickname for your primary remote. Don't get creative and name it something else. You'll only confuse yourself and violate a decades-old convention.

*   **Command 6: Verify the Connection (Optional, but Recommended)**

    For the obsessive among us, this is a sanity check to ensure you didn't paste the wrong URL.

    ```bash
    git remote -v
    ```

    You should see your repository's URL listed for both `fetch` and `push`. If you don't, you made a typo. Fix it with `git remote remove origin` and re-run the `add` command.

### Standardize the Branch Name and Push

The final step is to send your local code to the remote.

*   **Command 7: Rename the Branch**

    ```bash
    git branch -M main
    ```

    **What it does:** This renames your current branch to `main`. The capital `-M` is a force-rename that ensures it works.

    **Note:** Git's old default branch name was `master`. GitHub's new standard is `main`. Mismatched names create friction. Standardize to `main` now and prevent all future headaches related to this issue.

*   **Command 8: Push to the Remote**

    ```bash
    git push -u origin main
    ```

    **What it does:** This command pushes your "Initial commit" from your local `main` branch to the `origin` remote's `main` branch.

    **Note:** The `-u` (`--set-upstream`) flag is a one-time setup. It links your local `main` branch with `origin/main`. This means for every future push, you can simply type the much shorter `git push`. Skipping `-u` now just means more typing for you forever.

---

## Conclusion

That's it. Refresh your GitHub page, and your files will be there. Your local project is now connected to and backed up on GitHub. Your future workflow is now the simple, standard cycle: `git add`, `git commit`, and `git push`.
