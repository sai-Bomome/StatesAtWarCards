import {adjacent, label, CARDS, multiAttackPreview, movementRoute} from './game.js';

// Presentation is derived from accepted commands, never from animation completion.
export function describeMove(before, after, command) {
  if (after.revision !== before.revision + 1) return null;
  const actor = before.pendingSiege ? before.states[before.pendingSiege.target].owner : before.turn;
  const name = before.players[actor].name;
  const event = {id: after.revision, actor, kind: command.type, summary: '', marks: [], arrow: null};
  if (command.type === 'end') {
    event.kind = after.winner === null ? 'turn' : 'victory';
    const gains=after.troopGains||[];
    for(const t of after.states){const old=before.states[t.id],parts=gains.filter(g=>g.target===t.id);if(t.troops>old.troops)event.marks.push({target:t.id,kind:'gain',text:'+'+(t.troops-old.troops),source:parts.length?parts.map(g=>`${g.source} +${g.amount}`).join(' · '):'Turn growth'});}
    event.summary = after.winner === null
      ? `${after.players[after.turn].name}'s turn · drew ${after.lastDrawCount??after.config.drawPerTurn} cards · ${after.config.actionsPerTurn} plays`
      : `${after.players[after.winner].name} wins: ${after.winReason}`;
    const totals=new Map();for(const g of gains)totals.set(g.source,(totals.get(g.source)||0)+g.amount);if(totals.size)event.summary+=' · '+[...totals].map(([source,n])=>`${source} +${n}`).join(' · ');
  } else if (['allowSiege','counterSiege'].includes(command.type)) {
    event.cards=command.type==='counterSiege'?['breakSiege']:[];event.summary=command.type==='counterSiege'?`${name} played Break Siege · cancelled Siege`:after.log[0];event.kind='siege';event.marks.push({target:before.pendingSiege.target,kind:'gain',text:command.type==='counterSiege'?'Cancelled':'Blocked',source:command.type==='counterSiege'?'Break Siege':'Siege'});
  } else if (command.type === 'discard') {
    event.summary = `${name} discarded a card`;
  } else if (command.type === 'play') {
    const card = before.players[actor].hand.find(c => c.id === command.card);
    if (!card) return null;
    event.kind = card.type;event.cards=[card.type];if(command.booster!=null&&before.players[actor].hand.some(c=>c.id===command.booster&&c.type==='double'))event.cards.push('double');
    const old = before.states[command.target], next = after.states[command.target];
    if(card.type==='move'){
      const route=movementRoute(before,actor,command.source,command.target);event.arrows=route.slice(1).map((id,i)=>({from:route[i],to:id,amount:command.amount}));event.summary=`${name} played Move Troops · ${label(before.states[command.source])} → ${label(next)} · moved ${command.amount} active troops`;event.marks.push({target:command.source,kind:'spent',text:`−${command.amount}`,source:'Move Troops'},{target:command.target,kind:'gain',text:`+${command.amount}`,source:'Move Troops'});
    } else if (CARDS[card.type]?.value) {
      event.summary = `${name} played ${CARDS[card.type].name}${event.cards.includes('double')?' + Double Reinforcements':''} · ${label(next)} · ${old.troops} → ${next.troops} active troops`;
      event.marks.push({target: next.id, kind: 'gain', text: '+'+(next.troops-old.troops),source:event.cards.includes('double')?'Double Reinforcements':'Reinforcements'});
    } else if (!['attack','capture'].includes(card.type)) {
      event.summary=`${name} played ${CARDS[card.type].name} · ${after.log[0]}`;event.marks.push({target:next.id,kind:'gain',text:card.type==='breakSiege'?`+${next.troops-old.troops}`:CARDS[card.type].name,source:card.type==='breakSiege'?'Break Siege · unblocked':undefined});
    } else {
      const parts=command.sources!==undefined?multiAttackPreview(before,actor,command.target,command.sources).contributions:[{source:command.source,amount:command.amount}];
      const total=parts.reduce((n,p)=>n+p.amount,0),losses=Math.min(total,old.troops),captured=next.owner!==old.owner;
      const arrows=parts.map(p=>({from:p.source,to:next.id,amount:p.amount}));
      if(command.sources!==undefined)event.arrows=arrows;else event.arrow=arrows[0];
      event.summary=`${name} played ${CARDS[card.type].name}: ${parts.map(p=>label(before.states[p.source])).join(' + ')} → ${label(next)} · sent ${total} · each side lost ${losses} · ${captured?`captured with ${next.troops} ${next.troops===1?'survivor':'survivors'}`:`${next.troops} defenders remain; no capture`}`;
      for(const p of parts)event.marks.push({target:p.source,kind:'spent',text:`−${p.amount}`,source:CARDS[card.type].name});
      event.marks.push({target:next.id,kind:captured?'capture':'damage',text:captured?`⚑ ${next.troops}`:`−${losses}`,source:CARDS[card.type].name});
    }
  } else return null;
  return event;
}

// Prefer a source that can capture, then the strongest source. Commit just enough
// for a capture by default, leaving the rest safe; all choices remain adjustable.
export function suggestAttack(state, actor, targetId) {
  const target = state.states[targetId];
  const candidates = state.states.filter(t => t.owner === actor && t.troops > 1 && adjacent(t, target))
    .sort((a, b) => b.troops - a.troops || a.id - b.id);
  if (!candidates.length) return null;
  const source = candidates[0];
  return {source: source.id, amount: Math.min(source.troops - 1, target.troops + 1)};
}
