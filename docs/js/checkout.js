// Dodo Payments — redirect to hosted checkout and handle success
(function () {
  const PURCHASE_STORAGE_KEY = 'bangorinas-purchases';

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
    window.location.href = product.dodoLink;
  }

  // Check for purchase success redirect (from Dodo Payments)
  function handlePurchaseReturn() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('purchase');
    const productId = params.get('product');

    if (status === 'success' && productId) {
      savePurchase(productId);
      // Clean URL
      const url = new URL(window.location);
      url.searchParams.delete('purchase');
      url.searchParams.delete('product');
      window.history.replaceState({}, '', url);
      return { success: true, productId };
    }
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
