// Records real UI state sequences of the "Bénéfice" cards and a thumbnail click (mobile, 3x DPR)
import {chromium} from 'playwright';
import fs from 'fs';
const OUT='assets/states';fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',proxy:{server:process.env.HTTPS_PROXY}});
async function fresh(){const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:3,isMobile:true,hasTouch:true,locale:'fr-CA'});
 const p=await ctx.newPage();await p.goto('https://creationvirale.com/',{waitUntil:'networkidle'});
 await p.getByRole('button',{name:'Tout accepter'}).click().catch(()=>{});await p.waitForTimeout(500);return {ctx,p};}
const meta={};
// 1) card sequences: scroll each article in from below, record frames
for(let k=0;k<(process.argv[2]==='thumb'?0:4);k++){
  const {ctx,p}=await fresh();
  const el=p.locator('section').nth(3).locator('article').nth(k);
  await el.scrollIntoViewIfNeeded();await p.evaluate(()=>scrollBy(0,-120));
  const t0=Date.now();let n=0;
  while(Date.now()-t0<5000){await el.screenshot({path:`${OUT}/card${k}-${String(n).padStart(3,'0')}.png`});n++;}
  meta['card'+k]={frames:n,ms:Date.now()-t0,box:await el.boundingBox(),
    parts:await el.evaluate(a=>{const R=a.getBoundingClientRect();return [...a.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText?.trim()).map(e=>{const r=e.getBoundingClientRect();return {t:e.innerText.trim().slice(0,30),x:r.x-R.x,y:r.y-R.y,w:r.width,h:r.height}})})};
  await ctx.close();
}
// 2) thumbnail click in "savoir-faire"
{
  const {ctx,p}=await fresh();
  const sec=p.locator('section').nth(2);
  await sec.scrollIntoViewIfNeeded();await p.waitForTimeout(1500);
  const btn=sec.locator('button').nth(1);
  await sec.evaluate(s=>{const r=s.querySelector('button').getBoundingClientRect();scrollBy(0,r.top-250)});await p.waitForTimeout(800);
  meta.thumbBox=await btn.boundingBox();meta.thumbLabel=await btn.getAttribute('aria-label')||await btn.innerText();
  await p.screenshot({path:`${OUT}/thumb-before.png`});
  await p.mouse.click(meta.thumbBox.x+meta.thumbBox.width/2,meta.thumbBox.y+meta.thumbBox.height/2);
  for(let i=0;i<8;i++){await p.waitForTimeout(250);await p.screenshot({path:`${OUT}/thumb-after-${i}.png`});}
  await ctx.close();
}
const prev=fs.existsSync(`${OUT}/meta.json`)?JSON.parse(fs.readFileSync(`${OUT}/meta.json`)):{};Object.assign(prev,meta);fs.writeFileSync(`${OUT}/meta.json`,JSON.stringify(prev,null,1));
console.log(JSON.stringify({...meta,card0:undefined,card1:{...meta.card1,parts:meta.card1.parts},card2:undefined,card3:{...meta.card3}}).slice(0,3000));
await b.close();
