/**
 * CodeGroups Component
 * Renders grouped code blocks with tab or dropdown switching
 */

/**
 * Escapes HTML special characters
 * @param {string} html - HTML string to escape
 * @returns {string} Escaped HTML string
 */
function escapeHtml(html) {
    return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Renders code group HTML structure
 * @param {Array} blocksArray - Array of code block objects with {language, title, code}
 * @param {boolean} isDropdown - Whether to use dropdown selector instead of tabs
 * @param {string} uniqueId - Unique identifier for this code group instance
 * @returns {string} HTML string for code group component
 */
export function renderCodeGroup(blocksArray, isDropdown, uniqueId) {
    const groupId = uniqueId || 'codegroup-' + Math.random().toString(36).substr(2, 9);

    if (isDropdown) {
        // Dropdown selector
        const options = blocksArray.map((block, index) => {
            return `<option value="${index}">${block.title}</option>`;
        }).join('');

        const blocks = blocksArray.map((block, index) => {
            const highlighted = Prism.languages[block.language]
                ? Prism.highlight(block.code, Prism.languages[block.language], block.language)
                : escapeHtml(block.code);

            const displayStyle = index === 0 ? 'block' : 'none';

            return `
                <div class="code-group-block" data-index="${index}" style="display: ${displayStyle};">
                    <div class="code-block-wrapper">
                        <div class="code-block-header">
                            <span class="code-language">${block.language}</span>
                            <button class="copy-code-btn" data-clipboard-text="${escapeHtml(block.code)}">
                                <i class="fa-regular fa-copy"></i> Copy
                            </button>
                        </div>
                        <pre class="language-${block.language}"><code class="language-${block.language}">${highlighted}</code></pre>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="code-group code-group-dropdown" id="${groupId}">
                <div class="code-group-selector">
                    <select data-group-id="${groupId}">
                        ${options}
                    </select>
                </div>
                <div class="code-group-content">
                    ${blocks}
                </div>
            </div>
        `;
    } else {
        // Tab selector
        const tabs = blocksArray.map((block, index) => {
            const activeClass = index === 0 ? 'active' : '';
            return `
                <button class="code-group-tab ${activeClass}" data-tab-index="${index}">
                    ${block.title}
                </button>
            `;
        }).join('');

        const blocks = blocksArray.map((block, index) => {
            const highlighted = Prism.languages[block.language]
                ? Prism.highlight(block.code, Prism.languages[block.language], block.language)
                : escapeHtml(block.code);

            const activeClass = index === 0 ? 'active' : '';

            return `
                <div class="code-group-block ${activeClass}" data-index="${index}">
                    <div class="code-block-wrapper">
                        <div class="code-block-header">
                            <span class="code-language">${block.language}</span>
                            <button class="copy-code-btn" data-clipboard-text="${escapeHtml(block.code)}">
                                <i class="fa-regular fa-copy"></i> Copy
                            </button>
                        </div>
                        <pre class="language-${block.language}"><code class="language-${block.language}">${highlighted}</code></pre>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="code-group" id="${groupId}">
                <div class="code-group-tabs">
                    ${tabs}
                </div>
                <div class="code-group-content">
                    ${blocks}
                </div>
            </div>
        `;
    }
}

/**
 * Initializes code group switching logic for all code groups on the page
 */
export function initCodeGroupLogic() {
    // Handle tab-based code groups
    const codeGroups = document.querySelectorAll('.code-group:not(.code-group-dropdown)');

    codeGroups.forEach(group => {
        const tabs = group.querySelectorAll('.code-group-tab');

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                // Update tabs
                tabs.forEach((t, i) => {
                    t.classList.toggle('active', i === index);
                });

                // Update blocks
                const blocks = group.querySelectorAll('.code-group-block');
                blocks.forEach((block, i) => {
                    block.classList.toggle('active', i === index);
                });
            });
        });
    });

    // Handle dropdown-based code groups
    const dropdownGroups = document.querySelectorAll('.code-group-dropdown');

    dropdownGroups.forEach(group => {
        const select = group.querySelector('select');

        if (select) {
            select.addEventListener('change', (e) => {
                const index = parseInt(e.target.value);
                const blocks = group.querySelectorAll('.code-group-block');

                blocks.forEach((block, i) => {
                    block.style.display = i === index ? 'block' : 'none';
                });
            });
        }
    });
}
