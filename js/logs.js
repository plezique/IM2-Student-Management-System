const LOG_KEY = 'logs';

function getLogs() {
  const data = localStorage.getItem(LOG_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLogs(logs) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

function addLog({ action, role = 'guest', studentId = '', details = '' }) {
  const logs = getLogs();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    action,
    role,
    studentId,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(entry);
  saveLogs(logs);
  return entry;
}

function formatLogTime(ts) {
  return new Date(ts).toLocaleString();
}

