---
title: "Merging Feature Branch Using The Linear Squash Workflow"
slug: "merging-feature-branch-using-the-linear-squash-workflow"
created_on: 2025-12-10T13:39:04+03:30
authors: ["Megacodist"]
status: "published"
tags: []
---

# Merging Feature Branch Using The Linear Squash Workflow

## The Philosophy

**We do not merge mess.**

Development involves trial and error. Your local history contains typos, broken builds, and "wip" commits. The `main` branch does not care about your struggle; it only cares about the result.

This workflow ensures that when your feature lands on `main`, it appears as a single, atomic, verified unit of work.

## Step 1: Sync and Rebase (The "Pre-Flight" Check)

**Objective:** Resolve integration conflicts on *your* machine, not in the public PR.

Before you push your final code, you must place your work on top of the latest `main`.

```bash
# 1. Switch to main and get the latest code from the team
git checkout main
git pull origin main

# 2. Switch back to your feature branch
git checkout x-feature

# 3. Rebase: Unplug your commits and replay them on top of the new main
git rebase main
```

**If you hit conflicts:**

1.  Git will pause. Open the conflicting files and resolve the code.
2.  Stage the fixed files: `git add <file>` individually or `git add .` collectively
3.  Continue the rebase: `git rebase --continue`
    *(Note: Do not run `git commit` during a rebase conflict loop.)*

## Step 2: The Safer Force-Push

**Objective:** Update the remote server with your rewritten history.
Because you rebased, your local branch history no longer matches the remote branch history. Standard `git push` will fail. You must force it.

```bash
# --force-with-lease protects you if a teammate pushed to YOUR branch
git push origin x-feature --force-with-lease
```

## Step 3: The Pull Request

**Objective:** Human review and automated verification.

1.  Open the PR on your hosting provider (GitHub/GitLab).
2.  **Wait for CI:** If tests fail, fix them locally, amend your commit, and force-push again.
3.  **Wait for Review:** Address comments.

## Step 4: Squash and Merge (The Execution)

**Objective:** Compress history.
**Do not** use the default "Create Merge Commit."
1.  On the PR interface, select the dropdown arrow next to the merge button.
2.  Choose **Squash and Merge**.
3.  **Finalize the Message:** This message will become the permanent record in `main`. Ensure it describes the *entire* feature.
4.  Confirm.

*Result: Your 20 local commits become 1 commit on `main`.*

## Step 5: Hard Cleanup

**Objective:** Remove dead branches.
Because you "Squashed," Git does not see your local `x-feature` branch as merged (the commit hashes are different). You must force-delete it to avoid clutter.

```bash
# 1. Update your local main to download the new squashed commit
git checkout main
git pull origin main

# 2. Force delete the feature branch
git branch -D x-feature
```

*(Note: Capital `-D` is required. Lowercase `-d` will throw a warning and fail.)*
