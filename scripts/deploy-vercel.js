/**
 * Prépare dist/ pour Vercel : les polices Expo sont sous assets/node_modules,
 * ignorées par les règles node_modules de Vercel — on les renomme en assets/nm.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const out = path.join(root, `deploy-web-${Date.now()}`);

function rimraf(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    /* Windows locks — dossier timestampé évite le conflit */
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function patchFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchFiles(full);
      continue;
    }
    if (!/\.(js|json|html|map)$/.test(entry.name) && entry.name !== 'sw.js') continue;
    let text = fs.readFileSync(full, 'utf8');
    if (!text.includes('assets/node_modules') && !text.includes('assets\\node_modules')) continue;
    text = text.replaceAll('assets/node_modules', 'assets/nm').replaceAll('assets\\node_modules', 'assets\\nm');
    fs.writeFileSync(full, text);
  }
}

if (!fs.existsSync(path.join(root, 'package.json'))) {
  console.error('package.json introuvable');
  process.exit(1);
}

console.log('build:web…');
execSync('npm run build:web', { cwd: root, stdio: 'inherit', env: process.env });

if (!fs.existsSync(dist)) {
  console.error('dist/ introuvable après build:web');
  process.exit(1);
}

rimraf(out);
/* Nettoyer les anciens staging Vercel (évite d’empiler deploy-web-*). */
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.startsWith('deploy-web-')) {
    rimraf(path.join(root, entry.name));
  }
}
copyDir(dist, out);

/* PWA — forcer plum / cream (l’ancien eucalyptus #2F6F69 restait dans meta/manifest). */
const THEME = '#2A1824';
const BG = '#F7F0E8';
for (const name of ['index.html', 'manifest.json']) {
  const p = path.join(out, name);
  if (!fs.existsSync(p)) continue;
  let text = fs.readFileSync(p, 'utf8');
  text = text
    .replaceAll('#2F6F69', THEME)
    .replaceAll('#EEF1F4', BG)
    .replace(/content="default"/g, 'content="black-translucent"');
  if (name === 'manifest.json') {
    text = text
      .replace(/"theme_color"\s*:\s*"[^"]+"/g, `"theme_color": "${THEME}"`)
      .replace(/"background_color"\s*:\s*"[^"]+"/g, `"background_color": "${BG}"`);
  }
  if (name === 'index.html' && !text.includes(`content="${THEME}"`)) {
    text = text.replace(
      /<meta name="theme-color" content="[^"]*"\s*\/?>/g,
      `<meta name="theme-color" content="${THEME}" />`,
    );
  }
  fs.writeFileSync(p, text);
}
const publicManifest = path.join(root, 'public', 'manifest.json');
if (fs.existsSync(publicManifest)) {
  fs.copyFileSync(publicManifest, path.join(out, 'manifest.json'));
}

const nm = path.join(out, 'assets', 'node_modules');
if (fs.existsSync(nm)) fs.renameSync(nm, path.join(out, 'assets', 'nm'));
patchFiles(out);
fs.writeFileSync(path.join(out, '.vercelignore'), '.env*\n.vercel\n.gitignore\n');
fs.writeFileSync(
  path.join(out, 'vercel.json'),
  JSON.stringify({
    rewrites: [{ source: '/((?!_expo/|assets/|.*\\..*).*)', destination: '/index.html' }],
  }),
);

console.log('deploy prêt —', out);
execSync('npx vercel link --project mk-event --yes --scope mk-events', {
  cwd: out,
  stdio: 'inherit',
  env: process.env,
});
execSync('npx vercel deploy --prod --yes --force --archive=tgz', {
  cwd: out,
  stdio: 'inherit',
  env: process.env,
});
