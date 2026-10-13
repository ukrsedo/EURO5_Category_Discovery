import {warningsHTML} from './warnings.js';
import {formatNumber as fmt} from './format.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=n=>n===null||n===undefined?'—':fmt(n*100,1)+'%';
function facts(c){const m=c.metrics;return `<div class="ai-facts"><span>Договори / місяць: <b>${fmt(m.monthly_contracts/1e6,2)} млн грн</b></span><span>Успішність тендерів: <b>${pct(m.success_rate)}</b></span><span>Учасники: <b>${fmt(m.competition,2)}</b></span><span>Концентрація постачальників — №1: <b>${pct(m.supplier_cr1)}</b></span><span>Завершено: <b>${fmt(m.completed)}</b></span><span>Найбільший замовник: <b>${pct(m.buyer_cr1)}</b></span></div>`}
export function reportHTML(data){
 const cats=data.categories||[],lots=data.context_lots||[];
 const rows=data.findings.map((f,index)=>{
  const refs=cats.filter(c=>f.evidence_ids.includes(c.id)||lots.some(l=>l.category_id===c.id&&f.evidence_ids.includes(l.id)));
  return `<article class="ai-recommendation"><div class="ai-recommendation-head"><span class="ai-number">${fmt(index+1)}</span><h3>${esc(refs.length?refs.map(c=>c.name).filter((x,i,a)=>a.indexOf(x)===i).join(' / '):f.title)}</h3></div>${refs.map(c=>`<p class="ai-geography">${esc(c.region)} · CPV ${esc(c.cpv)} · Оцінка за правилами: <b>${esc(c.rule_priority)}</b></p>${facts(c)}${warningsHTML(c.flags)}`).join('')}<div class="ai-conclusion"><h4>Висновок ШІ</h4><p>${esc(f.comment)}</p></div><div class="ai-next-step"><h4>Наступна дія</h4><p>${esc(f.next_check)}</p></div>${refs.map(c=>`<details><summary>Товарні приклади та учасники</summary><p><b>Замовники:</b> ${c.buyers.map(x=>esc(x.name)+' ('+pct(x.share)+')').join('; ')||'—'}</p><p><b>Постачальники:</b> ${c.suppliers.map(x=>esc(x.name)+' ('+pct(x.share)+')').join('; ')||'—'}</p><p><b>Приклади лотів:</b></p>${c.samples.map(l=>`<p>${esc(l.title)} <small>${esc(l.id)}</small></p>`).join('')}<small>${esc(c.sample_scope)}</small></details>`).join('')}${refs.length?'':`<small>Підстава: ${f.evidence_ids.map(esc).join('; ')}</small>`}</article>`
 });
 return `<div class="ai-overview"><h3>З чого почати</h3><p>${esc(data.summary)}</p></div>${data.scope_note?`<p class="form-hint">${esc(data.scope_note)}</p>`:''}<div class="ai-report-list">${rows.join('')}</div>`;
}

export function categoryCommentHTML(data,categoryId){
 if(!data)return '';
 const categories=data.categories||[],lots=data.context_lots||[];
 const findings=(data.findings||[]).filter(f=>{
  const matched=categories.filter(c=>(f.evidence_ids||[]).includes(c.id)||lots.some(l=>l.category_id===c.id&&(f.evidence_ids||[]).includes(l.id)));
  return matched.length===1&&matched[0].id===categoryId;
 });
 if(!findings.length)return '<p class="form-hint">ШІ не надав окремого пояснення цієї категорії. Розрахований пріоритет залишається чинним.</p>';
 return findings.map(f=>`<div class="ai-conclusion"><p>${esc(f.comment)}</p></div><div class="ai-next-step"><h4>Наступна дія</h4><p>${esc(f.next_check)}</p></div>`).join('');
}
