import argparse
import json
from datetime import datetime
import os

DOWNLOADS_FILE = 'downloads.json'

def load_downloads_data():
    if not os.path.exists(DOWNLOADS_FILE):
        return []
    with open(DOWNLOADS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_downloads_data(data):
    with open(DOWNLOADS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def add_version(args):
    data = load_downloads_data()
    if any(v['versionName'] == args.name for v in data):
        print(f"Error: Version '{args.name}' already exists.")
        exit(1)

    new_version = {
        "versionName": args.name,
        "maintained": not args.unmaintained,
        "downloadPath": args.path,
        "changelogs": []
    }
    data.append(new_version)
    save_downloads_data(data)
    print(f"Version '{args.name}' added successfully.")

def add_changelog(args):
    data = load_downloads_data()
    version_found = False
    for version in data:
        if version['versionName'] == args.version:
            version_found = True
            break
    
    if not version_found:
        print(f"Error: Version '{args.version}' not found.")
        exit(1)

    # Find the version object
    selected_version = next((v for v in data if v['versionName'] == args.version), None)
    if not selected_version:
        print(f"Error: Version '{args.version}' not found.")
        exit(1)

    # Determine new build number
    max_build_number = 0
    if selected_version['changelogs']:
        max_build_number = max(cl['buildNumber'] for cl in selected_version['changelogs'])
    new_build_number = max_build_number + 1

    # Parse commits
    commits = []
    for commit_str in args.commit:
        parts = commit_str.split(':', 1)
        if len(parts) == 2:
            commits.append({"hash": parts[0].strip(), "message": parts[1].strip()})
        else:
            print(f"Warning: Invalid commit format '{commit_str}'. Skipping.")

    # Generate timestamp
    timestamp = datetime.utcnow().isoformat(timespec='seconds') + 'Z'

    new_changelog = {
        "buildNumber": new_build_number,
        "commits": commits,
        "timestamp": timestamp
    }

    selected_version['changelogs'].insert(0, new_changelog) # Add to the beginning
    save_downloads_data(data)
    print(f"Changelog build #{new_build_number} added to version '{args.version}' successfully.")

def remove_changelog(args):
    data = load_downloads_data()
    version_found = False
    for version in data:
        if version['versionName'] == args.version:
            version_found = True
            break
    
    if not version_found:
        print(f"Error: Version '{args.version}' not found.")
        exit(1)

    selected_version = next((v for v in data if v['versionName'] == args.version), None)
    if not selected_version:
        print(f"Error: Version '{args.version}' not found.")
        exit(1)

    initial_changelog_count = len(selected_version['changelogs'])
    selected_version['changelogs'] = [
        cl for cl in selected_version['changelogs'] if cl['buildNumber'] != args.build
    ]

    if len(selected_version['changelogs']) == initial_changelog_count:
        print(f"Error: Changelog with build number '{args.build}' not found in version '{args.version}'.")
        exit(1)

    save_downloads_data(data)
    print(f"Changelog build #{args.build} removed from version '{args.version}' successfully.")

def set_status(args):
    data = load_downloads_data()
    version_found = False
    for version in data:
        if version['versionName'] == args.version:
            version_found = True
            break
    
    if not version_found:
        print(f"Error: Version '{args.version}' not found.")
        exit(1)

    selected_version = next((v for v in data if v['versionName'] == args.version), None)
    if not selected_version:
        print(f"Error: Version '{args.version}' not found.")
        exit(1)

    if args.status == 'maintained':
        selected_version['maintained'] = True
    elif args.status == 'unmaintained':
        selected_version['maintained'] = False
    else:
        print("Error: Status must be 'maintained' or 'unmaintained'.")
        exit(1)

    save_downloads_data(data)
    print(f"Status of version '{args.version}' set to '{args.status}' successfully.")

def list_versions(args):
    data = load_downloads_data()
    if not data:
        print("No versions found in downloads.json.")
        return

    print("Available Versions:")
    for version in data:
        status = "[Maintained]" if version['maintained'] else "[Unmaintained]"
        build_count = len(version['changelogs'])
        print(f"Version: {version['versionName']} {status} ({build_count} builds)")

def main():
    parser = argparse.ArgumentParser(description="Manage downloads.json file.")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Add Version command
    add_version_parser = subparsers.add_parser('add-version', help='Add a new version')
    add_version_parser.add_argument('--name', required=True, help='Name of the version (e.g., "1.22.0")')
    add_version_parser.add_argument('--path', required=True, help='Download path for the main JAR file')
    add_version_parser.add_argument('--unmaintained', action='store_true', help='Set version as unmaintained')
    add_version_parser.set_defaults(func=add_version)

    # Add Changelog command
    add_changelog_parser = subparsers.add_parser('add-changelog', help='Add a new changelog entry to an existing version')
    add_changelog_parser.add_argument('--version', required=True, help='Name of the version to add changelog to')
    add_changelog_parser.add_argument('--commit', required=True, action='append', help='Commit in "hash:message" format (can be used multiple times)')
    add_changelog_parser.set_defaults(func=add_changelog)

    # Remove Changelog command
    remove_changelog_parser = subparsers.add_parser('remove-changelog', help='Remove a specific changelog entry by build number')
    remove_changelog_parser.add_argument('--version', required=True, help='Name of the version to remove changelog from')
    remove_changelog_parser.add_argument('--build', type=int, required=True, help='Build number of the changelog to remove')
    remove_changelog_parser.set_defaults(func=remove_changelog)

    # Set Status command
    set_status_parser = subparsers.add_parser('set-status', help='Change the maintained status of a version')
    set_status_parser.add_argument('--version', required=True, help='Name of the version to modify')
    set_status_parser.add_argument('--status', required=True, choices=['maintained', 'unmaintained'], help='New status: "maintained" or "unmaintained"')
    set_status_parser.set_defaults(func=set_status)

    # List Versions command
    list_versions_parser = subparsers.add_parser('list-versions', help='List all available versions and their status')
    list_versions_parser.set_defaults(func=list_versions)

    args = parser.parse_args()

    if hasattr(args, 'func'):
        args.func(args)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
