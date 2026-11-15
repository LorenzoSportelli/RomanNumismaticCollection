  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
  import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
  import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

  function humanizeAuthError(e) {
    var map = {
      'auth/invalid-email': 'The email address you entered is not valid. Please check it and try again.',
      'auth/user-disabled': 'This account has been disabled. Please contact the administrator if you believe this is an error.',
      'auth/user-not-found': 'No account was found with this email address. Please check the spelling or create a new account.',
      'auth/wrong-password': 'The password you entered is incorrect. Please try again or use "Forgot password?" to reset it.',
      'auth/invalid-credential': 'The email or password you entered is incorrect. Please check both fields and try again.',
      'auth/invalid-login-credentials': 'The email or password you entered is incorrect. Please check both fields and try again.',
      'auth/too-many-requests': 'Too many failed attempts have been made from this device. Please wait a few minutes before trying again.',
      'auth/network-request-failed': 'The connection to the server failed. Please check your internet connection and try again.',
      'auth/email-already-in-use': 'An account with this email address already exists. Please sign in instead, or use a different email.',
      'auth/weak-password': 'The password you chose is too weak. Please use at least 6 characters.',
      'auth/operation-not-allowed': 'This sign-in method is not currently enabled. Please contact the administrator.',
      'auth/missing-email': 'Please enter your email address first, then click "Forgot password?".',
      'auth/expired-action-code': 'This link has expired. Please request a new one and try again.',
      'auth/invalid-action-code': 'This link is no longer valid. Please request a new one and try again.',
      'auth/requires-recent-login': 'For security reasons, you must log in again before performing this operation. Please click LOGOUT, sign in, and try again.',
      'auth/credential-already-in-use': 'This email address is already linked to another account. Please use a different one.',
      'auth/multi-factor-auth-required': 'Two-factor verification is required for this account. Please complete the verification to continue.',
      'auth/invalid-verification-code': 'The verification code you entered is not valid. Please check it and try again.'
    };
    if (e && e.code && map[e.code]) return map[e.code];
    if (e && e.message) return e.message.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^)]+\)\.?$/,'').trim();
    return 'An unexpected error occurred. Please try again.';
  }

  var firebaseConfig = {
    apiKey: "AIzaSyCNUZOPwefVZFTsD66qvVgELWtkUoWJIJE",
    authDomain: "rncm-84799.firebaseapp.com",
    projectId: "rncm-84799",
    storageBucket: "rncm-84799.firebasestorage.app",
    messagingSenderId: "48204932245",
    appId: "1:48204932245:web:e066f8251d4d5f49b8a79c"
  };

  var app = initializeApp(firebaseConfig);
  var auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(function(){});
  var db = getFirestore(app);

  var isRegisterMode = false;

  window.showPopup = function(title, message) {
    var settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.classList.remove('open');
    document.getElementById('popup-title').textContent = title;
    document.getElementById('popup-message').textContent = message;
    document.getElementById('custom-popup').classList.add('open');
  };

  window.closePopup = function() {
    document.getElementById('custom-popup').classList.remove('open');
  };

  window.toggleAuthMode = function() {
    isRegisterMode = !isRegisterMode;
    document.getElementById('auth-submit').textContent = isRegisterMode ? 'REGISTER' : 'SIGN IN';
    document.getElementById('auth-switch-mode').textContent = isRegisterMode ? 'Already have an account? Log in' : "Don't have an account? Register";
    document.getElementById('auth-error').style.display = 'none';
  };

  window.handleAuthSubmit = async function() {
    var email = document.getElementById('auth-email').value;
    var password = document.getElementById('auth-password').value;
    var btn = document.getElementById('auth-submit');
    var err = document.getElementById('auth-error');
    err.style.display = 'none';
    btn.textContent = 'Loading…';
    btn.disabled = true;
    try {
      if (isRegisterMode) {
        var userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        isRegisterMode = false;
        document.getElementById('auth-submit').textContent = 'SIGN IN';
        document.getElementById('auth-switch-mode').textContent = "Don't have an account? Register";
        showPopup("REGISTRATION SUCCESSFUL", "Please check your email inbox to verify your account.");
      } else {
        var uc = await signInWithEmailAndPassword(auth, email, password);
        if (!uc.user.emailVerified) {
          await sendEmailVerification(uc.user);
        }
        document.getElementById('auth-screen').style.display = 'none';
      }
    } catch (e) {
      err.textContent = humanizeAuthError(e);
      err.style.display = 'block';
    } finally {
      btn.textContent = isRegisterMode ? 'REGISTER' : 'SIGN IN';
      btn.disabled = false;
    }
  };

  window.logoutUser = function() {
    document.getElementById('logout-confirm-modal').classList.add('open');
    var settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.classList.remove('open');
  };

  window.closeLogoutConfirm = function() {
    document.getElementById('logout-confirm-modal').classList.remove('open');
  };

  window.confirmLogout = function() {
    document.getElementById('logout-confirm-modal').classList.remove('open');
    try {
      localStorage.removeItem('numismatica_v2');
      localStorage.removeItem('numismatica_nid');
      localStorage.removeItem('numismatica_tags');
    } catch(e){}
    signOut(auth);
  };

  window.handleForgotPassword = async function() {
    var email = document.getElementById('auth-email').value;
    if (!email) {
      showPopup("EMAIL REQUIRED", "Please enter your email address first, then click 'Forgot password'.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showPopup("EMAIL SENT", "We have sent a password reset link to your email. Please check your inbox (and spam folder).");
    } catch (e) {
      showPopup("ERROR", humanizeAuthError(e));
    }
  };

window.toggleSettings = function() {
    var modal = document.getElementById('settings-modal');
    if (modal.classList.contains('open')) {
      modal.classList.remove('open');
    } else {
      modal.classList.add('open');
      if (auth.currentUser) {
        document.getElementById('settings-email-val').textContent = auth.currentUser.email;
      }
      
      var currentF = safeGet('numismatica_set_defFilter') || 'all';
      var currentM = safeGet('numismatica_set_mapDef') || 'none';
      document.getElementById('settings-def-filter').value = currentF;
      document.getElementById('settings-map-def').value = currentM;
    }
  };

  window.saveSetting = function(key, value) {
    safeSet('numismatica_set_' + key, value);
    if (key === 'defFilter') setFilter(value);
    if (key === 'mapDef') setMintMode(value);
  };

  window.exportCSV = function() {
    if (!coins.length) return showPopup('ERROR', 'No coins to export.');
    var headers = ['ID','Period','Reference','Province','Region','Mint/City','Reign','Authority','Magistrate','Metal','Denomination','Date','Description','Notes'];
    var rows = [headers.join(',')];
    coins.forEach(c => {
      var gn = coinGeoNames(c);
      var row = [
        c.id, periodName(c.period), c.ref||'', gn.provs.join(' | '), gn.regions.join(' | '), gn.cities.join(' | '),
        c.reign||'', coinAuthority(c), coinMagNames(c).join(' | '), c.metal||'', c.denom||'', c.date||'', c.desc||'', c.notes||''
      ];
      rows.push(row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','));
    });
    var blob = new Blob(['\uFEFF' + rows.join('\n')], {type: 'text/csv;charset=utf-8;'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'coins-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  window.exportJSON = function() {
    if (!coins.length) return showPopup('ERROR', 'No coins to export.');
    var dataStr = JSON.stringify(coins, null, 2);
    var blob = new Blob([dataStr], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'coins-backup-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  window.importJSON = function(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        var added = 0;
        imported.forEach(ic => {
          if (!ic.id) ic.id = nextId++;
          var existing = coins.find(c => c.id === ic.id);
          if (!existing) { coins.push(ic); added++; }
        });
        persistLocal(); renderList(); updateMap(); if (typeof renderMints === 'function') renderMints();
        showPopup('IMPORT SUCCESS', added + ' coins imported successfully.');
      } catch(err) {
        showPopup('IMPORT ERROR', 'The file is not a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  window.exportMap = async function() {
    try {
      const mod = await import("https://cdn.jsdelivr.net/npm/leaflet-image@0.4.0/leaflet-image.min.js");
      const leafletImage = mod.default;
      const mapContainer = document.getElementById('map');
      const legend = document.getElementById('legend');
      
      const originalTransform = legend.style.transform;
      legend.style.transform = 'none';
      legend.style.position = 'absolute';
      legend.style.bottom = '20px';
      legend.style.right = '20px';
      legend.style.left = 'auto';
      
      leafletImage(map, function(err, canvas) {
        legend.style.transform = originalTransform;
        legend.style.position = '';
        legend.style.bottom = '';
        legend.style.right = '';
        legend.style.left = '';
        
        if (err) return showPopup('ERROR', 'Could not generate map image.');
        
        const ctx = canvas.getContext('2d');
        const legCanvas = document.createElement('canvas');
        legCanvas.width = 200; legCanvas.height = 50;
        const lctx = legCanvas.getContext('2d');
        
        lctx.fillStyle = '#f7f2e6';
        lctx.fillRect(0, 0, 200, 50);
        lctx.strokeStyle = '#cdc2aa';
        lctx.strokeRect(0.5, 0.5, 199, 49);
        
        const grad = lctx.createLinearGradient(10, 0, 150, 0);
        grad.addColorStop(0, '#e5ddc9');
        grad.addColorStop(0.4, '#b89860');
        grad.addColorStop(0.75, '#8b3a2a');
        grad.addColorStop(1, '#4a1a10');
        lctx.fillStyle = grad;
        lctx.fillRect(10, 20, 140, 10);
        
        lctx.fillStyle = '#1f1a12';
        lctx.font = '10px Inter, sans-serif';
        lctx.fillText('0', 10, 45);
        lctx.fillText(document.getElementById('legmax').textContent, 150, 45);
        
        ctx.drawImage(legCanvas, canvas.width - 220, canvas.height - 70);
        
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a'); a.href = url; a.download = 'roman-map-' + new Date().toISOString().slice(0,10) + '.png';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      });
    } catch (e) {
      showPopup('ERROR', 'Failed to load image generator.');
    }
  };

  window.openLabelsScreen = function() {
    document.getElementById('labels-screen').classList.add('open');
    renderLabels();
  };

  window.renderLabels = function() {
    var sheet = document.getElementById('labels-sheet');
    var format = document.getElementById('label-format').value;
    var type = document.getElementById('label-type').value;
    
    sheet.className = 'labels-sheet ' + format;
    sheet.innerHTML = '';
    
    selectedCoins.forEach(function(id) {
      var c = coins.find(x => x.id === id);
      if (!c) return;
      
      var gn = coinGeoNames(c);
      var ref = c.ref || '';
      var auth = coinAuthority(c);
      var mint = gn.cities[0] || '';
      var date = c.date || '';
      var metal = c.metal || '';
      var denom = c.denom || '';
      
      var html = '<div class="label-card ' + format + '">';
      
      if (type === 'with-img') {
        html += '<div class="l-imgs">';
        html += '<img src="logo.png" style="background:#fff;opacity:0.2;object-fit:contain;" title="Front image placeholder">';
        html += '<img src="logo.png" style="background:#fff;opacity:0.2;object-fit:contain;" title="Back image placeholder">';
        html += '</div>';
      }
      
      html += '<div class="l-ref" contenteditable="true">' + esc(ref) + '</div>';
      html += '<div class="l-auth" contenteditable="true">' + esc(auth) + '</div>';
      html += '<div class="l-mint" contenteditable="true">' + esc(mint) + '</div>';
      
      html += '<div class="l-meta">';
      html += '<span contenteditable="true">' + esc(date) + '</span>';
      html += '<span contenteditable="true">' + esc(denom) + ' ' + esc(metal) + '</span>';
      html += '</div>';
      
      html += '<div class="l-logo">';
      html += '<img src="logo.png" alt="MRNC" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">';
      html += '<span style="display:none">MRNC</span>';
      html += '</div>';
      
      html += '</div>';
      
      sheet.innerHTML += html;
    });
  };

  onAuthStateChanged(auth, async function(user) {
    if (user) {
      window.currentUser = user;
      if (!user.emailVerified) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('verify-block-screen').style.display = 'flex';
        document.getElementById('verify-email-display').textContent = user.email;
        var info = document.getElementById('user-info');
        if (info) info.remove();
        return;
      }
      document.getElementById('verify-block-screen').style.display = 'none';
      document.getElementById('auth-screen').style.display = 'none';
      var info2 = document.getElementById('user-info');
      if (!info2) {
        document.getElementById('hdr-right').insertAdjacentHTML('afterbegin', '<div id="user-info"></div>');
        info2 = document.getElementById('user-info');
      }
      info2.innerHTML = '';
      try {
        await loadCoinsFromFirebase(user.uid);
      } catch(e) {
        console.error('Load coins error:', e);
        showPopup('LOAD ERROR', 'Could not load your collection from the cloud. Your local coins are still available.');
      }
      window._authReady = true;
      if (window.checkAppReady) window.checkAppReady();
    } else {
      document.getElementById('auth-screen').style.display = 'flex';
      document.getElementById('verify-block-screen').style.display = 'none';
      window.currentUser = null;
      document.getElementById('auth-submit').textContent = 'SIGN IN';
      document.getElementById('auth-password').value = '';
      var info3 = document.getElementById('user-info');
      if (info3) info3.remove();
      coins = [];
      renderList();
      updateMap();
      if (typeof renderMints === 'function') renderMints();
      window._authReady = true;
      if (window.checkAppReady) window.checkAppReady();
    }
  });

  window.checkVerificationNow = async function() {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        window.location.reload();
      } else {
        showPopup("NOT VERIFIED YET", "Please check your inbox and click the verification link.");
      }
    }
  };

  window.resendVerificationEmail = async function() {
    if (auth.currentUser) {
      try {
        var mod = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
        await mod.sendEmailVerification(auth.currentUser);
        showPopup("EMAIL SENT", "A new verification link has been sent to your email. Please check your inbox (and spam folder).");
      } catch (e) {
        showPopup("ERROR", humanizeAuthError(e));
      }
    }
  };

  window.loadCoinsFromFirebase = async function(uid) {
    var coinsRef = collection(db, "coins");
    var q = query(coinsRef, where("userId", "==", uid));
    var querySnapshot = await getDocs(q);
    var cloudCoins = [];
    querySnapshot.forEach(function(d){ cloudCoins.push(d.data()); });
    var byId = {};
    coins.forEach(function(c){ byId[c.id] = c; });
    cloudCoins.forEach(function(c){ byId[c.id] = c; });
    coins = Object.keys(byId).map(function(k){ return byId[k]; });
    coins.forEach(function(c){
      if(typeof c.id !== 'number'){
        c.id = parseInt(c.id, 10);
        if(isNaN(c.id)) c.id = nextId++;
      }
      if(c.id >= nextId) nextId = c.id + 1;
    });
    
    var defF = safeGet('numismatica_set_defFilter') || 'all';
    setFilter(defF);
    var defM = safeGet('numismatica_set_mapDef') || 'none';
    setMintMode(defM);
    
    renderList();
    updateMap();
    if (typeof renderMints === 'function') renderMints();
  };