# Management Script Usage

This script (`manager.py`) is a command-line tool designed to manage the `downloads.json` file, which stores information about different versions and their changelogs for the Quantom project. It allows you to add new versions, add/remove changelog entries, and modify the maintenance status of versions.

## Prerequisites

- Python 3 installed on your system.

## Command Overview

The script is controlled via sub-commands. To use it, navigate to the project's root directory in your terminal and run commands in the format: `python manager.py <command> [arguments]`

### `add-version`

Adds a completely new version to the `downloads.json` file.

**Arguments:**
- `--name <string>`: (Required) The name of the version (e.g., "1.22.0").
- `--path <string>`: (Required) The download path for the main JAR file (e.g., "downloads/quantom-1.22.0.jar").
- `--unmaintained`: (Optional) A flag. If set, the `maintained` status will be set to `false`. By default, `maintained` is `true`.

**Example:**
```bash
python manager.py add-version --name "1.22.0" --path "downloads/quantom-1.22.0.jar"
python manager.py add-version --name "1.19.4" --path "downloads/quantom-1.19.4.jar" --unmaintained
```

### `add-changelog`

Adds a new changelog entry (build) to an existing version.

**Arguments:**
- `--version <string>`: (Required) The name of the version to which the changelog will be added.
- `--commit <string>`: (Required, can be used multiple times) A commit in the format `"hash:message"`.

**Example:**
```bash
python manager.py add-changelog --version "1.21.8" --commit "e396d8c:cleanup" --commit "fad6c18:fixed another bug"
```

### `remove-changelog`

Removes a specific changelog entry from a version based on its build number.

**Arguments:**
- `--version <string>`: (Required) The name of the version from which the changelog will be removed.
- `--build <int>`: (Required) The `buildNumber` of the changelog to remove.

**Example:**
```bash
python manager.py remove-changelog --version "1.21.8" --build 79
```

### `set-status`

Changes the `maintained` status of a specific version.

**Arguments:**
- `--version <string>`: (Required) The name of the version to modify.
- `--status <string>`: (Required) The new status. Must be either `maintained` or `unmaintained`.

**Example:**
```bash
python manager.py set-status --version "1.21.8" --status "unmaintained"
python manager.py set-status --version "1.20.4" --status "maintained"
```

### `list-versions`

Lists all available versions and their maintenance status in the console.

**Arguments:** None.

**Example:**
```bash
python manager.py list-versions
