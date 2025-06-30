; Collision Detection System
; Hardware sprite collision and custom collision routines

check_collisions:
    ; Check hardware sprite-sprite collisions
    lda $d01e          ; VIC sprite collision register
    beq check_bullet_collisions
    
    ; Collision detected between sprites
    jsr handle_sprite_collision
    
    ; Clear collision register by reading it
    lda $d01e
    
check_bullet_collisions:
    ; Check bullets vs enemies (software collision)
    ldx #$00           ; Bullet index
    
bullet_check_loop:
    lda bullets_active,x
    beq next_bullet_check
    
    ; Check this bullet against all enemies
    ldy #$01           ; Enemy index (start at 1, 0 is player)
    
enemy_check_loop:
    lda sprite_active,y
    beq next_enemy_check
    
    ; Check if bullet and enemy overlap
    lda bullets_x,x
    sec
    sbc sprite_x,y
    bpl bullet_right
    eor #$ff           ; Absolute value
    adc #$01
bullet_right:
    cmp #$18           ; Sprite width
    bcs next_enemy_check
    
    ; Check Y collision
    lda bullets_y,x
    sec
    sbc sprite_y,y
    bpl bullet_below
    eor #$ff           ; Absolute value
    adc #$01
bullet_below:
    cmp #$15           ; Sprite height
    bcs next_enemy_check
    
    ; Collision detected!
    jsr handle_bullet_enemy_collision
    
next_enemy_check:
    iny
    cpy #$04           ; Check all enemies
    bne enemy_check_loop
    
next_bullet_check:
    inx
    cpx #$08           ; Check all bullets
    bne bullet_check_loop
    
    rts

handle_sprite_collision:
    ; Handle player-enemy collision
    ; Check which sprites collided
    lda $d01e
    and #$01           ; Player sprite involved?
    beq collision_done
    
    ; Player hit enemy - game over or lose life
    dec lives
    lda lives
    bne respawn_player
    
    ; Game over
    lda #$01
    sta game_over_flag
    jsr play_explosion
    rts
    
respawn_player:
    ; Respawn player at starting position
    lda #$a0
    sta sprite_x
    sta $d000
    lda #$80
    sta sprite_y
    sta $d001
    
    ; Brief invincibility
    lda #$60
    sta invincible_timer
    
collision_done:
    rts

handle_bullet_enemy_collision:
    ; Bullet hit enemy
    ; Deactivate bullet
    lda #$00
    sta bullets_active,x
    dec bullet_count
    
    ; Deactivate enemy
    lda #$00
    sta sprite_active,y
    
    ; Disable enemy sprite
    lda $d015          ; Current sprite enable
    lda enemy_disable_mask,y
    eor #$ff           ; Invert mask
    and $d015
    sta $d015
    
    ; Add to score
    lda score
    clc
    adc #$10           ; 10 points per enemy
    sta score
    lda score+1
    adc #$00
    sta score+1
    
    ; Play explosion sound
    jsr play_explosion
    
    ; Check if all enemies destroyed
    lda sprite_active+1
    ora sprite_active+2
    ora sprite_active+3
    bne collision_done
    
    ; All enemies destroyed - next level
    jsr next_level
    
    rts

next_level:
    ; Increase difficulty and respawn enemies
    inc level
    
    ; Respawn all enemies
    lda #$01
    sta sprite_active+1
    sta sprite_active+2
    sta sprite_active+3
    
    ; Enable enemy sprites
    lda #$0f           ; Enable sprites 0-3
    sta $d015
    
    ; Randomize enemy positions
    jsr randomize_enemies
    
    rts

randomize_enemies:
    ; Simple pseudo-random enemy positioning
    lda frame_counter
    and #$07
    clc
    adc #$40
    sta sprite_x+1
    sta $d002
    
    lda frame_counter
    lsr a
    and #$07
    clc
    adc #$c0
    sta sprite_x+2
    sta $d004
    
    lda frame_counter
    asl a
    and #$07
    clc
    adc #$80
    sta sprite_x+3
    sta $d006
    
    ; Reset Y positions
    lda #$40
    sta sprite_y+1
    sta $d003
    sta sprite_y+2
    sta $d005
    sta sprite_y+3
    sta $d007
    
    rts

; Sprite disable masks for each enemy
enemy_disable_mask:
    .byte $01, $02, $04, $08

; Game state variables
lives:              .byte $03
level:              .byte $01
invincible_timer:   .byte $00

update_invincibility:
    ; Handle player invincibility frames
    lda invincible_timer
    beq invincible_done
    dec invincible_timer
    
    ; Flash player sprite
    lda frame_counter
    and #$04
    bne hide_player
    
    ; Show player
    lda $d015
    ora #$01
    sta $d015
    rts
    
hide_player:
    ; Hide player
    lda $d015
    and #$fe
    sta $d015
    
invincible_done:
    ; Ensure player is visible
    lda $d015
    ora #$01
    sta $d015
    rts