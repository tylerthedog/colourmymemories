import fs from 'fs';

async function main() {
  const url = 'https://colourmymemories.lovable.app/assets/index-Bn_I2F5Y.css';
  console.log('Fetching CSS bundle:', url);
  const response = await fetch(url);
  const css = await response.text();
  fs.writeFileSync('src/downloaded_css.css', css, 'utf-8');
  console.log('Successfully wrote CSS bundle to src/downloaded_css.css. Size:', css.length);
}

main().catch(console.error);
