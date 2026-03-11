(function (window) {
  const STORAGE_KEY_LANG = 'nes_lang';
  const DEFAULT_LANG = 'es';
  const LANG_BASE_PATH = 'lang';

  const state = {
    currentLang: DEFAULT_LANG,
    dict: {}
  };

  async function loadLanguage(lang) {
    const effectiveLang = lang || DEFAULT_LANG;
    const url = `${LANG_BASE_PATH}/${effectiveLang}.json`;

    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) {
        throw new Error(`Language file not found: ${url}`);
      }

      const data = await res.json();
      state.dict = data || {};
      state.currentLang = effectiveLang;

      try {
        window.localStorage.setItem(STORAGE_KEY_LANG, effectiveLang);
      } catch (e) {
        // ignore storage errors
      }

      // Actualizar atributo lang del <html>
      const htmlEl = document.documentElement;
      if (htmlEl) {
        htmlEl.setAttribute('lang', state.currentLang);
      }
    } catch (err) {
      console.warn('[i18n] Error loading language', effectiveLang, err);
      // Si falla un idioma distinto del por defecto, intentamos con el por defecto
      if (effectiveLang !== DEFAULT_LANG) {
        return loadLanguage(DEFAULT_LANG);
      }
    }

    applyTranslations();
    return state.currentLang;
  }

  function t(key, fallback) {
    if (Object.prototype.hasOwnProperty.call(state.dict, key)) {
      return state.dict[key];
    }
    return fallback !== undefined ? fallback : key;
  }

  function applyTranslations(root) {
    if (!root) root = document;

    // Textos (labels, botones, spans...)
    const textNodes = root.querySelectorAll('[data-i18n]');
    textNodes.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;

      const current = el.textContent != null ? el.textContent.trim() : '';
      const translated = t(key, current);

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = translated;
      } else {
        el.textContent = translated;
      }
    });

    // Placeholders
    const placeholderNodes = root.querySelectorAll('[data-i18n-placeholder]');
    placeholderNodes.forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;

      const currentPlaceholder = el.getAttribute('placeholder') || '';
      const translated = t(key, currentPlaceholder);
      el.setAttribute('placeholder', translated);
    });
  }

  function getCurrentLang() {
    return state.currentLang;
  }

  window.I18N = {
    loadLanguage,
    t,
    applyTranslations,
    getCurrentLang
  };
})(window);
