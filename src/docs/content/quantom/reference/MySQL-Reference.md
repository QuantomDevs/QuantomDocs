# MySQL Reference

:::info
**Purpose of this Guide**
This document provides a comprehensive reference for essential MySQL commands and a step-by-step guide on how to enable external access to your MySQL database. It covers database and table management, data manipulation (CRUD operations), and user/permission management.
:::

---

## Important MySQL Commands

Here are some basic and important MySQL commands you should know:

### Database Management

*   **Log in to MySQL:**
    ```bash
    mysql -u YourUsername -p
    ```
    (You will be prompted for your password)

*   **Show all databases:**
    ```sql
    SHOW DATABASES;
    ```

*   **Create a new database:**
    ```sql
    CREATE DATABASE YourDatabaseName;
    ```

*   **Select a database (to work with its tables):**
    ```sql
    USE YourDatabaseName;
    ```

*   **Delete a database:**
    ```sql
    DROP DATABASE YourDatabaseName;
    ```

---

### Table Management

*   **Show all tables in the current database:**
    ```sql
    SHOW TABLES;
    ```

*   **Show the structure of a table:**
    ```sql
    DESCRIBE YourTableName;
    ```
    or
    ```sql
    DESC YourTableName;
    ```

*   **Create a new table:**
    ```sql
    CREATE TABLE Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE
    );
    ```

*   **Delete a table:**
    ```sql
    DROP TABLE YourTableName;
    ```

---

### Data Manipulation (CRUD Operations)

*   **Insert data into a table:**
    ```sql
    INSERT INTO Users (name, email) VALUES ('John Doe', 'john@example.com');
    ```

*   **Select all data from a table:**
    ```sql
    SELECT * FROM YourTableName;
    ```

*   **Select specific data (with conditions):**
    ```sql
    SELECT name, email FROM Users WHERE id = 1;
    ```

*   **Update data in a table:**
    ```sql
    UPDATE Users SET email = 'new_email@example.com' WHERE id = 1;
    ```

*   **Delete data from a table:**
    ```sql
    DELETE FROM Users WHERE id = 1;
    ```

---

### User and Permissions Management

*   **Create a new user:**
    ```sql
    CREATE USER 'new_user'@'localhost' IDENTIFIED BY 'YourPassword';
    ```
    (Replace 'localhost' with '%' for access from anywhere)

*   **Grant permissions to a user:**
    ```sql
    GRANT ALL PRIVILEGES ON YourDatabaseName.* TO 'new_user'@'localhost';
    ```
    (Replace 'ALL PRIVILEGES' with specific permissions like SELECT, INSERT, UPDATE, DELETE)

*   **Revoke permissions:**
    ```sql
    REVOKE ALL PRIVILEGES ON YourDatabaseName.* FROM 'new_user'@'localhost';
    ```

*   **Reload permissions (after changes to GRANT/REVOKE):**
    ```sql
    FLUSH PRIVILEGES;
    ```

---

## Step-by-Step Guide: External Access to MySQL Database

To enable access to your MySQL database from outside, you need to perform several steps. This is especially important if you have an application that needs to access the database from another server or your local computer.

:::warning
**Important Security Note**
Opening your database for external access carries security risks. Ensure you use strong passwords and restrict access to necessary IP addresses wherever possible.
:::

### 1. Adjust MySQL Configuration (Bind Address)

By default, MySQL is configured to listen only for connections from `localhost` (the server itself). You need to change this to allow external connections.

1.  **Find the MySQL configuration file:**
    The file is often named `my.cnf` or `mysqld.cnf` and is typically located under `/etc/mysql/mysql.conf.d/` or `/etc/mysql/`.
    You can try to find it with `sudo find / -name my.cnf` or `sudo find / -name mysqld.cnf`.

2.  **Edit the configuration file:**
    Open the file with a text editor (e.g., `nano` or `vim`):
    ```bash
    sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
    ```
    Find the line that starts with `bind-address`:
    ```
    bind-address = 127.0.0.1
    ```
    Change this line to:
    ```
    bind-address = 0.0.0.0
    ```
    Or comment it out completely by adding a `#` in front of it:
    ```
    # bind-address = 127.0.0.1
    ```
    `0.0.0.0` means MySQL will listen on all available network interfaces. Save and close the file.

3.  **Restart the MySQL service:**
    For the changes to take effect, you must restart the MySQL service:
    ```bash
    sudo systemctl restart mysql
    ```
    or
    ```bash
    sudo service mysql restart
    ```

---

### 2. Create MySQL User for External Access and Grant Permissions

It is good practice to create a dedicated user for external access instead of using the `root` user.

1.  **Log in to MySQL:**
    ```bash
    mysql -u root -p
    ```

2.  **Create a new user and grant permissions:**
    Replace `YourExternalUser`, `YourPassword`, and `YourDatabaseName` with your desired values.
    ```sql
    CREATE USER 'YourExternalUser'@'%' IDENTIFIED BY 'YourPassword';
    GRANT ALL PRIVILEGES ON YourDatabaseName.* TO 'YourExternalUser'@'%';
    FLUSH PRIVILEGES;
    EXIT;
    ```
    The `%` in `'YourExternalUser'@'%'` means that this user can access from any IP address. For more security, you can replace `%` with a specific IP address, e.g., `'YourExternalUser'@'192.168.1.100'`.

---

### 3. Configure Firewall

If a firewall is running on your server (which is highly recommended), you must open port 3306 (standard MySQL port).

*   **For UFW (Uncomplicated Firewall) on Linux:**
    ```bash
    sudo ufw allow 3306/tcp
    sudo ufw reload
    ```

*   **For other firewalls:**
    Refer to the specific commands for your firewall software to allow TCP connections on port 3306.

---

### 4. Router Port Forwarding (if applicable)

If your MySQL server is behind a router in a private network (e.g., in your home network), you must set up port forwarding on your router.

1.  **Log in to your router:**
    Open a web browser and enter your router's IP address (often 192.168.1.1 or 192.168.0.1).

2.  **Find the Port Forwarding settings:**
    These are often found under "NAT", "Port Forwarding", "Firewall", or "Virtual Servers".

3.  **Set up a new rule:**
    *   **Service Port / External Port:** 3306
    *   **Internal Port:** 3306
    *   **Internal IP Address:** The local IP address of your MySQL server (e.g., 192.168.1.10). Ensure your server has a static IP address or a DHCP reservation so it doesn't change.
    *   **Protocol:** TCP (or TCP/UDP, if offered)

    Save the settings.

After completing all these steps, your MySQL database should be accessible for external connections. Test the connection from an external device to ensure everything works correctly.
