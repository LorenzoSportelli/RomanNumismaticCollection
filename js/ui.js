function isProvMode(){ return currentPeriod==='prov' && PDB.ready; }
function isImpMode(){ return currentPeriod==='imp' && IDB.ready; }
function isRepMode(){ return currentPeriod==='rep' && RDB.ready; }
function modalOpen(){ return document.getElementById('overlay').classList.contains('open'); }
function setPeriod(p){
  currentPeriod=p;
  document.getElementById('r-prov').className='radio-opt'+(p==='prov'?' on':'');
  document.getElementById('r-imp').className='radio-opt'+(p==='imp'?' on':'');
  document.getElementById('r-rep').className='radio-opt'+(p==='rep'?' on':'');
  var isProv = p === 'prov'; var isImp = p === 'imp'; var isRep = p === 'rep';
  document.getElementById('block-prov').style.display=isProv?'':'none';
  document.getElementById('block-imp').style.display=isImp?'':'none';
  document.getElementById('block-rep').style.display=isRep?'':'none';
  document.getElementById('block-prov-chrono').style.display=isProv?'':'none';
  document.getElementById('block-prov-geography').style.display=isProv?'':'none';
  document.getElementById('block-imp-geography').style.display=isImp?'':'none';
  document.getElementById('block-main-geography').style.display=isRep?'':'none';
  if(modalOpen()){
    if(isProv) provEnforce();
    if(isImp) impEnforce();
    if(isRep) repEnforce();
    if(isProv) rebuildReignPicker();
    pkRenderAll();
    previewHighlight();
  }
}
var geoSel = emptyGeo();
var magSel = [];
var reignSel = '';
var DIMS = ['r','m','c'];
function provSelection(){ return { r: [], m: magSel.slice(), c: geoSel.cities.slice() }; }
function tupleOk(t, sel, skip){
  if(skip!=='r' && sel.r.length && sel.r.indexOf(t.r)<0) return false;
  if(skip!=='m' && sel.m.length && sel.m.indexOf(t.m)<0) return false;
  if(skip!=='c' && sel.c.length && sel.c.indexOf(t.c)<0) return false;
  if(t.c){
    if(geoSel.regions.length && t.g && geoSel.regions.indexOf(t.g)<0) return false;
    if(geoSel.subs.length && t.s && geoSel.subs.indexOf(t.s)<0) return false;
  }
  return true;
}
function facet(k, sel){
  var seen={}, out=[];
  for(var i=0;i<PDB.tuples.length;i++){
    var t=PDB.tuples[i];
    if(t[k]==null || seen[t[k]]) continue;
    if(tupleOk(t,sel,k)){ seen[t[k]]=true; out.push(t[k]); }
  }
  return out;
}
function writeDim(k, vals){
  if(k==='r') reignSel=vals[0]||'';
  else if(k==='m') magSel=vals;
  else if(k==='c') geoSel.cities=vals;
}
function provEnforce(){
  if(!isProvMode()){ rebuildReignPicker(); return; }
  var changed=true, guard=0;
  while(changed && guard++<10){
    changed=false;
    var sel=provSelection();
    for(var i=0;i<DIMS.length;i++){
      var k=DIMS[i]; if(!sel[k].length) continue;
      var okSet={}; facet(k,sel).forEach(function(v){ okSet[v]=true; });
      var kept=sel[k].filter(function(v){ return okSet[v]; });
      if(kept.length!==sel[k].length){ writeDim(k,kept); sel=provSelection(); changed=true; }
    }
  }
  rebuildReignPicker();
  updateProvHint();
}
function rebuildReignPicker(){ pkRender('reign'); }
function updateProvHint(){
  if(PDB.error) return;
  if(!isProvMode()){ setProvHint(''); return; }
  var sel=provSelection();
  var any=DIMS.some(function(k){ return sel[k].length; });
  if(!any && !geoSel.regions.length && !geoSel.subs.length){
    setProvHint(PDB.reigns.length+' reigns · '+PDB.mags.length+' magistrates · '+PDB.cities.length+' cities');
    return;
  }
  setProvHint('Compatible: '+facet('m',sel).length+' magistrates · '+facet('c',sel).length+' cities');
}
function provGeoAdd(key, id){
  if (key === 'regions') {
    if (geoSel.regions.indexOf(id) < 0) geoSel.regions.push(id);
  } else if (key === 'subs') {
    if (geoSel.subs.indexOf(id) < 0) geoSel.subs.push(id);
    var s = subById(id);
    if (s && s.region && geoSel.regions.indexOf(s.region) < 0) geoSel.regions.push(s.region);
  } else if (key === 'cities') {
    if (geoSel.cities.indexOf(id) < 0) geoSel.cities.push(id);
    var c = cityById(id);
    if (c) {
      if (c.sub && geoSel.subs.indexOf(c.sub) < 0) geoSel.subs.push(c.sub);
      var sOfCity = c.sub ? subById(c.sub) : null;
      var reg = (sOfCity && sOfCity.region) || c.region;
      if (reg && geoSel.regions.indexOf(reg) < 0) geoSel.regions.push(reg);
    }
  } else if (key === 'provs') {
    if (geoSel.provs.indexOf(id) < 0) geoSel.provs.push(id);
    geoSel.provExclusions = geoSel.provExclusions.filter(function(p){ return p !== id; });
  }
}
function provGeoRemove(key, id){
  if (key === 'regions') {
    geoSel.regions = geoSel.regions.filter(function(x){ return x !== id; });
  } else if (key === 'subs') {
    geoSel.subs = geoSel.subs.filter(function(x){ return x !== id; });
  } else if (key === 'cities') {
    geoSel.cities = geoSel.cities.filter(function(x){ return x !== id; });
  } else if (key === 'provs') {
    var derived = resolveProvinces({ provs: [], regions: geoSel.regions, subs: geoSel.subs, cities: geoSel.cities }, '').indexOf(id) >= 0;
    geoSel.provs = geoSel.provs.filter(function(p){ return p !== id; });
    if (derived) { if (geoSel.provExclusions.indexOf(id) < 0) geoSel.provExclusions.push(id); }
    else { geoSel.provExclusions = geoSel.provExclusions.filter(function(p){ return p !== id; }); }
  }
}
function provSyncProvinces(){
  var derived = resolveProvinces({ provs: [], regions: geoSel.regions, subs: geoSel.subs, cities: geoSel.cities }, '');
  derived.forEach(function(p){
    if (geoSel.provs.indexOf(p) < 0) geoSel.provs.push(p);
    geoSel.provExclusions = geoSel.provExclusions.filter(function(x){ return x !== p; });
  });
}
function provSyncHierarchy(){
  geoSel.cities.forEach(function(cid){
    var c = cityById(cid); if(!c) return;
    if (c.sub && geoSel.subs.indexOf(c.sub) < 0) geoSel.subs.push(c.sub);
    var s = c.sub ? subById(c.sub) : null;
    var reg = (s && s.region) || c.region;
    if (reg && geoSel.regions.indexOf(reg) < 0) geoSel.regions.push(reg);
  });
  geoSel.subs.forEach(function(sid){
    var s = subById(sid); if(!s) return;
    if (s.region && geoSel.regions.indexOf(s.region) < 0) geoSel.regions.push(s.region);
  });
}
function clearProvGeography(){
  geoSel.provs = [];
  geoSel.provExclusions = [];
  geoSel.regions = [];
  geoSel.subs = [];
  geoSel.cities = [];
  document.querySelectorAll('#pk-provs .pk-in, #pk-regions .pk-in, #pk-subs .pk-in, #pk-cities .pk-in')
    .forEach(function(i){ i.value = ''; });
  pkRenderAll();
  previewHighlight();
}
var impGeoSel = { regions: [], subs: [], subsubs: [], cities: [] };
var impAuthSel = [];
var impIssuerSel = [];
var IDIMS = ['a','i'];
function impSelection(){ return { a: impAuthSel.slice(), i: impIssuerSel.slice() }; }
function impTupleOk(t, sel, skip){
  for(var j=0;j<IDIMS.length;j++){
    var k=IDIMS[j]; if(k===skip) continue;
    if(sel[k].length && sel[k].indexOf(t[k])<0) return false;
  }
  return true;
}
function impFacet(k, sel){
  var seen={}, out=[];
  for(var j=0;j<IDB.tuples.length;j++){
    var t=IDB.tuples[j];
    if(t[k]==null || seen[t[k]]) continue;
    if(impTupleOk(t,sel,k)){ seen[t[k]]=true; out.push(t[k]); }
  }
  return out;
}
function impEnforce(){
  var changed=true, guard=0;
  while(changed && guard++<10){
    changed=false;
    var sel=impSelection();
    for(var j=0;j<IDIMS.length;j++){
      var k=IDIMS[j]; if(!sel[k].length) continue;
      var okSet={}; impFacet(k,sel).forEach(function(v){ okSet[v]=true; });
      var kept=sel[k].filter(function(v){ return okSet[v]; });
      if(kept.length!==sel[k].length){
        if(k==='a') impAuthSel=kept;
        else if(k==='i') impIssuerSel=kept;
        sel=impSelection(); changed=true;
      }
    }
  }
}
function impRegionOfSub(s){ for(var r in IDB.tree){ if(IDB.tree[r][s]) return r; } return ''; }
function impCityPath(c){
  var s=IDB.cityToSub[c]||'', ss=IDB.cityToSubsub[c]||'';
  return {r:s?impRegionOfSub(s):'', s:s, ss:ss};
}
function impCityAllowed(){
  var a={r:{},s:{},ss:{}};
  impGeoSel.cities.forEach(function(c){
    var p=impCityPath(c);
    if(p.r) a.r[p.r]=1;
    if(p.s) a.s[p.s]=1;
    if(p.ss) a.ss[p.ss]=1;
  });
  return a;
}
function impGeoAdd(key, id) {
  if (key === 'regions') { if (impGeoSel.regions.indexOf(id) < 0) impGeoSel.regions.push(id); }
  else if (key === 'subs') {
    if (impGeoSel.subs.indexOf(id) < 0) impGeoSel.subs.push(id);
    var rr = impRegionOfSub(id);
    if (rr && impGeoSel.regions.indexOf(rr) < 0) impGeoSel.regions.push(rr);
  } else if (key === 'subsubs') {
    if (impGeoSel.subsubs.indexOf(id) < 0) impGeoSel.subsubs.push(id);
    for (var r in IDB.tree) {
      for (var s in IDB.tree[r]) {
        if (IDB.tree[r][s].indexOf(id) >= 0) {
          if (impGeoSel.subs.indexOf(s) < 0) impGeoSel.subs.push(s);
          if (impGeoSel.regions.indexOf(r) < 0) impGeoSel.regions.push(r);
          return;
        }
      }
    }
  } else if (key === 'cities') {
    if (impGeoSel.cities.indexOf(id) < 0) impGeoSel.cities.push(id);
    var p = impCityPath(id);
    if (p.ss && impGeoSel.subsubs.indexOf(p.ss) < 0) impGeoSel.subsubs.push(p.ss);
    if (p.s && impGeoSel.subs.indexOf(p.s) < 0) impGeoSel.subs.push(p.s);
    if (p.r && impGeoSel.regions.indexOf(p.r) < 0) impGeoSel.regions.push(p.r);
  }
}
function impGeoRemove(key, id) {
  var g = impGeoSel;
  if (key === 'cities') { g.cities = g.cities.filter(function(x){ return x !== id; }); }
  else if (key === 'subsubs') {
    g.subsubs = g.subsubs.filter(function(x){ return x !== id; });
    g.cities = g.cities.filter(function(c){ return IDB.cityToSubsub[c] !== id; });
  } else if (key === 'subs') {
    var ssOfSub = [];
    for (var r in IDB.tree) if (IDB.tree[r][id]) ssOfSub = ssOfSub.concat(IDB.tree[r][id]);
    g.subs = g.subs.filter(function(x){ return x !== id; });
    g.subsubs = g.subsubs.filter(function(ss){ return ssOfSub.indexOf(ss) < 0; });
    g.cities = g.cities.filter(function(c){ return IDB.cityToSub[c] !== id; });
  } else if (key === 'regions') {
    var subsIn = Object.keys(IDB.tree[id] || {}), ssIn = [];
    subsIn.forEach(function(s){ ssIn = ssIn.concat(IDB.tree[id][s]); });
    g.regions = g.regions.filter(function(x){ return x !== id; });
    g.subs = g.subs.filter(function(s){ return subsIn.indexOf(s) < 0; });
    g.subsubs = g.subsubs.filter(function(ss){ return ssIn.indexOf(ss) < 0; });
    g.cities = g.cities.filter(function(c){ return subsIn.indexOf(IDB.cityToSub[c]) < 0; });
  }
}
var repGeoSel = { regions: [], subs: [], subsubs: [], cities: [] };
var repIssuerSel = [];
var RDIMS = ['i'];
function repSelection(){ return { i: repIssuerSel.slice() }; }
function repTupleOk(t, sel, skip){
  for(var j=0;j<RDIMS.length;j++){
    var k=RDIMS[j]; if(k===skip) continue;
    if(sel[k].length && sel[k].indexOf(t[k])<0) return false;
  }
  return true;
}
function repFacet(k, sel){
  var seen={}, out=[];
  for(var j=0;j<RDB.tuples.length;j++){
    var t=RDB.tuples[j];
    if(t[k]==null || seen[t[k]]) continue;
    if(repTupleOk(t,sel,k)){ seen[t[k]]=true; out.push(t[k]); }
  }
  return out;
}
function repEnforce(){}
function repRegionOfSub(s){ for(var r in RDB.tree){ if(RDB.tree[r][s]) return r; } return ''; }
function repCityPath(c){
  var s=RDB.cityToSub[c]||'', ss=RDB.cityToSubsub[c]||'';
  return {r:s?repRegionOfSub(s):'', s:s, ss:ss};
}
function repCityAllowed(){
  var a={r:{},s:{},ss:{}};
  repGeoSel.cities.forEach(function(c){
    var p=repCityPath(c);
    if(p.r) a.r[p.r]=1;
    if(p.s) a.s[p.s]=1;
    if(p.ss) a.ss[p.ss]=1;
  });
  return a;
}
function repGeoAdd(key, id) {
  if (key === 'regions') { if (repGeoSel.regions.indexOf(id) < 0) repGeoSel.regions.push(id); }
  else if (key === 'subs') {
    if (repGeoSel.subs.indexOf(id) < 0) repGeoSel.subs.push(id);
    var rr = repRegionOfSub(id);
    if (rr && repGeoSel.regions.indexOf(rr) < 0) repGeoSel.regions.push(rr);
  } else if (key === 'subsubs') {
    if (repGeoSel.subsubs.indexOf(id) < 0) repGeoSel.subsubs.push(id);
    for (var r in RDB.tree) {
      for (var s in RDB.tree[r]) {
        if (RDB.tree[r][s].indexOf(id) >= 0) {
          if (repGeoSel.subs.indexOf(s) < 0) repGeoSel.subs.push(s);
          if (repGeoSel.regions.indexOf(r) < 0) repGeoSel.regions.push(r);
          return;
        }
      }
    }
  } else if (key === 'cities') {
    if (repGeoSel.cities.indexOf(id) < 0) repGeoSel.cities.push(id);
    var p = repCityPath(id);
    if (p.ss && repGeoSel.subsubs.indexOf(p.ss) < 0) repGeoSel.subsubs.push(p.ss);
    if (p.s && repGeoSel.subs.indexOf(p.s) < 0) repGeoSel.subs.push(p.s);
    if (p.r && repGeoSel.regions.indexOf(p.r) < 0) repGeoSel.regions.push(p.r);
  }
}
function repGeoRemove(key, id) {
  var g = repGeoSel;
  if (key === 'cities') { g.cities = g.cities.filter(function(x){ return x !== id; }); }
  else if (key === 'subsubs') {
    g.subsubs = g.subsubs.filter(function(x){ return x !== id; });
    g.cities = g.cities.filter(function(c){ return RDB.cityToSubsub[c] !== id; });
  } else if (key === 'subs') {
    var ssOfSub = [];
    for (var r in RDB.tree) if (RDB.tree[r][id]) ssOfSub = ssOfSub.concat(RDB.tree[r][id]);
    g.subs = g.subs.filter(function(x){ return x !== id; });
    g.subsubs = g.subsubs.filter(function(ss){ return ssOfSub.indexOf(ss) < 0; });
    g.cities = g.cities.filter(function(c){ return RDB.cityToSub[c] !== id; });
  } else if (key === 'regions') {
    var subsIn = Object.keys(RDB.tree[id] || {}), ssIn = [];
    subsIn.forEach(function(s){ ssIn = ssIn.concat(RDB.tree[id][s]); });
    g.regions = g.regions.filter(function(x){ return x !== id; });
    g.subs = g.subs.filter(function(s){ return subsIn.indexOf(s) < 0; });
    g.subsubs = g.subsubs.filter(function(ss){ return ssIn.indexOf(ss) < 0; });
    g.cities = g.cities.filter(function(c){ return subsIn.indexOf(RDB.cityToSub[c]) < 0; });
  }
}
function byLabel(a,b){ return a.label.localeCompare(b.label); }
var IMP_KEY_MAP = {impregions:'regions', impsubs:'subs', impsubsubs:'subsubs', impcities:'cities'};
var REP_KEY_MAP = {repregions:'regions', repsubs:'subs', repsubsubs:'subsubs', repcities:'cities'};
var PICKERS = {
  reign:{ el:'pk-reign', single:true,
    items:function(){
      if(!PDB.ready) return [];
      return PDB.reigns.slice().map(function(r){ return {id:r,label:reignLabel(r),small:isClientKing(r)?'client king':''}; }).sort(byLabel);
    },
    get:function(){ return reignSel ? [reignSel] : []; },
    set:function(v){ reignSel = v.length ? v[v.length-1] : ''; },
    label:function(id){ return reignLabel(id); } },
  provs:{ el:'pk-provs',
    items:function(){ return PROVS.map(function(p){ return {id:p,label:p}; }); },
    get:function(){ return resolveProvinces(geoSel, ''); },
    set:function(v){ geoSel.provs=v; },
    label:function(id){ return id; } },
  regions:{ el:'pk-regions',
    items:function(){
      var list = isProvMode() ? facet('g',provSelection()) : REGIONS;
      return list.map(function(r){ return {id:r,label:r}; }).sort(byLabel);
    },
    get:function(){ return geoSel.regions; }, set:function(v){ geoSel.regions=v; },
    label:function(id){ return id; } },
  subs:{ el:'pk-subs',
    items:function(){
      var list = isProvMode() ? facet('s',provSelection()).map(subById) : SUBREGIONS;
      return list.filter(Boolean).map(function(s){ return {id:s.id,label:s.name,small:s.region}; }).sort(byLabel);
    },
    get:function(){ return geoSel.subs; }, set:function(v){ geoSel.subs=v; },
    label:function(id){ return subLabel(subById(id))||id; } },
  cities:{ el:'pk-cities',
    items:function(){
      var list = isProvMode() ? facet('c',provSelection()).map(cityById) : CITIES;
      return list.filter(Boolean).map(function(c){
        var s=c.sub?subById(c.sub):null;
        var reg = (s && s.region) || c.region || '';
        return {id:c.id,label:c.name,small:reg};
      }).sort(byLabel);
    },
    get:function(){ return geoSel.cities; }, set:function(v){ geoSel.cities=v; },
    label:function(id){ return cityLabel(cityById(id))||id; } },
  mag:{ el:'pk-mag',
    items:function(){
      if(!PDB.ready) return [];
      var list = isProvMode() ? facet('m',provSelection()) : PDB.mags.map(function(m){ return m.id; });
      return list.map(function(id){ var m=PDB.magById[id]; return {id:id,label:m.name,small:m.title}; }).sort(byLabel);
    },
    get:function(){ return magSel; }, set:function(v){ magSel=v; },
    label:function(id){ return magLabel(PDB.magById[id])||id; } },
  impregions: { el:'pk-imp-regions',
    items:function(){
      var ok=impCityAllowed().r, has=impGeoSel.cities.length;
      return Object.keys(IDB.tree).filter(function(r){ return !has||ok[r]; }).sort().map(function(r){ return {id:r,label:r}; });
    },
    get:function(){ return impGeoSel.regions; }, set:function(v){ impGeoSel.regions=v; },
    label:function(id){ return id; } },
  impsubs: { el:'pk-imp-subs',
    items:function(){
      var ok=impCityAllowed().s, has=impGeoSel.cities.length, seen={}, list=[];
      var regs=impGeoSel.regions.length?impGeoSel.regions:Object.keys(IDB.tree);
      regs.forEach(function(r){
        Object.keys(IDB.tree[r]||{}).forEach(function(s){
          if(seen[s]||(has&&!ok[s])) return;
          seen[s]=1; list.push({id:s,label:s,small:r});
        });
      });
      return list.sort(byLabel);
    },
    get:function(){ return impGeoSel.subs; }, set:function(v){ impGeoSel.subs=v; },
    label:function(id){ return id; } },
  impsubsubs: { el:'pk-imp-subsubs',
    items:function(){
      var ok=impCityAllowed().ss, has=impGeoSel.cities.length, seen={}, list=[];
      for(var r in IDB.tree){
        for(var s in IDB.tree[r]){
          if(impGeoSel.subs.length && impGeoSel.subs.indexOf(s)<0) continue;
          IDB.tree[r][s].forEach(function(ss){
            if(seen[ss]||(has&&!ok[ss])) return;
            seen[ss]=1; list.push({id:ss,label:ss,small:s});
          });
        }
      }
      return list.sort(byLabel);
    },
    get:function(){ return impGeoSel.subsubs; }, set:function(v){ impGeoSel.subsubs=v; },
    label:function(id){ return id; } },
  impcities: { el:'pk-imp-cities',
    items:function(){
      var g=impGeoSel;
      return IDB.cities.filter(function(c){
        var p=impCityPath(c);
        if(g.regions.length && g.regions.indexOf(p.r)<0) return false;
        if(g.subs.length && g.subs.indexOf(p.s)<0) return false;
        if(g.subsubs.length && p.ss && g.subsubs.indexOf(p.ss)<0) return false;
        return true;
      }).map(function(c){ return {id:c,label:c}; }).sort(byLabel);
    },
    get:function(){ return impGeoSel.cities; }, set:function(v){ impGeoSel.cities=v; },
    label:function(id){ return id; } },
  authorities: { el:'pk-authorities',
    items:function(){
      if(!IDB.ready) return [];
      return impFacet('a', impSelection()).map(function(a){ return {id:a, label:a}; }).sort(byLabel);
    },
    get:function(){ return impAuthSel; }, set:function(v){ impAuthSel = v; },
    label:function(id){ return id; } },
  issuers: { el:'pk-issuers',
    items:function(){
      if(!IDB.ready) return [];
      return impFacet('i', impSelection()).map(function(i){ return {id:i, label:i}; }).sort(byLabel);
    },
    get:function(){ return impIssuerSel; }, set:function(v){ impIssuerSel = v; },
    label:function(id){ return id; } },
  repregions: { el:'pk-rep-regions',
    items:function(){
      var ok=repCityAllowed().r, has=repGeoSel.cities.length;
      return Object.keys(RDB.tree).filter(function(r){ return !has||ok[r]; }).sort().map(function(r){ return {id:r,label:r}; });
    },
    get:function(){ return repGeoSel.regions; }, set:function(v){ repGeoSel.regions=v; }, label:function(id){ return id; } },
  repsubs: { el:'pk-rep-subs',
    items:function(){
      var ok=repCityAllowed().s, has=repGeoSel.cities.length, seen={}, list=[];
      var regs=repGeoSel.regions.length?repGeoSel.regions:Object.keys(RDB.tree);
      regs.forEach(function(r){
        Object.keys(RDB.tree[r]||{}).forEach(function(s){
          if(seen[s]||(has&&!ok[s])) return;
          seen[s]=1; list.push({id:s,label:s,small:r});
        });
      });
      return list.sort(byLabel);
    },
    get:function(){ return repGeoSel.subs; }, set:function(v){ repGeoSel.subs=v; }, label:function(id){ return id; } },
  repsubsubs: { el:'pk-rep-subsubs',
    items:function(){
      var ok=repCityAllowed().ss, has=repGeoSel.cities.length, seen={}, list=[];
      for(var r in RDB.tree){
        for(var s in RDB.tree[r]){
          if(repGeoSel.subs.length && repGeoSel.subs.indexOf(s)<0) continue;
          RDB.tree[r][s].forEach(function(ss){
            if(seen[ss]||(has&&!ok[ss])) return;
            seen[ss]=1; list.push({id:ss,label:ss,small:s});
          });
        }
      }
      return list.sort(byLabel);
    },
    get:function(){ return repGeoSel.subsubs; }, set:function(v){ repGeoSel.subsubs=v; }, label:function(id){ return id; } },
  repcities: { el:'pk-rep-cities',
    items:function(){
      var g=repGeoSel;
      return RDB.cities.filter(function(c){
        var p=repCityPath(c);
        if(g.regions.length && g.regions.indexOf(p.r)<0) return false;
        if(g.subs.length && g.subs.indexOf(p.s)<0) return false;
        if(g.subsubs.length && p.ss && g.subsubs.indexOf(p.ss)<0) return false;
        return true;
      }).map(function(c){ return {id:c,label:c}; }).sort(byLabel);
    },
    get:function(){ return repGeoSel.cities; }, set:function(v){ repGeoSel.cities=v; }, label:function(id){ return id; } },
  repissuers: { el:'pk-rep-issuers',
    items:function(){
      if(!RDB.ready) return [];
      return RDB.issuers.map(function(i){ return {id:i, label:i}; }).sort(byLabel);
    },
    get:function(){ return repIssuerSel; }, set:function(v){ repIssuerSel = v; }, label:function(id){ return id; } }
};
function pkRender(key){
  var P=PICKERS[key], root=document.getElementById(P.el); if(!root) return;
  var chips=root.querySelector('.pk-chips'), list=root.querySelector('.pk-list'), inp=root.querySelector('.pk-in');
  var sel=P.get();
  chips.innerHTML=sel.map(function(id){
    return '<span class="pk-chip"><span title="'+esc(P.label(id))+'">'+esc(P.label(id))+'</span><b data-id="'+esc(id)+'" role="button" aria-label="Remove">&#215;</b></span>';
  }).join('');
  var q=norm(inp.value);
  var allItems = P.items();
  var items=allItems.filter(function(it){ return sel.indexOf(it.id)<0 && (!q || norm(it.label+' '+(it.small||'')).indexOf(q)>=0); });
  if(!items.length){ list.innerHTML='<div class="pk-none">'+(allItems.length?'No match':'No options available')+'</div>'; return; }
  list.innerHTML=items.slice(0,300).map(function(it){
    return '<div class="pk-item" data-id="'+esc(it.id)+'">'+esc(it.label)+(it.small?'<small>'+esc(it.small)+'</small>':'')+'</div>';
  }).join('')+(items.length>300?'<div class="pk-none">…'+(items.length-300)+' more — refine the search</div>':'');
}
function pkRenderAll(){ Object.keys(PICKERS).forEach(pkRender); updateGeoHint(); }
function pkAdd(key,id){
  if (IMP_KEY_MAP[key]) { impGeoAdd(IMP_KEY_MAP[key], id); pkAfterChange(key); closePickerEl(key); return; }
  if (REP_KEY_MAP[key]) { repGeoAdd(REP_KEY_MAP[key], id); pkAfterChange(key); closePickerEl(key); return; }
  var P = PICKERS[key];
  if(P && P.single){ P.set([id]); pkAfterChange(key); closePickerEl(key); return; }
  if (key === 'provs') { provGeoAdd('provs', id); }
  else if (key === 'regions') { provGeoAdd('regions', id); }
  else if (key === 'subs') { provGeoAdd('subs', id); }
  else if (key === 'cities') { provGeoAdd('cities', id); }
  else {
    var v = P.get().slice();
    if (v.indexOf(id) < 0) v.push(id);
    P.set(v);
  }
  pkAfterChange(key);
  closePickerEl(key);
}
function closePickerEl(key){
  var P = PICKERS[key];
  if(P && P.el){
    var root = document.getElementById(P.el);
    if(root) root.classList.remove('open');
  }
}
function pkRemove(key,id){
  if (IMP_KEY_MAP[key]) { impGeoRemove(IMP_KEY_MAP[key], id); pkAfterChange(key); return; }
  if (REP_KEY_MAP[key]) { repGeoRemove(REP_KEY_MAP[key], id); pkAfterChange(key); return; }
  var P = PICKERS[key];
  if(P && P.single){ P.set([]); pkAfterChange(key); return; }
  if (key === 'provs') { provGeoRemove('provs', id); }
  else if (key === 'regions') { provGeoRemove('regions', id); }
  else if (key === 'subs') { provGeoRemove('subs', id); }
  else if (key === 'cities') { provGeoRemove('cities', id); }
  else { P.set(P.get().filter(function(x){ return x !== id; })); }
  pkAfterChange(key);
}
function pkAfterChange(key){
  var root=document.getElementById(PICKERS[key].el); if(root) root.querySelector('.pk-in').value='';
  if(currentPeriod==='imp'){ impEnforce(); }
  else if(currentPeriod==='rep'){ repEnforce(); }
  else {
    provSyncHierarchy();
    provEnforce();
    provSyncProvinces();
  }
  pkRenderAll(); previewHighlight();
}
function pkCloseAll(){ document.querySelectorAll('.picker.open').forEach(function(p){ p.classList.remove('open'); }); }
function updateGeoHint(){
  var hint = document.getElementById('geo-hint');
  if(currentPeriod !== 'prov'){ hint.textContent = ''; return; }
  var provs = resolveProvinces(geoSel, '');
  hint.textContent = provs.length ? 'Map highlight: '+provs.join(' · ') : '';
}
var _pkDebounce = {};
(function initPickers(){
  Object.keys(PICKERS).forEach(function(key){
    var P=PICKERS[key], root=document.getElementById(P.el); if(!root) return;
    var inp=root.querySelector('.pk-in');
    var listEl = root.querySelector('.pk-list');
    var touchStartX = 0, touchStartY = 0, touchMoved = false;

    inp.addEventListener('focus',function(){
      pkCloseAll();
      root.classList.add('open');
      pkRender(key);
      if (isMobile()) {
        setTimeout(function(){ inp.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 250);
      }
    });
    inp.addEventListener('input',function(){
      root.classList.add('open');
      clearTimeout(_pkDebounce[key]);
      _pkDebounce[key] = setTimeout(function(){ pkRender(key); }, 120);
    });
    inp.addEventListener('keydown',function(e){
      if(e.key==='Enter'){ e.preventDefault(); var first=root.querySelector('.pk-item'); if(first) pkAdd(key,first.getAttribute('data-id')); }
      if(e.key==='Escape') root.classList.remove('open');
      if(e.key==='Backspace' && !inp.value){ var v=P.get(); if(v.length) pkRemove(key,v[v.length-1]); }
    });

    listEl.addEventListener('touchstart', function(e){
      var t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchMoved = false;
    }, {passive:true});
    listEl.addEventListener('touchmove', function(e){
      var t = e.touches[0];
      if (Math.abs(t.clientY - touchStartY) > 8 || Math.abs(t.clientX - touchStartX) > 8) {
        touchMoved = true;
      }
    }, {passive:true});
    listEl.addEventListener('touchend', function(e){
      if (touchMoved) return;
      var target = document.elementFromPoint(touchStartX, touchStartY);
      var it = target && target.closest ? target.closest('.pk-item') : null;
      if (!it) return;
      e.preventDefault();
      e.stopPropagation();
      pkAdd(key, it.getAttribute('data-id'));
    }, {passive:false});

    listEl.addEventListener('mousedown', function(e){
      if (L.Browser && L.Browser.mobile) return;
      var it = e.target.closest('.pk-item');
      if (!it) return;
      e.preventDefault();
      e.stopPropagation();
      pkAdd(key, it.getAttribute('data-id'));
    });

    root.querySelector('.pk-chips').addEventListener('click',function(e){
      if(e.target.tagName==='B'){
        e.preventDefault();
        e.stopPropagation();
        pkRemove(key,e.target.getAttribute('data-id'));
      }
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.picker')) pkCloseAll();
  });
})();
function $v(id){ return document.getElementById(id).value.trim(); }
function $set(id,v){ document.getElementById(id).value=v==null?'':v; }
var _previewT = null;
function previewHighlight(){
  clearTimeout(_previewT);
  _previewT = setTimeout(_doPreviewHighlight, 80);
}
function _doPreviewHighlight(){
  var provinces = [];
  if (currentPeriod === 'prov') {
    provinces = resolveProvinces(geoSel, '');
  } else if (currentPeriod === 'rep' || currentPeriod === 'imp') {
    var geo = (currentPeriod === 'imp') ? impGeoSel : repGeoSel;
    var map2 = (currentPeriod === 'imp') ? IMP_MAP_TO_PROVS : REP_MAP_TO_PROVS;
    if (geo.cities.length > 0) {
      geo.cities.forEach(function(c){
        var p = provinceOfMint(c);
        if (p && provinces.indexOf(p) < 0) provinces.push(p);
      });
    }
    if (!provinces.length && geo.subsubs.length > 0) {
      geo.subsubs.forEach(function(ss){ (map2[ss]||[]).forEach(function(p){ if(provinces.indexOf(p)<0) provinces.push(p); }); });
    }
    if (!provinces.length && geo.subs.length > 0) {
      geo.subs.forEach(function(s){ (map2[s]||[]).forEach(function(p){ if(provinces.indexOf(p)<0) provinces.push(p); }); });
    }
    if (!provinces.length && geo.regions.length > 0) {
      geo.regions.forEach(function(r){ (map2[r]||[]).forEach(function(p){ if(provinces.indexOf(p)<0) provinces.push(p); }); });
    }
  }
  setHighlight(provinces);
  updateGeoHint();
  var clearBtn = document.querySelector('#block-prov-geography button[onclick="clearProvGeography()"]');
  if (clearBtn) {
    var hasGeo = geoSel.provs.length > 0 || geoSel.regions.length > 0 || geoSel.subs.length > 0 || geoSel.cities.length > 0;
    clearBtn.style.opacity = hasGeo ? '1' : '0.3';
    clearBtn.style.pointerEvents = hasGeo ? 'auto' : 'none';
  }
}
function resetForm(){
  ['f-ref','f-prov-imp','f-prov-auth','f-rep-auth','f-denom','f-date','f-desc','f-notes'].forEach(function(id){ $set(id,''); });
  $set('f-metal','');
  geoSel=emptyGeo(); magSel=[]; reignSel='';
  impGeoSel = { regions: [], subs: [], subsubs: [], cities: [] };
  impAuthSel = []; impIssuerSel = [];
  repGeoSel = { regions: [], subs: [], subsubs: [], cities: [] };
  repIssuerSel = [];
  document.querySelectorAll('.pk-in').forEach(function(i){ i.value=''; });
  currentPeriod = 'prov';
}
function openModal(id){
  editId = id==null ? null : id;
  resetForm();
  document.getElementById('modal-title').textContent = editId==null ? 'ADD COIN' : 'EDIT COIN';
  if(editId!=null){
    var c=coins.find(function(x){ return x.id===editId; });
    if(c){
      $set('f-ref',c.ref);
      $set('f-prov-imp',c.provImp||c.imp); $set('f-prov-auth',c.provAuth||c.auth);
      $set('f-rep-auth', c.auth);
      $set('f-metal',c.metal); $set('f-denom',c.denom); $set('f-date',c.date); $set('f-desc',c.desc); $set('f-notes',c.notes);
      currentPeriod=c.period||'rep';
      if(currentPeriod === 'prov'){
        geoSel=normGeo(c.geo);
        magSel=Array.isArray(c.mags)?c.mags.slice():[];
        reignSel = c.reign || '';
        rebuildReignPicker();
      } else if(currentPeriod === 'imp'){
        impGeoSel = {
          regions: c.impRegions || [], subs: c.impSubs || [], subsubs: c.impSubsubs || [],
          cities: c.mint ? c.mint.split(';').map(function(s){return s.trim();}).filter(Boolean) : []
        };
        impAuthSel = c.imp ? [c.imp] : [];
        impIssuerSel = c.impAuth ? [c.impAuth] : [];
      } else if(currentPeriod === 'rep'){
        repGeoSel = {
          regions: c.repRegions || [], subs: c.repSubs || [], subsubs: c.repSubsubs || [],
          cities: c.mint ? c.mint.split(';').map(function(s){return s.trim();}).filter(Boolean) : []
        };
        repIssuerSel = c.mag ? c.mag.split(';').map(function(s){return s.trim();}).filter(Boolean) : [];
      }
    }
  }
  document.getElementById('overlay').classList.add('open');
  setPeriod(currentPeriod);
  document.getElementById('modal-body').scrollTop=0;
  if (isMobile()) closePanel();
}
function closeModal(){
  document.getElementById('overlay').classList.remove('open');
  pkCloseAll(); editId=null; clearHighlight();
}
function saveCoin(){
  var isProv = currentPeriod === 'prov';
  var isImp = currentPeriod === 'imp';
  var isRep = currentPeriod === 'rep';
  if(isProv) provEnforce();
  if(isImp) impEnforce();
  if(isRep) repEnforce();
  if(isProv && !geoSel.regions.length && !geoSel.subs.length && !geoSel.cities.length && !geoSel.provs.length){
    showPopup('MISSING GEOGRAPHY', 'Please select at least one region, subregion, city or province.');
    return;
  }
  if(isImp && impGeoSel.regions.length === 0 && impGeoSel.subs.length === 0 && impGeoSel.subsubs.length === 0 && impGeoSel.cities.length === 0){
    showPopup('MISSING GEOGRAPHY', 'Please select at least one geographical area.');
    return;
  }
  if(isRep && repGeoSel.regions.length === 0 && repGeoSel.subs.length === 0 && repGeoSel.subsubs.length === 0 && repGeoSel.cities.length === 0){
    showPopup('MISSING GEOGRAPHY', 'Please select at least one geographical area.');
    return;
  }
  var provMint = '';
  if (isProv && geoSel.cities.length) {
    var cityObj = cityById(geoSel.cities[0]);
    if (cityObj) provMint = cityObj.name;
  }
  var c={
    id: editId!=null ? editId : nextId++,
    period: currentPeriod,
    ref:$v('f-ref'),
    prov: (isProv ? '' : (isImp ? impGeoSel.regions[0] || '' : repGeoSel.regions[0] || '')),
    mint: isProv ? provMint : (isImp ? impGeoSel.cities.join('; ') : repGeoSel.cities.join('; ')),
    mag: isRep ? repIssuerSel.join('; ') : '',
    auth: isRep ? $v('f-rep-auth') : '',
    imp: isImp ? (impAuthSel[0] || '') : (isProv ? $v('f-prov-imp') : ''),
    impAuth: isImp ? (impIssuerSel[0] || '') : '',
    provImp: isProv ? $v('f-prov-imp') : '',
    provAuth: isProv ? $v('f-prov-auth') : '',
    reign: isProv ? reignSel : '',
    mags: isProv ? magSel.slice() : [],
    magNames: isProv ? magSel.map(function(id){ return magLabel(PDB.magById[id]); }) : [],
    metal:$v('f-metal'), denom:$v('f-denom'), date:$v('f-date'), desc:$v('f-desc'), notes:$v('f-notes'),
    geo: isProv ? normGeo(geoSel) : emptyGeo(),
    impRegions: isImp ? impGeoSel.regions.slice() : [],
    impSubs: isImp ? impGeoSel.subs.slice() : [],
    impSubsubs: isImp ? impGeoSel.subsubs.slice() : [],
    repRegions: isRep ? repGeoSel.regions.slice() : [],
    repSubs: isRep ? repGeoSel.subs.slice() : [],
    repSubsubs: isRep ? repGeoSel.subsubs.slice() : []
  };
  if(editId!=null){
    var i=coins.findIndex(function(x){ return x.id===editId; });
    if(i>=0){ c.created=coins[i].created; coins[i]=c; }
    else { c.created=Date.now(); coins.push(c); }
  } else {
    c.created=Date.now();
    coins.push(c);
  }
  coins = coins.filter(function(x){ return x.id !== c.id; });
  coins.push(c);
  save(c);
  closeModal();
  renderList();
  updateMap();
  if (typeof renderMints === 'function') renderMints();
}
var _searchT = null;
function onSearchInput(){
  clearTimeout(_searchT);
  _searchT = setTimeout(renderList, 150);
}
function periodName(p){ return p==='rep'?'Republican':p==='imp'?'Imperial':'Provincial'; }
function coinAuthority(c){
  if(c.period==='rep') return c.mag||'';
  if(c.period==='imp') return c.imp||'';
  return c.provImp||c.imp||'';
}
function coinMagNames(c){
  if(c.period === 'rep') return c.mag ? c.mag.split(';').map(function(s){return s.trim();}) : [];
  if(Array.isArray(c.mags)&&c.mags.length&&PDB.ready) return c.mags.map(function(id){ return magLabel(PDB.magById[id])||id; });
  return Array.isArray(c.magNames)?c.magNames:[];
}
function coinGeoNames(c){
  var g=normGeo(c.geo), gn=c.geoNames||{};
  if (c.period === 'imp') {
    var p = provinceOfMint(c.mint);
    var provs = p ? [p] : (c.impSubsubs || []).slice();
    return { provs: provs, regions: c.impRegions || [], subs: [], cities: c.mint ? c.mint.split('; ').map(function(s){return s.trim();}) : [] };
  }
  if (c.period === 'rep') {
    var p = provinceOfMint(c.mint);
    var provs = p ? [p] : (c.repSubsubs || []).slice();
    return { provs: provs, regions: c.repRegions || [], subs: [], cities: c.mint ? c.mint.split('; ').map(function(s){return s.trim();}) : [] };
  }
  return {
    provs:c.period==='prov' ? resolveProvinces(g,'') : g.provs,
    regions:g.regions,
    subs:g.subs.map(function(s){ var o=subById(s); return o?subLabel(o):(gn.subs&&gn.subs[g.subs.indexOf(s)])||s; }),
    cities:g.cities.map(function(x){ var o=cityById(x); return o?cityLabel(o):(gn.cities&&gn.cities[g.cities.indexOf(x)])||x; })
  };
}
function searchText(c){
  var gn=coinGeoNames(c);
  return norm([c.ref,c.prov,c.mint,c.mag,c.auth,c.imp,c.impAuth,c.provImp,c.provAuth,c.reign,c.metal,c.denom,c.date,c.desc,c.notes,
    periodName(c.period), coinMagNames(c).join(' '), gn.provs.join(' '), gn.regions.join(' '), gn.subs.join(' '), gn.cities.join(' ')].join(' | '));
}
var _clistTouchStartY = 0, _clistTouchMoved = false;
function initClistTouch(){
  var el = document.getElementById('clist');
  el.addEventListener('touchstart', function(e){
    _clistTouchStartY = e.touches[0].clientY;
    _clistTouchMoved = false;
  }, {passive:true});
  el.addEventListener('touchmove', function(e){
    if(Math.abs(e.touches[0].clientY - _clistTouchStartY) > 8) _clistTouchMoved = true;
  }, {passive:true});
}
function crowClick(id){
  if(_clistTouchMoved) return;
  openDetail(id);
}
var selectMode = false;
var selectedCoins = [];
function toggleSelectMode(){
  selectMode = !selectMode;
  selectedCoins = [];
  document.getElementById('btn-select-mode').classList.toggle('active', selectMode);
  document.getElementById('btn-select-mode').textContent = selectMode ? 'CANCEL' : 'SELECT';
  if(!selectMode) {
    document.getElementById('btn-generate-labels').style.display = 'none';
  }
  renderList();
}
function toggleCoinSelection(id){
  var idx = selectedCoins.indexOf(id);
  if(idx >= 0) selectedCoins.splice(idx, 1);
  else selectedCoins.push(id);
  document.getElementById('btn-generate-labels').style.display = selectedCoins.length > 0 ? 'block' : 'none';
  document.getElementById('btn-generate-labels').textContent = 'LABELS (' + selectedCoins.length + ')';
  renderList();
}
function renderList(){
  var q=norm(document.getElementById('srch').value);
  var list=coins.filter(function(c){
    if(filterMode!=='all' && c.period!==filterMode) return false;
    return !q || searchText(c).indexOf(q)>=0;
  }).slice().sort(function(a,b){ return (b.created||0)-(a.created||0) || b.id-a.id; });
  var el=document.getElementById('clist');
  if(!list.length){
    el.innerHTML='<div class="empty-msg">'+(coins.length?'No coins match.':'No coins yet — add the first one.')+'</div>';
  }
  else el.innerHTML=list.map(function(c){
    var tags = '';
    var gn = coinGeoNames(c);
    if(visibleTags.indexOf('province')>=0){
      var provinces = c.period === 'prov' ? gn.provs : (c.period === 'imp' ? gn.provs : (c.period === 'rep' ? gn.provs : (c.prov ? [c.prov] : [])));
      provinces.forEach(function(p){ tags += '<span class="ctag ct-prov-name">'+esc(p)+'</span>'; });
    }
    if(visibleTags.indexOf('region')>=0 && (c.period === 'prov' || c.period === 'imp' || c.period === 'rep')){
      gn.regions.forEach(function(r){ tags += '<span class="ctag ct-region">'+esc(r)+'</span>'; });
    }
    if(visibleTags.indexOf('city')>=0 && (c.period === 'prov' || c.period === 'imp' || c.period === 'rep')){
      gn.cities.forEach(function(city){ tags += '<span class="ctag ct-city">'+esc(city)+'</span>'; });
    }
    if(visibleTags.indexOf('authority')>=0){
      var authority = coinAuthority(c);
      if(authority){ tags += '<span class="ctag ct-authority">'+esc(authority)+'</span>'; }
    }
    if(visibleTags.indexOf('magistrate')>=0){
      var magistrates = [];
      if(c.period === 'prov'){ magistrates = coinMagNames(c); }
      else if(c.period === 'rep' && c.mag){ magistrates = [c.mag]; }
      else if(c.period === 'imp' && c.impAuth){ magistrates = [c.impAuth]; }
      magistrates.forEach(function(m){ if(m){ tags += '<span class="ctag ct-magistrate">'+esc(m)+'</span>'; } });
    }
    if(visibleTags.indexOf('metal')>=0 && c.metal){ tags += '<span class="ctag ct-mat">'+esc(c.metal)+'</span>'; }
    var title=c.ref||coinAuthority(c)||c.denom||'—';
    var sub=[coinAuthority(c), c.denom, c.date, c.mint].filter(Boolean).join(' · ');
    var selHtml = '';
    if(selectMode){
       var isSel = selectedCoins.indexOf(c.id) >= 0;
       selHtml = '<div class="crow-select"><input type="checkbox" '+(isSel?'checked':'')+' onclick="event.stopPropagation();toggleCoinSelection('+c.id+')"></div>';
    }
    var actHtml = selectMode ? '' : '<div class="crow-actions">'+
      '<button class="ca" type="button" aria-label="Edit coin" title="Edit" onpointerdown="event.stopPropagation()" onclick="event.stopPropagation();openModal('+c.id+')">&#9998;</button>'+
      '<button class="ca del" type="button" aria-label="Delete coin" title="Delete" onpointerdown="event.stopPropagation()" onclick="event.stopPropagation();askDelete('+c.id+')">&#215;</button></div>';
    return '<div class="crow" onclick="'+(selectMode ? 'toggleCoinSelection('+c.id+')' : 'crowClick('+c.id+')')+'">'+
      selHtml + actHtml +
      '<div class="crow-ref">'+esc(title)+'</div>'+
      '<div class="crow-desc">'+esc(sub||c.desc||'')+'</div>'+
      '<div class="crow-meta">'+tags+'</div></div>';
  }).join('');
  document.getElementById('hc').textContent=coins.length;
  document.getElementById('fcount').textContent=list.length;
}
function drow(label,val){ return val ? '<div class="drow"><label>'+label+'</label><div>'+esc(val)+'</div></div>' : ''; }
function openDetail(id){
  var c=coins.find(function(x){ return x.id===id; }); if(!c) return;
  detailId=id;
  document.getElementById('detail-title').textContent=(c.ref||periodName(c.period)).toUpperCase();
  var gn=coinGeoNames(c);
  var h='<div class="dgrid">'+drow('PERIOD',periodName(c.period))+drow('REFERENCE',c.ref)+(c.period==='rep' ? drow('PROVINCE / REGION',c.prov)+drow('CITY / MINT',c.mint) : '')+'</div>';
  if(c.period==='prov'){
    h+='<div class="dsep"></div><div class="dgrid">'+drow('REIGN',c.reign)+drow('MAGISTRATE',coinMagNames(c).join('\n'))+drow('EMPEROR / AUTHORITY',c.provImp||c.imp)+drow('ISSUED BY',c.provAuth)+'</div>';
  } else if(c.period==='imp'){
    h+='<div class="dsep"></div><div class="dgrid">'+drow('AUTHORITY',c.imp)+drow('ISSUER',c.impAuth)+'</div>';
  } else if(c.period==='rep'){
    h+='<div class="dsep"></div><div class="dgrid">'+drow('MAGISTRATE / ISSUER',c.mag)+drow('ISSUED BY',c.auth)+'</div>';
  }
  var geoAny=(c.period==='prov' || c.period==='rep') && (gn.provs.length||gn.regions.length||gn.subs.length||gn.cities.length);
  var geoAnyImp=c.period==='imp' && (gn.provs.length||gn.regions.length||gn.cities.length);
  if(geoAny){
    h+='<div class="dsep"></div><div class="dgrid">'+drow('PROVINCE',gn.provs.join('\n'))+drow('REGION',gn.regions.join('\n'))+drow('SUBREGION',gn.subs.join('\n'))+drow('CITY / MINT',gn.cities.join('\n'))+'</div>';
  } else if (geoAnyImp || c.period==='rep') {
    h+='<div class="dsep"></div><div class="dgrid">'+drow('SUBSUBREGION',gn.provs.join('\n'))+drow('REGION',gn.regions.join('\n'))+drow('CITY / MINT',gn.cities.join('\n'))+'</div>';
  }
  h+='<div class="dsep"></div><div class="dgrid">'+drow('METAL',c.metal)+drow('DENOMINATION',c.denom)+'</div>'+drow('PERIOD / DATE',c.date)+drow('DESCRIPTION',c.desc)+drow('NOTES',c.notes);
  document.getElementById('detail-body').innerHTML=h;
  document.getElementById('detail').classList.add('open');
  if(c.period === 'imp' || c.period === 'rep'){
    var p = provinceOfMint(c.mint);
    if(p){ setHighlight([p]); }
    else {
      var map2 = (c.period === 'imp') ? IMP_MAP_TO_PROVS : REP_MAP_TO_PROVS;
      var subsubs2 = (c.period === 'imp') ? c.impSubsubs : c.repSubsubs;
      var subs2 = (c.period === 'imp') ? c.impSubs : c.repSubs;
      var regions2 = (c.period === 'imp') ? c.impRegions : c.repRegions;
      var provs2 = [];
      if (c.mint && map2[c.mint]) provs2 = map2[c.mint];
      else if (subsubs2 && subsubs2.length) provs2 = subsubs2.reduce(function(a,ss){ return a.concat(map2[ss]||[]); }, []);
      else if (subs2 && subs2.length) provs2 = subs2.reduce(function(a,s){ return a.concat(map2[s]||[]); }, []);
      else if (regions2 && regions2.length) provs2 = regions2.reduce(function(a,r){ return a.concat(map2[r]||[]); }, []);
      setHighlight(provs2);
    }
  } else if (c.period === 'prov') {
    setHighlight(resolveProvinces(c.geo, c.prov));
  } else {
    setHighlight([]);
  }
}
function closeDetail(){ document.getElementById('detail').classList.remove('open'); detailId=null; clearHighlight(); }
function editFromDetail(){ var id=detailId; closeDetail(); openModal(id); }
function askDelete(id){ deleteId=id; document.getElementById('confirm').classList.add('open'); }
function closeConfirm(){ deleteId=null; document.getElementById('confirm').classList.remove('open'); }
function doDelete(){
  if(deleteId!=null){
    var idToDelete = deleteId;
    coins = coins.filter(function(c){ return c.id!==idToDelete; });
    if(detailId===idToDelete) closeDetail();
    save();
    renderList();
    updateMap();
    if (typeof renderMints === 'function') renderMints();
    if (window.currentUser) {
      import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js").then(function(mod){
        import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js").then(function(appMod){
          var db = mod.getFirestore(appMod.getApps()[0]);
          mod.deleteDoc(mod.doc(db, "coins", String(idToDelete)))
            .catch(function(error){ console.error("Errore eliminazione Firebase:", error); });
        });
      });
    }
  }
  closeConfirm();
}
function openPanel(){
  if(!isMobile()) return;
  var p = document.getElementById('panel');
  p.classList.add('open');
  p.setAttribute('aria-hidden', 'false');
  setTimeout(function(){ map.invalidateSize(); }, 320);
}
function closePanel(){
  if(!isMobile()) return;
  var p = document.getElementById('panel');
  p.classList.remove('open');
  p.setAttribute('aria-hidden', 'true');
  setTimeout(function(){ map.invalidateSize(); }, 320);
}
function togglePanel(){
  var p = document.getElementById('panel');
  if(p.classList.contains('open')) closePanel();
  else openPanel();
}
(function initPanelDrag(){
  var head = document.getElementById('panel-head');
  var panel = document.getElementById('panel');
  var startY = 0, dragging = false, activePointer = null;
  head.addEventListener('pointerdown', function(e){
    if(!isMobile()) return;
    if(e.button !== 0 && e.pointerType === 'mouse') return;
    if(e.target.closest('input, button, #tags-menu, .ftab')) return;
    dragging = true;
    activePointer = e.pointerId;
    startY = e.clientY;
    try { head.setPointerCapture(e.pointerId); } catch(err){}
  });
  head.addEventListener('pointermove', function(e){
    if(!dragging || e.pointerId !== activePointer) return;
    var dy = e.clientY - startY;
    if(dy > 60){ dragging = false; activePointer = null; closePanel(); }
    else if(dy < -30){ dragging = false; activePointer = null; openPanel(); }
  });
  head.addEventListener('pointerup', function(e){
    if(!dragging || e.pointerId !== activePointer) return;
    var dy = Math.abs(e.clientY - startY);
    dragging = false;
    activePointer = null;
    if(dy < 8) togglePanel();
  });
  head.addEventListener('pointercancel', function(){
    dragging = false; activePointer = null;
  });
  if(isMobile()){
    panel.setAttribute('aria-hidden', 'true');
  }
  window.addEventListener('resize', function(){
    if(!isMobile()){
      panel.classList.remove('open');
      panel.removeAttribute('aria-hidden');
    } else {
      if(!panel.classList.contains('open')) panel.setAttribute('aria-hidden', 'true');
    }
    map.invalidateSize();
  });
})();
function makeDraggable(windowElement, handleElement) {
  if (!windowElement || !handleElement) return;
  var dragging = false, startX = 0, startY = 0, initialLeft = 0, initialTop = 0, activePointer = null;
  handleElement.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 || !e.isPrimary) return;
    if (e.target.closest('button')) return;
    var rect = windowElement.getBoundingClientRect();
    dragging = true; activePointer = e.pointerId;
    startX = e.clientX; startY = e.clientY;
    initialLeft = rect.left; initialTop = rect.top;
    windowElement.style.transform = 'none';
    windowElement.style.left = initialLeft + 'px';
    windowElement.style.top = initialTop + 'px';
    try { handleElement.setPointerCapture(e.pointerId); } catch(err){}
    e.preventDefault();
  });
  handleElement.addEventListener('pointermove', function(e) {
    if (!dragging || e.pointerId !== activePointer) return;
    var deltaX = e.clientX - startX, deltaY = e.clientY - startY;
    var maxLeft = window.innerWidth - 60, maxTop = window.innerHeight - 40;
    var newLeft = Math.max(0, Math.min(initialLeft + deltaX, maxLeft));
    var newTop = Math.max(0, Math.min(initialTop + deltaY, maxTop));
    windowElement.style.left = newLeft + 'px'; windowElement.style.top = newTop + 'px';
  });
  function stopDragging(e) {
    if (e.pointerId !== activePointer) return;
    dragging = false; activePointer = null;
  }
  handleElement.addEventListener('pointerup', stopDragging);
  handleElement.addEventListener('pointercancel', stopDragging);
}
if(!isMobile()){
  makeDraggable(document.getElementById('modal'), document.getElementById('modal-head'));
  makeDraggable(document.getElementById('detail-box'), document.getElementById('detail-head'));
}
window.addEventListener('orientationchange', function(){
  setTimeout(function(){ map.invalidateSize(); }, 300);
});
(function(){
  var dirty=false;
  try {
    var raw = safeGet('numismatica_v2');
    if(raw){
      var loaded = JSON.parse(raw);
      if(Array.isArray(loaded)) coins = loaded;
    }
  } catch(e){ console.warn('load local coins failed:', e); }
  coins.forEach(function(c){
    if(!c.period){ c.period='rep'; dirty=true; }
    if(!c.geo){ c.geo=emptyGeo(); dirty=true; }
    if(typeof c.id!=='number'){ c.id=parseInt(c.id,10)||nextId++; dirty=true; }
    if(c.id>=nextId){ nextId=c.id+1; dirty=true; }
  });
  if(dirty) persistLocal();
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape') return;
    if(document.getElementById('confirm').classList.contains('open')) closeConfirm();
    else if(document.getElementById('detail').classList.contains('open')) closeDetail();
    else if(modalOpen()) closeModal();
  });
  initTagMenu();
  initClistTouch();
  renderList();
  setTimeout(function(){ map.invalidateSize(); }, 500);
  
  var defF = safeGet('numismatica_set_defFilter');
  if (defF) setFilter(defF);
  var defM = safeGet('numismatica_set_mapDef');
  if (defM) setMintMode(defM);
  
  window._mapReady = false;
  window._authReady = false;
  
  window.checkAppReady = function() {
    if (window._mapReady && window._authReady) {
      var loader = document.getElementById('global-loader');
      if (loader) {
        loader.classList.add('hidden');
        setTimeout(function(){ loader.style.display = 'none'; }, 300);
      }
      document.body.classList.add('ready');
    }
  };
})();