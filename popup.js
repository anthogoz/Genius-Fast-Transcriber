document.addEventListener('DOMContentLoaded', () => {
    const fullOption = document.getElementById('mode-full');
    const lyricOnlyOption = document.getElementById('mode-lyriconly');
    const status = document.getElementById('status');
    let currentTabId = null;

    function updateUI(isLyricOnly) {
        if (isLyricOnly) {
            lyricOnlyOption.classList.add('active');
            fullOption.classList.remove('active');
        } else {
            fullOption.classList.add('active');
            lyricOnlyOption.classList.remove('active');
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

        chrome.tabs.sendMessage(currentTabId, { action: "GET_MODE" }, (response) => {
            if (chrome.runtime.lastError) {
                // Si le script de contenu n'est pas encore chargé (ex: nouvelle installation sans reload)
                status.textContent = "Please reload the Genius page";
                return;
            }
            if (response) {
                updateUI(response.lyricCardOnly);
                status.textContent = "Ready";
            }
        });
    });

    // Set setting
    function setMode(lyricCardOnly) {
        if (!currentTabId) return;

        status.textContent = "Saving...";
        chrome.tabs.sendMessage(currentTabId, { action: "SET_MODE", lyricCardOnly: lyricCardOnly }, (response) => {
            updateUI(lyricCardOnly);
            status.textContent = "Setting saved! Reloading...";
            setTimeout(() => window.close(), 1500);
        });
    }

    fullOption.addEventListener('click', () => setMode(false));
    lyricOnlyOption.addEventListener('click', () => setMode(true));
});
