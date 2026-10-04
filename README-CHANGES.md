# CGP restyle v2 — Red Cross Kenya structure, CGP colours

## How to apply
Paths are relative to the repo root (CGHI/). Extract cgp-restyle-v2.zip over the repo, then:
- DELETE  frontend/src/site.css   (merged into the new stylesheet)
- ADD     frontend/src/styles/site.css
- ADD     frontend/src/hooks/useScrollAnimations.js
- REPLACE frontend/src/App.jsx            (imports styles/site.css instead of site.css)
- REPLACE frontend/src/components/Layout.jsx, Navbar.jsx, Footer.jsx
- REPLACE frontend/src/pages/Home.jsx
- REPLACE frontend/src/content/navigation.js
- REPLACE frontend/package.json and package-lock.json (adds gsap)
- Run: cd frontend && npm install && npm run dev
Keep frontend/src/style.css and index.css: the admin screens and Careers page still use them.

## Sitemap (redcross.or.ke pattern -> CGP). All URLs unchanged, so no redirects are needed.
Utility bar:   email, location, social icons (Red Cross: email, phone, social, Donate)
Home
Who We Are:    About CGP | Leadership & Team | Partners & Collaborators
What We Do:    Overview | Projects & Impact | CGP Initiatives
Get Involved:  Partner With Us | Careers            (new group; Careers moved here)
Media Center:  Media Insights and Research | Resource Library   (Media & Press removed)
Contact Us
Header button: Partner With Us (Red Cross: Donate)

## Home page order
Red Cross: Hero > Principles > What We Do > Join (member/volunteer) > Stats + About > Projects > Partners > Impact stories > Report concern
CGP now:   Hero > Welcome > What We Do > Get Involved > CGP at a Glance (stats) > Projects > Initiatives > Partners > Insights > CTA

## Content map
No pages, routes or copy were removed. Moves: Careers (Who We Are -> Get Involved);
Insights and Resources (-> Media Center). The new Get Involved block on Home reuses existing CTA wording.
Footer: Quick Links | Who We Are | Media Center | Contact, plus Partner With Us button and newsletter band.
