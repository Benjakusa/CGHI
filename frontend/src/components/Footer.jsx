

import React from 'react';
import SmartLink from './SmartLink';
import { BRAND, CONTACT, SOCIAL } from '../config/site';
import { FOOTER_NAV, FOOTER_LEGAL } from '../content/navigation';


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
            <SmartLink className="btn" to="/partner-with-us#contact-form">
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
