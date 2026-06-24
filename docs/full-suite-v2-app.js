(()=>{
const VERSION='full-suite-2026-06-24-3';
const CONFIG_KEY='pm_erp_supabase_config_v3';
const state={spec:[],mods:{},sb:null,ok:false,records:[],logs:[],active:'dashboard',edit:'',search:'',notice:''};
const statuses=['新建','處理中','待審核','已完成','逾期','取消'];
const moneyMods=new Set(['opportunities','quotations','contracts','invoices','payments','expenses','purchases']);
const $=id=>document.getElementById(id);
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():'id_'+Date.now()+Math.random().toString(16).slice(2);
const today=()=>new Date().toISOString().slice(0,10);
const num=v=>Number(String(v||'').replace(/,/g,''))||0;
const money=v=>'NT$ '+num(v).toLocaleString('zh-TW');
const rows=m=>state.records.filter(r=>r.module===m);
const by=id=>state.records.find(r=>r.id===id);
const label=m=>state.mods[m]?.label||m;
const titleOf=(m,d={})=>{const f=(state.mods[m]?.fields||[]).find(x=>/名稱|姓名|主題|紀錄|項目|標題/.test(x));return d[f]||d.name||'未命名'};
const sum=(m,f)=>rows(m).reduce((s,r)=>s+num(r.data?.[f]),0);

document.addEventListener('DOMContentLoaded',init);
async function init(){
  try{const res=await fetch('erp-full-suite-spec.json?v='+VERSION);const json=await res.json();state.spec=json.modules||[];state.mods=Object.fromEntries(state.spec.map(m=>[m.key,m]));const saved=JSON.parse(localStorage.getItem(CONFIG_KEY)||'null')||JSON.parse(localStorage.getItem('pm-erp-full-config')||'null');if(saved?.url&&saved?.key)await connect(saved,true);else render();}
  catch(e){state.notice='初始化失敗：'+e.message;render();}
}
async function connect(cfg,silent=false){
  const url=cfg?.url||document.querySelector('[name=url]')?.value.trim();
  const key=cfg?.key||document.querySelector('[name=key]')?.value.trim();
  if(!url||!key)return notice('請填 Supabase URL 與 Publishable / anon key');
  try{
    state.sb=window.supabase.createClient(url,key,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
    const session=await state.sb.auth.getSession();
    if(!session.data.session){const anon=await state.sb.auth.signInAnonymously();if(anon.error)throw anon.error;}
    localStorage.setItem(CONFIG_KEY,JSON.stringify({url,key}));state.ok=true;await load();if(!silent)notice('Supabase 已連線，全模組可使用','ok');
  }catch(e){state.ok=false;state.sb=null;notice('連線失敗：'+e.message+'。請確認已執行 supabase/full-suite-schema.sql 並開啟 Anonymous Sign-Ins。','bad');}
  render();
}
async function load(){
  if(!state.sb)return;
  const r=await state.sb.from('erp_records').select('id,module,data,created_at,updated_at').order('updated_at',{ascending:false});
  if(r.error)throw new Error('讀取 erp_records 失敗：'+r.error.message);
  const a=await state.sb.from('erp_activity').select('id,module,record_id,action,note,created_at').order('created_at',{ascending:false}).limit(200);
  if(a.error)throw new Error('讀取 erp_activity 失敗：'+a.error.message);
  state.records=r.data||[];state.logs=a.data||[];
}
function notice(text,type=''){state.notice=text;state.noticeType=type;}
function render(){
  $('app').innerHTML=`<aside class="sidebar"><div class="brand"><b>Project ERP</b><span>${VERSION}</span></div>${connection()}<nav class="nav">${nav('dashboard','老闆總覽')}${state.spec.map(m=>nav(m.key,m.label)).join('')}${nav('activity','稽核紀錄')}${nav('help','系統說明')}</nav></aside><main class="main"><header class="top"><div><h1>${pageTitle()}</h1><p class="muted">${state.ok?'Supabase-only。所有資料寫入 erp_records / erp_activity。':'請先連線 Supabase，系統已關閉本機資料模式。'}</p></div><div class="bar"><button class="btn" data-a="reload">重新整理</button><button class="btn" data-a="export">匯出 JSON</button><label class="btn">匯入 JSON<input type="file" hidden accept="application/json" data-a="import"></label><button class="btn primary" data-a="seed">建立示範資料</button></div></header>${state.notice?`<div class="notice ${state.noticeType||''}">${h(state.notice)}</div>`:''}${state.ok?page():locked()}</main>`;
  bind();
}
function connection(){
  const c=JSON.parse(localStorage.getItem(CONFIG_KEY)||'null')||{};
  if(state.ok)return `<section class="connect ok"><b><span class="dot ok"></span>Supabase 已連線</b><small>ERP 業務資料不存本機，只寫雲端。</small><button class="btn" data-a="disconnect">清除連線</button></section>`;
  return `<section class="connect"><b><span class="dot"></span>Supabase 連線</b><small>貼 Project URL 與 Publishable key，不要貼 Secret key。</small><form class="form" data-a="connect"><label>Supabase URL<input name="url" required value="${h(c.url||'')}" placeholder="https://xxxx.supabase.co"></label><label>Publishable / anon key<input name="key" required value="${h(c.key||'')}" placeholder="sb_publishable_..."></label><button class="btn primary">連線</button></form></section>`;
}
function nav(k,t){return `<button class="nav-item ${state.active===k?'on':''}" data-tab="${k}">${h(t)}</button>`;}
function pageTitle(){return state.active==='dashboard'?'老闆總覽':state.active==='activity'?'稽核紀錄':state.active==='help'?'系統說明':label(state.active);}
function locked(){return `<section class="panel"><h2>請先連線 Supabase</h2><p class="muted">本機模式已關閉。請先在 Supabase SQL Editor 執行 <code>supabase/full-suite-schema.sql</code>，並開啟 Anonymous Sign-Ins。</p></section>`;}
function page(){if(state.active==='dashboard')return dashboard();if(state.active==='activity')return activity();if(state.active==='help')return help();return modulePage(state.active);}
function kpis(){const paid=sum('payments','金額')||sum('payments','收款金額');const inv=sum('invoices','金額');const exp=sum('expenses','金額');const risk=rows('risks').filter(r=>!['已完成','取消'].includes(r.data?.status)).length;return [['專案',rows('projects').length],['任務',rows('tasks').length],['待收款',money(Math.max(inv-paid,0))],['已收款',money(paid)],['支出',money(exp)],['毛利估算',money(paid-exp)],['風險',risk],['商機金額',money(sum('opportunities','預估金額'))]].map(x=>`<div class="kpi"><small>${h(x[0])}</small><b>${h(x[1])}</b></div>`).join('');}
function dashboard(){const urgent=state.records.filter(r=>/逾期|急件|風險|卡關|待審核/.test(JSON.stringify(r.data))).slice(0,8);return `<section class="kpis">${kpis()}</section><section class="dashboard-grid"><div class="panel"><h2>風險與急件</h2><div class="list">${urgent.map(card).join('')||empty('目前沒有急件')}</div></div><div class="panel"><h2>最近更新</h2><div class="list">${state.records.slice(0,12).map(card).join('')||empty('尚無資料')}</div></div></section>`;}
function modulePage(k){const m=state.mods[k];const list=rows(k).filter(r=>JSON.stringify(r.data).toLowerCase().includes(state.search.toLowerCase()));return `<section class="module-layout"><div class="panel form-panel"><h2>${state.edit?'編輯':'新增'}${h(m.label)}</h2>${form(k,state.edit?by(state.edit):null)}</div><div class="panel"><div class="panel-head"><h2>${h(m.label)}列表</h2><input placeholder="搜尋" value="${h(state.search)}" data-a="search"></div>${k==='tasks'?kanban(list):`<div class="list">${list.map(card).join('')||empty('尚無資料')}</div>`}</div></section>`;}
function form(k,r){const m=state.mods[k],d=r?.data||{};return `<form class="record-form" data-save="${k}" data-id="${r?.id||''}"><label>狀態<select name="status">${statuses.map(s=>`<option ${d.status===s?'selected':''}>${s}</option>`).join('')}</select></label>${m.fields.map(f=>field(f,d[f])).join('')}<div class="form-actions"><button class="btn primary">儲存</button>${r?'<button class="btn" type="button" data-a="cancel">取消</button>':''}</div></form>`;}
function field(f,v=''){if(/備註|摘要|說明|原因|解法|內容|決議|待辦|處理|規格|清單|條款/.test(f))return `<label>${h(f)}<textarea name="${h(f)}">${h(v)}</textarea></label>`;const type=/金額|稅額|成本|預算|進度|工時|天數|率|機率/.test(f)?'number':/日|期限|到期|簽約|開始|結束|到貨/.test(f)?'date':'text';return `<label>${h(f)}<input name="${h(f)}" type="${type}" value="${h(v)}"></label>`;}
function card(r){const d=r.data||{},name=titleOf(r.module,d),cls=/已完成|已收款|已核准/.test(d.status)?'ok':/逾期|取消|駁回|流失/.test(d.status)?'bad':'';const meta=Object.entries(d).filter(([k,v])=>k!=='status'&&v&&v!==name).slice(0,5).map(([k,v])=>`${h(k)}：${h(v)}`).join('｜');return `<article class="record-card"><div class="record-head"><div><h3>${h(name)}</h3><p>${h(label(r.module))}｜${meta}</p></div><span class="pill ${cls}">${h(d.status||'')}</span></div><div class="record-actions"><button class="btn small" data-edit="${r.id}">編輯</button><select data-status="${r.id}">${statuses.map(s=>`<option ${d.status===s?'selected':''}>${s}</option>`).join('')}</select><button class="btn small danger" data-del="${r.id}">刪除</button></div></article>`;}
function kanban(list){return `<div class="kanban">${statuses.slice(0,5).map(s=>`<section><h3>${s}</h3>${list.filter(r=>(r.data?.status||'新建')===s).map(card).join('')||empty('無')}</section>`).join('')}</div>`;}
function activity(){return `<section class="panel"><h2>稽核紀錄</h2><div class="list">${state.logs.map(a=>`<article class="item"><h3>${h(a.action)}｜${h(label(a.module))}</h3><div class="meta">${new Date(a.created_at).toLocaleString('zh-TW')}｜${h(a.note)}</div></article>`).join('')||empty('尚無紀錄')}</div></section>`;}
function help(){return `<section class="panel"><h2>系統說明</h2><p class="muted">這是 Supabase-only 全模組 PM ERP。支援 20+ 模組、全模組 CRUD、老闆 KPI、任務 Kanban、稽核紀錄、JSON 匯入匯出與示範資料。</p></section>`;}
function empty(t){return `<div class="empty">${h(t)}</div>`;}
function bind(){document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.active=b.dataset.tab;state.edit='';state.search='';render();});document.querySelectorAll('[data-save]').forEach(f=>f.onsubmit=saveForm);document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{state.edit=b.dataset.edit;render();});document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>remove(b.dataset.del));document.querySelectorAll('[data-status]').forEach(s=>s.onchange=()=>setStatus(s.dataset.status,s.value));document.querySelectorAll('[data-a=connect]').forEach(f=>f.onsubmit=e=>{e.preventDefault();connect();});const search=document.querySelector('[data-a=search]');if(search)search.oninput=e=>{state.search=e.target.value;render();};document.querySelectorAll('[data-a]').forEach(el=>{if(el.dataset.a==='reload')el.onclick=async()=>{await load();render();};if(el.dataset.a==='disconnect')el.onclick=()=>{localStorage.removeItem(CONFIG_KEY);location.reload();};if(el.dataset.a==='export')el.onclick=exportJson;if(el.dataset.a==='import')el.onchange=importJson;if(el.dataset.a==='seed')el.onclick=seed;if(el.dataset.a==='cancel')el.onclick=()=>{state.edit='';render();};});}
async function saveForm(e){e.preventDefault();if(!state.ok)return alert('請先連線 Supabase');const fd=new FormData(e.target),data={};for(const [k,v] of fd.entries())data[k]=v;const id=e.target.dataset.id||uid(),module=e.target.dataset.save;const res=await state.sb.from('erp_records').upsert({id,module,data});if(res.error)return alert('儲存失敗：'+res.error.message);await log(module,id,e.target.dataset.id?'更新':'新增',titleOf(module,data));state.edit='';await load();render();}
async function remove(id){if(!confirm('確定刪除？'))return;const r=by(id);const res=await state.sb.from('erp_records').delete().eq('id',id);if(res.error)return alert(res.error.message);await log(r?.module||'',id,'刪除',titleOf(r?.module,r?.data));await load();render();}
async function setStatus(id,status){const r=by(id);if(!r)return;r.data={...r.data,status};const res=await state.sb.from('erp_records').upsert({id,module:r.module,data:r.data});if(res.error)return alert(res.error.message);await log(r.module,id,'狀態變更',status);await load();render();}
async function log(module,record_id,action,note){await state.sb.from('erp_activity').insert({id:uid(),module,record_id,action,note});}
async function seed(){if(!state.ok)return alert('請先連線 Supabase');const items=[['clients',{'客戶名稱':'示範客戶 A','負責業務':'Leo','產業':'科技','分級':'A','來源':'展會',status:'處理中'}],['opportunities',{'商機名稱':'網站改版案','客戶':'示範客戶 A','負責業務':'Leo','預估金額':280000,'成交率':60,status:'處理中'}],['projects',{'專案名稱':'PM ERP 建置','客戶':'內部','PM':'Leo','預算':500000,'成本':120000,'進度':35,'截止日':today(),status:'處理中'}],['tasks',{'任務名稱':'完成 Supabase 串接','專案':'PM ERP 建置','負責人':'Leo','優先級':'急件','期限':today(),'工時':6,status:'待審核'}],['invoices',{'請款名稱':'第一期款','專案':'PM ERP 建置','金額':150000,'稅額':7500,'到期日':today(),status:'新建'}],['expenses',{'支出項目':'開發成本','專案':'PM ERP 建置','廠商':'內部','金額':50000,'日期':today(),status:'新建'}],['risks',{'風險名稱':'需求範圍過大','專案':'PM ERP 建置','負責人':'Leo','影響':'高','機率':70,'處理方式':'分期開發',status:'處理中'}]];for(const [module,data] of items){const id=uid();await state.sb.from('erp_records').insert({id,module,data});await log(module,id,'建立示範資料',titleOf(module,data));}await load();render();}
function exportJson(){const blob=new Blob([JSON.stringify({version:VERSION,records:state.records},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='project-erp-backup.json';a.click();}
async function importJson(e){const file=e.target.files?.[0];if(!file)return;const json=JSON.parse(await file.text());for(const r of json.records||[])await state.sb.from('erp_records').upsert({id:r.id||uid(),module:r.module,data:r.data||{}});await load();render();}
window.PMERP={reload:load};
})();