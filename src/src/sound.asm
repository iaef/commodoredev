; SID Sound Programming
; Three voice sound synthesis and music

; Music data and sound effects
current_note:    .byte $00
note_duration:   .byte $00
music_pointer:   .word music_data

init_sound:
    ; Initialize SID chip - clear all registers
    lda #$00
    ldx #$18
clear_sid_loop:
    sta $d400,x
    dex
    bpl clear_sid_loop
    
    ; Set up voice 1 (melody)
    lda #$09           ; Attack=0, Decay=9
    sta $d405          ; Voice 1 AD
    lda #$00           ; Sustain=0, Release=0  
    sta $d406          ; Voice 1 SR
    
    ; Set up voice 2 (harmony)
    lda #$09
    sta $d40c          ; Voice 2 AD
    lda #$00
    sta $d40d          ; Voice 2 SR
    
    ; Set up voice 3 (bass/percussion)
    lda #$04
    sta $d413          ; Voice 3 AD
    lda #$08
    sta $d414          ; Voice 3 SR
    
    ; Set master volume
    lda #$0f           ; Maximum volume
    sta $d418
    
    rts

music_play:
    ; Simple music player - called from IRQ
    dec note_duration
    bne music_continue
    
    ; Load next note
    ldy #$00
    lda (music_pointer),y
    cmp #$ff           ; End of music?
    bne play_note
    
    ; Reset to beginning
    lda #<music_data
    sta music_pointer
    lda #>music_data
    sta music_pointer+1
    lda (music_pointer),y
    
play_note:
    sta $d400          ; Voice 1 frequency low
    
    ; Get high byte
    inc music_pointer
    bne no_carry1
    inc music_pointer+1
no_carry1:
    lda (music_pointer),y
    sta $d401          ; Voice 1 frequency high
    
    ; Get duration
    inc music_pointer
    bne no_carry2
    inc music_pointer+1
no_carry2:
    lda (music_pointer),y
    sta note_duration
    
    ; Advance to next note
    inc music_pointer
    bne no_carry3
    inc music_pointer+1
no_carry3:
    
    ; Start note
    lda #$41           ; Triangle wave, gate on
    sta $d404
    
music_continue:
    rts

; Sound effects
play_shoot:
    ; Laser sound effect on voice 2
    lda #$20           ; High frequency
    sta $d407
    lda #$10
    sta $d408
    
    lda #$81           ; Noise wave, gate on
    sta $d40b
    
    ; Set short duration
    lda #$05
    sta shoot_duration
    
    rts

play_explosion:
    ; Explosion sound on voice 3
    lda #$81           ; Noise waveform
    sta $d412
    
    lda #$0f           ; Full volume
    sta $d418
    
    ; Frequency sweep
    lda #$ff
    sta explosion_freq
    lda #$20
    sta explosion_duration
    
    rts

update_sound_effects:
    ; Update shoot sound
    lda shoot_duration
    beq check_explosion
    dec shoot_duration
    bne check_explosion
    
    ; Stop shoot sound
    lda #$80           ; Gate off
    sta $d40b
    
check_explosion:
    ; Update explosion sound
    lda explosion_duration
    beq sound_effects_done
    dec explosion_duration
    
    ; Frequency sweep down
    dec explosion_freq
    lda explosion_freq
    sta $d40e          ; Voice 3 frequency low
    
    ; Stop explosion when done
    lda explosion_duration
    bne sound_effects_done
    lda #$80           ; Gate off
    sta $d412
    
sound_effects_done:
    rts

; Music data: frequency_low, frequency_high, duration
music_data:
    ; Simple melody in C major
    .byte $1c, $0e, $10  ; C4
    .byte $fd, $0e, $08  ; D4
    .byte $de, $0f, $08  ; E4
    .byte $c0, $10, $10  ; F4
    .byte $a2, $11, $08  ; G4
    .byte $85, $12, $08  ; A4
    .byte $68, $13, $08  ; B4
    .byte $4b, $14, $20  ; C5
    .byte $ff            ; End marker

; Sound effect variables
shoot_duration:     .byte $00
explosion_duration: .byte $00
explosion_freq:     .byte $00