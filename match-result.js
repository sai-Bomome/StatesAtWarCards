const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function matchResult(state,viewer){
 if(state.winner===null)return '';
 const won=state.winner===viewer,winner=state.players[state.winner].name,loser=state.players[1-state.winner].name,prosperity=state.winReason!=='annihilation',required=state.config.monumentsToWin;
 const headingId=`result-heading-${state.winner}-${viewer}`,heading=won?'Victory':'Defeat',reason=prosperity?'Prosperity victory':'Complete annihilation',explanation=prosperity?`${winner} controls ${required} monuments—the number required to win.`:`${loser} has no provinces remaining. ${winner} captured their last province.`;
 return `<section class="match-result ${won?'result-victory':'result-defeat'}" role="status" aria-live="polite" aria-labelledby="${headingId}"><h1 id="${headingId}">${heading}</h1><p class="result-winner">${escapeHtml(winner)} wins</p><div class="result-reason"><h2>${reason}</h2><p class="result-explanation">${escapeHtml(explanation)}</p></div><button id="again" class="primary">Back to lobby</button></section>`;
}
