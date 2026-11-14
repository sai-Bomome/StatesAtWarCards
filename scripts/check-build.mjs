import {readFile,access,readdir} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
const root=resolve('dist'),base=process.env.PAGES_BASE_PATH||'./';
const html=await readFile(resolve(root,'index.html'),'utf8');
const refs=[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>({ref:m[1],file:resolve(root,'index.html')}));
for(const name of await readdir(resolve(root,'assets')))if(name.endsWith('.css')){
 const file=resolve(root,'assets',name),css=await readFile(file,'utf8');
 for(const m of css.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g))refs.push({ref:m[1],file});
}
let checked=0;
for(const {ref,file} of refs){
 if(/^(?:https?:|data:|blob:|#|\/\/)/.test(ref))continue;
 let target;
 if(ref.startsWith('/')){
  if(!base.startsWith('/')||!ref.startsWith(base))throw Error(`Asset ignores Pages base ${base}: ${ref}`);
  target=resolve(root,decodeURIComponent(ref.slice(base.length).split(/[?#]/)[0]));
 }else target=resolve(dirname(file),decodeURIComponent(ref.split(/[?#]/)[0]));
 if(!target.startsWith(root+sep))throw Error(`Asset escapes dist: ${ref}`);
 await access(target);checked++;
}
if(!checked)throw Error('No bundled assets found.');
console.log(`Verified ${checked} local asset references for ${base}`);
