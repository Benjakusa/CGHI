/**
 * Terms of Use.
 *
 * STATUS: newly added because the audit requires a Terms link in the footer
 * and the site had a Privacy Policy with no accompanying terms. The text below
 * is a plain-language framework covering the same subject matter as the Privacy
 * Policy (Kenya Data Protection Act 2019, GDPR where applicable).
 *
 * TODO(legal): this must be reviewed and approved by CGP's legal counsel before
 * it is relied upon. Section numbers and the governing-law clause are
 * placeholders pending that review.
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

const META = PAGE_META['/terms'];

const SECTIONS = [
  {
    id: 'acceptance',
    heading: '1. Acceptance of these terms',
    body: [
      `By accessing or using the ${BRAND.name} website ("the Site"), you agree to these Terms of Use. If you do not agree with any part of these terms, you must not use the Site.`,
      'These terms apply to every visitor to the Site. Separate written agreements may govern specific research collaborations, grants or service engagements, and where such an agreement conflicts with these terms, the agreement prevails.',
    ],
  },
  {
    id: 'permitted-use',
    heading: '2. Permitted use',
    body: [
      'You may read, download and print material from the Site for personal, non-commercial, research and educational purposes, provided you keep all copyright and attribution notices intact.',
      'You may quote short extracts from the Site with clear attribution to ' + BRAND.legalName + ', including a link back to the page from which the material was taken.',
    ],
  },
  {
    id: 'prohibited',
    heading: '3. Prohibited use',
    body: [
      'You must not:',
      'attempt to gain unauthorised access to the Site or any system supporting it; use automated tools, scrapers or crawlers to harvest content at a rate that degrades service for others; misrepresent your affiliation with ' + BRAND.abbr + '; upload malicious code or submit content that is unlawful, defamatory or infringes the rights of others; or use the Site in a way that breaches applicable law, including the Kenya Data Protection Act, 2019 and, where relevant, the GDPR.',
    ],
  },
  {
    id: 'content',
    heading: '4. Content and accuracy',
    body: [
      'CGP takes care to ensure the accuracy of the information published on the Site, but it is provided for general information only and does not constitute medical, legal or professional advice, nor a clinical or public-health decision tool.',
      'Figures, project outcomes and partner information reflect CGP’s published project record as at the date of publication and may change. Where a figure has not yet been verified, the Site marks it as pending rather than publishing an estimate.',
      `${BRAND.abbr} reserves the right to correct, update or remove content at any time without notice.`,
    ],
  },
  {
    id: 'intellectual-property',
    heading: '5. Intellectual property',
    body: [
      `Unless stated otherwise, the Site and its contents — including the ${BRAND.abbr} name, logo, design, text, graphics and software — are owned by ${BRAND.legalName} or its licensors and are protected by copyright and other intellectual property laws.`,
      'Third-party names, logos and trade marks appearing on the Site remain the property of their respective owners and are used for identification only.',
    ],
  },
  {
    id: 'third-party',
    heading: '6. Third-party links and content',
    body: [
      'The Site links to, and may embed content from, third-party websites including social media platforms, mapping services and video hosting. CGP does not control these sites and is not responsible for their content, availability, or privacy practices.',
      'Where content is embedded from a third-party provider, that provider’s own terms and privacy policy also apply to your use of it.',
    ],
  },
  {
    id: 'liability',
    heading: '7. Limitation of liability',
    body: [
      'To the fullest extent permitted by law, ' + BRAND.legalName + ' shall not be liable for any indirect, incidental, special, consequential or punitive loss, or for any loss of profits, data, goodwill or other intangible losses, arising out of or in connection with your use of the Site.',
      'The Site is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, CGP disclaims all warranties, express or implied, including any implied warranties of merchantability, fitness for a particular purpose, accuracy and non-infringement.',
    ],
  },
  {
    id: 'privacy',
    heading: '8. Privacy',
    body: [
      'Your use of the Site is also governed by our ' + 'Privacy Policy, which explains what personal data we collect and how we use it. The Privacy Policy forms part of these terms.',
    ],
  },
  {
    id: 'changes',
    heading: '9. Changes to these terms',
    body: [
      `We may update these Terms of Use from time to time. The "last updated" date below indicates when the current version took effect. Continued use of the Site after a change means you accept the updated terms.`,
    ],
  },
  {
    id: 'contact',
    heading: '10. Contact',
    body: [
      'Questions about these terms can be sent to:',
    ],
  },
];

export default function Terms() {
  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/terms', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
    ],
    []
  );

  return (
    <Layout navId="terms">
      <Seo title={META.title} description={META.description} path="/terms" jsonLd={jsonLd} />

      <PageHeader
        trail={META.breadcrumb}
        h1="Terms of Use"
        dek={`The terms that govern your use of the ${BRAND.abbr} website.`}
      />

      <section className="privacy-section">
        <div className="wrap">
          <div className="privacy-doc">
            <p className="privacy-updated">
              <i className="bi bi-clock-history" aria-hidden="true" /> Last updated: 30 September
              2026
            </p>

            <div className="notice-panel notice-panel--inline" role="note">
              <p>
                <i className="bi bi-info-circle" aria-hidden="true" /> This document is a
                plain-language framework prepared to sit alongside the Privacy Policy. It requires
                review and approval by CGP’s legal counsel before it is relied upon.
              </p>
            </div>

            <nav className="doc-toc" aria-label="Table of contents">
              <h2 className="sr-only">Table of contents</h2>
              <ol>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>{s.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>

            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="privacy-block">
                <h2>{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
                {section.id === 'contact' && (
                  <address className="doc-contact">
                    <p>{BRAND.legalName}</p>
                    <p>{CONTACT.address.formatted}</p>
                    <p>
                      Email: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                    </p>
                  </address>
                )}
                {section.id === 'privacy' && (
                  <p>
                    <SmartLink to="/privacy">Read the Privacy Policy</SmartLink>
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
