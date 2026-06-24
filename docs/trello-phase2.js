(() => {
  const MODULE = 'trello_boards';
  const CONFIG_KEY = 'pm_erp_supabase_config_v3';
  let client = null;
  let drag = null;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const uid = () => crypto.randomUUID();
  const now = () => new Date().toISOString();
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  async function getClient() {
    if (client) return client;
    try { await import('./supabase-default.js?v=' + Date.now()); } catch (_) {}
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null') || {};
    if (!config.url || !config.key || !window.supabase) return null;
    client = window.supabase.createClient(config.url, config.key, { auth: { persistSession: true, autoRefreshToken: true } });
    const session = await client.auth.getSession();
    if (!session.data.session) await client.auth.signInAnonymously();
    return client;
  }

  async function loadBoard() {
    const sb = await getClient();
    if (!sb) throw new Error('Supabase 尚未連線');
    const boardId = localStorage.getItem('pm_erp_active_board_id');
    let query = sb.from('erp_records').select('id,data,updated_at').eq('module', MODULE);
    if (boardId) query = query.eq('id', boardId);
    const result = await query.order('updated_at', { ascending: false }).limit(1);
    if (result.error) throw result.error;
    const row = result.data?.[0];
    if (!row) throw new Error('找不到目前看板資料');
    return { sb, row, board: normalizeBoard({ id: row.id, ...row.data }) };
  }

  async function saveBoard(board, reason) {
    board.updatedAt = now();
    board.activity = Array.isArray(board.activity) ? board.activity : [];
    if (reason) board.activity.unshift({ id: uid(), type: 'phase2', text: reason, t: reason, by: '我', at: now(), payload: {} });
    const sb = await getClient();
    const result = await sb.from('erp_records').upsert({ id: board.id, module: MODULE, title: board.title || 'PM ERP Trello', data: board });
    if (result.error) throw result.error;
  }

  function normalizeBoard(board) {
    board.id = board.id || uid();
    board.lists = Array.isArray(board.lists) ? board.lists.map(normalizeList) : [];
    board.archived = Array.isArray(board.archived) ? board.archived : [];
    board.archivedLists = Array.isArray(board.archivedLists) ? board.archivedLists.map(normalizeList) : [];
    board.activity = Array.isArray(board.activity) ? board.activity : [];
    return board;
  }

  function normalizeList(list) {
    list.id = list.id || uid();
    list.t = list.t || '未命名列表';
    list.c = Array.isArray(list.c) ? list.c : [];
    return list;
  }

  function findList(board, listId) {
    return board.lists.find((list) => list.id === listId);
  }

  function findCard(board, cardId) {
    for (const list of board.lists) {
      const index = list.c.findIndex((card) => card.id === cardId);
      if (index >= 0) return { list, card: list.c[index], index };
    }
    return null;
  }

  function getDropTarget(container, y, draggedId) {
    const cards = $$('.card[data-c]', container).filter((card) => card.dataset.c !== draggedId);
    for (const card of cards) {
      const box = card.getBoundingClientRect();
      if (y < box.top + box.height / 2) return card.dataset.c;
    }
    return '';
  }

  async function moveCard(cardId, fromListId, toListId, beforeCardId) {
    const { board } = await loadBoard();
    const from = findList(board, fromListId);
    const to = findList(board, toListId);
    if (!from || !to) return;
    const fromIndex = from.c.findIndex((card) => card.id === cardId);
    if (fromIndex < 0) return;
    const [card] = from.c.splice(fromIndex, 1);
    let toIndex = beforeCardId ? to.c.findIndex((item) => item.id === beforeCardId) : -1;
    if (toIndex < 0) toIndex = to.c.length;
    to.c.splice(toIndex, 0, card);
    card.updatedAt = now();
    card.activity = Array.isArray(card.activity) ? card.activity : [];
    card.activity.unshift({ id: uid(), type: 'move', text: `移動到 ${to.t}`, t: `移動到 ${to.t}`, by: '我', at: now(), payload: { fromListId, toListId } });
    await saveBoard(board, `移動卡片：${card.t || '未命名卡片'} → ${to.t}`);
    location.reload();
  }

  async function quickAdd(listId, title) {
    const text = title.trim();
    if (!text) return;
    const { board } = await loadBoard();
    const list = findList(board, listId);
    if (!list) return;
    const card = { id: uid(), t: text, d: '', due: '', members: [], labels: [], check: [], comments: [], activity: [], attachments: [], customFields: [], timeLogs: [], priority: '中', coverUrl: '', erpTaskId: '', lastSyncedAt: '', createdAt: now(), updatedAt: now() };
    card.activity.push({ id: uid(), type: 'create', text: '快捷新增卡片', t: '快捷新增卡片', by: '我', at: now(), payload: {} });
    list.c.push(card);
    await saveBoard(board, `快捷新增卡片：${text}`);
    location.reload();
  }

  async function archiveList(listId) {
    if (!confirm('封存這個列表？列表內卡片會一起封存，可在封存列表面板還原。')) return;
    const { board } = await loadBoard();
    const index = board.lists.findIndex((list) => list.id === listId);
    if (index < 0) return;
    const [list] = board.lists.splice(index, 1);
    list.archivedAt = now();
    board.archivedLists = Array.isArray(board.archivedLists) ? board.archivedLists : [];
    board.archivedLists.unshift(list);
    await saveBoard(board, `封存列表：${list.t}`);
    location.reload();
  }

  async function restoreList(listId) {
    const { board } = await loadBoard();
    const index = (board.archivedLists || []).findIndex((list) => list.id === listId);
    if (index < 0) return;
    const [list] = board.archivedLists.splice(index, 1);
    delete list.archivedAt;
    board.lists.push(list);
    await saveBoard(board, `還原列表：${list.t}`);
    location.reload();
  }

  async function openArchivedLists() {
    const { board } = await loadBoard();
    const lists = board.archivedLists || [];
    const panel = document.createElement('div');
    panel.className = 'phase2-panel';
    panel.innerHTML = `<div class="phase2-box"><div class="phase2-head"><b>封存列表</b><button class="btn" data-phase2-close>關閉</button></div>${lists.length ? lists.map((list) => `<div class="phase2-row"><div><b>${esc(list.t)}</b><small>${(list.c || []).length} 張卡片</small></div><button class="btn primary" data-phase2-restore="${esc(list.id)}">還原</button></div>`).join('') : '<div class="empty">沒有封存列表</div>'}</div>`;
    document.body.appendChild(panel);
    $('[data-phase2-close]', panel).onclick = () => panel.remove();
    $$('[data-phase2-restore]', panel).forEach((button) => button.onclick = () => restoreList(button.dataset.phase2Restore));
  }

  function decorate() {
    $$('.list[data-list]').forEach((list) => {
      if ($('.phase2-quick', list)) return;
      const listId = list.dataset.list;
      const head = $('.list-head', list);
      if (head && !$('.phase2-archive-list', head)) {
        const archive = document.createElement('button');
        archive.className = 'list-menu phase2-archive-list';
        archive.textContent = '封存';
        archive.onclick = (event) => { event.stopPropagation(); archiveList(listId); };
        head.appendChild(archive);
      }
      const wrap = document.createElement('div');
      wrap.className = 'phase2-quick';
      wrap.innerHTML = `<textarea placeholder="快速新增卡片，按 Enter 建立"></textarea><button class="btn small">新增</button>`;
      const input = $('textarea', wrap);
      const button = $('button', wrap);
      button.onclick = () => quickAdd(listId, input.value);
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          quickAdd(listId, input.value);
        }
      });
      list.appendChild(wrap);
    });
    const top = $('.top-actions');
    if (top && !$('#phase2ArchivedLists')) {
      const button = document.createElement('button');
      button.className = 'btn';
      button.id = 'phase2ArchivedLists';
      button.textContent = '封存列表';
      button.onclick = openArchivedLists;
      top.appendChild(button);
    }
  }

  document.addEventListener('dragstart', (event) => {
    const card = event.target.closest?.('.card[data-c]');
    if (!card) return;
    drag = { id: card.dataset.c, from: card.dataset.f };
  }, true);

  document.addEventListener('dragover', (event) => {
    const drop = event.target.closest?.('[data-drop]');
    if (!drop || !drag) return;
    event.preventDefault();
    drop.classList.add('phase2-drop-hover');
  }, true);

  document.addEventListener('dragleave', (event) => {
    const drop = event.target.closest?.('[data-drop]');
    if (drop) drop.classList.remove('phase2-drop-hover');
  }, true);

  document.addEventListener('drop', (event) => {
    const drop = event.target.closest?.('[data-drop]');
    if (!drop || !drag) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    drop.classList.remove('phase2-drop-hover');
    const before = getDropTarget(drop, event.clientY, drag.id);
    const current = drag;
    drag = null;
    moveCard(current.id, current.from, drop.dataset.drop, before).catch((error) => alert('移動失敗：' + (error.message || error)));
  }, true);

  const observer = new MutationObserver(() => decorate());
  document.addEventListener('DOMContentLoaded', () => {
    decorate();
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
