import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
const manifest = JSON.parse(await readFile('source-parts/manifest.json', 'utf8'));
for (const { target, dir } of manifest) {
  const names = (await readdir(dir)).filter(name => name.endsWith('.part')).sort();
  if (!names.length) throw new Error(`No source parts in ${dir}`);
  const chunks = await Promise.all(names.map(name => readFile(`${dir}/${name}`)));
  await mkdir(target.slice(0, target.lastIndexOf('/')), { recursive: true });
  await writeFile(target, Buffer.concat(chunks));
}
