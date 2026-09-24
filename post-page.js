document.addEventListener('DOMContentLoaded', () => {
  const shareButton = document.getElementById('share-button');
  if (shareButton) {
    shareButton.addEventListener('click', async () => {
      const url = shareButton.dataset.url;
      const title = shareButton.dataset.title;
      if (navigator.share) {
        try { await navigator.share({ title, url }); } catch (err) {}
      } else {
        try {
          await navigator.clipboard.writeText(url);
          alert('Link copied! You can now paste it anywhere.');
        } catch (err) {
          prompt('Copy this link to share:', url);
        }
      }
    });
  }

  document.querySelectorAll('.gallery-thumb').forEach(img => {
    img.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <img src="${img.dataset.full}" alt="${img.dataset.caption || ''}" />
        ${img.dataset.caption ? `<p class="lightbox-caption">${img.dataset.caption}</p>` : ''}
      `;
      const close = () => overlay.remove();
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
      overlay.querySelector('.lightbox-close').addEventListener('click', close);
      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
      });
      document.body.appendChild(overlay);
    });
  });
});