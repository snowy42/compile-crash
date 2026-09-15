import { Family } from '../core/types.js';
export const RIGS: {id:string;name:string;module:string;family:Family;description:string;unlock:string;symbol:string}[] = [
 {id:'RIG01',name:'Workstation',module:'F01',family:'Flow',description:'A reliable start. Line Expander I, +4 starting Credits.',unlock:'Always available',symbol:'▣'},
 {id:'RIG02',name:'Build Server',module:'W01',family:'Workers',description:'Background Thread I. Player production ×0.85; workers pick up the slack.',unlock:'Defeat a first-act Trojan',symbol:'▥'},
 {id:'RIG03',name:'Hardened Laptop',module:'G01',family:'Guard',description:'Firewall I, +15 Integrity. Final delivered Work ×0.90.',unlock:'Fully block 20 pulses across runs',symbol:'◇'},
 {id:'RIG04',name:'Batch Box',module:'B01',family:'Batch',description:'Full Build I, +8 buffer. Production ×0.90, 4 starting Guard.',unlock:'Make 10 full compiles in one run',symbol:'▤'}
];
export const PROJECTS = [
 ['Hello World','Todo App','CSV Cleaner','Expense Tracker','Coffee Queue','LAN Chat'],
 ['Inventory Service','Realtime Dashboard','Package Mirror','Distributed Scheduler','Search Indexer','Build Orchestrator'],
 ['City OS','Weather Control API','Autonomous Datacentre','Planetary Backup','Reality Debugger','Universe Simulator']
];
export const TARGETS = [[160,400,800],[1800,2800,4000],[6500,8500,11000]];
export const TROJANS: Record<string,{name:string;act:number;target:number;damage:number;interval:number;rule:string}> = {
 T01:{name:'Packet Leech',act:1,target:1600,damage:8,interval:40,rule:'First pulse at 8s, then every 5s: 8 raw damage. Every third pulse first drains 6 Guard. Quick compiles can replenish protection.'},
 T02:{name:'Port Squatter',act:1,target:1600,damage:10,interval:48,rule:'First pulse at 8s, then every 6s: 10 raw damage. Every third pulse replaces this with two 6-damage hits. Mitigation applies to each hit; block rewards trigger once.'},
 T03:{name:'Fork Bomb',act:2,target:6000,damage:14,interval:40,rule:'First pulse at 8s, then every 5s: 14 raw damage. Every 6s, grow a fork (max 3); each adds 3 damage. Every full player compile removes one fork before a due attack.'},
 T04:{name:'Ransomware',act:2,target:6000,damage:16,interval:48,rule:'First pulse at 8s, then every 6s: 16 damage. At 12s and every 16s afterward, 20% of output enters a 4-second escrow window, then is returned. Guard and permanent currency are untouched.'},
 T05:{name:'Rootkit',act:3,target:15000,damage:18,interval:40,rule:'First pulse at 8s, then every 5s. Phase 1: 18 damage. At ⅓ purge: 22 damage and quick-batch Work ×0.80. At ⅔: 26 damage and full-batch Work ×0.80 instead. Changed attacks give at least 3s notice.'},
 T06:{name:'Deadlock',act:3,target:15000,damage:20,interval:40,rule:'First pulse at 8s, then every 5s: 20 damage. At ⅓ purge, every second pulse also drains 8 Guard first. At ⅔, damage rises to 24 and interval falls to 4s; drain continues. At least 3s phase notice.'}
};
export const CONTRACTS: Record<string,{name:string;group:string;rule:string;bonus:number;requires?:string}> = {
 standard:{name:'Standard',group:'Reliable',rule:'Baseline scope, pressure, and reward. No extra conditions.',bonus:0},
 CT01:{name:'Batch Run',group:'Specialist',rule:'Full player Work ×1.20; target ×1.10.',bonus:2},
 CT02:{name:'Short Build',group:'Specialist',rule:'Quick player Work ×1.20; target ×1.10.',bonus:2},
 CT03:{name:'Nightly CI',group:'Specialist',rule:'Worker Work ×1.25; player Work ×0.90.',bonus:3,requires:'workerProducer'},
 CT04:{name:'Test Coverage',group:'Specialist',rule:'Crit chance +10 points; noncritical Work ×0.90.',bonus:3},
 CT05:{name:'Compressed Assets',group:'Specialist',rule:'Guard capacity −10 (minimum 10); target ×0.90.',bonus:2},
 CT06:{name:'Caching Job',group:'Specialist',rule:'Work ×0.80 for the first 8s, then ×1.20.',bonus:3},
 CT07:{name:'Rush Contract',group:'Risky',rule:'Deadline ×0.75.',bonus:5},
 CT08:{name:'Public Beta',group:'Risky',rule:'Ordinary pulse damage ×1.35.',bonus:5},
 CT09:{name:'Legacy Migration',group:'Risky',rule:'Target ×1.25.',bonus:6},
 CT10:{name:'Open Port',group:'Risky',rule:'First pulse at 6s instead of 12s; interval 5s instead of 6s.',bonus:5},
 CT11:{name:'Lean Deploy',group:'Risky',rule:'Start this encounter with zero Guard, overriding all starting bonuses.',bonus:4},
 CT12:{name:'Friday Traffic',group:'Risky',rule:'Deadline ×0.85; ordinary pulse damage ×1.20.',bonus:7}
};
export const CHALLENGES = [
 ['CH01','Workstation Certified','Win a complete run with Workstation.'],
 ['CH02','Server Certified','Win a complete run with Build Server.'],
 ['CH03','Hardened Certified','Win a complete run with Hardened Laptop.'],
 ['CH04','Batch Certified','Win a complete run with Batch Box.'],
 ['CH05','Clean Flow','Deliver 500 Work in one root with a Flow module.'],
 ['CH06','Big Release','Deliver 1,000 Work from one full player root.'],
 ['CH07','Cache Warm','Use a nonzero remembered Work bonus on 20 primaries in one run.'],
 ['CH08','Delegation','Clear an act with at least 40% of Work from workers.'],
 ['CH09','Moment of Clarity','Deliver 2,000 Work in one critical root.'],
 ['CH10','Branching Out','Deliver at least four child packets in one root.'],
 ['CH11','Clean Perimeter','Fully block 10 announced pulses in one run.'],
 ['CH12','Risk Accepted','Defeat a Trojan with a Risk module and less than 50% Integrity.']
];
export const META = [
 {name:'Muscle Memory',detail:'+5% Raw Code production per rank',unit:5},
 {name:'Reinforced Case',detail:'+5 starting / maximum Integrity per rank',unit:5},
 {name:'Reserve Capacitor',detail:'+3 Guard capacity per rank',unit:3},
 {name:'Seed Capital',detail:'+2 starting Credits per rank',unit:2}
];
