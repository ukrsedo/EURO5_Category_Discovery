import assert from 'node:assert/strict';
import {BiSession,dateSerial} from '../bi.js';
const endDate=new Date();endDate.setUTCDate(endDate.getUTCDate()-1);const end=endDate.toISOString().slice(0,10),startDate=new Date(endDate);startDate.setUTCDate(startDate.getUTCDate()-1);const start=startDate.toISOString().slice(0,10),origin=dateSerial(start);
const headers=['Ідентифікатор лота','Класифікація CPV','Поточна сума договорів лота','Кіль-ть унікальних учасників лота'];
class Fake extends BiSession{
 constructor(perDay,broken=false){super();this.perDay=perDay;this.pages=0;this.closed=false;this.broken=broken}
 async connect(){this.socket={readyState:1}}
 async coverage(){return end}
 async init(){this.cube=1}
 async interval(a,b){this.a=a;this.b=b;return (b-a+1)*this.perDay}
 close(){this.closed=true}
 async rpc(h,method,p){if(method==='GetLayout')return {qLayout:{qHyperCube:{qSize:{qcx:4,qcy:(this.b-this.a+1)*this.perDay},qDimensionInfo:headers.map(qFallbackTitle=>({qFallbackTitle})),qMeasureInfo:[]}}};assert.equal(method,'GetHyperCubeData');assert((this.b-this.a+1)*this.perDay<=100000);this.pages++;const page=p.qPages[0];return {qDataPages:[{qMatrix:Array.from({length:page.qHeight-(this.broken?1:0)},(_,i)=>[{qText:'lot-'+((this.a-origin)*this.perDay+page.qTop+i)},{qText:'44110000'},{qNum:300000},{qNum:2}])}]}}
}
const run=(s,callback,extra={})=>s.download({region:'Україна',start,end,signal:new AbortController().signal,onLargeSelection:callback,...extra});
let prompts=0;const exact=new Fake(50000);assert.equal((await run(exact,()=>{prompts++;return true})).rows.length,100000);assert.equal(prompts,0);
const large=new Fake(50001);let progress;const data=await run(large,async info=>{assert.equal(info.count,100002);assert.equal(large.pages,0);prompts++;return true},{onProgress:p=>progress=p});assert.equal(data.parts,2);assert.equal(data.rows.length,100002);assert.equal(progress.total,100002);assert.equal(progress.loaded,100002);assert(large.closed);
const cancelled=new Fake(50001);await assert.rejects(run(cancelled,()=>false),/не розпочато/);assert.equal(cancelled.pages,0);assert(cancelled.closed);
const overDay=new Fake(100001);await assert.rejects(overDay.download({region:'Україна',start:end,end,signal:new AbortController().signal,onLargeSelection:()=>true}),/За одну добу/);assert.equal(overDay.pages,0);
const controller=new AbortController(),aborted=new Fake(50001);await assert.rejects(run(aborted,()=>{controller.abort();return true},{signal:controller.signal}),/зупинено/);assert.equal(aborted.pages,0);
const broken=new Fake(4,true);await assert.rejects(run(broken),/Неповна сторінка/);assert(broken.closed);
console.log('PASS: 100k boundary, pre-download approval, 100,002 rows in two parts, progress, cancel, abort, daily cap, incomplete page');
