---
title: "Clean Up Git History by Merging Commits with the Same Message"
slug: "clean-up-git-history-by-merging-commits-with-the-same-message"
created_on: 2025-11-20T11:22:20+03:30
authors: ["Megacodist"]
status: "published"
tags: []
---

# Clean Up Git History by Merging Commits with the Same Message

This tutorial will guide you through rewriting your Git history on the `main` branch to combine consecutive commits that have the same message. We will use an interactive rebase and the `fixup` command to create a cleaner, more readable project history.

**Goal:** Transform multiple commits like this:

- `Overhauling design`
- `Overhauling design`
- `Overhauling design`

Into a single, clean `Overhauling design` commit.

**Prerequisites:** You are inside your local Git repository, on the `main` branch.

## Backup Your Current Branch

Rewriting history is a destructive operation. The most important first step is to create a backup of your branch. If anything goes wrong, you can easily revert to this backup.

*   **Command:**
    ```bash
    git branch history
    ```

*   **Explanation:**
    This command creates a new branch named `history` that points to the current state of your `main` branch. Think of it as a safe bookmark you can return to.

## Start an Interactive Rebase from the Root

We will use an interactive rebase to select and edit every commit in the repository's history from the very beginning.

*   **Command:**
    ```bash
    git rebase -i --root
    ```

*   **Explanation:**
    *   `git rebase -i` initiates an **i**nteractive rebase.
    *   The `--root` flag tells Git to include every commit in the current branch's history, starting from the very first one. This is useful when you want to clean up the entire history, not just the last few commits.

After running this command, your default text editor (we set it to Vim) will open, showing a list of all commits in chronological order (oldest at the top).

## Edit the Rebase To-Do List

This is where you'll tell Git how to combine the commits. Each line represents a commit, starting with the word `pick`. You will change `pick` to `fixup` for the commits you wish to merge.

### Quick Guide to Using the Vim Editor

*   **Modes:** Vim has two main modes you'll use: **Normal Mode** (for commands) and **Insert/Replace Mode** (for typing). You start in Normal Mode.

*   **Entering Insert/Replace Mode:** To start editing text, press the `i` key or the `Insert` key on your keyboard. Pressing `i` will **i**nsert text where the cursor is. Pressing the `Insert` key often toggles between inserting text and **r**eplacing (overwriting) text. For this task, either will work fine. You should see `-- INSERT --` or `-- REPLACE --` at the bottom of the editor.

*   **Returning to Normal Mode:** When you are finished typing, press the `Esc` key to return to Normal Mode. The text at the bottom will disappear.

### Understanding `squash` vs. `fixup`

*   `squash`: Merges this commit into the one above it. Git then pauses the rebase and prompts you to write a new, combined commit message.

*   `fixup`: This is a faster version of `squash`. It merges the commit into the one above it and **automatically discards this commit's message**, keeping the message from the commit it's being merged into. This is perfect for our use case since the messages are identical.

### Editing the Commit List

Your task is to change the word `pick` to `fixup` (or its shorthand `f`) for each commit you want to merge into the one directly above it. The first commit in each group of identical messages should remain as `pick`.

**Your editor will open with a file looking like this:**

```bash
pick 04c608d Random data done
pick e2c16d51 uvicorn server added
pick 5283c61e Random ints developing
pick f566b743 Random ints developing
pick 3ecc8578 Random ints developing
pick 1d39a37a Random ints developing
pick 3bfd1d5b Random ints developing
pick 1decf796 Random ints developing
pick 871d5a18 Developing dark/light theme
pick 9331b9fb Developing dark/light theme
pick f7c25aaf Developing dark/light theme
pick 2a879cba Developing dark/light theme
pick 4aa80134 Developing dark/light theme
pick 2c2fc528 Developing dark/light theme
pick 77ee47c8 Overhauling design
pick d0fb607e Overhauling design
pick e0296559 Overhauling design
pick 7fee87f9 Overhauling design
pick febe3467 Overhauling design
pick db53a42d Overhauling design

# Rebase db53a42 onto 8ead903 (20 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup [-C | -c] <commit> = like "squash" but keep only the previous
#                    commit's log message, unless -C is used, in which case
#                    keep only this commit's message; -c is same as -C but
#                    opens the editor
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
#         create a merge commit using the original merge commit's
#         message (or the oneline, if no original merge commit was
#         specified); use -c <commit> to reword the commit message
# u, update-ref <ref> = track a placeholder for the <ref> to be updated
#                       to this position in the new commits. The <ref> is
#                       updated at the end of the rebase
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
```

**Change it to look like this:**

```bash
pick 04c608d Random data done
pick e2c16d51 uvicorn server added
pick 5283c61e Random ints developing
fixup f566b743 Random ints developing
fixup 3ecc8578 Random ints developing
fixup 1d39a37a Random ints developing
fixup 3bfd1d5b Random ints developing
fixup 1decf796 Random ints developing
pick 871d5a18 Developing dark/light theme
fixup 9331b9fb Developing dark/light theme
fixup f7c25aaf Developing dark/light theme
fixup 2a879cba Developing dark/light theme
fixup 4aa80134 Developing dark/light theme
fixup 2c2fc528 Developing dark/light theme
pick 77ee47c8 Overhauling design
fixup d0fb607e Overhauling design
fixup e0296559 Overhauling design
fixup 7fee87f9 Overhauling design
fixup febe3467 Overhauling design
fixup db53a42d Overhauling design
```

### Saving and Quitting the Editor

Once you have finished editing:

1.  Press `Esc` to ensure you are in Normal Mode.

2.  Type one of these commands and press `Enter`:
    *   `:wq` - This will **w**rite (save) your changes and **q**uit the editor.
    *   `:q!` - This will **q**uit without saving. Use this if you make a mistake and want to start over.

Git will now automatically perform the rebase according to your instructions.

## Verify the New History

After the rebase completes successfully, inspect your Git log to confirm the changes.

*   **Command:**
    ```bash
    git log --oneline --graph
    ```

*   **Explanation:**
    This command shows a compact, graphical view of your commit history. You should now see a much cleaner timeline, with only one commit for each group of tasks you just combined.

## Push Your Changes to the Remote Repository

Because you have rewritten history, you cannot use a normal `git push`. You must force the push. However, a standard force push is risky on shared branches. We'll use a safer alternative.

### Understanding `--force` vs. `--force-with-lease`

*   `--force`: Unconditionally overwrites the remote branch. If a teammate has pushed changes to the branch while you were working, **their work will be deleted forever**. Avoid using this on shared branches.

*   `--force-with-lease`: This is a much safer option. It checks to make sure no one else has pushed to the remote branch since you last fetched. If the remote branch has new commits, this command will fail, preventing you from accidentally overwriting your teammate's work. **This is the recommended method.**

*   **Command:**
    ```bash
    git push --force-with-lease origin main
    ```

*   **Explanation:**
    This command will safely update the remote `main` branch with your new, cleaner history.

Congratulations! You have successfully cleaned up your Git history by merging consecutive commits.
