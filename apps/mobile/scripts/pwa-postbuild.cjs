// PWA Post-Build Script
// After Expo exports the web build to dist/, this script:
// 1. Copies web/manifest.json and web/sw.js to dist/
// 2. Injects <link rel="manifest"> and SW registration into dist/index.html
//
// Usage: node scripts/pwa-postbuild.cjs

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const WEB = path.join(__dirname, '..', 'web');

// Ensure dist exists
if (!fs.existsSync(DIST)) {
  console.error('dist/ not found. Run "npx expo export:web" first.');
  process.exit(1);
}

// Copy manifest.json
const manifestSrc = path.join(WEB, 'manifest.json');
const manifestDest = path.join(DIST, 'manifest.json');
if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log('✓ Copied manifest.json');
}

// Copy sw.js
const swSrc = path.join(WEB, 'sw.js');
const swDest = path.join(DIST, 'sw.js');
if (fs.existsSync(swSrc)) {
  fs.copyFileSync(swSrc, swDest);
  console.log('✓ Copied sw.js');
}

// Inject PWA tags into index.html
const indexPath = path.join(DIST, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf-8');

  // Inject manifest link before </head>
  const manifestTag = '\n  <link rel="manifest" href="/manifest.json">\n';
  html = html.replace('</head>', `${manifestTag}</head>`);

  // Inject SW registration before </body>
  const swScript = `
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(reg) {
          console.log('SW registered:', reg.scope);
        }).catch(function(err) {
          console.log('SW registration failed:', err);
        });
      });
    }
  </script>
`;
  html = html.replace('</body>', `${swScript}\n</body>`);

  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log('✓ Injected PWA tags into index.html');
}

console.log('PWA post-build complete.');
