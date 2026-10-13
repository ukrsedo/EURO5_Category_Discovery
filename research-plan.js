export function researchPlan(rows){
 const primary=rows.filter(g=>g.tier==='Першочергове дослідження').slice(0,5);
 const reserve=rows.filter(g=>g.tier!=='Першочергове дослідження').slice(0,5);
 return {primary,reserve,all:[...primary,...reserve]};
}
