// Code examples for different tabs
const codeExamples = {
    main: `; Main Game Entry Point - Commodore 64
; Assembled with CA65 or similar 6502 assembler

.include "include/c64.inc"
.include "include/vic.inc"

.org $0801              ; BASIC start address
; BASIC loader: 10 SYS 2064
.byte $0c,$08,$0a,$00,$9e,$32,$30,$36,$34,$00,$00,$00

.org $0810              ; Main program start
main:
    sei                 ; Disable interrupts
    lda #$7f           ; Disable CIA interrupts
    sta $dc0d
    sta $dd0d
    
    lda $dc0d          ; Clear pending interrupts
    lda $dd0d
    
    lda #$01           ; Set interrupt mode
    sta $d01a
    
    lda #<irq_handler  ; Set IRQ vector
    sta $0314
    lda #>irq_handler
    sta $0315
    
    lda #$1b           ; Enable screen
    sta $d011
    
    lda #$08           ; Multicolor mode
    sta $d016
    
    cli                ; Enable interrupts
    
game_loop:
    ; Wait for raster line
    lda #$ff
wait_raster:
    cmp $d012
    bne wait_raster
    
    jsr read_joystick  ; Check input
    jsr move_sprites   ; Update sprites
    jsr check_collision ; Check collisions
    jsr play_sound     ; Update sound
    
    jmp game_loop      ; Loop forever

irq_handler:
    inc $d019          ; Acknowledge interrupt
    jsr music_play     ; Play music
    jmp $ea31          ; Return to system IRQ`,

    sprites: `; Sprite Handling Routines
; Efficient sprite manipulation using VIC-II

.include "include/vic.inc"

; Sprite data pointers start at $07f8
SPRITE_PTRS = $07f8

init_sprites:
    ; Enable sprites 0-7
    lda #$ff
    sta VIC_SPR_ENA    ; $d015
    
    ; Set sprite colors
    lda #$01           ; White
    sta VIC_SPR0_COLOR ; $d027
    lda #$02           ; Red  
    sta VIC_SPR1_COLOR
    
    ; Set sprite data pointers
    lda #$80           ; Sprite 0 data at $2000
    sta SPRITE_PTRS
    lda #$81           ; Sprite 1 data at $2040
    sta SPRITE_PTRS+1
    
    ; Position sprites
    lda #$50           ; X position
    sta VIC_SPR0_X
    lda #$60           ; Y position  
    sta VIC_SPR0_Y
    
    rts

move_sprite:
    ; Move sprite 0 based on joystick
    lda joy_left
    beq check_right
    
    dec VIC_SPR0_X     ; Move left
    bne check_right
    lda #$ff           ; Wrap around
    sta VIC_SPR0_X
    
check_right:
    lda joy_right
    beq check_up
    
    inc VIC_SPR0_X     ; Move right
    
check_up:
    lda joy_up
    beq check_down
    
    dec VIC_SPR0_Y     ; Move up
    
check_down:
    lda joy_down
    beq move_done
    
    inc VIC_SPR0_Y     ; Move down
    
move_done:
    rts

; Sprite collision detection
check_sprite_collision:
    lda VIC_SPR_COLL   ; $d01e
    beq no_collision
    
    ; Handle collision
    inc score
    
    ; Clear collision register
    lda VIC_SPR_COLL
    
no_collision:
    rts`,

    sound: `; SID Sound Programming
; Three voice sound synthesis

.include "include/sid.inc"

; SID registers
SID_V1_FREQ_LO = $d400
SID_V1_FREQ_HI = $d401
SID_V1_CTRL    = $d404
SID_V1_AD      = $d405
SID_V1_SR      = $d406

init_sound:
    ; Initialize SID chip
    lda #$00
    ldx #$18
clear_sid:
    sta $d400,x        ; Clear all SID registers
    dex
    bpl clear_sid
    
    ; Set up voice 1
    lda #$20           ; Attack=2, Decay=0
    sta SID_V1_AD
    lda #$f0           ; Sustain=15, Release=0
    sta SID_V1_SR
    
    ; Set volume
    lda #$0f           ; Maximum volume
    sta $d418
    
    rts

play_note:
    ; Play note (frequency in A/X registers)
    sta SID_V1_FREQ_LO
    stx SID_V1_FREQ_HI
    
    ; Start note (sawtooth wave)
    lda #$21           ; Gate on, sawtooth
    sta SID_V1_CTRL
    
    rts

stop_note:
    ; Release note
    lda #$20           ; Gate off
    sta SID_V1_CTRL
    
    rts

; Sound effects
play_explosion:
    ; White noise explosion
    lda #$81           ; Noise waveform
    sta $d404
    lda #$0f
    sta $d418          ; Full volume
    
    ; Frequency sweep
    ldx #$ff
explosion_loop:
    stx $d400          ; Frequency low
    lda #$10
    sta $d401          ; Frequency high
    
    ; Short delay
    ldy #$20
delay:
    dey
    bne delay
    
    dex
    bne explosion_loop
    
    ; Stop sound
    lda #$00
    sta $d404
    
    rts`,

    memory: `; Important C64 Memory Locations and Hardware Registers

; === ZERO PAGE (Fast Access) ===
$00-$01    Processor port, memory configuration
$02        Unused
$03-$8F    BASIC and KERNAL zero page variables
$90-$FA    Free zero page for user programs
$FB-$FE    KERNAL zero page variables
$FF        Unused

; === SCREEN AND COLOR MEMORY ===
$0400-$07E7    Default screen RAM (1000 bytes)
$07E8-$07FF    Unused screen area
$D800-$DBE7    Color RAM (1000 bytes)

; === VIC-II VIDEO CHIP ($D000-$D3FF) ===
$D000-$D001    Sprite 0 X,Y coordinates
$D002-$D003    Sprite 1 X,Y coordinates
$D004-$D005    Sprite 2 X,Y coordinates
$D006-$D007    Sprite 3 X,Y coordinates
$D008-$D009    Sprite 4 X,Y coordinates
$D00A-$D00B    Sprite 5 X,Y coordinates
$D00C-$D00D    Sprite 6 X,Y coordinates
$D00E-$D00F    Sprite 7 X,Y coordinates
$D010          Sprites 0-7 X coordinate MSB
$D011          Control register 1
$D012          Raster counter
$D013          Light pen X coordinate
$D014          Light pen Y coordinate
$D015          Sprite enable register
$D016          Control register 2
$D017          Sprite Y expansion
$D018          Memory pointers
$D019          Interrupt request register
$D01A          Interrupt enable register
$D01B          Sprite data priority
$D01C          Sprite multicolor
$D01D          Sprite X expansion
$D01E          Sprite-sprite collision
$D01F          Sprite-data collision
$D020          Border color
$D021          Background color 0
$D022          Background color 1
$D023          Background color 2
$D024          Background color 3
$D025          Sprite multicolor 0
$D026          Sprite multicolor 1
$D027-$D02E    Sprite 0-7 colors

; === SID SOUND CHIP ($D400-$D7FF) ===
$D400-$D401    Voice 1 frequency
$D402-$D403    Voice 1 pulse width
$D404          Voice 1 control register
$D405          Voice 1 attack/decay
$D406          Voice 1 sustain/release
$D407-$D408    Voice 2 frequency
$D409-$D40A    Voice 2 pulse width
$D40B          Voice 2 control register
$D40C          Voice 2 attack/decay
$D40D          Voice 2 sustain/release
$D40E-$D40F    Voice 3 frequency
$D410-$D411    Voice 3 pulse width
$D412          Voice 3 control register
$D413          Voice 3 attack/decay
$D414          Voice 3 sustain/release
$D415-$D416    Filter cutoff frequency
$D417          Filter resonance/routing
$D418          Filter mode/volume

; === CIA #1 ($DC00-$DCFF) - Keyboard, Joystick ===
$DC00          Data port A (keyboard matrix, joystick 2)
$DC01          Data port B (keyboard matrix, joystick 1)
$DC02          Data direction register A
$DC03          Data direction register B
$DC04-$DC05    Timer A
$DC06-$DC07    Timer B
$DC08-$DC0B    Time of day clock
$DC0C          Synchronous serial I/O
$DC0D          Interrupt control register
$DC0E          Control register A
$DC0F          Control register B

; === USEFUL PEEK/POKE LOCATIONS ===
PEEK($DC01) & 16 = 0   ; Joystick 1 fire button pressed
PEEK($DC00) & 1 = 0    ; Joystick 2 up
PEEK($DC00) & 2 = 0    ; Joystick 2 down
PEEK($DC00) & 4 = 0    ; Joystick 2 left
PEEK($DC00) & 8 = 0    ; Joystick 2 right
PEEK($DC00) & 16 = 0   ; Joystick 2 fire

POKE $D020, color      ; Set border color
POKE $D021, color      ; Set background color
POKE $D015, value      ; Enable/disable sprites
POKE $D400, freq       ; Set sound frequency`
};

function showTab(tabName) {
    // Hide all content sections
    const sections = ['main', 'sprites', 'sound', 'memory'];
    sections.forEach(section => {
        document.getElementById(section + '-content').style.display = 'none';
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected content and activate tab
    document.getElementById(tabName + '-content').style.display = 'block';
    event.target.classList.add('active');
    
    // Load code content
    document.getElementById(tabName + '-code').textContent = codeExamples[tabName];
}

// Initialize with main tab
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('main-code').textContent = codeExamples.main;
});