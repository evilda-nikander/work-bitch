// app.js - wiring + milestones + built-in confetti
(() => {
  // CONFIG
  const TARGET = 185380.00;
  const STORAGE_KEY = 'gclass:contribs';
  // milestones set to 10..90 every 10%
  const MILESTONES = [10,20,30,40,50,60,70,80,90];

  // DOM
  const addInput = document.getElementById('addInput');
  const addBtn = document.getElementById('addBtn');
  const undoBtn = document.getElementById('undoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const remainingEl = document.getElementById('remainingAmount');
  const percentEl = document.getElementById('percentFunded');
  const progressBar = document.getElementById('progressBar');
  const milestonesList = document.getElementById('milestones');
  const toastEl = document.getElementById('toast');
  const addForm = document.getElementById('addForm');
  const confettiCanvas = document.getElementById('confettiCanvas');

  // State
  let contributions = loadContributions();

  // Utilities
  function fmtEuro(n) {
    try {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(n) + '\u00A0��';
    } catch (e) {
      return n.toFixed(2) + ' €';
    }
  }

  function saveContributions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contributions));
  }

  function loadContributions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(n => !isNaN(n));
    } catch (e) {}
    return [];
  }

  function totalSaved() {
    return contributions.reduce((a, b) => a + b, 0);
  }

  function remaining() {
    const r = Math.max(0, TARGET - totalSaved());
    return Number(r.toFixed(2));
  }

  function percentFunded() {
    return Math.min(100, Math.round((totalSaved() / TARGET) * 100));
  }

  // UI
  function render() {
    const rem = remaining();
    remainingEl.innerHTML = fmtEuro(rem);
    const pct = percentFunded();
    percentEl.textContent = `${pct}%`;
    progressBar.style.width = `${pct}%`;

    // milestones list
    milestonesList.innerHTML = '';
    for (const m of MILESTONES) {
      const li = document.createElement('li');
      li.textContent = `${m}% — ${fmtEuro(Math.max(0, TARGET * (1 - m / 100)))}`;
      milestonesList.appendChild(li);
    }

    // undo availability
    undoBtn.disabled = contributions.length === 0;
  }

  // Toasts
  let toastTimer = null;
  function showToast(msg, ms = 3500) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.style.display = 'none';
    }, ms);
  }

  // Confetti - simple particle system
  function showConfetti(duration = 3000) {
    if (!confettiCanvas) return;
    const canvas = confettiCanvas;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    canvas.style.display = 'block';

    // handle resize
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const colors = ['#ef4444','#f59e0b','#f97316','#06b6d4','#10b981','#8b5cf6','#f43f5e'];
    const particles = [];
    const count = Math.floor(Math.max(60, Math.min(140, W / 8)));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * -H * 0.5,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 6 + 2,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        ttl: Math.random() * duration
      });
    }

    let start = performance.now();
    let rafId = null;

    function update(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        // simple motion
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.rot += p.spin;

        // draw rectangle rotated
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (elapsed < duration) {
        rafId = requestAnimationFrame(update);
      } else {
        // stop
        cancelAnimationFrame(rafId);
        ctx.clearRect(0, 0, W, H);
        canvas.style.display = 'none';
        window.removeEventListener('resize', onResize);
      }
    }

    rafId = requestAnimationFrame(update);
  }

  // Actions
  function addContributionFromInput() {
    if (!addInput) return;
    const raw = addInput.value.trim();
    if (!raw) {
      showToast('Enter an amount to add.');
      return;
    }
    const n = parseFloat(raw);
    if (isNaN(n) || n <= 0) {
      showToast('Enter a valid positive number.');
      return;
    }

    const prevPct = percentFunded();
    contributions.push(Number(n.toFixed(2)));
    saveContributions();
    const newPct = percentFunded();
    render();
    addInput.value = '';
    addInput.focus();

    // Check milestones crossed
    const crossed = MILESTONES.filter(m => prevPct < m && newPct >= m);
    if (crossed.length) {
      showToast(`Congrats — reached ${crossed[0]}%!`);
      showConfetti(3000);
      // if multiple crossed, show additional short toasts
      if (crossed.length > 1) {
        let idx = 1;
        const iv = setInterval(() => {
          if (idx >= crossed.length) {
            clearInterval(iv);
            return;
          }
          showToast(`Congrats — reached ${crossed[idx]}%!`);
          idx++;
        }, 900);
      }
    } else {
      showToast(`${fmtEuro(n)} added`);
    }
  }

  function undoLast() {
    if (!contributions.length) {
      showToast('Nothing to undo.');
      return;
    }
    const last = contributions.pop();
    saveContributions();
    render();
    showToast(`Removed ${fmtEuro(last)}`);
  }

  function resetAll() {
    if (!confirm('Reset all contributions? This cannot be undone.')) return;
    contributions = [];
    saveContributions();
    render();
    showToast('All cleared');
  }

  // Event wiring
  if (addBtn) addBtn.addEventListener('click', addContributionFromInput);
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addContributionFromInput();
    });
  }
  if (undoBtn) undoBtn.addEventListener('click', undoLast);
  if (resetBtn) resetBtn.addEventListener('click', resetAll);

  // initial render
  render();

  // expose small API for debugging
  window.__gclass = {
    TARGET,
    contributions,
    totalSaved,
    remaining,
    percentFunded,
  };
})();