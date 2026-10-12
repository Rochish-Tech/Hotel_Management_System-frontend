// Dependency-free development server: Node.js 18+.
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const base=path.resolve(__dirname);
const port=Number(process.env.FRONTEND_PORT||5500);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{
 try {
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const filename=pathname==='/'?'/index.html':pathname;
  const target=path.resolve(base,'.'+filename);
  if(!target.startsWith(base+path.sep)){res.writeHead(403);res.end();return;}
  const file=await fs.readFile(target);
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:file);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end(e.code==='ENOENT'?'Not found':'Server error');}
}).listen(port,'127.0.0.1',()=>console.log('Frontend running: http://localhost:'+port));
