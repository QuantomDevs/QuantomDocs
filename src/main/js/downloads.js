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
        <div class="project-card" onclick="window.location.href='/download/${project.id}'">
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

// Modal functions removed - now navigate to dedicated download page

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

// Admin functions removed - will be handled in settings page (Phase 2.2)

// Initialize downloads page
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on downloads page
    if (window.location.pathname.includes('/downloads')) {
        loadDownloadsData();
    }
});