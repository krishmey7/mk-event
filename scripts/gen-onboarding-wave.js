const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const w = 1200;
const h = 180;
const d = [
  `M0 ${h * 0.34}`,
  `C ${w * 0.2} ${h * 1.02}`,
  `${w * 0.36} ${h * 1.08}`,
  `${w * 0.5} ${h * 0.66}`,
  `C ${w * 0.64} ${h * 0.28}`,
  `${w * 0.8} ${h * 0.18}`,
  `${w} ${h * 0.48}`,
  `L ${w} ${h + 2}`,
  `L 0 ${h + 2}`,
  'Z',
].join(' ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path d="${d}" fill="#F7F0E8"/></svg>`;
const out = path.join('assets', 'onboarding', 'hero-wave.png');

sharp(Buffer.from(svg))
  .png()
  .toFile(out)
  .then(() => {
    console.log('wrote', out, fs.statSync(out).size);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
