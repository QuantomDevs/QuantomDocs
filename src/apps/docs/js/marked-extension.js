/**
 * Enhanced Marked.js Extensions for QuantomDocs
 * Supports: Callouts, Tabs, Steps, Accordions, CodeGroups, Columns, Frames, Expandables, ResponseFields
 */

function escapeHtml(html) {
    return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

(function() {
    // ==================== CALLOUTS ====================
    // Supports: <Note>, <Warning>, <Info>, <Tip>, <Check>, <Danger>, <Callout>
    const callout = {
        name: 'callout',
        level: 'block',
        start(src) {
            return src.match(/<(Note|Warning|Info|Tip|Check|Danger|Callout)(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            // Match: <Type ...props>content</Type>
            const rule = /^<(Note|Warning|Info|Tip|Check|Danger|Callout)([^>]*)>([\s\S]*?)<\/\1>/;
            const match = rule.exec(src);
            if (match) {
                const type = match[1].toLowerCase();
                const props = match[2].trim();
                const content = match[3].trim();

                // Parse props for custom callout
                let icon = null;
                let color = null;
                let iconType = null;

                if (type === 'callout') {
                    const iconMatch = props.match(/icon="([^"]+)"/);
                    const colorMatch = props.match(/color="([^"]+)"/);
                    const iconTypeMatch = props.match(/iconType="([^"]+)"/);
                    if (iconMatch) icon = iconMatch[1];
                    if (colorMatch) color = colorMatch[1];
                    if (iconTypeMatch) iconType = iconTypeMatch[1];
                }

                const token = {
                    type: 'callout',
                    raw: match[0],
                    calloutType: type,
                    icon,
                    color,
                    iconType,
                    text: content,
                    tokens: []
                };
                this.lexer.inline(token.text, token.tokens);
                return token;
            }
        },
        renderer(token) {
            const content = this.parser.parseInline(token.tokens);

            const typeConfig = {
                note: { icon: 'fas fa-info-circle', class: 'callout-note' },
                warning: { icon: 'fas fa-exclamation-triangle', class: 'callout-warning' },
                info: { icon: 'fas fa-info-circle', class: 'callout-info' },
                tip: { icon: 'fas fa-lightbulb', class: 'callout-tip' },
                check: { icon: 'fas fa-check-circle', class: 'callout-check' },
                danger: { icon: 'fas fa-exclamation-circle', class: 'callout-danger' }
            };

            if (token.calloutType === 'callout') {
                // Custom callout
                const iconClass = token.iconType ? `fa-${token.iconType}` : 'fas';
                const style = token.color ? `style="border-left-color: ${token.color};"` : '';
                return `
                    <div class="callout callout-custom" ${style}>
                        <div class="callout-icon">
                            <i class="${iconClass} fa-${token.icon}"></i>
                        </div>
                        <div class="callout-content">${content}</div>
                    </div>
                `;
            } else {
                const config = typeConfig[token.calloutType] || typeConfig.note;
                return `
                    <div class="callout ${config.class}">
                        <div class="callout-icon">
                            <i class="${config.icon}"></i>
                        </div>
                        <div class="callout-content">${content}</div>
                    </div>
                `;
            }
        }
    };

    // ==================== TABS ====================
    const tabs = {
        name: 'tabs',
        level: 'block',
        start(src) {
            return src.match(/<Tabs(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^<Tabs>([\s\S]*?)<\/Tabs>/;
            const match = rule.exec(src);
            if (match) {
                const tabsContent = match[1];
                const tabItems = [];

                // Extract individual tabs
                const tabRegex = /<Tab\s+title="([^"]+)"([^>]*)>([\s\S]*?)<\/Tab>/g;
                let tabMatch;
                while ((tabMatch = tabRegex.exec(tabsContent)) !== null) {
                    const title = tabMatch[1];
                    const props = tabMatch[2];
                    const content = tabMatch[3].trim();

                    // Parse icon if present
                    let icon = null;
                    const iconMatch = props.match(/icon="([^"]+)"/);
                    if (iconMatch) icon = iconMatch[1];

                    tabItems.push({ title, icon, content });
                }

                return {
                    type: 'tabs',
                    raw: match[0],
                    tabs: tabItems
                };
            }
        },
        renderer(token) {
            const tabId = 'tabs-' + Math.random().toString(36).substr(2, 9);

            // Generate tab headers
            const headers = token.tabs.map((tab, index) => {
                const iconHtml = tab.icon ? `<i class="fas fa-${tab.icon}"></i>` : '';
                const activeClass = index === 0 ? 'active' : '';
                return `
                    <button class="tab-button ${activeClass}" onclick="switchTab('${tabId}', ${index})">
                        ${iconHtml}
                        <span>${tab.title}</span>
                    </button>
                `;
            }).join('');

            // Generate tab content
            const contents = token.tabs.map((tab, index) => {
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
    };

    // ==================== STEPS ====================
    const steps = {
        name: 'steps',
        level: 'block',
        start(src) {
            return src.match(/<Steps(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^<Steps>([\s\S]*?)<\/Steps>/;
            const match = rule.exec(src);
            if (match) {
                const stepsContent = match[1];
                const stepItems = [];

                // Extract individual steps
                const stepRegex = /<Step\s+title="([^"]+)"([^>]*)>([\s\S]*?)<\/Step>/g;
                let stepMatch;
                while ((stepMatch = stepRegex.exec(stepsContent)) !== null) {
                    const title = stepMatch[1];
                    const props = stepMatch[2];
                    const content = stepMatch[3].trim();

                    // Parse optional properties
                    let icon = null;
                    const iconMatch = props.match(/icon="([^"]+)"/);
                    if (iconMatch) icon = iconMatch[1];

                    stepItems.push({ title, icon, content });
                }

                return {
                    type: 'steps',
                    raw: match[0],
                    steps: stepItems
                };
            }
        },
        renderer(token) {
            const stepsHtml = token.steps.map((step, index) => {
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
    };

    // ==================== ACCORDIONS ====================
    const accordion = {
        name: 'accordion',
        level: 'block',
        start(src) {
            return src.match(/<Accordion(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^<Accordion\s+title="([^"]+)"([^>]*)>([\s\S]*?)<\/Accordion>/;
            const match = rule.exec(src);
            if (match) {
                const title = match[1];
                const props = match[2];
                const content = match[3].trim();

                // Parse optional properties
                let icon = null;
                let defaultOpen = false;
                let description = null;

                const iconMatch = props.match(/icon="([^"]+)"/);
                const defaultOpenMatch = props.match(/defaultOpen\s*=\s*(true|"true")/);
                const descMatch = props.match(/description="([^"]+)"/);

                if (iconMatch) icon = iconMatch[1];
                if (defaultOpenMatch) defaultOpen = true;
                if (descMatch) description = descMatch[1];

                return {
                    type: 'accordion',
                    raw: match[0],
                    title,
                    description,
                    icon,
                    defaultOpen,
                    text: content,
                    tokens: []
                };
            }
        },
        renderer(token) {
            const html = marked.parse(token.text);
            const accordionId = 'accordion-' + Math.random().toString(36).substr(2, 9);
            const iconHtml = token.icon ? `<i class="fas fa-${token.icon}"></i>` : '';
            const descHtml = token.description ? `<p class="accordion-description">${token.description}</p>` : '';
            const activeClass = token.defaultOpen ? 'active' : '';

            return `
                <div class="accordion-item ${activeClass}" id="${accordionId}">
                    <div class="accordion-header" onclick="toggleAccordion('${accordionId}')">
                        <div class="accordion-title-wrapper">
                            ${iconHtml}
                            <div>
                                <h3 class="accordion-title">${token.title}</h3>
                                ${descHtml}
                            </div>
                        </div>
                        <i class="fas fa-chevron-down accordion-icon"></i>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-body">
                            ${html}
                        </div>
                    </div>
                </div>
            `;
        }
    };

    // ==================== ACCORDION GROUPS ====================
    const accordionGroup = {
        name: 'accordionGroup',
        level: 'block',
        start(src) {
            return src.match(/<AccordionGroup(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^<AccordionGroup>([\s\S]*?)<\/AccordionGroup>/;
            const match = rule.exec(src);
            if (match) {
                const groupContent = match[1];
                const accordionItems = [];

                // Extract individual accordions
                const accordionRegex = /<Accordion\s+title="([^"]+)"([^>]*)>([\s\S]*?)<\/Accordion>/g;
                let accordionMatch;
                while ((accordionMatch = accordionRegex.exec(groupContent)) !== null) {
                    const title = accordionMatch[1];
                    const props = accordionMatch[2];
                    const content = accordionMatch[3].trim();

                    // Parse optional properties
                    let icon = null;
                    let defaultOpen = false;

                    const iconMatch = props.match(/icon="([^"]+)"/);
                    const defaultOpenMatch = props.match(/defaultOpen\s*=\s*(true|"true")/);

                    if (iconMatch) icon = iconMatch[1];
                    if (defaultOpenMatch) defaultOpen = true;

                    accordionItems.push({ title, icon, defaultOpen, content });
                }

                return {
                    type: 'accordionGroup',
                    raw: match[0],
                    accordions: accordionItems
                };
            }
        },
        renderer(token) {
            const accordionsHtml = token.accordions.map((item) => {
                const html = marked.parse(item.content);
                const accordionId = 'accordion-' + Math.random().toString(36).substr(2, 9);
                const iconHtml = item.icon ? `<i class="fas fa-${item.icon}"></i>` : '';
                const activeClass = item.defaultOpen ? 'active' : '';

                return `
                    <div class="accordion-item ${activeClass}" id="${accordionId}">
                        <div class="accordion-header" onclick="toggleAccordion('${accordionId}')">
                            <div class="accordion-title-wrapper">
                                ${iconHtml}
                                <h3 class="accordion-title">${item.title}</h3>
                            </div>
                            <i class="fas fa-chevron-down accordion-icon"></i>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-body">
                                ${html}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="accordion-group">
                    ${accordionsHtml}
                </div>
            `;
        }
    };

    // ==================== CODE GROUPS ====================
    const codeGroup = {
        name: 'codeGroup',
        level: 'block',
        start(src) {
            return src.match(/<CodeGroup(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^<CodeGroup([^>]*)>([\s\S]*?)<\/CodeGroup>/;
            const match = rule.exec(src);
            if (match) {
                const props = match[1];
                const content = match[2];

                // Check for dropdown prop
                const isDropdown = props.includes('dropdown');

                // Extract code blocks
                const codeBlocks = [];
                const codeRegex = /```(\w+)\s+([^\n]+)\n([\s\S]*?)```/g;
                let codeMatch;
                while ((codeMatch = codeRegex.exec(content)) !== null) {
                    const language = codeMatch[1];
                    const title = codeMatch[2].trim();
                    const code = codeMatch[3];
                    codeBlocks.push({ language, title, code });
                }

                return {
                    type: 'codeGroup',
                    raw: match[0],
                    isDropdown,
                    codeBlocks
                };
            }
        },
        renderer(token) {
            const groupId = 'codegroup-' + Math.random().toString(36).substr(2, 9);

            if (token.isDropdown) {
                // Dropdown selector
                const options = token.codeBlocks.map((block, index) => {
                    return `<option value="${index}">${block.title}</option>`;
                }).join('');

                const blocks = token.codeBlocks.map((block, index) => {
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
                            <select onchange="switchCodeBlock('${groupId}', this.value)">
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
                const tabs = token.codeBlocks.map((block, index) => {
                    const activeClass = index === 0 ? 'active' : '';
                    return `
                        <button class="code-group-tab ${activeClass}" onclick="switchCodeBlock('${groupId}', ${index})">
                            ${block.title}
                        </button>
                    `;
                }).join('');

                const blocks = token.codeBlocks.map((block, index) => {
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
    };

    // ==================== COLUMNS ====================
    const columns = {
        name: 'columns',
        level: 'block',
        start(src) {
            return src.match(/<Columns(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^<Columns\s+cols=\{(\d+)\}>([\s\S]*?)<\/Columns>/;
            const match = rule.exec(src);
            if (match) {
                const cols = parseInt(match[1]);
                const content = match[2];

                // Extract card items
                const cards = [];
                const cardRegex = /<Card\s+title="([^"]+)"([^>]*)>([\s\S]*?)<\/Card>/g;
                let cardMatch;
                while ((cardMatch = cardRegex.exec(content)) !== null) {
                    const title = cardMatch[1];
                    const props = cardMatch[2];
                    const cardContent = cardMatch[3].trim();

                    // Parse icon
                    let icon = null;
                    const iconMatch = props.match(/icon="([^"]+)"/);
                    if (iconMatch) icon = iconMatch[1];

                    cards.push({ title, icon, content: cardContent });
                }

                return {
                    type: 'columns',
                    raw: match[0],
                    cols,
                    cards
                };
            }
        },
        renderer(token) {
            const cardsHtml = token.cards.map(card => {
                const html = marked.parse(card.content);
                const iconHtml = card.icon ? `<i class="fas fa-${card.icon} card-icon"></i>` : '';

                return `
                    <div class="column-card">
                        ${iconHtml}
                        <h3 class="card-title">${card.title}</h3>
                        <div class="card-content">${html}</div>
                    </div>
                `;
            }).join('');

            return `
                <div class="columns-container" style="grid-template-columns: repeat(${token.cols}, 1fr);">
                    ${cardsHtml}
                </div>
            `;
        }
    };

    // ==================== FRAMES ====================
    const frame = {
        name: 'frame',
        level: 'block',
        start(src) {
            return src.match(/<Frame(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^<Frame([^>]*)>([\s\S]*?)<\/Frame>/;
            const match = rule.exec(src);
            if (match) {
                const props = match[1];
                const content = match[2].trim();

                // Parse caption
                let caption = null;
                const captionMatch = props.match(/caption="([^"]+)"/);
                if (captionMatch) caption = captionMatch[1];

                return {
                    type: 'frame',
                    raw: match[0],
                    caption,
                    text: content,
                    tokens: []
                };
            }
        },
        renderer(token) {
            const html = marked.parse(token.text);
            const captionHtml = token.caption ? `<p class="frame-caption">${token.caption}</p>` : '';

            return `
                <div class="frame-container">
                    <div class="frame-content">
                        ${html}
                    </div>
                    ${captionHtml}
                </div>
            `;
        }
    };

    // ==================== EXPANDABLES ====================
    const expandable = {
        name: 'expandable',
        level: 'block',
        start(src) {
            return src.match(/<Expandable(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^<Expandable\s+title="([^"]+)"([^>]*)>([\s\S]*?)<\/Expandable>/;
            const match = rule.exec(src);
            if (match) {
                const title = match[1];
                const props = match[2];
                const content = match[3].trim();

                // Parse defaultOpen
                let defaultOpen = false;
                const defaultOpenMatch = props.match(/defaultOpen\s*=\s*(true|"true")/);
                if (defaultOpenMatch) defaultOpen = true;

                return {
                    type: 'expandable',
                    raw: match[0],
                    title,
                    defaultOpen,
                    text: content,
                    tokens: []
                };
            }
        },
        renderer(token) {
            const html = marked.parse(token.text);
            const expandableId = 'expandable-' + Math.random().toString(36).substr(2, 9);
            const activeClass = token.defaultOpen ? 'active' : '';

            return `
                <div class="expandable-item ${activeClass}" id="${expandableId}">
                    <div class="expandable-header" onclick="toggleExpandable('${expandableId}')">
                        <span class="expandable-title">${token.title}</span>
                        <i class="fas fa-chevron-down expandable-icon"></i>
                    </div>
                    <div class="expandable-content">
                        ${html}
                    </div>
                </div>
            `;
        }
    };

    // ==================== RESPONSE FIELDS ====================
    const responseField = {
        name: 'responseField',
        level: 'block',
        start(src) {
            return src.match(/<ResponseField(\s|>)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^<ResponseField\s+name="([^"]+)"\s+type="([^"]+)"([^>]*)>([\s\S]*?)<\/ResponseField>/;
            const match = rule.exec(src);
            if (match) {
                const name = match[1];
                const type = match[2];
                const props = match[3];
                const content = match[4].trim();

                // Parse optional properties
                let required = false;
                let defaultValue = null;
                let deprecated = false;

                if (props.includes('required')) required = true;
                if (props.includes('deprecated')) deprecated = true;

                const defaultMatch = props.match(/default="([^"]+)"/);
                if (defaultMatch) defaultValue = defaultMatch[1];

                return {
                    type: 'responseField',
                    raw: match[0],
                    name,
                    fieldType: type,
                    required,
                    defaultValue,
                    deprecated,
                    text: content,
                    tokens: []
                };
            }
        },
        renderer(token) {
            const html = marked.parse(token.text);
            const requiredBadge = token.required ? '<span class="field-badge field-required">required</span>' : '';
            const deprecatedBadge = token.deprecated ? '<span class="field-badge field-deprecated">deprecated</span>' : '';
            const defaultBadge = token.defaultValue ? `<span class="field-badge field-default">default: ${token.defaultValue}</span>` : '';

            return `
                <div class="response-field">
                    <div class="response-field-header">
                        <span class="field-name">${token.name}</span>
                        <span class="field-type">${token.fieldType}</span>
                        ${requiredBadge}
                        ${deprecatedBadge}
                        ${defaultBadge}
                    </div>
                    <div class="response-field-content">
                        ${html}
                    </div>
                </div>
            `;
        }
    };

    // Custom extension for :::info and :::warning blocks (legacy support)
    const admonition = {
        name: 'admonition',
        level: 'block',
        start(src) {
            return src.match(/:::(info|warning)/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^:::(info|warning)\n([\s\S]+?)\n:::/;
            const match = rule.exec(src);
            if (match) {
                const admonitionType = match[1];
                const rawContent = match[2].trim();

                let parsedTitle = admonitionType.charAt(0).toUpperCase() + admonitionType.slice(1);
                let parsedMessage = rawContent;

                const titleMessageRule = /^#\s*(.*?)\s*#\s*([\s\S]*)$/;
                const titleMessageMatch = titleMessageRule.exec(rawContent);

                if (titleMessageMatch) {
                    parsedTitle = titleMessageMatch[1].trim();
                    parsedMessage = titleMessageMatch[2].trim();
                }

                const token = {
                    type: 'admonition',
                    raw: match[0],
                    level: this.lexer.state.level,
                    admonitionType: admonitionType,
                    title: parsedTitle,
                    message: parsedMessage,
                    tokens: []
                };
                this.lexer.inlineTokens(token.message, token.tokens);
                return token;
            }
        },
        renderer(token) {
            const iconClass = token.admonitionType === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
            const content = this.parser.parseInline(token.tokens);

            return `
                <div class="${token.admonitionType}-box">
                    <div class="${token.admonitionType}-title">
                        <i class="${iconClass}"></i>
                        <span>${token.title.toUpperCase()}</span>
                    </div>
                    <p>${content}</p>
                </div>
            `;
        }
    };

    // Custom extension for buttons (legacy support)
    const button = {
        name: 'button',
        level: 'inline',
        start(src) {
            return src.match(/\[.*?\]\(.*?\)\{\.btn\}/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^\[(.*?)\]\((.*?)\)\{\.btn\}/;
            const match = rule.exec(src);
            if (match) {
                return {
                    type: 'button',
                    raw: match[0],
                    text: match[1],
                    href: match[2]
                };
            }
        },
        renderer(token) {
            return `<a href="${token.href}" class="btn btn-outline-accent">${token.text}</a>`;
        }
    };

    // Custom extension for colored text (legacy support)
    const coloredText = {
        name: 'coloredText',
        level: 'inline',
        start(src) {
            return src.match(/\{color:(accent|secondary|warning)\}/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^\{color:(accent|secondary|warning)\}(.*?)\{\/color\}/;
            const match = rule.exec(src);
            if (match) {
                return {
                    type: 'coloredText',
                    raw: match[0],
                    colorType: match[1],
                    text: match[2]
                };
            }
        },
        renderer(token) {
            return `<span class="color-${token.colorType}">${token.text}</span>`;
        }
    };

    // Custom renderer for code blocks with Prism.js syntax highlighting
    const customCodeRenderer = {
        code(token, lang, escaped) {
            const actualCodeString = token.text || '';
            const language = lang || token.lang || 'plaintext';

            const validLang = language && Prism.languages[language] ? language : 'plaintext';
            let highlighted = actualCodeString;

            if (validLang !== 'plaintext' && Prism.languages[validLang]) {
                try {
                    highlighted = Prism.highlight(actualCodeString, Prism.languages[validLang], validLang);
                } catch (e) {
                    highlighted = escapeHtml(actualCodeString);
                }
            } else {
                highlighted = escapeHtml(actualCodeString);
            }

            const languageLabel = validLang.charAt(0).toUpperCase() + validLang.slice(1);

            return `
                <div class="code-block-wrapper">
                    <div class="code-block-header">
                        <span class="code-language">${languageLabel}</span>
                        <button class="copy-code-btn" data-clipboard-text="${escapeHtml(actualCodeString)}">
                            <i class="fa-regular fa-copy"></i> Copy
                        </button>
                    </div>
                    <pre class="language-${validLang}"><code class="language-${validLang}">${highlighted}</code></pre>
                </div>
            `;
        },
        // Custom renderer for images to add lazy loading
        image(token) {
            const href = token.href;
            const title = token.title || '';
            const text = token.text || '';

            return `<img src="${href}" alt="${text}" title="${title}" loading="lazy">`;
        }
    };

    // Export the extensions and renderer
    window.markedExtensions = {
        extensions: [
            callout,
            tabs,
            steps,
            accordion,
            accordionGroup,
            codeGroup,
            columns,
            frame,
            expandable,
            responseField,
            admonition,
            button,
            coloredText
        ],
        renderer: customCodeRenderer
    };

    // ==================== HELPER FUNCTIONS ====================
    // These functions are used by the components for interactivity

    window.switchTab = function(tabId, index) {
        const container = document.getElementById(tabId);
        if (!container) return;

        // Update tab buttons
        const buttons = container.querySelectorAll('.tab-button');
        buttons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });

        // Update tab panels
        const panels = container.querySelectorAll('.tab-panel');
        panels.forEach((panel, i) => {
            panel.classList.toggle('active', i === index);
        });
    };

    window.toggleAccordion = function(accordionId) {
        const accordion = document.getElementById(accordionId);
        if (!accordion) return;

        accordion.classList.toggle('active');
    };

    window.toggleExpandable = function(expandableId) {
        const expandable = document.getElementById(expandableId);
        if (!expandable) return;

        expandable.classList.toggle('active');
    };

    window.switchCodeBlock = function(groupId, index) {
        const group = document.getElementById(groupId);
        if (!group) return;

        const indexNum = parseInt(index);

        // Update tabs if present
        const tabs = group.querySelectorAll('.code-group-tab');
        tabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === indexNum);
        });

        // Update blocks
        const blocks = group.querySelectorAll('.code-group-block');
        blocks.forEach((block, i) => {
            if (group.classList.contains('code-group-dropdown')) {
                block.style.display = i === indexNum ? 'block' : 'none';
            } else {
                block.classList.toggle('active', i === indexNum);
            }
        });
    };
})();
