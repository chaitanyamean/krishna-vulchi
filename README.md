# Portfolio + Blog (Astro)

A fast, static portfolio-and-notebook site, structurally inspired by
arpitbhayani.me: a short bio up top, then a running blog you can write
into about anything — DNS, AI reliability, PWAs, whatever you're deep in
that week — plus a projects page for things you've actually shipped.

## Before you run it

Search the project for `Krishna Chaitanya Vulchi` and swap in your real name (it's in
`src/components/Header.astro`, `src/components/Footer.astro`, and the
page `<title>`s in `src/pages/*.astro`). Also update the GitHub/LinkedIn
links in `src/components/Footer.astro`, and the `site` URL in
`astro.config.mjs` once you've picked a domain.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:4321.

## Write a blog post

Add a new Markdown (or `.mdx`) file to `src/content/blog/`:

```markdown
---
title: "Your post title"
description: "One sentence for the listing page and SEO."
date: 2026-09-01
tags: ["dns", "networking"]
---

Write in Markdown here. Headings, code blocks, lists — all supported.
```

It shows up automatically on `/blog` and the homepage, newest first.
Set `draft: true` in the frontmatter to keep a post out of the public
listing while you're still writing it (see `shrinking-a-webpack-bundle.md`
for an example — delete that file once you've either finished or
discarded it).

## Add a project

Projects currently live as plain data in `src/pages/index.astro` and
`src/pages/projects.astro` (a `projects` array) rather than a content
collection, since there are only a handful and they change rarely. Add
an object with `name`, `tagline`, `stack`, and optionally `href` and
`status`.

## Build & deploy

```bash
npm run build   # outputs static files to dist/
npm run preview # sanity-check the production build locally
```

The output in `dist/` is plain static HTML/CSS/JS — it deploys the same
way to any of these, no code changes needed:

- **Vercel** — import the GitHub repo, framework preset "Astro" is
  auto-detected, no config needed.
- **Netlify** — same, auto-detects Astro; build command `npm run build`,
  publish directory `dist`.
- **GitHub Pages** — set `site` (and `base` if not using a custom
  domain) in `astro.config.mjs`, then use the official
  `withastro/action` in a GitHub Actions workflow, or push the `dist/`
  folder to a `gh-pages` branch.

## What's in here

```
src/
  content/blog/       your posts (Markdown/MDX)
  content/config.ts   frontmatter schema for posts
  components/         Header, Footer, PostCard, ProjectCard
  layouts/             Layout.astro (base HTML shell), BlogPost.astro
  pages/
    index.astro        home — bio, recent posts, recent projects
    projects.astro      full projects list
    blog/index.astro    full blog archive
    blog/[...slug].astro  individual post pages (auto-generated)
    rss.xml.js           RSS feed at /rss.xml
  styles/global.css     design tokens (colors, type, spacing)
```
