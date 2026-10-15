import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';

const template = await readFile(new URL('../scripts/github-pages-redirect.html', import.meta.url), 'utf8');
const script = template.match(/<script>([\s\S]*?)<\/script>/)[1];

for (const [path, expected] of [
  ['/meloria-shop/', '/'],
  ['/meloria-shop', '/'],
  ['/meloria-shop/index.html', '/'],
  ['/meloria-shop/checkout', '/checkout'],
  ['/meloria-shop/?search=подушка&view=all#catalog', '/?search=%D0%BF%D0%BE%D0%B4%D1%83%D1%88%D0%BA%D0%B0&view=all#catalog'],
  ['/meloria-shop/auth#/sign-up', '/auth#/sign-up'],
  ['/meloria-shop//example.invalid/checkout', '//example.invalid/checkout'],
]) {
  test(`legacy URL redirects safely: ${path}`, () => {
    const source = new URL(path, 'https://olhakhodakivska.github.io');
    let destination;
    const link = {};
    runInNewContext(script, {
      URL,
      window: { location: {
        pathname: source.pathname, search: source.search, hash: source.hash,
        replace: (value) => { destination = value; },
      } },
      document: { getElementById: (id) => { assert.equal(id, 'shop-link'); return link; } },
    });
    assert.equal(destination, `https://www.meloria.pp.ua${expected}`);
    assert.equal(new URL(destination).origin, 'https://www.meloria.pp.ua');
    assert.equal(link.href, destination);
  });
}

test('Pages build produces matching home and fallback redirect pages', async () => {
  const output = await mkdtemp(join(tmpdir(), 'meloria-redirect-'));
  try {
    const result = execFileSync(process.execPath, ['scripts/build-github-redirect.js', output], { encoding: 'utf8' });
    assert.match(result, /Built GitHub Pages redirect/);
    assert.deepEqual((await readdir(output)).sort(), ['404.html', 'index.html']);
    assert.equal(await readFile(join(output, 'index.html'), 'utf8'), template);
    assert.equal(await readFile(join(output, '404.html'), 'utf8'), template);
    assert.match(template, /<html lang="uk">/);
    assert.match(template, /<noscript>/);
  } finally {
    await rm(output, { recursive: true });
  }
});
