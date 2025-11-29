/**
 * Component Orchestrator
 * Initializes all interactive component scripts after HTML is injected into DOM
 */

import { initTabsLogic } from './components/Tabs.js';
import { initStepsLogic } from './components/Steps.js';
import { initAccordionLogic } from './components/Accordions.js';
import { initCodeGroupLogic } from './components/CodeGroups.js';
import { initExpandableLogic } from './components/Expandables.js';

/**
 * Initializes all component interactivity
 * Call this function after markdown content is rendered to the DOM
 */
export function initializeComponentScripts() {
    try {
        // Initialize interactive components
        initTabsLogic();
        initAccordionLogic();
        initCodeGroupLogic();
        initExpandableLogic();
        initStepsLogic(); // Minimal, but included for consistency

        console.log('✓ Component interactivity initialized');
    } catch (error) {
        console.error('Failed to initialize component scripts:', error);
        // Graceful degradation - components will still render, just without interactivity
    }
}

/**
 * Optional: Initialize components with a delay to ensure DOM is fully ready
 * @param {number} delay - Delay in milliseconds (default: 100ms)
 */
export function initializeComponentScriptsWithDelay(delay = 100) {
    setTimeout(() => {
        initializeComponentScripts();
    }, delay);
}

// Make functions available globally for non-module scripts
window.initializeComponentScripts = initializeComponentScripts;
window.initializeComponentScriptsWithDelay = initializeComponentScriptsWithDelay;
