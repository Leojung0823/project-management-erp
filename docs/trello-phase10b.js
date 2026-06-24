(() => {
  const MODULE = 'trello_boards';
  const CONFIG_KEY = 'pm_erp_supabase_config_v3';
  const VERSION = '20260624-pro-12';
  let sb = null;
  let active = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const uid = () => crypto.randomUUID();
  const now = () => new Date().toISOString();
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const css = (value) => window.CSS?.escape ? CSS.escape(value) : String(value).replace(/"/g, '\\"');
  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;

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
    return { client, board: normalizeBoard({ id: row.id, ...row.data }) };
  }

  function normalizeBoard(board) {
    board.id = board.id || uid();
    board.title = board.title || 'PM ERP Trello';
    board.labels = Array.isArray(board.labels) ? board.labels : [];
    board.lists = Array.isArray(board.lists) ? board.lists.map(normalizeList) : [];
    board.archived = Array.isArray(board.archived) ? board.archived.map(normalizeCard) : [];
    board.archivedLists = Array.isArray(board.archivedLists) ? board.archivedLists.map(normalizeList) : [];
    board.activity = Array.isArray(board.activity) ? board.activity : [];
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
    card.attachments = Array.isArray(card.attachments) ? card.attachments : [];
    card.customFields = Array.isArray(card.customFields) ? card.customFields : [];
    card.timeLogs = Array.isArray(card.timeLogs) ? card.timeLogs : [];
    card.priority = card.priority || '中';
    card.coverUrl = card.coverUrl || card.cover || '';
    card.erpTaskId = card.erpTaskId || '';
    card.lastSyncedAt = card.lastSyncedAt || '';
    return card;
  }
  async function saveBoard(board, message) {
    board.updatedAt = now();
    board.activity = Array.isArray(board.activity) ? board.activity : [];
    if (message) board.activity.unshift({ id: uid(), type: 'phase10b', text: message, t: message, by: '我', at: now(), payload: {} });
    const client = await getClient();
    const result = await client.from('erp_records').upsert({ id: board.id, module: MODULE, title: board.title, data: board });
    if (result.error) throw result.error;
  }
  function findCard(board, cardId) {
    for (const list of board.lists || []) {
      const index = list.c.findIndex((card) => card.id === cardId);
      if (index >= 0) return { list, card: list.c[index], index };
    }
    return null;
  }
  function findList(board, listId) {
    return (board.lists || []).find((list) => list.id === listId);
  }
  function labelMap(board) {
    return Object.fromEntries((board.labels || []).map((label) => [label.id, label]));
  }

  async function decorate() {
    try {
      const { board } = await loadBoard();
      decorateCards(board);
      decorateLists(board);
      decorateMobileSheet();
      addReleaseBadge();
    } catch (error) {
      console.warn('phase10b decorate failed', error);
    }
  }

  function decorateCards(board) {
    const labels = labelMap(board);
    $$('.card[data-c]').forEach((el) => {
      const found = findCard(board, el.dataset.c);
      if (!found) return;
      el.dataset.t10bReady = '1';
      $('.t10-card-actions', el)?.classList.add('t10-soft-hidden');
      if (!$('.t10b-actions', el)) {
        el.insertAdjacentHTML('beforeend', `<div class="t10b-actions"><button title="快速編輯" data-t10b-edit="${esc(found.card.id)}">✎</button><button title="更多" data-t10b-menu="${esc(found.card.id)}">⋯</button></div>`);
      }
      renderBadges(el, found.card, labels);
    });
  }

  function renderBadges(el, card, labels = {}) {
    $('.t10b-badges', el)?.remove();
    const done = (card.check || []).filter((item) => item.done).length;
    const total = (card.check || []).length;
    const fields = Array.isArray(card.customFields) ? card.customFields.length : Object.keys(card.custom || {}).length;
    const hours = (card.timeLogs || []).reduce((sum, item) => sum + Number(item.hours || 0), 0);
    const names = (card.labels || []).map((id) => labels[id]?.n || id).filter(Boolean).slice(0, 3);
    const badges = [];
    if (card.coverUrl || card.cover) badges.push('🖼 封面');
    if (names.length) badges.push('🏷 ' + names.join(' / '));
    if (total) badges.push(`☑ ${done}/${total}`);
    if (card.attachments?.length) badges.push(`📎 ${card.attachments.length}`);
    if (card.comments?.length) badges.push(`💬 ${card.comments.length}`);
    if (fields) badges.push(`欄位 ${fields}`);
    if (hours) badges.push(`⏱ ${hours}h`);
    badges.push(card.erpTaskId ? 'ERP 已同步' : 'ERP 未同步');
    el.insertAdjacentHTML('beforeend', `<div class="t10b-badges">${badges.map((text) => `<span>${esc(text)}</span>`).join('')}</div>`);
  }

  function decorateLists() {
    $$('.list[data-list]').forEach((list) => {
      const head = $('.list-head', list);
      if (!head || $('.t10b-list-more', head)) return;
      $('.t10-list-more', head)?.classList.add('t10-soft-hidden');
      const button = document.createElement('button');
      button.className = 'list-menu t10b-list-more';
      button.textContent = '⋯';
      button.title = '列表操作';
      button.dataset.t10bListMenu = list.dataset.list;
      head.appendChild(button);
    });
  }

  function addReleaseBadge() {
    const brand = $('.brand');
    if (!brand || $('.t10b-release', brand)) return;
    brand.insertAdjacentHTML('beforeend', `<span class="t10b-release">Pro 12｜No reload polish</span>`);
  }

  document.addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-t10b-edit]');
    if (edit) {
      event.preventDefault();
      event.stopPropagation();
      await openQuickEdit(event, edit.dataset.t10bEdit);
      return;
    }
    const cardMenu = event.target.closest('[data-t10b-menu]');
    if (cardMenu) {
      event.preventDefault();
      event.stopPropagation();
      openCardSheet(event, cardMenu.dataset.t10bMenu);
      return;
    }
    const listMenu = event.target.closest('[data-t10b-list-menu]');
    if (listMenu) {
      event.preventDefault();
      event.stopPropagation();
      openListSheet(event, listMenu.dataset.t10bListMenu);
      return;
    }
    if (!event.target.closest('.t10b-sheet,.t10b-pop')) closeActive();
  }, true);

  function closeActive() {
    if (active) active.remove();
    active = null;
    document.body.classList.remove('t10b-sheet-open');
  }
  function place(el, event) {
    document.body.appendChild(el);
    active = el;
    if (isMobile()) {
      document.body.classList.add('t10b-sheet-open');
      return;
    }
    const rect = event.target.getBoundingClientRect();
    const width = el.offsetWidth || 260;
    el.style.left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.right - width)) + 'px';
    el.style.top = Math.min(window.innerHeight - 20, Math.max(12, rect.bottom + 6)) + 'px';
  }

  async function openQuickEdit(event, cardId) {
    closeActive();
    const { board } = await loadBoard();
    const found = findCard(board, cardId);
    if (!found) return;
    const pop = document.createElement('div');
    pop.className = 't10b-pop';
    pop.innerHTML = `<textarea>${esc(found.card.t)}</textarea><div class="t10b-row"><button class="btn" data-cancel>取消</button><button class="btn primary" data-save>儲存，不重整</button></div>`;
    place(pop, event);
    const textarea = $('textarea', pop);
    textarea.focus();
    textarea.select();
    $('[data-cancel]', pop).onclick = closeActive;
    $('[data-save]', pop).onclick = async () => {
      const value = textarea.value.trim();
      if (!value) return;
      found.card.t = value;
      found.card.updatedAt = now();
      await saveBoard(board, `快速編輯卡片：${value}`);
      const el = document.querySelector(`.card[data-c="${css(cardId)}"]`);
      if (el) {
        const title = $('.card-title', el);
        if (title) title.textContent = value;
        renderBadges(el, found.card, labelMap(board));
      }
      closeActive();
      toast('已儲存，畫面未重整');
    };
  }

  function openCardSheet(event, cardId) {
    closeActive();
    const sheet = document.createElement('div');
    sheet.className = 't10b-sheet';
    sheet.innerHTML = `<div class="t10b-handle"></div><h3>卡片操作</h3><button data-open>開啟卡片</button><button data-copy>複製卡片</button><button data-top>移到列表頂端</button><button data-bottom>移到列表底部</button><button data-move>移動到其他列表</button><button data-archive class="danger">封存卡片</button>`;
    place(sheet, event);
    $('[data-open]', sheet).onclick = () => document.querySelector(`.card[data-c="${css(cardId)}"]`)?.click();
    $('[data-copy]', sheet).onclick = () => copyCard(cardId);
    $('[data-top]', sheet).onclick = () => moveCardEdge(cardId, 'top');
    $('[data-bottom]', sheet).onclick = () => moveCardEdge(cardId, 'bottom');
    $('[data-move]', sheet).onclick = () => moveCardPrompt(cardId);
    $('[data-archive]', sheet).onclick = () => archiveCard(cardId);
  }

  function openListSheet(event, listId) {
    closeActive();
    const sheet = document.createElement('div');
    sheet.className = 't10b-sheet';
    sheet.innerHTML = `<div class="t10b-handle"></div><h3>列表操作</h3><button data-add>新增卡片</button><button data-copy>複製列表</button><button data-rename>重新命名列表</button><button data-archive class="danger">封存列表</button>`;
    place(sheet, event);
    $('[data-add]', sheet).onclick = () => openComposer(listId);
    $('[data-copy]', sheet).onclick = () => copyList(listId);
    $('[data-rename]', sheet).onclick = () => renameList(listId);
    $('[data-archive]', sheet).onclick = () => archiveList(listId);
  }

  async function openComposer(listId) {
    closeActive();
    const listEl = document.querySelector(`.list[data-list="${css(listId)}"]`);
    if (!listEl) return;
    let composer = $('.t10b-composer', listEl);
    if (!composer) {
      composer = document.createElement('div');
      composer.className = 't10b-composer';
      composer.innerHTML = `<textarea placeholder="輸入卡片標題，Enter 建立"></textarea><div class="t10b-row"><button class="btn primary" data-add>新增</button><button class="btn" data-cancel>取消</button></div>`;
      listEl.appendChild(composer);
      const textarea = $('textarea', composer);
      $('[data-add]', composer).onclick = () => createCard(listId, textarea.value, composer);
      $('[data-cancel]', composer).onclick = () => composer.remove();
      textarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          createCard(listId, textarea.value, composer);
        }
      });
    }
    $('textarea', composer).focus();
  }

  function cardHtml(card, listId, board) {
    const labels = (card.labels || []).map((id) => {
      const label = (board.labels || []).find((item) => item.id === id || item.n === id);
      return label ? `<span title="${esc(label.n)}" class="label" style="background:${esc(label.c)}"></span>` : '';
    }).join('');
    const done = (card.check || []).filter((item) => item.done).length;
    const total = (card.check || []).length;
    const over = card.due && card.due < new Date().toISOString().slice(0, 10);
    return `<article class="card" draggable="true" data-c="${esc(card.id)}" data-f="${esc(listId)}">${card.coverUrl ? `<div class="card-cover" style="background-image:url('${esc(card.coverUrl)}')"></div>` : ''}${labels ? `<div class="labels">${labels}</div>` : ''}<div class="card-title">${esc(card.t)}</div><div class="meta">${card.priority ? `<span class="badge">⚑ ${esc(card.priority)}</span>` : ''}${card.due ? `<span class="badge ${over ? 'overdue' : ''}">📅 ${esc(card.due)}</span>` : ''}${total ? `<span class="badge">☑ ${done}/${total}</span>` : ''}<span class="avatars">${(card.members || []).map((name) => `<span class="avatar">${esc(String(name)[0] || '?')}</span>`).join('')}</span></div></article>`;
  }

  async function createCard(listId, title, composer) {
    const text = String(title || '').trim();
    if (!text) return;
    const { board } = await loadBoard();
    const list = findList(board, listId);
    if (!list) return;
    const card = normalizeCard({ id: uid(), t: text, createdAt: now(), updatedAt: now(), activity: [{ id: uid(), type: 'create', text: '新增卡片', t: '新增卡片', by: '我', at: now(), payload: {} }] });
    list.c.push(card);
    await saveBoard(board, `新增卡片：${text}`);
    const cards = document.querySelector(`.list[data-list="${css(listId)}"] [data-drop]`);
    if (cards) {
      $('.empty', cards)?.remove();
      cards.insertAdjacentHTML('beforeend', cardHtml(card, listId, board));
      decorateCards(board);
      updateListCount(listId, list.c.length);
    }
    if (composer) $('textarea', composer).value = '';
    toast('已新增卡片，未重整頁面');
  }

  async function copyCard(cardId) {
    const { board } = await loadBoard();
    const found = findCard(board, cardId);
    if (!found) return;
    const clone = normalizeCard(JSON.parse(JSON.stringify(found.card)));
    clone.id = uid();
    clone.t = `${clone.t} 複製`;
    clone.createdAt = now();
    clone.updatedAt = now();
    found.list.c.splice(found.index + 1, 0, clone);
    await saveBoard(board, `複製卡片：${clone.t}`);
    const current = document.querySelector(`.card[data-c="${css(cardId)}"]`);
    if (current) {
      current.insertAdjacentHTML('afterend', cardHtml(clone, found.list.id, board));
      decorateCards(board);
      updateListCount(found.list.id, found.list.c.length);
    }
    closeActive();
    toast('已複製卡片，未重整頁面');
  }

  async function moveCardEdge(cardId, edge) {
    const { board } = await loadBoard();
    const found = findCard(board, cardId);
    if (!found) return;
    found.list.c.splice(found.index, 1);
    edge === 'top' ? found.list.c.unshift(found.card) : found.list.c.push(found.card);
    await saveBoard(board, `卡片移到${edge === 'top' ? '頂端' : '底部'}：${found.card.t}`);
    const el = document.querySelector(`.card[data-c="${css(cardId)}"]`);
    const container = document.querySelector(`.list[data-list="${css(found.list.id)}"] [data-drop]`);
    if (el && container) edge === 'top' ? container.prepend(el) : container.appendChild(el);
    closeActive();
    toast('已移動卡片，未重整頁面');
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
    await saveBoard(board, `移動卡片：${found.card.t} → ${target.t}`);
    const el = document.querySelector(`.card[data-c="${css(cardId)}"]`);
    const container = document.querySelector(`.list[data-list="${css(target.id)}"] [data-drop]`);
    if (el && container) {
      el.dataset.f = target.id;
      $('.empty', container)?.remove();
      container.appendChild(el);
      updateListCount(found.list.id, found.list.c.length);
      updateListCount(target.id, target.c.length);
    }
    closeActive();
    toast('已移動到其他列表，未重整頁面');
  }

  async function archiveCard(cardId) {
    if (!confirm('封存這張卡片？')) return;
    const { board } = await loadBoard();
    const found = findCard(board, cardId);
    if (!found) return;
    found.list.c.splice(found.index, 1);
    board.archived = board.archived || [];
    board.archived.unshift(found.card);
    await saveBoard(board, `封存卡片：${found.card.t}`);
    document.querySelector(`.card[data-c="${css(cardId)}"]`)?.remove();
    updateListCount(found.list.id, found.list.c.length);
    closeActive();
    toast('已封存卡片，未重整頁面');
  }

  async function copyList(listId) {
    const { board } = await loadBoard();
    const list = findList(board, listId);
    if (!list) return;
    const clone = normalizeList(JSON.parse(JSON.stringify(list)));
    clone.id = uid();
    clone.t = `${clone.t} 複製`;
    clone.c = clone.c.map((card) => ({ ...normalizeCard(card), id: uid(), createdAt: now(), updatedAt: now() }));
    const index = board.lists.findIndex((item) => item.id === listId);
    board.lists.splice(index + 1, 0, clone);
    await saveBoard(board, `複製列表：${clone.t}`);
    const current = document.querySelector(`.list[data-list="${css(listId)}"]`);
    if (current) {
      current.insertAdjacentHTML('afterend', listHtml(clone, board));
      decorateCards(board);
      decorateLists(board);
    }
    closeActive();
    toast('已複製列表，未重整頁面');
  }

  function listHtml(list, board) {
    return `<section class="list" data-list="${esc(list.id)}"><div class="list-head"><input data-lt="${esc(list.id)}" value="${esc(list.t)}"><span class="count">${list.c.length}</span></div><div class="cards" data-drop="${esc(list.id)}">${list.c.map((card) => cardHtml(card, list.id, board)).join('') || '<div class="empty">拖曳卡片到這裡</div>'}</div><button class="add-card" data-ac="${esc(list.id)}">+ 新增卡片</button></section>`;
  }

  async function renameList(listId) {
    const { board } = await loadBoard();
    const list = findList(board, listId);
    if (!list) return;
    const name = prompt('列表名稱', list.t);
    if (!name) return;
    list.t = name.trim();
    await saveBoard(board, `重新命名列表：${list.t}`);
    const input = document.querySelector(`.list[data-list="${css(listId)}"] .list-head input`);
    if (input) input.value = list.t;
    closeActive();
    toast('已重新命名列表，未重整頁面');
  }

  async function archiveList(listId) {
    if (!confirm('封存整個列表？列表內卡片會保留在封存列表資料中。')) return;
    const { board } = await loadBoard();
    const index = board.lists.findIndex((list) => list.id === listId);
    if (index < 0) return;
    const [list] = board.lists.splice(index, 1);
    board.archivedLists = board.archivedLists || [];
    board.archivedLists.unshift({ ...list, archivedAt: now() });
    await saveBoard(board, `封存列表：${list.t}`);
    document.querySelector(`.list[data-list="${css(listId)}"]`)?.remove();
    closeActive();
    toast('已封存列表，未重整頁面');
  }

  function updateListCount(listId, count) {
    const el = document.querySelector(`.list[data-list="${css(listId)}"] .count`);
    if (el) el.textContent = String(count);
  }

  function decorateMobileSheet() {
    if (!isMobile()) return;
    if (!$('.t10b-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.className = 't10b-backdrop';
      backdrop.onclick = closeActive;
      document.body.appendChild(backdrop);
    }
  }

  function toast(message) {
    let el = $('.t10b-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 't10b-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el.timer);
    el.timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  const observer = new MutationObserver(() => decorate());
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      decorate();
      observer.observe(document.body, { childList: true, subtree: true });
      toast('Pro 12：快速操作已改成不重整頁面');
    }, 1300);
  });
})();
