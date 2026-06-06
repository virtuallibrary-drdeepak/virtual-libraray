# Virtual Library Brand Theme

This document defines the visual theme currently used across the Virtual Library app and web checkout experience. Use it as the source of truth when wiring the same brand into the admin website.

## Source Files

The theme is not centralized yet. It is expressed through Tailwind utility classes and a few global CSS rules.

- `tailwind.config.js`: adds the `Outfit` font family.
- `styles/globals.css`: global font, smoothing, focus styling, scrollbar helper, fade-in animation.
- `public/img/logo.svg`: canonical logo asset and logo colors.
- `pages/v2/neet-pg.tsx`: canonical app marketing theme, hero, pricing, cards, pills, footer.
- `components/v2/PricingPlanCard.tsx`: canonical pricing card and button treatment.
- `pages/payment/index.tsx`: canonical checkout/admin-like product UI patterns.
- `pages/v2/neet-pg/access.tsx`: post-payment access page.
- `app/focus/join/[code]/page.tsx`: deep purple app handoff page.
- Legacy public pages such as `pages/index.tsx`, `components/sections/*`, `pages/about.tsx`, and policy pages use an older, softer marketing style. Keep that context, but use the newer v2/payment theme for admin.

## Brand Direction

Virtual Library should feel focused, structured, and supportive. The dominant visual identity is purple-led, high contrast, and app-like, with soft lavender surfaces for depth and teal/green accents for progress or success.

Use this hierarchy:

- Primary brand: violet/purple.
- Supporting depth: deep navy-purple and black-purple.
- Product surfaces: white and very pale lavender.
- Progress/success: teal/green.
- Warning/value callouts: amber.
- Error/destructive: rose/red.

For admin, the interface should be calmer and denser than the marketing pages. Use the same colors, type, radius, and shadows, but prefer dashboard layouts, tables, forms, filters, and clear action bars over large landing-page sections.

## Typography

The brand font is `Outfit`.

Current setup:

```js
// tailwind.config.js
fontFamily: {
  outfit: ['Outfit', 'sans-serif'],
}
```

Global setup:

```css
html,
body {
  font-family: "Outfit", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Recommended admin type scale:

| Usage | Tailwind | Notes |
| --- | --- | --- |
| Admin page title | `text-3xl sm:text-4xl font-semibold text-slate-950` | Use for top-level admin pages. |
| Section/card title | `text-xl sm:text-2xl font-semibold text-slate-950` | Use inside panels and cards. |
| Large dashboard metric | `text-3xl font-bold text-slate-950` | Use for KPI values. |
| Body text | `text-sm sm:text-base leading-6 text-[#5a5d78]` | Default readable copy. |
| Table text | `text-sm text-slate-700` | Keep admin data compact. |
| Labels | `text-sm font-medium text-slate-700` | Use for form labels. |
| Eyebrow/status label | `text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b21a8]` | Used heavily in checkout. |
| Pills | `text-xs font-bold uppercase tracking-normal` | Used in v2 app pages. |

Use `tracking-normal` for most UI. Existing checkout screens contain some negative tracking on large display text, but new admin screens should avoid negative letter spacing.

## Core Color Tokens

### Logo Colors

These come from `public/img/logo.svg`.

| Token | Hex | Usage |
| --- | --- | --- |
| `logo-violet` | `#583FF0` | Logo mark and secondary wordmark strokes. |
| `logo-ink` | `#1F1462` | Primary wordmark/deep brand ink. |

Always use `public/img/logo.svg` for the logo. Do not recreate the logo with text.

### Brand Purples

| Token | Hex | Usage |
| --- | --- | --- |
| `brand-950` | `#140d1f` | Dark testimonial/success-story section background. |
| `brand-925` | `#191827` | Dark gradient start and deep text panels. |
| `brand-900` | `#1b112c` | Dark card surface on dark sections. |
| `brand-850` | `#241339` | Dark pill background. |
| `brand-800` | `#351b73` | Dark CTA gradient middle. |
| `brand-750` | `#5b1f92` | Deep focus-page action text and overlay. |
| `brand-700` | `#5b21b6` | Primary button hover, deep CTA text. |
| `brand-650` | `#6021dc` | App hero gradient start. |
| `brand-600` | `#6d28d9` | Canonical primary action color. |
| `brand-575` | `#6b21a8` | Older primary purple used by payment and legacy hero. |
| `brand-500` | `#7c3aed` | Accent text, badges, selected states. |
| `brand-450` | `#7932ec` | App hero gradient midpoint. |
| `brand-400` | `#8b5cf6` | Gradient CTA end and hover accent. |
| `brand-350` | `#8f68ff` | Dark-section supporting text. |
| `brand-300` | `#a58df0` | App hero gradient end. |
| `brand-250` | `#b78cff` | Light pill border. |
| `brand-200` | `#cdb4ff` | Step connector line. |
| `brand-150` | `#d8ccff` | Secondary button border. |
| `brand-125` | `#d3b8ff` | Text on purple payment panels. |
| `brand-100` | `#ebe2ff` | Main lavender border. |
| `brand-90` | `#e9ddff` | Light app-store button border. |
| `brand-80` | `#ece6f8` | Header border. |
| `brand-75` | `#f0e8ff` | Illustration-card border. |
| `brand-70` | `#f4eeff` | Selected/success icon background. |
| `brand-60` | `#f6f1ff` | White-button hover on purple contexts. |
| `brand-55` | `#f7f2ff` | Highlighted pricing card background. |
| `brand-50` | `#fbf9ff` | Main tinted app surface. |
| `brand-45` | `#f8f4ff` | App hero surrounding background. |
| `brand-40` | `#faf7ff` | Selected course/card background. |
| `brand-35` | `#fbfaff` | Input background in checkout. |

Admin default: use `brand-600` (`#6d28d9`) for primary actions and `brand-700` (`#5b21b6`) for hover. If matching the payment checkout exactly, use `brand-575` (`#6b21a8`) with hover `#581c87`.

### Neutral Tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `text-strong` | `#191827` or Tailwind `slate-950` | Headings and important values. |
| `text-nav` | `#34364a` | Header nav links. |
| `text-body` | `#5a5d78` | Body copy on light surfaces. |
| `text-muted-purple` | `#77669d` | Store-button eyebrow and muted lavender text. |
| `surface-app` | `#f8f7fb` | Checkout/admin page background. |
| `surface-footer` | `#f5f5f8` | Footer or low-emphasis block background. |
| `surface-card` | `#ffffff` | Cards, panels, tables. |
| `border-soft` | `#ebe2ff` | Default brand border. |
| `border-header` | `#ece6f8` | Header/divider border. |

Tailwind `slate-*`, `gray-*`, and `white/*` are used throughout. Prefer Tailwind slate for text and the custom lavender values for brand surfaces and borders.

### Semantic Accents

| Token | Hex | Usage |
| --- | --- | --- |
| `success` | `#14b8a6` | Success check borders and active step accents. |
| `success-strong` | `#0f9f91` | Success icon text. |
| `live-green` | `#00d7a0` | Live stat highlight on black stats bar. |
| `success-soft` | `#7dd3a8` | Success text on dark payment summary. |
| `warning-bg` | `#fffbeb` | Value/summary callout background. |
| `warning-border` | `#fde68a` | Value/summary callout border. |
| `warning-text` | `#8a4a0f` | Value/summary callout text. |
| `star` | `#f59e0b` | Rating stars. |
| `image-warm` | `#f4bb32` | Warm image placeholder behind testimonial portrait. |

Use rose/red for errors and destructive actions. Current code uses Tailwind `rose-*`, `red-*`, and older `bg-red-600` for destructive admin buttons.

## Gradients

Use the exact gradients below.

### App Hero Gradient

Used on `pages/v2/neet-pg.tsx` and `pages/v2/neet-pg/access.tsx`.

```css
background: linear-gradient(118deg, #6021dc 0%, #7932ec 52%, #a58df0 100%);
```

Overlay:

```css
background: linear-gradient(
  90deg,
  rgba(44, 10, 112, 0.34),
  rgba(44, 10, 112, 0.04) 58%,
  rgba(255, 255, 255, 0.10)
);
```

### Dark CTA Gradient

Used on bottom CTA panels and app access next-step panels.

```css
background: linear-gradient(100deg, #191827 0%, #351b73 48%, #6d28d9 100%);
```

### Primary Button Gradient

Used on v2 feature CTA buttons.

```css
background: linear-gradient(90deg, #6d28d9, #8b5cf6);
```

### Legacy Hero Overlay

Used by the older home hero and ranking hero.

```css
background: linear-gradient(
  to right,
  rgba(107, 33, 168, 0.95),
  rgba(107, 33, 168, 0.90),
  rgba(107, 33, 168, 0.80)
);
```

Admin should not need large hero gradients except for login or empty onboarding states. For normal admin screens, use `surface-app` plus white cards.

## Surfaces, Borders, Radius, And Shadows

### Page Backgrounds

Use these for app/admin pages:

- Admin/page shell: `bg-[#f8f7fb]`
- Tinted content band: `bg-[#fbf9ff]`
- Standard content: `bg-white`
- Dark section: `bg-[#140d1f]`
- Black stats strip: `bg-black`

Avoid the older `from-purple-50 to-indigo-50` admin backgrounds when migrating to the new theme.

### Borders

- Default card border: `border border-[#ebe2ff]`
- Header divider: `border-b border-[#ece6f8]`
- Secondary control border: `border-[#d8ccff]`
- Input/control border: `border-purple-100` or `border-[#ebe2ff]`
- Focus border: `focus:border-[#6b21a8]` or `focus:border-[#6d28d9]`

### Radius

The app theme is rounded and soft.

| Usage | Radius |
| --- | --- |
| Large app panels and CTAs | `rounded-[36px]` |
| Pricing cards and major cards | `rounded-[30px]` |
| Admin cards and table panels | `rounded-[28px]` or `rounded-3xl` |
| Inputs and admin buttons | `rounded-2xl` |
| Pills and store buttons | `rounded-full` |
| Small badges | `rounded-lg` or `rounded-xl` |

For admin, prefer `rounded-2xl` to `rounded-[28px]` for dense controls and `rounded-3xl` for top-level panels.

### Shadows

Use purple-tinted shadows, not gray-only shadows.

```css
--shadow-card: 0 18px 48px rgba(107, 33, 168, 0.10);
--shadow-card-soft: 0 20px 48px rgba(109, 40, 217, 0.06);
--shadow-card-elevated: 0 22px 54px rgba(109, 40, 217, 0.08);
--shadow-card-hover: 0 34px 80px rgba(109, 40, 217, 0.18);
--shadow-button: 0 14px 28px rgba(107, 33, 168, 0.18);
--shadow-button-strong: 0 18px 38px rgba(109, 40, 217, 0.24);
--shadow-hero: 0 28px 80px rgba(69, 31, 149, 0.24);
--shadow-dark-panel: 0 28px 72px rgba(31, 20, 98, 0.22);
```

Tailwind arbitrary examples:

```html
<div className="rounded-3xl border border-[#ebe2ff] bg-white shadow-[0_18px_48px_rgba(107,33,168,0.10)]" />
<button className="shadow-[0_18px_38px_rgba(109,40,217,0.24)]" />
```

## Component Patterns

### Header

Canonical v2 header:

```html
<header className="fixed inset-x-0 top-0 z-50 border-b border-[#ece6f8] bg-[#fbf9ff]/95 backdrop-blur">
  <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-10">
    <img src="/img/logo.svg" className="h-8 w-auto sm:h-9" />
  </div>
</header>
```

Admin variant:

- Keep height `h-16`.
- Use `bg-[#fbf9ff]/95`, `backdrop-blur`, `border-[#ece6f8]`.
- Use `text-[#34364a]` for nav and `hover:text-[#6d28d9]`.
- Use the local logo path `/img/logo.svg`.

### Primary Button

Canonical app button:

```html
<button className="inline-flex items-center justify-center rounded-2xl bg-[#6d28d9] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(109,40,217,0.24)] transition hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:opacity-60">
  Save
</button>
```

Payment-exact variant:

```html
<button className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[#6b21a8] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_32px_rgba(107,33,168,0.22)] transition hover:bg-[#581c87] disabled:cursor-not-allowed disabled:opacity-60">
  Continue
</button>
```

### Secondary Button

```html
<button className="inline-flex items-center justify-center rounded-2xl border border-[#d8ccff] bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-[#7c3aed] hover:text-[#6d28d9]">
  Cancel
</button>
```

### Pills

Light pill:

```html
<span className="inline-flex items-center rounded-full border border-[#b78cff] bg-white px-5 py-2 text-xs font-bold uppercase tracking-normal text-[#7c3aed]">
  Plans
</span>
```

Dark pill:

```html
<span className="inline-flex items-center rounded-full border border-[#7c3aed] bg-[#241339] px-5 py-2 text-xs font-bold uppercase tracking-normal text-[#8f68ff]">
  Success Stories
</span>
```

### Cards And Panels

Standard admin card:

```html
<section className="rounded-3xl border border-[#ebe2ff] bg-white p-5 shadow-[0_18px_48px_rgba(107,33,168,0.10)] sm:p-6">
  ...
</section>
```

Tinted feature/card panel:

```html
<section className="rounded-[32px] border border-[#f0e8ff] bg-[#fbf9ff] p-6 shadow-[0_20px_48px_rgba(109,40,217,0.06)]">
  ...
</section>
```

Selected card:

```html
<button className="rounded-[24px] border border-[#6b21a8] bg-[#faf7ff] p-4 text-left transition">
  ...
</button>
```

### Forms

Form fields in payment/admin-like screens use white or pale lavender backgrounds, rounded corners, subtle purple border, and purple focus.

```html
<label className="block">
  <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
  <div className="flex items-center rounded-2xl border border-purple-100 bg-white px-3 shadow-[0_8px_18px_rgba(107,33,168,0.05)] focus-within:border-[#6b21a8]">
    <input className="w-full border-0 bg-transparent px-0 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0" />
  </div>
</label>
```

Global focus style currently applies:

```css
input:focus,
select:focus {
  border-color: #a78bfa;
  box-shadow: 0 0 0 2px #ede9fe;
}
```

For the admin migration, prefer component-level focus styles using `#6d28d9` or `#6b21a8`, because that matches the newer app/payment screens more closely.

### Tables

Admin tables should use the app surface system rather than the older heavy `shadow-lg` style.

Recommended table shell:

```html
<section className="overflow-hidden rounded-3xl border border-[#ebe2ff] bg-white shadow-[0_18px_48px_rgba(107,33,168,0.10)]">
  <div className="border-b border-[#ebe2ff] px-5 py-4">
    <h2 className="text-xl font-semibold text-slate-950">Rankings</h2>
  </div>
  <table className="w-full">
    <thead className="bg-[#fbf9ff]">
      <tr>
        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#77669d]">Name</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-[#ebe2ff]">
      <tr className="transition hover:bg-[#faf7ff]">
        <td className="px-5 py-4 text-sm font-medium text-slate-900">Student</td>
      </tr>
    </tbody>
  </table>
</section>
```

Use domain accents sparingly:

- Meet rankings: purple accent `#6d28d9`.
- Forest/focus productivity: teal `#0f9f91` or green only where the feature domain needs it.
- Destructive actions: red/rose and never purple.

### Stat Cards

```html
<div className="rounded-3xl border border-[#ebe2ff] bg-white p-5 shadow-[0_18px_48px_rgba(107,33,168,0.08)]">
  <p className="text-sm font-medium text-[#5a5d78]">Total Participants</p>
  <p className="mt-2 text-3xl font-bold text-[#6d28d9]">3000+</p>
</div>
```

For dark stat strips, use `bg-black`, white text, and `#00d7a0` for the live/accent value.

### Empty And Loading States

Spinner:

```html
<div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[#6b21a8]" />
```

Empty state:

```html
<div className="rounded-3xl border border-[#ebe2ff] bg-[#fbf9ff] px-6 py-10 text-center">
  <h3 className="text-xl font-semibold text-slate-950">No data found</h3>
  <p className="mt-2 text-sm text-[#5a5d78]">Try changing the filters.</p>
</div>
```

## Admin Theme Wiring Checklist

When updating the admin website:

1. Load `Outfit` globally and keep Tailwind `fontFamily.outfit`.
2. Use `/img/logo.svg` in the admin header/login screen.
3. Set the admin app background to `#f8f7fb`.
4. Replace old `from-purple-50 to-indigo-50` shells with the canonical app surface system.
5. Replace generic `shadow-lg` with purple-tinted shadows from this doc.
6. Replace old admin primary buttons `bg-purple-700 hover:bg-purple-800` with `#6d28d9` / `#5b21b6`, or payment-exact `#6b21a8` / `#581c87`.
7. Use `rounded-2xl` for controls and `rounded-3xl` for admin panels.
8. Use `border-[#ebe2ff]` or `border-purple-100` instead of neutral gray borders on cards and controls.
9. Use `text-slate-950` for strong text and `#5a5d78` for body/help text.
10. Keep data tables compact, but wrap them in the same rounded white cards.
11. Use teal/green only for success, progress, and Forest/focus-specific semantics.
12. Keep destructive actions red/rose and visually separate from primary purple actions.

## Recommended Central Token Export

If the admin app can use CSS variables, add these first:

```css
:root {
  --vl-logo-violet: #583ff0;
  --vl-logo-ink: #1f1462;

  --vl-brand-950: #140d1f;
  --vl-brand-925: #191827;
  --vl-brand-900: #1b112c;
  --vl-brand-850: #241339;
  --vl-brand-800: #351b73;
  --vl-brand-700: #5b21b6;
  --vl-brand-650: #6021dc;
  --vl-brand-600: #6d28d9;
  --vl-brand-575: #6b21a8;
  --vl-brand-500: #7c3aed;
  --vl-brand-450: #7932ec;
  --vl-brand-400: #8b5cf6;
  --vl-brand-350: #8f68ff;
  --vl-brand-300: #a58df0;
  --vl-brand-250: #b78cff;
  --vl-brand-200: #cdb4ff;
  --vl-brand-150: #d8ccff;
  --vl-brand-125: #d3b8ff;
  --vl-brand-100: #ebe2ff;
  --vl-brand-80: #ece6f8;
  --vl-brand-70: #f4eeff;
  --vl-brand-60: #f6f1ff;
  --vl-brand-50: #fbf9ff;
  --vl-brand-45: #f8f4ff;
  --vl-brand-40: #faf7ff;

  --vl-text-strong: #191827;
  --vl-text-nav: #34364a;
  --vl-text-body: #5a5d78;
  --vl-text-muted-purple: #77669d;

  --vl-surface-app: #f8f7fb;
  --vl-surface-card: #ffffff;
  --vl-surface-footer: #f5f5f8;

  --vl-success: #14b8a6;
  --vl-success-strong: #0f9f91;
  --vl-live-green: #00d7a0;
  --vl-warning-bg: #fffbeb;
  --vl-warning-border: #fde68a;
  --vl-warning-text: #8a4a0f;

  --vl-gradient-hero: linear-gradient(118deg, #6021dc 0%, #7932ec 52%, #a58df0 100%);
  --vl-gradient-dark-cta: linear-gradient(100deg, #191827 0%, #351b73 48%, #6d28d9 100%);
  --vl-gradient-primary: linear-gradient(90deg, #6d28d9, #8b5cf6);

  --vl-shadow-card: 0 18px 48px rgba(107, 33, 168, 0.10);
  --vl-shadow-card-soft: 0 20px 48px rgba(109, 40, 217, 0.06);
  --vl-shadow-card-elevated: 0 22px 54px rgba(109, 40, 217, 0.08);
  --vl-shadow-button: 0 14px 28px rgba(107, 33, 168, 0.18);
  --vl-shadow-button-strong: 0 18px 38px rgba(109, 40, 217, 0.24);
}
```

Tailwind extension equivalent:

```js
theme: {
  extend: {
    fontFamily: {
      outfit: ['Outfit', 'sans-serif'],
    },
    colors: {
      vl: {
        ink: '#1f1462',
        logo: '#583ff0',
        surface: '#f8f7fb',
        card: '#ffffff',
        body: '#5a5d78',
        primary: '#6d28d9',
        primaryHover: '#5b21b6',
        checkout: '#6b21a8',
        checkoutHover: '#581c87',
        accent: '#7c3aed',
        border: '#ebe2ff',
        headerBorder: '#ece6f8',
        tinted: '#fbf9ff',
        selected: '#faf7ff',
        success: '#14b8a6',
        successStrong: '#0f9f91',
        live: '#00d7a0',
      },
    },
    boxShadow: {
      vl: '0 18px 48px rgba(107, 33, 168, 0.10)',
      'vl-soft': '0 20px 48px rgba(109, 40, 217, 0.06)',
      'vl-button': '0 18px 38px rgba(109, 40, 217, 0.24)',
    },
    borderRadius: {
      'vl-card': '1.75rem',
      'vl-panel': '2.25rem',
    },
  },
}
```

## Legacy Marketing Palette

Older public sections use pastel feature cards and warm bands. Keep these only for marketing/landing pages, feature callouts, or illustration-heavy content.

| Hex | Current usage |
| --- | --- |
| `#fffdd5` | Mental health support feature card. |
| `#fff4dc` | Google Meet feature card. |
| `#e8f9e9` | Study buddy feature card. |
| `#f3f3f5` | Discussion groups feature card. |
| `#fff0e9` | Forest feature card. |
| `#fff1f3` | Early bird/night owl feature card. |
| `#eaf7ff` | Yoga/meditation feature card. |
| `#fffde7` | Legacy "Why Join" section background. |
| `#fff9c4` | Legacy "Why Join" CTA card. |
| `#fff7ef` | Legacy testimonials background. |
| `#f9f9fb` | Legacy footer background. |

Do not make these the primary admin theme. Admin should use `#f8f7fb`, `#fbf9ff`, white cards, lavender borders, and purple actions.

