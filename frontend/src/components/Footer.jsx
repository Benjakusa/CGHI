import React from 'react';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="wrap">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <p className="footer-tagline">&ldquo;Building Intelligence for a Safer World&rdquo;</p>
                        <p className="footer-mission">
                            To harness data, science, and multisectoral partnerships to strengthen surveillance
                            systems, accelerate early warning, and empower frontline responders.
                        </p>
                        <div className="footer-social" aria-label="CGP on social media">
                            <a
                                href="https://www.facebook.com/profile.php?id=61582543745887"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="CGP on Facebook"
                                title="Facebook"
                            >
                                <i className="bi bi-facebook" aria-hidden="true"></i>
                            </a>
                            <a
                                href="https://www.linkedin.com/company/center-for-global-health-and-pandemic-intelligence/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="CGP on LinkedIn"
                                title="LinkedIn"
                            >
                                <i className="bi bi-linkedin" aria-hidden="true"></i>
                            </a>
                            <a
                                href="https://x.com/cghpintel"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="CGP on X"
                                title="X"
                            >
                                <i className="bi bi-twitter-x" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4>Navigate</h4>
                        <ul>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/what-we-do">What We Do</a></li>
                            <li><a href="/projects">Projects &amp; Impact</a></li>
                            <li><a href="/initiatives">CGP Initiatives</a></li>
                            <li><a href="/resources">Resources</a></li>
                            <li><a href="/news">News &amp; Insights</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Involved</h4>
                        <ul>
                            <li><a href="/contact">Partner With Us</a></li>
                            <li><a href="/careers">Careers</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Contact</h4>
                        <ul>
                            <li>Westlands, Nairobi, Kenya</li>
                            <li></li>
                            <li><a href="mailto:info@pandemicintelcenter.org">info@pandemicintelcenter.org</a></li>
                            <li>08:00 – 16:00, Mon – Fri</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>&copy; {new Date().getFullYear()} The Center for Global Health and Pandemic Intelligence. All rights reserved.</span>
                    <span>Westlands, Nairobi, Kenya</span>
                </div>
            </div>
        </footer>
    );
}