# Copilot instructions for Ursa fab.

## Project commands

Run commands from the repository root. The project requires Node.js `>=22.12.0`.

```sh
npm install
npm run dev
npm run build
npm run preview
npm run astro check
```

- `npm run dev` starts the Astro development server at `http://localhost:4321`.
- For this repository's background-server workflow, use `astro dev --background`; manage it with `astro dev status`, `astro dev logs`, and `astro dev stop`.
- `npm run build` creates the production static site in `dist/`. This is the primary validation used by the GitHub Pages deployment.
- `npm run preview` serves the built `dist/` output locally.
- `npm run astro check` runs Astro's type and template checks.
- There is currently no configured test runner, single-test command, or lint/format script. Do not invent test commands; use `astro check` and `npm run build` for the available automated validation.

## Architecture

- This is a static Astro site deployed to GitHub Pages. `astro.config.mjs` sets the canonical site URL to `https://ursafab.co.uk`.
- File-based routes live in `src/pages/`: `index.astro`, `about.astro`, `services.astro`, and `portfolio.astro` become the corresponding site routes. Keep internal links in the existing trailing-slash style.
- `src/layouts/Layout.astro` is the shared HTML shell. It owns the document metadata, fonts, favicon links, global stylesheet import, and the menu's client-side behavior. Pages should normally render their content inside this layout rather than duplicating document markup.
- `src/components/Header.astro` is shared by every page. It accepts an `alwaysVisible` prop for interior pages; the home page relies on `src/pages/index.astro`'s scroll handler to reveal the header after the hero.
- The home page composes `Header`, `Hero`, and `GalleryCard`. Its inline browser script controls header/hero scroll state and activates gallery cards with `IntersectionObserver`.
- Static images and other directly served assets belong in `public/` and are referenced with root-relative URLs such as `/about.jpeg`. Astro emits the generated site into `dist/`; do not edit generated files.
- Styling is primarily centralized in `src/styles/global.css`, which contains typography, shared navigation/header, home-page, content-page, responsive, and reduced-motion rules. `src/styles/services-styles.css` and `src/styles/portfolio-styles.css` contain page-specific style definitions; check how a stylesheet is imported before adding or moving rules.
- GitHub Actions deploys on pushes to `main` and manual dispatches. The workflow uses `withastro/action` to build/upload the site and `actions/deploy-pages` to publish it, so changes to build output or the configured site URL can affect production deployment.

## Repository conventions

- Use `.astro` components and Astro frontmatter imports for site composition. Define component prop shapes with a local TypeScript `interface` when a component accepts props, as `GalleryCard.astro` does.
- Prefer shared components for repeated chrome and behavior. Keep page-specific content in its route file and shared document behavior in `Layout.astro`.
- Preserve the existing visual language: class names are semantic kebab-case selectors (for example `site-header`, `gallery-card`, and `content-copy`), and responsive behavior is implemented with CSS media queries in the existing stylesheets.
- Preserve accessibility details already used throughout the site: meaningful image `alt` text, landmark elements, `aria-label`/`aria-expanded`/`aria-hidden` state for the menu, keyboard Escape handling, and `rel="noopener noreferrer"` on external links opened in a new tab.
- Keep external social/contact destinations as explicit links in the existing components/pages. Use root-relative paths for internal navigation and assets.
- When changing client-side scripts, preserve null-safe DOM lookups and update the related ARIA state together with visual classes. The menu script runs from the shared layout, while home-only scroll/gallery behavior stays in `index.astro`.
- Keep the site's content and branding wording intact unless the requested change is specifically editorial; page titles follow the existing `Title | Ursa fab.` pattern for interior routes.

## Documentation and project guidance

- `AGENTS.md` contains the repository's Astro development-server guidance and links to the relevant Astro documentation. Follow those links when changing routing, components, framework integrations, content collections, styling, or internationalization.
- `README.md` contains the starter Astro command reference; this file records the repository-specific architecture and current validation details.
