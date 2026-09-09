# Restyle Prompt — what-we-do.html

Restyle **what-we-do.html** only. Do not modify the hero section, footer, or any section not listed below. Do not remove any existing content.

## Bootstrap
Add Bootstrap 5 CSS and JS CDN links in `<head>` (before the existing stylesheet). Keep the existing `style.css` and Bootstrap Icons links.

## Navbar
- Replace the custom `<header class="site-header">` markup with a Bootstrap `navbar navbar-expand-lg` component using `bg-primary` overridden to `#008ecc`.
- Remove the site text name (`CGP` / `Center for Global Health & Pandemic Intelligence`) from the navbar. Replace it with the logo image: `<img src="Assets/logo" alt="CGP Logo" height="48">` inside the brand `<a>` tag.
- Style navbar links and dropdown toggle buttons with `text-white`.
- Add a Bootstrap animated hamburger toggler (`navbar-toggler`) for mobile.
- Dropdown menus must animate open/close using Bootstrap's built-in collapse/fade transitions (add `data-bs-toggle="dropdown"` and `data-bs-auto-close="true"` to each dropdown trigger button).
- The navbar should have a subtle `box-shadow` bottom border for depth.

## General Sections
- Wrap all `<section>` and `<div class="cta-strip">` content in Bootstrap `container` or `container-lg` with at least `py-5` (top/bottom padding) so content is never flush against the viewport edges.
- Replace custom `.wrap` divs inside these sections with Bootstrap `container`.

## Stats Grid (Overview Intro)
- Convert the inline-styled 4-column stats grid into a Bootstrap `row` with `col-6 col-md-3` columns inside a `card` or `border rounded` wrapper.
- Apply `shadow-sm` and `p-4` to each stat cell. Use `#008ecc` for the large stat numbers.

## Accordion (Technical Capabilities)
- Convert the `<details>`/`<summary>` accordion into a Bootstrap Accordion component (`accordion`, `accordion-item`, `accordion-button`, `accordion-collapse`, `accordion-body`).
- Keep all existing text content and links exactly as-is.
- The first item should be expanded by default.

## CTA Strip — "Explore CGP's Projects & Initiatives"
- Center all content (heading, paragraph, and buttons) using `text-center` and `justify-content-center`.
- The section background is `#008ecc`. The two buttons (`Projects & Impact`, `CGP Initiatives`) must use `btn btn-light` (white/light background) so they are visible and distinct from the blue background — do **not** use `btn-primary`.
- Wrap buttons in a `d-flex flex-wrap justify-content-center gap-3 mt-3` div.

## Cards / Shadows
- Any card-like containers (stat cells, accordion panels) must have Bootstrap `shadow` or `shadow-sm` class applied.

## Responsiveness
- All layouts must use Bootstrap responsive grid classes (`col-12`, `col-md-*`, `col-lg-*`) so the page is fully usable on mobile.
- The navbar must collapse into a hamburger menu on small screens.

## Buttons
- All `<a class="btn">` and `<button>` elements (except navbar togglers and search) must render as Bootstrap buttons with explicit `btn btn-primary` (or `btn-light` where noted above). Override `btn-primary` background to `#008ecc` in `style.css` if not already set.

## Colour Token
Primary blue: `#008ecc`. Apply as navbar background, stat number colour, and primary button colour.

**Do not change:** hero section, footer, search overlay, `<head>` meta tags, page content text, or any other page not listed.
