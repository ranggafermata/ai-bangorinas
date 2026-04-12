// Firestore download links — fetches secure download URLs from Firestore
// Download links are NOT stored in client-side code. They live in Firestore
// and are only accessible to authenticated users via security rules.
//
// Firestore structure:
//   Collection: "downloads"
//   Document ID: product ID (e.g., "effort-2-rapid")
//   Fields: { url: "https://drive.google.com/..." }

let _firestore = null;

function getFirestoreDB() {
  if (!_firestore) {
    initFirebase();
    _firestore = firebase.firestore();
  }
  return _firestore;
}

// Fetch download link for a single product (requires auth)
async function getDownloadLink(productId) {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    const doc = await getFirestoreDB().collection('downloads').doc(productId).get();
    if (doc.exists) {
      return doc.data().url || null;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch download link:', err.message);
    return null;
  }
}

// Fetch download links for multiple products at once
async function getDownloadLinks(productIds) {
  const user = getCurrentUser();
  if (!user) return {};

  const links = {};
  try {
    const promises = productIds.map(async (id) => {
      const doc = await getFirestoreDB().collection('downloads').doc(id).get();
      if (doc.exists) {
        links[id] = doc.data().url || null;
      }
    });
    await Promise.all(promises);
  } catch (err) {
    console.error('Failed to fetch download links:', err.message);
  }
  return links;
}
