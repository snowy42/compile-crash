import { freshGame, newRun, apply } from '../dist/app/core/game.js';
import { BY_ID } from '../dist/app/content/catalog.js';
export function fixture(ids=[],patches=[],seed='FIXTURE') {
 const g=freshGame();const r=newRun(g,{seed,id:seed});
 r.rack=ids.map((x,n)=>typeof x==='string'?{id:x,rank:1,uid:n+1,mem:{}}:{...x,uid:n+1,mem:{...x.mem}});
 r.patches=patches.map((x,n)=>typeof x==='string'?{id:x,rank:1,uid:n+20,mem:{}}:{...x,uid:n+20,mem:{...x.mem}});
 r.uid=100;r.mode='practice';r.library=[...new Set([...r.rack,...r.patches].flatMap(x=>BY_ID[x.id].families))];
 apply(g,{type:'CONNECT',contract:'standard'});return g;
}
export function tick(g,n=1){for(let i=0;i<n;i++)apply(g,{type:'TICK'});}
export function near(actual,expected,eps=1e-8){if(Math.abs(actual-expected)>eps)throw new Error(`Expected ${expected}, received ${actual}`);}
export function offer(g,ids,special=false){const r=g.run;r.phase='draft';r.offer={serial:++r.offerSerial,ids,paid:0,special,rejected:[]};}
export const item=(id,rank=1)=>({id,rank,uid:1,mem:{}});
