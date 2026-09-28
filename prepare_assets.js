const fs = require('fs');

const svg = fs.readFileSync('Black HR Hor.svg', 'utf8');
const polys = svg.match(/<polygon[^>]*\/>/g) || [];
const paths = svg.match(/<path[^>]*\/>/g) || [];

console.log('Polys:', polys.length, 'Paths:', paths.length);

const symbolGroup = '<g id="logo-symbol">\n' + polys.join('\n') + '\n' + paths[0] + '\n</g>';
const textGroup = '<g id="logo-text">\n' + paths.slice(1).join('\n') + '\n</g>';
const full = `<svg id="official-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 594.22 125">
${symbolGroup}
${textGroup}
</svg>`;

fs.writeFileSync('official_logo.svg', full, 'utf8');
console.log('Successfully written official_logo.svg, size:', fs.statSync('official_logo.svg').size);
