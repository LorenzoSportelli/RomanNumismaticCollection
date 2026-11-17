// autocomplete.js
var REFERENCES = [];
var _refFetchStarted = false;

function loadReferences() {
  if (_refFetchStarted) return;
  _refFetchStarted = true;
  fetch('references.json')
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(data) {
      REFERENCES = Array.isArray(data) ? data : [];
      console.log('References loaded:', REFERENCES.length);
    })
    .catch(function(e) {
      console.warn('references.json not loaded:', e.message);
      REFERENCES = [];
    });
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
    var matches = REFERENCES.filter(function(r) {
      return (r.ref || '').toLowerCase().indexOf(q) >= 0;
    }).slice(0, 20);

    if (!matches.length) {
      list.classList.remove('open');
      list.innerHTML = '';
      return;
    }

    list.innerHTML = matches.map(function(r) {
      var meta = [r.authority, r.denom, r.metal, r.date].filter(Boolean).join(' · ');
      return '<div class="ref-suggestion" data-ref="' + esc(r.ref) + '" data-authority="' + esc(r.authority || '') + '" data-denom="' + esc(r.denom || '') + '" data-metal="' + esc(r.metal || '') + '" data-date="' + esc(r.date || '') + '">' +
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
    var authority = el.dataset.authority || '';
    var denom = el.dataset.denom || '';
    var metal = el.dataset.metal || '';
    var date = el.dataset.date || '';

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
      if (currentPeriod === 'prov') {
        var fProvImp = document.getElementById('f-prov-imp');
        if (fProvImp) fProvImp.value = authority;
      } else if (currentPeriod === 'rep') {
        var fRepAuth = document.getElementById('f-rep-auth');
        if (fRepAuth) fRepAuth.value = authority;
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