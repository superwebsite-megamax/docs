const fs=require('fs'),path=require('path'),cwd=process.cwd(),rm=[];
['src/lib','src/pages','src/hooks','prisma','public/icons'].forEach(d=>{const p=path.join(cwd,d);if(fs.existsSync(p)){fs.rmSync(p,{recursive:true,force:true});rm.push(d+'/');}});
const ui=path.join(cwd,'src/components/ui');if(fs.existsSync(ui)){fs.readdirSync(ui).forEach(f=>{if(f==='newsletter-signup.tsx')return;const p=path.join(ui,f);if(fs.statSync(p).isDirectory())fs.rmSync(p,{recursive:true,force:true});else fs.unlinkSync(p);rm.push('ui/'+f);});}
['src/app/manifest.json','next-env.d.ts','bun.lockb'].forEach(f=>{const p=path.join(cwd,f);if(fs.existsSync(p)){fs.unlinkSync(p);rm.push(f);}});
if(rm.length)console.log('Removed:',rm.join(', '));else console.log('Clean');
