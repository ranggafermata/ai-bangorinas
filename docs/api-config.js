<!-- Add this script BEFORE Firebase scripts -->
<script>
  // Detect if we're running locally or on GitHub/deployed
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Get API URL from window variable or use default
  window.API_URL = window.API_URL || (isLocal ? 'http://localhost:3000' : 'https://ai-bangorinas.onrender.com');
  
  console.log('API URL:', window.API_URL);
</script>
