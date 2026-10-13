const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function warningsHTML(flags=[]){return flags.map(text=>`<span class="category-warning"><span class="warning-flag" role="img" aria-label="Суттєве зауваження">🚩</span><span>${esc(text)}</span></span>`).join('')}

export function notesHTML(notes=[]){return notes.map(text=>`<span class="category-note"><span aria-hidden="true">●</span><span>${esc(text)}</span></span>`).join('')}
