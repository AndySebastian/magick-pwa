const DB_NAME = 'magick';
const STORE = 'casts';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      store.createIndex('timestamp', 'timestamp');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addCast(intent) {
  const db = await openDB();
  // Match the CLI's strftime("%Y-%m-%dT%H:%M:%SZ") — second-precision UTC.
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).add({ timestamp, intent });
    req.onsuccess = () => resolve({ id: req.result, timestamp, intent });
    req.onerror = () => reject(req.error);
  });
}

async function listCasts() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const form = document.getElementById('cast-form');
const intentInput = document.getElementById('intent');
const confirmation = document.getElementById('confirmation');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const castView = document.getElementById('cast-view');
const historyView = document.getElementById('history-view');
const tabCast = document.getElementById('tab-cast');
const tabHistory = document.getElementById('tab-history');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const intent = intentInput.value.trim();
  if (!intent) return;
  try {
    await addCast(intent);
    confirmation.textContent = `the spell is cast for "${intent}". Godspeed.`;
    intentInput.value = '';
    intentInput.blur();
  } catch (err) {
    confirmation.textContent = `(the spell failed: ${err.message})`;
  }
});

function formatRelative(iso) {
  const then = new Date(iso);
  const now = new Date();
  const seconds = Math.round((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return then.toLocaleDateString();
}

async function renderHistory() {
  const casts = await listCasts();
  casts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  historyList.innerHTML = '';
  if (casts.length === 0) {
    historyEmpty.hidden = false;
    return;
  }
  historyEmpty.hidden = true;
  for (const cast of casts) {
    const li = document.createElement('li');
    const intent = document.createElement('span');
    intent.className = 'intent';
    intent.textContent = cast.intent;
    const time = document.createElement('time');
    time.dateTime = cast.timestamp;
    time.textContent = formatRelative(cast.timestamp);
    time.title = cast.timestamp;
    li.appendChild(intent);
    li.appendChild(time);
    historyList.appendChild(li);
  }
}

function switchView(viewId) {
  const showCast = viewId === 'cast-view';
  castView.hidden = !showCast;
  historyView.hidden = showCast;
  tabCast.classList.toggle('active', showCast);
  tabHistory.classList.toggle('active', !showCast);
  if (!showCast) renderHistory();
  try { localStorage.setItem('view', viewId); } catch {}
}

tabCast.addEventListener('click', () => switchView('cast-view'));
tabHistory.addEventListener('click', () => switchView('history-view'));

const lastView = (() => {
  try { return localStorage.getItem('view') || 'cast-view'; } catch { return 'cast-view'; }
})();
switchView(lastView);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
