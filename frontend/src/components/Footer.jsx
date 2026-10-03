/**
 * Site footer.
 *
 * Rebuilt to the audit spec: organisation description, Explore / Resources /
 * Contact columns, social links, and the legal row (Privacy Policy, Terms of
 * Use, Accessibility Statement, copyright). All navigation is data-driven from
 * `src/content/navigation.js` so the footer can never point at a page the
 * router does not serve.
 */

import React, { useState } from 'react';
import SmartLink from './SmartLink';
import { BRAND, CONTACT, SOCIAL } from '../config/site';
import { FOOTER_NAV, FOOTER_LEGAL } from '../content/navigation';

/** Opens the visitor's mail client with a pre-filled subscription request. */
function NewsletterSignup() {
  const [email, setEmail] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const subject = encodeURIComponent('Newsletter subscription');
    const body = encodeURIComponent(`Please add ${email} to the ${BRAND.abbr} mailing list.`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="footer-newsletter">
      <div>
        <h2>Get {BRAND.abbr} updates</h2>
        <p>Research, projects and news from {BRAND.abbr}, sent to your inbox.</p>
      </div>
      <form className="footer-newsletter-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="footer-newsletter-email">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn">
          Subscribe
        </button>
      </form>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <p className="footer-tagline">{BRAND.tagline}</p>
            <p className="footer-mission">
              A multidisciplinary policy, research and implementation hub strengthening global and
              regional health security through evidence-driven action — preventing, detecting and
              responding to public health threats in vulnerable and high-risk settings.
            </p>

            <h2 className="footer-heading">Work with us</h2>
            <SmartLink className="btn" to="/contact#contact-form">
              Partner With Us
            </SmartLink>

            <ul className="footer-social" aria-label={`${BRAND.abbr} on social media`}>
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${BRAND.abbr} on ${s.label}`}
                  >
                    <i className={`bi ${s.icon}`} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_NAV.map((column) => (
            <nav key={column.title} className="footer-column" aria-label={column.title}>
              <h2 className="footer-heading">{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.to + link.label}>
                    <SmartLink to={link.to}>{link.label}</SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="footer-column">
            <h2 className="footer-heading">Contact</h2>
            <address className="footer-address">
              <span>{CONTACT.address.formatted}</span>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              <span>
                {CONTACT.hours.days}, {CONTACT.hours.time}
              </span>
            </address>
          </div>
        </div>

        <NewsletterSignup />

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} {BRAND.legalName}. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <ul className="footer-legal">
              {FOOTER_LEGAL.map((link) => (
                <li key={link.to}>
                  <SmartLink to={link.to}>{link.label}</SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
