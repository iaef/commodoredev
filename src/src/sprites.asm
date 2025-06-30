; Sprite Handling Routines
; Efficient sprite manipulation using VIC-II chip

; Sprite data pointers (screen RAM + $3f8)
SPRITE_PTRS = $07f8

; Sprite positions and states
sprite_x:       .res 8    ; X coordinates
sprite_y:       .res 8    ; Y coordinates  
sprite_dx:      .res 8    ; X velocity
sprite_dy:      .res 8    ; Y velocity
sprite_active:  .res 8    ; Active flags

init_sprites:
    ; Enable sprites 0-3 (player + 3 enemies)
    lda #$0f
    sta $d015          ; VIC_SPR_ENA
    
    ; Set sprite colors
    lda #$01           ; White for player
    sta $d027          ; Sprite 0 color
    lda #$02           ; Red for enemies
    sta $d028          ; Sprite 1 color
    sta $d029          ; Sprite 2 color
    sta $d02a          ; Sprite 3 color
    
    ; Set sprite data pointers
    lda #$80           ; Player sprite at $2000
    sta SPRITE_PTRS
    lda #$81           ; Enemy sprite at $2040
    sta SPRITE_PTRS+1
    sta SPRITE_PTRS+2
    sta SPRITE_PTRS+3
    
    ; Initialize player position
    lda #$a0
    sta sprite_x
    sta $d000          ; Player X
    lda #$80
    sta sprite_y
    sta $d001          ; Player Y
    
    ; Initialize enemy positions
    lda #$40
    sta sprite_x+1
    sta $d002          ; Enemy 1 X
    lda #$c0
    sta sprite_x+2
    sta $d004          ; Enemy 2 X
    lda #$60
    sta sprite_x+3
    sta $d006          ; Enemy 3 X
    
    lda #$40
    sta sprite_y+1
    sta $d003          ; Enemy 1 Y
    sta sprite_y+2
    sta $d005          ; Enemy 2 Y
    sta sprite_y+3
    sta $d007          ; Enemy 3 Y
    
    ; Set all sprites as active
    lda #$ff
    sta sprite_active
    sta sprite_active+1
    sta sprite_active+2
    sta sprite_active+3
    
    rts

update_player:
    ; Update player sprite based on joystick input
    lda joy_left
    beq check_right
    
    lda sprite_x       ; Current X position
    sec
    sbc #$02           ; Move left by 2 pixels
    bcs store_x        ; No underflow
    lda #$00           ; Clamp to left edge
store_x:
    sta sprite_x
    sta $d000
    
check_right:
    lda joy_right
    beq check_up
    
    lda sprite_x
    clc
    adc #$02           ; Move right by 2 pixels
    cmp #$40           ; Check right boundary
    bcc store_x2
    lda #$3f           ; Clamp to right edge
store_x2:
    sta sprite_x
    sta $d000
    
check_up:
    lda joy_up
    beq check_down
    
    lda sprite_y
    sec
    sbc #$02           ; Move up by 2 pixels
    bcs store_y
    lda #$32           ; Clamp to top (below score)
store_y:
    sta sprite_y
    sta $d001
    
check_down:
    lda joy_down
    beq player_done
    
    lda sprite_y
    clc
    adc #$02           ; Move down by 2 pixels
    cmp #$f0           ; Check bottom boundary
    bcc store_y2
    lda #$ef           ; Clamp to bottom
store_y2:
    sta sprite_y
    sta $d001
    
player_done:
    rts

update_enemies:
    ; Simple enemy AI - move towards player
    ldx #$01           ; Start with enemy 1
    
enemy_loop:
    ; Check if enemy is active
    lda sprite_active,x
    beq next_enemy
    
    ; Move enemy towards player
    lda sprite_x,x     ; Enemy X
    cmp sprite_x       ; Player X
    beq check_enemy_y
    bcc move_enemy_right
    
move_enemy_left:
    dec sprite_x,x
    jmp check_enemy_y
    
move_enemy_right:
    inc sprite_x,x
    
check_enemy_y:
    lda sprite_y,x     ; Enemy Y
    cmp sprite_y       ; Player Y
    beq update_enemy_pos
    bcc move_enemy_down
    
move_enemy_up:
    dec sprite_y,x
    jmp update_enemy_pos
    
move_enemy_down:
    inc sprite_y,x
    
update_enemy_pos:
    ; Update VIC registers
    lda sprite_x,x
    sta $d000,x
    sta $d000,x        ; Double store for X coordinate
    lda sprite_y,x
    sta $d001,x
    sta $d001,x        ; Double store for Y coordinate
    
next_enemy:
    inx
    cpx #$04           ; Check all 3 enemies
    bne enemy_loop
    
    rts

; Sprite data (24 bytes per sprite)
.align 64
player_sprite:
    .byte $00,$7e,$00  ; Row 1
    .byte $01,$ff,$80  ; Row 2
    .byte $03,$ff,$c0  ; Row 3
    .byte $03,$ff,$c0  ; Row 4
    .byte $07,$ff,$e0  ; Row 5
    .byte $07,$ff,$e0  ; Row 6
    .byte $07,$ff,$e0  ; Row 7
    .byte $03,$ff,$c0  ; Row 8
    .byte $03,$ff,$c0  ; Row 9
    .byte $01,$ff,$80  ; Row 10
    .byte $00,$7e,$00  ; Row 11
    .byte $00,$3c,$00  ; Row 12
    .byte $00,$18,$00  ; Row 13
    .byte $00,$00,$00  ; Row 14-21 (padding)
    .byte $00,$00,$00
    .byte $00,$00,$00
    .byte $00,$00,$00
    .byte $00,$00,$00
    .byte $00,$00,$00
    .byte $00,$00,$00
    .byte $00,$00,$00

enemy_sprite:
    .byte $00,$38,$00  ; Row 1
    .byte $00,$7c,$00  ; Row 2
    .byte $00,$fe,$00  ; Row 3
    .byte $01,$ff,$00  ; Row 4
    .byte $03,$ff,$80  ; Row 5
    .byte $07,$ff,$c0  ; Row 6
    .byte $0f,$ff,$e0  ; Row 7
    .byte $1f,$ff,$f0  ; Row 8
    .byte $0f,$ff,$e0  ; Row 9
    .byte $07,$ff,$c0  ; Row 10
    .byte $03,$ff,$80  ; Row 11
    .byte $01,$ff,$00  ; Row 12
    .byte $00,$fe,$00  ; Row 13
    .byte $00,$7c,$00  ; Row 14
    .byte $00,$38,$00  ; Row 15
    .byte $00,$00,$00  ; Padding
    .byte $00,$00,$00
    .byte $00,$00,$00
    .byte $00,$00,$00
    .byte $00,$00,$00
    .byte $00,$00,$00