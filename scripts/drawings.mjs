#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { parseCsv } from './lib/csv.mjs';
import { table } from './lib/format.mjs';

const entities=['drawings','revisions','reviews','transmittals','transmittal_items','notes','imports','audit_events'];
const reads={
 register:'select * from drawing_register order by number',
 'review-queue':'select * from review_queue order by due_on,number',
 'handover-check':'select * from handover_register order by reference',
 compliance:'select * from compliance_findings order by number,rule',
 dashboard:`select d.site,d.discipline,count(*)::int as drawings,count(*) filter(where a.id is null)::int as no_approved_revision from drawings d left join revisions a on a.drawing_id=d.id and a.status='approved' group by d.site,d.discipline order by d.site,d.discipline`,
 'revision-history':`select d.number,r.revision,r.sequence,r.status,r.file_ref,r.approved_by,r.approved_at,r.decision_ref from revisions r join drawings d on d.id=r.drawing_id order by d.number,r.sequence`,
 'file-register':`select d.number,r.revision,r.status,r.file_ref from revisions r join drawings d on d.id=r.drawing_id order by d.number,r.sequence`,
 'activity':`select entity,record_id,action,actor,created_at from audit_events order by created_at desc,id`,
 attention:`select number as record,'Overdue review' as issue,reviewer as owner,days_overdue as days from review_queue where days_overdue>0
 union all select reference,'Acknowledgement overdue',recipient,days_overdue from handover_register where acknowledged_at is null and days_overdue>0
 union all select reference,'Superseded drawing in handover',recipient,0 from handover_register where superseded_items>0
 union all select d.number,'No note in 14 days',d.owner,current_date-max(n.created_at)::date from drawings d join notes n on n.drawing_id=d.id group by d.id having max(n.created_at)<now()-interval '14 days' order by record,issue`
};
export const questions=[
 'Which safety-critical drawings have an overdue review and missing design information?',
 'Which recipients still hold a superseded drawing revision?',
 'Which sites have drawings without an approved revision?',
 'Which reviewers have the largest overdue queue?',
 'Which assets have several drawings but no approved revision for at least one?',
 'Which approved revisions have never appeared in a handover?',
 'Which drawings have both an approved revision and newer work in progress?',
 'Which unacknowledged handovers are overdue and contain superseded drawings?',
 'Which drawing owners have a note older than fourteen days?',
 'Which imported drawings still need their first local review?'
];
const insightSql=[
 `select q.number,q.reviewer,q.days_overdue from review_queue q where q.safety_critical and q.days_overdue>0 and exists(select 1 from compliance_findings c where c.number=q.number and c.rule='DESIGN-INFORMATION')`,
 `select t.recipient,t.reference,d.number,r.revision from transmittals t join transmittal_items i on i.transmittal_id=t.id join revisions r on r.id=i.revision_id join drawings d on d.id=r.drawing_id where r.status='superseded' order by t.reference`,
 `select site,count(*)::int as drawings_without_approval from drawing_register where approved_revision is null group by site order by site`,
 `select reviewer,count(*)::int as overdue_reviews,max(days_overdue) as oldest_days from review_queue where days_overdue>0 group by reviewer order by overdue_reviews desc,reviewer`,
 `select asset,count(*)::int as drawings,count(*) filter(where approved_revision is null)::int as missing_approval from drawing_register where asset<>'' group by asset having count(*)>1 and count(*) filter(where approved_revision is null)>0 order by asset`,
 `select d.number,r.revision from revisions r join drawings d on d.id=r.drawing_id where r.status='approved' and not exists(select 1 from transmittal_items i where i.revision_id=r.id) order by d.number`,
 `select number,approved_revision,latest_revision,latest_status from drawing_register where approved_revision is not null and latest_revision<>approved_revision order by number`,
 `select reference,recipient,days_overdue,superseded_items from handover_register where acknowledged_at is null and days_overdue>0 and superseded_items>0 order by reference`,
 `select d.number,d.owner,max(n.created_at)::date as last_note from drawings d join notes n on n.drawing_id=d.id group by d.id having max(n.created_at)<now()-interval '14 days' order by d.number`,
 `select d.number,d.source_id from drawings d where source_id is not null and not exists(select 1 from reviews rv join revisions r on r.id=rv.revision_id where r.drawing_id=d.id) order by d.number`
];
function required(o,k){const v=o[k];if(typeof v!=='string'||!v.trim())throw Error(`Missing --${k}`);return v.trim();}
function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`Invalid date: ${v}`);return v;}
function bool(v){if(!['true','false'].includes(String(v)))throw Error('Use true or false for --critical');return String(v)==='true';}
async function resolve(db,entity,value){
 if(!value)throw Error(`Specify a ${entity} reference`);
 const name=entity==='drawings'?'number':entity==='transmittals'?'reference':entity==='reviews'?'reviewer':'revision';
 const rows=await db.query(`select * from ${entity} where id::text=$1 or lower(${name})=lower($1) order by id`,[value]);
 if(rows.length===1)return rows[0];
 const found=rows.length?rows:await db.query(`select * from ${entity} where starts_with(id::text,lower($1)) or strpos(lower(${name}),lower($1))>0 ${entity==='drawings'?'or strpos(lower(title),lower($1))>0':''} order by id`,[value]);
 if(found.length!==1)throw Error(found.length?`Ambiguous ${entity}: ${found.map(r=>`${r.id} ${r[name]}`).join('; ')}`:`No ${entity} matched ${value}`);
 return found[0];
}
async function audit(db,entity,after,before,action,actor){await db.query('insert into audit_events(entity,record_id,action,actor,before_row,after_row) values($1,$2,$3,$4,$5,$6)',[entity,after.id,action,actor,before?JSON.stringify(before):null,JSON.stringify(after)]);}
async function insert(db,entity,values,actor){const keys=Object.keys(values);const [r]=await db.query(`insert into ${entity}(${keys.join(',')}) values(${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(values));await audit(db,entity,r,null,'create',actor);return r;}
async function update(db,entity,before,values,actor){const keys=Object.keys(values);const [r]=await db.query(`update ${entity} set ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')} where id=$${keys.length+1} returning *`,[...Object.values(values),before.id]);await audit(db,entity,r,before,'update',actor);return r;}
async function transaction(db,fn,dry=false){await db.exec('BEGIN');try{await db.exec('LOCK TABLE drawings,revisions,reviews,transmittals,transmittal_items,imports IN SHARE ROW EXCLUSIVE MODE');const r=await fn();await db.exec(dry?'ROLLBACK':'COMMIT');return r;}catch(e){await db.exec('ROLLBACK');throw e;}}
function draft(name,content){const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true,mode:0o700});const p=path.join(dir,`${name}-${Date.now()}.md`);fs.writeFileSync(p,content,{mode:0o600,flag:'wx'});return {draft:p};}
// Skip one CSV record, including any quoted newlines, to retain the human labels in RedEye's two-header format.
function withoutFirstRecord(text){let quoted=false;for(let i=0;i<text.length;i++){if(text[i]==='"'){if(quoted&&text[i+1]==='"')i++;else quoted=!quoted;}if(!quoted&&(text[i]==='\n'||text[i]==='\r'))return text.slice(i+(text[i]==='\r'&&text[i+1]==='\n'?2:1));}throw Error('Two-header CSV requires a metadata-label row');}
async function importRedeye(db,o,actor){
 const original=fs.readFileSync(path.resolve(required(o,'file')),'utf8');
 const headers=o.headers||'2';if(!['1','2'].includes(headers))throw Error('--headers must be 1 or 2');
 const rows=parseCsv(headers==='2'?withoutFirstRecord(original):original);if(!rows.length)throw Error('No export rows');
 const mapping=o.map?JSON.parse(fs.readFileSync(path.resolve(o.map),'utf8')):{id:'Artefact ID',number:'Number',title:'Title',revision:'Revision',site:'Site',discipline:'Discipline',asset:'Asset',owner:'Owner',file_ref:'File Reference'};
 for(const k of ['id','number','title','revision'])if(typeof mapping[k]!=='string'||!Object.hasOwn(rows[0],mapping[k]))throw Error(`Missing export column for ${k}; use --map with your RedEye metadata labels`);
 for(const [k,column] of Object.entries(mapping))if(typeof column!=='string')throw Error(`Invalid mapping ${k}`);
 const digest=createHash('sha256').update(original+JSON.stringify(mapping)).digest('hex');
 const get=(row,k)=>String(row[mapping[k]]||'').trim();let created=0,unchanged=0;const seen=new Set();
 for(const row of rows){
  const id=get(row,'id');for(const k of ['id','number','title','revision'])if(!get(row,k))throw Error(`Blank ${k} for source ${id||'(unknown)'}`);
  if(seen.has(id))throw Error(`Duplicate source ID ${id}`);seen.add(id);
  const [old]=await db.query('select * from drawings where source_id=$1',[id]);
  const raw={row,mapping,headers};
  if(old){if(JSON.stringify(old.raw_source)!==JSON.stringify(JSON.parse(JSON.stringify(raw)))){
    // jsonb key order is database-defined; compare canonical keys recursively.
    if(canonical(old.raw_source)!==canonical(raw))throw Error(`Changed source ${id}: reconcile explicitly before importing`);
   }unchanged++;continue;}
  const d=await insert(db,'drawings',{source_id:id,safety_critical:true,number:get(row,'number'),title:get(row,'title'),site:get(row,'site'),discipline:get(row,'discipline'),asset:get(row,'asset'),owner:get(row,'owner'),raw_source:JSON.stringify(raw)},actor);
  await insert(db,'revisions',{drawing_id:d.id,revision:get(row,'revision'),sequence:1,file_ref:get(row,'file_ref'),purpose:'Imported metadata snapshot; verify against the original drawing'},actor);created++;
 }
 if(!(await db.query('select id from imports where digest=$1',[digest])).length)await insert(db,'imports',{digest,source:'redeye',original_csv:original,mapping:JSON.stringify(mapping),actor,row_count:rows.length},actor);
 return {created,unchanged,rows:rows.length,dry_run:Boolean(o['dry-run'])};
}
function canonical(v){return JSON.stringify(v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(canonical(v[k]))])):v);}
export async function execute(db,cmd,arg,o={}){
 if(cmd==='help')return {reads:Object.keys(reads),commands:['drawing','insights','add','update-drawing','set-evidence','revise','submit-review','record-review','approve','transmit','acknowledge','log','import','export','weekly-review','draft-transmittal','draft-review'],usage:'node scripts/drawings.mjs <command> [reference] --key=value --json; docs/cli.md lists fields'};
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='drawing'){const d=await resolve(db,'drawings',arg);return {drawing:d,revisions:await db.query('select * from revisions where drawing_id=$1 order by sequence',[d.id]),notes:await db.query('select * from notes where drawing_id=$1 order by created_at',[d.id])};}
 if(cmd==='insights'){const result=[];for(let i=0;i<questions.length;i++)result.push({question:questions[i],rows:await db.query(insightSql[i])});return result;}
 if(cmd==='export'){await db.exec('BEGIN READ ONLY');try{const result={format:'drawing-control/v1',exported_at:new Date().toISOString()};for(const e of entities)result[e]=await db.query(`select * from ${e} order by id`);return result;}finally{await db.exec('ROLLBACK');}}
 if(cmd==='weekly-review'){const result={};for(const c of ['dashboard','attention','compliance'])result[c]=await execute(db,c);return draft('weekly-review','# Weekly drawing review\n\nDRAFT. Review facts before sharing.\n\n'+formatOutput(result));}
 if(cmd==='draft-transmittal'){const t=await resolve(db,'transmittals',arg);const items=await db.query('select d.number,d.title,r.revision,r.status,r.file_ref,r.risk_ref,r.safe_use_ref from transmittal_items i join revisions r on r.id=i.revision_id join drawings d on d.id=r.drawing_id where i.transmittal_id=$1 order by d.number',[t.id]);return draft('transmittal','# Draft transmittal cover sheet\n\nNothing sent. Confirm revision status and file contents before issue.\n\n'+formatOutput({transmittal:t,items}));}
 if(cmd==='draft-review'){const d=await execute(db,'drawing',arg);return draft('review','# Draft drawing review request\n\nNothing sent. A qualified reviewer must assess the actual drawing.\n\n'+formatOutput(d));}
 const allowed=['add','update-drawing','set-evidence','revise','submit-review','record-review','approve','transmit','acknowledge','log','import'];if(!allowed.includes(cmd))throw Error(`Unknown command ${cmd}; use help`);
 const actor=required(o,'actor');
 return transaction(db,async()=>{
  if(cmd==='add')return insert(db,'drawings',{number:required(o,'number'),title:required(o,'title'),site:required(o,'site'),discipline:required(o,'discipline'),asset:o.asset||'',owner:required(o,'owner'),safety_critical:bool(o.critical||'false')},actor);
  if(cmd==='update-drawing'){
   const d=await resolve(db,'drawings',arg);const values={};
   for(const k of ['title','site','discipline','asset','owner'])if(o[k]!==undefined)values[k]=required(o,k);
   if(o.critical!==undefined){values.safety_critical=bool(o.critical);if((await db.query("select id from revisions where drawing_id=$1 and status='approved'",[d.id])).length)throw Error('Safety classification cannot change while an approved revision exists');}
   if(!Object.keys(values).length)throw Error('Provide a drawing field to change');
   return update(db,'drawings',d,values,actor);
  }
  if(cmd==='set-evidence'){
   const r=await resolve(db,'revisions',arg);if(r.status!=='draft')throw Error('Evidence can only change before review; create a new revision after review starts');
   const values={};for(const [flag,col] of Object.entries({file:'file_ref',purpose:'purpose',risk:'risk_ref','safe-use':'safe_use_ref'}))if(o[flag]!==undefined)values[col]=required(o,flag);
   if(!Object.keys(values).length)throw Error('Provide an evidence reference');return update(db,'revisions',r,values,actor);
  }
  if(cmd==='revise'){
   const d=await resolve(db,'drawings',arg);const [{sequence}]=await db.query('select coalesce(max(sequence),0)+1 as sequence from revisions where drawing_id=$1',[d.id]);
   return insert(db,'revisions',{drawing_id:d.id,revision:required(o,'revision'),sequence,file_ref:required(o,'file'),purpose:required(o,'purpose'),risk_ref:o.risk||'',safe_use_ref:o['safe-use']||''},actor);
  }
  if(cmd==='submit-review'){
   const r=await resolve(db,'revisions',arg);if(!['draft','in_review'].includes(r.status))throw Error('Reviews can only be added to a draft or revision in review');
   const rv=await insert(db,'reviews',{revision_id:r.id,reviewer:required(o,'reviewer'),due_on:date(required(o,'due'))},actor);
   if(r.status==='draft')await update(db,'revisions',r,{status:'in_review'},actor);return rv;
  }
  if(cmd==='record-review'){
   const rv=await resolve(db,'reviews',arg);if(rv.status!=='pending')throw Error('A recorded review cannot be overwritten; create a new revision');
   if(actor.toLowerCase()!==rv.reviewer.toLowerCase())throw Error('Actor must match the recorded reviewer; actor is an operator label, not authentication');
   const decision=required(o,'decision');if(!['accepted','rejected'].includes(decision))throw Error('Decision must be accepted or rejected');
   const [r]=await db.query('select * from revisions where id=$1',[rv.revision_id]);if(r.status!=='in_review')throw Error('Revision is not in review');
   return update(db,'reviews',rv,{status:decision,evidence:required(o,'evidence'),decided_at:new Date().toISOString()},actor);
  }
  if(cmd==='approve'){
   const r=await resolve(db,'revisions',arg);if(r.status!=='in_review')throw Error('Only a revision in review can be approved');
   const [d]=await db.query('select * from drawings where id=$1',[r.drawing_id]);
   const reviews=await db.query('select * from reviews where revision_id=$1',[r.id]);if(!reviews.length||reviews.some(v=>v.status!=='accepted'))throw Error('All assigned reviews must be accepted before approval');
   if(!r.file_ref.trim()||!r.purpose.trim())throw Error('File and purpose references are required');
   if(d.safety_critical&&(!r.risk_ref.trim()||!r.safe_use_ref.trim()))throw Error('Safety-critical drawing needs risk and safe-use references');
   const [{latest}]=await db.query('select max(sequence) as latest from revisions where drawing_id=$1',[d.id]);if(r.sequence!==latest)throw Error('Only the latest revision can be approved');
   const evidence=required(o,'evidence');for(const old of await db.query("select * from revisions where drawing_id=$1 and status='approved'",[d.id]))await update(db,'revisions',old,{status:'superseded'},actor);
   return update(db,'revisions',r,{status:'approved',approved_by:actor,approved_at:new Date().toISOString(),decision_ref:evidence},actor);
  }
  if(cmd==='transmit'){
   const ids=required(o,'revisions').split(',').map(x=>x.trim());const revisions=[];
   for(const id of ids){const r=await resolve(db,'revisions',id);if(r.status!=='approved')throw Error('Handover records require current approved revisions');revisions.push(r);}
   if(new Set(revisions.map(r=>r.id)).size!==revisions.length)throw Error('Repeated revision in handover');
   const t=await insert(db,'transmittals',{reference:required(o,'reference'),recipient:required(o,'recipient'),purpose:required(o,'purpose'),due_on:date(required(o,'due')),recorded_by:actor},actor);
   for(const r of revisions)await insert(db,'transmittal_items',{transmittal_id:t.id,revision_id:r.id},actor);return {...t,note:'Record only. Nothing sent.'};
  }
  if(cmd==='acknowledge'){
   const t=await resolve(db,'transmittals',arg);if(t.acknowledged_at)throw Error('Acknowledgement already recorded');
   return update(db,'transmittals',t,{acknowledged_at:new Date().toISOString(),acknowledgement_ref:required(o,'evidence')},actor);
  }
  if(cmd==='log'){const d=await resolve(db,'drawings',arg);return insert(db,'notes',{drawing_id:d.id,actor,body:required(o,'note')},actor);}
  if(cmd==='import'){if(arg!=='redeye')throw Error('Supported import: redeye');return importRedeye(db,o,actor);}
 },Boolean(o['dry-run']));
}
export function formatOutput(value){
 if(Array.isArray(value)){if(!value.length)return '(none)';if(value[0]?.question)return value.map(x=>x.question+'\n'+formatOutput(x.rows)).join('\n\n');return table(value,Object.keys(value[0]).filter(k=>!['raw_source','before_row','after_row','original_csv'].includes(k)).map(key=>({key,label:key,width:70,format:v=>typeof v==='object'&&v!==null?JSON.stringify(v):v})));}
 if(value&&typeof value==='object')return Object.entries(value).map(([k,v])=>`${k}: ${v&&typeof v==='object'?'\n'+formatOutput(Array.isArray(v)?v:[v]):v??''}`).join('\n');return String(value??'');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const positional=[],o={};for(const a of process.argv.slice(2)){if(a.startsWith('--')){const i=a.indexOf('=');o[a.slice(2,i<0?undefined:i)]=i<0?true:a.slice(i+1);}else positional.push(a);}
 let db;try{db=await getDb();const result=await execute(db,o.help?'help':positional[0]||'help',positional[1],o);console.log(o.json?JSON.stringify(result,null,2):formatOutput(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
