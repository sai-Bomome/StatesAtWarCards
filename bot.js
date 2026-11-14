import {CARDS,adjacent,legalTarget,multiAttackPreview,troopContribution,movementRoute} from './game.js';

// Only public board information and this player's private hand are needed.
export function chooseBotCommand(s,actor=1){
 if(s.winner!==null)return null;
 const hand=s.players[actor]?.hand||[];
 if(s.pendingSiege){if(s.states[s.pendingSiege.target].owner!==actor)return null;const counter=hand.find(c=>c.type==='breakSiege');return counter?{type:'counterSiege',card:counter.id}:{type:'allowSiege'};}
 if(s.turn!==actor)return null;
 const own=s.states.filter(t=>t.owner===actor),front=t=>s.states.some(n=>n.owner!==actor&&adjacent(t,n)),monuments=own.filter(t=>t.building==='monument').length,candidates=[];
 const add=(score,card,target,extra={})=>candidates.push({score,cmd:{type:'play',card:card.id,target,...extra}});
 const frontDistance=new Map(own.filter(front).map(t=>[t.id,0])),queue=[...frontDistance.keys()];for(const id of queue)for(const t of own)if(!frontDistance.has(t.id)&&adjacent(s.states[id],t)){frontDistance.set(t.id,frontDistance.get(id)+1);queue.push(t.id);}
 if(s.actions>0)for(const card of hand){
  if(card.type==='move'){
   for(const source of own)if(source.troops>1)for(const target of own){const from=frontDistance.get(source.id),to=frontDistance.get(target.id);if(from===undefined||to===undefined||from<=to||!movementRoute(s,actor,source.id,target.id))continue;const amount=source.troops-(source.building==='monument'?Math.max(1,s.config.monumentMinTroops):1);if(amount>0)add(19+Math.min(amount,15),card,target.id,{source:source.id,amount});}continue;
  }
  for(const t of s.states){if(!legalTarget(s,actor,card.type,t.id))continue;
   if(card.type==='attack'||card.type==='capture'){
    const sources=own.filter(a=>adjacent(a,t)&&troopContribution(a,s.config)>0).map(a=>a.id),r=multiAttackPreview(s,actor,t.id,sources);if(!r.capture)continue;
    const enemy=t.owner>=0,building=t.building==='monument'?60:t.building==='barracks'?12:0;
    let score=(enemy?48:35)+building+Math.min(r.survivors,10);
    if(card.type==='capture')score+=t.building?20:-8;
    if(card.type==='capture'&&t.building==='monument'&&monuments+1>=s.config.monumentsToWin)score+=1000;
    if(enemy&&s.states.filter(p=>p.owner===t.owner).length===1)score+=1000;
    add(score,card,t.id,{sources});
   }else if(CARDS[card.type]?.value){
    const value=CARDS[card.type].value,threat=front(t),score=10+Math.min(value,10)+(threat?10:0)+(t.building==='monument'?10:0);
    add(score,card,t.id);const double=hand.find(c=>c.type==='double');if(double&&s.actions>=2&&value>=2)add(score+5,card,t.id,{booster:double.id});
   }else if(card.type==='monument')add(monuments+1>=s.config.monumentsToWin?1100:85,card,t.id);
   else if(card.type==='barracks')add(28+(front(t)?3:0),card,t.id);
   else if(card.type==='breakSiege')add(45+(t.building==='monument'?30:0)+Math.min(t.blocked||0,15),card,t.id);
   else if(card.type==='siege'){
    if(t.troops<2&&t.building!=='barracks')continue;
    const follow=hand.some(c=>c.type==='capture'||c.type==='attack');add(17+Math.min(t.troops,20)+(t.building==='monument'?15:0)+(follow&&s.actions>=2?15:0),card,t.id);
   }else if(card.type==='sabotage')add(14+Math.min(t.troops,s.config.sabotageDamage),card,t.id);
   else if(card.type==='demolish')add(t.besieged?5:24,card,t.id);
  }
 }
 candidates.sort((a,b)=>b.score-a.score);
 if(candidates.length)return candidates[0].cmd;
 if(hand.length>s.config.handLimit){const keep=c=>({monument:100,capture:85,breakSiege:65,attack:60,move:40,barracks:45,siege:40,double:30,sabotage:20,demolish:15}[c.type]??(35+(CARDS[c.type]?.value||0)));const discard=[...hand].sort((a,b)=>keep(a)-keep(b)||a.id-b.id)[0];return {type:'discard',card:discard.id};}
 return {type:'end'};
}
