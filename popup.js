document.addEventListener('DOMContentLoaded', () => {
    // Mode Elements
    const fullOption = document.getElementById('mode-full');
    const lyricOnlyOption = document.getElementById('mode-lyriconly');

    // Theme Elements
    const themeLightBtn = document.getElementById('theme-light');
    const themeDarkBtn = document.getElementById('theme-dark');

    // Language Elements
    const langFrBtn = document.getElementById('lang-fr');
    const langEnBtn = document.getElementById('lang-en');
    const langPlBtn = document.getElementById('lang-pl');

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

        // Theme
        document.body.classList.toggle('light-mode', !state.isDarkMode);
        if (state.isDarkMode) {
            themeDarkBtn.classList.add('active');
            themeLightBtn.classList.remove('active');
        } else {
            themeLightBtn.classList.add('active');
            themeDarkBtn.classList.remove('active');
        }

        // Language
        [langFrBtn, langEnBtn, langPlBtn].forEach(btn => btn.classList.remove('active'));
        if (state.language === 'en') langEnBtn.classList.add('active');
        else if (state.language === 'pl') langPlBtn.classList.add('active');
        else langFrBtn.classList.add('active');
    }

    // Get current status from content script
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || !tabs[0] || !tabs[0].url || !tabs[0].url.includes('genius.com')) {
                status.textContent = "Available only on Genius.com";
                document.querySelectorAll('.card, .btn-pill').forEach(el => {
                    el.style.opacity = '0.5';
                    el.style.pointerEvents = 'none';
                });
                return;
            }
            currentTabId = tabs[0].id;

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
    } catch (err) {
        console.error("Popup init error:", err);
        status.textContent = "Initialization error";
    }

    // Actions
    function sendMessage(action, data) {
        if (!currentTabId) return;
        status.textContent = "Updating...";
        chrome.tabs.sendMessage(currentTabId, { action, ...data }, (response) => {
            status.textContent = "Saved! Reloading...";
            setTimeout(() => window.close(), 800);
        });
    }

    // Event Listeners
    fullOption.addEventListener('click', () => sendMessage("SET_MODE", { lyricCardOnly: false }));
    lyricOnlyOption.addEventListener('click', () => sendMessage("SET_MODE", { lyricCardOnly: true }));

    themeLightBtn.addEventListener('click', () => sendMessage("SET_THEME", { isDarkMode: false }));
    themeDarkBtn.addEventListener('click', () => sendMessage("SET_THEME", { isDarkMode: true }));

    langFrBtn.addEventListener('click', () => sendMessage("SET_LANGUAGE", { language: 'fr' }));
    langEnBtn.addEventListener('click', () => sendMessage("SET_LANGUAGE", { language: 'en' }));
    langPlBtn.addEventListener('click', () => sendMessage("SET_LANGUAGE", { language: 'pl' }));

    document.getElementById('restart-tutorial').addEventListener('click', () => {
        if (!currentTabId) return;
        chrome.tabs.sendMessage(currentTabId, { action: "RESET_TUTORIAL" });
        window.close();
    });
});
