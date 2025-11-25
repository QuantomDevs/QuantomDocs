/**
 * Responsive Chart Configuration Module for QuantomDocs
 * Provides responsive configuration for Chart.js charts
 */

/**
 * Create a responsive chart with mobile-friendly configuration
 * @param {string} canvasId - The ID of the canvas element
 * @param {Object} config - Base Chart.js configuration
 * @returns {Chart} Chart.js instance
 */
function createResponsiveChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element with ID '${canvasId}' not found`);
        return null;
    }

    // Detect if mobile
    const isMobile = window.innerWidth < 768;

    // Merge with responsive config
    const responsiveConfig = {
        ...config,
        options: {
            ...config.options,
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: isMobile ? 1 : 2, // Square on mobile, 2:1 on desktop
            plugins: {
                ...config.options?.plugins,
                legend: {
                    ...config.options?.plugins?.legend,
                    position: isMobile ? 'bottom' : 'top',
                    labels: {
                        ...config.options?.plugins?.legend?.labels,
                        font: {
                            size: isMobile ? 10 : 12
                        },
                        boxWidth: isMobile ? 12 : 40,
                        padding: isMobile ? 8 : 10
                    }
                },
                tooltip: {
                    ...config.options?.plugins?.tooltip,
                    titleFont: {
                        size: isMobile ? 12 : 14
                    },
                    bodyFont: {
                        size: isMobile ? 10 : 12
                    },
                    padding: isMobile ? 8 : 12
                }
            },
            scales: config.options?.scales ? {
                x: {
                    ...config.options.scales.x,
                    ticks: {
                        ...config.options.scales.x?.ticks,
                        font: {
                            size: isMobile ? 10 : 12
                        },
                        maxRotation: isMobile ? 45 : 0,
                        minRotation: isMobile ? 45 : 0
                    }
                },
                y: {
                    ...config.options.scales.y,
                    ticks: {
                        ...config.options.scales.y?.ticks,
                        font: {
                            size: isMobile ? 10 : 12
                        }
                    }
                }
            } : undefined
        }
    };

    // Create chart
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, responsiveConfig);

    return chart;
}

/**
 * Recreate all charts with new responsive settings
 * Call this function on window resize
 */
function recreateAllCharts() {
    // Store reference to all chart instances
    if (!window.chartInstances) {
        window.chartInstances = [];
    }

    // Destroy and recreate all charts
    window.chartInstances.forEach(chartInfo => {
        const { chartInstance, canvasId, originalConfig } = chartInfo;

        // Destroy old chart
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Create new responsive chart
        const newChart = createResponsiveChart(canvasId, originalConfig);

        // Update reference
        chartInfo.chartInstance = newChart;
    });
}

/**
 * Register a chart for automatic responsive recreation
 * @param {string} canvasId - The ID of the canvas element
 * @param {Object} config - Base Chart.js configuration
 * @param {Chart} chartInstance - The created chart instance
 */
function registerChart(canvasId, config, chartInstance) {
    if (!window.chartInstances) {
        window.chartInstances = [];
    }

    window.chartInstances.push({
        canvasId,
        originalConfig: config,
        chartInstance
    });
}

/**
 * Get responsive font sizes based on screen size
 * @returns {Object} Font sizes object
 */
function getResponsiveFontSizes() {
    const isMobile = window.innerWidth < 768;
    return {
        title: isMobile ? 14 : 18,
        label: isMobile ? 10 : 12,
        tick: isMobile ? 10 : 12,
        legend: isMobile ? 10 : 12,
        tooltip: {
            title: isMobile ? 12 : 14,
            body: isMobile ? 10 : 12
        }
    };
}

/**
 * Get responsive spacing values
 * @returns {Object} Spacing values object
 */
function getResponsiveSpacing() {
    const isMobile = window.innerWidth < 768;
    return {
        padding: isMobile ? 8 : 12,
        gap: isMobile ? 8 : 16,
        margin: isMobile ? 8 : 16
    };
}

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recreate all charts with new responsive settings
        recreateAllCharts();
        console.log('✓ Charts recreated for new screen size');
    }, 500);
});

// Export functions
window.createResponsiveChart = createResponsiveChart;
window.recreateAllCharts = recreateAllCharts;
window.registerChart = registerChart;
window.getResponsiveFontSizes = getResponsiveFontSizes;
window.getResponsiveSpacing = getResponsiveSpacing;

console.log('✓ Responsive Charts module initialized');
