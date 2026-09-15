import test from 'node:test';import assert from 'node:assert/strict';
import { CATALOG, describe, maxRank, BY_ID } from '../dist/app/content/catalog.js';
import { EFFECTS, runRoot } from '../dist/app/core/pipeline.js';
import { validateContent } from '../dist/app/core/game.js';
import { fixture,item } from './helpers.mjs';
test('catalogue counts, unique IDs, complete handlers, authored descriptions',()=>{
 assert.deepEqual(validateContent(),[]);assert.equal(CATALOG.filter(d=>d.kind==='module').length,48);assert.equal(CATALOG.filter(d=>d.kind==='patch').length,36);assert.equal(CATALOG.filter(d=>d.kind==='breakthrough').length,12);
 for(const d of CATALOG){if(d.kind!=='patch')assert.equal(typeof EFFECTS[d.id],'function',d.id);for(let rank=1;rank<=maxRank(d);rank++)assert.ok(!/\{\d+\}|undefined|NaN/.test(describe(d,rank)),d.id);}
});
for(const d of CATALOG)test(`${d.id} ${d.name}: every rank resolves finite bounded roots`,()=>{
 for(let rank=1;rank<=maxRank(d);rank++){
  const source=d.kind==='patch'?['F01','W01','E02']:d.id==='W01'?['W01','E02']:d.id==='E02'?['W01','E02']:['W01',item(d.id,rank),'E02'];
  const g=fixture(source,d.kind==='patch'?[item(d.id,rank)]:[]),r=g.run;r.hp=45;
  for(let i=0;i<12;i++){
   const t=runRoot(r,i%2?'worker':'player',30,i%3===0?1:.25,i%2?1:0,'fixture',i%3===0);
   assert.ok(Number.isFinite(t.work)&&t.work>0,`${d.id} rank ${rank}`);assert.ok(Number.isFinite(t.guard)&&r.hp>0);assert.ok(t.children<20);
  }
 }
});
test('all breakthrough family requirements equal their recipe parents',()=>{
 for(const d of CATALOG.filter(x=>x.kind==='breakthrough'))assert.deepEqual([...new Set(d.parents.flatMap(id=>BY_ID[id].families))].sort(),[...d.families].sort(),d.id);
});
