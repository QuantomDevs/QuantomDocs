// Initialize docs sidebar functionality after header is loaded
function initDocsSidebar() {
    const sidebarLeft = document.querySelector('.sidebar-left');
    const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');
    const body = document.body;

    // Get the menu toggle button
    const docsMenuToggle = document.getElementById('docsMenuToggle');
    if (!docsMenuToggle) {
        console.warn('docsMenuToggle not found in initDocsSidebar');
        return;
    }

    // Mark as initialized to prevent double initialization
    if (docsMenuToggle.hasAttribute('data-sidebar-initialized')) {
        console.log('Sidebar already initialized, skipping');
        return;
    }
    docsMenuToggle.setAttribute('data-sidebar-initialized', 'true');

    console.log('Initializing sidebar toggle functionality');

    const closeSidebar = () => {
        if (!sidebarLeft) return;
        sidebarLeft.classList.remove('active');
        sidebarLeft.style.transform = 'translateX(-100%)';
        if (mobileSidebarOverlay) mobileSidebarOverlay.classList.remove('active');
        body.classList.remove('no-scroll');
    };

    const openSidebar = () => {
        if (!sidebarLeft) return;
        sidebarLeft.classList.add('active');
        sidebarLeft.style.display = 'block';
        if (mobileSidebarOverlay) mobileSidebarOverlay.classList.add('active');
        body.classList.add('no-scroll');
        setTimeout(() => {
            sidebarLeft.style.transform = 'translateX(0)';
        }, 10);
    };

    // Toggle sidebar on menu button click
    docsMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebarLeft.classList.contains('active')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    // Close sidebar when clicking overlay
    if (mobileSidebarOverlay) {
        mobileSidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 1024) {
            const docsMenu = document.getElementById('docsMenuToggle');
            if (sidebarLeft.classList.contains('active') &&
                !sidebarLeft.contains(event.target) &&
                (!docsMenu || !docsMenu.contains(event.target))) {
                closeSidebar();
            }
        }
    });

    // Handle window resize
    const handleResize = () => {
        if (window.innerWidth > 1024) {
            if (sidebarLeft) {
                sidebarLeft.style.display = 'block';
                sidebarLeft.style.transform = 'translateX(0)';
                sidebarLeft.classList.remove('active');
            }
            body.classList.remove('no-scroll');
            if (mobileSidebarOverlay) mobileSidebarOverlay.classList.remove('active');
        } else {
            if (sidebarLeft && !sidebarLeft.classList.contains('active')) {
                sidebarLeft.style.transform = 'translateX(-100%)';
            }
        }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
}

// Initialize sidebar immediately when this script loads
// The header should already be injected by common.js
function initSidebarWhenReady() {
    const docsMenuToggle = document.getElementById('docsMenuToggle');
    if (docsMenuToggle) {
        console.log('Docs menu button found, initializing sidebar...');
        initDocsSidebar();
    } else {
        console.log('Docs menu button not found, waiting...');
        // Retry after a short delay
        setTimeout(initSidebarWhenReady, 50);
    }
}

// Start initialization
initSidebarWhenReady();

// Also listen to the event as fallback
window.addEventListener('headerInjected', () => {
    console.log('Header injected event received');
    const docsMenuToggle = document.getElementById('docsMenuToggle');
    if (docsMenuToggle && !docsMenuToggle.hasAttribute('data-initialized')) {
        initDocsSidebar();
        docsMenuToggle.setAttribute('data-initialized', 'true');
    }
});

// ... (bestehender Code in docs.js)

// Event Listener für dynamisch geladenen Content
document.addEventListener('markdownLoaded', () => {
    // Kurze Verzögerung, damit das DOM sicher bereit ist
    setTimeout(addCopyButtonListeners, 50);
});

// Initial call for static content
document.addEventListener('DOMContentLoaded', () => {
    addCopyButtonListeners();
});