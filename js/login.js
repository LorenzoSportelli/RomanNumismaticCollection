import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNUZOPwefVZFTsD66qvVgELWtkUoWJIJE",
  authDomain: "rncm-84799.firebaseapp.com",
  projectId: "rncm-84799",
  storageBucket: "rncm-84799.firebasestorage.app",
  messagingSenderId: "48204932245",
  appId: "1:48204932245:web:e066f8251d4d5f49b8a79c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

let isRegisterMode = false;

function humanizeAuthError(e) {
  const map = {
    'auth/invalid-email': 'The email address you entered is not valid. Please check it and try again.',
    'auth/user-disabled': 'This account has been disabled. Please contact the administrator.',
    'auth/user-not-found': 'No account was found with this email address. Please check the spelling or create a new account.',
    'auth/wrong-password': 'The password you entered is incorrect. Please try again or use "Forgot password?".',
    'auth/invalid-credential': 'The email or password you entered is incorrect. Please check both fields and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes before trying again.',
    'auth/network-request-failed': 'The connection to the server failed. Please check your internet connection.',
    'auth/email-already-in-use': 'An account with this email address already exists. Please sign in instead.',
    'auth/weak-password': 'The password you chose is too weak. Please use at least 6 characters.',
    'auth/missing-email': 'Please enter your email address first, then click "Forgot password?".'
  };
  if (e && e.code && map[e.code]) return map[e.code];
  if (e && e.message) return e.message.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^)]+\)\.?$/,'').trim();
  return 'An unexpected error occurred. Please try again.';
}

window.showPopup = function(title, message) {
  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-message').textContent = message;
  document.getElementById('custom-popup').classList.add('open');
};

window.closePopup = function() {
  document.getElementById('custom-popup').classList.remove('open');
};

function showError(msg) {
  const err = document.getElementById('auth-error');
  if (msg) {
    err.textContent = msg;
    err.style.display = 'block';
  } else {
    err.style.display = 'none';
  }
}

window.toggleAuthMode = function() {
  isRegisterMode = !isRegisterMode;
  
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const submitBtn = document.getElementById('auth-submit');
  const switchText = document.getElementById('auth-switch-text');
  const switchBtn = document.getElementById('auth-switch-mode');
  
  if (isRegisterMode) {
    title.textContent = "Create Account";
    subtitle.textContent = "Join NarratioNummi today";
    submitBtn.textContent = "Register";
    switchText.textContent = "Already have an account?";
    switchBtn.textContent = "Sign in";
  } else {
    title.textContent = "Welcome Back";
    subtitle.textContent = "Sign in to your collection";
    submitBtn.textContent = "Sign In";
    switchText.textContent = "Don't have an account?";
    switchBtn.textContent = "Create one";
  }
  showError(null);
};

window.handleAuthSubmit = async function() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const btn = document.getElementById('auth-submit');

  showError(null);
  btn.textContent = 'Loading...';
  btn.disabled = true;

  try {
    if (isRegisterMode) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      isRegisterMode = false;
      toggleAuthMode();
      
      showPopup("Registration Successful", "Please check your email inbox to verify your account.");
    } else {
      const uc = await signInWithEmailAndPassword(auth, email, password);
      
      if (!uc.user.emailVerified) {
        await sendEmailVerification(uc.user);
        showPopup("Email Not Verified", "Please check your inbox and click the verification link before logging in.");
        await signOut(auth);
        return;
      }
      
      window.location.href = "map.html";
    }
  } catch (e) {
    showError(humanizeAuthError(e));
  } finally {
    btn.textContent = isRegisterMode ? 'Register' : 'Sign In';
    btn.disabled = false;
  }
};

window.handleForgotPassword = async function() {
  const email = document.getElementById('auth-email').value;
  if (!email) {
    showPopup("Email Required", "Please enter your email address first, then click 'Forgot password?'.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    showPopup("Email Sent", "We have sent a password reset link to your email. Please check your inbox (and spam folder).");
  } catch (e) {
    showPopup("Error", humanizeAuthError(e));
  }
};

document.getElementById('auth-form').addEventListener('submit', function(e) {
  e.preventDefault();
  window.handleAuthSubmit();
});