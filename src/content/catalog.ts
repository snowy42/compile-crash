import { Definition, Family, Item, Run } from '../core/types.js';
const definitions: Definition[] = [];
function add(id: string, name: string, family: Family|null, rarity: Definition['rarity'], text: string, values: number[][] = [], tags: string[] = [], requires: string[] = []) {
  definitions.push({id,name,families:family?[family]:[],rarity,text,values,tags,requires,kind:id[0]==='P'?'patch':'module'});
}
add('F01','Line Expander','Flow','C','Add {0} Work to every packet.',[[4,7,10]]);
add('F02','Optimizer','Flow','C','Every packet: Work ×{0}.',[[1.18,1.27,1.36]]);
add('F03','Fast Path','Flow','U','Every packet: Work ×(1 + {0} for each occupied earlier slot).',[[.04,.06,.08]]);
add('F04','Standalone Utility','Flow','U','Add {0} Work per packet with 3 or fewer modules; otherwise add {1}.',[[8,12,16],[3,5,7]]);
add('F05','Tail Call','Flow','R','Add {0} Work per packet in the last occupied slot; otherwise add {1}.',[[8,14,20],[3,5,7]]);
add('F06','Polyglot Compiler','Flow','R','Each packet gains {0} Work per distinct module family, up to 4 families.',[[2,3,4]]);
add('B01','Full Build','Batch','C','Full player packets: Work ×{0}. Full means at least 90% buffer fill.',[[1.5,1.75,2]]);
add('B02','Quick Patch','Batch','C','Quick player packets: +{0} Work. The original also gains {1} Guard. Quick means at most 50% fill.',[[4,7,10],[1,2,3]]);
add('B03','Burst Window','Batch','U','Every third full player primary: Work ×{0}. Other batches do not advance the counter.',[[2,2.5,3]]);
add('B04','Compression Buffer','Batch','U','Buffer capacity +{0}. Full player packets also gain {1} Work.',[[8,12,16],[8,14,20]]);
add('B05','Incremental Build','Batch','R','Player primary: +{0} Work when its quick/medium/full bucket matches the previous player batch. First batch gains nothing.',[[6,10,14]]);
add('B06','Batch Scheduler','Batch','R','A quick player primary arms a bonus: the next full player primary gets Work ×{0}. Does not stack.',[[1.5,1.8,2.1]]);
add('C01','Memoize','Cache','C','Primary: add {0}× the previous primary’s incoming Work, then remember the current input. Copies do not read or update memory.',[[.25,.35,.45]]);
add('C02','Hot Cache','Cache','C','After 3 primaries warm the cache, subsequent primaries get Work ×{0}. Pausing preserves the cache.',[[1.3,1.45,1.6]]);
add('C03','Cache Line','Cache','U','Every fourth primary adds {0} Work.',[[24,40,56]]);
add('C04','Prefetch','Cache','U','Raw Code production +{0}%.',[[20,30,40]]);
add('C05','Write Through','Cache','R','Primary: add {0} Work if its incoming Work is at least the previous input; otherwise add {1}, including the first.',[[5,8,11],[2,3,4]]);
add('C06','Checkpoint','Cache','R','Primary: +{0} Work and {1}× the previous incoming Guard, capped at {2} added Guard. Store the current pre-bonus Guard.',[[3,5,7],[.5,.65,.8],[10,16,22]]);
add('W01','Background Thread','Workers','C','Every 4 advancing seconds, emit a worker with {0} base Work and 1 Guard through the whole rack.',[[12,20,28]],['workerProducer']);
add('W02','Thread Pool','Workers','C','Worker packets: Work ×{0}. Player packets instead gain {1} Work.',[[1.4,1.7,2],[2,3,4]]);
add('W03','Opportunistic Scheduler','Workers','U','Every third player primary schedules a next-tick worker worth {0}× its incoming Work. Then 1 second cooldown; no counting during cooldown.',[[.25,.35,.45]],['workerProducer']);
add('W04','Cron Job','Workers','U','Every 8 advancing seconds, emit a worker with {0} base Work and no Guard.',[[36,54,72]],['workerProducer']);
add('W05','Work Steal','Workers','R','A worker primary banks {0} Raw Code for the next tick, at most once per second. Requires a worker producer.',[[1,2,3]],[],['workerProducer']);
add('W06','Load Balancer','Workers','R','When a primary switches source class (player/worker), Work ×{0}. Otherwise add {1}, including the first.',[[1.2,1.35,1.5],[2,3,4]]);
add('K01','Eureka','Critical','C','Primary critical chance +{0} percentage points.',[[10,15,20]]);
add('K02','Elegant Solution','Critical','C','Critical packets: Work ×{0}. Other packets: +{1} Work.',[[1.5,1.8,2.1],[2,3,4]]);
add('K03','Static Analysis','Critical','U','Each primary: +{0} Work. After {1} consecutive noncritical primaries, guarantee the next critical. Any crit resets the streak.',[[3,5,7],[5,4,3]]);
add('K04','Unit Tests','Critical','U','Each primary: +1 Guard. Critical primaries gain another {0} Guard.',[[4,7,10]]);
add('K05','Coverage','Critical','R','Crit multiplier +{0} per distinct module family (up to 4). Each primary also gains {1} Work.',[[.15,.2,.25],[2,3,4]]);
add('K06','Mutation Test','Critical','R','A critical primary emits one downstream child worth {0}× its incoming Work, with zero Guard and its critical flag cleared.',[[.4,.55,.7]],['copier']);
add('E01','Copy / Paste','Echo','C','Every third primary emits a downstream child worth {0}× its Work, with zero Guard.',[[.5,.65,.8]],['copier']);
add('E02','Fork','Echo','C','Split each packet into two downstream packets, each with {0}× Work and half the incoming Guard. Only one keeps original status.',[[.65,.75,.85]],['copier']);
add('E03','Recursion','Echo','U','Child packets: Work ×{0}. Originals instead gain {1} Work. No infinite recursion.',[[1.5,1.8,2.1],[3,5,7]]);
add('E04','Broadcast','Echo','U','Add {0} Work to every packet. Put it after a copier to apply the bonus to more packets.',[[4,6,8]]);
add('E05','Checksum Echo','Echo','R','Original primary: +1 Guard. The first child reaching this slot per root gains {0} Guard; later children gain none.',[[4,7,10]]);
add('E06','Merge Queue','Echo','R','Each packet: add 2 + {0}× children already created for this root, counting at most 3 children.',[[2,3,4]]);
add('G01','Firewall','Guard','C','Each original primary gains {0} Guard. Copies do not repeat the grant.',[[3,5,7]]);
add('G02','Sandbox','Guard','C','All packets: Work ×{0}. Incoming hostile damage ×{1}, subject to the 75% mitigation cap.',[[1.12,1.2,1.28],[.9,.85,.8]]);
add('G03','Garbage Collector','Guard','U','Each fully blocked pulse banks {0} Work, up to 3 banks. The next player primary consumes them; with no banks, add 2 Work.',[[8,14,20]]);
add('G04','Restore Point','Guard','U','Every third player primary repairs {0} Integrity, up to {1} actually restored this encounter. Full-health attempts do not use the allowance.',[[3,4,5],[9,12,15]]);
add('G05','Zero Trust','Guard','R','With at least 20 Guard at root start: Work ×{0} for all packets. Otherwise add {1} Work.',[[1.4,1.6,1.8],[3,5,7]]);
add('G06','Rate Limiter','Guard','R','Flat hostile damage reduction +{0}. Each primary adds {1} Work. Explicit Guard drains are not reduced.',[[1,2,3],[2,3,4]]);
add('R01','Spaghetti Code','Risk','C','All packets: Work ×{0}. All generated Guard ×0.75, regardless of placement.',[[1.4,1.65,1.9]]);
add('R02','Overclock','Risk','C','Raw Code production +{0}%; Guard capacity −{1}, with minimum capacity 10.',[[30,45,60],[10,15,20]]);
add('R03','Friday Deploy','Risk','U','Full player primary, at 20+ Integrity: pay 2 Integrity for Work ×{0}. Below 20, both bonus and cost switch off.',[[1.8,2.2,2.6]]);
add('R04','Legacy Dependency','Risk','U','Every packet: +{0} Work. One extra {1}-damage hostile pulse 3 seconds after installation/encounter entry. Removing this tool does not cancel the pulse.',[[12,20,28],[4,6,8]]);
add('R05','Debug in Production','Risk','R','Below 50% root-start Integrity: all packets get Work ×{0}. Otherwise add {1} Work.',[[1.5,1.8,2.1],[3,5,7]]);
add('R06','Borrowed Cycles','Risk','R','Worker packets: Work ×{0}. Player Raw Code production ×0.80. Requires a worker producer.',[[1.8,2.2,2.6]],[],['workerProducer']);
add('P01','Clean Headers',null,'C','All primary base Work +{0}, before crit.',[[2,4]]);
add('P02','Reinforced Chassis',null,'C','Maximum Integrity +{0}. Gain the positive maximum increase as current Integrity.',[[10,18]]);
add('P03','Reserve Capacitor',null,'C','Guard capacity +{0}. Does not itself fill Guard.',[[10,18]]);
add('P04','Better Invoices',null,'U','Each ordinary project clear awards +{0} Credits. No extra boss or practice payout.',[[2,4]]);
add('P05','Inline Expansion','Flow','C','Final Work +{0}% for all packets.',[[8,14]]);
add('P06','Faster Parser','Flow','C','Raw Code production +{0}%.',[[8,14]]);
add('P07','Helpful Linter','Flow','C','Player primary base Work +{0}, before crit.',[[3,5]]);
add('P08','Small Packages','Flow','U','Final Work +{0}% with at most 4 modules; otherwise +{1}%.',[[14,24],[4,7]]);
add('P09','Release Checklist','Batch','C','Full player packets: final Work +{0}%.',[[12,20]]);
add('P10','Fast Deploy','Batch','C','Quick player packets: final Work +{0}%.',[[12,20]]);
add('P11','Wider Buffer','Batch','C','Buffer capacity +{0}.',[[4,8]]);
add('P12','Signed Build','Batch','U','Full player primaries gain +{0} base Guard.',[[2,4]]);
add('P13','Warm Start','Cache','C','Begin each encounter with {0} Raw Code, capped by capacity. Never compiles before deliberate input.',[[2,4]]);
add('P14','Cache Locality','Cache','C','With a Cache module installed: final Work +{0}%.',[[10,18]],[],['family:Cache']);
add('P15','Reusable Imports','Cache','U','Each full player root banks {0} Raw Code for the next tick. No immediate recompile.',[[1,2]]);
add('P16','Read-Ahead','Cache','U','First 3 player primaries each encounter: +{0} base Work. Later: +{1}.',[[5,9],[1,2]]);
add('P17','Worker Templates','Workers','C','Worker primary base Work +{0}, before crit.',[[4,7]],[],['workerProducer']);
add('P18','Parallel Libraries','Workers','C','Worker packets: final Work +{0}%.',[[12,20]],[],['workerProducer']);
add('P19','Shorter Queue','Workers','U','Periodic worker periods ×{0}, rounded up to ticks, minimum 1 second. Does not change the Opportunistic Scheduler.',[[.9,.85]],[],['workerProducer']);
add('P20','Worker Isolation','Workers','U','Worker primaries gain +{0} base Guard.',[[1,2]],[],['workerProducer']);
add('P21','Good Hunch','Critical','C','Primary crit chance +{0} percentage points.',[[5,9]]);
add('P22','Elegant Proof','Critical','C','Primary critical multiplier +{0}.',[[.25,.45]]);
add('P23','Verified Result','Critical','U','Critical primaries gain +{0} base Guard.',[[2,4]]);
add('P24','Consistent Style','Critical','U','Noncritical primaries gain +{0} Work after the crit decision, before the rack.',[[3,5]]);
add('P25','Duplicate Headers','Echo','C','Child packets: final Work +{0}%. Requires a copier.',[[10,18]],[],['copier']);
add('P26','Copy Buffer','Echo','C','Each new child gains {0} Work after its copy fraction, before the next slot.',[[2,3]],[],['copier']);
add('P27','Verified Copy','Echo','U','The first child created per root gains {0} Guard at creation.',[[2,4]],[],['copier']);
add('P28','Shared Origin','Echo','U','With a copier: all packets from player roots gain +{0}% final Work.',[[10,18]],[],['copier']);
add('P29','Boot Shield','Guard','C','Starting Guard +{0}. Install/upgrade also deposits the positive rank delta.',[[4,8]]);
add('P30','Deep Reserve','Guard','C','Guard capacity +{0}; each player primary gains {1} base Guard.',[[8,14],[.5,1]]);
add('P31','Packet Filter','Guard','U','Flat hostile damage reduction +{0}. Does not reduce Guard drains or self-costs.',[[1,2]]);
add('P32','Safe Recovery','Guard','U','Each fully blocked pulse repairs {0} Integrity, up to {1} actually restored per encounter.',[[1,2],[4,8]]);
add('P33','Last-Minute Fix','Risk','C','Below 50% root-start Integrity: final Work +{0}%.',[[10,18]]);
add('P34','Lightweight Case','Risk','C','Maximum Integrity −{0}; final Work +{1}%. Current Integrity clamps to the new maximum.',[[5,10],[15,25]]);
add('P35','Repair Warranty','Risk','U','Intermission repair price −{0} Credits, minimum 4. Still one repair per intermission.',[[2,4]]);
add('P36','Emergency Routing','Risk','U','Generated Guard +{0}%; maximum Integrity −{1}. Guard bonuses apply before generation penalties.',[[10,20],[5,10]]);
function breakthrough(id: string, name: string, parents: string[], text: string, tags: string[] = []) {
  const families = [...new Set(parents.flatMap(p=>definitions.find(d=>d.id===p)!.families))];
  definitions.push({id,name,parents,text,tags,families,kind:'breakthrough',rarity:'X',values:[],requires:[]});
}
breakthrough('X01','Vector Compiler',['F01','F02'],'Every packet becomes (Work + 12) ×1.50. One slot, two operations.');
breakthrough('X02','Release Train',['B01','B03'],'Full player packets: Work ×2. Every third full original gets another ×2. Copies cannot repeat the third-batch trigger.');
breakthrough('X03','L3 Cache',['C01','C03'],'Primary: add 40% of the previous incoming Work. Every third primary also adds 50 Work. Store input before the bonus.');
breakthrough('X04','Build Farm',['W01','W04'],'A 24-Work, 1-Guard worker every 3 seconds, plus a 70-Work worker every 8 seconds. Both enter slot one.',['workerProducer']);
breakthrough('X05','Perfect Build',['K01','K02'],'Crit chance +20 points. Critical packets: Work ×2. Other packets: +4 Work.');
breakthrough('X06','Branch Predictor',['E01','E02'],'Each primary becomes 2 packets at 85% Work each; every third becomes 3. Only the continuation retains incoming Guard. Incoming children pass unchanged.',['copier']);
breakthrough('X07','Ironclad Runtime',['G01','G03'],'Each primary: +7 Guard. Blocked pulses bank 20 Work, up to 3 banks. Next player original consumes the banks, or adds 2 Work with none.');
breakthrough('X08','Unsafe Mode',['R01','R03'],'All generated Guard ×0.75. Full player original at 25+ Integrity: pay 2 Integrity for Work ×3.80. All other packets: Work ×1.40.');
breakthrough('X09','Incremental CI',['C01','W01'],'A 20-Work, 1-Guard worker every 3 seconds. Each primary adds 35% of the previous incoming Work, then stores the current input.',['workerProducer']);
breakthrough('X10','Speculative Execution',['E01','K02'],'Crit chance +10 points. Critical original: Work ×1.80, then copy 75% of that downstream. Noncritical originals add 3. Incoming children pass unchanged.',['copier']);
breakthrough('X11','Atomic Deploy',['G01','B01'],'Each primary: +8 Guard. Full player packets: Work ×1.80. A fully blocked pulse arms a nonstacking ×1.40 bonus for the next player original.');
breakthrough('X12','JIT Daemon',['R02','F02'],'Raw Code production +50%; Guard capacity −15 (minimum 10). Every packet: Work ×1.40.');
export const CATALOG = definitions;
export const BY_ID: Record<string, Definition> = Object.fromEntries(definitions.map(d=>[d.id,d]));
export const maxRank = (d: Definition) => d.kind==='breakthrough'?1:d.kind==='patch'?2:3;
export function value(item: Item|undefined, parameter = 0): number {
  if (!item) return 0;
  return BY_ID[item.id]?.values[parameter]?.[item.rank-1] ?? 0;
}
export function describe(d: Definition, rank = 1): string {
  return d.text.replace(/\{(\d+)\}/g,(_, n:string)=>String(d.values[Number(n)][rank-1]));
}
export function tags(r: Run): Set<string> {
  return new Set(r.rack.flatMap(i=>[...BY_ID[i.id].tags,...BY_ID[i.id].families.map(f=>`family:${f}`)]));
}
export function active(r: Run, d: Definition): boolean {
  const t = tags(r); return d.requires.every(req=>t.has(req));
}
export function families(r: Run): Family[] { return [...new Set(r.rack.flatMap(i=>BY_ID[i.id].families))]; }
export const ICON: Record<Family,string> = {Flow:'→',Batch:'▤',Cache:'◫',Workers:'⚙',Critical:'✦',Echo:'⑂',Guard:'◇',Risk:'!'};
export const RARITY = {C:'Common',U:'Uncommon',R:'Rare',X:'Breakthrough'};
