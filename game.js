import {createIslandGeometry} from './island-map.js';
export const PLAYER_NAMES=['Azure','Ember'];
export const CARDS={
 reinforce1:{name:'Reinforce +1',icon:'helmet',value:1,description:'Add 1 active troop to an owned province.'},
 reinforce2:{name:'Reinforce +2',icon:'helmet',value:2,description:'Add 2 active troops to an owned province.'},
 reinforce5:{name:'Reinforce +5',icon:'helmet',value:5,description:'Add 5 active troops to an owned province.'},
 reinforce10:{name:'Reinforce +10',icon:'helmet',value:10,description:'Add 10 active troops to an owned province.'},
 move:{name:'Move Troops',icon:'helmet',description:'Move active troops through connected friendly land. Leave 1 behind.'},
 double:{name:'Double',icon:'helmet',description:'Pair with Reinforcements. Together cost 2 plays.'},
 barracks:{name:'Barracks',icon:'flag',description:'Build: gain 1 active troop here each future turn.'},
 monument:{name:'Monument',icon:'flag',description:'Build with 5 active troops. Control 3 to win.'},
 sabotage:{name:'Sabotage',icon:'sword',description:'Remove up to 3 active troops from an adjacent enemy.'},
 demolish:{name:'Demolish',icon:'sword',description:'Destroy an adjacent enemy barracks. Troops stay.'},
 attack:{name:'Attack',icon:'sword',description:'Capture adjacent land and demolish its building, including monuments.'},
 siege:{name:'Siege',icon:'sword',description:'Block half the troops at an adjacent enemy building.'},
 capture:{name:'Capture',icon:'flag',description:'Capture adjacent land and keep its building. Siege is optional.'},
 breakSiege:{name:'Break Siege',icon:'flag',description:'Unblock your troops or counter a Siege.'}
};
export const DEFAULT_COPIES={reinforce1:10,reinforce2:5,reinforce5:2,reinforce10:1,move:6,double:2,barracks:3,monument:3,sabotage:3,demolish:3,attack:20,siege:2,capture:2,breakSiege:3};
export const RULE_FIELDS=[
 {key:'monumentMinTroops',label:'Troops to build a monument',default:5,min:1,max:100},
 {key:'barracksProduction',label:'Barracks troops per turn',default:1,min:0,max:50},
 {key:'growthTroops',label:'Passive troops per owned province (0 = off)',default:0,min:0,max:100},
 {key:'growthMode',label:'Passive growth timing',default:0,min:0,max:1,options:[{value:0,label:'Each owner turn start'},{value:1,label:'Every N completed rounds'}]},
 {key:'growthEveryRounds',label:'Rounds between passive growth (round mode)',default:2,min:1,max:100},
 {key:'sabotageDamage',label:'Sabotage troop loss',default:3,min:1,max:100},
 {key:'attackPercent',label:'Troops contributed per attacking province (%)',default:50,min:1,max:100},
 {key:'siegeBlockPercent',label:'Siege blocked troops (%)',default:50,min:0,max:100},
 {key:'monumentsToWin',label:'Monuments to win',default:3,min:1,max:16},
 {key:'neutralTroopsEnabled',label:'Starting neutral troops',default:false,type:'boolean'},
 {key:'neutralTroopsMin',label:'Minimum neutral troops',default:1,min:0,max:100},
 {key:'neutralTroopsMax',label:'Maximum neutral troops',default:10,min:0,max:100},
 {key:'startingTroops',label:'Starting troops per player',default:2,min:1,max:100},
 {key:'startingHand',label:'Starting hand',default:5,min:1,max:10},
 {key:'emptyHandDraw',label:'Cards drawn when starting with an empty hand',default:5,min:1,max:10},
 {key:'drawPerTurn',label:'Cards drawn per turn',default:2,min:1,max:10},
 {key:'actionsPerTurn',label:'Card plays per turn',default:3,min:1,max:6},
 {key:'handLimit',label:'Hand limit after turn',default:7,min:1,max:20}
];
export const DEFAULT_CONFIG={playerCount:2,boardSize:4,...Object.fromEntries(RULE_FIELDS.map(f=>[f.key,f.default])),copies:DEFAULT_COPIES};
export const growthSummary=c=>!(c.growthTroops??0)?'Passive troop growth is off.':`Passive growth: +${c.growthTroops} active troops per owned province ${c.growthMode===1?`after every ${c.growthEveryRounds} completed rounds (both players)`:'at its owner’s turn start'}.`;
function passiveGrowth(s,opening=false){const n=s.config.growthTroops??0;if(!n)return 0;const roundMode=s.config.growthMode===1;if(roundMode&&(opening||s.turn!==s.first||(s.round-1)%s.config.growthEveryRounds!==0))return 0;let gained=0;for(const t of s.states)if(t.owner>=0&&(!roundMode?t.owner===s.turn:true)){t.troops+=n;gained+=n;}return gained;}
export const siegeBlocked=(troops,config)=>Math.floor(troops*(config.siegeBlockPercent??50)/100);
export function cardDescription(type,config=DEFAULT_CONFIG){
 if(type==='barracks')return `Build: gain ${config.barracksProduction} active ${config.barracksProduction===1?'troop':'troops'} here each future turn unless besieged.`;
 if(type==='monument')return `Build with ${config.monumentMinTroops} active troops. Control ${config.monumentsToWin} to win.`;
 if(type==='sabotage')return `Remove up to ${config.sabotageDamage} active troops from an adjacent enemy.`;
 if(type==='siege')return `Block ${config.siegeBlockPercent}% of troops at an adjacent enemy building.`;
 return CARDS[type].description;
}
export const normalizeProfileName=(v,f='Commander')=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f-\u009f]/g,'').replace(/\s+/g,' ').trim().slice(0,20)||f:f;
export function normalizeConfig(c={}){
 if(c.playerCount!==undefined&&c.playerCount!==2)throw Error('This prototype is for two players.');
 const copies={...DEFAULT_COPIES,...c.copies};
 for(const [type,n] of Object.entries(copies))if(!CARDS[type]||!Number.isInteger(n)||n<0||n>100)throw Error('Copies must be whole numbers from 0 to 100.');
 const config={...DEFAULT_CONFIG,copies};for(const f of RULE_FIELDS){const n=c[f.key]??f.default;if(f.type==='boolean'){if(typeof n!=='boolean')throw Error(`${f.label} must be on or off.`);config[f.key]=n;continue;}if(!Number.isInteger(n)||n<f.min||n>f.max)throw Error(`${f.label} must be a whole number from ${f.min} to ${f.max}.`);config[f.key]=n;}
 if(config.neutralTroopsMin>config.neutralTroopsMax)throw Error('Minimum neutral troops cannot exceed the maximum.');
 const minimum=config.startingHand*2+config.drawPerTurn;if(Object.values(copies).reduce((a,b)=>a+b,0)<minimum)throw Error(`The deck needs at least ${minimum} cards for the opening deal.`);
 return config;
}
export const label=t=>`${String.fromCharCode(65+t.x)}${t.y+1}`;
export const adjacent=(a,b)=>!!a&&!!b&&(Array.isArray(a.neighbors)?a.neighbors.includes(b.id):Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1);
const fail=m=>{throw Error(m)};
function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function shuffle(s,a){for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function draw(s,id,n){for(let i=0;i<n;i++){if(!s.deck.length)s.deck=shuffle(s,s.discard.splice(0));if(!s.deck.length)break;s.players[id].hand.push(s.deck.pop());}}
export function createGame(seed=Date.now()>>>0,config={},profiles=[],secretSeed=seed){
 const s={seed,rng:secretSeed,revision:0,round:1,turn:0,actions:3,winner:null,config:normalizeConfig(config),players:PLAYER_NAMES.map((n,i)=>({name:normalizeProfileName(profiles[i],n),hand:[]})),states:[],deck:[],discard:[],log:[],pendingSiege:null};
 for(let y=0;y<4;y++)for(let x=0;x<4;x++)s.states.push({id:y*4+x,x,y,active:true,owner:-1,troops:0,blocked:0,building:null,besieged:false});
 const layout=createIslandGeometry(4,seed,s.states);for(const cell of layout.cells)s.states[cell.id].neighbors=[...cell.neighbors];
 s.states[0].owner=0;s.states[0].troops=s.config.startingTroops;s.states[15].owner=1;s.states[15].troops=s.config.startingTroops;
 if(s.config.neutralTroopsEnabled){const neutral=layout.growth.seeds.filter(c=>s.states[c.id].owner<0),small=Math.min(...neutral.map(c=>c.area)),large=Math.max(...neutral.map(c=>c.area));for(const c of neutral){const ratio=large===small?0:(c.area-small)/(large-small);s.states[c.id].troops=Math.round(s.config.neutralTroopsMin+ratio*(s.config.neutralTroopsMax-s.config.neutralTroopsMin));}}

 let id=0;for(const type of Object.keys(CARDS))for(let i=0;i<s.config.copies[type];i++)s.deck.push({id:id++,type});
 s.actions=s.config.actionsPerTurn;shuffle(s,s.deck);draw(s,0,s.config.startingHand);draw(s,1,s.config.startingHand);s.turn=Math.floor(random(s)*2);s.first=s.turn;passiveGrowth(s,true);draw(s,s.turn,s.config.drawPerTurn);
 s.log=[`${s.players[s.turn].name} opens: drew ${s.config.drawPerTurn} cards. Control ${s.config.monumentsToWin} monuments or eliminate your opponent to win. ${growthSummary(s.config)}`];return s;
}
export const livingPlayers=s=>s.players.map((_,i)=>i).filter(i=>s.states.some(t=>t.owner===i));
export const standings=s=>s.players.map((p,id)=>({id,name:p.name,states:s.states.filter(t=>t.owner===id).length,troops:s.states.filter(t=>t.owner===id).reduce((a,t)=>a+t.troops,0),monuments:s.states.filter(t=>t.owner===id&&t.building==='monument').length})).sort((a,b)=>b.states-a.states);
export function movementRoute(s,actor,source,target){
 if(!Number.isInteger(source)||!Number.isInteger(target)||source===target||s.states[source]?.owner!==actor||s.states[target]?.owner!==actor)return null;
 const queue=[source],previous=new Map([[source,null]]);for(const id of queue){for(const t of s.states)if(t.owner===actor&&!previous.has(t.id)&&adjacent(s.states[id],t)){previous.set(t.id,id);if(t.id===target){const route=[target];while(route[0]!==source)route.unshift(previous.get(route[0]));return route;}queue.push(t.id);}}return null;
}
export function movementPreview(s,actor,source,target,amount){const route=movementRoute(s,actor,source,target),a=s.states[source];if(!route)fail('Choose a different owned province connected through friendly land.');if(!Number.isInteger(amount)||amount<1||amount>=a.troops)fail('Move active troops only and leave at least 1 behind.');return {route,amount,remaining:a.troops-amount,destination:s.states[target].troops+amount};}
export function legalTarget(s,actor,type,id){
 const t=s.states[id];if(!t)return false;const near=s.states.some(a=>a.owner===actor&&adjacent(a,t));
 if(type==='move')return t.owner===actor&&t.troops>1&&s.states.some(other=>movementRoute(s,actor,id,other.id));
 if(CARDS[type]?.value)return t.owner===actor;
 if(type==='barracks'||type==='monument')return t.owner===actor&&!t.building&&(type!=='monument'||t.troops>=s.config.monumentMinTroops);
 if(type==='breakSiege')return t.owner===actor&&t.besieged;
 if(type==='attack'||type==='capture')return t.owner!==actor&&s.states.some(a=>a.owner===actor&&a.troops>1&&adjacent(a,t));
 if(t.owner<0||t.owner===actor||!near)return false;
 if(type==='sabotage')return t.troops>0;
 if(type==='demolish')return t.building==='barracks';
 if(type==='siege')return !!t.building&&!t.besieged;
 return false;
}
export function attackPreview(s,source,target,amount){const a=s.states[source],b=s.states[target];if(!a||!b||!adjacent(a,b)||!Number.isInteger(amount)||amount<1||amount>=a.troops)fail('Choose adjacent provinces and leave at least one active troop behind.');return {capture:amount>b.troops,survivors:Math.max(0,amount-b.troops),remaining:Math.max(0,b.troops-amount)};}
export const troopContribution=(t,config)=>t?.troops>1?Math.min(t.troops-1,Math.max(1,Math.floor(t.troops*(config.attackPercent??50)/100))):0;
export function multiAttackPreview(s,actor,target,sourceIds){
 const t=s.states[target];if(!t||t.owner===actor)fail('Choose enemy or neutral land.');
 if(!Array.isArray(sourceIds)||!sourceIds.length||sourceIds.length>s.states.length||new Set(sourceIds).size!==sourceIds.length)fail('Select distinct attacking provinces.');
 const contributions=sourceIds.map(id=>{const a=s.states[id];if(!Number.isInteger(id)||a?.owner!==actor||!adjacent(a,t)||!troopContribution(a,s.config))fail('Each source must be an adjacent owned province with at least 2 active troops.');return {source:id,amount:troopContribution(a,s.config)};});
 const total=contributions.reduce((n,c)=>n+c.amount,0);return {contributions,total,capture:total>t.troops,survivors:Math.max(0,total-t.troops),remaining:Math.max(0,t.troops-total)};
}
function checkVictory(s){for(let i=0;i<2;i++){if(s.states.filter(t=>t.owner===i&&t.building==='monument').length>=s.config.monumentsToWin){s.winner=i;s.winReason=`${s.config.monumentsToWin} monuments`;}else if(!s.states.some(t=>t.owner===1-i)){s.winner=i;s.winReason='annihilation';}}}
export function applyCommand(input,actor,cmd){
 const s=structuredClone(input);if(s.winner!==null)fail('The match has ended.');if(cmd.revision!==s.revision)fail('The board changed. Try again.');const p=s.players[actor];if(!p)fail('Unknown player.');const log=m=>s.log.unshift(m);
 if(s.pendingSiege){
  const q=s.pendingSiege;if(actor!==s.states[q.target].owner||!['counterSiege','allowSiege'].includes(cmd.type))fail('Waiting for the defender to respond to Siege.');
  if(cmd.type==='counterSiege'){const i=p.hand.findIndex(c=>c.id===cmd.card&&c.type==='breakSiege');if(i<0)fail('Choose Break Siege from your hand.');s.discard.push(...p.hand.splice(i,1));log(`${p.name} countered Siege.`);}
  else{const t=s.states[q.target],blocked=siegeBlocked(t.troops,s.config);t.troops-=blocked;t.blocked=(t.blocked||0)+blocked;t.besieged=true;log(`${p.name} accepted Siege: ${blocked} troops blocked.`);}
  s.pendingSiege=null;
 }else{
  if(actor!==s.turn)fail('Wait for your turn.');
  if(cmd.type==='discard'){if(p.hand.length<=s.config.handLimit)fail(`Discard only when above ${s.config.handLimit} cards.`);const i=p.hand.findIndex(c=>c.id===cmd.card);if(i<0)fail('Choose a card from your hand.');s.discard.push(...p.hand.splice(i,1));}
  else if(cmd.type==='end'){
   if(p.hand.length>s.config.handLimit)fail(`Discard down to ${s.config.handLimit} before ending your turn.`);s.turn=1-actor;s.actions=s.config.actionsPerTurn;if(s.turn===s.first)s.round++;
   let barracksGain=0;for(const t of s.states)if(t.owner===s.turn&&t.building==='barracks'&&!t.besieged){t.troops+=s.config.barracksProduction;barracksGain+=s.config.barracksProduction;}
   const passive=passiveGrowth(s),beforeDraw=s.players[s.turn].hand.length,drawCount=beforeDraw===0?(s.config.emptyHandDraw??5):s.config.drawPerTurn;draw(s,s.turn,drawCount);s.lastDrawCount=s.players[s.turn].hand.length-beforeDraw;log(`${s.players[s.turn].name}'s turn: drew ${s.lastDrawCount} cards.${barracksGain?` Barracks added ${barracksGain} troops.`:''}${passive?` Passive growth added ${passive} troops.`:''}`);
  }else if(cmd.type==='play'){
   if(s.actions<1)fail('No card plays left. End your turn.');const card=p.hand.find(c=>c.id===cmd.card);if(!card)fail('Choose a card from your hand.');
   if(!Number.isInteger(cmd.target)||!(card.type==='move'?s.states[cmd.target]?.owner===actor:legalTarget(s,actor,card.type,cmd.target)))fail('Choose a highlighted province.');
   const t=s.states[cmd.target];let cost=1;const spent=[card.id];
   if(cmd.booster!=null&&!CARDS[card.type]?.value)fail('Double only pairs with reinforcements.');
   if(CARDS[card.type]?.value){let n=CARDS[card.type].value;if(cmd.booster!=null){const boost=p.hand.find(c=>c.id===cmd.booster&&c.type==='double');if(!boost||s.actions<2)fail('Double requires its own card and a second play.');n*=2;cost=2;spent.push(boost.id);}t.troops+=n;log(`${p.name} reinforced ${label(t)} (+${n}).`);}
   else if(card.type==='move'){const r=movementPreview(s,actor,cmd.source,cmd.target,cmd.amount);s.states[cmd.source].troops=r.remaining;t.troops=r.destination;log(`${p.name} moved ${r.amount} active troops from ${label(s.states[cmd.source])} to ${label(t)}.`);}
   else if(card.type==='barracks'||card.type==='monument'){t.building=card.type;t.buildingCard={...card};log(`${p.name} built ${card.type} at ${label(t)}.`);}
   else if(card.type==='sabotage'){const loss=Math.min(s.config.sabotageDamage,t.troops);t.troops-=loss;log(`${p.name} sabotaged ${label(t)} (-${loss} active troops).`);}
   else if(card.type==='demolish'){if(t.buildingCard)s.discard.push(t.buildingCard);t.buildingCard=null;t.building=null;log(`${p.name} demolished the barracks at ${label(t)}.`);}
   else if(card.type==='siege'){s.pendingSiege={target:t.id,attacker:actor};log(`${p.name} besieges ${label(t)} — defender may counter.`);}
   else if(card.type==='breakSiege'){t.troops+=t.blocked||0;t.blocked=0;t.besieged=false;log(`${p.name} broke the siege at ${label(t)}.`);}
   else if(card.type==='attack'||card.type==='capture'){
    const result=multiAttackPreview(s,actor,cmd.target,cmd.sources);for(const part of result.contributions)s.states[part.source].troops-=part.amount;
    if(result.capture){t.owner=actor;t.troops=result.survivors;t.blocked=0;t.besieged=false;if(card.type==='attack'){if(t.buildingCard)s.discard.push(t.buildingCard);t.buildingCard=null;t.building=null;}}else t.troops=result.remaining;
    log(`${p.name} used ${CARDS[card.type].name} at ${label(t)}: ${result.capture?'captured with '+result.survivors:result.remaining+' active defenders remain'}.`);
   }else fail('Pair Double with a reinforcement card.');
   s.discard.push(...p.hand.filter(c=>spent.includes(c.id)&&!['barracks','monument'].includes(c.type)));p.hand=p.hand.filter(c=>!spent.includes(c.id));s.actions-=cost;
  }else fail('Unknown command.');
 }
 checkVictory(s);s.revision++;s.log=s.log.slice(0,25);return s;
}
export function viewFor(s,viewer){const v=structuredClone(s);v.deckCount=v.deck.length;delete v.deck;delete v.rng;v.players=v.players.map((p,i)=>({...p,handCount:p.hand.length,hand:i===viewer?p.hand:undefined}));return v;}
