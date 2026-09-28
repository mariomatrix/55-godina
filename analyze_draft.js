const sharp = require('sharp');

async function analyze() {
  const image = sharp('draft cestitke 1.png');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Background color at x: 100, y: 100
  const idx = (100 * width + 100) * channels;
  const bgR = data[idx], bgG = data[idx+1], bgB = data[idx+2];
  console.log('Background RGB:', bgR, bgG, bgB, 'Hex: #' + [bgR, bgG, bgB].map(x => x.toString(16).padStart(2,'0')).join(''));

  // Activity inside border (skip outer 20px)
  const margin = 25;
  const rowBlack = new Array(height).fill(0);
  const rowWatermark = new Array(height).fill(0);
  const colActivity = new Array(width).fill(0);

  for (let y = margin; y < height - margin; y++) {
    for (let x = margin; x < width - margin; x++) {
      const p = (y * width + x) * channels;
      const r = data[p], g = data[p+1], b = data[p+2];
      // Black / dark ink pixel
      if (r < 60 && g < 60 && b < 60) {
        rowBlack[y]++;
        colActivity[x]++;
      }
      // Watermark pixel (lighter yellow than background: r > 240, g > 200, b > 100)
      else if (r > 240 && g > 210 && b > 110 && Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB) > 30) {
        rowWatermark[y]++;
      }
    }
  }

  let minX = margin, maxX = width - margin;
  while (minX < width && colActivity[minX] < 5) minX++;
  while (maxX > margin && colActivity[maxX] < 5) maxX--;

  console.log(`Content margins: Left = ${minX}px (${(minX/width*100).toFixed(2)}%), Right = ${width - maxX}px (${((width - maxX)/width*100).toFixed(2)}%)`);
  console.log(`Text column width = ${maxX - minX}px (${((maxX - minX)/width*100).toFixed(2)}%)`);

  // Print vertical breakdown
  console.log('\n--- VERTICAL BREAKDOWN (Y coordinates & percentages) ---');
  let inBlack = false;
  let blockStart = 0;
  for (let y = margin; y < height - margin; y++) {
    if (rowBlack[y] > 10) {
      if (!inBlack) {
        inBlack = true;
        blockStart = y;
      }
    } else {
      if (inBlack) {
        inBlack = false;
        console.log(`Black Block: Y = ${blockStart} to ${y} (h: ${y - blockStart}px, ${(blockStart/height*100).toFixed(1)}% to ${(y/height*100).toFixed(1)}%)`);
      }
    }
  }

  console.log('\n--- WATERMARK BREAKDOWN ---');
  let inWm = false;
  let wmStart = 0;
  for (let y = margin; y < height - margin; y++) {
    if (rowWatermark[y] > 20) {
      if (!inWm) {
        inWm = true;
        wmStart = y;
      }
    } else {
      if (inWm) {
        inWm = false;
        console.log(`Watermark: Y = ${wmStart} to ${y} (h: ${y - wmStart}px, ${(wmStart/height*100).toFixed(1)}% to ${(y/height*100).toFixed(1)}%)`);
      }
    }
  }
}

analyze();
