import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
const dir = 'source-parts/payload';
const names = (await readdir(dir)).filter(name => name.endsWith('.part')).sort();
if (!names.length) throw new Error('Missing source payload');
const encoded = (await Promise.all(names.map(name => readFile(`${dir}/${name}`, 'utf8')))).join('');
const payload = JSON.parse(gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8'));
for (const [target, base64] of Object.entries(payload)) {
  if (target === 'tests/browser.py') continue; // maintained directly so browser CI can evolve independently
  await mkdir(target.slice(0, target.lastIndexOf('/')), { recursive: true });
  await writeFile(target, Buffer.from(base64, 'base64'));
}
