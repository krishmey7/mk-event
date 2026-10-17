import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outDir = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
});
await page.goto('https://edulex.io', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(2500);

await page.screenshot({ path: path.join(outDir, '00-full-page.png'), fullPage: true });

async function shotNearHeading(headingText, filename, opts = {}) {
  const { padTop = 80, padBottom = 120, clickText } = opts;
  if (clickText) {
    const clickables = page.getByText(clickText, { exact: true });
    const count = await clickables.count();
    for (let i = 0; i < count; i++) {
      const el = clickables.nth(i);
      if (await el.isVisible()) {
        await el.click().catch(() => {});
        await page.waitForTimeout(700);
        break;
      }
    }
  }
  const heading = page.getByRole('heading', { name: headingText }).first();
  await heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const box = await heading.boundingBox();
  if (!box) {
    console.log('NO_BOX', headingText);
    return;
  }
  const sectionBox = await heading.evaluate((el) => {
    let node = el;
    for (let i = 0; i < 8; i++) {
      node = node.parentElement;
      if (!node) break;
      const tag = node.tagName.toLowerCase();
      const h = node.getBoundingClientRect().height;
      if ((tag === 'section' || node.getAttribute('id') || h > 500) && h < 3500) {
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
      }
    }
    const r = el.closest('section')?.getBoundingClientRect()
      || el.parentElement?.parentElement?.getBoundingClientRect();
    if (!r) return null;
    return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
  });

  const clip = sectionBox
    ? {
        x: Math.max(0, sectionBox.x),
        y: Math.max(0, sectionBox.y - padTop),
        width: Math.min(1440, sectionBox.width + 20),
        height: Math.min(2200, sectionBox.height + padTop + padBottom),
      }
    : {
        x: 0,
        y: Math.max(0, box.y + (await page.evaluate(() => window.scrollY)) - padTop),
        width: 1440,
        height: 1100,
      };

  await page.screenshot({
    path: path.join(outDir, filename),
    clip: {
      x: clip.x,
      y: clip.y,
      width: Math.min(clip.width, 1440),
      height: Math.min(clip.height, 2400),
    },
  });
  console.log('SAVED', filename, JSON.stringify(clip));
}

await shotNearHeading('Gamification et engagement cognitif', '01-avantages-comparison.png', { padTop: 100, padBottom: 80 });
await shotNearHeading('Apprentissage basé sur les neurosciences', '02-approche-neurosciences.png', { padTop: 100, padBottom: 80 });
await shotNearHeading('Éducation et intelligence artificielle', '03-comment-ca-marche.png', { padTop: 100, padBottom: 80 });
await shotNearHeading("Une plateforme IA d'apprentissage", '04-plateforme.png', { padTop: 100, padBottom: 80 });
await shotNearHeading("À qui s'adresse Edulex ?", '05-pour-qui-tabs.png', { padTop: 100, padBottom: 80 });

await shotNearHeading('Gamification et engagement cognitif', '01b-avantages-avec.png', {
  padTop: 100, padBottom: 80, clickText: 'Avec Edulex',
});
await shotNearHeading('Gamification et engagement cognitif', '01c-avantages-sans.png', {
  padTop: 100, padBottom: 80, clickText: 'Sans Edulex',
});

for (const tab of ['Étudiants', 'Enseignants', 'Entreprises']) {
  await shotNearHeading("À qui s'adresse Edulex ?", `05-${tab.toLowerCase()}.png`, {
    padTop: 100, padBottom: 80, clickText: tab,
  });
}

// Approach tabs Comprendre / Personnaliser / Progresser
for (const tab of ['Comprendre', 'Personnaliser', 'Progresser']) {
  await shotNearHeading('Apprentissage basé sur les neurosciences', `02-${tab.toLowerCase()}.png`, {
    padTop: 100, padBottom: 80, clickText: tab,
  });
}

const structure = await page.evaluate(() => {
  function analyzeByText(needle) {
    const walker = [...document.querySelectorAll('h2,h3')];
    const hit = walker.find(el => (el.textContent || '').includes(needle));
    if (!hit) return { missing: needle };
    let section = hit.closest('section') || hit.parentElement;
    for (let i = 0; i < 6 && section; i++) {
      if (section.tagName === 'SECTION' || section.getBoundingClientRect().height > 700) break;
      section = section.parentElement;
    }
    const rect = section.getBoundingClientRect();
    const cs = getComputedStyle(section);
    const deep = [...section.querySelectorAll('*')].slice(0, 400).map(el => {
      const r = el.getBoundingClientRect();
      if (r.height < 20 || r.width < 20) return null;
      const s = getComputedStyle(el);
      const sticky = s.position === 'sticky' || s.position === 'fixed';
      const interesting = sticky || s.display.includes('grid') || s.display.includes('flex') || el.tagName.match(/^H[1-4]$/);
      if (!interesting) return null;
      return {
        tag: el.tagName,
        text: (el.innerText || '').slice(0, 90).replace(/\s+/g, ' '),
        display: s.display,
        position: s.position,
        top: s.top,
        grid: s.gridTemplateColumns,
        flexDir: s.flexDirection,
        gap: s.gap,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    }).filter(Boolean).slice(0, 60);
    return {
      needle,
      sectionTag: section.tagName,
      display: cs.display,
      position: cs.position,
      w: Math.round(rect.width),
      h: Math.round(rect.height),
      deep,
      textSample: (section.innerText || '').slice(0, 800),
    };
  }
  return {
    avantages: analyzeByText('Gamification'),
    approche: analyzeByText('neurosciences'),
    comment: analyzeByText('intelligence artificielle'),
    plateforme: analyzeByText('plateforme IA'),
    pourQui: analyzeByText("s'adresse"),
  };
});
fs.writeFileSync(path.join(outDir, 'structure.json'), JSON.stringify(structure, null, 2));
console.log('STRUCTURE_WRITTEN');
await browser.close();
