const fs = require('fs');
const puppeteer = require('puppeteer');
const marked = require('marked');

(async () => {
  try {
    const md = fs.readFileSync('/home/kirtagya/.gemini/antigravity/brain/ba5c5da8-af5c-45f0-87aa-f4160579d0f7/walkthrough.md', 'utf-8');
    const htmlContent = marked.parse(md);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; padding: 40px; color: #333; }
          h1, h2, h3 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; margin-top: 24px; margin-bottom: 16px; }
          code { background: rgba(175, 184, 193, 0.2); padding: 0.2em 0.4em; border-radius: 6px; font-family: monospace; }
          blockquote { border-left: 0.25em solid #d0d7de; padding: 0 1em; color: #656d76; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: '/home/kirtagya/Desktop/walkthrough.pdf', format: 'A4', margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
    await browser.close();
    console.log('PDF generated at /home/kirtagya/Desktop/walkthrough.pdf');
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
