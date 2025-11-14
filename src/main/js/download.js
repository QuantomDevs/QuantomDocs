// Download Page Functionality
let projectData = null;
let isGitHubRepo = false;
let repoInfo = null;

// Get project ID from URL
const getProjectIdFromUrl = () => {
    const pathParts = window.location.pathname.split('/');
    const downloadIndex = pathParts.indexOf('download');
    if (downloadIndex !== -1 && pathParts[downloadIndex + 1]) {
        return pathParts[downloadIndex + 1];
    }
    return null;
};

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Format download count
const formatDownloads = (count) => {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
};

// Show error state
const showError = (message) => {
    document.getElementById('loading-container').style.display = 'none';
    document.getElementById('content-container').style.display = 'none';
    document.getElementById('error-container').style.display = 'flex';
    document.getElementById('error-message').textContent = message;
};

// Show content
const showContent = () => {
    document.getElementById('loading-container').style.display = 'none';
    document.getElementById('error-container').style.display = 'none';
    document.getElementById('content-container').style.display = 'block';
};

// Load downloads config
const loadDownloadsConfig = async () => {
    try {
        const response = await fetch('/api/downloads');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading downloads config:', error);
        throw error;
    }
};

// Find project or repo in config
const findProjectInConfig = (config, projectId) => {
    // Search in all categories
    for (const category of config.categories) {
        // Check in projects
        const project = category.projects.find(p => p.id === projectId);
        if (project) {
            return {
                type: 'project',
                data: project,
                category: category
            };
        }

        // Check in repos
        if (category.repos && category.repos.length > 0) {
            const repo = category.repos.find(r => r.id === projectId);
            if (repo) {
                return {
                    type: 'repo',
                    data: repo,
                    category: category
                };
            }
        }
    }
    return null;
};

// GitHub API: Fetch repository info
const fetchGitHubRepoInfo = async (repoUrl) => {
    try {
        // Extract owner/repo from GitHub URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            throw new Error('Invalid GitHub URL');
        }

        const owner = match[1];
        const repo = match[2].replace('.git', '');

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            owner,
            repo,
            name: data.name,
            description: data.description || 'No description available',
            topics: data.topics || [],
            homepage: data.homepage,
            repoUrl: data.html_url
        };
    } catch (error) {
        console.error('Error fetching GitHub repo info:', error);
        throw error;
    }
};

// GitHub API: Fetch latest release
const fetchGitHubLatestRelease = async (owner, repo) => {
    try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            if (response.status === 404) {
                return null; // No releases
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching latest GitHub release:', error);
        return null;
    }
};

// GitHub API: Fetch all releases (lazy loaded)
const fetchGitHubReleases = async (owner, repo, limit = 10) => {
    try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${limit}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching GitHub releases:', error);
        return [];
    }
};

// GitHub API: Fetch commits (lazy loaded)
const fetchGitHubCommits = async (owner, repo, limit = 10) => {
    try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching GitHub commits:', error);
        return [];
    }
};

// Render project header
const renderProjectHeader = () => {
    const icon = projectData.icon || 'fas fa-cube';
    const title = projectData.name;
    const description = projectData.description;
    const tags = projectData.tags || projectData.topics || [];

    document.getElementById('project-icon').className = icon;
    document.getElementById('project-title').textContent = title;
    document.getElementById('project-description').textContent = description;

    // Render tags
    const tagsContainer = document.getElementById('project-tags');
    tagsContainer.innerHTML = '';

    if (tags.length > 0) {
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'project-tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
    }
};

// Render main download button (config project)
const renderConfigDownloadButton = () => {
    const mainDownloadBtn = document.getElementById('main-download-btn');
    const latestChangelog = projectData.changelogs && projectData.changelogs.length > 0
        ? projectData.changelogs[0]
        : null;

    if (latestChangelog) {
        document.getElementById('download-name').textContent = projectData.name;
        document.getElementById('download-version').textContent =
            `${latestChangelog.version || `Build ${latestChangelog.buildNumber}`}`;

        mainDownloadBtn.onclick = () => {
            window.location.href = latestChangelog.downloadPath;
        };
    } else {
        document.getElementById('download-name').textContent = 'No downloads available';
        document.getElementById('download-version').textContent = 'Check back later';
        mainDownloadBtn.disabled = true;
        mainDownloadBtn.style.opacity = '0.5';
        mainDownloadBtn.style.cursor = 'not-allowed';
    }
};

// Render main download button (GitHub repo)
const renderGitHubDownloadButton = async () => {
    const mainDownloadBtn = document.getElementById('main-download-btn');
    const latestRelease = await fetchGitHubLatestRelease(repoInfo.owner, repoInfo.repo);

    if (latestRelease) {
        document.getElementById('download-name').textContent = latestRelease.name || latestRelease.tag_name;
        document.getElementById('download-version').textContent = latestRelease.tag_name;

        // Find downloadable asset
        const asset = latestRelease.assets && latestRelease.assets.length > 0
            ? latestRelease.assets[0]
            : null;

        if (asset) {
            mainDownloadBtn.onclick = () => {
                window.location.href = asset.browser_download_url;
            };
        } else {
            mainDownloadBtn.onclick = () => {
                window.open(latestRelease.html_url, '_blank');
            };
        }
    } else {
        document.getElementById('download-name').textContent = 'No releases available';
        document.getElementById('download-version').textContent = 'Check the repository';
        mainDownloadBtn.onclick = () => {
            window.open(repoInfo.repoUrl, '_blank');
        };
    }

    // Show GitHub source button
    const githubBtn = document.getElementById('github-source-btn');
    githubBtn.style.display = 'flex';
    githubBtn.href = repoInfo.repoUrl;
};

// Render config builds list
const renderConfigBuilds = () => {
    const buildsList = document.getElementById('builds-list');
    const noBuildsMessage = document.getElementById('no-builds-message');

    // Skip the first (latest) changelog
    const olderBuilds = projectData.changelogs && projectData.changelogs.length > 1
        ? projectData.changelogs.slice(1)
        : [];

    if (olderBuilds.length === 0) {
        buildsList.innerHTML = '';
        noBuildsMessage.style.display = 'flex';
        return;
    }

    noBuildsMessage.style.display = 'none';
    buildsList.innerHTML = '';

    olderBuilds.forEach(build => {
        const buildItem = document.createElement('div');
        buildItem.className = 'build-item';

        const buildHeader = document.createElement('div');
        buildHeader.className = 'build-header';

        const buildNumber = document.createElement('div');
        buildNumber.className = 'build-number';
        buildNumber.innerHTML = `
            <i class="fas fa-hashtag"></i>
            ${build.version || `Build ${build.buildNumber}`}
        `;

        const buildDate = document.createElement('div');
        buildDate.className = 'build-date';
        buildDate.textContent = formatDate(build.timestamp);

        buildHeader.appendChild(buildNumber);
        buildHeader.appendChild(buildDate);
        buildItem.appendChild(buildHeader);

        // Commits
        if (build.commits && build.commits.length > 0) {
            const commitList = document.createElement('ul');
            commitList.className = 'commit-list';

            build.commits.forEach(commit => {
                const commitItem = document.createElement('li');
                commitItem.className = 'commit-item';

                const commitMessage = document.createElement('span');
                commitMessage.className = 'commit-message';
                commitMessage.textContent = commit.message;

                commitItem.appendChild(commitMessage);
                commitList.appendChild(commitItem);
            });

            buildItem.appendChild(commitList);
        }

        // Download button
        const downloadBtn = document.createElement('a');
        downloadBtn.className = 'build-download-button';
        downloadBtn.href = build.downloadPath;
        downloadBtn.innerHTML = `
            <i class="fas fa-download"></i>
            Download ${build.version || `Build ${build.buildNumber}`}
        `;

        buildItem.appendChild(downloadBtn);
        buildsList.appendChild(buildItem);
    });
};

// Render GitHub builds list (lazy loaded)
const renderGitHubBuilds = async () => {
    const buildsList = document.getElementById('builds-list');
    const noBuildsMessage = document.getElementById('no-builds-message');

    // Show loading state
    buildsList.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading releases...</p></div>';

    // Fetch releases (skip the first one as it's already shown)
    const releases = await fetchGitHubReleases(repoInfo.owner, repoInfo.repo, 20);
    const olderReleases = releases.slice(1); // Skip latest

    if (olderReleases.length === 0) {
        buildsList.innerHTML = '';
        noBuildsMessage.style.display = 'flex';
        return;
    }

    noBuildsMessage.style.display = 'none';
    buildsList.innerHTML = '';

    olderReleases.forEach(release => {
        const buildItem = document.createElement('div');
        buildItem.className = 'build-item';

        const buildHeader = document.createElement('div');
        buildHeader.className = 'build-header';

        const buildNumber = document.createElement('div');
        buildNumber.className = 'build-number';
        buildNumber.innerHTML = `
            <i class="fas fa-tag"></i>
            ${release.name || release.tag_name}
        `;

        const buildDate = document.createElement('div');
        buildDate.className = 'build-date';
        buildDate.textContent = formatDate(release.published_at);

        // GitHub commit hash link
        const commitHash = document.createElement('a');
        commitHash.className = 'build-hash';
        commitHash.href = `${repoInfo.repoUrl}/commit/${release.target_commitish}`;
        commitHash.target = '_blank';
        commitHash.rel = 'noopener noreferrer';
        commitHash.innerHTML = `
            <i class="fab fa-github"></i>
            ${release.target_commitish.substring(0, 7)}
        `;

        buildHeader.appendChild(buildNumber);
        buildHeader.appendChild(buildDate);
        buildHeader.appendChild(commitHash);
        buildItem.appendChild(buildHeader);

        // Release body (if exists)
        if (release.body) {
            const releaseBody = document.createElement('div');
            releaseBody.className = 'commit-list';
            releaseBody.style.color = 'var(--text-secondary)';
            releaseBody.style.fontSize = 'var(--font-size-sm)';
            releaseBody.style.marginBottom = 'var(--spacing-md)';

            // Simple markdown-like parsing for lists
            const lines = release.body.split('\n').filter(line => line.trim());
            lines.slice(0, 5).forEach(line => {
                const item = document.createElement('div');
                item.className = 'commit-item';
                item.innerHTML = `<span class="commit-message">${line.replace(/^[-*]\s/, '')}</span>`;
                releaseBody.appendChild(item);
            });

            buildItem.appendChild(releaseBody);
        }

        // Download button
        const asset = release.assets && release.assets.length > 0 ? release.assets[0] : null;

        if (asset) {
            const downloadBtn = document.createElement('a');
            downloadBtn.className = 'build-download-button';
            downloadBtn.href = asset.browser_download_url;
            downloadBtn.innerHTML = `
                <i class="fas fa-download"></i>
                Download ${asset.name}
            `;
            buildItem.appendChild(downloadBtn);
        } else {
            const viewBtn = document.createElement('a');
            viewBtn.className = 'build-download-button';
            viewBtn.href = release.html_url;
            viewBtn.target = '_blank';
            viewBtn.rel = 'noopener noreferrer';
            viewBtn.innerHTML = `
                <i class="fab fa-github"></i>
                View on GitHub
            `;
            buildItem.appendChild(viewBtn);
        }

        buildsList.appendChild(buildItem);
    });
};

// Initialize page
const initializePage = async () => {
    const projectId = getProjectIdFromUrl();

    if (!projectId) {
        showError('No project ID provided in URL');
        return;
    }

    try {
        // Load downloads config
        const config = await loadDownloadsConfig();
        const result = findProjectInConfig(config, projectId);

        if (!result) {
            showError(`Project "${projectId}" not found`);
            return;
        }

        if (result.type === 'repo') {
            // GitHub repo
            isGitHubRepo = true;

            // Fetch GitHub repo info
            repoInfo = await fetchGitHubRepoInfo(result.data.repoUrl);

            projectData = {
                name: repoInfo.name,
                description: repoInfo.description,
                topics: repoInfo.topics,
                icon: result.category.icon
            };

            // Render header
            renderProjectHeader();

            // Render download button (async)
            await renderGitHubDownloadButton();

            // Show content
            showContent();

            // Lazy load builds list
            setTimeout(() => {
                renderGitHubBuilds();
            }, 500);

        } else {
            // Config project
            isGitHubRepo = false;
            projectData = result.data;

            // Render header
            renderProjectHeader();

            // Render download button
            renderConfigDownloadButton();

            // Render builds list
            renderConfigBuilds();

            // Show content
            showContent();
        }

    } catch (error) {
        console.error('Error initializing page:', error);
        showError(`Failed to load project: ${error.message}`);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializePage);
