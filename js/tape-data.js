/**
 * Central Tape Catalog & Metadata Store for CASSETTE
 */
(function (global) {
  'use strict';

  const TAPES = {
    'lok_abyei': {
      id: 'lok_abyei',
      type: 'TYPE I',
      brand: 'AJIING MATHIANG',
      pos: 'NORMAL',
      title: '“Lok Abyei”',
      artist: 'Ajiing Mathiang',
      subtitle: '“Lok Abyei” - Ajiing Mathiang',
      color: '#c24930',
      shellBg: '#2c221e',
      shellBorder: '#44352e',
      audioSrc: 'music/Ajiing Mathiang_Lok Abyei.mp3'
    },
    'abyei_jazz': {
      id: 'abyei_jazz',
      type: 'TYPE II',
      brand: 'ABYEI JAZZ BAND',
      pos: 'CHROME',
      title: '“Nyanpanda”',
      artist: 'Abyei Jazz Band ft. Arop Nyok',
      subtitle: '“Nyanpanda” - Abyei Jazz Band ft. Arop Nyok',
      color: '#1e40af',
      shellBg: '#101c2e',
      shellBorder: '#1e3a8a',
      audioSrc: 'music/Abyei Jazz Band - Arop Nyok Kuol - Nyanpanda.mp3'
    },
    'samira': {
      id: 'samira',
      type: 'TYPE I',
      brand: 'AROP NYOK KUOL',
      pos: 'HIGH OUTPUT',
      title: '“Samira”',
      artist: 'Arop Nyok Kuol',
      subtitle: '“Samira” - Arop Nyok Kuol',
      color: '#be123c',
      shellBg: '#2d1210',
      shellBorder: '#4c0519',
      audioSrc: 'music/Arop Nyok Kuol - Samira.mp3'
    },
    'binia_juba': {
      id: 'binia_juba',
      type: 'MIXTAPE',
      brand: 'DJ BAKO DUB',
      pos: 'CUSTOM 90m',
      title: '“Binia Juba Mix”',
      artist: 'DJ Bako',
      subtitle: '“Binia Juba Mix” - DJ Bako',
      color: '#4338ca',
      shellBg: '#ece9e0',
      shellBorder: '#d3cfc3',
      audioSrc: 'music/BINIA JUBA MIX BY.DJ.BAKO wmv.mp3'
    },
    'ci_mal_ben': {
      id: 'ci_mal_ben',
      type: 'TYPE II',
      brand: 'DUOP PUR DUOP',
      pos: 'PRO MASTER',
      title: '“Ci Mal Ben”',
      artist: 'Duop Pur Duop',
      subtitle: '“Ci Mal Ben” - Duop Pur Duop',
      color: '#15803d',
      shellBg: '#13271b',
      shellBorder: '#09150e',
      audioSrc: 'music/Duop Pur Duop - Ci Mal Ben (Official Video) South Sudan Music 2008.mp3'
    },
    'juba': {
      id: 'juba',
      type: 'TYPE I',
      brand: 'MAHMOUD ABDELAZIZ',
      pos: 'STUDIO MASTER',
      title: '“Juba”',
      artist: 'Mahmoud Abdelaziz',
      subtitle: '“Juba” - Mahmoud Abdelaziz',
      color: '#b45309',
      shellBg: '#fdfbf7',
      shellBorder: '#e0dcd3',
      audioSrc: 'music/Juba - Mahmoud Abdelaziz.mp3'
    },
    'kuol_diing': {
      id: 'kuol_diing',
      type: 'TYPE IV',
      brand: 'KUOL DIING • كوال ديينق',
      pos: 'METAL 70μs',
      title: 'Kuol Diing Classics',
      artist: 'موسيقار كوال ديينق',
      subtitle: 'Kuol Diing Classics - موسيقار كوال ديينق',
      color: '#854d0e',
      shellBg: '#332211',
      shellBorder: '#ca8a04',
      audioSrc: 'music/Kuol Diing . M      موسيقار كوال ديينق.mp3'
    },
    'tiel': {
      id: 'tiel',
      type: 'TYPE I',
      brand: 'NYAKOL MATHIANG',
      pos: 'ACOUSTIC',
      title: '“Tiel”',
      artist: 'Nyakol Mathiang',
      subtitle: '“Tiel” - Nyakol Mathiang',
      color: '#9d174d',
      shellBg: '#2a131e',
      shellBorder: '#db2777',
      audioSrc: 'music/Nyakol_Mathiang_Tiel.mp3'
    }
  };

  const DEFAULT_ORDER = [
    'samira',
    'lok_abyei',
    'abyei_jazz',
    'binia_juba',
    'ci_mal_ben',
    'juba',
    'kuol_diing',
    'tiel'
  ];

  const INITIAL_COLLECTION = [
    'lok_abyei',
    'abyei_jazz',
    'samira',
    'binia_juba',
    'ci_mal_ben'
  ];

  const COLLECTION_STORAGE_KEY = 'cassette_user_collection';

  function getUserCollection() {
    try {
      const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(id => Boolean(TAPES[id]));
        }
      }
    } catch (e) {}
    return [...INITIAL_COLLECTION];
  }

  function saveUserCollection(list) {
    try {
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function isInCollection(id) {
    return getUserCollection().includes(id);
  }

  function addToCollection(id) {
    if (!TAPES[id]) return;
    const list = getUserCollection();
    if (!list.includes(id)) {
      list.push(id);
      saveUserCollection(list);
      global.dispatchEvent(new CustomEvent('collection-updated', { detail: { id, action: 'add' } }));
    }
  }

  function removeFromCollection(id) {
    const list = getUserCollection().filter(item => item !== id);
    saveUserCollection(list);
    global.dispatchEvent(new CustomEvent('collection-updated', { detail: { id, action: 'remove' } }));
  }

  function toggleCollection(id) {
    if (isInCollection(id)) {
      removeFromCollection(id);
      return false;
    } else {
      addToCollection(id);
      return true;
    }
  }

  const TapeData = {
    get: function (id) {
      return TAPES[id] || null;
    },
    getAll: function () {
      return { ...TAPES };
    },
    getAllIds: function () {
      return Object.keys(TAPES);
    },
    getDefaultOrder: function () {
      return [...DEFAULT_ORDER];
    },
    getDefaultId: function () {
      return 'lok_abyei';
    },
    getUserCollection,
    isInCollection,
    addToCollection,
    removeFromCollection,
    toggleCollection
  };

  global.TapeData = TapeData;
})(window);
