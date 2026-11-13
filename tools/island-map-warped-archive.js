// Pure, seeded island geometry. Shared edge curves are generated once and reversed
// by the adjacent territory, so borders cannot drift apart on ownership changes.
export function createIslandGeometry(size,seed,states){
 let rng=seed>>>0;const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};

 // Map a topological grid onto a rounded, elongated land mass. Geography comes
 // from broad radial lobes and bays, not noisy offsets along a square perimeter.
 const phase=(rand()-.5)*.32;
 const angleDistance=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
 const lobe=(a,center,width)=>Math.exp(-Math.pow(angleDistance(a,center)/width,2));
 function project(u,v){
  const dx=u*Math.sqrt(Math.max(0,1-v*v/2)),dy=v*Math.sqrt(Math.max(0,1-u*u/2));
  const a=Math.atan2(dy,dx);
  const outline=.94+.34*lobe(a,-.72,.40)+.29*lobe(a,2.35,.48)
   -.34*lobe(a,.05,.23)-.26*lobe(a,-1.65,.25)-.22*lobe(a,1.5,.23)
   +.085*Math.sin(8*a+phase)+.045*Math.cos(11*a-.4);
  const scale=outline;
  const x=dx*scale*239,y=dy*scale*225;
  return {x:355+x*.95-y*.28,y:290+y*.95-x*.28};
 }
 const raw=[],nodes=[];
 for(let y=0;y<=size;y++)for(let x=0;x<=size;x++){
  const boundary=x===0||y===0||x===size||y===size;
  const u=x/size*2-1+(boundary?0:(rand()-.5)*.90/size),v=y/size*2-1+(boundary?0:(rand()-.5)*.90/size);
  raw.push({u,v});nodes.push(project(u,v));
 }
 const at=(x,y)=>nodes[y*(size+1)+x];const edges=new Map();
 function edge(a,b){
  const key=a<b?`${a}:${b}`:`${b}:${a}`;
  if(!edges.has(key)){
   const lo=Math.min(a,b),hi=Math.max(a,b),start=raw[lo],end=raw[hi];
   const coast=(Math.abs(start.u)===1&&start.u===end.u)||(Math.abs(start.v)===1&&start.v===end.v);
   const p=nodes[lo],q=nodes[hi],len=Math.hypot(q.x-p.x,q.y-p.y),nx=-(q.y-p.y)/len,ny=(q.x-p.x)/len;
   const bend=coast?0:(rand()-.5)*Math.min(36,len*.36);
   const point=t=>{const pos=project(start.u+(end.u-start.u)*t,start.v+(end.v-start.v)*t),offset=bend*Math.sin(t*Math.PI*2)*Math.sin(t*Math.PI);return {x:pos.x+nx*offset,y:pos.y+ny*offset};};
   const derivative=t=>{const lo=Math.max(0,t-.0001),hi=Math.min(1,t+.0001),a=point(lo),b=point(hi);return {x:(b.x-a.x)/(hi-lo),y:(b.y-a.y)/(hi-lo)};};
   const segments=[];
   for(let i=0;i<8;i++){const t0=i/8,t1=(i+1)/8,a=point(t0),b=point(t1),da=derivative(t0),db=derivative(t1);segments.push({p:a,q:b,c1:{x:a.x+da.x/24,y:a.y+da.y/24},c2:{x:b.x-db.x/24,y:b.y-db.y/24}});}
   edges.set(key,{p,q,segments});
  }
  return {key,...edges.get(key),reverse:a>b};
 }
 const pt=p=>`${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
 const commands=e=>(e.reverse?[...e.segments].reverse():e.segments).map(s=>e.reverse?`C ${pt(s.c2)} ${pt(s.c1)} ${pt(s.p)}`:`C ${pt(s.c1)} ${pt(s.c2)} ${pt(s.q)}`).join(' ');
 const coast=[],borders=[],cells=[];const active=id=>!!states[id]?.active;
 for(const t of states){if(!t.active)continue;const x=t.x,y=t.y,a=y*(size+1)+x,b=a+1,d=(y+1)*(size+1)+x,c=d+1;const sides=[edge(a,b),edge(b,c),edge(c,d),edge(d,a)],ids=[y>0?t.id-size:-1,x<size-1?t.id+1:-1,y<size-1?t.id+size:-1,x>0?t.id-1:-1];const points=[at(x,y),at(x+1,y),at(x+1,y+1),at(x,y+1)];const center=project([a,b,c,d].reduce((n,i)=>n+raw[i].u,0)/4,[a,b,c,d].reduce((n,i)=>n+raw[i].v,0)/4);const path=`M ${pt(points[0])} ${sides.map(commands).join(' ')} Z`;cells.push({id:t.id,path,center,edges:sides.map(e=>e.key)});sides.forEach((e,i)=>{const segment={key:e.key,path:`M ${pt(e.reverse?e.q:e.p)} ${commands(e)}`,start:e.reverse?e.q:e.p,end:e.reverse?e.p:e.q};if(!active(ids[i]))coast.push(segment);else if(t.id<ids[i])borders.push(segment);});}
 const width=710,height=580;
 return {width,height,cells,coast,borders};
}
