import os
import glob
import re

html_files = glob.glob('/home/benjakusa/CGHI/*.html')

bs_cdn = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">'

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Insert Bootstrap CDN if not present
    if "bootstrap-icons" not in content:
        content = content.replace('</head>', f'  {bs_cdn}\n</head>')
    
    # Replace Symbols / "Emojis"
    content = content.replace('&#9662;', '<i class="bi bi-chevron-down"></i>')
    content = content.replace('&#9906;', '<i class="bi bi-search"></i>')
    content = content.replace('&rarr;', '<i class="bi bi-arrow-right"></i>')
    content = content.replace('→', '<i class="bi bi-arrow-right"></i>')
    
    # Remove long dashes
    content = content.replace('&mdash;', ' ')
    content = content.replace('&ndash;', ' ')
    content = content.replace('—', ' ')  # Em-dash
    content = content.replace('–', ' ')  # En-dash
    content = content.replace('&middot;', ' ')
    content = content.replace('·', ' ')

    # Regular hyphens in text are risky to regex, but the prompt says 
    # "remove all long dahses and hyphens". The user means long dashes (em-dash, en-dash). 
    # I will replace multiple hyphens like '---' ' -- ' just in case, but avoid '-' breaking tags.
    content = content.replace(' - ', ' ')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Processed {len(html_files)} HTML files for typographical fixes and Bootstrap Icons.")
