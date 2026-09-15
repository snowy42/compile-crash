import { Run, Stats, Item, own, clamp } from './types.js';
import { BY_ID, value as v, active, families } from '../content/catalog.js';
type Passive = (s:Stats,i:Item,r:Run)=>void;
/** Registry of passive operations. Stats are rebuilt, never incrementally accumulated on load. */
export const PASSIVES: Record<string,Passive> = {
 B04:(s,i)=>{s.capacity+=v(i);}, C04:(s,i)=>{s.production+=v(i)/100;},
 K01:(s,i)=>{s.crit+=v(i)/100;}, K05:(s,i,r)=>{s.critMult+=v(i)*Math.min(4,families(r).length);},
 G02:(s,i)=>{s.damageMult*=v(i,1);}, G06:(s,i)=>{s.flatDamage+=v(i);},
 R01:s=>{s.guardPenalty*=.75;}, R02:(s,i)=>{s.production+=v(i)/100;s.guardCap-=v(i,1);},
 P01:(s,i)=>{s.primaryFlat+=v(i);}, P02:(s,i)=>{s.maxHp+=v(i);}, P03:(s,i)=>{s.guardCap+=v(i);},
 P05:(s,i)=>{s.workBonus+=v(i)/100;}, P06:(s,i)=>{s.production+=v(i)/100;}, P07:(s,i)=>{s.playerFlat+=v(i);},
 P08:(s,i,r)=>{s.workBonus+=v(i,r.rack.length<=4?0:1)/100;}, P11:(s,i)=>{s.capacity+=v(i);},
 P14:(s,i)=>{s.workBonus+=v(i)/100;}, P17:(s,i)=>{s.workerFlat+=v(i);}, P19:(s,i)=>{s.periodMult*=v(i);},
 P20:(s,i)=>{s.workerGuard+=v(i);}, P21:(s,i)=>{s.crit+=v(i)/100;}, P22:(s,i)=>{s.critMult+=v(i);},
 P29:(s,i)=>{s.startingGuard+=v(i);}, P30:(s,i)=>{s.guardCap+=v(i);s.playerGuard+=v(i,1);},
 P31:(s,i)=>{s.flatDamage+=v(i);}, P34:(s,i)=>{s.maxHp-=v(i);s.workBonus+=v(i,1)/100;},
 P35:(s,i)=>{s.repairPrice-=v(i);}, P36:(s,i)=>{s.guardBonus+=v(i)/100;s.maxHp-=v(i,1);},
 X05:s=>{s.crit+=.2;}, X08:s=>{s.guardPenalty*=.75;}, X10:s=>{s.crit+=.1;},
 X12:s=>{s.production+=.5;s.guardCap-=15;}
};
export function derive(r:Run): Stats {
 const s:Stats = {capacity:24,maxHp:100+r.permanent[1]*5+r.fallbackHp,guardCap:40+r.permanent[2]*3+r.fallbackGuard,
  startingGuard:r.rig==='RIG04'?4:8,production:1+r.permanent[0]*.05,crit:.05,critMult:1.75,
  flatDamage:0,damageMult:1,guardBonus:0,guardPenalty:1,workBonus:0,rigWork:1,
  primaryFlat:0,playerFlat:0,workerFlat:0,playerGuard:2,workerGuard:0,periodMult:1,repairPrice:12};
 if(r.rig==='RIG03'){s.maxHp+=15;s.rigWork=.9;}
 if(r.rig==='RIG04')s.capacity+=8;
 for(const i of [...r.rack,...r.patches])if(active(r,BY_ID[i.id]))PASSIVES[i.id]?.(s,i,r);
 if(r.rig==='RIG02')s.production*=.85;
 if(r.rig==='RIG04')s.production*=.9;
 const borrowed=own(r,'R06');if(borrowed&&active(r,BY_ID.R06))s.production*=.8;
 if(r.encounter.contract==='CT04')s.crit+=.1;
 if(r.encounter.contract==='CT05')s.guardCap-=10;
 if(r.tier>=4)s.startingGuard-=4;
 if(r.encounter.contract==='CT11')s.startingGuard=0;
 s.maxHp=Math.max(20,s.maxHp);s.capacity=Math.max(8,s.capacity);s.guardCap=Math.max(10,s.guardCap);
 s.startingGuard=clamp(s.startingGuard,0,s.guardCap);s.crit=clamp(s.crit,0,1);
 s.damageMult=Math.max(.25,s.damageMult);s.repairPrice=Math.max(4,s.repairPrice);
 return s;
}
export interface Producer { key:string; period:number; work:number; guard:number }
export function producers(i:Item,s:Stats):Producer[]{
 const p=(key:string,period:number,work:number,guard=0)=>({key,period:Math.max(8,Math.ceil(period*s.periodMult)),work,guard});
 if(i.id==='W01')return [p('due1',32,v(i),1)];
 if(i.id==='W04')return [p('due1',64,v(i))];
 if(i.id==='X04')return [p('due1',24,24,1),p('due2',64,70)];
 if(i.id==='X09')return [p('due1',24,20,1)];
 return [];
}
export function initializeItem(r:Run,i:Item):void {
 const s=derive(r);
 for(const p of producers(i,s))i.mem[p.key]=r.encounter.tick+p.period;
 if(i.id==='R04'&&!r.encounter.legacy.length)r.encounter.legacy.push({due:r.encounter.tick+24,damage:v(i,1),fired:false});
}
export function reconcile(r:Run,oldStats:Stats,oldPeriods:Map<number,Producer[]>):void{
 const s=derive(r);
 r.hp=clamp(r.hp+Math.max(0,s.maxHp-oldStats.maxHp),0,s.maxHp);
 r.guard=clamp(r.guard+Math.max(0,s.startingGuard-oldStats.startingGuard),0,s.guardCap);
 for(const i of r.rack){
  const previous=oldPeriods.get(i.uid);
  if(!previous){initializeItem(r,i);continue;}
  for(const p of producers(i,s)){
   const was=previous.find(x=>x.key===p.key);
   const due=Number(i.mem[p.key]??r.encounter.tick+p.period);
   i.mem[p.key]=was?r.encounter.tick+Math.max(1,Math.ceil((due-r.encounter.tick)/was.period*p.period)):r.encounter.tick+p.period;
  }
 }
 r.jobs=r.jobs.filter(j=>r.rack.some(i=>i.uid===j.owner));
}
export const periodSnapshot=(r:Run)=>new Map(r.rack.map(i=>[i.uid,producers(i,derive(r))]));
