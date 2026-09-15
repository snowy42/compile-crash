import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../src/core.js',import.meta.url),'utf8');
const sandbox={globalThis:{},module:{exports:{}},exports:{}}; sandbox.globalThis=sandbox; vm.createContext(sandbox); vm.runInContext(source,sandbox); const C=sandbox.module.exports;

test('fresh run begins simple',()=>{const r=C.newRun(C.baseProfile(),'A');assert.equal(r.compileUnlocked,false);assert.equal(r.securityUnlocked,false);assert.equal(r.modules.length,0);assert.equal(C.project(r).name,'HELLO WORLD');});
test('typing progresses first project',()=>{const r=C.newRun(C.baseProfile(),'B');C.beginProject(r);for(let i=0;i<20;i++)C.keypress(r,1000+i*100);assert.ok(r.work>0);assert.equal(r.project,0);});
test('first project produces a three-card draft',()=>{const r=C.newRun(C.baseProfile(),'C');C.beginProject(r);for(let i=0;i<200&&!r.draft;i++)C.keypress(r,1000+i*100);assert.equal(r.project,1);assert.equal(r.draft.length,3);assert.ok(r.draft.every(x=>['stat'].includes(x.type)));});
test('compile is introduced on project four',()=>{const r=C.newRun(C.baseProfile(),'D');r.project=3;const ev=C.beginProject(r);assert.equal(r.compileUnlocked,true);assert.ok(ev.some(x=>x.type==='teach'&&x.key==='compile'));});
test('first module is introduced only after compile',()=>{const r=C.newRun(C.baseProfile(),'E');r.project=4;const ev=C.beginProject(r);assert.equal(r.moduleSlots,1);assert.equal(r.modules[0].id,'optimizer');assert.ok(ev.some(x=>x.key==='module'));});
test('security arrives late',()=>{const r=C.newRun(C.baseProfile(),'F');r.project=6;const ev=C.beginProject(r);assert.equal(r.securityUnlocked,true);assert.ok(ev.some(x=>x.type==='intrusion'));});
test('first trojan appears on project eight',()=>{const r=C.newRun(C.baseProfile(),'G');r.project=7;C.beginProject(r);assert.equal(r.threat.name,'SCRIPT KIDDIE');});
test('crash awards persistent fragments and unlocks workshop',()=>{const p=C.baseProfile();const r=C.newRun(p,'H');r.project=7;r.fragmentsEarned=5;r.status='crashed';C.applyRunResult(p,r);assert.equal(p.fragments,5);assert.equal(p.unlocks.workshop,true);});
test('meta progression is capped and costs currency',()=>{const p=C.baseProfile();p.fragments=30;assert.equal(C.buyMeta(p,'power'),true);assert.equal(p.meta.power,1);assert.equal(p.fragments,27);C.buyMeta(p,'power');C.buyMeta(p,'power');assert.equal(C.buyMeta(p,'power'),false);assert.equal(p.meta.power,3);});
