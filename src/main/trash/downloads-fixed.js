// Fixed Downloads page functionality
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

// Create add new card (only for logged in users)
const createAddNewCard = () => {
    // Check if isUserLoggedIn function exists, otherwise assume not logged in
    const isLoggedIn = typeof isUserLoggedIn === 'function' ? isUserLoggedIn() : false;

    if (!isLoggedIn) return '';

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

    if (!projectsGrid) {
        console.error('Projects grid element not found!');
        return;
    }

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

// Simple search functionality
const filterProjects = () => {
    filteredProjects = allProjects.filter(project => {
        const matchesSearch = !searchQuery ||
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter = currentFilter === 'all' || project.category === currentFilter;

        return matchesSearch && matchesFilter;
    });

    renderProjects();
    updateSearchResults();
};

// Update search results info
const updateSearchResults = () => {
    const resultsElement = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');

    if (resultsElement && resultsCount) {
        if (searchQuery || currentFilter !== 'all') {
            resultsElement.style.display = 'block';
            resultsCount.textContent = `Found ${filteredProjects.length} projects`;
        } else {
            resultsElement.style.display = 'none';
        }
    }
};

// Initialize search and filter functionality
const initializeInteractions = () => {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const filterChips = document.querySelectorAll('.filter-chip');

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (searchQuery && clearSearch) {
                clearSearch.style.display = 'block';
            } else if (clearSearch) {
                clearSearch.style.display = 'none';
            }
            filterProjects();
        });
    }

    // Clear search
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchQuery = '';
            searchInput.value = '';
            clearSearch.style.display = 'none';
            filterProjects();
        });
    }

    // Filter chips
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.dataset.type;
            filterProjects();
        });
    });
};

// Load downloads data
const loadDownloadsData = async () => {
    const projectsGrid = document.getElementById('projects-grid');

    if (!projectsGrid) {
        console.error('Projects grid element not found!');
        return;
    }

    try {
        // Show loading state
        projectsGrid.innerHTML = '<div class="loading">Loading projects...</div>';

        const response = await fetch('config/downloads.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        downloadsData = await response.json();

        if (!downloadsData || !downloadsData.categories) {
            throw new Error('Invalid data format');
        }

        // Flatten all projects from all categories
        allProjects = downloadsData.categories.flatMap(category =>
            category.projects.map(project => ({
                ...project,
                categoryName: category.name
            }))
        );

        // Sort by downloads (descending)
        allProjects.sort((a, b) => b.downloads - a.downloads);

        // Initial render
        filteredProjects = [...allProjects];
        renderProjects();

        // Initialize interactions
        initializeInteractions();

        console.log(`Loaded ${allProjects.length} projects successfully`);

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

// Simple modal placeholder functions
const openProjectModal = (projectId) => {
    alert(`Opening project: ${projectId}\nFull modal functionality will be available when admin features are implemented.`);
};

const openAddNewModal = () => {
    alert('Add new project modal\nThis feature requires backend integration.');
};

// Initialize downloads page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Downloads page loading...');

    // Only initialize on downloads page
    if (window.location.pathname.includes('downloads.html') ||
        window.location.pathname.includes('test-downloads.html')) {
        console.log('Initializing downloads functionality...');
        loadDownloadsData();
    }
});