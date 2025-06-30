// Main application controller with comprehensive project management
class C64DevPlatform {
    constructor() {
        this.currentScreen = 'dashboard';
        this.currentProject = null;
        this.unsavedFiles = new Set();
        this.fileCounter = 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('dashboard');
        this.updateProjectFooter();
        this.updateToolCardStates();
    }

    setupEventListeners() {
        // Tool card navigation with project check
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                if (this.canAccessTool(tool)) {
                    this.showScreen(tool);
                } else {
                    this.showProjectRequiredDialog(tool);
                }
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showScreen('dashboard');
            });
        });

        // Project management
        document.getElementById('new-project').addEventListener('click', () => {
            this.createNewProject();
        });

        document.getElementById('load-project').addEventListener('click', () => {
            document.getElementById('project-file-input').click();
        });

        document.getElementById('save-project').addEventListener('click', () => {
            this.saveProject();
        });

        document.getElementById('project-file-input').addEventListener('change', (e) => {
            this.loadProject(e.target.files[0]);
        });

        // Window/tab close detection
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        // Auto-save interval (every 30 seconds)
        setInterval(() => {
            this.autoSave();
        }, 30000);
    }

    canAccessTool(tool) {
        // Documentation is always accessible
        if (tool === 'documentation') {
            return true;
        }
        
        // Other tools require a project
        return this.currentProject !== null;
    }

    showProjectRequiredDialog(tool) {
        const toolNames = {
            'basic-editor': 'BASIC Editor',
            'sid-editor': 'SID Audio Editor',
            'sprite-editor': 'Sprite & Character Editor'
        };
        
        const toolName = toolNames[tool] || tool;
        
        // Create inline notification instead of popup
        this.showNotification(`A project is required to access the ${toolName}. Create a new project to continue.`, 'warning');
        
        // Highlight the new project button
        const newProjectBtn = document.getElementById('new-project');
        newProjectBtn.style.animation = 'pulse 1s ease-in-out 3';
        setTimeout(() => {
            newProjectBtn.style.animation = '';
        }, 3000);
    }

    updateToolCardStates() {
        document.querySelectorAll('.tool-card').forEach(card => {
            const tool = card.dataset.tool;
            
            if (!this.canAccessTool(tool)) {
                card.classList.add('disabled');
                card.style.opacity = '0.5';
                card.style.cursor = 'not-allowed';
            } else {
                card.classList.remove('disabled');
                card.style.opacity = '1';
                card.style.cursor = 'pointer';
            }
        });
    }

    showScreen(screenId) {
        // Check access before switching
        if (!this.canAccessTool(screenId)) {
            this.showProjectRequiredDialog(screenId);
            return;
        }

        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;

            // Initialize screen-specific functionality
            this.initializeScreen(screenId);
            
            // Update footer
            this.updateProjectFooter();
        }
    }

    initializeScreen(screenId) {
        switch (screenId) {
            case 'documentation':
                if (window.documentationManager) {
                    window.documentationManager.init();
                }
                break;
            case 'basic-editor':
                if (window.basicEditor) {
                    window.basicEditor.init();
                }
                break;
            case 'sid-editor':
                if (window.sidEditor) {
                    window.sidEditor.init();
                }
                break;
            case 'sprite-editor':
                if (window.spriteEditor) {
                    window.spriteEditor.init();
                }
                break;
        }
    }

    async createNewProject() {
        // Check for unsaved changes
        if (this.hasUnsavedChanges()) {
            const shouldSave = await this.showConfirmDialog('You have unsaved changes. Would you like to save the current project first?');
            if (shouldSave) {
                await this.saveProject();
            }
        }

        // Create inline input for project name
        const projectNameInput = document.createElement('input');
        projectNameInput.type = 'text';
        projectNameInput.value = 'My C64 Game';
        projectNameInput.className = 'inline-input project-name-input';
        projectNameInput.style.cssText = `
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 2px solid var(--accent);
            padding: 10px 15px;
            font-family: inherit;
            font-size: 16px;
            border-radius: 4px;
            margin-left: 15px;
            width: 250px;
            box-shadow: 0 0 10px rgba(255, 255, 0, 0.3);
        `;
        
        const createBtn = document.getElementById('new-project');
        const originalText = createBtn.textContent;
        createBtn.textContent = 'Enter project name:';
        createBtn.style.background = 'var(--accent)';
        createBtn.style.color = 'var(--c64-black)';
        createBtn.parentNode.insertBefore(projectNameInput, createBtn.nextSibling);
        
        projectNameInput.focus();
        projectNameInput.select();
        
        const finishCreation = () => {
            const projectName = projectNameInput.value.trim() || 'My C64 Game';
            projectNameInput.remove();
            createBtn.textContent = originalText;
            createBtn.style.background = '';
            createBtn.style.color = '';
            
            this.currentProject = {
                name: projectName,
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
            
            // Clear unsaved files tracking
            this.unsavedFiles.clear();
            this.fileCounter = 1;
            
            this.updateProjectDisplay();
            this.updateProjectFooter();
            this.updateToolCardStates();
            
            // Create default files
            this.createDefaultFiles();
            
            this.showNotification(`Project "${projectName}" created successfully!`, 'success');
        };
        
        const cancelCreation = () => {
            projectNameInput.remove();
            createBtn.textContent = originalText;
            createBtn.style.background = '';
            createBtn.style.color = '';
        };
        
        projectNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishCreation();
            } else if (e.key === 'Escape') {
                cancelCreation();
            }
        });
        
        projectNameInput.addEventListener('blur', finishCreation);
    }

    createDefaultFiles() {
        // Create default BASIC file
        const basicFile = {
            name: 'main.bas',
            content: '10 REM C64 GAME PROJECT\n20 REM CREATED WITH C64 DEV PLATFORM\n30 PRINT "HELLO, C64!"\n40 END',
            type: 'basic',
            created: new Date().toISOString(),
            isDefault: true
        };
        
        // Create default SID file
        const sidFile = {
            name: 'music.sid',
            pattern: this.createEmptyPattern(),
            voices: {
                1: { waveform: 'triangle', attack: 0, decay: 9, sustain: 0, release: 0 },
                2: { waveform: 'triangle', attack: 0, decay: 9, sustain: 0, release: 0 },
                3: { waveform: 'triangle', attack: 4, decay: 0, sustain: 8, release: 8 }
            },
            tempo: 120,
            type: 'sid',
            created: new Date().toISOString(),
            isDefault: true
        };
        
        // Create default sprite file
        const spriteFile = {
            name: 'sprites.spr',
            sprites: [new Array(24 * 21).fill(0)],
            characters: [new Array(8 * 8).fill(0)],
            palette: [
                '#000000', '#FFFFFF', '#68372B', '#70A4B2', '#6F3D86', '#588D43', 
                '#352879', '#B8C76F', '#6F4F25', '#433900', '#9A6759', '#444444', 
                '#6C6C6C', '#9AD284', '#6C5EB5', '#959595'
            ],
            type: 'sprite',
            created: new Date().toISOString(),
            isDefault: true
        };
        
        this.addFileToProject(basicFile);
        this.addFileToProject(sidFile);
        this.addFileToProject(spriteFile);
    }

    createEmptyPattern() {
        const pattern = [];
        for (let step = 0; step < 64; step++) {
            pattern.push({
                voice1: { note: '', octave: '', effect: '', param: '' },
                voice2: { note: '', octave: '', effect: '', param: '' },
                voice3: { note: '', octave: '', effect: '', param: '' }
            });
        }
        return pattern;
    }

    async saveProject() {
        if (!this.currentProject) {
            this.showNotification('No project to save. Create a new project first.', 'warning');
            return;
        }

        // Update modification time
        this.currentProject.modified = new Date().toISOString();
        
        // Collect current file states from editors
        this.collectCurrentFileStates();

        const projectData = JSON.stringify(this.currentProject, null, 2);
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProject.name}.c64proj`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Clear unsaved changes
        this.unsavedFiles.clear();
        this.updateProjectFooter();
        
        this.showNotification('Project saved successfully!');
    }

    collectCurrentFileStates() {
        // Collect from BASIC editor
        if (window.basicEditor && window.basicEditor.currentFile) {
            const content = document.getElementById('basic-code')?.value;
            if (content !== undefined) {
                window.basicEditor.currentFile.content = content;
                this.updateFileInProject(window.basicEditor.currentFile);
            }
        }
        
        // Collect from SID editor
        if (window.sidEditor && window.sidEditor.currentFile) {
            window.sidEditor.currentFile.pattern = window.sidEditor.pattern;
            window.sidEditor.currentFile.voices = { ...window.sidEditor.voices };
            window.sidEditor.currentFile.tempo = window.sidEditor.tempo;
            this.updateFileInProject(window.sidEditor.currentFile);
        }
        
        // Collect from Sprite editor
        if (window.spriteEditor && window.spriteEditor.currentFile) {
            if (window.spriteEditor.editMode === 'sprite') {
                window.spriteEditor.currentFile.sprites[0] = [...window.spriteEditor.spriteData];
            } else {
                window.spriteEditor.currentFile.characters[0] = [...window.spriteEditor.characterData];
            }
            this.updateFileInProject(window.spriteEditor.currentFile);
        }
    }

    async loadProject(file) {
        if (!file) return;

        // Check for unsaved changes
        if (this.hasUnsavedChanges()) {
            const shouldSave = await this.showConfirmDialog('You have unsaved changes. Would you like to save the current project first?');
            if (shouldSave) {
                await this.saveProject();
            }
        }

        try {
            const text = await file.text();
            this.currentProject = JSON.parse(text);
            
            // Clear unsaved files tracking
            this.unsavedFiles.clear();
            this.fileCounter = 1;
            
            this.updateProjectDisplay();
            this.updateProjectFooter();
            this.updateToolCardStates();
            
            this.showNotification('Project loaded successfully!');
        } catch (error) {
            this.showNotification('Error loading project file: ' + error.message, 'error');
        }
    }

    updateProjectDisplay() {
        const projectInfo = document.getElementById('current-project');
        const projectName = document.getElementById('project-name');
        
        if (this.currentProject) {
            projectInfo.style.display = 'block';
            projectName.textContent = this.currentProject.name;
            
            // Update file lists
            this.updateFileList('code-files', this.currentProject.files.code);
            this.updateFileList('audio-files', this.currentProject.files.audio);
            this.updateFileList('graphics-files', this.currentProject.files.graphics);
        } else {
            projectInfo.style.display = 'none';
        }
    }

    updateFileList(elementId, files) {
        const list = document.getElementById(elementId);
        list.innerHTML = '';
        
        files.forEach(file => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="file-name">${file.name}</span>
                ${this.unsavedFiles.has(file.name) ? '<span class="unsaved-indicator">●</span>' : ''}
            `;
            li.addEventListener('click', () => {
                this.openFile(file);
            });
            list.appendChild(li);
        });
        
        if (files.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No files';
            li.style.color = 'var(--text-primary)';
            li.style.fontStyle = 'italic';
            list.appendChild(li);
        }
    }

    openFile(file) {
        // Open appropriate editor based on file type
        switch (file.type) {
            case 'basic':
                this.showScreen('basic-editor');
                if (window.basicEditor) {
                    window.basicEditor.loadFileFromProject(file);
                }
                break;
            case 'sid':
                this.showScreen('sid-editor');
                if (window.sidEditor) {
                    window.sidEditor.loadFileFromProject(file);
                }
                break;
            case 'sprite':
                this.showScreen('sprite-editor');
                if (window.spriteEditor) {
                    window.spriteEditor.loadFileFromProject(file);
                }
                break;
        }
    }

    addFileToProject(file) {
        if (!this.currentProject) {
            this.createNewProject();
        }

        // Generate default name if needed
        if (!file.name || file.name.trim() === '') {
            file.name = this.generateDefaultFileName(file.type);
        }

        const category = this.getFileCategory(file.type);
        
        // Check for duplicate names
        const existingFile = this.currentProject.files[category].find(f => f.name === file.name);
        if (existingFile) {
            file.name = this.generateUniqueFileName(file.name, category);
        }
        
        this.currentProject.files[category].push(file);
        this.currentProject.modified = new Date().toISOString();
        this.updateProjectDisplay();
        this.updateProjectFooter();
        
        // Mark as unsaved if not a default file
        if (!file.isDefault) {
            this.markFileAsUnsaved(file.name);
        }
    }

    generateDefaultFileName(type) {
        const extensions = {
            'basic': '.bas',
            'sid': '.sid',
            'sprite': '.spr',
            'character': '.chr'
        };
        
        const baseName = type === 'basic' ? 'program' : 
                        type === 'sid' ? 'music' : 
                        type === 'sprite' ? 'sprites' : 'file';
        
        return `${baseName}${this.fileCounter++}${extensions[type] || '.dat'}`;
    }

    generateUniqueFileName(baseName, category) {
        let counter = 1;
        let newName = baseName;
        
        while (this.currentProject.files[category].find(f => f.name === newName)) {
            const parts = baseName.split('.');
            if (parts.length > 1) {
                const extension = parts.pop();
                const nameWithoutExt = parts.join('.');
                newName = `${nameWithoutExt}_${counter}.${extension}`;
            } else {
                newName = `${baseName}_${counter}`;
            }
            counter++;
        }
        
        return newName;
    }

    updateFileInProject(file) {
        if (!this.currentProject || !file) return;
        
        const category = this.getFileCategory(file.type);
        const index = this.currentProject.files[category].findIndex(f => f.name === file.name);
        
        if (index !== -1) {
            this.currentProject.files[category][index] = file;
            this.currentProject.modified = new Date().toISOString();
            this.markFileAsUnsaved(file.name);
            this.updateProjectDisplay();
            this.updateProjectFooter();
        }
    }

    getFileCategory(fileType) {
        switch (fileType) {
            case 'basic':
            case 'assembly':
                return 'code';
            case 'sid':
                return 'audio';
            case 'sprite':
            case 'character':
                return 'graphics';
            default:
                return 'code';
        }
    }

    markFileAsUnsaved(fileName) {
        this.unsavedFiles.add(fileName);
        this.updateProjectDisplay();
        this.updateProjectFooter();
    }

    markFileAsSaved(fileName) {
        this.unsavedFiles.delete(fileName);
        this.updateProjectDisplay();
        this.updateProjectFooter();
    }

    hasUnsavedChanges() {
        return this.unsavedFiles.size > 0;
    }

    updateProjectFooter() {
        // Remove existing footer
        const existingFooter = document.querySelector('.project-footer');
        if (existingFooter) {
            existingFooter.remove();
        }
        
        // Create new footer
        const footer = document.createElement('div');
        footer.className = 'project-footer';
        
        if (this.currentProject) {
            const unsavedCount = this.unsavedFiles.size;
            const totalFiles = this.getTotalFileCount();
            
            footer.innerHTML = `
                <div class="project-info">
                    <span class="project-name">📁 ${this.currentProject.name}</span>
                    <span class="file-count">${totalFiles} files</span>
                    ${unsavedCount > 0 ? `<span class="unsaved-count">● ${unsavedCount} unsaved</span>` : '<span class="saved-status">✓ All saved</span>'}
                </div>
                <div class="project-actions">
                    <button class="footer-btn" onclick="window.c64Platform.saveProject()">Save Project</button>
                    <button class="footer-btn" onclick="window.c64Platform.showProjectSettings()">Settings</button>
                </div>
            `;
        } else {
            footer.innerHTML = `
                <div class="project-info">
                    <span class="no-project">No project loaded - Create or load a project to access editors</span>
                </div>
                <div class="project-actions">
                    <button class="footer-btn" onclick="window.c64Platform.createNewProject()">New Project</button>
                    <button class="footer-btn" onclick="document.getElementById('project-file-input').click()">Load Project</button>
                </div>
            `;
        }
        
        document.body.appendChild(footer);
    }

    getTotalFileCount() {
        if (!this.currentProject) return 0;
        
        return this.currentProject.files.code.length + 
               this.currentProject.files.audio.length + 
               this.currentProject.files.graphics.length;
    }

    showProjectSettings() {
        if (!this.currentProject) return;
        
        // Create inline input for project settings
        const settingsInput = document.createElement('input');
        settingsInput.type = 'text';
        settingsInput.value = this.currentProject.name;
        settingsInput.className = 'inline-input settings-input';
        settingsInput.style.cssText = `
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 2px solid var(--accent);
            padding: 8px 12px;
            font-family: inherit;
            font-size: 14px;
            border-radius: 4px;
            margin-left: 10px;
            width: 200px;
        `;
        
        const settingsBtn = document.querySelector('.footer-btn[onclick*="showProjectSettings"]');
        const originalText = settingsBtn.textContent;
        settingsBtn.textContent = 'Project name:';
        settingsBtn.parentNode.insertBefore(settingsInput, settingsBtn.nextSibling);
        
        settingsInput.focus();
        settingsInput.select();
        
        const finishSettings = () => {
            const newName = settingsInput.value.trim();
            settingsInput.remove();
            settingsBtn.textContent = originalText;
            
            if (newName && newName !== this.currentProject.name) {
                this.currentProject.name = newName;
                this.currentProject.modified = new Date().toISOString();
                this.updateProjectDisplay();
                this.updateProjectFooter();
                this.markFileAsUnsaved('project-settings');
                this.showNotification(`Project renamed to "${newName}"`, 'success');
            }
        };
        
        settingsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishSettings();
            } else if (e.key === 'Escape') {
                settingsInput.remove();
                settingsBtn.textContent = originalText;
            }
        });
        
        settingsInput.addEventListener('blur', finishSettings);
    }

    autoSave() {
        if (this.currentProject && this.hasUnsavedChanges()) {
            // Auto-save to localStorage
            const autoSaveKey = `c64-autosave-${this.currentProject.name}`;
            this.collectCurrentFileStates();
            localStorage.setItem(autoSaveKey, JSON.stringify(this.currentProject));
            console.log('Auto-saved project to localStorage');
        }
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Helper method for confirmation dialogs using notifications instead of popups
    async showConfirmDialog(message) {
        return new Promise((resolve) => {
            // Create a custom confirmation notification
            const confirmDiv = document.createElement('div');
            confirmDiv.className = 'confirmation-dialog';
            confirmDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-secondary);
                border: 2px solid var(--accent);
                padding: 20px;
                border-radius: 8px;
                z-index: 3000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                max-width: 400px;
                text-align: center;
            `;
            
            confirmDiv.innerHTML = `
                <p style="color: var(--text-secondary); margin-bottom: 20px; line-height: 1.4;">${message}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="confirm-yes" class="btn primary">Yes</button>
                    <button id="confirm-no" class="btn secondary">No</button>
                </div>
            `;
            
            document.body.appendChild(confirmDiv);
            
            const yesBtn = confirmDiv.querySelector('#confirm-yes');
            const noBtn = confirmDiv.querySelector('#confirm-no');
            
            const cleanup = () => {
                confirmDiv.remove();
            };
            
            yesBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });
            
            noBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
            
            // Auto-close after 10 seconds with "No" as default
            setTimeout(() => {
                if (document.body.contains(confirmDiv)) {
                    cleanup();
                    resolve(false);
                }
            }, 10000);
        });
    }

    // Method to be called by editors when files are modified
    onFileModified(fileName) {
        this.markFileAsUnsaved(fileName);
    }

    // Method to be called by editors when files are saved
    onFileSaved(fileName) {
        this.markFileAsSaved(fileName);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.c64Platform = new C64DevPlatform();
});