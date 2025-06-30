# Commodore 64 Game Development Project

This project contains authentic Commodore 64 assembly language source code for developing games on the C64. While this web environment can't compile or run the actual 6502 code, all the source files are ready for use with real C64 development tools.

## Project Structure

```
src/
├── main.asm           # Main game entry point and initialization
├── sprites.asm        # Sprite handling and animation routines
├── sound.asm          # SID chip sound and music programming
├── input.asm          # Joystick and keyboard input handling
├── collision.asm      # Collision detection system
include/
├── c64.inc            # C64 system definitions and constants
├── vic.inc            # VIC-II video chip definitions
└── sid.inc            # SID sound chip definitions
```

## Key Features

### Efficient Memory Usage
- Uses zero page for fast variable access
- Optimized sprite handling with hardware collision detection
- Efficient game loop with raster timing

### Hardware Programming
- Direct VIC-II register manipulation for sprites and graphics
- SID chip programming for sound effects and music
- CIA chip handling for joystick input

### Game Systems
- Player movement with joystick control
- Enemy AI with simple pathfinding
- Bullet system with collision detection
- Score system and game state management
- Sound effects and background music

## Assembly Techniques Used

### PEEKs and POKEs
The code uses direct memory access to hardware registers:
```assembly
sta $d000          ; POKE sprite X position
lda $dc00          ; PEEK joystick input
```

### Interrupt Programming
Custom IRQ handler for music and timing:
```assembly
lda #<irq_handler  ; Set custom IRQ vector
sta $0314
```

### Sprite Manipulation
Hardware sprites for smooth animation:
```assembly
lda #$ff           ; Enable all sprites
sta $d015          ; VIC sprite enable register
```

## Development Tools

To actually compile and run this code, you would need:

1. **Cross-Assembler**: CA65, ACME, or KickAssembler
2. **Emulator**: VICE, CCS64, or hardware C64
3. **Build Tools**: Make or custom build scripts

## Memory Map

| Address Range | Purpose |
|---------------|---------|
| $0400-$07E7   | Screen RAM (1000 bytes) |
| $D000-$D3FF   | VIC-II video chip registers |
| $D400-$D7FF   | SID sound chip registers |
| $DC00-$DCFF   | CIA #1 (keyboard, joystick) |
| $DD00-$DDFF   | CIA #2 (serial, timers) |

## Programming Concepts

### Raster Timing
Synchronizing code execution with the video beam for smooth animation and effects.

### Hardware Sprites
Using the VIC-II's built-in sprite system for efficient moving objects.

### Sound Synthesis
Programming the SID chip's three voices for music and sound effects.

### Memory Banking
Managing the C64's complex memory layout with ROM/RAM switching.

This project demonstrates classic 8-bit game programming techniques and provides a solid foundation for C64 game development.