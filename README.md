# OneCoolThing — website (`web` branch)

This branch holds **only the source of the GitHub Pages site** (served at [matveyao.io](https://matveyao.io)).
The lessons and scripts live on [`main`](https://github.com/000Matvey000/OneCoolThing/tree/main), so committing
there never triggers a site build. Pushing to `web` builds and deploys the site through GitHub Actions.

## Stack

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix base, `components.json` is set up for the CLI)
- [Motion](https://motion.dev) for page transitions, reveals and micro-interactions
- A hand-rolled canvas simulation for the interactive ocean background (no dependencies)

## Develop

```bash
npm install
npm run dev       # local dev server
npm run lint      # oxlint
npm run build     # production build -> dist/
npm run preview   # serve the production build
```

Add more shadcn components with `npx shadcn@latest add <component>`.

## Structure

```text
.github/workflows/deploy.yml   build + deploy to GitHub Pages on push to `web`
public/                        copied as-is (CNAME, favicon, legacy pong.html redirect)
src/
  assets/img/                  logos and profile picture (imported, so they get hashed)
  components/
    background/                OceanBackground + the framework-agnostic OceanScene simulation
    common/                    SpotlightCard, Reveal, RotatingWords, ThemeToggle, …
    games/                     GameShell shared by the arcade pages
    home/                      hero, links, arcade and repo sections
    layout/                    header, footer, ⌘K command menu, page transitions
    ui/                        shadcn/ui components
  data/                        site.js + social-links.js — edit these to change content
  hooks/                       preferences (theme + animations), section navigation, GitHub categories
  pages/                       home, pong, emoji-flap
```

## Editing content

- **Links:** `src/data/social-links.js` (label, handle, description, logo per theme, `featured` for wide cards).
- **Name, tagline, rotating words, repo info:** `src/data/site.js`.
- **Colours:** the CSS variables at the top of `src/index.css` (`--brand-*`, `--glow-*`, `--blob-*`).
- **Background behaviour:** constants and palettes at the top of `src/components/background/ocean-scene.js`.

## Accessibility & performance

- Respects `prefers-reduced-motion`; visitors can also pause all animations from the footer or the ⌘K menu.
- The background runs on a single `requestAnimationFrame` loop that pauses when the tab is hidden; creature counts scale with screen size.
- The game pages are code-split and only load when opened.

## Deployment setup (one time)

1. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
2. **Settings → Environments → `github-pages` → Deployment branches and tags:** add `web`
   (by default only the default branch may deploy to this environment).
3. Re-run the latest **Deploy site** workflow, or push to `web`.

The custom domain set in the Pages settings carries over; `public/CNAME` is kept for reference.
