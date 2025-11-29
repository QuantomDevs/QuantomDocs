/**
 * Frames Component
 * Renders framed content with optional captions
 */

/**
 * Renders frame HTML structure
 * @param {Object} props - Frame properties {caption}
 * @param {string} contentHTML - HTML content for frame body
 * @returns {string} HTML string for frame component
 */
export function renderFrame(props, contentHTML) {
    const captionHtml = props.caption ? `<p class="frame-caption">${props.caption}</p>` : '';

    return `
        <div class="frame-container">
            <div class="frame-content">
                ${contentHTML}
            </div>
            ${captionHtml}
        </div>
    `;
}

// No init function needed - frames are static components
