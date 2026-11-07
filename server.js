// npm i ws && node server.js
const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const MIME={'.js':'text/javascript','.html':'text/html; charset=utf-8','.glb':'model/gltf-binary','.mp3':'audio/mpeg'};
const ok=f=>f==='index.html'||f==='three.min.js'||/^(models\/[\w.-]+\.glb|music\/[\w.-]+\.mp3)$/.test(f);
const srv=http.createServer((q,r)=>{
  const f=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';
  if(!ok(f)){r.writeHead(404);return r.end('not found')}
  fs.readFile(path.join(__dirname,f),(e,d)=>{
    if(e){r.writeHead(404);return r.end('not found')}
    r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(d)})});
const wss=new WebSocketServer({server:srv});let n=0;
wss.on('connection',ws=>{
  ws.id=++n;ws.send(JSON.stringify({t:'id',id:ws.id}));
  ws.on('message',m=>{
    let o;try{o=JSON.parse(m)}catch{return}
    o.id=ws.id;const s=JSON.stringify(o);
    wss.clients.forEach(c=>{
      if(c.readyState!==1)return;
      if(o.t==='hit'){if(c.id===o.to)c.send(s)}else if(c!==ws)c.send(s)})});
  ws.on('close',()=>{const s=JSON.stringify({t:'left',id:ws.id});wss.clients.forEach(c=>c.readyState===1&&c.send(s))})});
const PORT=process.env.PORT||3000;srv.listen(PORT,'0.0.0.0',()=>console.log('Игра на порту '+PORT));
