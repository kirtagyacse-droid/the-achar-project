import markdown
from weasyprint import HTML

md_file = '/home/kirtagya/.gemini/antigravity/brain/ba5c5da8-af5c-45f0-87aa-f4160579d0f7/walkthrough.md'
pdf_file = '/home/kirtagya/Desktop/walkthrough.pdf'

with open(md_file, 'r', encoding='utf-8') as f:
    text = f.read()

html = markdown.markdown(text, extensions=['extra'])
html_doc = f"""
<html>
<head>
<style>
  body {{ font-family: sans-serif; line-height: 1.6; padding: 20px; }}
  h1, h2, h3 {{ border-bottom: 1px solid #ddd; padding-bottom: 5px; }}
  code {{ background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }}
  blockquote {{ border-left: 4px solid #ddd; padding-left: 10px; color: #666; }}
</style>
</head>
<body>
{html}
</body>
</html>
"""

HTML(string=html_doc).write_pdf(pdf_file)
print(f"Successfully generated {pdf_file}")
