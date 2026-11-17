var REFERENCES = [];
var _refFetchStarted = false;

function loadReferences() {
  if (_refFetchStarted) return;
  _refFetchStarted = true;

  var files = [
    'json/NEWreferences_rep.json',
    'json/NEWreferences_imp.json',
    'json/NEWreferences_prov.json'
  ];

  Promise.all(files.map(function(url) {
    return fetch(url)
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        return Array.isArray(data) ? data : [];
      })
      .catch(function(e) {
        console.warn('File non caricato: ' + url + ' (' + e.message + ')');
        return [];
      });
  })).then(function(results) {
    REFERENCES = results[0].concat(results[1]).concat(results[2]);
    console.log('References loaded:', REFERENCES.length);
  });
}

function addChip(pickerId, value) {
  if (!value) return;
  var picker = document.getElementById(pickerId);
  if (!picker) return;
  var chips = picker.querySelector('.pk-chips');
  if (!chips) return;
  var existing = chips.querySelector('.pk-chip[data-value="' + value.replace(/"/g, '&quot;') + '"]');
  if (existing) return;
  var chip = document.createElement('div');
  chip.className = 'pk-chip';
  chip.setAttribute('data-value', value);
  chip.innerHTML = '<span>' + value + '</span><button type="button" aria-label="Remove">&times;</button>';
  chip.querySelector('button').addEventListener('click', function() { chip.remove(); });
  chips.appendChild(chip);
}

function resolveGeography(mint, period) {
  var out = { region: '', subregion: '', province: '' };
  if (!mint) return out;

  if (period === 'imp' && typeof IMP_CITY_TO_SUBSUB !== 'undefined') {
    out.subregion = IMP_CITY_TO_SUBSUB[mint] || '';
    if (typeof IMP_CITY_TO_SUB !== 'undefined') {
      out.region = IMP_CITY_TO_SUB[mint] || '';
    }
    if (out.subregion && typeof IMP_MAP_TO_PROVS !== 'undefined') {
      var provs = IMP_MAP_TO_PROVS[out.subregion];
      if (provs && provs.length) out.province = provs[0];
    }
  }

  if (period === 'prov' && typeof PDB !== 'undefined' && PDB.cityByName) {
    var list = PDB.cityByName[mint.toLowerCase()];
    if (list && list.length) {
      var city = list[0];
      out.subregion = city.region || '';
      if (typeof REGION_PROVINCES !== 'undefined' && REGION_PROVINCES[out.subregion]) {
        out.province = REGION_PROVINCES[out.subregion][0] || '';
      }
    }
  }

  return out;
}

function initReferenceAutocomplete() {
  var input = document.getElementById('f-ref-search');
  var list = document.getElementById('ref-suggestions');
  if (!input || !list) return;

  input.addEventListener('input', function() {
    var q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      list.classList.remove('open');
      list.innerHTML = '';
      return;
    }

    var period = (typeof currentPeriod !== 'undefined' && currentPeriod) ? currentPeriod : null;
    var pool = REFERENCES;
    if (period) {
      pool = REFERENCES.filter(function(r) { return r.period === period; });
    }

    var matches = pool.filter(function(r) {
      return (r.ref || '').toLowerCase().indexOf(q) >= 0;
    }).slice(0, 20);

    if (!matches.length) {
      list.classList.remove('open');
      list.innerHTML = '';
      return;
    }

    list.innerHTML = matches.map(function(r) {
      var meta = [r.authority, r.denom, r.metal, r.date].filter(Boolean).join(' · ');
      return '<div class="ref-suggestion" data-ref="' + esc(r.ref) + '" data-authority="' + esc(r.authority || '') + '" data-denom="' + esc(r.denom || '') + '" data-metal="' + esc(r.metal || '') + '" data-date="' + esc(r.date || '') + '" data-mint="' + esc(r.mint || '') + '">' +
        '<strong>' + esc(r.ref) + '</strong>' +
        (meta ? '<small>' + esc(meta) + '</small>' : '') +
        '</div>';
    }).join('');

    list.classList.add('open');
  });

  list.addEventListener('click', function(e) {
    var el = e.target.closest('.ref-suggestion');
    if (!el) return;

    var ref = el.dataset.ref || '';
    var denom = el.dataset.denom || '';
    var metal = el.dataset.metal || '';
    var date = el.dataset.date || '';
    var authority = el.dataset.authority || '';
    var mint = el.dataset.mint || '';
    var period = (typeof currentPeriod !== 'undefined' && currentPeriod) ? currentPeriod : null;

    var fRef = document.getElementById('f-ref');
    if (fRef) fRef.value = ref;

    var fDenom = document.getElementById('f-denom');
    if (fDenom && denom) fDenom.value = denom;

    var fMetal = document.getElementById('f-metal');
    if (fMetal && metal) {
      for (var i = 0; i < fMetal.options.length; i++) {
        if (fMetal.options[i].text.toLowerCase() === metal.toLowerCase()) {
          fMetal.selectedIndex = i;
          break;
        }
      }
    }

    var fDate = document.getElementById('f-date');
    if (fDate && date) fDate.value = date;

    if (authority) {
      if (period === 'imp') {
        if (typeof pkAdd === 'function') pkAdd('authorities', authority);
        else addChip('pk-authorities', authority);
      } else if (period === 'prov') {
        var fProvImp = document.getElementById('f-prov-imp');
        if (fProvImp) fProvImp.value = authority;
      } else if (period === 'rep') {
        var fRepAuth = document.getElementById('f-rep-auth');
        if (fRepAuth) fRepAuth.value = authority;
      }
    }

    if (mint) {
      if (period === 'imp') {
        if (typeof impGeoAdd === 'function') {
          impGeoAdd('cities', mint);
          if (typeof pkAfterChange === 'function') pkAfterChange('impcities');
        } else {
          addChip('pk-imp-cities', mint);
          var geoImp = resolveGeography(mint, period);
          if (geoImp.subregion) addChip('pk-imp-subs', geoImp.subregion);
          if (geoImp.region) addChip('pk-imp-regions', geoImp.region);
        }
      } else if (period === 'rep') {
        if (typeof repGeoAdd === 'function') {
          repGeoAdd('cities', mint);
          if (typeof pkAfterChange === 'function') pkAfterChange('repcities');
        } else {
          addChip('pk-rep-cities', mint);
          var geoRep = resolveGeography(mint, period);
          if (geoRep.subregion) addChip('pk-rep-subs', geoRep.subregion);
          if (geoRep.region) addChip('pk-rep-regions', geoRep.region);
        }
      } else if (period === 'prov') {
        if (typeof provGeoAdd === 'function') {
          provGeoAdd('cities', mint);
          if (typeof pkAfterChange === 'function') pkAfterChange('cities');
        } else {
          addChip('pk-cities', mint);
          var geoProv = resolveGeography(mint, period);
          if (geoProv.province) addChip('pk-provs', geoProv.province);
          if (geoProv.subregion) addChip('pk-subs', geoProv.subregion);
          if (geoProv.region) addChip('pk-regions', geoProv.region);
        }
      }
    }

    list.classList.remove('open');
    list.innerHTML = '';
    input.value = '';
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove('open');
    }
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      list.classList.remove('open');
      input.value = '';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    loadReferences();
    initReferenceAutocomplete();
  });
} else {
  loadReferences();
  initReferenceAutocomplete();
}