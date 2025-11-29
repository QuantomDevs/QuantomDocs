/**
 * Tabs Component
 * Renders tabbed content with switching functionality
 */

/**
 * Renders tabs HTML structure
 * @param {Array} tabsArray - Array of tab objects with {title, icon, content}
 * @param {string} uniqueId - Unique identifier for this tabs instance
 * @returns {string} HTML string for tabs component
 */
export function renderTabs(tabsArray, uniqueId) {
    const tabId = uniqueId || 'tabs-' + Math.random().toString(36).substr(2, 9);

    // Generate tab headers
    const headers = tabsArray.map((tab, index) => {
        const iconHtml = tab.icon ? `<i class="fas fa-${tab.icon}"></i>` : '';
        const activeClass = index === 0 ? 'active' : '';
        return `
            <button class="tab-button ${activeClass}" data-tab-index="${index}">
                ${iconHtml}
                <span>${tab.title}</span>
            </button>
        `;
    }).join('');

    // Generate tab content
    const contents = tabsArray.map((tab, index) => {
        const activeClass = index === 0 ? 'active' : '';
        const html = marked.parse(tab.content);
        return `
            <div class="tab-panel ${activeClass}" data-tab-index="${index}">
                ${html}
            </div>
        `;
    }).join('');

    return `
        <div class="tabs-container" id="${tabId}">
            <div class="tabs-header">
                ${headers}
            </div>
            <div class="tabs-content">
                ${contents}
            </div>
        </div>
    `;
}

/**
 * Initializes tab switching logic for all tabs on the page
 */
export function initTabsLogic() {
    // Find all tabs containers
    const tabContainers = document.querySelectorAll('.tabs-container');

    tabContainers.forEach(container => {
        const buttons = container.querySelectorAll('.tab-button');

        buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                // Update tab buttons
                buttons.forEach((btn, i) => {
                    btn.classList.toggle('active', i === index);
                });

                // Update tab panels
                const panels = container.querySelectorAll('.tab-panel');
                panels.forEach((panel, i) => {
                    panel.classList.toggle('active', i === index);
                });
            });
        });
    });
}
