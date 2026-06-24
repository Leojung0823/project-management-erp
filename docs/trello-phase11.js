(()=>{
const PHASE='trello-2026-06-24-pro-13';
const M='trello_boards';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const h=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const id=()=>crypto.randomUUID();
let sb, board, boards=[], recordId='', realtimeChannel=null, lastUpdatedAt='', lastBoardHash='', lastRuleRun=0;
let notifications=[];
let panelOpen='';

async function cfg(){
  try{await import('./supabase-default.js?v='+Date.now())}catch(e){}
  const c=JSON.parse(localStorage.getItem('pm_erp_supabase_config_v3')||'null')||{};
  return {u:c.url,k:c.key};
}
async function init(){
  const c=await cfg();
  if(!c.u||!c.k||!window.supabase)return;
  sb=window.supabase.createClient(c.u,c.k,{auth:{persistSession:true,autoRefreshToken:true}});
  const ss=await sb.auth.getSession();
  if(!ss.data.session){try{await sb.auth.signInAnonymously()}catch(e){}}
  await loadBoard();
  loadLocalNotifications();
  ensureButtons();
  setupRealtime();
  scanDueSoon(false);
  setInterval(()=>{ensureButtons();scanDueSoon(false)},30000);
  new MutationObserver(()=>{ensureButtons();decorateSyncStatus()}).observe(document.body,{childList:true,subtree:true});
}
async function loadBoard(){
  if(!sb)return;
  const r=await sb.from('erp_records').select('id,data,updated_at').eq('module',M).order('updated_at',{ascending:false});
  boards=(r.data||[]).map(x=>({rid:x.id,updated_at:x.updated_at,...(x.data||{})}));
  const active=localStorage.getItem('pm_erp_active_board_id');
  board=boards.find(x=>x.id===active)||boards[0]||null;
  if(board){recordId=board.rid||board.id;lastUpdatedAt=board.updated_at||'';lastBoardHash=hashBoard(board)}
}
function hashBoard(b){try{return JSON.stringify({id:b.id,title:b.title,lists:(b.lists||[]).map(l=>({id:l.id,t:l.t,c:(l.c||[]).map(c=>({id:c.id,t:c.t,due:c.due,members:c.members,labels:c.labels,check:c.check,erpTaskId:c.erpTaskId}))}))})}catch(e){return String(Date.now())}}
async function saveBoard(msg=''){if(!board||!sb)return;board.updatedAt=new Date().toISOString();board.activity=board.activity||[];if(msg)board.activity.unshift({id:id(),type:'phase11',text:msg,t:msg,by:'Automation',at:new Date().toISOString(),payload:{phase:PHASE}});const clean=JSON.parse(JSON.stringify(board));const r=await sb.from('erp_records').upsert({id:board.id,module:M,title:board.title,data:clean});if(r.error){toast('儲存失敗：'+r.error.message,'bad');throw r.error}lastBoardHash=hashBoard(board);toast(msg||'已儲存','good')}
function ensureButtons(){
  const top=$('.top-actions');
  if(!top||$('#phase11-realtime'))return;
  top.insertAdjacentHTML('beforeend',`<span id="phase11-status" class="phase11-pill warn">● 即時同步準備中</span><button class="btn phase11-bell" id="phase11-notifications">通知中心</button><button class="btn" id="phase11-automation">Automation</button><button class="btn" id="phase11-realtime">即時狀態</button>`);
  $('#phase11-notifications').onclick=()=>openPanel('notifications');
  $('#phase11-automation').onclick=()=>openPanel('automation');
  $('#phase11-realtime').onclick=()=>openPanel('realtime');
  decorateSyncStatus();
}
function setupRealtime(){
  if(!sb||realtimeChannel)return;
  try{
    realtimeChannel=sb.channel('trello-board-realtime-'+Date.now())
      .on('postgres_changes',{event:'*',schema:'public',table:'erp_records',filter:'module=eq.'+M},payload=>handleRealtime(payload))
      .subscribe(status=>{
        const el=$('#phase11-status');
        if(!el)return;
        el.textContent=status==='SUBSCRIBED'?'● 即時同步中':'● 即時同步：'+status;
        el.className='phase11-pill '+(status==='SUBSCRIBED'?'good':'warn');
      });
  }catch(e){const el=$('#phase11-status');if(el){el.textContent='● Realtime 未啟用';el.className='phase11-pill bad'}console.warn(e)}
}
async function handleRealtime(payload){
  const row=payload.new||payload.old||{};
  if(!board||!row.data||row.data.id!==board.id)return;
  const remote=row.data;
  const remoteHash=hashBoard(remote);
  if(remoteHash===lastBoardHash)return;
  const remoteAt=row.updated_at||remote.updatedAt||'';
  addNotice({title:'看板有新變更',body:`${remote.title||'看板'} 已由其他裝置更新`,type:'realtime',severity:'good',payload:{updatedAt:remoteAt}});
  const currentOpenCard=$('.modal-body')?'card-open':'';
  board={...remote,rid:row.id,updated_at:row.updated_at};
  lastUpdatedAt=row.updated_at||'';lastBoardHash=remoteHash;
  decorateSyncStatus('已收到遠端更新');
  if(!currentOpenCard){softRefreshHint('偵測到遠端更新，按這裡套用畫面',()=>location.reload())}
}
function decorateSyncStatus(text=''){let bar=$('#phase11-syncbar');if(!bar){document.body.insertAdjacentHTML('beforeend','<div id="phase11-syncbar" class="phase11-syncbar"></div>');bar=$('#phase11-syncbar')}if(text){bar.textContent=text;bar.classList.add('show');setTimeout(()=>bar.classList.remove('show'),3500)}updateBell()}
function softRefreshHint(text,fn){let bar=$('#phase11-syncbar');decorateSyncStatus();bar.textContent=text;bar.classList.add('show');bar.onclick=()=>{bar.onclick=null;fn&&fn()}}
function toast(msg,kind='good'){decorateSyncStatus(msg)}
function loadLocalNotifications(){try{notifications=JSON.parse(localStorage.getItem('trello_phase11_notifications')||'[]')}catch(e){notifications=[]}updateBell()}
function persistNotifications(){localStorage.setItem('trello_phase11_notifications',JSON.stringify(notifications.slice(0,100)));updateBell()}
function addNotice(n){notifications.unshift({id:id(),title:n.title||'通知',body:n.body||'',type:n.type||'info',severity:n.severity||'good',read:false,at:new Date().toISOString(),payload:n.payload||{}});persistNotifications();if(panelOpen==='notifications')renderPanel()}
function updateBell(){const unread=notifications.filter(n=>!n.read).length;const bell=$('#phase11-notifications');if(bell){if(unread)bell.dataset.count=String(unread);else bell.removeAttribute('data-count')}}
function allCards(){return (board?.lists||[]).flatMap(l=>(l.c||[]).map(c=>({list:l,c}))).concat((board?.archived||[]).map(c=>({list:{t:'封存',id:'archived'},c})))}
function scanDueSoon(show=true){
  if(!board)return;
  const now=new Date();
  const day=86400000;
  let made=0;
  allCards().filter(x=>x.list.id!=='archived').forEach(({list,c})=>{
    if(!c.due)return;
    const due=new Date(c.due+'T23:59:59');
    const diff=Math.ceil((due-now)/day);
    const key='due:'+board.id+':'+c.id+':'+c.due+':'+diff;
    if(diff<0){if(!notifications.some(n=>n.payload?.key===key)){addNotice({title:'卡片已逾期',body:`「${c.t}」在「${list.t}」已逾期 ${Math.abs(diff)} 天`,type:'due',severity:'bad',payload:{key,cardId:c.id}});made++}}
    else if([0,1,3,7].includes(diff)&&!notifications.some(n=>n.payload?.key===key)){addNotice({title:'卡片即將到期',body:`「${c.t}」還有 ${diff} 天到期`,type:'due',severity:diff<=1?'warn':'good',payload:{key,cardId:c.id}});made++}
  });
  if(show)toast(made?`新增 ${made} 則到期提醒`:'目前沒有新的到期提醒',made?'warn':'good')
}
function defaultRules(){return [
  {id:'rule-done-completed',enabled:true,name:'卡片進入完成列表時標記完成時間',type:'done_completed'},
  {id:'rule-overdue-priority',enabled:true,name:'逾期卡片自動標記高優先',type:'overdue_priority'},
  {id:'rule-checklist-done-label',enabled:false,name:'檢查清單全完成時加上完成標籤',type:'checklist_done_label'},
  {id:'rule-auto-erp-sync',enabled:false,name:'完成列表卡片自動同步 ERP 任務',type:'auto_erp_sync'}
]}
function getRules(){board.automationRules=Array.isArray(board.automationRules)&&board.automationRules.length?board.automationRules:defaultRules();return board.automationRules}
async function runAutomation(manual=true){
  if(!board)return;
  if(!manual&&Date.now()-lastRuleRun<60000)return;
  lastRuleRun=Date.now();
  const rules=getRules().filter(r=>r.enabled);
  let changed=0, notes=[];
  const doneLists=(board.lists||[]).filter(l=>/完成|done|closed|結案/i.test(l.t));
  const doneCards=doneLists.flatMap(l=>(l.c||[]).map(c=>({list:l,c})));
  for(const r of rules){
    if(r.type==='done_completed'){
      doneCards.forEach(({c})=>{if(!c.completedAt){c.completedAt=new Date().toISOString();c.activity=c.activity||[];c.activity.unshift({id:id(),type:'automation',text:'Automation：進入完成列表，標記完成時間',t:'Automation：進入完成列表，標記完成時間',by:'Automation',at:new Date().toISOString()});changed++;}});
      if(doneCards.length)notes.push('完成時間規則檢查 '+doneCards.length+' 張');
    }
    if(r.type==='overdue_priority'){
      allCards().filter(x=>x.list.id!=='archived').forEach(({c})=>{if(c.due&&c.due<new Date().toISOString().slice(0,10)&&c.priority!=='高'){c.priority='高';changed++;}});
      notes.push('逾期高優先規則已檢查');
    }
    if(r.type==='checklist_done_label'){
      let doneLabel=(board.labels||[]).find(l=>l.n==='完成')||null;
      if(!doneLabel){doneLabel={id:id(),n:'完成',c:'#16a34a'};board.labels=board.labels||[];board.labels.push(doneLabel)}
      allCards().filter(x=>x.list.id!=='archived').forEach(({c})=>{const total=(c.check||[]).length,done=(c.check||[]).filter(x=>x.done).length;if(total&&done===total&&!c.labels.includes(doneLabel.id)){c.labels.push(doneLabel.id);changed++;}});
      notes.push('檢查清單完成標籤規則已檢查');
    }
    if(r.type==='auto_erp_sync'){
      for(const {list,c} of doneCards){if(!c.erpTaskId){await syncOneTask(c,list);changed++;}}
      notes.push('完成列表 ERP 同步規則已檢查');
    }
  }
  if(changed){await saveBoard(`Automation Lite 執行，更新 ${changed} 個項目`);addNotice({title:'Automation Lite 已執行',body:`更新 ${changed} 個項目。${notes.join('；')}`,type:'automation',severity:'good'});if(manual)setTimeout(()=>location.reload(),650)}
  else {addNotice({title:'Automation Lite 已檢查',body:'沒有需要更新的項目。'+notes.join('；'),type:'automation',severity:'good'});if(manual)toast('Automation 已檢查，沒有變更','good')}
}
async function syncOneTask(c,list){if(!sb||!board)return;const taskId=c.erpTaskId||c.id;await sb.from('erp_records').upsert({id:taskId,module:'tasks',title:c.t,data:{任務名稱:c.t,專案:board.title,狀態:list.t,負責人:(c.members||[]).join(','),期限:c.due||'',說明:c.d||'',標籤:(c.labels||[]).join(','),來源:'Trello Automation',來源看板:board.id,來源卡片:c.id}});c.erpTaskId=taskId;c.lastSyncedAt=new Date().toISOString()}
function openPanel(which){panelOpen=which;renderPanel()}
function closePanel(){panelOpen='';$('.phase11-drawer')?.remove()}
function renderPanel(){
  $('.phase11-drawer')?.remove();
  if(!panelOpen)return;
  const title=panelOpen==='notifications'?'通知中心':panelOpen==='automation'?'Automation Lite':'即時同步狀態';
  document.body.insertAdjacentHTML('beforeend',`<aside class="phase11-drawer"><div class="phase11-head"><h2>${h(title)}</h2><button class="phase11-close" id="phase11-close">關閉</button></div><div class="phase11-body">${panelOpen==='notifications'?notificationsHtml():panelOpen==='automation'?automationHtml():realtimeHtml()}</div></aside>`);
  $('#phase11-close').onclick=closePanel;
  bindPanel();
}
function notificationsHtml(){const unread=notifications.filter(n=>!n.read).length;return `<div class="phase11-card"><div class="phase11-grid"><div class="phase11-stat"><b>${notifications.length}</b><span>全部通知</span></div><div class="phase11-stat"><b>${unread}</b><span>未讀</span></div></div><div class="phase11-actions"><button class="phase11-btn primary" id="phase11-scan-due">掃描到期</button><button class="phase11-btn" id="phase11-read-all">全部已讀</button><button class="phase11-btn" id="phase11-clear-read">清除已讀</button></div></div><div class="phase11-list">${notifications.map(n=>`<div class="phase11-item ${n.read?'':'unread'}" data-n="${n.id}"><b>${h(n.title)}<span class="phase11-severity ${h(n.severity)}">${h(n.type)}</span></b><p>${h(n.body)}</p><small>${new Date(n.at).toLocaleString('zh-TW')}</small></div>`).join('')||'<div class="phase11-card"><p>目前沒有通知。</p></div>'}</div>`}
function automationHtml(){const rules=getRules();return `<div class="phase11-card"><h3>Butler Lite 規則</h3><p>這是簡化版 Automation，不會刪資料。規則執行後會寫入看板 activity，並可同步 ERP 任務。</p><div class="phase11-actions"><button class="phase11-btn primary" id="phase11-run-auto">立即執行規則</button><button class="phase11-btn" id="phase11-reset-rules">重設預設規則</button></div></div><div class="phase11-list">${rules.map(r=>`<div class="phase11-item phase11-rule"><div><b>${h(r.name)}</b><p><code>${h(r.type)}</code></p></div><label><input type="checkbox" data-rule="${r.id}" ${r.enabled?'checked':''}> 啟用</label></div>`).join('')}</div><div class="phase11-card"><h3>新增簡易標籤規則</h3><div class="phase11-form"><input class="phase11-input" id="phase11-rule-label" placeholder="規則名稱，例如：急件自動提醒"><button class="phase11-btn" id="phase11-add-rule">新增提醒規則</button></div><p>此規則先作為提醒規則，之後可擴充為自動指派成員。</p></div>`}
function realtimeHtml(){return `<div class="phase11-card"><h3>Realtime 狀態</h3><div class="phase11-grid"><div class="phase11-stat"><b>${realtimeChannel?'ON':'OFF'}</b><span>訂閱狀態</span></div><div class="phase11-stat"><b>${h((board?.lists||[]).length)}</b><span>列表數</span></div><div class="phase11-stat"><b>${h(allCards().length)}</b><span>卡片數</span></div><div class="phase11-stat"><b>${h(notifications.filter(n=>!n.read).length)}</b><span>未讀通知</span></div></div><p>目前採用 Supabase Realtime 監聽 `erp_records` 的 Trello 看板變更。若其他使用者更新看板，會顯示提示，不會在你正在編輯卡片時硬刷新。</p><div class="phase11-actions"><button class="phase11-btn primary" id="phase11-reload-board">重新載入看板</button><button class="phase11-btn" id="phase11-copy-state">複製狀態JSON</button></div></div><div class="phase11-card"><h3>最後更新</h3><p>${h(lastUpdatedAt||board?.updatedAt||'未知')}</p><p>版本：${PHASE}</p></div>`}
function bindPanel(){
  $('#phase11-scan-due')?.addEventListener('click',()=>{scanDueSoon(true);renderPanel()});
  $('#phase11-read-all')?.addEventListener('click',()=>{notifications.forEach(n=>n.read=true);persistNotifications();renderPanel()});
  $('#phase11-clear-read')?.addEventListener('click',()=>{notifications=notifications.filter(n=>!n.read);persistNotifications();renderPanel()});
  $$('.phase11-item[data-n]').forEach(el=>el.onclick=()=>{const n=notifications.find(x=>x.id===el.dataset.n);if(n)n.read=true;persistNotifications();renderPanel()});
  $('#phase11-run-auto')?.addEventListener('click',()=>runAutomation(true));
  $('#phase11-reset-rules')?.addEventListener('click',async()=>{board.automationRules=defaultRules();await saveBoard('重設 Automation 規則');renderPanel()});
  $$('[data-rule]').forEach(ch=>ch.onchange=async()=>{const r=getRules().find(x=>x.id===ch.dataset.rule);if(r){r.enabled=ch.checked;await saveBoard('更新 Automation 規則：'+r.name)}});
  $('#phase11-add-rule')?.addEventListener('click',async()=>{const name=$('#phase11-rule-label').value.trim();if(!name)return;getRules().push({id:id(),enabled:true,name,type:'manual_notice'});await saveBoard('新增 Automation 規則：'+name);renderPanel()});
  $('#phase11-reload-board')?.addEventListener('click',()=>location.reload());
  $('#phase11-copy-state')?.addEventListener('click',()=>navigator.clipboard?.writeText(JSON.stringify({phase:PHASE,boardId:board?.id,updatedAt:lastUpdatedAt,cards:allCards().length,unread:notifications.filter(n=>!n.read).length},null,2)).then(()=>toast('已複製狀態','good')));
}
function exportNotifications(){download('trello-notifications.json',JSON.stringify(notifications,null,2),'application/json')}
function download(name,data,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}

document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1200));
})();