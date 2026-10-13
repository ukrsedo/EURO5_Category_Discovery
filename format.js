export function formatNumber(value, digits=0){
 if(value===null||value===undefined||!Number.isFinite(Number(value)))return '—';
 return Number(value).toLocaleString('uk-UA',{useGrouping:true,maximumFractionDigits:digits});
}
export function groupNumericInput(value){
 const raw=String(value).replace(/\s/g,'');
 if(!/^[+-]?\d*(?:[.,]\d*)?$/.test(raw))return String(value);
 const match=raw.match(/^([+-]?)(\d*)([.,]\d*)?$/);
 return match[1]+match[2].replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')+(match[3]||'');
}
