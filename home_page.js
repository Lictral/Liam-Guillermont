(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Textes générés par le script (les autres textes portent data-en dans le HTML)
  const T = {
    fr: {
      title: 'Liam Guillermont – Développeur jeu vidéo',
      aiLabel: 'IA', aiNone: 'Aucune IA utilisée dans ce projet', aiUsed: 'IA utilisée dans ce projet',
      video: 'Vidéo', close: 'Fermer', download: 'Télécharger le projet', itch: 'Voir sur itch.io',
      copied: 'Adresse copiée', copyFail: "Copie impossible, sélectionnez l'adresse à la main",
      switchTo: 'Switch to English', videoTitle: 'Vidéo du projet'
    },
    en: {
      title: 'Liam Guillermont – Game developer',
      aiLabel: 'AI', aiNone: 'No AI used in this project', aiUsed: 'AI used in this project',
      video: 'Video', close: 'Close', download: 'Download the project', itch: 'View on itch.io',
      copied: 'Address copied', copyFail: 'Copy failed, please select the address manually',
      switchTo: 'Passer en français', videoTitle: 'Project video'
    }
  };

  let lang = 'fr';
  try { const s = localStorage.getItem('lang'); if (s === 'fr' || s === 'en') lang = s; } catch (e) {}
  const t = (k) => T[lang][k];

  // --- Langue ---
  const langBtn = $('#lang-toggle');
  function applyLang(l) {
    lang = l;
    $$('[data-en]').forEach((el) => {
      if (el.dataset.fr === undefined) el.dataset.fr = el.textContent;
      el.textContent = l === 'en' ? el.dataset.en : el.dataset.fr;
    });
    document.documentElement.lang = l;
    document.title = t('title');
    $$('[data-l]', langBtn).forEach((s) => s.classList.toggle('active', s.dataset.l === l));
    langBtn.setAttribute('aria-label', t('switchTo'));
    langBtn.setAttribute('lang', l === 'en' ? 'fr' : 'en');
    $$('.badge-ai').forEach((b) => {
      const msg = b.classList.contains('on') ? t('aiUsed') : t('aiNone');
      $('.ai-label', b).textContent = t('aiLabel');
      $('.sr-only', b).textContent = msg;
      b.title = msg;
    });
    $$('.badge-video').forEach((b) => { b.textContent = t('video'); });
    $('#dlg-close').setAttribute('aria-label', t('close'));
    try { localStorage.setItem('lang', l); } catch (e) {}
  }
  langBtn.addEventListener('click', () => applyLang(lang === 'fr' ? 'en' : 'fr'));

  // --- Pastilles « IA » (barrées : aucune IA utilisée) ---
  // Pour un projet où l'IA a servi, ajoutez la classe "uses-ai" sur son <li> : la pastille ne sera plus barrée.
  $$('.badge-ai').forEach((b) => {
    b.innerHTML = '<span class="ai-label"></span><span class="sr-only"></span>';
    if (b.closest('li').classList.contains('uses-ai')) b.classList.add('on');
  });

  // --- Fenêtre vidéo ---
  const dlg = $('#project-dialog');
  const media = $('#dlg-media');

  function buildMedia(url) {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if (yt) {
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + yt[1];
      f.title = t('videoTitle');
      f.allow = 'encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      return f;
    }
    const v = document.createElement('video');
    v.src = url; v.controls = true; v.preload = 'metadata'; v.playsInline = true;
    return v;
  }

  function openProject(li) {
    const link = $('h3 a', li);
    $('#dlg-title').textContent = link.textContent;
    $('#dlg-desc').textContent = $('p', li).textContent;
    media.replaceChildren(buildMedia(li.dataset.video));
    const actions = $('#dlg-actions');
    actions.replaceChildren();
    if (li.dataset.download) {
      const d = document.createElement('a');
      d.className = 'button'; d.textContent = t('download'); d.href = li.dataset.download;
      if (/itch\.io/.test(li.dataset.download)) { d.target = '_blank'; d.rel = 'noopener'; } else { d.setAttribute('download', ''); }
      actions.append(d);
    }
    const i = document.createElement('a');
    i.className = 'button button-secondary'; i.textContent = t('itch'); i.href = link.href; i.target = '_blank'; i.rel = 'noopener';
    actions.append(i);
    dlg.showModal();
  }

  $$('.projects li[data-video]').forEach((li) => {
    li.classList.add('has-video');
    const pill = document.createElement('span');
    pill.className = 'badge-video';
    $('.meta', li).append(pill);
    $('h3 a', li).addEventListener('click', (e) => { e.preventDefault(); openProject(li); });
  });

  $('#dlg-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => media.replaceChildren());

  // --- Divers ---
  $('#year').textContent = new Date().getFullYear();

  const status = $('#copy-status');
  $('#copy-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#email').textContent.trim());
      status.textContent = t('copied');
    } catch (err) {
      status.textContent = t('copyFail');
    }
    setTimeout(() => { status.textContent = ''; }, 3000);
  });

  applyLang(lang);
})();