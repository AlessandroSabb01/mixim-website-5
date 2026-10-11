// Real cursor actions on the Bénéfice cards: hover/click "Publier", click chart tabs, count-up from offscreen
import {chromium} from 'playwright';
import fs from 'fs';
const OUT='assets/states';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',proxy:{server:process.env.HTTPS_PROXY}});
const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:3,locale:'fr-CA'});
const p=await ctx.newPage();await p.goto('https://creationvirale.com/',{waitUntil:'networkidle'});
await p.getByRole('button',{name:'Tout accepter'}).click().catch(()=>{});await p.waitForTimeout(400);
const meta=JSON.parse(fs.readFileSync(`${OUT}/meta.json`));
const geo=async el=>el.evaluate(a=>{const R=a.getBoundingClientRect();return {w:R.width,h:R.height,parts:[...a.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()||e.tagName==='svg').map(e=>{const r=e.getBoundingClientRect();return {t:(e.innerText||e.tagName).trim().slice(0,40),x:r.x-R.x,y:r.y-R.y,w:r.width,h:r.height}})}});
const arts=p.locator('section').nth(3).locator('article');
// count-up: put card 3 just below the fold, then scroll it in and record
const c3=arts.nth(3);
await c3.evaluate(a=>{const r=a.getBoundingClientRect();scrollBy(0,r.top-innerHeight-50)});await p.waitForTimeout(600);
await p.evaluate(()=>scrollBy(0,500));
let n=0;const t0=Date.now();const times=[];
while(Date.now()-t0<3500){times.push(Date.now()-t0);await c3.screenshot({path:`${OUT}/count-${String(n).padStart(3,'0')}.png`});n++;}
meta.count={frames:n,times,...await geo(c3)};
// tabs
for(const name of ['Partages','Enregistrements','Interactions']){
  const tab=c3.getByText(name,{exact:true});
  const before=await c3.screenshot();
  await tab.hover();await p.waitForTimeout(300);await c3.screenshot({path:`${OUT}/tab-${name}-hover.png`});
  await tab.click();await p.waitForTimeout(900);await c3.screenshot({path:`${OUT}/tab-${name}-after.png`});
  meta['tab-'+name]=(await c3.screenshot()).equals(before)?'nochange':'changed';
}
// Publier
const c1=arts.nth(1);await c1.scrollIntoViewIfNeeded();await p.waitForTimeout(400);
meta.publier=await geo(c1);
const pub=c1.getByText('Publier',{exact:true});
await c1.screenshot({path:`${OUT}/pub-before.png`});
await pub.hover();await p.waitForTimeout(300);await c1.screenshot({path:`${OUT}/pub-hover.png`});
await pub.click();for(let i=0;i<6;i++){await p.waitForTimeout(200);await c1.screenshot({path:`${OUT}/pub-after-${i}.png`});}
fs.writeFileSync(`${OUT}/meta.json`,JSON.stringify(meta,null,1));
console.log('count frames',n,'tabs',meta['tab-Partages'],meta['tab-Enregistrements']);
await b.close();
