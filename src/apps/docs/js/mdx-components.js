// MDX Component Registry
// Defines allowed components that can be used in MDX files
// This is a security measure to prevent arbitrary code execution

/**
 * Component registry for MDX files
 * Only components registered here can be used in MDX content
 */
const MDX_COMPONENTS = {
    // Custom components for documentation
    Alert: createAlertComponent(),
    CodeBlock: createCodeBlockComponent(),
    Callout: createCalloutComponent(),
    Button: createButtonComponent(),
    Tabs: createTabsComponent(),
    Tab: createTabComponent(),

    // Standard HTML elements (for safety)
    h1: (props) => createHeading(1, props),
    h2: (props) => createHeading(2, props),
    h3: (props) => createHeading(3, props),
    h4: (props) => createHeading(4, props),
    h5: (props) => createHeading(5, props),
    h6: (props) => createHeading(6, props),
    p: (props) => createElement('p', props),
    a: (props) => createLink(props),
    code: (props) => createElement('code', props),
    pre: (props) => createElement('pre', props),
    ul: (props) => createElement('ul', props),
    ol: (props) => createElement('ol', props),
    li: (props) => createElement('li', props),
    blockquote: (props) => createElement('blockquote', props),
    img: (props) => createImage(props),
    table: (props) => createElement('table', props),
    thead: (props) => createElement('thead', props),
    tbody: (props) => createElement('tbody', props),
    tr: (props) => createElement('tr', props),
    th: (props) => createElement('th', props),
    td: (props) => createElement('td', props),
};

/**
 * Helper function to create basic HTML elements
 */
function createElement(tag, props) {
    const element = document.createElement(tag);

    // Set attributes
    if (props) {
        Object.keys(props).forEach(key => {
            if (key === 'children') {
                // Handle children
                if (Array.isArray(props.children)) {
                    props.children.forEach(child => {
                        if (typeof child === 'string') {
                            element.appendChild(document.createTextNode(child));
                        } else if (child instanceof Node) {
                            element.appendChild(child);
                        }
                    });
                } else if (typeof props.children === 'string') {
                    element.textContent = props.children;
                } else if (props.children instanceof Node) {
                    element.appendChild(props.children);
                }
            } else if (key === 'className') {
                element.className = props[key];
            } else if (key !== 'key' && key !== 'ref') {
                // Skip React-specific props, set others as attributes
                element.setAttribute(key, props[key]);
            }
        });
    }

    return element;
}

/**
 * Create heading element with ID for anchoring
 */
function createHeading(level, props) {
    const heading = document.createElement(`h${level}`);
    const text = props.children || '';

    // Generate ID from text for anchor links
    const id = typeof text === 'string'
        ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : '';

    if (id) {
        heading.id = id;
    }

    if (props.className) {
        heading.className = props.className;
    }

    heading.textContent = text;
    return heading;
}

/**
 * Create safe link element
 */
function createLink(props) {
    const link = document.createElement('a');

    if (props.href) {
        // Sanitize href to prevent XSS
        const href = props.href;
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/') || href.startsWith('#')) {
            link.href = href;
        }
    }

    if (props.target) {
        link.target = props.target;
        if (props.target === '_blank') {
            link.rel = 'noopener noreferrer';
        }
    }

    if (props.className) {
        link.className = props.className;
    }

    link.textContent = props.children || '';
    return link;
}

/**
 * Create safe image element
 */
function createImage(props) {
    const img = document.createElement('img');

    if (props.src) {
        img.src = props.src;
    }

    if (props.alt) {
        img.alt = props.alt;
    }

    if (props.title) {
        img.title = props.title;
    }

    if (props.width) {
        img.width = props.width;
    }

    if (props.height) {
        img.height = props.height;
    }

    if (props.className) {
        img.className = props.className;
    }

    return img;
}

/**
 * Alert Component
 * Usage: <Alert type="info">Message</Alert>
 */
function createAlertComponent() {
    return function Alert(props) {
        const type = props.type || 'info';
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;

        const icon = document.createElement('span');
        icon.className = 'alert-icon';
        icon.innerHTML = getAlertIcon(type);

        const content = document.createElement('div');
        content.className = 'alert-content';
        content.textContent = props.children || '';

        alert.appendChild(icon);
        alert.appendChild(content);

        return alert;
    };
}

/**
 * Get icon for alert type
 */
function getAlertIcon(type) {
    const icons = {
        info: '<i class="fas fa-info-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        error: '<i class="fas fa-times-circle"></i>',
        success: '<i class="fas fa-check-circle"></i>'
    };
    return icons[type] || icons.info;
}

/**
 * CodeBlock Component
 * Usage: <CodeBlock language="javascript">code</CodeBlock>
 */
function createCodeBlockComponent() {
    return function CodeBlock(props) {
        const language = props.language || 'plaintext';
        const container = document.createElement('div');
        container.className = 'code-block-container';

        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.className = `language-${language}`;
        code.textContent = props.children || '';

        pre.appendChild(code);
        container.appendChild(pre);

        return container;
    };
}

/**
 * Callout Component
 * Usage: <Callout title="Note">Content</Callout>
 */
function createCalloutComponent() {
    return function Callout(props) {
        const callout = document.createElement('div');
        callout.className = 'callout';

        if (props.title) {
            const title = document.createElement('div');
            title.className = 'callout-title';
            title.textContent = props.title;
            callout.appendChild(title);
        }

        const content = document.createElement('div');
        content.className = 'callout-content';
        content.textContent = props.children || '';

        callout.appendChild(content);

        return callout;
    };
}

/**
 * Button Component
 * Usage: <Button href="/link">Click me</Button>
 */
function createButtonComponent() {
    return function Button(props) {
        const button = document.createElement('a');
        button.className = 'mdx-button';

        if (props.href) {
            button.href = props.href;
        }

        if (props.variant) {
            button.classList.add(`button-${props.variant}`);
        }

        button.textContent = props.children || '';

        return button;
    };
}

/**
 * Tabs Component
 * Usage: <Tabs><Tab label="Tab 1">Content 1</Tab><Tab label="Tab 2">Content 2</Tab></Tabs>
 */
function createTabsComponent() {
    return function Tabs(props) {
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'tabs-container';

        const tabButtons = document.createElement('div');
        tabButtons.className = 'tab-buttons';

        const tabContents = document.createElement('div');
        tabContents.className = 'tab-contents';

        // This is a simplified version - in real MDX, children would be Tab components
        // For now, just render the children
        const content = document.createElement('div');
        content.textContent = props.children || '';

        tabsContainer.appendChild(tabButtons);
        tabsContainer.appendChild(content);

        return tabsContainer;
    };
}

/**
 * Tab Component
 * Usage: Part of Tabs component
 */
function createTabComponent() {
    return function Tab(props) {
        const tab = document.createElement('div');
        tab.className = 'tab-content';
        tab.textContent = props.children || '';

        return tab;
    };
}

// Export the component registry
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MDX_COMPONENTS;
}
