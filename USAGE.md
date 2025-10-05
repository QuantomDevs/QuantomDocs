# Usage Guide

This guide will walk you through setting up and running the QuantomDocs project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [Python](https://www.python.org/) (v3.10 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [pip](https://pip.pypa.io/en/stable/installation/) (usually comes with Python)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-repo/quantom-docs.git
    cd quantom-docs
    ```

2.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Python environment:**

    It is recommended to use a virtual environment for Python dependencies.

    ```bash
    # Create a virtual environment
    python3 -m venv venv

    # Activate the virtual environment
    # On macOS and Linux:
    source venv/bin/activate
    # On Windows:
    # .\venv\Scripts\activate
    ```

4.  **Install Python dependencies:**

    Create a file named `requirements.txt` in the root of the project with the following content:

    ```
    py-cord
    ```

    Then, install the dependencies:

    ```bash
    pip install -r requirements.txt
    ```

5.  **Configuration:**

    The project uses a `.env` file and a `config.ini` file for configuration. The `.gitignore` file is set up to ignore these files, so you'll need to create them yourself.

    **a. Create `.env` file:**

    Create a file named `.env` in the root directory. This file is used by `server.js` for JWT secrets and other sensitive data. Here is a template:

    ```env
    JWT_SECRET=your_jwt_secret_key
    ADMIN_USERNAME=admin
    # You will be prompted to create a password for the admin user on first run
    ```

    **b. Create `config.ini` file:**

    Create a file named `config.ini` in the root directory. This file is used by the Python Discord bot.

    ```ini
    [DISCORD]
    BOT_TOKEN=your_discord_bot_token

    [BOT]
    HOME_PATH=.
    ```
    
    **Note:** It is recommended to use `HOME_PATH=.` for portability. Using an absolute path might cause issues on different machines.

6.  **Initial Setup Script:**

    The project includes a script to hash the admin password. Run the following command and follow the prompts to set up your admin password. The hashed password will be stored in `src/main/config/users.json`.

    ```bash
    npm run setup
    ```

## Running the Application

The project consists of a Node.js server and a Python Discord bot that can be run independently.

### Running the Node.js Web Server

This server handles the main website, authentication, and API endpoints.

```bash
# To start the server
npm start

# To start the server in development mode with auto-reloading
npm run dev
```

The server will be running on `http://localhost:5005` by default.

### Running the Python Discord Bot

The Discord bot is used for managing downloads. Make sure you have activated your Python virtual environment first.

```bash
# Activate the virtual environment if you haven't already
source venv/bin/activate

# Run the bot
python project-informations/bot.py
```

The bot will connect to Discord using the token you provided in `config.ini`.

---

That's it! You should now have a fully functional local instance of QuantomDocs running.
