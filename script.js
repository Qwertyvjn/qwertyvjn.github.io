// ===== MODAL SYSTEM =====
document.addEventListener('DOMContentLoaded', () => {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  window.openModal = async function(url) {
    try {
      const res = await fetch(url);
      modalBody.innerHTML = await res.text();
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    } catch (err) {
      modalBody.innerHTML = `<h2 style="color:var(--accent)">⚠️ Failed to load</h2><p>${err.message}</p>`;
      modalOverlay.classList.add('active');
    }
  };

  function closeModal() {
    modalOverlay.classList.remove('active');
    setTimeout(() => modalBody.innerHTML = '', 300);
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // ===== SEARCH =====
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const layout = document.querySelector('.layout');

  if (!searchInput) return;
  searchInput.addEventListener('input', debounce(() => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return layout.classList.remove('search-active'), searchResults.innerHTML = '';

    layout.classList.add('search-active');
    const matches = [];
    ['#content', '#tools'].forEach(id => {
      document.querySelectorAll(`${id} .card`).forEach(card => {
        const text = [card.querySelector('h3'), card.querySelector('p')]
          .map(el => el?.textContent || '')
          .join(' ') + Array.from(card.querySelectorAll('a')).map(a => a.textContent).join(' ');
        if (text.toLowerCase().includes(q)) matches.push(card.cloneNode(true));
      });
    });

    searchResults.innerHTML = matches.length ? `
      <h3 style="text-align:center; margin-bottom:1rem; color:var(--accent);">
        ${matches.length} result${matches.length !== 1 ? 's' : ''} for "<strong>${searchInput.value}</strong>"
      </h3>
      ${matches.map(c => c.outerHTML).join('')}
    ` : `
      <div class="card" style="text-align:center; padding:2rem;">
        <p>No results for "<strong>${searchInput.value}</strong>"</p>
      </div>
    `;
    searchResults.classList.remove('hidden');
  }, 150));

  function debounce(fn, wait) {
    let t;
    return (...args) => (clearTimeout(t), t = setTimeout(() => fn(...args), wait));
  }
});
