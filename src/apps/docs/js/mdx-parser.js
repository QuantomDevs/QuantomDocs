/**
 * MDX Parser for QuantomDocs
 *
 * This is a simplified MDX parser that handles basic MDX syntax
 * without requiring a full MDX runtime. It parses MDX content,
 * extracts custom components, and renders them using the component registry.
 *
 * Security: Only components from the MDX_COMPONENTS registry can be used.
 *
 * ==========================================
 * DEPRECATED: This module is no longer used
 * ==========================================
 *
 * The backend has been refactored to use server-side MDX rendering.
 * The server now provides pre-rendered HTML in the API responses, eliminating
 * the need for client-side MDX parsing.
 *
 * This file is kept for backward compatibility but should not be used in new code.
 * Consider removing this file in future versions after confirming no dependencies exist.
 *
 * Migration Note:
 * - Use server-side pre-rendered HTML from /api/docs/* endpoints
 * - Server handles MDX parsing and component rendering
 * - Server provides response.content with ready-to-inject HTML
 * - Client-side MDX parsing is no longer needed
 */

/**
 * DEPRECATED: Parse and render MDX content
 * @param {string} mdxContent - Raw MDX content
 * @param {object} components - Component registry (MDX_COMPONENTS)
 * @returns {string} HTML string
 */
function parseMDX(mdxContent, components = {}) {
    if (!mdxContent) {
        return '';
    }

    try {
        // Split content into chunks (markdown and JSX components)
        const chunks = splitMDXContent(mdxContent);

        // Process each chunk
        const processedChunks = chunks.map(chunk => {
            if (chunk.type === 'component') {
                return renderComponent(chunk.content, components);
            } else {
                // Regular markdown - use marked.js
                return marked.parse(chunk.content);
            }
        });

        return processedChunks.join('');

    } catch (error) {
        console.error('MDX parsing error:', error);
        // Fallback to regular markdown parsing
        return `<div class="mdx-error">
            <p><strong>Error parsing MDX:</strong> ${escapeHtml(error.message)}</p>
            <p>Falling back to regular markdown...</p>
        </div>` + marked.parse(mdxContent);
    }
}

/**
 * Split MDX content into markdown and component chunks
 * @param {string} content - MDX content
 * @returns {Array} Array of {type, content} objects
 */
function splitMDXContent(content) {
    const chunks = [];
    let currentPos = 0;
    let currentChunk = '';

    // Simple component detection: <ComponentName ...>...</ComponentName>
    // or self-closing <ComponentName ... />
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;

    let match;
    let lastIndex = 0;

    while ((match = componentRegex.exec(content)) !== null) {
        const beforeComponent = content.slice(lastIndex, match.index);

        // Add markdown chunk before component
        if (beforeComponent) {
            chunks.push({
                type: 'markdown',
                content: beforeComponent
            });
        }

        // Add component chunk
        chunks.push({
            type: 'component',
            content: match[0]
        });

        lastIndex = componentRegex.lastIndex;
    }

    // Add remaining markdown
    const remaining = content.slice(lastIndex);
    if (remaining) {
        chunks.push({
            type: 'markdown',
            content: remaining
        });
    }

    return chunks.length > 0 ? chunks : [{ type: 'markdown', content }];
}

/**
 * Render a component from JSX-like syntax
 * @param {string} componentString - Component string like "<Alert type='info'>Text</Alert>"
 * @param {object} components - Component registry
 * @returns {string} Rendered HTML
 */
function renderComponent(componentString, components) {
    try {
        // Parse component syntax
        const parsed = parseComponentSyntax(componentString);

        if (!parsed) {
            return `<div class="mdx-error">Failed to parse component: ${escapeHtml(componentString)}</div>`;
        }

        const { name, props, children } = parsed;

        // Security check: Only allow registered components
        if (!components[name]) {
            console.warn(`MDX: Component "${name}" is not registered. Skipping.`);
            return `<div class="mdx-warning">Component "${escapeHtml(name)}" is not available.</div>`;
        }

        // Get component function
        const ComponentFn = components[name];

        // Create props object with children
        const componentProps = { ...props, children };

        // Render component
        const element = ComponentFn(componentProps);

        // Convert DOM element to HTML string
        return element.outerHTML || '';

    } catch (error) {
        console.error('Component rendering error:', error);
        return `<div class="mdx-error">Error rendering component: ${escapeHtml(error.message)}</div>`;
    }
}

/**
 * Parse component syntax to extract name, props, and children
 * @param {string} componentString - Component string
 * @returns {object} {name, props, children}
 */
function parseComponentSyntax(componentString) {
    // Match: <ComponentName props...>children</ComponentName>
    // or: <ComponentName props... />
    const fullMatch = componentString.match(/<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/);

    if (!fullMatch) {
        return null;
    }

    const name = fullMatch[1];
    const propsString = fullMatch[2];
    const children = fullMatch[3] || '';

    // Parse props
    const props = parseProps(propsString);

    return { name, props, children: children.trim() };
}

/**
 * Parse props string into object
 * @param {string} propsString - Props string like 'type="info" title="Hello"'
 * @returns {object} Props object
 */
function parseProps(propsString) {
    const props = {};

    if (!propsString) {
        return props;
    }

    // Match key="value" or key='value' or key={value}
    const propRegex = /(\w+)=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;

    let match;
    while ((match = propRegex.exec(propsString)) !== null) {
        const key = match[1];
        const value = match[2] || match[3] || match[4];

        // Handle different value types
        if (match[4]) {
            // Curly braces - evaluate as JavaScript (with restrictions)
            try {
                // Only allow simple values (no functions or dangerous code)
                if (/^(true|false|\d+|null|undefined)$/i.test(value.trim())) {
                    props[key] = eval(value);
                } else {
                    props[key] = value;
                }
            } catch (e) {
                props[key] = value;
            }
        } else {
            props[key] = value;
        }
    }

    return props;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Check if content is MDX (contains JSX-like components)
 * @param {string} content - Content to check
 * @returns {boolean} True if content appears to be MDX
 */
function isMDXContent(content) {
    // Check for capital letter component tags
    return /<[A-Z][a-zA-Z0-9]*[\s>]/.test(content);
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseMDX,
        isMDXContent,
        splitMDXContent,
        renderComponent
    };
}
