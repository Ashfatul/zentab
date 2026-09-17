import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const OUT_DIR = path.join(ROOT_DIR, 'out');
const DIST_DIR = path.join(ROOT_DIR, 'dist-extension');

console.log('🚀 Starting ZenTab extension build pipeline...\n');

// 1. Run Next.js static build
console.log('📦 Step 1: Running next build...');
execSync('npm run build', { stdio: 'inherit' });

// 2. Clean and create dist-extension
console.log('\n🧹 Step 2: Preparing dist-extension directory...');
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Copy all files from out to dist-extension
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirSync(OUT_DIR, DIST_DIR);

// 3. Rename _next to next_assets (Chrome rejects directories starting with _)
console.log('🔄 Step 3: Renaming _next to next_assets...');
const oldNextDir = path.join(DIST_DIR, '_next');
const newNextDir = path.join(DIST_DIR, 'next_assets');
if (fs.existsSync(oldNextDir)) {
  fs.renameSync(oldNextDir, newNextDir);
}

// Remove unnecessary Next.js internal files that start with _ or .
const rootEntries = fs.readdirSync(DIST_DIR);
for (const entry of rootEntries) {
  if (entry.startsWith('_') || entry.startsWith('.')) {
    const p = path.join(DIST_DIR, entry);
    if (fs.statSync(p).isDirectory()) {
      fs.rmSync(p, { recursive: true, force: true });
    } else {
      fs.unlinkSync(p);
    }
  }
}

// 4. Extract inline scripts from HTML (Chrome & Firefox MV3 CSP compliance)
console.log('🛡️ Step 4: Extracting inline scripts for CSP compliance...');
const inlineScriptsDir = path.join(newNextDir, 'inline');
fs.mkdirSync(inlineScriptsDir, { recursive: true });

function processHtmlFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');

  let scriptCount = 0;
  // Match <script>...</script> tags without src
  html = html.replace(
    /<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi,
    (match, attrs, content) => {
      const trimmed = content.trim();
      if (!trimmed) return '';

      const scriptName = `inline_${path.basename(filePath, '.html')}_${scriptCount++}.js`;
      const scriptPath = path.join(inlineScriptsDir, scriptName);
      // Write script content, ensuring /_next/ is replaced with /next_assets/
      const processedContent = trimmed.replaceAll('/_next/', '/next_assets/');
      fs.writeFileSync(scriptPath, processedContent, 'utf-8');

      return `<script${attrs} src="/next_assets/inline/${scriptName}"></script>`;
    }
  );

  // Replace absolute /_next/ with /next_assets/
  html = html.replaceAll('/_next/', '/next_assets/');
  html = html.replaceAll('/icons/', '/icons/');
  html = html.replaceAll('/favicon.ico', '/icons/icon48.png');

  fs.writeFileSync(filePath, html, 'utf-8');
}

const htmlFiles = ['index.html', '404.html']
  .map((f) => path.join(DIST_DIR, f))
  .filter((f) => fs.existsSync(f));

htmlFiles.forEach(processHtmlFile);

// Also copy index.html as newtab.html for alternative loader compatibility
if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  fs.copyFileSync(path.join(DIST_DIR, 'index.html'), path.join(DIST_DIR, 'newtab.html'));
}

// 5. Replace /_next/ in all CSS and JS files
console.log('🔗 Step 5: Updating asset paths in JS and CSS files...');
function replaceInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (/\.(js|css|json)$/i.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('/_next/')) {
        content = content.replaceAll('/_next/', '/next_assets/');
        fs.writeFileSync(fullPath, content, 'utf-8');
      }
    }
  }
}

replaceInDir(DIST_DIR);

// 6. Ensure manifest.json and icons are in place
console.log('📋 Step 6: Verifying manifest and extension icons...');
const publicManifest = path.join(ROOT_DIR, 'public', 'manifest.json');
const distManifest = path.join(DIST_DIR, 'manifest.json');
if (fs.existsSync(publicManifest)) {
  fs.copyFileSync(publicManifest, distManifest);
}

const publicIcons = path.join(ROOT_DIR, 'public', 'icons');
const distIcons = path.join(DIST_DIR, 'icons');
if (fs.existsSync(publicIcons)) {
  copyDirSync(publicIcons, distIcons);
}

// 7. Create ZIP bundle for Chrome manual upload and Firefox AMO
console.log('🗜️ Step 7: Packaging zentab-extension.zip...');
const zipFile = path.join(ROOT_DIR, 'zentab-extension.zip');
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

try {
  execSync(`cd "${DIST_DIR}" && zip -r "${zipFile}" ./*`, { stdio: 'pipe' });
  console.log(`✅ Generated zip package: ${zipFile}`);
} catch (err) {
  console.warn('Note: zip command not found or failed, extension directory dist-extension is ready for unpacked loading.');
}

console.log('\n🎉 Build Complete!');
console.log('📂 Ready to load:');
console.log('   • Chrome: Go to chrome://extensions -> Enable Developer Mode -> "Load unpacked" -> select "dist-extension"');
console.log('   • Firefox: Go to about:debugging#/runtime/this-firefox -> "Load Temporary Add-on" -> select "dist-extension/manifest.json" (or upload zentab-extension.zip to AMO)\n');
