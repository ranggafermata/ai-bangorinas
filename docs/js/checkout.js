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

  // Check for purchase success — handles both URL params and pending purchase fallback
  function handlePurchaseReturn() {
    // Method 1: Check URL query params (if Dodo sends them)
    const params = new URLSearchParams(window.location.search);
    const status = params.get('purchase');
    const productId = params.get('product');

    if (status === 'success' && productId) {
      savePurchase(productId);
      localStorage.removeItem(PENDING_PURCHASE_KEY);
      const url = new URL(window.location);
      url.searchParams.delete('purchase');
      url.searchParams.delete('product');
      window.history.replaceState({}, '', url);
      return { success: true, productId };
    }

    // Method 2: Check pending purchase from localStorage
    try {
      const pending = JSON.parse(localStorage.getItem(PENDING_PURCHASE_KEY));
      if (pending && pending.productId) {
        // Only accept pending purchases from the last 2 hours
        const twoHours = 2 * 60 * 60 * 1000;
        if (Date.now() - pending.timestamp < twoHours) {
          savePurchase(pending.productId);
          localStorage.removeItem(PENDING_PURCHASE_KEY);
          return { success: true, productId: pending.productId };
        } else {
          // Expired — clear it
          localStorage.removeItem(PENDING_PURCHASE_KEY);
        }
      }
    } catch { /* ignore */ }

    return null;
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
