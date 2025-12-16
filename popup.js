document.addEventListener('DOMContentLoaded', () => {
    const fullOption = document.getElementById('mode-full');
    const lyricOnlyOption = document.getElementById('mode-lyriconly');
    const langFrOption = document.getElementById('lang-fr');
    const langEnOption = document.getElementById('lang-en');
    const status = document.getElementById('status');
    let currentTabId = null;

    function updateUI(state) {
        // Mode
        if (state.lyricCardOnly) {
            lyricOnlyOption.classList.add('active');
            fullOption.classList.remove('active');
        } else {
            fullOption.classList.add('active');
            lyricOnlyOption.classList.remove('active');
        }

        // Language
        if (state.language === 'en') {
            langEnOption.classList.add('active');
            langFrOption.classList.remove('active');
        } else {
            // Default FR
            langFrOption.classList.add('active');
            langEnOption.classList.remove('active');
        }
    }

    // Get current setting
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0] || !tabs[0].url.includes('genius.com')) {
            status.textContent = "Available only on Genius.com";
            fullOption.style.opacity = '0.5';
            lyricOnlyOption.style.opacity = '0.5';
            fullOption.style.pointerEvents = 'none';
            lyricOnlyOption.style.pointerEvents = 'none';
            return;
        }
        currentTabId = tabs[0].id;

        // On demande le statut complet (Mode + Langue)
        chrome.tabs.sendMessage(currentTabId, { action: "GET_STATUS" }, (response) => {
            if (chrome.runtime.lastError) {
                status.textContent = "Please reload the Genius page";
                return;
            }
            if (response) {
                updateUI(response);
                status.textContent = "Ready";
            }
        });
    });

    // Set Mode
    function setMode(lyricCardOnly) {
        if (!currentTabId) return;
        status.textContent = "Saving Mode...";
        chrome.tabs.sendMessage(currentTabId, { action: "SET_MODE", lyricCardOnly: lyricCardOnly }, (response) => {
            status.textContent = "Mode saved! Reloading...";
            setTimeout(() => window.close(), 1000);
        });
    }

    // Set Language
    function setLanguage(lang) {
        if (!currentTabId) return;
        status.textContent = "Saving Language...";
        chrome.tabs.sendMessage(currentTabId, { action: "SET_LANGUAGE", language: lang }, (response) => {
            status.textContent = "Language saved! Reloading...";
            setTimeout(() => window.close(), 1000);
        });
    }

    fullOption.addEventListener('click', () => setMode(false));
    lyricOnlyOption.addEventListener('click', () => setMode(true));

    document.getElementById('lang-fr').addEventListener('click', () => setLanguage('fr'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('restart-tutorial').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "RESET_TUTORIAL" });
                window.close(); // Close popup
            }
        });
    });
});
