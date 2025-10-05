# QuantomDocs - Project Plan

## Project Overview

### Project Name
QuantomDocs - Documentation & Download Portal

### Project Purpose
QuantomDocs is a comprehensive static documentation and download management website for Quantom Minecraft server software. The project serves as a central hub for documentation, downloads, blog content, and community resources. It combines static HTML pages with dynamic JavaScript-driven content management, Python backend tools for downloads management, and a Discord bot integration for remote administration.

### Architecture Overview
The project follows a hybrid architecture combining:
- **Frontend**: Static HTML pages with dynamic JavaScript content loading
- **Backend Services**:
  - Node.js/Express server (`server.js`) for authentication, file uploads, and admin operations
  - Python Flask server (`upload_server.py`) for file upload handling
  - Python CLI tools (`manager.py`) for downloads.json management
  - Discord bot (`bot.py`) for remote downloads management
- **Data Management**: JSON-based configuration files for documentation structure, downloads, and blog content
- **Content Delivery**: Markdown-based documentation with client-side rendering
- **Styling**: Centralized CSS variable system with dark theme and responsive design

### Technology Stack

**Frontend:**
- HTML5
- CSS3 (with centralized CSS variable system)
- Vanilla JavaScript (ES6+)
- Font Awesome 6.0 (icon library)
- Marked.js (Markdown rendering)
- GitHub Markdown CSS

**Backend:**
- Node.js with Express.js
- Python 3.11
- Flask (Python web framework)
- Discord.py (Discord bot framework)

**Key Dependencies:**
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `multer` - File upload handling
- `express-rate-limit` - Rate limiting middleware
- `nodemon` - Development auto-reload

**Python Dependencies:**
- Standard library only for `manager.py` and `upload_server.py`
- `discord.py` for Discord bot

**Data Storage:**
- JSON files (config/docs-config.json, config/downloads.json, config/blog.json, config/users.json)
- File system storage for downloads and images

---

## TODO Management Instructions

This TODO section serves as the central tracking system for the QuantomDocs project improvement and enhancement plan. It must be kept current at all times:
- **Always Updated**: Add new tasks as they arise during implementation
- **Progress Tracking**: Mark tasks as in_progress when starting, completed when finished
- **Context for Future Sessions**: Provides complete project state for continuation
- **Detailed Tasks**: Each task includes file paths, purpose, and implementation details
- **Phase-Based Organization**: Tasks grouped by implementation phases
- **Keep Claude's TODO updated**: Keep the session's todo list always up to date and provide the tasks and what you still have to do from the current phase
- **Do not summarise**: Do not summarise information of tasks and todos

---

## Project Status

**Current Phase**: Phase 2 - Documentation & Performance Improvements (COMPLETED)
**Overall Progress**: Phase 1 fully completed (4/4 phases), Phase 2 fully completed (6/6 phases)
**Last Updated**: 2025-10-05
**Active Tasks**: Phase 2 completed, ready for Phase 3
**Completed Phases**:

---


---


## Phase 3 - Documentation Page Enhancements

**Background**: The documentation page needs additional functionality to improve user experience when working with documentation content. Users need to easily identify which category they're viewing and have convenient options to copy, view, or download documentation pages in markdown format for use with LLMs or other tools.

**Overall Goal**: Enhance the documentation page with category display and provide multiple options for users to access page content in different formats through a split button interface.

---

### Phase 3.1 - Category Display Implementation

**Background & Context**:
Currently, when viewing documentation pages, users cannot easily see which category the current page belongs to without looking at the left sidebar. Adding a category display at the top of each markdown page will provide better context and improve navigation awareness. This is especially important on mobile devices where the sidebar may be hidden.

**Work Instructions**:

1. **Identify Current Page Category**
   - Update the `loadContent()` function in `js/common.js` to track and store the current category
   - Extract the category information from the `docsConfig` structure when a page is loaded
   - Store the current category in a global variable or data attribute for access by other functions

2. **Create Category Display Element**
   - Add a new HTML element at the top of the markdown content area in `docs.html`
   - Position this element above the `#dynamic-content-area` but inside the `.main-content` section
   - The element should be visually distinct but not intrusive

3. **Style Category Display**
   - Create CSS styles in `css/docs.css` for the category display
   - Use existing CSS color variables from `common.css`
   - Design should be:
     - Subtle background color using `var(--card-background-color)`
     - Text color using `var(--secondary-text-color)` for the label and `var(--text-color)` for the category name
     - Small font size (0.85em - 0.9em)
     - Appropriate padding and margins to separate from content
     - Border radius consistent with other UI elements (6px - 8px)
   - Responsive design: should work well on mobile and desktop

4. **Update Category Display Dynamically**
   - When `loadContent()` is called, update the category display text
   - Handle both static HTML content and dynamic markdown content
   - For static content (like "Getting started"), show the corresponding category from config
   - Ensure category display is hidden when showing the default getting started page or when no content is loaded

**Files to Create/Modify**:
- `docs.html` - Add category display container element between mobile menu buttons and main content
- `js/common.js` - Update `loadContent()` function to populate category display, track current category
- `css/docs.css` - Add styles for category display element, ensure responsive behavior

**Expected Outcome**:
- Category name is visible at the top of each documentation page
- Category display updates automatically when navigating between pages
- Visual design is consistent with existing UI elements
- Responsive design works on all screen sizes
- Category display is hidden appropriately for the default getting started page

**Additional Information**:
- **Related Tasks**: This will work in conjunction with Phase 3.2 split button implementation
- **Important Files**: `config/docs-config.json` contains the category structure
- **Dependencies**: None - can be implemented independently
- **Notes**: Category information is available in the `docsConfig` array structure, where each category has a `category` field and contains `items`

---

### Phase 3.2 - Split Button Implementation for Page Actions

**Background & Context**:
Users need convenient ways to access documentation content in different formats, especially for use with Large Language Models (LLMs) or for offline reference. A split button interface provides the main "Copy Page" action with quick access, while additional options are available through a dropdown menu. This pattern is common in modern UIs and provides both efficiency and discoverability.

**Work Instructions**:

1. **Create HTML Structure for Split Button**
   - Add a new container for the category header and split button in `docs.html`
   - Structure should be a flex container with space-between alignment:
     ```html
     <div id="page-header-controls" class="page-header-controls">
         <div class="category-display">
             <span class="category-label">Category:</span>
             <span id="current-category-name" class="category-name"></span>
         </div>
         <div class="split-button-container">
             <!-- Split button components will go here -->
         </div>
     </div>
     ```
   - Split button container should include:
     - Main button with "Copy Page" text and copy icon
     - Visual separator (divider line)
     - Arrow button for dropdown toggle
     - Dropdown menu container (initially hidden)

2. **Implement Split Button Visual Design**
   - File: `css/docs.css`
   - Create unified button appearance with two distinct clickable areas:
     - Use flexbox to position main button and arrow side-by-side
     - Add a vertical divider line between the two areas (1px solid using `var(--border-color)`)
     - Main button section (left): includes icon and "Copy Page" text
     - Arrow section (right): includes chevron-down icon
   - Button styling:
     - Background: `var(--card-background-color)`
     - Border: 1px solid `var(--border-color)`
     - Border radius: 8px
     - Padding: 10px 15px for main button, 10px 12px for arrow
     - Transition effects for hover states
   - Hover states:
     - Main button hover: background changes to subtle highlight
     - Arrow hover: background changes to subtle highlight
     - Each section should hover independently
   - Use FontAwesome icons:
     - Copy icon: `fa-regular fa-copy` (two overlapping rectangles)
     - Arrow: `fa-solid fa-chevron-down`

3. **Create Dropdown Menu Structure**
   - Add dropdown menu container below the split button
   - Position: absolute, right-aligned with the split button
   - Initially hidden (display: none or opacity: 0)
   - Contains three menu items, each with:
     - Icon (left aligned)
     - Text label and description (center, two lines)
     - Appropriate hover states
   - Dropdown menu items:

     **Option 1: Copy Page**
     - Icon: `fa-regular fa-copy`
     - Label: "Copy Page"
     - Description: "Copy page as Markdown for LLMs"

     **Option 2: View as Markdown**
     - Icon: `fa-solid fa-code` or similar markdown icon
     - Label: "View as Markdown"
     - Description: "View this page as plain text"

     **Option 3: Download Page**
     - Icon: `fa-solid fa-download`
     - Label: "Download Page"
     - Description: "Download this page as markdown"

4. **Style Dropdown Menu**
   - File: `css/docs.css`
   - Dropdown container styling:
     - Background: `var(--card-background-color)`
     - Border: 1px solid `var(--border-color)`
     - Border radius: 8px
     - Box shadow for depth: `0 4px 12px rgba(0, 0, 0, 0.15)`
     - Padding: 8px
     - Min-width: 280px
     - Z-index: 1000
   - Menu item styling:
     - Display as flex with icon, text container, and spacing
     - Padding: 12px
     - Border radius: 6px
     - Cursor: pointer
     - Transition for smooth hover
   - Menu item hover state:
     - Background: `var(--accent-color)` with low opacity (rgba)
     - Text color remains readable
   - Icon styling:
     - Color: `var(--accent-color)`
     - Size: 1.2em
     - Margin-right: 12px
   - Text styling:
     - Label: `var(--text-color)`, font-weight: 600
     - Description: `var(--secondary-text-color)`, font-size: 0.85em

5. **Implement Dropdown Toggle Functionality**
   - File: `js/docs.js` or `js/common.js`
   - Add event listener to arrow button
   - On click:
     - Toggle dropdown visibility (display: block/none or opacity 0/1 with transition)
     - Rotate arrow icon 180 degrees when open
     - Add/remove "active" class to arrow button
   - CSS for arrow rotation:
     ```css
     .arrow-button.active i {
         transform: rotate(180deg);
         transition: transform 0.3s ease;
     }
     ```
   - Close dropdown when clicking outside:
     - Add document-level click listener
     - Check if click target is outside dropdown and button
     - If outside, close dropdown and rotate arrow back
   - Close dropdown when pressing Escape key

6. **Implement Main "Copy Page" Button Functionality**
   - File: `js/docs.js` or `js/common.js`
   - Add click event listener to main button (left side of split button)
   - On click:
     - Get the current markdown content from the page
     - If viewing static HTML content, skip or show message
     - If viewing markdown content, fetch the raw markdown file again
     - Copy the raw markdown text to clipboard using `navigator.clipboard.writeText()`
     - Show success feedback: change button text from "Copy Page" to "Copied!" for 3 seconds
     - Change copy icon to checkmark icon temporarily
     - Reset text and icon after 3 seconds
   - Handle errors:
     - If clipboard API fails, show error message
     - Fallback to older clipboard methods if needed

7. **Implement Dropdown Option 1: Copy Page**
   - Same functionality as main button
   - When clicked:
     - Copy markdown to clipboard
     - Close dropdown
     - Show temporary success state on main button
   - This provides two ways to access the same function (convenience)

8. **Implement Dropdown Option 2: View as Markdown**
   - File: `js/docs.js` or `js/common.js`
   - On click:
     - Fetch the raw markdown file
     - Create a modal/overlay to display the raw markdown text
     - Use a `<pre>` or `<textarea>` element for display
     - Make text selectable for manual copying
     - Add a "Close" button to dismiss the modal
   - Modal styling (create in `css/docs.css`):
     - Full screen overlay with semi-transparent background
     - Centered content box
     - Scrollable if content is long
     - Close button in top-right corner
   - Close modal when:
     - Clicking the close button
     - Clicking outside the modal
     - Pressing Escape key

9. **Implement Dropdown Option 3: Download Page**
   - File: `js/docs.js` or `js/common.js`
   - On click:
     - Fetch the raw markdown file
     - Create a Blob object with the markdown content
     - Create a temporary download link using `URL.createObjectURL()`
     - Set the download filename (use current page title + .md extension)
     - Trigger download programmatically
     - Clean up the temporary URL
   - Example implementation:
     ```javascript
     async function downloadPageAsMarkdown() {
         const markdown = await fetchCurrentMarkdown();
         const blob = new Blob([markdown], { type: 'text/markdown' });
         const url = URL.createObjectURL(blob);

         const a = document.createElement('a');
         a.href = url;
         a.download = getCurrentPageTitle() + '.md';
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);

         closeDropdown();
     }
     ```

10. **Create Helper Functions**
    - File: `js/docs.js` or `js/common.js`
    - `fetchCurrentMarkdown()` - Fetches the raw markdown content of current page
    - `getCurrentPageTitle()` - Returns current page title for use in filename
    - `copyToClipboard(text)` - Handles clipboard copying with error handling
    - `closeDropdown()` - Closes the dropdown and resets arrow rotation
    - `showCopySuccess()` - Shows temporary success state on button
    - Track current file path in a variable when content is loaded

11. **Handle Edge Cases**
    - Static HTML content (Getting Started page):
      - Disable or hide the split button when viewing static content
      - Or show a message that this feature is only for markdown pages
    - No content loaded:
      - Hide the entire page header controls container
    - Mobile devices:
      - Ensure split button is touch-friendly (adequate tap target size)
      - Dropdown should be positioned appropriately on small screens
      - Consider making dropdown full-width on mobile if needed
    - Long page titles in download filename:
      - Sanitize filename to remove invalid characters
      - Truncate if too long

12. **Add Accessibility Features**
    - Add `aria-label` attributes to buttons
    - Add `aria-expanded` attribute to arrow button (true/false based on dropdown state)
    - Add `role="menu"` to dropdown
    - Add `role="menuitem"` to dropdown options
    - Ensure keyboard navigation works:
      - Tab to split button
      - Enter/Space to activate
      - Arrow keys to navigate dropdown items
      - Enter to select dropdown item
      - Escape to close dropdown

13. **Responsive Design Adjustments**
    - File: `css/docs.css`
    - On tablets (max-width: 1024px):
      - Split button may need to stack vertically with category display
      - Ensure both elements are visible and usable
    - On mobile (max-width: 768px):
      - Category display and split button in a column layout
      - Split button may need to be full-width
      - Dropdown should align properly on small screens
    - On very small screens (max-width: 480px):
      - Consider hiding the descriptions in dropdown items
      - Only show icons and main labels
      - Reduce padding and font sizes appropriately

**Files to Create/Modify**:
- `docs.html` - Add page header controls container with split button structure
- `js/docs.js` or `js/common.js` - Implement all button functionality, dropdown toggle, copy/view/download functions, helper functions
- `css/docs.css` - Create styles for split button, dropdown menu, modal for viewing markdown, responsive design rules

**Expected Outcome**:
- Category name is displayed at the top of each markdown documentation page
- Split button appears on the right side of the category display
- Main "Copy Page" button copies markdown to clipboard with visual feedback
- Arrow button toggles dropdown menu with smooth animation
- Dropdown menu shows three options with clear icons and descriptions
- "Copy Page" option in dropdown works identically to main button
- "View as Markdown" opens a modal displaying raw markdown text
- "Download Page" triggers a download of the markdown file with appropriate filename
- All interactions work smoothly with good visual feedback
- Responsive design works on all screen sizes
- Accessibility features are implemented
- Edge cases are handled gracefully

**Additional Information**:
- **Related Tasks**: Works together with Phase 3.1 category display
- **Important Files**:
  - Current markdown file path is tracked when `loadContent()` is called in `js/common.js`
  - File paths are relative to `docs/` directory
  - Markdown files are fetched from server, not stored client-side
- **Dependencies**: Requires that markdown content is being loaded via `loadContent()` function
- **Notes**:
  - The split button should only be visible when viewing markdown content, not static HTML
  - Consider using FontAwesome 6.0 icons as already included in the project
  - Clipboard API requires HTTPS in production (works on localhost)
  - Consider adding analytics tracking for which options users use most

---

## Phase 3 Summary

**Total Time Estimate**: 8-12 hours

**Key Deliverables**:
- Category display showing current documentation category
- Split button with main "Copy Page" action
- Dropdown menu with three page action options
- Modal for viewing raw markdown
- Download functionality for markdown files
- Responsive design for all screen sizes
- Accessibility features implemented

**Success Metrics**:
- Users can easily identify which category they're viewing
- Users can quickly copy markdown content for LLMs with one click
- Alternative options are discoverable through dropdown
- All interactions work smoothly with good feedback
- Feature works on mobile and desktop devices
- No errors in browser console

**Dependencies**:
- None - can be implemented independently of other phases
- Uses existing infrastructure (markdown loading, docs-config.json structure)
- Compatible with current page navigation system

**Testing Checklist**:
- [ ] Category display shows correct category for each page
- [ ] Category display updates when navigating between pages
- [ ] Category display is hidden for static HTML content
- [ ] Split button appears correctly positioned
- [ ] Main "Copy Page" button copies markdown to clipboard
- [ ] "Copied!" success state appears and resets after 3 seconds
- [ ] Arrow button toggles dropdown menu
- [ ] Arrow icon rotates when dropdown opens/closes
- [ ] Dropdown closes when clicking outside
- [ ] Dropdown closes when pressing Escape key
- [ ] "Copy Page" option in dropdown works correctly
- [ ] "View as Markdown" opens modal with raw markdown
- [ ] Modal displays markdown in readable format
- [ ] Modal can be closed via button, outside click, and Escape key
- [ ] "Download Page" triggers file download
- [ ] Downloaded file has correct filename and content
- [ ] All features work on desktop browsers
- [ ] All features work on mobile devices
- [ ] Responsive design looks good on all screen sizes
- [ ] No console errors during any interaction
- [ ] Keyboard navigation works properly
- [ ] Screen readers can access all functionality


---

## Key Progress & Milestones

### Current Session - 2025-10-04
- Created initial plan.md structure
- Completed comprehensive project analysis (Subphase 1.1)
- Documented entire project structure, architecture, and technology stack
- Identified key components: HTML pages, JavaScript modules, CSS files, Python backend, Node.js server
- Documented configuration files and data structures
- Identified immediate security concerns (hardcoded secrets in bot.py and server.js)

### Key Decisions Made
- Chose phase-based approach for project improvements
- Prioritized security, code quality, and architecture over new features
- Decided to maintain current technology stack while improving implementation
- Will use environment variables for secrets management
- Will maintain JSON-based configuration approach

### Important Notes
- Project has a solid foundation but needs security hardening
- Code quality is generally good but has room for improvement
- Architecture is functional but could benefit from better separation of concerns
- Documentation exists but needs expansion
- No automated testing infrastructure currently exists
- Project uses both Python and Node.js backends which adds complexity but provides flexibility

---
