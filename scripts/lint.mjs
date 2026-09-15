import { readdir, readFile } from 'node:fs/promises';
async function files(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory())out.push(...await files(path));else if(/\.(ts|mjs|css|html)$/.test(path))out.push(path);}return out;}
const violations=[];
for(const path of [...await files('src'),...await files('public'),...await files('scripts')]){
 const content=await readFile(path,'utf8');
 if(content.includes('\r'))violations.push(`${path}: CRLF is not canonical`);
 if(/\beval\s*\(|new Function\s*\(/.test(content)&&path!=='scripts/lint.mjs')violations.push(`${path}: dynamic code execution forbidden`);
 if(path.startsWith('src/core/')&&/\b(document|window|localStorage|indexedDB|AudioContext|performance)\b/.test(content))violations.push(`${path}: core must not depend on browser APIs`);
 if(path.startsWith('src/core/')&&/Math\.random|Date\.now/.test(content))violations.push(`${path}: unseeded gameplay source`);
}
if(violations.length){console.error(violations.join('\n'));process.exitCode=1;}else console.log('Architecture/safety lint passed. TypeScript strict checks run separately.');
