try {
  var a = JSON.parse(localStorage.getItem('dc-appearance') || '{}');
  var t = a.theme || 'dark-cosmos';
  var h = document.documentElement;
  var isLight = t === 'light-jade' || t === 'light-classic';
  if (!isLight) { h.classList.add('dark'); h.classList.remove('light'); }
  else { h.classList.add('light'); h.classList.remove('dark'); }
  if (t !== 'dark-cosmos') h.setAttribute('data-theme', t);
  if (a.fontSize) h.setAttribute('data-fontsize', a.fontSize);
  if (a.accentColor && (t === 'dark-cosmos' || t === 'light-jade' || t === 'light-classic')) {
    h.style.setProperty('--color-primary', a.accentColor);
  }
} catch(e) {}
