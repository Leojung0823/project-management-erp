(()=>{
const VERSION='trello-2026-06-24-pro-5',M='trello_boards',BOARD_SCHEMA_VERSION=2;
const h=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const id=()=>crypto.randomUUID(),$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const today=()=>new Date().toISOString().slice(0,10);
const colors=['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#ec4899','#64748b'];
let sb,boards=[],b,drag,q='',showArchived=false,activeCard='',view='board',filterMember='',filterLabel='',saveQueue=Promise.resolve();

const L=t=>({id:id(),t,c:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
const C=t=>normalizeCard({id:id(),t,d:'',due:'',members:[],labels:[],check:[],comments:[],activity:[],attachments:[],customFields:[],timeLogs:[],priority:'中',coverUrl:'',erpTaskId:'',lastSyncedAt:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
const defaultLabels=()=>[{id:id(),n:'急件',c:'#ef4444'},{id:id(),n:'客戶',c:'#3b82f6'},{id:id(),n:'財務',c:'#22c55e'},{id:id(),n:'設計',c:'#8b5cf6'}];
const empty=(title='PM ERP Trello')=>normalizeBoard({schemaVersion:BOARD_SCHEMA_VERSION,title,members:['Leo','PM','設計','業務'],labels:defaultLabels(),templates:[{id:id(),n:'客戶需求卡',d:'需求摘要：\n交付物：\n注意事項：',check:['確認需求','估工時','回覆客戶']},{id:id(),n:'設計任務卡',d:'設計方向：\n參考資料：\n輸出規格：',check:['收集參考','初稿','內部審核','交付']}],lists:[L('待辦'),L('進行中'),L('待確認'),L('完成')],archived:[],activity:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});

async function cfg(){
  try{await import('./supabase-default.js?v='+Date.now())}catch(e){}
  let c=JSON.parse(localStorage.getItem('pm_erp_supabase_config_v3')||'null')||{};
  return{u:c.url,k:c.key};
}
async function init(){
  try{
    let c=await cfg();
    if(!c.u||!c.k)throw new Error('找不到 Supabase 預設設定');
    sb=window.supabase.createClient(c.u,c.k,{auth:{persistSession:true,autoRefreshToken:true}});
    let ss=await sb.auth.getSession();
    if(!ss.data.session){let a=await sb.auth.signInAnonymously();if(a.error)throw a.error}
    await load();
  }catch(e){
    document.body.innerHTML='<div style="padding:30px;color:white">連線失敗：'+h(e.message)+'</div>';
  }
}
async function load(){
  let r=await sb.from('erp_records').select('id,data,updated_at').eq('module',M).order('updated_at',{ascending:false});
  if(r.error)throw r.error;
  boards=(r.data||[]).map(x=>normalizeBoard({id:x.id,...x.data}));
  if(!boards.length){b={id:id(),...empty()};boards=[b];await save(false)}
  let last=localStorage.getItem('pm_erp_active_board_id');
  b=boards.find(x=>x.id===last)||boards[0];
  draw();
}
function normalizeBoard(x={}){
  x.id=x.id||id();
  x.schemaVersion=BOARD_SCHEMA_VERSION;
  x.title=x.title||'未命名看板';
  x.members=Array.isArray(x.members)?x.members.filter(Boolean):['Leo','PM'];
  x.labels=Array.isArray(x.labels)&&x.labels.length?x.labels.map((l,i)=>({id:l.id||id(),n:l.n||l.name||`標籤${i+1}`,c:l.c||l.color||colors[i%colors.length]})):defaultLabels();
  x.templates=Array.isArray(x.templates)?x.templates.map(t=>({id:t.id||id(),n:t.n||t.name||'模板',d:t.d||'',check:Array.isArray(t.check)?t.check:[]})):[];
  x.lists=Array.isArray(x.lists)?x.lists.map(normalizeList):[];
  x.archived=Array.isArray(x.archived)?x.archived.map(normalizeCard):[];
  x.activity=Array.isArray(x.activity)?x.activity.map(normalizeActivity):[];
  x.createdAt=x.createdAt||new Date().toISOString();
  x.updatedAt=x.updatedAt||new Date().toISOString();
  return x;
}
function normalizeList(l={}){l.id=l.id||id();l.t=l.t||l.title||'未命名列表';l.c=Array.isArray(l.c)?l.c.map(normalizeCard):[];l.createdAt=l.createdAt||new Date().toISOString();l.updatedAt=l.updatedAt||new Date().toISOString();return l}
function normalizeActivity(a={}){let text=a.text||a.t||a.message||'';return{id:a.id||id(),type:a.type||a.action||'log',text,t:text,by:a.by||'我',at:a.at||a.createdAt||new Date().toISOString(),payload:a.payload||{}}}
function normalizeCard(c={}){c.id=c.id||id();c.t=c.t||c.title||'未命名卡片';c.d=c.d||c.description||'';c.due=c.due||'';c.members=Array.isArray(c.members)?c.members:[];c.labels=Array.isArray(c.labels)?c.labels:[];c.check=Array.isArray(c.check)?c.check.map(x=>({id:x.id||id(),t:x.t||x.text||'',done:!!x.done})):[];c.comments=Array.isArray(c.comments)?c.comments.map(x=>({id:x.id||id(),by:x.by||'我',t:x.t||x.text||'',at:x.at||new Date().toISOString()})):[];c.activity=Array.isArray(c.activity)?c.activity.map(normalizeActivity):[];c.attachments=Array.isArray(c.attachments)?c.attachments.map(x=>({id:x.id||id(),name:x.name||x.fileName||'附件',url:x.url||'',path:x.path||'',size:x.size||0,type:x.type||'',at:x.at||new Date().toISOString()})):[];c.customFields=Array.isArray(c.customFields)?c.customFields.map(x=>({id:x.id||id(),name:x.name||'欄位',value:x.value||''})):[];c.timeLogs=Array.isArray(c.timeLogs)?c.timeLogs.map(x=>({id:x.id||id(),hours:Number(x.hours)||0,note:x.note||'',at:x.at||new Date().toISOString()})):[];c.priority=c.priority||'中';c.coverUrl=c.coverUrl||'';c.erpTaskId=c.erpTaskId||'';c.lastSyncedAt=c.lastSyncedAt||'';c.createdAt=c.createdAt||new Date().toISOString();c.updatedAt=c.updatedAt||new Date().toISOString();return c}
async function save(redraw=true,msg=''){
  if(!b||!sb)return;
  if(msg)logBoard(msg);
  b=normalizeBoard(b);
  b.updatedAt=new Date().toISOString();
  const snapshot=JSON.parse(JSON.stringify(b));
  saveQueue=saveQueue.then(async()=>{
    const result=await sb.from('erp_records').upsert({id:snapshot.id,module:M,title:snapshot.title,data:snapshot});
    if(result.error)throw result.error;
  }).catch(error=>{console.error('Save failed',error);alert('儲存失敗：'+(error.message||error));});
  if(redraw)draw();
  return saveQueue;
}
function logBoard(t,type='board',payload={}){b.activity=b.activity||[];b.activity.unshift(normalizeActivity({type,text:t,by:'我',payload}));b.activity=b.activity.slice(0,100)}
function logCard(c,t,type='card',payload={}){c.activity=c.activity||[];c.activity.unshift(normalizeActivity({type,text:t,by:'我',payload}));c.activity=c.activity.slice(0,50);c.updatedAt=new Date().toISOString();logBoard(`${c.t}：${t}`,type,{cardId:c.id,...payload})}

function draw(){
  b=normalizeBoard(b);
  document.body.innerHTML=`<div class=app>
    <header class=top>
      <div class=brand>▦ Project ERP Trello</div>
      <select id=boards>${boards.map(x=>`<option value="${x.id}" ${x.id===b.id?'selected':''}>${h(x.title)}</option>`).join('')}</select>
      <input id=title value="${h(b.title)}">
      <div class=top-actions>
        <input class=search id=q placeholder="搜尋卡片 / 成員 / 標籤" value="${h(q)}">
        <select id=fm><option value="">全部成員</option>${b.members.map(m=>`<option ${filterMember===m?'selected':''}>${h(m)}</option>`).join('')}</select>
        <select id=fl><option value="">全部標籤</option>${b.labels.map(l=>`<option value="${l.id}" ${filterLabel===l.id?'selected':''}>${h(l.n)}</option>`).join('')}</select>
        <button class="btn ${view==='board'?'primary':''}" data-view=board>看板</button>
        <button class="btn ${view==='table'?'primary':''}" data-view=table>表格</button>
        <button class="btn ${view==='calendar'?'primary':''}" data-view=calendar>月曆</button>
        <button class=btn id=newBoard>+看板</button>
        <button class=btn id=copyBoard>複製</button>
        <button class=btn id=tpl>模板</button>
        <button class=btn id=al>+列表</button>
        <button class=btn id=member>成員</button>
        <button class=btn id=label>標籤</button>
        <button class=btn id=archive>${showArchived?'返回看板':'封存'}</button>
        <button class=btn id=seed>範例</button>
        <button class=btn id=rl>重整</button>
        <span class="status ok">Supabase 已連線</span>
      </div>
    </header>
    ${showArchived?archived():renderMain()}
    ${activeCard?modal(activeCard):''}
    <div id=toast class="toast hidden"></div>
  </div>`;
  bind();
}
function renderMain(){if(view==='table')return tableView();if(view==='calendar')return calendarView();return board()}
function board(){return`<main class=board>${b.lists.map((x,i)=>list(x,i)).join('')}<div class=add-list-wrap><button class=add-list id=al2>+ 新增另一個列表</button></div>${activityPanel()}</main>`}
function archived(){return`<main class=board><section class=list style="width:420px;min-width:420px"><div class=list-head><b>封存卡片</b><span class=count>${b.archived.length}</span></div><div class=cards>${b.archived.map(c=>card(c,'archived')).join('')||'<div class=empty>沒有封存卡片</div>'}</div></section>${activityPanel()}</main>`}
function list(l,idx){let cs=l.c.filter(match);return`<section class=list data-list=${l.id}><div class=list-head><input data-lt=${l.id} value="${h(l.t)}"><span class=count>${cs.length}</span><button class=list-menu data-lup=${idx}>↑</button><button class=list-menu data-ldn=${idx}>↓</button><button class=list-menu data-dl=${l.id}>×</button></div><div class=cards data-drop=${l.id}>${cs.map((c,i)=>card(c,l.id,i)).join('')||'<div class=empty>拖曳卡片到這裡</div>'}</div><button class=add-card data-ac=${l.id}>+ 新增卡片</button><button class=add-card data-tc=${l.id}>+ 從模板新增</button></section>`}
function match(c){let text=JSON.stringify(c).toLowerCase();return (!q||text.includes(q.toLowerCase()))&&(!filterMember||c.members.includes(filterMember))&&(!filterLabel||c.labels.includes(filterLabel))}
function card(c,l,i=0){
  let labs=(c.labels||[]).map(x=>lab(x)).join(''),done=(c.check||[]).filter(x=>x.done).length,total=(c.check||[]).length,over=c.due&&c.due<today()&&l!=='archived';
  return`<article class=card draggable=${l==='archived'?'false':'true'} data-c=${c.id} data-f=${l}>
    ${c.coverUrl?`<div class=card-cover style="background-image:url('${h(c.coverUrl)}')"></div>`:''}
    ${labs?'<div class=labels>'+labs+'</div>':''}
    <div class=card-title>${h(c.t)}</div>
    <div class=meta>${c.priority?'<span class=badge>⚑ '+h(c.priority)+'</span>':''}${c.d?'<span class=badge>📝</span>':''}${c.due?'<span class="badge '+(over?'overdue':'')+'">📅 '+h(c.due)+'</span>':''}${total?'<span class=badge>☑ '+done+'/'+total+'</span>':''}${c.comments.length?'<span class=badge>💬 '+c.comments.length+'</span>':''}${c.attachments.length?'<span class=badge>📎 '+c.attachments.length+'</span>':''}${c.timeLogs.length?'<span class=badge>⏱ '+c.timeLogs.reduce((s,x)=>s+(Number(x.hours)||0),0)+'h</span>':''}<span class=avatars>${(c.members||[]).map(a=>'<span class=avatar>'+h(a[0]||'?')+'</span>').join('')}</span></div>
    ${l!=='archived'?`<div class=mini-actions><button data-cu="${c.id}">↑</button><button data-cd="${c.id}">↓</button></div>`:''}
  </article>`;
}
function lab(i){let l=b.labels.find(x=>x.id===i)||b.labels.find(x=>x.n===i);return l?`<span title="${h(l.n)}" class=label style="background:${h(l.c)}"></span>`:''}
function tableView(){let all=allCards().filter(x=>match(x.c));return`<main class=board><section class=table-panel><h2>卡片表格</h2><table><thead><tr><th>標題</th><th>列表</th><th>到期日</th><th>成員</th><th>標籤</th><th>檢查</th></tr></thead><tbody>${all.map(({l,c})=>`<tr data-row="${c.id}"><td><b>${h(c.t)}</b><p>${h(c.d||'')}</p></td><td>${h(l.t)}</td><td>${h(c.due||'')}</td><td>${h((c.members||[]).join(', '))}</td><td>${(c.labels||[]).map(x=>{let y=b.labels.find(z=>z.id===x);return h(y?.n||'')}).join(', ')}</td><td>${(c.check||[]).filter(x=>x.done).length}/${(c.check||[]).length}</td></tr>`).join('')}</tbody></table></section>${activityPanel()}</main>`}
function calendarView(){let dated=allCards().filter(x=>x.c.due&&match(x.c)).sort((a,b)=>a.c.due.localeCompare(b.c.due));return`<main class=board><section class=calendar-panel><h2>到期日月曆</h2>${dated.map(({l,c})=>`<article class="calendar-card ${c.due<today()?'late':''}" data-row="${c.id}"><b>${h(c.due)}</b><span>${h(c.t)}</span><small>${h(l.t)}｜${h((c.members||[]).join(', '))}</small></article>`).join('')||'<div class=empty>沒有設定到期日的卡片</div>'}</section>${activityPanel()}</main>`}
function activityPanel(){return`<aside class=activity-panel><h3>活動紀錄</h3>${(b.activity||[]).slice(0,18).map(a=>`<p><b>${h(a.by)}</b> ${h(a.text||a.t)}<small>${h(new Date(a.at).toLocaleString('zh-TW'))}</small></p>`).join('')||'<div class=empty>尚無活動</div>'}</aside>`}
function FL(x){return b.lists.find(l=>l.id==x)}
function FC(x){for(let l of b.lists){let c=l.c.find(c=>c.id==x);if(c)return{l,c}}let c=b.archived.find(c=>c.id==x);return c?{l:{id:'archived',t:'封存',c:b.archived},c}:null}
function allCards(){return b.lists.flatMap(l=>l.c.map(c=>({l,c})))}
function bind(){
  on('#boards','change',e=>{b=boards.find(x=>x.id===e.target.value);localStorage.setItem('pm_erp_active_board_id',b.id);draw()});
  on('#title','change',e=>{b.title=e.target.value;save(true,'更改看板名稱')});
  on('#q','input',e=>{q=e.target.value;draw()});
  on('#fm','change',e=>{filterMember=e.target.value;draw()});
  on('#fl','change',e=>{filterLabel=e.target.value;draw()});
  $$('[data-view]').forEach(x=>x.onclick=()=>{view=x.dataset.view;draw()});
  on('#rl','click',load);on('#archive','click',()=>{showArchived=!showArchived;draw()});
  on('#al','click',addList);on('#al2','click',addList);on('#seed','click',seed);
  on('#member','click',members);on('#label','click',labels);on('#newBoard','click',newBoard);on('#copyBoard','click',copyBoard);on('#tpl','click',templates);
  $$('[data-lt]').forEach(x=>x.onchange=e=>{FL(x.dataset.lt).t=e.target.value;save(true,'更改列表名稱')});
  $$('[data-dl]').forEach(x=>x.onclick=()=>{if(confirm('刪除整個列表？')){b.lists=b.lists.filter(l=>l.id!=x.dataset.dl);save(true,'刪除列表')}})
  $$('[data-lup]').forEach(x=>x.onclick=e=>{e.stopPropagation();swap(b.lists,+x.dataset.lup,-1);save(true,'調整列表順序')});
  $$('[data-ldn]').forEach(x=>x.onclick=e=>{e.stopPropagation();swap(b.lists,+x.dataset.ldn,1);save(true,'調整列表順序')});
  $$('[data-ac]').forEach(x=>x.onclick=()=>addCard(x.dataset.ac));
  $$('[data-tc]').forEach(x=>x.onclick=()=>cardFromTemplate(x.dataset.tc));
  $$('[data-c]').forEach(x=>{x.ondragstart=()=>{drag={id:x.dataset.c,from:x.dataset.f};x.classList.add('dragging')};x.ondragend=()=>x.classList.remove('dragging');x.onclick=e=>{if(e.target.closest('.mini-actions'))return;activeCard=x.dataset.c;draw()}});
  $$('[data-cu]').forEach(x=>x.onclick=e=>{e.stopPropagation();moveCardOrder(x.dataset.c,-1)});
  $$('[data-cd]').forEach(x=>x.onclick=e=>{e.stopPropagation();moveCardOrder(x.dataset.c,1)});
  $$('[data-drop]').forEach(z=>{z.ondragover=e=>e.preventDefault();z.ondrop=()=>move(z.dataset.drop)});
  $$('[data-row]').forEach(r=>r.onclick=()=>{activeCard=r.dataset.row;draw()});
  modalBind();
}
function on(s,e,f){let n=$(s);if(n)n.addEventListener(e,f)}
function swap(arr,i,d){let j=i+d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]]}
async function newBoard(){let t=prompt('新看板名稱','新專案看板');if(!t)return;b={id:id(),...empty(t)};boards.unshift(b);localStorage.setItem('pm_erp_active_board_id',b.id);await save(true,'建立新看板')}
async function copyBoard(){let t=prompt('複製看板名稱',b.title+' 複製');if(!t)return;let clone=normalizeBoard(JSON.parse(JSON.stringify(b)));clone.id=id();clone.title=t;clone.activity=[];boards.unshift(clone);b=clone;localStorage.setItem('pm_erp_active_board_id',b.id);await save(true,'複製看板')}
function addList(){let t=prompt('列表名稱');if(t){b.lists.push(L(t));save(true,'新增列表 '+t)}}
function addCard(lid){let t=prompt('卡片標題');if(t){let c=C(t);FL(lid).c.push(c);logCard(c,'新增卡片');save()}}
function move(to){if(!drag)return;let f=FL(drag.from),t=FL(to),i=f?.c.findIndex(c=>c.id==drag.id);if(i>-1&&t){let c=f.c.splice(i,1)[0];t.c.push(c);logCard(c,'移動到 '+t.t)}drag=null;save()}
function moveCardOrder(cid,d){let o=FC(cid);if(!o||o.l.id==='archived')return;let i=o.l.c.findIndex(x=>x.id===cid);swap(o.l.c,i,d);save(true,'調整卡片順序')}
function cardFromTemplate(lid){if(!b.templates.length)return alert('尚無模板');let n=prompt('輸入模板編號：\n'+b.templates.map((t,i)=>`${i+1}. ${t.n}`).join('\n'),'1');let tpl=b.templates[Number(n)-1];if(!tpl)return;let c=C(tpl.n);c.d=tpl.d||'';c.check=(tpl.check||[]).map(t=>({id:id(),t,done:false}));FL(lid).c.push(c);logCard(c,'由模板建立');save()}
function templates(){let v=prompt('模板名稱，用逗號分隔',b.templates.map(x=>x.n).join(','));if(v!==null){b.templates=v.split(',').map((n,i)=>({id:b.templates[i]?.id||id(),n:n.trim(),d:b.templates[i]?.d||'',check:b.templates[i]?.check||[]})).filter(x=>x.n);save(true,'更新卡片模板')}}
function modal(cid){let o=FC(cid),c=o?.c;if(!c)return'';let read=o.l.id==='archived';return`<div class=modal-backdrop><div class=modal><div class=modal-head><div><b>卡片詳情</b><p style="margin:4px 0 0;color:#64748b">${h(o.l.t||'封存')}</p></div><button class=btn id=close>關閉</button></div><div class=modal-body><div><div class=section><h3>基本資料</h3><label class=field><span>標題</span><input id=ct value="${h(c.t)}" ${read?'disabled':''}></label><label class=field><span>描述</span><textarea id=cd ${read?'disabled':''}>${h(c.d)}</textarea></label><label class=field><span>到期日</span><input id=due type=date value="${h(c.due)}" ${read?'disabled':''}></label><label class=field><span>優先級</span><select id=priority ${read?'disabled':''}>${['低','中','高','急件'].map(p=>`<option ${c.priority===p?'selected':''}>${p}</option>`).join('')}</select></label></div><div class=section><h3>檢查清單</h3><div>${(c.check||[]).map((x,i)=>`<div class="check-item ${x.done?'done':''}"><input type=checkbox data-ck=${i} ${x.done?'checked':''} ${read?'disabled':''}><span>${h(x.t)}</span>${read?'':`<button class="btn small danger" data-dck=${i}>刪除</button>`}</div>`).join('')||'<div class=empty>尚無檢查項目</div>'}</div>${read?'':`<div class=composer-row><input id=newcheck placeholder="新增檢查項目"><button class="btn" id=addcheck>新增</button></div>`}</div><div class=section><h3>留言</h3><div>${(c.comments||[]).map(x=>`<div class=comment><b>${h(x.by||'我')}</b><p>${h(x.t)}</p><small>${h(new Date(x.at).toLocaleString('zh-TW'))}</small></div>`).join('')||'<div class=empty>尚無留言</div>'}</div>${read?'':`<textarea id=newcomment placeholder="新增留言"></textarea><button class="btn" id=addcomment>送出留言</button>`}</div><div class=section><h3>卡片活動</h3>${(c.activity||[]).slice(0,20).map(a=>`<div class=comment><b>${h(a.by)}</b><p>${h(a.text||a.t)}</p><small>${h(new Date(a.at).toLocaleString('zh-TW'))}</small></div>`).join('')||'<div class=empty>尚無活動</div>'}</div></div><aside><div class=section><h3>標籤</h3>${b.labels.map(l=>`<label class=check-item><input type=checkbox data-lab=${l.id} ${c.labels.includes(l.id)?'checked':''} ${read?'disabled':''}><span class=label style="background:${h(l.c)}"></span><span>${h(l.n)}</span></label>`).join('')}</div><div class=section><h3>成員</h3>${b.members.map(m=>`<label class=check-item><input type=checkbox data-mem="${h(m)}" ${c.members.includes(m)?'checked':''} ${read?'disabled':''}><span class=avatar>${h(m[0])}</span><span>${h(m)}</span></label>`).join('')}</div><div class=section>${read?`<button class="btn primary" id=restore>還原卡片</button>`:`<button class="btn" id=archiveCard>封存卡片</button><button class="btn danger" id=deleteCard>刪除卡片</button>`}</div></aside></div></div></div>`}
function modalBind(){on('#close','click',()=>{activeCard='';draw()});let o=FC(activeCard);if(!o)return;let c=o.c;on('#ct','change',e=>{c.t=e.target.value;logCard(c,'更新標題');save()});on('#cd','change',e=>{c.d=e.target.value;logCard(c,'更新描述');save()});on('#due','change',e=>{c.due=e.target.value;logCard(c,'更新到期日');save()});on('#priority','change',e=>{c.priority=e.target.value;logCard(c,'更新優先級');save()});$$('[data-lab]').forEach(x=>x.onchange=()=>{toggle(c.labels,x.dataset.lab,x.checked);logCard(c,'更新標籤');save()});$$('[data-mem]').forEach(x=>x.onchange=()=>{toggle(c.members,x.dataset.mem,x.checked);logCard(c,'更新成員');save()});$$('[data-ck]').forEach(x=>x.onchange=()=>{c.check[x.dataset.ck].done=x.checked;logCard(c,'更新檢查清單');save()});$$('[data-dck]').forEach(x=>x.onclick=()=>{c.check.splice(x.dataset.dck,1);logCard(c,'刪除檢查項目');save()});on('#addcheck','click',()=>{let v=$('#newcheck').value.trim();if(v){c.check.push({id:id(),t:v,done:false});logCard(c,'新增檢查項目');save()}});on('#addcomment','click',()=>{let v=$('#newcomment').value.trim();if(v){c.comments.push({id:id(),by:'我',t:v,at:new Date().toISOString()});logCard(c,'新增留言');save()}});on('#archiveCard','click',()=>archive(activeCard));on('#restore','click',()=>{let i=b.archived.findIndex(x=>x.id===activeCard);if(i>-1){let c=b.archived.splice(i,1)[0];b.lists[0].c.push(c);logCard(c,'還原卡片');activeCard='';save()}});on('#deleteCard','click',()=>{if(confirm('永久刪除卡片？')){let i=o.l.c.findIndex(x=>x.id===activeCard);if(i>-1)o.l.c.splice(i,1);activeCard='';save(true,'永久刪除卡片')}})}
function toggle(a,v,on){let i=a.indexOf(v);if(on&&i<0)a.push(v);if(!on&&i>=0)a.splice(i,1)}
function archive(cid){let o=FC(cid);if(!o)return;let i=o.l.c.findIndex(x=>x.id===cid);if(i>-1){let c=o.l.c.splice(i,1)[0];b.archived.push(c);logCard(c,'封存卡片')}activeCard='';save()}
function members(){let v=prompt('成員名稱，用逗號分隔',b.members.join(','));if(v!==null){b.members=v.split(',').map(x=>x.trim()).filter(Boolean);save(true,'更新成員清單')}}
function labels(){let v=prompt('標籤，用逗號分隔',b.labels.map(x=>x.n).join(','));if(v!==null){b.labels=v.split(',').map((n,i)=>({id:b.labels[i]?.id||id(),n:n.trim(),c:b.labels[i]?.c||colors[i%colors.length]})).filter(x=>x.n);save(true,'更新標籤清單')}}
function seed(){b={id:id(),...empty('PM ERP 產品開發')};b.lists[0].c.push({...C('整理客戶需求'),d:'把客戶需求拆成卡片與檢查清單',labels:[b.labels[1].id],members:['Leo'],check:[{id:id(),t:'確認需求',done:true},{id:id(),t:'估工時',done:false}]});b.lists[1].c.push({...C('Trello 看板模式'),d:'支援拖拉、卡片詳情、標籤、留言、檢查清單',labels:[b.labels[0].id,b.labels[3].id],members:['Leo','PM'],due:today(),comments:[{id:id(),by:'Leo',t:'先完成 MVP，再接正式權限',at:new Date().toISOString()}]});b.lists[2].c.push({...C('Supabase 寫入測試'),labels:[b.labels[2].id],members:['PM']});boards.unshift(b);localStorage.setItem('pm_erp_active_board_id',b.id);save(true,'建立範例看板')}
document.addEventListener('DOMContentLoaded',init);
})();
