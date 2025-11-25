document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileOverlayMenu = document.getElementById('mobile-overlay-menu');
    const closeBtn = document.getElementById('mobileMenuCloseBtn');
    const body = document.body;

    if (mobileMenuToggle && mobileOverlayMenu && closeBtn) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileOverlayMenu.classList.add('active');
            body.classList.add('no-scroll');
        });

        closeBtn.addEventListener('click', () => {
            mobileOverlayMenu.classList.remove('active');
            body.classList.remove('no-scroll');
        });

        // Close menu when any link is clicked
        const allLinks = mobileOverlayMenu.querySelectorAll('a');
        allLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileOverlayMenu.classList.remove('active');
                body.classList.remove('no-scroll');
            });
        });

        // Close menu when clicking outside (optional, but good for UX)
        mobileOverlayMenu.addEventListener('click', (event) => {
            if (event.target === mobileOverlayMenu) {
                mobileOverlayMenu.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });

        // Handle language dropdown in mobile menu
        const languageDropdown = mobileOverlayMenu.querySelector('.language-dropdown');
        if (languageDropdown) {
            languageDropdown.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent closing the menu when clicking the dropdown
                languageDropdown.classList.toggle('active');
            });

            // Close dropdown if clicking outside
            document.addEventListener('click', (event) => {
                if (!languageDropdown.contains(event.target)) {
                    languageDropdown.classList.remove('active');
                }
            });
        }
    }

    // Handle initial state and resize for mobile menu toggle button visibility
    const handleResize = () => {
        if (window.innerWidth > 768) {
            if (mobileMenuToggle) mobileMenuToggle.style.display = 'none';
            if (mobileOverlayMenu) {
                mobileOverlayMenu.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        } else {
            if (mobileMenuToggle) mobileMenuToggle.style.display = 'block';
        }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial load
});
