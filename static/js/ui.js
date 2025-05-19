// UI Controls

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    document.getElementById('dark-mode-toggle').checked = isDarkMode;
}

function saveDarkMode(isDarkMode) {
    localStorage.setItem('darkMode', isDarkMode);
}

function initMinimapDrag() {
    const minimap = document.getElementById('minimap');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    minimap.addEventListener('mousedown', (e) => {
        isDragging = true;
        initialX = e.clientX - currentX;
        initialY = e.clientY - currentY;
        minimap.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        // Keep minimap within viewport bounds
        const minimapRect = minimap.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        currentX = Math.max(0, Math.min(currentX, viewportWidth - minimapRect.width));
        currentY = Math.max(0, Math.min(currentY, viewportHeight - minimapRect.height));

        minimap.style.left = `${currentX}px`;
        minimap.style.bottom = `${viewportHeight - currentY - minimapRect.height}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        minimap.style.cursor = 'grab';
    });

    // Initialize position and cursor
    const minimapRect = minimap.getBoundingClientRect();
    currentX = minimapRect.left;
    currentY = minimapRect.top;
    minimap.style.cursor = 'grab';
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Load dark mode preference
    loadDarkMode();

    // Initialize minimap dragging
    initMinimapDrag();

    // Toggle settings panel
    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation();  // Prevent click from propagating to document
        settingsPanel.classList.toggle('visible');
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && settingsPanel.classList.contains('visible')) {
            settingsPanel.classList.remove('visible');
        }
    });

    // Prevent game controls when interacting with settings
    settingsPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Handle dark mode toggle
    darkModeToggle.addEventListener('change', (e) => {
        const isDarkMode = e.target.checked;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
        saveDarkMode(isDarkMode);
    });
}