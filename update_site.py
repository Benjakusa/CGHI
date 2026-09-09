import os
import glob
import re

# 1. Update style.css
with open('style.css', 'r') as f:
    css = f.read()

# Replace color variables
css = css.replace('--ink:#101B2D;', '--black:#000000; --ink:#000000;')
css = css.replace('--ink-soft:#3B4657;', '--ink-soft:#000000;')
css = css.replace('--paper:#ECEAE1;', '--paper:#FFFFFF;')
css = css.replace('--paper-raised:#F5F4EE;', '--paper-raised:#FFFFFF;')
css = css.replace('--signal:#B23A2E;', '--signal:#87CEEB;')
css = css.replace('--field:#35634A;', '--field:#87CEEB;')
css = css.replace('--line:#C9C4B4;', '--line:#000000;')
css = css.replace('--line-strong:#a9a392;', '--line-strong:#000000;')
css = css.replace('--serif: \'Newsreader\', Georgia, serif;', '--serif: \'IBM Plex Sans\', Helvetica, Arial, sans-serif;')
# Replace any specific remaining hex codes
css = re.sub(r'#2a3750|#C7CCD8|#263349|#B8BECB|#7c8499|#8a91a6|#9aa1b3', '#000000', css)
css = re.sub(r'rgba\(16,27,45,.92\)', 'rgba(0,0,0,0.95)', css)

# Add dropdown CSS and reset serif for modern look
dropdown_css = """
/* ---------- Dropdowns ---------- */
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown .dropbtn {
  font-family: var(--sans);
  font-size: .88rem;
  font-weight: 600;
  color: var(--black);
  text-transform: uppercase;
  letter-spacing: .08em;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.dropdown:hover .dropbtn, .dropdown:focus-within .dropbtn {
  color: var(--signal);
}
.dropdown-content {
  display: none;
  position: absolute;
  background-color: var(--white);
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 200;
  border: 1px solid var(--black);
  top: 100%;
  left: 0;
}
.dropdown:hover .dropdown-content, .dropdown:focus-within .dropdown-content {
  display: block;
}
.dropdown-content a {
  color: var(--black) !important;
  padding: 12px 16px !important;
  text-decoration: none;
  display: block;
  text-transform: none;
  font-size: .9rem !important;
  font-weight: 500 !important;
  border-bottom: 1px solid var(--black);
  margin: 0 !important;
}
.dropdown-content a:last-child {
  border-bottom: none;
}
.dropdown-content a:hover {
  background-color: var(--signal);
  color: var(--white) !important;
}
"""
css += dropdown_css

with open('style.css', 'w') as f:
    f.write(css)

# 2. Update HTML navigation
new_nav = """<nav class="primary-nav" aria-label="Primary">
      <a href="index.html" class="[HOME_ACTIVE]">Home</a>
      <div class="dropdown">
        <button class="dropbtn">Who We Are <span aria-hidden="true">&#9662;</span></button>
        <div class="dropdown-content">
          <a href="about.html">About Us</a>
          <a href="careers.html">Jobs</a>
          <a href="contact.html">Contact</a>
          <a href="privacy.html">Privacy Policy</a>
        </div>
      </div>
      <div class="dropdown">
        <button class="dropbtn">What We Do <span aria-hidden="true">&#9662;</span></button>
        <div class="dropdown-content">
          <a href="what-we-do.html">Overview</a>
          <a href="projects.html">Projects & Impact</a>
          <a href="initiatives.html">Initiatives</a>
          <a href="resources.html">Resources</a>
        </div>
      </div>
      <a href="news.html" class="[NEWS_ACTIVE]">News & Insights</a>
      <button class="nav-search-btn" data-search-open type="button">Search <span aria-hidden="true">/</span></button>
    </nav>"""

html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r') as f:
        content = f.read()

    # Create the nav string specific for this file
    nav_for_file = new_nav.replace("[HOME_ACTIVE]", "active" if file == "index.html" else "")
    nav_for_file = nav_for_file.replace("[NEWS_ACTIVE]", "active" if file == "news.html" else "")

    # Regex to find the <nav class="primary-nav"> ... </nav> block
    content = re.sub(r'<nav class="primary-nav".*?</nav>', nav_for_file, content, flags=re.DOTALL)
    
    with open(file, 'w') as f:
        f.write(content)
print("Updated CSS and HTML successfully.")
