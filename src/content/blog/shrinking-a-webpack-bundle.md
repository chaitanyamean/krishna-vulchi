---
title: "Shrinking a webpack bundle when code-splitting isn't on the table"
description: "Notes on cutting a single-file bundle down when your deployment pipeline won't let you split it."
date: 2026-08-15
tags: ["frontend", "webpack", "performance"]
draft: true
---

Most bundle-size advice starts with "just code-split it." That's the
right answer when your pipeline ships a `dist/` folder. It's not an
option when the deployment step only picks up one `bundle.js` and
nothing else — which is a more common constraint than the blog posts
admit.

This is a placeholder — replace this with the real write-up: what you
tried, what actually moved the needle (dependency audits, lighter
library swaps, Terser tuning, compression), and what didn't.
