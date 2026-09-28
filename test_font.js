const fs = require('fs');
const sharp = require('sharp');

const svg = `
<svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f7b512"/>
  <text x="50" y="150" font-family="Arial, Helvetica, sans-serif" font-size="140" font-weight="900" fill="#373435" letter-spacing="-0.04em">55</text>
  <text x="300" y="150" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="400" fill="#373435" letter-spacing="0.02em">1971. – 2026.</text>
</svg>
`;

sharp(Buffer.from(svg)).toFile('test_font_arial.png').then(() => console.log('Saved test_font_arial.png'));
