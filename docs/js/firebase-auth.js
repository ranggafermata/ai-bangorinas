// Firebase Auth — client-side SDK initialization and helpers
// Uses Firebase v9+ compat (CDN) loaded in HTML pages

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyA2cscqCDLvty4lclaBRPZl9tg9Q1zdPLo',
  authDomain: 'ai-bangorinas.firebaseapp.com',
  projectId: 'ai-bangorinas',
  messagingSenderId: '758146089799'
};

let _firebaseApp = null;
let _firebaseAuth = null;

function initFirebase() {
  if (_firebaseApp) return;
  _firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
  _firebaseAuth = firebase.auth();
}

// Get the auth instance
function getAuth() {
  if (!_firebaseAuth) initFirebase();
  return _firebaseAuth;
}

// Get current user (null if not signed in)
function getCurrentUser() {
  return getAuth().currentUser;
}

// Sign up with email & password
async function signUpWithEmail(email, password) {
  const auth = getAuth();
  return auth.createUserWithEmailAndPassword(email, password);
}

// Sign in with email & password
async function signInWithEmail(email, password) {
  const auth = getAuth();
  return auth.signInWithEmailAndPassword(email, password);
}

// Sign in with Google
async function signInWithGoogle() {
  const auth = getAuth();
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
}

// Sign out
async function signOut() {
  return getAuth().signOut();
}

// Listen for auth state changes
function onAuthChanged(callback) {
  return getAuth().onAuthStateChanged(callback);
}

// Update nav UI based on auth state
function initAuthUI() {
  initFirebase();
  onAuthChanged(user => {
    document.querySelectorAll('.nav-auth-logged-out').forEach(el => {
      el.classList.toggle('hidden', !!user);
    });
    document.querySelectorAll('.nav-auth-logged-in').forEach(el => {
      el.classList.toggle('hidden', !user);
    });
    if (user) {
      // Set user initial or photo
      document.querySelectorAll('.nav-user-avatar').forEach(avatar => {
        if (user.photoURL) {
          avatar.innerHTML = `<img src="${encodeURI(user.photoURL)}" alt="Avatar" referrerpolicy="no-referrer" />`;
        } else {
          const initial = (user.displayName || user.email || '?')[0].toUpperCase();
          avatar.textContent = initial;
        }
      });
      document.querySelectorAll('.nav-user-name').forEach(el => {
        el.textContent = user.displayName || user.email.split('@')[0];
      });
    }
  });
}
