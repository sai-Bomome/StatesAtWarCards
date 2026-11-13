import {adjacent, label, CARDS} from './game.js';

// Presentation is derived from accepted commands, never from animation completion.
export function describeMove(before, after, command) {
  if (after.revision !== before.revision + 1) return null;
  const actor = before.pendingSiege ? before.states[before.pendingSiege.target].owner : before.turn;
  const name = before.players[actor].name;
  const event = {id: after.revision, actor, kind: command.type, summary: '', marks: [], arrow: null};
  if (command.type === 'end') {
    event.kind = after.winner === null ? 'turn' : 'victory';
    for(const t of after.states){const old=before.states[t.id];if(t.troops>old.troops)event.marks.push({target:t.id,kind:'gain',text:'+'+(t.troops-old.troops)});}
    event.summary = after.winner === null
      ? `${after.players[after.turn].name}'s turn · drew ${after.config.drawPerTurn} cards · ${after.config.actionsPerTurn} plays`
      : `${after.players[after.winner].name} wins: ${after.winReason}`;
  } else if (['allowSiege','counterSiege'].includes(command.type)) {
    event.summary=after.log[0];event.kind='siege';event.marks.push({target:before.pendingSiege.target,kind:'gain',text:command.type==='counterSiege'?'Unblocked':'Siege'});
  } else if (command.type === 'discard') {
    event.summary = `${name} discarded a card`;
  } else if (command.type === 'play') {
    const card = before.players[actor].hand.find(c => c.id === command.card);
    if (!card) return null;
    event.kind = card.type;
    const old = before.states[command.target], next = after.states[command.target];
    if (CARDS[card.type]?.value) {
      event.summary = `${name} reinforced ${label(next)} · ${old.troops} → ${next.troops} active troops`;
      event.marks.push({target: next.id, kind: 'gain', text: '+'+(next.troops-old.troops)});
    } else if (!['attack','capture'].includes(card.type)) {
      event.summary=after.log[0];event.marks.push({target:next.id,kind:'gain',text:CARDS[card.type].name});
    } else {
      const from = before.states[command.source];
      const losses = Math.min(command.amount, old.troops);
      const captured = next.owner !== old.owner;
      event.arrow = {from: from.id, to: next.id, amount: command.amount};
      event.summary = `${name}: ${label(from)} → ${label(next)} · sent ${command.amount} · each side lost ${losses} · ${captured ? `captured with ${next.troops} ${next.troops===1?'survivor':'survivors'}` : `${next.troops} defenders remain; no capture`}`;
      event.marks.push({target: from.id, kind: 'spent', text: `−${command.amount}`});
      event.marks.push({target: next.id, kind: captured ? 'capture' : 'damage', text: captured ? `⚑ ${next.troops}` : `−${losses}`});
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
