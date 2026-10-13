import {apiURL} from './api.js';
export async function requestAI(input){const res=await fetch(apiURL('/api/ai/analyze'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,categories:input.categories.map(({samples,...category})=>category)}),signal:AbortSignal.timeout(110000)});const data=await res.json();if(!res.ok||!data.result)throw Error(data.error||'Не вдалося отримати аналіз ШІ.');return data}
export function lotInput(r){return{id:r['Ідентифікатор лота'],title:String(r['Лот']||'').slice(0,1200),cpv:r['Класифікація CPV'],status:r['Статус лота']}}
export function categoryInput(g,region){
 const seen=new Set(),samples=[];
 const rows=[...g.lots].sort((a,b)=>Number(String(b['Поточна сума договорів лота']||0).replace(/\s/g,'').replace(',','.'))-Number(String(a['Поточна сума договорів лота']||0).replace(/\s/g,'').replace(',','.')));
 for(const row of rows){const lot=lotInput(row),key=lot.title.trim().toLowerCase();if(key&&!seen.has(key)){seen.add(key);samples.push({...lot,title:lot.title.slice(0,400)})}if(samples.length===3)break}
 return{id:region+' | '+g.code,region,cpv:g.code,name:g.name,rule_priority:g.tier,metrics:{score:g.score,monthly_contracts:g.monthly,completed:g.done,unsuccessful:g.failed,competition:g.mean,success_rate:g.success,supplier_cr1:g.cr1,supplier_cr3:g.cr3,supplier_hhi:g.hhi,buyer_cr1:g.buyer1,buyer_count:g.buyerList.length,supplier_count:g.vendorList.length,zero_participant_lots:g.zero,observed_competitive_lots:g.observed},flags:g.flags,buyers:g.buyerList.slice(0,3).map(x=>({name:x.name,share:g.sum?x.sum/g.sum:0})),suppliers:g.vendorList.slice(0,3).map(x=>({name:x.name,share:g.sum?x.sum/g.sum:0})),samples,sample_scope:'До 3 різних назв лотів, відібраних за спаданням суми договорів. Приклади не характеризують частку товарів у категорії.'}
}
export function recommendationBrief(mode){return{
 purpose:'Вибрати товарні напрямки для наступного дослідження ЄВРО5 за попитом, успішністю тендерів, кількістю учасників та концентрацією постачальників. Без аналізу собівартості.',
 decision_questions:mode==='combined'?[
 'У якій області почати дослідження конкретної категорії та які надані показники відрізняють її від інших областей?',
 'Які напрямки доречні для спільного дослідження кількох областей, а які залежать від одного замовника?',
 'Який конкретний наступний крок прив’язаний до назви товару, лота, замовника чи постачальника з даних?'
 ]:[
 'Які категорії дослідити першими і який показник або конкретний товар у наданих даних робить їх кращими за альтернативи?',
 'Для яких категорій висновок обмежений малою вибіркою, концентрацією замовників чи постачальників або неоднозначним складом товарів?',
 'Який конкретний наступний крок прив’язаний до назви товару, лота, замовника чи постачальника з даних?'
 ],
 desired_focus:'До 6 конкретних рекомендацій. Кожна стосується однієї категорії; у порівнянні областей — одного CPV. Пояснення прив’язане до переданих показників. Наступна дія називає конкретний товар або учасника з даних та результат перевірки. Загальне «перевірити лоти» без уточнення не вирішує задачу.',
 boundaries:'Назви лотів є прикладами, а не доказом частоти. Не припускаємо наявність ліцензій, регулювання, компетенцій ЄВРО5 чи гарантованого доступу до ринку.'
}}
