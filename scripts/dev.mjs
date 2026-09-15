import './stitch.mjs';
import { spawn } from 'node:child_process';
import { watch, cp } from 'node:fs/promises';
import { serve } from './serve.mjs';
const compiler=process.execPath;
const tsc='node_modules/typescript/bin/tsc';
const first=spawn(compiler,[tsc],{stdio:'inherit'});
first.on('error',()=>{console.error('Run npm ci first.');process.exit(1);});
first.on('exit',async code=>{
 if(code){process.exitCode=code;return;}
 await cp('public','dist',{recursive:true});serve();
 const watcher=spawn(compiler,[tsc,'--watch','--preserveWatchOutput'],{stdio:'inherit'});
 console.log('Source changes compile automatically. Refresh the browser to load them; saved games resume paused.');
 process.on('SIGINT',()=>{watcher.kill();process.exit();});process.on('SIGTERM',()=>{watcher.kill();process.exit();});
 try{for await(const event of watch('public',{recursive:true})){if(event.filename)await cp('public','dist',{recursive:true});}}catch(error){if(error.code!=='ABORT_ERR')console.error(error);}
});
