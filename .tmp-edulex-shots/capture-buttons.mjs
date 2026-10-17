import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outDir = path.resolve('.tmp-edulex-shots/buttons');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto('https://edulex.io', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(3000);

function styleDump(el) {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const anims = el.getAnimations?.({ subtree: true })?.map((a) => {
    const effect = a.effect;
    let keyframes = null;
    try {
      keyframes = effect?.getKeyframes?.() || null;
    } catch {}
    return {
      playState: a.playState,
      currentTime: a.currentTime,
      timelineTime: a.timeline?.currentTime ?? null,
      timing: effect?.getTiming?.() || null,
      keyframes,
      animationName: s.animationName,
    };
  }) || [];

  return {
    tag: el.tagName,
    id: el.id || null,
    className: typeof el.className === 'string' ? el.className : (el.className?.baseVal || ''),
    text: (el.innerText || el.textContent || '').trim().slice(0, 80).replace(/\s+/g, ' '),
    href: el.getAttribute?.('href') || null,
    role: el.getAttribute?.('role') || null,
    type: el.getAttribute?.('type') || null,
    rect: {
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
    },
    css: {
      display: s.display,
      position: s.position,
      transform: s.transform,
      transformOrigin: s.transformOrigin,
      transition: s.transition,
      transitionProperty: s.transitionProperty,
      transitionDuration: s.transitionDuration,
      transitionTimingFunction: s.transitionTimingFunction,
      transitionDelay: s.transitionDelay,
      animation: s.animation,
      animationName: s.animationName,
      animationDuration: s.animationDuration,
      animationTimingFunction: s.animationTimingFunction,
      animationDelay: s.animationDelay,
      animationIterationCount: s.animationIterationCount,
      animationFillMode: s.animationFillMode,
      background: s.background,
      backgroundColor: s.backgroundColor,
      backgroundImage: s.backgroundImage,
      color: s.color,
      border: s.border,
      borderRadius: s.borderRadius,
      boxShadow: s.boxShadow,
      filter: s.filter,
      opacity: s.opacity,
      scale: s.scale,
      translate: s.translate,
      rotate: s.rotate,
      willChange: s.willChange,
      cursor: s.cursor,
      padding: s.padding,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      fontFamily: s.fontFamily,
      letterSpacing: s.letterSpacing,
      textTransform: s.textTransform,
      lineHeight: s.lineHeight,
      overflow: s.overflow,
      outline: s.outline,
      outlineOffset: s.outlineOffset,
      backdropFilter: s.backdropFilter,
      mixBlendMode: s.mixBlendMode,
      isolation: s.isolation,
      clipPath: s.clipPath,
      maskImage: s.maskImage,
    },
    inlineStyle: el.getAttribute?.('style') || null,
    animations: anims,
  };
}

const catalog = await page.evaluate((dumpSrc) => {
  // eslint-disable-next-line no-new-func
  const dump = new Function('el', `return (${dumpSrc})(el);`);
  const texts = [
    'Commencer',
    'Rejoindre',
    'Commencer la transformation',
    'Essayer Premium',
    'Contactez-nous',
  ];
  const found = [];
  const all = [...document.querySelectorAll('a,button,[role="button"]')];
  for (const el of all) {
    const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
    const interesting =
      texts.some((x) => t === x || t.includes(x)) ||
      /btn|button|cta|primary/i.test(el.className?.toString?.() || '');
    if (!interesting) continue;
    if (el.getBoundingClientRect().width < 10) continue;
    found.push({
      ...dump(el),
      parentClass: el.parentElement?.className?.toString?.()?.slice(0, 120) || null,
      children: [...el.children].slice(0, 8).map((c) => ({
        tag: c.tagName,
        className: c.className?.toString?.()?.slice(0, 120) || '',
        text: (c.innerText || '').trim().slice(0, 40),
        style: dump(c).css,
      })),
    });
  }
  return found;
}, styleDump.toString());

fs.writeFileSync(path.join(outDir, 'catalog-default.json'), JSON.stringify(catalog, null, 2));
console.log('CATALOG', catalog.length, catalog.map((c) => c.text));

// Collect relevant CSS rules for buttons from stylesheets
const cssRules = await page.evaluate(() => {
  const needles = [/button/i, /btn/i, /cta/i, /primary/i, /hover/i, /active/i, /Commencer/i, /Rejoindre/i];
  const out = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    for (const rule of rules) {
      const text = rule.cssText || '';
      if (!needles.some((n) => n.test(text))) continue;
      if (text.length > 2500) continue;
      out.push(text);
    }
  }
  return out.slice(0, 200);
});
fs.writeFileSync(path.join(outDir, 'css-rules.json'), JSON.stringify(cssRules, null, 2));
console.log('CSS_RULES', cssRules.length);

async function findByExactText(text) {
  return page.evaluateHandle((needle) => {
    const all = [...document.querySelectorAll('a,button,[role="button"]')];
    return (
      all.find((el) => (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ') === needle) ||
      null
    );
  }, text);
}

async function dumpHandle(handle) {
  return handle.evaluate((el, dumpSrc) => {
    const dump = new Function('el', `return (${dumpSrc})(el);`);
    const childStyles = [...el.querySelectorAll('*')].slice(0, 20).map((c) => ({
      tag: c.tagName,
      className: c.className?.toString?.()?.slice(0, 160) || '',
      text: (c.innerText || '').trim().slice(0, 50),
      ...dump(c),
    }));
    // also pseudo
    const before = getComputedStyle(el, '::before');
    const after = getComputedStyle(el, '::after');
    return {
      ...dump(el),
      childrenDeep: childStyles,
      pseudo: {
        before: {
          content: before.content,
          transform: before.transform,
          background: before.background,
          backgroundColor: before.backgroundColor,
          backgroundImage: before.backgroundImage,
          opacity: before.opacity,
          width: before.width,
          height: before.height,
          left: before.left,
          top: before.top,
          position: before.position,
          transition: before.transition,
          borderRadius: before.borderRadius,
          boxShadow: before.boxShadow,
          inset: before.inset,
          zIndex: before.zIndex,
          display: before.display,
        },
        after: {
          content: after.content,
          transform: after.transform,
          background: after.background,
          backgroundColor: after.backgroundColor,
          backgroundImage: after.backgroundImage,
          opacity: after.opacity,
          width: after.width,
          height: after.height,
          left: after.left,
          top: after.top,
          position: after.position,
          transition: after.transition,
          borderRadius: after.borderRadius,
          boxShadow: after.boxShadow,
          inset: after.inset,
          zIndex: after.zIndex,
          display: after.display,
        },
      },
    };
  }, styleDump.toString());
}

async function captureButton(label, filenameBase, opts = {}) {
  const handle = await findByExactText(label);
  const el = await handle.asElement();
  if (!el) {
    console.log('MISSING', label);
    return null;
  }

  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // default
  const def = await dumpHandle(handle);
  const box = await el.boundingBox();
  if (box) {
    const pad = 40;
    await page.screenshot({
      path: path.join(outDir, `${filenameBase}-default.png`),
      clip: {
        x: Math.max(0, box.x - pad),
        y: Math.max(0, box.y - pad),
        width: box.width + pad * 2,
        height: box.height + pad * 2,
      },
    });
  }

  // hover
  await el.hover({ force: true });
  await page.waitForTimeout(opts.hoverWait ?? 700);
  const hover = await dumpHandle(handle);
  if (box) {
    const pad = 40;
    const box2 = await el.boundingBox();
    const b = box2 || box;
    await page.screenshot({
      path: path.join(outDir, `${filenameBase}-hover.png`),
      clip: {
        x: Math.max(0, b.x - pad),
        y: Math.max(0, b.y - pad),
        width: b.width + pad * 2,
        height: b.height + pad * 2,
      },
    });
  }

  // mid-hover sampling for transition timing via rAF
  const samples = await page.evaluate(async (needle) => {
    const all = [...document.querySelectorAll('a,button,[role="button"]')];
    const el = all.find((e) => (e.innerText || e.textContent || '').trim().replace(/\s+/g, ' ') === needle);
    if (!el) return null;

    // leave then re-enter to capture transition
    const leave = new MouseEvent('mouseleave', { bubbles: true });
    el.dispatchEvent(leave);
    await new Promise((r) => setTimeout(r, 500));

    const start = performance.now();
    const out = [];
    const enter = new MouseEvent('mouseenter', { bubbles: true });
    const over = new MouseEvent('mouseover', { bubbles: true });
    el.dispatchEvent(enter);
    el.dispatchEvent(over);

    // also force :hover via not possible; rely on real hover from Playwright separately
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.push({
        t: Math.round(performance.now() - start),
        transform: s.transform,
        backgroundColor: s.backgroundColor,
        color: s.color,
        boxShadow: s.boxShadow,
        borderRadius: s.borderRadius,
        opacity: s.opacity,
        filter: s.filter,
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
    return out;
  }, label);

  // active / click
  await el.hover({ force: true });
  await page.mouse.down();
  await page.waitForTimeout(250);
  const active = await dumpHandle(handle);
  if (box) {
    const box3 = await el.boundingBox();
    const b = box3 || box;
    const pad = 40;
    await page.screenshot({
      path: path.join(outDir, `${filenameBase}-active.png`),
      clip: {
        x: Math.max(0, b.x - pad),
        y: Math.max(0, b.y - pad),
        width: b.width + pad * 2,
        height: b.height + pad * 2,
      },
    });
  }
  await page.mouse.up();
  await page.waitForTimeout(300);

  // magnetic / mousemove sampling around center
  const magnetic = await page.evaluate(async (needle) => {
    const all = [...document.querySelectorAll('a,button,[role="button"]')];
    const el = all.find((e) => (e.innerText || e.textContent || '').trim().replace(/\s+/g, ' ') === needle);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cx = r.x + r.width / 2;
    const cy = r.y + r.height / 2;
    const points = [
      [cx, cy],
      [cx + r.width * 0.35, cy],
      [cx - r.width * 0.35, cy],
      [cx, cy + r.height * 0.35],
      [cx, cy - r.height * 0.35],
      [cx + r.width * 0.45, cy + r.height * 0.45],
    ];
    const samples = [];
    for (const [x, y] of points) {
      el.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: x,
          clientY: y,
          view: window,
        })
      );
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      const s = getComputedStyle(el);
      samples.push({
        mouse: { x: Math.round(x - cx), y: Math.round(y - cy) },
        transform: s.transform,
        translate: s.translate,
      });
    }
    return samples;
  }, label);

  // real mouse magnetic with Playwright moves
  const magReal = [];
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const offsets = [
      [0, 0],
      [box.width * 0.3, 0],
      [-box.width * 0.3, 0],
      [0, box.height * 0.3],
      [0, -box.height * 0.3],
    ];
    for (const [ox, oy] of offsets) {
      await page.mouse.move(cx + ox, cy + oy);
      await page.waitForTimeout(80);
      const t = await el.evaluate((node) => {
        const s = getComputedStyle(node);
        return { transform: s.transform, translate: s.translate, matrix: node.style.transform };
      });
      magReal.push({ ox: Math.round(ox), oy: Math.round(oy), ...t });
    }
  }

  const result = { label, default: def, hover, active, samples, magnetic, magReal };
  fs.writeFileSync(path.join(outDir, `${filenameBase}-states.json`), JSON.stringify(result, null, 2));
  console.log('DONE', label, 'transform hover', hover.css.transform, 'shadow', hover.css.boxShadow?.slice(0, 80));
  return result;
}

const targets = [
  ['Commencer', 'nav-commencer'],
  ['Rejoindre', 'hero-rejoindre'],
  ['Commencer la transformation', 'cta-transformation'],
  ['Essayer Premium', 'cta-premium'],
];

const results = {};
for (const [label, base] of targets) {
  results[base] = await captureButton(label, base);
  // move mouse away
  await page.mouse.move(10, 10);
  await page.waitForTimeout(400);
}

// Also capture nav area and hero CTA area wider shots
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
const commencer = await findByExactText('Commencer');
const commencerEl = await commencer.asElement();
if (commencerEl) {
  const box = await commencerEl.boundingBox();
  await page.screenshot({
    path: path.join(outDir, 'nav-area-default.png'),
    clip: { x: Math.max(0, box.x - 300), y: 0, width: Math.min(1440, box.width + 360), height: 90 },
  });
  await commencerEl.hover();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, 'nav-area-hover.png'),
    clip: { x: Math.max(0, box.x - 300), y: 0, width: Math.min(1440, box.width + 360), height: 90 },
  });
}

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
const rejoindre = await findByExactText('Rejoindre');
const rejoindreEl = await rejoindre.asElement();
if (rejoindreEl) {
  const box = await rejoindreEl.boundingBox();
  const clip = {
    x: Math.max(0, box.x - 80),
    y: Math.max(0, box.y - 60),
    width: box.width + 160,
    height: box.height + 120,
  };
  await page.mouse.move(10, 10);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'hero-area-default.png'), clip });
  await rejoindreEl.hover();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outDir, 'hero-area-hover.png'), clip });
}

// Inspect Framer / motion attributes and event listeners hints
const motionHints = await page.evaluate(() => {
  const all = [...document.querySelectorAll('a,button,[role="button"]')];
  return all
    .filter((el) => {
      const t = (el.innerText || '').trim().replace(/\s+/g, ' ');
      return ['Commencer', 'Rejoindre', 'Commencer la transformation', 'Essayer Premium'].includes(t);
    })
    .map((el) => {
      const attrs = {};
      for (const a of el.attributes) attrs[a.name] = a.value.slice(0, 200);
      const parentAttrs = {};
      if (el.parentElement) {
        for (const a of el.parentElement.attributes) parentAttrs[a.name] = a.value.slice(0, 200);
      }
      // look for data-framer / motion
      let node = el;
      const chain = [];
      for (let i = 0; i < 5 && node; i++) {
        chain.push({
          tag: node.tagName,
          className: node.className?.toString?.()?.slice(0, 120),
          data: [...node.attributes]
            .filter((a) => /framer|motion|hover|while|data-/i.test(a.name))
            .map((a) => [a.name, a.value.slice(0, 120)]),
        });
        node = node.parentElement;
      }
      return { text: (el.innerText || '').trim(), attrs, parentAttrs, chain };
    });
});
fs.writeFileSync(path.join(outDir, 'motion-hints.json'), JSON.stringify(motionHints, null, 2));

// Try to find stylesheet URLs and fetch key button-related CSS from next/chunk
const styleHrefs = await page.evaluate(() =>
  [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href)
);
fs.writeFileSync(path.join(outDir, 'style-hrefs.json'), JSON.stringify(styleHrefs, null, 2));

await browser.close();
console.log('ALL_DONE');
