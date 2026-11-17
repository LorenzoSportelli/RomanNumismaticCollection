var STEPS = [
  [229,221,201], [210,192,157], [203,180,142], [194,166,124], 
  [184,152,96], [172,135,86], [160,118,76], [150,88,59], 
  [139,58,42], [125,49,34], [110,40,26], [92,33,21], [74,26,16]
];

function val2color(v, mx) {
  if (!v || !mx) return "rgb(" + STEPS[0].join(",") + ")";
  var idx = Math.ceil((v / mx) * (STEPS.length - 1));
  idx = Math.max(1, Math.min(idx, STEPS.length - 1));
  return "rgb(" + STEPS[idx].join(",") + ")";
}

function geoToOur(geoName){
  if(!geoName)return null;
  if(GEO_MAP[geoName])return GEO_MAP[geoName];
  var low=geoName.toLowerCase();
  for(var k in GEO_MAP){ if(k.toLowerCase() === low) return GEO_MAP[k]; }
  return null;
}

var _mobileInit = isMobile();
var _touchInit = isTouchDevice();
var map; // Dichiarata ma NON inizializzata subito
var tt = document.getElementById("tt");
var mw = document.getElementById("mapwrap");
var geoLayer = null;
var mintsLayer;

window.initMap = function() {
  if (map) return; 
  map = L.map("map", {
    zoom: 5, minZoom: _touchInit ? 2 : 4.85, maxZoom: 8,
    zoomSnap: 0.1, zoomDelta: 0.5,
    touchZoom: true, tap: true, tapTolerance: 15,
    bounceAtZoomLimits: false,
    doubleClickZoom: _mobileInit,
    scrollWheelZoom: !_mobileInit
  });

  if (_mobileInit) {
    map.zoomControl.remove();
  }

  map.createPane('provincesPane'); map.getPane('provincesPane').style.zIndex = 400;
  map.createPane('mintsPane'); map.getPane('mintsPane').style.zIndex = 650;
  map.createPane('mintsTooltipPane'); map.getPane('mintsTooltipPane').style.zIndex = 700;

  mintsLayer = L.layerGroup().addTo(map);

  map.on('click', function(){
    if (isMobile() && tt.style.display === 'block') {
      tt.style.display = 'none';
      tt.dataset.prov = '';
      updateMap();
    }
  });

  fetch("https://cdn.jsdelivr.net/gh/klokantech/roman-empire@master/data/provinces.geojson")
    .then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();})
    .then(function(data){
      geoLayer=L.geoJSON(data,{
        pane: 'provincesPane',
        style:function(){return{fillColor:"#c8c8b3",fillOpacity:.83,color:"#6a5020",weight:.8};},
        onEachFeature:function(feat,lyr){
          var geoName=feat.properties&&feat.properties.name||"";
          var ourName=geoToOur(geoName);
          var hideTimer = null;

          function showTooltip(e){
            var pc = ourName ? coins.filter(function(c){ return coinInMapProvince(c, ourName); }) : [];
            var html="<strong>"+(ourName||geoName)+"</strong>";
            html+="<div class='tl'>Coins: <b>"+pc.length+"</b></div>";
            if(pc.length){
              html+="<div class='coins'>";
              pc.slice(0,4).forEach(function(c){
                var label=c.ref||(c.period==='rep'?c.mag:c.period==='imp'?c.imp:(c.provImp||c.reign))||c.denom||'—';
                html+="<div class='coin-item'>"+esc(label)+(c.denom&&c.ref?" · "+esc(c.denom):"")+"</div>";
              });
              if(pc.length>4)html+="<div class='coin-item'>…and "+(pc.length-4)+" more</div>";
              html+="</div>";
            }
            tt.innerHTML=html;
            tt.style.display="block";
            tt.dataset.prov = ourName || '';
            postt(e.originalEvent || e);
          }
          function hideTooltip(){
            tt.style.display = 'none';
            tt.dataset.prov = '';
            clearTimeout(hideTimer);
            updateMap();
          }

          lyr.on({
            mouseover:function(e){
              if (L.Browser.mobile) return;
              lyr.setStyle({weight:2,color:"#e8c020",fillOpacity:.95});
              lyr.bringToFront();
              showTooltip(e);
            },
            mousemove:function(e){
              if (L.Browser.mobile) return;
              postt(e.originalEvent);
            },
            mouseout:function(){
              if (L.Browser.mobile) return;
              hideTooltip();
            },
            click:function(e){
              if (!L.Browser.mobile) return;
              if (tt.style.display === 'block' && tt.dataset.prov === (ourName || '')) {
                hideTooltip();
                return;
              }
              lyr.setStyle({weight:2,color:"#e8c020",fillOpacity:.95});
              lyr.bringToFront();
              showTooltip(e);
              clearTimeout(hideTimer);
              hideTimer = setTimeout(function(){ hideTooltip(); }, 3500);
            }
          });
        }
      }).addTo(map);
      var b = geoLayer.getBounds();
      var isTbl = window.matchMedia('(min-width: 600px) and (max-width: 1100px) and (pointer: coarse)').matches;
      if (isMobile() || isTbl) {
        map.fitBounds(b, { paddingTopLeft: [0, 0], paddingBottomRight: [0, 0] });
      } else {
        map.fitBounds(b, { padding: [20, 20] });
      }
      setTimeout(function(){
        map.invalidateSize();
        if (isMobile()) map.setView(map.getCenter(), Math.max(map.getZoom(), 5.5));
        else if (isTbl) map.setView(map.getCenter(), Math.max(map.getZoom(), 4));
      }, 250);
      if (!_touchInit) {
        map.setMaxBounds(b);
        map.options.maxBoundsViscosity = 1.0;
      } else {
        map.setMaxBounds(b.pad(1.5));
        map.options.maxBoundsViscosity = 0.0;
      }
      document.getElementById("loading").style.display="none";
      document.getElementById("legend").classList.add('ready');
      MINT_GEO_CACHE = {};
      updateMap();
      window._mapReady = true;
      if (window.checkAppReady) window.checkAppReady();
    })
    .catch(function(e){
      document.getElementById("loading").innerHTML="<b style='color:#c0392b'>Error: "+e.message+"</b>";
      window._mapReady = true;
      if (window.checkAppReady) window.checkAppReady();
    });

  setTimeout(function(){
    if(!geoLayer){
      var el = document.getElementById('loading');
      if (el) el.innerHTML = "<b>Map unavailable</b><small>Check your connection and reload.</small>";
    }
    window._mapReady = true;
    if (window.checkAppReady) window.checkAppReady();
  }, 15000);

  fetch('json/mints.json')
    .then(function(r){ return r.json(); })
    .then(function(data){
      allMintsData = data;
      MINT_GEO_CACHE = {};
      rebuildMintTypeIndex();
      setMintMode('none');
      setFilter('all');
    })
    .catch(function(err){ console.error("Errore caricamento mints.json:", err); });

};
function provinceOfMint(mintName){
  if(!mintName) return null;
  var canon = canonicalMint(mintName);
  if(canon in MINT_GEO_CACHE) return MINT_GEO_CACHE[canon];
  if(!geoLayer) return null;
  var lat=null, lng=null;
  if(allMintsData.length){
    var m = allMintsData.find(function(x){ return canonicalMint(x.name) === canon; });
    if(m){ lat = m.lat; lng = m.lng; }
  }
  if(lat==null){
    for(var k in MINT_COORD_OVERRIDES){
      if(canonicalMint(k) === canon){ lat = MINT_COORD_OVERRIDES[k][0]; lng = MINT_COORD_OVERRIDES[k][1]; break; }
    }
  }
  if(lat==null || lng==null){ MINT_GEO_CACHE[canon] = null; return null; }
  var pt = turf.point([lng, lat]);
  var hits = [];
  geoLayer.eachLayer(function(l){ if(l.feature && l.feature.geometry && turf.booleanPointInPolygon(pt, l.feature)) hits.push(l.feature); });
  hits.sort(function(a,b){ return (turf.area(a)-turf.area(b)) || String(a.properties.name||'').localeCompare(String(b.properties.name||'')); });
  var result = hits[0] ? geoToOur(hits[0].properties.name) : null;
  MINT_GEO_CACHE[canon] = result;
  return result;
}
function provsForCity(id){
  var c = cityById(id); if(!c) return [];
  var p = provinceOfMint(c.name);
  if(p) return [p];
  if(c.provs && c.provs.length) return c.provs.slice();
  if(c.sub){ var sp = provsForSub(c.sub); if(sp.length) return sp; }
  return provsForRegion(c.region);
}
function resolveProvinces(geo, primary){
  var set = {};
  function add(arr){ arr.forEach(function(p){ if(p) set[p]=true; }); }
  geo = normGeo(geo);
  if(primary) set[primary]=true;
  add(geo.provs);
  var cityResolved = false;
  geo.cities.forEach(function(cid){
    var obj = cityById(cid);
    var name = obj ? obj.name : cid;
    var p = provinceOfMint(name);
    if(p){ set[p]=true; cityResolved = true; }
  });
  if(!cityResolved){ geo.cities.forEach(function(c){ add(provsForCity(c)); }); }
  if(!cityResolved){
    geo.subs.forEach(function(s){ add(provsForSub(s)); });
    geo.regions.forEach(function(r){ add(provsForRegion(r)); });
  }
  geo.provExclusions.forEach(function(p){ delete set[p]; });
  return Object.keys(set);
}
function coinInMapProvince(c, ourName){
  if (currentCoinFilter !== 'all' && c.period !== currentCoinFilter) return false;
  var provinces = [];
  if (c.period === 'prov') {
    provinces = resolveProvinces(c.geo, '');
  } else if (c.period === 'imp' || c.period === 'rep') {
    var fromMint = provinceOfMint(c.mint);
    if(fromMint){ provinces = [fromMint]; }
    else {
      var map2 = (c.period === 'imp') ? IMP_MAP_TO_PROVS : REP_MAP_TO_PROVS;
      var subsubs = (c.period === 'imp') ? c.impSubsubs : c.repSubsubs;
      var subs    = (c.period === 'imp') ? c.impSubs    : c.repSubs;
      var regions = (c.period === 'imp') ? c.impRegions : c.repRegions;
      if (c.mint && map2[c.mint]) provinces = map2[c.mint];
      else if (subsubs && subsubs.length) provinces = subsubs.reduce(function(a,ss){ return a.concat(map2[ss]||[]); }, []);
      else if (subs && subs.length) provinces = subs.reduce(function(a,s){ return a.concat(map2[s]||[]); }, []);
      else if (regions && regions.length) provinces = regions.reduce(function(a,r){ return a.concat(map2[r]||[]); }, []);
    }
  }
  if(provinces.indexOf('Italia') >= 0){
    return ourName === 'Italia' || (ourName && ourName.indexOf('Italia') === 0);
  }
  if(ourName === 'Italia'){
    return provinces.some(function(p){ return p === 'Italia' || p.indexOf('Italia') === 0; });
  }
  return provinces.indexOf(ourName) >= 0;
}
var _provCountCache = {};
function provCount(ourName){
  if (ourName in _provCountCache) return _provCountCache[ourName];
  var n = coins.filter(function(c){ return coinInMapProvince(c, ourName); }).length;
  _provCountCache[ourName] = n;
  return n;
}
function getMax(gl){
  var m=0;
  gl.eachLayer(function(l){
    var n=l.feature&&l.feature.properties&&l.feature.properties.name||"";
    var our=geoToOur(n);
    if(our)m=Math.max(m,provCount(our));
  });
  return m;
}
function postt(e){
  var r=mw.getBoundingClientRect();
  var x=e.clientX-r.left+14;
  var y=e.clientY-r.top-8;
  var tw = tt.offsetWidth || 200;
  var th = tt.offsetHeight || 110;
  if(x+tw>mw.offsetWidth-8) x=e.clientX-r.left-tw-8;
  if(x<8) x=8;
  if(y+th>mw.offsetHeight-8) y=e.clientY-r.top-th-8;
  if(y<8) y=8;
  tt.style.left=x+"px";tt.style.top=y+"px";
}
var highlightSet = {};
function setHighlight(list){
  highlightSet = {};
  (list||[]).forEach(function(p){ highlightSet[p]=true; });
  document.getElementById('legend').classList.toggle('has-hl', Object.keys(highlightSet).length>0);
  updateMap();
}
function clearHighlight(){ setHighlight([]); }
function isHighlighted(our){
  if(!our) return false;
  if(highlightSet[our]) return true;
  if(our.indexOf("Italia")===0 && highlightSet["Italia"]) return true;
  if(our==="Italia"){ for(var k in highlightSet){ if(k.indexOf("Italia")===0) return true; } }
  return false;
}
function updateMap(){
  if(!geoLayer)return;
  _provCountCache = {};
  var mx=getMax(geoLayer);
  document.getElementById("legmax").textContent=mx;
  var hl=[];
  geoLayer.eachLayer(function(l){
    var n=l.feature&&l.feature.properties&&l.feature.properties.name||"";
    var our=geoToOur(n);
    var v=our?provCount(our):0;
    if(isHighlighted(our)){
      l.setStyle({fillColor:val2color(v,mx),fillOpacity:.95,color:"#2a7a4a",weight:2.4});
      hl.push(l);
    } else {
      l.setStyle({fillColor:val2color(v,mx),fillOpacity:.83,color:"#6a5020",weight:.8});
    }
  });
  hl.forEach(function(l){ l.bringToFront(); });
}
function addMintType(name, type){
  if(!name) return;
  var canon = canonicalMint(name);
  if(!MINT_TYPES[canon]) MINT_TYPES[canon] = {};
  MINT_TYPES[canon][type] = true;
}
function rebuildMintTypeIndex(){
  if (typeof allMintsData === 'undefined') return;
  MINT_TYPES = {};
  REP_CITIES.forEach(function(n){ addMintType(n, 'rep'); });
  IMP_CITIES.forEach(function(n){ addMintType(n, 'imp'); });
  if(PDB.ready){ PDB.cities.forEach(function(c){ addMintType(c.name, 'prov'); }); }
  (allMintsData || []).forEach(function(m){
    if(m.type && ['prov','imp','rep'].indexOf(m.type) >= 0){ addMintType(m.name, m.type); }
  });
}
function getMintTypes(name){
  var canon = canonicalMint(name);
  return MINT_TYPES[canon] || null;
}
function mintVisible(mintName, ownedSet){
  var canon = canonicalMint(mintName);
  var isOwned = ownedSet.has(canon);
  if (currentMintMode === 'mine' && !isOwned) return false;
  if (currentCoinFilter === 'all') return true;
  var types = getMintTypes(mintName);
  if (!types) return isOwned;
  return !!types[currentCoinFilter];
}
var _mintsRaf = null;
function renderMints() {
  if (!mintsLayer) return;
  if (_mintsRaf) cancelAnimationFrame(_mintsRaf);
  _mintsRaf = requestAnimationFrame(function(){
    _mintsRaf = null;
    mintsLayer.clearLayers();
    if (allMintsData.length === 0 || currentMintMode === 'none') return;
    var ownedMints = new Set();
    coins.forEach(function(c){
      if (c.mint) {
        c.mint.split(';').forEach(function(m){ if(m.trim()) ownedMints.add(canonicalMint(m.trim())); });
      }
    });
    var mintsToDraw = allMintsData.slice().sort(function(a, b){
      var oa = ownedMints.has(canonicalMint(a.name)) ? 1 : 0;
      var ob = ownedMints.has(canonicalMint(b.name)) ? 1 : 0;
      return oa - ob;
    });
    mintsToDraw.forEach(function(m){
      if (!mintVisible(m.name, ownedMints)) return;
      var isOwned = ownedMints.has(canonicalMint(m.name));
      var marker = L.circleMarker([m.lat, m.lng], {
        pane: 'mintsPane', radius: 5,
        fillColor: isOwned ? '#2a7a4a' : '#9a9a94',
        color: '#ffffff', weight: 1.5, opacity: 1, fillOpacity: 0.95, className: 'mint-marker'
      });
      marker.bindTooltip('<strong>'+esc(m.name)+'</strong><br><span style="font-size:10px;">'+(isOwned ? 'In collection' : 'Not owned')+'</span>', { direction: 'top', offset: [0, -8], pane: 'mintsTooltipPane' });
      marker.on('click', function(){
        if (L.Browser.mobile) setTimeout(function(){ marker.closeTooltip(); }, 2500);
      });
      mintsLayer.addLayer(marker);
    });
    Object.keys(MINT_COORD_OVERRIDES).forEach(function(name){
      if(allMintsData.some(function(m){ return canonicalMint(m.name) === canonicalMint(name); })) return;
      if (!mintVisible(name, ownedMints)) return;
      var isOwned = ownedMints.has(canonicalMint(name));
      var coords = MINT_COORD_OVERRIDES[name];
      var marker = L.circleMarker(coords, {
        pane: 'mintsPane', radius: 5,
        fillColor: isOwned ? '#2a7a4a' : '#9a9a94',
        color: '#ffffff', weight: 1.5, opacity: 1, fillOpacity: 0.95, className: 'mint-marker'
      });
      marker.bindTooltip('<strong>'+esc(name)+'</strong><br><span style="font-size:10px;">'+(isOwned ? 'In collection' : 'Not owned')+'</span>', { direction: 'top', offset: [0, -8], pane: 'mintsTooltipPane' });
      marker.on('click', function(){
        if (L.Browser.mobile) setTimeout(function(){ marker.closeTooltip(); }, 2500);
      });
      mintsLayer.addLayer(marker);
    });
  });
}
function setMintMode(mode) {
  currentMintMode = mode;
  var bNone = document.getElementById('btn-mints-none');
  var bMine = document.getElementById('btn-mints-mine');
  var bAll = document.getElementById('btn-mints-all');
  [bNone, bMine, bAll].forEach(function(b){ b.classList.remove('active'); });
  if (mode === 'none') bNone.classList.add('active');
  else if (mode === 'mine') bMine.classList.add('active');
  else if (mode === 'all') bAll.classList.add('active');
  renderMints();
}
function setFilter(mode, btn){
  filterMode = mode;
  currentCoinFilter = mode;
  document.querySelectorAll('.ftab').forEach(function(b){
    b.classList.toggle('on', b.dataset.filter === mode);
  });
  document.querySelectorAll('#map-controls [data-filter]').forEach(function(b){
    b.classList.toggle('active', b.dataset.filter === mode);
  });
  renderList();
  updateMap();
  renderMints();
}
function toggleMobileFilters(){
  var c = document.getElementById('map-controls');
  var ov = document.getElementById('map-controls-overlay');
  var b = document.getElementById('btn-mobile-filters');
  var isOpen = c.classList.toggle('mobile-open');
  ov.classList.toggle('open', isOpen);
  b.classList.toggle('active', isOpen);
}
function closeMobileFilters(){
  var c = document.getElementById('map-controls');
  var ov = document.getElementById('map-controls-overlay');
  var b = document.getElementById('btn-mobile-filters');
  c.classList.remove('mobile-open');
  ov.classList.remove('open');
  b.classList.remove('active');
}
document.getElementById('map-controls-overlay').addEventListener('touchstart', function(e){
  e.preventDefault();
  closeMobileFilters();
}, {passive:false});