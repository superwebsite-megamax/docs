"use client";
import { useState, useEffect, useRef } from 'react';

/* ============================================================
   TYPES & CONFIG
   ============================================================ */
interface UploadItem { title:string; filename:string; size:number; type:string; url:string; addedAt:string; category:string; }
interface MovieItem { id:number; title:string; overview:string; poster_path:string|null; backdrop_path:string|null; vote_average:number; release_date?:string; first_air_date?:string; media_type?:string; name?:string; genre_ids?:number[]; }
interface WatchSite { name:string; url:string; watchUrl:string; icon:string; color:string; desc:string; }

const TMDB_KEY='2dca580c2a14b55200e784d157207b4d';
const TMDB='https://api.themoviedb.org/3';
const IMG='https://image.tmdb.org/t/p/w500';

const homeCategories = [
  {id:'trending',title:'🔥 Trending Now',endpoint:'/trending/all/week'},
  {id:'action',title:'💥 Action & Adventure',endpoint:'/discover/movie',params:'&with_genres=28'},
  {id:'comedy',title:'😂 Comedy',endpoint:'/discover/movie',params:'&with_genres=35'},
  {id:'horror',title:'👻 Horror',endpoint:'/discover/movie',params:'&with_genres=27'},
  {id:'scifi',title:'🚀 Sci-Fi',endpoint:'/discover/movie',params:'&with_genres=878'},
  {id:'romance',title:'❤️ Romance',endpoint:'/discover/movie',params:'&with_genres=10749'},
  {id:'animation',title:'🎨 Animation',endpoint:'/discover/movie',params:'&with_genres=16'},
  {id:'thriller',title:'🎯 Thriller',endpoint:'/discover/movie',params:'&with_genres=53'},
  {id:'drama',title:'🎭 Drama',endpoint:'/discover/movie',params:'&with_genres=18'},
  {id:'wwe',title:'🤼 Hit Series',endpoint:'/discover/tv',params:'&with_genres=10759'},
  {id:'music',title:'🎵 Music',endpoint:'/discover/movie',params:'&with_genres=10402'},
];

const PARTNER_SITES = [
  {name:'Netflix',url:'https://www.netflix.com',icon:'🔴',color:'from-red-700 via-red-900 to-black',desc:'Premium streaming',s:(q:string)=>`https://www.netflix.com/search?q=${encodeURIComponent(q)}`},
  {name:'Amazon Prime',url:'https://www.primevideo.com',icon:'🔵',color:'from-blue-600 via-cyan-700 to-blue-900',desc:'Prime originals + more',s:(q:string)=>`https://www.primevideo.com/search?ref_=atv_dp_srch&q=${encodeURIComponent(q)}`},
  {name:'123Movies',url:'https://123moviesfree9.cloud',icon:'🎬',color:'from-red-600 to-red-900',desc:'Free HD streaming',s:(q:string)=>`https://123moviesfree9.cloud/?s=${encodeURIComponent(q)}`},
  {name:'FMovies',url:'https://ww4.fmovies.co',icon:'🍿',color:'from-blue-600 to-blue-900',desc:'Huge library',s:(q:string)=>`https://ww4.fmovies.co/search?query=${encodeURIComponent(q)}`},
  {name:'TFPDL',url:'https://tfpdl.se',icon:'📥',color:'from-cyan-600 to-cyan-900',desc:'Download hub',s:(q:string)=>`https://tfpdl.se/?s=${encodeURIComponent(q)}`},
  {name:'Thenkiri',url:'https://thenkiri.com',icon:'🎥',color:'from-purple-600 to-purple-900',desc:'Multi-quality downloads',s:(q:string)=>`https://thenkiri.com/?s=${encodeURIComponent(q)}`},
  {name:'FZMovie',url:'https://fzmovie.web.za',icon:'📱',color:'from-green-600 to-green-900',desc:'Mobile optimized',s:(q:string)=>`https://fzmovie.web.za/?s=${encodeURIComponent(q)}`},
  {name:'NaijaPrey',url:'https://www.naijaprey.tv',icon:'🇳🇬',color:'from-green-500 to-lime-600',desc:'Nollywood & African',s:(q:string)=>`https://www.naijaprey.tv/?s=${encodeURIComponent(q)}`},
  {name:'Read Comics Online',url:'https://readcomiconline.li',icon:'📖',color:'from-amber-600 to-amber-900',desc:'Free comics reader',s:(q:string)=>`https://readcomiconline.li/search/?query=${encodeURIComponent(q)}`},
  {name:'Wild Weathers YT',url:'https://youtube.com/@wildweathers7315',icon:'📺',color:'from-red-500 to-red-800',desc:'Entertainment',s:(q:string)=>`https://youtube.com/@wildweathers7315/search?query=${encodeURIComponent(q)}`},
  {name:'Dailymotion',url:'https://www.dailymotion.com/gb',icon:'▶️',color:'from-blue-400 to-blue-800',desc:'Video platform',s:(q:string)=>`https://www.dailymotion.com/gb/search/${encodeURIComponent(q)}`},
  {name:'Google Drive',url:'https://drive.google.com/drive/folders/17_nnaWAXiNM6VQOf-7XiwXkxZ5Mg70kf',icon:'☁️',color:'from-yellow-500 to-yellow-800',desc:'Cloud library',s:()=>'https://drive.google.com/drive/folders/17_nnaWAXiNM6VQOf-7XiwXkxZ5Mg70kf'},
];

const SHORT_DRAMAS = [
  {cat:'💰 CEO & Billionaire Romance',items:[
    {u:'https://www.youtube.com/shorts/aB1cD2eF3gH',t:"The CEO's Contract Wife is a Secret Billionaire! 💰😱"},
    {u:'https://www.youtube.com/shorts/iJ4kL5mN6oP',t:'Fired by my ex, now I\'m the CEO\'s new boss! 😤✨'},
    {u:'https://www.youtube.com/shorts/qR7sT8uV9wX',t:'He Pretended to be Poor to Test Me… 💸💔'},
    {u:'https://www.youtube.com/shorts/yZ0aB1cD2eF',t:'The Billionaire\'s Hidden Twins Revealed! 🍼🎭'},
    {u:'https://www.youtube.com/shorts/gH3iJ4kL5mN',t:'My Fake Fiancé is the Richest Man! 💍🏙️'},
    {u:'https://www.youtube.com/shorts/oP6qR7sT8uV',t:'Slapped by CEO\'s Mom, Then He Fired Her! 👋🔥'},
    {u:'https://www.youtube.com/shorts/wX9yZ0aB1cD',t:'She Cleaned His Shoes, Now She Owns the Company! 👠💼'},
    {u:'https://www.youtube.com/shorts/eF2gH3iJ4kL',t:'The Cold CEO Only Smiles for the Janitor… 🥶❤️'},
    {u:'https://www.youtube.com/shorts/mN5oP6qR7sT',t:'I Signed the Divorce Papers, Now He\'s Begging! 📜😭'},
    {u:'https://www.youtube.com/shorts/uV8wX9yZ0aB',t:'The CEO\'s Memory Reset: He Forgot His Fiancée! 🧠💔'},
  ]},
  {cat:'⚔️ Revenge & Betrayal',items:[
    {u:'https://www.youtube.com/shorts/cD1eF2gH3iJ',t:'Cheating Husband Caught on Our Wedding Day! 💒🚫'},
    {u:'https://www.youtube.com/shorts/kL4mN5oP6qR',t:'My Best Friend Stole My Inheritance! 🩸⚔️'},
    {u:'https://www.youtube.com/shorts/sT7uV8wX9yZ',t:'The Evil Stepmother Got What She Deserved! 🧹😈'},
    {u:'https://www.youtube.com/shorts/aB0cD1eF2gH',t:'Exposed: My Sister\'s Fake Pregnancy! 🤰🤥'},
    {u:'https://www.youtube.com/shorts/iJ3kL4mN5oP',t:'They Left Me to Die in the Snow… Now I\'m Back! ❄️💀'},
    {u:'https://www.youtube.com/shorts/qR6sT7uV8wX',t:'Destroying the Man Who Ruined My Family! 💣🔥'},
    {u:'https://www.youtube.com/shorts/yZ9aB0cD1eF',t:'The Ultimate Payback at the Reunion! 🎓👊'},
    {u:'https://www.youtube.com/shorts/gH2iJ3kL4mN',t:'I Faked My Death to Catch My Killer! ☠️🕵️‍♀️'},
    {u:'https://www.youtube.com/shorts/oP5qR6sT7uV',t:'Gold Digger Ex Regrets Leaving Me! 💎😂'},
    {u:'https://www.youtube.com/shorts/wX8yZ9aB0cD',t:'The Judge\'s Secret: My Father Was Framed! ⚖️🔍'},
  ]},
  {cat:'🐺 Werewolf & Fantasy',items:[
    {u:'https://www.youtube.com/shorts/eF1gH2iJ3kL',t:'Rejected by the Alpha, Chosen by the Lycan King! 🐺👑'},
    {u:'https://www.youtube.com/shorts/mN4oP5qR6sT',t:'The Omega\'s Secret Power Unleashed! 🌕⚡'},
    {u:'https://www.youtube.com/shorts/uV7wX8yZ9aB',t:'My Mate Marked Someone Else… 🔗💔'},
    {u:'https://www.youtube.com/shorts/cD0eF1gH2iJ',t:'The Alpha\'s Hidden Hybrid Mate! 🐺🦅'},
    {u:'https://www.youtube.com/shorts/kL3mN4oP5qR',t:'Pregnant by the Rogue Wolf! 🤰🐺'},
    {u:'https://www.youtube.com/shorts/sT6uV7wX8yZ',t:'The Luna Trial: Will She Survive? 🔥👑'},
    {u:'https://www.youtube.com/shorts/aB9cD0eF1gH',t:'The Alpha is Obsessed With Me! 🧍‍♀️❤️‍🔥'},
    {u:'https://www.youtube.com/shorts/iJ2kL3mN4oP',t:'The Witch\'s Curse Made the Alpha Fall in Love! 🧙‍♀️✨'},
    {u:'https://www.youtube.com/shorts/qR5sT6uV7wX',t:'Rejecting the Alpha to Save My Pack! 🛡️🐺'},
    {u:'https://www.youtube.com/shorts/yZ8aB9cD0eF',t:'Vampire King vs Alpha Wolf for My Heart! 🧛🩸'},
  ]},
  {cat:'👨‍👩‍👧 Family & Mother-in-Law',items:[
    {u:'https://www.youtube.com/shorts/gH1iJ2kL3mN',t:'Thrown Out by Mother-in-Law, Rescued by Billionaire! 🚪💸'},
    {u:'https://www.youtube.com/shorts/oP4qR5sT6uV',t:'Mother-in-Law Demanded a Male Heir! 👶💥'},
    {u:'https://www.youtube.com/shorts/wX7yZ8aB9cD',t:'The Servant is My Husband\'s First Wife! 🤯'},
    {u:'https://www.youtube.com/shorts/eF0gH1iJ2kL',t:'I Refused Dowry, Now They Are Broke! 🛑📉'},
    {u:'https://www.youtube.com/shorts/mN3oP4qR5sT',t:'My Husband\'s Family Starved Me… 😭🍽️'},
    {u:'https://www.youtube.com/shorts/uV6wX7yZ8aB',t:'The Bullied Daughter-in-Law is a World Doctor! 🥼👩‍⚕️'},
    {u:'https://www.youtube.com/shorts/cD9eF0gH1iJ',t:'Protecting My Unborn Child! 🤰🛡️'},
    {u:'https://www.youtube.com/shorts/kL2mN3oP4qR',t:'Switched at Birth: The Rich Family Raised a Fraud! 🍼🔄'},
    {u:'https://www.youtube.com/shorts/sT5uV6wX7yZ',t:'Cooking as a Maid? I\'m the True Heiress! 👩‍🍳💎'},
    {u:'https://www.youtube.com/shorts/aB8cD9eF0gH',t:'Divorced for Being Mute, Now a Top Lawyer! 🤫⚖️'},
  ]},
  {cat:'🌟 Hidden Identity & Glow-Up',items:[
    {u:'https://www.youtube.com/shorts/iJ1kL2mN3oP',t:'The Homeless Girl is Actually a Mafia Boss! 🏠🔫'},
    {u:'https://www.youtube.com/shorts/qR4sT5uV6wX',t:'From Trash Collector to Tech Billionaire! ♻️💻'},
    {u:'https://www.youtube.com/shorts/yZ7aB8cD9eF',t:'They Laughed at My Rags, Gasped at My Gown! 👗📸'},
    {u:'https://www.youtube.com/shorts/gH0iJ1kL2mN',t:'The "Dumb" Son-in-Law is a Martial Arts Master! 🥋🤫'},
    {u:'https://www.youtube.com/shorts/oP3qR4sT5uV',t:'I Hid My Wealth to Find True Love… 💔🔍'},
    {u:'https://www.youtube.com/shorts/wX6yZ7aB8cD',t:'The Nerdy Tutor is a Weapons Empire Heir! 🤓🔫'},
    {u:'https://www.youtube.com/shorts/eF9gH0iJ1kL',t:'Unmasking the Fake Heiress! 🎭🎂'},
    {u:'https://www.youtube.com/shorts/mN2oP3qR4sT',t:'Substitute Bride, But I\'m a Princess! 👸💍'},
    {u:'https://www.youtube.com/shorts/uV5wX6yZ7aB',t:'The Disabled Girl Stood Up for Her Family! ♿⚡'},
    {u:'https://www.youtube.com/shorts/cD8eF9gH0iJ',t:'He Lived in My Garage, Owns the Whole Street! 🏘️🤑'},
  ]},
  {cat:'🏫 High School & Teen',items:[
    {u:'https://www.youtube.com/shorts/kL1mN2oP3qR',t:'The School Nerd is a Secret Supermodel! 🤓📷'},
    {u:'https://www.youtube.com/shorts/sT4uV5wX6yZ',t:'Mean Girl Tripped Me, I Exposed Her Secret! 👠🤫'},
    {u:'https://www.youtube.com/shorts/aB7cD8eF9gH',t:'The Bad Boy Only Protects Me… Why? 🏍️❤️'},
    {u:'https://www.youtube.com/shorts/iJ0kL1mN2oP',t:'Prom Rejects Nerd, He Becomes Millionaire! 💃🚫'},
    {u:'https://www.youtube.com/shorts/qR3sT4uV5wX',t:'I Hacked the School System! 💻⛔'},
    {u:'https://www.youtube.com/shorts/yZ6aB7cD8eF',t:'The Transfer Student is a Fugitive! 🏫🚔'},
    {u:'https://www.youtube.com/shorts/gH9iJ0kL1mN',t:'Fake Dating the Most Hated Boy! 📝😏'},
    {u:'https://www.youtube.com/shorts/oP2qR3sT4uV',t:'Poisoned by Roommate, Woke Up with Powers! ☠️🔥'},
    {u:'https://www.youtube.com/shorts/wX5yZ6aB7cD',t:'The Cheerleader Who Can Read Minds! 📣🧠'},
    {u:'https://www.youtube.com/shorts/eF8gH9iJ0kL',t:'Kicked off Cheer Team, Started a Rival Squad! 🤸‍♀️💥'},
  ]},
  {cat:'🩺 Medical & Rescue',items:[
    {u:'https://www.youtube.com/shorts/mN1oP2qR3sT',t:'The Fake Doctor Saved the Billionaire! 🩺💸'},
    {u:'https://www.youtube.com/shorts/uV4wX5yZ6aB',t:'No One Believed the Intern… Until Patient Woke Up! 🛌😱'},
    {u:'https://www.youtube.com/shorts/cD7eF8gH9iJ',t:'Fired for Malpractice, Found the Real Cure! 💊🔬'},
    {u:'https://www.youtube.com/shorts/kL0mN1oP2qR',t:'The Surgeon\'s Hands Shook… Until He Saw Her! 🫀💔'},
    {u:'https://www.youtube.com/shorts/sT3uV4wX5yZ',t:'The Ambulance Driver is a Genius Neurosurgeon! 🚑🧠'},
    {u:'https://www.youtube.com/shorts/aB6cD7eF8gH',t:'Poisoned at Banquet, Waitress Knew Antidote! 🥂🧪'},
    {u:'https://www.youtube.com/shorts/iJ9kL0mN1oP',t:'Saving My Enemy\'s Life! 🚑🤝'},
    {u:'https://www.youtube.com/shorts/qR2sT3uV4wX',t:'The Blind Girl Who Did Open Heart Surgery! 🫀👁️'},
    {u:'https://www.youtube.com/shorts/yZ5aB6cD7eF',t:'They Took Credit for My Surgery, TV Exposed Them! 📺🎤'},
    {u:'https://www.youtube.com/shorts/gH8iJ9kL0mN',t:'The Patient\'s Dog Led Me to the Hidden Tumor! 🐶🏥'},
  ]},
  {cat:'⏳ Time Travel & Rebirth',items:[
    {u:'https://www.youtube.com/shorts/oP1qR2sT3uV',t:'Reborn 10 Minutes Before My Death! ⏳💀'},
    {u:'https://www.youtube.com/shorts/wX4yZ5aB6cD',t:'Sent Back to 1999 to Save My Dad! 🕰️👦'},
    {u:'https://www.youtube.com/shorts/eF7gH8iJ9kL',t:'I Relived the Worst Day to Change It! 🔄😱'},
    {u:'https://www.youtube.com/shorts/mN0oP1qR2sT',t:'The Mirror Sent Me to My Enemy\'s Past! 🪞✨'},
    {u:'https://www.youtube.com/shorts/uV3wX4yZ5aB',t:'Rewriting History: I Married the Villain! 📖😈'},
    {u:'https://www.youtube.com/shorts/cD6eF7gH8iJ',t:'I Warned About the Earthquake, They Laughed! 🌍😤'},
    {u:'https://www.youtube.com/shorts/kL9mN0oP1qR',t:'Reborn as Villainess, I Refuse to Die! 🎀🗡️'},
    {u:'https://www.youtube.com/shorts/sT2uV3wX4yZ',t:'Time Loop: Catching the Killer at the Gala! 🕰️🔍'},
    {u:'https://www.youtube.com/shorts/aB5cD6eF7gH',t:'I Went Back and Became My Own Grandma! 👵🤯'},
    {u:'https://www.youtube.com/shorts/iJ8kL9mN0oP',t:'Fixing My Past to Win Back True Love! ⏳❤️'},
  ]},
  {cat:'🔪 Thrillers & Plot Twists',items:[
    {u:'https://www.youtube.com/shorts/qR1sT2uV3wX',t:'The Kidnapper Was My Own Twin! 🎀🔫'},
    {u:'https://www.youtube.com/shorts/yZ4aB5cD6eF',t:'Trapped in an Escape Room With My Murderer! 🚪🔪'},
    {u:'https://www.youtube.com/shorts/gH7iJ8kL9mN',t:'The Voice on the Radio is Inside the House! 📻😱'},
    {u:'https://www.youtube.com/shorts/oP0qR1sT2uV',t:'My New Husband Has the Convict\'s Tattoo! 🚔😍'},
    {u:'https://www.youtube.com/shorts/wX3yZ4aB5cD',t:'The Blind Date Was an Undercover Cop! 👮‍♂️🍷'},
    {u:'https://www.youtube.com/shorts/eF6gH7iJ8kL',t:'Everyone Knows My Name… Except Me! 🏘️🤔'},
    {u:'https://www.youtube.com/shorts/mN9oP0qR1sT',t:'She Swapped Our Luggage With a Bomb! 💣🧳'},
    {u:'https://www.youtube.com/shorts/uV2wX3yZ4aB',t:'Taxi Driver Took Me to My Burial Site! 🚕☠️'},
    {u:'https://www.youtube.com/shorts/cD5eF6gH7iJ',t:'My Reflection Winked at Me! 🪞😵'},
    {u:'https://www.youtube.com/shorts/kL8mN9oP0qR',t:'The Therapist is Using My Secrets! 🛋️🤫'},
  ]},
  {cat:'🔫 Undercover & Action',items:[
    {u:'https://www.youtube.com/shorts/sT1uV2wX3yZ',t:'The Clumsy Secretary is an Elite Assassin! 📎🔫'},
    {u:'https://www.youtube.com/shorts/aB4cD5eF6gH',t:'Undercover in My Husband\'s Mafia Wedding! 🤵‍♂️☠️'},
    {u:'https://www.youtube.com/shorts/iJ7kL8mN9oP',t:'Pizza Guy Saved the Hostages! 🍕🦸‍♂️'},
    {u:'https://www.youtube.com/shorts/qR0sT1uV2wX',t:'Faked Amnesia to Hide from the Cartel! 🧠💀'},
    {u:'https://www.youtube.com/shorts/yZ3aB4cD5eF',t:'Bodyguard Took a Bullet for CEO\'s Daughter! 🛡️💥'},
    {u:'https://www.youtube.com/shorts/gH6iJ7kL8mN',t:'Infiltrating Fashion Show to Stop Heist! 💎🕵️‍♀️'},
    {u:'https://www.youtube.com/shorts/oP9qR0sT1uV',t:'The Cleaners Who Dispose Bodies… Until Tonight! 🧹🩸'},
    {u:'https://www.youtube.com/shorts/wX2yZ3aB4cD',t:'VA Job Turned Into Spy Mission! 💻🌍'},
    {u:'https://www.youtube.com/shorts/eF5gH6iJ7kL',t:'Runaway Bride Joined a Biker Gang! 🏍️👰‍♀️'},
    {u:'https://www.youtube.com/shorts/mN8oP9qR0sT',t:'Pretended to be a Beggar to Catch Mastermind! 🥷💸'},
  ]},
];

/* ============================================================
   MovieDetailModal
   ============================================================ */
function MovieDetailModal({ movie, onClose }: { movie: MovieItem; onClose: () => void }) {
  const [rec, setRec] = useState('');
  const [sites, setSites] = useState<WatchSite[]>([]);
  const [loading, setLoading] = useState(true);
  const title = movie.title || movie.name || '';
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/ai-search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,genreIds:movie.genre_ids||[],mediaType:movie.media_type==='tv'?'tv':'movie',action:'recommend'})});
        const d = await r.json(); setRec(d.recommendation||''); setSites(d.sites||[]);
      } catch { setRec(`🎬 Watch "${title}" on 123Movies or FMovies! 📥 Download from TFPDL.`); }
      setLoading(false);
    })();
  }, [title]);
  return (
    <div className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-2xl overflow-y-auto" onClick={onClose}>
      <div className="max-w-4xl mx-auto px-4 py-8" onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} className="fixed top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-48 h-72 md:w-56 md:h-80 rounded-2xl overflow-hidden bg-gray-800 flex-shrink-0 mx-auto shadow-2xl shadow-black/50">
            {movie.poster_path ? <img src={`${IMG}${movie.poster_path}`} alt={title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-5xl">🎬</div>}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{title}</h2>
            <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
              <span className="flex items-center gap-1 text-sm"><span className="text-yellow-400">⭐</span><b>{movie.vote_average?.toFixed(1)}</b></span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 text-sm">{movie.release_date?.split('-')[0]||movie.first_air_date?.split('-')[0]}</span>
              <span className="px-2 py-0.5 bg-netflix-red/20 text-netflix-red text-[10px] font-bold rounded">{movie.media_type==='tv'?'TV SHOW':'MOVIE'}</span>
            </div>
            {movie.overview && <p className="text-gray-400 text-sm leading-relaxed mb-4">{movie.overview}</p>}
            {loading ? <div className="glass-effect rounded-xl p-4"><div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-400">AI is finding where to watch...</span></div></div>
            : <div className="glass-effect rounded-xl p-4 border border-netflix-red/20"><div className="flex items-center gap-2 mb-2"><span>🤖</span><span className="text-[10px] font-bold text-netflix-red uppercase tracking-widest">AI Recommendation</span></div><p className="text-sm text-gray-200">{rec}</p></div>}
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-4">🎯 Where to Watch: <span className="gradient-text">&ldquo;{title}&rdquo;</span></h3>
        {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({length:8}).map((_,i)=><div key={i} className="h-24 bg-white/5 rounded-xl shimmer" />)}</div>
        : <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{sites.map(s=>(
            <a key={s.name} href={s.watchUrl} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-white/30 transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-netflix-red/10">
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-15 group-hover:opacity-25 transition-opacity`} />
              <div className="relative p-4"><span className="text-2xl">{s.icon}</span><h4 className="font-bold text-white text-sm mt-2 group-hover:text-yellow-300">{s.name}</h4><p className="text-[10px] text-gray-400">{s.desc}</p><span className="text-[11px] font-semibold text-netflix-red mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">Watch Now →</span></div>
            </a>
          ))}</div>}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="text-sm font-bold text-gray-400 mb-3">🔍 Search across ALL 12 partner sites:</h4>
          <div className="flex flex-wrap gap-2">{PARTNER_SITES.map(s=><a key={s.name} href={s.s(title)} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] text-gray-300 hover:text-white transition-all">{s.icon} {s.name}</a>)}</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SearchOverlay
   ============================================================ */
function SearchOverlay({ query, tmdbResults, uploadResults, onClose, onSelectMovie }: { query:string; tmdbResults:MovieItem[]; uploadResults:UploadItem[]; onClose:()=>void; onSelectMovie:(m:MovieItem)=>void }) {
  if (!query) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-black/92 backdrop-blur-2xl overflow-y-auto" onClick={onClose}>
      <div className="max-w-6xl mx-auto px-4 py-8" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">🤖 AI Search: &ldquo;{query}&rdquo; ({tmdbResults.length+uploadResults.length})</h2><button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
        <div className="glass-effect rounded-xl p-4 mb-6"><h4 className="text-sm font-bold text-white mb-3">🌐 Track &amp; find &ldquo;{query}&rdquo; across partner sites:</h4><div className="grid grid-cols-3 md:grid-cols-6 gap-2">{PARTNER_SITES.map(s=>(<a key={s.name} href={s.s(query)} target="_blank" rel="noopener noreferrer" className={`rounded-lg border border-white/10 hover:border-white/30 p-3 text-center transition-all hover:scale-105 bg-gradient-to-br ${s.color}`}><div className="absolute inset-0 bg-black/50" /><div className="relative"><span className="text-lg block mb-1">{s.icon}</span><p className="text-[9px] font-bold text-white">{s.name}</p></div></a>))}</div></div>
        {uploadResults.length>0&&<div className="mb-8"><h3 className="text-sm font-bold text-white mb-3">⚔️ Found in SHOWDOWN uploads</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{uploadResults.map((item,i)=>(<div key={i} className="bg-white/5 rounded-xl p-3 border border-green-600/30"><span className="px-2 py-0.5 bg-green-600 rounded text-[9px] font-bold">YOUR UPLOAD</span><h4 className="font-bold text-white text-sm mt-2 truncate">{item.title}</h4></div>))}</div></div>}
        {tmdbResults.length>0&&<div><h3 className="text-sm font-bold text-white mb-3">🎬 Movies &amp; TV (click → Where to Watch)</h3><div className="grid grid-cols-3 md:grid-cols-5 gap-3">{tmdbResults.map(item=>(<div key={item.id} onClick={()=>onSelectMovie(item)} className="bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-netflix-red/50 cursor-pointer transition-all hover:scale-[1.03]"><div className="aspect-[2/3] bg-gray-800">{item.poster_path?<img src={`${IMG}${item.poster_path}`} className="w-full h-full object-cover" loading="lazy"/>:<div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>}</div><div className="p-2"><h4 className="font-semibold text-[11px] text-white truncate">{item.title||item.name}</h4></div></div>))}</div></div>}
        {tmdbResults.length===0&&uploadResults.length===0&&<div className="text-center py-16"><span className="text-5xl block mb-4">🔍</span><p className="text-gray-400">No results. Search on partner sites above! ↑</p></div>}
      </div>
    </div>
  );
}

/* ============================================================
   AISearchBar
   ============================================================ */
function AISearchBar({ onSearch, uploads }: { onSearch:(d:any)=>void; uploads:UploadItem[] }) {
  const [q, setQ] = useState(''); const [loading, setLoading] = useState(false);
  const search = async (val: string) => { setQ(val); if (!val.trim()||val.length<2) return; setLoading(true);
    try { const [tr,ai]=await Promise.allSettled([fetch(`${TMDB}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(val)}`).then(r=>r.json()),fetch('/api/ai-search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:val,action:'search'})}).then(r=>r.json())]);
    onSearch({query:val,tmdbResults:tr.status==='fulfilled'?(tr.value.results||[]).slice(0,15):[],uploadResults:uploads.filter(u=>u.title.toLowerCase().includes(val.toLowerCase())),sites:ai.status==='fulfilled'?ai.value.sites||[]:[]}); } catch { onSearch({query:val,tmdbResults:[],uploadResults:[],sites:[]}); }
    setLoading(false); };
  return (
    <div className="relative flex-1 max-w-xl">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" value={q} onChange={e=>search(e.target.value)} placeholder="🤖 AI Search: Movies, SHOWDOWN, 12 Sites..."
          className="w-full pl-10 pr-10 py-3 bg-white/[0.07] border border-white/[0.12] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-netflix-red/60 focus:bg-white/[0.1] focus:shadow-glow-red transition-all duration-300 text-sm shadow-lg shadow-black/40" />
        {loading&&<div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />}
        {q&&!loading&&<button onClick={()=>{setQ('');onSearch({query:'',tmdbResults:[],uploadResults:[],sites:[]});}} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-lg">✕</button>}
      </div>
    </div>
  );
}

/* ============================================================
   NotificationBell
   ============================================================ */
function NotificationBell() {
  const [show, setShow] = useState(false);
  return (<div className="relative"><button onClick={()=>setShow(!show)} className="relative p-2 hover:bg-white/10 rounded-full"><svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg><span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-neon-blue rounded-full text-[10px] flex items-center justify-center font-bold text-black">3</span></button>
  {show&&<div className="absolute right-0 top-12 w-72 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50"><div className="p-3 border-b border-white/10 font-bold text-sm">🔔 Notifications</div>{[{t:'🎬 New movies added!',d:'2h'},{t:'⚔️ SHOWDOWN is live!',d:'1d'},{t:'🤖 AI Search upgraded!',d:'3d'}].map((n,i)=>(<div key={i} className="p-3 hover:bg-white/5 border-b border-white/5 cursor-pointer"><p className="text-sm text-gray-200">{n.t}</p><p className="text-[10px] text-gray-500">{n.d} ago</p></div>))}</div>}</div>);
}

/* ============================================================
   Navigation (UPDATED TABS)
   ============================================================ */
const navTabs = [
  {id:'home',label:'🏠 Home'},{id:'hitseries',label:'🔥 Hit Series'},{id:'hitmovies',label:'🎬 Hit Movies'},
  {id:'wrestling',label:'🤼 Watch Wrestling'},{id:'shorts',label:'📱 Shorts'},{id:'comics',label:'📖 Comics'},
  {id:'music',label:'🎵 Music'},{id:'downloads',label:'📥 Downloads'},{id:'showdown',label:'⚔️ SHOWDOWN'},
  {id:'about',label:'ℹ️ About'},
];

function Navigation({ activeTab, setActiveTab }: { activeTab:string; setActiveTab:(t:string)=>void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>50);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h);},[]);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled?'glass-effect-strong shadow-2xl shadow-black/60 border-b border-white/[0.06]':'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-netflix-red to-red-800 flex items-center justify-center shadow-glow-red animate-pulse-glow">
              <span className="text-white font-display text-sm tracking-wider">B</span>
            </div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight font-heading"><span className="text-netflix-red animate-text-glow">BEYOND</span> <span className="bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">ENTERTAINMENT</span></h1>
          </div>
          <div className="hidden xl:flex items-center gap-1">{navTabs.map(tab=><button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`relative px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-300 whitespace-nowrap ${activeTab===tab.id?'bg-gradient-to-r from-netflix-red to-red-700 text-white shadow-glow-red scale-105':'text-gray-400 hover:text-white hover:bg-white/[0.06]'}`}>{tab.label}</button>)}</div>
          <NotificationBell />
        </div>
        <div className="xl:hidden flex gap-2 overflow-x-auto pb-2 hide-scrollbar">{navTabs.map(tab=><button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${activeTab===tab.id?'bg-gradient-to-r from-netflix-red to-red-700 text-white shadow-glow-red':'bg-white/[0.06] text-gray-400 hover:text-white'}`}>{tab.label}</button>)}</div>
      </div>
    </nav>
  );
}

/* ============================================================
   HeroSection
   ============================================================ */
function HeroSection() {
  return (
    <section className="relative h-[70vh] md:h-[85vh] flex items-end pb-20 overflow-hidden bg-mesh">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050507] z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/95 via-[#050507]/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-netflix-red/[0.12] rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-neon-blue/[0.08] rounded-full blur-[100px] animate-float-slow" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-neon-purple/[0.06] rounded-full blur-[80px] animate-float" style={{animationDelay:'1.5s'}} />
      <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-gold/[0.04] rounded-full blur-[60px] animate-float-slow" style={{animationDelay:'3s'}} />
      <div className="relative z-20 max-w-7xl mx-auto px-4 w-full"><div className="max-w-2xl">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-netflix-red/[0.15] border border-netflix-red/30 rounded-full text-sm text-red-300 mb-6 animate-fade-in shadow-glow-red"><span className="w-2 h-2 bg-netflix-red rounded-full animate-pulse" /> NOW STREAMING</div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-5 leading-[0.95] tracking-tight animate-fade-in-up font-heading">
          <span className="gradient-text animate-text-glow">BEYOND</span><br />
          <span className="text-white">ENTERTAINMENT</span>
        </h1>
        <p className="text-base md:text-xl text-gray-300/90 mb-8 max-w-lg leading-relaxed animate-fade-in" style={{animationDelay:'200ms'}}>AI-powered search across <span className="text-white font-semibold">12+ partner sites</span>. Movies, Hit Series, Wrestling, Drama Shorts & more.</p>
        <div className="flex gap-4 animate-fade-in-up" style={{animationDelay:'400ms'}}>
          <button className="btn-glow px-10 py-4 bg-gradient-to-r from-netflix-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl shadow-netflix-red/25 flex items-center gap-3 text-base animate-pulse-glow">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>Start Watching
          </button>
          <button className="px-8 py-4 bg-white/[0.06] border border-white/[0.15] hover:bg-white/[0.12] hover:border-white/30 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 text-base">Explore</button>
        </div>
      </div></div>
    </section>
  );
}

/* ============================================================
   ShowdownBanner
   ============================================================ */
function ShowdownBanner({ onNav }: { onNav:()=>void }) {
  return (<section onClick={onNav} className="relative mx-4 md:mx-8 my-6 rounded-2xl overflow-hidden cursor-pointer group animate-breathe"><div className="absolute inset-0 bg-gradient-to-r from-black/90 via-red-950/80 to-black/90 z-10" /><div className="absolute inset-0 bg-[url('/showdown-wallpaper.png')] bg-cover bg-center" /><div className="absolute inset-0 bg-gradient-to-br from-red-900/60 via-black/40 to-purple-900/40" /><div className="absolute top-1/4 left-1/3 w-64 h-64 bg-netflix-red/30 rounded-full blur-3xl animate-pulse" /><div className="absolute bottom-0 right-1/4 w-48 h-48 bg-neon-purple/20 rounded-full blur-3xl animate-float" style={{animationDelay:'1s'}}/><div className="relative z-20 py-14 md:py-20 px-8 text-center"><h2 className="text-4xl md:text-6xl lg:text-8xl font-black mb-3 font-display tracking-wider"><span className="text-white">SHOW</span><span className="gradient-text animate-text-glow">DOWN</span></h2><p className="text-lg text-gray-200 mb-6 font-semibold">YOUR UPLOADS. YOUR RULES. YOUR SHOWDOWN.</p><button className="btn-glow px-10 py-4 bg-gradient-to-r from-netflix-red to-red-700 text-white font-black text-lg rounded-2xl shadow-2xl shadow-netflix-red/30 group-hover:scale-110 transition-all duration-300">⚔️ ENTER THE SHOWDOWN</button></div></section>);
}

/* ============================================================
   MovieCard + MovieRow
   ============================================================ */
function MovieCard({ movie, onSelect }: { movie:MovieItem; onSelect:(m:MovieItem)=>void }) {
  const t = movie.title||movie.name||'';
  return (<div className="flex-shrink-0 w-36 md:w-44 group cursor-pointer" onClick={()=>onSelect(movie)}><div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2.5 bg-surface-card shadow-card hover:shadow-card-hover transition-all duration-500 hover:scale-[1.06] card-premium">{movie.poster_path?<img src={`${IMG}${movie.poster_path}`} alt={t} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy"/>:<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-4xl">🎬</div>}<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-3"><span className="text-xs text-white font-bold bg-netflix-red/90 px-2 py-1 rounded-lg backdrop-blur-sm">🎯 Watch Now</span></div><div className="absolute top-2 right-2 bg-netflix-red text-white text-[9px] px-2 py-1 rounded-lg font-bold shadow-md">{movie.media_type==='tv'?'TV':'HD'}</div></div><h3 className="text-xs font-semibold text-gray-200 truncate group-hover:text-white transition-colors">{t}</h3><p className="text-[10px] text-gray-500">{movie.release_date?.split('-')[0]||movie.first_air_date?.split('-')[0]}</p></div>);
}
function MovieRow({ title, movies, onSelect }: { title:string; movies:MovieItem[]; onSelect:(m:MovieItem)=>void }) {
  const ref = useRef<HTMLDivElement>(null); if (!movies?.length) return null;
  return (<div className="mb-8 group/row"><h2 className="text-lg font-bold text-white mb-3 px-4 md:px-8 drop-shadow">{title}</h2><div className="relative"><button onClick={()=>ref.current?.scrollBy({left:-600,behavior:'smooth'})} className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black to-transparent z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button><div ref={ref} className="flex gap-3 overflow-x-auto hide-scrollbar px-4 md:px-8 pb-2">{movies.map(m=><MovieCard key={m.id} movie={m} onSelect={onSelect}/>)}</div><button onClick={()=>ref.current?.scrollBy({left:600,behavior:'smooth'})} className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black to-transparent z-10 flex items-center justify-center opacity-0 group-hover/row:opacity-100"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button></div></div>);
}

/* ============================================================
   Section Fetchers
   ============================================================ */
const fetcher = (u:string) => fetch(u).then(r=>r.json()).then(d=>d.results||[]).catch(()=>[]);
function HitSeriesSection({ onSelect }: { onSelect:(m:MovieItem)=>void }) {
  const [d,setD]=useState<MovieItem[]>([]); useEffect(()=>{fetcher(`${TMDB}/discover/tv?api_key=${TMDB_KEY}&with_genres=10759&sort_by=popularity.desc&page=1`).then(setD);},[]);
  return <div className="px-4 md:px-8 py-8"><h2 className="text-2xl md:text-3xl font-black mb-6 font-heading"><span className="gradient-text">🔥 Hit Series</span></h2><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{d.map(i=><div key={i.id} onClick={()=>onSelect(i)} className="card-premium bg-gradient-to-b from-white/[0.06] to-transparent rounded-2xl overflow-hidden cursor-pointer border border-white/[0.06] hover:border-white/20 transition-all duration-500 hover:shadow-card-hover"><div className="aspect-video bg-surface-card overflow-hidden">{i.backdrop_path?<img src={`${IMG}${i.backdrop_path}`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" loading="lazy"/>:<div className="w-full h-full flex items-center justify-center text-3xl">🔥</div>}</div><div className="p-3"><h3 className="font-semibold text-sm text-white truncate">{i.name||i.title}</h3><p className="text-xs text-gray-500 mt-1">⭐ {i.vote_average?.toFixed(1)}</p></div></div>)}</div></div>;
}
function HitMoviesSection({ onSelect }: { onSelect:(m:MovieItem)=>void }) {
  const [d,setD]=useState<MovieItem[]>([]); useEffect(()=>{fetcher(`${TMDB}/discover/movie?api_key=${TMDB_KEY}&with_genres=28&sort_by=popularity.desc&page=1`).then(setD);},[]);
  return <div className="px-4 md:px-8 py-8"><h2 className="text-2xl md:text-3xl font-black mb-6 font-heading"><span className="gradient-text-gold">🎬 Hit Movies</span></h2><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{d.map(i=><div key={i.id} onClick={()=>onSelect(i)} className="card-premium bg-gradient-to-b from-white/[0.06] to-transparent rounded-2xl overflow-hidden cursor-pointer border border-white/[0.06] hover:border-white/20 transition-all duration-500 hover:shadow-card-hover"><div className="aspect-[2/3] bg-surface-card overflow-hidden">{i.poster_path?<img src={`${IMG}${i.poster_path}`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" loading="lazy"/>:<div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>}</div><div className="p-3"><h3 className="font-semibold text-sm text-white truncate">{i.title}</h3><p className="text-xs text-gray-500 mt-1">⭐ {i.vote_average?.toFixed(1)}</p></div></div>)}</div></div>;
}
function MusicVideoSection({ onSelect }: { onSelect:(m:MovieItem)=>void }) {
  const [d,setD]=useState<MovieItem[]>([]); useEffect(()=>{fetcher(`${TMDB}/discover/movie?api_key=${TMDB_KEY}&with_genres=10402&sort_by=popularity.desc&page=1`).then(setD);},[]);
  return <div className="px-4 md:px-8 py-8"><h2 className="text-2xl md:text-3xl font-black mb-6 font-heading"><span className="gradient-text-purple">🎵 Music Videos</span></h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{d.map(i=><div key={i.id} onClick={()=>onSelect(i)} className="card-premium bg-gradient-to-b from-white/[0.06] to-transparent rounded-2xl overflow-hidden cursor-pointer border border-white/[0.06] hover:border-white/20 transition-all duration-500 hover:shadow-card-hover"><div className="aspect-video bg-surface-card overflow-hidden">{i.backdrop_path?<img src={`${IMG}${i.backdrop_path}`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" loading="lazy"/>:<div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>}</div><div className="p-3"><h3 className="font-semibold text-sm text-white truncate">{i.title}</h3></div></div>)}</div></div>;
}

/* ============================================================
   WatchWrestlingSection (NEW TAB)
   ============================================================ */
function WatchWrestlingSection() {
  const sources = [
    { name:'WWE on Dailymotion', url:'https://www.dailymotion.com/search/wwe/top-results', icon:'🤼', color:'from-red-600 to-red-900', desc:'Watch WWE Raw, SmackDown, PPVs and more — the best WWE content on Dailymotion, updated daily.' },
    { name:'All Wrestling on BollyRulezz', url:'https://bollyrulezz.in/page/278/', icon:'💪', color:'from-blue-600 to-blue-900', desc:'The ultimate source for ALL wrestling — WWE, AEW, NJPW, Impact, ROH and independent promotions. Full shows and highlights.' },
    { name:'WWE on YouTube', url:'https://youtube.com/@wildweathers7315', icon:'📺', color:'from-red-500 to-red-800', desc:'WWE highlights, matches, and wrestling entertainment content on YouTube.' },
    { name:'123Movies Wrestling', url:'https://123moviesfree9.cloud/?s=wwe', icon:'🎬', color:'from-gray-700 to-gray-900', desc:'Stream wrestling movies and documentaries free on 123Movies.' },
  ];
  return (
    <div className="px-4 md:px-8 py-8">
      <h2 className="text-2xl md:text-3xl font-black mb-2 font-heading"><span className="gradient-text">🤼 Watch Wrestling</span></h2>
      <p className="text-gray-400 mb-6 text-sm">WWE, AEW, NJPW & more — all in one place.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map(s=>(
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="card-premium group relative overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-500 hover:shadow-card-hover hover:scale-[1.02]">
            <div className={`h-1.5 bg-gradient-to-r ${s.color}`} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3"><span className="text-3xl">{s.icon}</span><h3 className="font-black text-xl text-white group-hover:text-neon-blue transition-colors">{s.name}</h3></div>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{s.desc}</p>
              <div className="flex items-center gap-2 text-netflix-red font-bold text-sm group-hover:gap-3 transition-all">Watch Now <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ShortsSection (REPLACED with 100 drama shorts)
   ============================================================ */
function ShortsSection() {
  const [activeCat, setActiveCat] = useState(SHORT_DRAMAS[0].cat);
  const [expanded, setExpanded] = useState(false);
  const categories = SHORT_DRAMAS.map(c => c.cat);
  const current = SHORT_DRAMAS.find(c => c.cat === activeCat)?.items || [];
  const featuredLinks = [
    { u: 'https://youtu.be/Fo1jgQhNj-A?si=SyHHqidq9oxw4f2x', t: '🎬 Featured Drama Video 1' },
    { u: 'https://youtu.be/Fo1jgQhNj-A?si=MSbWkOZpdcKws-JF', t: '🎬 Featured Drama Video 2' },
    { u: 'https://youtu.be/QVWWHCrxBzw?si=H-qym9myTefiVn9i', t: '🎬 Featured Drama Video 3' },
    { u: 'https://youtu.be/1CEq8_ftJb0?si=DzY5QBhT2Vk8mESw', t: '🎬 Featured Drama Video 4' },
    { u: 'https://www.dailymotion.com/category/content-movies', t: '🎥 Dailymotion Movies' },
  ];
  return (
    <div className="px-4 md:px-8 py-8">
      <h2 className="text-2xl md:text-3xl font-black mb-2 font-heading"><span className="gradient-text-blue">📱 Drama Shorts</span></h2>
      <p className="text-gray-400 mb-4 text-sm">100+ viral drama shorts — CEO romance, revenge, werewolf, family drama & more!</p>
      {/* Featured Links */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-4">
        {featuredLinks.map((f, i) => (
          <a key={i} href={f.u} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-netflix-red/30 to-red-900/30 border border-netflix-red/30 rounded-xl hover:from-netflix-red/50 hover:border-netflix-red/60 transition-all hover:scale-105 text-sm font-bold text-white">
            {f.t} →
          </a>
        ))}
      </div>
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeCat === cat ? 'bg-gradient-to-r from-netflix-red to-red-700 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>
      {/* Videos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {(expanded ? current : current.slice(0, 10)).map((item, idx) => (
          <a key={idx} href={item.u} target="_blank" rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-netflix-red/40 transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-black/30">
            <div className="aspect-[9/16] bg-gradient-to-br from-red-900/40 via-black to-purple-900/30 flex flex-col items-center justify-center p-3 relative">
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-netflix-red/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-netflix-red/30">
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                </div>
                <p className="text-[10px] text-white font-bold leading-tight line-clamp-4">{item.t}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      {current.length > 10 && (
        <div className="text-center mt-6">
          <button onClick={() => setExpanded(!expanded)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors">
            {expanded ? 'Show Less ↑' : `Show All ${current.length} Videos ↓`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ComicsSection
   ============================================================ */
function ComicsSection() {
  const comics = [{t:'Spider-Man: No Way Home',c:'from-red-600 to-blue-600',e:'🕷️'},{t:'Batman: Dark Knight',c:'from-gray-800 to-yellow-600',e:'🦇'},{t:'X-Men: Mutant Wars',c:'from-yellow-400 to-blue-800',e:'❌'},{t:'Avengers: Endgame',c:'from-blue-600 to-red-700',e:'🛡️'},{t:'Justice League',c:'from-green-500 to-purple-700',e:'⚖️'},{t:'Deadpool',c:'from-red-600 to-gray-900',e:'💀'}];
  return <div className="px-4 md:px-8 py-8"><h2 className="text-2xl font-black mb-6">📖 All Comics</h2>
    <a href="https://readcomiconline.li" target="_blank" rel="noopener noreferrer" className="block mb-4 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg text-sm font-bold text-white w-fit hover:scale-105 transition-transform shadow-lg shadow-amber-900/30">📖 Read Comics Free on ReadComicsOnline.li →</a>
    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">{comics.map(c=><a key={c.t} href={`https://readcomiconline.li/search/?query=${encodeURIComponent(c.t)}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer group"><div className={`aspect-[3/4] rounded-xl bg-gradient-to-br ${c.c} flex flex-col items-center justify-center p-4 group-hover:scale-105 transition-transform relative shadow-lg shadow-black/30`}><div className="absolute inset-0 bg-black/20" /><span className="text-5xl mb-3 relative z-10">{c.e}</span></div><h3 className="text-xs font-semibold text-gray-300 mt-2 truncate group-hover:text-white">{c.t}</h3></a>)}</div></div>;
}

/* ============================================================
   DownloadsSection (ALL 12 PARTNER SITES)
   ============================================================ */
function DownloadsSection() {
  const sites = [
    {name:'Netflix',url:'https://www.netflix.com',icon:'🔴',color:'from-red-700 via-red-900 to-black',desc:'The world\'s leading streaming service with thousands of movies and series.',tags:['Premium','4K','Originals']},
    {name:'Amazon Prime',url:'https://www.primevideo.com',icon:'🔵',color:'from-blue-600 via-cyan-700 to-blue-900',desc:'Prime Video originals plus thousands of movies and shows included with Prime.',tags:['Premium','Originals','Included']},
    {name:'123Movies',url:'https://123moviesfree9.cloud',icon:'🎬',color:'from-red-600 to-red-900',desc:'Stream latest movies & TV shows free in HD quality.',tags:['Streaming','Free','HD']},
    {name:'FMovies',url:'https://ww4.fmovies.co',icon:'🍿',color:'from-blue-600 to-blue-900',desc:'Huge free movie streaming library with no registration required.',tags:['Streaming','No Signup','Huge']},
    {name:'TFPDL',url:'https://tfpdl.se',icon:'📥',color:'from-cyan-600 to-cyan-900',desc:'Download movies, TV shows, games, and software. Fast speeds, no registration.',tags:['Download','Games','Software']},
    {name:'Thenkiri',url:'https://thenkiri.com',icon:'🎥',color:'from-purple-600 to-purple-900',desc:'Multi-quality movie and series downloads. Fast releases.',tags:['Download','Multi-Quality','Fast']},
    {name:'FZMovie',url:'https://fzmovie.web.za',icon:'📱',color:'from-green-600 to-green-900',desc:'Mobile-optimized movie downloads with small file sizes.',tags:['Mobile','MP4','3GP']},
    {name:'NaijaPrey',url:'https://www.naijaprey.tv',icon:'🇳🇬',color:'from-green-500 to-lime-500',desc:'Nollywood movies, Nigerian TV series, and African entertainment.',tags:['Nollywood','African','HD']},
    {name:'Read Comics Online',url:'https://readcomiconline.li',icon:'📖',color:'from-amber-600 to-amber-900',desc:'Read thousands of comics free — Marvel, DC, Image, manga.',tags:['Comics','Free','Marvel','DC']},
    {name:'Wild Weathers YouTube',url:'https://youtube.com/@wildweathers7315',icon:'📺',color:'from-red-500 to-red-800',desc:'Great YouTube entertainment channel. Subscribe for the latest!',tags:['YouTube','Videos','Free']},
    {name:'Dailymotion',url:'https://www.dailymotion.com/gb',icon:'▶️',color:'from-blue-400 to-blue-800',desc:'Video streaming platform with movies, shows, and user content.',tags:['Videos','Streaming','Global']},
    {name:'Google Drive Library',url:'https://drive.google.com/drive/folders/17_nnaWAXiNM6VQOf-7XiwXkxZ5Mg70kf',icon:'☁️',color:'from-yellow-500 to-yellow-800',desc:'Shared cloud media library with movies, shows, and more.',tags:['Cloud','Shared','Movies']},
  ];
  return (<div className="px-4 md:px-8 py-8"><h2 className="text-2xl md:text-3xl font-black mb-2 font-heading"><span className="gradient-text-gold">📥 Downloads & Streaming</span></h2><p className="text-gray-400 mb-6 text-sm">All 12 partner sites — stream, download, read, and watch.</p><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{sites.map(s=>(<a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="card-premium bg-gradient-to-b from-white/[0.06] to-transparent rounded-2xl overflow-hidden transition-all duration-500 group border border-white/[0.06] hover:border-white/20 hover:shadow-card-hover hover:scale-[1.01]"><div className={`h-1.5 bg-gradient-to-r ${s.color}`} /><div className="p-5"><div className="flex items-center gap-3 mb-3"><span className="text-3xl">{s.icon}</span><h3 className="font-black text-white text-lg group-hover:text-neon-blue transition-colors">{s.name}</h3></div><p className="text-sm text-gray-400 mb-4 leading-relaxed">{s.desc}</p><div className="flex flex-wrap gap-1.5 mb-3">{s.tags.map(t=><span key={t} className="px-2 py-0.5 bg-white/[0.08] rounded-full text-[10px] text-gray-300 font-medium">{t}</span>)}</div><span className="text-netflix-red font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Visit →</span></div></a>))}</div></div>);
}

/* ============================================================
   AboutSection
   ============================================================ */
function AboutSection() {
  return (<div className="px-4 md:px-8 py-12"><h2 className="text-2xl font-black mb-8">ℹ️ About</h2>
    <div className="max-w-2xl mx-auto mb-12"><div className="glass-effect rounded-2xl p-8 text-center border border-white/10 shadow-xl shadow-black/20"><div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-netflix-red to-purple-600 flex items-center justify-center text-4xl mb-4 shadow-xl">👤</div><h3 className="text-2xl font-black text-white mb-1">Godfrey Kangwa</h3><p className="text-gray-400 text-sm mb-4">Founder & Creator — BEYOND ENTERTAINMENT</p><div className="flex flex-wrap justify-center gap-4 mb-6"><span className="flex items-center gap-2 text-sm text-gray-300">📱 +260 767 017 716</span><span className="flex items-center gap-2 text-sm text-gray-300">📍 Zambia</span><span className="flex items-center gap-2 text-sm text-gray-300">📧 Godfreynkangwa@gmail.com</span></div><a href="mailto:Godfreynkangwa@gmail.com" className="px-4 py-2 bg-gradient-to-r from-netflix-red to-red-700 text-white rounded-lg text-sm font-bold">Contact Me</a></div></div>
    <div className="max-w-4xl mx-auto"><div className="bg-gradient-to-b from-white/5 to-transparent rounded-2xl p-8 border border-white/10"><h3 className="text-xl font-bold gradient-text mb-4">About BEYOND ENTERTAINMENT</h3><p className="text-gray-300 text-sm leading-relaxed mb-4">BEYOND ENTERTAINMENT is a premium AI-powered entertainment hub connecting you to 12+ partner sites including Netflix, Amazon Prime, 123Movies, FMovies, TFPDL, Thenkiri, FZMovie, NaijaPrey, ReadComicsOnline, YouTube, Dailymotion, and Google Drive. Our AI searches across ALL sites simultaneously and recommends where to watch every movie.</p>
    <h4 className="text-lg font-bold text-white mt-8 mb-4">Why Choose Us?</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[{i:'🤖',t:'AI-Powered Search',d:'Searches TMDB, your uploads, AND 12 partner sites. Click any movie → AI tells you where to watch.'},{i:'🎯',t:'One-Click Watch',d:'Click movie → AI recommendation → tap Watch Now → opens site with content pre-searched.'},{i:'⚔️',t:'SHOWDOWN Uploads',d:'Upload videos and music. Auto-appears with download buttons and audio player with skip controls.'},{i:'🌐',t:'12+ Partner Sites',d:'Netflix, Amazon Prime, 123Movies, FMovies, TFPDL, Thenkiri, FZMovie, NaijaPrey, ReadComicsOnline, YouTube, Dailymotion, Google Drive.'},{i:'📱',t:'100+ Drama Shorts',d:'CEO romance, revenge, werewolf, family drama — viral shorts organized by genre.'},{i:'🤼',t:'Watch Wrestling',d:'WWE on Dailymotion, All Wrestling on BollyRulezz — everything in one tab.'},{i:'🇿🇲',t:'Made in Zambia',d:'Proudly created in Zambia with ❤️. African entertainment for the world.'},{i:'⚡',t:'Lightning Fast',d:'Built with Next.js for instant loading with stunning premium UI.'}].map(item=><div key={item.t} className="bg-white/5 rounded-xl p-4 border border-white/5"><div className="flex items-center gap-3 mb-2"><span className="text-2xl">{item.i}</span><h5 className="font-bold text-white text-sm">{item.t}</h5></div><p className="text-xs text-gray-400 leading-relaxed">{item.d}</p></div>)}</div></div></div>);
}

/* ============================================================
   UploadedMediaSection (SHOWDOWN) — WITH AUDIO SKIP
   ============================================================ */
function UploadedMediaSection() {
  const [uploads,setUploads]=useState<UploadItem[]>([]); const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState<'all'|'movie'|'music'>('all'); const [sq,setSq]=useState('');
  const [currentAudio,setCurrentAudio]=useState<string|null>(null); const [isPlaying,setIsPlaying]=useState(false);
  const [currentTime,setCurrentTime]=useState(0); const [duration,setDuration]=useState(0);
  const audioRef=useRef<HTMLAudioElement>(null);
  useEffect(()=>{fetch('/api/uploads').then(r=>r.json()).then(d=>{setUploads([...(d.movies||[]),...(d.music||[])]);}).finally(()=>setLoading(false));},[]);
  const fmtSize=(b:number)=>b<1048576?`${(b/1024).toFixed(1)} KB`:b<1073741824?`${(b/1048576).toFixed(1)} MB`:`${(b/1073741824).toFixed(2)} GB`;
  const fmtTime=(s:number)=>{const m=Math.floor(s/60);return`${m}:${Math.floor(s%60).toString().padStart(2,'0')}`;};
  const dl=(u:string,f:string)=>{const a=document.createElement('a');a.href=u;a.download=f;document.body.appendChild(a);a.click();document.body.removeChild(a);};
  const play=(u:string)=>{if(currentAudio===u&&isPlaying){audioRef.current?.pause();setIsPlaying(false);}else{setCurrentAudio(u);setIsPlaying(true);setTimeout(()=>audioRef.current?.play(),100);}};
  const skip=(s:number)=>{if(audioRef.current){audioRef.current.currentTime=Math.max(0,Math.min(audioRef.current.currentTime+s,audioRef.current.duration||0));}};
  const filtered=uploads.filter(u=>(filter==='all'||u.category===filter)&&(!sq||u.title.toLowerCase().includes(sq.toLowerCase())));
  if(loading)return<div className="px-4 md:px-8 py-12 text-center"><div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mx-auto mb-4"/><p className="text-gray-400">Loading SHOWDOWN...</p></div>;
  return (<div className="px-4 md:px-8 py-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"><div><h2 className="text-2xl font-black">⚔️ SHOWDOWN</h2><p className="text-gray-400 text-sm mt-1">{uploads.length} items</p></div>
      <div className="flex items-center gap-3"><div className="relative"><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input type="text" value={sq} onChange={e=>setSq(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-netflix-red"/></div>
        <div className="flex bg-white/10 rounded-lg overflow-hidden">{(['all','movie','music'] as const).map(f=><button key={f} onClick={()=>setFilter(f)} className={`px-3 py-2 text-xs font-bold capitalize ${filter===f?'bg-netflix-red text-white':'text-gray-400 hover:text-white'}`}>{f==='all'?'📋 All':f==='movie'?'🎬 Videos':'🎵 Music'}</button>)}</div></div></div>
    {filtered.length===0?<div className="text-center py-16"><span className="text-6xl block mb-4">📂</span><h3 className="text-xl font-bold text-white mb-2">No uploads yet</h3></div>:(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map((item,idx)=>(<div key={idx} className="bg-gradient-to-b from-white/5 to-transparent rounded-xl overflow-hidden border border-white/5 hover:border-white/20 group">
        <div className="relative aspect-video bg-gray-900">{item.category==='movie'?<video src={item.url} className="w-full h-full object-contain" controls playsInline preload="metadata"/>:(
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/40 to-black"><span className="text-5xl mb-3 group-hover:scale-110 transition-transform">🎵</span><button onClick={()=>play(item.url)} className="w-12 h-12 bg-gradient-to-r from-netflix-red to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-netflix-red/30">{currentAudio===item.url&&isPlaying?<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>:<svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>}</button></div>}
          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${item.category==='movie'?'bg-blue-600':'bg-green-600'}`}>{item.category==='movie'?'🎬 VIDEO':'🎵 AUDIO'}</span></div>
        <div className="p-4"><h3 className="font-bold text-white text-sm truncate mb-2">{item.title}</h3><div className="flex items-center gap-3 text-[10px] text-gray-500 mb-3"><span>{fmtSize(item.size)}</span><span>•</span><span>{item.type.toUpperCase()}</span></div>
          <button onClick={()=>dl(item.url,item.filename)} className="w-full py-2 bg-white/10 hover:bg-netflix-red text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download</button></div></div>))}</div>)}
    <audio ref={audioRef} src={currentAudio||''} onEnded={()=>setIsPlaying(false)} onTimeUpdate={()=>{if(audioRef.current)setCurrentTime(audioRef.current.currentTime);}} onLoadedMetadata={()=>{if(audioRef.current)setDuration(audioRef.current.duration);}}/>
    {currentAudio&&isPlaying&&(<div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-2xl border-t border-white/10 px-4 py-3 z-50">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg">🎵</div>
        <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{uploads.find(u=>u.url===currentAudio)?.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-gray-500">{fmtTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-netflix-red to-red-500 rounded-full" style={{width:`${duration?((currentTime/duration)*100):0}%`}} /></div>
            <span className="text-[10px] text-gray-500">{fmtTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={()=>skip(-10)} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors">⏪</button>
          <button onClick={()=>play(currentAudio)} className="w-12 h-12 bg-gradient-to-r from-netflix-red to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-netflix-red/30"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg></button>
          <button onClick={()=>skip(10)} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors">⏩</button>
        </div>
      </div>
    </div>)}
  </div>);
}

/* ============================================================
   Footer
   ============================================================ */
function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] mt-16 bg-gradient-to-b from-[#050507] via-[#08080c] to-[#050507] bg-mesh">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* MovieBox Pro + Z.AI Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <a href="https://movieboxpro.io/" target="_blank" rel="noopener noreferrer" className="card-premium bg-gradient-to-r from-amber-600/10 via-amber-700/15 to-amber-900/10 border border-amber-500/20 rounded-2xl p-5 group">
            <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">🎬</div><div><h4 className="font-black text-white text-lg group-hover:text-amber-400 transition-colors">THE BOX OF MOVIES</h4><p className="text-xs text-gray-400 mt-0.5">movieboxpro.io — Your ultimate movie box</p></div></div>
          </a>
          <a href="https://z.ai/" target="_blank" rel="noopener noreferrer" className="card-premium bg-gradient-to-r from-neon-blue/10 via-blue-700/15 to-blue-900/10 border border-neon-blue/20 rounded-2xl p-5 group">
            <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue to-blue-700 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">🤖</div><div><h4 className="font-black text-white text-lg group-hover:text-neon-blue transition-colors">VISIT Z.AI</h4><p className="text-xs text-gray-400 mt-0.5">z.ai — Advanced AI Platform</p></div></div>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-netflix-red to-red-800 flex items-center justify-center shadow-glow-red"><span className="text-white font-display text-xs">B</span></div>
              <h3 className="text-base font-black font-heading"><span className="text-netflix-red">BEYOND</span> <span className="text-white">ENTERTAINMENT</span></h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">AI-powered hub connecting <span className="text-gray-300">12+ partner sites</span>. Built in Zambia with ❤️.</p>
          </div>
          <div><h4 className="text-sm font-bold text-white mb-3">Partner Sites</h4><ul className="space-y-2">{PARTNER_SITES.slice(0,6).map(s=><li key={s.name}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white transition-colors duration-200 flex items-center gap-1.5"><span className="text-sm">{s.icon}</span> {s.name}</a></li>)}</ul></div>
          <div><h4 className="text-sm font-bold text-white mb-3">More Sites</h4><ul className="space-y-2">{PARTNER_SITES.slice(6).map(s=><li key={s.name}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white transition-colors duration-200 flex items-center gap-1.5"><span className="text-sm">{s.icon}</span> {s.name}</a></li>)}</ul></div>
          <div><h4 className="text-sm font-bold text-white mb-3">Connect</h4><ul className="space-y-2"><li className="text-xs text-gray-500">📧 Godfreynkangwa@gmail.com</li><li className="text-xs text-gray-500">📱 +260 767 017 716</li><li className="text-xs text-gray-500">📍 Zambia 🇿🇲</li></ul></div>
        </div>
        <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-4"><p className="text-xs text-gray-600">&copy; 2025 BEYOND ENTERTAINMENT v3.0 — Premium Edition</p>
          <a href="https://github.com/superwebsite-megamax/Beyond-Entertainment" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   MainContent
   ============================================================ */
function MainContent({ activeTab, uploads, onNavigateToShowdown, onSelectMovie }: { activeTab:string; uploads:UploadItem[]; onNavigateToShowdown:()=>void; onSelectMovie:(m:MovieItem)=>void }) {
  return (<div className="pt-20 min-h-screen">
    {activeTab==='home'&&<HomePageContent uploads={uploads} onNavigateToShowdown={onNavigateToShowdown} onSelectMovie={onSelectMovie}/>}
    {activeTab==='hitseries'&&<HitSeriesSection onSelect={onSelectMovie}/>}
    {activeTab==='hitmovies'&&<HitMoviesSection onSelect={onSelectMovie}/>}
    {activeTab==='wrestling'&&<WatchWrestlingSection/>}
    {activeTab==='shorts'&&<ShortsSection/>}
    {activeTab==='comics'&&<ComicsSection/>}
    {activeTab==='music'&&<MusicVideoSection onSelect={onSelectMovie}/>}
    {activeTab==='downloads'&&<DownloadsSection/>}
    {activeTab==='showdown'&&<UploadedMediaSection/>}
    {activeTab==='about'&&<AboutSection/>}
    <Footer/>
  </div>);
}

/* ============================================================
   HomePageContent
   ============================================================ */
function HomePageContent({ uploads, onNavigateToShowdown, onSelectMovie }: { uploads:UploadItem[]; onNavigateToShowdown:()=>void; onSelectMovie:(m:MovieItem)=>void }) {
  const [catData,setCatData]=useState<Record<string,MovieItem[]>>({}); const [loading,setLoading]=useState(true);
  useEffect(()=>{const f=async()=>{const d:Record<string,MovieItem[]>={};for(const c of homeCategories){try{const r=await fetch(`${TMDB}${c.endpoint}?api_key=${TMDB_KEY}${c.params||''}&page=1`);const j=await r.json();d[c.id]=j.results||[];}catch{d[c.id]=[];}}setCatData(d);setLoading(false);};f();},[]);
  const vids=uploads.filter(u=>u.category==='movie');
  return (<>
    <HeroSection/>
    <ShowdownBanner onNav={onNavigateToShowdown}/>
    {/* Partner Sites Quick Bar */}
    <div className="px-4 md:px-8 py-4"><div className="flex items-center gap-2 mb-2"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">🌐 Partner Sites ({PARTNER_SITES.length})</span></div>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">{PARTNER_SITES.map(s=>(<a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className={`flex-shrink-0 px-3 py-2 bg-gradient-to-r ${s.color} rounded-lg flex items-center gap-2 hover:scale-105 transition-transform border border-white/10 shadow-md shadow-black/20`}><span>{s.icon}</span><span className="text-[11px] font-bold text-white whitespace-nowrap">{s.name}</span></a>))}</div></div>
    {vids.length>0&&<section className="px-4 md:px-8 py-6"><h2 className="text-lg font-bold text-white mb-3">🎥 Your Uploaded Videos</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{vids.map((item,idx)=><div key={idx} className="bg-gradient-to-b from-white/5 to-transparent rounded-xl overflow-hidden border border-white/10"><div className="aspect-video bg-black"><video src={item.url} className="w-full h-full object-contain" controls playsInline preload="metadata"/></div><div className="p-3"><h3 className="font-semibold text-sm text-white truncate">{item.title}</h3><p className="text-xs text-gray-500 mt-1">{(item.size/(1024*1024)).toFixed(1)} MB</p></div></div>)}</div></section>}
    {loading?<div className="px-4 md:px-8 py-8"><div className="flex gap-4 overflow-hidden">{Array.from({length:6}).map((_,i)=><div key={i} className="flex-shrink-0 w-44"><div className="aspect-[2/3] bg-gray-800 rounded-xl shimmer"/></div>)}</div></div>:homeCategories.map(c=><MovieRow key={c.id} title={c.title} movies={catData[c.id]||[]} onSelect={onSelectMovie}/>)}
  </>);
}

/* ============================================================
   MAIN PAGE EXPORT
   ============================================================ */
export default function Page() {
  const [activeTab,setActiveTab]=useState('home');
  const [uploads,setUploads]=useState<UploadItem[]>([]);
  const [selectedMovie,setSelectedMovie]=useState<MovieItem|null>(null);
  const [searchData,setSearchData]=useState<{query:string;tmdbResults:MovieItem[];uploadResults:UploadItem[];sites:any[]}|null>(null);
  useEffect(()=>{fetch('/api/uploads').then(r=>r.json()).then(d=>setUploads([...(d.movies||[]),...(d.music||[])])).catch(()=>{});},[]);
  const navToShowdown=()=>{setActiveTab('showdown');window.scrollTo({top:0,behavior:'smooth'});};
  return (<main className="min-h-screen bg-[#050507] bg-mesh">
    <div className="fixed top-14 left-0 right-0 z-40 px-4 pt-3 pb-6 bg-gradient-to-b from-black via-black/95 to-transparent"><AISearchBar onSearch={setSearchData} uploads={uploads}/></div>
    <Navigation activeTab={activeTab} setActiveTab={setActiveTab}/>
    {searchData&&searchData.query&&<SearchOverlay query={searchData.query} tmdbResults={searchData.tmdbResults} uploadResults={searchData.uploadResults} onClose={()=>setSearchData(null)} onSelectMovie={m=>{setSelectedMovie(m);setSearchData(null);}}/>}
    {selectedMovie&&<MovieDetailModal movie={selectedMovie} onClose={()=>setSelectedMovie(null)}/>}
    <MainContent activeTab={activeTab} uploads={uploads} onNavigateToShowdown={navToShowdown} onSelectMovie={setSelectedMovie}/>
  </main>);
}
