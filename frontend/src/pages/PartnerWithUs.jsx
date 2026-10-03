/**
 * Partner With Us.
 *
 * The single home for "work with CGP" on the public site. It replaces the old
 * /contact page: the enquiry form and the contact details now live here, and
 * every legacy contact URL permanently redirects to this route.
 *
 * Two-column layout: contact details and map on one side, a structured enquiry
 * form on the other.
 *
 * The form implements everything the audit asked for:
 *   - client-side validation with per-field, announced error messages
 *   - a loading state on submit
 *   - distinct success and error states
 *   - spam protection: a hidden honeypot field plus a minimum-time-to-submit
 *     check, so a bot that fills the form instantly is rejected
 *   - full keyboard and screen-reader support (real <label>s, aria-describedby,
 *     aria-invalid, role="alert" on the summary)
 *
 * Submission goes to `POST /api/contact` (an API endpoint, not a page), which
 * the audit's infrastructure work added to the Express backend.
 */

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Seo, {
  BASE_JSONLD,
  breadcrumbJsonLd,
  pageJsonLd,
} from '../components/Seo';
import SmartLink from '../components/SmartLink';
import { CtaStrip } from '../components/cards';
import { API_BASE } from '../context/AuthContext';
import { BRAND, CONTACT, SOCIAL } from '../config/site';
import { PAGE_META } from '../content/navigation';

const META = PAGE_META['/partner-with-us'];

// Values must stay in sync with TOPICS in backend/routes/contact.js — the
// server normalises an unrecognised topic to "general", so a drift here would
// silently miscategorise every enquiry.
const ENQUIRY_TYPES = [
  { value: 'partnership', label: 'Partnership or collaboration' },
  { value: 'research', label: 'Technical or research enquiry' },
  { value: 'funding', label: 'Funding and grant support' },
  { value: 'media', label: 'Media or press' },
  { value: 'jobs', label: 'Careers' },
  { value: 'other', label: 'Something else' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_SECONDS = 3;

const EMPTY = {
  name: '',
  email: '',
  organisation: '',
  phone: '',
  enquiryType: '',
  subject: '',
  message: '',
  consent: false,
  website: '', // honeypot
};

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your full name.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Please enter at least two characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address so we can reply.';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address, e.g. name@organisation.org.';
  }

  if (!values.enquiryType) {
    errors.enquiryType = 'Please choose the type of enquiry.';
  }

  if (!values.subject.trim()) {
    errors.subject = 'Please add a short subject.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please tell us how we can help.';
  } else if (values.message.trim().length < 20) {
    errors.message = `Please add a little more detail (at least 20 characters — you have ${values.message.trim().length}).`;
  }

  if (values.phone.trim() && !/^[\d\s+()-]{7,20}$/.test(values.phone.trim())) {
    errors.phone = 'Please enter a valid phone number, or leave this blank.';
  }

  // Consent is required by the Privacy Policy and enforced again server-side.
  if (!values.consent) {
    errors.consent = 'Please confirm you agree to be contacted about your enquiry.';
  }

  return errors;
}

function Field({ id, label, error, hint, required, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required ? (
          <span className="req" aria-hidden="true">
            {' '}
            *
          </span>
        ) : (
          <span className="optional"> (optional)</span>
        )}
      </label>
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          <i className="bi bi-exclamation-circle" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

function ContactForm() {
  const uid = useId();
  const formRef = useRef(null);
  // Timestamp for the minimum-fill-time spam check. Set in an effect so the
  // value is not recomputed (impure) on every render.
  const mountedAt = useRef(0);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [serverError, setServerError] = useState(null);
  const [reference, setReference] = useState(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const errorCount = Object.keys(errors).length;

  function setValue(event) {
    const { name, type, checked, value } = event.target;
    // Checkboxes report `checked`, every other control reports `value`.
    const nextValue = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [name]: nextValue }));
    if (touched[name]) {
      setErrors((prev) => {
        const found = validate({ ...values, [name]: nextValue });
        return { ...prev, [name]: found[name] };
      });
    }
  }

  function onBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(values)[name] }));
  }

  function focusFirstError() {
    const first = Object.keys(errors)[0];
    if (!first || !formRef.current) return;
    const el = formRef.current.querySelector(`[name="${first}"]`);
    if (el) el.focus();
  }

  async function onSubmit(event) {
    event.preventDefault();
    setServerError(null);

    const found = validate(values);
    setErrors(found);
    setTouched(
      Object.keys(EMPTY)
        .filter((k) => k !== 'website')
        .reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );

    if (Object.keys(found).length > 0) {
      setStatus('error');
      window.requestAnimationFrame(focusFirstError);
      return;
    }

    // Spam protection, layer 2: a form completed impossibly fast is a bot.
    if (Date.now() - mountedAt.current < MIN_FILL_SECONDS * 1000) {
      setStatus('error');
      setServerError('That was submitted unusually quickly. Please try again.');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          organisation: values.organisation.trim(),
          phone: values.phone.trim(),
          // `topic` is the field name the API validates and stores.
          topic: values.enquiryType,
          subject: values.subject.trim(),
          message: values.message.trim(),
          // Required by POST /api/contact: the Privacy Policy requires consent
          // and the server rejects a submission without it.
          consent: values.consent,
          // Minimum-fill-time check on the server (bots submit instantly).
          formStartedAt: mountedAt.current,
          // Layer 1 of spam protection: bots fill hidden fields.
          website: values.website,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || payload.error || 'Something went wrong.');
      }

      setReference(payload.reference || (payload.id ? `CGP-${payload.id}` : null));
      setStatus('success');
      setValues(EMPTY);
      setErrors({});
      setTouched({});
      mountedAt.current = Date.now();
    } catch (error) {
      setStatus('error');
      setServerError(
        error.message ||
          'We could not send your message. Please email us directly at ' + CONTACT.email + '.'
      );
    }
  }

  if (status === 'success') {
    return (
      <div className="form-success" role="status" tabIndex={-1} ref={formRef}>
        <span className="form-success-icon" aria-hidden="true">
          <i className="bi bi-check-circle-fill" />
        </span>
        <h2>Thank you — your message is with our team</h2>
        <p>
          We aim to respond within five working days. If your enquiry is urgent, email{' '}
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> directly.
        </p>
        {reference && <p className="form-reference">Your reference: {reference}</p>}
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setStatus('idle')}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="contact-form"
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${uid}-form-title`}
      aria-describedby={`${uid}-form-intro`}
    >
      <h2 id={`${uid}-form-title`}>Send us a message</h2>
      <p className="form-intro" id={`${uid}-form-intro`}>
        Fields marked <span className="req">*</span> are required. We use your details only to
        respond to this enquiry.
      </p>

      {status === 'error' && (serverError || errorCount > 0) && (
        <div className="form-alert" role="alert" tabIndex={-1}>
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
          <div>
            {serverError ? (
              <p>{serverError}</p>
            ) : (
              <p>
                Please correct {errorCount} {errorCount === 1 ? 'field' : 'fields'} below before
                sending.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="form-grid">
        <Field id={`${uid}-name`} label="Full name" required error={errors.name}>
          <input
            id={`${uid}-name`}
            name="name"
            type="text"
            className="input"
            value={values.name}
            onChange={setValue}
            onBlur={onBlur}
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          />
        </Field>

        <Field id={`${uid}-email`} label="Email address" required error={errors.email}>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            className="input"
            value={values.email}
            onChange={setValue}
            onBlur={onBlur}
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? `${uid}-email-error` : undefined}
          />
        </Field>

        <Field id={`${uid}-organisation`} label="Organisation" error={errors.organisation}>
          <input
            id={`${uid}-organisation`}
            name="organisation"
            type="text"
            className="input"
            value={values.organisation}
            onChange={setValue}
            onBlur={onBlur}
            autoComplete="organization"
          />
        </Field>

        <Field id={`${uid}-phone`} label="Phone" error={errors.phone}>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            className="input"
            value={values.phone}
            onChange={setValue}
            onBlur={onBlur}
            autoComplete="tel"
            aria-invalid={errors.phone ? 'true' : undefined}
            aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
          />
        </Field>

        <Field
          id={`${uid}-type`}
          label="Type of enquiry"
          required
          error={errors.enquiryType}
        >
          <select
            id={`${uid}-type`}
            name="enquiryType"
            className="input"
            value={values.enquiryType}
            onChange={setValue}
            onBlur={onBlur}
            required
            aria-required="true"
            aria-invalid={errors.enquiryType ? 'true' : undefined}
            aria-describedby={errors.enquiryType ? `${uid}-type-error` : undefined}
          >
            <option value="">Please choose…</option>
            {ENQUIRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id={`${uid}-subject`} label="Subject" required error={errors.subject}>
          <input
            id={`${uid}-subject`}
            name="subject"
            type="text"
            className="input"
            value={values.subject}
            onChange={setValue}
            onBlur={onBlur}
            required
            aria-required="true"
            aria-invalid={errors.subject ? 'true' : undefined}
            aria-describedby={errors.subject ? `${uid}-subject-error` : undefined}
          />
        </Field>

        <div className="field-full">
          <Field
            id={`${uid}-message`}
            label="Message"
            required
            error={errors.message}
            hint="Please include any deadlines, countries or regions relevant to your enquiry."
          >
            <textarea
              id={`${uid}-message`}
              name="message"
              className="input"
              rows={6}
              value={values.message}
              onChange={setValue}
              onBlur={onBlur}
              required
              aria-required="true"
              aria-invalid={errors.message ? 'true' : undefined}
              aria-describedby={`${uid}-message-hint${
                errors.message ? ` ${uid}-message-error` : ''
              }`}
            />
          </Field>
        </div>
      </div>

      {/*
        Consent. Required by the Privacy Policy and enforced again by
        POST /api/contact. The input comes first in the DOM so the CSS can lay
        the row out as [checkbox][label] with the whole row as the hit area.
      */}
      <div className={`field field-consent${errors.consent ? ' has-error' : ''}`}>
        <input
          id={`${uid}-consent`}
          name="consent"
          type="checkbox"
          checked={values.consent}
          onChange={setValue}
          onBlur={onBlur}
          aria-required="true"
          aria-invalid={errors.consent ? 'true' : undefined}
          aria-describedby={errors.consent ? `${uid}-consent-error` : undefined}
        />
        <label htmlFor={`${uid}-consent`}>
          I agree that CGP may use the details I have provided to respond to this
          enquiry, as described in the{' '}
          <SmartLink to="/privacy">Privacy Policy</SmartLink>.
          <span className="req" aria-hidden="true"> *</span>
        </label>
        {errors.consent && (
          <p className="field-error" id={`${uid}-consent-error`}>
            <i className="bi bi-exclamation-circle" aria-hidden="true" /> {errors.consent}
          </p>
        )}
      </div>

      {/*
        Spam protection, layer 1: a visually hidden field that only an automated
        form-filler will see. It is kept in the tab order as `aria-hidden` and
        `tabindex="-1"` so it cannot confuse keyboard or screen-reader users,
        and the label is the only thing a bot reads.
      */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Leave this field empty</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={setValue}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <span className="spinner" aria-hidden="true" /> Sending…
            </>
          ) : (
            'Send message'
          )}
        </button>
        <p className="form-note">
          Prefer email?{' '}
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </p>
      </div>
    </form>
  );
}

export default function PartnerWithUs() {
  const jsonLd = useMemo(
    () => [
      ...BASE_JSONLD,
      pageJsonLd({ name: META.title, path: '/partner-with-us', description: META.description }),
      breadcrumbJsonLd(META.breadcrumb),
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: META.title,
        url: `/partner-with-us`,
        mainEntity: { '@id': '/#organisation' },
      },
    ],
    []
  );

  return (
    <Layout navId="partner-with-us">
      <Seo title={META.title} description={META.description} path="/partner-with-us" jsonLd={jsonLd} />

      <PageHeader
        trail={META.breadcrumb}
        h1="Partner With Us"
        dek="Reach out to discuss partnerships, technical collaboration, research enquiries, or to learn more about CGP's work."
      />

      <section>
        <div className="wrap">
          <div className="contact-layout">
            {/* ---------------- Left: details ---------------- */}
            <div className="contact-details" id="contact-details">
              <h2>Contact information</h2>

              <ul className="contact-info-grid contact-info-grid--stack">
                <li className="contact-info-item">
                  <span className="contact-info-icon" aria-hidden="true">
                    <i className="bi bi-geo-alt-fill" />
                  </span>
                  <div>
                    <h3>Location</h3>
                    <address>{CONTACT.address.formatted}</address>
                    <a
                      className="text-link"
                      href={CONTACT.mapLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Google Maps
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </div>
                </li>

                <li className="contact-info-item">
                  <span className="contact-info-icon" aria-hidden="true">
                    <i className="bi bi-envelope-fill" />
                  </span>
                  <div>
                    <h3>Email</h3>
                    <p>
                      <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                    </p>
                    <p className="muted">General and partnership enquiries</p>
                  </div>
                </li>

                <li className="contact-info-item">
                  <span className="contact-info-icon" aria-hidden="true">
                    <i className="bi bi-clock-fill" />
                  </span>
                  <div>
                    <h3>Office hours</h3>
                    <p>{CONTACT.hours.days}</p>
                    <p>{CONTACT.hours.time}</p>
                  </div>
                </li>
              </ul>

              <div className="map-embed" role="region" aria-label="Map of the CGP office location">
                <iframe
                  src={CONTACT.mapEmbedUrl}
                  title={`Map showing the ${BRAND.abbr} office in ${CONTACT.address.formatted}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="contact-social">
                <h3>Follow {BRAND.abbr}</h3>
                <ul className="footer-social" aria-label={`${BRAND.abbr} on social media`}>
                  {SOCIAL.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${BRAND.abbr} on ${s.label} (opens in a new tab)`}
                      >
                        <i className={`bi ${s.icon}`} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ---------------- Right: form ---------------- */}
            <div className="contact-form-column" id="contact-form">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="section-surface" aria-labelledby="other-ways">
        <div className="wrap">
          <h2 id="other-ways">Other ways to engage with CGP</h2>
          <div className="grid-3">
            <article className="icon-card">
              <div className="card-icon" aria-hidden="true">
                <i className="bi bi-people-fill" />
              </div>
              <h3>Partner with us</h3>
              <p>Ministries, institutes, funders and implementing partners.</p>
              <SmartLink className="text-link card-link" to="/partners">
                See our partners <i className="bi bi-arrow-right" aria-hidden="true" />
              </SmartLink>
            </article>
            <article className="icon-card">
              <div className="card-icon" aria-hidden="true">
                <i className="bi bi-briefcase-fill" />
              </div>
              <h3>Join the team</h3>
              <p>Open roles and the technical areas CGP recruits across.</p>
              <SmartLink className="text-link card-link" to="/careers">
                View careers <i className="bi bi-arrow-right" aria-hidden="true" />
              </SmartLink>
            </article>
            <article className="icon-card">
              <div className="card-icon" aria-hidden="true">
                <i className="bi bi-shield-check" />
              </div>
              <h3>Privacy &amp; terms</h3>
              <p>How we handle your data, and the terms for using this site.</p>
              <SmartLink className="text-link card-link" to="/privacy">
                Privacy Policy <i className="bi bi-arrow-right" aria-hidden="true" />
              </SmartLink>
            </article>
          </div>
        </div>
      </section>

      <CtaStrip
        title="Looking for something specific?"
        body="Our project record and research library may already answer your question."
        actions={[
          { label: 'Explore Our Work', to: '/projects', variant: 'white' },
          { label: 'Read the Research', to: '/insights', variant: 'white' },
        ]}
      />
    </Layout>
  );
}
