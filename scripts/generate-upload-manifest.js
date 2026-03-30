const fs = require('fs'), path = require('path');
function scan(dir, cat) {
  const m = []; if (!fs.existsSync(dir)) return m;
  fs.readdirSync(dir).filter(f => { const e=f.toLowerCase(); return cat==='movie' ? e.endsWith('.mp4')||e.endsWith('.webm')||e.endsWith('.mkv') : e.endsWith('.mp3')||e.endsWith('.wav')||e.endsWith('.ogg')||e.endsWith('.m4a'); }).forEach(f => {
    if (f==='manifest.json') return; const s=fs.statSync(path.join(dir,f)); const e=path.extname(f).slice(1).toLowerCase();
    m.push({title:f.replace(/\.[^.]+$/,'').replace(/_/g,' ').replace(/\[.*?\]/g,'').replace(/\(.*?\)/g,'').replace(/\d{3,4}p/g,'').replace(/\s+/g,' ').trim(),filename:f,size:s.size,type:e,url:`/uploads/${cat==='movie'?'movies':'music'}/${encodeURIComponent(f)}`,addedAt:s.mtime.toISOString()});
  }); return m.sort((a,b)=>new Date(b.addedAt)-new Date(a.addedAt));
}
const md=path.join(process.cwd(),'public','uploads','movies'),mu=path.join(process.cwd(),'public','uploads','music');
if(!fs.existsSync(md))fs.mkdirSync(md,{recursive:true}); if(!fs.existsSync(mu))fs.mkdirSync(mu,{recursive:true});
const mm=scan(md,'movie'),ms=scan(mu,'music');
fs.writeFileSync(path.join(md,'manifest.json'),JSON.stringify(mm,null,2));
fs.writeFileSync(path.join(mu,'manifest.json'),JSON.stringify(ms,null,2));
console.log(`Manifest: ${mm.length} movies, ${ms.length} music`);
