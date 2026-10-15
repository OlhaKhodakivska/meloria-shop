import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const outputDir = resolve(process.argv[2] || 'dist-github');
const html = await readFile(new URL('./github-pages-redirect.html', import.meta.url), 'utf8');
await mkdir(outputDir, { recursive: true });
for (const name of ['index.html', '404.html']) {
  await writeFile(join(outputDir, name), html);
}
console.log('Built GitHub Pages redirect (index.html and 404.html).');
