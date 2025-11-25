# Python Virtual Environment Setup Guide

:::info
**Purpose of this Guide**
This document explains how to set up and manage Python virtual environments. Virtual environments isolate Python packages for each project, preventing conflicts and keeping your system clean.
:::

---

## 1. Creating a Virtual Environment

Open your terminal in your project folder and run the following command:

```bash
python3 -m venv venv
```

This creates a `venv` folder in your project with an isolated Python environment.

---

## 2. Activating the Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

You will see `(venv)` before your command prompt, indicating that the virtual environment is active.

---

## 3. Configuring VS Code

1.  **Open Command Palette:** `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux)
2.  **Select "Python: Select Interpreter"**
3.  **Choose the Python interpreter from your `venv` folder**

VS Code usually automatically detects the virtual environment and asks if you want to activate it. You can see which Python interpreter is active in the bottom right of the status bar.

---

## 4. Installing Packages

Now you can install packages that will only be available for this project:

```bash
# Install individual packages
pip install requests
pip install numpy
pip install pandas

# Install multiple packages at once
pip install requests numpy pandas flask

# Install a specific version
pip install django==4.2.0

# Install from requirements.txt
pip install -r requirements.txt
```

---

## 5. Creating and Using `requirements.txt`

To document your project's dependencies:

```bash
# Save current packages to requirements.txt
pip freeze > requirements.txt

# Install packages from requirements.txt
pip install -r requirements.txt
```

---

## 6. Deactivating the Virtual Environment

When you are done:

```bash
deactivate
```

---

## Project Structure

After setup, your project should look like this:

```
my-project/
├── venv/              # Virtual Environment (do not commit to Git)
├── main.py            # Your Python code
├── requirements.txt   # List of required packages
├── README.md          # This file
└── .gitignore         # Git ignore file
```

---

## .gitignore

Add the following line to your `.gitignore` file so that the virtual environment is not committed to Git:

```
venv/
```

---

## Useful Commands

```bash
# Show installed packages
pip list

# Show information about a package
pip show package_name

# Uninstall a package
pip uninstall package_name

# Update all packages
pip list --outdated
```

---

## Advantages

*   **Isolation:** Each project has its own packages
*   **No Conflicts:** Different projects can use different package versions
*   **Clean System:** System-wide Python installation remains untouched
*   **Easy to Share:** Others can set up your project with `pip install -r requirements.txt`

---

## Tip for VS Code

When you open VS Code in a project folder containing a `venv`, it often automatically activates the virtual environment in the integrated terminal. You can recognize this by `(venv)` in the terminal prompt.
