# Contribution workflow

All changes start with a GitHub issue and are merged into the `dev` branch through a pull request.

## 1. Create or claim an issue

Create a GitHub issue using the appropriate template. Describe the problem or feature, expected outcome, acceptance criteria, and any relevant screenshots or API details.

Assign the issue to yourself before beginning work. Note its number as `ISSUE_NUMBER` in the commands below.

## 2. Create a branch from `dev`

Start with an up-to-date local `dev` branch:

```bash
git switch dev
git pull --ff-only origin dev
```

Create a focused branch whose name includes the issue number:

```bash
git switch -c feat/ISSUE_NUMBER-short-description
```

Use `fix/ISSUE_NUMBER-short-description` for bug fixes, `docs/ISSUE_NUMBER-short-description` for documentation, and `chore/ISSUE_NUMBER-short-description` for maintenance work.

## 3. Implement and validate

Keep the change limited to the issue's acceptance criteria. Run the relevant checks before committing:

```bash
npm run lint
npm run build
```

Update the issue if the scope changes or a decision needs review.

## 4. Commit and push

Review the changes, then create a concise conventional-style commit that references the issue:

```bash
git status
git diff
git add <files>
git commit -m "feat: add short description (#ISSUE_NUMBER)"
git push -u origin feat/ISSUE_NUMBER-short-description
```

Use `fix:`, `docs:`, or `chore:` when appropriate. Do not commit secrets, local `.env` files, generated dependencies, or unrelated formatting changes.

## 5. Open a pull request to `dev`

Create the pull request with `dev` as its base branch, link it to the issue with `Closes #ISSUE_NUMBER`, and complete the pull request template.

With the GitHub CLI:

```bash
gh pr create --base dev --head feat/ISSUE_NUMBER-short-description --fill
```

Or open the branch on GitHub and choose **Compare & pull request**, then set the base branch to `dev`.

Request review, address feedback with follow-up commits, and keep the branch current with `dev` if merge conflicts arise. Merge only after required checks and approvals pass.

## Pull request checklist

- The PR targets `dev`, not `master`.
- The description includes `Closes #ISSUE_NUMBER`.
- Lint and production build pass locally.
- The PR is focused, documented, and includes UI screenshots when applicable.
