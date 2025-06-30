// Project management functionality
class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
        this.currentProject = null;
    }

    loadProjects() {
        const stored = localStorage.getItem('c64-projects');
        return stored ? JSON.parse(stored) : [];
    }

    saveProjects() {
        localStorage.setItem('c64-projects', JSON.stringify(this.projects));
    }

    createProject(name) {
        const project = {
            id: Date.now().toString(),
            name: name,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            files: {
                code: [],
                audio: [],
                graphics: []
            },
            settings: {
                targetSystem: 'c64',
                memoryModel: 'standard'
            }
        };

        this.projects.push(project);
        this.saveProjects();
        this.currentProject = project;
        return project;
    }

    deleteProject(projectId) {
        this.projects = this.projects.filter(p => p.id !== projectId);
        this.saveProjects();
        
        if (this.currentProject && this.currentProject.id === projectId) {
            this.currentProject = null;
        }
    }

    getProject(projectId) {
        return this.projects.find(p => p.id === projectId);
    }

    updateProject(project) {
        const index = this.projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            project.modified = new Date().toISOString();
            this.projects[index] = project;
            this.saveProjects();
        }
    }

    addFileToProject(projectId, file) {
        const project = this.getProject(projectId);
        if (project) {
            const category = this.getFileCategory(file.type);
            project.files[category].push(file);
            this.updateProject(project);
        }
    }

    removeFileFromProject(projectId, fileName, category) {
        const project = this.getProject(projectId);
        if (project) {
            project.files[category] = project.files[category].filter(f => f.name !== fileName);
            this.updateProject(project);
        }
    }

    getFileCategory(fileType) {
        const categories = {
            'basic': 'code',
            'assembly': 'code',
            'asm': 'code',
            'sid': 'audio',
            'music': 'audio',
            'sprite': 'graphics',
            'character': 'graphics',
            'charset': 'graphics'
        };
        return categories[fileType] || 'code';
    }

    exportProject(projectId) {
        const project = this.getProject(projectId);
        if (project) {
            const exportData = {
                ...project,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name}.c64proj`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    async importProject(file) {
        try {
            const text = await file.text();
            const projectData = JSON.parse(text);
            
            // Validate project structure
            if (!projectData.name || !projectData.files) {
                throw new Error('Invalid project file format');
            }

            // Generate new ID to avoid conflicts
            projectData.id = Date.now().toString();
            projectData.imported = new Date().toISOString();

            this.projects.push(projectData);
            this.saveProjects();
            this.currentProject = projectData;
            
            return projectData;
        } catch (error) {
            throw new Error('Failed to import project: ' + error.message);
        }
    }

    searchProjects(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.projects.filter(project => 
            project.name.toLowerCase().includes(lowercaseQuery) ||
            project.files.code.some(file => file.name.toLowerCase().includes(lowercaseQuery)) ||
            project.files.audio.some(file => file.name.toLowerCase().includes(lowercaseQuery)) ||
            project.files.graphics.some(file => file.name.toLowerCase().includes(lowercaseQuery))
        );
    }

    getRecentProjects(limit = 5) {
        return this.projects
            .sort((a, b) => new Date(b.modified) - new Date(a.modified))
            .slice(0, limit);
    }

    getProjectStats(projectId) {
        const project = this.getProject(projectId);
        if (!project) return null;

        return {
            totalFiles: project.files.code.length + project.files.audio.length + project.files.graphics.length,
            codeFiles: project.files.code.length,
            audioFiles: project.files.audio.length,
            graphicsFiles: project.files.graphics.length,
            created: project.created,
            modified: project.modified,
            size: JSON.stringify(project).length
        };
    }
}

// Initialize project manager
window.projectManager = new ProjectManager();