const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(
  process.env.USERPROFILE || '',
  '.cursor',
  'projects',
  'e-Mes-projets-et-resource-PS-MK-event',
  'assets',
);

const srcs = [
  {
    match: /pexels-olga-slazhneva/,
    out: path.join('assets', 'onboarding', 'hero-mariage.jpg'),
  },
  {
    match: /pexels-vidalbalielojrfotografia/,
    out: path.join('assets', 'onboarding', 'hero-anniversaire.jpg'),
  },
  {
    match: /wan-san-yip/,
    out: path.join('assets', 'onboarding', 'hero-conference.jpg'),
  },
];

async function main() {
  const files = fs.readdirSync(assetsDir);
  for (const spec of srcs) {
    const name = files.find((f) => spec.match.test(f));
    if (!name) throw new Error('Missing source for ' + spec.out);
    const input = path.join(assetsDir, name);
    await sharp(input)
      .rotate()
      .resize(1200, 900, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toFile(spec.out);
    const m = await sharp(spec.out).metadata();
    console.log(spec.out, m.width, m.height, fs.statSync(spec.out).size);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
