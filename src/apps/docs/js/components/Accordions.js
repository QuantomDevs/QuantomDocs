/**
 * Accordions Component
 * Renders collapsible accordion panels
 */

/**
 * Renders accordion HTML structure
 * @param {Object} props - Accordion properties {title, icon, defaultOpen, description}
 * @param {string} contentHTML - HTML content for accordion body
 * @param {string} uniqueId - Unique identifier for this accordion instance
 * @returns {string} HTML string for accordion component
 */
export function renderAccordion(props, contentHTML, uniqueId) {
    const accordionId = uniqueId || 'accordion-' + Math.random().toString(36).substr(2, 9);
    const iconHtml = props.icon ? `<i class="fas fa-${props.icon}"></i>` : '';
    const descHtml = props.description ? `<p class="accordion-description">${props.description}</p>` : '';
    const activeClass = props.defaultOpen ? 'active' : '';

    return `
        <div class="accordion-item ${activeClass}" id="${accordionId}">
            <div class="accordion-header">
                <div class="accordion-title-wrapper">
                    ${iconHtml}
                    <div>
                        <h3 class="accordion-title">${props.title}</h3>
                        ${descHtml}
                    </div>
                </div>
                <i class="fas fa-chevron-down accordion-icon"></i>
            </div>
            <div class="accordion-content">
                <div class="accordion-body">
                    ${contentHTML}
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders accordion group HTML structure
 * @param {Array} accordionsArray - Array of accordion objects
 * @returns {string} HTML string for accordion group
 */
export function renderAccordionGroup(accordionsArray) {
    const accordionsHtml = accordionsArray.map((item) => {
        const html = marked.parse(item.content);
        return renderAccordion(
            {
                title: item.title,
                icon: item.icon,
                defaultOpen: item.defaultOpen,
                description: item.description
            },
            html
        );
    }).join('');

    return `
        <div class="accordion-group">
            ${accordionsHtml}
        </div>
    `;
}

/**
 * Initializes accordion toggle logic for all accordions on the page
 */
export function initAccordionLogic() {
    // Find all accordion items
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');

        if (header) {
            header.addEventListener('click', () => {
                accordion.classList.toggle('active');
            });
        }
    });
}
