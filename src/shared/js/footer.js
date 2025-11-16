/**
 * Footer Module - Main Website Pages
 * Dynamically injects and manages footer
 * DO NOT use on documentation pages
 */

class FooterManager {
    constructor() {
        this.footer = null;
    }

    /**
     * Initialize footer - called automatically on DOM ready
     */
    init() {
        this.injectFooter();
    }

    /**
     * Generate and inject footer HTML
     */
    injectFooter() {
        const footerHTML = `
            <footer class="main-footer">
                <div class="footer-container">
                    <!-- Footer Top Section -->
                    <div class="footer-top">
                        <div class="footer-brand">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                <img src="/shared/images/favicon/favicon.png" alt="Quantom Logo" class="footer-logo-icon" style="width: 32px; height: 32px;">
                                <span class="footer-brand-name" style="font-size: 24px; font-weight: 700; color: var(--text-color);">QuantomDevs</span>
                            </div>
                            <div class="footer-socials">
                                <a href="https://discord.gg/hCHD8zSUCj" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="22" height="22" viewBox="0 0 22 22">
                                        <path d="M18.6361,3.8754887499999997C17.212,3.20918875,15.6893,2.72494875,14.0973,2.44921875C13.9018,2.80269575,13.6734,3.27812875,13.5159,3.6563387499999997C11.8236,3.40183475,10.1469,3.40183475,8.48573,3.6563387499999997C8.32827,3.27812875,8.09468,2.80269575,7.89741,2.44921875C6.30374,2.72494875,4.77928,3.21096775,3.35518,3.87901875C0.482756,8.21961875,-0.29591,12.45241875,0.0934236,16.62511875C1.99856,18.047818749999998,3.84487,18.91211875,5.66003,19.47761875C6.1082,18.86081875,6.50791,18.20511875,6.85224,17.51411875C6.19644,17.26491875,5.56832,16.957418750000002,4.97482,16.60041875C5.13227,16.48371875,5.28628,16.36171875,5.43508,16.236318750000002C9.05501,17.92941875,12.9882,17.92941875,16.5648,16.236318750000002C16.7154,16.36171875,16.8694,16.48371875,17.0251,16.60041875C16.4299,16.959118750000002,15.8,17.26661875,15.1442,17.51581875C15.4885,18.20511875,15.8865,18.86261875,16.3364,19.47931875C18.1533,18.91381875,20.0014,18.04961875,21.9065,16.62511875C22.3633,11.78788875,21.1261,7.59397875,18.6361,3.8754887499999997ZM7.34541,14.05891875C6.25874,14.05891875,5.36759,13.04441875,5.36759,11.80908875C5.36759,10.57371875,6.23972,9.55749875,7.34541,9.55749875C8.45114,9.55749875,9.34226,10.57193875,9.32323,11.80908875C9.32495,13.04441875,8.45114,14.05891875,7.34541,14.05891875ZM14.6545,14.05891875C13.5678,14.05891875,12.6767,13.04441875,12.6767,11.80908875C12.6767,10.57371875,13.5488,9.55749875,14.6545,9.55749875C15.7602,9.55749875,16.6514,10.57193875,16.6323,11.80908875C16.6323,13.04441875,15.7602,14.05891875,14.6545,14.05891875Z" fill="currentColor"></path>
                                    </svg>
                                </a>
                                <a href="https://github.com/QuantomDevs/QuantomDocs" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="22" height="22" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <!-- Footer Links Grid -->
                        <div class="footer-links">
                            <!-- Product Column -->
                            <div class="footer-column">
                                <h4 class="footer-title">Product</h4>
                                <a href="/pricing" class="footer-link">Pricing</a>
                                <a href="/download" class="footer-link">Downloads</a>
                            </div>

                            <!-- Resources Column -->
                            <div class="footer-column">
                                <h4 class="footer-title">Resources</h4>
                                <a href="https://docs.snenjih.de" target="_blank" rel="noopener noreferrer" class="footer-link">Docs</a>
                                <a href="/blog" class="footer-link">Blog</a>
                                <a href="https://docs.snenjih.de/troubleshooting/common-issue" target="_blank" rel="noopener noreferrer" class="footer-link">FAQs</a>
                                <a href="/changelog" class="footer-link">Changelog</a>
                            </div>

                            <!-- Terms Column -->
                            <div class="footer-column">
                                <h4 class="footer-title">Terms</h4>
                                <a href="/legal/privacy" class="footer-link">Privacy Policy</a>
                            </div>

                            <!-- Connect Column -->
                            <div class="footer-column">
                                <h4 class="footer-title">Connect</h4>
                                <a href="mailto:contact@snenjih.de" target="_blank" rel="noopener noreferrer" class="footer-link footer-link-external">
                                    <span>Contact</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" version="1.1" width="20" height="14" viewBox="0 0 28 28">
                                        <path d="M6.125000000000035,7.5251990463256835C6.125000000000031,7.718239046325683,6.281536,7.874769046325683,6.474576,7.874769046325683L18.887999999999998,7.874769046325683L6.248167,20.514599046325685C6.1120489,20.650699046325684,6.1114302,20.87279904632568,6.248167,21.009499046325683L6.990629,21.751999046325686C7.1267499999999995,21.888099046325685,7.34949,21.888099046325685,7.4856,21.751999046325686L20.1254,9.112209046325685L20.1248,21.524999046325682C20.1254,21.718599046325686,20.2813,21.874599046325685,20.475,21.875199046325683L21.524900000000002,21.874599046325685C21.718600000000002,21.875199046325683,21.8751,21.718599046325686,21.874499999999998,21.524999046325682L21.874499999999998,6.474611046325683C21.8751,6.280952046325684,21.718600000000002,6.124416571325684,21.524900000000002,6.125035290025684L6.474576,6.125035290025684C6.281536,6.125035290025684,6.125000000000033,6.281571046325683,6.125000000000035,6.474611046325683L6.125000000000035,7.5251990463256835Z" fill-rule="evenodd" fill="currentColor"></path>
                                    </svg>
                                </a>
                                <a href="https://forum.snenjih.de" target="_blank" rel="noopener noreferrer" class="footer-link">Forum</a>
                                <a href="/about-us" class="footer-link">About us</a>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Bottom Section -->
                    <div class="footer-bottom">
                        <span class="footer-copyright">
                            © 2025 <a href="/ablout-us" rel="noopener noreferrer">Quantom Developers</a>. All rights reserved.
                        </span>
                    </div>
                </div>
            </footer>
        `;

        // Insert footer at the end of body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
        this.footer = document.querySelector('.main-footer');
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FooterManager().init();
    });
} else {
    new FooterManager().init();
}

// Export for potential manual initialization
export default FooterManager;
