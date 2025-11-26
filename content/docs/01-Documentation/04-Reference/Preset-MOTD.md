# Helpful Linux Commands - Quick Reference

:::info
**Purpose of this Guide**
This document provides a quick reference for frequently used Linux commands. It's designed for quick lookups of common operations on Debian-based systems, including Raspberry Pi OS.
:::

---

## File and Folder Operations

*   **cp <file> <destination>**: Copies a file to another location
    ```bash
    cp <file> <destination>
    ```
*   **cp -r <folder> <destination>**: Recursively copies a folder with all its contents
    ```bash
    cp -r <folder> <destination>
    ```
*   **mv <source> <destination>**: Moves or renames files and folders
    ```bash
    mv <source> <destination>
    ```
*   **rm <file>**: Permanently deletes a file
    ```bash
    rm <file>
    ```
*   **rm -r <folder>**: Recursively deletes a folder with all its contents
    ```bash
    rm -r <folder>
    ```
*   **rm -rf <folder>**: Forcefully deletes a folder without prompting
    ```bash
    rm -rf <folder>
    ```
*   **mkdir <folder_name>**: Creates a new folder
    ```bash
    mkdir <folder_name>
    ```
*   **mkdir -p <path/to/folder>**: Creates folder hierarchies, even if parent folders do not exist
    ```bash
    mkdir -p <path/to/folder>
    ```
*   **touch <file_name>**: Creates an empty file or updates its timestamp
    ```bash
    touch <file_name>
    ```

---

## Navigation and Display

*   **cd <path>**: Changes to a specific directory
    ```bash
    cd <path>
    ```
*   **cd ..**: Changes to the parent directory
    ```bash
    cd ..
    ```
*   **cd ~**: Changes to the home directory
    ```bash
    cd ~
    ```
*   **ls -la**: Shows detailed information including hidden files
    ```bash
    ls -la
    ```
*   **cat <file>**: Displays the entire content of a file
    ```bash
    cat <file>
    ```
*   **less <file>**: Displays file content page by page (navigable)
    ```bash
    less <file>
    ```
*   **head <file>**: Displays the first 10 lines of a file
    ```bash
    head <file>
    ```
*   **tail <file>**: Displays the last 10 lines of a file
    ```bash
    tail <file>
    ```
*   **tail -f <file>**: Displays the last lines and updates live (good for logs)
    ```bash
    tail -f <file>
    ```

---

## File Permissions

*   **chmod 755 <file>**: Sets permissions (rwx for owner, rx for group/others)
    ```bash
    chmod 755 <file>
    ```
*   **chmod +x <file>**: Makes a file executable
    ```bash
    chmod +x <file>
    ```
*   **chown <user>:<group> <file>**: Changes owner and group of a file
    ```bash
    chown <user>:<group> <file>
    ```
*   **sudo chown root:root <file>**: Changes owner to root (requires sudo)
    ```bash
    sudo chown root:root <file>
    ```

---

## Processes and System

*   **kill <process_id>**: Terminates a process by its ID
    ```bash
    kill <process_id>
    ```
*   **killall <process_name>**: Terminates all processes with the specified name
    ```bash
    killall <process_name>
    ```
*   **df -h**: Displays disk space in human-readable format
    ```bash
    df -h
    ```
*   **free -h**: Displays RAM usage
    ```bash
    free -h
