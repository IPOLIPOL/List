/**
 * Project Manager Module
 * Handles all project-related operations including localStorage access
 */
export function initProjectManager() {
    // Initialize project registry if it doesn't exist
    if (!localStorage.getItem('projectRegistry')) {
        localStorage.setItem('projectRegistry', JSON.stringify([]));
    }
    
    /**
     * Get list of all project IDs
     * @returns {Array} Array of project IDs
     */
    function getProjects() {
        return JSON.parse(localStorage.getItem('projectRegistry')) || [];
    }
    
    /**
     * Check if a project with given ID exists
     * @param {string} projectId - The project ID to check
     * @returns {boolean} True if project exists, false otherwise
     */
    function projectExists(projectId) {
        const registry = getProjects();
        return registry.includes(projectId);
    }
    
    /**
     * Get project data for a specific project
     * @param {string} projectId - The project ID to retrieve
     * @returns {Object|null} Project data or null if not found
     */
    function getProject(projectId) {
        if (!projectExists(projectId)) {
            return null;
        }
        
        const projectKey = `project_${projectId}`;
        return JSON.parse(localStorage.getItem(projectKey)) || null;
    }
    
    /**
     * Save project data to localStorage
     * @param {Object} projectData - The project data to save
     * @returns {boolean} True if save was successful
     */
    function saveProject(projectData) {
        try {
            const projectId = projectData.id;
            const projectKey = `project_${projectId}`;
            
            // Add to registry if it's a new project
            if (!projectExists(projectId)) {
                const registry = getProjects();
                registry.push(projectId);
                localStorage.setItem('projectRegistry', JSON.stringify(registry));
            }
            
            // Save the project data
            localStorage.setItem(projectKey, JSON.stringify(projectData));
            return true;
        } catch (error) {
            console.error('Error saving project:', error);
            return false;
        }
    }
    
    /**
     * Delete a project and remove it from registry
     * @param {string} projectId - The project ID to delete
     * @returns {boolean} True if deletion was successful
     */
    function deleteProject(projectId) {
        try {
            // Remove from registry
            const registry = getProjects();
            const updatedRegistry = registry.filter(id => id !== projectId);
            localStorage.setItem('projectRegistry', JSON.stringify(updatedRegistry));
            
            // Remove project data
            localStorage.removeItem(`project_${projectId}`);
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            return false;
        }
    }
    
    /**
     * Get project suggestions for autocomplete based on query
     * @param {string} query - The query string to search for
     * @returns {Array} Array of matching project IDs
     */
    function getProjectSuggestions(query) {
        const registry = getProjects();
        if (!query) return [];
        
        return registry.filter(projectId => 
            projectId.includes(query)
        ).slice(0, 5); // Limit to 5 suggestions
    }
    
    // Return public methods
    return {
        getProjects,
        getProject,
        saveProject,
        deleteProject,
        projectExists,
        getProjectSuggestions
    };
}
