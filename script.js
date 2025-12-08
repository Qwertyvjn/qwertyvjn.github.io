// ===== SAFE GLOBAL MODAL FUNCTION =====
window.openModal = function(url) {
  // Create modal container if missing
  let modal = document.getElementById('modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <button id="modal-close" class="modal-close">&times;</button>
        <div id="modal-body" style="padding:1.5rem;overflow-y:auto;max-height:80vh;"></div>
      </div>
    `;
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: '2000',
      opacity: '0', visibility: 'hidden',
      transition: 'opacity 0.3s'
    });
    document.body.appendChild(modal);

    const content = modal.querySelector('.modal-content');
    Object.assign(content.style, {
      background: 'var(--card)',
      color: 'var(--text)',
      width: '90%',
      maxWidth: '900px',
      maxHeight: '90vh',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      transform: 'scale(0.95)',
      transition: 'transform 0.3s'
    });

    const closeBtn = document.getElementById('modal-close');
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '1rem', right: '1rem',
      background: 'none',
      border: 'none',
      color: 'var(--dim)',
      fontSize: '1.5rem',
      cursor: 'pointer'
    });
    closeBtn.onmouseover = () => closeBtn.style.color = 'var(--accent)';
    closeBtn.onmouseout = () => closeBtn.style.color = 'var(--dim)';
    closeBtn.onclick = closeModal;
    modal.onclick = e => { if (e.target === modal) closeModal(); };
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  // Show modal + fetch content
  modal.style.opacity = '1';
  modal.style.visibility = 'visible';
  modal.querySelector('.modal-content').style.transform = 'scale(1)';
  document.body.style.overflow = 'hidden';

  const body = document.getElementById('modal-body');
  body.innerHTML = '<p style="text-align:center;padding:2rem;">Loading...</p>';

  fetch(url)
    .then(res => res.ok ? res.text() : Promise.reject(`HTTP ${res.status}`))
    .then(html => body.innerHTML = html)
    .catch(err => {
      console.error('Modal load failed:', err);
      body.innerHTML = `
        <h2 style="color:var(--accent);">⚠️ Failed to load methodology</h2>
        <p>Could not load: <code>${url}</code></p>
        <p style="font-size:0.9rem;color:var(--dim);">Ensure <code>ipcc-methodology.html</code> exists in your repo root.</p>
        <button onclick="document.getElementById('modal-overlay').click()" style="
          margin-top:1rem;padding:0.5rem 1rem;background:var(--accent);color:var(--card);
          border:none;border-radius:0.375rem;cursor:pointer;
        ">Close</button>
      `;
    });
};

function closeModal() {
  const modal = document.getElementById('modal-overlay');
  if (!modal) return;
  modal.style.opacity = '0';
  modal.querySelector('.modal-content').style.transform = 'scale(0.95)';
  setTimeout(() => {
    modal.style.visibility = 'hidden';
    document.body.style.overflow = '';
  }, 300);
}

// ===== CARBON + IQAir — SAFE INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // IQAir
  const API_KEY = 'f74e14f9-86c9-4246-8065-ec2018624690';
  const el = {
    loc: document.getElementById('location-data'),
    aqi: document.getElementById('aqi-display'),
    city: document.getElementById('city-name'),
    aqiv: document.getElementById('aqi-value'),
    aqic: document.getElementById('aqi-category'),
    co2: document.getElementById('co2-value'),
    temp: document.getElementById('temp-value')
  };

  if (el.loc && navigator.geolocation) {
    el.loc.textContent = '📍 Detecting your location...';
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetch(`https://api.airvisual.com/v2/nearest_city?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&key=${API_KEY}`)
          .then(r => r.json())
          .then(d => {
            if (d.status !== 'success') throw 'Invalid response';
            const a = d.data.current.pollution.aqius;
            const cats = [{max:50,n:'Good',c:'#00e400'},{max:100,n:'Moderate',c:'#ffff00'},{max:150,n:'Unhealthy for Sensitive',c:'#ff7e00'},{max:200,n:'Unhealthy',c:'#ff0000'},{max:300,n:'Very Unhealthy',c:'#8f3f97'},{max:999,n:'Hazardous',c:'#7e0023'}];
            const c = cats.find(x => a <= x.max) || cats[0];
            el.city.textContent = d.data.city || 'Nearby';
            el.aqiv.textContent = a;
            el.aqic.textContent = c.n;
            el.aqic.style.color = c.c;
            el.co2.textContent = Math.round(400 + (a / 300) * 150);
            el.temp.textContent = d.data.current.weather.tp;
            el.loc.classList.add('hidden');
            el.aqi.classList.remove('hidden');
          })
          .catch(() => {
            el.loc.textContent = '🔒 Data Inaccessible';
            el.loc.style.color = '#ff7e00';
            el.aqi.classList.add('hidden');
          });
      },
      () => {
        el.loc.textContent = '🔒 Data Inaccessible';
        el.loc.style.color = '#ff7e00';
        el.aqi.classList.add('hidden');
      },
      { timeout: 10000 }
    );
  }

  // Carbon Counter
  setInterval(() => {
    const t = document.getElementById('time-spent');
    const c = document.getElementById('carbon-value');
    const e = document.getElementById('equivalent');
    if (!t || !c || !e) return;
    const sec = parseInt(t.textContent) + 1;
    t.textContent = sec;
    const co2 = (sec * 0.0003).toFixed(1);
    c.textContent = co2;
    e.textContent = (parseFloat(co2) / 1.8).toFixed(3) + ' g of rice';
  }, 1000);

  // Theme Toggle
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.onclick = () => {
      const html = document.documentElement;
      html.classList.contains('light') ? html.classList.remove('light') : html.classList.add('light');
    };
  }

  // Search
  const search = document.getElementById('search-input');
  if (search) {
    search.oninput = () => {
      const q = search.value.trim().toLowerCase();
      const results = document.getElementById('search-results') || (() => {
        const r = document.createElement('div');
        r.id = 'search-results';
        search.parentNode.insertBefore(r, search.nextSibling);
        return r;
      })();
      
      if (!q) {
        document.body.classList.remove('search-active');
        results.innerHTML = '';
        return;
      }

      document.body.classList.add('search-active');
      const matches = [];
      ['#content', '#tools'].forEach(id => {
        document.querySelectorAll(`${id} .card`).forEach(card => {
          const txt = [card.querySelector('h3'), card.querySelector('p')]
            .map(x => x?.textContent || '')
            .join(' ') + Array.from(card.querySelectorAll('a')).map(a => a.textContent).join(' ');
          if (txt.toLowerCase().includes(q)) matches.push(card.cloneNode(true));
        });
      });

      results.innerHTML = matches.length ? `
        <h3 style="text-align:center; margin:1rem 0; color:var(--accent);">
          ${matches.length} result${matches.length !== 1 ? 's' : ''} for "<strong>${search.value}</strong>"
        </h3>
        ${matches.map(c => c.outerHTML).join('')}
      ` : `
        <div class="card" style="text-align:center;padding:2rem;">
          <p>No results for "<strong>${search.value}</strong>"</p>
        </div>
      `;
    };
  }
});

// ===== MODAL SYSTEM =====
document.addEventListener('DOMContentLoaded', () => {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  if (!modalOverlay || !modalBody) return;
  // Open modal with remote HTML file
  window.openModal = async function(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      modalBody.innerHTML = html;
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.error('Modal load failed:', err);
      modalBody.innerHTML = `
        <h2 style="color:var(--accent);">⚠️ Content Unavailable</h2>
        <p>Could not load: <code>${url}</code></p>
        <p style="font-size:0.9rem; color:var(--dim);">
          Check console for details, or try again later.
        </p>
      `;
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };
  // Close modal
  function closeModal() {
    if (!modalOverlay.classList.contains('active')) return;
    modalOverlay.classList.remove('active');
    setTimeout(() => {
      modalBody.innerHTML = '';
      document.body.style.overflow = '';
    }, 300); // Match CSS transition
  }
  // Events
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
