export function parseCPVExclusions(text){
 const result=[];
 for(const token of String(text).split(/[\s,;]+/).filter(Boolean)){
  const range=token.replace(/[–—]/g,'-').match(/^(\d{2})-(\d{2})$/);
  if(range){const a=Number(range[1]),b=Number(range[2]);if(a>b)throw Error('Некоректний діапазон CPV: '+token);for(let n=a;n<=b;n++)result.push(String(n).padStart(2,'0'))}
  else if(/^\d{2,8}$/.test(token))result.push(token);
  else throw Error('CPV: введіть префікси з 2–8 цифр або діапазон розділів, наприклад 45–98.');
 }
 return [...new Set(result)];
}
