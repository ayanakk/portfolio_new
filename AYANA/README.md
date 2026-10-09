# Portfolio v2 — "Monochrome Editorial"

Same content and structure as the original portfolio, redesigned with a
minimal, high-end monochrome aesthetic: near-black ink, soft paper white,
refined grays, and frosted-glass surfaces. Hierarchy comes from contrast
and typography rather than color.

## Design
- **Palette:** pure grayscale — `#18181b` ink on a soft `#f4f4f4` canvas,
  with a single graphite gradient for buttons, fills, and marks. No color.
- **Surfaces:** frosted-glass cards (`backdrop-filter` blur), rounded
  geometry, soft neutral shadows.
- **Type:** Sora (display) + Plus Jakarta Sans (body), Space Mono for the code card.
- **Motion:** calm and restrained. The hero portrait is fully static (no
  float, no parallax, no mouse tilt). Subtle scroll-reveal, hover lifts, and
  a faint monochrome particle field remain, and everything respects
  `prefers-reduced-motion`.
- Experience, projects, education, skills and about copy are sourced from `AYANA_KK_CV.pdf`; the KPI stat cards are unchanged from v1.

## Scroll film
A scroll-scrubbed background animation ("Layer Stack": a frosted-glass stack
the camera descends as you scroll) lives in `src/components/ScrollFilm.tsx`.
- Top of page = first frame (almost empty, so the hero stays clean); bottom of
  page = last frame. It is drawn on a canvas from a WebP frame sequence, with
  the two nearest frames blended for smooth motion at any scroll speed.
- Frames: `public/assets/scroll/d/` (landscape, 1280px) and
  `public/assets/scroll/m/` (phones in portrait, 9:16 crop), 161 each, plus
  `public/assets/scroll/poster.webp` (first frame / reduced-motion fallback).
  The ungraded master is `reference/scroll-source.mp4`.
- Frames are graded to grayscale on pure white and blended with
  `mix-blend-mode: multiply`, so they melt into the `#f4f4f4` canvas. Tune the
  strength with `--film-opacity` on `.scroll-film` in `src/index.css`.
- Regenerate the frames from the master:
  ```bash
  LUT="format=gray,lutyuv=y='clip(255-(255-clip((val-16)*255/224\,0\,255))*1.45\,0\,255)'"
  ffmpeg -i reference/scroll-source.mp4 -vf "fps=16,$LUT,scale=1280:-2" -c:v libwebp -quality 70 -start_number 0 public/assets/scroll/d/%03d.webp
  ffmpeg -i reference/scroll-source.mp4 -vf "fps=16,crop=608:1080:(iw-608)/2:0,$LUT,scale=540:960" -c:v libwebp -quality 70 -start_number 0 public/assets/scroll/m/%03d.webp
  ```
  If the frame count changes, update `FRAME_COUNT` in `ScrollFilm.tsx`.

## Smooth scrolling
`src/hooks/useSmoothScroll.ts` adds inertia scrolling for mouse wheels and
trackpads (keyboard, scrollbar, anchor links and touch stay native). It is off
on touch-first devices and under `prefers-reduced-motion`. Adjust the feel with
`LERP` (lower = floatier).

## Projects
The Work section shows compact thumbnail cards; clicking one opens a pop-up
with the animated workflow, problem/solution/result, contribution, steps and
stack. Content lives in `projects` in `src/data.ts`; thumbnails are
`public/assets/projects/<slug>.webp` (720px). Full-size originals are kept in `reference/project-originals/`.

## Run it
```bash
cd v2
npm run dev      # start the dev server (Vite)
# or
npm run build && npm run preview   # production build + preview
```

Then open the printed local URL (usually http://localhost:5173).

Built with React 19 + TypeScript + Vite. Fully responsive.

## Performance & accessibility notes
- `vercel.json` sets long-lived immutable caching on `/assets/scroll/*`, `/assets/projects/*` and the hashed JS/CSS.
  **If you regenerate frames or thumbnails, rename the files (or the folder) so visitors pick up the new ones.**
- The scroll film starts downloading after the page `load` event (so it never competes with the hero portrait),
  fetches every 2nd frame on phones / 3G (the renderer cross-fades between loaded neighbours) and shows only the
  poster on 2G, Save-Data or reduced motion. `FLOOR` in `ScrollFilm.tsx` caps how dark a frame can get so text stays readable.
- The hero portrait is `public/assets/ayana.webp` (900px). `reference/` holds originals and unused assets and is not deployed.
- Résumé: `public/Ayana_KK_CV.pdf` (linked from the navbar, mobile menu and hero). Replace that file to update the CV.
