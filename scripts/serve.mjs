import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
export function serve(root='dist'){
 const base=resolve(root),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.map':'application/json'};
 const server=http.createServer(async(req,res)=>{
  try{
   if(!['GET','HEAD'].includes(req.method??'')){res.writeHead(405);return res.end('Method not allowed');}
   const url=new URL(req.url??'/','http://localhost:5173');
   const decoded=decodeURIComponent(url.pathname);const file=resolve(base,'.'+(decoded==='/'?'/index.html':decoded));
   if(file!==base&&!file.startsWith(base+sep)){res.writeHead(403);return res.end('Forbidden');}
   const info=await stat(file);if(!info.isFile())throw new Error('Not a file');
   const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});
   res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found. Run npm run build first.');}
 });
 server.on('error',error=>{if(error.code==='EADDRINUSE')console.error('Port 5173 is already in use. Stop the other dev/preview server (Ctrl+C). The port is fixed to keep your save on the same origin.');else console.error(error);process.exitCode=1;});
 server.listen(5173,'localhost',()=>console.log('\n COMPILE / CRASH\n http://localhost:5173\n Ctrl+C to stop. Saves stay in this browser profile.\n'));
 return server;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename))serve();
