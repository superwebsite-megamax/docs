import { NextResponse } from 'next/server';
const SITES = [
  {name:'123Movies',url:'https://123moviesfree9.cloud',icon:'🎬',color:'from-red-600 to-red-800',desc:'Free HD streaming',s:(q:string)=>`https://123moviesfree9.cloud/?s=${encodeURIComponent(q)}`},
  {name:'FMovies',url:'https://ww4.fmovies.co',icon:'🍿',color:'from-blue-600 to-blue-800',desc:'Huge library',s:(q:string)=>`https://ww4.fmovies.co/search?query=${encodeURIComponent(q)}`},
  {name:'Netflix',url:'https://www.netflix.com',icon:'🔴',color:'from-red-700 to-black',desc:'Premium streaming',s:(q:string)=>`https://www.netflix.com/search?q=${encodeURIComponent(q)}`},
  {name:'Amazon Prime',url:'https://www.primevideo.com',icon:'🔵',color:'from-blue-500 to-cyan-600',desc:'Prime originals',s:(q:string)=>`https://www.primevideo.com/search?ref_=atv_dp_srch&q=${encodeURIComponent(q)}`},
  {name:'TFPDL',url:'https://tfpdl.se',icon:'📥',color:'from-cyan-600 to-cyan-800',desc:'Download hub',s:(q:string)=>`https://tfpdl.se/?s=${encodeURIComponent(q)}`},
  {name:'Thenkiri',url:'https://thenkiri.com',icon:'🎥',color:'from-purple-600 to-purple-800',desc:'Multi-quality',s:(q:string)=>`https://thenkiri.com/?s=${encodeURIComponent(q)}`},
  {name:'FZMovie',url:'https://fzmovie.web.za',icon:'📱',color:'from-green-600 to-green-800',desc:'Mobile optimized',s:(q:string)=>`https://fzmovie.web.za/?s=${encodeURIComponent(q)}`},
  {name:'NaijaPrey',url:'https://www.naijaprey.tv',icon:'🇳🇬',color:'from-green-500 to-lime-600',desc:'Nollywood',s:(q:string)=>`https://www.naijaprey.tv/?s=${encodeURIComponent(q)}`},
  {name:'Read Comics',url:'https://readcomiconline.li',icon:'📖',color:'from-amber-600 to-amber-800',desc:'Free comics',s:(q:string)=>`https://readcomiconline.li/search/?query=${encodeURIComponent(q)}`},
  {name:'Wild Weathers YT',url:'https://youtube.com/@wildweathers7315',icon:'📺',color:'from-red-500 to-red-700',desc:'Entertainment',s:(q:string)=>`https://youtube.com/@wildweathers7315/search?query=${encodeURIComponent(q)}`},
  {name:'Dailymotion',url:'https://www.dailymotion.com/gb',icon:'▶️',color:'from-blue-500 to-blue-700',desc:'Video platform',s:(q:string)=>`https://www.dailymotion.com/gb/search/${encodeURIComponent(q)}`},
  {name:'Google Drive',url:'https://drive.google.com/drive/folders/17_nnaWAXiNM6VQOf-7XiwXkxZ5Mg70kf',icon:'☁️',color:'from-yellow-500 to-yellow-700',desc:'Cloud library',s:()=>'https://drive.google.com/drive/folders/17_nnaWAXiNM6VQOf-7XiwXkxZ5Mg70kf'},
];
function rec(title:string, genreIds:number[]=[], mt:string='movie'){
  const isTV=mt==='tv'||genreIds.includes(10759),isAnime=genreIds.includes(16),isHorror=genreIds.includes(27),isDrama=genreIds.includes(18),isMusic=genreIds.includes(10402);
  const r=[SITES[0],SITES[1],SITES[2],SITES[3],SITES[4],SITES[5]];
  if(isDrama)r.push(SITES[7]); if(isAnime)r.push(SITES[8]); if(isMusic)r.push(SITES[9],SITES[10]); if(isTV)r.push(SITES[1]);
  r.push(SITES[11]);
  return r.filter((v,i,a)=>a.findIndex(x=>x.name===v.name)===i).slice(0,8).map(s=>({...s,watchUrl:s.s(title)}));
}
export async function POST(req:Request){
  try{
    const{title,genreIds,mediaType,action}=await req.json();
    if(action==='recommend'){
      const sites=rec(title,genreIds||[],mediaType||'movie');
      let ai='';
      try{
        const ZAI=(await import('z-ai-web-dev-sdk')).default;const zai=await ZAI.create();
        const c=await zai.chat.completions.create({messages:[{role:'system',content:`You are an AI entertainment assistant. Recommend from: 123Movies, FMovies, Netflix, Amazon Prime, TFPDL, Thenkiri, FZMovie, NaijaPrey, ReadComicsOnline, YouTube @wildweathers7315, Dailymotion, Google Drive. Be brief (2 sentences), enthusiastic, name best 2-3 sites.`},{role:'user',content:`Where to watch "${title}"? (${mediaType==='tv'?'TV Show':'Movie'})`}],max_tokens:150,temperature:0.7});
        ai=c.choices?.[0]?.message?.content||'';
      }catch{ai=`🎬 Watch "${title}" on 123Movies or FMovies! 📥 Download from TFPDL. ☁️ Check Google Drive!`;}
      return NextResponse.json({sites,recommendation:ai});
    }
    if(action==='search'){const all=SITES.map(s=>({...s,watchUrl:s.s(title)}));return NextResponse.json({sites:all});}
    return NextResponse.json({error:'Invalid'},{status:400});
  }catch{const f=SITES.slice(0,5).map(s=>({...s,watchUrl:s.s('')}));return NextResponse.json({sites:f,recommendation:'🎬 Check 123Movies or TFPDL!'});}
}
