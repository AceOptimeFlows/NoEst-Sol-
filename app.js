(function () {
  'use strict';

  const STORAGE_KEYS = {
    theme: 'nes_theme',
    lang: 'nes_lang',
    country: 'nes_country',
    sessions: 'nes_sessions'
  };

  const COUNTRY_CONFIG = {
    es: { dateLocale: 'es-ES' },
    it: { dateLocale: 'it-IT' },
    fr: { dateLocale: 'fr-FR' },
    de: { dateLocale: 'de-DE' },
    pt: { dateLocale: 'pt-PT' },
    br: { dateLocale: 'pt-BR' }
  };

  const COUNTRY_AUTHORITY = {
    es: {
      headerKey: 'letterHeaderEs',
      headerFallback: 'A la Inspección de Trabajo y Seguridad Social',
      authorityKey: 'letterAuthorityEs',
      authorityFallback: 'la Inspección de Trabajo y Seguridad Social'
    },
    it: {
      headerKey: 'letterHeaderIt',
      headerFallback:
        'A la autoridad laboral competente en Italia (Ispettorato Nazionale del Lavoro)',
      authorityKey: 'letterAuthorityIt',
      authorityFallback:
        'la autoridad laboral competente en Italia (Ispettorato Nazionale del Lavoro)'
    },
    fr: {
      headerKey: 'letterHeaderFr',
      headerFallback:
        'A la autoridad laboral competente en Francia (Inspection du travail)',
      authorityKey: 'letterAuthorityFr',
      authorityFallback:
        'la autoridad laboral competente en Francia (Inspection du travail)'
    },
    de: {
      headerKey: 'letterHeaderDe',
      headerFallback:
        'A la autoridad laboral competente en Alemania (Arbeitsschutzbehörde)',
      authorityKey: 'letterAuthorityDe',
      authorityFallback:
        'la autoridad laboral competente en Alemania (Arbeitsschutzbehörde)'
    },
    pt: {
      headerKey: 'letterHeaderPt',
      headerFallback:
        'A la autoridad laboral competente en Portugal (Autoridade para as Condições do Trabalho)',
      authorityKey: 'letterAuthorityPt',
      authorityFallback:
        'la autoridad laboral competente en Portugal (Autoridade para as Condições do Trabalho)'
    },
    br: {
      headerKey: 'letterHeaderBr',
      headerFallback:
        'A la autoridad laboral competente en Brasil (Ministério do Trabalho / Superintendência Regional do Trabalho)',
      authorityKey: 'letterAuthorityBr',
      authorityFallback:
        'la autoridad laboral competente en Brasil (Ministério do Trabalho / Superintendência Regional do Trabalho)'
    }
  };

  const COUNTRY_LETTER_LANG = {
    es: 'es',
    it: 'it',
    fr: 'fr',
    de: 'de',
    pt: 'pt-br',
    br: 'pt-br'
  };

  const SUPPORTED_UI_LANGS = [
    'es',
    'en',
    'it',
    'de',
    'ru',
    'pt-br',
    'ko',
    'ja',
    'zh'
  ];

  let currentCountry = 'es';
  let currentUILang = 'es';
  let currentLoadedLang = null;

  function isSupportedUILang(lang) {
    return SUPPORTED_UI_LANGS.includes(String(lang || '').toLowerCase());
  }

  function normalizeUILang(lang) {
    const value = String(lang || '').toLowerCase();
    if (value === 'pt') return 'pt-br';
    return isSupportedUILang(value) ? value : null;
  }

  function detectInitialUILang(browserLang) {
    const value = String(browserLang || 'es').toLowerCase();

    if (value.startsWith('es')) return 'es';
    if (value.startsWith('pt')) return 'pt-br';
    if (value.startsWith('it')) return 'it';
    if (value.startsWith('de')) return 'de';
    if (value.startsWith('ru')) return 'ru';
    if (value.startsWith('ko')) return 'ko';
    if (value.startsWith('ja')) return 'ja';
    if (value.startsWith('zh')) return 'zh';

    return 'en';
  }

  function getLetterLanguageForCountry(code) {
    const key = code && COUNTRY_LETTER_LANG[code] ? code : 'es';
    return COUNTRY_LETTER_LANG[key];
  }

  function getCurrentUILang() {
    return normalizeUILang(currentUILang) || 'es';
  }

  async function ensureLanguageLoaded(lang) {
    if (!window.I18N || typeof window.I18N.loadLanguage !== 'function') {
      return;
    }
    const target = normalizeUILang(lang) || 'es';
    if (currentLoadedLang === target) return;
    try {
      await window.I18N.loadLanguage(target);
      currentLoadedLang = target;
    } catch (err) {
      console.warn('[NoEstásSol@] Error al cargar idioma', target, err);
    }
  }

  function getCountryConfig(code) {
    const key = code && COUNTRY_CONFIG[code] ? code : 'es';
    return COUNTRY_CONFIG[key];
  }

  function getCountryAuthority(code) {
    const key = code && COUNTRY_AUTHORITY[code] ? code : 'es';
    return COUNTRY_AUTHORITY[key];
  }

  function getCurrentCountry() {
    return currentCountry || 'es';
  }

  function setCurrentCountry(code) {
    currentCountry = COUNTRY_CONFIG[code] ? code : 'es';
  }

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      // ignore
    }
  }

  function buildLicenseText() {
    const fallback = [
      'Licencia MIT',
      '',
      'Copyright (c) 2025 Andrés Calvo Espinosa',
      '',
      'Por la presente se concede permiso, sin cargo, a cualquier persona que obtenga una copia de este software y de los archivos de documentación asociados (el «Software»), para utilizar el Software sin restricción, incluyendo, sin limitación, los derechos de usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del Software, y para permitir a las personas a las que se les proporcione el Software hacer lo mismo, sujeto a las siguientes condiciones:',
      '',
      'El aviso de copyright anterior y este aviso de permiso deberán incluirse en todas las copias o partes sustanciales del Software.',
      '',
      'EL SOFTWARE SE PROPORCIONA «TAL CUAL», SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO, PERO SIN LIMITARSE A, LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DEL COPYRIGHT SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑO U OTRA RESPONSABILIDAD, YA SEA EN UNA ACCIÓN CONTRACTUAL, EXTRACONTRACTUAL O DE OTRO TIPO, QUE SURJA DE, O EN RELACIÓN CON, EL SOFTWARE O EL USO U OTRAS OPERACIONES EN EL SOFTWARE.'
    ].join('\n');

    if (window.I18N && typeof window.I18N.t === 'function') {
      return window.I18N.t('licensePanelBody', fallback);
    }

    return fallback;
  }

  function buildPrivacyHtml() {
    const fallback = [
      '<p>Esta aplicación funciona íntegramente en tu dispositivo: los datos que introduces no se envían a ningún servidor.</p>',
      '<ul>',
      '<li>No se crea ninguna cuenta de usuario.</li>',
      '<li>Los textos que escribes se utilizan únicamente para generar el borrador de la denuncia en tu navegador.</li>',
      '<li>Solo se guarda en el navegador el idioma, el país seleccionado y el tema de la interfaz para tu comodidad.</li>',
      '</ul>',
      '<p>Si borras los datos de navegación de tu navegador, también se eliminarán estas preferencias.</p>'
    ].join('');

    if (window.I18N && typeof window.I18N.t === 'function') {
      return window.I18N.t('privacyPanelBodyHtml', fallback);
    }

    return fallback;
  }

  function initWizard() {
    const form = document.getElementById('complaintForm');
    if (!form) return null;

    const steps = Array.from(form.querySelectorAll('.form-step'));
    const totalSteps = steps.length || 1;
    const stepLabelEl = document.getElementById('stepLabel');
    const progressFill = document.getElementById('wizardProgressFill');
    const previewTextEl = document.getElementById('previewText');
    const btnPrev = document.getElementById('btnPrevStep');
    const btnNext = document.getElementById('btnNextStep');
    const btnGenerate = document.getElementById('btnGeneratePdf');
    const roleSelect = document.getElementById('role');
    const roleOtherWrapper = document.getElementById('roleOtherWrapper');
    const roleOtherInput = document.getElementById('roleOther');
    const factsOngoing = document.getElementById('factsOngoing');
    const factsEnd = document.getElementById('factsEnd');
    const confirmAccuracy = document.getElementById('confirmAccuracy');
    const tabs = Array.from(document.querySelectorAll('.wizard-tab'));

    let currentStep = 1;

    function scrollActiveStepTop() {
      const active = steps.find((s) => Number(s.dataset.step) === currentStep);
      if (active) {
        active.scrollTop = 0;
      }
    }

    function updateStepLabel() {
      if (!stepLabelEl || !window.I18N) return;
      const pattern = window.I18N.t('stepLabel', 'Paso {current} de {total}');
      stepLabelEl.textContent = pattern
        .replace('{current}', String(currentStep))
        .replace('{total}', String(totalSteps));
    }

    function updateProgressBar() {
      if (!progressFill) return;
      const ratio = Math.max(1 / totalSteps, currentStep / totalSteps);
      progressFill.style.width = `${ratio * 100}%`;
    }

    function updateButtons() {
      if (btnPrev) {
        btnPrev.disabled = currentStep === 1;
      }
      if (btnNext) {
        btnNext.hidden = currentStep === totalSteps;
      }
      if (btnGenerate) {
        btnGenerate.hidden = currentStep !== totalSteps;
      }
    }

    function updateTabs() {
      if (!tabs || !tabs.length) return;
      tabs.forEach((tab) => {
        const stepNum = Number(tab.dataset.step);
        const isActive = stepNum === currentStep;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.tabIndex = isActive ? 0 : -1;
      });
    }

    function showStep(step) {
      currentStep = Math.min(Math.max(step, 1), totalSteps);
      steps.forEach((el) => {
        const stepNum = Number(el.dataset.step);
        el.hidden = stepNum !== currentStep;
      });
      updateStepLabel();
      updateProgressBar();
      updateButtons();
      updateTabs();
      scrollActiveStepTop();
    }

    function getRequiredFieldsForStep(step) {
      const stepEl = steps.find((s) => Number(s.dataset.step) === step);
      if (!stepEl) return [];
      return Array.from(stepEl.querySelectorAll('[data-required="true"]'));
    }

    function validateStep(step) {
      const required = getRequiredFieldsForStep(step);
      let firstInvalid = null;

      required.forEach((field) => {
        const value = field.value != null ? String(field.value).trim() : '';
        const isInvalid = !value;
        field.classList.toggle('field-error', isInvalid);
        if (isInvalid && !firstInvalid) {
          firstInvalid = field;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (window.I18N) {
          alert(
            window.I18N.t(
              'validationRequired',
              'Por favor, completa los campos obligatorios marcados antes de continuar.'
            )
          );
        }
        return false;
      }

      return true;
    }

    function collectFactsEntries() {
      const container = document.getElementById('factsEntries');
      if (!container) return [];
      const rows = Array.from(container.querySelectorAll('.facts-row'));
      return rows
        .map((row) => {
          const get = (selector) => {
            const el = row.querySelector(selector);
            return el && 'value' in el ? String(el.value).trim() : '';
          };
          return {
            date: get('.facts-date'),
            place: get('.facts-place'),
            shift: get('.facts-shift'),
            fact: get('.facts-fact'),
            development: get('.facts-dev'),
            witnesses: get('.facts-witnesses')
          };
        })
        .filter((entry) =>
          Object.values(entry).some(
            (val) => val && String(val).trim().length > 0
          )
        );
    }

    function collectEvidenceEntries() {
      const container = document.getElementById('evidenceEntries');
      if (!container) return [];
      const rows = Array.from(container.querySelectorAll('.evidence-row'));
      return rows
        .map((row) => {
          const get = (selector) => {
            const el = row.querySelector(selector);
            return el && 'value' in el ? String(el.value).trim() : '';
          };
          return {
            type: get('.evidence-type'),
            title: get('.evidence-title'),
            summary: get('.evidence-summary')
          };
        })
        .filter((entry) =>
          Object.values(entry).some(
            (val) => val && String(val).trim().length > 0
          )
        );
    }

    function collectWitnessEntries() {
      const container = document.getElementById('witnessEntries');
      if (!container) return [];
      const rows = Array.from(container.querySelectorAll('.witness-row'));
      return rows
        .map((row) => {
          const get = (selector) => {
            const el = row.querySelector(selector);
            return el && 'value' in el ? String(el.value).trim() : '';
          };
          return {
            name: get('.witness-name'),
            role: get('.witness-role'),
            info: get('.witness-info')
          };
        })
        .filter((entry) =>
          Object.values(entry).some(
            (val) => val && String(val).trim().length > 0
          )
        );
    }

    function collectRequestEntries() {
      const container = document.getElementById('requestEntries');
      if (!container) return [];
      const rows = Array.from(container.querySelectorAll('.request-row'));
      return rows
        .map((row) => {
          const get = (selector) => {
            const el = row.querySelector(selector);
            return el && 'value' in el ? String(el.value).trim() : '';
          };
          return {
            title: get('.request-title'),
            reason: get('.request-reason')
          };
        })
        .filter((entry) =>
          Object.values(entry).some(
            (val) => val && String(val).trim().length > 0
          )
        );
    }

    function gatherData() {
      function v(id) {
        const el = document.getElementById(id);
        return el && 'value' in el ? String(el.value).trim() : '';
      }

      function checked(id) {
        const el = document.getElementById(id);
        return !!(el && el.checked);
      }

      const issueTypes = Array.from(
        document.querySelectorAll('input[name="issueType"]:checked')
      ).map((el) => el.value);

      const factsEntries = collectFactsEntries();
      const evidenceEntries = collectEvidenceEntries();
      const witnessEntries = collectWitnessEntries();
      const requestEntries = collectRequestEntries();

      return {
        countryCode: getCurrentCountry(),

        fullName: v('fullName'),
        idNumber: v('idNumber'),
        phone: v('phone'),
        email: v('email'),
        address: v('address'),
        postalCode: v('postalCode'),
        city: v('city'),
        role: v('role') || 'worker',
        roleOther: v('roleOther'),

        companyName: v('companyName'),
        companyId: v('companyId'),
        companySector: v('companySector'),
        companyAddress: v('companyAddress'),
        companyPostalCode: v('companyPostalCode'),
        companyCity: v('companyCity'),
        companyProvince: v('companyProvince'),
        workplace: v('workplace'),
        jobTitle: v('jobTitle'),
        contractType: v('contractType'),
        employmentStart: v('employmentStart'),
        employmentEnd: v('employmentEnd'),

        inspectionProvince: v('inspectionProvince'),

        factsStart: v('factsStart'),
        factsEnd: v('factsEnd'),
        factsOngoing: checked('factsOngoing'),
        workSchedule: v('workSchedule'),
        factsDescription: v('factsDescription'),
        evidence: v('evidence'),
        witnesses: v('witnesses'),
        requestAnonymity: checked('requestAnonymity'),
        additionalRequests: v('additionalRequests'),
        issueTypes,
        confirmAccuracy: checked('confirmAccuracy'),
        factsEntries,
        evidenceEntries,
        witnessEntries,
        requestEntries
      };
    }

    function applyDataToForm(data) {
      if (!data || typeof data !== 'object') return;

      const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value != null ? String(value) : '';
      };

      const setChecked = (id, checked) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.checked = !!checked;
      };

      setValue('fullName', data.fullName);
      setValue('idNumber', data.idNumber);
      setValue('phone', data.phone);
      setValue('email', data.email);
      setValue('address', data.address);
      setValue('postalCode', data.postalCode);
      setValue('city', data.city);

      if (roleSelect) {
        roleSelect.value = data.role || 'worker';
      }
      if (roleOtherInput) {
        roleOtherInput.value = data.roleOther || '';
      }
      if (roleOtherWrapper) {
        const showOther = (data.role || 'worker') === 'other';
        roleOtherWrapper.classList.toggle('hidden', !showOther);
        if (!showOther && roleOtherInput) {
          roleOtherInput.value = '';
        }
      }

      setValue('companyName', data.companyName);
      setValue('companyId', data.companyId);
      setValue('companySector', data.companySector);
      setValue('companyAddress', data.companyAddress);
      setValue('companyPostalCode', data.companyPostalCode);
      setValue('companyCity', data.companyCity);
      setValue('companyProvince', data.companyProvince);
      setValue('workplace', data.workplace);
      setValue('jobTitle', data.jobTitle);
      setValue('contractType', data.contractType);
      setValue('employmentStart', data.employmentStart);
      setValue('employmentEnd', data.employmentEnd);
      setValue('inspectionProvince', data.inspectionProvince);

      setValue('factsStart', data.factsStart);
      setValue('factsEnd', data.factsEnd);
      setChecked('factsOngoing', data.factsOngoing);
      setValue('workSchedule', data.workSchedule || '');

      setValue('factsDescription', data.factsDescription);
      setValue('evidence', data.evidence);
      setValue('witnesses', data.witnesses);
      setChecked('requestAnonymity', data.requestAnonymity);
      setValue('additionalRequests', data.additionalRequests);
      setChecked('confirmAccuracy', data.confirmAccuracy);

      const issueInputs = document.querySelectorAll('input[name="issueType"]');
      const issueValues = Array.isArray(data.issueTypes) ? data.issueTypes : [];
      issueInputs.forEach((input) => {
        input.checked = issueValues.includes(input.value);
      });

      if (factsOngoing && factsEnd) {
        const on = !!data.factsOngoing;
        factsOngoing.checked = on;
        factsEnd.disabled = on;
        if (on) {
          factsEnd.value = '';
        } else if (data.factsEnd) {
          factsEnd.value = data.factsEnd;
        }
      }

      const repopulateRepeatable = (
        containerId,
        rowClass,
        addButtonId,
        entries,
        applyEntry
      ) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const addBtn = document.getElementById(addButtonId);
        const getRows = () => Array.from(container.querySelectorAll('.' + rowClass));

        const desired = Math.max(
          1,
          Array.isArray(entries) && entries.length ? entries.length : 0
        );

        let rows = getRows();
        if (!rows.length && addBtn) {
          addBtn.click();
          rows = getRows();
        }
        if (!rows.length) return;

        if (addBtn) {
          while (getRows().length < desired) {
            addBtn.click();
          }
        }

        while (getRows().length > desired) {
          const rowsNow = getRows();
          const last = rowsNow[rowsNow.length - 1];
          const removeBtn = last.querySelector('.repeat-remove');
          if (!removeBtn) break;
          removeBtn.click();
        }

        const finalRows = getRows();
        const list = Array.isArray(entries) && entries.length ? entries : [{}];

        finalRows.forEach((row, index) => {
          const entry = list[index] || {};
          applyEntry(row, entry);
        });
      };

      repopulateRepeatable(
        'factsEntries',
        'facts-row',
        'addFactEntry',
        data.factsEntries,
        (row, entry) => {
          const getInput = (cls) => row.querySelector('.' + cls);
          const dateEl = getInput('facts-date');
          const placeEl = getInput('facts-place');
          const shiftEl = getInput('facts-shift');
          const factEl = getInput('facts-fact');
          const devEl = getInput('facts-dev');
          const witEl = getInput('facts-witnesses');

          if (dateEl) dateEl.value = entry.date || '';
          if (placeEl) placeEl.value = entry.place || '';
          if (shiftEl) shiftEl.value = entry.shift || '';
          if (factEl) factEl.value = entry.fact || '';
          if (devEl) devEl.value = entry.development || '';
          if (witEl) witEl.value = entry.witnesses || '';
        }
      );

      repopulateRepeatable(
        'evidenceEntries',
        'evidence-row',
        'addEvidenceEntry',
        data.evidenceEntries,
        (row, entry) => {
          const getInput = (cls) => row.querySelector('.' + cls);
          const typeEl = getInput('evidence-type');
          const titleEl = getInput('evidence-title');
          const summaryEl = getInput('evidence-summary');

          if (typeEl) typeEl.value = entry.type || '';
          if (titleEl) titleEl.value = entry.title || '';
          if (summaryEl) summaryEl.value = entry.summary || '';
        }
      );

      repopulateRepeatable(
        'witnessEntries',
        'witness-row',
        'addWitnessEntry',
        data.witnessEntries,
        (row, entry) => {
          const getInput = (cls) => row.querySelector('.' + cls);
          const nameEl = getInput('witness-name');
          const roleEl = getInput('witness-role');
          const infoEl = getInput('witness-info');

          if (nameEl) nameEl.value = entry.name || '';
          if (roleEl) roleEl.value = entry.role || '';
          if (infoEl) infoEl.value = entry.info || '';
        }
      );

      repopulateRepeatable(
        'requestEntries',
        'request-row',
        'addRequestEntry',
        data.requestEntries,
        (row, entry) => {
          const getInput = (cls) => row.querySelector('.' + cls);
          const titleEl = getInput('request-title');
          const reasonEl = getInput('request-reason');

          if (titleEl) titleEl.value = entry.title || '';
          if (reasonEl) reasonEl.value = entry.reason || '';
        }
      );

      if (currentStep === totalSteps) {
        updatePreview();
      }
    }

    function formatDate(value, countryCode) {
      if (!value) return '';
      const parts = String(value).split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
          const d = new Date(year, month - 1, day);
          if (!Number.isNaN(d.getTime())) {
            try {
              const cfg = getCountryConfig(countryCode || getCurrentCountry());
              return d.toLocaleDateString(cfg.dateLocale);
            } catch (e) {
              const dd = `0${day}`.slice(-2);
              const mm = `0${month}`.slice(-2);
              return `${dd}/${mm}/${year}`;
            }
          }
        }
      }
      return value;
    }

    function buildPreviewText(data) {
      const lines = [];
      const today = new Date();
      const countryCode = data.countryCode || getCurrentCountry();
      const cfg = getCountryConfig(countryCode);
      const authorityCfg = getCountryAuthority(countryCode);

      const factsEntries = Array.isArray(data.factsEntries) ? data.factsEntries : [];
      const evidenceEntries = Array.isArray(data.evidenceEntries)
        ? data.evidenceEntries
        : [];
      const witnessEntries = Array.isArray(data.witnessesEntries)
        ? data.witnessesEntries
        : Array.isArray(data.witnessEntries)
          ? data.witnessEntries
          : [];
      const requestEntries = Array.isArray(data.requestEntries)
        ? data.requestEntries
        : [];

      const t = (key, fallback) => {
        if (window.I18N && typeof window.I18N.t === 'function') {
          return window.I18N.t(key, fallback);
        }
        return fallback;
      };

      function joinList(items) {
        const filtered = (items || [])
          .map((s) => (s || '').trim())
          .filter((s) => s.length > 0);
        const len = filtered.length;
        if (!len) return '';
        if (len === 1) return filtered[0];
        if (len === 2) return `${filtered[0]} y ${filtered[1]}`;
        return `${filtered.slice(0, len - 1).join(', ')} y ${filtered[len - 1]}`;
      }

      let todayStr;
      try {
        todayStr = today.toLocaleDateString(cfg.dateLocale);
      } catch (e) {
        const dd = `0${today.getDate()}`.slice(-2);
        const mm = `0${today.getMonth() + 1}`.slice(-2);
        const yyyy = today.getFullYear();
        todayStr = `${dd}/${mm}/${yyyy}`;
      }

      const cityLine = data.city || data.companyCity || '';
      if (cityLine) {
        lines.push(`${cityLine}, ${todayStr}`);
        lines.push('');
      }

      const headerBase = t(authorityCfg.headerKey, authorityCfg.headerFallback || '');
      const provinceSuffix = data.inspectionProvince
        ? t('letterHeaderProvinceSuffix', ' con competencia en {province}').replace(
            '{province}',
            data.inspectionProvince
          )
        : '';
      const headerText = `${headerBase}${provinceSuffix}`;
      lines.push(headerText);
      lines.push('');
      lines.push(t('letterGreeting', 'Muy Sres./Sras.:'));
      lines.push('');

      let roleClause = '';
      switch (data.role) {
        case 'worker':
          roleClause = t(
            'letterRoleWorkerClause',
            'persona trabajadora de la empresa que se indica a continuación'
          );
          break;
        case 'exWorker':
          roleClause = t(
            'letterRoleExWorkerClause',
            'ex trabajadora de la empresa que se indica a continuación'
          );
          break;
        case 'unionRep':
          roleClause = t(
            'letterRoleUnionRepClause',
            'representante de las personas trabajadoras en la empresa que se indica a continuación'
          );
          break;
        case 'other':
          roleClause =
            data.roleOther ||
            t(
              'letterRoleOtherClauseFallback',
              'persona interesada en los hechos descritos'
            );
          break;
        default:
          roleClause = t('letterRoleDefault', 'persona trabajadora');
      }

      let paragraph1 = `${t('letterIntroYo', 'Yo')}, ${
        data.fullName || '________________'
      }`;
      if (data.idNumber) {
        paragraph1 += `, ${t('letterIntroIdDoc', 'con documento de identidad')} ${
          data.idNumber
        }`;
      }

      const addressParts = [];
      if (data.address) addressParts.push(data.address);
      const loc1 = [data.postalCode, data.city].filter(Boolean).join(' ');
      if (loc1) addressParts.push(loc1);
      if (addressParts.length) {
        paragraph1 += `, ${t('letterIntroAddress', 'con domicilio en')} ${addressParts.join(
          ', '
        )}`;
      }

      const contacts = [];
      if (data.phone) {
        contacts.push(`${t('letterIntroPhoneLabel', 'teléfono')} ${data.phone}`);
      }
      if (data.email) {
        contacts.push(
          `${t('letterIntroEmailLabel', 'correo electrónico')} ${data.email}`
        );
      }
      if (contacts.length) {
        paragraph1 += `, ${t('letterIntroContact', 'datos de contacto')} ${contacts.join(
          ' / '
        )}`;
      }

      if (roleClause) {
        paragraph1 += `, ${t('letterIntroActingAs', 'en calidad de')} ${roleClause}`;
      }

      paragraph1 += `, ${t('letterIntroExpongo', 'EXPONGO:')}`;
      lines.push(paragraph1);
      lines.push('');

      const companyLines = [];
      if (data.companyName) {
        let c = `${t(
          'letterCompanyIntro',
          'Que presto o he prestado servicios laborales para la empresa'
        )} ${data.companyName}`;
        if (data.companyId) {
          c += `, ${t('letterCompanyIdPrefix', 'con CIF/NIF')} ${data.companyId}`;
        }
        companyLines.push(c);
      }

      const companyAddressParts = [];
      if (data.companyAddress) companyAddressParts.push(data.companyAddress);
      const loc2 = [data.companyPostalCode, data.companyCity, data.companyProvince]
        .filter(Boolean)
        .join(' ');
      if (loc2) companyAddressParts.push(loc2);
      if (companyAddressParts.length) {
        companyLines.push(
          `${t(
            'letterCompanyAddressIntro',
            'con domicilio o centro de trabajo en'
          )} ${companyAddressParts.join(', ')}`
        );
      }

      if (data.workplace) {
        companyLines.push(
          `${t('letterCompanyWorkplaceIntro', 'centro de trabajo concreto')}: ${
            data.workplace
          }`
        );
      }

      const jobBits = [];
      if (data.jobTitle) {
        jobBits.push(
          `${t(
            'letterCompanyJobFunctionsIntro',
            'desarrollando las funciones propias del puesto de'
          )} ${data.jobTitle}`
        );
      }
      if (data.contractType) {
        jobBits.push(
          `${t('letterCompanyContractTypeIntro', 'con un contrato de tipo')} ${
            data.contractType
          }`
        );
      }
      if (data.workSchedule) {
        jobBits.push(
          `${t(
            'letterCompanyScheduleIntro',
            'con un horario y jornada aproximados de:'
          )} ${data.workSchedule}`
        );
      }
      if (jobBits.length) {
        companyLines.push(jobBits.join(', '));
      }

      if (data.employmentStart || data.employmentEnd) {
        let period = t('letterEmploymentDefault', 'siendo la relación laboral vigente');
        if (data.employmentStart) {
          period = `${t(
            'letterEmploymentStartPrefix',
            'habiéndose iniciado la relación laboral el'
          )} ${formatDate(data.employmentStart, countryCode)}`;
        }
        if (data.employmentEnd) {
          period += ` ${t('letterEmploymentEndPrefix', 'y finalizado el')} ${formatDate(
            data.employmentEnd,
            countryCode
          )}`;
        } else {
          period += ` ${t(
            'letterEmploymentOngoingSuffix',
            'y continuando en la actualidad'
          )}`;
        }
        companyLines.push(period);
      }

      if (companyLines.length) {
        lines.push(companyLines.join(', ') + '.');
        lines.push('');
      }

      const issueLabels = {
        noContract: t(
          'letterIssueNoContract',
          'Prestación de servicios sin contrato escrito y/o sin alta en la Seguridad Social.'
        ),
        unpaidHours: t(
          'letterIssueUnpaidHours',
          'Realización de horas extraordinarias que no se abonan ni se compensan en descanso.'
        ),
        wages: t(
          'letterIssueWages',
          'Retrasos o impagos de salarios y/o retribuciones por debajo de lo establecido en el convenio o en el contrato.'
        ),
        safety: t(
          'letterIssueSafety',
          'Incumplimientos en materia de prevención de riesgos laborales, seguridad y salud en el trabajo.'
        ),
        harassment: t(
          'letterIssueHarassment',
          'Situaciones de acoso laboral y/o acoso sexual en el ámbito de trabajo.'
        ),
        discrimination: t(
          'letterIssueDiscrimination',
          'Situaciones de discriminación por razón de sexo, origen, edad, orientación sexual, discapacidad u otras causas.'
        ),
        other: t(
          'letterIssueOther',
          'Otros posibles incumplimientos de la normativa laboral o de Seguridad Social.'
        )
      };

      const hasIssueTypes = Array.isArray(data.issueTypes) && data.issueTypes.length > 0;
      const hasFactsEntries = Array.isArray(factsEntries) && factsEntries.length > 0;
      const hasLegacyFacts =
        data.factsDescription && String(data.factsDescription).trim().length > 0;

      if (hasIssueTypes || hasFactsEntries || hasLegacyFacts) {
        if (hasIssueTypes) {
          const normalizedIssues = data.issueTypes
            .map((code) => issueLabels[code])
            .filter(Boolean)
            .map((label) => {
              const trimmed = label.trim().replace(/[.]+$/, '');
              if (!trimmed) return '';
              return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
            })
            .filter(Boolean);

          if (normalizedIssues.length) {
            const intro = t(
              'letterIrregularitiesIntro2',
              'Que, en el marco de dicha relación laboral, se vienen produciendo irregularidades tales como '
            );
            lines.push(intro + joinList(normalizedIssues) + '.');
            lines.push('');
          }
        }

        if (hasFactsEntries) {
          lines.push(
            t(
              'letterFactsEntriesIntro',
              'Para que quede constancia más precisa, detallo a continuación algunos de los hechos más relevantes:'
            )
          );
          lines.push('');

          factsEntries.forEach((entry) => {
            const hasDate = entry.date;
            const hasPlace = entry.place;
            const hasShift = entry.shift;

            let baseIntro = '';

            if (hasDate || hasPlace || hasShift) {
              const introParts = [];

              if (hasDate) {
                introParts.push(
                  `${t('letterFactEntryDatePrefix', 'El día')} ${formatDate(
                    entry.date,
                    countryCode
                  )}`
                );
              }

              if (hasPlace) {
                introParts.push(
                  `${t('letterFactEntryPlacePrefix', 'en')} ${entry.place}`
                );
              }

              if (hasShift) {
                introParts.push(
                  `${t(
                    'letterFactEntryShiftPrefix',
                    'durante el turno de'
                  )} ${entry.shift}`
                );
              }

              baseIntro = introParts.join(' ');
            } else {
              baseIntro = t(
                'letterFactsEntriesGenericIntro',
                'En relación con los hechos descritos'
              );
            }

            let header = baseIntro;
            const factIntro = t(
              'letterFactEntryFactIntro',
              'se produjo el siguiente hecho'
            );

            if (entry.fact) {
              header += (header ? ', ' : '') + `${factIntro}:`;
            } else {
              header += (header ? ', ' : '') + `${factIntro}.`;
            }

            if (header.trim()) {
              lines.push(header.trim());
            }

            if (entry.fact) {
              lines.push(`- ${entry.fact}`);
            }

            if (entry.development) {
              lines.push(
                `    ${t(
                  'letterFactEntryDevIntro',
                  'Que se desarrolló de la siguiente manera'
                )}: ${entry.development}`
              );
            }

            if (entry.witnesses) {
              lines.push(
                `    ${t(
                  'letterFactEntryWitnessIntro',
                  'Actuando como personas presentes o testigos'
                )}: ${entry.witnesses}`
              );
            }

            lines.push('');
          });
        }

        if (!hasFactsEntries && hasLegacyFacts) {
          lines.push(
            t(
              'letterIrregularitiesDetailIntro',
              'En particular, expongo de forma más detallada los hechos:'
            )
          );
          lines.push('');
          lines.push(String(data.factsDescription).trim());
          lines.push('');
        }
      }

      if (data.factsStart || data.factsEnd || data.factsOngoing) {
        let p = t('letterFactsPeriodIntro', 'Los hechos descritos han tenido lugar');
        if (data.factsStart) {
          const fromPattern = t('letterFactsFromPrefix', ', al menos, desde {date}');
          p += fromPattern.replace('{date}', formatDate(data.factsStart, countryCode));
        }
        if (data.factsEnd && !data.factsOngoing) {
          const toPattern = t('letterFactsToPrefix', ' hasta {date}');
          p += toPattern.replace('{date}', formatDate(data.factsEnd, countryCode));
        }
        if (data.factsOngoing) {
          p += t(
            'letterFactsOngoingSuffix',
            ' y continúan produciéndose en la actualidad'
          );
        }
        p += '.';
        lines.push(p);
        lines.push('');
      }

      const hasEvidenceEntries =
        Array.isArray(evidenceEntries) && evidenceEntries.length > 0;
      const hasLegacyEvidence = data.evidence && String(data.evidence).trim().length > 0;

      if (hasEvidenceEntries || hasLegacyEvidence) {
        lines.push(
          t(
            'letterEvidenceIntro2',
            'En cuanto a la documentación y medios de prueba de que dispongo, destaco los siguientes:'
          )
        );
        lines.push('');

        if (hasEvidenceEntries) {
          evidenceEntries.forEach((entry, index) => {
            let headerText = '';

            if (entry.type && entry.title) {
              headerText = `${t(
                'letterEvidenceEntryTypePrefix',
                'Un medio de prueba de tipo'
              )} ${entry.type} ${t(
                'letterEvidenceEntryTitlePrefix',
                'relativo a'
              )} "${entry.title}"`;
            } else if (entry.type) {
              headerText = `${t(
                'letterEvidenceEntryTypePrefix',
                'Un medio de prueba de tipo'
              )} ${entry.type}`;
            } else if (entry.title) {
              headerText = `${t(
                'letterEvidenceEntryTypeGeneric',
                'Un medio de prueba documental relativo a'
              )} "${entry.title}"`;
            } else {
              headerText = t(
                'letterEvidenceEntryGeneric',
                'Un medio de prueba documental'
              );
            }

            lines.push(`${index + 1}.- ${headerText}:`);

            if (entry.summary) {
              const normalizedSummary = /[.?!…]$/.test(entry.summary)
                ? entry.summary
                : `${entry.summary}.`;

              lines.push(
                `    ${t(
                  'letterEvidenceEntrySummaryPrefix',
                  'Cuyo contenido principal es el siguiente'
                )}: ${normalizedSummary}`
              );
            }

            lines.push('');
          });
        } else if (hasLegacyEvidence) {
          lines.push(String(data.evidence).trim());
          lines.push('');
        }

        lines.push(
          t(
            'letterEvidenceClosing',
            'Todas estas pruebas se pondrán a disposición de la Inspección en el momento en que se requiera.'
          )
        );
        lines.push('');
      }

      const hasWitnessEntries =
        Array.isArray(witnessEntries) && witnessEntries.length > 0;
      const hasLegacyWitnesses =
        data.witnesses && String(data.witnesses).trim().length > 0;

      if (hasWitnessEntries || hasLegacyWitnesses) {
        lines.push(
          t(
            'letterWitnessesIntro2',
            'Asimismo, señalo como posibles personas testigo de los hechos a las siguientes personas:'
          )
        );
        lines.push('');

        if (hasWitnessEntries) {
          witnessEntries.forEach((entry) => {
            const parts = [];
            if (entry.name) {
              parts.push(entry.name);
            } else {
              parts.push(
                t(
                  'letterWitnessEntryGenericName',
                  'una persona vinculada a la empresa denunciada'
                )
              );
            }
            if (entry.role) {
              parts.push(
                `${t(
                  'letterWitnessEntryRolePrefix',
                  'que ocupa el cargo o desempeña la función de'
                )} ${entry.role}`
              );
            }
            if (entry.info) {
              parts.push(
                `${t(
                  'letterWitnessEntryInfoPrefix',
                  'respecto de la cual destaco que'
                )} ${entry.info}`
              );
            }

            const paragraph = parts.join(', ').trim();
            if (paragraph) {
              lines.push(paragraph.endsWith('.') ? paragraph : `${paragraph}.`);
              lines.push('');
            }
          });
        } else if (hasLegacyWitnesses) {
          lines.push(String(data.witnesses).trim());
          lines.push('');
        }
      }

      lines.push(t('letterConclusionIntro', 'Por todo lo expuesto,'));
      lines.push('');
      lines.push(t('letterRequestTitle', 'SOLICITO:'));
      lines.push('');

      const authorityName = t(
        authorityCfg.authorityKey,
        authorityCfg.authorityFallback || ''
      );
      const reqPattern = t(
        'letterRequestBody',
        'Que por parte de {authority} se tenga por formulada la presente denuncia, se proceda a la investigación de los hechos descritos y, en su caso, se adopten las medidas legales oportunas.'
      );
      const req = reqPattern.replace(
        '{authority}',
        authorityName || authorityCfg.authorityFallback || ''
      );
      lines.push(req);
      lines.push('');

      if (data.requestAnonymity) {
        lines.push(
          t(
            'letterAnonymityRequest',
            'Asimismo, solicito expresamente que mi identidad no sea comunicada a la empresa denunciada, de conformidad con la normativa aplicable.'
          )
        );
        lines.push('');
      }

      const hasRequestEntries = Array.isArray(requestEntries) && requestEntries.length > 0;
      const hasLegacyRequests =
        data.additionalRequests && String(data.additionalRequests).trim().length > 0;

      if (hasRequestEntries || hasLegacyRequests) {
        lines.push(
          t(
            'letterAdditionalRequestsIntro2',
            'De forma adicional, formulo las siguientes peticiones específicas:'
          )
        );
        lines.push('');

        if (hasRequestEntries) {
          requestEntries.forEach((entry) => {
            const titlePart = entry.title
              ? `${t(
                  'letterAdditionalRequestTitlePrefix',
                  'Que se atienda especialmente la petición relativa a'
                )} "${entry.title}"`
              : t(
                  'letterAdditionalRequestGenericTitle',
                  'Que se atienda la petición adicional que formulo'
                );

            const reasonPart = entry.reason
              ? `, ${t(
                  'letterAdditionalRequestReasonPrefix',
                  'por la siguiente razón'
                )}: ${entry.reason}`
              : '';

            const paragraph = `${titlePart}${reasonPart}.`;
            lines.push(paragraph);
            lines.push('');
          });
        }

        if (hasLegacyRequests) {
          lines.push(
            t(
              'letterAdditionalRequestsTextIntro',
              'Igualmente, dejo constancia de lo siguiente:'
            )
          );
          lines.push('');
          lines.push(String(data.additionalRequests).trim());
          lines.push('');
        }
      }

      const place = cityLine || '________________';
      const closingPattern = t('letterClosingPlaceDate', 'En {city}, a {date}.');
      const closingText = closingPattern
        .replace('{city}', place)
        .replace('{date}', todayStr);
      lines.push(closingText);
      lines.push('');
      lines.push(t('letterClosingSignatureLabel', 'Firmado:'));
      lines.push('');
      lines.push(data.fullName || '________________');

      return lines.join('\n');
    }

    async function buildLetterTextWithCountryLanguage(data) {
      const countryCode = data.countryCode || getCurrentCountry();
      const letterLang = getLetterLanguageForCountry(countryCode);
      const uiLang = getCurrentUILang();

      if (!window.I18N || typeof window.I18N.loadLanguage !== 'function') {
        return buildPreviewText(data);
      }

      const targetLetterLang = letterLang || uiLang;

      if (targetLetterLang === uiLang) {
        await ensureLanguageLoaded(uiLang);
        return buildPreviewText(data);
      }

      await ensureLanguageLoaded(targetLetterLang);
      const text = buildPreviewText(data);
      await ensureLanguageLoaded(uiLang);

      return text;
    }

    async function buildLetterTextForPreviewAndPdf(data) {
      const baseText = await buildLetterTextWithCountryLanguage(data);
      return baseText || '';
    }

    async function updatePreview() {
      if (!previewTextEl) return;
      const data = gatherData();
      const text = await buildLetterTextForPreviewAndPdf(data);
      previewTextEl.value = text;
    }

    function setupRepeatableList(containerId, addButtonId, rowClass) {
      const container = document.getElementById(containerId);
      const addBtn = document.getElementById(addButtonId);
      if (!container) return;

      const getRows = () => Array.from(container.querySelectorAll('.' + rowClass));

      function updateRemoveButtons() {
        const rows = getRows();
        rows.forEach((row) => {
          const btn = row.querySelector('.repeat-remove');
          if (!btn) return;
          const disabled = rows.length === 1;
          btn.disabled = disabled;
          btn.classList.toggle('is-disabled', disabled);
          btn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
        });
      }

      function attachRowEvents(row) {
        const removeBtn = row.querySelector('.repeat-remove');
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            const rows = getRows();
            if (rows.length <= 1) return;
            row.remove();
            updateRemoveButtons();
            if (currentStep === totalSteps) {
              updatePreview();
            }
          });
        }

        row.querySelectorAll('input, textarea').forEach((input) => {
          input.addEventListener('input', () => {
            input.classList.remove('field-error');
            if (currentStep === totalSteps) {
              updatePreview();
            }
          });
        });
      }

      const initialRows = getRows();
      initialRows.forEach(attachRowEvents);
      updateRemoveButtons();

      function addRow() {
        const rows = getRows();
        const base = rows[rows.length - 1];
        if (!base) return;
        const clone = base.cloneNode(true);
        clone.querySelectorAll('input, textarea').forEach((input) => {
          if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
          } else {
            input.value = '';
          }
          input.classList.remove('field-error');
          input.removeAttribute('data-required');
        });
        clone.querySelectorAll('[data-required]').forEach((el) => {
          el.removeAttribute('data-required');
        });
        container.appendChild(clone);
        attachRowEvents(clone);
        updateRemoveButtons();
      }

      if (addBtn) {
        addBtn.addEventListener('click', () => {
          addRow();
        });
      }
    }

    setupRepeatableList('factsEntries', 'addFactEntry', 'facts-row');
    setupRepeatableList('evidenceEntries', 'addEvidenceEntry', 'evidence-row');
    setupRepeatableList('witnessEntries', 'addWitnessEntry', 'witness-row');
    setupRepeatableList('requestEntries', 'addRequestEntry', 'request-row');

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep -= 1;
          showStep(currentStep);
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < totalSteps) {
          currentStep += 1;
          showStep(currentStep);
          if (currentStep === totalSteps) {
            updatePreview();
          }
        }
      });
    }

    if (tabs && tabs.length) {
      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const step = Number(tab.dataset.step);
          if (!Number.isNaN(step)) {
            currentStep = step;
            showStep(currentStep);
            if (currentStep === totalSteps) {
              updatePreview();
            }
          }
        });
      });
    }

    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        for (let step = 1; step <= totalSteps; step += 1) {
          if (!validateStep(step)) {
            if (step !== currentStep) {
              currentStep = step;
              showStep(currentStep);
            }
            return;
          }
        }

        const data = gatherData();

        if (!data.confirmAccuracy) {
          if (window.I18N) {
            alert(
              window.I18N.t(
                'validationConfirmAccuracy',
                'Debes confirmar que la información es verdadera antes de generar la denuncia.'
              )
            );
          }
          if (confirmAccuracy) {
            confirmAccuracy.focus();
          }
          return;
        }

        try {
          const text = await buildLetterTextForPreviewAndPdf(data);

          if (previewTextEl) {
            previewTextEl.value = text;
          }

          if (
            !window.NoEstasSoloExport ||
            typeof window.NoEstasSoloExport.generatePdf !== 'function'
          ) {
            throw new Error('NoEstasSoloExport.generatePdf is not available');
          }

          window.NoEstasSoloExport.generatePdf(text, data, {
            currentCountry: getCurrentCountry(),
            numberedFirstLineIndent: 16,
            numberedContinuationIndent: 24,
            indentedFirstLineIndent: 20,
            indentedContinuationIndent: 24,
            indentedSpaceStep: 1,
            t(key, fallback) {
              if (window.I18N && typeof window.I18N.t === 'function') {
                return window.I18N.t(key, fallback);
              }
              return fallback;
            }
          });
        } catch (err) {
          console.error('[NoEstásSol@] Error al generar el texto de la denuncia', err);
          if (window.I18N) {
            alert(
              window.I18N.t(
                'pdfErrorBuildText',
                'No se ha podido preparar el texto de la denuncia. Inténtalo de nuevo.'
              )
            );
          }
        }
      });
    }

    if (roleSelect && roleOtherWrapper) {
      const toggleRoleOther = () => {
        const show = roleSelect.value === 'other';
        roleOtherWrapper.classList.toggle('hidden', !show);
        if (!show && roleOtherInput) {
          roleOtherInput.value = '';
        }
      };
      toggleRoleOther();
      roleSelect.addEventListener('change', toggleRoleOther);
    }

    if (factsOngoing && factsEnd) {
      const syncFacts = () => {
        const on = factsOngoing.checked;
        factsEnd.disabled = on;
        if (on) {
          factsEnd.value = '';
        }
      };
      syncFacts();
      factsOngoing.addEventListener('change', syncFacts);
    }

    form.querySelectorAll('input, textarea, select').forEach((el) => {
      el.addEventListener('input', () => {
        el.classList.remove('field-error');
      });
    });

    const previewFields = ['workSchedule'];
    previewFields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (currentStep === totalSteps) {
            updatePreview();
          }
        });
      }
    });

    showStep(currentStep);

    return {
      updateUI() {
        updateStepLabel();
        updatePreview();
      },
      updateCountry() {
        updatePreview();
      },
      getData() {
        return gatherData();
      },
      setData(data) {
        applyDataToForm(data || {});
      }
    };
  }

  function init() {
    const root = document.documentElement;
    const body = document.body;
    const settingsSheet = document.getElementById('settingsSheet');
    const btnSettings = document.getElementById('btnSettings');
    const themeSelect = document.getElementById('themeSelect');
    const langSelect = document.getElementById('langSelect');
    const countrySelect = document.getElementById('countrySelect');
    const installBtn = document.getElementById('installBtn');
    const offlinePill = document.getElementById('offlinePill');
    const yearEl = document.getElementById('f-year');
    const licenseLink = document.getElementById('licenseLink');
    const privacyLink = document.getElementById('privacyLink');
    const licenseOverlay = document.getElementById('licenseOverlay');
    const privacyOverlay = document.getElementById('privacyOverlay');
    const licenseBody = document.getElementById('licenseBody');
    const ppBody = document.getElementById('ppBody');

    const sessionSelect = document.getElementById('sessionSelect');
    const btnSessionSave = document.getElementById('btnSessionSave');
    const btnSessionLoad = document.getElementById('btnSessionLoad');
    const btnSessionExport = document.getElementById('btnSessionExport');
    const btnSessionImport = document.getElementById('btnSessionImport');
    const sessionFileInput = document.getElementById('sessionFileInput');
    const sessionNameInput = document.getElementById('sessionName');

    const coherenceLink = document.getElementById('coherenceLink');
    const coherenceOverlay = document.getElementById('coherenceOverlay');

    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    let settingsOpen = false;

    function syncTranslatedStaticContent() {
      const t = (key, fallback) => {
        if (window.I18N && typeof window.I18N.t === 'function') {
          return window.I18N.t(key, fallback);
        }
        return fallback;
      };

      const coherenceTitle = t('coherenceTitle', 'Coherencia Universal');
      const coherenceBody = t(
        'coherenceBody',
        'Que esta obra sirva como agradecimiento y como compromiso: pensar, sentir y actuar en la misma dirección, sin "adornos"; seguir creando con ética, con alegría y con respeto por todo lo que nos conecta.'
      );

      if (licenseBody) {
        licenseBody.textContent = buildLicenseText();
      }

      if (ppBody) {
        ppBody.innerHTML = buildPrivacyHtml();
      }

      if (coherenceLink) {
        coherenceLink.setAttribute('aria-label', coherenceTitle);
        coherenceLink.setAttribute('title', coherenceTitle);
      }

      if (coherenceOverlay) {
        const titleEl = coherenceOverlay.querySelector('[data-i18n="coherenceTitle"]');
        const bodyEl = coherenceOverlay.querySelector('[data-i18n="coherenceBody"]');

        if (titleEl) {
          titleEl.textContent = coherenceTitle;
        }
        if (bodyEl) {
          bodyEl.textContent = coherenceBody;
        }
      }
    }

    function openSettings() {
      if (!settingsSheet) return;
      settingsSheet.classList.add('is-open');
      settingsSheet.setAttribute('aria-hidden', 'false');
      body.classList.add('overlay-open');
      if (btnSettings) {
        btnSettings.setAttribute('aria-expanded', 'true');
      }
      settingsOpen = true;
    }

    function closeSettings() {
      if (!settingsSheet) return;
      settingsSheet.classList.remove('is-open');
      settingsSheet.setAttribute('aria-hidden', 'true');
      body.classList.remove('overlay-open');
      if (btnSettings) {
        btnSettings.setAttribute('aria-expanded', 'false');
      }
      settingsOpen = false;
    }

    if (btnSettings && settingsSheet) {
      btnSettings.addEventListener('click', () => {
        if (settingsOpen) {
          closeSettings();
        } else {
          openSettings();
        }
      });

      settingsSheet.addEventListener('click', (event) => {
        if (event.target === settingsSheet) {
          closeSettings();
        }
      });
    }

    const THEME_KEY = STORAGE_KEYS.theme;
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

    function resolveSystemTheme() {
      return prefersDark && prefersDark.matches ? 'dark' : 'mono';
    }

    function applyTheme(theme) {
      const t = theme === 'system' ? resolveSystemTheme() : theme;
      root.setAttribute('data-theme', t);
    }

    const savedTheme = safeGet(THEME_KEY) || 'system';
    if (themeSelect) {
      themeSelect.value = savedTheme;
    }
    applyTheme(savedTheme);

    if (themeSelect) {
      themeSelect.addEventListener('change', () => {
        const val = themeSelect.value || 'system';
        safeSet(THEME_KEY, val);
        applyTheme(val);
      });
    }

    if (prefersDark && typeof prefersDark.addEventListener === 'function') {
      prefersDark.addEventListener('change', () => {
        const current = safeGet(THEME_KEY) || 'system';
        if (current === 'system') {
          applyTheme('system');
        }
      });
    }

    const LANG_KEY = STORAGE_KEYS.lang;
    const COUNTRY_KEY = STORAGE_KEYS.country;
    const SESSIONS_KEY = STORAGE_KEYS.sessions;

    let initialLang = 'es';
    let initialCountry = 'es';

    const storedLang = safeGet(LANG_KEY);
    const storedCountry = safeGet(COUNTRY_KEY);
    const browserLang = (navigator.language || 'es').toLowerCase();

    const normalizedStoredLang = normalizeUILang(storedLang);
    if (normalizedStoredLang) {
      initialLang = normalizedStoredLang;
    } else {
      initialLang = detectInitialUILang(browserLang);
      if (storedLang) {
        safeSet(LANG_KEY, initialLang);
      }
    }

    if (storedCountry) {
      initialCountry = storedCountry;
    } else {
      if (browserLang.startsWith('es')) initialCountry = 'es';
      else if (browserLang.startsWith('it')) initialCountry = 'it';
      else if (browserLang.startsWith('fr')) initialCountry = 'fr';
      else if (browserLang.startsWith('de')) initialCountry = 'de';
      else if (browserLang.startsWith('pt')) {
        if (browserLang.includes('br')) initialCountry = 'br';
        else initialCountry = 'pt';
      } else {
        initialCountry = 'es';
      }
    }

    currentUILang = initialLang;

    if (langSelect) {
      langSelect.value = initialLang;
    }
    if (countrySelect) {
      countrySelect.value = initialCountry;
    }
    setCurrentCountry(initialCountry);

    function refreshOnlineStatus() {
      if (!offlinePill) return;
      const isOnline = navigator.onLine;
      offlinePill.classList.toggle('is-online', isOnline);
    }

    refreshOnlineStatus();
    window.addEventListener('online', refreshOnlineStatus);
    window.addEventListener('offline', refreshOnlineStatus);

    function openOverlay(el) {
      if (!el) return;
      el.hidden = false;
      el.classList.add('is-visible');
      body.classList.add('overlay-open');
    }

    function closeOverlay(el) {
      if (!el) return;
      el.hidden = true;
      el.classList.remove('is-visible');
      body.classList.remove('overlay-open');
    }

    window.showCoherenceOverlay = function () {
      if (coherenceOverlay) {
        openOverlay(coherenceOverlay);
        return;
      }
      const el = document.getElementById('coherenceOverlay');
      if (el) {
        openOverlay(el);
      }
    };

    if (licenseLink && licenseOverlay) {
      licenseLink.addEventListener('click', () => {
        if (licenseBody) {
          licenseBody.textContent = buildLicenseText();
        }
        openOverlay(licenseOverlay);
      });
    }

    if (privacyLink && privacyOverlay) {
      privacyLink.addEventListener('click', () => {
        if (ppBody) {
          ppBody.innerHTML = buildPrivacyHtml();
        }
        openOverlay(privacyOverlay);
      });
    }

    if (coherenceLink) {
      coherenceLink.addEventListener('click', (event) => {
        event.preventDefault();
        if (window.showCoherenceOverlay) {
          window.showCoherenceOverlay();
        }
      });
    }

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-close');
        const el = id ? document.getElementById(id) : null;
        if (el) {
          closeOverlay(el);
        }
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (settingsOpen) {
          closeSettings();
          return;
        }
        [licenseOverlay, privacyOverlay, coherenceOverlay].forEach((el) => {
          if (el && !el.hidden) {
            closeOverlay(el);
          }
        });
      }
    });

    let deferredPrompt = null;
    if (installBtn) {
      installBtn.disabled = true;
      installBtn.style.display = 'none';
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event;
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
        installBtn.disabled = false;
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        try {
          await deferredPrompt.userChoice;
        } finally {
          deferredPrompt = null;
          installBtn.disabled = true;
        }
      });
    }

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (installBtn) {
        installBtn.disabled = true;
        const label =
          window.I18N && typeof window.I18N.t === 'function'
            ? window.I18N.t('installedLabel', 'App instalada')
            : 'App instalada';
        installBtn.textContent = label;
      }
    });

    const wizard = initWizard();
    syncTranslatedStaticContent();

    function loadSavedSessions() {
      const raw = safeGet(SESSIONS_KEY);
      if (!raw) return {};
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
        return {};
      } catch (e) {
        return {};
      }
    }

    function saveSessionsMap(map) {
      if (!map || typeof map !== 'object') {
        safeSet(SESSIONS_KEY, JSON.stringify({}));
        return;
      }
      safeSet(SESSIONS_KEY, JSON.stringify(map));
    }

    let sessionsMap = loadSavedSessions();

    function refreshSessionSelect() {
      if (!sessionSelect) return;

      sessionSelect.innerHTML = '';

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.setAttribute('data-i18n', 'sessionSelectPlaceholder');
      placeholder.textContent =
        window.I18N && typeof window.I18N.t === 'function'
          ? window.I18N.t(
              'sessionSelectPlaceholder',
              'Selecciona una sesión guardada…'
            )
          : 'Selecciona una sesión guardada…';
      sessionSelect.appendChild(placeholder);

      const names = Object.keys(sessionsMap).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
      );

      names.forEach((name) => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        sessionSelect.appendChild(opt);
      });
    }

    refreshSessionSelect();

    if (sessionSelect && sessionNameInput) {
      sessionSelect.addEventListener('change', () => {
        sessionNameInput.value = sessionSelect.value || '';
      });
    }

    if (btnSessionSave) {
      btnSessionSave.addEventListener('click', () => {
        if (!wizard || typeof wizard.getData !== 'function') {
          if (window.I18N) {
            alert(
              window.I18N.t(
                'sessionNoWizard',
                'No se ha podido acceder al formulario para guardar la sesión.'
              )
            );
          }
          return;
        }

        const data = wizard.getData();
        const baseSuggestion = (data.fullName || data.companyName || '').trim();

        let name = '';
        if (sessionNameInput && sessionNameInput.value) {
          name = sessionNameInput.value.trim();
        }
        if (!name) {
          name = baseSuggestion;
        }
        if (!name) {
          const now = new Date();
          const iso = now.toISOString().slice(0, 16).replace('T', ' ');
          name = `Sesión ${iso}`;
        }

        if (sessionNameInput && !sessionNameInput.value.trim()) {
          sessionNameInput.value = name;
        }

        const envelope = {
          version: 'noestassolo-v1',
          savedAt: new Date().toISOString(),
          country: data.countryCode || getCurrentCountry(),
          lang: currentUILang || 'es',
          data
        };

        sessionsMap[name] = envelope;
        saveSessionsMap(sessionsMap);
        refreshSessionSelect();
        if (sessionSelect) {
          sessionSelect.value = name;
        }

        if (window.I18N) {
          alert(
            window.I18N.t('sessionSaveSuccess', 'Sesión guardada correctamente.')
          );
        }
      });
    }

    if (btnSessionLoad) {
      btnSessionLoad.addEventListener('click', () => {
        if (!wizard || typeof wizard.setData !== 'function') {
          if (window.I18N) {
            alert(
              window.I18N.t(
                'sessionNoWizard',
                'No se ha podido acceder al formulario para cargar la sesión.'
              )
            );
          }
          return;
        }

        const selectedName = sessionSelect ? sessionSelect.value : '';
        if (!selectedName) {
          if (window.I18N) {
            alert(
              window.I18N.t(
                'sessionLoadNoSelection',
                'Selecciona una sesión guardada antes de cargar.'
              )
            );
          }
          return;
        }

        const entry = sessionsMap[selectedName];
        if (!entry || !entry.data) {
          if (window.I18N) {
            alert(
              window.I18N.t(
                'sessionLoadNotFound',
                'No se ha podido cargar la sesión seleccionada.'
              )
            );
          }
          return;
        }

        const data = entry.data;

        if (data.countryCode && countrySelect && COUNTRY_CONFIG[data.countryCode]) {
          countrySelect.value = data.countryCode;
          setCurrentCountry(data.countryCode);
        }

        wizard.setData(data);

        if (sessionNameInput) {
          sessionNameInput.value = selectedName;
        }
      });
    }

    if (btnSessionExport) {
      btnSessionExport.addEventListener('click', () => {
        if (!wizard || typeof wizard.getData !== 'function') {
          if (window.I18N) {
            alert(
              window.I18N.t(
                'sessionNoWizard',
                'No se ha podido acceder al formulario para exportar la sesión.'
              )
            );
          }
          return;
        }

        const data = wizard.getData();
        const payload = {
          version: 'noestassolo-v1',
          exportedAt: new Date().toISOString(),
          country: data.countryCode || getCurrentCountry(),
          lang: currentUILang || 'es',
          data
        };

        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json' });

        const baseName =
          (data.fullName || data.companyName || 'denuncia')
            .trim()
            .replace(/\s+/g, '_')
            .slice(0, 40) || 'denuncia';

        const fileName = `noestassolo_session_${baseName}.json`;

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(a.href);
          a.remove();
        }, 0);
      });
    }

    if (btnSessionImport && sessionFileInput) {
      btnSessionImport.addEventListener('click', () => {
        sessionFileInput.value = '';
        sessionFileInput.click();
      });

      sessionFileInput.addEventListener('change', () => {
        const file = sessionFileInput.files && sessionFileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const text = String(event.target.result || '');
            const parsed = JSON.parse(text);
            if (!parsed || typeof parsed !== 'object') {
              throw new Error('Invalid JSON');
            }
            const data =
              parsed.data && typeof parsed.data === 'object' ? parsed.data : null;
            if (!data) {
              throw new Error('Missing data field');
            }

            if (data.countryCode && countrySelect && COUNTRY_CONFIG[data.countryCode]) {
              countrySelect.value = data.countryCode;
              setCurrentCountry(data.countryCode);
            }

            if (wizard && typeof wizard.setData === 'function') {
              wizard.setData(data);
            }

            if (window.I18N) {
              alert(
                window.I18N.t(
                  'sessionImportSuccess',
                  'Sesión cargada desde el archivo JSON.'
                )
              );
            }
          } catch (err) {
            console.error('[NoEstásSol@] Error al importar JSON de sesión', err);
            if (window.I18N) {
              alert(
                window.I18N.t(
                  'sessionImportError',
                  'No se ha podido leer el archivo JSON. Comprueba que corresponde a una sesión exportada desde NoEstásSol@.'
                )
              );
            }
          } finally {
            sessionFileInput.value = '';
          }
        };
        reader.readAsText(file, 'utf-8');
      });
    }

    if (countrySelect) {
      countrySelect.addEventListener('change', () => {
        const val = countrySelect.value || 'es';
        setCurrentCountry(val);
        safeSet(COUNTRY_KEY, val);
        if (wizard && typeof wizard.updateCountry === 'function') {
          wizard.updateCountry(val);
        }
      });
    }

    if (window.I18N && typeof window.I18N.loadLanguage === 'function') {
      ensureLanguageLoaded(initialLang).then(() => {
        syncTranslatedStaticContent();
        if (wizard && typeof wizard.updateUI === 'function') {
          wizard.updateUI();
        }
      });

      if (langSelect) {
        langSelect.addEventListener('change', () => {
          const val = normalizeUILang(langSelect.value) || 'es';
          if (langSelect.value !== val) {
            langSelect.value = val;
          }
          currentUILang = val;
          safeSet(LANG_KEY, val);
          ensureLanguageLoaded(val).then(() => {
            syncTranslatedStaticContent();
            if (wizard && typeof wizard.updateUI === 'function') {
              wizard.updateUI();
            }
          });
        });
      }
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('[NoEstásSol@] Service worker registration failed', err);
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();