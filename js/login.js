const credentials = {
  user: { email: 'user@gmail.com', password: 'user123', role: 'user', name: 'EduVault User' },
  admin: { email: 'admin@gmail.com', password: 'admin123', role: 'admin', name: 'EduVault Admin' },
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    const match = Object.values(credentials).find((c) => c.email === email && c.password === password);

    if (!match) {
      renderAlert('loginAlert', 'error', 'Invalid credentials. Try again.');
      return;
    }

    const user = { email: match.email, role: match.role, name: match.name };
    localStorage.setItem('currentUser', JSON.stringify(user));
    addLog({ action: 'login', role: user.role });

    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'student.html';
    }
  });
});

