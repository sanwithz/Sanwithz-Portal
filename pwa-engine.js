// Ensure the script runs after the DOM is fully loaded and APP_CONFIG is defined
window.addEventListener('DOMContentLoaded', () => {
    // 0. Fallback Config if not defined
    if (typeof APP_CONFIG === 'undefined') {
        console.error("APP_CONFIG is not defined. Please define it in index.html");
        return;
    }

    // 1. Inject Styles
    const style = document.createElement('style');
    style.textContent = `
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        iframe { border: none; width: 100%; height: 100vh; display: block; }
    `;
    document.head.appendChild(style);

    // 2. Set Title
    document.title = APP_CONFIG.name;

    // 3. Inject Iframe
    const iframe = document.createElement('iframe');
    iframe.src = APP_CONFIG.url;
    document.body.appendChild(iframe);

    // 4. Inject Manifest Link Placeholder if not exists
    if (!document.querySelector('link[rel="manifest"]')) {
        const link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
    }

    // 5. Generate and Inject Manifest
    const manifestData = {
        name: APP_CONFIG.name,
        short_name: "App",
        start_url: window.location.href,
        display: "standalone",
        background_color: APP_CONFIG.backgroundColor || "#ffffff",
        theme_color: APP_CONFIG.themeColor || "#d3d3d3",
        icons: [
            {
                src: "https://cdn-icons-png.flaticon.com/512/8512/8512379.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "https://cdn-icons-png.flaticon.com/512/8512/8512379.png",
                sizes: "512x512",
                type: "image/png"
            }
        ]
    };

    const manifestBlob = new Blob([JSON.stringify(manifestData, null, 2)], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(manifestBlob);
    document.querySelector('link[rel="manifest"]').href = manifestURL;

    // 6. Service Worker Logic
    const swCode = `
        self.addEventListener('install', (e) => {
            e.waitUntil(
                caches.open('app-store').then((cache) => cache.addAll([
                    self.registration.scope
                ]))
            );
        });

        self.addEventListener('fetch', (e) => {
            e.respondWith(
                caches.match(e.request).then((response) => response || fetch(e.request))
            );
        });
    `;

    // 7. Register Service Worker
    if ('serviceWorker' in navigator) {
        const swBlob = new Blob([swCode], {type: 'text/javascript'});
        const swURL = URL.createObjectURL(swBlob);
        
        navigator.serviceWorker.register(swURL)
            .then((reg) => console.log('Service Worker registered', reg))
            .catch((err) => console.log('Service Worker registration failed', err));
    }
});
