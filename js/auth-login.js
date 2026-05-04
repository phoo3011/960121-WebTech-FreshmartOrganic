(function () {
  const form = document.getElementById('login-form');
  const message = document.getElementById('login-message');

  if (!form || !message) {
    return;
  }

  const showMessage = (text, type) => {
    message.textContent = text;
    message.className = `alert alert-${type}`;
    message.style.display = 'block';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
      showMessage('Email and password are required.', 'danger');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user || { email }));
        showMessage('Login successful. Redirecting...', 'success');
        window.setTimeout(() => {
          window.location.href = 'index.html';
        }, 700);
        return;
      }

      showMessage(data.error || 'Login failed.', 'danger');
    } catch (error) {
      showMessage('Network error during login.', 'danger');
      console.error('Network error during login:', error);
    }
  });
})();