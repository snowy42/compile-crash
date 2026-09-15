import { Game, RULES, FAMILIES } from '../core/types.js';
import { BY_ID, maxRank } from '../content/catalog.js';
import { RIGS, PROJECTS, TROJANS, CONTRACTS, CHALLENGES } from '../content/world.js';
import { hash } from '../core/rng.js';
const MAX_BYTES=5*1024*1024;
type ObjectValue=Record<string,unknown>;
function object(x:unknown,where:string):ObjectValue{if(!x||typeof x!=='object'||Array.isArray(x))throw new Error(`${where} must be an object.`);return x as ObjectValue;}
function number(x:unknown,where:string,min=0,max=1e15,integer=false):number{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max||(integer&&!Number.isInteger(x)))throw new Error(`${where} is out of range.`);return x;}
function text(x:unknown,where:string,max=256):string{if(typeof x!=='string'||x.length>max)throw new Error(`${where} is invalid.`);return x;}
function array(x:unknown,where:string,max=500):unknown[]{if(!Array.isArray(x)||x.length>max)throw new Error(`${where} is too large or invalid.`);return x;}
function oneOf(x:unknown,values:readonly unknown[],where:string){if(!values.includes(x))throw new Error(`Unknown ${where}.`);}
function keys(o:ObjectValue,allowed:string[],where:string){for(const k of Object.keys(o))if(!allowed.includes(k))throw new Error(`${where}: unexpected field ${k}.`);}
function safeTree(x:unknown,depth=0):void{
 if(depth>30)throw new Error('Backup nesting limit exceeded.');
 if(typeof x==='number'&&!Number.isFinite(x))throw new Error('Nonfinite backup value.');
 if(x&&typeof x==='object')for(const [k,v] of Object.entries(x)){if(['__proto__','constructor','prototype'].includes(k))throw new Error('Unsafe property in backup.');safeTree(v,depth+1);}
}
function items(x:unknown,kind:'rack'|'patches'){
 const list=array(x,kind,kind==='rack'?6:8);const ids=new Set<string>(),uids=new Set<number>();
 for(const entry of list){const i=object(entry,'item');keys(i,['id','rank','uid','mem'],'item');const id=text(i.id,'item ID',8);const d=BY_ID[id];
  if(!d||(kind==='patches')!==(d.kind==='patch'))throw new Error(`Unknown or misplaced item ${id}.`);
  number(i.rank,'rank',1,maxRank(d),true);const uid=number(i.uid,'instance',1,1e6,true);
  if(ids.has(id)||uids.has(uid))throw new Error('Duplicate inventory item.');ids.add(id);uids.add(uid);
  const mem=object(i.mem,'item memory');if(Object.keys(mem).length>24)throw new Error('Excessive item memory.');
  for(const [k,v] of Object.entries(mem)){text(k,'memory key',30);if(typeof v==='number')number(v,'memory',0,1e15);else text(v,'memory value',30);}
 }
}
function trace(x:unknown):void{if(x===null)return;const t=object(x,'trace');number(t.root,'root',1,1e7,true);oneOf(t.source,['player','worker'],'trace source');
 text(t.producer,'producer',20);for(const k of ['fill','base','initial','work','guard','deposited','wasted','children','tick'])number(t[k],`trace ${k}`);
 oneOf(t.critical,[true,false],'critical flag');const steps=array(t.steps,'trace steps',6);
 for(const a of steps){const step=object(a,'trace step');if(!BY_ID[text(step.id,'step ID',8)])throw new Error('Unknown trace module.');for(const k of ['slot','input','output','guardIn','guardOut','packets','copies'])number(step[k],`step ${k}`);for(const n of array(step.notes,'notes',16))text(n,'note',300);}
}
function damage(x:unknown){if(x===null)return;const d=object(x,'damage');text(d.cause,'damage cause',100);for(const raw of array(d.raw,'damage hits',10))number(raw,'raw damage',0,1e6);for(const k of ['drain','damage','absorbed','lost','tick'])number(d[k],`damage ${k}`);}
function summary(x:unknown){const s=object(x,'run summary');text(s.id,'run id',100);text(s.seed,'seed',64);oneOf(s.rig,RIGS.map(r=>r.id),'rig');oneOf(s.outcome,['victory','crash','abandoned','tutorial','benchmark'],'outcome');for(const k of ['encounter','ticks','level','work','peak','fragments','assist','tier'])number(s[k],`summary ${k}`);items(s.rack,'rack');items(s.patches,'patches');trace(s.best);damage(s.damage);}
export function validateGame(value:unknown):asserts value is Game{
 safeTree(value);const g=object(value,'save');keys(g,['schema','rules','profile','run'],'save');if(g.schema!==1||g.rules!==RULES)throw new Error('Unsupported save/rules version. Keep the original backup.');
 const p=object(g.profile,'profile');keys(p,['fragments','upgrades','rigs','seen','taken','evolved','wonWith','challenges','blocked','runs','wins','tierUnlocked','tutorialDone','settings','history'],'profile');
 for(const k of ['fragments','blocked','runs','wins'])number(p[k],k,0,1e9,true);number(p.tierUnlocked,'tier',0,5,true);oneOf(p.tutorialDone,[true,false],'tutorial flag');
 const ranks=array(p.upgrades,'permanent upgrades',4);if(ranks.length!==4)throw new Error('Four permanent tracks required.');for(const n of ranks)number(n,'permanent rank',0,3,true);
 const rigs=array(p.rigs,'rigs',4);if(!rigs.includes('RIG01')||new Set(rigs).size!==rigs.length)throw new Error('Invalid rig unlocks.');for(const id of rigs)oneOf(id,RIGS.map(r=>r.id),'rig');
 for(const k of ['seen','taken','evolved','wonWith']){const ids=array(p[k],k,96);if(new Set(ids).size!==ids.length)throw new Error('Duplicate collection entries.');for(const id of ids)if(!BY_ID[text(id,'collection id',8)])throw new Error('Unknown collection item.');}
 for(const id of array(p.challenges,'challenges',12))oneOf(id,CHALLENGES.map(c=>c[0]),'challenge');
 for(const s of array(p.history,'history',20))summary(s);
 const s=object(p.settings,'settings');keys(s,['input','language','theme','motion','contrast','scale','gate','effects','interface','ambient','compileKey','pauseKey','codeKey'],'settings');
 oneOf(s.input,['hold','toggle','step'],'input');oneOf(s.language,['js','vba'],'language');oneOf(s.theme,['default','paper','night','amber','blueprint','spectrum'],'theme');
 oneOf(s.motion,[true,false],'motion');oneOf(s.contrast,[true,false],'contrast');oneOf(s.scale,[1,1.15,1.3,1.5],'UI scale');oneOf(s.gate,[200,400,800],'input gate');
 for(const k of ['effects','interface'])number(s[k],'volume',0,.5);number(s.ambient,'ambient volume',0,.2);
 for(const k of ['compileKey','pauseKey','codeKey'])if(!text(s[k],k,20).length)throw new Error('Empty control binding.');
 if(g.run===null)return;
 const r=object(g.run,'run');text(r.id,'run id',100);if(!text(r.seed,'seed',64).length)throw new Error('Empty seed.');
 oneOf(r.mode,['standard','seeded','tutorial','practice'],'run mode');oneOf(r.phase,['prep','playing','draft','result'],'phase');oneOf(r.outcome,[null,'victory','crash','abandoned','tutorial','benchmark'],'outcome');
 if((r.phase==='result')!==(r.outcome!==null))throw new Error('Inconsistent run outcome.');
 oneOf(r.rig,rigs,'starting rig');number(r.tier,'run tier',0,5,true);oneOf(r.assist,[0,.25,.5,.75],'Assist');oneOf(r.maxAssist,[0,.25,.5,.75],'max Assist');if(Number(r.maxAssist)<Number(r.assist))throw new Error('Inconsistent Assist history.');
 const lib=array(r.library,'library',8);for(const f of lib)oneOf(f,FAMILIES,'family');if(new Set(lib).size!==lib.length||(r.mode!=='practice'&&lib.length!==4))throw new Error('Invalid library.');
 const meta=array(r.permanent,'permanent snapshot',4);if(meta.length!==4)throw new Error('Invalid permanent snapshot.');for(const n of meta)number(n,'snapshot rank',0,3,true);
 items(r.rack,'rack');items(r.patches,'patches');
 const all=[...r.rack as ObjectValue[],...r.patches as ObjectValue[]];if(new Set(all.map(i=>i.uid)).size!==all.length)throw new Error('Duplicate instance IDs.');
 if(r.mode!=='practice')for(const i of all)if(!BY_ID[String(i.id)].families.every(f=>lib.includes(f)))throw new Error('Item outside run library.');
 for(const k of ['uid','root','command','credits','encounterIndex','xp','offerSerial'])number(r[k],k,0,k==='encounterIndex'?11:1e9,true);
 for(const k of ['hp','guard','raw','pendingRaw','fallbackHp','fallbackGuard'])number(r[k],k,0,1e12);
 oneOf(r.compileWindow,[true,false],'compile window');oneOf(r.repairUsed,[true,false],'repair used');oneOf(r.threshold,[.25,.5,1],'batch threshold');
 const rng=object(r.rng,'RNG');keys(rng,['world','draft','crit'],'RNG');for(const k of ['world','draft','crit'])number(rng[k],k,0,4294967295,true);
 for(const name of array(r.projects,'projects',9))oneOf(name,PROJECTS.flat(),'project');if((r.projects as unknown[]).length!==9)throw new Error('Nine project names required.');
 const bosses=array(r.bosses,'Trojans',3);if(bosses.length!==3)throw new Error('Three Trojan IDs required.');bosses.forEach((id,i)=>{oneOf(id,Object.keys(TROJANS),'Trojan');if(TROJANS[String(id)].act!==i+1)throw new Error('Trojan in wrong act.');});
 for(const id of array(r.contracts,'contracts',3))oneOf(id,Object.keys(CONTRACTS),'contract');oneOf(r.previousContract,['',...Object.keys(CONTRACTS)],'previous contract');
 for(const id of array(r.consumed,'consumed parents',4))if(!BY_ID[text(id,'consumed ID',8)])throw new Error('Unknown consumed item.');
 for(const k of ['trainedActs','freeRerollActs'])for(const n of array(r[k],k,3))number(n,k,1,3,true);
 const e=object(r.encounter,'encounter');text(e.id,'encounter ID',30);text(e.name,'encounter name',100);oneOf(e.kind,['project','trojan'],'encounter kind');oneOf(e.contract,Object.keys(CONTRACTS),'active contract');
 if(e.kind==='trojan'&&!TROJANS[String(e.id)])throw new Error('Unknown active Trojan.');
 for(const k of ['target','work','tick','nextAttack','interval','damage','deadline','pulses','bossPhase','forks','escrow','escrowWorker','xpAwarded'])number(e[k],`encounter ${k}`,0,1e15);
 if(Number(e.target)<=0||Number(e.bossPhase)>2||Number(e.forks)>3||Number(e.xpAwarded)>200)throw new Error('Invalid encounter bounds.');
 for(const k of ['overdue','escrowOpen','cleared'])oneOf(e[k],[true,false],k);
 for(const entry of array(e.legacy,'legacy pulses',1)){const l=object(entry,'legacy');number(l.due,'legacy due');number(l.damage,'legacy damage',0,1000);oneOf(l.fired,[true,false],'legacy fired');}
 for(const flag of array(r.pendingDrafts,'pending drafts',20))oneOf(flag,[true,false],'draft flag');
 if(r.offer!==null){const o=object(r.offer,'offer');number(o.serial,'offer serial',1,1e7,true);number(o.paid,'reroll count',0,4,true);oneOf(o.special,[true,false],'special draft');const ids=array(o.ids,'offer IDs',3);if(ids.length!==3||new Set(ids).size!==3)throw new Error('Offers need three distinct choices.');
  for(const id of ids)if(!BY_ID[String(id)]&&!['fallback-hp','fallback-guard','fallback-credit'].includes(String(id)))throw new Error('Unknown offered item.');for(const rejected of array(o.rejected,'rejected offers',5))text(rejected,'rejected offer',100);
 }
 if((r.phase==='draft')!==(r.offer!==null))throw new Error('Draft state is inconsistent.');
 for(const j of array(r.jobs,'worker jobs',50)){const job=object(j,'worker job');for(const k of ['due','owner','work','guard'])number(job[k],`job ${k}`);}
 for(const t of array(r.traces,'traces',20))trace(t);trace(r.bestTrace);damage(r.lastDamage);
 const stats=object(r.stats,'run stats');for(const k of ['ticks','roots','full','work','workerWork','actWork','actWorkerWork','peak','blocked','memoryUses','fragments','biggestChildren','firstRoot','damageTaken'])number(stats[k],`stats ${k}`);
 for(const id of array(r.ledger,'reward ledger',13))text(id,'reward ID',130);if(new Set(r.ledger as unknown[]).size!==(r.ledger as unknown[]).length)throw new Error('Duplicate reward ledger ID.');
 for(const line of array(r.log,'log',40)){const l=object(line,'log line');number(l.tick,'log tick');text(l.text,'log text',500);oneOf(l.type,['info','good','danger'],'log type');}
 for(const entry of array(r.offered,'draft history',150)){const o=object(entry,'draft history entry');number(o.encounter,'history encounter',0,11,true);for(const id of array(o.ids,'history offers',3))text(id,'history offer',30);text(o.selected,'history choice',30);for(const id of array(o.rack,'history rack',6))text(id,'history module',20);}
}
export function exportText(game:Game):string{
 validateGame(game);const payload=JSON.stringify(game);const backup={format:'compile-crash-save',schema:1,rules:RULES,checksum:hash(payload).toString(16),payload:game};
 return JSON.stringify(backup,null,2);
}
export function importText(textValue:string):Game{
 if(new TextEncoder().encode(textValue).byteLength>MAX_BYTES)throw new Error('Backup exceeds the 5 MB limit.');
 const envelope=object(JSON.parse(textValue),'backup');keys(envelope,['format','schema','rules','checksum','payload'],'backup');
 if(envelope.format!=='compile-crash-save'||envelope.schema!==1||envelope.rules!==RULES)throw new Error('This backup belongs to an unsupported game/save version.');
 if(envelope.checksum!==hash(JSON.stringify(envelope.payload)).toString(16))throw new Error('Backup checksum mismatch. The file may be damaged.');
 validateGame(envelope.payload);return structuredClone(envelope.payload);
}
