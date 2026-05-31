import fs from 'fs';

function main() {
  const code = fs.readFileSync('src/downloaded_bundle.js', 'utf-8');
  const start = 628000;
  const end = Math.min(code.length, 638000);
  const chunk = code.substring(start, end);
  fs.writeFileSync('src/policies_page_code.js', chunk, 'utf-8');
  console.log(`Wrote policies page code chunk (length ${chunk.length}) to src/policies_page_code.js`);
}

main();
