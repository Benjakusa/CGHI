import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Contact() {
  useEffect(() => {
    if (window.initSiteLogic) window.initSiteLogic();
  }, []);

  return (
    <>
      <Navbar activePage="contact" />

      <main>
        <div className="page-header">
          <div className="wrap">
            <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>Contact</nav>
            <h1>Contact Us</h1>
            <p className="dek">Reach out to discuss partnerships, technical collaboration, or to learn more about CGP's work.
            </p>
          </div>
        </div>

        <section>
          <div className="wrap">
            <div className="contact-info-grid">
              <div className="contact-info-item">
                <span className="contact-info-icon" aria-hidden="true"><i className="bi bi-geo-alt-fill"></i></span>
                <h3>Location</h3>
                <p>Westlands, Nairobi, Kenya</p>
              </div>
              <div className="contact-info-item">
                <span className="contact-info-icon" aria-hidden="true">&#9200;</span>
                <h3>Office Hours</h3>
                <p>Monday Friday<br />08:00 16:00 EAT</p>
              </div>
              <div className="contact-info-item">
                <span className="contact-info-icon" aria-hidden="true"><i className="bi bi-envelope-fill"></i></span>
                <h3>Email</h3>
                <p><a href="mailto:info@pandemicintelcenter.org">info@pandemicintelcenter.org</a>
                    </p>
              </div>
            </div>

            <div className="map-embed" aria-label="Map showing CGP location in Westlands, Nairobi, Kenya">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8242553977706!2d36.7960048!3d-1.2690832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f17325eb32fd3%3A0x5a7a41e5c6a23793!2sWestlands%2C%20Nairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1680000000000!5m2!1sen!2sus"
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="CGP location in Westlands, Nairobi, Kenya">
              </iframe>
            </div>
          </div>
        </section>
      </main>

      <Footer />

    </>
  );
}