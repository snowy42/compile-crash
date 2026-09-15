import test from 'node:test';import assert from 'node:assert/strict';
import { freshGame, newRun } from '../dist/app/core/game.js';
import { exportText, importText, validateGame } from '../dist/app/platform/validation.js';
import { hash } from '../dist/app/core/rng.js';
const backup=()=>{const g=freshGame();newRun(g,{seed:'BACKUP'});return g;};
test('backup roundtrip, no field or random stream loss',()=>{const g=backup();assert.deepEqual(importText(exportText(g)),g);});
test('tampering and truncation are reported, not applied',()=>{
 const b=JSON.parse(exportText(backup()));b.payload.profile.fragments=999;assert.throws(()=>importText(JSON.stringify(b)),/checksum/);assert.throws(()=>importText('{'));
});
test('oversized saves and excessive nesting rejected',()=>{
 assert.throws(()=>importText(' '.repeat(5*1024*1024+1)),/5 MB/);const g=backup();let o=g;for(let i=0;i<31;i++){o.bad={};o=o.bad;}assert.throws(()=>validateGame(g),/nesting/);
});
test('unsupported versions, nonfinite values, unknown IDs and duplicate items rejected',()=>{
 for(const mutate of [g=>g.rules='9.0',g=>g.profile.fragments=-1,g=>g.run.hp=Infinity,g=>g.run.rack[0].id='EVIL',g=>g.run.rack.push(structuredClone(g.run.rack[0])),g=>g.run.phase='draft',g=>g.run.rng.crit=2**40,g=>g.profile.upgrades=[1,2,3]]){
  const g=backup();mutate(g);assert.throws(()=>validateGame(g));
 }
});
test('unsafe object properties rejected even with recomputed checksum',()=>{
 const b=JSON.parse(exportText(backup()));b.payload.run.rack[0].mem=JSON.parse('{"__proto__":{"polluted":true}}');b.checksum=hash(JSON.stringify(b.payload)).toString(16);assert.throws(()=>importText(JSON.stringify(b)),/Unsafe/);assert.equal({}.polluted,undefined);
});
