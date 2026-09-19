# Sunflower

Sunflower turns public data — municipal records, Eurostat, ISTAT and other open datasets — into charts and interactive tools anyone can read, no spreadsheet skills required. This repo is the marketing/landing site: a Next.js app with a GSAP-driven scroll experience and a 3D phone showcase built with React Three Fiber.

## Tech stack

- **Next.js** (App Router)
- **GSAP** + `ScrollTrigger` + `@gsap/react` (`useGSAP`) for all scroll-linked and entrance animations
- **React Three Fiber** + `@react-three/drei` for the interactive 3D phone in the Hero section
- **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`) for utility classes, alongside a larger set of hand-written `sf-*` component classes
- **three.js** for the underlying WebGL rendering

## Project structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Homepage
├── globals.css             # Design tokens, sf-* component styles, responsive rules
├── about/
│   └── page.jsx            # Manifesto — pinned multi-panel scroll story
├── assets/
│   └── fonts/
├── components/
│   ├── Hero.jsx             # Hero, section2, section3 + the R3F phone viewport
│   ├── DockMenu.jsx         # Morphing bottom dock nav (homepage)
│   ├── NavBar.jsx
│   ├── StaticMenu.jsx       # Simpler fixed nav (About page)
│   ├── ZoomSection.jsx      # Scroll-pinned image reveal
│   ├── HowItWorksSection.jsx
│   ├── StatSection.jsx
│   ├── DraggableSection.jsx # Draggable reviews carousel
│   ├── FAQSection.jsx
│   ├── MarqueeSection.jsx
│   ├── FooterSection.jsx
│   └── Divider.jsx
├── constants/
└── docs/
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notable implementation details

- **Responsive behavior**: the 3D phone (Hero) and the pill-to-fullscreen image reveal (ZoomSection) both branch on viewport width — the phone swaps to a lightweight CSS/crossfade mockup below 981px instead of mounting the R3F canvas, and ZoomSection uses `gsap.matchMedia()` to swap its pinned scroll animation for a static blurred image on mobile.
- **Scroll-pinned sections**: `ZoomSection`, the About page's panel sequence, and the mobile phone showcase all use `ScrollTrigger`'s `pin: true` + `scrub`. When editing timelines in these sections, keep tween position parameters as literal fractions of total scroll progress (anchor the timeline's total duration to `1` if needed) — GSAP treats position values as absolute seconds, not percentages, unless the timeline's duration is normalized.
- **Word-by-word text reveal**: `DraggableSection` and `HowItWorksSection` share a `StaggeredWord` pattern (per-word GSAP fade/slide) driven by a single `ScrollTrigger` with `onEnter`/`onEnterBack`/`onLeave`/`onLeaveBack`. Word spacing depends on the `.sf-word-mask` / `.sf-word-inner` CSS classes in `globals.css` — these must stay defined as real CSS rather than Tailwind arbitrary-value utilities, since Tailwind's content scanner can silently drop unrecognized files.

## Known issues

- **Safari**: the R3F phone's screen overlay (`<Html transform>` in Hero.jsx) can appear offset relative to the 3D phone body in Safari specifically, likely related to WebKit's handling of canvas sizing/DPR under `<Html transform>`, or `overflow: visible` combined with 3D transforms inside a `position: fixed` ancestor. Under investigation.