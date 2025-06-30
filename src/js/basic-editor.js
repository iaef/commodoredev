// BASIC V2 Editor with syntax highlighting and ASM view
class BASICEditor {
    constructor() {
        this.currentFile = null;
        this.files = [];
        this.asmViewMode = 'opcodes'; // 'opcodes' or 'readable'
        this.lineNumbersEnabled = false;
        this.lineIncrement = 10;
        this.tokenizer = null; // Will be loaded dynamically
        this.highlightedEditor = null; // For syntax highlighting overlay
        this.basicKeywords = [
            'AND', 'ABS', 'ASC', 'ATN', 'CHR$', 'CLOSE', 'CLR', 'CMD', 'CONT', 'COS',
            'DATA', 'DEF', 'DIM', 'END', 'EXP', 'FN', 'FOR', 'FRE', 'GET', 'GOSUB',
            'GOTO', 'IF', 'INPUT', 'INT', 'LEFT$', 'LEN', 'LET', 'LIST', 'LOAD',
            'LOG', 'MID$', 'NEW', 'NEXT', 'NOT', 'ON', 'OPEN', 'OR', 'PEEK', 'POKE',
            'POS', 'PRINT', 'READ', 'REM', 'RESTORE', 'RETURN', 'RIGHT$', 'RND',
            'RUN', 'SAVE', 'SGN', 'SIN', 'SPC', 'SQR', 'STEP', 'STOP', 'STR$',
            'SYS', 'TAB', 'TAN', 'THEN', 'TO', 'USR', 'VAL', 'VERIFY', 'WAIT'
        ];
        this.basicTokens = {
            'END': 0x80, 'FOR': 0x81, 'NEXT': 0x82, 'DATA': 0x83, 'INPUT#': 0x84,
            'INPUT': 0x85, 'DIM': 0x86, 'READ': 0x87, 'LET': 0x88, 'GOTO': 0x89,
            'RUN': 0x8A, 'IF': 0x8B, 'RESTORE': 0x8C, 'GOSUB': 0x8D, 'RETURN': 0x8E,
            'REM': 0x8F, 'STOP': 0x90, 'ON': 0x91, 'WAIT': 0x92, 'LOAD': 0x93,
            'SAVE': 0x94, 'VERIFY': 0x95, 'DEF': 0x96, 'POKE': 0x97, 'PRINT#': 0x98,
            'PRINT': 0x99, 'CONT': 0x9A, 'LIST': 0x9B, 'CLR': 0x9C, 'CMD': 0x9D,
            'SYS': 0x9E, 'OPEN': 0x9F, 'CLOSE': 0xA0, 'GET': 0xA1, 'NEW': 0xA2
        };
    }

    async init() {
        this.setupEventListeners();
        this.updateFileList();
        this.setupSyntaxHighlighting();
        await this.loadTokenizer();
        this.updateASMView();
    }

    async loadTokenizer() {
        try {
            // Try to load c64basic if available
            if (typeof window !== 'undefined' && window.c64basic) {
                this.tokenizer = window.c64basic;
                console.log('C64 BASIC tokenizer loaded successfully');
            } else {
                console.log('C64 BASIC tokenizer not available, using fallback');
                this.tokenizer = this.createFallbackTokenizer();
            }
        } catch (error) {
            console.warn('Failed to load c64basic tokenizer, using fallback:', error);
            this.tokenizer = this.createFallbackTokenizer();
        }
    }

    createFallbackTokenizer() {
        return {
            tokenize: (code) => {
                // Simple fallback tokenizer
                const lines = code.split('\n');
                const tokenized = [];
                
                lines.forEach(line => {
                    if (line.trim()) {
                        const lineMatch = line.match(/^\s*(\d+)\s*(.*)/);
                        if (lineMatch) {
                            const lineNum = parseInt(lineMatch[1]);
                            const content = lineMatch[2];
                            
                            // Add line number (little endian)
                            tokenized.push(lineNum & 0xFF);
                            tokenized.push((lineNum >> 8) & 0xFF);
                            
                            // Tokenize content
                            this.tokenizeLine(content, tokenized);
                            
                            // End of line
                            tokenized.push(0x00);
                        }
                    }
                });
                
                // End of program
                tokenized.push(0x00, 0x00);
                
                return new Uint8Array(tokenized);
            }
        };
    }

    tokenizeLine(line, output) {
        let i = 0;
        while (i < line.length) {
            // Skip whitespace
            if (line[i] === ' ') {
                output.push(0x20);
                i++;
                continue;
            }
            
            // Check for keywords
            let foundKeyword = false;
            for (const [keyword, token] of Object.entries(this.basicTokens)) {
                if (line.substr(i, keyword.length).toUpperCase() === keyword) {
                    // Check if it's a complete word
                    const nextChar = line[i + keyword.length];
                    if (!nextChar || !/[A-Z0-9$]/.test(nextChar)) {
                        output.push(token);
                        i += keyword.length;
                        foundKeyword = true;
                        break;
                    }
                }
            }
            
            if (!foundKeyword) {
                // Regular character
                output.push(line.charCodeAt(i));
                i++;
            }
        }
    }

    setupEventListeners() {
        // File management
        document.getElementById('new-basic-file').addEventListener('click', () => {
            this.createNewFile();
        });

        document.getElementById('load-basic-file').addEventListener('click', () => {
            this.loadFile();
        });

        document.getElementById('save-basic-file').addEventListener('click', () => {
            this.saveFile();
        });

        document.getElementById('basic-file-select').addEventListener('change', (e) => {
            this.switchFile(e.target.value);
        });

        // Editor options
        document.getElementById('line-numbers').addEventListener('change', (e) => {
            this.lineNumbersEnabled = e.target.checked;
            this.updateLineNumberSettings();
        });

        // Line increment setting
        document.getElementById('line-increment').addEventListener('change', (e) => {
            this.lineIncrement = parseInt(e.target.value) || 10;
        });

        document.querySelectorAll('input[name="asm-view"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.asmViewMode = e.target.value;
                this.updateASMView();
            });
        });

        // Code editor
        const codeEditor = document.getElementById('basic-code');
        codeEditor.addEventListener('input', () => {
            this.applySyntaxHighlighting();
            this.updateASMView();
        });

        codeEditor.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        codeEditor.addEventListener('keyup', () => {
            this.applySyntaxHighlighting();
        });

        codeEditor.addEventListener('scroll', () => {
            this.syncHighlightScroll();
        });
    }

    createNewFile() {
        // Create inline input for file name
        const fileNameInput = document.createElement('input');
        fileNameInput.type = 'text';
        fileNameInput.value = 'program.bas';
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
        
        const createBtn = document.getElementById('new-basic-file');
        const originalText = createBtn.textContent;
        createBtn.textContent = 'Enter name:';
        createBtn.parentNode.insertBefore(fileNameInput, createBtn.nextSibling);
        
        fileNameInput.focus();
        fileNameInput.select();
        
        const finishCreation = () => {
            const fileName = fileNameInput.value.trim() || 'program.bas';
            fileNameInput.remove();
            createBtn.textContent = originalText;
            
            const file = {
                name: fileName,
                content: '',
                type: 'basic',
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
        input.accept = '.bas,.txt';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const content = await file.text();
                const basicFile = {
                    name: file.name,
                    content: content,
                    type: 'basic',
                    created: new Date().toISOString()
                };
                this.files.push(basicFile);
                this.currentFile = basicFile;
                this.updateFileList();
                this.loadFileContent();
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

        this.currentFile.content = document.getElementById('basic-code').value;
        
        const blob = new Blob([this.currentFile.content], { type: 'text/plain' });
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
            // Save current file content
            if (this.currentFile) {
                this.currentFile.content = document.getElementById('basic-code').value;
            }
            
            this.currentFile = file;
            this.loadFileContent();
        }
    }

    updateFileList() {
        const select = document.getElementById('basic-file-select');
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
        const codeEditor = document.getElementById('basic-code');
        if (this.currentFile) {
            codeEditor.value = this.currentFile.content;
        } else {
            codeEditor.value = '';
        }
        this.applySyntaxHighlighting();
        this.updateASMView();
    }

    setupSyntaxHighlighting() {
        const codeEditor = document.getElementById('basic-code');
        const editorPanel = codeEditor.parentElement;
        
        // Create syntax highlighting overlay
        if (!this.highlightedEditor) {
            this.highlightedEditor = document.createElement('div');
            this.highlightedEditor.className = 'syntax-highlight-overlay';
            
            // Get the panel header to calculate its height
            const panelHeader = editorPanel.querySelector('.panel-header');
            const headerHeight = panelHeader ? panelHeader.offsetHeight : 0;
            
            // Position the overlay to start after the header
            this.highlightedEditor.style.cssText = `
                position: absolute;
                top: ${headerHeight}px;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.4;
                padding: 15px;
                margin: 0;
                border: none;
                white-space: pre-wrap;
                word-wrap: break-word;
                overflow: hidden;
                background: transparent;
                color: transparent;
                z-index: 1;
                box-sizing: border-box;
            `;
            
            // Make editor panel relative positioned
            editorPanel.style.position = 'relative';
            editorPanel.appendChild(this.highlightedEditor);
            
            // Make textarea background transparent but keep text visible
            codeEditor.style.background = 'transparent';
            codeEditor.style.color = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white for typing
            codeEditor.style.position = 'relative';
            codeEditor.style.zIndex = '2';
            codeEditor.style.caretColor = 'var(--c64-green)';
        }
    }

    applySyntaxHighlighting() {
        if (!this.highlightedEditor) return;
        
        const codeEditor = document.getElementById('basic-code');
        const content = codeEditor.value;
        
        // Apply syntax highlighting
        const highlightedContent = this.highlightSyntax(content);
        this.highlightedEditor.innerHTML = highlightedContent;
        
        // Sync scroll position
        this.syncHighlightScroll();
        
        // Update ASM view
        this.updateASMView();
    }

    highlightSyntax(content) {
        if (!content) return '';
        
        const lines = content.split('\n');
        let result = '';
        
        lines.forEach((line, index) => {
            if (index > 0) result += '\n';
            result += this.highlightLine(line);
        });
        
        return result;
    }

    highlightLine(line) {
        if (!line.trim()) return line;
        
        let result = '';
        let i = 0;
        
        // Check for line number at start
        const lineNumMatch = line.match(/^(\s*)(\d+)(\s*)/);
        if (lineNumMatch) {
            result += lineNumMatch[1]; // Leading whitespace
            result += `<span style="color: #00FFFF; font-weight: bold;">${lineNumMatch[2]}</span>`;
            result += lineNumMatch[3]; // Trailing whitespace
            i = lineNumMatch[0].length;
        }
        
        // Process rest of line
        while (i < line.length) {
            let matched = false;
            
            // Check for strings
            if (line[i] === '"') {
                let stringEnd = i + 1;
                while (stringEnd < line.length && line[stringEnd] !== '"') {
                    stringEnd++;
                }
                if (stringEnd < line.length) stringEnd++; // Include closing quote
                
                const stringContent = line.substring(i, stringEnd);
                result += `<span style="color: #00FF00;">${this.escapeHtml(stringContent)}</span>`;
                i = stringEnd;
                matched = true;
            }
            
            // Check for REM comments
            if (!matched && line.substring(i).toUpperCase().startsWith('REM')) {
                const restOfLine = line.substring(i);
                result += `<span style="color: #7C70DA; font-style: italic;">${this.escapeHtml(restOfLine)}</span>`;
                break;
            }
            
            // Check for BASIC keywords
            if (!matched) {
                for (const keyword of this.basicKeywords) {
                    if (line.substring(i, i + keyword.length).toUpperCase() === keyword) {
                        // Check if it's a complete word
                        const nextChar = line[i + keyword.length];
                        if (!nextChar || !/[A-Z0-9$]/.test(nextChar.toUpperCase())) {
                            result += `<span style="color: #FFFF00; font-weight: bold;">${this.escapeHtml(line.substring(i, i + keyword.length))}</span>`;
                            i += keyword.length;
                            matched = true;
                            break;
                        }
                    }
                }
            }
            
            // Check for numbers
            if (!matched && /\d/.test(line[i])) {
                let numEnd = i;
                while (numEnd < line.length && /[\d.]/.test(line[numEnd])) {
                    numEnd++;
                }
                const number = line.substring(i, numEnd);
                result += `<span style="color: #FFFF00; font-weight: bold;">${this.escapeHtml(number)}</span>`;
                i = numEnd;
                matched = true;
            }
            
            // Check for operators
            if (!matched && /[+\-*\/=<>(),:;]/.test(line[i])) {
                result += `<span style="color: #FF0000;">${this.escapeHtml(line[i])}</span>`;
                i++;
                matched = true;
            }
            
            // Regular character
            if (!matched) {
                result += `<span style="color: #FFFFFF;">${this.escapeHtml(line[i])}</span>`;
                i++;
            }
        }
        
        return result;
    }

    syncHighlightScroll() {
        if (!this.highlightedEditor) return;
        
        const codeEditor = document.getElementById('basic-code');
        this.highlightedEditor.scrollTop = codeEditor.scrollTop;
        this.highlightedEditor.scrollLeft = codeEditor.scrollLeft;
    }

    updateLineNumberSettings() {
        const incrementInput = document.getElementById('line-increment');
        incrementInput.disabled = !this.lineNumbersEnabled;
    }

    updateASMView() {
        const content = document.getElementById('basic-code').value;
        const asmOutput = document.getElementById('asm-output');
        
        if (this.asmViewMode === 'opcodes') {
            asmOutput.innerHTML = this.generateTokenizedView(content);
        } else {
            asmOutput.innerHTML = this.generateReadableView(content);
        }
    }

    generateTokenizedView(basicCode) {
        if (!basicCode.trim()) {
            return '<div class="asm-line"><span class="comment">; No code to tokenize</span></div>';
        }

        let output = '<div class="asm-line"><span class="comment">; BASIC V2 Tokenized Output</span></div>';
        let memoryAddress = 0x0801; // BASIC start address
        
        try {
            // Tokenize the BASIC code
            const tokenized = this.tokenizer.tokenize(basicCode);
            
            output += `<div class="asm-line"><span class="comment">; Program size: ${tokenized.length} bytes</span></div>`;
            output += `<div class="asm-line"></div>`;
            
            // Display tokenized bytes in groups of 8
            for (let i = 0; i < tokenized.length; i += 8) {
                const address = (memoryAddress + i).toString(16).toUpperCase().padStart(4, '0');
                output += `<div class="asm-line">`;
                output += `<span class="memory-addr">$${address}</span> `;
                
                // Show hex bytes
                const bytesInLine = Math.min(8, tokenized.length - i);
                for (let j = 0; j < bytesInLine; j++) {
                    const byte = tokenized[i + j];
                    const hexByte = byte.toString(16).toUpperCase().padStart(2, '0');
                    
                    // Color code different types of bytes
                    if (byte === 0x00) {
                        output += `<span class="data-byte">${hexByte}</span> `;
                    } else if (byte >= 0x80 && byte <= 0xA2) {
                        output += `<span class="opcode-byte">${hexByte}</span> `;
                    } else if (byte >= 0x30 && byte <= 0x39) {
                        output += `<span class="basic-number">${hexByte}</span> `;
                    } else {
                        output += `<span class="data-byte">${hexByte}</span> `;
                    }
                }
                
                // Pad with spaces if needed
                for (let j = bytesInLine; j < 8; j++) {
                    output += '   ';
                }
                
                // Show ASCII representation
                output += ' <span class="comment">; ';
                for (let j = 0; j < bytesInLine; j++) {
                    const byte = tokenized[i + j];
                    if (byte >= 0x20 && byte <= 0x7E) {
                        output += String.fromCharCode(byte);
                    } else if (byte >= 0x80 && byte <= 0xA2) {
                        // Show token names for BASIC keywords
                        const tokenName = this.getTokenName(byte);
                        output += `[${tokenName}]`;
                    } else {
                        output += '.';
                    }
                }
                output += '</span>';
                output += '</div>';
            }
            
        } catch (error) {
            output += `<div class="asm-line"><span class="comment">; Error tokenizing: ${error.message}</span></div>`;
        }
        
        return output;
    }

    getTokenName(token) {
        for (const [name, value] of Object.entries(this.basicTokens)) {
            if (value === token) {
                return name;
            }
        }
        return 'UNK';
    }

    generateReadableView(basicCode) {
        const lines = basicCode.split('\n');
        let output = '<div class="asm-line"><span class="comment">; BASIC V2 Readable Translation</span></div>';
        let memoryAddress = 0x0801;
        
        lines.forEach((line, index) => {
            if (line.trim()) {
                const lineNum = this.extractLineNumber(line);
                const readable = this.basicToReadable(line);
                
                output += `<div class="asm-line">`;
                output += `<span class="memory-addr">$${memoryAddress.toString(16).toUpperCase().padStart(4, '0')}</span> `;
                output += `<span class="comment">; Line ${lineNum || (index + 1)}</span><br>`;
                readable.forEach(instruction => {
                    memoryAddress += 3; // Approximate instruction size
                    output += `<span class="memory-addr">$${memoryAddress.toString(16).toUpperCase().padStart(4, '0')}</span> `;
                    output += `<span class="keyword">${instruction.operation}</span> `;
                    if (instruction.operand) {
                        output += `<span class="address">${instruction.operand}</span>`;
                    }
                    if (instruction.comment) {
                        output += ` <span class="comment">; ${instruction.comment}</span>`;
                    }
                    output += '<br>';
                });
                output += `</div>`;
            }
        });
        
        return output;
    }

    extractLineNumber(line) {
        const match = line.match(/^\s*(\d+)/);
        return match ? match[1] : null;
    }

    extractCommand(line) {
        const withoutLineNum = line.replace(/^\s*\d+\s*/, '');
        const match = withoutLineNum.match(/^\s*([A-Z]+)/);
        return match ? match[1] : null;
    }

    basicToReadable(line) {
        const instructions = [];
        const command = this.extractCommand(line);
        
        switch (command) {
            case 'PRINT':
                instructions.push({
                    operation: 'JSR',
                    operand: '$AB1E',
                    comment: 'Call BASIC PRINT routine'
                });
                break;
            case 'POKE':
                const pokeMatch = line.match(/POKE\s+(\d+)\s*,\s*(\d+)/i);
                if (pokeMatch) {
                    instructions.push({
                        operation: 'LDA',
                        operand: `#$${parseInt(pokeMatch[2]).toString(16).toUpperCase()}`,
                        comment: `Load value ${pokeMatch[2]}`
                    });
                    instructions.push({
                        operation: 'STA',
                        operand: `$${parseInt(pokeMatch[1]).toString(16).toUpperCase()}`,
                        comment: `Store at address ${pokeMatch[1]}`
                    });
                }
                break;
            case 'FOR':
                instructions.push({
                    operation: 'JSR',
                    operand: '$A38A',
                    comment: 'Call BASIC FOR routine'
                });
                break;
            case 'NEXT':
                instructions.push({
                    operation: 'JSR',
                    operand: '$A3B8',
                    comment: 'Call BASIC NEXT routine'
                });
                break;
            case 'GOTO':
                const gotoMatch = line.match(/GOTO\s+(\d+)/i);
                if (gotoMatch) {
                    instructions.push({
                        operation: 'JSR',
                        operand: '$A8A0',
                        comment: `BASIC GOTO to line ${gotoMatch[1]}`
                    });
                }
                break;
            case 'IF':
                instructions.push({
                    operation: 'JSR',
                    operand: '$A928',
                    comment: 'Call BASIC IF routine'
                });
                break;
            case 'REM':
                instructions.push({
                    operation: 'NOP',
                    operand: '',
                    comment: 'Comment - skipped by interpreter'
                });
                break;
            case 'SYS':
                const sysMatch = line.match(/SYS\s+(\d+)/i);
                if (sysMatch) {
                    instructions.push({
                        operation: 'JSR',
                        operand: `$${parseInt(sysMatch[1]).toString(16).toUpperCase()}`,
                        comment: `Call machine language at ${sysMatch[1]}`
                    });
                }
                break;
            default:
                if (command) {
                    instructions.push({
                        operation: 'JSR',
                        operand: 'BASIC_INTERPRETER',
                        comment: `Execute ${command} via BASIC interpreter`
                    });
                }
        }
        
        return instructions;
    }

    getAllLineNumbers() {
        const codeEditor = document.getElementById('basic-code');
        const lines = codeEditor.value.split('\n');
        const lineNumbers = [];
        
        lines.forEach(line => {
            const lineNum = this.extractLineNumber(line);
            if (lineNum) {
                lineNumbers.push(parseInt(lineNum));
            }
        });
        
        return lineNumbers.sort((a, b) => a - b);
    }

    findNextAvailableLineNumber(afterLine) {
        const allLineNumbers = this.getAllLineNumbers();
        let nextNumber = afterLine + this.lineIncrement;
        
        // Find the next available line number
        while (allLineNumbers.includes(nextNumber)) {
            nextNumber += this.lineIncrement;
        }
        
        return nextNumber;
    }

    getCurrentLineNumber() {
        const codeEditor = document.getElementById('basic-code');
        const cursorPos = codeEditor.selectionStart;
        const textBefore = codeEditor.value.substring(0, cursorPos);
        const lines = textBefore.split('\n');
        const currentLineText = lines[lines.length - 1];
        
        return this.extractLineNumber(currentLineText);
    }

    findTargetLineAfterEnter() {
        const codeEditor = document.getElementById('basic-code');
        const cursorPos = codeEditor.selectionStart;
        const textBefore = codeEditor.value.substring(0, cursorPos);
        const textAfter = codeEditor.value.substring(cursorPos);
        
        // Get current line number
        const currentLineNumber = this.getCurrentLineNumber();
        if (!currentLineNumber) return null;
        
        const currentNum = parseInt(currentLineNumber);
        const allLineNumbers = this.getAllLineNumbers();
        
        // Find the next existing line number after current
        const nextExistingLine = allLineNumbers.find(num => num > currentNum);
        
        if (nextExistingLine) {
            const expectedNext = currentNum + this.lineIncrement;
            if (expectedNext < nextExistingLine) {
                // We can insert a new line
                return { action: 'insert', lineNumber: expectedNext };
            } else if (expectedNext === nextExistingLine) {
                // Jump to existing line
                return { action: 'jump', lineNumber: nextExistingLine };
            }
        }
        
        // No next line, create new one
        return { action: 'insert', lineNumber: currentNum + this.lineIncrement };
    }

    handleKeyDown(e) {
        const codeEditor = document.getElementById('basic-code');
        
        // Auto-complete BASIC keywords
        if (e.key === 'Tab') {
            e.preventDefault();
            const cursorPos = codeEditor.selectionStart;
            const textBefore = codeEditor.value.substring(0, cursorPos);
            const currentWord = textBefore.split(/\s/).pop().toUpperCase();
            
            const matches = this.basicKeywords.filter(keyword => 
                keyword.startsWith(currentWord) && keyword !== currentWord
            );
            
            if (matches.length === 1) {
                const completion = matches[0].substring(currentWord.length);
                const textAfter = codeEditor.value.substring(cursorPos);
                codeEditor.value = textBefore + completion + textAfter;
                codeEditor.selectionStart = codeEditor.selectionEnd = cursorPos + completion.length;
                this.applySyntaxHighlighting();
                this.updateASMView();
            }
        }
        
        // Smart line numbering
        if (e.key === 'Enter' && this.lineNumbersEnabled) {
            e.preventDefault();
            
            const target = this.findTargetLineAfterEnter();
            if (!target) {
                // No line numbering context, just add new line
                const cursorPos = codeEditor.selectionStart;
                const textBefore = codeEditor.value.substring(0, cursorPos);
                const textAfter = codeEditor.value.substring(cursorPos);
                codeEditor.value = textBefore + '\n' + textAfter;
                codeEditor.selectionStart = codeEditor.selectionEnd = cursorPos + 1;
                this.applySyntaxHighlighting();
                this.updateASMView();
                return;
            }
            
            if (target.action === 'insert') {
                // Insert new line with line number
                const cursorPos = codeEditor.selectionStart;
                const textBefore = codeEditor.value.substring(0, cursorPos);
                const textAfter = codeEditor.value.substring(cursorPos);
                
                const newContent = textBefore + '\n' + target.lineNumber + ' ' + textAfter;
                codeEditor.value = newContent;
                
                // Position cursor after the line number and space
                const newCursorPos = cursorPos + 1 + target.lineNumber.toString().length + 1;
                codeEditor.selectionStart = codeEditor.selectionEnd = newCursorPos;
                
            } else if (target.action === 'jump') {
                // Jump to existing line
                const lines = codeEditor.value.split('\n');
                let targetLineIndex = -1;
                
                for (let i = 0; i < lines.length; i++) {
                    const lineNum = this.extractLineNumber(lines[i]);
                    if (lineNum && parseInt(lineNum) === target.lineNumber) {
                        targetLineIndex = i;
                        break;
                    }
                }
                
                if (targetLineIndex !== -1) {
                    // Calculate position at end of target line
                    let position = 0;
                    for (let i = 0; i < targetLineIndex; i++) {
                        position += lines[i].length + 1; // +1 for newline
                    }
                    position += lines[targetLineIndex].length; // End of target line
                    
                    codeEditor.selectionStart = codeEditor.selectionEnd = position;
                }
            }
            
            this.applySyntaxHighlighting();
            this.updateASMView();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize BASIC editor
window.basicEditor = new BASICEditor();