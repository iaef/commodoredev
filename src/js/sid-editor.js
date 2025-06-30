// SID Audio Editor - Inline tracker-style interface with Web Audio API
class SIDEditor {
    constructor() {
        this.currentFile = null;
        this.files = [];
        this.isPlaying = false;
        this.isRecording = false;
        this.recordedNotes = [];
        this.recordStartTime = null;
        this.currentStep = 0;
        this.tempo = 120;
        this.pattern = this.createEmptyPattern();
        this.voices = {
            1: { waveform: 'triangle', attack: 0, decay: 9, sustain: 0, release: 0 },
            2: { waveform: 'triangle', attack: 0, decay: 9, sustain: 0, release: 0 },
            3: { waveform: 'triangle', attack: 4, decay: 0, sustain: 8, release: 8 }
        };
        this.notes = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];
        this.frequencies = this.generateFrequencyTable();
        this.selectedCell = { step: 0, voice: 1, column: 'note' };
        this.editMode = false;
        
        // Web Audio API setup
        this.audioContext = null;
        this.masterGain = null;
        this.voiceOscillators = { 1: null, 2: null, 3: null };
        this.voiceGains = { 1: null, 2: null, 3: null };
        this.voiceFilters = { 1: null, 2: null, 3: null };
        this.isAudioInitialized = false;
        
        // Recording setup
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordingStream = null;
        this.recordingDestination = null;
    }

    async init() {
        this.setupEventListeners();
        this.updateFileList();
        this.createPatternGrid();
        this.updateVoiceControls();
        this.focusCell(0, 1, 'note');
        await this.initializeAudio();
    }

    async initializeAudio() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            this.masterGain.connect(this.audioContext.destination);
            
            // Initialize voice chains
            for (let voice = 1; voice <= 3; voice++) {
                this.voiceGains[voice] = this.audioContext.createGain();
                this.voiceGains[voice].gain.setValueAtTime(0, this.audioContext.currentTime);
                
                this.voiceFilters[voice] = this.audioContext.createBiquadFilter();
                this.voiceFilters[voice].type = 'lowpass';
                this.voiceFilters[voice].frequency.setValueAtTime(2000, this.audioContext.currentTime);
                this.voiceFilters[voice].Q.setValueAtTime(1, this.audioContext.currentTime);
                
                // Connect: oscillator -> gain -> filter -> master
                this.voiceGains[voice].connect(this.voiceFilters[voice]);
                this.voiceFilters[voice].connect(this.masterGain);
            }
            
            this.isAudioInitialized = true;
            console.log('Web Audio API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Web Audio API:', error);
            this.isAudioInitialized = false;
        }
    }

    setupEventListeners() {
        // File management
        document.getElementById('new-sid-file').addEventListener('click', () => {
            this.createNewFile();
        });

        document.getElementById('load-sid-file').addEventListener('click', () => {
            this.loadFile();
        });

        document.getElementById('save-sid-file').addEventListener('click', () => {
            this.saveFile();
        });

        document.getElementById('sid-file-select').addEventListener('change', (e) => {
            this.switchFile(e.target.value);
        });

        // Playback controls
        document.getElementById('play-sid').addEventListener('click', async () => {
            await this.ensureAudioContext();
            this.togglePlayback();
        });

        document.getElementById('stop-sid').addEventListener('click', () => {
            this.stopPlayback();
        });

        document.getElementById('record-sid').addEventListener('click', async () => {
            await this.ensureAudioContext();
            this.toggleRecording();
        });

        // Tempo control
        document.getElementById('tempo').addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            document.getElementById('tempo-value').textContent = this.tempo;
        });

        // Voice controls
        document.querySelectorAll('.voice-panel').forEach(panel => {
            const voiceNum = panel.dataset.voice;
            
            panel.querySelector('.waveform-select').addEventListener('change', (e) => {
                this.voices[voiceNum].waveform = e.target.value;
                this.updateSIDRegisters();
            });

            ['attack', 'decay', 'sustain', 'release'].forEach(param => {
                const control = panel.querySelector(`.${param}`);
                if (control) {
                    control.addEventListener('input', (e) => {
                        this.voices[voiceNum][param] = parseInt(e.target.value);
                        this.updateSIDRegisters();
                    });
                }
            });
        });

        // Global keyboard handler for tracker navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('sid-editor').classList.contains('active')) {
                this.handleGlobalKeyDown(e);
            }
        });
    }

    async ensureAudioContext() {
        if (!this.isAudioInitialized) {
            await this.initializeAudio();
        }
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    createNewFile() {
        // Create inline input for file name
        const fileNameInput = document.createElement('input');
        fileNameInput.type = 'text';
        fileNameInput.value = 'song.sid';
        fileNameInput.className = 'inline-input';
        fileNameInput.style.cssText = `
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            padding: 5px 10px;
            font-family: inherit;
            border-radius: 4px;
            margin-left: 10px;
        `;
        
        const createBtn = document.getElementById('new-sid-file');
        const originalText = createBtn.textContent;
        createBtn.textContent = 'Enter name:';
        createBtn.parentNode.insertBefore(fileNameInput, createBtn.nextSibling);
        
        fileNameInput.focus();
        fileNameInput.select();
        
        const finishCreation = () => {
            const fileName = fileNameInput.value.trim() || 'song.sid';
            fileNameInput.remove();
            createBtn.textContent = originalText;
            
            const file = {
                name: fileName,
                pattern: this.createEmptyPattern(),
                voices: { ...this.voices },
                tempo: this.tempo,
                type: 'sid',
                created: new Date().toISOString()
            };
            this.files.push(file);
            this.currentFile = file;
            this.updateFileList();
            this.loadFileContent();
            
            // Add to project if available
            if (window.c64Platform && window.c64Platform.currentProject) {
                window.c64Platform.addFileToProject(file);
            }
        };
        
        fileNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishCreation();
            } else if (e.key === 'Escape') {
                fileNameInput.remove();
                createBtn.textContent = originalText;
            }
        });
        
        fileNameInput.addEventListener('blur', finishCreation);
    }

    loadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.sid,.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const content = await file.text();
                    const sidData = JSON.parse(content);
                    const sidFile = {
                        name: file.name,
                        pattern: sidData.pattern || this.createEmptyPattern(),
                        voices: sidData.voices || { ...this.voices },
                        tempo: sidData.tempo || 120,
                        type: 'sid',
                        created: new Date().toISOString()
                    };
                    this.files.push(sidFile);
                    this.currentFile = sidFile;
                    this.updateFileList();
                    this.loadFileContent();
                } catch (error) {
                    if (window.c64Platform) {
                        window.c64Platform.showNotification('Error loading SID file: ' + error.message, 'error');
                    }
                }
            }
        };
        input.click();
    }

    saveFile() {
        if (!this.currentFile) {
            if (window.c64Platform) {
                window.c64Platform.showNotification('No file to save', 'warning');
            }
            return;
        }

        this.currentFile.pattern = this.pattern;
        this.currentFile.voices = { ...this.voices };
        this.currentFile.tempo = this.tempo;
        
        const sidData = {
            pattern: this.currentFile.pattern,
            voices: this.currentFile.voices,
            tempo: this.currentFile.tempo,
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(sidData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    switchFile(fileName) {
        const file = this.files.find(f => f.name === fileName);
        if (file) {
            this.currentFile = file;
            this.loadFileContent();
        }
    }

    updateFileList() {
        const select = document.getElementById('sid-file-select');
        select.innerHTML = '<option value="">Select file...</option>';
        
        this.files.forEach(file => {
            const option = document.createElement('option');
            option.value = file.name;
            option.textContent = file.name;
            if (this.currentFile && file.name === this.currentFile.name) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    loadFileContent() {
        if (this.currentFile) {
            this.pattern = this.currentFile.pattern || this.createEmptyPattern();
            this.voices = { ...this.currentFile.voices } || { ...this.voices };
            this.tempo = this.currentFile.tempo || 120;
            
            document.getElementById('tempo').value = this.tempo;
            document.getElementById('tempo-value').textContent = this.tempo;
            
            this.updateVoiceControls();
            this.updatePatternGrid();
        }
    }

    // Method to be called from project system
    loadFileFromProject(file) {
        this.currentFile = file;
        this.loadFileContent();
        
        // Add to local files list if not already there
        if (!this.files.find(f => f.name === file.name)) {
            this.files.push(file);
            this.updateFileList();
        }
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

    createPatternGrid() {
        const grid = document.getElementById('pattern-grid');
        grid.innerHTML = '';
        
        for (let step = 0; step < 64; step++) {
            const row = document.createElement('div');
            row.className = 'pattern-row';
            row.dataset.step = step;
            
            // Step number
            const stepCell = document.createElement('div');
            stepCell.className = 'step-number';
            stepCell.textContent = step.toString().padStart(2, '0');
            row.appendChild(stepCell);
            
            // Voice cells
            for (let voice = 1; voice <= 3; voice++) {
                const voiceContainer = document.createElement('div');
                voiceContainer.className = 'voice-container';
                
                // Note cell
                const noteCell = document.createElement('input');
                noteCell.className = 'note-cell';
                noteCell.type = 'text';
                noteCell.maxLength = 2;
                noteCell.placeholder = '--';
                noteCell.dataset.step = step;
                noteCell.dataset.voice = voice;
                noteCell.dataset.column = 'note';
                this.setupCellEvents(noteCell);
                
                // Octave cell
                const octaveCell = document.createElement('input');
                octaveCell.className = 'octave-cell';
                octaveCell.type = 'text';
                octaveCell.maxLength = 1;
                octaveCell.placeholder = '-';
                octaveCell.dataset.step = step;
                octaveCell.dataset.voice = voice;
                octaveCell.dataset.column = 'octave';
                this.setupCellEvents(octaveCell);
                
                // Effect cell
                const effectCell = document.createElement('input');
                effectCell.className = 'effect-cell';
                effectCell.type = 'text';
                effectCell.maxLength = 1;
                effectCell.placeholder = '-';
                effectCell.dataset.step = step;
                effectCell.dataset.voice = voice;
                effectCell.dataset.column = 'effect';
                this.setupCellEvents(effectCell);
                
                // Parameter cell
                const paramCell = document.createElement('input');
                paramCell.className = 'param-cell';
                paramCell.type = 'text';
                paramCell.maxLength = 2;
                paramCell.placeholder = '--';
                paramCell.dataset.step = step;
                paramCell.dataset.voice = voice;
                paramCell.dataset.column = 'param';
                this.setupCellEvents(paramCell);
                
                voiceContainer.appendChild(noteCell);
                voiceContainer.appendChild(octaveCell);
                voiceContainer.appendChild(effectCell);
                voiceContainer.appendChild(paramCell);
                row.appendChild(voiceContainer);
            }
            
            grid.appendChild(row);
        }
        
        this.updatePatternGrid();
    }

    setupCellEvents(cell) {
        cell.addEventListener('focus', (e) => {
            this.selectedCell = {
                step: parseInt(e.target.dataset.step),
                voice: parseInt(e.target.dataset.voice),
                column: e.target.dataset.column
            };
            this.updateCellHighlight();
        });

        cell.addEventListener('input', (e) => {
            this.updatePatternData(e.target);
            
            // Mark file as modified
            if (window.c64Platform && this.currentFile) {
                window.c64Platform.onFileModified(this.currentFile.name);
            }
        });

        cell.addEventListener('keydown', (e) => {
            this.handleCellKeyDown(e);
        });

        // Prevent default behavior for certain keys to ensure proper navigation
        cell.addEventListener('keypress', (e) => {
            const column = e.target.dataset.column;
            
            // For octave column, only allow numbers 1-8
            if (column === 'octave') {
                const char = String.fromCharCode(e.which);
                if (!/[1-8]/.test(char)) {
                    e.preventDefault();
                }
            }
            
            // For effect column, only allow A-Z and 0-9
            if (column === 'effect') {
                const char = String.fromCharCode(e.which).toUpperCase();
                if (!/[A-Z0-9]/.test(char)) {
                    e.preventDefault();
                }
            }
            
            // For param column, only allow hex characters
            if (column === 'param') {
                const char = String.fromCharCode(e.which).toUpperCase();
                if (!/[0-9A-F]/.test(char)) {
                    e.preventDefault();
                }
            }
        });
    }

    updatePatternData(cell) {
        const step = parseInt(cell.dataset.step);
        const voice = parseInt(cell.dataset.voice);
        const column = cell.dataset.column;
        const voiceKey = `voice${voice}`;
        
        let value = cell.value.toUpperCase();
        
        // Validate input based on column type
        if (column === 'note') {
            if (value && !this.notes.includes(value)) {
                // Try to match partial input
                const match = this.notes.find(note => note.startsWith(value));
                if (match && value.length < 2) {
                    // Don't auto-complete yet, let user finish typing
                    value = value;
                } else if (match) {
                    value = match;
                    cell.value = value;
                } else {
                    // Invalid note, clear it
                    value = '';
                    cell.value = '';
                }
            }
        } else if (column === 'octave') {
            if (value && (isNaN(value) || parseInt(value) < 1 || parseInt(value) > 8)) {
                value = '';
                cell.value = '';
            }
        } else if (column === 'effect') {
            // Effect codes: A-Z, 0-9
            if (value && !/^[A-Z0-9]$/.test(value)) {
                value = value.replace(/[^A-Z0-9]/g, '').substring(0, 1);
                cell.value = value;
            }
        } else if (column === 'param') {
            // Parameter: 00-FF (hex)
            if (value && !/^[0-9A-F]{0,2}$/.test(value)) {
                value = value.replace(/[^0-9A-F]/g, '').substring(0, 2);
                cell.value = value;
            }
        }
        
        this.pattern[step][voiceKey][column] = value;
        
        // If recording, capture this input
        if (this.isRecording && column === 'note' && value) {
            this.recordNote(step, voice, value, cell.parentNode.querySelector('.octave-cell').value);
        }
    }

    handleGlobalKeyDown(e) {
        // Only handle global keys when not focused on an input
        if (e.target.tagName === 'INPUT') {
            return;
        }
        
        e.preventDefault();
        
        switch (e.key) {
            case 'ArrowUp':
                this.moveSelection(0, -1);
                break;
            case 'ArrowDown':
                this.moveSelection(0, 1);
                break;
            case 'ArrowLeft':
                this.moveSelection(-1, 0);
                break;
            case 'ArrowRight':
                this.moveSelection(1, 0);
                break;
            case 'Tab':
                this.moveSelection(e.shiftKey ? -1 : 1, 0);
                break;
            case 'Enter':
                this.moveSelection(0, 1);
                break;
            case 'Delete':
            case 'Backspace':
                this.clearCurrentCell();
                break;
            case ' ':
                this.togglePlayback();
                break;
            case 'Escape':
                this.stopPlayback();
                break;
        }
    }

    handleCellKeyDown(e) {
        const cell = e.target;
        const column = cell.dataset.column;
        
        // Handle special keys for quick note entry
        if (column === 'note') {
            // Piano keyboard mapping
            const keyToNote = {
                'z': 'C-', 's': 'C#', 'x': 'D-', 'd': 'D#', 'c': 'E-', 'v': 'F-',
                'g': 'F#', 'b': 'G-', 'h': 'G#', 'n': 'A-', 'j': 'A#', 'm': 'B-',
                'q': 'C-', '2': 'C#', 'w': 'D-', '3': 'D#', 'e': 'E-', 'r': 'F-',
                '5': 'F#', 't': 'G-', '6': 'G#', 'y': 'A-', '7': 'A#', 'u': 'B-'
            };
            
            if (keyToNote[e.key.toLowerCase()]) {
                e.preventDefault();
                cell.value = keyToNote[e.key.toLowerCase()];
                this.updatePatternData(cell);
                
                // Auto-advance to octave
                this.moveSelection(1, 0);
                return;
            }
        }
        
        // Handle navigation within cells
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.moveSelection(0, -1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.moveSelection(0, 1);
                break;
            case 'Tab':
                e.preventDefault();
                this.moveSelection(e.shiftKey ? -1 : 1, 0);
                break;
            case 'Enter':
                e.preventDefault();
                this.moveSelection(0, 1);
                break;
            case 'Delete':
            case 'Backspace':
                // Allow normal backspace behavior but also handle clearing
                if (cell.value === '' || cell.selectionStart === 0) {
                    e.preventDefault();
                    this.clearCurrentCell();
                }
                break;
        }
    }

    moveSelection(deltaColumn, deltaRow) {
        const columns = ['note', 'octave', 'effect', 'param'];
        const currentColumnIndex = columns.indexOf(this.selectedCell.column);
        
        // Calculate new position
        let newStep = this.selectedCell.step + deltaRow;
        let newColumnIndex = currentColumnIndex + deltaColumn;
        let newVoice = this.selectedCell.voice;
        
        // Handle column overflow/underflow
        if (newColumnIndex >= columns.length) {
            newColumnIndex = 0;
            newVoice = Math.min(3, newVoice + 1);
        } else if (newColumnIndex < 0) {
            newColumnIndex = columns.length - 1;
            newVoice = Math.max(1, newVoice - 1);
        }
        
        // Handle voice overflow/underflow
        if (newVoice > 3) {
            newVoice = 1;
            newStep++;
        } else if (newVoice < 1) {
            newVoice = 3;
            newStep--;
        }
        
        // Clamp step to valid range
        newStep = Math.max(0, Math.min(63, newStep));
        
        this.focusCell(newStep, newVoice, columns[newColumnIndex]);
    }

    focusCell(step, voice, column) {
        this.selectedCell = { step, voice, column };
        
        const cell = document.querySelector(
            `[data-step="${step}"][data-voice="${voice}"][data-column="${column}"]`
        );
        
        if (cell) {
            cell.focus();
            cell.select();
            this.updateCellHighlight();
            this.scrollToCell(cell);
        }
    }

    scrollToCell(cell) {
        const grid = document.getElementById('pattern-grid');
        const cellRect = cell.getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();
        
        if (cellRect.top < gridRect.top || cellRect.bottom > gridRect.bottom) {
            cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateCellHighlight() {
        // Remove previous highlights
        document.querySelectorAll('.pattern-row').forEach(row => {
            row.classList.remove('current-row');
        });
        
        document.querySelectorAll('.voice-container').forEach(container => {
            container.classList.remove('current-voice');
        });
        
        // Add current highlights
        const currentRow = document.querySelector(`[data-step="${this.selectedCell.step}"]`);
        if (currentRow) {
            currentRow.classList.add('current-row');
        }
        
        const currentVoiceContainers = document.querySelectorAll(
            `[data-step] .voice-container:nth-child(${this.selectedCell.voice + 1})`
        );
        currentVoiceContainers.forEach(container => {
            container.classList.add('current-voice');
        });
    }

    clearCurrentCell() {
        const cell = document.querySelector(
            `[data-step="${this.selectedCell.step}"][data-voice="${this.selectedCell.voice}"][data-column="${this.selectedCell.column}"]`
        );
        
        if (cell) {
            cell.value = '';
            this.updatePatternData(cell);
        }
    }

    updatePatternGrid() {
        for (let step = 0; step < 64; step++) {
            for (let voice = 1; voice <= 3; voice++) {
                const voiceKey = `voice${voice}`;
                const data = this.pattern[step][voiceKey];
                
                ['note', 'octave', 'effect', 'param'].forEach(column => {
                    const cell = document.querySelector(
                        `[data-step="${step}"][data-voice="${voice}"][data-column="${column}"]`
                    );
                    if (cell) {
                        cell.value = data[column] || '';
                    }
                });
            }
        }
        
        this.updatePlaybackHighlight();
    }

    updatePlaybackHighlight() {
        // Remove previous playback highlights
        document.querySelectorAll('.pattern-row').forEach(row => {
            row.classList.remove('playing');
        });
        
        // Add current playback highlight
        if (this.isPlaying) {
            const playingRow = document.querySelector(`[data-step="${this.currentStep}"]`);
            if (playingRow) {
                playingRow.classList.add('playing');
            }
        }
    }

    updateVoiceControls() {
        document.querySelectorAll('.voice-panel').forEach(panel => {
            const voiceNum = panel.dataset.voice;
            const voice = this.voices[voiceNum];
            
            panel.querySelector('.waveform-select').value = voice.waveform;
            panel.querySelector('.attack').value = voice.attack;
            panel.querySelector('.decay').value = voice.decay;
            panel.querySelector('.sustain').value = voice.sustain;
            panel.querySelector('.release').value = voice.release;
        });
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.stopPlayback();
        } else {
            this.startPlayback();
        }
    }

    startPlayback() {
        if (!this.isAudioInitialized) {
            console.warn('Audio not initialized');
            return;
        }
        
        this.isPlaying = true;
        this.currentStep = 0;
        document.getElementById('play-sid').textContent = '⏸ Pause';
        
        const stepDuration = (60 / this.tempo / 4) * 1000; // 16th notes
        
        this.playbackInterval = setInterval(() => {
            this.playStep(this.currentStep);
            this.updatePlaybackHighlight();
            
            this.currentStep++;
            if (this.currentStep >= this.pattern.length) {
                this.currentStep = 0;
            }
        }, stepDuration);
    }

    stopPlayback() {
        this.isPlaying = false;
        this.currentStep = 0;
        document.getElementById('play-sid').textContent = '▶ Play';
        
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
        
        this.updatePlaybackHighlight();
        this.stopAllVoices();
    }

    async toggleRecording() {
        if (this.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            // Start audio recording
            if (this.audioContext && this.masterGain) {
                // Create a MediaStreamDestination to capture audio
                this.recordingDestination = this.audioContext.createMediaStreamDestination();
                this.masterGain.connect(this.recordingDestination);
                this.recordingStream = this.recordingDestination.stream;
                
                // Set up MediaRecorder
                this.mediaRecorder = new MediaRecorder(this.recordingStream);
                this.recordedChunks = [];
                
                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.recordedChunks.push(event.data);
                    }
                };
                
                this.mediaRecorder.onstop = () => {
                    this.saveRecording();
                };
                
                this.mediaRecorder.start();
            }
            
            // Set recording state
            this.isRecording = true;
            this.recordedNotes = [];
            this.recordStartTime = Date.now();
            
            // Update UI
            const recordBtn = document.getElementById('record-sid');
            recordBtn.textContent = '⏹ Stop Recording';
            recordBtn.style.backgroundColor = 'var(--c64-red)';
            recordBtn.style.color = 'white';
            
            console.log('Recording started - Audio and pattern input will be captured');
            
            // Show notification
            if (window.c64Platform) {
                window.c64Platform.showNotification('Recording started! Play notes or use playback to record audio.', 'success');
            }
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            if (window.c64Platform) {
                window.c64Platform.showNotification('Failed to start recording: ' + error.message, 'error');
            }
        }
    }

    async stopRecording() {
        this.isRecording = false;
        
        // Stop audio recording properly
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        // Disconnect recording destination
        if (this.recordingDestination && this.masterGain) {
            this.masterGain.disconnect(this.recordingDestination);
        }
        
        // Stop all tracks in the recording stream
        if (this.recordingStream) {
            this.recordingStream.getTracks().forEach(track => {
                track.stop();
            });
            this.recordingStream = null;
        }
        
        // Clean up recording destination
        this.recordingDestination = null;
        
        // Update UI
        const recordBtn = document.getElementById('record-sid');
        recordBtn.textContent = '⏺ Record';
        recordBtn.style.backgroundColor = '';
        recordBtn.style.color = '';
        
        console.log('Recording stopped');
        console.log('Recorded notes:', this.recordedNotes);
        
        // Show notification
        if (window.c64Platform) {
            const noteCount = this.recordedNotes.length;
            const duration = this.recordStartTime ? (Date.now() - this.recordStartTime) / 1000 : 0;
            window.c64Platform.showNotification(
                `Recording stopped! Captured ${noteCount} notes in ${duration.toFixed(1)}s`, 
                'success'
            );
        }
    }

    recordNote(step, voice, note, octave) {
        if (!this.isRecording) return;
        
        const timestamp = Date.now() - this.recordStartTime;
        this.recordedNotes.push({
            timestamp,
            step,
            voice,
            note,
            octave: octave || '4'
        });
        
        console.log(`Recorded: ${note}${octave || '4'} on voice ${voice} at step ${step}`);
    }

    saveRecording() {
        if (this.recordedChunks.length === 0) {
            console.log('No audio data to save');
            return;
        }
        
        // Create audio blob
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentFile?.name || 'recording'}_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Audio recording saved');
        
        // Also save pattern data if notes were recorded
        if (this.recordedNotes.length > 0) {
            this.saveRecordedPattern();
        }
    }

    saveRecordedPattern() {
        const patternData = {
            recordedNotes: this.recordedNotes,
            duration: this.recordStartTime ? (Date.now() - this.recordStartTime) / 1000 : 0,
            tempo: this.tempo,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(patternData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentFile?.name || 'recording'}_pattern_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Pattern recording saved');
    }

    playStep(step) {
        const stepData = this.pattern[step];
        
        // Stop all voices first
        this.stopAllVoices();
        
        // Play each voice
        for (let voice = 1; voice <= 3; voice++) {
            const voiceKey = `voice${voice}`;
            const data = stepData[voiceKey];
            
            if (data.note && data.octave) {
                this.playNote(voice, data.note, parseInt(data.octave), data.effect, data.param);
            }
        }
    }

    playNote(voice, note, octave, effect, param) {
        if (!this.isAudioInitialized || !this.audioContext) return;
        
        // Calculate frequency
        const frequency = this.getFrequency(note, octave);
        if (frequency <= 0) return;
        
        // Stop existing oscillator for this voice
        if (this.voiceOscillators[voice]) {
            this.voiceOscillators[voice].stop();
            this.voiceOscillators[voice] = null;
        }
        
        // Create new oscillator
        const oscillator = this.audioContext.createOscillator();
        const voiceSettings = this.voices[voice];
        
        // Set waveform
        switch (voiceSettings.waveform) {
            case 'triangle':
                oscillator.type = 'triangle';
                break;
            case 'sawtooth':
                oscillator.type = 'sawtooth';
                break;
            case 'pulse':
                oscillator.type = 'square';
                break;
            case 'noise':
                // Web Audio doesn't have built-in noise, use sawtooth as approximation
                oscillator.type = 'sawtooth';
                break;
            default:
                oscillator.type = 'triangle';
        }
        
        // Set frequency
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Connect oscillator to voice chain
        oscillator.connect(this.voiceGains[voice]);
        
        // Apply ADSR envelope
        this.applyADSR(voice, voiceSettings);
        
        // Apply effects if any
        if (effect && param) {
            this.applyEffect(voice, effect, param);
        }
        
        // Start oscillator
        oscillator.start();
        
        // Store reference
        this.voiceOscillators[voice] = oscillator;
        
        // Schedule stop after note duration (quarter note by default)
        const noteDuration = (60 / this.tempo / 4) * 0.8; // 80% of step duration
        oscillator.stop(this.audioContext.currentTime + noteDuration);
        
        // Clear reference when stopped
        setTimeout(() => {
            if (this.voiceOscillators[voice] === oscillator) {
                this.voiceOscillators[voice] = null;
            }
        }, noteDuration * 1000);
    }

    applyADSR(voice, settings) {
        if (!this.audioContext || !this.voiceGains[voice]) return;
        
        const now = this.audioContext.currentTime;
        const gain = this.voiceGains[voice].gain;
        
        // Convert ADSR values (0-15) to time/level values
        const attackTime = (settings.attack / 15) * 0.1; // 0-100ms
        const decayTime = (settings.decay / 15) * 0.2; // 0-200ms
        const sustainLevel = (settings.sustain / 15) * 0.8; // 0-80% volume
        const releaseTime = (settings.release / 15) * 0.5; // 0-500ms
        
        // Clear any existing automation
        gain.cancelScheduledValues(now);
        
        // Attack phase
        gain.setValueAtTime(0, now);
        gain.linearRampToValueAtTime(0.8, now + attackTime);
        
        // Decay phase
        gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        
        // Sustain phase (maintain level)
        const noteDuration = (60 / this.tempo / 4) * 0.6; // Sustain for most of the note
        gain.setValueAtTime(sustainLevel, now + attackTime + decayTime + noteDuration);
        
        // Release phase
        gain.linearRampToValueAtTime(0, now + attackTime + decayTime + noteDuration + releaseTime);
    }

    applyEffect(voice, effect, param) {
        if (!this.audioContext || !this.voiceFilters[voice]) return;
        
        const paramValue = parseInt(param, 16) || 0;
        const now = this.audioContext.currentTime;
        
        switch (effect) {
            case 'F': // Filter cutoff
                const cutoffFreq = 200 + (paramValue / 255) * 3800; // 200Hz to 4000Hz
                this.voiceFilters[voice].frequency.setValueAtTime(cutoffFreq, now);
                break;
                
            case 'R': // Resonance
                const resonance = 1 + (paramValue / 255) * 29; // 1 to 30
                this.voiceFilters[voice].Q.setValueAtTime(resonance, now);
                break;
                
            case 'V': // Volume
                const volume = (paramValue / 255) * 0.8;
                this.voiceGains[voice].gain.setValueAtTime(volume, now);
                break;
                
            case 'P': // Pitch bend
                if (this.voiceOscillators[voice]) {
                    const bendAmount = (paramValue - 128) / 128; // -1 to +1
                    const currentFreq = this.voiceOscillators[voice].frequency.value;
                    const newFreq = currentFreq * (1 + bendAmount * 0.1); // ±10% bend
                    this.voiceOscillators[voice].frequency.setValueAtTime(newFreq, now);
                }
                break;
        }
    }

    getFrequency(note, octave) {
        const noteIndex = this.notes.indexOf(note);
        if (noteIndex === -1) return 0;
        
        // Calculate frequency using equal temperament
        // A4 = 440 Hz, 12 semitones per octave
        const A4 = 440;
        const semitones = (octave - 4) * 12 + (noteIndex - 9); // A is index 9
        return A4 * Math.pow(2, semitones / 12);
    }

    generateFrequencyTable() {
        const frequencies = {};
        for (let octave = 1; octave <= 8; octave++) {
            for (let noteIndex = 0; noteIndex < this.notes.length; noteIndex++) {
                const note = this.notes[noteIndex];
                const key = `${note}${octave}`;
                frequencies[key] = this.getFrequency(note, octave);
            }
        }
        return frequencies;
    }

    stopAllVoices() {
        for (let voice = 1; voice <= 3; voice++) {
            if (this.voiceOscillators[voice]) {
                try {
                    this.voiceOscillators[voice].stop();
                } catch (e) {
                    // Oscillator might already be stopped
                }
                this.voiceOscillators[voice] = null;
            }
            
            // Reset gain to 0
            if (this.voiceGains[voice] && this.audioContext) {
                this.voiceGains[voice].gain.cancelScheduledValues(this.audioContext.currentTime);
                this.voiceGains[voice].gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        }
    }

    updateSIDRegisters() {
        // This would update actual SID registers in a real C64 environment
        // For now, we just update our Web Audio parameters
        console.log('Voice settings updated:', this.voices);
    }

    exportToSIDFormat() {
        // Export pattern to actual SID file format
        const sidData = {
            header: 'PSID',
            version: 2,
            dataOffset: 0x7C,
            loadAddress: 0x1000,
            initAddress: 0x1000,
            playAddress: 0x1003,
            songs: 1,
            startSong: 1,
            speed: 0,
            name: this.currentFile ? this.currentFile.name : 'Untitled',
            author: 'C64 Dev Platform',
            released: new Date().getFullYear().toString()
        };
        
        return sidData;
    }
}

// Initialize SID editor
window.sidEditor = new SIDEditor();