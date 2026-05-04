const fs = require('fs');
const path = require('path');

const stylePath = path.resolve(__dirname, '..', 'src', 'style.css');
let text = fs.readFileSync(stylePath, 'utf-8');
text = text.replace(/(\d+(\.\d+)?)vw/g, '$1cqw');
text = text.replace('100cqw', '100%');
fs.writeFileSync(stylePath, text);
