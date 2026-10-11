// Captures real screenshots + DOM geometry of creationvirale.com into ./assets
import {chromium} from 'playwright';
import fs from 'fs';
const OUT='assets/shots';fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',proxy:{server:process.env.HTTPS_PROXY}});
const views={desktop:{viewport:{width:1440,height:900},deviceScaleFactor:2},mobile:{viewport:{width:430,height:932},deviceScaleFactor:3,isMobile:true,hasTouch:true}};
const only=process.argv[2];
for(const [name,opt] of Object.entries(views)){
  if(only&&only!==name)continue;
  const ctx=await b.newContext({...opt,locale:'fr-CA',reducedMotion:'no-preference'});
  const p=await ctx.newPage();
  await p.goto('https://creationvirale.com/',{waitUntil:'networkidle',timeout:60000});
  await p.waitForTimeout(1500);
  // dismiss cookie banner if present
  for(const label of ['Tout accepter','Accepter','Accepter tout','J\'accepte','Refuser']){
    const btn=p.getByRole('button',{name:label,exact:false}).first();
    if(await btn.count()&&await btn.isVisible().catch(()=>false)){await btn.click().catch(()=>{});console.log(name,'cookie:',label);break;}
  }
  await p.screenshot({path:`${OUT}/${name}-viewport-hero.png`});
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<H;y+=300){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(120);}
  await p.waitForTimeout(1500);
  const secs=await p.evaluate(()=>[...document.querySelectorAll('header,section,footer')].map((e,i)=>{e.dataset.capi=i;const r=e.getBoundingClientRect();return {i,tag:e.tagName,id:e.id,cls:e.className.toString().slice(0,80),top:r.top+scrollY,h:r.height,text:e.innerText.trim().slice(0,60).replace(/\n/g,' | ')}}));
  fs.writeFileSync(`${OUT}/${name}-sections.json`,JSON.stringify(secs,null,1));
  for(const s of secs){
    if(s.h<20)continue;
    const el=p.locator(`[data-capi="${s.i}"]`);
    await el.scrollIntoViewIfNeeded();await p.waitForTimeout(1800);
    await el.screenshot({path:`${OUT}/${name}-s${String(s.i).padStart(2,'0')}.png`}).catch(e=>console.log('fail',s.i,e.message.slice(0,80)));
  }
  console.log(name,secs.map(s=>`${s.i} ${s.tag} h=${Math.round(s.h)} ${s.text}`).join('\n'));
  await ctx.close();
}
await b.close();
