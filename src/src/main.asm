; Main Game Entry Point - Commodore 64
; Assembled with CA65 or similar 6502 assembler

.include "include/c64.inc"
.include "include/vic.inc"
.include "include/sid.inc"

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
    
    ; Initialize game systems
    jsr init_screen
    jsr init_sprites
    jsr init_sound
    jsr init_variables
    
    cli                ; Enable interrupts
    
game_loop:
    ; Wait for raster line (for timing)
    lda #$ff
wait_raster:
    cmp $d012
    bne wait_raster
    
    ; Main game logic
    jsr read_joystick  ; Check player input
    jsr update_player  ; Move player sprite
    jsr update_enemies ; Move enemy sprites
    jsr check_collisions ; Check for collisions
    jsr update_score   ; Update score display
    
    ; Check for game over
    lda game_over_flag
    beq game_loop
    
    jsr game_over_screen
    jmp main           ; Restart game

; Interrupt handler for music and timing
irq_handler:
    inc $d019          ; Acknowledge interrupt
    jsr music_play     ; Play background music
    inc frame_counter  ; Update frame counter
    jmp $ea31          ; Return to system IRQ

; Initialize screen layout
init_screen:
    lda #$00           ; Clear screen
    ldx #$00
clear_screen:
    sta $0400,x        ; Screen RAM
    sta $0500,x
    sta $0600,x
    sta $06e8,x
    lda #$01           ; White text
    sta $d800,x        ; Color RAM
    sta $d900,x
    sta $da00,x
    sta $dae8,x
    lda #$00
    inx
    bne clear_screen
    
    ; Set up score display
    ldx #$00
score_text:
    lda score_string,x
    beq score_done
    sta $0400,x        ; Top of screen
    inx
    bne score_text
score_done:
    rts

; Game variables
game_over_flag:     .byte $00
frame_counter:      .byte $00
score:              .word $0000
player_x:           .byte $a0
player_y:           .byte $80
enemy_count:        .byte $04

score_string:       .byte "SCORE: 000000", $00

.include "sprites.asm"
.include "sound.asm"
.include "input.asm"
.include "collision.asm"