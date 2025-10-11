# Contributing to QuantomDocs

First off, thank you for considering contributing to QuantomDocs! It's people like you that make QuantomDocs such a great tool for the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/QuantomDocs.git
   cd QuantomDocs
   ```
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/original-owner/QuantomDocs.git
   ```
4. **Install dependencies:**
   ```bash
   npm install
   ```
5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🤔 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** after following the steps
- **Explain which behavior you expected** to see instead and why
- **Include screenshots or animated GIFs** if relevant
- **Include your environment details:**
  - OS version
  - Node.js version
  - Browser and version (for frontend issues)
  - Any relevant configuration

**Bug Report Template:**
```markdown
**Description:**
A clear and concise description of the bug.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What you expected to happen.

**Actual Behavior:**
What actually happened.

**Screenshots:**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 13.0]
- Node.js: [e.g., 18.0.0]
- Browser: [e.g., Chrome 115]

**Additional Context:**
Any other relevant information.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives** you've considered
- **Include mockups or examples** if applicable

**Feature Request Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like:**
A clear description of what you want to happen.

**Describe alternatives you've considered:**
Any alternative solutions or features you've considered.

**Additional context:**
Any other context, screenshots, or mockups.
```

### Contributing Code

1. **Check existing issues** or create a new one to discuss your plans
2. **Fork the repository** and create a branch from `main`
3. **Make your changes** following our coding standards
4. **Add tests** if applicable
5. **Update documentation** if needed
6. **Ensure all tests pass**
7. **Submit a pull request**

### Contributing Documentation

Documentation improvements are always welcome! This includes:

- Fixing typos or grammatical errors
- Clarifying existing documentation
- Adding examples or use cases
- Writing tutorials or guides
- Translating documentation

## 💻 Development Workflow

### Before Starting Work

1. **Pull the latest changes:**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   Use prefixes:
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation changes
   - `refactor/` - Code refactoring
   - `test/` - Adding tests
   - `chore/` - Maintenance tasks

### During Development

1. **Make incremental commits** with clear messages
2. **Run tests frequently** to catch issues early
3. **Follow coding standards** (see below)
4. **Update documentation** as you go

### Before Submitting

1. **Run the full test suite:**
   ```bash
   npm test
   ```

2. **Check code quality:**
   ```bash
   npm run lint
   ```

3. **Test manually:**
   - Start the server: `node server.js`
   - Test your changes in the browser
   - Check responsive design
   - Verify all functionality works

4. **Update documentation** if necessary

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### General Guidelines

- **Write clean, readable, and maintainable code**
- **Use meaningful variable and function names**
- **Keep functions focused and single-purpose**
- **Add comments for complex logic**
- **Follow DRY (Don't Repeat Yourself) principle**

### JavaScript

- **Use ES6+ features** (const/let, arrow functions, destructuring, etc.)
- **Use semicolons** consistently
- **Use 2 spaces** for indentation
- **Use single quotes** for strings (unless string contains single quote)
- **Use camelCase** for variables and functions
- **Use PascalCase** for classes
- **Use UPPER_SNAKE_CASE** for constants

**Example:**
```javascript
// Good
const userName = 'John Doe';
const MAX_RETRIES = 3;

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad
var user_name = "John Doe";
const max_retries = 3;

function CalculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}
```

### CSS

- **Use CSS variables** from `common.css` - never hardcode colors
- **Use kebab-case** for class names
- **Use BEM methodology** where appropriate
- **Group related properties** together
- **Use 2 spaces** for indentation
- **Use shorthand properties** when possible

**Example:**
```css
/* Good */
.button-primary {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--accent-primary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
}

/* Bad */
.buttonPrimary {
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 16px;
  background-color: #007bff;
  color: #ffffff;
  border-radius: 8px;
}
```

### HTML

- **Use semantic HTML5 elements** (header, nav, main, article, section, footer)
- **Use 2 spaces** for indentation
- **Use double quotes** for attributes
- **Include alt text** for images
- **Use meaningful IDs and classes**

**Example:**
```html
<!-- Good -->
<article class="doc-page">
  <header class="doc-page-header">
    <h1>Page Title</h1>
  </header>
  <section class="doc-page-content">
    <p>Content here</p>
  </section>
</article>

<!-- Bad -->
<div class="page">
  <div class="header">
    <h1>Page Title</h1>
  </div>
  <div class="content">
    <p>Content here</p>
  </div>
</div>
```

### File Organization

- **Group related files** in logical directories
- **Use consistent naming conventions**
- **Separate concerns** (HTML, CSS, JS in separate files)
- **Keep files focused** (one component per file when possible)

### Configuration Management

- **Never commit secrets** (API keys, passwords, tokens)
- **Use environment variables** for sensitive data
- **Provide example config files** (e.g., `.env.example`)
- **Document all configuration options**

## 📨 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation only changes
- **style:** Changes that don't affect code meaning (formatting, etc.)
- **refactor:** Code change that neither fixes a bug nor adds a feature
- **perf:** Performance improvement
- **test:** Adding missing tests or correcting existing tests
- **chore:** Changes to build process or auxiliary tools

### Examples

```bash
# Feature
feat(editor): add slash command palette for markdown components

# Bug fix
fix(search): resolve JSON parsing error in search index builder

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(analytics): extract tracking logic into separate module

# Performance
perf(docs): implement lazy loading for markdown files

# Chore
chore(deps): update express to version 4.18.3
```

### Rules

- Use the imperative mood ("add" not "added" or "adds")
- Don't capitalize the first letter
- No period at the end
- Limit the subject line to 50 characters
- Separate subject from body with a blank line
- Wrap the body at 72 characters
- Use the body to explain what and why, not how

## 🔄 Pull Request Process

1. **Ensure your PR:**
   - Has a clear title describing the change
   - References related issues (e.g., "Fixes #123")
   - Includes a description of changes
   - Follows the coding standards
   - Includes tests if applicable
   - Updates documentation if needed

2. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Related Issues
   Fixes #(issue)

   ## Testing
   Describe how you tested your changes

   ## Screenshots (if applicable)
   Add screenshots

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   - [ ] All tests pass
   ```

3. **Review Process:**
   - At least one maintainer must review and approve
   - Address all review comments
   - Keep PR focused and small when possible
   - Be responsive to feedback

4. **After Approval:**
   - Maintainer will merge your PR
   - Your branch will be deleted
   - Your contribution will be in the next release!

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** - your question might be answered
3. **Try the latest version** - the issue might be fixed

### When Creating an Issue

- Use the appropriate template (bug report, feature request)
- Provide all requested information
- Be clear and concise
- Include code examples when relevant
- Add labels if you have permission

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority
- `priority: low` - Low priority
- `wontfix` - This will not be worked on

## 🏗️ Project Structure Understanding

Before contributing, familiarize yourself with:

- **`src/shared/`** - Common resources (CSS variables, common JS, images)
- **`src/main/`** - Main website pages (homepage, downloads, 404)
- **`src/docs/`** - Documentation system (docs pages, settings, content)
- **`src/legal/`** - Legal pages (terms, privacy, impressum)
- **`server.js`** - Main Express server with all API endpoints
- **`python-tools/`** - Python utilities (manager, bot, upload server)

### Key Files to Understand

- `src/shared/css/common.css` - CSS variables and theme system
- `src/shared/js/common.js` - Header/footer injection
- `src/docs/js/marked-extension.js` - Custom markdown components
- `src/docs/config/docs-config.json` - Documentation configuration

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test the following:

- [ ] Server starts without errors
- [ ] All pages load correctly
- [ ] Navigation works (including back/forward buttons)
- [ ] Search functionality works
- [ ] Mobile responsive design
- [ ] Dark/light theme toggle
- [ ] Forms validate properly
- [ ] API endpoints return expected data
- [ ] Authentication works
- [ ] File upload/download works
- [ ] No console errors or warnings

### Browser Testing

Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Device Testing

Test on multiple devices:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## 💬 Community

- **Questions?** Open a discussion or issue
- **Ideas?** We'd love to hear them!
- **Found a bug?** Report it!
- **Want to chat?** Join our Discord (link TBD)

## 🙏 Recognition

Contributors will be recognized in:
- The project README
- Release notes for their contributions
- GitHub contributors page

Thank you for contributing to QuantomDocs! Your efforts help make this project better for everyone. 🎉

---

**Note:** These guidelines may evolve over time. Please check back periodically for updates.

_Last updated: 2025-10-11_
