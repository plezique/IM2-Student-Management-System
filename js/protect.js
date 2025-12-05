function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  return raw ? JSON.parse(raw) : null;
}

function requireAuth(role) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  if (role && user.role !== role) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (!user) return;
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'student.html';
  }
}

function renderAlert(targetId, type, message) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = `<div class="alert ${type} fade-in">${message}</div>`;
}

function loadComponent(targetId, path) {
  const target = document.getElementById(targetId);
  if (!target) return;
  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      target.innerHTML = html;
      const depth = target.dataset.depth || '';
      const prefix = depth === '1' ? '..' : '.';
      target.querySelectorAll('.nav-linkable').forEach((link) => {
        const rel = link.getAttribute('data-path');
        if (rel) link.setAttribute('href', `${prefix}/${rel}`);
      });
    })
    .catch(() => {
      target.innerHTML = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const headerSlot = document.getElementById('header');
  const footerSlot = document.getElementById('footer');
  if (headerSlot) {
    const depth = headerSlot.dataset.depth || '';
    const prefix = depth === '1' ? '..' : '.';
    loadComponent('header', `${prefix}/components/header.html`);
  }
  if (footerSlot) {
    const depth = footerSlot.dataset.depth || '';
    const prefix = depth === '1' ? '..' : '.';
    loadComponent('footer', `${prefix}/components/footer.html`);
  }
});

