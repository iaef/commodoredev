; Joystick and Keyboard Input Handling
; CIA #1 port handling for C64

; Input state variables
joy_up:     .byte $00
joy_down:   .byte $00  
joy_left:   .byte $00
joy_right:  .byte $00
joy_fire:   .byte $00

; Previous frame state for edge detection
joy_fire_prev: .byte $00

read_joystick:
    ; Read joystick port 2 (in port A)
    lda $dc00          ; CIA1 Data Port A
    
    ; Check directions (bits are inverted - 0 = pressed)
    and #$01           ; Up
    eor #$01           ; Invert bit
    sta joy_up
    
    lda $dc00
    and #$02           ; Down
    lsr a              ; Shift to bit 0
    eor #$01           ; Invert
    sta joy_down
    
    lda $dc00
    and #$04           ; Left
    lsr a
    lsr a              ; Shift to bit 0
    eor #$01           ; Invert
    sta joy_left
    
    lda $dc00
    and #$08           ; Right
    lsr a
    lsr a
    lsr a              ; Shift to bit 0
    eor #$01           ; Invert
    sta joy_right
    
    ; Fire button
    lda $dc00
    and #$10           ; Fire button
    lsr a
    lsr a
    lsr a
    lsr a              ; Shift to bit 0
    eor #$01           ; Invert
    sta joy_fire
    
    rts

check_fire_pressed:
    ; Check for fire button press (edge detection)
    lda joy_fire
    beq fire_not_pressed
    
    lda joy_fire_prev
    bne fire_not_pressed  ; Was already pressed
    
    ; Fire button just pressed
    lda #$01
    sta joy_fire_prev
    jsr play_shoot        ; Play shoot sound
    jsr create_bullet     ; Create bullet sprite
    rts
    
fire_not_pressed:
    lda #$00
    sta joy_fire_prev
    rts

; Keyboard input for additional controls
read_keyboard:
    ; Scan keyboard for specific keys
    ; This is more complex on C64 due to matrix scanning
    
    ; Check for SPACE key (row 7, bit 4)
    lda #$7f           ; Select row 7
    sta $dc00
    lda $dc01          ; Read column data
    and #$10           ; Bit 4 = SPACE
    eor #$10           ; Invert (0 = pressed)
    beq space_pressed
    
    ; SPACE not pressed
    lda #$00
    sta space_key
    jmp check_runstop
    
space_pressed:
    lda #$01
    sta space_key
    
check_runstop:
    ; Check RUN/STOP key for pause
    lda #$fd           ; Select row 7
    sta $dc00
    lda $dc01
    and #$80           ; Bit 7 = RUN/STOP
    eor #$80
    beq runstop_pressed
    
    lda #$00
    sta runstop_key
    rts
    
runstop_pressed:
    lda #$01
    sta runstop_key
    rts

; Keyboard state variables
space_key:    .byte $00
runstop_key:  .byte $00

; Simple bullet system
bullets_x:    .res 8
bullets_y:    .res 8
bullets_active: .res 8
bullet_count: .byte $00

create_bullet:
    ; Find empty bullet slot
    ldx #$00
find_bullet_slot:
    lda bullets_active,x
    beq found_slot
    inx
    cpx #$08
    bne find_bullet_slot
    rts                ; No free slots
    
found_slot:
    ; Create bullet at player position
    lda sprite_x       ; Player X
    clc
    adc #$10           ; Center of sprite
    sta bullets_x,x
    
    lda sprite_y       ; Player Y
    sta bullets_y,x
    
    lda #$01
    sta bullets_active,x
    
    inc bullet_count
    rts

update_bullets:
    ; Move all active bullets
    ldx #$00
bullet_loop:
    lda bullets_active,x
    beq next_bullet
    
    ; Move bullet up
    lda bullets_y,x
    sec
    sbc #$04           ; Bullet speed
    sta bullets_y,x
    
    ; Check if bullet went off screen
    cmp #$20
    bcs next_bullet
    
    ; Deactivate bullet
    lda #$00
    sta bullets_active,x
    dec bullet_count
    
next_bullet:
    inx
    cpx #$08
    bne bullet_loop
    
    rts