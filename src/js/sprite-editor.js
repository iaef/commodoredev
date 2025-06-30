// Enhanced Sprite and Character Editor with Animation Timeline and Authentic C64 Character Set
class SpriteEditor {
    constructor() {
        this.currentFile = null;
        this.files = [];
        this.editMode = 'sprite'; // 'sprite' or 'character'
        this.currentTool = 'pixel';
        this.currentColor = 1; // White
        this.zoomLevel = 8;
        
        // Sprite data with animation support
        this.spriteFrames = [new Array(24 * 21).fill(0)]; // Array of frames
        this.currentFrame = 0;
        this.animationSpeed = 10; // FPS
        this.isAnimating = false;
        this.animationInterval = null;
        
        // Character data
        this.characterData = new Array(8 * 8).fill(0); // 8x8 character
        this.currentCharIndex = 65; // Start with 'A'
        
        // Onion skin settings
        this.onionSkinEnabled = false;
        this.onionSkinPastFrames = 1;
        this.onionSkinFutureFrames = 1;
        
        // Super sprite settings
        this.superSpriteMode = 'single'; // 'single', '2x1', '1x2', '2x2'
        this.superSpriteData = {
            'single': [new Array(24 * 21).fill(0)],
            '2x1': [new Array(48 * 21).fill(0), new Array(48 * 21).fill(0)], // 2 sprites horizontally
            '1x2': [new Array(24 * 42).fill(0), new Array(24 * 42).fill(0)], // 2 sprites vertically  
            '2x2': [new Array(48 * 42).fill(0), new Array(48 * 42).fill(0), new Array(48 * 42).fill(0), new Array(48 * 42).fill(0)] // 4 sprites
        };
        
        this.canvas = null;
        this.ctx = null;
        this.previewCanvas = null;
        this.previewCtx = null;
        this.actualCanvas = null;
        this.actualCtx = null;
        
        // C64 color palette
        this.c64Colors = [
            '#000000', // 0 - Black
            '#FFFFFF', // 1 - White
            '#68372B', // 2 - Red
            '#70A4B2', // 3 - Cyan
            '#6F3D86', // 4 - Purple
            '#588D43', // 5 - Green
            '#352879', // 6 - Blue
            '#B8C76F', // 7 - Yellow
            '#6F4F25', // 8 - Orange
            '#433900', // 9 - Brown
            '#9A6759', // 10 - Light Red
            '#444444', // 11 - Dark Grey
            '#6C6C6C', // 12 - Grey
            '#9AD284', // 13 - Light Green
            '#6C5EB5', // 14 - Light Blue
            '#959595'  // 15 - Light Grey
        ];
        
        this.c64CharacterSet = this.generateC64CharacterSet();
    }

    generateC64CharacterSet() {
        // Enhanced C64 character set with authentic PETSCII graphics from style64.org reference
        const charset = {};
        
        // C64 ROM character patterns (8 bytes per character, each bit represents a pixel)
        const charPatterns = {
            // Numbers 0-9
            48: [0x3C,0x66,0x6E,0x76,0x66,0x66,0x3C,0x00], // 0
            49: [0x18,0x18,0x38,0x18,0x18,0x18,0x7E,0x00], // 1
            50: [0x3C,0x66,0x30,0x18,0x0C,0x66,0x7E,0x00], // 2
            51: [0x3C,0x66,0x30,0x38,0x30,0x66,0x3C,0x00], // 3
            52: [0x60,0x70,0x78,0x6C,0x66,0xFE,0x60,0x00], // 4
            53: [0x7E,0x06,0x3E,0x60,0x60,0x66,0x3C,0x00], // 5
            54: [0x3C,0x66,0x06,0x3E,0x66,0x66,0x3C,0x00], // 6
            55: [0x7E,0x66,0x30,0x18,0x18,0x18,0x18,0x00], // 7
            56: [0x3C,0x66,0x66,0x3C,0x66,0x66,0x3C,0x00], // 8
            57: [0x3C,0x66,0x66,0x7C,0x60,0x66,0x3C,0x00], // 9
            
            // Letters A-Z (authentic C64 font patterns)
            65: [0x18,0x3C,0x66,0x7E,0x66,0x66,0x66,0x00], // A
            66: [0x3E,0x66,0x66,0x3E,0x66,0x66,0x3E,0x00], // B
            67: [0x3C,0x66,0x06,0x06,0x06,0x66,0x3C,0x00], // C
            68: [0x1E,0x36,0x66,0x66,0x66,0x36,0x1E,0x00], // D
            69: [0x7E,0x06,0x06,0x3E,0x06,0x06,0x7E,0x00], // E
            70: [0x7E,0x06,0x06,0x3E,0x06,0x06,0x06,0x00], // F
            71: [0x3C,0x66,0x06,0x76,0x66,0x66,0x7C,0x00], // G
            72: [0x66,0x66,0x66,0x7E,0x66,0x66,0x66,0x00], // H
            73: [0x3C,0x18,0x18,0x18,0x18,0x18,0x3C,0x00], // I
            74: [0x78,0x30,0x30,0x30,0x30,0x36,0x1C,0x00], // J
            75: [0x66,0x36,0x1E,0x0E,0x1E,0x36,0x66,0x00], // K
            76: [0x06,0x06,0x06,0x06,0x06,0x06,0x7E,0x00], // L
            77: [0x63,0x77,0x7F,0x6B,0x63,0x63,0x63,0x00], // M
            78: [0x66,0x6E,0x7E,0x76,0x66,0x66,0x66,0x00], // N
            79: [0x3C,0x66,0x66,0x66,0x66,0x66,0x3C,0x00], // O
            80: [0x3E,0x66,0x66,0x3E,0x06,0x06,0x06,0x00], // P
            81: [0x3C,0x66,0x66,0x66,0x76,0x36,0x6C,0x00], // Q
            82: [0x3E,0x66,0x66,0x3E,0x1E,0x36,0x66,0x00], // R
            83: [0x3C,0x66,0x06,0x3C,0x60,0x66,0x3C,0x00], // S
            84: [0x7E,0x18,0x18,0x18,0x18,0x18,0x18,0x00], // T
            85: [0x66,0x66,0x66,0x66,0x66,0x66,0x3C,0x00], // U
            86: [0x66,0x66,0x66,0x66,0x66,0x3C,0x18,0x00], // V
            87: [0x63,0x63,0x63,0x6B,0x7F,0x77,0x63,0x00], // W
            88: [0x66,0x66,0x3C,0x18,0x3C,0x66,0x66,0x00], // X
            89: [0x66,0x66,0x66,0x3C,0x18,0x18,0x18,0x00], // Y
            90: [0x7E,0x60,0x30,0x18,0x0C,0x06,0x7E,0x00], // Z
            
            // Special characters
            32: [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00], // Space
            33: [0x18,0x18,0x18,0x18,0x00,0x18,0x18,0x00], // !
            34: [0x66,0x66,0x66,0x00,0x00,0x00,0x00,0x00], // "
            35: [0x66,0xFF,0x66,0x66,0xFF,0x66,0x66,0x00], // #
            36: [0x18,0x7E,0x06,0x3C,0x60,0x7E,0x18,0x00], // $
            37: [0x46,0x66,0x30,0x18,0x0C,0x66,0x62,0x00], // %
            38: [0x1C,0x36,0x1C,0x6E,0x3B,0x33,0x6E,0x00], // &
            39: [0x06,0x06,0x03,0x00,0x00,0x00,0x00,0x00], // '
            40: [0x18,0x0C,0x06,0x06,0x06,0x0C,0x18,0x00], // (
            41: [0x06,0x0C,0x18,0x18,0x18,0x0C,0x06,0x00], // )
            42: [0x00,0x66,0x3C,0xFF,0x3C,0x66,0x00,0x00], // *
            43: [0x00,0x18,0x18,0x7E,0x18,0x18,0x00,0x00], // +
            44: [0x00,0x00,0x00,0x00,0x00,0x0C,0x06,0x00], // ,
            45: [0x00,0x00,0x00,0x7E,0x00,0x00,0x00,0x00], // -
            46: [0x00,0x00,0x00,0x00,0x00,0x0C,0x0C,0x00], // .
            47: [0x60,0x30,0x18,0x0C,0x06,0x03,0x01,0x00], // /
            
            // PETSCII Graphics Characters (160-255) - Authentic C64 patterns
            160: [0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF], // Solid block
            161: [0xAA,0x55,0xAA,0x55,0xAA,0x55,0xAA,0x55], // Checkerboard
            162: [0xFF,0x00,0xFF,0x00,0xFF,0x00,0xFF,0x00], // Horizontal stripes
            163: [0xF0,0xF0,0xF0,0xF0,0xF0,0xF0,0xF0,0xF0], // Left half block
            164: [0x0F,0x0F,0x0F,0x0F,0x0F,0x0F,0x0F,0x0F], // Right half block
            165: [0xFF,0xFF,0xFF,0xFF,0x00,0x00,0x00,0x00], // Top half block
            166: [0x00,0x00,0x00,0x00,0xFF,0xFF,0xFF,0xFF], // Bottom half block
            167: [0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x18], // Vertical line
            168: [0x00,0x00,0xFF,0xFF,0xFF,0xFF,0x00,0x00], // Horizontal line
            169: [0x18,0x18,0xFF,0xFF,0xFF,0xFF,0x18,0x18], // Cross
            170: [0x81,0x42,0x24,0x18,0x18,0x24,0x42,0x81], // X pattern
            171: [0x3C,0x7E,0xFF,0xFF,0xFF,0xFF,0x7E,0x3C], // Circle
            172: [0x18,0x3C,0x7E,0xFF,0x7E,0x3C,0x18,0x00], // Diamond
            173: [0x00,0x18,0x3C,0x7E,0x3C,0x18,0x00,0x00], // Small diamond
            174: [0x7E,0x81,0xA5,0x81,0xBD,0x99,0x81,0x7E], // Smiley face
            175: [0x7E,0x81,0x99,0x81,0xA5,0xBD,0x81,0x7E], // Sad face
            
            // Box drawing characters (authentic PETSCII)
            176: [0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x18], // │
            177: [0x00,0x00,0x00,0xFF,0x00,0x00,0x00,0x00], // ─
            178: [0x18,0x18,0x18,0xFF,0x18,0x18,0x18,0x18], // ┼
            179: [0x00,0x00,0x00,0xFF,0x18,0x18,0x18,0x18], // ┬
            180: [0x18,0x18,0x18,0xFF,0x00,0x00,0x00,0x00], // ┴
            181: [0x18,0x18,0x18,0x1F,0x18,0x18,0x18,0x18], // ├
            182: [0x18,0x18,0x18,0xF8,0x18,0x18,0x18,0x18], // ┤
            183: [0x00,0x00,0x00,0x1F,0x18,0x18,0x18,0x18], // ┌
            184: [0x00,0x00,0x00,0xF8,0x18,0x18,0x18,0x18], // ┐
            185: [0x18,0x18,0x18,0x1F,0x00,0x00,0x00,0x00], // └
            186: [0x18,0x18,0x18,0xF8,0x00,0x00,0x00,0x00], // ┘
            
            // Additional PETSCII graphics
            187: [0xC0,0xC0,0xC0,0xC0,0xC0,0xC0,0xC0,0xC0], // Quarter block top-left
            188: [0x03,0x03,0x03,0x03,0x03,0x03,0x03,0x03], // Quarter block top-right
            189: [0x00,0x00,0x00,0x00,0xC0,0xC0,0xC0,0xC0], // Quarter block bottom-left
            190: [0x00,0x00,0x00,0x00,0x03,0x03,0x03,0x03], // Quarter block bottom-right
            191: [0xFC,0xFC,0xFC,0xFC,0xFC,0xFC,0xFC,0xFC], // Three-quarter block left
            192: [0x3F,0x3F,0x3F,0x3F,0x3F,0x3F,0x3F,0x3F], // Three-quarter block right
            193: [0xFF,0xFF,0xFF,0xFF,0x00,0x00,0x00,0x00], // Three-quarter block top
            194: [0x00,0x00,0x00,0x00,0xFF,0xFF,0xFF,0xFF], // Three-quarter block bottom
            
            // Hearts, clubs, diamonds, spades (card suits)
            195: [0x18,0x3C,0x7E,0x7E,0x3C,0x18,0x7E,0x00], // Spade
            196: [0x18,0x3C,0x3C,0x18,0x7E,0x7E,0x3C,0x00], // Club
            197: [0x00,0x18,0x3C,0x7E,0x3C,0x18,0x00,0x00], // Diamond
            198: [0x00,0x66,0xFF,0x7E,0x3C,0x18,0x00,0x00], // Heart
            
            // More geometric patterns
            199: [0x81,0x81,0x42,0x3C,0x3C,0x42,0x81,0x81], // Double diamond
            200: [0xFF,0x81,0x81,0x81,0x81,0x81,0x81,0xFF], // Hollow square
            201: [0x7E,0x42,0x42,0x42,0x42,0x42,0x42,0x7E], // Smaller hollow square
            202: [0x3C,0x24,0x24,0x24,0x24,0x24,0x24,0x3C], // Even smaller hollow square
            203: [0x18,0x18,0x18,0x00,0x00,0x18,0x18,0x18], // Dotted vertical line
            204: [0x00,0x00,0x00,0x18,0x18,0x00,0x00,0x00], // Center dot
            205: [0x81,0x00,0x24,0x00,0x18,0x00,0x24,0x00], // Sparse dots
            
            // Additional useful graphics
            206: [0x7E,0x7E,0x7E,0x7E,0x7E,0x7E,0x7E,0x7E], // Thick horizontal bars
            207: [0xE7,0xE7,0xE7,0xE7,0xE7,0xE7,0xE7,0xE7], // Thick vertical bars
            208: [0xF0,0xF0,0xF0,0xF0,0x0F,0x0F,0x0F,0x0F], // Half and half diagonal
            209: [0x0F,0x0F,0x0F,0x0F,0xF0,0xF0,0xF0,0xF0], // Half and half diagonal (reverse)
            210: [0xAA,0x00,0xAA,0x00,0xAA,0x00,0xAA,0x00], // Dotted horizontal
            211: [0x88,0x88,0x88,0x88,0x88,0x88,0x88,0x88], // Dotted vertical
            212: [0x80,0x40,0x20,0x10,0x08,0x04,0x02,0x01], // Diagonal line
            213: [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80], // Diagonal line (reverse)
            214: [0x18,0x24,0x42,0x81,0x81,0x42,0x24,0x18], // Hollow diamond
            215: [0x00,0x08,0x1C,0x3E,0x1C,0x08,0x00,0x00], // Arrow up
            216: [0x00,0x10,0x38,0x7C,0x38,0x10,0x00,0x00], // Arrow down
            217: [0x00,0x20,0x60,0xFE,0x60,0x20,0x00,0x00], // Arrow left
            218: [0x00,0x04,0x06,0x7F,0x06,0x04,0x00,0x00], // Arrow right
            
            // More complex patterns
            219: [0x55,0xAA,0x55,0xAA,0x55,0xAA,0x55,0xAA], // Fine checkerboard
            220: [0x33,0xCC,0x33,0xCC,0x33,0xCC,0x33,0xCC], // Medium checkerboard
            221: [0x0F,0xF0,0x0F,0xF0,0x0F,0xF0,0x0F,0xF0], // Large checkerboard
            222: [0x00,0x7E,0x7E,0x7E,0x7E,0x7E,0x7E,0x00], // Thick horizontal line
            223: [0x66,0x66,0x66,0x66,0x66,0x66,0x66,0x66], // Double vertical lines
            
            // Final patterns to complete the set
            224: [0xC3,0xC3,0xC3,0xC3,0xC3,0xC3,0xC3,0xC3], // Double vertical lines (thick)
            225: [0x18,0x18,0x18,0xFF,0xFF,0x18,0x18,0x18], // Cross (thick)
            226: [0x00,0x00,0xFF,0xFF,0xFF,0xFF,0x00,0x00], // Thick horizontal bar
            227: [0x36,0x36,0x36,0x36,0x36,0x36,0x36,0x36], // Double vertical lines (medium)
            228: [0x6C,0x6C,0x6C,0x6C,0x6C,0x6C,0x6C,0x6C], // Double vertical lines (wide)
            229: [0xDB,0xDB,0xDB,0xDB,0xDB,0xDB,0xDB,0xDB], // Triple vertical lines
            230: [0x00,0x00,0x00,0x00,0x00,0xFF,0xFF,0xFF], // Bottom thick bar
            231: [0xFF,0xFF,0xFF,0x00,0x00,0x00,0x00,0x00], // Top thick bar
            232: [0xFF,0x00,0x00,0x00,0x00,0x00,0x00,0x00], // Top thin line
            233: [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xFF], // Bottom thin line
            234: [0x80,0x80,0x80,0x80,0x80,0x80,0x80,0x80], // Left thin line
            235: [0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01], // Right thin line
            236: [0xC0,0xC0,0xC0,0xC0,0xC0,0xC0,0xC0,0xC0], // Left thick line
            237: [0x03,0x03,0x03,0x03,0x03,0x03,0x03,0x03], // Right thick line
            238: [0xF8,0xF8,0xF8,0xF8,0xF8,0xF8,0xF8,0xF8], // Left very thick
            239: [0x1F,0x1F,0x1F,0x1F,0x1F,0x1F,0x1F,0x1F], // Right very thick
            
            // Final characters (240-255)
            240: [0xE0,0xE0,0xE0,0xE0,0xE0,0xE0,0xE0,0xE0], // Left block
            241: [0x07,0x07,0x07,0x07,0x07,0x07,0x07,0x07], // Right block
            242: [0xFE,0xFE,0xFE,0xFE,0xFE,0xFE,0xFE,0xFE], // Almost solid left
            243: [0x7F,0x7F,0x7F,0x7F,0x7F,0x7F,0x7F,0x7F], // Almost solid right
            244: [0xFF,0xFF,0xFF,0x00,0xFF,0xFF,0xFF,0x00], // Striped thick
            245: [0xFF,0x00,0xFF,0x00,0xFF,0x00,0xFF,0x00], // Striped medium
            246: [0xF0,0x0F,0xF0,0x0F,0xF0,0x0F,0xF0,0x0F], // Diagonal stripes
            247: [0x0F,0xF0,0x0F,0xF0,0x0F,0xF0,0x0F,0xF0], // Diagonal stripes (reverse)
            248: [0x99,0x66,0x99,0x66,0x99,0x66,0x99,0x66], // Diamond pattern
            249: [0x66,0x99,0x66,0x99,0x66,0x99,0x66,0x99], // Diamond pattern (reverse)
            250: [0xA5,0x5A,0xA5,0x5A,0xA5,0x5A,0xA5,0x5A], // Complex checkerboard
            251: [0x5A,0xA5,0x5A,0xA5,0x5A,0xA5,0x5A,0xA5], // Complex checkerboard (reverse)
            252: [0x3C,0x42,0x99,0xA5,0xA5,0x99,0x42,0x3C], // Face outline
            253: [0x00,0x3C,0x7E,0xFF,0xFF,0x7E,0x3C,0x00], // Solid circle
            254: [0xFF,0xC3,0x81,0x00,0x00,0x81,0xC3,0xFF], // Hollow circle (thick)
            255: [0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF], // Solid block (duplicate)
        };
        
        // Convert byte patterns to pixel arrays
        for (const [charCode, pattern] of Object.entries(charPatterns)) {
            const pixels = new Array(64).fill(0); // 8x8 = 64 pixels
            
            for (let row = 0; row < 8; row++) {
                const byte = pattern[row];
                for (let col = 0; col < 8; col++) {
                    const bit = (byte >> (7 - col)) & 1;
                    pixels[row * 8 + col] = bit;
                }
            }
            
            charset[parseInt(charCode)] = pixels;
        }
        
        // Fill remaining characters with empty patterns
        for (let i = 0; i < 256; i++) {
            if (!charset[i]) {
                charset[i] = new Array(64).fill(0);
            }
        }
        
        return charset;
    }

    setupCanvas() {
        this.canvas = document.getElementById('sprite-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        this.previewCanvas = document.getElementById('preview-canvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.previewCtx.imageSmoothingEnabled = false;
        
        this.actualCanvas = document.getElementById('actual-size');
        this.actualCtx = this.actualCanvas.getContext('2d');
        this.actualCtx.imageSmoothingEnabled = false;
    }

    setupEventListeners() {
        // File management
        document.getElementById('new-sprite-file').addEventListener('click', () => {
            this.createNewFile();
        });

        document.getElementById('load-sprite-file').addEventListener('click', () => {
            this.loadFile();
        });

        document.getElementById('save-sprite-file').addEventListener('click', () => {
            this.saveFile();
        });

        document.getElementById('sprite-file-select').addEventListener('change', (e) => {
            this.switchFile(e.target.value);
        });

        // Edit mode
        document.querySelectorAll('input[name="edit-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.editMode = e.target.value;
                this.updateCanvasSize();
                this.updateCanvasTitle();
                this.updateModeSpecificControls();
                this.redrawCanvas();
            });
        });

        // Tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
            });
        });

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.zoomLevel = Math.min(16, this.zoomLevel + 1);
            this.updateZoom();
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            this.zoomLevel = Math.max(2, this.zoomLevel - 1);
            this.updateZoom();
        });

        // Canvas interaction
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleCanvasClick(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // Left mouse button held
                this.handleCanvasClick(e);
            }
        });

        // Custom palette
        document.getElementById('custom-palette').addEventListener('click', () => {
            this.createCustomPalette();
        });
    }

    createAnimationTimeline() {
        const toolSection = document.querySelector('.tool-section:last-child');
        
        // Create animation section
        const animSection = document.createElement('div');
        animSection.className = 'tool-section animation-section';
        animSection.innerHTML = `
            <h3>Animation Timeline</h3>
            <div class="animation-controls">
                <div class="timeline-container">
                    <div class="timeline-header">
                        <span>Frames:</span>
                        <button id="add-frame" class="btn small">+ Add Empty</button>
                    </div>
                    <div id="animation-timeline" class="animation-timeline"></div>
                </div>
                <div class="playback-controls">
                    <button id="play-animation" class="btn small">▶ Play</button>
                    <button id="stop-animation" class="btn small">⏹ Stop</button>
                    <label>Speed: <input type="range" id="animation-speed" min="2" max="30" value="10"> <span id="fps-display">10</span> FPS</label>
                </div>
                <div class="onion-skin-controls">
                    <label><input type="checkbox" id="onion-skin"> Onion Skin</label>
                    <label>Past frames: <input type="range" id="onion-past" min="0" max="3" value="1" disabled> <span id="past-display">1</span></label>
                    <label>Future frames: <input type="range" id="onion-future" min="0" max="3" value="1" disabled> <span id="future-display">1</span></label>
                </div>
            </div>
        `;
        
        toolSection.parentNode.insertBefore(animSection, toolSection);
        
        // Add event listeners
        document.getElementById('add-frame').addEventListener('click', () => this.addFrame());
        document.getElementById('play-animation').addEventListener('click', () => this.toggleAnimation());
        document.getElementById('stop-animation').addEventListener('click', () => this.stopAnimation());
        document.getElementById('animation-speed').addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            document.getElementById('fps-display').textContent = this.animationSpeed;
            if (this.isAnimating) {
                this.stopAnimation();
                this.startAnimation();
            }
        });
        
        // Onion skin controls
        document.getElementById('onion-skin').addEventListener('change', (e) => {
            this.onionSkinEnabled = e.target.checked;
            const pastControl = document.getElementById('onion-past');
            const futureControl = document.getElementById('onion-future');
            pastControl.disabled = !this.onionSkinEnabled;
            futureControl.disabled = !this.onionSkinEnabled;
            this.redrawCanvas();
        });
        
        document.getElementById('onion-past').addEventListener('input', (e) => {
            this.onionSkinPastFrames = parseInt(e.target.value);
            document.getElementById('past-display').textContent = this.onionSkinPastFrames;
            this.redrawCanvas();
        });
        
        document.getElementById('onion-future').addEventListener('input', (e) => {
            this.onionSkinFutureFrames = parseInt(e.target.value);
            document.getElementById('future-display').textContent = this.onionSkinFutureFrames;
            this.redrawCanvas();
        });
        
        this.updateAnimationTimeline();
    }

    createSuperSpriteControls() {
        const animSection = document.querySelector('.animation-section');
        
        // Create super sprite section
        const superSection = document.createElement('div');
        superSection.className = 'tool-section super-sprite-section';
        superSection.innerHTML = `
            <h3>Super Sprites</h3>
            <div class="super-sprite-controls">
                <label><input type="radio" name="super-sprite" value="single" checked> Single (24x21)</label>
                <label><input type="radio" name="super-sprite" value="2x1"> 2x1 Horizontal (48x21)</label>
                <label><input type="radio" name="super-sprite" value="1x2"> 1x2 Vertical (24x42)</label>
                <label><input type="radio" name="super-sprite" value="2x2"> 2x2 Square (48x42)</label>
                <div id="super-sprite-grid" class="super-sprite-grid"></div>
                <button id="export-super-sprite" class="btn small">Export Super Sprite</button>
            </div>
        `;
        
        animSection.parentNode.insertBefore(superSection, animSection.nextSibling);
        
        // Add event listeners
        document.querySelectorAll('input[name="super-sprite"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.superSpriteMode = e.target.value;
                this.updateSuperSpriteGrid();
                this.updateCanvasSize();
                this.redrawCanvas();
            });
        });
        
        document.getElementById('export-super-sprite').addEventListener('click', () => {
            this.exportSuperSprite();
        });
        
        this.updateSuperSpriteGrid();
    }

    updateAnimationTimeline() {
        const timeline = document.getElementById('animation-timeline');
        if (!timeline) return;
        
        timeline.innerHTML = '';
        
        this.spriteFrames.forEach((frame, index) => {
            const frameElement = document.createElement('div');
            frameElement.className = `timeline-frame ${index === this.currentFrame ? 'active' : ''}`;
            frameElement.innerHTML = `
                <div class="frame-number">${index + 1}</div>
                <canvas class="frame-preview" width="24" height="21"></canvas>
                <div class="frame-controls">
                    <button class="btn tiny copy-frame" onclick="window.spriteEditor.duplicateFrame(${index})">+</button>
                    <button class="btn tiny delete-frame" onclick="window.spriteEditor.deleteFrame(${index})">-</button>
                </div>
            `;
            
            // Make frame selectable by clicking
            frameElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn')) {
                    this.selectFrame(index);
                }
            });
            
            // Draw frame preview
            const canvas = frameElement.querySelector('.frame-preview');
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            
            for (let y = 0; y < 21; y++) {
                for (let x = 0; x < 24; x++) {
                    const index = y * 24 + x;
                    const colorIndex = frame[index];
                    if (colorIndex > 0) {
                        ctx.fillStyle = this.c64Colors[colorIndex];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
            
            timeline.appendChild(frameElement);
        });
    }

    updateSuperSpriteGrid() {
        const grid = document.getElementById('super-sprite-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const spriteCount = this.getSuperSpriteCount();
        const layout = this.getSuperSpriteLayout();
        
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;
        grid.style.gap = '5px';
        
        for (let i = 0; i < spriteCount; i++) {
            const spriteElement = document.createElement('div');
            spriteElement.className = 'super-sprite-item';
            spriteElement.innerHTML = `
                <div class="sprite-label">Sprite ${i + 1}</div>
                <canvas class="sprite-preview" width="24" height="21"></canvas>
                <button class="btn tiny" onclick="window.spriteEditor.editSuperSprite(${i})">Edit</button>
            `;
            
            // Draw sprite preview
            const canvas = spriteElement.querySelector('.sprite-preview');
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            
            const spriteData = this.superSpriteData[this.superSpriteMode][i] || new Array(24 * 21).fill(0);
            for (let y = 0; y < 21; y++) {
                for (let x = 0; x < 24; x++) {
                    const index = y * 24 + x;
                    const colorIndex = spriteData[index];
                    if (colorIndex > 0) {
                        ctx.fillStyle = this.c64Colors[colorIndex];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
            
            grid.appendChild(spriteElement);
        }
    }

    getSuperSpriteCount() {
        switch (this.superSpriteMode) {
            case '2x1': return 2;
            case '1x2': return 2;
            case '2x2': return 4;
            default: return 1;
        }
    }

    getSuperSpriteLayout() {
        switch (this.superSpriteMode) {
            case '2x1': return { cols: 2, rows: 1 };
            case '1x2': return { cols: 1, rows: 2 };
            case '2x2': return { cols: 2, rows: 2 };
            default: return { cols: 1, rows: 1 };
        }
    }

    selectFrame(frameIndex) {
        this.currentFrame = frameIndex;
        this.updateAnimationTimeline();
        this.redrawCanvas();
    }

    duplicateFrame(frameIndex) {
        const newFrame = [...this.spriteFrames[frameIndex]];
        this.spriteFrames.splice(frameIndex + 1, 0, newFrame);
        this.currentFrame = frameIndex + 1;
        this.updateAnimationTimeline();
        this.redrawCanvas();
        
        // Mark file as modified
        if (window.c64Platform && this.currentFile) {
            window.c64Platform.onFileModified(this.currentFile.name);
        }
    }

    deleteFrame(frameIndex) {
        if (this.spriteFrames.length > 1) {
            this.spriteFrames.splice(frameIndex, 1);
            if (this.currentFrame >= this.spriteFrames.length) {
                this.currentFrame = this.spriteFrames.length - 1;
            }
            this.updateAnimationTimeline();
            this.redrawCanvas();
            
            // Mark file as modified
            if (window.c64Platform && this.currentFile) {
                window.c64Platform.onFileModified(this.currentFile.name);
            }
        }
    }

    addFrame() {
        // Create empty frame
        const newFrame = new Array(24 * 21).fill(0);
        this.spriteFrames.push(newFrame);
        this.currentFrame = this.spriteFrames.length - 1;
        this.updateAnimationTimeline();
        this.redrawCanvas();
        
        // Mark file as modified
        if (window.c64Platform && this.currentFile) {
            window.c64Platform.onFileModified(this.currentFile.name);
        }
    }

    editSuperSprite(spriteIndex) {
        // Switch to editing a specific sprite in the super sprite configuration
        if (window.c64Platform) {
            window.c64Platform.showNotification(`Editing sprite ${spriteIndex + 1} of ${this.superSpriteMode} configuration`, 'success');
        }
    }

    createNewFile() {
        // Create inline input for file name
        const fileNameInput = document.createElement('input');
        fileNameInput.type = 'text';
        fileNameInput.value = 'sprites.spr';
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
        
        const createBtn = document.getElementById('new-sprite-file');
        const originalText = createBtn.textContent;
        createBtn.textContent = 'Enter name:';
        createBtn.parentNode.insertBefore(fileNameInput, createBtn.nextSibling);
        
        fileNameInput.focus();
        fileNameInput.select();
        
        const finishCreation = () => {
            const fileName = fileNameInput.value.trim() || 'sprites.spr';
            fileNameInput.remove();
            createBtn.textContent = originalText;
            
            const file = {
                name: fileName,
                sprites: [new Array(24 * 21).fill(0)], // Start with one frame
                characters: Array.from({length: 256}, (_, i) => [...this.c64CharacterSet[i]]),
                palette: [...this.c64Colors],
                type: 'sprite',
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
        input.accept = '.spr,.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const content = await file.text();
                    const spriteData = JSON.parse(content);
                    const spriteFile = {
                        name: file.name,
                        sprites: spriteData.sprites || [new Array(24 * 21).fill(0)],
                        characters: spriteData.characters || Array.from({length: 256}, (_, i) => [...this.c64CharacterSet[i]]),
                        palette: spriteData.palette || [...this.c64Colors],
                        type: 'sprite',
                        created: new Date().toISOString()
                    };
                    this.files.push(spriteFile);
                    this.currentFile = spriteFile;
                    this.updateFileList();
                    this.loadFileContent();
                } catch (error) {
                    if (window.c64Platform) {
                        window.c64Platform.showNotification('Error loading sprite file: ' + error.message, 'error');
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

        // Save current sprite/character data
        if (this.editMode === 'sprite') {
            this.currentFile.sprites = [...this.spriteFrames];
        } else {
            this.currentFile.characters[this.currentCharIndex] = [...this.characterData];
        }
        
        const spriteFileData = {
            sprites: this.currentFile.sprites,
            characters: this.currentFile.characters,
            palette: this.currentFile.palette,
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(spriteFileData, null, 2)], { type: 'application/json' });
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
        const select = document.getElementById('sprite-file-select');
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
            // Load sprite frames
            this.spriteFrames = this.currentFile.sprites.map(frame => [...frame]);
            this.currentFrame = 0;
            
            // Load character set
            if (this.currentFile.characters) {
                this.currentFile.characters.forEach((charData, index) => {
                    this.c64CharacterSet[index] = [...charData];
                });
            }
            
            // Load current character
            this.characterData = [...this.c64CharacterSet[this.currentCharIndex]];
            
            if (this.currentFile.palette) {
                this.c64Colors = [...this.currentFile.palette];
                this.createColorPalette();
            }
            
            this.updateAnimationTimeline();
            this.createCharsetGrid(); // Refresh character grid
            this.redrawCanvas();
            this.updatePreviews();
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

    updateCanvasSize() {
        let width, height;
        
        if (this.editMode === 'sprite') {
            width = 24;
            height = 21;
        } else {
            width = 8;
            height = 8;
        }
        
        this.canvas.width = width * this.zoomLevel;
        this.canvas.height = height * this.zoomLevel;
    }

    updateCanvasTitle() {
        const title = document.getElementById('canvas-title');
        if (this.editMode === 'sprite') {
            title.textContent = `Sprite Editor (24x21) - Frame ${this.currentFrame + 1}/${this.spriteFrames.length}`;
        } else {
            title.textContent = `Character Editor (8x8) - Char ${this.currentCharIndex} (${String.fromCharCode(this.currentCharIndex)})`;
        }
    }

    updateModeSpecificControls() {
        // Show/hide controls based on mode
        const animationSection = document.querySelector('.animation-section');
        const superSpriteSection = document.querySelector('.super-sprite-section');
        
        if (this.editMode === 'sprite') {
            if (animationSection) animationSection.style.display = 'block';
            if (superSpriteSection) superSpriteSection.style.display = 'block';
        } else {
            if (animationSection) animationSection.style.display = 'none';
            if (superSpriteSection) superSpriteSection.style.display = 'none';
            this.stopAnimation();
        }
    }

    updateZoom() {
        document.getElementById('zoom-level').textContent = `${this.zoomLevel}x`;
        this.updateCanvasSize();
        this.redrawCanvas();
    }

    createColorPalette() {
        const palette = document.getElementById('color-palette');
        palette.innerHTML = '';
        
        this.c64Colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.dataset.color = index;
            swatch.title = `Color ${index}`;
            
            if (index === this.currentColor) {
                swatch.classList.add('active');
            }
            
            swatch.addEventListener('click', () => {
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                this.currentColor = index;
            });
            
            palette.appendChild(swatch);
        });
    }

    createCharsetGrid() {
        const grid = document.getElementById('charset-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < 256; i++) {
            const cell = document.createElement('canvas');
            cell.className = 'char-cell';
            cell.width = 16;
            cell.height = 16;
            cell.dataset.char = i;
            
            // Create tooltip with character info
            let tooltip = `Character ${i}`;
            if (i >= 32 && i <= 126) {
                tooltip += ` (${String.fromCharCode(i)})`;
            } else if (i >= 160) {
                tooltip += ' (Graphics)';
            }
            cell.title = tooltip;
            
            // Draw character preview
            this.drawCharacterPreview(cell, i);
            
            if (i === this.currentCharIndex) {
                cell.classList.add('active');
            }
            
            cell.addEventListener('click', () => {
                document.querySelectorAll('.char-cell').forEach(c => c.classList.remove('active'));
                cell.classList.add('active');
                this.loadCharacterFromCharset(i);
            });
            
            grid.appendChild(cell);
        }
    }

    drawCharacterPreview(canvas, charIndex) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 16, 16);
        
        const charData = this.c64CharacterSet[charIndex];
        if (!charData) return;
        
        ctx.fillStyle = this.c64Colors[1]; // White
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = y * 8 + x;
                if (charData[index]) {
                    ctx.fillRect(x * 2, y * 2, 2, 2);
                }
            }
        }
    }

    loadCharacterFromCharset(charIndex) {
        if (this.editMode === 'character') {
            this.currentCharIndex = charIndex;
            this.characterData = [...this.c64CharacterSet[charIndex]];
            this.updateCanvasTitle();
            this.redrawCanvas();
            this.updatePreviews();
        }
    }

    toggleAnimation() {
        if (this.isAnimating) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }

    startAnimation() {
        if (this.spriteFrames.length <= 1) return;
        
        this.isAnimating = true;
        document.getElementById('play-animation').textContent = '⏸ Pause';
        
        const frameTime = 1000 / this.animationSpeed;
        this.animationInterval = setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % this.spriteFrames.length;
            this.updateAnimationTimeline();
            this.redrawCanvas();
        }, frameTime);
    }

    stopAnimation() {
        this.isAnimating = false;
        document.getElementById('play-animation').textContent = '▶ Play';
        
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.zoomLevel);
        const y = Math.floor((e.clientY - rect.top) / this.zoomLevel);
        
        const width = this.editMode === 'sprite' ? 24 : 8;
        const height = this.editMode === 'sprite' ? 21 : 8;
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
            switch (this.currentTool) {
                case 'pixel':
                    this.setPixel(x, y, this.currentColor);
                    break;
                case 'fill':
                    this.floodFill(x, y, this.currentColor);
                    break;
                case 'line':
                    this.setPixel(x, y, this.currentColor);
                    break;
                case 'clear':
                    this.clearCanvas();
                    break;
            }
            
            this.redrawCanvas();
            this.updatePreviews();
            this.updateAnimationTimeline();
            
            // Mark file as modified
            if (window.c64Platform && this.currentFile) {
                window.c64Platform.onFileModified(this.currentFile.name);
            }
        }
    }

    setPixel(x, y, color) {
        if (this.editMode === 'sprite') {
            const index = y * 24 + x;
            this.spriteFrames[this.currentFrame][index] = color;
        } else {
            const index = y * 8 + x;
            this.characterData[index] = color;
            
            // Update character set
            this.c64CharacterSet[this.currentCharIndex] = [...this.characterData];
            
            // Update character preview in grid
            const charCell = document.querySelector(`[data-char="${this.currentCharIndex}"]`);
            if (charCell) {
                this.drawCharacterPreview(charCell, this.currentCharIndex);
            }
        }
    }

    getPixel(x, y) {
        if (this.editMode === 'sprite') {
            const index = y * 24 + x;
            return this.spriteFrames[this.currentFrame][index] || 0;
        } else {
            const index = y * 8 + x;
            return this.characterData[index] || 0;
        }
    }

    floodFill(startX, startY, newColor) {
        const width = this.editMode === 'sprite' ? 24 : 8;
        const height = this.editMode === 'sprite' ? 21 : 8;
        const originalColor = this.getPixel(startX, startY);
        
        if (originalColor === newColor) return;
        
        const stack = [[startX, startY]];
        
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            if (this.getPixel(x, y) !== originalColor) continue;
            
            this.setPixel(x, y, newColor);
            
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }

    clearCanvas() {
        if (this.editMode === 'sprite') {
            this.spriteFrames[this.currentFrame].fill(0);
        } else {
            this.characterData.fill(0);
            this.c64CharacterSet[this.currentCharIndex] = [...this.characterData];
            
            // Update character preview
            const charCell = document.querySelector(`[data-char="${this.currentCharIndex}"]`);
            if (charCell) {
                this.drawCharacterPreview(charCell, this.currentCharIndex);
            }
        }
    }

    redrawCanvas() {
        this.updateCanvasSize();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const width = this.editMode === 'sprite' ? 24 : 8;
        const height = this.editMode === 'sprite' ? 21 : 8;
        const data = this.editMode === 'sprite' ? this.spriteFrames[this.currentFrame] : this.characterData;
        
        if (!data) return;
        
        // Draw onion skin (multiple frames) if enabled and in sprite mode
        if (this.editMode === 'sprite' && this.onionSkinEnabled && this.spriteFrames.length > 1) {
            // Draw past frames in red tones
            for (let i = 1; i <= this.onionSkinPastFrames; i++) {
                const pastFrameIndex = (this.currentFrame - i + this.spriteFrames.length) % this.spriteFrames.length;
                if (pastFrameIndex !== this.currentFrame) {
                    const pastData = this.spriteFrames[pastFrameIndex];
                    const opacity = 0.3 / i; // More transparent for older frames
                    this.drawOnionSkinFrame(pastData, width, height, `rgba(255, 0, 0, ${opacity})`);
                }
            }
            
            // Draw future frames in blue tones
            for (let i = 1; i <= this.onionSkinFutureFrames; i++) {
                const futureFrameIndex = (this.currentFrame + i) % this.spriteFrames.length;
                if (futureFrameIndex !== this.currentFrame) {
                    const futureData = this.spriteFrames[futureFrameIndex];
                    const opacity = 0.3 / i; // More transparent for further frames
                    this.drawOnionSkinFrame(futureData, width, height, `rgba(0, 0, 255, ${opacity})`);
                }
            }
        }
        
        // Draw grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.zoomLevel, 0);
            this.ctx.lineTo(x * this.zoomLevel, height * this.zoomLevel);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.zoomLevel);
            this.ctx.lineTo(width * this.zoomLevel, y * this.zoomLevel);
            this.ctx.stroke();
        }
        
        // Draw current frame pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const colorIndex = data[index];
                
                if (colorIndex > 0) {
                    this.ctx.fillStyle = this.c64Colors[colorIndex];
                    this.ctx.fillRect(
                        x * this.zoomLevel + 1,
                        y * this.zoomLevel + 1,
                        this.zoomLevel - 1,
                        this.zoomLevel - 1
                    );
                }
            }
        }
        
        this.updateCanvasTitle();
    }

    drawOnionSkinFrame(frameData, width, height, color) {
        this.ctx.fillStyle = color;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const colorIndex = frameData[index];
                
                if (colorIndex > 0) {
                    this.ctx.fillRect(
                        x * this.zoomLevel + 1,
                        y * this.zoomLevel + 1,
                        this.zoomLevel - 1,
                        this.zoomLevel - 1
                    );
                }
            }
        }
    }

    updatePreviews() {
        this.updatePreviewCanvas();
        this.updateActualSize();
    }

    updatePreviewCanvas() {
        const width = this.editMode === 'sprite' ? 24 : 8;
        const height = this.editMode === 'sprite' ? 21 : 8;
        const data = this.editMode === 'sprite' ? this.spriteFrames[this.currentFrame] : this.characterData;
        
        if (!data) return;
        
        this.previewCanvas.width = width * 4;
        this.previewCanvas.height = height * 4;
        
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const colorIndex = data[index];
                
                if (colorIndex > 0) {
                    this.previewCtx.fillStyle = this.c64Colors[colorIndex];
                    this.previewCtx.fillRect(x * 4, y * 4, 4, 4);
                }
            }
        }
    }

    updateActualSize() {
        const width = this.editMode === 'sprite' ? 24 : 8;
        const height = this.editMode === 'sprite' ? 21 : 8;
        const data = this.editMode === 'sprite' ? this.spriteFrames[this.currentFrame] : this.characterData;
        
        if (!data) return;
        
        this.actualCanvas.width = width;
        this.actualCanvas.height = height;
        
        this.actualCtx.clearRect(0, 0, width, height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const colorIndex = data[index];
                
                if (colorIndex > 0) {
                    this.actualCtx.fillStyle = this.c64Colors[colorIndex];
                    this.actualCtx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    exportSuperSprite() {
        const exportData = {
            type: 'super-sprite',
            mode: this.superSpriteMode,
            sprites: this.superSpriteData[this.superSpriteMode],
            palette: this.c64Colors,
            c64Format: this.exportToC64Format()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `super-sprite-${this.superSpriteMode}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    createCustomPalette() {
        // Create inline color picker interface
        const colorPickerContainer = document.createElement('div');
        colorPickerContainer.className = 'color-picker-container';
        colorPickerContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-secondary);
            border: 2px solid var(--border-color);
            padding: 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
        
        colorPickerContainer.innerHTML = `
            <h3>Custom Palette Editor</h3>
            <div class="palette-editor">
                <label>Color Index (0-15): <input type="number" id="color-index" min="0" max="15" value="0"></label>
                <label>New Color: <input type="color" id="color-picker" value="#000000"></label>
                <div style="margin-top: 15px;">
                    <button id="apply-color" class="btn primary">Apply</button>
                    <button id="cancel-color" class="btn secondary">Cancel</button>
                    <button id="reset-palette" class="btn secondary">Reset to C64</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(colorPickerContainer);
        
        const colorIndexInput = colorPickerContainer.querySelector('#color-index');
        const colorPicker = colorPickerContainer.querySelector('#color-picker');
        const applyBtn = colorPickerContainer.querySelector('#apply-color');
        const cancelBtn = colorPickerContainer.querySelector('#cancel-color');
        const resetBtn = colorPickerContainer.querySelector('#reset-palette');
        
        // Update color picker when index changes
        colorIndexInput.addEventListener('input', () => {
            const index = parseInt(colorIndexInput.value);
            if (index >= 0 && index < 16) {
                colorPicker.value = this.c64Colors[index];
            }
        });
        
        // Set initial color
        colorPicker.value = this.c64Colors[0];
        
        applyBtn.addEventListener('click', () => {
            const index = parseInt(colorIndexInput.value);
            const newColor = colorPicker.value;
            
            if (index >= 0 && index < 16) {
                this.c64Colors[index] = newColor;
                this.createColorPalette();
                this.redrawCanvas();
                this.updatePreviews();
                
                if (window.c64Platform) {
                    window.c64Platform.showNotification(`Color ${index} updated to ${newColor}`, 'success');
                }
            }
            
            colorPickerContainer.remove();
        });
        
        cancelBtn.addEventListener('click', () => {
            colorPickerContainer.remove();
        });
        
        resetBtn.addEventListener('click', () => {
            // Reset to original C64 colors
            this.c64Colors = [
                '#000000', '#FFFFFF', '#68372B', '#70A4B2', '#6F3D86', '#588D43', 
                '#352879', '#B8C76F', '#6F4F25', '#433900', '#9A6759', '#444444', 
                '#6C6C6C', '#9AD284', '#6C5EB5', '#959595'
            ];
            this.createColorPalette();
            this.redrawCanvas();
            this.updatePreviews();
            
            if (window.c64Platform) {
                window.c64Platform.showNotification('Palette reset to C64 defaults', 'success');
            }
            
            colorPickerContainer.remove();
        });
    }

    exportToC64Format() {
        const width = this.editMode === 'sprite' ? 24 : 8;
        const height = this.editMode === 'sprite' ? 21 : 8;
        const data = this.editMode === 'sprite' ? this.spriteFrames[this.currentFrame] : this.characterData;
        
        if (!data) return [];
        
        const bytes = [];
        
        if (this.editMode === 'sprite') {
            // Convert sprite to C64 format (3 bytes per row for 24-pixel width)
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x += 8) {
                    let byte = 0;
                    for (let bit = 0; bit < 8; bit++) {
                        const pixelX = x + bit;
                        if (pixelX < width) {
                            const index = y * width + pixelX;
                            if (data[index] > 0) {
                                byte |= (1 << (7 - bit));
                            }
                        }
                    }
                    bytes.push(byte);
                }
            }
        } else {
            // Convert 8x8 character to 8 bytes
            for (let y = 0; y < 8; y++) {
                let byte = 0;
                for (let x = 0; x < 8; x++) {
                    const index = y * 8 + x;
                    if (data[index] > 0) {
                        byte |= (1 << (7 - x));
                    }
                }
                bytes.push(byte);
            }
        }
        
        return bytes;
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateFileList();
        this.createColorPalette();
        this.createCharsetGrid();
        this.createAnimationTimeline();
        this.createSuperSpriteControls();
        this.updateCanvasTitle();
        this.updateModeSpecificControls();
        this.redrawCanvas();
    }
}

// Initialize sprite editor
window.spriteEditor = new SpriteEditor();