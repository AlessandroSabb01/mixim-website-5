// Clean plates: hero without the floating badges, and hero background with all content hidden
import {chromium} from 'playwright';
const OUT='assets/states';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',proxy:{server:process.env.HTTPS_PROXY}});
const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:3,locale:'fr-CA'});
const p=await ctx.newPage();await p.goto('https://creationvirale.com/',{waitUntil:'networkidle'});
await p.getByRole('button',{name:'Tout accepter'}).click().catch(()=>{});await p.waitForTimeout(3500);await p.mouse.move(5,900);
await p.evaluate(()=>{const hero=document.querySelectorAll('section')[0];for(const t of ['+100','+40K','+30K']){const c=[...hero.querySelectorAll('*')].filter(e=>e.innerText?.trim()===t&&e.getBoundingClientRect().height>30).sort((a,b)=>{const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return A.width*A.height-B.width*B.height});if(c[0])c[0].style.visibility='hidden'}
  document.querySelectorAll('*').forEach(e=>{if(getComputedStyle(e).position==='fixed'&&!e.closest('header'))e.style.visibility='hidden'})});
await p.screenshot({path:`${OUT}/hero-nobadges.png`});
await p.evaluate(()=>{const hide=e=>e&&(e.style.visibility='hidden');document.querySelectorAll('header *').forEach(hide);const hero=document.querySelectorAll('section')[0];hero.querySelectorAll(':scope *').forEach(hide);document.querySelectorAll('section')[1].style.visibility='hidden';document.querySelectorAll('body > div, [class*=cookie]').forEach(e=>{if(getComputedStyle(e).position==='fixed')hide(e)})});
await p.screenshot({path:`${OUT}/hero-bg.png`});
await b.close();
