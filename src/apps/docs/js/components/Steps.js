/**
 * Steps Component
 * Renders step-by-step instructions
 */

/**
 * Renders steps HTML structure
 * @param {Array} stepsArray - Array of step objects with {title, icon, content}
 * @returns {string} HTML string for steps component
 */
export function renderSteps(stepsArray) {
    const stepsHtml = stepsArray.map((step, index) => {
        const html = marked.parse(step.content);
        const iconHtml = step.icon
            ? `<i class="fas fa-${step.icon}"></i>`
            : `<span class="step-number">${index + 1}</span>`;

        return `
            <div class="step-item">
                <div class="step-indicator">
                    ${iconHtml}
                </div>
                <div class="step-content">
                    <h3 class="step-title">${step.title}</h3>
                    <div class="step-body">${html}</div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="steps-container">
            ${stepsHtml}
        </div>
    `;
}

/**
 * Initializes steps logic (minimal - steps are mostly static)
 */
export function initStepsLogic() {
    // Steps are static components, no interactivity needed
    // This function is here for consistency with other components
}
