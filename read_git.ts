import * as fs from 'fs';
import * as path from 'path';

const gitConfigPath = path.join(process.cwd(), '.git', 'config');
if (fs.existsSync(gitConfigPath)) {
  console.log('--- .git/config content ---');
  console.log(fs.readFileSync(gitConfigPath, 'utf-8'));
} else {
  console.log('.git/config does not exist');
}
