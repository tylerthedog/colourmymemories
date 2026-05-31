import fs from 'fs';

async function main() {
  const url = 'https://colourmymemories.lovable.app/';
  console.log('Fetching', url);
  const response = await fetch(url);
  const html = await response.text();
  fs.writeFileSync('src/fetched_index.html', html, 'utf-8');
  console.log('Successfully wrote index HTML to src/fetched_index.html');
}

main().catch(console.error);
