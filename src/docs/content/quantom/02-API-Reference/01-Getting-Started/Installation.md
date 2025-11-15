# UFW Firewall Installation and Basic Configuration Guide

:::info 
**Purpose of this Guide**
This document provides a step-by-step guide on how to install and perform basic configuration of the Uncomplicated Firewall (UFW) on Debian-based systems, including Raspberry Pi OS. UFW simplifies firewall management, making it easier to secure your server.
:::

---

## 1. What is UFW?

UFW (Uncomplicated Firewall) is a user-friendly frontend for `iptables` that simplifies the process of configuring a firewall. It's designed to be easy to use while providing robust security for your system.

---

## 2. Installation

UFW is usually available in the default repositories.

```bash
sudo apt update
sudo apt install ufw
```

---

## 3. Basic Configuration

Before enabling UFW, it's crucial to define your default policies and allow essential services to prevent locking yourself out.

### 3.1. Set Default Policies

By default, UFW denies all incoming connections and allows all outgoing connections. This is a good starting point for security.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### 3.2. Allow Essential Services

You must allow SSH access (port 22) before enabling the firewall, otherwise, you will lose remote access to your server.

```bash
sudo ufw allow ssh
# Or by port number:
sudo ufw allow 22/tcp
```

If you are running a web server, you'll need to allow HTTP (port 80) and HTTPS (port 443):

```bash
sudo ufw allow http
sudo ufw allow https
# Or by port numbers:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 3.3. Enable UFW

Once you've set your default policies and allowed essential services, you can enable the firewall.

:::warning
**Warning: Confirm SSH Access**
Ensure you have allowed SSH (port 22) before enabling UFW, especially if you are connected via SSH. Enabling UFW without allowing SSH will disconnect you.
:::

```bash
sudo ufw enable
```
You will be prompted to confirm. Type `y` and press Enter.

### 3.4. Check UFW Status

To verify that UFW is active and see the rules:

```bash
sudo ufw status verbose
```

---

## 4. Managing UFW Rules

### 4.1. Allowing Specific Ports/Services

*   **Allow a specific port:**
    ```bash
    sudo ufw allow 8080/tcp
    ```
*   **Allow a specific service (if defined in `/etc/services`):**
    ```bash
    sudo ufw allow 'Nginx HTTP'
    ```
*   **Allow from a specific IP address:**
    ```bash
    sudo ufw allow from 192.168.1.100 to any port 22
    ```
*   **Allow a range of ports:**
    ```bash
    sudo ufw allow 6000:6007/tcp
    ```

### 4.2. Denying Specific Ports/Services

*   **Deny a specific port:**
    ```bash
    sudo ufw deny 23/tcp
    ```
*   **Deny from a specific IP address:**
    ```bash
    sudo ufw deny from 192.168.1.100
    ```

### 4.3. Deleting Rules

You can delete rules by specifying the exact rule or by its number.

*   **Delete by exact rule:**
    ```bash
    sudo ufw delete allow 80/tcp
    ```
*   **Delete by rule number (first list rules with numbers):**
    ```bash
    sudo ufw status numbered
    sudo ufw delete <rule_number>
    ```

---

## 5. Disabling and Resetting UFW

### 5.1. Disable UFW

To temporarily disable UFW:

```bash
sudo ufw disable
```

### 5.2. Reset UFW

To reset UFW to its default state (all rules deleted, firewall disabled):

:::warning
**Warning: Resetting UFW**
This command will delete all your UFW rules and disable the firewall. Use with caution, especially on production servers.
:::

```bash
sudo ufw reset
```
You will be prompted to confirm. Type `y` and press Enter.

---

## 6. Advanced UFW Configuration

For more advanced configurations, such as setting up logging, managing application profiles, or creating complex routing rules, refer to the official UFW documentation or `man ufw`.

[Official UFW Documentation](https://help.ubuntu.com/community/UFW)
