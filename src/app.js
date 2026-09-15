(() => {
  'use strict';
  const C = window.CompileCrash;
  const app = document.getElementById('app');
  const toastLayer = document.getElementById('toast-layer');
  const SAVE='compile-crash-v2';
  const RUNSAVE='compile-crash-v2-run';
  let profile=loadProfile();
  let run=null;
  let screen='menu';
  let modal=null;
  let lastFrame=performance.now();
  let codeCounter=0;
  let audio=null;

  function loadProfile(){ try { const x=JSON.parse(localStorage.getItem(SAVE)||'null'); return x&&x.meta&&x.unlocks?x:C.baseProfile(); } catch { return C.baseProfile(); } }
  function save(){ localStorage.setItem(SAVE,JSON.stringify(profile)); }
  function pct(a,b){ return Math.max(0,Math.min(100,a/b*100)); }
  function fmt(n){ if(n<1000)return Math.round(n).toString(); if(n<1e6)return (n/1000).toFixed(n<10000?1:0)+'K'; return (n/1e6).toFixed(1)+'M'; }
  function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function beep(type){
    if(!profile.settings.sound)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      const o=audio.createOscillator(),g=audio.createGain();
      const map={key:[180,.018,.018],crit:[520,.06,.05],ship:[760,.12,.07],hurt:[90,.09,.08],trojan:[150,.15,.08],choose:[360,.04,.035],compile:[250,.045,.035]};
      const [f,d,v]=map[type]||map.key; o.frequency.value=f; o.type=type==='hurt'?'sawtooth':'square'; g.gain.setValueAtTime(v,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d);
    }catch{}
  }
  function toast(text,kind=''){ const el=document.createElement('div');el.className='toast '+kind;el.textContent=text;toastLayer.appendChild(el);setTimeout(()=>el.remove(),1200); }
  function event(e){
    if(!e)return;
    if(e.type==='teach'||e.type==='intrusion'||e.type==='trojan'){
      modal={kind:e.type,title:e.title||e.name,text:e.text||e.flavour};
      if(e.type==='trojan')beep('trojan');
    }
    if(e.type==='ship'){ beep('ship'); toast('PROJECT SHIPPED','good'); }
    if(e.type==='upgrade'){ beep('choose'); toast(e.name+' · '+e.text,'good'); }
    if(e.type==='compile'){ beep('compile'); toast('+'+fmt(e.work)+' WORK','good'); }
    if(e.type==='damage'){ beep('hurt'); document.body.classList.add('hit'); setTimeout(()=>document.body.classList.remove('hit'),160); if(e.amount>0)toast('-'+Math.ceil(e.amount)+' INTEGRITY','bad'); }
    if(e.type==='trojan-dead'){ beep('ship'); modal={kind:'success',title:e.name+' DELETED',text:'Threat terminated. Source Fragments recovered.'}; }
    if(e.type==='crash'){ finishRun(false); }
    if(e.type==='victory'){ finishRun(true); }
    if(e.type==='hint')toast(e.text,'hint');
  }
  function events(list){ (list||[]).forEach(event); }
  function finishRun(win){
    const earned=run.fragmentsEarned;
    C.applyRunResult(profile,run); save();
    modal={kind:win?'victory':'crash',title:win?'RUN COMPLETE':'SYSTEM CRASH',text:win?`You shipped the whole stack and recovered ${earned} Source Fragments.`:`The machine is gone. You recovered ${earned} Source Fragments from the wreckage.`};
    render();
  }
  function start(){ run=C.newRun(profile); screen='game'; modal={kind:'teach',title:'MAKE SOMETHING',text:'Mash letter, number, or punctuation keys. Every key writes fake code and moves HELLO WORLD forward.'}; events(C.beginProject(run)); render(); }
  function resume(){ const saved=localStorage.getItem(RUNSAVE); if(saved){ try{run=JSON.parse(saved); run.random=(()=>Math.random()); screen='game'; render();}catch{start();} }else start(); }
  function storeRun(){ if(run&&run.status==='playing')localStorage.setItem(RUNSAVE,JSON.stringify({...run,random:undefined})); else localStorage.removeItem(RUNSAVE); }

  function menu(){
    return `<section class="menu-shell"><div class="logo"><span>COMPILE</span><b>/</b><span>CRASH</span></div><p class="tag">Make code. Build a machine. Survive what finds you.</p><div class="menu-actions">
      <button class="primary" data-action="start">${profile.runs?'NEW RUN':'START'}</button>
      ${localStorage.getItem(RUNSAVE)?'<button data-action="resume">CONTINUE</button>':''}
      ${profile.unlocks.workshop?'<button data-action="workshop">WORKSHOP <small>'+profile.fragments+' fragments</small></button>':''}
      <button class="quiet" data-action="settings">SETTINGS</button>
    </div>${profile.runs?`<div class="tiny-stats">Best project ${profile.bestProject}/10 · Runs ${profile.runs}${profile.wins?` · Wins ${profile.wins}`:''}</div>`:''}</section>`;
  }
  function pipeline(){
    if(!run.compileUnlocked)return '';
    const parts=[`<div class="pipe-node source"><span>CODE</span><b>${fmt(run.code)}</b></div>`,`<div class="pipe-arrow">→</div>`,`<div class="pipe-node"><span>COMPILE</span><b>×${run.compilePower.toFixed(2)}</b></div>`];
    run.modules.forEach(m=>{parts.push('<div class="pipe-arrow">→</div>',`<div class="pipe-node module"><span>${esc(m.name)}</span><b>${esc(m.text)}</b></div>`);});
    parts.push('<div class="pipe-arrow">→</div>','<div class="pipe-node work"><span>WORK</span><b>PROJECT</b></div>');
    return `<div class="pipeline">${parts.join('')}</div>`;
  }
  function threatBox(){ if(!run.threat)return ''; const t=run.threat; return `<section class="threat"><header><span>⚠ ${esc(t.name)}</span><b>${Math.ceil(t.hp)} / ${t.maxHp}</b></header><div class="bar red"><i style="width:${pct(t.hp,t.maxHp)}%"></i></div><small>Next attack in ${Math.max(0,run.threatPulse).toFixed(1)}s</small></section>`; }
  function stats(){
    const things=[];
    if(run.comboStep>0)things.push(`<span>COMBO <b>×${(1+run.combo*run.comboStep).toFixed(2)}</b></span>`);
    if(run.compileUnlocked)things.push(`<span>BUFFER <b>${Math.round(pct(run.code,run.bufferCap))}%</b></span>`);
    if(run.securityUnlocked)things.push(`<span>INTEGRITY <b>${Math.ceil(run.hp)}/${run.maxHp}</b></span>`);
    if(run.guard>0)things.push(`<span>GUARD <b>${Math.ceil(run.guard)}</b></span>`);
    return things.length?`<div class="stats-row">${things.join('')}</div>`:'';
  }
  function generatedLine(){ const p=C.project(run), lines=C.CODE_LINES[p.code]||C.CODE_LINES.hello; const line=lines[codeCounter++%lines.length]; return `<div><span>${String(codeCounter).padStart(3,'0')}</span>${esc(line)}</div>`; }
  function game(){ const p=C.project(run); return `<section class="game-shell ${run.threat?'under-attack':''}">
      <header class="topbar"><div><small>PROJECT ${run.project+1}/10</small><h1>${esc(p.name)}</h1></div><button class="icon-btn" data-action="pause" aria-label="Pause">Ⅱ</button></header>
      <div class="project-progress"><div class="bar"><i style="width:${pct(run.work,p.need)}%"></i></div><b>${fmt(run.work)} / ${fmt(p.need)} WORK</b></div>
      ${run.securityUnlocked?`<div class="integrity-strip"><span>INTEGRITY</span><div class="bar hp"><i style="width:${pct(run.hp,run.maxHp)}%"></i></div><b>${Math.ceil(run.hp)}</b></div>`:''}
      ${threatBox()}
      <div class="workspace">
        <div class="editor"><div class="editor-head"><span>main.${p.code==='hello'?'js':'ts'}</span><span class="typing-status">${run.compileUnlocked?'TYPE → BUFFER':'TYPE → WORK'}</span></div><div id="code-lines" class="code-lines"></div><div class="cursor">▌</div></div>
        <aside class="machine">${stats()}${pipeline()}<div class="instruction"><strong>${run.compileUnlocked?'MASH KEYS TO WRITE CODE':'MASH KEYS TO CODE'}</strong><span>${run.compileUnlocked?'ENTER compiles early · full buffer auto-compiles':'Any normal key works'}</span></div>${run.compileUnlocked?`<button class="compile-btn" data-action="compile">COMPILE <kbd>ENTER</kbd></button>`:''}</aside>
      </div>
      <footer><span>${esc(p.blurb)}</span><span>Level ${run.level}</span></footer>
      ${overlay()}
    </section>`; }
  function overlay(){
    if(run?.draft){ return `<div class="overlay"><div class="draft-card"><small>LEVEL ${run.level} · CHOOSE ONE</small><h2>What gets better?</h2><div class="choices">${run.draft.map((u,i)=>`<button class="upgrade ${u.type}" data-action="choose" data-id="${u.id}"><em>${i+1}</em><strong>${esc(u.name)}</strong><span>${esc(u.short)}</span><small>${esc(u.desc)}</small></button>`).join('')}</div><p>Time is stopped while you choose.</p></div></div>`; }
    if(!modal)return '';
    const final=modal.kind==='victory'||modal.kind==='crash';
    return `<div class="overlay"><div class="dialog ${modal.kind}"><small>${modal.kind==='intrusion'?'NETWORK EVENT':modal.kind==='trojan'?'THREAT DETECTED':modal.kind==='teach'?'NEW CONCEPT':''}</small><h2>${esc(modal.title)}</h2><p>${esc(modal.text)}</p>${final&&profile.unlocks.workshop?'<p class="unlock">WORKSHOP UNLOCKED · permanent upgrades now live on the main menu.</p>':''}<button class="primary" data-action="${final?'menu':'dismiss'}">${final?'BACK TO DESKTOP':modal.kind==='trojan'?'FIGHT IT':'GOT IT'}</button></div></div>`;
  }
  function workshop(){ const tracks=[['power','MUSCLE MEMORY','+8% starting Work per key'],['integrity','OLD CHASSIS','+12 starting Integrity'],['luck','GOOD OMEN','+1.5% starting critical chance']]; return `<section class="panel-screen"><button class="back" data-action="menu">← DESKTOP</button><h1>WORKSHOP</h1><p>Source Fragments survive crashes. Spend them here; these upgrades stay between runs.</p><div class="fragments">${profile.fragments} <span>SOURCE FRAGMENTS</span></div><div class="meta-grid">${tracks.map(([id,name,text])=>{const r=profile.meta[id],cost=C.metaCost(r);return `<button class="meta-card" data-action="meta" data-id="${id}" ${r>=3||profile.fragments<cost?'disabled':''}><strong>${name}</strong><span>${text}</span><div>Rank ${r}/3</div><b>${r>=3?'MAX':cost+' fragments'}</b></button>`}).join('')}</div></section>`; }
  function settings(){return `<section class="panel-screen narrow"><button class="back" data-action="menu">← DESKTOP</button><h1>SETTINGS</h1><label class="toggle"><span>SOUND</span><input type="checkbox" data-setting="sound" ${profile.settings.sound?'checked':''}></label><label class="toggle"><span>SCREEN MOTION</span><input type="checkbox" data-setting="motion" ${profile.settings.motion?'checked':''}></label><button class="danger" data-action="reset">RESET SAVE</button></section>`;}
  function render(){ app.innerHTML=screen==='menu'?menu():screen==='game'?game():screen==='workshop'?workshop():settings(); }
  function addCode(crit,amount){ const host=document.getElementById('code-lines'); if(!host)return; for(let i=0;i<(crit?3:1);i++)host.insertAdjacentHTML('beforeend',generatedLine()); while(host.children.length>15)host.removeChild(host.firstElementChild); const el=document.createElement('span');el.className='float '+(crit?'crit':'');el.textContent='+'+amount.toFixed(amount<10?1:0);document.querySelector('.editor')?.appendChild(el);setTimeout(()=>el.remove(),700); }
  function doKey(){ if(!run||screen!=='game'||modal||run.draft||run.status!=='playing')return; const result=C.keypress(run,Date.now()); beep(result.crit?'crit':'key'); addCode(result.crit,result.amount); events(result.events); storeRun(); renderKeepCode(); }
  function renderKeepCode(){ const old=document.getElementById('code-lines')?.innerHTML||''; render(); const host=document.getElementById('code-lines'); if(host)host.innerHTML=old; }
  function action(name,el){
    if(name==='start')start();
    else if(name==='resume')resume();
    else if(name==='workshop'){screen='workshop';render();}
    else if(name==='settings'){screen='settings';render();}
    else if(name==='menu'){ if(run&&(run.status==='victory'||run.status==='crashed')){run=null;localStorage.removeItem(RUNSAVE);} screen='menu';modal=null;render(); }
    else if(name==='dismiss'){ modal=null; render(); }
    else if(name==='pause'){ modal={kind:'pause',title:'PAUSED',text:'Nothing moves while this is open.'};render(); }
    else if(name==='compile'){ const r=C.compile(run,true);events(r.events);storeRun();renderKeepCode(); }
    else if(name==='choose'){ const id=el.dataset.id; events(C.choose(run,id)); events(C.afterDraft(run)); storeRun(); render(); }
    else if(name==='meta'){ if(C.buyMeta(profile,el.dataset.id)){save();beep('choose');render();} }
    else if(name==='reset'){ if(confirm('Erase all COMPILE / CRASH progress?')){localStorage.removeItem(SAVE);localStorage.removeItem(RUNSAVE);profile=C.baseProfile();screen='menu';render();} }
  }
  app.addEventListener('click',e=>{ const el=e.target.closest('[data-action]'); if(el&&!el.disabled)action(el.dataset.action,el); });
  app.addEventListener('change',e=>{ const el=e.target;if(el.dataset.setting){profile.settings[el.dataset.setting]=el.checked;save();} });
  window.addEventListener('keydown',e=>{
    if(screen!=='game'||modal||run?.draft||run?.status!=='playing')return;
    if(e.key==='Enter'&&run.compileUnlocked){e.preventDefault();action('compile',document.body);return;}
    if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
    if(e.key.length===1){e.preventDefault();doKey();}
  });
  let last=performance.now();
  function frame(now){ const dt=Math.min(.1,(now-last)/1000);last=now;if(run&&screen==='game'&&!modal&&!run.draft&&run.status==='playing'){const ev=C.tick(run,dt);if(ev.length){events(ev);storeRun();renderKeepCode();}else{updateLive();}}requestAnimationFrame(frame); }
  function updateLive(){ if(!run)return; const p=C.project(run); const projectBar=document.querySelector('.project-progress .bar i');if(projectBar)projectBar.style.width=pct(run.work,p.need)+'%';const projectNum=document.querySelector('.project-progress b');if(projectNum)projectNum.textContent=`${fmt(run.work)} / ${fmt(p.need)} WORK`; const hp=document.querySelector('.integrity-strip .bar i');if(hp)hp.style.width=pct(run.hp,run.maxHp)+'%'; const hpN=document.querySelector('.integrity-strip b');if(hpN)hpN.textContent=Math.ceil(run.hp); const threat=document.querySelector('.threat .bar i');if(threat&&run.threat)threat.style.width=pct(run.threat.hp,run.threat.maxHp)+'%'; const countdown=document.querySelector('.threat small');if(countdown&&run.threat)countdown.textContent=`Next attack in ${Math.max(0,run.threatPulse).toFixed(1)}s`; }
  render(); requestAnimationFrame(frame);
})();