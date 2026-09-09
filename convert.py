import os
import glob
import re

def style_replacer(match):
    style_str = match.group(1)
    # Basic parsing of CSS styles to JS object
    rules = style_str.split(';')
    js_rules = []
    for rule in rules:
        if ':' not in rule:
            continue
        key, val = rule.split(':', 1)
        key = key.strip()
        val = val.strip()
        # kebab-case to camelCase
        parts = key.split('-')
        if len(parts) > 1:
            key = parts[0] + ''.join(p.title() for p in parts[1:])
        
        # fix numbers if they are pure digits without unit? Not needed, string is fine.
        js_rules.append(f"{key}: '{val}'")
    
    dict_str = ", ".join(js_rules)
    return f"style={{{{{dict_str}}}}}"

def convert_html_to_jsx(html_content):
    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL | re.IGNORECASE)
    if not body_match:
        return ""
    
    body = body_match.group(1)
    
    # Remove scripts matching site.js or search-index.js
    body = re.sub(r'<script\s+src="search-index\.js"></script>', '', body, flags=re.IGNORECASE)
    body = re.sub(r'<script\s+src="site\.js"></script>', '', body, flags=re.IGNORECASE)
    
    # Convert void tags (img, input, hr, br)
    body = re.sub(r'<(img|input|hr|br)([^>]*?)(?<!/)>', r'<\1\2 />', body, flags=re.IGNORECASE)
    
    # Convert class to className
    body = re.sub(r'\bclass="', 'className="', body)
    
    # Convert for to htmlFor
    body = re.sub(r'\bfor="', 'htmlFor="', body)
    
    # Convert inline styles
    body = re.sub(r'style="([^"]*)"', style_replacer, body)

    # Convert autoComplete
    body = re.sub(r'\bautocomplete="', 'autoComplete="', body, flags=re.IGNORECASE)
    
    # Fix .html links to use routing properly, e.g href="about.html" -> href="/about"
    body = re.sub(r'href="([^"]+)\.html"', lambda m: f'href="/{m.group(1)}"' if m.group(1) != 'index' else 'href="/"', body)
    
    # Remove HTML comments
    body = re.sub(r'<!--.*?-->', '', body, flags=re.DOTALL)
    
    return body.strip()

def main():
    base_dir = '/home/benjakusa/CGHI'
    frontend_dir = os.path.join(base_dir, 'frontend')
    pages_dir = os.path.join(frontend_dir, 'src', 'pages')
    os.makedirs(pages_dir, exist_ok=True)
    
    html_files = glob.glob(os.path.join(base_dir, '*.html'))
    
    import_statements = []
    routes_code = []
    
    for file_path in html_files:
        filename = os.path.basename(file_path)
        name, _ = os.path.splitext(filename)
        
        # component name: e.g. about -> About, what-we-do -> WhatWeDo, index -> Index
        component_name = ''.join(word.title() for word in name.split('-'))
        if component_name == 'Index':
            component_name = 'Home'
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        jsx_body = convert_html_to_jsx(content)
        
        # Wrap in component
        jsx_file_content = f"""import React, {{ useEffect }} from 'react';

export default function {component_name}() {{
  useEffect(() => {{
    if (window.initSiteLogic) window.initSiteLogic();
  }}, []);

  return (
    <>
      {jsx_body}
    </>
  );
}}
"""
        out_path = os.path.join(pages_dir, f"{component_name}.jsx")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(jsx_file_content)
            
        print(f"Generated {component_name}.jsx")
        
        import_statements.append(f"import {component_name} from './pages/{component_name}';")
        route_path = '/' if name == 'index' else f"/{name}"
        routes_code.append(f'        <Route path="{route_path}" element={{<{component_name} />}} />')
        # Handle links in HTML that have .html? 
        # React router needs <Link>, but standard <a> tags work (just trigger full reload).
        # We can either use regex to change <a href="*.html"> to <a href="*">
        # Let's write a sed script or just do it in python!

    # Create App.jsx
    app_jsx = f"""import React from 'react';
import {{ BrowserRouter as Router, Routes, Route }} from 'react-router-dom';
import './style.css';

{chr(10).join(import_statements)}

function App() {{
  return (
    <Router>
      <Routes>
{chr(10).join(routes_code)}
      </Routes>
    </Router>
  );
}}

export default App;
"""
    with open(os.path.join(frontend_dir, 'src', 'App.jsx'), 'w', encoding='utf-8') as f:
        f.write(app_jsx)
        
    print("Generated App.jsx")

if __name__ == '__main__':
    main()
