# Quick Start Guide

Welcome to Quantom Server! This guide will help you get started with your Quantom Minecraft server in just a few minutes.

## Prerequisites

Before you begin, make sure you have:

- **Java 17 or higher** installed on your system
- At least **2GB of RAM** available for the server
- A stable internet connection
- Basic knowledge of command-line interface

## Step 1: Download Quantom

1. Navigate to the [Downloads](/downloads) page
2. Select the latest stable version of Quantom Server
3. Download the `.jar` file to your desired server directory

## Step 2: First Run

Create a new directory for your server and place the downloaded JAR file inside:

```bash
mkdir quantom-server
cd quantom-server
mv ~/Downloads/quantom-*.jar quantom.jar
```

Start the server for the first time:

```bash
java -Xmx2G -Xms2G -jar quantom.jar nogui
```

The server will generate the necessary configuration files and then stop. This is expected behavior.

## Step 3: Accept the EULA

Before you can run the server, you must accept the Minecraft EULA:

1. Open the `eula.txt` file in your server directory
2. Change `eula=false` to `eula=true`
3. Save and close the file

```bash
echo "eula=true" > eula.txt
```

## Step 4: Start Your Server

Now you can start your Quantom server:

```bash
java -Xmx2G -Xms2G -jar quantom.jar nogui
```

Your server will start generating the world and loading plugins. This may take a minute or two.

## Step 5: Connect to Your Server

Once the server is running, you can connect to it:

1. Open Minecraft
2. Go to **Multiplayer**
3. Click **Add Server**
4. Enter `localhost` as the server address
5. Click **Done** and join your server!

## Next Steps

Now that your server is running, you might want to:

- **[Configure your server](/docs/quantom/configuration/Configuration-Basics)** - Customize server settings and properties
- **[Optimize performance](/docs/quantom/guides/Server-Optimization)** - Learn how to improve server performance
- **[Install plugins](/docs/quantom/guides/Plugin-Installation)** - Extend your server with plugins
- **[Set up permissions](/docs/quantom/reference/Permissions)** - Configure player permissions and ranks

## Common Issues

### Server won't start

- Make sure you have Java 17 or higher installed
- Check that you have enough RAM available
- Verify that no other application is using port 25565

### Can't connect to server

- Make sure the server is running
- Check your firewall settings
- If connecting remotely, ensure port 25565 is forwarded

### Server crashes on startup

- Check the `logs/latest.log` file for error messages
- Make sure all plugins are compatible with your Quantom version
- Try starting the server with the `--debug` flag for more information

## Getting Help

If you need help with Quantom Server:

- Check our comprehensive [documentation](/docs/quantom)
- Join our [Discord community](https://discord.gg/f46gXT69Fd)
- Report issues on our GitHub repository

Happy crafting! 🎮
