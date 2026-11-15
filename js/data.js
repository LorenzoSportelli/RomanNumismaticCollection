function slug(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
function norm(s){ return String(s||'').trim().replace(/\s+/g,' ').toLowerCase(); }
function normMint(s){
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').replace(/[.,;:()]/g,'').trim();
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function isMobile(){ return window.matchMedia('(max-width: 900px), (pointer: coarse)').matches; }
function proceedMobileAnyway(){
  var gate = document.getElementById('mobile-gate');
  if (gate) gate.classList.remove('open');
}
(function initMobileGate(){
  function check(){
    var gate = document.getElementById('mobile-gate');
    if (!gate) return;
    if (window.innerWidth <= 900 && !isTouchDevice()) {
      gate.classList.add('open');
    } else {
      gate.classList.remove('open');
    }
  }
  check();
  var t = null;
  window.addEventListener('resize', function(){
    clearTimeout(t);
    t = setTimeout(check, 200);
  });
})();
function isTablet(){ return window.matchMedia('(min-width: 600px) and (max-width: 1100px) and (pointer: coarse)').matches; }
function isTouchDevice(){ return 'ontouchstart' in window || navigator.maxTouchPoints > 0; }
function safeGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function safeSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){ console.warn('localStorage set failed:',e); } }
function safeRemove(k){ try{ localStorage.removeItem(k); }catch(e){} }
function debounce(fn, ms){
  var t=null;
  return function(){ var args=arguments, ctx=this; clearTimeout(t); t=setTimeout(function(){ fn.apply(ctx,args); }, ms); };
}
var MINT_ALIASES = {
  'laodicea ad lycum': ['laodiceia ad lycum','laodicea ad mare','laodiceia ad mare'],
  'antioch':           ['antioch syria','antiochia','antioch on the orontes'],
  'rome':              ['roma'],
  'lugdunum':          ['lyon'],
  'massalia':          ['massilia','marseille'],
  'osca':              ['huesca'],
  'corcyra':           ['corfu','kerkyra'],
  'messana':           ['messina','zancla'],
  'neapolis':          ['napoli','naples'],
  'metapontum':        ['metaponto'],
  'canusium':          ['canosa','canosa di puglia'],
  'luceria':           ['lucera'],
  'narbo':             ['narbo martius','narbonne'],
  'apollonia':         ['apollonia illyria','apollonia, illyria','apollonia, illyricum','apollonia illyricum','apollonia pojani'],
  'salpesa':           ['salpensa']
};
function canonicalMint(name){
  var n = normMint(name);
  for (var canon in MINT_ALIASES){
    if (n === canon || MINT_ALIASES[canon].indexOf(n) >= 0) return canon;
  }
  return n;
}
var PROVS = [
  "Achaia","Aegyptus","Africa Proconsularis","Alpes Cottiae","Alpes Graiae et Poeninae","Alpes Maritimae",
  "Aquitania","Arabia","Armenia Mesopotamia","Asia","Baetica","Belgica","Bithynia et Pontus","Britannia",
  "Cilicia","Creta et Cyrene","Dacia","Dalmatia","Galatia et Cappadocia","Germania Inferior","Germania Superior",
  "Italia","Iudaea","Lugdunensis","Lusitania","Lycia et Pamphylia","Macedonia","Mauretania Caesariensis",
  "Mauretania Tingitana","Moesia Inferior","Moesia Superior","Narbonensis","Noricum","Numidia",
  "Pannonia Inferior","Pannonia Superior","Raetia","Sardinia et Corsica","Sicilia","Syria","Tarraconensis","Thracia",
  "Italia — Regio I — Latium et Campania","Italia — Regio II — Apulia et Calabria",
  "Italia — Regio III — Lucania et Bruttii","Italia — Regio IV — Samnium",
  "Italia — Regio V — Picenum","Italia — Regio VI — Umbria et Ager Gallicus",
  "Italia — Regio VII — Etruria","Italia — Regio VIII — Aemilia",
  "Italia — Regio IX — Liguria","Italia — Regio X — Venetia et Histria","Italia — Regio XI — Transpadana"
];
var GEO_MAP = {
  "Achaia":"Achaia","Aegyptus":"Aegyptus","Africa Proconsularis":"Africa Proconsularis",
  "Alpes Cottiae":"Alpes Cottiae","Alpes Graiae et Poeninae":"Alpes Graiae et Poeninae","Alpes Maritimae":"Alpes Maritimae",
  "Aquitania":"Aquitania","Arabia":"Arabia","Armenia":"Armenia Mesopotamia","Mesopotamia":"Armenia Mesopotamia",
  "Asia":"Asia","Baetica":"Baetica","Belgica":"Belgica","Bithynia et Pontus":"Bithynia et Pontus","Britannia":"Britannia",
  "Cilicia":"Cilicia","Creta et Cyrenaica":"Creta et Cyrene","Cyrenaica":"Creta et Cyrene","Dacia":"Dacia","Dalmatia":"Dalmatia",
  "Galatia":"Galatia et Cappadocia","Cappadocia":"Galatia et Cappadocia","Germania Inferior":"Germania Inferior",
  "Germania Superior":"Germania Superior","Iudaea":"Iudaea","Lugdunensis":"Lugdunensis","Lusitania":"Lusitania",
  "Lycia et Pamphylia":"Lycia et Pamphylia","Macedonia":"Macedonia","Mauretania Caesariensis":"Mauretania Caesariensis",
  "Mauretania Tingitana":"Mauretania Tingitana","Moesia Inferior":"Moesia Inferior","Moesia Superior":"Moesia Superior",
  "Narbonensis":"Narbonensis","Noricum":"Noricum","Numidia":"Numidia","Pannonia Inferior":"Pannonia Inferior",
  "Pannonia Superior":"Pannonia Superior","Raetia":"Raetia","Sardinia et Corsica":"Sardinia et Corsica","Sicilia":"Sicilia",
  "Syria":"Syria","Tarraconensis":"Tarraconensis","Thracia":"Thracia","Italia":"Italia",
  "I":"Italia — Regio I — Latium et Campania","II":"Italia — Regio II — Apulia et Calabria",
  "III":"Italia — Regio III — Lucania et Bruttii","IV":"Italia — Regio IV — Samnium","V":"Italia — Regio V — Picenum",
  "VI":"Italia — Regio VI — Umbria et Ager Gallicus","VII":"Italia — Regio VII — Etruria","VIII":"Italia — Regio VIII — Aemilia",
  "IX":"Italia — Regio IX — Liguria","X":"Italia — Regio X — Venetia et Histria","XI":"Italia — Regio XI — Transpadana"
};
var REGIONS = [];
var SUBREGIONS = [];
var CITIES = [];
var REGION_PROVINCES = {
  "Aegina":["Achaia"],"Aeolis":["Asia"],"Africa":["Africa Proconsularis"],"Arabia":["Arabia"],
  "Armenia":["Armenia Mesopotamia"],"Mesopotamia":["Armenia Mesopotamia"],"Attica":["Achaia"],
  "Bithynia":["Bithynia et Pontus"],"Boeotia":["Achaia"],"Bosporus":[],"Cappadocia":["Galatia et Cappadocia"],
  "Caria":["Asia"],"Cilicia":["Cilicia"],"Commagene":["Syria"],"Corinthia":["Achaia"],"Crete":["Creta et Cyrene"],
  "Cyclades":["Achaia"],"Cyprus":[],"Cyrenaica":["Creta et Cyrene"],"Dacia":["Dacia"],"Egypt":["Aegyptus"],
  "Epirus":[],"Euboea":["Achaia"],"Galatia":["Galatia et Cappadocia"],"Galilaea":["Iudaea"],
  "Gaul":["Aquitania","Lugdunensis","Belgica","Narbonensis"],"Hispania":["Baetica","Lusitania","Tarraconensis"],
  "Illyricum":["Dalmatia","Pannonia Superior","Pannonia Inferior"],"Ionia":["Asia"],"Italy":["Italia"],
  "Judaea":["Iudaea"],"Lesbus":["Asia"],"Locris":["Achaia"],"Lycaonia":["Galatia et Cappadocia","Cilicia"],
  "Lycia":["Lycia et Pamphylia"],"Lydia":["Asia"],"Macedonia":["Macedonia"],
  "Mauretania":["Mauretania Caesariensis","Mauretania Tingitana"],"Megaris":["Achaia"],
  "Moesia":["Moesia Superior","Moesia Inferior"],"Mysia":["Asia"],"Pamphylia":["Lycia et Pamphylia"],
  "Paphlagonia":["Bithynia et Pontus","Galatia et Cappadocia"],"Peloponnesus":["Achaia"],"Phocis":["Achaia"],
  "Phoenicia":["Syria"],"Phrygia":["Asia","Galatia et Cappadocia"],"Pisidia":["Galatia et Cappadocia"],
  "Pontus":["Bithynia et Pontus","Galatia et Cappadocia"],"Samaria":["Iudaea"],"Sardinia":["Sardinia et Corsica"],
  "Sarmata":[],"Sarmatia":[],"Sicily":["Sicilia"],"Syria":["Syria"],"Thessaly":["Macedonia"],"Thrace":["Thracia"],
  "Troas":["Asia"],"Uncertain":[]
};
var LEGACY_SUB_IDS = {
  "sub-cilicia-trachea":"sub-cilicia-cilicia-trachea",
  "sub-cilicia-pedias":"sub-cilicia-cilicia-pedias",
  "sub-pelop-achaea":"sub-peloponnesus-achaea",
  "sub-pelop-argolis":"sub-peloponnesus-argolis",
  "sub-pelop-laconia":"sub-peloponnesus-laconia"
};
var PDB = {
  ready:false, error:null,
  cities:[], cityById:{}, cityByKey:{}, cityByName:{},
  subs:[], subById:{},
  regions:[], reigns:[], reignInfo:{},
  mags:[], magById:{},
  tuples:[]
};
var allMintsData = [];
var currentMintMode = 'none';
var mintsLayer = null;
var MINT_TYPES = {};
var MINT_GEO_CACHE = {};
var REIGN_ORDER = [];
var MINT_COORD_OVERRIDES = {
  'Apollonia, Illyria':[40.720583,19.470413],'Canusium':[41.2167,16.0667],'Corcyra':[39.6072,19.9183],
  'Laodiceia ad Lycum':[37.83686,29.10797],'Luceria':[41.508065,15.335065],'Massalia':[43.3,5.367],
  'Messana':[38.189444,15.55],'Metapontum':[40.383641,16.824332],'Neapolis':[40.8514,14.2628],
  'Osca':[42.1397,-0.4085],'Salpesa':[37.181512,-5.781536],'Narbo':[43.183,3.0],'Antioch, Syria':[36.2,36.15]
};
function parseCSV(text){
  if(!text) return [];
  if(text.charCodeAt(0)===0xFEFF) text=text.slice(1);
  var firstLine=text.split(/\r?\n/)[0]||'';
  var sep=[',',';','\t'].map(function(s){return [s,firstLine.split(s).length];}).sort(function(a,b){return b[1]-a[1];})[0][0];
  var rows=[],row=[],field='',q=false;
  for(var i=0;i<text.length;i++){
    var ch=text[i];
    if(q){
      if(ch==='"'){ if(text[i+1]==='"'){field+='"';i++;} else q=false; }
      else field+=ch;
    } else {
      if(ch==='"') q=true;
      else if(ch===sep){ row.push(field); field=''; }
      else if(ch==='\n'){ row.push(field); rows.push(row); row=[]; field=''; }
      else if(ch==='\r'){ }
      else field+=ch;
    }
  }
  if(field.length||row.length){ row.push(field); rows.push(row); }
  if(!rows.length) return [];
  var header=rows.shift().map(function(h){ return norm(h); });
  return rows.filter(function(r){ return r.some(function(x){ return x.trim(); }); }).map(function(r){
    var o={}; header.forEach(function(h,i){ o[h]=(r[i]||'').trim(); }); return o;
  });
}
function pickCol(row, candidates){
  for(var i=0;i<candidates.length;i++) if(candidates[i] in row) return candidates[i];
  return null;
}
function splitMulti(s){
  var out=[],depth=0,cur='';
  for(var i=0;i<(s||'').length;i++){
    var ch=s[i];
    if(ch==='(') depth++;
    if(ch===')') depth=Math.max(0,depth-1);
    if((ch===','||ch===';')&&depth===0){ out.push(cur); cur=''; }
    else cur+=ch;
  }
  out.push(cur);
  return out.map(function(x){ return x.trim().replace(/\s+/g,' '); }).filter(Boolean);
}
function fetchFirst(paths){
  return paths.reduce(function(p,path){
    return p.catch(function(){
      return fetch(path).then(function(r){
        if(!r.ok) throw new Error(path+' HTTP '+r.status);
        return r.arrayBuffer();
      }).then(function(buf){
        return new TextDecoder('utf-8').decode(buf);
      });
    });
  }, Promise.reject(new Error('no path')));
}
function pdbAddCity(name, region, sub, rpc){
  var key=norm(name)+'|'+norm(region);
  if(PDB.cityByKey[key]) return PDB.cityByKey[key];
  var subId='';
  if(sub){
    subId='sub-'+slug(region)+'-'+slug(sub);
    if(!PDB.subById[subId]){ var s={id:subId,name:sub,region:region}; PDB.subs.push(s); PDB.subById[subId]=s; }
  }
  var base='city-'+slug(name)+'-'+slug(region), id=base, n=2;
  while(PDB.cityById[id]) id=base+'-'+(n++);
  var c={id:id,name:name,region:region,sub:subId,key:key,rpc:rpc||''};
  PDB.cities.push(c); PDB.cityById[id]=c; PDB.cityByKey[key]=c;
  (PDB.cityByName[norm(name)]=PDB.cityByName[norm(name)]||[]).push(c);
  return c;
}
function resolveCityRef(ref){
  var m=/^(.*?)\s*\(([^()]*)\)\s*$/.exec(ref);
  var name=m?m[1].trim():ref.trim(), region=m?m[2].trim():'';
  if(!name) return null;
  if(region){
    var c=PDB.cityByKey[norm(name)+'|'+norm(region)];
    return c || pdbAddCity(name, region, '', '');
  }
  var list=PDB.cityByName[norm(name)]||[];
  return list.length===1 ? list[0] : null;
}
function buildReignDB(rows){
  if(!rows || !rows.length) return;
  var r0 = rows[0];
  var cKind  = pickCol(r0, ['kind']);
  var cReign = pickCol(r0, ['reign']);
  var cStart = pickCol(r0, ['start date','start']);
  var cEnd   = pickCol(r0, ['end date','end']);
  if(!cReign) return;
  var entries = [];
  rows.forEach(function(row){
    var name = (row[cReign]||'').replace(/\s+/g,' ').trim();
    if(!name) return;
    var kind = cKind ? (row[cKind]||'').trim() : '';
    var start = parseInt((row[cStart]||'').replace(/[^\-0-9]/g,''), 10);
    var end   = parseInt((row[cEnd]||'').replace(/[^\-0-9]/g,''), 10);
    if(isNaN(start)) start = 9999;
    if(isNaN(end))   end   = 9999;
    PDB.reignInfo[name] = { kind: kind, start: start, end: end };
    entries.push({ name: name, start: start, end: end });
  });
  entries.sort(function(a,b){
    if(a.start !== b.start) return a.start - b.start;
    if(a.end   !== b.end)   return a.end - b.end;
    return a.name.localeCompare(b.name);
  });
  REIGN_ORDER = entries.map(function(e){ return e.name; });
}
function isClientKing(reign){
  var info = PDB.reignInfo[reign];
  return !!(info && info.kind && /client king/i.test(info.kind));
}
function reignLabel(reign){ return isClientKing(reign) ? reign + ' *' : reign; }
function buildProvDB(magRows, cityRows){
  if(cityRows.length){
    var r0=cityRows[0];
    var cCity=pickCol(r0,['city','città','citta']), cReg=pickCol(r0,['region','regione']),
        cSub=pickCol(r0,['subregion','sub-region','sub region','subregione']), cMore=pickCol(r0,['more','link','rpc']);
    if(!cCity||!cReg) throw new Error('cities CSV: columns City/Region not found');
    cityRows.forEach(function(row){
      if(!row[cCity]) return;
      pdbAddCity(row[cCity], row[cReg], cSub?row[cSub]:'', cMore?row[cMore]:'');
    });
  }
  if(magRows.length){
    var m0=magRows[0];
    var cMag=pickCol(m0,['magistrate','magistrato']), cReigns=pickCol(m0,['reigns','reign','regni']),
        cCities=pickCol(m0,['cities','city','città']), cTitle=pickCol(m0,['title','titolo']);
    if(!cMag||!cReigns||!cCities) throw new Error('magistrates CSV: columns Magistrate/Reigns/Cities not found');
    var ordinal={};
    magRows.forEach(function(row){
      var name=(row[cMag]||'').replace(/\s+/g,' ').trim(); if(!name) return;
      var k=slug(name)||'anon'; ordinal[k]=(ordinal[k]||0)+1;
      var id='mag-'+k+'#'+ordinal[k];
      var reigns=splitMulti(row[cReigns]);
      var cities=[]; splitMulti(row[cCities]).forEach(function(ref){ var c=resolveCityRef(ref); if(c&&cities.indexOf(c.id)<0) cities.push(c.id); });
      var mag={id:id,name:name,title:cTitle?(row[cTitle]||''):'',reigns:reigns,cities:cities};
      PDB.mags.push(mag); PDB.magById[id]=mag;
    });
  }
  var regSet={}, reignSet={};
  PDB.cities.forEach(function(c){ if(c.region) regSet[c.region]=true; });
  PDB.mags.forEach(function(m){ m.reigns.forEach(function(r){ reignSet[r]=true; }); });
  Object.keys(PDB.reignInfo).forEach(function(r){ reignSet[r]=true; });
  PDB.regions=Object.keys(regSet).sort();
  PDB.reigns=Object.keys(reignSet).sort(function(a,b){
    var ia=REIGN_ORDER.indexOf(a), ib=REIGN_ORDER.indexOf(b);
    if(a==='Uncertain') return 1; if(b==='Uncertain') return -1;
    if(ia>=0&&ib>=0) return ia-ib; if(ia>=0) return -1; if(ib>=0) return 1;
    return a.localeCompare(b);
  });
  var withMag={};
  PDB.mags.forEach(function(m){
    var reigns=m.reigns.length?m.reigns:[null];
    var cities=m.cities.length?m.cities:[null];
    reigns.forEach(function(r){ cities.forEach(function(cid){
      var c=cid?PDB.cityById[cid]:null; if(cid) withMag[cid]=true;
      PDB.tuples.push({r:r,m:m.id,c:cid,g:c?c.region:null,s:c?(c.sub||null):null});
    }); });
  });
  PDB.cities.forEach(function(c){ if(!withMag[c.id]) PDB.tuples.push({r:null,m:null,c:c.id,g:c.region,s:c.sub||null}); });
  PDB.ready=true;
  applyProvDB();
}
function applyProvDB(){
  CITIES=PDB.cities; SUBREGIONS=PDB.subs;
  var set={}; Object.keys(REGION_PROVINCES).forEach(function(r){ set[r]=true; }); PDB.regions.forEach(function(r){ set[r]=true; });
  REGIONS=Object.keys(set).sort();
  setProvHint('');
  if(document.getElementById('overlay').classList.contains('open')){ provEnforce(); pkRenderAll(); previewHighlight(); }
  renderList();
  try { rebuildMintTypeIndex(); } catch(e){}
  try { if (mintsLayer && currentMintMode !== 'none') renderMints(); } catch(e){}
}
function setProvHint(t){ document.getElementById('prov-hint').textContent=t; }
setProvHint('Loading CSV data…');
Promise.all([
  fetchFirst(['magistrati.csv','magistrates.csv']).catch(function(e){ console.error('magistrati:', e); return ''; }),
  fetchFirst(['città.csv','citta.csv','cities.csv']).catch(function(e){ console.error('città:', e); return ''; }),
  fetchFirst(['reigns.csv']).catch(function(e){ console.error('reigns:', e); return ''; })
]).then(function(res){
  var start = function(){
    buildReignDB(parseCSV(res[2]));
    var magText = res[0], cityText = res[1];
    if(!magText && !cityText){ setProvHint('CSV non caricati. Controlla che i file esistano nella cartella del sito.'); return; }
    buildProvDB(parseCSV(magText), parseCSV(cityText));
  };
  if(window.requestIdleCallback) requestIdleCallback(start, {timeout: 500});
  else setTimeout(start, 0);
}).catch(function(e){
  PDB.error = e;
  console.error('Errore caricamento CSV:', e);
  setProvHint('CSV not loaded ('+e.message+'). Open the page through a local web server.');
});
var IMP_AUTHORITIES = ["Aemilian","Allectus","Amandus","Anonymous","Anthemius","Antoninus Pius","Arcadius","Augustus","Aurelian","Aureolus","Avitus","Balbinus","Basiliscus","Bonosus","Burgundians or Franks","Caracalla","Carausius","Carinus","Carus","Claudius","Claudius II Gothicus","Clodius Albinus","Clodius Macer","Commodus","Constans","Constantine I","Constantine II","Constantine III","Constantius Chlorus","Constantius II","Diadumenian","Didius Julianus","Diocletian","Domitian","Domitian II","Domitius Alexander","Dryantilla","Elagabalus","Eugenius","Flavius Marcus","Florianus","Gaius/Caligula","Galba","Galerius","Gallienus","Geta","Glycerius","Gordian I","Gordian II","Gordian III","Gratian","Hadrian","Honorius","Hostilian","Joannes","Jotapianus","Jovianus","Jovinus","Julian of Pannonia","Julian the Apostate","Julius Nepos","Laelianus","Leo I","Leo II","Leontius","Libius Severus","Licinius","Macrianus Minor","Macrinus","Magnentius","Magnus Maximus","Majorian","Mar. Silbannacus","Marcian","Marcus Aurelius","Marius","Maxentius","Maximian","Maximinus Daia","Maximinus Thrax","Maximus","Maximus of Barcelona","Nero","Nerva","Non-imperial African coinages","Numerian","Odoacer","Olybrius","Otho","Pacatianus","Pertinax","Pescennius Niger","Petronius Maximus","Philip the Arab","Postumus","Priscus Attalus","Probus","Procopius","Pupienus","Quietus","Quintillus","Regalianus","Romulus Augustulus","Saturninus","Septimius Severus","Severus Alexander","Severus II","Sponsianus","Suevi","Tacitus","Tetricus I","Theodosius I","Theodosius II","Tiberius","Titus","Trajan","Trajan Decius","Trebonianus Gallus","Uranius Antoninus","Vabalathus","Valens","Valentinian I","Valentinian II","Valentinian III","Valerian","Vespasian","Victorinus","Visigoths","Vitellius","Volusian","Zeno","Zenobia"];
var IMP_ISSUERS = ["A. Licinius Nerva Silianus","Apronius","C. Annius Pollio","C. Antistius Reginus","C. Antistius Vetus","C. Asinius Gallus","C. Cassius Celer","C. Gallius Lupercus","C. Marcius Censorinus","C. Marius C F Tro","C. Naevius Capella","C. Plotius Rufus","C. Rubellius Blandus","C. Sulpicius Platorinus","Claudius Pulcher","Cn. PISO Cn.F","Cossus Cornelius Lentulus","Galus","L. Aelius Lamia","L. Aquillius Florus","L. Caninius Gallus","L. Lentulus","L. Mescinius Rufus","L. Naevius Surdinus","L. Valerius Catullus","L. Vinicius","Livineius Regulus","M. Durmius","M. Maecilius Tullus","M. Salvius Otho","M. Sanquinius","Messalla","P. Betilienus Bassus","P. Carisius","P. Licinius Stolo","P. Lurius Agrippa","P. Petronius Turpilianus","P. Silius P.","Q. Aelius Lamia","Q. Rustius","Sex. Nonius Quinctilianus","Sisenna","Statilius Taurus","T. Quinctius Crispinus Sulpicianus","Ti. Sempronius Graccus","Volusus Valerius Messalla"];
var IMP_CITIES = ["Rome","Constantinople","Alexandria","Ambianum","Antioch of Pisidia","Antioch, Syria","Aquileia","Arelate","Arelate comitatensian mint","Barcino","Caesaraugusta","Caesarea in Cappadocia","Camulodunum","Carnuntum","Carthage","Cologne","Colonia Patricia","Comitatensian","Cyrene","Cyzicus","Eastern Mint","Emerita","Emisa","Ephesus","Heraclea","Laodicea ad Mare","Londinium","Lugdunum","Mainz","Mediolanum","Narbo","Nemausus","Nicaea (Gallia)","Nicomedia","Ostia","Pergamum","Ravenna","Ravenna comitatensian mint","Rotomagus","Samos","Serdica","Sirmium","Siscia","Southern Gallic Mint","Tarraco","Thessalonica","Ticinum","Trier","Tripolis","Uncertain value","Vienne","Viminacium"];
var IMP_GEO_TREE = {
  "Africa": {"Africa": ["Africa", "Zeugitana"],"Cyrenaica": ["Cyrenaica"],"Egypt": ["Egypt"]},
  "Asia": {"Asia": ["Asia", "Asia Minor"],"Bithynia": ["Bithynia"],"Cappadocia": ["Cappadocia"],"Ionia": ["Ionia", "Islands off Ionia"],"Mysia": ["Mysia"],"Pisidia": ["Pisidia"],"Syria": ["Syria", "Commagene", "Judaea", "Phoenicia", "Seleucis and Pieria"]},
  "Europe": {
    "Britannia": ["Britannia"],"Dalmatia": ["Dalmatia"],"Gallia": ["Gallia", "Gallia Cisalpina", "Gallia Transalpina"],"Germania": ["Germania"],"Hispania": ["Hispania", "Hispania Citerior", "Hispania Ulterior"],
    "Italy": ["Italia — Regio I — Latium et Campania","Italia — Regio II — Apulia et Calabria","Italia — Regio III — Lucania et Bruttii","Italia — Regio IV — Samnium","Italia — Regio V — Picenum","Italia — Regio VI — Umbria et Ager Gallicus","Italia — Regio VII — Etruria","Italia — Regio VIII — Aemilia","Italia — Regio IX — Liguria","Italia — Regio X — Venetia et Histria","Italia — Regio XI — Transpadana"],
    "Macedon": ["Macedon", "Bisaltian District"],"Pannonia": ["Pannonia"],"Peloponnesus": ["Peloponnesus", "Achaea"],"Thrace": ["Thrace", "Inland Cities of Thrace", "Moesia Superior", "Moesia", "The European Coast of the Propontis"]
  }
};
var IMP_CITY_TO_SUB = {
  "Rome": "Italy", "Ostia": "Italy", "Ravenna": "Italy", "Ravenna comitatensian mint": "Italy","Mediolanum": "Italy", "Aquileia": "Italy", "Ticinum": "Italy",
  "Constantinople": "Thrace", "Serdica": "Thrace", "Thessalonica": "Macedon","Sirmium": "Pannonia", "Siscia": "Pannonia", "Viminacium": "Moesia Superior", "Carnuntum": "Pannonia",
  "Alexandria": "Egypt", "Cyrene": "Cyrenaica", "Carthage": "Africa","Antioch, Syria": "Syria", "Emisa": "Syria", "Laodicea ad Mare": "Syria",
  "Tripolis": "Phoenicia", "Caesarea in Cappadocia": "Cappadocia","Antioch of Pisidia": "Pisidia", "Ephesus": "Asia", "Pergamum": "Mysia",
  "Samos": "Ionia", "Cyzicus": "Mysia", "Nicomedia": "Bithynia", "Heraclea": "Bithynia","Lugdunum": "Gallia", "Arelate": "Gallia", "Arelate comitatensian mint": "Gallia",
  "Narbo": "Gallia", "Vienne": "Gallia", "Ambianum": "Gallia","Rotomagus": "Gallia", "Nemausus": "Gallia", "Nicaea (Gallia)": "Gallia",
  "Trier": "Gallia", "Cologne": "Germania", "Mainz": "Germania","Londinium": "Britannia", "Camulodunum": "Britannia",
  "Tarraco": "Hispania", "Emerita": "Hispania", "Colonia Patricia": "Hispania","Barcino": "Hispania", "Caesaraugusta": "Hispania"
};
var IMP_CITY_TO_SUBSUB = {
  "Rome": "Italia — Regio I — Latium et Campania", "Ostia": "Italia — Regio I — Latium et Campania","Mediolanum": "Italia — Regio XI — Transpadana", "Aquileia": "Italia — Regio X — Venetia et Histria", "Ticinum": "Italia — Regio XI — Transpadana","Ravenna": "Italia — Regio VIII — Aemilia","Ravenna comitatensian mint": "Italia — Regio VIII — Aemilia",
  "Lugdunum": "Gallia Transalpina", "Arelate": "Gallia Transalpina", "Arelate comitatensian mint": "Gallia Transalpina","Narbo": "Gallia Transalpina", "Vienne": "Gallia Transalpina", "Nemausus": "Gallia Transalpina", "Nicaea (Gallia)": "Gallia Transalpina",
  "Tarraco": "Hispania Citerior", "Barcino": "Hispania Citerior", "Caesaraugusta": "Hispania Citerior","Emerita": "Hispania Ulterior", "Colonia Patricia": "Hispania Ulterior",
  "Thessalonica": "Bisaltian District","Antioch, Syria": "Seleucis and Pieria", "Emisa": "Phoenicia", "Laodicea ad Mare": "Seleucis and Pieria", "Tripolis": "Phoenicia","Carthage": "Zeugitana", "Nicomedia": "Bithynia", "Heraclea": "Bithynia"
};
var IMP_MAP_TO_PROVS = {
  "Europe": ["Britannia","Dalmatia","Lugdunensis","Belgica","Aquitania","Narbonensis","Germania Superior","Germania Inferior","Tarraconensis","Baetica","Lusitania","Italia","Macedonia","Pannonia Superior","Pannonia Inferior","Achaia","Thracia","Moesia Superior","Moesia Inferior"],
  "Italy": ["Italia"],"Asia": ["Asia","Bithynia et Pontus","Galatia et Cappadocia","Syria","Iudaea"],"Africa": ["Africa Proconsularis","Creta et Cyrene","Aegyptus"],
  "Britannia": ["Britannia"],"Dalmatia": ["Dalmatia"],"Gallia": ["Lugdunensis","Belgica","Aquitania","Narbonensis"],"Germania": ["Germania Superior","Germania Inferior"],"Hispania": ["Tarraconensis","Baetica","Lusitania"],"Macedon": ["Macedonia"],"Pannonia": ["Pannonia Superior","Pannonia Inferior"],"Peloponnesus": ["Achaia"],"Thrace": ["Thracia","Moesia Superior","Moesia Inferior"],"Bithynia": ["Bithynia et Pontus"],"Cappadocia": ["Galatia et Cappadocia"],"Ionia": ["Asia"],"Mysia": ["Asia"],"Pisidia": ["Galatia et Cappadocia"],"Syria": ["Syria","Iudaea"],"Cyrenaica": ["Creta et Cyrene"],"Egypt": ["Aegyptus"],
  "Gallia Cisalpina": ["Italia"],"Gallia Transalpina": ["Narbonensis","Lugdunensis"],"Hispania Citerior": ["Tarraconensis"],"Hispania Ulterior": ["Baetica","Lusitania"],
  "Italia — Regio I — Latium et Campania": ["Italia"],"Italia — Regio II — Apulia et Calabria": ["Italia"],"Italia — Regio III — Lucania et Bruttii": ["Italia"],"Italia — Regio IV — Samnium": ["Italia"],"Italia — Regio V — Picenum": ["Italia"],"Italia — Regio VI — Umbria et Ager Gallicus": ["Italia"],"Italia — Regio VII — Etruria": ["Italia"],"Italia — Regio VIII — Aemilia": ["Italia"],"Italia — Regio IX — Liguria": ["Italia"],"Italia — Regio X — Venetia et Histria": ["Italia"],"Italia — Regio XI — Transpadana": ["Italia"],
  "Bisaltian District": ["Macedonia"],"Inland Cities of Thrace": ["Thracia"],"The European Coast of the Propontis": ["Thracia"],"Asia Minor": ["Asia"],"Islands off Ionia": ["Asia"],"Commagene": ["Syria"],"Judaea": ["Iudaea"],"Phoenicia": ["Syria"],"Seleucis and Pieria": ["Syria"],"Zeugitana": ["Africa Proconsularis"],
  "Rome": ["Italia"], "Ostia": ["Italia"], "Ravenna": ["Italia"], "Ravenna comitatensian mint": ["Italia"],"Mediolanum": ["Italia"], "Aquileia": ["Italia"], "Ticinum": ["Italia"],"Constantinople": ["Thracia"], "Serdica": ["Thracia"], "Thessalonica": ["Macedonia"],"Sirmium": ["Pannonia Inferior"], "Siscia": ["Pannonia Superior"], "Viminacium": ["Moesia Superior"], "Carnuntum": ["Pannonia Superior"],"Alexandria": ["Aegyptus"], "Cyrene": ["Creta et Cyrene"], "Carthage": ["Africa Proconsularis"],"Antioch, Syria": ["Syria"], "Emisa": ["Syria"], "Laodicea ad Mare": ["Syria"],"Tripolis": ["Syria"], "Caesarea in Cappadocia": ["Galatia et Cappadocia"],"Antioch of Pisidia": ["Galatia et Cappadocia"], "Ephesus": ["Asia"], "Pergamum": ["Asia"],"Samos": ["Asia"], "Cyzicus": ["Asia"], "Nicomedia": ["Bithynia et Pontus"], "Heraclea": ["Bithynia et Pontus"],"Lugdunum": ["Lugdunensis"], "Arelate": ["Narbonensis"], "Arelate comitatensian mint": ["Narbonensis"],"Narbo": ["Narbonensis"], "Vienne": ["Narbonensis"], "Ambianum": ["Belgica"],"Rotomagus": ["Lugdunensis"], "Nemausus": ["Narbonensis"], "Nicaea (Gallia)": ["Alpes Maritimae"],"Trier": ["Belgica"], "Cologne": ["Germania Inferior"], "Mainz": ["Germania Superior"],"Londinium": ["Britannia"], "Camulodunum": ["Britannia"],"Tarraco": ["Tarraconensis"], "Emerita": ["Lusitania"], "Colonia Patricia": ["Baetica"],"Barcino": ["Tarraconensis"], "Caesaraugusta": ["Tarraconensis"]
};
var IDB = { ready: true, authorities: IMP_AUTHORITIES, issuers: IMP_ISSUERS, cities: IMP_CITIES, tree: IMP_GEO_TREE, cityToSub: IMP_CITY_TO_SUB, cityToSubsub: IMP_CITY_TO_SUBSUB, tuples: [] };
IMP_AUTHORITIES.forEach(function(a){ IMP_ISSUERS.forEach(function(i){ IDB.tuples.push({ a: a, i: i }); }); });
var REP_CITIES = [
  "Antioch, Syria","Apollonia, Illyria","Canusium","Corcyra","Eastern Roman Mint",
  "Italy (Central)","Italy (North)","Italy (South)","Italy (Southeast)",
  "Laodiceia ad Lycum","Luceria","Lugdunum","Massalia","Messana","Metapontum",
  "Narbo","Neapolis","Osca","Rome","Salpesa","Sicily 1","Sicily 2","Uncertain value"
];
var REP_GEO_TREE = {
  "Africa": {"Africa": ["Africa", "Zeugitana"],"Cyrenaica": ["Cyrenaica"],"Egypt": ["Egypt"]},
  "Asia": {"Asia": ["Asia", "Asia Minor"],"Bithynia": ["Bithynia"],"Cappadocia": ["Cappadocia"],"Ionia": ["Ionia", "Islands off Ionia"],"Mysia": ["Mysia"],"Pisidia": ["Pisidia"],"Syria": ["Syria", "Commagene", "Judaea", "Phoenicia", "Seleucis and Pieria"]},
  "Europe": {
    "Britannia": ["Britannia"],"Dalmatia": ["Dalmatia"],"Gallia": ["Gallia", "Gallia Cisalpina", "Gallia Transalpina"],"Germania": ["Germania"],"Hispania": ["Hispania", "Hispania Citerior", "Hispania Ulterior"],
    "Italy": ["Italia — Regio I — Latium et Campania","Italia — Regio II — Apulia et Calabria","Italia — Regio III — Lucania et Bruttii","Italia — Regio IV — Samnium","Italia — Regio V — Picenum","Italia — Regio VI — Umbria et Ager Gallicus","Italia — Regio VII — Etruria","Italia — Regio VIII — Aemilia","Italia — Regio IX — Liguria","Italia — Regio X — Venetia et Histria","Italia — Regio XI — Transpadana","Sardinia", "Sicily"],
    "Macedon": ["Macedon", "Bisaltian District"],"Pannonia": ["Pannonia"],"Peloponnesus": ["Peloponnesus", "Achaea"],"Thrace": ["Thrace", "Inland Cities of Thrace", "Moesia Superior", "Moesia", "The European Coast of the Propontis"]
  }
};
var REP_CITY_TO_SUB = {
  "Rome": "Italy", "Canusium": "Italy", "Luceria": "Italy", "Neapolis": "Italy","Osca": "Hispania", "Massalia": "Gallia", "Lugdunum": "Gallia", "Narbo": "Gallia","Antioch, Syria": "Syria", "Laodiceia ad Lycum": "Asia","Apollonia, Illyria": "Macedon", "Corcyra": "Macedon","Messana": "Sicily", "Metapontum": "Italy", "Salpesa": "Hispania","Sicily 1": "Sicily", "Sicily 2": "Sicily","Italy (Central)": "Italy", "Italy (North)": "Italy", "Italy (South)": "Italy", "Italy (Southeast)": "Italy","Eastern Roman Mint": "Asia", "Uncertain value": "Italy"
};
var REP_CITY_TO_SUBSUB = {
  "Rome": "Italia — Regio I — Latium et Campania", "Canusium": "Italia — Regio II — Apulia et Calabria", "Luceria": "Italia — Regio II — Apulia et Calabria", "Neapolis": "Italia — Regio I — Latium et Campania","Metapontum": "Italia — Regio III — Lucania et Bruttii","Osca": "Hispania Citerior", "Salpesa": "Hispania Ulterior","Massalia": "Gallia Transalpina", "Lugdunum": "Gallia Transalpina", "Narbo": "Gallia Transalpina","Antioch, Syria": "Seleucis and Pieria", "Laodiceia ad Lycum": "Asia Minor","Apollonia, Illyria": "Macedon", "Corcyra": "Macedon","Messana": "Sicily", "Sicily 1": "Sicily", "Sicily 2": "Sicily","Italy (Central)": "Italia — Regio I — Latium et Campania", "Italy (North)": "Italia — Regio VIII — Aemilia", "Italy (South)": "Italia — Regio II — Apulia et Calabria", "Italy (Southeast)": "Italia — Regio II — Apulia et Calabria","Eastern Roman Mint": "Asia Minor", "Uncertain value": "Italia — Regio I — Latium et Campania"
};
var REP_MAP_TO_PROVS = {
  "Europe": ["Britannia","Dalmatia","Lugdunensis","Belgica","Aquitania","Narbonensis","Germania Superior","Germania Inferior","Tarraconensis","Baetica","Lusitania","Italia","Macedonia","Pannonia Superior","Pannonia Inferior","Achaia","Thracia","Moesia Superior","Moesia Inferior"],
  "Africa": ["Africa Proconsularis","Creta et Cyrene","Aegyptus"],"Asia": ["Asia","Bithynia et Pontus","Galatia et Cappadocia","Syria","Iudaea"],"Britannia": ["Britannia"], "Dalmatia": ["Dalmatia"], "Gallia": ["Lugdunensis","Belgica","Aquitania","Narbonensis"],"Germania": ["Germania Superior","Germania Inferior"], "Hispania": ["Tarraconensis","Baetica","Lusitania"],"Macedon": ["Macedonia"], "Pannonia": ["Pannonia Superior","Pannonia Inferior"], "Peloponnesus": ["Achaia"],"Thrace": ["Thracia","Moesia Superior","Moesia Inferior"], "Bithynia": ["Bithynia et Pontus"],"Cappadocia": ["Galatia et Cappadocia"], "Ionia": ["Asia"], "Mysia": ["Asia"], "Pisidia": ["Galatia et Cappadocia"],"Syria": ["Syria","Iudaea"], "Cyrenaica": ["Creta et Cyrene"], "Egypt": ["Aegyptus"],
  "Italia — Regio I — Latium et Campania": ["Italia"],"Italia — Regio II — Apulia et Calabria": ["Italia"],"Italia — Regio III — Lucania et Bruttii": ["Italia"],"Italia — Regio IV — Samnium": ["Italia"],"Italia — Regio V — Picenum": ["Italia"],"Italia — Regio VI — Umbria et Ager Gallicus": ["Italia"],"Italia — Regio VII — Etruria": ["Italia"],"Italia — Regio VIII — Aemilia": ["Italia"],"Italia — Regio IX — Liguria": ["Italia"],"Italia — Regio X — Venetia et Histria": ["Italia"],"Italia — Regio XI — Transpadana": ["Italia"],"Sardinia": ["Sardinia et Corsica"], "Sicily": ["Sicilia"],
  "Gallia Cisalpina": ["Italia"], "Gallia Transalpina": ["Narbonensis","Lugdunensis"],"Hispania Citerior": ["Tarraconensis"], "Hispania Ulterior": ["Baetica","Lusitania"],"Bisaltian District": ["Macedonia"], "Inland Cities of Thrace": ["Thracia"], "The European Coast of the Propontis": ["Thracia"],"Asia Minor": ["Asia"], "Islands off Ionia": ["Asia"], "Commagene": ["Syria"], "Judaea": ["Iudaea"], "Phoenicia": ["Syria"], "Seleucis and Pieria": ["Syria"], "Zeugitana": ["Africa Proconsularis"],
  "Rome": ["Italia"], "Canusium": ["Italia"], "Luceria": ["Italia"], "Neapolis": ["Italia"], "Metapontum": ["Italia"], "Messana": ["Sicilia"],"Osca": ["Tarraconensis"], "Salpesa": ["Baetica"], "Massalia": ["Narbonensis"], "Lugdunum": ["Lugdunensis"], "Narbo": ["Narbonensis"],"Antioch, Syria": ["Syria"], "Laodiceia ad Lycum": ["Asia"], "Apollonia, Illyria": ["Macedonia"], "Corcyra": ["Macedonia"],"Sicily 1": ["Sicilia"], "Sicily 2": ["Sicilia"],"Italy (Central)": ["Italia"], "Italy (North)": ["Italia"], "Italy (South)": ["Italia"], "Italy (Southeast)": ["Italia"],"Eastern Roman Mint": ["Asia"], "Uncertain value": ["Italia"]
};
var REP_ISSUERS = [];
var RDB = { ready: true, issuers: [], cities: REP_CITIES, tree: REP_GEO_TREE, cityToSub: REP_CITY_TO_SUB, cityToSubsub: REP_CITY_TO_SUBSUB, tuples: [] };
fetchFirst(['issuer.csv'])
  .then(function(text){
    var rows = parseCSV(text);
    if(rows.length){
      var key = pickCol(rows[0], ['issuer', 'issuers']);
      if(key){
        REP_ISSUERS = rows.map(function(r){ return r[key]; }).filter(Boolean).sort();
        RDB.issuers = REP_ISSUERS;
        REP_ISSUERS.forEach(function(i){ RDB.tuples.push({ i: i }); });
      }
    }
    rebuildMintTypeIndex();
  })
  .catch(function(e){ console.warn("issuer.csv non caricato:", e); });