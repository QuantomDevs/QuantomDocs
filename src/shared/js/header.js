/**
 * Header Module - Main Website Pages
 * Dynamically injects and manages header navigation
 * DO NOT use on documentation pages
 */

class HeaderManager {
    constructor() {
        this.header = null;
        this.mobileMenuOpen = false;
        this.currentPage = window.location.pathname;
    }

    /**
     * Initialize header - called automatically on DOM ready
     */
    init() {
        this.injectHeader();
        this.attachEventListeners();
        this.highlightCurrentPage();
    }

    /**
     * Generate and inject header HTML
     */
    injectHeader() {
        const headerHTML = `
            <header class="main-header">
                <!-- Mobile Menu Overlay -->
                <div class="mobile-menu-overlay" id="mobile-menu-overlay">
                    <div class="mobile-menu-content">
                        <div class="mobile-menu-scroll">
                            <!-- Resources Section -->
                            <div class="mobile-menu-section">
                                <div class="mobile-section-header">
                                    <p class="mobile-section-title">Resources</p>
                                    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="section-arrow">
                                        <path d="M15.25 6.5L9 12.75L2.75 6.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </div>
                                <div class="mobile-section-content">
                                    <div class="mobile-links-group">
                                        <p class="mobile-category">Explore</p>
                                        <a class="mobile-link-item" href="/startups">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path opacity="0.2" fill-rule="evenodd" clip-rule="evenodd" d="M7.42376 4.28638C11.3448 0.549344 15.9148 0.998682 16.2994 1.04445C16.6433 1.08538 16.9145 1.35644 16.9555 1.70032C17.0014 2.08438 17.4506 6.6552 13.7136 10.5762C11.4565 12.9444 8.93668 13.743 8.08223 13.9775C7.82226 14.0489 7.544 13.9753 7.35338 13.7846L4.21548 10.6467C4.02485 10.4561 3.9512 10.1778 4.02256 9.91787C4.25708 9.06348 5.05548 6.54358 7.42376 4.28638Z" fill="currentColor"></path>
                                                    <path d="M8.05112 3.72748C7.84066 3.9025 7.6313 4.08857 7.42376 4.28637C5.82189 5.81311 4.93823 7.46004 4.46149 8.63047C3.87064 8.62075 3.35841 8.67395 2.95575 8.7417C2.64551 8.7939 2.40215 8.85442 2.2404 8.90037C2.15959 8.92334 2.09939 8.94259 2.06163 8.95524C2.04277 8.96157 2.02953 8.96625 2.02217 8.96888L2.01562 8.97127C1.70942 9.08721 1.36321 8.99114 1.16061 8.73369C0.95749 8.47557 0.945953 8.11532 1.13214 7.84473L3.38782 4.56658C3.86364 3.8945 4.44415 3.53831 5.13069 3.42602C5.75112 3.32454 6.41491 3.43439 7.02435 3.54365L8.05112 3.72748Z" fill="currentColor"></path>
                                                    <path d="M11.75 7.75C12.578 7.75 13.25 7.07848 13.25 6.25C13.25 5.42152 12.578 4.75 11.75 4.75C10.922 4.75 10.25 5.42152 10.25 6.25C10.25 7.07848 10.922 7.75 11.75 7.75Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.66472 12.13C2.91639 12.0034 3.22087 12.0525 3.42005 12.2517L5.74813 14.5803C5.94728 14.7795 5.99628 15.0839 5.8697 15.3355C5.4791 16.112 4.67793 16.6588 3.73582 16.6588H1.99422C1.63353 16.6588 1.34113 16.3664 1.34113 16.0057V14.2642C1.34113 13.3217 1.88822 12.5206 2.66472 12.13Z" fill="currentColor"></path>
                                                    <path d="M9.36939 13.5386C9.37909 14.1294 9.32589 14.6415 9.25815 15.0441C9.20595 15.3544 9.14543 15.5977 9.09947 15.7595C9.07651 15.8403 9.05725 15.9005 9.0446 15.9383C9.03827 15.9571 9.0336 15.9704 9.03096 15.9777L9.02856 15.9843C8.91262 16.2905 9.0087 16.6367 9.26615 16.8393C9.52426 17.0424 9.8845 17.0539 10.1551 16.8678L13.4251 14.6179L13.4334 14.6121C14.1055 14.1363 14.4617 13.5558 14.5739 12.8692C14.6753 12.2487 14.5655 11.585 14.4562 10.9755L14.2724 9.94901C14.0974 10.1594 13.9114 10.3687 13.7136 10.5762C12.1868 12.1781 10.5398 13.0619 9.36939 13.5386Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">Startups</p>
                                            </div>
                                            <p class="mobile-link-desc">Built for fast-moving teams</p>
                                        </a>
                                        <a class="mobile-link-item" href="/enterprise">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path opacity="0.2" d="M7.56788 0.89724C8.72116 0.409204 10 1.2559 10 2.509V6H8.75C7.78379 6 7 6.78379 7 7.75V16.25C7 16.6631 7.33394 16.9981 7.74658 17H2.75C2.33579 17 2 16.6642 2 16.25V4.41199C2 3.7099 2.41973 3.07374 3.06862 2.79992L7.56788 0.89724Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.75 6C7.78379 6 7 6.78379 7 7.75V16.25C7 16.6642 7.33579 17 7.75 17H15.25C15.6642 17 16 16.6642 16 16.25V7.75C16 6.78379 15.2162 6 14.25 6H8.75ZM10.25 9C10.6642 9 11 9.33579 11 9.75V10.25C11 10.6642 10.6642 11 10.25 11C9.83579 11 9.5 10.6642 9.5 10.25V9.75C9.5 9.33579 9.83579 9 10.25 9ZM13.5 9.75C13.5 9.33579 13.1642 9 12.75 9C12.3358 9 12 9.33579 12 9.75V10.25C12 10.6642 12.3358 11 12.75 11C13.1642 11 13.5 10.6642 13.5 10.25V9.75ZM10.25 12C10.6642 12 11 12.3358 11 12.75V13.25C11 13.6642 10.6642 14 10.25 14C9.83579 14 9.5 13.6642 9.5 13.25V12.75C9.5 12.3358 9.83579 12 10.25 12ZM13.5 12.75C13.5 12.3358 13.1642 12 12.75 12C12.3358 12 12 12.3358 12 12.75V13.25C12 13.6642 12.3358 14 12.75 14C13.1642 14 13.5 13.6642 13.5 13.25V12.75Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1 16.25C1 15.8358 1.33579 15.5 1.75 15.5H16.25C16.6642 15.5 17 15.8358 17 16.25C17 16.6642 16.6642 17 16.25 17H1.75C1.33579 17 1 16.6642 1 16.25Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">Enterprise</p>
                                            </div>
                                            <p class="mobile-link-desc">Scalable for large organizations</p>
                                        </a>
                                        <a class="mobile-link-item" href="/switch">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path d="M15.254 13.0062C15.5389 13.0062 15.7992 13.1676 15.9259 13.4228C16.0525 13.678 16.0236 13.983 15.8513 14.2098C15.3938 14.8123 15.3375 15.1345 15.8442 15.7924C16.0186 16.0188 16.0491 16.3247 15.9229 16.5811C15.7968 16.8376 15.5358 17 15.25 17H3.9989C2.89605 17 2.00201 16.106 2.00201 15.0031C2.00201 13.9003 2.89605 13.0062 3.9989 13.0062H15.254Z" fill="currentColor"></path>
                                                    <path opacity="0.2" d="M2 3.75C2 2.23079 3.23079 1 4.75 1H15.25C15.6642 1 16 1.33579 16 1.75V13.6784C15.9909 13.5909 15.9663 13.5043 15.9259 13.4228C15.7992 13.1676 15.5389 13.0062 15.254 13.0062H3.9989C2.89605 13.0062 2.00201 13.9003 2.00201 15.0031L2 3.75Z" fill="currentColor"></path>
                                                    <path d="M11.25 5.75C11.25 4.772 10.622 3.948 9.75 3.638V5.5C9.75 5.776 9.526 6 9.25 6H8.75C8.474 6 8.25 5.776 8.25 5.5V3.638C7.378 3.948 6.75 4.772 6.75 5.75C6.75 6.632 7.262 7.387 8 7.756V10C8 10.552 8.448 11 9 11C9.552 11 10 10.552 10 10V7.756C10.738 7.387 11.25 6.632 11.25 5.75Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">Switch</p>
                                            </div>
                                            <p class="mobile-link-desc">Seamless migration tools</p>
                                        </a>
                                    </div>
                                    <div class="mobile-links-group">
                                        <p class="mobile-category">Company</p>
                                        <a class="mobile-link-item" href="/careers">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path opacity="0.2" d="M2.75 4C1.23079 4 0 5.23079 0 6.75V13.25C0 14.7692 1.23079 16 2.75 16H13.25C14.7692 16 16 14.7692 16 13.25V6.75C16 5.23079 14.7692 4 13.25 4H2.75Z" fill="currentColor"></path>
                                                    <path d="M6 2.25C6 2.11221 6.11221 2 6.25 2H9.75C9.8878 2 10 2.11221 10 2.25V4H11.5V2.25C11.5 1.28379 10.7162 0.5 9.75 0.5H6.25C5.28379 0.5 4.5 1.28379 4.5 2.25V4H6V2.25Z" fill="currentColor"></path>
                                                    <path opacity="0.88" d="M16 9.22612C15.8497 9.2968 15.7007 9.37206 15.5483 9.43812C14.0685 10.0796 11.4191 11.003 7.99997 11.003C4.5808 11.003 1.93149 10.0796 0.45168 9.43812L0 9.22875V7.57505L1.05696 8.06563C2.42083 8.65598 4.85783 9.50299 7.99997 9.50299C11.1408 9.50299 13.5771 8.65668 14.9413 8.06637L16 7.5686V9.22612Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">Careers</p>
                                            </div>
                                            <p class="mobile-link-desc">Join our growing team</p>
                                        </a>
                                        <a class="mobile-link-item" href="/wall-of-love">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path opacity="0.2" d="M6.75003 16.4956C6.51563 16.4956 6.28124 16.4399 6.06744 16.3281C4.87894 15.7085 1.00003 13.3852 1.00003 9.51118C0.992228 7.59078 2.55271 6.01658 4.47851 6.00488C5.32911 6.01608 6.12893 6.32569 6.75003 6.86179C7.37013 6.32569 8.16603 6.01608 9.00683 6.00488C10.9472 6.01658 12.5078 7.59078 12.5 9.51418C12.5 13.3833 8.62112 15.708 7.43262 16.3282C7.21972 16.44 6.98443 16.4956 6.75003 16.4956Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0361 11.7734C12.3243 11.0914 12.5 10.3378 12.5 9.51418C12.5078 7.59078 10.9472 6.01658 9.00683 6.00488C8.16603 6.01608 7.37013 6.32569 6.75003 6.86179C6.4198 6.57675 6.03903 6.35574 5.62698 6.20957C5.54509 5.82825 5.50003 5.42872 5.50003 5.01118C5.49223 3.09078 7.05271 1.51658 8.97851 1.50488C9.82911 1.51608 10.6289 1.82569 11.25 2.36179C11.8701 1.82569 12.666 1.51608 13.5068 1.50488C15.4472 1.51658 17.0078 3.09078 17 5.01418C17 8.77738 13.3306 11.0796 12.0361 11.7734Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">Wall of Love</p>
                                            </div>
                                            <p class="mobile-link-desc">Customer testimonials</p>
                                        </a>
                                        <a class="mobile-link-item" href="/guides">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path opacity="0.2" d="M14.9442 3.83336C8.37694 4.40802 5.63907 9.06776 4.53613 12.1676C4.87951 12.3488 5.12733 12.461 5.12733 12.461C5.84733 12.7835 6.56022 12.9258 6.602 12.933C7.36111 13.0717 8.06244 13.1409 8.706 13.1409C10.0455 13.1409 11.1326 12.8406 11.9504 12.2431C12.2798 12.0022 12.8134 11.52 13.1859 10.6978C11.6543 10.3884 11.0095 9.79673 11.0095 9.79673C11.0095 9.79673 12.929 10.0222 13.7619 9.37638C14.2081 9.00482 14.561 8.48945 14.7539 7.749C14.8774 7.20491 14.9565 6.67869 15.0321 6.17025C15.1521 5.36945 15.265 4.6138 15.5219 4.165C15.5928 4.04153 15.6088 3.90331 15.5945 3.7666C15.204 3.80527 14.9442 3.83336 14.9442 3.83336Z" fill="currentColor"></path>
                                                    <path d="M3.83402 15.6112C3.80887 15.6112 3.78371 15.6099 3.75767 15.6068C3.39224 15.5651 3.12923 15.2348 3.17083 14.869C3.18301 14.7613 4.51802 4.07646 14.8861 3.16934C15.2481 3.13548 15.5763 3.40846 15.6084 3.77521C15.6405 4.14197 15.3688 4.46534 15.0025 4.49743C5.70735 5.31077 4.50682 14.9227 4.49553 15.02C4.45651 15.3603 4.16816 15.6112 3.83402 15.6112Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.94423 2.05558C4.94423 1.6874 4.64575 1.38892 4.27756 1.38892C3.90937 1.38892 3.61089 1.6874 3.61089 2.05558V3.61114H2.05534C1.68715 3.61114 1.38867 3.90962 1.38867 4.2778C1.38867 4.64599 1.68715 4.94447 2.05534 4.94447H3.61089V6.50003C3.61089 6.86821 3.90937 7.16669 4.27756 7.16669C4.64575 7.16669 4.94423 6.86821 4.94423 6.50003V4.94447H6.49978C6.86797 4.94447 7.16645 4.64599 7.16645 4.2778C7.16645 3.90962 6.86797 3.61114 6.49978 3.61114H4.94423V2.05558Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">Guides</p>
                                            </div>
                                            <p class="mobile-link-desc">Guide to technical writing</p>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <!-- Documentation Section -->
                            <div class="mobile-menu-section">
                                <div class="mobile-section-header">
                                    <p class="mobile-section-title">Documentation</p>
                                    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="section-arrow">
                                        <path d="M15.25 6.5L9 12.75L2.75 6.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </div>
                                <div class="mobile-section-content">
                                    <div class="mobile-links-group">
                                        <p class="mobile-category">Guides</p>
                                        <a class="mobile-link-item" href="/docs">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path opacity="0.2" d="M2.75 0.251923C1.23079 0.251923 0 1.48271 0 3.00192V11.5019C0 13.0211 1.23079 14.2519 2.75 14.2519H11.25C12.7692 14.2519 14 13.0211 14 11.5019V3.00192C14 1.48271 12.7692 0.251923 11.25 0.251923H2.75Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3 10.5019C3 10.0877 3.33579 9.75192 3.75 9.75192H7.25C7.66421 9.75192 8 10.0877 8 10.5019C8 10.9161 7.66421 11.2519 7.25 11.2519H3.75C3.33579 11.2519 3 10.9161 3 10.5019Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3 7.50192C3 7.08771 3.33579 6.75192 3.75 6.75192H10.25C10.6642 6.75192 11 7.08771 11 7.50192C11 7.91613 10.6642 8.25192 10.25 8.25192H3.75C3.33579 8.25192 3 7.91613 3 7.50192Z" fill="currentColor"></path>
                                                    <path d="M4 5.25192C4.552 5.25192 5 4.80392 5 4.25192C5 3.69992 4.552 3.25192 4 3.25192C3.448 3.25192 3 3.69992 3 4.25192C3 4.80392 3.448 5.25192 4 5.25192Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">Getting Started</p>
                                            </div>
                                            <p class="mobile-link-desc">Deploy in minutes</p>
                                        </a>
                                        <a class="mobile-link-item" href="/docs/components">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path opacity="0.4" fill-rule="evenodd" clip-rule="evenodd" d="M8 11.8759C8 10.2187 9.3428 8.87592 11 8.87592C12.6572 8.87592 14 10.2187 14 11.8759C14 13.5331 12.6572 14.8759 11 14.8759C9.3428 14.8759 8 13.5331 8 11.8759Z" fill="currentColor"></path>
                                                    <path opacity="0.4" fill-rule="evenodd" clip-rule="evenodd" d="M0 3.87592C0 2.21871 1.34279 0.875916 3 0.875916C4.65721 0.875916 6 2.21871 6 3.87592C6 5.53313 4.65721 6.87592 3 6.87592C1.34279 6.87592 0 5.53313 0 3.87592Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8 3.87592C8 2.21871 9.3428 0.875916 11 0.875916C12.6572 0.875916 14 2.21871 14 3.87592C14 5.53313 12.6572 6.87592 11 6.87592C10.4435 6.87592 9.9225 6.72452 9.4759 6.46065L5.58473 10.3518C5.8486 10.7984 6 11.3194 6 11.8759C6 13.5331 4.65721 14.8759 3 14.8759C1.34279 14.8759 0 13.5331 0 11.8759C0 10.2187 1.34279 8.87592 3 8.87592C3.55644 8.87592 4.07744 9.02732 4.52405 9.29112L8.4152 5.39997C8.1514 4.95336 8 4.43236 8 3.87592Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">Components</p>
                                            </div>
                                            <p class="mobile-link-desc">Customizable components library</p>
                                        </a>
                                    </div>
                                    <div class="mobile-links-group">
                                        <p class="mobile-category">Developers</p>
                                        <a class="mobile-link-item" href="/docs/api-reference">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path opacity="0.2" fill-rule="evenodd" clip-rule="evenodd" d="M0 2.75C0 1.23079 1.23079 0 2.75 0H11.25C12.7692 0 14 1.23079 14 2.75V11.25C14 12.7692 12.7692 14 11.25 14H2.75C1.23079 14 0 12.7692 0 11.25V2.75Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 10.25C7 9.8358 7.33579 9.5 7.75 9.5H10.25C10.6642 9.5 11 9.8358 11 10.25C11 10.6642 10.6642 11 10.25 11H7.75C7.33579 11 7 10.6642 7 10.25Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.21967 4.71967C3.51256 4.42678 3.98744 4.42678 4.28033 4.71967L6.78033 7.21967C7.07322 7.51256 7.07322 7.98744 6.78033 8.2803L4.28033 10.7803C3.98744 11.0732 3.51256 11.0732 3.21967 10.7803C2.92678 10.4874 2.92678 10.0126 3.21967 9.7197L5.18934 7.75L3.21967 5.78033C2.92678 5.48744 2.92678 5.01256 3.21967 4.71967Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">API Reference</p>
                                            </div>
                                            <p class="mobile-link-desc">Build integrations and custom workflows</p>
                                        </a>
                                        <a class="mobile-link-item" href="/docs/changelog">
                                            <div class="mobile-link-header">
                                                <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="mobile-link-icon">
                                                    <path d="M3.75012 7.5C4.99276 7.5 6.00011 6.49264 6.00011 5.25C6.00011 4.00736 4.99276 3 3.75012 3C2.50748 3 1.50012 4.00736 1.50012 5.25C1.50012 6.49264 2.50748 7.5 3.75012 7.5Z" fill="currentColor"></path>
                                                    <path d="M3.75012 15C4.99276 15 6.00011 13.9926 6.00011 12.75C6.00011 11.5074 4.99276 10.5 3.75012 10.5C2.50748 10.5 1.50012 11.5074 1.50012 12.75C1.50012 13.9926 2.50748 15 3.75012 15Z" fill="currentColor"></path>
                                                    <path opacity="0.4" d="M16.2501 6H8.75012C8.33612 6 8.00012 5.664 8.00012 5.25C8.00012 4.836 8.33612 4.5 8.75012 4.5H16.2501C16.6641 4.5 17.0001 4.836 17.0001 5.25C17.0001 5.664 16.6641 6 16.2501 6Z" fill="currentColor"></path>
                                                    <path opacity="0.4" d="M16.2501 13.5H8.75012C8.33612 13.5 8.00012 13.164 8.00012 12.75C8.00012 12.336 8.33612 12 8.75012 12H16.2501C16.6641 12 17.0001 12.336 17.0001 12.75C17.0001 13.164 16.6641 13.5 16.2501 13.5Z" fill="currentColor"></path>
                                                </svg>
                                                <p class="mobile-link-title">Changelog</p>
                                            </div>
                                            <p class="mobile-link-desc">Learn what's new</p>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <!-- Simple Links -->
                            <a class="mobile-simple-link" href="/customers">Customers</a>
                            <a class="mobile-simple-link" href="/blog">Blog</a>
                            <a class="mobile-simple-link" href="/pricing">Pricing</a>
                        </div>

                        <!-- Mobile Action Buttons -->
                        <div class="mobile-actions">
                            <a class="mobile-btn mobile-btn-secondary" href="/contact/sales">Contact sales</a>
                            <a class="mobile-btn mobile-btn-primary" href="https://dashboard.snenjih.com/signup">Start for free</a>
                        </div>
                    </div>
                </div>

                <!-- Desktop Header -->
                <div class="header-container">
                    <div class="header-content-wrapper">
                        <!-- Logo -->
                        <a href="/" class="header-logo" aria-label="Go to homepage">
                            <svg width="104" height="24" viewBox="0 0 104 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M18.4725 9.60528V3.91396C18.4725 3.30323 17.977 2.81641 17.3754 2.81641H11.6867C10.7931 2.81641 9.90842 2.99342 9.08564 3.32977C8.26285 3.67497 7.51085 4.17064 6.88271 4.80793L6.83847 4.85219C6.00684 5.69305 5.41408 6.73749 5.11328 7.88815C5.65296 7.74653 6.2103 7.67572 6.76767 7.66687C8.25399 7.64916 9.71378 8.12713 10.8993 9.02111C11.9698 9.81771 12.7837 10.9153 13.2261 12.181C13.6861 13.4644 13.7392 14.8629 13.3942 16.1817C14.5354 15.8808 15.5883 15.2878 16.4288 14.4558L16.473 14.4115C17.1011 13.7831 17.6054 13.0307 17.9504 12.2075C18.2955 11.3844 18.4636 10.4993 18.4636 9.60528H18.4725Z" fill="#18E299"></path>
                                <path d="M4.9434 9.50941C4.95221 7.76347 5.64849 6.08807 6.87361 4.83594L2.14058 9.57113C2.12296 9.58876 2.10532 9.59758 2.08769 9.61522C0.933084 10.7615 0.23681 12.2959 0.122231 13.9183C0.0164654 15.435 0.413078 16.934 1.2592 18.1862C1.33991 18.3056 1.5589 18.3449 1.68229 18.2303L4.58202 15.338C5.48985 14.4298 5.7719 13.0806 5.34002 11.8726C5.06679 11.1231 4.93459 10.3207 4.9434 9.50941Z" fill="#0C8C5E"></path>
                                <path d="M16.4445 14.4121C15.5367 15.3027 14.3997 15.92 13.1658 16.1933C11.923 16.4667 10.6362 16.3873 9.43757 15.9641C9.43757 15.9641 9.42874 15.9641 9.41992 15.9641C8.21243 15.532 6.86394 15.8141 5.95612 16.7136L3.05634 19.6058C2.93295 19.7293 2.95057 19.9321 3.10041 20.0291C4.35197 20.8668 5.85035 21.2724 7.36632 21.1666C8.98806 21.052 10.5128 20.3553 11.6674 19.2002L11.7115 19.1561L16.4445 14.4209V14.4121Z" fill="#0C8C5E"></path>
                                <path d="M96.2355 23.5H92.6842L95.1868 17.8513L90.1816 6.60156H93.7568L96.6734 13.6537C96.7753 13.9002 97.1246 13.8997 97.2259 13.653L100.12 6.60156H103.719L96.2355 23.5Z" fill="var(--color-text-main)"></path>
                                <path d="M85.4483 18.5186V9.46164H83.041V6.60154H85.4483V5.05232C85.4483 3.63816 85.8773 2.5259 86.7353 1.71554C87.5933 0.90518 88.6818 0.5 90.0006 0.5C90.8109 0.5 91.5021 0.587392 92.0742 0.762175V3.64611C91.6928 3.5031 91.2479 3.4316 90.7394 3.4316C90.0244 3.4316 89.508 3.59049 89.1902 3.90828C88.8724 4.21018 88.7135 4.72659 88.7135 5.4575V6.60154H92.0742V9.46164H88.7135V18.5186H85.4483Z" fill="var(--color-text-main)"></path>
                                <path d="M80.1204 4.64714C79.5643 4.64714 79.0797 4.44852 78.6666 4.05129C78.2534 3.63816 78.0469 3.14559 78.0469 2.57357C78.0469 2.00155 78.2534 1.51692 78.6666 1.11969C79.0797 0.706563 79.5643 0.5 80.1204 0.5C80.7084 0.5 81.2009 0.706563 81.5982 1.11969C82.0113 1.51692 82.2178 2.00155 82.2178 2.57357C82.2178 3.14559 82.0113 3.63816 81.5982 4.05129C81.2009 4.44852 80.7084 4.64714 80.1204 4.64714ZM78.4997 18.5186V6.60154H81.765V18.5186H78.4997Z" fill="var(--color-text-main)"></path>
                                <path d="M72.8125 18.5182V0.642578H76.0778V18.5182H72.8125Z" fill="var(--color-text-main)"></path>
                                <path d="M69.1256 18.6621C67.7909 18.6621 66.6945 18.2966 65.8365 17.5657C64.9943 16.8189 64.5733 15.7464 64.5733 14.3481V9.46211H62.166V6.60201H64.5733V3.28906H67.8385V6.60201H71.1992V9.46211H67.8385V13.7046C67.8385 14.4355 67.9974 14.9598 68.3152 15.2776C68.633 15.5795 69.1494 15.7305 69.8644 15.7305C70.3729 15.7305 70.8178 15.659 71.1992 15.516V18.3999C70.6271 18.5747 69.9359 18.6621 69.1256 18.6621Z" fill="var(--color-text-main)"></path>
                                <path d="M49.9434 18.5191V6.60202H53.2086V7.47307C53.2086 7.62037 53.4091 7.6855 53.5066 7.57513C54.2346 6.75161 55.2713 6.33984 56.6169 6.33984C58.047 6.33984 59.1672 6.81653 59.9775 7.76989C60.8038 8.70737 61.2169 9.96263 61.2169 11.5357V18.5191H57.9516V12.0839C57.9516 11.21 57.7689 10.5347 57.4034 10.058C57.038 9.5654 56.5216 9.31911 55.8542 9.31911C55.0598 9.31911 54.4162 9.60512 53.9237 10.1771C53.447 10.7492 53.2086 11.5913 53.2086 12.7036V18.5191H49.9434Z" fill="var(--color-text-main)"></path>
                                <path d="M45.8783 4.64714C45.3221 4.64714 44.8375 4.44852 44.4244 4.05129C44.0113 3.63816 43.8047 3.14559 43.8047 2.57357C43.8047 2.00155 44.0113 1.51692 44.4244 1.11969C44.8375 0.706563 45.3221 0.5 45.8783 0.5C46.4662 0.5 46.9587 0.706563 47.356 1.11969C47.7691 1.51692 47.9757 2.00155 47.9757 2.57357C47.9757 3.14559 47.7691 3.63816 47.356 4.05129C46.9587 4.44852 46.4662 4.64714 45.8783 4.64714ZM44.2575 18.5186V6.60154H47.5228V18.5186H44.2575Z" fill="var(--color-text-main)"></path>
                                <path d="M38.7147 18.5191V12.1554C38.7147 10.2645 38.095 9.31911 36.8557 9.31911C36.1406 9.31911 35.5686 9.58923 35.1396 10.1295C34.7265 10.6697 34.504 11.4721 34.4722 12.5367V18.5191H31.207V12.1554C31.207 10.2645 30.5873 9.31911 29.3479 9.31911C28.617 9.31911 28.037 9.60512 27.608 10.1771C27.179 10.7492 26.9645 11.5913 26.9645 12.7036V18.5191H23.6992V6.60202H26.9645V7.48165C26.9645 7.62818 27.1615 7.69271 27.2578 7.58222C27.9791 6.75397 28.938 6.33984 30.1344 6.33984C31.7067 6.33984 32.8909 6.98895 33.687 8.28717C33.7498 8.38958 33.9044 8.38799 33.9668 8.28535C34.311 7.71964 34.7893 7.26975 35.4018 6.9357C36.1009 6.53846 36.808 6.33984 37.523 6.33984C38.9372 6.33984 40.0335 6.80858 40.8121 7.74606C41.5907 8.68353 41.98 9.97058 41.98 11.6072V18.5191H38.7147Z" fill="var(--color-text-main)"></path>
                            </svg>
                        </a>

                        <!-- Desktop Navigation -->
                        <nav class="header-nav">
                            <a href="/startups" class="nav-link">Resources</a>
                            <a href="/docs" class="nav-link">Documentation</a>
                            <a href="/customers" class="nav-link">Customers</a>
                            <a href="/blog" class="nav-link">Blog</a>
                            <a href="/pricing" class="nav-link">Pricing</a>
                        </nav>

                        <!-- Action Buttons -->
                        <div class="header-actions">
                            <a href="/contact/sales" class="header-btn header-btn-secondary">Contact sales</a>
                            <a href="https://dashboard.snenjih.com/signup" class="header-btn header-btn-primary">Start for free</a>
                            <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open menu">
                                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="menu-icon" aria-hidden="true">
                                    <path d="M8.75 12.75H23.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M8.75 19.25H23.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;

        // Insert header at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        this.header = document.querySelector('.main-header');
    }

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Mobile menu toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const menuOverlay = document.getElementById('mobile-menu-overlay');

        if (menuBtn && menuOverlay) {
            menuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close mobile menu when clicking overlay background
            menuOverlay.addEventListener('click', (e) => {
                if (e.target === menuOverlay) {
                    this.closeMobileMenu();
                }
            });
        }

        // Mobile accordion sections
        const sections = document.querySelectorAll('.mobile-section-header');
        sections.forEach(section => {
            section.addEventListener('click', () => {
                this.toggleMobileSection(section.parentElement);
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        const overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.mobileMenuOpen = true;
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            this.mobileMenuOpen = false;
        }
    }

    /**
     * Toggle mobile accordion section
     */
    toggleMobileSection(section) {
        section.classList.toggle('expanded');
    }

    /**
     * Highlight current page in navigation
     */
    highlightCurrentPage() {
        const navLinks = document.querySelectorAll('.nav-link, .mobile-simple-link, .mobile-link-item');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && this.currentPage.startsWith(href) && href !== '/') {
                link.classList.add('active');
            } else if (href === '/' && this.currentPage === '/') {
                link.classList.add('active');
            }
        });
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HeaderManager().init();
    });
} else {
    new HeaderManager().init();
}

// Export for potential manual initialization
export default HeaderManager;
