# QuantomDocs - Documentation & Download Portal

![QuantomDocs](src/shared/images/favicon/logo.png)

QuantomDocs is a comprehensive static documentation and download management website for Quantom Minecraft server software. The project serves as a central hub for documentation, downloads, legal information, and community resources with a powerful admin dashboard for content management.

## ✨ Key Features

### Documentation System
- **Multi-Product Support:** Path-based routing for multiple products (`/docs/{product}/{category}/{page}`)
- **Client-Side SPA Navigation:** Smooth navigation using History API
- **Markdown Rendering:** Powered by marked.js with Prism.js syntax highlighting
- **13 Custom Components:** Callouts, Tabs, Steps, Accordions, Code Groups, Columns, Frames, Expandables, Response Fields, and more
- **Full-Text Search:** Fuzzy search with Fuse.js and IndexedDB caching
- **Offline Support:** Service worker for offline documentation access
- **Category Ordering:** Automatic sorting using `##-Category-Name` folder format
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices

### Admin Dashboard (`/settings`)
- **Authentication System:** JWT-based authentication with bcrypt password hashing
- **Analytics Dashboard:**
  - Visitor trends visualization with Chart.js (7d/30d/3m/all time)
  - Top 10 most visited pages
  - Monthly breakdown of traffic
  - Theme-aware charts
- **Content Editor:**
  - GitHub-style file tree navigation
  - Markdown editor with line numbers and syntax highlighting
  - Visual preview mode with live rendering
  - Slash commands for quick component insertion (17 templates)
  - Create, rename, delete files and folders
  - Drag-and-drop file management
  - Image upload (drag & drop + paste)
  - Unsaved changes warning
  - Context menu (right-click) for file operations
- **User Management:**
  - Create, edit, and delete users
  - Role-based access control
  - Password change functionality
  - Self-deletion prevention
- **Settings Configuration:**
  - Dynamic config editor for docs-config.json
  - Toggle-based interface for easy configuration

### Content Management
- **Download Manager:** Python CLI tool for managing downloads.json
- **Discord Bot:** Remote downloads management via Discord commands
- **File Upload API:** Multer-based image upload with validation (5MB limit, PNG/JPG/GIF/SVG)

### Analytics & Tracking
- **Page View Tracking:** Automatic tracking of all page visits
- **Markdown File Analytics:** Specific tracking for documentation pages
- **Monthly Organization:** Data organized by YYYY-MM format
- **Non-Blocking:** Async tracking with setImmediate() for zero performance impact
- **Privacy-Friendly:** No user tracking, only page views

### Legal Pages
- **Terms of Service:** Comprehensive terms and conditions
- **Privacy Policy:** GDPR-compliant bilingual policy (German + English)
- **Impressum:** German legal notice with English translation
- **Client-Side Routing:** Clean URLs with History API
- **Responsive Layout:** Mobile-friendly design

### UI/UX Features
- **Dark Theme:** Beautiful dark theme with centralized CSS variables
- **Responsive Design:** Breakpoints at 768px, 1024px, 1400px, 1600px, 1920px
- **Mobile-Optimized:** Slide-out sidebars and touch-friendly navigation
- **404 Configuration:** JSON-configurable 404 page with markdown support
- **Customizable Header/Footer:** Dynamic content loading

## 🐳 Quick Start with Docker

The fastest way to get QuantomDocs running is using Docker:

### Using Docker Compose (Recommended)

1. **Download the `docker-compose.yml` file** from the [latest release](https://github.com/QuantomDevs/QuantomDocs/releases/latest)

2. **Create a `.env` file** (optional):
   ```env
   JWT_SECRET=your_secret_key_here
   ```

3. **Run the container:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application** at `http://localhost:5005`

### Using Docker CLI

```bash
docker run -d \
  --name quantomdocs \
  -p 5005:5005 \
  -v ./content:/app/content \
  -v ./data:/app/data \
  -e JWT_SECRET=your_secret_key \
  ghcr.io/quantomdevs/quantomdocs:latest
```

## 🚀 Architecture Overview

The project follows a hybrid architecture combining:

### Frontend
- **Static HTML Pages:** Fast loading and SEO-friendly
- **Dynamic JavaScript:** Client-side content loading and SPA navigation
- **Modular Structure:** Separated `shared/`, `main/`, `docs/`, and `legal/` folders
- **CSS Architecture:**
  - Centralized color variables in `common.css`
  - All colors use CSS variables (never hardcoded)
  - Consistent theming across all pages
  - Component-specific stylesheets

### Backend Services
- **Node.js/Express Server (`server.js`):**
  - Authentication (JWT + bcrypt)
  - File operations API (CRUD for markdown files)
  - Analytics tracking and retrieval
  - Image upload handling with multer
  - User management API
  - Rate limiting and CORS configuration
  - Serves static HTML pages with clean URL routing

- **Python Tools:**
  - `manager.py` - CLI tool for downloads.json management
  - `bot.py` - Discord bot for remote management
  - `upload_server.py` - Flask server for file uploads
  - Virtual environment (`venv/`) for Python dependencies

### Data Management
- **JSON-Based Configuration:**
  - `docs-config.json` - Documentation structure, 404 config, general settings
  - `downloads.json` - Download management and versioning
  - `analytics.json` - Page view tracking and statistics
  - `users.json` - User authentication and roles
- **Markdown Content:** Documentation stored in `content/{product}/{##-Category}/` folders
- **File System Storage:** Images and downloads stored locally

### Security Features
- **JWT Authentication:** Secure token-based auth with configurable expiration
- **Password Hashing:** Bcrypt with 10 rounds
- **Rate Limiting:** 5 attempts per 15 minutes on login endpoint
- **Path Validation:** Prevents directory traversal on all file operations
- **XSS Prevention:** HTML escaping in user-generated content
- **CORS Configuration:** Controlled cross-origin access

## 💻 Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties (CSS variables), Flexbox, Grid
- **Vanilla JavaScript (ES6+)** - No framework dependencies
- **[Font Awesome 6.0](https://fontawesome.com/)** - Icon library
- **[Marked.js](https://marked.js.org/)** - Markdown parsing and rendering
- **[Prism.js](https://prismjs.com/)** - Syntax highlighting
- **[Fuse.js](https://fusejs.io/)** - Fuzzy search
- **[Chart.js](https://www.chartjs.org/)** - Analytics visualization

### Backend
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[Express.js](https://expressjs.com/)** - Web server framework
- **[Python 3.11+](https://www.python.org/)** - CLI tools and Discord bot

### Key Node.js Dependencies
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "express-rate-limit": "^7.1.5",
  "nodemon": "^3.0.2"
}
```

### Python Dependencies
- `discord.py` - Discord bot framework (for bot.py)
- Standard library only for manager.py and upload_server.py

## 📁 Project Structure

```
QuantomDocs/
├── server.js                 # Main Node.js/Express server
├── package.json              # Node.js dependencies
├── requirements.txt          # Python dependencies
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── USAGE.md                  # Setup and usage guide
├── CONTRIBUTING.md           # Contribution guidelines
├── LICENSE                   # MIT License
│
├── src/
│   ├── shared/               # Shared resources across all pages
│   │   ├── css/
│   │   │   └── common.css    # Global CSS variables and theme system
│   │   ├── js/
│   │   │   ├── common.js     # Header/footer/nav injection
│   │   │   └── mobile-menu.js # Mobile menu functionality
│   │   └── images/           # Global images and icons
│   │
│   ├── main/                 # Main website pages
│   │   ├── index.html        # Homepage
│   │   ├── downloads.html    # Downloads page
│   │   ├── 404.html          # 404 error page
│   │   ├── css/              # Page-specific styles
│   │   ├── js/               # Page-specific scripts
│   │   └── config/
│   │       └── downloads.json # Download management data
│   │
│   ├── docs/                 # Documentation system
│   │   ├── index.html        # Docs main page
│   │   ├── settings.html     # Admin dashboard
│   │   ├── css/
│   │   │   ├── docs.css      # Docs page styles
│   │   │   ├── docs-components.css # Component styles
│   │   │   ├── docs-search.css # Search UI styles
│   │   │   └── settings.css  # Admin dashboard styles
│   │   ├── js/
│   │   │   ├── docs.js       # Core docs functionality
│   │   │   ├── docs-products.js # Routing and navigation
│   │   │   ├── docs-search.js # Search implementation
│   │   │   ├── marked-extension.js # 13 custom components
│   │   │   └── settings.js   # Admin dashboard logic
│   │   ├── config/
│   │   │   ├── docs-config.json # Docs configuration
│   │   │   ├── analytics.json # Analytics data (gitignored)
│   │   │   └── users.json    # User accounts (gitignored)
│   │   └── content/          # Markdown documentation
│   │       └── quantom/
│   │           ├── 01-Getting-Started/
│   │           ├── 02-Configuration/
│   │           ├── 03-Guides/
│   │           ├── 04-Reference/
│   │           └── 05-Tools/
│   │
│   └── legal/                # Legal pages
│       ├── legal.html        # Legal hub page
│       ├── css/legal.css     # Legal page styles
│       ├── js/legal.js       # Legal page routing
│       └── content/          # Legal markdown files
│           ├── terms-of-service.md
│           ├── privacy-policy.md
│           └── impressum.md
│
├── python-tools/             # Python utilities
│   ├── manager.py            # Downloads management CLI
│   ├── bot.py                # Discord bot
│   ├── upload_server.py      # File upload server
│   └── venv/                 # Python virtual environment (gitignored)
│
└── project-informations/     # Project planning (gitignored)
    └── plan.md               # Development roadmap
```

## 🏁 Getting Started

### Prerequisites

#### For Docker (Recommended)
- **Docker** 20.10 or higher
- **Docker Compose** 2.0 or higher

#### For Manual Installation
- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **Python** 3.11 or higher (for Python tools)
- **Git**

### Installation

#### Method 1: Docker (Recommended)

See [Quick Start with Docker](#-quick-start-with-docker) above.

#### Method 2: Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/QuantomDevs/QuantomDocs.git
   cd QuantomDocs
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set up Python virtual environment (optional, for Python tools):**
   ```bash
   cd python-tools
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install discord.py
   cd ..
   ```

4. **Configure the application:**
   - Copy example config files (if provided)
   - Update `src/docs/config/docs-config.json` with your settings
   - Create initial users.json with admin account (see USAGE.md)

5. **Start the development server:**
   ```bash
   node server.js
   ```

   Or with nodemon for auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - **Local:** http://localhost:5005
   - **Network:** http://YOUR_IP:5005
   - **Admin Dashboard:** http://localhost:5005/settings
   - **Health Check:** http://localhost:5005/api/health

### Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

**⚠️ IMPORTANT:** Change the default password immediately after first login!

## 🔌 API Endpoints

### Public Endpoints
- `GET /` - Homepage
- `GET /main` - Main page
- `GET /docs` - Documentation hub
- `GET /docs/:product` - Product documentation
- `GET /docs/:product/:category/:page` - Specific doc page
- `GET /downloads` - Downloads page
- `GET /legal` - Legal hub
- `GET /legal/:page` - Specific legal page
- `GET /api/health` - Server health check
- `POST /api/login` - User authentication
- `POST /api/analytics/track` - Track page view

### Protected Endpoints (Require JWT Authentication)
- `GET /settings` - Admin dashboard
- `GET /api/verify` - Verify JWT token
- `GET /api/analytics` - Get analytics data
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:username` - Update user
- `DELETE /api/users/:username` - Delete user
- `POST /api/change-password` - Change password
- `GET /api/config/docs` - Get docs config
- `PUT /api/config/docs` - Update docs config
- `GET /api/files/:product/tree` - Get file tree
- `GET /api/files/:product/content` - Get file content
- `POST /api/files/:product` - Create file/folder
- `PUT /api/files/:product` - Update file
- `DELETE /api/files/:product` - Delete file/folder
- `POST /api/files/:product/rename` - Rename file/folder
- `POST /api/files/:product/move` - Move file
- `POST /api/files/:product/upload` - Upload image

## 📖 Documentation

For detailed setup instructions, configuration options, and usage guides, please refer to:

- **[USAGE.md](./USAGE.md)** - Comprehensive setup and usage guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project
- **[Project Documentation](http://localhost:5005/docs/quantom)** - User-facing documentation (when server is running)

## 🎨 Custom Markdown Components

QuantomDocs includes 13 custom markdown components for rich documentation:

1. **Callouts** - 7 types (Note, Warning, Info, Tip, Check, Danger, Custom)
2. **Tabs** - Interactive tabbed content with icons
3. **Steps** - Numbered progress indicators
4. **Accordions** - Collapsible content sections
5. **Accordion Groups** - Multiple related accordions
6. **Code Groups** - Multi-language code examples
7. **Columns** - Multi-column card layouts
8. **Cards** - Information cards with icons
9. **Frames** - Image containers with captions
10. **Expandables** - Collapsible sections
11. **Response Fields** - API documentation fields

See `/docs/quantom/getting-started/component-test` for examples.

## 🔧 Configuration

### docs-config.json Structure

```json
{
  "general": {
    "siteName": "QuantomDocs",
    "defaultProduct": "quantom",
    "enableSearch": true
  },
  "errorPages": {
    "404": {
      "redirect": {
        "enabled": true,
        "showQuickLinks": true,
        "showSearchBar": true,
        "links": [...]
      },
      "content": {
        "title": "Page Not Found",
        "description": "...",
        "supportMarkdown": true
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5005` |
| `HOST` | Server host | `0.0.0.0` |
| `JWT_SECRET` | Secret key for JWT tokens | `quantom_secret_key_2025` |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |

**For Docker:** Set environment variables in `.env` file or `docker-compose.yml`

**For Manual Installation:** Create a `.env` file in the root directory:

```env
PORT=5005
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

## 🔨 Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic reloading on file changes.

### Building Docker Image Locally

```bash
docker build -t quantomdocs:local .
docker run -p 5005:5005 quantomdocs:local
```

### Docker Compose for Development

```bash
docker-compose up --build
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [**Contributing Guidelines**](./CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Coding standards
- Pull request process
- Issue reporting

## 🐛 Known Issues & Limitations

- Discord bot token is hardcoded in `bot.py` (needs environment variable)
- Analytics data grows indefinitely (needs rotation/archiving)
- No automated testing infrastructure
- Single language support (interface is primarily English with some German in legal docs)

## 🗺️ Roadmap

See [project-informations/plan.md](./project-informations/plan.md) for detailed development phases:

- **Phase 1:** ✅ Complete - Enhanced documentation, analytics, editor, legal pages
- **Phase 2:** 🔄 Planned - UI/UX configuration & improvements
- **Phase 3:** 📋 Planned - Bug fixes, performance optimization, testing

## 📜 License

This project is licensed under the MIT License - see the [**LICENSE**](./LICENSE) file for details.

## 👥 Authors

- **Quantom Systems** - Initial work and development

## 🙏 Acknowledgments

- [Marked.js](https://marked.js.org/) - Markdown parsing
- [Prism.js](https://prismjs.com/) - Syntax highlighting
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Font Awesome](https://fontawesome.com/) - Icons
- [Express.js](https://expressjs.com/) - Web framework

## 📞 Support

- **Documentation:** http://localhost:5005/docs/quantom
- **Issues:** GitHub Issues (when repository is public)
- **Discord:** [Join our community](#) (link TBD)

---

**⚠️ Security Notice:** This project includes default credentials and configuration. Always change default passwords, generate new JWT secrets, and review security settings before deploying to production.

**📊 Project Status:** Active development - Phase 1 complete, Phase 2 in progress.

---

_Generated for QuantomDocs v1.0 - Last updated: 2025-10-11_
