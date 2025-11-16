/**
 * Documentation Footer Module
 * Minimal footer for documentation pages only
 * Contains social media links and copyright information
 */

class DocsFooterManager {
    constructor() {
        this.footer = null;
    }

    /**
     * Initialize docs footer - called automatically on DOM ready
     */
    init() {
        this.injectFooter();
    }

    /**
     * Generate and inject docs footer HTML
     */
    injectFooter() {
        const footerHTML = `
            <footer class="docs-footer">
                <div class="docs-footer-container">
                    <!-- Social Media Links (Left) -->
                    <div class="docs-footer-social">
                        <a href="https://discord.gg/hCHD8zSUCj" target="_blank" rel="noopener noreferrer" aria-label="Discord" class="docs-social-link">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="20" height="20" viewBox="0 0 22 22">
                                <path d="M18.6361,3.8754887499999997C17.212,3.20918875,15.6893,2.72494875,14.0973,2.44921875C13.9018,2.80269575,13.6734,3.27812875,13.5159,3.6563387499999997C11.8236,3.40183475,10.1469,3.40183475,8.48573,3.6563387499999997C8.32827,3.27812875,8.09468,2.80269575,7.89741,2.44921875C6.30374,2.72494875,4.77928,3.21096775,3.35518,3.87901875C0.482756,8.21961875,-0.29591,12.45241875,0.0934236,16.62511875C1.99856,18.047818749999998,3.84487,18.91211875,5.66003,19.47761875C6.1082,18.86081875,6.50791,18.20511875,6.85224,17.51411875C6.19644,17.26491875,5.56832,16.957418750000002,4.97482,16.60041875C5.13227,16.48371875,5.28628,16.36171875,5.43508,16.236318750000002C9.05501,17.92941875,12.9882,17.92941875,16.5648,16.236318750000002C16.7154,16.36171875,16.8694,16.48371875,17.0251,16.60041875C16.4299,16.959118750000002,15.8,17.26661875,15.1442,17.51581875C15.4885,18.20511875,15.8865,18.86261875,16.3364,19.47931875C18.1533,18.91381875,20.0014,18.04961875,21.9065,16.62511875C22.3633,11.78788875,21.1261,7.59397875,18.6361,3.8754887499999997ZM7.34541,14.05891875C6.25874,14.05891875,5.36759,13.04441875,5.36759,11.80908875C5.36759,10.57371875,6.23972,9.55749875,7.34541,9.55749875C8.45114,9.55749875,9.34226,10.57193875,9.32323,11.80908875C9.32495,13.04441875,8.45114,14.05891875,7.34541,14.05891875ZM14.6545,14.05891875C13.5678,14.05891875,12.6767,13.04441875,12.6767,11.80908875C12.6767,10.57371875,13.5488,9.55749875,14.6545,9.55749875C15.7602,9.55749875,16.6514,10.57193875,16.6323,11.80908875C16.6323,13.04441875,15.7602,14.05891875,14.6545,14.05891875Z" fill="currentColor"></path>
                            </svg>
                        </a>
                        <a href="https://github.com/QuantomDevs" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="docs-social-link">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="20" height="20" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M10 0C4.475 0 0 4.475 0 10C0 14.425 2.8625 18.1625 6.8375 19.4875C7.3375 19.575 7.525 19.275 7.525 19.0125C7.525 18.775 7.5125 17.9875 7.5125 17.15C5 17.6125 4.35 16.5375 4.15 15.975C4.0375 15.6875 3.55 14.8 3.125 14.5625C2.775 14.375 2.275 13.9125 3.1125 13.9C3.9 13.8875 4.4625 14.625 4.65 14.925C5.55 16.4375 6.9875 16.0125 7.5625 15.75C7.65 15.1 7.9125 14.6625 8.2 14.4125C5.975 14.1625 3.65 13.3 3.65 9.475C3.65 8.3875 4.0375 7.4875 4.675 6.7875C4.575 6.5375 4.225 5.5125 4.775 4.1375C4.775 4.1375 5.6125 3.875 7.525 5.1625C8.325 4.9375 9.175 4.825 10.025 4.825C10.875 4.825 11.725 4.9375 12.525 5.1625C14.4375 3.8625 15.275 4.1375 15.275 4.1375C15.825 5.5125 15.475 6.5375 15.375 6.7875C16.0125 7.4875 16.4 8.375 16.4 9.475C16.4 13.3125 14.0625 14.1625 11.8375 14.4125C12.2 14.725 12.5125 15.325 12.5125 16.2625C12.5125 17.6 12.5 18.675 12.5 19.0125C12.5 19.275 12.6875 19.5875 13.1875 19.4875C17.1375 18.1625 20 14.4125 20 10C20 4.475 15.525 0 10 0Z" fill="currentColor"></path>
                            </svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" class="docs-social-link">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="20" height="20" viewBox="0 0 20 20">
                                <path d="M15.751 2.5H18.532L12.481 9.372L19.5 17.5H13.891L9.572 12.338L4.659 17.5H1.877L8.354 10.145L1.5 2.5H7.238L11.131 7.174L15.751 2.5ZM14.793 16.04H16.312L6.275 4.047H4.645L14.793 16.04Z" fill="currentColor"></path>
                            </svg>
                        </a>
                    </div>

                    <!-- Copyright (Right) -->
                    <div class="docs-footer-copyright">
                        <span>© All rights reserved.</span>
                    </div>
                </div>
            </footer>
        `;

        // Insert footer at the end of the main documentation content
        const mainContent = document.querySelector('.docs-main-content') || document.querySelector('main') || document.body;
        mainContent.insertAdjacentHTML('afterend', footerHTML);
        this.footer = document.querySelector('.docs-footer');
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DocsFooterManager().init();
    });
} else {
    new DocsFooterManager().init();
}

// Export for potential manual initialization
export default DocsFooterManager;
