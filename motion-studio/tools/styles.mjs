// Reads computed design values (radius, padding, borders, type) of the site's real components -> assets/site-styles.json
import {chromium} from 'playwright';import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',proxy:{server:process.env.HTTPS_PROXY}});
const p=await b.newPage({viewport:{width:430,height:932}});
const K=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','backgroundImage','borderRadius','borderTopWidth','borderTopColor','paddingTop','paddingRight','paddingBottom','paddingLeft','height','width','boxShadow','gap','textTransform'];
const grab=async(sel,label,root='document')=>p.evaluate(([sel,K])=>{const e=document.querySelector(sel);if(!e)return null;const s=getComputedStyle(e);const r=e.getBoundingClientRect();const o={w:r.width,h:r.height,text:(e.innerText||'').slice(0,60)};for(const k of K)o[k]=s[k];return o},[sel,K]).then(v=>[label,v]);
const out={};
await p.goto('https://creationvirale.com/',{waitUntil:'networkidle'});
for(const [s,l] of [['h1','h1'],['section h2','h2'],['section p','p'],['section a[href*="nous-joindre"]','cta'],['section span.rounded-full, section div.rounded-full','pill'],['article','card'],['article h3','cardTitle'],['article p','cardText'],['header','header'],['header img','headerLogo'],['header button','menuBtn'],['section:nth-of-type(7) article, section:nth-of-type(7) li','stepCard'],['.text-accent','accent']]) {const [k,v]=await grab(s,l);out[k]=v}
await p.goto('https://creationvirale.com/nous-joindre',{waitUntil:'domcontentloaded'});await p.waitForTimeout(3000);
for(const [s,l] of [['form','form'],['label','label'],['input[name=name]','input'],['select[name=interest]','select'],['textarea','textarea'],['form button[type=submit], form button','submit'],['h1','contactH1'],['h2','contactH2']]){const [k,v]=await grab(s,l);out[k]=v}
out.submitText=await p.evaluate(()=>[...document.querySelectorAll('form button')].map(b=>b.innerText.trim()));
out.formParent=await p.evaluate(()=>{const f=document.querySelector('form');const c=f.closest('[class*=rounded]')||f.parentElement;const s=getComputedStyle(c);return {radius:s.borderRadius,bg:s.backgroundColor,border:s.borderTopWidth+' '+s.borderTopColor,pad:s.padding,w:c.getBoundingClientRect().width}});
await p.screenshot({path:'assets/shots/contact-reference.png',fullPage:true});
fs.writeFileSync('assets/site-styles.json',JSON.stringify(out,null,1));
for(const [k,v] of Object.entries(out))console.log(k,JSON.stringify(v).slice(0,330));
await b.close();
