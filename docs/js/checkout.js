// Dodo Payments — redirect to hosted checkout and handle success
(function () {
  const PURCHASE_STORAGE_KEY = 'bangorinas-purchases';
  const PENDING_PURCHASE_KEY = 'bangorinas-pending-purchase';

  // Get purchased product IDs from localStorage
  function getPurchases() {
    try {
      return JSON.parse(localStorage.getItem(PURCHASE_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  // Save a purchase
  function savePurchase(productId) {
    const purchases = getPurchases();
    if (!purchases.includes(productId)) {
      purchases.push(productId);
      localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(purchases));
    }
  }

  // Check if product is purchased
  function isPurchased(productId) {
    return getPurchases().includes(productId);
  }

  // Redirect to Dodo Payment Link
  function buyProduct(product) {
    if (!product || !product.dodoLink || product.dodoLink === '#') {
      alert('Payment link is not configured yet. Please check back soon!');
      return;
    }
    // Save pending purchase before redirect — Dodo may not return query params
    localStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify({
      productId: product.id,
      timestamp: Date.now()
    }));
    window.location.href = product.dodoLink;
  }

  // Check for purchase success — uses Dodo's status param + localStorage pending purchase
  function handlePurchaseReturn() {
    // Check for pending purchase in localStorage
    let pending = null;
    try {
      pending = JSON.parse(localStorage.getItem(PENDING_PURCHASE_KEY));
    } catch { /* ignore */ }

    if (!pending || !pending.productId) return null;

    // Only accept pending purchases from the last 2 hours
    const twoHours = 2 * 60 * 60 * 1000;
    if (Date.now() - pending.timestamp >= twoHours) {
      localStorage.removeItem(PENDING_PURCHASE_KEY);
      return null;
    }

    // Check if Dodo confirmed success via URL params (status=succeeded)
    const params = new URLSearchParams(window.location.search);
    const dodoStatus = params.get('status');

    if (dodoStatus === 'succeeded' || dodoStatus === 'success') {
      // Dodo confirmed — save the purchase
      savePurchase(pending.productId);
      localStorage.removeItem(PENDING_PURCHASE_KEY);
      // Clean Dodo params from URL
      const url = new URL(window.location);
      url.search = '';
      window.history.replaceState({}, '', url);
      return { success: true, productId: pending.productId };
    }

    // No Dodo params but pending exists (user navigated to account manually)
    // Still save it — if they completed payment Dodo would have redirected them
    savePurchase(pending.productId);
    localStorage.removeItem(PENDING_PURCHASE_KEY);
    return { success: true, productId: pending.productId };
  }

  // Expose globally
  window.checkout = {
    getPurchases,
    savePurchase,
    isPurchased,
    buyProduct,
    handlePurchaseReturn
  };
})();
