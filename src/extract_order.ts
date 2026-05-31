import fs from 'fs';

function main() {
  const code = fs.readFileSync('src/downloaded_bundle.js', 'utf-8');
  const start = 615000;
  const end = Math.min(code.length, 630000);
  const chunk = code.substring(start, end);
  fs.writeFileSync('src/order_page_code.js', chunk, 'utf-8');
  console.log(`Wrote order page code chunk (length ${chunk.length}) to src/order_page_code.js`);
}

main();
