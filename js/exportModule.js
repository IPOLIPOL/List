/**
 * Export Module
 * Handles exporting table data to different formats
 */
import { initProjectManager } from './projectManager.js';
import { initFilterSortEngine } from './filterSortEngine.js';

export function initExportModule() {
    const projectManager = initProjectManager();
    
    /**
     * Export project data to CSV format
     * @param {string} projectId - The project ID to export
     */
    function exportToCSV(projectId) {
        try {
            // Get filter/sort engine to get currently displayed entries
            const filterSortEngine = initFilterSortEngine(window.appConfig);
            const entries = filterSortEngine.getProcessedEntries(projectId);
            
            if (!entries || entries.length === 0) {
                alert('No data to export');
                return;
            }
            
            // Get field definitions from app config
            const fields = window.appConfig.fields;
            
            // Create CSV header row
            const headers = ['ID', ...fields.map(field => field.label)];
            let csvContent = headers.join(',') + '\n';
            
            // Add data rows
            entries.forEach(entry => {
                const row = [
                    entry.id,
                    ...fields.map(field => {
                        // Format value based on field type
                        let value = entry[field.id] || '';
                        
                        // Handle dropdown fields - convert value to label
                        if (field.type === 'dropdown' && field.options) {
                            const option = field.options.find(opt => opt.value === value);
                            if (option) {
                                value = option.label;
                            }
                        }
                        
                        // Escape commas, quotes, and newlines for CSV
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                            value = `"${value.replace(/"/g, '""')}"`;
                        }
                        
                        return value;
                    })
                ];
                
                csvContent += row.join(',') + '\n';
            });
            
            // Download CSV file
            downloadFile(csvContent, `project_${projectId}.csv`, 'text/csv');
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            alert('Failed to export data');
        }
    }
    
    /**
     * Export project data to JSON format
     * @param {string} projectId - The project ID to export
     */
    function exportToJSON(projectId) {
        try {
            // Get filter/sort engine to get currently displayed entries
            const filterSortEngine = initFilterSortEngine(window.appConfig);
            const entries = filterSortEngine.getProcessedEntries(projectId);
            
            if (!entries || entries.length === 0) {
                alert('No data to export');
                return;
            }
            
            // Create JSON structure
            const exportData = {
                projectId,
                exportDate: new Date().toISOString(),
                entries
            };
            
            // Convert to JSON string with pretty formatting
            const jsonContent = JSON.stringify(exportData, null, 2);
            
            // Download JSON file
            downloadFile(jsonContent, `project_${projectId}.json`, 'application/json');
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            alert('Failed to export data');
        }
    }
    
    /**
     * Trigger file download
     * @param {string} content - File content
     * @param {string} filename - Output filename
     * @param {string} contentType - MIME type
     */
    function downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    // Return public methods
    return {
        exportToCSV,
        exportToJSON
    };
}
