(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CompileCrash = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PROJECTS = [
    { name:'HELLO WORLD', need:80, code:'hello', blurb:'One file. One job. Make it run.' },
    { name:'TODO LIST', need:180, code:'todo', blurb:'A button, a list, and unrealistic confidence.' },
    { name:'WEATHER WIDGET', need:320, code:'weather', blurb:'Fetch something. Pretend timezones are easy.' },
    { name:'INVENTORY TOOL', need:520, code:'inventory', blurb:'Your first project large enough to need compiling.' },
    { name:'CHAT APP', need:820, code:'chat', blurb:'Now your code can pass through real machinery.' },
    { name:'DEPLOYMENT DASHBOARD', need:1250, code:'deploy', blurb:'The machine is starting to feel like yours.' },
    { name:'API GATEWAY', need:1850, code:'api', blurb:'Why is something probing port 443?' },
    { name:'PAYMENT PROCESSOR', need:2650, code:'payment', blurb:'Ship it while somebody tries to break in.', trojan:'SCRIPT KIDDIE' },
    { name:'DISTRIBUTED QUEUE', need:3900, code:'queue', blurb:'More traffic. More moving parts. More teeth.', trojan:'WORM' },
    { name:'AUTONOMOUS SERVICE', need:5600, code:'ai', blurb:'One last deploy. The network is already hostile.', trojan:'ROOTKIT' }
  ];

  const BASIC_UPGRADES = [
    { id:'fast', name:'FASTER FINGERS', short:'+25% Work per key', desc:'Every key produces 25% more Work.', type:'stat', apply:s=>s.keyPower*=1.25 },
    { id:'crit', name:'LUCKY BREAK', short:'+8% critical chance', desc:'A critical key produces 3× Work.', type:'stat', apply:s=>s.critChance+=0.08 },
    { id:'critpower', name:'BIG BRAIN MOMENT', short:'Criticals hit harder', desc:'Critical keys improve from 3× to 4×.', type:'stat', requires:s=>s.critChance>0.05, apply:s=>s.critMult+=1 },
    { id:'auto', name:'AUTOCOMPLETE', short:'+1.2 Work/sec', desc:'A tiny amount of code writes itself.', type:'stat', apply:s=>s.autoWork+=1.2 },
    { id:'combo', name:'FLOW STATE', short:'Combo grows your output', desc:'Each quick key adds +2% Work, up to +60%.', type:'stat', apply:s=>s.comboStep+=0.02 },
    { id:'streak', name:'NO DISTRACTIONS', short:'Combo lasts longer', desc:'Your combo takes 1.2 seconds longer to expire.', type:'stat', requires:s=>s.comboStep>0, apply:s=>s.comboGrace+=1.2 }
  ];

  const COMPILE_UPGRADES = [
    { id:'buffer', name:'BIGGER BUFFER', short:'+35% buffer size', desc:'Store more Code before compiling.', type:'stat', apply:s=>s.bufferCap*=1.35 },
    { id:'compiler', name:'BETTER COMPILER', short:'+30% compile output', desc:'Every compile produces 30% more Work.', type:'stat', apply:s=>s.compilePower*=1.30 },
    { id:'manual', name:'SHIP IT', short:'+45% manual compile bonus', desc:'Press Enter before the buffer auto-compiles for a bigger hit.', type:'stat', apply:s=>s.manualBonus+=0.45 }
  ];

  const MODULE_UPGRADES = [
    { id:'optimizer', name:'OPTIMIZER', short:'Module · ×1.45 Work', desc:'All compiled Work passing through this module is multiplied.', type:'module', module:{id:'optimizer', name:'OPTIMIZER', icon:'×', text:'×1.45', fn:v=>v*1.45} },
    { id:'cache', name:'HOT CACHE', short:'Module · +35 flat Work', desc:'Adds a reliable burst after each compile.', type:'module', module:{id:'cache', name:'HOT CACHE', icon:'+', text:'+35', fn:v=>v+35} },
    { id:'fork', name:'FORK', short:'Module · ×1.28, twice', desc:'Duplicates part of your compile. Simple, loud, effective.', type:'module', module:{id:'fork', name:'FORK', icon:'⑂', text:'×1.28', fn:v=>v*1.28} }
  ];

  const SECURITY_UPGRADES = [
    { id:'firewall', name:'FIREWALL', short:'-25% Trojan damage', desc:'Incoming Trojan damage is reduced.', type:'security', apply:s=>s.damageReduction=Math.min(.7,s.damageReduction+.25) },
    { id:'integrity', name:'REINFORCED CHASSIS', short:'+30 max Integrity', desc:'More computer left to destroy.', type:'security', apply:s=>{s.maxHp+=30;s.hp+=30;} },
    { id:'shield', name:'PACKET FILTER', short:'+10 Guard per compile', desc:'Compiling generates Guard that absorbs Trojan damage.', type:'security', apply:s=>s.guardPerCompile+=10 }
  ];

  const CODE_LINES = {
    hello:["console.log('hello, world');","const ready = true;","return 'it works';","// ship it"],
    todo:["items.push(task);","renderList(items);","button.addEventListener('click', save);","const done = item.completed;"],
    weather:["const forecast = await fetch(url);","temperature = Math.round(data.temp);","cache.set(city, forecast);","return normalizeWeather(data);"],
    inventory:["stock.set(sku, quantity);","await db.commit();","const delta = incoming - outgoing;","reconcileWarehouse(batch);"],
    chat:["socket.send(packet);","channel.broadcast(message);","await encrypt(payload);","presence.set(userId, 'online');"],
    deploy:["pipeline.enqueue(build);","await tests.run();","release.promote(candidate);","rollback.capture(snapshot);"],
    api:["router.post('/v1/jobs', handler);","rateLimit.check(client);","token = await auth.verify(req);","metrics.observe(latency);"],
    payment:["ledger.reserve(amount);","signature.verify(payload);","await settlement.commit();","fraud.score(transaction);"],
    queue:["consumer.ack(message);","partition.rebalance();","await queue.flush();","retry.schedule(job, backoff);"],
    ai:["model.route(context);","agent.plan(objective);","await tools.execute(step);","checkpoint.persist(state);"]
  };

  function hash(str){ let h=2166136261; for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
  function rng(seed){ let x=hash(seed)||1; return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;}; }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function baseProfile(){ return { fragments:0, meta:{power:0,integrity:0,luck:0}, unlocks:{workshop:false,security:false,victory:false}, bestProject:0, runs:0, wins:0, settings:{sound:true,motion:true} }; }
  function newRun(profile, seed='LOCAL-'+Date.now()){
    const meta=profile.meta||{power:0,integrity:0,luck:0};
    return {
      seed, random:rng(seed), project:0, work:0, code:0, level:1, xp:0,
      keyPower:1+meta.power*.08, critChance:.04+meta.luck*.015, critMult:3,
      autoWork:0, combo:0, comboStep:0, comboGrace:1.6, lastKeyAt:0,
      compileUnlocked:false, bufferCap:100, compilePower:1, manualBonus:0,
      modules:[], moduleSlots:0,
      securityUnlocked:false, hp:100+meta.integrity*12, maxHp:100+meta.integrity*12,
      guard:0, guardPerCompile:0, damageReduction:0,
      threat:null, threatPulse:0, threatPulseEvery:5,
      upgrades:[], draft:null, tutorialStep:'keys', notice:null,
      status:'playing', fragmentsEarned:0, elapsed:0, runWork:0,
      projectStartAt:0, lastEvent:'Start typing.'
    };
  }
  function stage(run){
    if(run.project<3) return 'basic';
    if(run.project<4) return 'compile';
    if(run.project<6) return 'modules';
    return 'security';
  }
  function project(run){ return PROJECTS[Math.min(run.project,PROJECTS.length-1)]; }
  function compileValue(run, amount, manual){
    let value=amount*run.compilePower*(manual?1+run.manualBonus:1);
    const trace=[{name:'COMPILE',value}];
    for(const m of run.modules){
      const def=MODULE_UPGRADES.find(u=>u.module.id===m.id)?.module;
      if(def){ value=def.fn(value); trace.push({name:def.name,value}); }
    }
    return {value,trace};
  }
  function addWork(run, amount){
    if(run.status!=='playing') return [];
    const events=[];
    const p=project(run);
    run.runWork+=amount;
    if(run.threat){
      run.threat.hp=Math.max(0,run.threat.hp-amount*run.threat.maxHp/(p.need*run.threat.targetFraction));
      if(run.threat.hp<=0){
        const name=run.threat.name;
        run.fragmentsEarned+=name==='SCRIPT KIDDIE'?3:name==='WORM'?5:8;
        run.threat=null;
        events.push({type:'trojan-dead',name});
      }
    }
    run.work=Math.min(p.need,run.work+amount);
    if(run.work>=p.need && !run.threat) events.push(...completeProject(run));
    return events;
  }
  function keypress(run, now=Date.now()){
    if(run.status!=='playing' || run.draft) return {events:[], amount:0, crit:false};
    const dt=now-run.lastKeyAt;
    run.lastKeyAt=now;
    if(run.comboStep>0){ run.combo=dt<run.comboGrace*1000?Math.min(30,run.combo+1):1; }
    const comboMult=1+run.combo*run.comboStep;
    const crit=run.random()<run.critChance;
    const raw=run.keyPower*comboMult*(crit?run.critMult:1);
    const events=[];
    if(run.compileUnlocked){
      run.code+=raw*8;
      if(run.code>=run.bufferCap) events.push(...compile(run,false).events);
    } else events.push(...addWork(run,raw));
    return {events,amount:raw,crit};
  }
  function compile(run, manual=true){
    if(!run.compileUnlocked || run.status!=='playing' || run.draft || run.code<=0) return {events:[],work:0,trace:[]};
    const use=Math.min(run.code,run.bufferCap);
    if(manual && use<run.bufferCap*.25) return {events:[{type:'hint',text:'Let the buffer reach 25% before compiling.'}],work:0,trace:[]};
    run.code-=use;
    const resolved=compileValue(run,use/8,manual);
    run.guard=Math.min(999,run.guard+run.guardPerCompile);
    const events=[{type:'compile',work:resolved.value,trace:resolved.trace,manual}];
    events.push(...addWork(run,resolved.value));
    return {events,work:resolved.value,trace:resolved.trace};
  }
  function upgradePool(run){
    let pool=[...BASIC_UPGRADES];
    if(run.compileUnlocked) pool.push(...COMPILE_UPGRADES);
    if(run.moduleSlots>0) pool.push(...MODULE_UPGRADES);
    if(run.securityUnlocked) pool.push(...SECURITY_UPGRADES);
    pool=pool.filter(u=>!u.requires||u.requires(run));
    if(run.modules.length>=run.moduleSlots) pool=pool.filter(u=>u.type!=='module');
    const owned=new Set([...run.upgrades,...run.modules.map(m=>m.id)]);
    pool=pool.filter(u=>u.type==='stat'||u.type==='security'||!owned.has(u.id));
    return pool;
  }
  function makeDraft(run){
    const pool=upgradePool(run).slice();
    const picks=[];
    while(pool.length&&picks.length<3){ const i=Math.floor(run.random()*pool.length); picks.push(pool.splice(i,1)[0]); }
    while(picks.length<3) picks.push(BASIC_UPGRADES[picks.length%BASIC_UPGRADES.length]);
    run.draft=picks.map(u=>({id:u.id,name:u.name,short:u.short,desc:u.desc,type:u.type}));
    return run.draft;
  }
  function choose(run,id){
    if(!run.draft) return [];
    const all=[...BASIC_UPGRADES,...COMPILE_UPGRADES,...MODULE_UPGRADES,...SECURITY_UPGRADES];
    const u=all.find(x=>x.id===id); if(!u||!run.draft.some(x=>x.id===id)) return [];
    if(u.type==='module'){ if(run.modules.length<run.moduleSlots) run.modules.push(clone(u.module)); }
    else u.apply(run);
    run.upgrades.push(id); run.draft=null;
    return [{type:'upgrade',name:u.name,text:u.short}];
  }
  function threatFor(name){
    if(name==='SCRIPT KIDDIE') return {name,hp:210,maxHp:210,pulse:10,every:5,targetFraction:.52,flavour:'A noisy amateur is hammering obvious ports.'};
    if(name==='WORM') return {name,hp:460,maxHp:460,pulse:17,every:4.5,targetFraction:.78,flavour:'It keeps making copies of itself.'};
    return {name:'ROOTKIT',hp:850,maxHp:850,pulse:24,every:4,targetFraction:.96,flavour:'It already thinks this machine belongs to it.'};
  }
  function beginProject(run){
    const p=project(run); const events=[{type:'project',index:run.project,name:p.name}];
    run.work=0; run.code=0; run.projectStartAt=run.elapsed;
    if(run.project===3 && !run.compileUnlocked){ run.compileUnlocked=true; run.tutorialStep='compile'; events.push({type:'teach',key:'compile',title:'YOUR CODE NOW HAS A BUFFER',text:'Keys fill CODE instead of finishing the project directly. Press ENTER to compile it into Work. A full buffer auto-compiles.'}); }
    if(run.project===4 && run.moduleSlots===0){ run.moduleSlots=1; run.modules.push(clone(MODULE_UPGRADES[0].module)); run.tutorialStep='module'; events.push({type:'teach',key:'module',title:'YOUR FIRST MODULE',text:'Compiled Work now passes through OPTIMIZER before reaching the project. Watch the little pipeline: CODE → COMPILE → OPTIMIZER → WORK.'}); }
    if(run.project===5 && run.moduleSlots===1){ run.moduleSlots=2; events.push({type:'teach',key:'module-choice',title:'SECOND MODULE SLOT UNLOCKED',text:'Module cards can now appear in level-up choices. They change what happens to each compile.'}); }
    if(run.project===6 && !run.securityUnlocked){ run.securityUnlocked=true; run.tutorialStep='integrity'; events.push({type:'intrusion',title:'UNKNOWN CONNECTION',text:'Something just touched your machine. INTEGRITY is now visible. Security upgrades can start appearing.'}); }
    if(p.trojan){ run.threat=threatFor(p.trojan); run.threatPulse=run.threat.every; events.push({type:'trojan',name:run.threat.name,flavour:run.threat.flavour}); }
    else run.threat=null;
    return events;
  }
  function completeProject(run){
    const finished=run.project; const p=project(run); const events=[{type:'ship',name:p.name,index:finished}];
    if(run.threat){
      if(run.threat.hp>0){ run.work=p.need*.92; return [{type:'hint',text:`${run.threat.name} is still alive. Keep compiling.`}]; }
    }
    run.level++; run.xp++;
    run.project++;
    if(run.project>=PROJECTS.length){ run.status='victory'; run.fragmentsEarned+=12; events.push({type:'victory'}); return events; }
    makeDraft(run);
    return events;
  }
  function afterDraft(run){ return beginProject(run); }
  function tick(run,seconds){
    if(run.status!=='playing'||run.draft) return [];
    const events=[]; run.elapsed+=seconds;
    if(run.combo>0 && Date.now()-run.lastKeyAt>run.comboGrace*1000) run.combo=0;
    if(run.autoWork>0){
      if(run.compileUnlocked){ run.code+=run.autoWork*seconds*8; if(run.code>=run.bufferCap) events.push(...compile(run,false).events); }
      else events.push(...addWork(run,run.autoWork*seconds));
    }
    if(run.threat){
      run.threatPulse-=seconds;
      if(run.threatPulse<=0){
        const t=run.threat; run.threatPulse+=t.every;
        let dmg=t.pulse*(1-run.damageReduction);
        const blocked=Math.min(run.guard,dmg); run.guard-=blocked; dmg-=blocked;
        run.hp-=dmg; events.push({type:'damage',amount:dmg,blocked});
        if(run.hp<=0){ run.hp=0; run.status='crashed'; run.fragmentsEarned+=Math.max(2,Math.floor(run.project/2)); events.push({type:'crash'}); }
      }
    }
    return events;
  }
  function applyRunResult(profile,run){
    profile.runs++;
    profile.fragments+=run.fragmentsEarned;
    profile.bestProject=Math.max(profile.bestProject,Math.min(run.project+1,PROJECTS.length));
    if(run.status==='crashed') profile.unlocks.workshop=true;
    if(run.securityUnlocked) profile.unlocks.security=true;
    if(run.status==='victory'){ profile.wins++; profile.unlocks.victory=true; profile.unlocks.workshop=true; }
    return profile;
  }
  function metaCost(rank){ return [3,6,9][rank]??Infinity; }
  function buyMeta(profile,key){
    if(!['power','integrity','luck'].includes(key)) return false;
    const rank=profile.meta[key]||0; if(rank>=3) return false;
    const cost=metaCost(rank); if(profile.fragments<cost) return false;
    profile.fragments-=cost; profile.meta[key]++; return true;
  }
  return { PROJECTS, CODE_LINES, BASIC_UPGRADES, COMPILE_UPGRADES, MODULE_UPGRADES, SECURITY_UPGRADES, baseProfile, newRun, project, keypress, compile, choose, afterDraft, tick, beginProject, applyRunResult, buyMeta, metaCost };
});