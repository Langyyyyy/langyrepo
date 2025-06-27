// scripts.js

// ======= Collapsible Sidebar =======
window.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('tswsidecol');
  const toggleBtn = document.getElementById('sidebarToggle');

  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (sidebar.style.display === 'none' || sidebar.style.width === '0px') {
        sidebar.style.display = 'block';
        sidebar.style.width = '20%';
      } else {
        sidebar.style.display = 'none';
        sidebar.style.width = '0';
      }
    });
  }

  // ======= Custom Tooltip =======
  const tooltip = document.createElement('div');
  tooltip.style.position = 'absolute';
  tooltip.style.background = '#232b57';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '6px 10px';
  tooltip.style.borderRadius = '6px';
  tooltip.style.fontSize = '0.9rem';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.transition = 'opacity 0.2s ease';
  tooltip.style.opacity = '0';
  tooltip.style.zIndex = '10000';
  document.body.appendChild(tooltip);

  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      tooltip.textContent = el.getAttribute('data-tooltip');
      tooltip.style.opacity = '1';
    });
    el.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.pageX + 15 + 'px';
      tooltip.style.top = e.pageY + 15 + 'px';
    });
    el.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  });

  // ======= Countdown Timer =======
  const countdownEl = document.getElementById('timer');
  const targetDate = new Date('2025-06-30T23:59:59');

  function updateCountdown() {
    if (!countdownEl) return;

    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      countdownEl.textContent = "🎉 The date has arrived!";
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownEl.textContent = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s until July 2025`;
  }

  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);
});
