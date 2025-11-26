# Configuration Basics

Learn how to configure your Quantom Server to meet your specific needs. This guide covers the essential configuration files and common settings.

## Configuration Files Overview

Quantom Server uses several configuration files, each serving a specific purpose:

### server.properties

The main server configuration file:

```properties
# Server Settings
server-port=25565
max-players=100
server-name=My Quantom Server
motd=Welcome to my server!
online-mode=true

# World Settings
level-name=world
level-seed=
level-type=default
difficulty=normal
hardcore=false

# Performance Settings
view-distance=10
simulation-distance=8
max-tick-time=60000
```

**Location**: `server.properties` in the server root directory

**Key Settings**:
- `server-port` - Port number (default: 25565)
- `max-players` - Maximum concurrent players
- `online-mode` - Require Minecraft account authentication
- `view-distance` - How far players can see (affects performance)
- `simulation-distance` - How far chunks are actively simulated

### quantom.yml

Quantom-specific configuration:

```yaml
# Quantom Configuration
settings:
  debug: false
  save-user-cache: true
  save-empty-scoreboard-teams: false

world-settings:
  default:
    # Performance
    mob-spawn-range: 8
    entity-activation-range:
      animals: 32
      monsters: 32
      raiders: 48
      misc: 16
      water: 16
      villagers: 32
      flying-monsters: 32

    # Gameplay
    disable-chest-cat-detection: true
    armor-stands-do-collision-entity-lookups: true
    container-update-tick-rate: 3

# Network Settings
network:
  compression-threshold: 256
  async-chunks:
    threads: 4

# Plugin Settings
plugins:
  auto-reload: false
  enable-permissions-api: true
```

**Location**: `quantom.yml` in the server root directory

**Key Sections**:
- `settings` - Global server settings
- `world-settings` - Per-world configuration
- `network` - Network optimization settings
- `plugins` - Plugin-related configuration

### bukkit.yml

Bukkit/Spigot compatibility configuration:

```yaml
# Bukkit Configuration
settings:
  allow-end: true
  warn-on-overload: true
  permissions-file: permissions.yml
  update-folder: update
  plugin-profiling: false
  connection-throttle: 4000
  query-plugins: true
  deprecated-verbose: default
  shutdown-message: Server closed

spawn-limits:
  monsters: 70
  animals: 10
  water-animals: 5
  water-ambient: 20
  water-underground-creature: 5
  axolotls: 5
  ambient: 15

chunk-gc:
  period-in-ticks: 600

ticks-per:
  animal-spawns: 400
  monster-spawns: 1
  water-spawns: 1
  water-ambient-spawns: 1
  water-underground-creature-spawns: 1
  axolotl-spawns: 1
  ambient-spawns: 1
  autosave: 6000
```

**Location**: `bukkit.yml` in the server root directory

**Key Settings**:
- `spawn-limits` - Maximum mobs per world
- `chunk-gc` - Chunk garbage collection interval
- `ticks-per` - How often various events occur

## Common Configuration Tasks

### Changing Server Port

Edit `server.properties`:

```properties
server-port=25566
```

**Important**: If you change the port, you must restart the server and update firewall rules.

### Adjusting Player Limit

Edit `server.properties`:

```properties
max-players=200
```

**Note**: More players require more RAM and CPU. See [Server Optimization](/docs/quantom/guides/Server-Optimization) for details.

### Customizing MOTD

The Message of the Day appears in the server list:

```properties
motd=§6§lWelcome to §e§lQuantom Server§r\n§aJoin us for fun!
```

**Formatting Codes**:
- `§0-9, a-f` - Colors
- `§l` - Bold
- `§n` - Underline
- `§o` - Italic
- `§r` - Reset formatting
- `\n` - New line

For easier MOTD creation, see [Preset MOTD](/docs/quantom/reference/Preset-MOTD).

### Setting View Distance

Balance performance and visibility:

```properties
# Lower = better performance, less visibility
view-distance=8

# Higher = worse performance, more visibility
view-distance=12
```

**Recommendations**:
- Small servers (< 20 players): 10-12
- Medium servers (20-100 players): 8-10
- Large servers (100+ players): 6-8

### Configuring Difficulty

Set the game difficulty:

```properties
difficulty=easy    # Easy difficulty
difficulty=normal  # Normal difficulty
difficulty=hard    # Hard difficulty
difficulty=peaceful # No monsters
```

### Enabling/Disabling Nether and End

Edit `bukkit.yml`:

```yaml
settings:
  allow-end: true   # Enable/disable The End
  allow-nether: true # Enable/disable Nether
```

## Performance Configuration

### Entity Activation Range

Control how far entities are actively simulated in `quantom.yml`:

```yaml
world-settings:
  default:
    entity-activation-range:
      animals: 32
      monsters: 32
      raiders: 48
      misc: 16
      water: 16
      villagers: 32
      flying-monsters: 32
```

**Lower values** = Better performance but entities only "wake up" when players are closer.

### Mob Spawn Limits

Limit mob spawning in `bukkit.yml`:

```yaml
spawn-limits:
  monsters: 70
  animals: 10
  water-animals: 5
  ambient: 15
```

**Lower values** = Better performance but fewer mobs in the world.

### Async Chunk Loading

Configure async chunk loading in `quantom.yml`:

```yaml
network:
  async-chunks:
    threads: 4
```

**More threads** = Faster chunk loading but more CPU usage. Recommended: Number of CPU cores - 2.

## World Configuration

### Per-World Settings

Configure individual worlds in `quantom.yml`:

```yaml
world-settings:
  world:  # Default world
    mob-spawn-range: 8

  world_nether:  # Nether world
    mob-spawn-range: 6

  world_the_end:  # End world
    mob-spawn-range: 10
```

### World Border

Set world borders using commands:

```bash
/worldborder set 10000
/worldborder center 0 0
```

Or configure in world settings.

## Network Configuration

### Compression Threshold

Balance between CPU and bandwidth in `quantom.yml`:

```yaml
network:
  compression-threshold: 256
```

**Lower values**: More compression, less bandwidth, more CPU usage
**Higher values**: Less compression, more bandwidth, less CPU usage

### Connection Throttle

Prevent connection spam in `bukkit.yml`:

```yaml
settings:
  connection-throttle: 4000
```

Value in milliseconds between connections from the same IP.

## Plugin Configuration

### Auto-Reload

Control automatic plugin reloading in `quantom.yml`:

```yaml
plugins:
  auto-reload: false  # Recommended: false for production
```

**Warning**: Auto-reload can cause memory leaks. Only use for development.

### Plugin Permissions

Enable permissions API:

```yaml
plugins:
  enable-permissions-api: true
```

## Environment Variables

Override configuration with environment variables:

```bash
# Set max players
export QUANTOM_MAX_PLAYERS=200

# Set server port
export QUANTOM_SERVER_PORT=25565

# Set view distance
export QUANTOM_VIEW_DISTANCE=10

# Start server
java -jar quantom.jar
```

**Environment variables override config files.**

## Configuration Best Practices

### 1. Backup Before Changes

Always backup configuration files before making changes:

```bash
cp server.properties server.properties.backup
cp quantom.yml quantom.yml.backup
```

### 2. Make Incremental Changes

Change one setting at a time and test:

1. Change setting
2. Restart server
3. Test performance/functionality
4. Adjust if needed

### 3. Document Your Changes

Add comments to remember why you changed something:

```yaml
# Reduced to improve performance - 2025-01-15
mob-spawn-range: 6
```

### 4. Use Version Control

Track configuration changes with Git:

```bash
git add *.yml *.properties
git commit -m "Reduced view distance for better performance"
```

### 5. Monitor After Changes

After changing configuration:
- Check server performance (`/tps`)
- Monitor memory usage
- Check for errors in logs
- Get player feedback

## Configuration Validation

Validate your configuration:

```bash
# Start server in validation mode
java -jar quantom.jar --validate-config
```

This checks for:
- Syntax errors
- Invalid values
- Missing required settings
- Deprecated options

## Troubleshooting

### Server Won't Start

1. Check logs: `logs/latest.log`
2. Validate configuration: `--validate-config`
3. Restore backup configuration
4. Check file permissions

### Settings Not Taking Effect

1. Ensure you edited the correct file
2. Restart the server (most settings require restart)
3. Check for environment variable overrides
4. Look for errors in logs

### Performance Issues

1. Reduce `view-distance`
2. Lower `simulation-distance`
3. Reduce spawn limits
4. See [Server Optimization](/docs/quantom/guides/Server-Optimization)

## Next Steps

Now that you understand the basics:

- **[Server Optimization](/docs/quantom/guides/Server-Optimization)** - Optimize for best performance
- **[Advanced Configuration](/docs/quantom/configuration/Advanced-Configuration)** - Deep dive into advanced settings
- **[World Management](/docs/quantom/guides/World-Management)** - Manage multiple worlds
- **[Plugin Configuration](/docs/quantom/guides/Plugin-Configuration)** - Configure plugins

## Configuration Reference

For complete configuration options:

- **[server.properties Reference](/docs/quantom/reference/Server-Properties)**
- **[quantom.yml Reference](/docs/quantom/reference/Quantom-Config)**
- **[bukkit.yml Reference](/docs/quantom/reference/Bukkit-Config)**

Need help? Join our [Discord community](https://discord.gg/f46gXT69Fd) for support! 💬
