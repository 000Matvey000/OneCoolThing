# Deploy GitHub Pages from a dedicated branch

**Keep your site's source on its own branch so commits to `main` never trigger a Pages build.**

This repo does exactly that: the lessons live on `main`, and the website
([matveyao.io](https://matveyao.io)) lives on the [`web`](https://github.com/000Matvey000/OneCoolThing/tree/web) branch.

---

## Why?

The classic setup (*Deploy from a branch → `main` → `/docs`*) has two annoyances:

1. **Every** push to `main` kicks off a Pages build, even when you only touched a SQL script.
2. You have to commit the *built* site (`docs/`) next to your source, which clutters diffs and history.

## The setup

1. Create an orphan branch that holds only the site's source:

   ```bash
   git switch --orphan web
   # add your site's source, package.json, etc.
   git commit -m "Site source"
   git push -u origin web
   ```

   An orphan branch shares no history with `main`, so GitHub never offers to merge one into the other.

2. Add a workflow **on the `web` branch only** (`.github/workflows/deploy.yml`):

   ```yaml
   on:
     push:
       branches: [web]

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v7
         - uses: actions/setup-node@v7
           with: { node-version: 24, cache: npm }
         - run: npm ci && npm run build
         - uses: actions/upload-pages-artifact@v5
           with: { path: dist }
     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
       steps:
         - id: deployment
           uses: actions/deploy-pages@v5
   ```

   GitHub runs the workflow files *from the branch that was pushed*. `main` has no workflow, so
   pushes there do nothing.

   New to workflows? [GitHubActions](../GitHubActions/) walks through this exact file line by line.

3. In **Settings → Pages**, set **Source** to **GitHub Actions**.

4. In **Settings → Environments → `github-pages`**, add `web` under **Deployment branches and tags**.
   By default only the default branch (`main`) is allowed to deploy, and the deploy job fails with
   *"Branch web is not allowed to deploy to github-pages"* until you do this.

## Gotchas

- A custom domain is configured in **Settings → Pages**; with Actions deployments a `CNAME` file in the
  build is not required.
- Switching between orphan branches leaves the other branch's *ignored* files (like `node_modules`) on disk.
  Add each branch's leftovers to the other branch's `.gitignore` to keep `git status` clean.

---

Part of [OneCoolThing](../../../README.md) · One lesson, one trick, one cool thing.
