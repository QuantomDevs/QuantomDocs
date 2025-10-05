// Downloads page functionality
let downloadsData = null;
let allProjects = [];
let filteredProjects = [];
let currentFilter = 'all';
let searchQuery = '';

// Format date for display
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

// Create project card HTML
const createProjectCard = (project) => {
    const latestChangelog = project.changelogs && project.changelogs.length > 0 ? project.changelogs[0] : null;

    return `
        <div class="project-card" onclick="openProjectModal('${project.id}')">
            <div class="project-header">
                <div class="project-icon">
                    <i class="${project.icon}"></i>
                </div>
                <div class="project-info">
                    <h3 class="project-title">${project.name}</h3>
                    <span class="project-category">${project.category.replace('-', ' ')}</span>
                </div>
            </div>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>
            <div class="project-stats">
                <span class="project-downloads">
                    <strong>${formatDownloads(project.downloads)}</strong> downloads
                </span>
                <span class="maintenance-status ${project.maintained ? 'maintained' : 'unmaintained'}">
                    ${project.maintained ? 'Maintained' : 'Legacy'}
                </span>
            </div>
        </div>
    `;
};

// Open project modal
const openProjectModal = (projectId) => {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // Update modal header with admin buttons if logged in
    const modalHeader = modal.querySelector('.modal-header');
    const adminButtonsHTML = isUserLoggedIn() ? `
        <div class="admin-buttons">
            <button class="admin-btn edit-btn" onclick="editProject('${project.id}')" title="Edit Project">
                <i class="fas fa-edit"></i>
            </button>
            <button class="admin-btn delete-btn" onclick="deleteProject('${project.id}')" title="Delete Project">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    ` : '';

    modalHeader.innerHTML = `
        <h3 id="modal-title">${project.name}</h3>
        ${adminButtonsHTML}
        <button class="modal-close" onclick="closeProjectModal()">&times;</button>
    `;

    const latestChangelog = project.changelogs && project.changelogs.length > 0 ? project.changelogs[0] : null;

    modalBody.innerHTML = `
        <div class="project-modal-header">
            <div class="modal-project-icon">
                <i class="${project.icon}"></i>
            </div>
            <div class="modal-project-info">
                <h3>${project.name}</h3>
                <span class="modal-project-category">${project.category.replace('-', ' ')}</span>
            </div>
        </div>

        <div class="project-details-section">
            <h4><i class="fas fa-info-circle"></i> Description</h4>
            <p style="color: var(--text-secondary); line-height: 1.6;">${project.description}</p>
        </div>

        <div class="project-details-section">
            <h4><i class="fas fa-chart-line"></i> Statistics</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="color: var(--text-success); font-size: 1.5rem; font-weight: 600;">${formatDownloads(project.downloads)}</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">Downloads</div>
                </div>
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="color: ${project.maintained ? 'var(--text-success)' : 'var(--text-error)'}; font-size: 1.5rem; font-weight: 600;">
                        ${project.maintained ? 'Active' : 'Legacy'}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">Status</div>
                </div>
                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="color: var(--accent-color); font-size: 1.5rem; font-weight: 600;">
                        ${latestChangelog ? latestChangelog.version || `Build ${latestChangelog.buildNumber}` : 'N/A'}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">Latest Version</div>
                </div>
            </div>
        </div>

        <div class="project-details-section">
            <h4><i class="fas fa-tags"></i> Tags</h4>
            <div class="project-tags" style="margin-bottom: 0;">
                ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>
        </div>

        ${project.changelogs && project.changelogs.length > 0 ? `
            <div class="project-details-section">
                <h4><i class="fas fa-history"></i> Recent Updates</h4>
                ${project.changelogs.slice(0, 3).map(changelog => `
                    <div class="changelog-item">
                        <div class="changelog-header">
                            <span class="build-number">
                                ${changelog.version ? `${changelog.version} (Build ${changelog.buildNumber})` : `Build ${changelog.buildNumber}`}
                            </span>
                            <span class="build-date">${formatDate(changelog.timestamp)}</span>
                        </div>
                        ${changelog.commits && changelog.commits.length > 0 ? `
                            <ul class="changelog-commits">
                                ${changelog.commits.map(commit => `
                                    <li>${commit.message}</li>
                                `).join('')}
                            </ul>
                        ` : ''}
                        <a href="${changelog.downloadPath}" class="download-button" download>
                            <i class="fas fa-download"></i>
                            Download ${changelog.version || `Build ${changelog.buildNumber}`}
                        </a>
                    </div>
                `).join('')}
                ${project.changelogs.length > 3 ? `
                    <p style="color: var(--text-secondary); font-style: italic; text-align: center; margin-top: 1rem;">
                        Showing latest 3 updates. ${project.changelogs.length - 3} more available.
                    </p>
                ` : ''}
            </div>
        ` : `
            <div class="project-details-section">
                <h4><i class="fas fa-download"></i> Download</h4>
                <p style="color: var(--text-secondary); font-style: italic;">No releases available yet.</p>
            </div>
        `}
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

// Close project modal
const closeProjectModal = () => {
    const modal = document.getElementById('project-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
};

// Search functionality
const performSearch = (query) => {
    searchQuery = query.toLowerCase();
    filterProjects();
    updateSearchResults();
};

// Filter by category
const filterByCategory = (category) => {
    currentFilter = category;

    // Update active filter chip
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    document.querySelector(`[data-type="${category}"]`).classList.add('active');

    filterProjects();
    updateSearchResults();
};

// Apply filters and search
const filterProjects = () => {
    filteredProjects = allProjects.filter(project => {
        const matchesCategory = currentFilter === 'all' || project.category === currentFilter;
        const matchesSearch = searchQuery === '' ||
            project.name.toLowerCase().includes(searchQuery) ||
            project.description.toLowerCase().includes(searchQuery) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchQuery));

        return matchesCategory && matchesSearch;
    });

    renderProjects();
};

// Update search results display
const updateSearchResults = () => {
    const searchResults = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');
    const activeFilters = document.getElementById('activeFilters');

    if (searchQuery || currentFilter !== 'all') {
        searchResults.style.display = 'block';
        resultsCount.textContent = `Found ${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`;

        const filterTags = [];
        if (currentFilter !== 'all') {
            const categoryName = downloadsData.categories.find(cat => cat.id === currentFilter)?.name || currentFilter;
            filterTags.push(`<span class="search-category-tag">${categoryName}</span>`);
        }
        if (searchQuery) {
            filterTags.push(`<span class="search-category-tag">Search: "${searchQuery}"</span>`);
        }

        activeFilters.innerHTML = `Active filters: <span class="search-filter-tags">${filterTags.join('')}</span>`;
    } else {
        searchResults.style.display = 'none';
    }
};

// Create admin add-new card
const createAddNewCard = () => {
    // Safe check for isUserLoggedIn function
    try {
        if (typeof isUserLoggedIn !== 'function' || !isUserLoggedIn()) return '';
    } catch (error) {
        console.warn('isUserLoggedIn function not available:', error);
        return '';
    }

    return `
        <div class="project-card add-new-card" onclick="openAddNewModal()">
            <div class="add-new-content">
                <div class="add-new-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <h3>Add New Download</h3>
                <p>Füge ein neuen Download hinzu</p>
            </div>
        </div>
    `;
};

// Render projects grid
const renderProjects = () => {
    const projectsGrid = document.getElementById('projects-grid');

    if (filteredProjects.length === 0) {
        const addNewCard = createAddNewCard();
        projectsGrid.innerHTML = `
            ${addNewCard}
            <div class="no-results">
                <h3>No projects found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }

    const addNewCard = createAddNewCard();
    const projectCards = filteredProjects.map(createProjectCard).join('');
    projectsGrid.innerHTML = addNewCard + projectCards;
};

// Initialize search and filter functionality
const initializeInteractions = () => {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query && clearSearch) {
                clearSearch.style.display = 'block';
            } else if (clearSearch) {
                clearSearch.style.display = 'none';
            }
            performSearch(query);
        });
    }

    // Clear search
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
            }
            clearSearch.style.display = 'none';
            performSearch('');
        });
    }

    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const type = chip.getAttribute('data-type');
            filterByCategory(type);
        });
    });

    // Modal close events
    document.getElementById('project-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget || e.target.classList.contains('modal-overlay')) {
            closeProjectModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
};

// Load downloads data
const loadDownloadsData = async () => {
    console.log('Loading downloads data...');
    const projectsGrid = document.getElementById('projects-grid');

    if (!projectsGrid) {
        console.error('Projects grid element not found!');
        return;
    }

    try {
        // Show loading state
        projectsGrid.innerHTML = '<div class="loading">Loading projects...</div>';
        console.log('Loading state set, fetching data...');

        const response = await fetch('/api/downloads');
        console.log('Fetch response:', response.status, response.ok);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        downloadsData = await response.json();
        console.log('Downloads data loaded successfully:', downloadsData);

        // Flatten all projects from all categories
        allProjects = downloadsData.categories.flatMap(category =>
            category.projects.map(project => ({
                ...project,
                categoryName: category.name
            }))
        );

        console.log(`Total projects found: ${allProjects.length}`);

        // Sort by downloads (descending)
        allProjects.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));

        // Initial render
        filteredProjects = [...allProjects];
        renderProjects();

        // Initialize interactions (with error handling)
        try {
            initializeInteractions();
            console.log('Interactions initialized successfully');
        } catch (error) {
            console.warn('Error initializing interactions:', error);
        }

    } catch (error) {
        console.error('Error loading downloads data:', error);
        projectsGrid.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Projects</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadDownloadsData()" style="margin-top: 1rem;">
                    Try Again
                </button>
            </div>
        `;
    }
};

// Admin Modal Functions
const openAddNewModal = () => {
    if (!isUserLoggedIn()) return;

    const modal = document.getElementById('project-modal');
    const modalHeader = modal.querySelector('.modal-header');
    const modalBody = modal.querySelector('.modal-body');

    modalHeader.innerHTML = `
        <h3>Add New Download</h3>
        <button class="modal-close" onclick="closeProjectModal()">&times;</button>
    `;

    modalBody.innerHTML = `
        <div class="add-new-form">
            <div class="form-section">
                <label for="downloadType">Type:</label>
                <select id="downloadType" onchange="toggleDownloadForm()">
                    <option value="new-project">Neues Projekt</option>
                    <option value="add-download">Download zu Projekt hinzufügen</option>
                </select>
            </div>

            <div id="new-project-form" class="form-content">
                <div class="form-section">
                    <label for="projectCategory">Kategorie:</label>
                    <select id="projectCategory">
                        ${downloadsData.categories.map(cat =>
                            `<option value="${cat.id}">${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-section">
                    <label for="projectName">Projekt Name:</label>
                    <input type="text" id="projectName" required>
                </div>
                <div class="form-section">
                    <label for="projectDescription">Beschreibung:</label>
                    <textarea id="projectDescription" rows="3" required></textarea>
                </div>
                <div class="form-section">
                    <label for="projectTags">Tags (kommagetrennt):</label>
                    <input type="text" id="projectTags" placeholder="server, performance, core">
                </div>
                <div class="form-section">
                    <label for="projectStatus">Version Status:</label>
                    <select id="projectStatus">
                        <option value="active">Aktiv</option>
                        <option value="legacy">Legacy</option>
                    </select>
                </div>
            </div>

            <div id="add-download-form" class="form-content" style="display: none;">
                <div class="form-section">
                    <label for="downloadCategory">Kategorie:</label>
                    <select id="downloadCategory" onchange="updateProjectOptions()">
                        ${downloadsData.categories.map(cat =>
                            `<option value="${cat.id}">${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-section">
                    <label for="downloadProject">Projekt:</label>
                    <select id="downloadProject">
                        <!-- Will be populated by updateProjectOptions() -->
                    </select>
                </div>
                <div class="form-section">
                    <label for="uploadType">Upload Type:</label>
                    <select id="uploadType" onchange="toggleUploadType()">
                        <option value="file">Datei</option>
                        <option value="link">Link</option>
                    </select>
                </div>
                <div class="form-section" id="file-upload-section">
                    <label for="downloadFile">Datei:</label>
                    <input type="file" id="downloadFile">
                </div>
                <div class="form-section" id="link-input-section" style="display: none;">
                    <label for="downloadLink">Download Link:</label>
                    <input type="url" id="downloadLink">
                </div>
                <div class="form-section">
                    <label for="downloadVersion">Version:</label>
                    <input type="text" id="downloadVersion" required>
                </div>
                <div class="form-section">
                    <label>Changelogs:</label>
                    <div id="changelogEntries">
                        <div class="changelog-entry">
                            <input type="text" placeholder="Changelog message" class="changelog-input">
                            <button type="button" onclick="removeChangelogEntry(this)">Remove</button>
                        </div>
                    </div>
                    <button type="button" onclick="addChangelogEntry()" class="btn-secondary">Add Changelog</button>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" onclick="closeProjectModal()" class="btn-secondary">
                    <i class="fas fa-times"></i> Abbrechen
                </button>
                <button type="button" onclick="submitDownload()" class="btn-primary">
                    <i class="fas fa-upload"></i> Hochladen
                </button>
            </div>
        </div>
    `;

    // Initialize form
    updateProjectOptions();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

const toggleDownloadForm = () => {
    const type = document.getElementById('downloadType').value;
    const newProjectForm = document.getElementById('new-project-form');
    const addDownloadForm = document.getElementById('add-download-form');

    if (type === 'new-project') {
        newProjectForm.style.display = 'block';
        addDownloadForm.style.display = 'none';
    } else {
        newProjectForm.style.display = 'none';
        addDownloadForm.style.display = 'block';
        updateProjectOptions();
    }
};

const updateProjectOptions = () => {
    const categoryId = document.getElementById('downloadCategory')?.value;
    const projectSelect = document.getElementById('downloadProject');

    if (!projectSelect || !categoryId) return;

    const category = downloadsData.categories.find(cat => cat.id === categoryId);
    if (category) {
        projectSelect.innerHTML = category.projects.map(proj =>
            `<option value="${proj.name}">${proj.name}</option>`
        ).join('');
    }
};

const toggleUploadType = () => {
    const uploadType = document.getElementById('uploadType').value;
    const fileSection = document.getElementById('file-upload-section');
    const linkSection = document.getElementById('link-input-section');

    if (uploadType === 'file') {
        fileSection.style.display = 'block';
        linkSection.style.display = 'none';
    } else {
        fileSection.style.display = 'none';
        linkSection.style.display = 'block';
    }
};

const addChangelogEntry = () => {
    const container = document.getElementById('changelogEntries');
    const entry = document.createElement('div');
    entry.className = 'changelog-entry';
    entry.innerHTML = `
        <input type="text" placeholder="Changelog message" class="changelog-input">
        <button type="button" onclick="removeChangelogEntry(this)">Remove</button>
    `;
    container.appendChild(entry);
};

const removeChangelogEntry = (button) => {
    const container = document.getElementById('changelogEntries');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
};

const submitDownload = async () => {
    if (!isUserLoggedIn()) return;

    const type = document.getElementById('downloadType').value;

    // Collect form data
    const projectName = document.getElementById('projectName')?.value ||
                       document.getElementById('downloadProject')?.value;

    if (type === 'new-project') {
        alert(`✓ Neues Projekt "${projectName}" würde erstellt werden.\n\nHinweis: Vollständige Admin-Funktionalität erfordert Backend-Integration.`);
    } else {
        const version = document.getElementById('downloadVersion')?.value;
        alert(`✓ Download für "${projectName}" Version ${version} würde hinzugefügt werden.\n\nHinweis: Vollständige Admin-Funktionalität erfordert Backend-Integration.`);
    }

    closeProjectModal();
};

const deleteProject = async (projectId) => {
    if (!isUserLoggedIn()) return;

    const project = allProjects.find(p => p.id === projectId);
    const projectName = project ? project.name : 'Projekt';

    if (!confirm(`Bist du sicher, dass du "${projectName}" löschen möchtest?`)) return;

    alert(`✓ Projekt "${projectName}" würde gelöscht werden.\n\nHinweis: Vollständige Admin-Funktionalität erfordert Backend-Integration.`);
    closeProjectModal();
};

const editProject = (projectId) => {
    if (!isUserLoggedIn()) return;

    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('project-modal');
    const modalHeader = modal.querySelector('.modal-header');
    const modalBody = modal.querySelector('.modal-body');

    modalHeader.innerHTML = `
        <h3>Projekt bearbeiten: ${project.name}</h3>
        <button class="modal-close" onclick="closeProjectModal()">&times;</button>
    `;

    modalBody.innerHTML = `
        <div class="edit-project-form">
            <div class="form-section">
                <label for="editProjectName">Projekt Name:</label>
                <input type="text" id="editProjectName" value="${project.name}" required>
            </div>

            <div class="form-section">
                <label for="editProjectDescription">Beschreibung:</label>
                <textarea id="editProjectDescription" rows="3" required>${project.description}</textarea>
            </div>

            <div class="form-section">
                <label for="editProjectTags">Tags (kommagetrennt):</label>
                <input type="text" id="editProjectTags" value="${project.tags.join(', ')}" placeholder="server, performance, core">
            </div>

            <div class="form-section">
                <label for="editProjectMaintained">Status:</label>
                <select id="editProjectMaintained">
                    <option value="true" ${project.maintained ? 'selected' : ''}>Maintained</option>
                    <option value="false" ${!project.maintained ? 'selected' : ''}>Legacy</option>
                </select>
            </div>

            <div class="form-section">
                <label>Changelogs verwalten:</label>
                <div id="editChangelogsList" class="changelogs-list">
                    ${project.changelogs ? project.changelogs.map((changelog, index) => `
                        <div class="changelog-item-edit" data-index="${index}">
                            <div class="changelog-header-edit">
                                <h4>Build ${changelog.buildNumber}</h4>
                                <div class="changelog-actions">
                                    <button class="btn-sm btn-danger" onclick="removeChangelog(${index})">
                                        <i class="fas fa-trash"></i> Löschen
                                    </button>
                                </div>
                            </div>
                            <div class="changelog-details">
                                <p><strong>Version:</strong> ${changelog.version || 'N/A'}</p>
                                <p><strong>Datum:</strong> ${formatDate(changelog.timestamp)}</p>
                                <p><strong>Download:</strong> ${changelog.downloadPath}</p>
                                <div class="commits-list">
                                    <strong>Commits:</strong>
                                    ${changelog.commits ? changelog.commits.map(commit => `
                                        <div class="commit-item">• ${commit.message}</div>
                                    `).join('') : '<em>Keine Commits</em>'}
                                </div>
                            </div>
                        </div>
                    `).join('') : '<p class="no-changelogs">Keine Changelogs vorhanden</p>'}
                </div>
                <button type="button" onclick="openAddChangelogModal('${projectId}')" class="btn-secondary">
                    <i class="fas fa-plus"></i> Neuer Changelog
                </button>
            </div>

            <div class="form-actions">
                <button type="button" onclick="saveProjectChanges('${projectId}')" class="btn-primary">
                    <i class="fas fa-save"></i> Änderungen speichern
                </button>
                <button type="button" onclick="closeProjectModal()" class="btn-secondary">
                    <i class="fas fa-times"></i> Abbrechen
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

// Project editing support functions
const saveProjectChanges = async (projectId) => {
    if (!isUserLoggedIn()) return;

    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    // Collect form data
    const name = document.getElementById('editProjectName').value;
    const description = document.getElementById('editProjectDescription').value;
    const tags = document.getElementById('editProjectTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const maintained = document.getElementById('editProjectMaintained').value === 'true';

    alert(`✓ Projekt "${name}" würde mit folgenden Änderungen gespeichert werden:\n\n` +
          `Name: ${name}\n` +
          `Beschreibung: ${description}\n` +
          `Tags: ${tags.join(', ')}\n` +
          `Status: ${maintained ? 'Maintained' : 'Legacy'}\n\n` +
          `Hinweis: Vollständige Admin-Funktionalität erfordert Backend-Integration.`);

    closeProjectModal();
};

const removeChangelog = (index) => {
    if (!isUserLoggedIn()) return;

    if (confirm('Bist du sicher, dass du diesen Changelog löschen möchtest?')) {
        alert(`✓ Changelog Build ${index + 1} würde gelöscht werden.\n\nHinweis: Vollständige Admin-Funktionalität erfordert Backend-Integration.`);

        // Remove the changelog item from UI
        const changelogItem = document.querySelector(`[data-index="${index}"]`);
        if (changelogItem) {
            changelogItem.remove();
        }
    }
};

const openAddChangelogModal = (projectId) => {
    if (!isUserLoggedIn()) return;

    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    // Create a sub-modal for adding changelog
    const subModal = document.createElement('div');
    subModal.className = 'modal';
    subModal.style.zIndex = '1002';
    subModal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Neuer Changelog für ${project.name}</h3>
                    <button class="modal-close" onclick="closeSubModal(this)">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-section">
                        <label for="newChangelogVersion">Version:</label>
                        <input type="text" id="newChangelogVersion" required placeholder="z.B. 1.0.0">
                    </div>

                    <div class="form-section">
                        <label for="newChangelogBuild">Build Nummer:</label>
                        <input type="number" id="newChangelogBuild" required placeholder="z.B. 42">
                    </div>

                    <div class="form-section">
                        <label for="uploadType">Upload Type:</label>
                        <select id="uploadType" onchange="toggleUploadType()">
                            <option value="file">Datei hochladen</option>
                            <option value="link">Link angeben</option>
                        </select>
                    </div>

                    <div class="form-section" id="file-upload-section">
                        <label for="changelogFile">Datei:</label>
                        <div class="file-upload-wrapper">
                            <input type="file" id="changelogFile" accept=".jar,.zip,.tar.gz">
                            <div class="file-upload-info">Unterstützte Formate: .jar, .zip, .tar.gz</div>
                        </div>
                    </div>

                    <div class="form-section" id="link-input-section" style="display: none;">
                        <label for="changelogLink">Download Link:</label>
                        <input type="url" id="changelogLink" placeholder="https://example.com/download.jar">
                    </div>

                    <div class="form-section">
                        <label>Commit Messages:</label>
                        <div id="newChangelogCommits">
                            <div class="changelog-entry">
                                <input type="text" placeholder="Commit message" class="changelog-input">
                                <button type="button" class="remove-btn" onclick="removeChangelogEntry(this)">
                                    <i class="fas fa-times"></i> Entfernen
                                </button>
                            </div>
                        </div>
                        <button type="button" onclick="addChangelogEntry()" class="add-changelog-btn">
                            <i class="fas fa-plus"></i> Commit hinzufügen
                        </button>
                    </div>

                    <div class="form-actions">
                        <button type="button" onclick="saveNewChangelog('${projectId}')" class="btn-primary">
                            <i class="fas fa-save"></i> Changelog speichern
                        </button>
                        <button type="button" onclick="closeSubModal(this)" class="btn-secondary">
                            <i class="fas fa-times"></i> Abbrechen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(subModal);
};

const closeSubModal = (button) => {
    const modal = button.closest('.modal');
    if (modal) {
        modal.remove();
    }
};

const saveNewChangelog = (projectId) => {
    if (!isUserLoggedIn()) return;

    const version = document.getElementById('newChangelogVersion').value;
    const buildNumber = document.getElementById('newChangelogBuild').value;
    const uploadType = document.getElementById('uploadType').value;

    const commits = [];
    document.querySelectorAll('#newChangelogCommits .changelog-input').forEach(input => {
        if (input.value.trim()) {
            commits.push(input.value.trim());
        }
    });

    let downloadPath = '';
    if (uploadType === 'file') {
        const file = document.getElementById('changelogFile').files[0];
        downloadPath = file ? file.name : 'Keine Datei ausgewählt';
    } else {
        downloadPath = document.getElementById('changelogLink').value;
    }

    alert(`✓ Neuer Changelog würde erstellt werden:\n\n` +
          `Version: ${version}\n` +
          `Build: ${buildNumber}\n` +
          `Download: ${downloadPath}\n` +
          `Commits: ${commits.length} Einträge\n\n` +
          `Hinweis: Vollständige Admin-Funktionalität erfordert Backend-Integration.`);

    // Close sub-modal
    document.querySelector('.modal[style*="1002"]').remove();
};

// Duplicate functions removed - they are already defined earlier in the file

// Enhanced file upload button position fix
const adjustFormActions = () => {
    const formActions = document.querySelectorAll('.form-actions');
    formActions.forEach(actions => {
        // Move upload button after cancel button as requested
        const buttons = actions.querySelectorAll('.btn');
        if (buttons.length >= 2) {
            const uploadBtn = buttons[0]; // Usually the primary button
            const cancelBtn = buttons[1]; // Usually the secondary button

            // Reorder: Cancel first, then Upload
            actions.appendChild(cancelBtn);
            actions.appendChild(uploadBtn);
        }
    });
};

// Initialize downloads page
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on downloads page
    if (window.location.pathname.includes('/downloads')) {
        loadDownloadsData();

        // Apply form adjustments after DOM is ready
        setTimeout(adjustFormActions, 100);
    }
});