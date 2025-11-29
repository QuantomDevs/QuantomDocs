/**
 * Expandables Component
 * Renders expandable/collapsible content sections
 */

/**
 * Renders expandable HTML structure
 * @param {Object} props - Expandable properties {title, defaultOpen}
 * @param {string} contentHTML - HTML content for expandable body
 * @param {string} uniqueId - Unique identifier for this expandable instance
 * @returns {string} HTML string for expandable component
 */
export function renderExpandable(props, contentHTML, uniqueId) {
    const expandableId = uniqueId || 'expandable-' + Math.random().toString(36).substr(2, 9);
    const activeClass = props.defaultOpen ? 'active' : '';

    return `
        <div class="expandable-item ${activeClass}" id="${expandableId}">
            <div class="expandable-header">
                <span class="expandable-title">${props.title}</span>
                <i class="fas fa-chevron-down expandable-icon"></i>
            </div>
            <div class="expandable-content">
                ${contentHTML}
            </div>
        </div>
    `;
}

/**
 * Initializes expandable toggle logic for all expandables on the page
 */
export function initExpandableLogic() {
    // Find all expandable items
    const expandableItems = document.querySelectorAll('.expandable-item');

    expandableItems.forEach(expandable => {
        const header = expandable.querySelector('.expandable-header');

        if (header) {
            header.addEventListener('click', () => {
                expandable.classList.toggle('active');
            });
        }
    });
}
