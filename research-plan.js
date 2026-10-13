export function researchPlan(rows){
 const primary=rows.filter(g=>g.tier==='Першочергове дослідження').slice(0,5);
 const reserve=rows.filter(g=>g.tier!=='Першочергове дослідження').slice(0,5);
 return {primary,reserve,all:[...primary,...reserve]};
}

export function planLabels(rows){const plan=researchPlan(rows),labels=new Map();plan.primary.forEach((g,i)=>labels.set(g.code,{text:`Топ-5 першочергових · №${i+1}`,kind:'primary'}));plan.reserve.forEach((g,i)=>labels.set(g.code,{text:`Топ-5 резервних · №${i+1}`,kind:'reserve'}));return labels}
