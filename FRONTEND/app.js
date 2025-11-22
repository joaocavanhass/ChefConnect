/* app.js
    Básico: cadastro de usuário e pesquisa de receita via fetch.
    Ajuste API_BASE para o endereço real da sua API.
*/

const API_BASE = 'http://localhost:3000/api'; // <-- alterar conforme necessário

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const searchForm = document.getElementById('searchForm');
  const resultsContainer = document.getElementById('results');
  const signupMsg = document.getElementById('signupMsg');
  const searchMsg = document.getElementById('searchMsg');

  if (signupForm) {
     signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        signupMsg && setMessage(signupMsg, '', ''); // limpa
        const form = new FormData(signupForm);
        const payload = {
          name: (form.get('name') || '').trim(),
          email: (form.get('email') || '').trim(),
          password: (form.get('password') || '')
        };
        if (!payload.name || !payload.email || !payload.password) {
          signupMsg && setMessage(signupMsg, 'Preencha todos os campos.', 'error');
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/users/register`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (res.ok) {
             signupForm.reset();
             signupMsg && setMessage(signupMsg, data.message || 'Cadastro realizado com sucesso.', 'success');
          } else {
             signupMsg && setMessage(signupMsg, data.error || data.message || 'Erro no cadastro.', 'error');
          }
        } catch (err) {
          signupMsg && setMessage(signupMsg, 'Erro de conexão. Tente novamente.', 'error');
          console.error(err);
        }
     });
  }

  if (searchForm) {
     searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        searchMsg && setMessage(searchMsg, '', '');
        resultsContainer && (resultsContainer.innerHTML = '');
        const form = new FormData(searchForm);
        const query = (form.get('q') || '').trim();
        if (!query) {
          searchMsg && setMessage(searchMsg, 'Informe um termo para busca.', 'error');
          return;
        }

        try {
          // exemplo: /api/recipes/search?q=bolo
          const url = `${API_BASE}/recipes/search?q=${encodeURIComponent(query)}`;
          const res = await fetch(url);
          const data = await res.json();
          if (!res.ok) {
             searchMsg && setMessage(searchMsg, data.error || 'Erro na busca.', 'error');
             return;
          }
          renderRecipes(resultsContainer, data.recipes || data || []);
          if ((data.recipes || data).length === 0) {
             searchMsg && setMessage(searchMsg, 'Nenhuma receita encontrada.', 'info');
          }
        } catch (err) {
          searchMsg && setMessage(searchMsg, 'Erro de conexão. Tente novamente.', 'error');
          console.error(err);
        }
     });
  }
});

/* Helpers */

function setMessage(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = ''; // limpa classes
  if (type) el.classList.add(type); // 'success', 'error', 'info' — estilizar no CSS
}

function renderRecipes(container, items) {
  if (!container) return;
  if (!Array.isArray(items) || items.length === 0) {
     container.innerHTML = '';
     return;
  }
  // render simples: título, descrição e link (se existir)
  container.innerHTML = items.map(item => {
     const title = escapeHtml(item.title || item.name || 'Sem título');
     const desc = escapeHtml(item.description || item.summary || '');
     const url = item.url ? `<a href="${escapeAttr(item.url)}" target="_blank" rel="noopener">Ver</a>` : '';
     return `<div class="recipe">
        <h3>${title}</h3>
        <p>${desc}</p>
        <p>${url}</p>
     </div>`;
  }).join('');
}

/* Pequenas proteções contra XSS ao inserir strings no HTML */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
     .replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;');
}
function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}