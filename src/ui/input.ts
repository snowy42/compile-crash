/** Input device state is intentionally separate from the serializable simulation. */
export class ClockInput {
 readonly held=new Set<string>();
 pointer=false;
 toggle=false;
 private blocked=false;
 private gateUntil=0;
 private gateArmed=true;
 lastStep=-Infinity;
 gate(now:number,delay:number):void {this.toggle=false;this.blocked=true;this.gateUntil=now+delay;this.gateArmed=false;}
 release(key:string):void {this.held.delete(key);if(this.held.size===0&&!this.pointer)this.blocked=false;}
 armPointer():void {if(this.held.size===0)this.blocked=false;this.pointer=true;}
 releasePointer():void {this.pointer=false;if(this.held.size===0)this.blocked=false;}
 ready(now:number):boolean {
  if(!this.gateArmed&&now>=this.gateUntil&&this.held.size===0&&!this.pointer)this.gateArmed=true;
  return this.gateArmed;
 }
 stop(clear=false):void {this.toggle=false;this.blocked=true;if(clear){this.held.clear();this.pointer=false;this.blocked=false;}}
 armKey(key:string):void {if(this.held.size===0&&!this.pointer)this.blocked=false;this.held.add(key);}
 canRun(mode:string):boolean {return mode==='toggle'?this.toggle:mode==='hold'&&!this.blocked&&(this.held.size>0||this.pointer);}
 takeTick(now:number):boolean {if(now-this.lastStep<125)return false;this.lastStep=now;return true;}
}
