/**
 * Filter/Sort Engine Module
 * Handles filtering and sorting of table entries
 */
import { initProjectManager } from './projectManager.js';

export function initFilterSortEngine(appConfig) {
    const projectManager = initProjectManager();
    
    // Current filter criteria
    let currentFilters = {};
    
    // Current sort options
    let currentSort = {
        field: null,
        direction: 'asc' // 'asc' or 'desc'
    };
    
    /**
     * Initialize filter controls
     * @param {string} projectId - Current project ID
     */
    function initFilterControls(projectId) {
        const filterContainer = document.getElementById('filter-container');
        filterContainer.innerHTML = '';
        
        // Add filter options for each field
        appConfig.fields.forEach(field => {
            // Skip fields that don't make sense to filter on
            if (field.type === 'textarea') return;
            
            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';
            
            const label = document.createElement('label');
            label.setAttribute('for', `filter-${field.id}`);
            label.textContent = field.label + ': ';
            
            let input;
            
            // Create different filter types based on field type
            switch (field.type) {
                case 'dropdown':
                    input = document.createElement('select');
                    input.id = `filter-${field.id}`;
                    input.name = `filter-${field.id}`;
                    
                    // Add blank option
                    const blankOption = document.createElement('option');
                    blankOption.value = '';
                    blankOption.textContent = 'All';
                    input.appendChild(blankOption);
                    
                    // Add options
                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label;
                        input.appendChild(optionElement);
                    });
                    break;
                    
                case 'date':
                    // Create date range inputs
                    input = document.createElement('div');
                    input.className = 'date-range';
                    
                    const fromInput = document.createElement('input');
                    fromInput.type = 'date';
                    fromInput.id = `filter-${field.id}-from`;
                    fromInput.name = `filter-${field.id}-from`;
                    fromInput.placeholder = 'From';
                    
                    const toInput = document.createElement('input');
                    toInput.type = 'date';
                    toInput.id = `filter-${field.id}-to`;
                    toInput.name = `filter-${field.id}-to`;
                    toInput.placeholder = 'To';
                    
                    input.appendChild(fromInput);
                    input.appendChild(document.createTextNode(' to '));
                    input.appendChild(toInput);
                    break;
                    
                case 'number':
                    // Create number range inputs
                    input = document.createElement('div');
                    input.className = 'number-range';
                    
                    const minInput = document.createElement('input');
                    minInput.type = 'number';
                    minInput.id = `filter-${field.id}-min`;
                    minInput.name = `filter-${field.id}-min`;
                    minInput.placeholder = 'Min';
                    minInput.style.width = '70px';
                    
                    const maxInput = document.createElement('input');
                    maxInput.type = 'number';
                    maxInput.id = `filter-${field.id}-max`;
                    maxInput.name = `filter-${field.id}-max`;
                    maxInput.placeholder = 'Max';
                    maxInput.style.width = '70px';
                    
                    input.appendChild(minInput);
                    input.appendChild(document.createTextNode(' to '));
                    input.appendChild(maxInput);
                    break;
                    
                case 'text':
                default:
                    input = document.createElement('input');
                    input.type = 'text';
                    input.id = `filter-${field.id}`;
                    input.name = `filter-${field.id}`;
                    input.placeholder = `Filter by ${field.label.toLowerCase()}...`;
                    break;
            }
            
            filterItem.appendChild(label);
            filterItem.appendChild(input);
            filterContainer.appendChild(filterItem);
        });
        
        // Add event listeners for filter controls
        document.getElementById('apply-filters-btn').addEventListener('click', () => {
            collectFilters();
            applyFiltersAndSort(projectId);
        });
        
        document.getElementById('clear-filters-btn').addEventListener('click', () => {
            clearFilters();
            applyFiltersAndSort(projectId);
        });
    }
    
    /**
     * Collect filter values from form elements
     */
    function collectFilters() {
        currentFilters = {};
        
        appConfig.fields.forEach(field => {
            if (field.type === 'textarea') return;
            
            switch (field.type) {
                case 'date':
                    const fromDate = document.getElementById(`filter-${field.id}-from`).value;
                    const toDate = document.getElementById(`filter-${field.id}-to`).value;
                    
                    if (fromDate || toDate) {
                        currentFilters[field.id] = {
                            from: fromDate,
                            to: toDate
                        };
                    }
                    break;
                    
                case 'number':
                    const minValue = document.getElementById(`filter-${field.id}-min`).value;
                    const maxValue = document.getElementById(`filter-${field.id}-max`).value;
                    
                    if (minValue || maxValue) {
                        currentFilters[field.id] = {
                            min: minValue !== '' ? Number(minValue) : null,
                            max: maxValue !== '' ? Number(maxValue) : null
                        };
                    }
                    break;
                    
                case 'dropdown':
                case 'text':
                default:
                    const value = document.getElementById(`filter-${field.id}`).value;
                    if (value.trim() !== '') {
                        currentFilters[field.id] = value;
                    }
                    break;
            }
        });
    }
    
    /**
     * Clear all filter form elements
     */
    function clearFilters() {
        currentFilters = {};
        
        // Clear all filter inputs
        document.querySelectorAll('#filter-container input, #filter-container select').forEach(input => {
            input.value = '';
        });
    }
    
    /**
     * Filter entries based on current filter criteria
     * @param {Array} entries - Array of entry objects
     * @returns {Array} Filtered entries
     */
    function filterEntries(entries) {
        if (!entries) return [];
        if (Object.keys(currentFilters).length === 0) return entries;
        
        return entries.filter(entry => {
            // Check all filter criteria
            for (const [fieldId, filterValue] of Object.entries(currentFilters)) {
                const entryValue = entry[fieldId];
                
                // Skip if entry doesn't have this field
                if (entryValue === undefined) continue;
                
                // Check based on filter type
                if (typeof filterValue === 'object') {
                    // Range filter (date or number)
                    if (filterValue.from !== undefined) {
                        // Date range
                        const from = filterValue.from ? new Date(filterValue.from) : null;
                        const to = filterValue.to ? new Date(filterValue.to) : null;
                        const entryDate = new Date(entryValue);
                        
                        if (from && entryDate < from) return false;
                        if (to && entryDate > to) return false;
                    } else {
                        // Number range
                        const min = filterValue.min !== null ? filterValue.min : -Infinity;
                        const max = filterValue.max !== null ? filterValue.max : Infinity;
                        const num = Number(entryValue);
                        
                        if (isNaN(num) || num < min || num > max) return false;
                    }
                } else {
                    // Text or dropdown filter
                    const filterStr = String(filterValue).toLowerCase();
                    const entryStr = String(entryValue).toLowerCase();
                    
                    if (!entryStr.includes(filterStr)) return false;
                }
            }
            
            // All filters passed
            return true;
        });
    }
    
    /**
     * Sort entries based on field and direction
     * @param {Array} entries - Array of entry objects
     * @param {string} field - Field to sort by
     * @param {string} direction - Sort direction ('asc' or 'desc')
     * @returns {Array} Sorted entries
     */
    function sortEntries(entries, field, direction) {
        if (!entries || entries.length === 0) return [];
        if (!field) return entries;
        
        return [...entries].sort((a, b) => {
            const aValue = a[field] !== undefined ? a[field] : '';
            const bValue = b[field] !== undefined ? b[field] : '';
            
            // Handle different data types
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            // Convert to strings for comparison
            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();
            
            if (aStr < bStr) return direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    /**
     * Apply current filters and sort to table
     * @param {string} projectId - Current project ID
     */
    function applyFiltersAndSort(projectId) {
        const project = projectManager.getProject(projectId);
        if (!project) return;
        
        let filteredEntries = filterEntries(project.entries);
        
        if (currentSort.field) {
            filteredEntries = sortEntries(
                filteredEntries,
                currentSort.field,
                currentSort.direction
            );
        }
        
        // Update table with filtered and sorted entries
        const uiRenderer = window.uiRenderer; // Get from global scope
        if (uiRenderer) {
            uiRenderer.renderTable(filteredEntries);
        }
    }
    
    /**
     * Set current sort options
     * @param {string} field - Field to sort by
     * @param {string} direction - Sort direction ('asc' or 'desc')
     */
    function setSort(field, direction) {
        currentSort.field = field;
        currentSort.direction = direction;
    }
    
    /**
     * Get current filtered and sorted entries
     * @param {string} projectId - Current project ID
     * @returns {Array} Processed entries
     */
    function getProcessedEntries(projectId) {
        const project = projectManager.getProject(projectId);
        if (!project) return [];
        
        let processedEntries = filterEntries(project.entries);
        
        if (currentSort.field) {
            processedEntries = sortEntries(
                processedEntries,
                currentSort.field,
                currentSort.direction
            );
        }
        
        return processedEntries;
    }
    
    // Return public methods
    return {
        initFilterControls,
        filterEntries,
        sortEntries,
        applyFiltersAndSort,
        setSort,
        getProcessedEntries
    };
}
