import { freshGame, newRun, apply, practiceGame } from '../dist/app/core/game.js';
import { BY_ID } from '../dist/app/content/catalog.js';
import { derive } from '../dist/app/core/stats.js';
import { validateGame } from '../dist/app/platform/validation.js';
import { pathToFileURL } from 'node:url';
/** Transparent smoke-test policy, not an optimal player or a claim about human win rates. */
export function assess(g,threshold=g.run.threshold) {
 const bench=practiceGame(g);const r=bench.run;r.threshold=threshold;
 apply(bench,{type:'CONNECT',contract:'standard'});
 const hp=derive(r).maxHp;r.hp=hp-25;r.guard=0;
 let generated=0,previous=0;
 for(let n=0;n<128;n++){
  const before=r.root;apply(bench,{type:'TICK'});
  if(r.root!==before){for(const t of r.traces.filter(t=>t.root>previous))generated+=t.guard;previous=r.root;}
 }
 const stats=derive(r),act=Math.floor(g.run.encounterIndex/4)+1;
 const damage=Math.max(0,[0,2.0,3.6,5.6][act]-stats.flatDamage/5)*stats.damageMult*(1-g.run.assist);
 const protection=generated/16+(r.hp-(hp-25))/16;
 const leak=Math.max(0,damage-protection);
 return {score:r.stats.work/16/(1+leak*.65),work:r.stats.work/16,guard:generated/16,leak,threshold};
}
export function bestThreshold(g){return [.25,.5,1].map(t=>assess(g,t)).sort((a,b)=>b.score-a.score)[0];}
export function bestChoice(g){
 const r=g.run,results=[];
 for(const id of r.offer.ids){
  const d=BY_ID[id],existing=[...r.rack,...r.patches].some(i=>i.id===id);
  const list=d?.kind==='patch'?r.patches:r.rack,full=list.length>=(d?.kind==='patch'?8:6);
  const replacements=existing||!full||d?.kind==='breakthrough'?[undefined]:list.map((_,n)=>n);
  for(const replace of replacements){
   const copy=structuredClone(g);
   if(!apply(copy,{type:'CHOOSE',serial:r.offer.serial,id,replace}))continue;
   const best=bestThreshold(copy);results.push({id,replace,...best});
  }
 }
 return results.sort((a,b)=>b.score-a.score)[0];
}
export function playSeed(seed,{policy='greedy',assist=0,rig='RIG01',tier=0,meta=false,limit=100000,validate=false}={}){
 const g=freshGame();g.profile.rigs=['RIG01','RIG02','RIG03','RIG04'];g.profile.tierUnlocked=tier;
 if(meta)g.profile.upgrades=[3,3,3,3];
 const r=newRun(g,{seed,id:seed,rig,assist,tier});let choices=0;
 for(let commands=0;commands<limit&&r.phase!=='result';commands++){
  if(r.phase==='prep'){
   if(r.hp<derive(r).maxHp-8)apply(g,{type:'REPAIR'});
   if(policy==='greedy'){
    const options=r.rack.map((i,index)=>({i,index})).filter(x=>x.i.rank<3&&BY_ID[x.i.id].kind!=='breakthrough');
    if(r.credits>=18&&!r.trainedActs.includes(Math.floor(r.encounterIndex/4)+1)&&options.length){
     const choices=options.map(({index})=>{const copy=structuredClone(g);apply(copy,{type:'TRAIN',index});return {index,score:bestThreshold(copy).score};}).sort((a,b)=>b.score-a.score);
     apply(g,{type:'TRAIN',index:choices[0].index});
    }
    apply(g,{type:'THRESHOLD',value:bestThreshold(g).threshold});
   }
   apply(g,{type:'CONNECT',contract:'standard'});
  }else if(r.phase==='draft'){
   const c=policy==='greedy'?bestChoice(g):{id:r.offer.ids[choices%3],replace:0};
   if(!c||!apply(g,{type:'CHOOSE',serial:r.offer.serial,id:c.id,replace:c.replace}))apply(g,{type:'SKIP',serial:r.offer.serial});
   if(policy==='greedy'&&c)apply(g,{type:'THRESHOLD',value:c.threshold});choices++;
  }else apply(g,{type:'TICK'});
  if(validate&&r.phase!=='playing')validateGame(g);
 }
 validateGame(g);
 return {game:g,summary:{seed,policy,rig,tier,assist,meta,outcome:r.outcome??'limit',encounter:r.encounterIndex+1,seconds:r.stats.ticks/8,peak:Math.round(r.stats.peak),fragments:r.stats.fragments,library:r.library,rack:r.rack.map(i=>`${i.id}:${i.rank}`)}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const count=Number(process.env.SEEDS??30),policy=process.env.POLICY??'greedy';const results=[];
 for(let i=0;i<count;i++){const {summary}=playSeed(`QA-${i}`,{policy,validate:true});results.push(summary);if(count<=30)console.log(JSON.stringify(summary));}
 const wins=results.filter(r=>r.outcome==='victory');const durations=results.map(r=>r.seconds).sort((a,b)=>a-b);
 console.log(JSON.stringify({count,policy,wins:wins.length,winFraction:wins.length/count,medianSeconds:durations[Math.floor(count/2)],limits:results.filter(x=>x.outcome==='limit').length,worstEncounter:Math.min(...results.map(x=>x.encounter))},null,2));
 if(results.some(r=>r.outcome==='limit'))process.exitCode=1;
}
