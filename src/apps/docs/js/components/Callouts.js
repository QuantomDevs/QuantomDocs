/**
 * Callouts Component
 * Renders callout/alert boxes with different types and styles
 */

/**
 * Renders callout HTML structure
 * @param {string} type - Callout type (note, warning, info, tip, check, danger, callout)
 * @param {Object} props - Callout properties {icon, color, iconType} for custom callouts
 * @param {string} contentHTML - HTML content for callout body
 * @returns {string} HTML string for callout component
 */
export function renderCallout(type, props, contentHTML) {
    const typeConfig = {
        note: { icon: 'fas fa-info-circle', class: 'callout-note' },
        warning: { icon: 'fas fa-exclamation-triangle', class: 'callout-warning' },
        info: { icon: 'fas fa-info-circle', class: 'callout-info' },
        tip: { icon: 'fas fa-lightbulb', class: 'callout-tip' },
        check: { icon: 'fas fa-check-circle', class: 'callout-check' },
        danger: { icon: 'fas fa-exclamation-circle', class: 'callout-danger' }
    };

    if (type === 'callout') {
        // Custom callout
        const iconClass = props.iconType ? `fa-${props.iconType}` : 'fas';
        const style = props.color ? `style="border-left-color: ${props.color};"` : '';
        return `
            <div class="callout callout-custom" ${style}>
                <div class="callout-icon">
                    <i class="${iconClass} fa-${props.icon}"></i>
                </div>
                <div class="callout-content">${contentHTML}</div>
            </div>
        `;
    } else {
        const config = typeConfig[type] || typeConfig.note;
        return `
            <div class="callout ${config.class}">
                <div class="callout-icon">
                    <i class="${config.icon}"></i>
                </div>
                <div class="callout-content">${contentHTML}</div>
            </div>
        `;
    }
}

// No init function needed - callouts are static components
