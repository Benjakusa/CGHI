/**
 * Accessibility Statement.
 *
 * Documents the accessibility work delivered as part of the site audit and
 * gives visitors a way to report a barrier. The commitments listed here are
 * the ones actually implemented in the codebase; anything aspirational is
 * marked as such so the page does not overstate the current state.
 */

import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  pageJsonLd,
} from '../components/Seo';
import SmartLink from '../components/SmartLink';
import { BRAND, CONTACT } from '../config/site';
import { PAGE_META } from '../content/navigation';

const META = PAGE_META['/accessibility'];

const MEASURES = [
  {
    icon: 'bi-keyboard',
    title: 'Keyboard operation',
    body: 'Every interactive element is reachable and operable with a keyboard. A skip-to-content link is the first focusable element on every page, dropdown menus open and close with Enter, Space, Escape and the arrow keys, and focus returns to the trigger when a menu or dialog closes.',
  },
  {
    icon: 'bi-eye-fill',
    title: 'Visible focus',
    body: 'A high-contrast focus ring is applied to every focusable element and is never removed without a visible replacement.',
  },
  {
    icon: 'bi-volume-up-fill',
    title: 'Screen reader support',
    body: 'Pages use semantic landmarks, a single <h1> per page with an unbroken heading hierarchy, real form labels, announced validation errors, live regions for result counts and load states, and image alternative text.',
  },
  {
    icon: 'bi-phone',
    title: 'Touch targets and reflow',
    body: 'Interactive controls meet a minimum 44 × 44 CSS pixel target on touch devices, and the layout reflows without horizontal scrolling down to a 320 pixel viewport.',
  },
  {
    icon: 'bi-text-paragraph',
    title: 'Typography and contrast',
    body: 'Type scales with the viewport rather than jumping between breakpoints, body text meets a minimum 4.5:1 contrast ratio, and the site honours the operating system’s reduced-motion preference.',
  },
  {
    icon: 'bi-universal-access',
    title: 'Zoom and reflow',
    body: 'The site remains usable when text is enlarged to 200% and does not rely on hover for any information or action.',
  },
];

export default function Accessibility() {
  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/accessibility', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
    ],
    []
  );

  return (
    <Layout navId="accessibility">
      <Seo title={META.title} description={META.description} path="/accessibility" jsonLd={jsonLd} />

      <PageHeader
        trail={META.breadcrumb}
        h1="Accessibility Statement"
        dek={`${BRAND.abbr} is committed to making this website usable by as many people as possible, including people who use assistive technology.`}
      />

      <section aria-labelledby="commitment">
        <div className="wrap">
          <h2 id="commitment">Our commitment</h2>
          <p className="lead">
            We want everyone to be able to read our research, explore our project record and contact
            our team — regardless of disability, assistive technology or connection speed.
          </p>
          <p>
            This statement describes the accessibility measures built into this website and tells you
            how to tell us about a barrier if you find one.
          </p>
        </div>
      </section>

      <section className="section-surface" aria-labelledby="measures">
        <div className="wrap">
          <h2 id="measures">What we have implemented</h2>
          <div className="grid-auto">
            {MEASURES.map((m) => (
              <article key={m.title} className="icon-card">
                <div className="card-icon" aria-hidden="true">
                  <i className={`bi ${m.icon}`} />
                </div>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-surface-alt" aria-labelledby="limitations">
        <div className="wrap">
          <div className="prose">
            <h2 id="limitations">Known limitations</h2>
            <p>
              We are honest about what is not yet finished:
            </p>
            <ul>
              <li>
                Leadership profiles and photographs are still being prepared and the page currently
                shows a content-pending notice rather than incomplete cards.
              </li>
              <li>
                Some partner logos and article images are hosted on a third-party server, so their
                alternative text and formatting are only as good as that source material.
              </li>
              <li>
                The careers application form uses a file-upload flow that has not yet been fully
                re-tested with every screen reader.
              </li>
              <li>
                Project-level detail (background, objectives, results, outputs) is incomplete for
                some projects; each gap is marked as pending on the project page.
              </li>
            </ul>

            <h2 id="report">Report a barrier</h2>
            <p>
              If you cannot access something on this site, please tell us. Include the page address,
              what you were trying to do, and the browser or assistive technology you were using,
              and we will fix it or provide the information another way.
            </p>
            <address className="doc-contact">
              <p>
                Email: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </p>
              <p>
                Or use the <SmartLink to="/partner-with-us#contact-form">contact form</SmartLink> and
                select “Something else”.
              </p>
            </address>

            <h2 id="standards">Standards</h2>
            <p>
              This site is built against the Web Content Accessibility Guidelines (WCAG) 2.1 Level
              AA. Accessibility is treated as an ongoing commitment rather than a one-off exercise,
              and is re-checked whenever significant changes are made to a page.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
