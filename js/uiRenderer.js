/**
 * UI Renderer Module
 * Handles rendering of UI components and user interactions
 */
import { initProjectManager } from './projectManager.js';
import { initEntryManager } from './entryManager.js';

export function initUIRenderer(appConfig) {
    const projectManager = initProjectManager();
    const entryManager = initEntryManager();
    
    // Current project and entry being edited
    let currentProjectId = null;
    let currentEditingEntryId = null;
    
    /**
     * Render the project selector with autocomplete
     */
    function renderProjectSelector() {
        // Already handled by event listeners in app.js
    }
    
    /**
     * Render table with project entries
     * @param {Array} entries - Array of entry objects
     */
    function renderTable(entries) {
        const tableHeader = document.getElementById('table-header');
        const tableBody = document.getElementById('table-body');
        const noEntriesMessage = document.getElementById('no-entries-message');
        
        // Clear existing content
        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';
        
        // Create header row
        const headerRow = document.createElement('tr');
        
        // ID column
        const idHeader = document.createElement('th');
        idHeader.textContent = 'ID';
        idHeader.dataset.field = 'id';
        headerRow.appendChild(idHeader);
        
        // Add columns for each field
        appConfig.fields.forEach(field => {
            const th = document.createElement('th');
            th.textContent = field.label;
            th.dataset.field = field.id;
            th.addEventListener('click', () => sortTable(field.id));
            headerRow.appendChild(th);
        });
        
        // Actions column
        const actionsHeader = document.createElement('th');
        actionsHeader.textContent = 'Actions';
        headerRow.appendChild(actionsHeader);
        
        tableHeader.appendChild(headerRow);
        
        // Check if there are entries
        if (!entries || entries.length === 0) {
            tableBody.innerHTML = '';
            noEntriesMessage.classList.remove('hidden');
            return;
        }
        
        // Hide no entries message
        noEntriesMessage.classList.add('hidden');
        
        // Create rows for each entry
        entries.forEach(entry => {
            const row = createTableRow(entry);
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Create a table row for an entry
     * @param {Object} entry - The entry object
     * @returns {HTMLElement} The created row element
     */
    function createTableRow(entry) {
        const row = document.createElement('tr');
        row.dataset.entryId = entry.id;
        
        // ID cell
        const idCell = document.createElement('td');
        idCell.textContent = entry.id.replace('entry_', '').substring(0, 8); // Display shorter ID
        row.appendChild(idCell);
        
        // Ad

  // Add cells for each field
        appConfig.fields.forEach(field => {
            const cell = document.createElement('td');
            
            // Handle different field types
            if (field.type === 'dropdown') {
                const selectedOption = field.options.find(option => option.value === entry[field.id]);
                if (selectedOption) {
                    cell.textContent = selectedOption.label;
                    if (selectedOption.cssClass) {
                        cell.classList.add(selectedOption.cssClass);
                    }
                } else {
                    cell.textContent = entry[field.id] || '';
                }
            } else {
                cell.textContent = entry[field.id] || '';
            }
            
            row.appendChild(cell);
        });
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'table-actions-cell';
        
        // Edit button
        const editButton = document.createElement('button');
        editButton.className = 'action-btn edit-btn';
        editButton.innerHTML = '✏️';
        editButton.title = 'Edit';
        editButton.addEventListener('click', () => showEntryForm(entry.id));
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'action-btn delete-btn';
        deleteButton.innerHTML = '🗑️';
        deleteButton.title = 'Delete';
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this entry?')) {
                deleteEntry(entry.id);
            }
        });
        
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        
        return row;
    }
    
    /**
     * Show entry form for creating or editing an entry
     * @param {string} entryId - Entry ID if editing, null if creating new
     */
    function showEntryForm(entryId = null) {
        const modal = document.getElementById('entry-form-modal');
        const formTitle = document.getElementById('form-title');
        const formFields = document.getElementById('form-fields');
        const saveBtn = document.getElementById('save-btn');
        
        // Clear form fields
        formFields.innerHTML = '';
        
        // Set form title
        formTitle.textContent = entryId ? 'Edit Entry' : 'Add New Entry';
        
        // Store current editing entry ID
        currentEditingEntryId = entryId;
        
        // Get entry data if editing
        let entryData = {};
        if (entryId) {
            entryData = entryManager.getEntry(currentProjectId, entryId) || {};
        }
        
        // Create form fields
        appConfig.fields.forEach(field => {
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'form-field';
            
            const label = document.createElement('label');
            label.setAttribute('for', `field-${field.id}`);
            label.textContent = field.label;
            if (field.required) {
                const requiredMark = document.createElement('span');
                requiredMark.textContent = ' *';
                requiredMark.style.color = 'red';
                label.appendChild(requiredMark);
            }
            
            let input;
            
            // Create different input types based on field type
            switch (field.type) {
                case 'textarea':
                    input = document.createElement('textarea');
                    input.id = `field-${field.id}`;
                    input.name = field.id;
                    input.rows = 3;
                    input.value = entryData[field.id] || '';
                    break;
                    
                case 'dropdown':
                    input = document.createElement('select');
                    input.id = `field-${field.id}`;
                    input.name = field.id;
                    
                    // Add placeholder option if not required
                    if (!field.required) {
                        const placeholderOption = document.createElement('option');
                        placeholderOption.value = '';
                        placeholderOption.textContent = '-- Select --';
                        input.appendChild(placeholderOption);
                    }
                    
                    // Add options
                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label;
                        if (entryData[field.id] === option.value) {
                            optionElement.selected = true;
                        }
                        input.appendChild(optionElement);
                    });
                    break;
                    
                case 'date':
                    input = document.createElement('input');
                    input.type = 'date';
                    input.id = `field-${field.id}`;
                    input.name = field.id;
                    input.value = entryData[field.id] || '';
                    break;
                    
                case 'number':
                    input = document.createElement('input');
                    input.type = 'number';
                    input.id = `field-${field.id}`;
                    input.name = field.id;
                    input.min = field.min !== undefined ? field.min : '';
                    input.max = field.max !== undefined ? field.max : '';
                    input.value = entryData[field.id] || '';
                    break;
                    
                case 'text':
                default:
                    input = document.createElement('input');
                    input.type = 'text';
                    input.id = `field-${field.id}`;
                    input.name = field.id;
                    input.value = entryData[field.id] || '';
                    break;
            }
            
            // Add required attribute if needed
            if (field.required) {
                input.required = true;
            }
            
            // Add event listener to enable save button when form is valid
            input.addEventListener('input', validateForm);
            
            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            formFields.appendChild(fieldContainer);
        });
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Enable/disable save button based on initial form state
        validateForm();
    }
    
    /**
     * Validate form and enable/disable save button
     */
    function validateForm() {
        const form = document.getElementById('entry-form');
        const saveBtn = document.getElementById('save-btn');
        
        // Check if all required fields have values
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
            }
        });
        
        saveBtn.disabled = !isValid;
    }
    
    /**
     * Save entry from form data
     */
    function saveEntryFromForm() {
        const form = document.getElementById('entry-form');
        const formData = new FormData(form);
        const entryData = {};
        
        // Convert form data to object
        for (const [key, value] of formData.entries()) {
            entryData[key] = value;
        }
        
        // Add or update entry
        if (currentEditingEntryId) {
            // Update existing entry
            const updatedEntry = entryManager.updateEntry(
                currentProjectId,
                currentEditingEntryId,
                entryData
            );
            
            if (updatedEntry) {
                // Update table row
                updateTableRow(currentEditingEntryId, updatedEntry);
            }
        } else {
            // Add new entry
            const newEntry = entryManager.addEntry(currentProjectId, entryData);
            
            if (newEntry) {
                // Reload table to show new entry
                const project = projectManager.getProject(currentProjectId);
                renderTable(project.entries);
            }
        }
        
        // Close modal
        hideEntryForm();
    }
    
    /**
     * Hide entry form
     */
    function hideEntryForm() {
        const modal = document.getElementById('entry-form-modal');
        modal.classList.add('hidden');
        currentEditingEntryId = null;
    }
    
    /**
     * Update specific table row with new entry data
     * @param {string} entryId - Entry ID to update
     * @param {Object} entryData - Updated entry data
     */
    function updateTableRow(entryId, entryData) {
        const row = document.querySelector(`tr[data-entry-id="${entryId}"]`);
        if (!row) return;
        
        // Remove old row
        row.remove();
        
        // Create new row
        const newRow = createTableRow(entryData);
        
        // Insert at appropriate position
        const tableBody = document.getElementById('table-body');
        tableBody.appendChild(newRow);
    }
    
    /**
     * Delete entry and update table
     * @param {string} entryId - Entry ID to delete
     */
    function deleteEntry(entryId) {
        const success = entryManager.deleteEntry(currentProjectId, entryId);
        
        if (success) {
            // Remove row from table
            const row = document.querySelector(`tr[data-entry-id="${entryId}"]`);
            if (row) {
                row.remove();
            }
            
            // Check if table is empty
            const tableBody = document.getElementById('table-body');
            if (tableBody.children.length === 0) {
                document.getElementById('no-entries-message').classList.remove('hidden');
            }
        }
    }
    
    /**
     * Sort table by field
     * @param {string} fieldId - Field ID to sort by
     */
    function sortTable(fieldId) {
        const project = projectManager.getProject(currentProjectId);
        if (!project) return;
        
        // Get current sort direction
        const th = document.querySelector(`th[data-field="${fieldId}"]`);
        let isAsc = !th.classList.contains('sorted-asc');
        
        // Remove sort classes from all headers
        document.querySelectorAll('th').forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
        });
        
        // Add sort class to current header
        th.classList.add(isAsc ? 'sorted-asc' : 'sorted-desc');
        
        // Sort entries
        const sortedEntries = [...project.entries].sort((a, b) => {
            const aValue = a[fieldId] || '';
            const bValue = b[fieldId] || '';
            
            if (aValue < bValue) return isAsc ? -1 : 1;
            if (aValue > bValue) return isAsc ? 1 : -1;
            return 0;
        });
        
        // Re-render table
        renderTable(sortedEntries);
    }
    
    /**
     * Set current project ID
     * @param {string} projectId - Current project ID
     */
    function setCurrentProject(projectId) {
        currentProjectId = projectId;
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Form submission
        const form = document.getElementById('entry-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEntryFromForm();
        });
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-btn');
        cancelBtn.addEventListener('click', hideEntryForm);
        
        // Close modal button
        const closeModalBtn = document.querySelector('.close-modal');
        closeModalBtn.addEventListener('click', hideEntryForm);
        
        // Close modal when clicking outside
        const modal = document.getElementById('entry-form-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideEntryForm();
            }
        });
    }
    
    // Initialize
    setupEventListeners();
    
    // Return public methods
    return {
        renderProjectSelector,
        renderTable,
        showEntryForm,
        updateTableRow,
        setCurrentProject
    };
}
