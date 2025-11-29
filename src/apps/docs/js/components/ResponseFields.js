/**
 * ResponseFields Component
 * Renders API response field documentation
 */

/**
 * Renders response field HTML structure
 * @param {Object} props - Field properties {name, type, required, defaultValue, deprecated}
 * @param {string} contentHTML - HTML content for field description
 * @returns {string} HTML string for response field component
 */
export function renderResponseField(props, contentHTML) {
    const requiredBadge = props.required ? '<span class="field-badge field-required">required</span>' : '';
    const deprecatedBadge = props.deprecated ? '<span class="field-badge field-deprecated">deprecated</span>' : '';
    const defaultBadge = props.defaultValue ? `<span class="field-badge field-default">default: ${props.defaultValue}</span>` : '';

    return `
        <div class="response-field">
            <div class="response-field-header">
                <span class="field-name">${props.name}</span>
                <span class="field-type">${props.type}</span>
                ${requiredBadge}
                ${deprecatedBadge}
                ${defaultBadge}
            </div>
            <div class="response-field-content">
                ${contentHTML}
            </div>
        </div>
    `;
}

// No init function needed - response fields are static components
