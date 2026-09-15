import { Run, Definition, own } from './types.js';
import { CATALOG, BY_ID, active, maxRank, families, tags } from '../content/catalog.js';
import { weighted } from './rng.js';
export function eligible(r:Run,d:Definition,special=false):boolean {
 if(d.kind==='breakthrough')return special&&d.parents!.every(id=>(own(r,id)?.rank??0)>=2)&&!own(r,d.id);
 return !r.consumed.includes(d.id)&&d.families.every(f=>r.library.includes(f))&&active(r,d)&&(own(r,d.id)?.rank??0)<maxRank(d);
}
function immediate(r:Run,d:Definition):boolean {
 if(!active(r,d))return false;
 if(['B01','B03','P09','P12','P15'].includes(d.id))return r.threshold>=.9;
 if(['B02','P10'].includes(d.id))return r.threshold<=.5;
 if(d.id==='B06')return false;
 return true;
}
export function makeOffer(r:Run,special:boolean,paid=0,rejected:string[]=[]):void {
 const pool=CATALOG.filter(d=>eligible(r,d,false));
 const recipes=CATALOG.filter(d=>d.kind==='breakthrough'&&eligible(r,d,true));
 let ids:string[]=[];
 const present=families(r);const t=tags(r);
 for(let attempt=0;attempt<20;attempt++){
  ids=[];
  for(let position=0;position<3;position++){
   if(special&&position===2&&recipes.length){ids.push(weighted(recipes,()=>1,r.rng,'draft').id);continue;}
   let candidates=pool.filter(d=>!ids.includes(d.id));
   if(r.rack.length<3&&position<2&&candidates.some(d=>d.kind==='module'))candidates=candidates.filter(d=>d.kind==='module');
   if(position===0&&candidates.some(d=>immediate(r,d)))candidates=candidates.filter(d=>immediate(r,d));
   if(!candidates.length){ids.push(['fallback-hp','fallback-guard','fallback-credit'][position]);continue;}
   ids.push(weighted(candidates,d=>{
    let w={C:60,U:30,R:10,X:1}[d.rarity];
    if(position===1){if(own(r,d.id))w*=1.8;if(d.families.some(f=>present.includes(f)))w*=1.4;
     if(t.has('workerProducer')&&d.families.includes('Workers'))w*=1.2;
     if(t.has('copier')&&['F01','E04','P26'].includes(d.id))w*=1.5;
    }
    if(position===2&&!d.families.some(f=>present.includes(f)))w*=1.5;
    if(special&&d.rarity!=='C')w*=2;
    return w;
   },r.rng,'draft').id);
  }
  if(!rejected.includes([...ids].sort().join(',')))break;
 }
 r.offer={serial:++r.offerSerial,ids,paid,special,rejected};
 r.phase='draft';
}
export const canEvolve=(r:Run)=>CATALOG.filter(d=>d.kind==='breakthrough'&&eligible(r,d,true));
export function nextRank(r:Run,id:string):number{return BY_ID[id]?.kind==='breakthrough'?1:(own(r,id)?.rank??0)+1;}
