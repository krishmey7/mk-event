const sharp = require('sharp');
const path = require('path');

const PAPER = '#F7F0E8';
const heroes = ['hero-mariage', 'hero-anniversaire', 'hero-conference'];

async function wavePng(width, height) {
  const d = [
    `M0 ${height * 0.34}`,
    `C ${width * 0.2} ${height * 1.02}`,
    `${width * 0.36} ${height * 1.08}`,
    `${width * 0.5} ${height * 0.66}`,
    `C ${width * 0.64} ${height * 0.28}`,
    `${width * 0.8} ${height * 0.18}`,
    `${width} ${height * 0.48}`,
    `L ${width} ${height + 2}`,
    `L 0 ${height + 2}`,
    'Z',
  ].join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path d="${d}" fill="${PAPER}"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function main() {
  for (const name of heroes) {
    const file = path.join('assets', 'onboarding', `${name}.jpg`);
    const img = sharp(file);
    const meta = await img.metadata();
    const w = meta.width || 900;
    const h = meta.height || 682;
    const waveH = Math.round(h * 0.16);
    const wave = await wavePng(w, waveH);

    // Soft scrim already in UI — only bake opaque paper wave into pixels.
    await sharp(file)
      .composite([{ input: wave, gravity: 'south' }])
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toFile(file + '.tmp.jpg');

    const fs = require('fs');
    fs.renameSync(file + '.tmp.jpg', file);
    console.log('baked', name, w, h, 'waveH', waveH);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
