document.addEventListener('DOMContentLoaded', () => {
    const sidebarLeft = document.querySelector('.sidebar-left');
    const sidebarRight = document.querySelector('.sidebar-right');
    const sidebarLeftToggle = document.getElementById('sidebarLeftToggle');
    const sidebarRightToggle = document.getElementById('sidebarRightToggle');
    const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');
    const body = document.body;
    const mainContent = document.querySelector('.main-content');

    const closeSidebar = (sidebar, toggleButton, direction) => {
        sidebar.classList.remove('active');
        sidebar.style.transform = `translateX(${direction === 'left' ? '-100%' : '100%'})`;
        toggleButton.blur(); // Remove focus to reset button color
        if (mobileSidebarOverlay) mobileSidebarOverlay.classList.remove('active');
        body.classList.remove('no-scroll');

        sidebar.addEventListener('transitionend', function handler() {
            if (!sidebar.classList.contains('active')) {
                sidebar.style.display = 'none';
            }
            sidebar.removeEventListener('transitionend', handler);
        });
    };

    const openSidebar = (sidebar, direction) => {
        sidebar.classList.add('active');
        sidebar.style.display = 'block';
        if (mobileSidebarOverlay) mobileSidebarOverlay.classList.add('active');
        body.classList.add('no-scroll');
        setTimeout(() => {
            sidebar.style.transform = 'translateX(0)';
        }, 10);
    };

    if (sidebarLeftToggle) {
        sidebarLeftToggle.addEventListener('click', () => {
            if (sidebarLeft.classList.contains('active')) {
                closeSidebar(sidebarLeft, sidebarLeftToggle, 'left');
            } else {
                openSidebar(sidebarLeft, 'left');
            }
        });
    }

    const mobileRightSidebarMenu = document.getElementById('mobile-right-sidebar-menu');
    const mobileRightSidebarCloseBtn = document.getElementById('mobileRightSidebarCloseBtn');

    if (sidebarRightToggle) {
        sidebarRightToggle.addEventListener('click', () => {
            const rightSidebarContent = sidebarRight.querySelector('ul').cloneNode(true);
            const mobileMenuContent = mobileRightSidebarMenu.querySelector('.mobile-right-sidebar-content');
            mobileMenuContent.innerHTML = '';
            mobileMenuContent.appendChild(rightSidebarContent);
            mobileRightSidebarMenu.classList.add('active');
            if (mobileSidebarOverlay) mobileSidebarOverlay.classList.add('active');
            body.classList.add('no-scroll');
        });
    }

    const closeMobileRightSidebar = () => {
        mobileRightSidebarMenu.classList.remove('active');
        if (mobileSidebarOverlay) mobileSidebarOverlay.classList.remove('active');
        body.classList.remove('no-scroll');
    };

    if (mobileRightSidebarCloseBtn) {
        mobileRightSidebarCloseBtn.addEventListener('click', closeMobileRightSidebar);
    }


    // Close sidebars when clicking outside on mobile or on the overlay
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 1024) {
            if (sidebarLeft.classList.contains('active') && !sidebarLeft.contains(event.target) && !sidebarLeftToggle.contains(event.target)) {
                closeSidebar(sidebarLeft, sidebarLeftToggle, 'left');
            }
            if (mobileSidebarOverlay && event.target === mobileSidebarOverlay) {
                if (sidebarLeft.classList.contains('active')) {
                    closeSidebar(sidebarLeft, sidebarLeftToggle, 'left');
                }
                if (mobileRightSidebarMenu.classList.contains('active')) {
                    closeMobileRightSidebar();
                }
            }
        }
    });

    // Handle initial state and resize
    const handleResize = () => {
        if (window.innerWidth > 1024) {
            sidebarLeft.style.display = 'block';
            sidebarLeft.style.transform = 'translateX(0)';
            sidebarLeft.classList.remove('active');


            body.classList.remove('no-scroll');
            if (mobileSidebarOverlay) mobileSidebarOverlay.classList.remove('active');

            if (sidebarLeftToggle) sidebarLeftToggle.style.display = 'none';
            if (sidebarRightToggle) sidebarRightToggle.style.display = 'none';
        } else {
            sidebarLeft.style.display = 'none';
            sidebarLeft.style.transform = 'translateX(-100%)';
            sidebarLeft.classList.remove('active');


            body.classList.remove('no-scroll');
            if (mobileSidebarOverlay) mobileSidebarOverlay.classList.remove('active');

            if (sidebarLeftToggle) sidebarLeftToggle.style.display = 'flex';
            if (sidebarRightToggle) sidebarRightToggle.style.display = 'flex';
        }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial load

    // --- "On this page" functionality (Right Sidebar) ---
    const generateTableOfContents = () => {
        const headings = mainContent.querySelectorAll('h2, h3'); // Select h2 and h3 for TOC
        const tocList = sidebarRight.querySelector('ul');
        tocList.innerHTML = ''; // Clear existing items

        headings.forEach((heading, index) => {
            const id = heading.id || `heading-${index}`; // Ensure heading has an ID
            heading.id = id;

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = heading.textContent;
            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });
    };

    const activateScrollSpy = () => {
        const sections = mainContent.querySelectorAll('h2, h3');
        const tocLinks = sidebarRight.querySelectorAll('ul li a');

        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px 0px -50% 0px', // Adjust this to control when a section becomes active
            threshold: 0 // As soon as any part of the target is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const targetId = entry.target.id;
                const correspondingLink = sidebarRight.querySelector(`a[href="#${targetId}"]`);

                if (correspondingLink) {
                    const listItem = correspondingLink.parentElement;
                    if (entry.isIntersecting) {
                        listItem.classList.add('active');
                    } else {
                        listItem.classList.remove('active');
                    }
                }
            });

            // Ensure only one link is active at a time, or the topmost visible
            let activeLinkFound = false;
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const rect = section.getBoundingClientRect();
                if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                    // This section is currently in the middle of the viewport
                    const targetId = section.id;
                    tocLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${targetId}`) {
                            link.parentElement.classList.add('active');
                        } else {
                            link.parentElement.classList.remove('active');
                        }
                    });
                    activeLinkFound = true;
                    break;
                }
            }
            if (!activeLinkFound) {
                // If no section is clearly in the middle, remove all active classes
                tocLinks.forEach(link => link.parentElement.classList.remove('active'));
            }

        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });

        // Handle clicks on TOC links to scroll smoothly
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Close sidebar after clicking a link on mobile
                }
            });
        });
    };

    // Initial calls for "On this page" functionality
    generateTableOfContents();
    activateScrollSpy();

    // --- Close left sidebar when a link is clicked ---
    if (sidebarLeft) {
        sidebarLeft.addEventListener('click', (event) => {
            // Check if the clicked element is a link inside the sidebar
            if (event.target.tagName === 'A' || event.target.closest('a')) {
                if (window.innerWidth <= 1024 && sidebarLeft.classList.contains('active')) {
                    closeSidebar(sidebarLeft, sidebarLeftToggle, 'left');
                }
            }
        });
    }

    // --- Initialize Marked.js with extensions and custom renderer ---
    if (window.marked && window.markedExtensions) {
        // Create a new renderer instance to extend the default one
        const customRenderer = new marked.Renderer();
        // Apply custom code renderer overrides
        Object.assign(customRenderer, window.markedExtensions.renderer);

        marked.use({
            extensions: window.markedExtensions.extensions,
            renderer: customRenderer
        });

        // Function to load and render markdown
        const loadMarkdown = async (filePath) => {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const markdown = await response.text();
                document.getElementById('dynamic-content-area').innerHTML = marked.parse(markdown);
                generateTableOfContents(); // Re-generate TOC for new content
                activateScrollSpy(); // Re-activate scroll spy
                addCopyButtonListeners(); // Add listeners for copy buttons
            } catch (error) {
                console.error('Error loading markdown:', error);
                document.getElementById('dynamic-content-area').innerHTML = `<p>Error loading content.</p>`;
            }
        };

        // Example: Load a default markdown file or based on URL parameter
        // For now, let's assume 'docs/example-features.md' is the default to test
        // You would typically get this from a URL parameter or a navigation click
        loadMarkdown('docs/example-features.md');
    }

    // --- Copy to clipboard functionality for code blocks with improved feedback ---
    const addCopyButtonListeners = () => {
        document.querySelectorAll('.copy-code-btn').forEach(button => {
            button.addEventListener('click', () => {
                const codeToCopy = button.getAttribute('data-clipboard-text');
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    // Store original HTML to restore later
                    const originalHTML = button.innerHTML;

                    // Add copied class and change content
                    button.classList.add('copied');
                    button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';

                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.classList.remove('copied');
                        button.innerHTML = originalHTML;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);

                    // Show error feedback
                    const originalHTML = button.innerHTML;
                    button.classList.add('error');
                    button.innerHTML = '<i class="fa-solid fa-xmark"></i> Failed';

                    setTimeout(() => {
                        button.classList.remove('error');
                        button.innerHTML = originalHTML;
                    }, 2000);
                });
            });
        });
    };

    // --- Listen for TOC regeneration events from search ---
    document.addEventListener('regenerateTOC', () => {
        generateTableOfContents();
        activateScrollSpy();
        addCopyButtonListeners();
    });

    // --- Listen for markdown loaded events from docs-products.js ---
    document.addEventListener('markdownLoaded', () => {
        addCopyButtonListeners();
    });
});
