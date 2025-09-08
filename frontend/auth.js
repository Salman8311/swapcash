// 🔐 Authentication Utility Functions

// Helper: parse JWT payload safely
function getTokenPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch (err) {
    return null;
  }
}

// Check if user is authenticated (also checks token expiry)
function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  return !isTokenExpired();
}

// Get stored user data
function getCurrentUser() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

// Get stored auth token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Store authentication data
function storeAuthData(token, userData) {
  localStorage.setItem('authToken', token);
  if (userData) localStorage.setItem('userData', JSON.stringify(userData));
}

// Clear authentication data
function clearAuthData() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Redirect to home if already authenticated
function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = 'index.html';
    return true;
  }
  return false;
}

// Add auth header to fetch requests
function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  options.headers = options.headers || {};
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return fetch(url, options);
}

// Logout function
function logout() {
  clearAuthData();
  window.location.href = 'login.html';
}

// Check token expiration (basic check)
function isTokenExpired() {
  const token = getAuthToken();
  if (!token) return true;

  try {
    const payload = getTokenPayload(token);
    if (!payload || typeof payload.exp !== 'number') return true;
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
}
