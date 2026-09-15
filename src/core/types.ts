export const RULES = '0.1.0';
export const FAMILIES = ['Flow','Batch','Cache','Workers','Critical','Echo','Guard','Risk'] as const;
export type Family = typeof FAMILIES[number];
export type Kind = 'module' | 'patch' | 'breakthrough';
export type Rank = 1 | 2 | 3;
export type Memory = Record<string, number | string>;
export interface Item { id: string; rank: Rank; uid: number; mem: Memory }
export interface Definition {
  id: string; name: string; kind: Kind; families: Family[];
  rarity: 'C' | 'U' | 'R' | 'X'; values: number[][]; text: string;
  tags: string[]; requires: string[]; parents?: string[];
}
export interface TraceStep {
  id: string; slot: number; input: number; output: number;
  guardIn: number; guardOut: number; packets: number; copies: number; notes: string[];
}
export interface Trace {
  root: number; source: 'player'|'worker'; producer: string; fill: number;
  base: number; critical: boolean; initial: number; steps: TraceStep[];
  work: number; guard: number; deposited: number; wasted: number;
  children: number; tick: number;
}
export interface Damage {
  cause: string; raw: number[]; drain: number; damage: number;
  absorbed: number; lost: number; tick: number;
}
export interface Encounter {
  id: string; name: string; kind: 'project'|'trojan'; contract: string;
  target: number; work: number; tick: number; nextAttack: number;
  interval: number; damage: number; deadline: number; overdue: boolean;
  pulses: number; bossPhase: number; forks: number; escrow: number;
  escrowWorker: number; escrowOpen: boolean; xpAwarded: number; cleared: boolean;
  legacy: { due: number; damage: number; fired: boolean }[];
}
export interface Offer { serial: number; ids: string[]; paid: number; special: boolean; rejected: string[] }
export interface RunStats {
  ticks: number; roots: number; full: number; work: number; workerWork: number;
  actWork: number; actWorkerWork: number; peak: number; blocked: number;
  memoryUses: number; fragments: number; biggestChildren: number;
  firstRoot: number; damageTaken: number;
}
export interface Run {
  id: string; seed: string; mode: 'standard'|'seeded'|'tutorial'|'practice';
  phase: 'prep'|'playing'|'draft'|'result'; outcome: 'victory'|'crash'|'abandoned'|'tutorial'|'benchmark'|null;
  rig: string; library: Family[]; permanent: number[]; tier: number; assist: number; maxAssist: number;
  rng: { world: number; draft: number; crit: number }; uid: number; root: number; command: number;
  rack: Item[]; patches: Item[]; consumed: string[]; threshold: number;
  hp: number; guard: number; raw: number; pendingRaw: number; compileWindow: boolean; fallbackHp: number; fallbackGuard: number; credits: number;
  encounterIndex: number; projects: string[]; bosses: string[]; encounter: Encounter;
  contracts: string[]; previousContract: string; repairUsed: boolean; trainedActs: number[];
  freeRerollActs: number[]; pendingDrafts: boolean[]; offer: Offer|null; offerSerial: number; xp: number;
  jobs: { due: number; owner: number; work: number; guard: number }[];
  traces: Trace[]; bestTrace: Trace|null; lastDamage: Damage|null; ledger: string[]; stats: RunStats;
  log: { tick: number; text: string; type: 'info'|'good'|'danger' }[];
  offered: { encounter: number; ids: string[]; selected: string; rack: string[] }[];
}
export interface Settings {
  input: 'hold'|'toggle'|'step'; language: 'js'|'vba'; theme: string;
  motion: boolean; contrast: boolean; scale: number; gate: number;
  effects: number; interface: number; ambient: number;
  compileKey: string; pauseKey: string; codeKey: string;
}
export interface Summary {
  id: string; seed: string; rig: string; outcome: NonNullable<Run['outcome']>;
  encounter: number; ticks: number; level: number; work: number; peak: number;
  fragments: number; assist: number; tier: number; rack: Item[]; patches: Item[];
  best: Trace|null; damage: Damage|null;
}
export interface Profile {
  fragments: number; upgrades: number[]; rigs: string[]; seen: string[]; taken: string[];
  evolved: string[]; wonWith: string[]; challenges: string[]; blocked: number;
  runs: number; wins: number; tierUnlocked: number; tutorialDone: boolean;
  settings: Settings; history: Summary[];
}
export interface Game { schema: 1; rules: string; profile: Profile; run: Run|null }
export interface Stats {
  capacity: number; maxHp: number; guardCap: number; startingGuard: number;
  production: number; crit: number; critMult: number; flatDamage: number;
  damageMult: number; guardBonus: number; guardPenalty: number; workBonus: number;
  rigWork: number; primaryFlat: number; playerFlat: number; workerFlat: number;
  playerGuard: number; workerGuard: number; periodMult: number; repairPrice: number;
}
export type Command =
  | { type: 'TICK' } | { type: 'COMPILE' }
  | { type: 'CONNECT'; contract: string }
  | { type: 'CHOOSE'; serial: number; id: string; replace?: number }
  | { type: 'REROLL'; serial: number } | { type: 'SKIP'; serial: number }
  | { type: 'MOVE'; index: number; direction: -1|1 }
  | { type: 'THRESHOLD'; value: number } | { type: 'ASSIST'; value: number }
  | { type: 'REPAIR' } | { type: 'TRAIN'; index: number } | { type: 'ABANDON' }
  | { type: 'META'; index: number } | { type: 'REFUND' }
  | { type: 'SETTING'; key: keyof Settings; value: Settings[keyof Settings] };
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const actOf = (r: Run) => Math.floor(r.encounterIndex / 4) + 1;
export const num = (item: Item, key: string) => typeof item.mem[key] === 'number' ? item.mem[key] as number : 0;
export const own = (r: Run, id: string) => [...r.rack, ...r.patches].find(i => i.id === id);
