import os
import subprocess
import json
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
UPLOAD_FOLDER = 'downloads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_next_build_number(version_name):
    try:
        with open('config/downloads.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            for version in data:
                if version['versionName'] == version_name:
                    if version['changelogs']:
                        return max(cl['buildNumber'] for cl in version['changelogs']) + 1
                    else:
                        return 1
            return 1 # If version doesn't exist yet, it will be the first build
    except (FileNotFoundError, json.JSONDecodeError):
        return 1

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    version_name = request.form.get('versionName')
    commit_hashes = request.form.getlist('commitHash[]')
    commit_messages = request.form.getlist('commitMessage[]')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if not version_name:
        return jsonify({"error": "Version name is required"}), 400

    if file:
        original_filename = secure_filename(file.filename)
        file_extension = os.path.splitext(original_filename)[1]

        # Check if version exists to determine build number
        current_build_number = get_next_build_number(version_name)
        
        version_folder = os.path.join(app.config['UPLOAD_FOLDER'], version_name)
        os.makedirs(version_folder, exist_ok=True)

        new_filename = f"{version_name}-{current_build_number}{file_extension}"
        file_path = os.path.join(version_folder, new_filename)
        file.save(file_path)

        # Prepare commits for manager.py
        commits_args = []
        for i in range(len(commit_hashes)):
            if commit_hashes[i] and commit_messages[i]:
                commits_args.extend(['--commit', f"{commit_hashes[i]}:{commit_messages[i]}"])

        try:
            # Check if version already exists in downloads.json
            downloads_data = []
            if os.path.exists('config/downloads.json'):
                with open('config/downloads.json', 'r', encoding='utf-8') as f:
                    downloads_data = json.load(f)
            
            version_exists = any(v['versionName'] == version_name for v in downloads_data)

            if not version_exists:
                # Add new version
                add_version_command = [
                    'python3', 'manager.py', 'add-version',
                    '--name', version_name,
                    '--path', file_path # Store the full path
                ]
                subprocess.run(add_version_command, check=True, capture_output=True)
                print(f"Added new version: {version_name}")
            else:
                # Update download path for existing version
                for v in downloads_data:
                    if v['versionName'] == version_name:
                        v['downloadPath'] = file_path
                        break
                with open('config/downloads.json', 'w', encoding='utf-8') as f:
                    json.dump(downloads_data, f, indent=2, ensure_ascii=False)
                print(f"Updated download path for existing version: {version_name}")

            # Add changelog
            add_changelog_command = [
                'python3', 'manager.py', 'add-changelog',
                '--version', version_name
            ]
            add_changelog_command.extend(commits_args)
            subprocess.run(add_changelog_command, check=True, capture_output=True)
            print(f"Added changelog for version: {version_name}")

            return jsonify({"message": "File uploaded and config updated successfully", "filename": new_filename, "path": file_path}), 200

        except subprocess.CalledProcessError as e:
            print(f"Error executing manager.py: {e.stderr.decode()}")
            return jsonify({"error": f"Failed to update config: {e.stderr.decode()}"}), 500
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
