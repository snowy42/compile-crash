import { Game, Run, Trace } from '../core/types.js';
import { derive } from '../core/stats.js';
import { forecast } from '../core/game.js';
import { BY_ID, tags } from '../content/catalog.js';
import { esc, fmt, time } from './view.js';
const text=(id:string,value:string)=>{const node=document.getElementById(id);if(node)node.textContent=value;};
const width=(id:string,n:number)=>{const node=document.getElementById(id);if(node)node.style.width=`${Math.max(0,Math.min(100,n))}%`;};
const JS=[
 'const build = await compiler.create();','const modules = pipeline.resolve();','for (const packet of input.buffer) {','  const result = optimize(packet);','  cache.set(result.signature, result);','  await workers.dispatch(result);','}','if (guard.canAccept(connection)) {','  output.write(await build.compile());','}','// Build passed. Nobody touch anything.','const release = new Deployment();','release.verify({ confidence: "probably" });','await release.ship();','// The duck has approved this change.','const reality = await import("./reality");','reality.patch({ bugs: "fewer" });','return { status: "surprisingly fine" };'
];
const VBA=[
 'Option Explicit','Dim build As Object','Set build = CreateObject("Compile.Machine")','Dim packet As Variant','For Each packet In inputBuffer','    work = work + Optimize(packet)','    cache.Add packet.Id, work','Next packet','If firewall.IsSafe Then','    build.Compile True','End If',"' Build passed. Nobody touch anything.",'Application.ScreenUpdating = False','Call ShipToProduction(work)',"' The duck has approved this change.",'On Error GoTo HaveAnotherCoffee','Application.ScreenUpdating = True','Exit Sub'
];
/** Cosmetic state only. No gameplay RNG and no raw keystrokes are retained. */
export class Presentation {
 private lines:string[]=[];
 private lineSequence=0;
 private lastRoot=-1;
 private pulseAt=-1;
 private pulseTrace:Trace|null=null;
 private shownPhase='';
 private lastCodeTick=-1;
 reset():void{this.lines=[];this.lastRoot=-1;this.lastCodeTick=-1;this.shownPhase='';}
 update(g:Game,running:boolean,now=performance.now()):void {
  const r=g.run;if(!r)return;
  const e=r.encounter,s=derive(r),f=forecast(r);const p=e.work/e.target;
  text('work-value',fmt(e.work,1));text('work-target',r.mode==='practice'?' Work / 30s test':` / ${fmt(e.target,1)} ${e.kind==='trojan'?'purge':'Work'}`);
  width('work-bar',r.mode==='practice'?e.tick/240*100:p*100);
  text('level-progress',r.mode==='practice'?'BENCHMARK · NO XP OR REWARDS':e.kind==='project'?`${fmt(e.xpAwarded)} / 200 XP · UPGRADE AT 50% & 100%`:`PURGE PHASE ${e.bossPhase+1} · ALL WORK IS A COUNTERMEASURE`);
  text('deadline',r.mode==='practice'?`${fmt(Math.max(0,240-e.tick)/8,1)}s remaining`:e.kind==='project'?(e.overdue?'OVERDUE · DOUBLE DAMAGE / 3s PULSES':`${fmt(Math.max(0,e.deadline-e.tick)/8,1)}s to deadline`):e.escrowOpen?`ESCROW HOLDS ${fmt(e.escrow,1)} WORK`:e.id==='T03'?`${e.forks} / 3 ACTIVE FORKS`:'PROJECT MACHINE → PURGE ENGINE');
  text('raw-value',`${fmt(r.raw,1)} / ${fmt(s.capacity)}`);width('raw-bar',r.raw/s.capacity*100);
  text('hp-value',`${fmt(r.hp,1)} / ${fmt(s.maxHp)}`);width('hp-bar',r.hp/s.maxHp*100);
  text('guard-value',`${fmt(r.guard,1)} / ${fmt(s.guardCap)}`);width('guard-bar',r.guard/s.guardCap*100);
  text('intent-name',r.mode==='practice'?'No hostile traffic on the bench.':f.cause);
  text('intent-detail',r.mode==='practice'?'Measured output from the actual simulation.':`${f.raw.length>1?f.raw.map(n=>fmt(n,1)).join(' + '):fmt(f.raw[0],1)} raw${f.drain?` · drains ${fmt(f.drain)} Guard first`:''} → ${fmt(f.damage,2)} after mitigation · ${fmt(f.lost,2)} Integrity loss at current Guard${e.id==='T03'?' (forks may grow)':''}`);
  const seconds=Math.max(0,f.due-e.tick)/8;text('intent-time',r.mode==='practice'?'—':seconds.toFixed(1)+'s');
  document.getElementById('intent-strip')?.classList.toggle('imminent',seconds<=3&&e.kind!=='project');
  text('clock-badge',running?'▶ CLOCK RUNNING':'Ⅱ CLOCK STOPPED');document.getElementById('clock-badge')?.classList.toggle('running',running);
  text('source-count',tags(r).has('workerProducer')?'PLAYER + BACKGROUND WORKERS':'PLAYER THREAD');
  text('compile-count',`${fmt(r.stats.roots)} ROOTS`);text('elapsed',time(r.stats.ticks)+' advancing time');
  text('last-log',r.log.at(-1)?.text??'Build passed. Nobody touch anything.');
  text('input-hint',g.profile.settings.input==='toggle'?'TOGGLE RUNS UNTIL STOPPED':g.profile.settings.input==='step'?'ONE ACTION = ONE TICK':'HOLD ANY LETTER · RELEASE TO STOP');
  const compile=document.getElementById('compile-button') as HTMLButtonElement|null;
  if(compile)compile.disabled=e.cleared||r.phase!=='playing'||!r.compileWindow||r.raw<s.capacity*.25;
  text('code-pad',g.profile.settings.input==='toggle'?(running?'Stop coding Ⅱ':'Start coding ▶'):g.profile.settings.input==='step'?'Code one tick →':'Hold to code →');
  if(e.tick!==this.lastCodeTick&&r.phase==='playing'){
   if(e.tick===0||this.lastCodeTick<0||e.tick%2===0){const list=g.profile.settings.language==='vba'?VBA:JS;this.lines.push(list[this.lineSequence++%list.length]);this.lines=this.lines.slice(-16);}
   this.lastCodeTick=e.tick;
  }
  const feed=document.getElementById('code-feed');if(feed&&this.lines.length)feed.innerHTML=this.lines.slice(-Math.max(3,Math.min(12,Math.floor(feed.clientHeight/20)-1))).map(line=>this.highlight(line)).join('\n')+'\n<span class="teal">▍</span>';
  const latest=r.traces.at(-1);
  if(latest){
   text('receipt-work','+'+fmt(latest.work,1));text('receipt-label',`${latest.critical?'CRITICAL · ':''}${latest.children?`${latest.children+1} branches · `:''}${fmt(latest.deposited,1)} Guard${r.stats.firstRoot>0?` · ${fmt(latest.work/r.stats.firstRoot,1)}× opening root`:''}`);
   document.getElementById('receipt')?.classList.toggle('critical',latest.critical);
   if(latest.root!==this.lastRoot){this.lastRoot=latest.root;this.pulseAt=now;this.pulseTrace=latest;}
  }
  const previewKey=`${e.id}:${Math.floor(Math.min(1,p)*4)}:${e.bossPhase}:${e.forks}`;
  if(previewKey!==this.shownPhase||!document.getElementById('artifact')?.childElementCount){this.shownPhase=previewKey;const art=document.getElementById('artifact');if(art)art.innerHTML=this.artifact(r);}
  text('preview-version',`v${Math.floor(r.encounterIndex/4)}.${Math.min(4,Math.floor(p*4))}.${Math.floor(e.work)}`);
 }
 private highlight(line:string):string {
  if(line.trim().startsWith('//')||line.trim().startsWith("'"))return `<span class="code-muted">${esc(line)}</span>`;
  return esc(line).replace(/\b(const|await|for|of|if|return|new|Dim|As|Object|Set|For|Each|In|Next|If|Then|End|Call|Exit|Sub|True|False|Option|Explicit)\b/g,'<span class="syntax-key">$1</span>').replace(/(&quot;.*?&quot;)/g,'<span class="syntax-string">$1</span>');
 }
 private artifact(r:Run):string {
  const e=r.encounter,p=Math.min(1,e.work/e.target),stage=Math.floor(p*4);
  if(e.kind==='trojan')return `<div class="trojan-preview"><div class="trojan-orbit" aria-hidden="true">⌬</div><div><p>MALICIOUS PROCESS ISOLATED</p><strong>${esc(e.name)}</strong><p>PHASE ${e.bossPhase+1} · ${fmt(p*100,1)}% PURGED</p></div></div>`;
  const infra=/LAN|Package|Distributed|City|Datacentre|Backup/.test(e.name);
  if(infra)return `<div class="node-grid" aria-label="Infrastructure ${fmt(p*100)} percent assembled">${Array.from({length:24},(_,n)=>`<span class="server-node ${n<(stage+1)*4?'online':''}"></span>`).join('')}</div>`;
  const terminal=/Hello|CSV|Search|Orchestrator|Debugger|benchmark/.test(e.name);
  if(terminal)return `<div class="artifact-stage artifact-window"><div class="artifact-title"><span>${esc(e.name.toLowerCase().replaceAll(' ','_'))}.exe</span><span class="artifact-dots">•••</span></div><div class="terminal-preview">${['initialize workspace','resolve dependencies','validate inputs','compile executable','ship release'].map((s,n)=>`<div class="${n>stage?'pending':''}">${n<=stage?'✓':'·'} ${s} ${n<stage?'[OK]':''}</div>`).join('')}</div></div>`;
  return `<div class="artifact-stage artifact-window"><div class="artifact-title"><span>${esc(e.name)}</span><span class="artifact-dots">•••</span></div><div class="artifact-body"><div class="artifact-sidebar">${Array.from({length:5},()=>'<i></i>').join('')}</div><div class="artifact-content"><div class="skeleton live" style="width:${30+stage*12}%"></div><div class="skeleton" style="width:80%"></div><div class="artifact-chart">${[.4,.8,.5,1,.7,.9].map((h,n)=>`<span style="height:${Math.max(5,(stage+1)*h*20)}%;opacity:${n<=stage+1?.75:.1}"></span>`).join('')}</div></div></div></div>`;
 }
 frame(g:Game,now:number):void {
  const t=this.pulseTrace,elapsed=now-this.pulseAt,r=g.run;if(!r)return;
  for(let n=0;n<6;n++){
   const stage=t?.steps[n],lit=!!stage&&elapsed<1000&&(g.profile.settings.motion?elapsed>=n*60&&elapsed<n*60+400:true);
   document.getElementById(`module-${n}`)?.classList.toggle('pulsing',lit);
   text(`operation-${n}`,stage&&elapsed<2200?stage.copies?`+${stage.copies} COPY`:stage.output!==stage.input?`${stage.output>=stage.input?'+':'−'}${fmt(Math.abs(stage.output-stage.input),1)}`:stage.guardOut>stage.guardIn?`+${fmt(stage.guardOut-stage.guardIn,1)} G`:'':'');
  }
  const canvas=document.getElementById('pipeline-canvas') as HTMLCanvasElement|null;
  if(!canvas||!canvas.clientWidth)return;
  if(canvas.width!==canvas.clientWidth*devicePixelRatio){canvas.width=canvas.clientWidth*devicePixelRatio;canvas.height=18*devicePixelRatio;}
  const ctx=canvas.getContext('2d');if(!ctx)return;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
  ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue('--line');ctx.lineWidth=devicePixelRatio;ctx.beginPath();ctx.moveTo(w/12,h/2);ctx.lineTo(w*11/12,h/2);ctx.stroke();
  if(!t||elapsed<0||elapsed>650||!g.profile.settings.motion)return;
  const progress=Math.min(1,elapsed/600),branches=Math.min(5,t.children+1);
  ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--accent');
  for(let i=0;i<branches;i++){const x=w/12+progress*w*10/12,y=h/2+(i-(branches-1)/2)*3*devicePixelRatio;ctx.beginPath();ctx.arc(x,y,2.5*devicePixelRatio,0,Math.PI*2);ctx.fill();}
 }
 describeLatest(g:Game):string {const t=g.run?.traces.at(-1);return t?`${fmt(t.work)} Work. ${t.steps.filter(s=>s.output!==s.input).map(s=>BY_ID[s.id].name).join(', ')} contributed.`:'';}
}
