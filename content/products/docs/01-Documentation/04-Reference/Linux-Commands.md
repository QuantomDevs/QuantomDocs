# Linux Commands Reference - Debian & Raspberry Pi OS

:::info
**Purpose of this Guide**
This document provides a comprehensive reference for essential Linux commands, specifically tailored for Debian and Raspberry Pi OS environments. It covers file operations, navigation, permissions, package management, process control, networking, archiving, text editing, and Raspberry Pi-specific commands.
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
*   **ls**: Lists files and folders in the current directory
    ```bash
    ls
    ```
*   **ls -la**: Shows detailed information including hidden files
    ```bash
    ls -la
    ```
*   **pwd**: Displays the current directory path
    ```bash
    pwd
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

## Package Management (APT)

*   **sudo apt update**: Updates package lists from the repository
    ```bash
    sudo apt update
    ```
*   **sudo apt upgrade**: Upgrades all installed packages
    ```bash
    sudo apt upgrade
    ```
*   **sudo apt install <package_name>**: Installs a new package
    ```bash
    sudo apt install <package_name>
    ```
*   **sudo apt remove <package_name>**: Removes a package, but keeps configuration files
    ```bash
    sudo apt remove <package_name>
    ```
*   **sudo apt purge <package_name>**: Completely removes a package with all configuration files
    ```bash
    sudo apt purge <package_name>
    ```
*   **apt search <search_term>**: Searches for packages in the repositories
    ```bash
    apt search <search_term>
    ```

---

## Processes and System

*   **ps aux**: Displays all running processes with details
    ```bash
    ps aux
    ```
*   **top**: Displays running processes in real-time (interactive)
    ```bash
    top
    ```
*   **htop**: Enhanced version of top with colored display
    ```bash
    htop
    ```
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
    ```
*   **uptime**: Displays system uptime and load
    ```bash
    uptime
    ```

---

## Network

*   **ip addr show**: Displays all network interfaces and IP addresses
    ```bash
    ip addr show
    ```
*   **ping <hostname>**: Tests connectivity to a host
    ```bash
    ping <hostname>
    ```
*   **wget <url>**: Downloads a file from the internet
    ```bash
    wget <url>
    ```
*   **curl <url>**: Transfers data to/from a server
    ```bash
    curl <url>
    ```

---

## Archiving and Compression

*   **tar -czf archive.tar.gz <folder>**: Creates a compressed TAR archive
    ```bash
    tar -czf archiv.tar.gz <folder>
    ```
*   **tar -xzf archive.tar.gz**: Extracts a TAR archive
    ```bash
    tar -xzf archiv.tar.gz
    ```
*   **zip -r archive.zip <folder>**: Creates a ZIP archive
    ```bash
    zip -r archiv.zip <folder>
    ```
*   **unzip archive.zip**: Extracts a ZIP archive
    ```bash
    unzip archiv.zip
    ```

---

## Text Editing and Search

*   **nano <file>**: Opens a file in the nano editor (easy to use)
    ```bash
    nano <file>
    ```
*   **vim <file>**: Opens a file in the vim editor (advanced)
    ```bash
    vim <file>
    ```
*   **find <path> -name <file_name>**: Searches for files by name
    ```bash
    find <path> -name <file_name>
    ```
*   **grep <search_text> <file>**: Searches for text in a file
    ```bash
    grep <search_text> <file>
    ```
*   **grep -r <search_text> <folder>**: Recursively searches for text in all files of a folder
    ```bash
    grep -r <search_text> <folder>
    ```

---

## Raspberry Pi Specific Commands

*   **sudo raspi-config**: Opens the Raspberry Pi configuration tool
    ```bash
    sudo raspi-config
    ```
*   **gpio readall**: Displays the status of all GPIO pins (requires wiringpi)
    ```bash
    gpio readall
    ```
*   **vcgencmd measure_temp**: Displays the CPU temperature of the Raspberry Pi
    ```bash
    vcgencmd measure_temp
    ```
*   **vcgencmd get_mem arm**: Displays ARM memory allocation
    ```bash
    vcgencmd get_mem arm
    ```
*   **vcgencmd get_mem gpu**: Displays GPU memory allocation
    ```bash
    vcgencmd get_mem gpu
    ```

---

## Utility Commands

*   **man <command>**: Displays the manual for a command
    ```bash
    man <command>
    ```
*   **<command> --help**: Displays brief help for a command
    ```bash
    <command> --help
    ```
*   **history**: Displays the last used commands
    ```bash
    history
    ```
*   **!!**: Executes the last command again
    ```bash
    !!
    ```
*   **alias ll='ls -la'**: Creates an alias for a command
    ```bash
    alias ll='ls -la'
    ```

---

## User Management

### Creating Users and Granting Sudo Privileges

To add a user on Debian 12 and grant them sudo privileges, follow these steps:

#### 1. Add User
```bash
sudo adduser <username>
```
The system will ask for a password and optional information.

#### 2. Grant Sudo Privileges
You have two options:

**Option A: Add user to the sudo group (recommended)**
```bash
sudo usermod -aG sudo <username>
```

**Option B: Directly edit the sudoers file**
```bash
sudo visudo
```
Then add this line (replace `<username>`):
```
<username> ALL=(ALL:ALL) ALL
```

#### 3. Activate Changes
The user must log out and log back in for the sudo privileges to take effect.

#### Testing
You can test the sudo privileges by logging in as the new user:
```bash
su - <username>
sudo whoami
```
This should output "root".

The first option (`usermod`) is usually the safer and simpler method, as it uses Debian's standard sudo configuration.

### Changing Passwords

To change your own password on Debian 12, use:

```bash
passwd
```

The system will prompt you to:
1. Enter your current password
2. Enter the new password
3. Confirm the new password

#### Changing Password for Another User (as root/sudo)
If you want to change the password for another user:
```bash
sudo passwd <username>
```
For example, for the user `snenjih`:
```bash
sudo passwd snenjih
```

In this case, you only need to enter the new password (not the old one), as you have administrator privileges.

The `passwd` command is the standard way to change passwords on Linux systems.
