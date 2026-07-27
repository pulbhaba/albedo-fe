# Codex contribution workflow

Follow this workflow for every repository change. The project uses an
issue-to-pull-request process: changes are merged into `dev` through a focused
pull request.

## Start a task

1. Read the relevant code, `README.md`, and this file before editing.
2. Check `git status` and preserve unrelated working-tree changes.
3. Find or create the GitHub issue using the appropriate template. Make sure it
   describes the problem or feature, expected outcome, acceptance criteria, and
   relevant screenshots or API details. Assign it to the task owner and record
   its number as `ISSUE_NUMBER`.
4. Start from an up-to-date `dev` branch:

   ```bash
   git switch dev
   git pull --ff-only origin dev
   ```

5. Create a focused branch from `dev`:

   ```bash
   git switch -c feat/ISSUE_NUMBER-short-description
   ```

   Use `fix/` for bug fixes, `docs/` for documentation, and `chore/` for
   maintenance work.
6. Before changing code, state a concise plan when the task affects multiple
   files or areas. Keep the work within the issue's acceptance criteria. If the
   scope changes or a decision needs review, update the issue and ask for
   direction when needed.

## Implement and validate

- Follow the established Vue 3, Vue Router, Pinia, Axios, and Tailwind patterns
  already present in the codebase.
- Prefer the smallest safe change. Do not introduce dependencies unless they are
  necessary for the issue and the reason is clear.
- Do not add secrets, local `.env` files, generated dependencies, or unrelated
  formatting changes.
- Run the relevant checks before committing:

  ```bash
  npm run lint
  npm run build
  ```

- If a check cannot be run or fails for a reason outside the task, report it
  clearly rather than hiding it.

## Finish a task

1. Review the final changes:

   ```bash
   git status
   git diff
   ```

2. Commit only the intended files with a concise conventional-style message
   that references the issue, for example:

   ```bash
   git add <files>
   git commit -m "feat: add short description (#ISSUE_NUMBER)"
   ```

   Use `fix:`, `docs:`, or `chore:` when appropriate.
3. Push the branch:

   ```bash
   git push -u origin feat/ISSUE_NUMBER-short-description
   ```

4. Open a pull request targeting `dev`, never `master`. Link the issue with
   `Closes #ISSUE_NUMBER`, complete the PR template, and include UI screenshots
   when applicable:

   ```bash
   gh pr create --base dev --head feat/ISSUE_NUMBER-short-description --fill
   ```

5. Request review, address feedback with follow-up commits, and keep the branch
   current with `dev` when needed to resolve merge conflicts. Merge only after
   all required checks and approvals pass.

## Handoff report

At the end of every task, report the issue and branch, files changed, behavior
implemented, validation commands and results, and the pull-request URL or any
remaining blocker.

## Permissions and safety

Creating issues, assigning people, pushing branches, opening pull requests,
requesting reviews, and merging are external actions. Perform them only when
the user's request authorizes them; otherwise prepare the work and report the
exact next command or action needed.
