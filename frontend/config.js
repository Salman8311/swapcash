(function() {
    var isNative = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform;
    var baseUrl = 'http://localhost:3000';

    // Check if we're in production (deployed)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        baseUrl = 'https://college-cash-swap-backend.onrender.com';
    }

    try {
        var stored = localStorage.getItem('apiBaseUrl');
        if (stored) {
            baseUrl = stored;
        } else if (isNative) {
            var ua = navigator.userAgent || '';
            if (/Android/i.test(ua)) {
                baseUrl = 'http://10.0.2.2:3000';
            }
        }
    } catch (e) {}

    window.API_BASE_URL = baseUrl;
})();


