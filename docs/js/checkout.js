// Dodo Payments — server-verified purchases via Firebase Cloud Functions
// Purchases are stored in Firestore (not localStorage) and verified via Dodo API
(function () {
  const FUNCTIONS_REGION = 'asia-southeast1';
  let _functions = null;

  function getFunctions() {
    if (!_functions) {
      initFirebase();
      _functions = firebase.app().functions(FUNCTIONS_REGION);
    }
    return _functions;
  }

  // ─── Read purchases from Firestore ────────────────────────────────────────
  // Returns array of product IDs the current user has purchased
  async function getPurchases() {
    const user = getCurrentUser();
    if (!user) return [];
    try {
      const snap = await getFirestoreDB()
        .collection('purchases')
        .doc(user.uid)
        .collection('items')
        .get();
      return snap.docs.map(d => d.data().productId);
    } catch (err) {
      console.error('Failed to fetch purchases:', err.message);
      return [];
    }
  }

  // Check if a specific product is purchased (async)
  async function isPurchased(productId) {
    const user = getCurrentUser();
    if (!user) return false;
    try {
      const doc = await getFirestoreDB()
        .collection('purchases')
        .doc(user.uid)
        .collection('items')
        .doc(productId)
        .get();
      return doc.exists;
    } catch {
      return false;
    }
  }

  // ─── Buy product ──────────────────────────────────────────────────────────
  // 1. Write pending purchase to Firestore (server-side record)
  // 2. Redirect to Dodo Payment Link (pre-filled with user email)
  async function buyProduct(product) {
    if (!product || !product.dodoLink || product.dodoLink === '#') {
      alert('Payment link is not configured yet. Please check back soon!');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
      return;
    }

    try {
      // Write pending purchase to Firestore
      await getFirestoreDB().collection('pendingPurchases').add({
        userId: user.uid,
        productId: product.id,
        email: (user.email || '').toLowerCase(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to save pending purchase:', err.message);
      alert('Something went wrong. Please try again.');
      return;
    }

    // Append email to Dodo link URL for pre-fill + webhook matching
    let paymentUrl = product.dodoLink;
    if (user.email) {
      const sep = paymentUrl.includes('?') ? '&' : '?';
      paymentUrl += sep + 'email=' + encodeURIComponent(user.email);
    }

    window.location.href = paymentUrl;
  }

  // ─── Verify purchase after Dodo redirect ──────────────────────────────────
  // Extracts payment_id from URL, calls verifyPayment Cloud Function
  // Returns: { success: true, productId } or { success: false, error }
  async function handlePurchaseReturn() {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id');
    const dodoStatus = params.get('status');

    // Only proceed if Dodo sent us back with status=succeeded + a payment_id
    if (!paymentId || dodoStatus !== 'succeeded') {
      return null;
    }

    // Clean URL params immediately
    const cleanUrl = new URL(window.location);
    cleanUrl.search = '';
    window.history.replaceState({}, '', cleanUrl);

    // Wait for auth to be ready
    const user = getCurrentUser();
    if (!user) return null;

    try {
      const verifyPayment = getFunctions().httpsCallable('verifyPayment');
      const result = await verifyPayment({ paymentId: paymentId });
      return { success: true, productId: result.data.productId };
    } catch (err) {
      console.error('Payment verification failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Expose globally
  window.checkout = {
    getPurchases,
    isPurchased,
    buyProduct,
    handlePurchaseReturn
  };
})();
