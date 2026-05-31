import fs from 'fs';

async function main() {
  const url = 'https://colourmymemories.lovable.app/assets/index-CoYQFPS1.js';
  console.log('Fetching JS bundle:', url);
  const response = await fetch(url);
  const code = await response.text();
  fs.writeFileSync('src/downloaded_bundle.js', code, 'utf-8');
  console.log('Successfully wrote JS bundle to src/downloaded_bundle.js. Size in characters:', code.length);
}

main().catch(console.error);
