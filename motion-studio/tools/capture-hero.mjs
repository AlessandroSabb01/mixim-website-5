// Hero (mobile, 3x) screenshot + element boxes so the film can rebuild it piece by piece from real pixels
import {chromium} from 'playwright';
import fs from 'fs';
const OUT='assets/states';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',proxy:{server:process.env.HTTPS_PROXY}});
const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:3,locale:'fr-CA'});
const p=await ctx.newPage();await p.goto('https://creationvirale.com/',{waitUntil:'networkidle'});
await p.getByRole('button',{name:'Tout accepter'}).click().catch(()=>{});await p.waitForTimeout(3500);
await p.mouse.move(5,900);
await p.screenshot({path:`${OUT}/hero.png`});
const parts=await p.evaluate(()=>{
  const q=(s,root=document)=>root.querySelector(s);
  const box=(e,id)=>{if(!e)return null;const r=e.getBoundingClientRect();return {id,x:r.x,y:r.y,w:r.width,h:r.height}};
  const hero=document.querySelectorAll('section')[0];
  const out=[box(q('header img'),'logo'),box(q('header button'),'menu')];
  const h1=q('h1',hero);
  // split h1 into visual lines using a Range over each word
  const rects=[];const rng=document.createRange();rng.selectNodeContents(h1);
  for(const r of rng.getClientRects())rects.push(r);
  const lines={};for(const r of rects){const k=Math.round(r.y);lines[k]=lines[k]?{x:Math.min(lines[k].x,r.x),y:r.y,r:Math.max(lines[k].r,r.right),h:r.height}:{x:r.x,y:r.y,r:r.right,h:r.height}}
  Object.values(lines).sort((a,b)=>a.y-b.y).forEach((l,i)=>out.push({id:'h1-'+i,x:l.x,y:l.y,w:l.r-l.x,h:l.h}));
  out.push(box(h1.previousElementSibling||q('span',hero),'pill'));
  out.push(box(q('p',hero),'para'));
  const cta=[...hero.querySelectorAll('a')].find(a=>/Démarrer/.test(a.innerText));out.push(box(cta,'cta'));
  out.push(box(cta?.parentElement?.nextElementSibling||[...hero.querySelectorAll('p')].find(p=>/Aucun/.test(p.innerText)),'note'));
  const img=hero.querySelector('img');out.push(box(img?.closest('div[class*=rounded]')||img,'photo'));
  for(const t of ['+100','+40K','+30K']){const e=[...hero.querySelectorAll('*')].find(e=>e.children.length<4&&e.innerText?.trim()===t&&e.getBoundingClientRect().height>30);out.push(box(e,'badge'+t))}
  return out.filter(Boolean);
});
const ctaBox=parts.find(x=>x.id==='cta');
await p.mouse.move(ctaBox.x+ctaBox.w/2,ctaBox.y+ctaBox.h/2);await p.waitForTimeout(500);
await p.screenshot({path:`${OUT}/hero-cta-hover.png`});
const meta=JSON.parse(fs.readFileSync(`${OUT}/meta.json`));meta.hero={dpr:3,w:430,h:932,parts};
fs.writeFileSync(`${OUT}/meta.json`,JSON.stringify(meta,null,1));
console.log(parts.map(x=>`${x.id} ${Math.round(x.x)},${Math.round(x.y)} ${Math.round(x.w)}x${Math.round(x.h)}`).join('\n'));
await b.close();
