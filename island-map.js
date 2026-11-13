// Fixed island boundary; random spaced seeds grow at individual speeds until fronts meet.
const cache=new Map(),W=112,H=96,STEP=6,PAD=20;
const dirs=[[1,0],[-1,0],[0,1],[0,-1]],eight=[...dirs,[1,1],[-1,1],[1,-1],[-1,-1]];
function hash(x,y,s){let n=(Math.imul(x,374761393)+Math.imul(y,668265263)+s)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y,s){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,a=fx*fx*(3-2*fx),b=fy*fy*(3-2*fy);return(hash(ix,iy,s)*(1-a)+hash(ix+1,iy,s)*a)*(1-b)+(hash(ix,iy+1,s)*(1-a)+hash(ix+1,iy+1,s)*a)*b;}
const xy=i=>[i%W,Math.floor(i/W)];
function near(i,diagonal=false){const[x,y]=xy(i);return(diagonal?eight:dirs).map(([dx,dy])=>[x+dx,y+dy]).filter(([x,y])=>x>=0&&y>=0&&x<W&&y<H).map(([x,y])=>y*W+x);}
function flood(mask,start){const seen=new Set([start]),q=[start];for(let k=0;k<q.length;k++)for(const n of near(q[k]))if(mask[n]&&!seen.has(n)){seen.add(n);q.push(n);}return q;}
// A fixed, rounded coastline isolates the province-growth experiment.
function makeLand(){
 const anchors=[[9,65],[12,56],[21,51],[18,44],[26,37],[31,38],[36,30],[44,32],[47,25],[55,28],[60,19],[68,20],[74,13],[83,14],[88,9],[95,14],[94,23],[101,27],[95,34],[98,43],[91,47],[92,53],[84,54],[81,62],[86,68],[80,75],[72,72],[65,80],[57,78],[52,85],[43,82],[36,87],[30,82],[24,85],[19,78],[13,79],[15,70]];
 const coast=[];
 for(let i=0;i<anchors.length;i++){const a=anchors[(i+anchors.length-1)%anchors.length],b=anchors[i],c=anchors[(i+1)%anchors.length],d=anchors[(i+2)%anchors.length];for(let j=0;j<10;j++){const t=j/10,t2=t*t,t3=t2*t;coast.push({x:.5*((2*b[0])+(-a[0]+c[0])*t+(2*a[0]-5*b[0]+4*c[0]-d[0])*t2+(-a[0]+3*b[0]-3*c[0]+d[0])*t3),y:.5*((2*b[1])+(-a[1]+c[1])*t+(2*a[1]-5*b[1]+4*c[1]-d[1])*t2+(-a[1]+3*b[1]-3*c[1]+d[1])*t3)});}}
 const land=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let inside=false;for(let i=0,j=coast.length-1;i<coast.length;j=i++){const a=coast[i],b=coast[j];if((a.y>y+.5)!==(b.y>y+.5)&&x+.5<(b.x-a.x)*(y+.5-a.y)/(b.y-a.y)+a.x)inside=!inside;}if(inside)land[y*W+x]=1;}
 return land;
}
class Heap{a=[];push(v){let i=this.a.length;this.a.push(v);while(i){const p=(i-1)>>1;if(this.a[p][0]<=v[0])break;this.a[i]=this.a[p];i=p;}this.a[i]=v;}pop(){const first=this.a[0],v=this.a.pop();if(this.a.length){let i=0;while(i*2+1<this.a.length){let c=i*2+1;if(c+1<this.a.length&&this.a[c+1][0]<this.a[c][0])c++;if(this.a[c][0]>=v[0])break;this.a[i]=this.a[c];i=c;}this.a[i]=v;}return first;}}
function partition(land,sites,seed,speeds=sites.map(()=>1)){const labels=new Int16Array(land.length).fill(-1),cost=new Float64Array(land.length).fill(Infinity),heap=new Heap();sites.forEach((n,id)=>{labels[n]=id;cost[n]=0;heap.push([0,n,id]);});
 while(heap.a.length){const[d,i,id]=heap.pop();if(d!==cost[i])continue;const[x,y]=xy(i);for(const n of near(i,true))if(land[n]){const[nx,ny]=xy(n),diagonal=x!==nx&&y!==ny;if(diagonal&&(!land[y*W+nx]||!land[ny*W+x]))continue;const next=d+(diagonal?Math.SQRT2:1)*(1+.18*noise(nx*.085,ny*.085,seed+701))/speeds[id];if(next<cost[n]){cost[n]=next;labels[n]=id;heap.push([next,n,id]);}}}
 const keep=new Uint8Array(land.length);sites.forEach((start,id)=>{const q=[start];keep[start]=1;for(let k=0;k<q.length;k++)for(const n of near(q[k]))if(labels[n]===id&&!keep[n]){keep[n]=1;q.push(n);}});
 const pending=[];for(let i=0;i<land.length;i++)if(land[i]&&!keep[i]){labels[i]=-1;pending.push(i);}while(pending.length){let changed=false;for(let j=pending.length-1;j>=0;j--){const i=pending[j],n=near(i).find(n=>labels[n]>=0);if(n!==undefined){labels[i]=labels[n];pending.splice(j,1);changed=true;}}if(!changed)throw Error('Disconnected province');}return {labels,cost};
}
function sitesFor(land,count,rand){
 const points=[];for(let i=0;i<land.length;i++)if(land[i]&&near(i,true).every(n=>land[n]))points.push(i);
 const sites=[],minimum=Math.sqrt(points.length/count)*.58;
 for(let attempt=0;sites.length<count&&attempt<20000;attempt++){const candidate=points[Math.floor(rand()*points.length)],[x,y]=xy(candidate),spacing=minimum*(attempt>8000?.85:1);if(sites.every(i=>{const[a,b]=xy(i);return (x-a)**2+(y-b)**2>=spacing*spacing;}))sites.push(candidate);}
 if(sites.length!==count)throw Error('Could not place spaced province seeds');return sites;
}
function simplify(points,tolerance=.72){if(points.length<=2)return points;const a=points[0],b=points.at(-1),dx=b.x-a.x,dy=b.y-a.y;let max=0,index=0;for(let i=1;i<points.length-1;i++){const p=points[i],t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);if(d>max){max=d;index=i;}}return max>tolerance?[...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)]:[a,b];}
const pt=p=>`${(PAD+p.x*STEP).toFixed(2)} ${(PAD+p.y*STEP).toFixed(2)}`;
function curve(points){let out='';for(let i=0;i<points.length-1;i++){const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)],c1={x:b.x+(c.x-a.x)*.18,y:b.y+(c.y-a.y)*.18},c2={x:c.x-(d.x-b.x)*.18,y:c.y-(d.y-b.y)*.18};out+=` C ${pt(c1)} ${pt(c2)} ${pt(c)}`;}return out;}
// Display anchors are independent of growth seeds. Prefer a broad interior
// pocket, then bias toward the province centroid to avoid coastline labels.
function labelCenters(labels,sites,count){
 const distances=new Float64Array(labels.length).fill(Infinity),heap=new Heap();
 const sums=Array.from({length:count},()=>({x:0,y:0,n:0}));
 for(let i=0;i<labels.length;i++)if(labels[i]>=0){const id=labels[i],[x,y]=xy(i),a=sums[id];a.x+=x+.5;a.y+=y+.5;a.n++;if(near(i).some(n=>labels[n]!==id)){distances[i]=0;heap.push([0,i,id]);}}
 while(heap.a.length){const[d,i,id]=heap.pop();if(d!==distances[i])continue;const[x,y]=xy(i);for(const n of near(i,true))if(labels[n]===id){const[nx,ny]=xy(n),next=d+(nx!==x&&ny!==y?Math.SQRT2:1);if(next<distances[n]){distances[n]=next;heap.push([next,n,id]);}}}
 const best=Array(count).fill(-Infinity),result=sites.map(i=>{const[x,y]=xy(i);return{x:PAD+(x+.5)*STEP,y:PAD+(y+.5)*STEP,clearance:0};});
 for(let i=0;i<labels.length;i++)if(labels[i]>=0){const id=labels[i],[x,y]=xy(i),c=sums[id],score=distances[i]-.12*Math.hypot(x+.5-c.x/c.n,y+.5-c.y/c.n);if(score>best[id]){best[id]=score;result[id]={x:PAD+(x+.5)*STEP,y:PAD+(y+.5)*STEP,clearance:distances[i]*STEP};}}
 return result;
}
function buildGeometry(labels,sites,count){const centers=labelCenters(labels,sites,count),segments=[],vertices=new Map(),vertex=(x,y)=>`${x},${y}`;
 const add=(a,b,id,other)=>{const i=segments.length;segments.push({a,b,id,other});for(const v of[a,b]){if(!vertices.has(v))vertices.set(v,[]);vertices.get(v).push(i);}};
 for(let i=0;i<labels.length;i++)if(labels[i]>=0){const[x,y]=xy(i),id=labels[i],sides=[[vertex(x,y),vertex(x+1,y),y?labels[i-W]:-1],[vertex(x+1,y),vertex(x+1,y+1),x<W-1?labels[i+1]:-1],[vertex(x+1,y+1),vertex(x,y+1),y<H-1?labels[i+W]:-1],[vertex(x,y+1),vertex(x,y),x?labels[i-1]:-1]];for(const[a,b,other]of sides)if(other!==id&&(other<0||id<other))add(a,b,id,other);}
 const used=new Set(),chains=[],pair=e=>[e.id,e.other].sort((a,b)=>a-b).join(':');
 const trace=(index,start)=>{const first=segments[index],nodes=[start];let at=start,current=index;const right=first.a===start?first.id:first.other,left=first.a===start?first.other:first.id;
  while(!used.has(current)){used.add(current);const e=segments[current],next=e.a===at?e.b:e.a;nodes.push(next);at=next;if(vertices.get(at).length!==2)break;const candidates=vertices.get(at).filter(i=>!used.has(i)&&pair(segments[i])===pair(first));if(!candidates.length)break;current=candidates[0];}
  const raw=nodes.map(v=>{const[x,y]=v.split(',').map(Number);return{x,y};});let points=simplify(raw,(right<0||left<0)?1.35:1.0);if(nodes[0]===nodes.at(-1)&&points.length<4)points=raw;for(let pass=0;pass<2;pass++){const rounded=[points[0]];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];rounded.push({x:a.x*.75+b.x*.25,y:a.y*.75+b.y*.25},{x:a.x*.25+b.x*.75,y:a.y*.25+b.y*.75});}rounded.push(points.at(-1));points=rounded;}chains.push({key:`edge-${chains.length}`,start:nodes[0],end:nodes.at(-1),right,left,points});
 };
 for(let i=0;i<segments.length;i++)if(!used.has(i)){const e=segments[i];if(vertices.get(e.a).length!==2)trace(i,e.a);else if(vertices.get(e.b).length!==2)trace(i,e.b);}for(let i=0;i<segments.length;i++)if(!used.has(i))trace(i,segments[i].a);
 const neighbors=Array.from({length:count},()=>new Set()),coast=[],borders=[];
 for(const e of chains){const p=e.points,segment={key:e.key,path:`M ${pt(p[0])}${curve(p)}`,start:{x:PAD+p[0].x*STEP,y:PAD+p[0].y*STEP},end:{x:PAD+p.at(-1).x*STEP,y:PAD+p.at(-1).y*STEP}};if(e.right<0||e.left<0)coast.push(segment);else{borders.push(segment);neighbors[e.right].add(e.left);neighbors[e.left].add(e.right);}}
 const cells=[];for(let id=0;id<count;id++){const sides=chains.filter(e=>e.right===id||e.left===id).map(e=>e.right===id?{...e,reverse:false}:{...e,start:e.end,end:e.start,reverse:true}),remaining=[...sides];let path='';
  while(remaining.length){let e=remaining.shift();const start=e.start;path+=`M ${pt((e.reverse?[...e.points].reverse():e.points)[0])}`;for(let guard=0;guard<=sides.length;guard++){path+=curve(e.reverse?[...e.points].reverse():e.points);if(e.end===start)break;const i=remaining.findIndex(n=>n.start===e.end);if(i<0)throw Error(`Unclosed province ${id}`);e=remaining.splice(i,1)[0];}path+=' Z ';}
  const[x,y]=xy(sites[id]);cells.push({id,path,center:{x:centers[id].x,y:centers[id].y},labelClearance:centers[id].clearance,edges:sides.map(e=>e.key),neighbors:[...neighbors[id]].sort((a,b)=>a-b)});
 }return{width:W*STEP+PAD*2,height:H*STEP+PAD*2,cells,coast,borders};
}
export function createIslandGeometry(size,seed,states){const count=states.filter(s=>s.active).length,key=`${seed}:${count}`;if(cache.has(key))return cache.get(key);let rng=(seed^0x71a5b3c9)>>>0;const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const land=makeLand(),sites=sitesFor(land,count,rand),speeds=sites.map(()=>.78+rand()*.50);
 const {labels,cost}=partition(land,sites,seed,speeds);
 const geo=buildGeometry(labels,sites,count);let endpoints=[0,count-1],longest=-1;for(let a=0;a<count;a++){const distance=new Map([[a,0]]),q=[a];for(const id of q)for(const n of geo.cells[id].neighbors)if(!distance.has(n)){distance.set(n,distance.get(id)+1);q.push(n);}for(const[b,d]of distance)if(d>longest){longest=d;endpoints=[a,b];}}
 const order=[endpoints[0],...Array.from({length:count},(_,i)=>i).filter(i=>!endpoints.includes(i)),endpoints[1]],remap=new Map(order.map((old,id)=>[old,id]));geo.cells=order.map((old,id)=>({...geo.cells[old],id,neighbors:geo.cells[old].neighbors.map(n=>remap.get(n)).sort((a,b)=>a-b)}));const counts=Array(count).fill(0);for(const id of labels)if(id>=0)counts[remap.get(id)]++;
 geo.growth={width:W,height:H,step:STEP,padding:PAD,land,labels:Int16Array.from(labels,id=>id<0?-1:remap.get(id)),arrival:cost,seeds:order.map((old,id)=>({id,x:xy(sites[old])[0]+.5,y:xy(sites[old])[1]+.5,speed:speeds[old],area:counts[id]}))};
 if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(key,geo);return geo;
}
