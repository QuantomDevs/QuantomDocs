# Syntax Highlighting Test

This document tests the Prism.js syntax highlighting implementation.

## YAML Example

```yaml
server:
  port: 25565
  ip: 0.0.0.0
  max-players: 100
  motd: "Welcome to Quantom Server"

settings:
  view-distance: 10
  simulation-distance: 8
  # This is a comment
  spawn-protection: 16
```

## Java Example

```java
public class QuantomServer {
    private static final int DEFAULT_PORT = 25565;

    public static void main(String[] args) {
        QuantomServer server = new QuantomServer();
        server.start();
    }

    public void start() {
        System.out.println("Starting Quantom Server...");
        // Initialize server components
        loadConfiguration();
        startNetworkListener();
    }
}
```

## Bash Example

```bash
#!/bin/bash

# Download Quantom Server
wget https://quantom.example.com/quantom-latest.jar

# Start the server
java -Xmx4G -Xms2G -jar quantom-latest.jar nogui

# Create backup
tar -czf backup-$(date +%Y%m%d).tar.gz world/
```

## JSON Example

```json
{
  "version": "1.20.1",
  "maintained": true,
  "changelogs": [
    {
      "buildNumber": 42,
      "commits": [
        "Fixed memory leak in chunk loading",
        "Improved entity AI performance"
      ],
      "timestamp": "2024-10-05T12:00:00Z",
      "downloadPath": "downloads/quantom-1.20.1-42.jar"
    }
  ]
}
```

## Plain Text (No Language)

```
This is plain text without any syntax highlighting.
It should still have the copy button and language label showing "Plaintext".
```

## Test Copy Button

Try copying each code block above. The button should:
1. Show a copy icon initially
2. Change to a checkmark with "Copied!" when clicked
3. Return to the original state after 2 seconds
