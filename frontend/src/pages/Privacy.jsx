import React, { useEffect } from 'react';
import Footer from '../components/Footer';

export default function Privacy() {
  useEffect(() => {
    if (window.initSiteLogic) window.initSiteLogic();
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <a className="brand" href="/" aria-label="CGP Home">
            <img className="brand-logo" src="Assets/logo.png" alt="Center for Global Health and Pandemic Intelligence" />
          </a>
          <button className="nav-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
          <nav className="primary-nav" aria-label="Primary">
            <a href="/">Home</a>
            <div className="dropdown">
              <button className="dropbtn">Who We Are <span aria-hidden="true"><i className="bi bi-chevron-down"></i></span></button>
              <div className="dropdown-content">
                <a href="/about">About Us</a>
                <a href="/careers">Careers</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy Policy</a>
              </div>
            </div>
            <div className="dropdown">
              <button className="dropbtn">What We Do <span aria-hidden="true"><i className="bi bi-chevron-down"></i></span></button>
              <div className="dropdown-content">
                <a href="/what-we-do">Overview</a>
                <a href="/projects">Projects and Impact</a>
                <a href="/initiatives">CGP Initiatives</a>
                <a href="/resources">Resources</a>
              </div>
            </div>
            <a href="/news">News and Insights</a>
            <a href="/admin/login" className="nav-search-btn" aria-label="Staff login"><i className="bi bi-person-circle"></i> Staff</a>
          </nav>
        </div>
      </header>

      <main>
        <div className="page-header">
          <div className="wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>Privacy Policy</nav>
            <h1>Privacy Policy</h1>
            <p className="dek">How CGP collects, uses, and protects information on this website.</p>
          </div>
        </div>

        <section className="privacy-section">
          <div className="wrap">
            <div className="privacy-doc">
              <p className="privacy-updated">
                <i className="bi bi-clock-history" aria-hidden="true"></i>
                Last updated: 10 September 2026
              </p>

              <div className="privacy-intro">
                <p>
                  This Privacy Policy explains how The Center for Global Health and Pandemic Intelligence
                  (referred to as CGP, we, us, or our) collects, uses, stores, shares, and protects personal
                  data when you visit this website or otherwise interact with us. It applies to this website
                  and to any enquiry, application, or communication you send to us through the channels listed
                  on this site.
                </p>
                <p>
                  We are committed to handling personal data lawfully and transparently. This policy is written
                  to meet the requirements of the Kenya Data Protection Act, 2019 (the DPA) and, where relevant,
                  the EU and UK General Data Protection Regulation (together, the GDPR). If you are located in
                  the European Economic Area, the United Kingdom, or Switzerland, the GDPR provisions described
                  below apply to you in addition to the DPA.
                </p>
              </div>

              <h2>1. Who we are</h2>
              <p>The data controller responsible for your personal data is:</p>
              <div className="privacy-contact-card">
                <p><strong>The Center for Global Health and Pandemic Intelligence</strong></p>
                <p>Westlands, Nairobi, Kenya</p>
                <p>Email: <a href="mailto:info@pandemicintelcenter.org">info@pandemicintelcenter.org</a></p>
                <p>Telephone: N/A</p>
                <p>Office hours: 08:00 to 16:00 East Africa Time, Monday to Friday</p>
              </div>
              <p>
                For any question about this policy or about how we handle your personal data, please write to
                the email address above with the subject line Privacy Enquiry.
              </p>
              <div className="privacy-placeholder">
                <i className="bi bi-pencil-square" aria-hidden="true"></i>
                <span>
                  Before publishing, add your Data Protection Contact here if one has been appointed,
                  otherwise delete this notice. The Kenya Data Protection Act uses the term Data Protection
                  Officer and it must be a named person with published contact details.
                </span>
              </div>

              <h2>2. Personal data we collect</h2>
              <p>
                We only collect personal data that is necessary for the purposes described in this policy. The
                categories we collect depend on how you interact with us.
              </p>
              <p>
                <strong>Information you give us directly.</strong> When you contact us through the Contact page
                or by email, we collect your name, email address, telephone number if you provide one, the name
                of your organisation if relevant, and the content of your message.
              </p>
              <p>
                <strong>Job and consultancy applications.</strong> When you apply for a role or a consultancy
                engagement advertised on our Careers page, we collect your name, contact details, the job or
                engagement you are applying for, your curriculum vitae or resume, your cover letter, any work
                sample or writing sample you submit, and any other document you choose to attach to your
                application, such as a portfolio, a reference letter, or a certified certificate.
              </p>
              <p>
                <strong>Information collected automatically.</strong> When you visit this website, our server
                records limited technical information needed to deliver the site safely, such as your IP
                address, the date and time of your request, the page you requested, the referring page if any,
                and your browser and device type. This information is used for security, troubleshooting, and
                to understand aggregate site usage. We do not use it to build personal profiles.
              </p>
              <p>
                <strong>Information from embedded third party services.</strong> Some pages on this website,
                including the homepage, embed a video hosted on YouTube. When the embedded player loads,
                YouTube (operated by Google) may set cookies or receive technical information such as your IP
                address and your interaction with the player. This data is controlled by Google under its own
                privacy policy, not by CGP. See section 4 below for more detail and for how to limit this
                sharing.
              </p>
              <p>
                We do not knowingly collect special categories of personal data such as health data, biometric
                data, racial or ethnic origin, political opinions, religious beliefs, or trade union membership
                through this website. Please do not include such information in messages or application
                documents unless we specifically ask for it and it is required for a lawful purpose.
              </p>

              <h2>3. How and why we use your personal data</h2>
              <p>
                We use personal data only for the purposes for which it was collected, and only where we have
                a lawful basis to do so. The purposes and lawful bases are as follows.
              </p>
              <p>
                <strong>To respond to your enquiries.</strong> When you contact us, we use your name, contact
                details, and the content of your message to answer you, to route your message to the right
                member of our team, and to keep a record of the correspondence. Under the DPA the lawful basis
                is our legitimate interest in responding to enquiries addressed to us, and, where you have
                asked us to take a step before entering into an agreement, the performance of that step. Under
                the GDPR the same bases apply.
              </p>
              <p>
                <strong>To assess job and consultancy applications.</strong> When you apply for a role or an
                engagement advertised on this site, we use your application materials to evaluate your
                suitability, to communicate with you about the process, and to keep records for as long as
                needed for recruitment and, where applicable, to defend against legal claims. Under the DPA
                and the GDPR the lawful basis is our legitimate interest in recruiting qualified personnel
                and, where you have provided information about a disability or a reasonable adjustment, your
                explicit consent or the establishment, exercise, or defence of legal claims.
              </p>
              <p>
                <strong>To operate, secure, and improve this website.</strong> We use server logs and
                technical information to keep the site available and secure, to detect and respond to
                attacks or misuse, to diagnose faults, and to understand aggregate usage patterns so we can
                improve the content and structure of the site. The lawful basis is our legitimate interest
                in maintaining a safe and functional website.
              </p>
              <p>
                <strong>To comply with legal obligations.</strong> We may process personal data where we are
                required to do so by law, by a court order, or by a competent regulatory authority. The
                lawful basis is compliance with a legal obligation.
              </p>
              <p>
                We do not use your personal data for automated decision making or profiling that produces
                legal effects or similarly significant effects.
              </p>

              <h2>4. Cookies and similar technologies</h2>
              <p>
                This website does not use advertising cookies, does not use analytics cookies, and does not
                track you across other websites. The only cookies or similar technologies that may be set when
                you use this site are those set by the embedded YouTube player described in section 2. If we
                introduce analytics or any other cookie in the future, we will update this policy and, where
                required by law, ask for your consent before setting it.
              </p>
              <p>
                You can control or delete cookies through your browser settings. Blocking third party cookies
                will not prevent you from reading the content of this site. It may affect playback of the
                embedded YouTube video.
              </p>

              <h2>5. Who we share personal data with</h2>
              <p>
                We do not sell personal data. We do not rent personal data. We do not trade personal data. We
                share personal data only in the limited circumstances described below.
              </p>
              <p>
                <strong>Service providers who help us run the site and our operations.</strong> We may share
                personal data with hosting providers, email providers, and IT support providers who process
                data on our behalf and only on our documented instructions. These providers are bound by
                confidentiality and data protection obligations, and they are not permitted to use your data
                for their own purposes.
              </p>
              <p>
                <strong>Embedded third party services.</strong> The embedded YouTube player on the homepage
                is provided by Google. When the player loads, Google may collect data as described in
                section 2 above and in Google's own privacy notice.
              </p>
              <p>
                <strong>Professional advisers.</strong> We may share personal data with our lawyers, auditors,
                or insurers where this is necessary to obtain professional advice, to defend legal claims, or
                to meet our regulatory obligations.
              </p>
              <p>
                <strong>Authorities and regulators.</strong> We may share personal data with a public
                authority, a court, or a regulator where the law requires it, or where it is necessary to
                establish, exercise, or defend legal claims.
              </p>

              <h2>6. International transfers</h2>
              <p>
                Some of our service providers, and the embedded YouTube player, may process personal data
                outside Kenya, including in the European Economic Area, the United Kingdom, the United
                States, and other countries. Where we transfer personal data out of Kenya, we do so in
                accordance with the DPA and, in particular, with the safeguards required for transfers to
                third countries. Where we transfer personal data out of the European Economic Area or the
                United Kingdom in a way that the GDPR governs, we rely on appropriate safeguards such as
                the Standard Contractual Clauses approved by the European Commission or the International
                Data Transfer Addendum issued by the UK Information Commissioner's Office, or on an adequacy
                decision.
              </p>
              <div className="privacy-placeholder">
                <i className="bi bi-pencil-square" aria-hidden="true"></i>
                <span>
                  Before publishing, add the country or countries where your backend and database are hosted
                  as a short sentence at the start of this section. For example: The personal data we hold is
                  stored on servers located in Kenya.
                </span>
              </div>
              <p>
                You may ask us for more information about the safeguards we use for a specific transfer by
                writing to <a href="mailto:info@pandemicintelcenter.org">info@pandemicintelcenter.org</a>.
              </p>

              <h2>7. How long we keep personal data</h2>
              <p>
                We keep personal data only for as long as is necessary for the purpose for which it was
                collected, and then delete it or anonymise it. The retention periods we apply are set out
                below.
              </p>
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th>Category of data</th>
                    <th>Retention period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Enquiries received through the Contact page or by email</td>
                    <td>24 months from the date of last contact</td>
                  </tr>
                  <tr>
                    <td>Job and consultancy applications</td>
                    <td>12 months from the closing date of the recruitment</td>
                  </tr>
                  <tr>
                    <td>Server logs</td>
                    <td>90 days</td>
                  </tr>
                </tbody>
              </table>
              <div className="privacy-placeholder">
                <i className="bi bi-pencil-square" aria-hidden="true"></i>
                <span>
                  The three retention periods above are reasonable starting points. Confirm they match the
                  actual retention your team enforces and change them if not. Then delete this notice.
                </span>
              </div>
              <p>
                Where a legal obligation, a regulatory requirement, or the need to defend legal claims
                requires us to keep data for longer, we will keep it only for that longer period and only
                for that purpose.
              </p>

              <h2>8. Your rights</h2>
              <p>
                Subject to the conditions and exceptions in the applicable law, you have the following rights
                in relation to your personal data.
              </p>
              <div className="privacy-rights">
                <div className="privacy-right">
                  <h3>Right of access</h3>
                  <p>You may ask us to confirm whether we hold personal data about you and, if so, to give you a copy of that data together with information about how we use it.</p>
                </div>
                <div className="privacy-right">
                  <h3>Right to rectification</h3>
                  <p>You may ask us to correct personal data that is inaccurate or incomplete.</p>
                </div>
                <div className="privacy-right">
                  <h3>Right to erasure</h3>
                  <p>You may ask us to delete personal data where there is no good reason for us to continue to hold it, where you have withdrawn consent, where you have successfully objected, or where the law requires deletion.</p>
                </div>
                <div className="privacy-right">
                  <h3>Right to restriction</h3>
                  <p>You may ask us to restrict the processing of your personal data while we verify accuracy or consider an objection you have raised.</p>
                </div>
                <div className="privacy-right">
                  <h3>Right to object</h3>
                  <p>You may object to processing we carry out on the basis of our legitimate interests. We will stop unless we can show compelling legitimate grounds or the processing is needed for legal claims.</p>
                </div>
                <div className="privacy-right">
                  <h3>Right to data portability</h3>
                  <p>Where the GDPR applies, you may ask us to provide personal data you have given to us in a structured, commonly used, machine readable format, and to transmit it to another controller where technically feasible.</p>
                </div>
                <div className="privacy-right">
                  <h3>Right to withdraw consent</h3>
                  <p>Where we rely on your consent, you may withdraw it at any time. Withdrawal does not affect the lawfulness of processing carried out before the withdrawal.</p>
                </div>
                <div className="privacy-right">
                  <h3>Right to lodge a complaint</h3>
                  <p>You may lodge a complaint with a supervisory authority. In Kenya, the Office of the Data Protection Commissioner at <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer">www.odpc.go.ke</a>. In the European Economic Area, the supervisory authority of your country. In the United Kingdom, the Information Commissioner's Office at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.</p>
                </div>
              </div>
              <p>
                To exercise any of these rights, please write to
                <a href="mailto:info@pandemicintelcenter.org">info@pandemicintelcenter.org</a>. We will respond
                within the time limits set by the applicable law, which are 30 days under the DPA and one month
                under the GDPR. We may ask you for information needed to confirm your identity before we act on
                your request.
              </p>

              <h2>9. How we protect personal data</h2>
              <p>
                We use appropriate technical and organisational measures to protect personal data against
                accidental or unlawful destruction, loss, alteration, unauthorised disclosure, and
                unauthorised access. These measures include the following.
              </p>
              <ul className="privacy-list">
                <li>Access to the administrative area of this website is restricted to authorised staff and is protected by credentials.</li>
                <li>Passwords are stored in hashed form and are never stored in plain text.</li>
                <li>Uploaded documents are stored in a directory that is not publicly listable.</li>
                <li>Data in transit between your browser and our server is protected by transport layer security where the site is served over HTTPS.</li>
                <li>We review our access controls and our backups periodically.</li>
              </ul>
              <p>
                No method of transmission over the internet and no method of electronic storage is completely
                secure. While we take the protection of personal data seriously, we cannot guarantee absolute
                security.
              </p>

              <h2>10. Children</h2>
              <p>
                This website and the opportunities described on it are directed at adults. We do not knowingly
                collect personal data from children under the age of 16. If you believe that a child has
                provided personal data to us, please contact us at
                <a href="mailto:info@pandemicintelcenter.org">info@pandemicintelcenter.org</a> and we will take
                steps to delete the data.
              </p>

              <h2>11. Changes to this policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, in
                the law, or in the services we offer. When we make a material change, we will update the date
                at the top of this page. We encourage you to review this page periodically. Where the law
                requires it, we will ask for your consent to a material change before it takes effect.
              </p>

              <h2>12. How to contact us</h2>
              <p>
                If you have any question about this Privacy Policy or about how we handle personal data,
                please contact us.
              </p>
              <div className="privacy-contact-card">
                <p><strong>The Center for Global Health and Pandemic Intelligence</strong></p>
                <p>Westlands, Nairobi, Kenya</p>
                <p>Email: <a href="mailto:info@pandemicintelcenter.org">info@pandemicintelcenter.org</a></p>
                <p>Telephone: N/A</p>
                <p>Office hours: 08:00 to 16:00 East Africa Time, Monday to Friday</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

    </>
  );
}