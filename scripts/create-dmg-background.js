import sharp from 'sharp';

// Create a simple DMG background image
const width = 540;
const height = 380;

// Create a gradient background
const background = sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
});

// Add a subtle gradient overlay
const gradient = sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  }
});

// Create a radial gradient
const svg = `
<svg width="${width}" height="${height}">
  <defs>
    <radialGradient id="grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
</svg>
`;

// Combine background with gradient
background
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .png()
  .toFile('assets/dmg-background.png')
  .then(() => {
    console.log('DMG background created successfully');
  })
  .catch(err => {
    console.error('Error creating DMG background:', err);
  });
