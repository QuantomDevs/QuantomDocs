/**
 * MARKDOWN SYNC MODULE
 * Handles bidirectional conversion between Markdown and HTML
 */

class MarkdownSync {
    constructor() {
        // Initialize Turndown for HTML to Markdown conversion
        this.turndownService = new TurndownService({
            headingStyle: 'atx',
            hr: '---',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced',
            fence: '```',
            emDelimiter: '*',
            strongDelimiter: '**',
            linkStyle: 'inlined'
        });

        // Add custom rules for better markdown conversion
        this.setupTurndownRules();

        // Initialize Showdown for Markdown to HTML conversion
        this.showdownConverter = new showdown.Converter({
            tables: true,
            strikethrough: true,
            tasklists: true,
            smoothLivePreview: true,
            simpleLineBreaks: false,
            ghCodeBlocks: true,
            ghCompatibleHeaderId: true,
            headerLevelStart: 1,
            parseImgDimensions: true,
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
            literalMidWordUnderscores: true,
            emoji: true,
            ghMentions: false,
            openLinksInNewWindow: true
        });
    }

    /**
     * Setup custom Turndown rules for better conversion
     */
    setupTurndownRules() {
        // Handle code blocks with syntax highlighting
        this.turndownService.addRule('fencedCodeBlock', {
            filter: function (node, options) {
                return (
                    node.nodeName === 'PRE' &&
                    node.firstChild &&
                    node.firstChild.nodeName === 'CODE'
                );
            },
            replacement: function (content, node, options) {
                const className = node.firstChild.className || '';
                const language = (className.match(/language-(\S+)/) || ['', ''])[1];
                const code = node.firstChild.textContent;

                const fence = options.fence;
                return (
                    '\n\n' + fence + language + '\n' +
                    code.replace(/\n$/, '') +
                    '\n' + fence + '\n\n'
                );
            }
        });

        // Handle tables properly
        this.turndownService.addRule('tableCell', {
            filter: ['th', 'td'],
            replacement: function (content, node) {
                return ' ' + content.trim() + ' |';
            }
        });

        // Handle strikethrough
        this.turndownService.addRule('strikethrough', {
            filter: ['del', 's', 'strike'],
            replacement: function (content) {
                return '~~' + content + '~~';
            }
        });

        // Handle task lists
        this.turndownService.addRule('taskListItems', {
            filter: function (node) {
                return (
                    node.type === 'checkbox' &&
                    node.parentNode.nodeName === 'LI'
                );
            },
            replacement: function (content, node) {
                return (node.checked ? '[x] ' : '[ ] ') + content;
            }
        });
    }

    /**
     * Convert HTML to Markdown
     * @param {string} html - HTML string to convert
     * @returns {string} Markdown string
     */
    htmlToMarkdown(html) {
        try {
            return this.turndownService.turndown(html);
        } catch (error) {
            console.error('Error converting HTML to Markdown:', error);
            return '';
        }
    }

    /**
     * Convert Markdown to HTML
     * @param {string} markdown - Markdown string to convert
     * @returns {string} HTML string
     */
    markdownToHtml(markdown) {
        try {
            return this.showdownConverter.makeHtml(markdown);
        } catch (error) {
            console.error('Error converting Markdown to HTML:', error);
            return '';
        }
    }

    /**
     * Convert Markdown to Quill Delta format
     * This converts markdown to HTML first, then lets Quill parse it
     * @param {string} markdown - Markdown string to convert
     * @returns {string} HTML string that Quill can understand
     */
    markdownToQuillHtml(markdown) {
        const html = this.markdownToHtml(markdown);
        // Clean up the HTML for Quill
        return this.cleanHtmlForQuill(html);
    }

    /**
     * Clean HTML to be compatible with Quill
     * @param {string} html - HTML string to clean
     * @returns {string} Cleaned HTML string
     */
    cleanHtmlForQuill(html) {
        // Remove wrapper paragraphs that Showdown adds
        html = html.replace(/^<p>(.*)<\/p>$/s, '$1');

        // Ensure code blocks have proper structure
        html = html.replace(/<pre><code class="([^"]+)">([\s\S]*?)<\/code><\/pre>/g,
            '<pre class="$1"><code>$2</code></pre>');

        return html;
    }

    /**
     * Extract plain text from markdown (for search indexing)
     * @param {string} markdown - Markdown string
     * @returns {string} Plain text
     */
    extractPlainText(markdown) {
        // Convert to HTML first
        const html = this.markdownToHtml(markdown);

        // Create a temporary div to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Get text content
        return temp.textContent || temp.innerText || '';
    }

    /**
     * Validate markdown syntax
     * @param {string} markdown - Markdown string to validate
     * @returns {Object} { valid: boolean, errors: Array }
     */
    validateMarkdown(markdown) {
        const errors = [];

        // Check for unclosed code blocks
        const codeBlockMatches = markdown.match(/```/g);
        if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
            errors.push('Unclosed code block detected');
        }

        // Check for unclosed bold/italic markers
        const boldMatches = markdown.match(/\*\*/g);
        if (boldMatches && boldMatches.length % 2 !== 0) {
            errors.push('Unclosed bold marker detected');
        }

        const italicMatches = markdown.match(/(?<!\*)\*(?!\*)/g);
        if (italicMatches && italicMatches.length % 2 !== 0) {
            errors.push('Unclosed italic marker detected');
        }

        // Check for malformed links
        const linkMatches = markdown.match(/\[([^\]]+)\]\(([^\)]*)\)/g);
        if (linkMatches) {
            linkMatches.forEach(link => {
                const urlMatch = link.match(/\(([^\)]*)\)/);
                if (urlMatch && !urlMatch[1]) {
                    errors.push('Empty link URL detected');
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitize markdown input to prevent XSS
     * @param {string} markdown - Markdown string to sanitize
     * @returns {string} Sanitized markdown
     */
    sanitizeMarkdown(markdown) {
        // Remove any script tags
        markdown = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove event handlers from HTML tags
        markdown = markdown.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

        // Remove javascript: URLs
        markdown = markdown.replace(/javascript:/gi, '');

        return markdown;
    }

    /**
     * Format markdown with proper spacing and structure
     * @param {string} markdown - Markdown string to format
     * @returns {string} Formatted markdown
     */
    formatMarkdown(markdown) {
        // Ensure proper spacing around headers
        markdown = markdown.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');

        // Ensure blank lines before and after code blocks
        markdown = markdown.replace(/([^\n])(\n```)/g, '$1\n$2');
        markdown = markdown.replace(/(```\n)([^\n])/g, '$1\n$2');

        // Normalize line endings
        markdown = markdown.replace(/\r\n/g, '\n');

        // Remove trailing whitespace
        markdown = markdown.replace(/[ \t]+$/gm, '');

        return markdown;
    }
}

// Create global instance
window.markdownSync = new MarkdownSync();
