import { Settings } from '../core/types.js';
/** Original, low-gain synthetic cues; never tied to authoritative simulation. */
export class AudioBus {
 private context:AudioContext|null=null;
 private voices=0;
 private last=0;
 private bed:OscillatorNode|null=null;
 private bedGain:GainNode|null=null;
 async unlock():Promise<void>{
  try{this.context??=new AudioContext();if(this.context.state==='suspended')await this.context.resume();}catch{ /* Sound is optional. */ }
 }
 play(kind:'code'|'compile'|'crit'|'choose'|'clear'|'damage',settings:Settings):void{
  const c=this.context;if(!c||c.state!=='running'||this.voices>=6)return;
  const volume=kind==='choose'?settings.interface:settings.effects;if(!volume)return;
  if(kind==='code'&&c.currentTime-this.last<.08)return;
  this.last=c.currentTime;
  const spec={code:[380,.025],compile:[110,.18],crit:[660,.3],choose:[440,.12],clear:[880,.4],damage:[70,.17]}[kind];
  const o=c.createOscillator(),g=c.createGain();o.type=kind==='damage'?'triangle':'sine';o.frequency.value=spec[0];
  o.frequency.exponentialRampToValueAtTime(Math.max(40,spec[0]*(kind==='clear'?1.5:.7)),c.currentTime+spec[1]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(volume*.28,c.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+spec[1]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+spec[1]+.01);this.voices++;
  o.onended=()=>{this.voices--;o.disconnect();g.disconnect();};
 }
 ambient(settings:Settings,active:boolean):void{
  const c=this.context;if(!c||c.state!=='running')return;
  if(!this.bed){this.bed=c.createOscillator();this.bedGain=c.createGain();this.bed.frequency.value=82.4;this.bed.type='sine';this.bed.connect(this.bedGain);this.bedGain.connect(c.destination);this.bedGain.gain.value=0;this.bed.start();}
  this.bedGain!.gain.setTargetAtTime(active?settings.ambient*.08:0,c.currentTime,.25);
 }
}
