/**
 * @fileoverview Fluxo do navegador para validação do token e redefinição de senha.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module public/reset-password
 */

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

    const responseText = await response.text();
    let data = {};
    try { data = responseText ? JSON.parse(responseText) : {}; }
    catch { throw new Error('O servidor retornou uma resposta inválida.'); }
    if (!response.ok) throw new Error(data.error || 'Erro ao redefinir senha.');

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    show(data.message || 'Senha redefinida com sucesso.');
    form.hidden = true;

    setTimeout(() => window.location.replace('/app?passwordReset=success'), 1200);
  } catch (error) {
    show(error.message, true);
  }
});
