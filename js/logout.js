function logout() {
  const user = getCurrentUser();
  localStorage.removeItem('currentUser');
  if (typeof addLog === 'function') {
    addLog({ action: 'logout', role: user ? user.role : 'guest' });
  }
  window.location.href = 'login.html';
}

// Make logout globally accessible
window.logout = logout;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', logout);
  }
});

