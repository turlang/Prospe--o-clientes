const form = document.querySelector('#resetForm');
const statusBox = document.querySelector('#resetStatus');
const params = new URLSearchParams(window.location.search);
const token = params.get('token') || '';

function show(message, isError = false) {
  statusBox.innerHTML = `<p class="${isError ? 'error' : ''}">${message}</p>`;
}

if (!token) {
  show('Link inválido ou sem token.', true);
  form.hidden = true;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const password = document.querySelector('#newPassword').value;
  const confirm = document.querySelector('#confirmPassword').value;

  if (password !== confirm) {
    show('As senhas não conferem.', true);
    return;
  }

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro ao redefinir senha.');

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    show(data.message || 'Senha redefinida com sucesso.');
    form.hidden = true;

    setTimeout(() => window.location.replace('/app'), 1800);
  } catch (error) {
    show(error.message, true);
  }
});
