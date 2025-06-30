// Documentation Manager - Comprehensive C64 Development Guide
class DocumentationManager {
    constructor() {
        this.currentTab = 'workflow';
        this.c64Font = null;
        this.fontLoaded = false;
    }

    async init() {
        await this.loadC64Font();
        this.setupEventListeners();
        this.loadContent();
        this.showTab('workflow');
    }

    async loadC64Font() {
        try {
            // Load C64 TrueType font from style64.org
            const font = new FontFace('C64', 'url(https://style64.org/c64-truetype/C64_Pro_Mono-STYLE.woff2)');
            await font.load();
            document.fonts.add(font);
            this.fontLoaded = true;
            
            // Apply font to specific elements
            document.documentElement.style.setProperty('--c64-font', 'C64, "Courier New", monospace');
            
            console.log('C64 TrueType font loaded successfully');
        } catch (error) {
            console.warn('Failed to load C64 font, using fallback:', error);
            document.documentElement.style.setProperty('--c64-font', '"Courier New", monospace');
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.doc-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showTab(tabName);
            });
        });
    }

    showTab(tabName) {
        // Hide all sections
        document.querySelectorAll('.doc-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all tabs
        document.querySelectorAll('.doc-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected section and activate tab
        const targetSection = document.getElementById(`${tabName}-content`);
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetSection && targetTab) {
            targetSection.classList.add('active');
            targetTab.classList.add('active');
            this.currentTab = tabName;
        }
    }

    loadContent() {
        this.loadWorkflowContent();
        this.loadMemoryMapContent();
        this.loadVICReferenceContent();
        this.loadSIDReferenceContent();
        this.loadBASICCommandsContent();
        this.loadProgrammingTipsContent();
    }

    loadWorkflowContent() {
        const content = document.getElementById('workflow-content');
        content.innerHTML = `
            <div class="workflow-overview">
                <h2>🎮 Complete C64 Development Workflow</h2>
                <p>This comprehensive guide covers the entire development process from concept to finished C64 program using our integrated development platform.</p>
            </div>

            <div class="workflow-section">
                <h3>📁 Project Management</h3>
                <h4>Creating and Managing Projects</h4>
                <ol>
                    <li><strong>Create New Project:</strong> Click "New Project" on the dashboard and enter your project name inline</li>
                    <li><strong>Project Structure:</strong> Projects automatically organize files into categories:
                        <ul>
                            <li><strong>Code Files:</strong> BASIC programs (.bas), Assembly files (.asm)</li>
                            <li><strong>Audio Files:</strong> SID music and sound effects (.sid)</li>
                            <li><strong>Graphics Files:</strong> Sprites and character sets (.spr)</li>
                        </ul>
                    </li>
                    <li><strong>Auto-Save:</strong> Projects auto-save to localStorage every 30 seconds</li>
                    <li><strong>Export/Import:</strong> Save projects as .c64proj files for sharing and backup</li>
                </ol>

                <div class="tip-box">
                    <h4>💡 Pro Tip</h4>
                    <p>The footer bar shows your current project status, including unsaved changes. Always save before switching projects!</p>
                </div>
            </div>

            <div class="workflow-section">
                <h3>💻 BASIC Programming Workflow</h3>
                <h4>Writing and Testing BASIC Programs</h4>
                <ol>
                    <li><strong>Create BASIC File:</strong> Use the BASIC Editor to create new .bas files</li>
                    <li><strong>Syntax Highlighting:</strong> Real-time highlighting for keywords, strings, numbers, and comments</li>
                    <li><strong>Line Numbering:</strong> Enable auto line numbering with customizable increments (5, 10, 20, 100)</li>
                    <li><strong>Assembly View:</strong> See tokenized output and readable assembly translation</li>
                    <li><strong>Keyboard Shortcuts:</strong>
                        <ul>
                            <li><strong>Tab:</strong> Auto-complete BASIC keywords</li>
                            <li><strong>Enter:</strong> Smart line numbering (when enabled)</li>
                            <li><strong>Piano Keys:</strong> Quick note entry (z=C, s=C#, x=D, etc.)</li>
                        </ul>
                    </li>
                </ol>

                <div class="code-example">
                    <h4>Example BASIC Program Structure:</h4>
                    <pre><code><span class="basic-number">10</span> <span class="basic-comment">REM *** GAME INITIALIZATION ***</span>
<span class="basic-number">20</span> <span class="basic-keyword">POKE</span> <span class="basic-number">53280</span>,<span class="basic-number">0</span>: <span class="basic-comment">REM BLACK BORDER</span>
<span class="basic-number">30</span> <span class="basic-keyword">POKE</span> <span class="basic-number">53281</span>,<span class="basic-number">0</span>: <span class="basic-comment">REM BLACK BACKGROUND</span>
<span class="basic-number">40</span> <span class="basic-keyword">PRINT</span> <span class="basic-string">"</span><span class="basic-string">LOADING GAME..."</span>
<span class="basic-number">50</span> <span class="basic-keyword">SYS</span> <span class="basic-number">2064</span>: <span class="basic-comment">REM CALL MACHINE CODE</span></code></pre>
                </div>
            </div>

            <div class="workflow-section">
                <h3>🎵 Audio Development Workflow</h3>
                <h4>Creating Music and Sound Effects</h4>
                <ol>
                    <li><strong>SID Editor Interface:</strong> Professional tracker-style interface with 3 voices</li>
                    <li><strong>Pattern Entry:</strong> Enter notes using tracker notation (C-4, D#3, etc.)</li>
                    <li><strong>Voice Configuration:</strong> Set waveforms (Triangle, Sawtooth, Pulse, Noise) and ADSR envelopes</li>
                    <li><strong>Real-time Playback:</strong> Hear your music as you compose with Web Audio API</li>
                    <li><strong>Recording:</strong> Capture both audio output (.webm) and pattern data (.json)</li>
                    <li><strong>Effects:</strong> Apply filters, volume changes, and pitch bends</li>
                </ol>

                <div class="tip-box">
                    <h4>🎼 Music Theory for C64</h4>
                    <p>The SID chip uses equal temperament tuning. Middle C (C-4) = 261.63 Hz. Each octave doubles the frequency.</p>
                </div>

                <h4>SID Programming Concepts:</h4>
                <ul>
                    <li><strong>Frequency Control:</strong> 16-bit frequency registers for precise pitch</li>
                    <li><strong>ADSR Envelopes:</strong> Attack, Decay, Sustain, Release for realistic instruments</li>
                    <li><strong>Waveforms:</strong> Triangle (smooth), Sawtooth (bright), Pulse (variable width), Noise (percussion)</li>
                    <li><strong>Filters:</strong> Low-pass, Band-pass, High-pass with resonance control</li>
                    <li><strong>Ring Modulation:</strong> Voice 1 × Voice 2 for metallic sounds</li>
                    <li><strong>Sync:</strong> Hard sync for aggressive lead sounds</li>
                </ul>
            </div>

            <div class="workflow-section">
                <h3>🎨 Graphics Development Workflow</h3>
                <h4>Sprite and Character Creation</h4>
                
                <h4>Character Editor Mode:</h4>
                <ol>
                    <li><strong>Authentic Character Set:</strong> Complete C64 PETSCII character set with graphics symbols</li>
                    <li><strong>8×8 Pixel Editing:</strong> Precise pixel-level control with zoom up to 16×</li>
                    <li><strong>Character Selection:</strong> Browse and edit any of the 256 characters</li>
                    <li><strong>Real-time Preview:</strong> See characters at actual size and 4× preview</li>
                </ol>

                <h4>Sprite Editor Mode:</h4>
                <ol>
                    <li><strong>24×21 Sprite Canvas:</strong> Standard C64 sprite dimensions</li>
                    <li><strong>Animation Timeline:</strong> Create multi-frame animations with onion skinning</li>
                    <li><strong>Super Sprites:</strong> Combine sprites for larger objects (2×1, 1×2, 2×2)</li>
                    <li><strong>Tools:</strong> Pixel, Fill, Line, and Clear tools</li>
                    <li><strong>C64 Palette:</strong> Authentic 16-color palette with custom color support</li>
                </ol>

                <div class="warning-box">
                    <h4>⚠️ Hardware Limitations</h4>
                    <p>Remember C64 hardware limits: 8 sprites maximum, sprite multiplexing needed for more objects, and color restrictions in multicolor mode.</p>
                </div>
            </div>

            <div class="workflow-section">
                <h3>🔧 Assembly Integration</h3>
                <h4>From BASIC to Machine Code</h4>
                <ol>
                    <li><strong>BASIC Tokenization:</strong> View how BASIC commands are stored in memory</li>
                    <li><strong>Assembly Translation:</strong> See equivalent 6502 assembly for BASIC commands</li>
                    <li><strong>Memory Management:</strong> Understand zero page usage and memory banking</li>
                    <li><strong>Hardware Programming:</strong> Direct register manipulation for VIC-II and SID</li>
                </ol>

                <div class="code-example">
                    <h4>BASIC to Assembly Example:</h4>
                    <pre><code><span class="comment">; BASIC: POKE 53280,0</span>
<span class="keyword">LDA</span> <span class="address">#$00</span>     <span class="comment">; Load value 0</span>
<span class="keyword">STA</span> <span class="address">$D020</span>   <span class="comment">; Store to border color register</span></code></pre>
                </div>
            </div>

            <div class="workflow-section">
                <h3>🚀 Deployment and Testing</h3>
                <h4>Preparing for Real Hardware</h4>
                <ol>
                    <li><strong>Export Assets:</strong> Generate C64-compatible data files</li>
                    <li><strong>Memory Layout:</strong> Organize code, graphics, and music in memory</li>
                    <li><strong>Cross-Assembly:</strong> Use tools like CA65, ACME, or KickAssembler</li>
                    <li><strong>Testing:</strong> Use VICE emulator or real C64 hardware</li>
                    <li><strong>Distribution:</strong> Create .d64 disk images or .crt cartridges</li>
                </ol>
            </div>
        `;
    }

    loadMemoryMapContent() {
        const content = document.getElementById('memory-map-content');
        content.innerHTML = `
            <h2>🗺️ Commodore 64 Memory Map</h2>
            <p>Complete memory layout and hardware register reference for C64 programming.</p>

            <div class="memory-map-grid">
                <div class="memory-block">
                    <h4>Zero Page ($0000-$00FF)</h4>
                    <div class="address">$00-$01</div>
                    <div class="description">Processor port and memory configuration</div>
                    <div class="address">$02</div>
                    <div class="description">Unused (available for user programs)</div>
                    <div class="address">$03-$8F</div>
                    <div class="description">BASIC and KERNAL variables</div>
                    <div class="address">$90-$FA</div>
                    <div class="description">Free zero page (170 bytes for fast access)</div>
                    <div class="address">$FB-$FE</div>
                    <div class="description">KERNAL variables</div>
                    <div class="address">$FF</div>
                    <div class="description">Unused</div>
                </div>

                <div class="memory-block">
                    <h4>System Area ($0100-$03FF)</h4>
                    <div class="address">$0100-$01FF</div>
                    <div class="description">Processor stack (256 bytes)</div>
                    <div class="address">$0200-$02FF</div>
                    <div class="description">BASIC input buffer and variables</div>
                    <div class="address">$0300-$03FF</div>
                    <div class="description">Cassette buffer and free RAM</div>
                </div>

                <div class="memory-block">
                    <h4>Screen and Color ($0400-$0FFF)</h4>
                    <div class="address">$0400-$07E7</div>
                    <div class="description">Default screen RAM (1000 bytes, 40×25)</div>
                    <div class="address">$07E8-$07FF</div>
                    <div class="description">Unused screen area</div>
                    <div class="address">$0800-$0FFF</div>
                    <div class="description">BASIC program area start</div>
                </div>

                <div class="memory-block">
                    <h4>BASIC Program Area ($0801-$9FFF)</h4>
                    <div class="address">$0801</div>
                    <div class="description">BASIC program start (2049 decimal)</div>
                    <div class="address">$0801-$9FFF</div>
                    <div class="description">BASIC program and variables (38K)</div>
                    <div class="address">$A000-$BFFF</div>
                    <div class="description">BASIC ROM (can be banked out)</div>
                </div>

                <div class="memory-block">
                    <h4>Character ROM ($D000-$DFFF)</h4>
                    <div class="address">$D000-$D3FF</div>
                    <div class="description">VIC-II registers (when I/O enabled)</div>
                    <div class="address">$D400-$D7FF</div>
                    <div class="description">SID registers (when I/O enabled)</div>
                    <div class="address">$D800-$DBFF</div>
                    <div class="description">Color RAM (1000 bytes, 4-bit)</div>
                    <div class="address">$DC00-$DCFF</div>
                    <div class="description">CIA #1 (keyboard, joystick)</div>
                    <div class="address">$DD00-$DDFF</div>
                    <div class="description">CIA #2 (serial, timers, VIC bank)</div>
                </div>

                <div class="memory-block">
                    <h4>KERNAL ROM ($E000-$FFFF)</h4>
                    <div class="address">$E000-$FFFF</div>
                    <div class="description">KERNAL ROM (operating system)</div>
                    <div class="address">$FFFA-$FFFB</div>
                    <div class="description">NMI vector</div>
                    <div class="address">$FFFC-$FFFD</div>
                    <div class="description">RESET vector</div>
                    <div class="address">$FFFE-$FFFF</div>
                    <div class="description">IRQ/BRK vector</div>
                </div>
            </div>

            <div class="tip-box">
                <h4>💡 Memory Banking</h4>
                <p>The C64 uses memory banking to access 64K despite having ROM. Use locations $00 and $01 to control which memory is visible.</p>
            </div>

            <h3>Memory Configuration Values</h3>
            <table class="register-table">
                <thead>
                    <tr>
                        <th>Value</th>
                        <th>Configuration</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="address-col">$30</td>
                        <td class="name-col">RAM Only</td>
                        <td>All RAM, no ROM or I/O</td>
                    </tr>
                    <tr>
                        <td class="address-col">$35</td>
                        <td class="name-col">RAM + I/O</td>
                        <td>RAM with I/O registers visible</td>
                    </tr>
                    <tr>
                        <td class="address-col">$37</td>
                        <td class="name-col">Default</td>
                        <td>BASIC ROM, KERNAL ROM, I/O</td>
                    </tr>
                    <tr>
                        <td class="address-col">$3F</td>
                        <td class="name-col">All ROM</td>
                        <td>All ROM and I/O visible</td>
                    </tr>
                </tbody>
            </table>

            <h3>Important Memory Locations</h3>
            <div class="code-example">
                <pre><code><span class="comment">; Common PEEK/POKE locations</span>
<span class="address">53280</span> (<span class="address">$D020</span>)  <span class="comment">Border color</span>
<span class="address">53281</span> (<span class="address">$D021</span>)  <span class="comment">Background color</span>
<span class="address">53265</span> (<span class="address">$D011</span>)  <span class="comment">VIC control register 1</span>
<span class="address">53270</span> (<span class="address">$D016</span>)  <span class="comment">VIC control register 2</span>
<span class="address">53269</span> (<span class="address">$D015</span>)  <span class="comment">Sprite enable register</span>
<span class="address">56334</span> (<span class="address">$DC0E</span>)  <span class="comment">CIA timer control</span>
<span class="address">1024</span>  (<span class="address">$0400</span>)  <span class="comment">Screen RAM start</span>
<span class="address">55296</span> (<span class="address">$D800</span>)  <span class="comment">Color RAM start</span></code></pre>
            </div>
        `;
    }

    loadVICReferenceContent() {
        const content = document.getElementById('vic-reference-content');
        content.innerHTML = `
            <h2>📺 VIC-II Video Chip Reference</h2>
            <p>Complete reference for the VIC-II video chip, the heart of C64 graphics.</p>

            <h3>VIC-II Register Map ($D000-$D02E)</h3>
            <table class="register-table">
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Register</th>
                        <th>Description</th>
                        <th>Bits</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="address-col">$D000</td>
                        <td class="name-col">SPR0X</td>
                        <td>Sprite 0 X coordinate</td>
                        <td>0-7: X position (0-255)</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D001</td>
                        <td class="name-col">SPR0Y</td>
                        <td>Sprite 0 Y coordinate</td>
                        <td>0-7: Y position (0-255)</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D010</td>
                        <td class="name-col">MSIGX</td>
                        <td>Sprites 0-7 X MSB</td>
                        <td>0-7: X coordinate bit 8</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D011</td>
                        <td class="name-col">SCROLY</td>
                        <td>Control register 1</td>
                        <td>7: Raster bit 8, 6: ECM, 5: BMM, 4: DEN, 3: RSEL, 0-2: YSCROLL</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D012</td>
                        <td class="name-col">RASTER</td>
                        <td>Raster counter</td>
                        <td>0-7: Current raster line (0-255)</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D015</td>
                        <td class="name-col">SPENA</td>
                        <td>Sprite enable</td>
                        <td>0-7: Enable sprites 0-7</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D016</td>
                        <td class="name-col">SCROLX</td>
                        <td>Control register 2</td>
                        <td>4: MCM, 3: CSEL, 0-2: XSCROLL</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D018</td>
                        <td class="name-col">VMCSB</td>
                        <td>Memory pointers</td>
                        <td>7-4: Video matrix, 3-1: Character bank</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D019</td>
                        <td class="name-col">VICIRQ</td>
                        <td>Interrupt request</td>
                        <td>7: IRQ, 3: LP, 2: SSCOLL, 1: SBCOLL, 0: RST</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D01A</td>
                        <td class="name-col">IRQMASK</td>
                        <td>Interrupt enable</td>
                        <td>3: LP, 2: SSCOLL, 1: SBCOLL, 0: RST</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D020</td>
                        <td class="name-col">EXTCOL</td>
                        <td>Border color</td>
                        <td>0-3: Color index (0-15)</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D021</td>
                        <td class="name-col">BGCOL0</td>
                        <td>Background color 0</td>
                        <td>0-3: Color index (0-15)</td>
                    </tr>
                </tbody>
            </table>

            <h3>Graphics Modes</h3>
            <div class="memory-map-grid">
                <div class="memory-block">
                    <h4>Text Mode (Default)</h4>
                    <div class="description">40×25 characters, 16 colors per character</div>
                    <div class="address">Resolution:</div>
                    <div class="description">320×200 pixels</div>
                    <div class="address">Memory:</div>
                    <div class="description">1000 bytes screen + 1000 bytes color</div>
                </div>

                <div class="memory-block">
                    <h4>Multicolor Text Mode</h4>
                    <div class="description">40×25 characters, 4 colors per character</div>
                    <div class="address">Resolution:</div>
                    <div class="description">160×200 pixels (effective)</div>
                    <div class="address">Enable:</div>
                    <div class="description">Set bit 4 of $D016</div>
                </div>

                <div class="memory-block">
                    <h4>High-Resolution Bitmap</h4>
                    <div class="description">320×200 pixels, 2 colors per 8×8 cell</div>
                    <div class="address">Memory:</div>
                    <div class="description">8000 bytes bitmap + 1000 bytes color</div>
                    <div class="address">Enable:</div>
                    <div class="description">Set bit 5 of $D011</div>
                </div>

                <div class="memory-block">
                    <h4>Multicolor Bitmap</h4>
                    <div class="description">160×200 pixels, 4 colors per 4×8 cell</div>
                    <div class="address">Memory:</div>
                    <div class="description">8000 bytes bitmap + 1000 bytes color</div>
                    <div class="address">Enable:</div>
                    <div class="description">Set bits 4 and 5 of $D011 and $D016</div>
                </div>
            </div>

            <h3>Sprite Programming</h3>
            <div class="code-example">
                <h4>Basic Sprite Setup:</h4>
                <pre><code><span class="comment">; Enable sprite 0</span>
<span class="keyword">LDA</span> <span class="address">#$01</span>
<span class="keyword">STA</span> <span class="address">$D015</span>    <span class="comment">; Sprite enable register</span>

<span class="comment">; Set sprite 0 position</span>
<span class="keyword">LDA</span> <span class="address">#$80</span>
<span class="keyword">STA</span> <span class="address">$D000</span>    <span class="comment">; X coordinate</span>
<span class="keyword">LDA</span> <span class="address">#$60</span>
<span class="keyword">STA</span> <span class="address">$D001</span>    <span class="comment">; Y coordinate</span>

<span class="comment">; Set sprite color</span>
<span class="keyword">LDA</span> <span class="address">#$01</span>     <span class="comment">; White</span>
<span class="keyword">STA</span> <span class="address">$D027</span>    <span class="comment">; Sprite 0 color</span>

<span class="comment">; Set sprite data pointer</span>
<span class="keyword">LDA</span> <span class="address">#$80</span>     <span class="comment">; Sprite data at $2000</span>
<span class="keyword">STA</span> <span class="address">$07F8</span>    <span class="comment">; Sprite 0 pointer</span></code></pre>
            </div>

            <h3>Raster Programming</h3>
            <div class="tip-box">
                <h4>🎯 Raster Timing</h4>
                <p>The VIC-II draws 312 lines per frame (PAL) or 263 lines (NTSC). Use raster interrupts for precise timing and effects.</p>
            </div>

            <div class="code-example">
                <h4>Raster Interrupt Setup:</h4>
                <pre><code><span class="comment">; Set up raster interrupt</span>
<span class="keyword">SEI</span>              <span class="comment">; Disable interrupts</span>
<span class="keyword">LDA</span> <span class="address">#$7F</span>
<span class="keyword">STA</span> <span class="address">$DC0D</span>       <span class="comment">; Disable CIA interrupts</span>

<span class="keyword">LDA</span> <span class="address">#$01</span>
<span class="keyword">STA</span> <span class="address">$D01A</span>       <span class="comment">; Enable raster interrupt</span>

<span class="keyword">LDA</span> <span class="address">#$80</span>        <span class="comment">; Raster line 128</span>
<span class="keyword">STA</span> <span class="address">$D012</span>

<span class="keyword">LDA</span> <span class="address">$D011</span>
<span class="keyword">AND</span> <span class="address">#$7F</span>        <span class="comment">; Clear bit 8</span>
<span class="keyword">STA</span> <span class="address">$D011</span>

<span class="keyword">LDA</span> <span class="address">#&lt;IRQ_HANDLER</span>
<span class="keyword">STA</span> <span class="address">$0314</span>
<span class="keyword">LDA</span> <span class="address">#&gt;IRQ_HANDLER</span>
<span class="keyword">STA</span> <span class="address">$0315</span>

<span class="keyword">CLI</span>              <span class="comment">; Enable interrupts</span></code></pre>
            </div>

            <h3>Color Palette</h3>
            <div class="memory-map-grid">
                <div class="memory-block">
                    <h4>Standard Colors (0-7)</h4>
                    <div class="address">0: Black</div>
                    <div class="address">1: White</div>
                    <div class="address">2: Red</div>
                    <div class="address">3: Cyan</div>
                    <div class="address">4: Purple</div>
                    <div class="address">5: Green</div>
                    <div class="address">6: Blue</div>
                    <div class="address">7: Yellow</div>
                </div>

                <div class="memory-block">
                    <h4>Extended Colors (8-15)</h4>
                    <div class="address">8: Orange</div>
                    <div class="address">9: Brown</div>
                    <div class="address">10: Light Red</div>
                    <div class="address">11: Dark Grey</div>
                    <div class="address">12: Grey</div>
                    <div class="address">13: Light Green</div>
                    <div class="address">14: Light Blue</div>
                    <div class="address">15: Light Grey</div>
                </div>
            </div>
        `;
    }

    loadSIDReferenceContent() {
        const content = document.getElementById('sid-reference-content');
        content.innerHTML = `
            <h2>🎵 SID Sound Chip Reference</h2>
            <p>Complete reference for the SID 6581/8580 sound chip programming.</p>

            <h3>SID Register Map ($D400-$D41C)</h3>
            <table class="register-table">
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Register</th>
                        <th>Description</th>
                        <th>Range</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="address-col">$D400</td>
                        <td class="name-col">FREQ1LO</td>
                        <td>Voice 1 frequency low byte</td>
                        <td>0-255</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D401</td>
                        <td class="name-col">FREQ1HI</td>
                        <td>Voice 1 frequency high byte</td>
                        <td>0-255</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D402</td>
                        <td class="name-col">PW1LO</td>
                        <td>Voice 1 pulse width low byte</td>
                        <td>0-255</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D403</td>
                        <td class="name-col">PW1HI</td>
                        <td>Voice 1 pulse width high byte</td>
                        <td>0-15</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D404</td>
                        <td class="name-col">VCREG1</td>
                        <td>Voice 1 control register</td>
                        <td>Waveform and gate control</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D405</td>
                        <td class="name-col">ATDCY1</td>
                        <td>Voice 1 attack/decay</td>
                        <td>7-4: Attack, 3-0: Decay</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D406</td>
                        <td class="name-col">SUREL1</td>
                        <td>Voice 1 sustain/release</td>
                        <td>7-4: Sustain, 3-0: Release</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D415</td>
                        <td class="name-col">CUTLO</td>
                        <td>Filter cutoff low byte</td>
                        <td>0-7 (bits 2-0 used)</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D416</td>
                        <td class="name-col">CUTHI</td>
                        <td>Filter cutoff high byte</td>
                        <td>0-255</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D417</td>
                        <td class="name-col">RESON</td>
                        <td>Resonance/filter routing</td>
                        <td>7-4: Resonance, 3-0: Filter routing</td>
                    </tr>
                    <tr>
                        <td class="address-col">$D418</td>
                        <td class="name-col">SIGVOL</td>
                        <td>Filter mode/volume</td>
                        <td>7: Voice 3 off, 6-4: Filter mode, 3-0: Volume</td>
                    </tr>
                </tbody>
            </table>

            <h3>Waveforms and Control</h3>
            <div class="memory-map-grid">
                <div class="memory-block">
                    <h4>Control Register Bits ($D404)</h4>
                    <div class="address">Bit 0:</div>
                    <div class="description">Gate (1=on, 0=release)</div>
                    <div class="address">Bit 1:</div>
                    <div class="description">Sync (hard sync with previous voice)</div>
                    <div class="address">Bit 2:</div>
                    <div class="description">Ring modulation</div>
                    <div class="address">Bit 3:</div>
                    <div class="description">Test (disable oscillator)</div>
                    <div class="address">Bit 4:</div>
                    <div class="description">Triangle waveform</div>
                    <div class="address">Bit 5:</div>
                    <div class="description">Sawtooth waveform</div>
                    <div class="address">Bit 6:</div>
                    <div class="description">Pulse waveform</div>
                    <div class="address">Bit 7:</div>
                    <div class="description">Noise waveform</div>
                </div>

                <div class="memory-block">
                    <h4>ADSR Envelope</h4>
                    <div class="address">Attack:</div>
                    <div class="description">Time to reach peak volume (0-15)</div>
                    <div class="address">Decay:</div>
                    <div class="description">Time to reach sustain level (0-15)</div>
                    <div class="address">Sustain:</div>
                    <div class="description">Volume level during sustain (0-15)</div>
                    <div class="address">Release:</div>
                    <div class="description">Time to fade to zero (0-15)</div>
                </div>
            </div>

            <h3>Frequency Calculation</h3>
            <div class="tip-box">
                <h4>🎼 Frequency Formula</h4>
                <p>Frequency = (Register Value × Clock) / 16777216<br>
                For PAL: Clock = 985248 Hz<br>
                For NTSC: Clock = 1022727 Hz</p>
            </div>

            <h3>Note Frequency Table (PAL)</h3>
            <table class="register-table">
                <thead>
                    <tr>
                        <th>Note</th>
                        <th>Octave 1</th>
                        <th>Octave 2</th>
                        <th>Octave 3</th>
                        <th>Octave 4</th>
                        <th>Octave 5</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="name-col">C</td>
                        <td class="address-col">$0117</td>
                        <td class="address-col">$022E</td>
                        <td class="address-col">$045C</td>
                        <td class="address-col">$08B8</td>
                        <td class="address-col">$1170</td>
                    </tr>
                    <tr>
                        <td class="name-col">C#</td>
                        <td class="address-col">$0127</td>
                        <td class="address-col">$024E</td>
                        <td class="address-col">$049C</td>
                        <td class="address-col">$0938</td>
                        <td class="address-col">$1270</td>
                    </tr>
                    <tr>
                        <td class="name-col">D</td>
                        <td class="address-col">$0139</td>
                        <td class="address-col">$0272</td>
                        <td class="address-col">$04E4</td>
                        <td class="address-col">$09C8</td>
                        <td class="address-col">$1390</td>
                    </tr>
                    <tr>
                        <td class="name-col">D#</td>
                        <td class="address-col">$014B</td>
                        <td class="address-col">$0296</td>
                        <td class="address-col">$052C</td>
                        <td class="address-col">$0A58</td>
                        <td class="address-col">$14B0</td>
                    </tr>
                    <tr>
                        <td class="name-col">E</td>
                        <td class="address-col">$015F</td>
                        <td class="address-col">$02BE</td>
                        <td class="address-col">$057C</td>
                        <td class="address-col">$0AF8</td>
                        <td class="address-col">$15F0</td>
                    </tr>
                    <tr>
                        <td class="name-col">F</td>
                        <td class="address-col">$0174</td>
                        <td class="address-col">$02E8</td>
                        <td class="address-col">$05D0</td>
                        <td class="address-col">$0BA0</td>
                        <td class="address-col">$1740</td>
                    </tr>
                    <tr>
                        <td class="name-col">F#</td>
                        <td class="address-col">$018A</td>
                        <td class="address-col">$0314</td>
                        <td class="address-col">$0628</td>
                        <td class="address-col">$0C50</td>
                        <td class="address-col">$18A0</td>
                    </tr>
                    <tr>
                        <td class="name-col">G</td>
                        <td class="address-col">$01A1</td>
                        <td class="address-col">$0342</td>
                        <td class="address-col">$0684</td>
                        <td class="address-col">$0D08</td>
                        <td class="address-col">$1A10</td>
                    </tr>
                    <tr>
                        <td class="name-col">G#</td>
                        <td class="address-col">$01BA</td>
                        <td class="address-col">$0374</td>
                        <td class="address-col">$06E8</td>
                        <td class="address-col">$0DD0</td>
                        <td class="address-col">$1BA0</td>
                    </tr>
                    <tr>
                        <td class="name-col">A</td>
                        <td class="address-col">$01D4</td>
                        <td class="address-col">$03A8</td>
                        <td class="address-col">$0750</td>
                        <td class="address-col">$0EA0</td>
                        <td class="address-col">$1D40</td>
                    </tr>
                    <tr>
                        <td class="name-col">A#</td>
                        <td class="address-col">$01F0</td>
                        <td class="address-col">$03E0</td>
                        <td class="address-col">$07C0</td>
                        <td class="address-col">$0F80</td>
                        <td class="address-col">$1F00</td>
                    </tr>
                    <tr>
                        <td class="name-col">B</td>
                        <td class="address-col">$020E</td>
                        <td class="address-col">$041C</td>
                        <td class="address-col">$0838</td>
                        <td class="address-col">$1070</td>
                        <td class="address-col">$20E0</td>
                    </tr>
                </tbody>
            </table>

            <h3>Programming Examples</h3>
            <div class="code-example">
                <h4>Play a Simple Note:</h4>
                <pre><code><span class="comment">; Play middle C (C-4) on voice 1</span>
<span class="keyword">LDA</span> <span class="address">#$B8</span>        <span class="comment">; Frequency low byte</span>
<span class="keyword">STA</span> <span class="address">$D400</span>
<span class="keyword">LDA</span> <span class="address">#$08</span>        <span class="comment">; Frequency high byte</span>
<span class="keyword">STA</span> <span class="address">$D401</span>

<span class="comment">; Set ADSR envelope</span>
<span class="keyword">LDA</span> <span class="address">#$09</span>        <span class="comment">; Attack=0, Decay=9</span>
<span class="keyword">STA</span> <span class="address">$D405</span>
<span class="keyword">LDA</span> <span class="address">#$00</span>        <span class="comment">; Sustain=0, Release=0</span>
<span class="keyword">STA</span> <span class="address">$D406</span>

<span class="comment">; Start note with triangle wave</span>
<span class="keyword">LDA</span> <span class="address">#$11</span>        <span class="comment">; Triangle + Gate</span>
<span class="keyword">STA</span> <span class="address">$D404</span>

<span class="comment">; Set volume</span>
<span class="keyword">LDA</span> <span class="address">#$0F</span>        <span class="comment">; Maximum volume</span>
<span class="keyword">STA</span> <span class="address">$D418</span></code></pre>
            </div>

            <div class="code-example">
                <h4>Filter Programming:</h4>
                <pre><code><span class="comment">; Set up low-pass filter</span>
<span class="keyword">LDA</span> <span class="address">#$00</span>        <span class="comment">; Cutoff low (bits 2-0)</span>
<span class="keyword">STA</span> <span class="address">$D415</span>
<span class="keyword">LDA</span> <span class="address">#$80</span>        <span class="comment">; Cutoff high</span>
<span class="keyword">STA</span> <span class="address">$D416</span>

<span class="comment">; Set resonance and routing</span>
<span class="keyword">LDA</span> <span class="address">#$F1</span>        <span class="comment">; Max resonance, filter voice 1</span>
<span class="keyword">STA</span> <span class="address">$D417</span>

<span class="comment">; Enable low-pass filter</span>
<span class="keyword">LDA</span> <span class="address">#$1F</span>        <span class="comment">; LP filter + max volume</span>
<span class="keyword">STA</span> <span class="address">$D418</span></code></pre>
            </div>

            <div class="warning-box">
                <h4>⚠️ SID Chip Differences</h4>
                <p>The 6581 (early C64s) and 8580 (later C64s) have different filter characteristics. The 6581 has a warmer, more analog sound, while the 8580 is cleaner but can sound harsher.</p>
            </div>
        `;
    }

    loadBASICCommandsContent() {
        const content = document.getElementById('basic-commands-content');
        content.innerHTML = `
            <h2>💻 BASIC V2 Command Reference</h2>
            <p>Complete reference for Commodore BASIC V2 commands and functions.</p>

            <h3>Program Control Commands</h3>
            <div class="command-grid">
                <div class="command-card">
                    <h4>RUN</h4>
                    <div class="syntax">RUN [line number]</div>
                    <div class="description">Executes the program from the beginning or specified line number.</div>
                </div>

                <div class="command-card">
                    <h4>GOTO</h4>
                    <div class="syntax">GOTO line number</div>
                    <div class="description">Jumps to the specified line number unconditionally.</div>
                </div>

                <div class="command-card">
                    <h4>GOSUB</h4>
                    <div class="syntax">GOSUB line number</div>
                    <div class="description">Calls a subroutine at the specified line number.</div>
                </div>

                <div class="command-card">
                    <h4>RETURN</h4>
                    <div class="syntax">RETURN</div>
                    <div class="description">Returns from a subroutine called by GOSUB.</div>
                </div>

                <div class="command-card">
                    <h4>IF...THEN</h4>
                    <div class="syntax">IF condition THEN statement</div>
                    <div class="description">Executes statement if condition is true.</div>
                </div>

                <div class="command-card">
                    <h4>FOR...NEXT</h4>
                    <div class="syntax">FOR var=start TO end [STEP increment]</div>
                    <div class="description">Creates a loop with automatic counter increment.</div>
                </div>

                <div class="command-card">
                    <h4>END</h4>
                    <div class="syntax">END</div>
                    <div class="description">Terminates program execution.</div>
                </div>

                <div class="command-card">
                    <h4>STOP</h4>
                    <div class="syntax">STOP</div>
                    <div class="description">Pauses program execution (can be continued with CONT).</div>
                </div>
            </div>

            <h3>Input/Output Commands</h3>
            <div class="command-grid">
                <div class="command-card">
                    <h4>PRINT</h4>
                    <div class="syntax">PRINT [expression][;|,][expression]...</div>
                    <div class="description">Displays text and values on screen. Use ; for no space, , for tab spacing.</div>
                </div>

                <div class="command-card">
                    <h4>INPUT</h4>
                    <div class="syntax">INPUT ["prompt";] variable</div>
                    <div class="description">Reads input from keyboard into a variable.</div>
                </div>

                <div class="command-card">
                    <h4>GET</h4>
                    <div class="syntax">GET variable</div>
                    <div class="description">Reads a single character from keyboard (non-blocking).</div>
                </div>

                <div class="command-card">
                    <h4>POKE</h4>
                    <div class="syntax">POKE address, value</div>
                    <div class="description">Stores a byte value at the specified memory address.</div>
                </div>

                <div class="command-card">
                    <h4>PEEK</h4>
                    <div class="syntax">PEEK(address)</div>
                    <div class="description">Returns the byte value at the specified memory address.</div>
                </div>

                <div class="command-card">
                    <h4>SYS</h4>
                    <div class="syntax">SYS address</div>
                    <div class="description">Calls machine language routine at specified address.</div>
                </div>
            </div>

            <h3>Data and Variables</h3>
            <div class="command-grid">
                <div class="command-card">
                    <h4>LET</h4>
                    <div class="syntax">LET variable = expression</div>
                    <div class="description">Assigns a value to a variable (LET is optional).</div>
                </div>

                <div class="command-card">
                    <h4>DIM</h4>
                    <div class="syntax">DIM array(size[,size...])</div>
                    <div class="description">Declares an array with specified dimensions.</div>
                </div>

                <div class="command-card">
                    <h4>DATA</h4>
                    <div class="syntax">DATA value1, value2, value3...</div>
                    <div class="description">Stores data values to be read by READ statements.</div>
                </div>

                <div class="command-card">
                    <h4>READ</h4>
                    <div class="syntax">READ variable1[, variable2...]</div>
                    <div class="description">Reads values from DATA statements into variables.</div>
                </div>

                <div class="command-card">
                    <h4>RESTORE</h4>
                    <div class="syntax">RESTORE [line number]</div>
                    <div class="description">Resets the DATA pointer to the beginning or specified line.</div>
                </div>
            </div>

            <h3>String Functions</h3>
            <div class="command-grid">
                <div class="command-card">
                    <h4>LEFT$</h4>
                    <div class="syntax">LEFT$(string, length)</div>
                    <div class="description">Returns leftmost characters of a string.</div>
                </div>

                <div class="command-card">
                    <h4>RIGHT$</h4>
                    <div class="syntax">RIGHT$(string, length)</div>
                    <div class="description">Returns rightmost characters of a string.</div>
                </div>

                <div class="command-card">
                    <h4>MID$</h4>
                    <div class="syntax">MID$(string, start[, length])</div>
                    <div class="description">Returns substring starting at specified position.</div>
                </div>

                <div class="command-card">
                    <h4>LEN</h4>
                    <div class="syntax">LEN(string)</div>
                    <div class="description">Returns the length of a string.</div>
                </div>

                <div class="command-card">
                    <h4>CHR$</h4>
                    <div class="syntax">CHR$(code)</div>
                    <div class="description">Returns character with specified ASCII/PETSCII code.</div>
                </div>

                <div class="command-card">
                    <h4>ASC</h4>
                    <div class="syntax">ASC(string)</div>
                    <div class="description">Returns ASCII/PETSCII code of first character.</div>
                </div>

                <div class="command-card">
                    <h4>STR$</h4>
                    <div class="syntax">STR$(number)</div>
                    <div class="description">Converts a number to its string representation.</div>
                </div>

                <div class="command-card">
                    <h4>VAL</h4>
                    <div class="syntax">VAL(string)</div>
                    <div class="description">Converts a string to its numeric value.</div>
                </div>
            </div>

            <h3>Mathematical Functions</h3>
            <div class="command-grid">
                <div class="command-card">
                    <h4>ABS</h4>
                    <div class="syntax">ABS(number)</div>
                    <div class="description">Returns absolute value of a number.</div>
                </div>

                <div class="command-card">
                    <h4>INT</h4>
                    <div class="syntax">INT(number)</div>
                    <div class="description">Returns integer part of a number (truncates).</div>
                </div>

                <div class="command-card">
                    <h4>RND</h4>
                    <div class="syntax">RND(x)</div>
                    <div class="description">Returns random number 0-1. Use RND(1) for new random number.</div>
                </div>

                <div class="command-card">
                    <h4>SQR</h4>
                    <div class="syntax">SQR(number)</div>
                    <div class="description">Returns square root of a number.</div>
                </div>

                <div class="command-card">
                    <h4>SIN</h4>
                    <div class="syntax">SIN(angle)</div>
                    <div class="description">Returns sine of angle in radians.</div>
                </div>

                <div class="command-card">
                    <h4>COS</h4>
                    <div class="syntax">COS(angle)</div>
                    <div class="description">Returns cosine of angle in radians.</div>
                </div>

                <div class="command-card">
                    <h4>TAN</h4>
                    <div class="syntax">TAN(angle)</div>
                    <div class="description">Returns tangent of angle in radians.</div>
                </div>

                <div class="command-card">
                    <h4>ATN</h4>
                    <div class="syntax">ATN(number)</div>
                    <div class="description">Returns arctangent in radians.</div>
                </div>

                <div class="command-card">
                    <h4>LOG</h4>
                    <div class="syntax">LOG(number)</div>
                    <div class="description">Returns natural logarithm.</div>
                </div>

                <div class="command-card">
                    <h4>EXP</h4>
                    <div class="syntax">EXP(number)</div>
                    <div class="description">Returns e raised to the power of number.</div>
                </div>

                <div class="command-card">
                    <h4>SGN</h4>
                    <div class="syntax">SGN(number)</div>
                    <div class="description">Returns sign of number (-1, 0, or 1).</div>
                </div>
            </div>

            <h3>File Operations</h3>
            <div class="command-grid">
                <div class="command-card">
                    <h4>LOAD</h4>
                    <div class="syntax">LOAD "filename"[,device[,secondary]]</div>
                    <div class="description">Loads a program from disk or tape.</div>
                </div>

                <div class="command-card">
                    <h4>SAVE</h4>
                    <div class="syntax">SAVE "filename"[,device[,secondary]]</div>
                    <div class="description">Saves current program to disk or tape.</div>
                </div>

                <div class="command-card">
                    <h4>VERIFY</h4>
                    <div class="syntax">VERIFY "filename"[,device]</div>
                    <div class="description">Compares program in memory with file on disk/tape.</div>
                </div>

                <div class="command-card">
                    <h4>OPEN</h4>
                    <div class="syntax">OPEN file#, device[, secondary[, "filename"]]</div>
                    <div class="description">Opens a file for input/output operations.</div>
                </div>

                <div class="command-card">
                    <h4>CLOSE</h4>
                    <div class="syntax">CLOSE file#</div>
                    <div class="description">Closes an opened file.</div>
                </div>
            </div>

            <h3>Program Development Commands</h3>
            <div class="command-grid">
                <div class="command-card">
                    <h4>LIST</h4>
                    <div class="syntax">LIST [start[-end]]</div>
                    <div class="description">Displays program lines on screen.</div>
                </div>

                <div class="command-card">
                    <h4>NEW</h4>
                    <div class="syntax">NEW</div>
                    <div class="description">Clears program from memory.</div>
                </div>

                <div class="command-card">
                    <h4>CLR</h4>
                    <div class="syntax">CLR</div>
                    <div class="description">Clears all variables and arrays.</div>
                </div>

                <div class="command-card">
                    <h4>CONT</h4>
                    <div class="syntax">CONT</div>
                    <div class="description">Continues execution after STOP.</div>
                </div>
            </div>

            <h3>Common Programming Patterns</h3>
            <div class="code-example">
                <h4>Game Loop Structure:</h4>
                <pre><code><span class="basic-number">10</span> <span class="basic-comment">REM *** GAME INITIALIZATION ***</span>
<span class="basic-number">20</span> <span class="basic-keyword">POKE</span> <span class="basic-number">53280</span>,<span class="basic-number">0</span>: <span class="basic-keyword">POKE</span> <span class="basic-number">53281</span>,<span class="basic-number">0</span>
<span class="basic-number">30</span> <span class="basic-keyword">DIM</span> <span class="basic-variable">PX</span>(<span class="basic-number">8</span>),<span class="basic-variable">PY</span>(<span class="basic-number">8</span>): <span class="basic-comment">REM PLAYER POSITIONS</span>
<span class="basic-number">40</span> <span class="basic-variable">SC</span>=<span class="basic-number">0</span>: <span class="basic-variable">LV</span>=<span class="basic-number">1</span>: <span class="basic-variable">LI</span>=<span class="basic-number">3</span>
<span class="basic-number">50</span> <span class="basic-comment">REM *** MAIN GAME LOOP ***</span>
<span class="basic-number">60</span> <span class="basic-keyword">GET</span> <span class="basic-variable">K$</span>: <span class="basic-keyword">IF</span> <span class="basic-variable">K$</span>=<span class="basic-string">""</span> <span class="basic-keyword">THEN</span> <span class="basic-number">80</span>
<span class="basic-number">70</span> <span class="basic-keyword">GOSUB</span> <span class="basic-number">200</span>: <span class="basic-comment">REM HANDLE INPUT</span>
<span class="basic-number">80</span> <span class="basic-keyword">GOSUB</span> <span class="basic-number">300</span>: <span class="basic-comment">REM UPDATE GAME</span>
<span class="basic-number">90</span> <span class="basic-keyword">GOSUB</span> <span class="basic-number">400</span>: <span class="basic-comment">REM DRAW SCREEN</span>
<span class="basic-number">100</span> <span class="basic-keyword">IF</span> <span class="basic-variable">LI</span>&gt;<span class="basic-number">0</span> <span class="basic-keyword">THEN</span> <span class="basic-number">60</span>
<span class="basic-number">110</span> <span class="basic-keyword">PRINT</span> <span class="basic-string">"GAME OVER"</span>: <span class="basic-keyword">END</span></code></pre>
            </div>

            <div class="tip-box">
                <h4>💡 Optimization Tips</h4>
                <p>Use single-letter variables for speed. Store frequently used values in variables. Use PEEK/POKE for direct hardware access. Minimize string operations in loops.</p>
            </div>
        `;
    }

    loadProgrammingTipsContent() {
        const content = document.getElementById('programming-tips-content');
        content.innerHTML = `
            <h2>🎯 Advanced C64 Programming Tips</h2>
            <p>Professional techniques and best practices for efficient C64 development.</p>

            <div class="workflow-section">
                <h3>🚀 Performance Optimization</h3>
                
                <h4>BASIC Optimization Techniques</h4>
                <ul>
                    <li><strong>Variable Names:</strong> Use single-letter variables (A, B, X, Y) for maximum speed</li>
                    <li><strong>Line Numbers:</strong> Use increments of 10 for easy insertion of new lines</li>
                    <li><strong>Loop Optimization:</strong> Minimize operations inside FOR loops</li>
                    <li><strong>String Handling:</strong> Avoid string concatenation in loops</li>
                    <li><strong>Memory Access:</strong> Use PEEK/POKE for direct hardware control</li>
                </ul>

                <div class="code-example">
                    <h4>Fast vs Slow BASIC Code:</h4>
                    <pre><code><span class="comment">; SLOW - Long variable names, string operations</span>
<span class="basic-number">10</span> <span class="basic-keyword">FOR</span> <span class="basic-variable">COUNTER</span>=<span class="basic-number">1</span> <span class="basic-keyword">TO</span> <span class="basic-number">1000</span>
<span class="basic-number">20</span> <span class="basic-variable">PLAYER_NAME$</span>=<span class="basic-variable">PLAYER_NAME$</span>+<span class="basic-string">"*"</span>
<span class="basic-number">30</span> <span class="basic-keyword">NEXT</span> <span class="basic-variable">COUNTER</span>

<span class="comment">; FAST - Single letters, direct memory access</span>
<span class="basic-number">10</span> <span class="basic-keyword">FOR</span> <span class="basic-variable">I</span>=<span class="basic-number">1024</span> <span class="basic-keyword">TO</span> <span class="basic-number">2023</span>
<span class="basic-number">20</span> <span class="basic-keyword">POKE</span> <span class="basic-variable">I</span>,<span class="basic-number">42</span>: <span class="basic-comment">REM ASTERISK CHARACTER</span>
<span class="basic-number">30</span> <span class="basic-keyword">NEXT</span></code></pre>
                </div>
            </div>

            <div class="workflow-section">
                <h3>🎮 Game Programming Patterns</h3>
                
                <h4>State Machine Implementation</h4>
                <div class="code-example">
                    <pre><code><span class="basic-number">10</span> <span class="basic-variable">GS</span>=<span class="basic-number">0</span>: <span class="basic-comment">REM GAME STATE (0=MENU, 1=PLAY, 2=OVER)</span>
<span class="basic-number">20</span> <span class="basic-keyword">ON</span> <span class="basic-variable">GS</span>+<span class="basic-number">1</span> <span class="basic-keyword">GOSUB</span> <span class="basic-number">100</span>,<span class="basic-number">200</span>,<span class="basic-number">300</span>
<span class="basic-number">30</span> <span class="basic-keyword">GOTO</span> <span class="basic-number">20</span>
<span class="basic-number">100</span> <span class="basic-comment">REM MENU STATE</span>
<span class="basic-number">110</span> <span class="basic-keyword">PRINT</span> <span class="basic-string">"PRESS SPACE TO START"</span>
<span class="basic-number">120</span> <span class="basic-keyword">GET</span> <span class="basic-variable">K$</span>: <span class="basic-keyword">IF</span> <span class="basic-variable">K$</span>=<span class="basic-string">" "</span> <span class="basic-keyword">THEN</span> <span class="basic-variable">GS</span>=<span class="basic-number">1</span>
<span class="basic-number">130</span> <span class="basic-keyword">RETURN</span></code></pre>
                </div>

                <h4>Sprite Movement Patterns</h4>
                <div class="code-example">
                    <pre><code><span class="comment">; Smooth sprite movement with bounds checking</span>
<span class="basic-number">10</span> <span class="basic-variable">X</span>=<span class="basic-number">160</span>: <span class="basic-variable">Y</span>=<span class="basic-number">100</span>: <span class="basic-comment">REM SPRITE POSITION</span>
<span class="basic-number">20</span> <span class="basic-variable">DX</span>=<span class="basic-number">1</span>: <span class="basic-variable">DY</span>=<span class="basic-number">1</span>: <span class="basic-comment">REM VELOCITY</span>
<span class="basic-number">30</span> <span class="basic-variable">X</span>=<span class="basic-variable">X</span>+<span class="basic-variable">DX</span>: <span class="basic-variable">Y</span>=<span class="basic-variable">Y</span>+<span class="basic-variable">DY</span>
<span class="basic-number">40</span> <span class="basic-keyword">IF</span> <span class="basic-variable">X</span>&lt;<span class="basic-number">24</span> <span class="basic-keyword">OR</span> <span class="basic-variable">X</span>&gt;<span class="basic-number">320</span> <span class="basic-keyword">THEN</span> <span class="basic-variable">DX</span>=-<span class="basic-variable">DX</span>
<span class="basic-number">50</span> <span class="basic-keyword">IF</span> <span class="basic-variable">Y</span>&lt;<span class="basic-number">50</span> <span class="basic-keyword">OR</span> <span class="basic-variable">Y</span>&gt;<span class="basic-number">229</span> <span class="basic-keyword">THEN</span> <span class="basic-variable">DY</span>=-<span class="basic-variable">DY</span>
<span class="basic-number">60</span> <span class="basic-keyword">POKE</span> <span class="basic-number">53248</span>,<span class="basic-variable">X</span>: <span class="basic-keyword">POKE</span> <span class="basic-number">53249</span>,<span class="basic-variable">Y</span></code></pre>
                </div>
            </div>

            <div class="workflow-section">
                <h3>🎨 Graphics Programming</h3>
                
                <h4>Character Set Animation</h4>
                <ul>
                    <li><strong>Character Redefinition:</strong> Change character patterns for animation</li>
                    <li><strong>Color Cycling:</strong> Animate by changing color RAM values</li>
                    <li><strong>Scrolling:</strong> Use hardware scrolling registers for smooth movement</li>
                    <li><strong>Raster Effects:</strong> Change colors mid-screen for more colors</li>
                </ul>

                <div class="code-example">
                    <h4>Simple Color Cycling:</h4>
                    <pre><code><span class="basic-number">10</span> <span class="basic-keyword">FOR</span> <span class="basic-variable">I</span>=<span class="basic-number">55296</span> <span class="basic-keyword">TO</span> <span class="basic-number">56295</span>: <span class="basic-comment">REM COLOR RAM</span>
<span class="basic-number">20</span> <span class="basic-variable">C</span>=<span class="basic-keyword">PEEK</span>(<span class="basic-variable">I</span>): <span class="basic-variable">C</span>=<span class="basic-variable">C</span>+<span class="basic-number">1</span>: <span class="basic-keyword">IF</span> <span class="basic-variable">C</span>&gt;<span class="basic-number">15</span> <span class="basic-keyword">THEN</span> <span class="basic-variable">C</span>=<span class="basic-number">0</span>
<span class="basic-number">30</span> <span class="basic-keyword">POKE</span> <span class="basic-variable">I</span>,<span class="basic-variable">C</span>: <span class="basic-keyword">NEXT</span></code></pre>
                </div>

                <h4>Sprite Multiplexing Concept</h4>
                <div class="tip-box">
                    <h4>🎯 Hardware Limitation Workaround</h4>
                    <p>The C64 can only display 8 sprites per frame, but you can show more by rapidly moving sprites during the frame (multiplexing). This requires precise timing and assembly language.</p>
                </div>
            </div>

            <div class="workflow-section">
                <h3>🎵 Audio Programming</h3>
                
                <h4>Music and Sound Effect Techniques</h4>
                <ul>
                    <li><strong>Arpeggios:</strong> Rapidly change frequencies for chord effects</li>
                    <li><strong>Vibrato:</strong> Slightly modulate frequency for realistic instruments</li>
                    <li><strong>Portamento:</strong> Slide between frequencies smoothly</li>
                    <li><strong>Percussion:</strong> Use noise waveform with short envelopes</li>
                    <li><strong>Echo Effects:</strong> Use voice 3 as a delayed copy</li>
                </ul>

                <div class="code-example">
                    <h4>Simple Sound Effect:</h4>
                    <pre><code><span class="comment">; Explosion sound effect</span>
<span class="basic-number">10</span> <span class="basic-keyword">FOR</span> <span class="basic-variable">F</span>=<span class="basic-number">255</span> <span class="basic-keyword">TO</span> <span class="basic-number">0</span> <span class="basic-keyword">STEP</span> -<span class="basic-number">5</span>
<span class="basic-number">20</span> <span class="basic-keyword">POKE</span> <span class="basic-number">54296</span>,<span class="basic-number">129</span>: <span class="basic-comment">REM NOISE WAVEFORM</span>
<span class="basic-number">30</span> <span class="basic-keyword">POKE</span> <span class="basic-number">54272</span>,<span class="basic-variable">F</span>: <span class="basic-comment">REM FREQUENCY</span>
<span class="basic-number">40</span> <span class="basic-keyword">POKE</span> <span class="basic-number">54296</span>,<span class="basic-number">128</span>: <span class="basic-comment">REM GATE OFF</span>
<span class="basic-number">50</span> <span class="basic-keyword">NEXT</span></code></pre>
                </div>
            </div>

            <div class="workflow-section">
                <h3>🔧 Hardware Programming</h3>
                
                <h4>Direct Hardware Access</h4>
                <div class="memory-map-grid">
                    <div class="memory-block">
                        <h4>Essential POKE Locations</h4>
                        <div class="address">POKE 53280,color</div>
                        <div class="description">Border color</div>
                        <div class="address">POKE 53281,color</div>
                        <div class="description">Background color</div>
                        <div class="address">POKE 53269,value</div>
                        <div class="description">Enable sprites (bits 0-7)</div>
                        <div class="address">POKE 53287,color</div>
                        <div class="description">Sprite 0 color</div>
                    </div>

                    <div class="memory-block">
                        <h4>Joystick Reading</h4>
                        <div class="address">PEEK(56320) AND 16</div>
                        <div class="description">Fire button (0=pressed)</div>
                        <div class="address">PEEK(56320) AND 1</div>
                        <div class="description">Up direction (0=pressed)</div>
                        <div class="address">PEEK(56320) AND 2</div>
                        <div class="description">Down direction (0=pressed)</div>
                        <div class="address">PEEK(56320) AND 4</div>
                        <div class="description">Left direction (0=pressed)</div>
                        <div class="address">PEEK(56320) AND 8</div>
                        <div class="description">Right direction (0=pressed)</div>
                    </div>
                </div>

                <div class="code-example">
                    <h4>Joystick Input Handler:</h4>
                    <pre><code><span class="basic-number">10</span> <span class="basic-variable">J</span>=<span class="basic-keyword">PEEK</span>(<span class="basic-number">56320</span>): <span class="basic-comment">REM READ JOYSTICK</span>
<span class="basic-number">20</span> <span class="basic-keyword">IF</span> (<span class="basic-variable">J</span> <span class="basic-keyword">AND</span> <span class="basic-number">1</span>)=<span class="basic-number">0</span> <span class="basic-keyword">THEN</span> <span class="basic-variable">Y</span>=<span class="basic-variable">Y</span>-<span class="basic-number">1</span>: <span class="basic-comment">REM UP</span>
<span class="basic-number">30</span> <span class="basic-keyword">IF</span> (<span class="basic-variable">J</span> <span class="basic-keyword">AND</span> <span class="basic-number">2</span>)=<span class="basic-number">0</span> <span class="basic-keyword">THEN</span> <span class="basic-variable">Y</span>=<span class="basic-variable">Y</span>+<span class="basic-number">1</span>: <span class="basic-comment">REM DOWN</span>
<span class="basic-number">40</span> <span class="basic-keyword">IF</span> (<span class="basic-variable">J</span> <span class="basic-keyword">AND</span> <span class="basic-number">4</span>)=<span class="basic-number">0</span> <span class="basic-keyword">THEN</span> <span class="basic-variable">X</span>=<span class="basic-variable">X</span>-<span class="basic-number">1</span>: <span class="basic-comment">REM LEFT</span>
<span class="basic-number">50</span> <span class="basic-keyword">IF</span> (<span class="basic-variable">J</span> <span class="basic-keyword">AND</span> <span class="basic-number">8</span>)=<span class="basic-number">0</span> <span class="basic-keyword">THEN</span> <span class="basic-variable">X</span>=<span class="basic-variable">X</span>+<span class="basic-number">1</span>: <span class="basic-comment">REM RIGHT</span>
<span class="basic-number">60</span> <span class="basic-keyword">IF</span> (<span class="basic-variable">J</span> <span class="basic-keyword">AND</span> <span class="basic-number">16</span>)=<span class="basic-number">0</span> <span class="basic-keyword">THEN</span> <span class="basic-keyword">GOSUB</span> <span class="basic-number">1000</span>: <span class="basic-comment">REM FIRE</span></code></pre>
                </div>
            </div>

            <div class="workflow-section">
                <h3>🐛 Debugging Techniques</h3>
                
                <h4>Common Debugging Strategies</h4>
                <ul>
                    <li><strong>Print Debugging:</strong> Use PRINT statements to trace program flow</li>
                    <li><strong>Step Through:</strong> Use STOP statements to pause execution</li>
                    <li><strong>Variable Monitoring:</strong> Display key variables on screen</li>
                    <li><strong>Memory Inspection:</strong> Use PEEK to check memory contents</li>
                    <li><strong>Border Flashing:</strong> Change border color to mark code sections</li>
                </ul>

                <div class="code-example">
                    <h4>Debug Display:</h4>
                    <pre><code><span class="basic-number">10</span> <span class="basic-keyword">PRINT</span> <span class="basic-string">"</span><span class="basic-string">DEBUG: X="</span><span class="basic-variable">X</span><span class="basic-string">" Y="</span><span class="basic-variable">Y</span><span class="basic-string">" SCORE="</span><span class="basic-variable">SC</span>
<span class="basic-number">20</span> <span class="basic-keyword">POKE</span> <span class="basic-number">53280</span>,<span class="basic-number">2</span>: <span class="basic-comment">REM RED BORDER = CHECKPOINT</span>
<span class="basic-number">30</span> <span class="basic-keyword">FOR</span> <span class="basic-variable">I</span>=<span class="basic-number">1</span> <span class="basic-keyword">TO</span> <span class="basic-number">100</span>: <span class="basic-keyword">NEXT</span>: <span class="basic-comment">REM DELAY</span>
<span class="basic-number">40</span> <span class="basic-keyword">POKE</span> <span class="basic-number">53280</span>,<span class="basic-number">0</span>: <span class="basic-comment">REM BACK TO BLACK</span></code></pre>
                </div>
            </div>

            <div class="workflow-section">
                <h3>📚 Advanced Techniques</h3>
                
                <h4>Memory Management</h4>
                <ul>
                    <li><strong>String Space:</strong> Use CLR to free string memory</li>
                    <li><strong>Array Optimization:</strong> Use single-dimension arrays when possible</li>
                    <li><strong>Code Compression:</strong> Use multiple statements per line with colons</li>
                    <li><strong>Data Packing:</strong> Store multiple values in single variables using bit operations</li>
                </ul>

                <h4>Hybrid Programming</h4>
                <div class="tip-box">
                    <h4>🔗 BASIC + Assembly</h4>
                    <p>Use BASIC for game logic and assembly for time-critical routines. Call assembly with SYS command and pass parameters through memory locations.</p>
                </div>

                <div class="code-example">
                    <h4>Calling Assembly from BASIC:</h4>
                    <pre><code><span class="basic-number">10</span> <span class="basic-keyword">POKE</span> <span class="basic-number">828</span>,<span class="basic-variable">X</span>: <span class="basic-keyword">POKE</span> <span class="basic-number">829</span>,<span class="basic-variable">Y</span>: <span class="basic-comment">REM PASS PARAMETERS</span>
<span class="basic-number">20</span> <span class="basic-keyword">SYS</span> <span class="basic-number">49152</span>: <span class="basic-comment">REM CALL ASSEMBLY ROUTINE</span>
<span class="basic-number">30</span> <span class="basic-variable">RESULT</span>=<span class="basic-keyword">PEEK</span>(<span class="basic-number">830</span>): <span class="basic-comment">REM GET RESULT</span></code></pre>
                </div>
            </div>

            <div class="warning-box">
                <h4>⚠️ Common Pitfalls</h4>
                <p>Avoid: OUT OF MEMORY errors (use CLR), infinite loops without escape, forgetting to restore interrupts after SYS calls, and mixing up decimal/hexadecimal values in POKE statements.</p>
            </div>

            <div class="tip-box">
                <h4>🎓 Learning Path</h4>
                <p>Start with simple BASIC programs, learn PEEK/POKE for hardware control, study existing games' techniques, experiment with assembly language, and join the C64 community for advanced tips!</p>
            </div>
        `;
    }
}

// Initialize documentation manager
window.documentationManager = new DocumentationManager();