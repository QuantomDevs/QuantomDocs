# QuantomDocs Usage Guide

This comprehensive guide will walk you through setting up, configuring, and running the QuantomDocs project on your local machine or server.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Using the Admin Dashboard](#using-the-admin-dashboard)
- [Content Management](#content-management)
- [Python Tools](#python-tools)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required

- **Node.js** v16.x or later (v18.x+ recommended)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** v8.x or later (comes with Node.js)
  - Verify installation: `npm --version`

### Optional (for Python tools)

- **Python** 3.11 or later
  - Download from [python.org](https://www.python.org/)
  - Verify installation: `python --version` or `python3 --version`

- **pip** (usually comes with Python)
  - Verify installation: `pip --version` or `pip3 --version`

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/QuantomDocs.git
cd QuantomDocs
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js (web server)
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- multer (file uploads)
- express-rate-limit (rate limiting)

### Step 3: Set Up Python Environment (Optional)

If you plan to use the Python tools (Discord bot, downloads manager):

#### Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
.\venv\Scripts\activate
```

#### Install Python Dependencies

```bash
# Install discord.py for Discord bot
pip install discord.py

# Or install from requirements.txt if available
pip install -r requirements.txt
```

## ⚙️ Configuration

### Configuration Files Overview

QuantomDocs uses several configuration files:

- **`.env`** - Environment variables (JWT secret, port, etc.) - **Create this file**
- **`src/docs/config/docs-config.json`** - Documentation settings (already exists)
- **`src/docs/config/users.json`** - User accounts (create or auto-generated)
- **`src/docs/config/analytics.json`** - Analytics data (auto-generated)
- **`src/main/config/downloads.json`** - Downloads data (already exists)

### 1. Create Environment Variables File

Create a `.env` file in the project root:

```bash
touch .env
```

Add the following content:

```env
# Server Configuration
PORT=5005
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Optional: Discord Bot (if using bot.py)
DISCORD_BOT_TOKEN=your-discord-bot-token-here
```

**⚠️ IMPORTANT:**
- Generate a strong JWT_SECRET for production (use: `openssl rand -base64 32`)
- Never commit the `.env` file to version control
- Change default passwords immediately

### 2. Create Initial Admin User

Create the users.json file manually or let the system create it:

**Option A: Manual Creation**

Create `src/docs/config/users.json`:

```json
{
  "users": [
    {
      "username": "admin",
      "password": "$2b$10$vKHQ3jX9Z8F5jG7L3n5Mj.8Y6K9X3n7L5P9M4K8N2J7L6H3F9G5P1",
      "role": "admin",
      "createdAt": "2025-10-11T00:00:00.000Z"
    }
  ]
}
```

This creates an admin user with:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `admin`

**Option B: Use Setup Script (if available)**

```bash
npm run setup
```

### 3. Configure Documentation Settings

The `src/docs/config/docs-config.json` file controls documentation behavior. Key settings:

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
        "showSearchBar": true
      }
    }
  }
}
```

You can edit this file directly or use the Settings page after logging in.

## 🏃 Running the Application

### Start the Node.js Server

#### Production Mode

```bash
npm start
# or
node server.js
```

#### Development Mode (with auto-reload)

```bash
npm run dev
# Uses nodemon for automatic reloading
```

The server will start on the port specified in `.env` (default: 5005).

### Access the Application

Once the server is running, access the application at:

- **Local:** http://localhost:5005
- **Network:** http://YOUR_IP:5005 (accessible from other devices on your network)

### Available Pages

- **Homepage:** http://localhost:5005/ or http://localhost:5005/main
- **Documentation:** http://localhost:5005/docs
- **Downloads:** http://localhost:5005/downloads
- **Legal:** http://localhost:5005/legal
- **Admin Dashboard:** http://localhost:5005/settings
- **Health Check:** http://localhost:5005/api/health

## 👨‍💼 Using the Admin Dashboard

### Accessing the Dashboard

1. Navigate to http://localhost:5005/settings
2. Log in with your credentials:
   - **Username:** `admin`
   - **Password:** `admin123` (or your configured password)

**⚠️ Security:** Change the default password immediately after first login!

### Dashboard Features

#### 1. Overview Tab

- General dashboard overview
- Quick stats and recent activity (to be implemented)

#### 2. Editor Tab

The content editor provides a complete file management system:

**File Browser:**
- GitHub-style tree navigation
- View all markdown files and folders
- Hierarchical category structure
- File type icons

**Markdown Editor:**
- Line numbers and syntax highlighting
- Visual preview mode
- Raw editing mode
- Unsaved changes warning

**Quick Actions:**
- **Create Markdown File:** Add new documentation pages
- **Create Folder:** Organize content with folders
- **Upload Images:** Drag & drop or paste images (auto-inserts markdown)
- **Publish:** Save changes to files

**File Operations:**
- **Right-click context menu:** Rename or delete files/folders
- **Drag & drop:** Move files between folders
- **Search:** Find files quickly

**Slash Commands:**
Type `/` in the editor to insert markdown components:
- `/callout` - Add callout boxes
- `/tabs` - Create tabbed content
- `/steps` - Add numbered steps
- `/accordion` - Collapsible sections
- `/code` - Code blocks with syntax highlighting
- `/columns` - Multi-column layouts
- `/frame` - Image frames
- And more...

#### 3. Analytics Tab

View visitor statistics and popular content:

**Features:**
- **Total Visitors:** All-time and monthly breakdown
- **Visitor Trends Graph:** Interactive Chart.js visualization
  - 7 Days view
  - 30 Days view
  - 3 Months view
  - All Time view
- **Popular Pages:** Top 10 most visited documentation pages
- **Time Range Selector:** Filter data by date range

#### 4. Settings Tab

Configure documentation settings:

- Enable/disable features (search, 404 page, etc.)
- Customize error pages
- Edit general settings
- Update site name and defaults

Changes are saved to `docs-config.json` and apply immediately.

#### 5. Themes Tab

Theme customization (to be implemented in Phase 2)

#### 6. Authentication Tab

Manage user accounts:

**User List:**
- View all users with roles and creation dates
- See current user marked with indicator

**User Operations:**
- **Create User:** Add new admin or editor accounts
- **Edit User:** Change role or password
- **Delete User:** Remove user (prevents self-deletion)

**Roles:**
- `admin` - Full access to all features
- `editor` - Content editing access (to be implemented)

### Changing Your Password

1. Click your username in the sidebar
2. Select "Change Password" from dropdown
3. Enter current and new password
4. Click "Change Password"

### Logging Out

Click your username in the sidebar and select "Log Out"

## 📝 Content Management

### Adding Documentation

#### Method 1: Via Admin Dashboard (Recommended)

1. Log in to `/settings`
2. Go to **Editor** tab
3. Click **Create Markdown**
4. Choose category and enter filename
5. Write content using markdown
6. Use slash commands (`/`) for components
7. Click **Publish** to save

#### Method 2: Via File System

1. Navigate to `src/docs/content/quantom/`
2. Choose or create category folder (format: `##-Category-Name`)
3. Create `.md` file
4. Refresh docs page to see changes

### Folder Structure

Categories use numbered naming for ordering:

```
src/docs/content/quantom/
├── 01-Getting-Started/
│   ├── Installation.md
│   └── Quick-Start.md
├── 02-Configuration/
│   ├── Configuration-Basics.md
│   └── Advanced-Settings.md
├── 03-Guides/
└── 04-Reference/
```

The numbers determine display order, but are hidden in the UI (shows as "Getting Started", not "01-Getting Started").

### Using Markdown Components

QuantomDocs supports 13 custom markdown components. Examples:

#### Callouts

```markdown
:::callout{type="note" title="Important Note"}
This is a note callout with custom content.
:::
```

Types: `note`, `warning`, `info`, `tip`, `check`, `danger`, `custom`

#### Tabs

```markdown
::::tabs
:::tab{title="npm" icon="fa-brands fa-npm"}
\`\`\`bash
npm install quantom
\`\`\`
:::

:::tab{title="yarn" icon="fa-brands fa-yarn"}
\`\`\`bash
yarn add quantom
\`\`\`
:::
::::
```

#### Steps

```markdown
::::steps
:::step{title="Install Dependencies" icon="fa-download"}
Run `npm install` to install all required packages.
:::

:::step{title="Configure" icon="fa-cog"}
Create your `.env` file with configuration settings.
:::
::::
```

See `/docs/quantom/getting-started/component-test` for all component examples.

### Uploading Images

**Via Editor:**
1. Open file in Editor tab
2. Drag and drop image into editor, or
3. Paste image from clipboard (Ctrl/Cmd+V)
4. Image uploads automatically and markdown inserted

Images are stored in `src/docs/content/{product}/images/`

## 🐍 Python Tools

### Downloads Manager (manager.py)

CLI tool for managing downloads.json:

```bash
# Activate venv first
source venv/bin/activate

# Run manager
python manager.py
```

**Features:**
- Add new downloads
- Update existing downloads
- Remove downloads
- View download list

### Discord Bot (bot.py)

Remote downloads management via Discord:

**Setup:**
1. Create Discord bot at [discord.com/developers](https://discord.com/developers)
2. Copy bot token
3. Add token to `.env` file: `DISCORD_BOT_TOKEN=your_token`
4. Update `bot.py` to use environment variable (currently hardcoded)

**Run bot:**
```bash
source venv/bin/activate
python bot.py
```

**Commands:**
- `!downloads` - List all downloads
- `!add <name> <url>` - Add new download
- `!remove <name>` - Remove download

### File Upload Server (upload_server.py)

Flask server for file uploads (if needed separately):

```bash
python upload_server.py
```

## 🐛 Troubleshooting

### Server Won't Start

**Problem:** `Error: Cannot find module 'express'`

**Solution:** Install dependencies:
```bash
npm install
```

---

**Problem:** `Error: EADDRINUSE: address already in use`

**Solution:** Port 5005 is in use. Either:
- Stop the process using port 5005
- Change PORT in `.env` file

---

### Authentication Issues

**Problem:** Cannot log in with default credentials

**Solution:**
1. Check `src/docs/config/users.json` exists
2. Verify password is bcrypt hash
3. Clear browser localStorage and try again
4. Check server logs for error messages

---

### Images Not Uploading

**Problem:** Image upload fails

**Solution:**
1. Check file size (max 5MB)
2. Verify file type (PNG, JPG, GIF, SVG only)
3. Ensure proper permissions on content folder
4. Check server logs for errors

---

### Search Not Working

**Problem:** Search returns no results

**Solution:**
1. Clear IndexedDB cache in browser
2. Rebuild search index (reload docs page)
3. Check browser console for errors
4. Verify `enableSearch: true` in docs-config.json

---

### Analytics Not Tracking

**Problem:** Analytics data not recording

**Solution:**
1. Check `src/docs/config/analytics.json` exists
2. Verify file permissions (writable)
3. Check server logs for write errors
4. Ensure tracking middleware is active

## 🚀 Production Deployment

### Security Checklist

Before deploying to production:

- [ ] **Change default admin password**
- [ ] **Generate strong JWT_SECRET**
- [ ] **Set NODE_ENV=production**
- [ ] **Remove development tools** (nodemon, etc.)
- [ ] **Enable HTTPS** (use reverse proxy like nginx)
- [ ] **Set up firewall rules**
- [ ] **Configure CORS** properly
- [ ] **Backup users.json** regularly
- [ ] **Review .gitignore** to prevent secret leaks
- [ ] **Update Discord bot token** (use environment variable)
- [ ] **Set up monitoring** and logging
- [ ] **Enable rate limiting** (already configured)
- [ ] **Restrict admin access** (IP whitelist if possible)



### Using PM2 (Process Manager)

Keep the server running with PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start server.js --name quantom-docs

# Auto-restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs quantom-docs

# Restart server
pm2 restart quantom-docs

# Stop server
pm2 stop quantom-docs
```

### Using Nginx Reverse Proxy

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name docs.yourdomain.com;

    location / {
        proxy_pass http://localhost:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Backup Strategy

Regular backups of critical data:

```bash
# Backup user accounts
cp src/docs/config/users.json backups/users.json.$(date +%Y%m%d)

# Backup analytics data
cp src/docs/config/analytics.json backups/analytics.json.$(date +%Y%m%d)

# Backup documentation content
tar -czf backups/content-$(date +%Y%m%d).tar.gz src/docs/content/
```

## 📞 Support & Resources

- **Documentation:** http://localhost:5005/docs/quantom
- **GitHub Issues:** Report bugs and request features
- **Discord:** Join our community (link TBD)

## 🎓 Additional Resources

- [Marked.js Documentation](https://marked.js.org/) - Markdown parsing
- [Prism.js Documentation](https://prismjs.com/) - Syntax highlighting
- [Express.js Guide](https://expressjs.com/) - Web framework
- [JWT Best Practices](https://jwt.io/) - Authentication
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt) - Password hashing

---

**Last Updated:** 2025-10-11

For more detailed information, see the [README.md](./README.md) and [CONTRIBUTING.md](./CONTRIBUTING.md) files.
