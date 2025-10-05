function escapeHtml(html) {
    return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

(function() {
    // Custom extension for :::info and :::warning blocks
    const block = {
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

                let parsedTitle = admonitionType.charAt(0).toUpperCase() + admonitionType.slice(1); // Default title
                let parsedMessage = rawContent;

                // Check for the custom title/message format: # TITLE # MESSAGE
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
                    tokens: [] // We will parse the message as inline tokens
                };
                this.lexer.inlineTokens(token.message, token.tokens); // Parse the message content
                return token;
            }
        },
        renderer(token) {
            const iconClass = token.admonitionType === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle';
            const content = this.parser.parseInline(token.tokens); // This will be the parsed message

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

    // Custom extension for buttons { .btn }
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

    // Custom extension for colored text {color:type}text{/color}
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

    // Custom renderer for code blocks with Prism.js syntax highlighting, language label, and copy button
    const customCodeRenderer = {
        code(token, lang, escaped) {
            const actualCodeString = token.text || '';
            const language = lang || token.lang || 'plaintext';

            // Validate language and use Prism.js for syntax highlighting
            const validLang = language && Prism.languages[language] ? language : 'plaintext';
            let highlighted = actualCodeString;

            // Apply Prism syntax highlighting
            if (validLang !== 'plaintext' && Prism.languages[validLang]) {
                try {
                    highlighted = Prism.highlight(actualCodeString, Prism.languages[validLang], validLang);
                } catch (e) {
                    // Fallback to escaped code if highlighting fails
                    highlighted = escapeHtml(actualCodeString);
                }
            } else {
                highlighted = escapeHtml(actualCodeString);
            }

            // Format language label for display
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
        extensions: [block, button, coloredText],
        renderer: customCodeRenderer
    };
})();
