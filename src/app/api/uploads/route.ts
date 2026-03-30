import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
export async function GET() {
  try {
    const mp = path.join(process.cwd(),'public','uploads','movies','manifest.json');
    const mu = path.join(process.cwd(),'public','uploads','music','manifest.json');
    let movies: any[] = [], music: any[] = [];
    if (fs.existsSync(mp)) movies = JSON.parse(fs.readFileSync(mp,'utf-8'));
    if (fs.existsSync(mu)) music = JSON.parse(fs.readFileSync(mu,'utf-8'));
    return NextResponse.json({ movies: movies.map((m:any)=>({...m,category:'movie'})), music: music.map((m:any)=>({...m,category:'music'})) });
  } catch { return NextResponse.json({movies:[],music:[]}); }
}
