document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    const header = document.querySelector('header');

    if (header) { // Only header is needed for scroll logic
        // Handle header visibility on scroll for mobile
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
                    // Scrolling down and past header height
                    header.classList.add('hidden');
                } else {
                    // Scrolling up or at the top
                    header.classList.remove('hidden');
                }
                lastScrollTop = scrollTop;
            }
        });

        // Handle initial state and resize
        const handleResize = () => {
            if (window.innerWidth > 768) {
                header.classList.remove('hidden'); // Ensure header is visible on larger screens
            }
            // mobileMenuToggle display is handled by mobile-menu.js
            // mainNav display is handled by CSS
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call on initial load
    }
});
