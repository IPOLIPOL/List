/**
 * Main application initialization
 */
import { initProjectManager } from './projectManager.js';
import { initEntryManager } from './entryManager.js';
import { initUIRenderer } from './uiRenderer.js';
import { initFilterSortEngine } from './filterSortEngine.js';
import { initExportModule } from './exportModule.js';

// Application configuration
const appConfig = {
    // Field definitions for entries
    fields: [
        { id: 'title', label: 'Title', type: 'text', required: true },
        { id: 'description', label: 'Description', type: 'textarea' },
        { id: 'status', label: 'Status', type: 'dropdown', 
          options: [
            { value: 'open', label: 'Open', cssClass: 'status-open' },
            { value: 'closed', label: 'Closed', cssClass: 'status-closed' }
          ], 
          required: true 
        },
        { id: 'riskRating', label: 'Risk Rating', type: 'dropdown', 
          options: [
            { value: 'low', label: 'Low', cssClass: 'risk-low' },
            { value: 'medium', label: 'Medium', cssClass: 'risk-medium' },
            { value: 'high', label: 'High', cssClass: 'risk-high' }
          ]
        },
        { id: 'systemTag', label: 'System Tag', type: 'dropdown',
          options: [
            { value: 'system1', label: 'System 1' },
            { value: 'system2', label: 'System 2' },
            { value: 'system3', label: 'System 3' }
          ]
        },
        { id: 'priority', label: 'Priority', type: 'number', min: 1, max: 10 },
        { id: 'assignedTo', label: 'Assigned To', type: 'text' },
        { id: 'dueDate', label: 'Due Date', type: 'date' },
        { id: 'comments', label: 'Comments', type: 'textarea' }
    ]
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    console.log('Initializing application...');
    
    // Initialize all modules
    const projectManager = initProjectManager();
    const entryManager = initEntryManager();
    const uiRenderer = initUIRenderer(appConfig);
    const filterSortEngine = initFilterSortEngine(appConfig);
    const exportModule = initExportModule();
    
    // Initialize project selector
    initProjectSelector(projectManager, entryManager, uiRenderer);
    
    // Initialize add entry button
    initAddEntryButton(entryManager, uiRenderer);
    
    // Initialize export functionality
    initExportButton(exportModule);
    
    console.log('Application initialized');
}

function initProjectSelector(projectManager, entryManager, uiRenderer) {
    const searchInput = document.getElementById('project-search');
    const loadButton = document.getElementById('load-project-btn');
    const notFoundMessage = document.getElementById('project-not-found');
    const suggestionsContainer = document.getElementById('project-suggestions');
    
    // Set up autocomplete for project search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length < 3) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        const suggestions = projectManager.getProjectSuggestions(query);
        if (suggestions.length > 0) {
            displaySuggestions(suggestions, suggestionsContainer, searchInput);
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Handle project loading
    loadButton.addEventListener('click', () => {
        loadProject(searchInput.value.trim());
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadProject(searchInput.value.trim());
        }
    });
    
    function loadProject(projectId) {
        // Validate project ID format
        if (!/^\d{7}$/.test(projectId)) {
            alert('Project ID must be a 7-digit number');
            return;
        }
        
        // Check if project exists, if not create a new one
        if (!projectManager.projectExists(projectId)) {
            notFoundMessage.classList.remove('hidden');
            setTimeout(() => {
                if (confirm(`Project ${projectId} does not exist. Create a new project?`)) {
                    projectManager.saveProject({ id: projectId, entries: [] });
                    displayProject(projectId);
                }
                notFoundMessage.classList.add('hidden');
            }, 1000);
        } else {
            displayProject(projectId);
        }
    }
    
    function displayProject(projectId) {
        const projectData = projectManager.getProject(projectId);
        document.getElementById('current-project-id').textContent = projectId;
        document.getElementById('project-table-section').classList.remove('hidden');
        
        // Render the table with project data
        uiRenderer.setCurrentProject(projectId);
        uiRenderer.renderTable(projectData.entries);
    }
    
    function displaySuggestions(suggestions, container, input) {
        container.innerHTML = '';
        container.style.display = 'block';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => {
                input.value = suggestion;
                container.style.display = 'none';
            });
            container.appendChild(item);
        });
    }
}

function initAddEntryButton(entryManager, uiRenderer) {
    const addButton = document.getElementById('add-entry-btn');
    
    addButton.addEventListener('click', () => {
        uiRenderer.showEntryForm();
    });
}

function initExportButton(exportModule) {
    const exportBtn = document.getElementById('export-btn');
    const exportOptions = document.getElementById('export-options');
    
    // Toggle export options menu
    exportBtn.addEventListener('click', () => {
        exportOptions.classList.toggle('hidden');
    });
    
    // Handle export format selection
    exportOptions.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const format = e.target.getAttribute('data-format');
            const projectId = document.getElementById('current-project-id').textContent;
            
            if (format === 'csv') {
                exportModule.exportToCSV(projectId);
            } else if (format === 'json') {
                exportModule.exportToJSON(projectId);
            }
            
            exportOptions.classList.add('hidden');
        }
    });
    
    // Close export options when clicking outside
    document.addEventListener('click', (e) => {
        if (!exportBtn.contains(e.target) && !exportOptions.contains(e.target)) {
            exportOptions.classList.add('hidden');
        }
    });
}
