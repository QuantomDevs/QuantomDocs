/**
 * Downloads Page JavaScript
 * Handles scroll navigation, OS detection, dropdowns, and copy functionality
 */

document.addEventListener('DOMContentLoaded', function () {

    // ==================== 1. SMOOTH SCROLLING & ACTIVE NAV LINKS ====================

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.product-section');

    // Click events for smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Get the sticky nav height to offset scroll position
                const navOffset = 130; // sticky header + nav height
                const elementPosition = targetSection.offsetTop;
                const offsetPosition = elementPosition - navOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight active link on scroll
    const observerOptions = {
        rootMargin: '-140px 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // ==================== 2. OS DETECTION & DOWNLOAD BUTTON ACTIVATION ====================

    /**
     * Detect user's operating system
     * @returns {string} 'mac', 'windows', or 'linux'
     */
    function detectUserOS() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();

        if (platform.includes('mac') || userAgent.includes('mac')) {
            return 'mac';
        }
        if (platform.includes('win') || userAgent.includes('windows')) {
            return 'windows';
        }
        if (platform.includes('linux') || userAgent.includes('linux') || userAgent.includes('x11')) {
            return 'linux';
        }

        // Default to mac if unable to detect
        return 'mac';
    }

    const userOS = detectUserOS();
    const activeButton = document.querySelector(`.download-button[data-os="${userOS}"]`);

    if (activeButton) {
        activeButton.classList.add('active');
    }

    // ==================== 3. MACOS DROPDOWN FUNCTIONALITY ====================

    const macosGroup = document.getElementById('macos-group');

    if (macosGroup) {
        const macosButton = macosGroup.querySelector('.download-button[data-os="mac"]');

        if (macosButton) {
            macosButton.addEventListener('click', (e) => {
                e.preventDefault();
                macosGroup.classList.toggle('open');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!macosGroup.contains(e.target)) {
                    macosGroup.classList.remove('open');
                }
            });

            // Handle dropdown item clicks
            const dropdownItems = macosGroup.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const itemText = item.textContent.trim();
                    console.log(`%cDownload initiated: ${itemText}`, 'color: #26bd6c; font-weight: bold;');

                    // TODO: Implement actual download logic here
                    // Example:
                    // if (itemText.includes('ARM64')) {
                    //     window.location.href = '/downloads/quantom-mac-arm64.dmg';
                    // } else if (itemText.includes('x64')) {
                    //     window.location.href = '/downloads/quantom-mac-x64.dmg';
                    // }

                    // Close dropdown after selection
                    macosGroup.classList.remove('open');
                });
            });
        }
    }

    // ==================== 4. OTHER DOWNLOAD BUTTONS ====================

    const downloadButtons = document.querySelectorAll('.download-button[data-os]');
    downloadButtons.forEach(button => {
        // Skip the macOS button as it has dropdown functionality
        if (button.getAttribute('data-os') !== 'mac') {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const os = button.getAttribute('data-os');
                console.log(`Downloading for: ${os}`);

                // TODO: Implement actual download logic here
            });
        }
    });

    // ==================== 5. INSTALL BUTTON ====================

    const installButton = document.querySelector('.install-button');
    if (installButton) {
        installButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Installing JetBrains Plugin...');

            // TODO: Implement actual installation logic or redirect
            // Example: window.open('https://plugins.jetbrains.com/plugin/xxxxx', '_blank');
        });
    }

    // ==================== 6. COPY TO CLIPBOARD FUNCTIONALITY ====================

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy text:', err);

            // Fallback method for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            } catch (err) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    }

    /**
     * Show copy success feedback
     * @param {HTMLElement} button - The copy button element
     */
    function showCopySuccess(button) {
        const originalIcon = button.innerHTML;

        // Change to checkmark icon
        button.innerHTML = `
            <svg class="copy-icon" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        button.title = "Copied!";
        button.style.color = 'var(--text-success)';

        // Revert after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalIcon;
            button.title = "Copy to clipboard";
            button.style.color = '';
        }, 2000);
    }

    // Handle all copy buttons
    const copyButtons = document.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const container = button.closest('.cli-command, .compose-command-container');
            if (!container) return;

            let textToCopy = '';

            // CLI Command
            const commandTextElement = container.querySelector('.command-text');
            if (commandTextElement) {
                // Get the full command from data attribute
                textToCopy = commandTextElement.getAttribute('data-full-command') || commandTextElement.textContent.trim();
            }

            // Docker Compose
            const composeTextArea = container.querySelector('.compose-text');
            if (composeTextArea) {
                textToCopy = composeTextArea.value;
            }

            if (textToCopy) {
                const success = await copyToClipboard(textToCopy);
                if (success) {
                    showCopySuccess(button);
                }
            }
        });
    });

    // ==================== 7. CTA BUTTON ====================

    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            // Smooth scroll to app section
            e.preventDefault();
            const appSection = document.querySelector('#app');
            if (appSection) {
                const navOffset = 130;
                const elementPosition = appSection.offsetTop;
                const offsetPosition = elementPosition - navOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // ==================== 8. KEYBOARD ACCESSIBILITY ====================

    // Add keyboard navigation for download buttons
    downloadButtons.forEach(button => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });

    // Add keyboard navigation for nav links
    navLinks.forEach(link => {
        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click();
            }
        });
    });

    // ==================== 9. SCROLL TO TOP ON PAGE LOAD ====================

    // Scroll to top when page loads to ensure consistent experience
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }

    // ==================== 10. CONSOLE INFO ====================

    console.log(`%c
    ╔═══════════════════════════════════════╗
    ║   Quantom Downloads Page Loaded      ║
    ║   Detected OS: ${userOS.toUpperCase().padEnd(26)} ║
    ╚═══════════════════════════════════════╝
    `, 'color: #26bd6c; font-family: monospace;');

    // ==================== 11. TSPARTICLES CONFIGURATION ====================

    // Check if tsParticles is loaded
    if (typeof tsParticles !== 'undefined') {
        // Load and configure the tsParticles instance
        tsParticles.load("tsparticles", {
            // IMPORTANT: Disable fullscreen mode to contain particles within the container
            fullScreen: {
                enable: false,
                zIndex: 1
            },
            // Background is transparent as it comes from the CSS section
            background: {
                color: {
                    value: "transparent"
                }
            },
            // We don't want interactivity with the mouse
            interactivity: {
                events: {
                    onHover: {
                        enable: false,
                    },
                    onClick: {
                        enable: false,
                    },
                    resize: true
                }
            },
            // Here we define the appearance and behavior of the particles (stars)
            particles: {
                // Color of the stars
                color: {
                    value: "#ffffff"
                },
                // No lines between the stars
                links: {
                    enable: false
                },
                // Particles are moving
                move: {
                    enable: true,
                    speed: 0.4, // very slow
                    direction: "none", // in random directions
                    random: true,
                    straight: false,
                    outModes: {
                        default: "out" // Disappear at the edge
                    }
                },
                // Number of stars
                number: {
                    value: 120, // A moderate number
                    density: {
                        enable: true,
                        area: 800 // Distributed over an area
                    }
                },
                // Opacity (important for the "twinkle" effect)
                opacity: {
                    value: { min: 0.1, max: 0.6 }, // Random opacity between 10% and 60%
                    animation: {
                        enable: true, // Opacity is animated
                        speed: 0.8,   // Slow fade in and out
                        sync: false
                    }
                },
                // Shape of the stars (circles)
                shape: {
                    type: "circle"
                },
                // Size of the stars
                size: {
                    value: { min: 0.5, max: 2.0 } // Random size for a natural look
                }
            }
        });

        console.log('%ctsParticles initialized successfully', 'color: #26bd6c; font-weight: bold;');
    } else {
        console.warn('tsParticles library not loaded');
    }

});
