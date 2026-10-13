import {apiURL} from './api.js';
export async function requestAI(input){const res=await fetch(apiURL('/api/ai/analyze'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,categories:input.categories.map(({samples,...category})=>category)}),signal:AbortSignal.timeout(110000)});const data=await res.json();if(!res.ok||!data.result)throw Error(data.error||'Не вдалося отримати аналіз ШІ.');return data}
export function lotInput(r){return{id:r['Ідентифікатор лота'],title:String(r['Лот']||'').slice(0,1200),cpv:r['Класифікація CPV'],status:r['Статус лота']}}
export function categoryInput(g,region){
 const seen=new Set(),samples=[];
 const rows=[...g.lots].sort((a,b)=>Number(String(b['Поточна сума договорів лота']||0).replace(/\s/g,'').replace(',','.'))-Number(String(a['Поточна сума договорів лота']||0).replace(/\s/g,'').replace(',','.')));
 for(const row of rows){const lot=lotInput(row),key=lot.title.trim().toLowerCase();if(key&&!seen.has(key)){seen.add(key);samples.push({...lot,title:lot.title.slice(0,400)})}if(samples.length===3)break}
 return{id:region+' | '+g.code,region,cpv:g.code,name:g.name,rule_priority:g.tier,metrics:{score:g.score,monthly_contracts:g.monthly,completed:g.done,unsuccessful:g.failed,competition:g.mean,success_rate:g.success,supplier_cr1:g.cr1,supplier_cr3:g.cr3,supplier_hhi:g.hhi,buyer_cr1:g.buyer1,buyer_count:g.buyerList.length,supplier_count:g.vendorList.length,zero_participant_lots:g.zero,observed_competitive_lots:g.observed},flags:g.flags,sample_notes:g.notes||[],period_days:g.period_days,short_period:g.short_period,buyers:g.buyerList.slice(0,3).map(x=>({name:x.name,share:g.sum?x.sum/g.sum:0})),suppliers:g.vendorList.slice(0,3).map(x=>({name:x.name,share:g.sum?x.sum/g.sum:0})),samples,sample_scope:'До 3 різних назв лотів, відібраних за спаданням суми договорів. Приклади не характеризують частку товарів у категорії.'}
}
export function recommendationBrief(){return{
 purpose:'Пояснити наданий розрахований план дослідження ЄВРО5. Пріоритет кожної категорії вже визначений у rule_priority. Не обирай власних першочергових категорій, не змінюй пріоритет і не ранжуй їх повторно.',
 decision_questions:[
 'Який конкретний склад товарів видно у прикладах цієї категорії та що у складі ще не визначено?',
 'Що саме треба перевірити щодо flags та sample_notes? Для short_period=true концентрація і мала кількість лотів — обмеження короткої вибірки, а не доведені сталі бар’єри категорії.',
 'Яка наступна дія прив’язана до конкретного товару, лота, замовника чи постачальника з цієї категорії та який результат перевірки потрібен?'
 ],
 desired_focus:'Рівно одне findings для кожної переданої категорії. evidence_ids містить ID тільки цієї категорії. comment пояснює склад товарів та обмеження, next_check — одну конкретну дію. Для резерву поясни, що перевірити перед дослідженням. Для першочергових поясни, з чого почати перевірку. Не пропонуй окремого списку, не порівнюй категорії та не рекомендуй інший порядок. summary залиш коротким: пояснення доповнюють розрахований план.',
 boundaries:'Не повторюй числові показники: їх відображає програма. Назви лотів є прикладами, а не доказом частоти. Не припускай ліцензій, регулювання, компетенцій ЄВРО5, гарантованого доступу до ринку або собівартості.'
}}
