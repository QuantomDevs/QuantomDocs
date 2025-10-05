# QuantomDocs - Documentation & Download Portal

![QuantomDocs](src/shared/images/favicon/logo.png)

QuantomDocs is a comprehensive static documentation and download management website for Quantom Minecraft server software. The project serves as a central hub for documentation, downloads, and community resources.

## ✨ Key Features

- **Static Documentation:** Fast, reliable, and easy-to-maintain documentation powered by Markdown files.
- **Download Management:** A system for managing and serving software downloads, complete with versioning and changelogs.
- **Dynamic Content:** While the site is mostly static, JavaScript is used to dynamically load and render content, providing a smooth user experience.
- **Admin Dashboard:** A secure admin dashboard for managing users and other site settings.
- **Discord Bot Integration:** A Discord bot for remote management of downloads.
- **Responsive Design:** A clean and modern interface that works on all devices.
- **Dark Theme:** A beautiful dark theme for comfortable night-time reading.

## 🚀 Architecture Overview

The project follows a hybrid architecture combining:

-   **Frontend**: Static HTML pages with dynamic JavaScript content loading.
-   **Backend Services**:
    -   Node.js/Express server (`server.js`) for authentication, file uploads, and admin operations.
    -   Python CLI tools (`manager.py`) for `downloads.json` management.
    -   Discord bot (`bot.py`) for remote downloads management.
-   **Data Management**: JSON-based configuration files for documentation structure, downloads, and user data.
-   **Content Delivery**: Markdown-based documentation with client-side rendering using Marked.js.
-   **Styling**: Centralized CSS variable system with a dark theme and responsive design.

## 💻 Technology Stack

**Frontend:**
-   HTML5
-   CSS3 (with centralized CSS variable system)
-   Vanilla JavaScript (ES6+)
-   [Font Awesome](https://fontawesome.com/) (Icon library)
-   [Marked.js](https://marked.js.org/) (Markdown rendering)
-   [GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css)

**Backend:**
-   [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
-   [Python 3.11](https://www.python.org/)
-   [Py-cord](https://pycord.dev/) (Discord bot framework)

**Key Dependencies:**
-   `express` - Web server framework
-   `bcrypt` - Password hashing
-   `jsonwebtoken` - JWT authentication
-   `multer` - File upload handling
-   `express-rate-limit` - Rate limiting middleware

## 🏁 Getting Started

To get a local copy up and running, please follow the detailed instructions in our [**Usage Guide**](./USAGE.md).

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/quantom-docs.git
    cd quantom-docs
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    pip install -r requirements.txt # Make sure to create requirements.txt first
    ```

3.  **Configure the application:**
    -   Create and configure your `.env` and `config.ini` files.
    -   See the [Usage Guide](./USAGE.md) for more details.

4.  **Run the setup script:**
    ```bash
    npm run setup
    ```

5.  **Start the server:**
    ```bash
    npm start
    ```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [**Contributing Guidelines**](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## 📜 License

This project is licensed under the MIT License - see the [**LICENSE**](./LICENSE) file for details.

---

_This README was generated based on the project's `plan.md` file._
