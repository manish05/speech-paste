import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const svgPath = path.join(root, 'assets', 'icon.svg');
const outDir = path.join(root, 'assets', 'icons');

const sizes = [16, 18, 24, 32, 48, 64, 128, 256, 512];

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.error('Missing assets/icon.svg');
    process.exit(1);
  }
  await ensureDir(outDir);
  const svg = await fs.promises.readFile(svgPath);

  // Generate standard PNGs
  await Promise.all(
    sizes.map(async (size) => {
      const out = path.join(outDir, `icon-${size}.png`);
      await sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toFile(out);
    })
  );

  // Generate monochrome template for macOS tray (light/dark friendly)
  const traySizes = [
    { name: '18', size: 18 },
    { name: '18@2x', size: 36 },
    { name: '18@3x', size: 54 }
  ];

  for (const { name, size } of traySizes) {
    const trayOut = path.join(outDir, `tray-${name}.png`);
    const whitePng = await sharp(svg)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    
    // Convert to pure white with alpha preserved
    await sharp(whitePng)
      .threshold(1)
      .negate({ alpha: false })
      .tint('#ffffff')
      .toFile(trayOut);
  }

  console.log('Icon generation complete:', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


