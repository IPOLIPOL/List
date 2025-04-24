/**
 * Entry Manager Module
 * Handles CRUD operations for table entries
 */
import { initProjectManager } from './projectManager.js';

export function initEntryManager() {
    const projectManager = initProjectManager();
    
    /**
     * Generate a unique ID for a new entry
     * @returns {string} Unique entry ID
     */
    function generateEntryId() {
        return 'entry_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    
    /**
     * Add a new entry to a project
     * @param {string} projectId - The project ID
     * @param {Object} entryData - The entry data
     * @returns {Object|null} The added entry with ID or null if failed
     */
    function addEntry(projectId, entryData) {
        try {
            const project = projectManager.getProject(projectId);
            if (!project) return null;
            
            // Create new entry with ID and timestamp
            const newEntry = {
                id: generateEntryId(),
                timestamp: new Date().toISOString(),
                ...entryData
            };
            
            // Add to project entries
            project.entries.push(newEntry);
            
            // Save project
            projectManager.saveProject(project);
            
            return newEntry;
        } catch (error) {
            console.error('Error adding entry:', error);
            return null;
        }
    }
    
    /**
     * Update an existing entry
     * @param {string} projectId - The project ID
     * @param {string} entryId - The entry ID to update
     * @param {Object} entryData - The updated entry data
     * @returns {Object|null} The updated entry or null if failed
     */
    function updateEntry(projectId, entryId, entryData) {
        try {
            const project = projectManager.getProject(projectId);
            if (!project) return null;
            
            // Find entry index
            const entryIndex = project.entries.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) return null;
            
            // Update entry while preserving ID and timestamp
            const updatedEntry = {
                ...project.entries[entryIndex],
                ...entryData,
                id: entryId // Ensure ID doesn't change
            };
            
            // Replace in array
            project.entries[entryIndex] = updatedEntry;
            
            // Save project
            projectManager.saveProject(project);
            
            return updatedEntry;
        } catch (error) {
            console.error('Error updating entry:', error);
            return null;
        }
    }
    
    /**
     * Delete an entry from a project
     * @param {string} projectId - The project ID
     * @param {string} entryId - The entry ID to delete
     * @returns {boolean} True if deletion was successful
     */
    function deleteEntry(projectId, entryId) {
        try {
            const project = projectManager.getProject(projectId);
            if (!project) return false;
            
            // Filter out the entry to delete
            project.entries = project.entries.filter(entry => entry.id !== entryId);
            
            // Save project
            projectManager.saveProject(project);
            
            return true;
        } catch (error) {
            console.error('Error deleting entry:', error);
            return false;
        }
    }
    
    /**
     * Get a specific entry from a project
     * @param {string} projectId - The project ID
     * @param {string} entryId - The entry ID to get
     * @returns {Object|null} The entry or null if not found
     */
    function getEntry(projectId, entryId) {
        try {
            const project = projectManager.getProject(projectId);
            if (!project) return null;
            
            return project.entries.find(entry => entry.id === entryId) || null;
        } catch (error) {
            console.error('Error getting entry:', error);
            return null;
        }
    }
    
    /**
     * Validate entry data against required fields
     * @param {Object} entryData - The entry data to validate
     * @param {Array} fieldDefinitions - Field definitions with validation rules
     * @returns {boolean} True if valid, false otherwise
     */
    function validateEntry(entryData, fieldDefinitions) {
        // Check all required fields
        for (const field of fieldDefinitions) {
            if (field.required && (!entryData[field.id] || entryData[field.id].trim() === '')) {
                return false;
            }
        }
        return true;
    }
    
    // Return public methods
    return {
        addEntry,
        updateEntry,
        deleteEntry,
        getEntry,
        generateEntryId,
        validateEntry
    };
}
