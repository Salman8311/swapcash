// 🔐 Authentication Utility Functions

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token !== null;
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
    localStorage.setItem('userData', JSON.stringify(userData));
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
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (error) {
        return true;
    }
}
