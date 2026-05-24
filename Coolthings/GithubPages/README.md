# GitHub Pages

## What is GitHub Pages?

GitHub Pages is a free static site hosting service built into GitHub. It takes files from a repository and serves them as a website — no server, no backend, no cost.

**What it can host:**

- Personal portfolio / resume sites
- Project documentation
- Blogs (via Jekyll)
- Frontend web apps (React, Vue, etc.)
- Any static HTML/CSS/JS

**What it cannot do:**

- Run server-side code (Node, Python, PHP, etc.)
- Connect to a database directly
- Handle form submissions natively (need a third-party service)

---

## How It Works

GitHub Pages reads files from a specific source in your repo and serves them at a URL. There is no build server involved unless you use Jekyll or GitHub Actions.

**URL format:**

| Type | URL |
| --- | --- |
| User/org site | `https://username.github.io` |
| Project site | `https://username.github.io/repo-name` |
| Custom domain | `https://yourdomain.com` |

---

## Beginner: Getting Started

### Step 1 — Create a repo - if you don't have one already

For a personal site, the repo **must** be named exactly: `username.github.io`
If you user name is `000Matvey000`, the repo must be `000Matvey000.github.io`:

```text
username = your GitHub username (exact case)
repo name = username.github.io
```

For a project site, any repo name works.

### Step 1A - if you have a repo but it's not named `username.github.io`

If you want to use an existing repo that isn't named `username.github.io`, you can still host a project site at `https://username.github.io/repo-name`. Just enable Pages in the repo settings and choose the source branch/folder.

### Step 2 — Add an index.html

This can be done in the root of the repo or in a `/docs` folder (you choose the source when enabling Pages). The file must be named `index.html` — this is the default page that loads when someone visits your site.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Site</title>
  </head>
  <body>
    <h1>Hello, GitHub Pages!</h1>
  </body>
</html>
```

### Step 3 — Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, choose a branch (usually `main`) and folder (`/` root or `/docs`)
3. Click **Save**
4. Wait ~1 minute, then visit your URL

### Step 4 — Push changes

Every `git push` to the source branch automatically redeploys the site. No extra steps needed.

---

## Source Options

When configuring Pages, you choose where GitHub reads files from:

| Source | Use case |
| --- | --- |
| `main` branch, `/` root | Everything in the repo is the site |
| `main` branch, `/docs` folder | Keep source code and site files in the same repo |
| `gh-pages` branch | Dedicated branch for generated/built output |
| **GitHub Actions** | Full control — build anything, deploy anywhere |

The `/docs` folder approach is useful when your repo is a code project but you also want a docs site alongside it.

---

## Intermediate: Jekyll

GitHub Pages has **built-in Jekyll support**. Jekyll is a static site generator — it converts Markdown files + templates into HTML automatically.

### Why use Jekyll?

- Write content in Markdown instead of raw HTML
- Use layouts and includes (no copy-pasting nav bars)
- Built-in blog support
- Hundreds of themes available

### Minimal Jekyll structure

```text
my-site/
├── _config.yml       ← site settings
├── _layouts/
│   └── default.html  ← HTML template
├── _posts/
│   └── 2026-05-24-first-post.md
├── index.md
└── about.md
```

### `_config.yml`

```yaml
title: My Site
description: A personal site
theme: minima        # built-in GitHub Pages theme
url: "https://username.github.io"
```

### A layout file (`_layouts/default.html`)

```html
<!DOCTYPE html>
<html>
  <head><title>{{ page.title }}</title></head>
  <body>
    <nav><a href="/">Home</a> | <a href="/about">About</a></nav>
    {{ content }}
  </body>
</html>
```

### A content page (`index.md`)

```markdown
---
layout: default
title: Home
---

# Welcome

This content gets injected into `{{ content }}` above.
```

The `---` block at the top is called **front matter** — YAML metadata Jekyll reads for each page.

### Writing blog posts

Files in `_posts/` must follow this naming convention:

```text
YYYY-MM-DD-title-with-dashes.md
```

Example: `_posts/2026-05-24-my-first-post.md`

```markdown
---
layout: post
title: "My First Post"
date: 2026-05-24
---

Post content goes here.
```

Posts are automatically listed if your theme supports it, or you can loop over them manually:

```html
{% for post in site.posts %}
  <a href="{{ post.url }}">{{ post.title }}</a> — {{ post.date | date: "%B %d, %Y" }}
{% endfor %}
```

### Built-in themes (no install needed)

These work by just setting `theme:` in `_config.yml`:

- `minima` — clean, minimal blog theme
- `jekyll-theme-cayman` — project page theme
- `jekyll-theme-slate` — dark project theme
- `jekyll-theme-hacker` — terminal aesthetic

---

## Intermediate: Custom Domain

### Step 1 — Buy a domain

Any registrar works (Namecheap, Google Domains, Cloudflare, etc.).

### Step 2 — Add a CNAME file

Create a file named `CNAME` (no extension) in your repo root:

```text
yourdomain.com
```

### Step 3 — Configure DNS

At your registrar, add these DNS records:

**For an apex domain (`yourdomain.com`)** — add four A records:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

This may take some time to propagate (up to 24-48 hours, but often much faster).

**For a `www` subdomain** — add a CNAME record:

```text
www  →  username.github.io
```

In Cloudflare enter type CNAME, name `www`, target `username.github.io`, TTL auto. If your site has a folder source (e.g. `/docs`), still point to `username.github.io` — GitHub handles the routing.

### Step 4 — Enable HTTPS

In **Settings → Pages**, check **Enforce HTTPS** (available once DNS propagates, usually within an hour).

---

## Advanced: GitHub Actions Deploy Pipeline

For sites that need a build step (React, Vue, TypeScript, etc.), use GitHub Actions instead of direct branch serving.

### Example: Deploy a Vite/React app

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/         # your build output folder

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

In your GitHub repo **Settings → Pages**, set the source to **GitHub Actions**.

### Why this matters

Without Actions, Pages only serves static files as-is. With Actions you can:

- Build TypeScript/JSX before deploying
- Run a linter or tests as a gate
- Pull in data at build time (API calls, CMS)
- Deploy to Pages AND another host simultaneously

---

## Advanced: Deploying a React App with `base` Path

Project sites live at `/repo-name/`, not `/`. This breaks React Router and asset paths.

**Fix in `vite.config.js`:**

```js
export default {
  base: '/repo-name/',
}
```

**Fix for React Router (HashRouter):**

```jsx
import { HashRouter } from 'react-router-dom';

// Use HashRouter instead of BrowserRouter for GitHub Pages
// URLs become: username.github.io/repo-name/#/about
```

Or use the `BrowserRouter` + a 404.html redirect trick (search "spa-github-pages").

---

## Advanced: Multiple Environments

You can deploy different branches to different URLs using environments in Actions:

```yaml
on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    steps:
      - name: Set base URL
        run: echo "BASE_URL=${{ github.ref == 'refs/heads/main' && 'https://yourdomain.com' || 'https://username.github.io/staging' }}" >> $GITHUB_ENV
```

---

## Common Design Patterns

### Pattern 1: Docs alongside code (`/docs` folder)

```text
my-project/
├── src/              ← application code
├── tests/
├── docs/             ← GitHub Pages source
│   ├── index.md
│   └── api.md
└── README.md
```

Set Pages source to `main` branch, `/docs` folder. Code and docs live together, versioned together.

### Pattern 2: Separate `gh-pages` branch

Keep built output on a dedicated branch so `main` stays clean:

```bash
# Manually (one-time setup)
git checkout --orphan gh-pages
git rm -rf .
echo "<h1>Site</h1>" > index.html
git add . && git commit -m "init gh-pages"
git push origin gh-pages
```

Most teams automate this with a GitHub Action (see the deploy workflow above) rather than doing it manually.

### Pattern 3: Monorepo with multiple sites

One repo, multiple projects, multiple Pages sites:

```text
monorepo/
├── packages/
│   ├── docs/          → deploy to /docs subdomain
│   └── marketing/     → deploy to apex domain
└── .github/workflows/
    ├── deploy-docs.yml
    └── deploy-marketing.yml
```

Each workflow deploys its folder independently using path filters:

```yaml
on:
  push:
    paths: ['packages/docs/**']
```

### Pattern 4: Data-driven static site

Fetch data at build time so the static HTML contains real content:

```js
// fetch-data.js — runs during CI before build
const res = await fetch('https://api.example.com/posts');
const posts = await res.json();
fs.writeFileSync('src/data/posts.json', JSON.stringify(posts));
```

```yaml
# In your workflow
- run: node fetch-data.js
- run: npm run build
```

The deployed site is fully static but contains fresh data from the last build.

---

## Quick Reference

| Task | How |
| --- | --- |
| Enable Pages | Settings → Pages → choose source branch |
| Force redeploy | Push any commit to the source branch |
| Check deploy status | Actions tab → Pages Build and Deployment workflow |
| Debug 404 errors | Check branch name, folder, and `index.html` exists |
| Add custom domain | CNAME file + DNS A records + enable HTTPS in Settings |
| Use React/Vue | GitHub Actions workflow with a build step |
| Fix asset paths | Set `base` in your bundler config to `/repo-name/` |

---

## Limits

| Resource | Limit |
| --- | --- |
| Site storage | 1 GB |
| Monthly bandwidth | 100 GB (soft limit) |
| Build time (Jekyll) | 10 minutes |
| Deploys per hour | 10 |

For high-traffic sites, GitHub Pages is fine as an origin but consider putting Cloudflare in front of it.
