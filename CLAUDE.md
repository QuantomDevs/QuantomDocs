# CLAUDE.md

Project guidance for Claude Code when working with QuantomDocs.

## Project Overview

QuantomDocs - Static documentation website for Quantom Minecraft server software.
- Node.js backend (Express) with static HTML frontend
- Python tools for downloads management and Discord bot
- JSON-based configuration for dynamic content
- Dark theme with responsive design

## Quick Start

**Server**: `node server.js` on port 5005
- Local: `http://localhost:5005`
- Network: `http://192.168.178.52:5005`
- Health: `/api/health`
- Settings: `/settings` (admin/admin123)

**URLs** (clean, no .html):
- `/main`, `/downloads`, `/docs`, `/legal`
- `/docs/{product}` → `/docs/quantom`
- `/docs/{product}/{category}/{page}` → `/docs/quantom/getting-started/installation`
- `/legal/{page}` → `/legal/terms-of-service`, `/legal/privacy-policy`, `/legal/impressum`

**Python Tools**:
- `python manager.py` - Manage downloads.json
- `python bot.py` - Discord bot
- `python upload_server.py` - File uploads
- Venv: `source venv/bin/activate`

## Architecture

**Structure**: `src/` → `shared/`, `main/`, `docs/`
- **shared/**: common.css (color variables, theme system), common.js (header/footer/nav), mobile-menu.js
- **main/**: index.html, downloads.html, 404.html, legal.html + respective CSS/JS, config/downloads.json, legal/*.md
- **docs/**: index.html, settings.html, docs.js (core), docs-products.js (routing), docs-search.js (Fuse.js), marked-extension.js (13 custom components), content/{product}/{##-Category}/files.md

**CSS System**:
- Centralized color variables in `shared/css/common.css`
- All colors use CSS variables (never hardcode)
- Breakpoints: 768px, 1024px, 1400px, 1600px, 1920px

**Docs System**:
- Multi-product support with path-based routing (`/docs/{product}/{category}/{page}`)
- Client-side SPA navigation (History API)
- marked.js + Prism.js + 13 custom components
- Fuse.js fuzzy search (IndexedDB cached)
- Service worker offline support
- Category ordering: `##-Category-Name` folders (01-Getting-Started, 02-Configuration, etc.)

## Development Guidelines

**Configuration**: Always use JSON files (docs-config.json, downloads.json, analytics.json, users.json)
**CSS**: Never hardcode colors - use CSS variables from common.css. Maintain responsive patterns.
**JS**: Common functionality → common.js, page-specific → respective page JS. German comments exist in some files.
**Content**: Markdown files in content/{product}/{##-Category}/, update docs-config.json when adding new docs
**Python**: manager.py for downloads, bot.py for Discord integration (token hardcoded - needs env var)

## Recent Changes

### Phase 1.1 - Mobile Responsive Enhancement (2025-10-09)
- **File**: `src/docs/css/docs.css`
- **Changes**: Fixed docs page responsive layout with proper flexbox behavior
- Desktop: 3-column | Tablet: 2-column/slide-out | Mobile: full-width with off-screen sidebars
- Key fixes: display:block on mobile, transform for sidebars instead of display:none, mobile button visibility rules

### Phase 1.2 - Category Naming & Ordering (2025-10-10)
- **Files**: `server.js` (lines 386-429), `src/docs/css/docs.css` (line 355)
- **Changes**: Numbered folder format `##-Category-Name` for ordering, formatName() parses display names
- API response includes orderNumber field, automatic sorting, backward compatible

### Phase 1.3 - 404 Configuration System (2025-10-10)
- **Files**: `src/docs/config/docs-config.json`, `src/main/404.html` (lines 221-338)
- **Features**: JSON-configurable 404 page with markdown support, placeholders ({requestedUrl}, {timestamp}, {productName}), dynamic quick links, toggle controls
- Config sections: errorPages.404.{redirect, content, placeholders}

### Phase 1.5 - Analytics Tracking (2025-10-10)
- **Files**: `server.js` (lines 19-39, 103-204, 793-856), `src/docs/js/docs-products.js` (lines 282, 296-321), `src/docs/config/analytics.json`
- **Data**: Monthly breakdown (YYYY-MM), pages vs markdownFiles separation, allTime aggregates
- **API Endpoints**:
  - `GET /api/analytics` (JWT protected) - Returns full analytics with top 10 docs
  - `POST /api/analytics/track` (public) - Client tracking endpoint
- **Features**: Non-blocking async tracking (setImmediate), automatic monthly organization, fire-and-forget client calls, no external dependencies

### Phase 1.6 - Settings SubPages (2025-10-10)
- **Files**: `src/docs/settings.html`, `src/docs/css/settings.css`, `src/docs/js/settings.js`, `server.js` (lines 858-1163)
- **Analytics Tab**: Chart.js visitor trends (7d/30d/3m/all), top 10 pages, theme-aware colors
- **Editor Tab**: GitHub-style file tree, markdown editor with line numbers, create/rename/delete via modals, drag-drop, context menu, unsaved changes warning
- **Auth Tab**: User CRUD operations, bcrypt hashing, self-deletion prevention
- **API Endpoints** (all JWT protected):
  - `GET /api/files/:product/tree` - File tree
  - `GET /api/files/:product/content` - Read file
  - `POST /api/files/:product` - Create file/folder
  - `PUT /api/files/:product` - Update content
  - `DELETE /api/files/:product` - Delete
  - `POST /api/files/:product/rename` - Rename
  - `POST /api/files/:product/move` - Move file
- **Security**: Path validation prevents directory traversal on all endpoints

### Phase 1.7 - Markdown Components & Editor (2025-10-11)

#### Part 1: Core Component System
- **Files**: `src/docs/js/marked-extension.js` (947 lines), `src/docs/css/docs-components.css` (650+ lines), `src/docs/index.html`
- **13 Components**: Callouts (7 types), Tabs, Steps, Accordions, AccordionGroup, CodeGroup, Columns, Card, Frame, Expandable, ResponseField
- **Interactivity**: switchTab(), toggleAccordion(), toggleExpandable(), switchCodeBlock()
- **Styling**: Dark theme, responsive (768px/480px), CSS variables, animations
- **Test**: `/docs/quantom/getting-started/component-test`

#### Part 2: Editor Enhancements
- **Files**: `src/docs/settings.html` (lines 218-228, 511-526), `src/docs/css/settings.css` (lines 1130-1339), `src/docs/js/settings.js` (lines 1859-2560), `server.js` (lines 1165-1237)
- **Slash Commands** (17 templates): `/callout`, `/tabs`, `/steps`, `/accordion`, `/accordiongroup`, `/code`, `/columns`, `/frame`, `/expandable`, `/field`, `/h1-3`, `/list`, `/ordered`, `/table`, `/image`
  - Fuzzy search filtering, ↑↓ navigation, Enter to insert, Escape to close
  - Smart cursor positioning
- **Visual/Raw Toggle**: Mode buttons in toolbar, localStorage persistence, real-time markdown rendering with marked.js + Prism.js
- **Preview Mode**: Renders all 13 components, interactive elements work, syntax highlighting
- **Image Upload**:
  - Drag & drop + paste support
  - Progress indicator (XMLHttpRequest with progress events)
  - Auto-inserts markdown at cursor
  - Backend: `POST /api/files/:product/upload` (JWT protected)
  - Multer config: PNG/JPG/GIF/SVG only, 5MB max, sanitized filenames, timestamp naming
  - Uploads to `content/{product}/images/`

### Phase 1.8 - Legal Page (COMPLETED 2025-10-11)
**Goal**: Add a simple legal information page with Terms of Service, Privacy Policy, and Impressum.

**Status**: ✅ Completed

**Implementation Summary**:

**Structure Created**:
- `src/main/legal/` folder containing three markdown files
- `src/main/legal.html` - Main legal page with sidebar navigation
- `src/main/css/legal.css` - Styling using common.css variables
- `src/main/js/legal.js` - Dynamic content loading with marked.js

**Legal Documents**:
1. **terms-of-service.md** - Comprehensive terms and conditions
2. **privacy-policy.md** - Bilingual privacy policy (German + English summary)
   - GDPR compliant
   - Detailed data collection and usage information
   - User rights and contact information
3. **impressum.md** - German legal notice (Impressum) with English translation

**Features Implemented**:
- **Client-Side Routing**: History API navigation for clean URLs
  - `/legal/` - Welcome page with legal cards
  - `/legal/terms-of-service` - Terms of Service
  - `/legal/privacy-policy` - Privacy Policy
  - `/legal/impressum` - Impressum
- **Dynamic Content Loading**: Markdown files loaded via fetch and rendered with marked.js
- **Navigation System**: Left sidebar with active state highlighting
- **Welcome Page**: Landing page with three interactive legal cards
- **Responsive Design**: Mobile-friendly layout using CSS variables
- **Error Handling**: Graceful fallback for failed markdown loads

**Files Created**:
- `src/main/legal/terms-of-service.md` - Legal terms document
- `src/main/legal/privacy-policy.md` - Privacy policy (German/English)
- `src/main/legal/impressum.md` - German legal notice
- `src/main/legal.html` - HTML structure with sidebar and content area
- `src/main/css/legal.css` - Complete styling (responsive, CSS variables)
- `src/main/js/legal.js` - Client-side routing and markdown loading

**Files Modified**:
- `server.js` (lines 1268-1277) - Added `/legal` and `/legal/*` routes

**Technical Details**:
- Uses marked.js for markdown rendering
- History API for SPA navigation
- CSS variables for consistent theming
- Responsive breakpoints: 1024px, 768px, 480px
- No right sidebar (simplified layout per requirements)

**Testing**:
- ✅ Server running on http://localhost:5005
- ✅ All routes return 200 OK
- ✅ Markdown files load correctly
- ✅ Navigation and routing work properly
- ✅ Responsive design tested

**URLs**:
- Main: `http://localhost:5005/legal/`
- Terms: `http://localhost:5005/legal/terms-of-service`
- Privacy: `http://localhost:5005/legal/privacy-policy`
- Impressum: `http://localhost:5005/legal/impressum`

---

**Phase 1 Complete** (2025-10-09 to 2025-10-11): Mobile responsive, category ordering, 404 config, analytics, settings subpages, markdown components, editor enhancements, legal page
