import * as fs from 'fs';
import * as path from 'path';

const srcDir = path.join(process.cwd(), 'public', 'assets');
const destDir = path.join(process.cwd(), 'public');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  console.log(`Found ${files.length} files in ${srcDir}`);

  files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    
    // Copy as original name in public/ root
    const destPathOrig = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPathOrig);
    console.log(`Copied: ${file} -> /${file}`);

    // Cleaned name logic (stripping hash like -TeRwl5LT or -DOQViDA6 or -DcBoA8lE)
    // Matches something like: filename-8CharsHash.png
    const hashRegex = /-([a-zA-Z0-9]{8})\.(png|jpg|jpeg|gif|svg|webp)$/;
    if (hashRegex.test(file)) {
      const cleanedFile = file.replace(hashRegex, '.$2');
      const destPathClean = path.join(destDir, cleanedFile);
      fs.copyFileSync(srcPath, destPathClean);
      console.log(`Cleaned Copy: ${file} -> /${cleanedFile}`);
    }
  });
} else {
  console.error(`Source directory does not exist: ${srcDir}`);
}
