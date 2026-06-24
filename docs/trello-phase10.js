(() => {
  const MODULE = 'trello_boards';
  const CONFIG_KEY = 'pm_erp_supabase_config_v3';
  const VERSION = '20260624-pro-11';
  let sb = null;
  let activeMenu = null;
  let activePopup = null;
  let dragState = null;

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const uid = () => crypto.randomUUID();
  const now = () => new Date().toISOString();
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  async function getClient() {
    if (sb) return sb;
    try { await import('./supabase-default.js?v=' + Date.now()); } catch (_) {}
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null') || {};
    if (!config.url || !config.key || !window.supabase) return null;
    sb = window.supabase.createClient(config.url, config.key, { auth: { persistSession: true, autoRefreshToken: true } });
    const session = await sb.auth.getSession();
    if (!session.data.session) await sb.auth.signInAnonymously();
    return sb;
  }

  async function loadBoard() {
    const client = await getClient();
    if (!client) throw new Error('Supabase 尚未連線');
    const boardId = localStorage.getItem('pm_erp_active_board_id');
    let query = client.from('erp_records').select('id,data,updated_at').eq('module', MODULE);
    if (boardId) query = query.eq('id', boardId);
    const result = await query.order('updated_at', { ascending: false }).limit(1);
    if (result.error) throw result.error;
    const row = result.data?.[0];
    if (!row) throw new Error('找不到目前看板');
    return { client, row, board: normalizeBoard({ id: row.id, ...row.data }) };
  }

  function normalizeBoard(board) {
    board.id = board.id || uid();
    board.title = board.title || 'PM ERP Trello';
    board.lists = Array.isArray(board.lists) ? board.lists.map(normalizeList) : [];
    board.archived = Array.isArray(board.archived) ? board.archived.map(normalizeCard) : [];
    board.activity = Array.isArray(board.activity) ? board.activity : [];
    board.members = Array.isArray(board.members) ? board.members : [];
    return board;
  }
  function normalizeList(list) {
    list.id = list.id || uid();
    list.t = list.t || '未命名列表';
    list.c = Array.isArray(list.c) ? list.c.map(normalizeCard) : [];
    return list;
  }
  function normalizeCard(card) {
    card.id = card.id || uid();
    card.t = card.t || '未命名卡片';
    card.d = card.d || '';
    card.due = card.due || '';
    card.members = Array.isArray(card.members) ? card.members : [];
    card.labels = Array.isArray(card.labels) ? card.labels : [];
    card.check = Array.isArray(card.check) ? card.check : [];
    card.comments = Array.isArray(card.comments) ? card.comments : [];
    card.activity = Array.isArray(card.activity) ? card.activity : [];
    card.attachments = Array.isArray(card.attachments) ? card.attachments : [];
    card.customFields = Array.isArray(card.customFields) ? card.customFields : [];
    card.timeLogs = Array.isArray(card.timeLogs) ? card.timeLogs : [];
    card.priority = card.priority || '中';
    return card;
  }
  async function saveBoard(board, reason) {
    board.updatedAt = now();
    board.activity = Array.isArray(board.activity) ? board.activity : [];
    if (reason) board.activity.unshift({ id: uid(), type: 'phase10', text: reason, t: reason, by: '我', at: now(), payload: {} });
    const client = await getClient();
    const result = await client.from('erp_records').upsert({ id: board.id, module: MODULE, title: board.title, data: board });
    if (result.error) throw result.error;
  }
  function findCard(board, cardId) {
    for (const list of board.lists || []) {
      const index = list.c.findIndex((card) => card.id === cardId);
      if (index >= 0) return { list, card: list.c[index], index };
    }
    const archivedIndex = (board.archived || []).findIndex((card) => card.id === cardId);
    if (archivedIndex >= 0) return { list: { id: 'archived', t: '封存', c: board.archived }, card: board.archived[archivedIndex], index: archivedIndex };
    return null;
  }
  function findList(board, listId) {
    return (board.lists || []).find((list) => list.id === listId);
  }

  function decorate() {
    addBoardIdentity();
    decorateCards();
    decorateLists();
    decorateModal();
    addKeyboardShortcuts();
  }

  function addBoardIdentity() {
    const brand = $('.brand');
    if (!brand || $('.t10-board-name', brand)) return;
    const title = $('#title')?.value || '';
    brand.insertAdjacentHTML('beforeend', `<span class="t10-board-name">${esc(title)}｜Pro 11</span>`);
  }

  function decorateCards() {
    $$('.card[data-c]').forEach((card) => {
      if (!$('.t10-card-actions', card)) {
        const actions = document.createElement('div');
        actions.className = 't10-card-actions';
        actions.innerHTML = `<button class="t10-icon" title="快速編輯" data-t10-edit="${esc(card.dataset.c)}">✎</button><button class="t10-icon" title="更多" data-t10-card-menu="${esc(card.dataset.c)}">⋯</button>`;
        card.appendChild(actions);
      }
      card.addEventListener('dragstart', () => {
        dragState = { id: card.dataset.c, from: card.dataset.f };
        document.body.classList.add('t10-dragging');
      }, { once: false });
      card.addEventListener('dragend', clearDropState, { once: false });
    });
  }

  function decorateLists() {
    $$('.list[data-list]').forEach((list) => {
      const listId = list.dataset.list;
      const head = $('.list-head', list);
      if (head && !$('.t10-list-more', head)) {
        const more = document.createElement('button');
        more.className = 'list-menu t10-list-more';
        more.textContent = '⋯';
        more.title = '列表更多操作';
        more.onclick = (event) => {
          event.stopPropagation();
          openListMenu(event, listId);
        };
        head.appendChild(more);
      }
      const cards = $('[data-drop]', list);
      if (cards && !cards.dataset.t10DropReady) {
        cards.dataset.t10DropReady = '1';
        cards.addEventListener('dragover', (event) => showDropPlaceholder(event, cards), true);
        cards.addEventListener('dragleave', (event) => {
          if (!cards.contains(event.relatedTarget)) removePlaceholder(cards);
        }, true);
        cards.addEventListener('drop', () => setTimeout(() => removePlaceholder(cards), 50), true);
      }
    });
  }

  function decorateModal() {
    const modal = $('.modal');
    if (!modal || modal.dataset.t10Ready) return;
    modal.dataset.t10Ready = '1';
    modal.classList.add('t10-modal');
    const head = $('.modal-head', modal);
    const body = $('.modal-body', modal);
    if (head && !$('.t10-modal-chip', head)) head.insertAdjacentHTML('beforeend', '<span class="badge t10-modal-chip">Trello-style detail</span>');
    if (body) body.classList.add('t10-modal-body');
  }

  function addKeyboardShortcuts() {
    if (document.body.dataset.t10Shortcuts) return;
    document.body.dataset.t10Shortcuts = '1';
    document.addEventListener('keydown', (event) => {
      if (event.target.closest('input,textarea,select')) return;
      if (event.key === 'n') {
        const first = $('.list[data-list]');
        if (first) openComposer(first.dataset.list);
      }
      if (event.key === '/') {
        event.preventDefault();
        $('#q')?.focus();
      }
      if (event.key === 'Escape') closeFloating();
    });
  }

  function showDropPlaceholder(event, container) {
    if (!dragState) return;
    const before = getDropTarget(container, event.clientY, dragState.id);
    let placeholder = $('.t10-placeholder', container);
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 't10-placeholder';
    }
    if (before) before.before(placeholder);
    else container.appendChild(placeholder);
    container.classList.add('t10-drop-hover');
  }
  function getDropTarget(container, y, draggedId) {
    const cards = $$('.card[data-c]', container).filter((card) => card.dataset.c !== draggedId);
    for (const card of cards) {
      const box = card.getBoundingClientRect();
      if (y < box.top + box.height / 2) return card;
    }
    return null;
  }
  function removePlaceholder(root = document) {
    $$('.t10-placeholder', root).forEach((item) => item.remove());
    $$('.t10-drop-hover', root).forEach((item) => item.classList.remove('t10-drop-hover'));
  }
  function clearDropState() {
    dragState = null;
    document.body.classList.remove('t10-dragging');
    removePlaceholder(document);
  }

  function closeFloating() {
    if (activeMenu) activeMenu.remove();
    if (activePopup) activePopup.remove();
    activeMenu = null;
    activePopup = null;
  }

  document.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-t10-edit]');
    if (edit) {
      event.preventDefault();
      event.stopPropagation();
      openQuickEdit(event, edit.dataset.t10Edit);
      return;
    }
    const menu = event.target.closest('[data-t10-card-menu]');
    if (menu) {
      event.preventDefault();
      event.stopPropagation();
      openCardMenu(event, menu.dataset.t10CardMenu);
      return;
    }
    if (event.target.closest('.t10-menu,.t10-quick-pop')) return;
    closeFloating();
  }, true);

  function positionFloating(el, sourceEvent) {
    const rect = sourceEvent.target.getBoundingClientRect();
    document.body.appendChild(el);
    const width = el.offsetWidth || 260;
    const left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.right - width));
    const top = Math.min(window.innerHeight - 20, Math.max(12, rect.bottom + 6));
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  async function openQuickEdit(event, cardId) {
    closeFloating();
    const { board } = await loadBoard();
    const found = findCard(board, cardId);
    if (!found) return;
    const pop = document.createElement('div');
    pop.className = 't10-quick-pop';
    pop.innerHTML = `<textarea>${esc(found.card.t)}</textarea><div class="t10-quick-row"><button class="btn" data-cancel>取消</button><button class="btn primary" data-save>儲存</button></div>`;
    activePopup = pop;
    positionFloating(pop, event);
    const input = $('textarea', pop);
    input.focus();
    input.select();
    $('[data-cancel]', pop).onclick = closeFloating;
    $('[data-save]', pop).onclick = async () => {
      const value = input.value.trim();
      if (!value) return;
      found.card.t = value;
      found.card.updatedAt = now();
      found.card.activity = Array.isArray(found.card.activity) ? found.card.activity : [];
      found.card.activity.unshift({ id: uid(), type: 'quick-edit', text: '快速編輯標題', t: '快速編輯標題', by: '我', at: now(), payload: {} });
      await saveBoard(board, `快速編輯卡片：${value}`);
      location.reload();
    };
  }

  function openCardMenu(event, cardId) {
    closeFloating();
    const menu = document.createElement('div');
    menu.className = 't10-menu';
    menu.innerHTML = `<button data-open>開啟卡片</button><button data-copy>複製卡片</button><button data-move>移動到其他列表</button><button data-top>移到列表頂端</button><button data-bottom>移到列表底部</button><hr><button data-archive>封存卡片</button>`;
    activeMenu = menu;
    positionFloating(menu, event);
    $('[data-open]', menu).onclick = () => document.querySelector(`.card[data-c="${cssEscape(cardId)}"]`)?.click();
    $('[data-copy]', menu).onclick = () => copyCard(cardId);
    $('[data-move]', menu).onclick = () => moveCardPrompt(cardId);
    $('[data-top]', menu).onclick = () => moveCardEdge(cardId, 'top');
    $('[data-bottom]', menu).onclick = () => moveCardEdge(cardId, 'bottom');
    $('[data-archive]', menu).onclick = () => archiveCard(cardId);
  }

  function openListMenu(event, listId) {
    closeFloating();
    const menu = document.createElement('div');
    menu.className = 't10-menu';
    menu.innerHTML = `<button data-add>新增卡片</button><button data-copy>複製列表</button><button data-rename>重新命名列表</button><hr><button data-archive>封存列表</button>`;
    activeMenu = menu;
    positionFloating(menu, event);
    $('[data-add]', menu).onclick = () => openComposer(listId);
    $('[data-copy]', menu).onclick = () => copyList(listId);
    $('[data-rename]', menu).onclick = () => renameList(listId);
    $('[data-archive]', menu).onclick = () => document.querySelector(`.phase2-archive-list`)?.click();
  }

  async function openComposer(listId) {
    closeFloating();
    const list = document.querySelector(`.list[data-list="${cssEscape(listId)}"]`);
    if (!list) return;
    let composer = $('.t10-composer', list);
    if (!composer) {
      composer = document.createElement('div');
      composer.className = 't10-composer phase2-quick';
      composer.innerHTML = `<textarea placeholder="輸入卡片標題，Enter 建立，Shift+Enter 換行"></textarea><div class="t10-quick-row"><button class="btn primary" data-add>新增卡片</button><button class="btn" data-cancel>取消</button></div>`;
      list.appendChild(composer);
      const input = $('textarea', composer);
      $('[data-add]', composer).onclick = () => createCard(listId, input.value);
      $('[data-cancel]', composer).onclick = () => composer.remove();
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          createCard(listId, input.value);
        }
      });
    }
    $('textarea', composer).focus();
  }

  async function createCard(listId, title) {
    const text = title.trim();
    if (!text) return;
    const { board } = await loadBoard();
    const list = findList(board, listId);
    if (!list) return;
    const card = { id: uid(), t: text, d: '', due: '', members: [], labels: [], check: [], comments: [], activity: [{ id: uid(), type: 'create', text: 'Trello 式新增卡片', t: 'Trello 式新增卡片', by: '我', at: now(), payload: {} }], attachments: [], customFields: [], timeLogs: [], priority: '中', coverUrl: '', erpTaskId: '', lastSyncedAt: '', createdAt: now(), updatedAt: now() };
    list.c.push(card);
    await saveBoard(board, `Trello 式新增卡片：${text}`);
    location.reload();
  }

  async function copyCard(cardId) {
    const { board } = await loadBoard();
    const found = findCard(board, cardId);
    if (!found) return;
    const clone = JSON.parse(JSON.stringify(found.card));
    clone.id = uid();
    clone.t = `${clone.t} 複製`;
    clone.createdAt = now();
    clone.updatedAt = now();
    clone.activity = [{ id: uid(), type: 'copy', text: '複製卡片', t: '複製卡片', by: '我', at: now(), payload: { sourceCardId: cardId } }];
    found.list.c.splice(found.index + 1, 0, clone);
    await saveBoard(board, `複製卡片：${clone.t}`);
    location.reload();
  }

  async function moveCardPrompt(cardId) {
    const { board } = await loadBoard();
    const found = findCard(board, cardId);
    if (!found) return;
    const choices = board.lists.map((list, index) => `${index + 1}. ${list.t}`).join('\n');
    const answer = prompt('移動到哪個列表？\n' + choices, '1');
    const target = board.lists[Number(answer) - 1];
    if (!target || target.id === found.list.id) return;
    found.list.c.splice(found.index, 1);
    target.c.push(found.card);
    found.card.updatedAt = now();
    await saveBoard(board, `移動卡片：${found.card.t} → ${target.t}`);
    location.reload();
  }

  async function moveCardEdge(cardId, edge) {
    const { board } = await loadBoard();
    const found = findCard(board, cardId);
    if (!found || found.list.id === 'archived') return;
    found.list.c.splice(found.index, 1);
    if (edge === 'top') found.list.c.unshift(found.card);
    else found.list.c.push(found.card);
    await saveBoard(board, `卡片移到${edge === 'top' ? '頂端' : '底部'}：${found.card.t}`);
    location.reload();
  }

  async function archiveCard(cardId) {
    if (!confirm('封存這張卡片？')) return;
    const { board } = await loadBoard();
    const found = findCard(board, cardId);
    if (!found || found.list.id === 'archived') return;
    found.list.c.splice(found.index, 1);
    board.archived.unshift(found.card);
    await saveBoard(board, `封存卡片：${found.card.t}`);
    location.reload();
  }

  async function copyList(listId) {
    const { board } = await loadBoard();
    const list = findList(board, listId);
    if (!list) return;
    const clone = JSON.parse(JSON.stringify(list));
    clone.id = uid();
    clone.t = `${clone.t} 複製`;
    clone.c = clone.c.map((card) => ({ ...card, id: uid(), t: card.t || '未命名卡片', createdAt: now(), updatedAt: now() }));
    const index = board.lists.findIndex((item) => item.id === listId);
    board.lists.splice(index + 1, 0, clone);
    await saveBoard(board, `複製列表：${clone.t}`);
    location.reload();
  }

  async function renameList(listId) {
    const { board } = await loadBoard();
    const list = findList(board, listId);
    if (!list) return;
    const name = prompt('列表名稱', list.t);
    if (!name) return;
    list.t = name.trim();
    await saveBoard(board, `重新命名列表：${list.t}`);
    location.reload();
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }

  const observer = new MutationObserver(() => decorate());
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      decorate();
      observer.observe(document.body, { childList: true, subtree: true });
      showHint('Trello 手感模式已啟用：按 / 搜尋，按 n 新增卡片');
    }, 900);
  });

  function showHint(text) {
    if ($('.t10-hint')) return;
    const hint = document.createElement('div');
    hint.className = 't10-hint';
    hint.textContent = text;
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 4200);
  }
})();