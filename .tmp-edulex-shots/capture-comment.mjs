import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outDir = path.resolve('.tmp-edulex-shots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto('https://edulex.io', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(3000);

// Find "Comment ça marche" section
const sectionInfo = await page.evaluate(() => {
  const headings = [...document.querySelectorAll('h1,h2,h3,p,span,div')];
  const eyebrow = headings.find((el) =>
    (el.textContent || '').trim().toLowerCase().includes('comment ça marche')
  );
  const title = [...document.querySelectorAll('h2')].find((el) =>
    (el.textContent || '').includes('intelligence artificielle')
  );

  let section = (title || eyebrow)?.closest('section');
  if (!section) {
    let node = title || eyebrow;
    for (let i = 0; i < 10 && node; i++) {
      node = node.parentElement;
      if (!node) break;
      const h = node.getBoundingClientRect().height;
      if (h > 600 && h < 4000) {
        section = node;
        break;
      }
    }
  }

  if (!section) return { error: 'section not found' };

  // Mark for screenshot
  section.setAttribute('data-capture-target', 'comment');

  const rect = section.getBoundingClientRect();
  const cs = getComputedStyle(section);

  function styleSnapshot(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      tag: el.tagName,
      className: (el.className || '').toString().slice(0, 120),
      text: (el.innerText || '').slice(0, 160).replace(/\s+/g, ' ').trim(),
      display: s.display,
      position: s.position,
      top: s.top,
      left: s.left,
      sticky: s.position === 'sticky' || s.position === 'fixed',
      grid: s.gridTemplateColumns,
      gridRows: s.gridTemplateRows,
      flexDir: s.flexDirection,
      justify: s.justifyContent,
      align: s.alignItems,
      gap: s.gap,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      fontFamily: s.fontFamily.slice(0, 80),
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      color: s.color,
      bg: s.backgroundColor,
      borderRadius: s.borderRadius,
      border: s.border,
      padding: s.padding,
      margin: s.margin,
      w: Math.round(r.width),
      h: Math.round(r.height),
      x: Math.round(r.x),
      y: Math.round(r.y + window.scrollY),
    };
  }

  const all = [...section.querySelectorAll('*')];
  const interesting = all
    .map((el) => {
      const r = el.getBoundingClientRect();
      if (r.height < 12 || r.width < 12) return null;
      const s = getComputedStyle(el);
      const sticky = s.position === 'sticky' || s.position === 'fixed';
      const isHeading = /^H[1-6]$/.test(el.tagName);
      const isGridFlex =
        s.display.includes('grid') || s.display.includes('flex');
      const text = (el.innerText || '').trim();
      const hasFormatChip = /^(PDF|DOC|MP4|TXT|URL|IMG)$/i.test(text);
      const hasStepTitle =
        /Importez|Analysez|Rejoignez|Apprenez/i.test(text) && text.length < 80;
      const interesting =
        sticky ||
        isHeading ||
        isGridFlex ||
        hasFormatChip ||
        hasStepTitle ||
        el.tagName === 'SVG' ||
        el.tagName === 'IMG' ||
        el.tagName === 'BUTTON' ||
        (el.tagName === 'P' && text.length > 20 && text.length < 200);
      if (!interesting) return null;
      return styleSnapshot(el);
    })
    .filter(Boolean)
    .slice(0, 120);

  // Collect step cards more carefully
  const stepCandidates = all.filter((el) => {
    const t = (el.innerText || '').trim();
    return (
      /^(Importez vos contenus|Analysez avec l'IA|Rejoignez la communauté|Apprenez activement)/.test(
        t
      ) || /Importez vos contenus|Analysez avec l'IA/.test(t)
    );
  });

  const formatChips = all
    .filter((el) => /^(PDF|DOC|MP4|TXT|URL|IMG)$/i.test((el.innerText || '').trim()))
    .map(styleSnapshot);

  const logos = all
    .filter((el) => {
      const t = (el.innerText || '').trim();
      return /^(Gemini|HuggingFace|Edulex)$/i.test(t);
    })
    .map(styleSnapshot);

  return {
    section: styleSnapshot(section),
    eyebrow: styleSnapshot(eyebrow),
    title: styleSnapshot(title),
    textSample: (section.innerText || '').slice(0, 1500),
    htmlSample: section.outerHTML.slice(0, 8000),
    interesting,
    formatChips,
    logos,
    stepCandidates: stepCandidates.slice(0, 20).map(styleSnapshot),
    children: [...section.children].map(styleSnapshot),
  };
});

fs.writeFileSync(
  path.join(outDir, 'comment-structure.json'),
  JSON.stringify(sectionInfo, null, 2)
);

// Screenshot full section
const target = page.locator('[data-capture-target="comment"]').first();
await target.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);

const box = await target.boundingBox();
if (box) {
  const scrollY = await page.evaluate(() => window.scrollY);
  const clip = {
    x: Math.max(0, box.x - 16),
    y: Math.max(0, box.y + scrollY - 24),
    width: Math.min(1440, box.width + 32),
    height: Math.min(2800, box.height + 48),
  };

  // Playwright clip uses viewport coords for element screenshots — use element screenshot instead
  await target.screenshot({
    path: path.join(outDir, 'comment-ca-marche.png'),
  });
  console.log('SAVED element screenshot', JSON.stringify(box));

  // Also a wider viewport clip with padding via full page crop
  await page.evaluate(() => {
    const el = document.querySelector('[data-capture-target="comment"]');
    if (el) el.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(400);

  const abs = await page.evaluate(() => {
    const el = document.querySelector('[data-capture-target="comment"]');
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(0, r.x - 20),
      y: Math.max(0, r.y + window.scrollY - 40),
      width: Math.min(window.innerWidth, r.width + 40),
      height: Math.min(3000, r.height + 80),
    };
  });

  await page.screenshot({
    path: path.join(outDir, 'comment-ca-marche-padded.png'),
    clip: abs,
    fullPage: true,
  });
  console.log('SAVED padded', JSON.stringify(abs));
} else {
  console.log('NO_BOX');
}

// Also capture mobile width for interaction notes
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(1000);
await page.evaluate(() => {
  const el = document.querySelector('[data-capture-target="comment"]');
  if (el) el.scrollIntoView({ block: 'start' });
});
await page.waitForTimeout(500);
const mobileTarget = page.locator('[data-capture-target="comment"]').first();
await mobileTarget.screenshot({
  path: path.join(outDir, 'comment-ca-marche-mobile.png'),
});
console.log('SAVED mobile');

await browser.close();
console.log('DONE');
